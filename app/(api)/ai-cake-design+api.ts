const HF_API_TOKEN = process.env.HUGGING_FACE_API_KEY;
// stabilityai/sdxl-turbo is available on the free HF Inference API
const HF_MODEL_ID = "stabilityai/sdxl-turbo";

interface GenerationRequest {
  userId: string;
  age: string;
  favorites: string[];
  notes: string;
}

type PromptInput = Pick<GenerationRequest, "age" | "favorites" | "notes">;

function generatePrompt(data: PromptInput): string {
  const favoritesList = data.favorites.join(", ");
  return `A beautiful, delicious, professional cake design. Perfect for a ${data.age} year old. Style: ${favoritesList}. ${data.notes ? `Details: ${data.notes}` : ""} High quality, detailed, appetizing, bakery masterpiece.`;
}

// Pollinations.ai — free, no API key, reliable
async function generateImageFromPollinations(prompt: string): Promise<Buffer> {
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true`;
  console.log("Calling Pollinations.ai...");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Pollinations error: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("image")) {
    const text = await response.text();
    throw new Error(
      `Pollinations returned non-image: ${text.substring(0, 120)}`,
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length === 0) throw new Error("Pollinations returned empty image");

  console.log("Pollinations image generated, size:", buffer.length, "bytes");
  return buffer;
}

// Hugging Face — used only if Pollinations fails
async function generateImageFromHuggingFace(
  prompt: string,
  retries = 2,
): Promise<Buffer> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(
        `Calling HF (attempt ${attempt}/${retries}) with model: ${HF_MODEL_ID}`,
      );

      const response = await fetch(
        `https://api-inference.huggingface.co/models/${HF_MODEL_ID}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: prompt }),
        },
      );

      const contentType = response.headers.get("content-type") || "";
      const buffer = Buffer.from(await response.arrayBuffer());

      if (!response.ok) {
        const errorText = buffer.toString().substring(0, 200);
        console.error(`HF Error (${response.status}):`, errorText);

        if (response.status === 503 && errorText.includes("loading")) {
          console.log("HF model loading, waiting 5s before retry...");
          await new Promise((r) => setTimeout(r, 5000));
          continue;
        }

        throw new Error(`HF API error: ${response.status} - ${errorText}`);
      }

      if (!contentType.includes("image")) {
        throw new Error(`HF returned non-image content-type: ${contentType}`);
      }

      if (buffer.length === 0) throw new Error("HF returned empty image");

      console.log("HF image generated, size:", buffer.length, "bytes");
      return buffer;
    } catch (error) {
      console.error(`HF attempt ${attempt} failed:`, error);
      if (attempt === retries) throw error;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  throw new Error("HF failed after all retry attempts");
}

async function generateImage(prompt: string): Promise<Buffer> {
  // Always try Pollinations first — it's free, no key needed, and reliable
  try {
    return await generateImageFromPollinations(prompt);
  } catch (pollinationsError) {
    console.warn(
      "Pollinations failed, trying Hugging Face:",
      pollinationsError,
    );

    if (!HF_API_TOKEN) {
      throw new Error("Both Pollinations and HF (no key configured) failed");
    }

    return await generateImageFromHuggingFace(prompt);
  }
}

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

    if (!age || !favorites || favorites.length === 0) {
      return Response.json(
        { success: false, error: "Missing required fields: age, favorites" },
        { status: 400 },
      );
    }

    const prompt = generatePrompt({ age, favorites, notes });
    console.log("Generated prompt:", prompt);

    const imageBuffer = await generateImage(prompt);
    console.log("Image ready, size:", imageBuffer.length, "bytes");

    const description = `Age: ${age}, Interests: ${favorites.join(", ")}, Notes: ${notes || "None"}`;
    const imageDataUrl = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

    return Response.json({
      success: true,
      data: { imageDataUrl, description, prompt },
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
