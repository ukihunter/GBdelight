import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const dbUrl =
      process.env.EXPO_PUBLIC_DATABASE_URL || process.env.DATABASE_URL;
    //console.log("Favorites API called. DB URL Length:", dbUrl?.length || 0);

    if (!dbUrl) {
      return Response.json(
        { error: "Database URL not configured" },
        { status: 500 },
      );
    }
    const sql = neon(dbUrl);
    const { userEmail, cakeCode, clerkId, name } = await request.json();
    // console.log("Favoriting cake:", cakeCode, "for user:", userEmail);

    if (!userEmail || !cakeCode) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1. Try to find user by clerkId (primary key in our logic)
    let userId: number | null = null;
    if (clerkId) {
      const usersByClerk =
        await sql`SELECT id FROM users WHERE clerk_id = ${clerkId}`;
      if (usersByClerk.length > 0) userId = usersByClerk[0].id;
    }

    // 2. If not found by clerkId, try by email
    if (!userId) {
      const usersByEmail =
        await sql`SELECT id FROM users WHERE email = ${userEmail}`;
      if (usersByEmail.length > 0) {
        userId = usersByEmail[0].id;
        // Optional: Update clerkId if it was missing
        if (clerkId) {
          await sql`UPDATE users SET clerk_id = ${clerkId}, name = ${name || "User"} WHERE id = ${userId}`;
        }
      }
    }

    // 3. If still not found, create the user
    if (!userId && clerkId) {
      console.log("User not found in DB, inserting new record for:", clerkId);
      try {
        const newUser = await sql`
          INSERT INTO users (name, email, clerk_id)
          VALUES (${name || "User"}, ${userEmail}, ${clerkId})
          RETURNING id
        `;
        userId = newUser[0].id;
      } catch (insertError) {
        console.error(
          "Failed to insert user, trying final lookup:",
          insertError,
        );
        // Last ditch effort: someone might have just inserted it
        const finalCheck =
          await sql`SELECT id FROM users WHERE clerk_id = ${clerkId} OR email = ${userEmail} LIMIT 1`;
        if (finalCheck.length > 0) userId = finalCheck[0].id;
      }
    }

    if (!userId) {
      return Response.json(
        { error: "User profile not found. Please log in again." },
        { status: 404 },
      );
    }

    // Check if favorite already exists
    const existing = await sql`
      SELECT id FROM user_favorite_cakes 
      WHERE user_id = ${userId} AND cake_code = ${cakeCode}
    `;

    if (existing.length > 0) {
      // Remove favorite
      await sql`
        DELETE FROM user_favorite_cakes 
        WHERE user_id = ${userId} AND cake_code = ${cakeCode}
      `;
      return Response.json(
        { action: "removed", message: "Removed from favorites" },
        { status: 200 },
      );
    } else {
      // Add favorite
      await sql`
        INSERT INTO user_favorite_cakes (user_id, cake_code)
        VALUES (${userId}, ${cakeCode})
      `;
      return Response.json(
        { action: "added", message: "Added to favorites" },
        { status: 201 },
      );
    }
  } catch (error) {
    console.error("Favorites API error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const dbUrl =
      process.env.EXPO_PUBLIC_DATABASE_URL || process.env.DATABASE_URL;
    console.log("Favorites GET called. DB URL Length:", dbUrl?.length || 0);

    if (!dbUrl) {
      return Response.json(
        { error: "Database URL not configured" },
        { status: 500 },
      );
    }
    const sql = neon(dbUrl);
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    console.log("Fetching favorites for email:", email);

    if (!email) {
      return Response.json(
        { error: "Email parameter is required" },
        { status: 400 },
      );
    }

    // Get user id by email
    const users = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (users.length === 0) {
      return Response.json({ favorites: [] }, { status: 200 });
    }
    const userId = users[0].id;

    const favorites = await sql`
      SELECT cake_code FROM user_favorite_cakes 
      WHERE user_id = ${userId}
    `;

    return Response.json({
      success: true,
      data: {
        favorites: favorites.map((f) => f.cake_code),
      },
    });
  } catch (error) {
    console.error("Favorites API error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 },
    );
  }
}
