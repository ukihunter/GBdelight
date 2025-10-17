// API endpoint to save order details to Neon DB
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const {
      paymentIntentId,
      customerDetails,
      cartItems,
      totalAmount,
      status = "paid",
    } = body;

    // Database connection URL for Neon
    const DATABASE_URL = process.env.DATABASE_URL;

    if (!DATABASE_URL) {
      throw new Error("Database URL not configured");
    }

    // You would typically use a proper database client here
    // For now, this is a placeholder for the database insertion logic

    const orderData = {
      payment_intent_id: paymentIntentId,
      customer_name: customerDetails.name,
      customer_email: customerDetails.email,
      customer_phone: customerDetails.phone,
      delivery_address: JSON.stringify(customerDetails.address),
      items: JSON.stringify(cartItems),
      total_amount: totalAmount,
      status: status,
      created_at: new Date().toISOString(),
    };

    // Example using fetch to a Neon DB endpoint (you would replace this with actual DB logic)
    // This is a simplified example - in production, you'd use a proper database client
    const query = `
      INSERT INTO orders (
        payment_intent_id, customer_name, customer_email, customer_phone,
        delivery_address, items, total_amount, status, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) RETURNING *
    `;

    // Simulate database insertion (replace with actual database call)
    console.log("Order data to be saved:", orderData);

    // For now, we'll return a success response
    // In production, you would execute the actual database insertion here

    return Response.json({
      success: true,
      message: "Order saved successfully",
      orderId: `order_${Date.now()}`, // Generate a temporary order ID
      orderData,
    });
  } catch (error) {
    console.error("Save order error:", error);
    return Response.json({ error: "Failed to save order" }, { status: 500 });
  }
}

// Example database schema for Neon DB (PostgreSQL)
/*
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    delivery_address JSONB NOT NULL,
    items JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_payment_intent ON orders(payment_intent_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
*/
