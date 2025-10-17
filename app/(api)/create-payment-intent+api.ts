const STRIPE_SECRET_KEY =
  process.env.STRIPE_SECRET_KEY || "sk_test_your_stripe_secret_key_here";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { amount, currency, customerDetails, cartItems } = body;

    // Create payment intent with Stripe
    const response = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: amount.toString(),
        currency: currency,
        "metadata[customer_name]": customerDetails.name,
        "metadata[customer_email]": customerDetails.email,
        "metadata[customer_phone]": customerDetails.phone,
        "metadata[order_items]": JSON.stringify(
          cartItems.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          }))
        ),
      }),
    });

    const paymentIntent = await response.json();

    if (!response.ok) {
      throw new Error(
        paymentIntent.error?.message || "Failed to create payment intent"
      );
    }

    return Response.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Payment intent creation error:", error);
    return Response.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
