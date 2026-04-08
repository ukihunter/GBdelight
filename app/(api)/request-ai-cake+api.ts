import { neon } from "@neondatabase/serverless";

interface RequestCakeBody {
  userId: string;
  designId: number;
  orderNotes?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestCakeBody;
    const { userId, designId, orderNotes } = body;

    if (!userId) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (!designId) {
      return Response.json(
        { success: false, error: "Design ID is required" },
        { status: 400 },
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Update design status to 'requested'
    const updateResult = await sql`
      UPDATE ai_cake_design_requests
      SET status = 'requested', admin_note = ${orderNotes || null}
      WHERE id = ${designId} AND user_id = ${userId}
      RETURNING id, generated_image_path, generated_description, status
    `;

    if (updateResult.length === 0) {
      return Response.json(
        { success: false, error: "Design not found or unauthorized" },
        { status: 404 },
      );
    }

    // Optional: Create an order entry if you have a separate orders table
    // const order = await sql`
    //   INSERT INTO orders (user_id, design_id, status, created_at)
    //   VALUES (${userId}, ${designId}, 'pending', NOW())
    //   RETURNING *
    // `;

    return Response.json({
      success: true,
      message: "Cake design requested successfully",
      data: {
        designId: updateResult[0].id,
        status: updateResult[0].status,
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
