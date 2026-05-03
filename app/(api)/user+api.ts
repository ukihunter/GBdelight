import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const databaseUrl =
      process.env.EXPO_PUBLIC_DATABASE_URL || process.env.DATABASE_URL;

    if (!databaseUrl) {
      return Response.json(
        { error: "Database URL not configured" },
        { status: 500 },
      );
    }

    const sql = neon(databaseUrl);
    const { name, email, clerkId } = await request.json();

    if (!name || !email || !clerkId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1. Try to find by clerkId
    const existingByClerk = await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
    if (existingByClerk.length > 0) {
      const response = await sql`
        UPDATE users SET name = ${name}, email = ${email} WHERE clerk_id = ${clerkId} RETURNING *
      `;
      return new Response(JSON.stringify({ data: response }), { status: 200 });
    }

    // 2. Try to find by email
    const existingByEmail = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingByEmail.length > 0) {
      const response = await sql`
        UPDATE users SET name = ${name}, clerk_id = ${clerkId} WHERE email = ${email} RETURNING *
      `;
      return new Response(JSON.stringify({ data: response }), { status: 200 });
    }

    // 3. New user
    const response = await sql`
      INSERT INTO users (name, email, clerk_id)
      VALUES (${name}, ${email}, ${clerkId})
      RETURNING *
    `;
    return new Response(JSON.stringify({ data: response }), { status: 201 });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 },
    );
  }
}
