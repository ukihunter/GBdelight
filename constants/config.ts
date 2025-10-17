// Configuration for Stripe and other environment variables
export const config = {
  stripe: {
    publishableKey:
      process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      "pk_test_51QKMJcLnrx4nfP0KvFBX0FPG7wBr8PgA4vA4MdVjCcPyJYH3Z6wQfRjVvKqN2sKmHvWzVxYqJzKqXzVyJkZvWxQz00abc12345", // Demo key for testing
    secretKey: process.env.STRIPE_SECRET_KEY || "sk_test_demo_key", // This should only be used on server side
  },
  database: {
    url: process.env.DATABASE_URL || "",
  },
};

// For demo purposes, we'll use Stripe's test keys
// In production, make sure to use your actual keys from environment variables
export const STRIPE_DEMO_CONFIG = {
  publishableKey:
    "pk_test_51QKMJcLnrx4nfP0KvFBX0FPG7wBr8PgA4vA4MdVjCcPyJYH3Z6wQfRjVvKqN2sKmHvWzVxYqJzKqXzVyJkZvWxQz00abc12345", // Demo publishable key
  // Note: Never expose secret keys in client-side code
};
