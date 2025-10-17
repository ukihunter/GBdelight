import React from "react";
import {
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { icons } from "../constants";
import { CartItem, useCart } from "./CartProvider";

interface CartModalProps {
  visible: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ visible, onClose }) => {
  const { cart, removeFromCart, clearCart } = useCart();

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Image
        source={item.image}
        style={{
          width: 60,
          height: 60,
          borderRadius: 8,
          marginRight: 12,
        }}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "bold",
            color: "#333",
            marginBottom: 4,
          }}
        >
          {item.name}
        </Text>
        <Text style={{ fontSize: 14, color: "#FDAAAA", fontWeight: "bold" }}>
          ${item.price.toFixed(2)} x {item.quantity}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => removeFromCart(item.id)}
        style={{
          backgroundColor: "#ff4444",
          borderRadius: 20,
          width: 32,
          height: 32,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
          ×
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,

          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#fcf1f1",
            borderColor: "#ddd",
            borderWidth: 1,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: "70%",
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
                Shopping Cart ({cart.length})
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Image
                  source={icons.close}
                  style={{ width: 24, height: 24, tintColor: "#666" }}
                />
              </TouchableOpacity>
            </View>

            {/* Cart Items */}
            {cart.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={icons.cart}
                  style={{ width: 80, height: 80, tintColor: "#ccc" }}
                />
                <Text
                  style={{
                    fontSize: 18,
                    color: "#666",
                    marginTop: 16,
                    textAlign: "center",
                  }}
                >
                  Your cart is empty
                </Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={cart}
                  renderItem={renderCartItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  style={{ flex: 1 }}
                />

                {/* Footer */}
                <View
                  style={{
                    padding: 20,
                    borderTopWidth: 1,
                    borderTopColor: "#eee",
                    backgroundColor: "#fff",
                  }}
                >
                  {/* Total */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      Total:
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#FDAAAA",
                      }}
                    >
                      ${totalPrice.toFixed(2)}
                    </Text>
                  </View>

                  {/* Buttons */}
                  <View
                    style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}
                  >
                    <TouchableOpacity
                      onPress={clearCart}
                      style={{
                        flex: 1,
                        backgroundColor: "#ff4444",
                        borderRadius: 12,
                        paddingVertical: 12,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        Clear Cart
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 2,
                        backgroundColor: "#FDAAAA",
                        borderRadius: 12,
                        paddingVertical: 12,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        Checkout
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

export default CartModal;
