import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const {
      payment_intent_id,
      customer_name,
      customer_email,
      customer_phone,
      delivery_address,
      items,
      total_amount,
      status = "pending",
    } = await request.json();

    if (
      !payment_intent_id ||
      !customer_name ||
      !customer_email ||
      !customer_phone ||
      !delivery_address ||
      !items ||
      !total_amount
    ) {
      return Response.json(
        { error: "Missing required order fields" },
        { status: 400 },
      );
    }

    const response = await sql`
      INSERT INTO orders (
        payment_intent_id,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        items,
        total_amount,
        status
      ) VALUES (
        ${payment_intent_id},
        ${customer_name},
        ${customer_email},
        ${customer_phone},
        ${JSON.stringify(delivery_address)},
        ${JSON.stringify(items)},
        ${total_amount},
        ${status}
      )
      RETURNING *;
    `;

    return new Response(JSON.stringify({ data: response }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Order save error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 },
    );
  }
}
