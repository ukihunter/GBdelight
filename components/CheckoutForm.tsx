import React, { useCallback, useState } from "react";
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { icons } from "../constants";

interface CheckoutFormProps {
  visible: boolean;
  onClose: () => void;
  onProceedToPayment: (customerDetails: CustomerDetails) => void;
  totalAmount: number;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

// InputField component moved outside to prevent re-renders
const InputField = React.memo(
  ({
    label,
    field,
    placeholder,
    keyboardType = "default",
    error,
    value,
    onChangeText,
  }: {
    label: string;
    field: string;
    placeholder: string;
    keyboardType?: "default" | "email-address" | "phone-pad" | "numeric";
    error?: string;
    value: string;
    onChangeText: (value: string) => void;
  }) => {
    return (
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "bold",
            marginBottom: 8,
            color: "#333",
          }}
        >
          {label}
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: error ? "#ff4444" : "#ddd",
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            backgroundColor: "#fff",
          }}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {error && (
          <Text style={{ color: "#ff4444", fontSize: 12, marginTop: 4 }}>
            {error}
          </Text>
        )}
      </View>
    );
  }
);

InputField.displayName = "InputField";

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  visible,
  onClose,
  onProceedToPayment,
  totalAmount,
}) => {
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!customerDetails.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!customerDetails.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(customerDetails.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!customerDetails.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(customerDetails.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!customerDetails.address.street.trim()) {
      newErrors.street = "Street address is required";
    }

    if (!customerDetails.address.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!customerDetails.address.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!customerDetails.address.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (validateForm()) {
      onProceedToPayment(customerDetails);
    }
  };

  const updateCustomerDetail = useCallback((field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];
      setCustomerDetails((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setCustomerDetails((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    // Clear error when user starts typing
    setErrors((prev) => {
      if (prev[field]) {
        return { ...prev, [field]: "" };
      }
      return prev;
    });
  }, []);

  const getValue = useCallback(
    (field: string) => {
      if (field.startsWith("address.")) {
        const addressField = field.split(".")[1];
        return customerDetails.address[
          addressField as keyof typeof customerDetails.address
        ];
      }
      return customerDetails[field as keyof typeof customerDetails] as string;
    },
    [customerDetails]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View
          style={{
            flex: 1,
            backgroundColor: "#fcf1f1",
            marginTop: 50,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Checkout Details
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Image
                  source={icons.close}
                  style={{ width: 24, height: 24, tintColor: "#666" }}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, padding: 20 }}>
              {/* Order Summary */}
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}
                >
                  Order Summary
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontSize: 18, color: "#666" }}>
                    Total Amount:
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#FDAAAA",
                    }}
                  >
                    ${totalAmount.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Customer Details Form */}
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16 }}
                >
                  Personal Information
                </Text>

                <InputField
                  label="Full Name"
                  field="name"
                  placeholder="Enter your full name"
                  error={errors.name}
                  value={getValue("name")}
                  onChangeText={(value) => updateCustomerDetail("name", value)}
                />

                <InputField
                  label="Email"
                  field="email"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  error={errors.email}
                  value={getValue("email")}
                  onChangeText={(value) => updateCustomerDetail("email", value)}
                />

                <InputField
                  label="Phone Number"
                  field="phone"
                  placeholder="Enter your 10-digit phone number"
                  keyboardType="numeric"
                  error={errors.phone}
                  value={getValue("phone")}
                  onChangeText={(value) => updateCustomerDetail("phone", value)}
                />
              </View>

              {/* Address Details */}
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", marginBottom: 16 }}
                >
                  Delivery Address
                </Text>

                <InputField
                  label="Street Address"
                  field="address.street"
                  placeholder="Enter street address"
                  error={errors.street}
                  value={getValue("address.street")}
                  onChangeText={(value) =>
                    updateCustomerDetail("address.street", value)
                  }
                />

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <InputField
                      label="City"
                      field="address.city"
                      placeholder="Enter city"
                      error={errors.city}
                      value={getValue("address.city")}
                      onChangeText={(value) =>
                        updateCustomerDetail("address.city", value)
                      }
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <InputField
                      label="State"
                      field="address.state"
                      placeholder="Enter state"
                      error={errors.state}
                      value={getValue("address.state")}
                      onChangeText={(value) =>
                        updateCustomerDetail("address.state", value)
                      }
                    />
                  </View>
                </View>

                <InputField
                  label="ZIP Code"
                  field="address.zipCode"
                  placeholder="Enter ZIP code"
                  error={errors.zipCode}
                  value={getValue("address.zipCode")}
                  onChangeText={(value) =>
                    updateCustomerDetail("address.zipCode", value)
                  }
                />
              </View>
            </ScrollView>

            {/* Footer */}
            <View
              style={{
                padding: 20,
                borderTopWidth: 1,
                borderTopColor: "#eee",
                backgroundColor: "#fff",
              }}
            >
              <TouchableOpacity
                onPress={handleProceedToPayment}
                style={{
                  backgroundColor: "#FDAAAA",
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  Proceed to Payment
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

export default CheckoutForm;
