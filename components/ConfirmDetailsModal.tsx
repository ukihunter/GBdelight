import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { PaymentModal } from "./PaymentModal";

interface ConfirmDetailsModalProps {
  visible: boolean;
  details: {
    name: string;
    address: string;
    postalCode: string;
    nearestTown: string;
    mobile: string;
  };
  totalAmount?: number; // Add total amount prop
  onConfirm: () => void;
  onEdit: () => void;
  onPaymentSuccess?: (paymentIntentId: string) => void; // Add payment success callback
}

const ConfirmDetailsModal: React.FC<ConfirmDetailsModalProps> = ({
  visible,
  details,
  totalAmount = 0,
  onConfirm,
  onEdit,
  onPaymentSuccess,
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleConfirmOrder = () => {
    if (totalAmount > 0) {
      // Show payment modal if there's an amount to pay
      setShowPaymentModal(true);
    } else {
      // If no payment needed, proceed with confirmation
      onConfirm();
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    setShowPaymentModal(false);
    if (onPaymentSuccess) {
      onPaymentSuccess(paymentIntentId);
    } else {
      onConfirm();
    }
  };
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onEdit}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      {/* First overlay layer */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.85)",
          zIndex: 1,
        }}
      />
      {/* Second overlay layer */}
      <View
        style={{
          position: "absolute",
          top: -100,
          left: -100,
          right: -100,
          bottom: -100,
          backgroundColor: "#000000",
          zIndex: 2,
        }}
      />
      {/* Content layer */}
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 16,
          zIndex: 3,
        }}
      >
        <View className="bg-white rounded-2xl w-full max-w-sm  shadow-2xl">
          <ScrollView className="p-4">
            {/* Modern Header */}
            <View className="items-center mb-6">
              <View className="w-20 h-20 bg-[#FDAAAA] rounded-full justify-center items-center mb-4 ">
                <Text className="text-3xl text-white font-bold">✓</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-800 mb-2">
                Review Details
              </Text>
            </View>

            {/* Single Modern Card with All Details */}
            <View className="bg-slate-50 rounded-2xl p-6 shadow-sm border border-[#FDAAAA]/10">
              {/* Full Name */}
              <View className="mb-5">
                <Text className="text-xs font-semibold text-[#FDAAAA] mb-1 tracking-wide">
                  FULL NAME
                </Text>
                <Text className="text-base font-medium text-gray-700">
                  {details.name || "Not provided"}
                </Text>
              </View>

              {/* Divider */}
              <View className="h-px bg-gray-200 mb-5" />

              {/* Delivery Address */}
              <View className="mb-5">
                <Text className="text-xs font-semibold text-[#FDAAAA] mb-1 tracking-wide">
                  DELIVERY ADDRESS
                </Text>
                <Text className="text-base font-medium text-gray-700">
                  {details.address || "Not provided"}
                </Text>
              </View>

              {/* Divider */}
              <View className="h-px bg-gray-200 mb-5" />

              {/* Town and Postal Code Row */}
              <View className="flex-row gap-4 mb-5">
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-[#FDAAAA] mb-1 tracking-wide">
                    NEAREST TOWN
                  </Text>
                  <Text className="text-sm font-medium text-gray-700">
                    {details.nearestTown || "Not provided"}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-[#FDAAAA] mb-1 tracking-wide">
                    POSTAL CODE
                  </Text>
                  <Text className="text-sm font-medium text-gray-700">
                    {details.postalCode || "Not provided"}
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View className="h-px bg-gray-200 mb-5" />

              {/* Mobile Number */}
              <View>
                <Text className="text-xs font-semibold text-[#FDAAAA] mb-1 tracking-wide">
                  MOBILE NUMBER
                </Text>
                <Text className="text-base font-medium text-gray-700">
                  {details.mobile || "Not provided"}
                </Text>
              </View>
            </View>

            {/* Total Amount Display */}
            {totalAmount > 0 && (
              <View className="bg-[#FDAAAA]/10 rounded-2xl p-4 mt-4 border border-[#FDAAAA]/20">
                <Text className="text-center text-sm font-semibold text-[#FDAAAA] mb-1">
                  TOTAL AMOUNT
                </Text>
                <Text className="text-center text-2xl font-bold text-gray-800">
                  ${totalAmount.toFixed(2)}
                </Text>
              </View>
            )}

            {/* Modern Action Buttons */}
            <View className="gap-3 mt-6">
              <TouchableOpacity
                onPress={handleConfirmOrder}
                className="bg-[#FDAAAA] rounded-2xl py-4 px-6 items-center shadow-lg"
              >
                <Text className="text-white text-lg font-bold tracking-wide">
                  {totalAmount > 0
                    ? `Pay $${totalAmount.toFixed(2)}`
                    : "Confirm Order"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onEdit}
                className="bg-slate-100 rounded-2xl py-3 px-6 items-center border-2 border-[#FDAAAA]/20"
              >
                <Text className="text-[#FDAAAA] text-base font-semibold">
                  Edit Details
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Payment Modal */}
      <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        amount={totalAmount}
        customerDetails={{
          name: details.name,
          phone: details.mobile,
        }}
      />
    </Modal>
  );
};

export default ConfirmDetailsModal;
