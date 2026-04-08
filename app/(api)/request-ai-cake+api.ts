import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

interface RequestCakeBody {
  userId: string;
  prompt: string;
  imageDataUrl: string;
  description: string;
  orderNotes?: string;
}

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

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

async function uploadToCloudinary(imageDataUrl: string): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `cake_designs/${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const { signature } = signCloudinaryUpload(publicId, timestamp);

  const formData = new FormData();
  formData.append("file", imageDataUrl);
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

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(
      `Cloudinary upload failed: ${responseText.substring(0, 120)}`,
    );
  }

  const data = JSON.parse(responseText) as { secure_url?: string };
  if (!data.secure_url) {
    throw new Error("Cloudinary did not return image URL");
  }

  return data.secure_url;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestCakeBody;
    const { userId, prompt, imageDataUrl, description, orderNotes } = body;
    const trimmedOrderNotes = orderNotes?.trim();

    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (!prompt || !imageDataUrl || !description) {
      return Response.json(
        {
          success: false,
          error: "Missing required fields: prompt, imageDataUrl, description",
        },
        { status: 400 },
      );
    }

    if (
      !CLOUDINARY_CLOUD_NAME ||
      !CLOUDINARY_API_KEY ||
      !CLOUDINARY_API_SECRET
    ) {
      return Response.json(
        { success: false, error: "Cloudinary configuration not complete" },
        { status: 500 },
      );
    }

    const uploadedUrl = await uploadToCloudinary(imageDataUrl);

    const sql = neon(process.env.DATABASE_URL!);

    const insertResult = trimmedOrderNotes
      ? await sql`
          INSERT INTO ai_cake_design_requests
          (user_id, prompt, generated_image_path, generated_description, admin_note, status)
          VALUES (${userId}, ${prompt}, ${uploadedUrl}, ${description}, ${trimmedOrderNotes}, 'requested')
          RETURNING id, generated_image_path, generated_description, status
        `
      : await sql`
          INSERT INTO ai_cake_design_requests
          (user_id, prompt, generated_image_path, generated_description, status)
          VALUES (${userId}, ${prompt}, ${uploadedUrl}, ${description}, 'requested')
          RETURNING id, generated_image_path, generated_description, status
        `;

    return Response.json({
      success: true,
      message: "Cake design requested successfully",
      data: {
        designId: insertResult[0].id,
        imageUrl: insertResult[0].generated_image_path,
        status: insertResult[0].status,
      },
    });
  } catch (error) {
    console.error("Request cake error:", error);
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to request cake",
      },
      { status: 500 },
    );
  }
}
