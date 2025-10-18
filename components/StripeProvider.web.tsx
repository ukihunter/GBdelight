import React from "react";

interface StripeProviderProps {
  children: React.ReactNode;
}

// Web version - just a passthrough wrapper
export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  return <>{children}</>;
};
