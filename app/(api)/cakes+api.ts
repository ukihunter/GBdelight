import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const dbUrl = process.env.EXPO_PUBLIC_DATABASE_URL || process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("Database URL not configured");
    const sql = neon(dbUrl);

    const cakes = await sql`
      SELECT 
        id,
        cake_code,
        cake_name,
        description,
        price_lkr,
        stock_quantity,
        is_available,
        image_url,
        category,
        created_at
      FROM cake_inventory
      ORDER BY category, cake_name
    `;

    // Debug: Log first item to check structure
    //  console.log("API Response Sample:", cakes[0]);

    // Ensure all required fields have defaults
    const sanitizedCakes = cakes.map((cake: any) => ({
      id: cake.id ?? null,
      cake_code: cake.cake_code ?? "",
      cake_name: cake.cake_name ?? "Unknown",
      description: cake.description ?? "",
      price_lkr:
        typeof cake.price_lkr === "string"
          ? parseFloat(cake.price_lkr)
          : (cake.price_lkr ?? 0),
      stock_quantity: cake.stock_quantity ?? 0,
      is_available: cake.is_available ?? true,
      image_url: cake.image_url ?? null,
      category: cake.category ?? "Cake",
      created_at: cake.created_at ?? null,
    }));

    return Response.json({
      success: true,
      data: sanitizedCakes,
    });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch cakes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
