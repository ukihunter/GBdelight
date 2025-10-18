import { StripeProvider as Provider } from "@stripe/stripe-react-native";
import React from "react";

interface StripeProviderProps {
  children: React.ReactNode;
}

// You'll need to add your Stripe publishable key to your environment variables
const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "your_stripe_publishable_key_here";

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  return (
    <Provider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <>{children}</>
    </Provider>
  );
};
