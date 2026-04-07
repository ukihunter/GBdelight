import React from "react";
import { Alert, Modal, Text, TouchableOpacity, View } from "react-native";

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
  const handleWebPayment = () => {
    // For web, we'll simulate a payment or redirect to Stripe Checkout
    Alert.alert(
      "Web Payment",
      "Stripe payments are not supported on web. Please use the mobile app for payments.",
      [
        { text: "Cancel", onPress: onClose },
        {
          text: "Simulate Success",
          onPress: () => {
            // Simulate successful payment for testing
            onPaymentSuccess("simulated_payment_web");
          },
        },
      ],
    );
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
              Web Payment Notice
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
          </View>

          {/* Web Notice */}
          <View className="mb-6">
            <Text className="text-sm text-gray-700 mb-4 text-center">
              Stripe payments are optimized for mobile devices.
              {"\n\n"}
              For testing purposes, you can simulate a payment or use the mobile
              app.
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleWebPayment}
              className="bg-[#FDAAAA] rounded-2xl py-4 px-6 items-center"
            >
              <Text className="text-white text-lg font-bold">
                Simulate Payment (Web)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-200 rounded-2xl py-3 px-6 items-center"
            >
              <Text className="text-gray-700 text-base font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
