import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return Response.json(
        { error: "Email parameter is required" },
        { status: 400 },
      );
    }

    const orders = await sql`
      SELECT 
        id,
        payment_intent_id,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        items,
        total_amount,
        status,
        cake_status,
        order_type,
        created_at
      FROM orders
      WHERE customer_email = ${email}
      ORDER BY created_at DESC
    `;

    const sanitizedOrders = orders.map((order: any) => ({
      id: order.id,
      payment_intent_id: order.payment_intent_id,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      delivery_address:
        typeof order.delivery_address === "string"
          ? JSON.parse(order.delivery_address)
          : order.delivery_address,
      items:
        typeof order.items === "string" ? JSON.parse(order.items) : order.items,
      total_amount:
        typeof order.total_amount === "string"
          ? parseFloat(order.total_amount)
          : order.total_amount,
      status: order.status,
      cake_status: order.cake_status || "pending",
      order_type: order.order_type || "normal",
      created_at: order.created_at,
    }));

    return Response.json({
      success: true,
      data: sanitizedOrders,
    });
  } catch (error) {
    console.error("Order fetch error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 },
    );
  }
}

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
      status,
      order_type = "normal",
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

    // Set default status based on order type
    const finalStatus =
      status || (order_type === "normal" ? "paid" : "pending");

    const response = await sql`
      INSERT INTO orders (
        payment_intent_id,
        customer_name,
        customer_email,
        customer_phone,
        delivery_address,
        items,
        total_amount,
        status,
        cake_status,
        order_type
      ) VALUES (
        ${payment_intent_id},
        ${customer_name},
        ${customer_email},
        ${customer_phone},
        ${JSON.stringify(delivery_address)},
        ${JSON.stringify(items)},
        ${total_amount},
        ${finalStatus},
        'pending',
        ${order_type}
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
