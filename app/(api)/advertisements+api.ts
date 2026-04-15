import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const advertisements = await sql`
      SELECT 
        id,
        cake_code,
        title,
        image_path,
        is_active,
        created_at
      FROM advertisement_images
      WHERE is_active = true
      ORDER BY created_at DESC
    `;

    // Ensure all required fields have defaults
    const sanitizedAds = advertisements.map((ad: any) => ({
      id: ad.id ?? null,
      cake_code: ad.cake_code ?? "",
      title: ad.title ?? "Advertisement",
      image_path: ad.image_path ?? null,
      is_active: ad.is_active ?? false,
      created_at: ad.created_at ?? null,
    }));

    return Response.json({
      success: true,
      data: sanitizedAds,
    });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch advertisements",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
