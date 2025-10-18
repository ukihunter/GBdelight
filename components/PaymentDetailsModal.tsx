import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface PaymentDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (details: {
    name: string;
    address: string;
    postalCode: string;
    nearestTown: string;
    mobile: string;
  }) => void;
}

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  // Helper to scroll to input
  const scrollToInput = (y: number) => {
    scrollRef.current?.scrollTo({ y, animated: true });
  };
  const [postalCode, setPostalCode] = useState("");
  const [nearestTown, setNearestTown] = useState("");
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={120}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/15">
          <View className="bg-white rounded-t-3xl px-7 py-7 shadow-lg min-h-[10%] flex-1">
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            >
              <View className="items-center mb-4">
                <View className="w-10 h-1.5 rounded bg-[#FDAAAA55] mb-2" />
              </View>
              <Text className="text-2xl font-bold text-[#FDAAAA] mb-6 text-center tracking-wider">
                Details
              </Text>
              <View className="mb-6 gap-4">
                <TextInput
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  className="bg-[#fcf1f1] rounded-xl px-4 py-3 text-base mb-4.5 border border-[#FDAAAA33]"
                  placeholderTextColor="#FDAAAA99"
                  onFocus={() => scrollToInput(0)}
                />
                <TextInput
                  placeholder="Delivery Address"
                  value={address}
                  onChangeText={setAddress}
                  className="bg-[#fcf1f1] rounded-xl px-4 py-3 text-base mb-4.5 border border-[#FDAAAA33]"
                  placeholderTextColor="#FDAAAA99"
                  multiline
                  onFocus={() => scrollToInput(60)}
                />
                <TextInput
                  placeholder="Nearest Town"
                  value={nearestTown}
                  onChangeText={setNearestTown}
                  className="bg-[#fcf1f1] rounded-xl px-4 py-3 text-base mb-4.5 border border-[#FDAAAA33]"
                  placeholderTextColor="#FDAAAA99"
                  onFocus={() => scrollToInput(75)}
                />
                <TextInput
                  placeholder="Postal Code"
                  value={postalCode}
                  onChangeText={setPostalCode}
                  keyboardType="number-pad"
                  className="bg-[#fcf1f1] rounded-xl px-4 py-3 text-base mb-4.5 border border-[#FDAAAA33]"
                  placeholderTextColor="#FDAAAA99"
                  maxLength={10}
                  onFocus={() => scrollToInput(90)}
                />
                <TextInput
                  placeholder="Mobile Number"
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  className="bg-[#fcf1f1] rounded-xl px-4 py-3 text-base mb-7 border border-[#FDAAAA33]"
                  placeholderTextColor="#FDAAAA99"
                  maxLength={15}
                  onFocus={() => scrollToInput(120)}
                />
              </View>
              <TouchableOpacity
                onPress={() =>
                  onSubmit({ name, address, postalCode, mobile, nearestTown })
                }
                className="bg-[#FDAAAA] rounded-2xl py-3.5 items-center mb-2.5 shadow"
              >
                <Text className="text-white font-bold text-lg tracking-wider">
                  Continue
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                className="items-center py-1.5"
              >
                <Text className="text-[#FDAAAA] font-semibold text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default PaymentDetailsModal;
