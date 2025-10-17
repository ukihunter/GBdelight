import { CardField, useStripe } from "@stripe/stripe-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { icons } from "../constants";
import { CartItem } from "./CartProvider";
import { CustomerDetails } from "./CheckoutForm";

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  customerDetails: CustomerDetails;
  cartItems: CartItem[];
  totalAmount: number;
  onPaymentSuccess: (paymentIntent: any) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  customerDetails,
  cartItems,
  totalAmount,
  onPaymentSuccess,
}) => {
  const { confirmPayment } = useStripe();
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);

  const handlePayment = async () => {
    if (!cardDetails?.complete) {
      Alert.alert("Error", "Please enter complete card details");
      return;
    }

    setLoading(true);

    try {
      // Create payment intent on your server
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100), // Convert to cents
          currency: "usd",
          customerDetails,
          cartItems,
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment with Stripe
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: "Card",
        paymentMethodData: {
          billingDetails: {
            name: customerDetails.name,
            email: customerDetails.email,
            phone: customerDetails.phone,
            address: {
              line1: customerDetails.address.street,
              city: customerDetails.address.city,
              state: customerDetails.address.state,
              postalCode: customerDetails.address.zipCode,
            },
          },
        },
      });

      if (error) {
        Alert.alert("Payment Failed", error.message);
      } else if (paymentIntent) {
        // Payment successful
        onPaymentSuccess(paymentIntent);
        Alert.alert("Success", "Payment completed successfully!");
      }
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Error", "Payment processing failed. Please try again.");
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
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View
          style={{
            flex: 1,
            backgroundColor: "#fcf1f1",

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
                Payment Details
              </Text>
              <TouchableOpacity onPress={onClose} disabled={loading}>
                <Image
                  source={icons.close}
                  style={{ width: 24, height: 24, tintColor: "#666" }}
                />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, padding: 20 }}>
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
                  Payment Summary
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: "#666" }}>Subtotal:</Text>
                  <Text>${totalAmount.toFixed(2)}</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: "#666" }}>Delivery Fee:</Text>
                  <Text>$0.00</Text>
                </View>
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#eee",
                    marginVertical: 8,
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                    Total:
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

              {/* Customer Details Summary */}
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
                  Delivery Details
                </Text>
                <Text style={{ color: "#666", marginBottom: 4 }}>
                  {customerDetails.name}
                </Text>
                <Text style={{ color: "#666", marginBottom: 4 }}>
                  {customerDetails.phone}
                </Text>
                <Text style={{ color: "#666" }}>
                  {customerDetails.address.street},{" "}
                  {customerDetails.address.city},{" "}
                  {customerDetails.address.state}{" "}
                  {customerDetails.address.zipCode}
                </Text>
              </View>

              {/* Card Input */}
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
                  Card Details
                </Text>
                <CardField
                  postalCodeEnabled={true}
                  placeholders={{
                    number: "4242 4242 4242 4242",
                  }}
                  cardStyle={{
                    backgroundColor: "#FFFFFF",
                    textColor: "#000000",
                  }}
                  style={{
                    width: "100%",
                    height: 25,
                    marginVertical: 6,
                  }}
                  onCardChange={(cardDetails) => {
                    setCardDetails(cardDetails);
                  }}
                />
                <Text style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                  For demo: Use card number 4242 4242 4242 4242
                </Text>
              </View>
            </View>

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
                onPress={handlePayment}
                disabled={loading || !cardDetails?.complete}
                style={{
                  backgroundColor:
                    loading || !cardDetails?.complete ? "#ccc" : "#FDAAAA",
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {loading && (
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  {loading ? "Processing..." : `Pay $${totalAmount.toFixed(2)}`}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

export default PaymentModal;
