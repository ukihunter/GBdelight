import { useStripe } from "@stripe/stripe-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: (paymentIntentId: string) => void;
  amount: number;
  customerDetails: {
    name: string;
    email?: string;
    phone?: string;
  };
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  onPaymentSuccess,
  amount,
  customerDetails,
}) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [paymentSheetInitialized, setPaymentSheetInitialized] = useState(false);

  const createPaymentIntent = async () => {
    try {
      // Use the correct API endpoint for Expo Router
      const response = await fetch("/(api)/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          currency: "lkr",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { client_secret, payment_intent_id } = await response.json();

      if (!client_secret) {
        throw new Error("Failed to create payment intent");
      }

      return { client_secret, payment_intent_id };
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw error;
    }
  };

  const initializePaymentSheet = async (): Promise<string | undefined> => {
    try {
      setLoading(true);
      const { client_secret, payment_intent_id } = await createPaymentIntent();

      const { error } = await initPaymentSheet({
        merchantDisplayName: "GB Delight", // Your business name
        paymentIntentClientSecret: client_secret,
        defaultBillingDetails: {
          name: customerDetails.name,
          email: customerDetails.email,
          phone: customerDetails.phone,
        },
        allowsDelayedPaymentMethods: false,
        returnURL: "your-app://stripe-redirect", // Configure this for your app
      });

      if (error) {
        Alert.alert("Error", error.message);
        return undefined;
      }

      setPaymentSheetInitialized(true);
      return payment_intent_id;
    } catch (error) {
      Alert.alert("Error", "Failed to initialize payment");
      console.error("Payment sheet initialization error:", error);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      let paymentIntentId: string | undefined;

      if (!paymentSheetInitialized) {
        paymentIntentId = await initializePaymentSheet();
        if (!paymentIntentId) return;
      }

      setLoading(true);
      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert("Payment failed", error.message);
        return;
      }

      // Payment succeeded
      Alert.alert(
        "Payment successful",
        "Your order has been placed successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              onPaymentSuccess(paymentIntentId || "");
              onClose();
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert("Error", "Payment failed. Please try again.");
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 min-h-[300px]">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-800">
              Complete Payment
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-gray-500 text-lg">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Payment Summary */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-6">
            <Text className="text-sm text-gray-600 mb-1">Total Amount</Text>
            <Text className="text-2xl font-bold text-[#FDAAAA]">
              LKR {amount.toFixed(2)}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              Secure payment processed by Stripe
            </Text>
          </View>

          {/* Customer Details */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Billing to: {customerDetails.name}
            </Text>
            {customerDetails.email && (
              <Text className="text-sm text-gray-500">
                {customerDetails.email}
              </Text>
            )}
          </View>

          {/* Payment Button */}
          <TouchableOpacity
            onPress={handlePayment}
            disabled={loading}
            className={`rounded-2xl py-4 px-6 items-center ${
              loading ? "bg-gray-300" : "bg-[#FDAAAA]"
            }`}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-bold ml-2">
                  {paymentSheetInitialized
                    ? "Processing..."
                    : "Initializing..."}
                </Text>
              </View>
            ) : (
              <Text className="text-white text-lg font-bold">
                Pay LKR {amount.toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>

          {/* Security Notice */}
          <View className="mt-4 items-center">
            <Text className="text-xs text-gray-400 text-center">
              🔒 Your payment information is secure and encrypted
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};
