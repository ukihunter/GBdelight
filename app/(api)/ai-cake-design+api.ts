import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

// Hugging Face API configuration
const HF_API_TOKEN = process.env.HUGGING_FACE_API_KEY;
// Using Lykon/DreamShaper - more reliable for specific image generation
const HF_MODEL_ID = "Lykon/DreamShaper";

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

interface GenerationRequest {
  userId: string;
  age: string;
  favorites: string[];
  notes: string;
}

type PromptInput = Pick<GenerationRequest, "age" | "favorites" | "notes">;

async function generateImageFromFallback(prompt: string): Promise<Buffer> {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Fallback image API error: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("image")) {
    const text = await response.text();
    throw new Error(
      `Fallback returned non-image response: ${text.substring(0, 120)}`,
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

// Generate prompt for Hugging Face
function generatePrompt(data: PromptInput): string {
  const favoritesList = data.favorites.join(", ");
  const prompt = `A beautiful, delicious, professional cake design. Perfect for a ${data.age} year old. Style: ${favoritesList}. ${data.notes ? `Details: ${data.notes}` : ""} High quality, detailed, appetizing, bakery masterpiece.`;
  return prompt;
}

// Call Hugging Face API to generate image with retry logic
async function generateImageFromHuggingFace(
  prompt: string,
  retries = 3,
): Promise<Buffer> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(
        `Calling Hugging Face (attempt ${attempt}/${retries}) with model:`,
        HF_MODEL_ID,
      );

      const response = await fetch(
        `https://api-inference.huggingface.co/models/${HF_MODEL_ID}`,
        {
          headers: {
            Authorization: `Bearer ${HF_API_TOKEN}`,
          },
          method: "POST",
          body: JSON.stringify({ inputs: prompt }),
        },
      );

      // Check content type
      const contentType = response.headers.get("content-type");
      console.log("Response content-type:", contentType);

      // Read response body ONCE and store it
      const buffer = Buffer.from(await response.arrayBuffer());

      if (!response.ok) {
        const errorText = buffer.toString().substring(0, 200);
        console.error(`HF Error (${response.status}):`, errorText);

        // Hugging Face legacy inference endpoint can return 410.
        if (response.status === 410) {
          console.log(
            "Hugging Face endpoint unavailable, using fallback generator...",
          );
          return await generateImageFromFallback(prompt);
        }

        // If model is loading, retry
        if (
          response.status === 503 &&
          errorText.includes("currently loading")
        ) {
          console.log("Model loading, waiting before retry...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }

        throw new Error(
          `Hugging Face API error: ${response.status} - ${errorText}`,
        );
      }

      // Check if response is actually an image
      if (!contentType || !contentType.includes("image")) {
        console.error(
          "Unexpected content type. Response:",
          buffer.toString().substring(0, 300),
        );
        throw new Error(
          `Expected image response, got: ${contentType || "unknown"}`,
        );
      }

      console.log("Image generated successfully, size:", buffer.length);

      // Validate buffer is not empty
      if (buffer.length === 0) {
        throw new Error("Generated image buffer is empty");
      }

      return buffer;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt === retries) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  throw new Error("Failed after all retry attempts");
}

// Sign Cloudinary upload using server-side signature
function signCloudinaryUpload(
  publicId: string,
  timestamp: number,
): { signature: string; timestamp: number } {
  const params = {
    public_id: publicId,
    timestamp: timestamp,
  };

  const paramsString = Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(paramsString + CLOUDINARY_API_SECRET)
    .digest("hex");

  return { signature, timestamp };
}

// Upload image to Cloudinary with server-side signature
async function uploadToCloudinary(imageBuffer: Buffer): Promise<string> {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const publicId = `cake_designs/${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { signature } = signCloudinaryUpload(publicId, timestamp);

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(imageBuffer)], { type: "image/png" });
    formData.append("file", blob);
    formData.append("public_id", publicId);
    formData.append("api_key", CLOUDINARY_API_KEY || "");
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    // Read response text first
    const responseText = await response.text();

    if (!response.ok) {
      console.error("Cloudinary Error:", responseText.substring(0, 200));
      throw new Error(
        `Cloudinary upload error: ${responseText.substring(0, 100)}`,
      );
    }

    // Parse JSON from the text we already read
    const data = JSON.parse(responseText) as any;
    console.log("Upload successful:", data.secure_url);
    return data.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

// Main API handler
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerationRequest;
    const { userId, age, favorites, notes } = body;

    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Validate environment variables
    if (!HF_API_TOKEN) {
      return Response.json(
        {
          success: false,
          error: "Hugging Face API key not configured",
        },
        { status: 500 },
      );
    }

    if (
      !CLOUDINARY_CLOUD_NAME ||
      !CLOUDINARY_API_KEY ||
      !CLOUDINARY_API_SECRET
    ) {
      return Response.json(
        {
          success: false,
          error: "Cloudinary configuration not complete",
        },
        { status: 500 },
      );
    }

    // Validate input
    if (!age || !favorites || favorites.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Missing required fields: age, favorites",
        },
        { status: 400 },
      );
    }

    // Step 1: Generate prompt
    const prompt = generatePrompt({ age, favorites, notes });
    console.log("Generated prompt:", prompt);

    // Step 2: Generate image from Hugging Face
    console.log("Calling Hugging Face API...");
    const imageBuffer = await generateImageFromHuggingFace(prompt);
    console.log("Image generated, size:", imageBuffer.length, "bytes");

    // Step 3: Upload to Cloudinary
    console.log("Uploading to Cloudinary...");
    const imageUrl = await uploadToCloudinary(imageBuffer);

    // Step 4: Save to database
    const sql = neon(process.env.DATABASE_URL!);
    const description = `Age: ${age}, Interests: ${favorites.join(", ")}, Notes: ${notes || "None"}`;

    const result = await sql`
      INSERT INTO ai_cake_design_requests 
      (user_id, prompt, generated_image_path, generated_description, status)
      VALUES (${userId}, ${prompt}, ${imageUrl}, ${description}, 'pending')
      RETURNING id, generated_image_path, generated_description
    `;

    console.log("Saved to database, design ID:", result[0].id);

    return Response.json({
      success: true,
      data: {
        designId: result[0].id,
        imageUrl: result[0].generated_image_path,
        description: result[0].generated_description,
        prompt: prompt,
      },
    });
  } catch (error) {
    console.error("AI cake design generation error:", error);
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate cake design",
      },
      { status: 500 },
    );
  }
}
