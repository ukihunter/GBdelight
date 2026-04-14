import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface Order {
  id: number;
  payment_intent_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: any;
  items: any;
  total_amount: number;
  status: string;
  cake_status?: string;
  order_type: string;
  created_at: string;
}

interface AIRequest {
  id: number;
  user_id: string;
  prompt: string;
  generated_image_path?: string;
  generated_description: string;
  status: string;
  admin_note?: string;
  price_lkr?: number;
  created_at: string;
  reviewed_at?: string;
  username: string;
}

type DetailItem = Order | AIRequest;

const isOrder = (item: DetailItem): item is Order => {
  return "total_amount" in item && "order_type" in item;
};

const isAIRequest = (item: DetailItem): item is AIRequest => {
  return "price_lkr" in item && "user_id" in item;
};

const OrderDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderData?: string }>();

  const order: DetailItem | null = useMemo(() => {
    if (!params.orderData) return null;
    try {
      return JSON.parse(decodeURIComponent(params.orderData));
    } catch (e) {
      console.error("Failed to parse order data:", e);
      return null;
    }
  }, [params.orderData]);

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "#10B981";
      case "processing":
        return "#F59E0B";
      case "in transit":
        return "#3B82F6";
      case "pending":
        return "#F59E0B";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!order) {
    return (
      <View className="flex-1 bg-white items-center justify-center ">
        <Text className="text-gray-500 font-JakartaMedium">
          Order details not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-red-400 px-6 py-2 rounded-lg"
        >
          <Text className="text-white font-JakartaBold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const deliveryAddress =
    isOrder(order) && typeof order.delivery_address === "string"
      ? JSON.parse(order.delivery_address)
      : isOrder(order)
        ? order.delivery_address
        : null;
  const items = isOrder(order) && Array.isArray(order.items) ? order.items : [];
  const totalAmount = isOrder(order)
    ? order.total_amount
    : isAIRequest(order)
      ? order.price_lkr
      : 0;

  return (
    <View className="flex-1 bg-gray-100 mt-10">
      {/* Header */}
      <View className="bg-white pt-4 pb-4 px-4 border-b border-gray-200">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Image
              source={require("../../assets/icons/close.png")}
              className="w-6 h-6"
              tintColor="#000"
            />
          </TouchableOpacity>
          <Text className="text-lg font-JakartaBold text-black flex-1">
            {isAIRequest(order)
              ? `AI Design #${order.id}`
              : `Order #${order.id}`}
          </Text>
          <View
            style={{ backgroundColor: getStatusColor(order.status) + "15" }}
            className="px-3 py-1.5 rounded-full"
          >
            <Text
              style={{ color: getStatusColor(order.status) }}
              className="text-xs font-JakartaBold capitalize"
            >
              {order.status}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        showsVerticalScrollIndicator={false}
      >
        {/* For AI Requests - show design details */}
        {isAIRequest(order) && (
          <>
            {order.generated_image_path && (
              <View className="bg-white rounded-lg p-4 mb-4 overflow-hidden">
                <Text className="text-base font-JakartaBold text-black mb-3">
                  Generated Design
                </Text>
                <Image
                  source={{ uri: order.generated_image_path }}
                  className="w-full h-64 rounded-lg"
                  resizeMode="cover"
                />
              </View>
            )}

            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-base font-JakartaBold text-black mb-3">
                Design Details
              </Text>
              <View className="space-y-2">
                <View className="mb-3">
                  <Text className="text-gray-600 font-JakartaMedium text-xs mb-1">
                    Prompt
                  </Text>
                  <Text className="text-black font-JakartaMedium">
                    {order.prompt}
                  </Text>
                </View>
                <View className="mb-3">
                  <Text className="text-gray-600 font-JakartaMedium text-xs mb-1">
                    Description
                  </Text>
                  <Text className="text-black font-JakartaMedium">
                    {order.generated_description}
                  </Text>
                </View>
                {order.admin_note && (
                  <View>
                    <Text className="text-gray-600 font-JakartaMedium text-xs mb-1">
                      Admin Note
                    </Text>
                    <Text className="text-black font-JakartaMedium">
                      {order.admin_note}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {order.price_lkr && (
              <View className="bg-white rounded-lg p-4 mb-4">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600 font-JakartaMedium">
                    Design Price:
                  </Text>
                  <Text className="text-red-400 font-JakartaBold text-lg">
                    LKR {order.price_lkr.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </>
        )}

        {/* For Orders - show order details */}
        {isOrder(order) && (
          <>
            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-base font-JakartaBold text-black mb-3">
                Order Information
              </Text>
              <View className="space-y-2">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600 font-JakartaMedium">
                    Order Date:
                  </Text>
                  <Text className="text-black font-JakartaBold">
                    {formatDate(order.created_at)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600 font-JakartaMedium">
                    Order Type:
                  </Text>
                  <Text className="text-black font-JakartaBold capitalize">
                    {order.order_type}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600 font-JakartaMedium">
                    Payment Status:
                  </Text>
                  <View
                    style={{
                      backgroundColor: getStatusColor(order.status) + "15",
                    }}
                    className="px-3 py-1 rounded-full"
                  >
                    <Text
                      style={{ color: getStatusColor(order.status) }}
                      className="text-xs font-JakartaBold capitalize"
                    >
                      {order.status}
                    </Text>
                  </View>
                </View>
                {order.cake_status && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600 font-JakartaMedium">
                      Cake Status:
                    </Text>
                    <View
                      style={{
                        backgroundColor:
                          getStatusColor(order.cake_status) + "15",
                      }}
                      className="px-3 py-1 rounded-full"
                    >
                      <Text
                        style={{ color: getStatusColor(order.cake_status) }}
                        className="text-xs font-JakartaBold capitalize"
                      >
                        {order.cake_status}
                      </Text>
                    </View>
                  </View>
                )}
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 font-JakartaMedium">
                    Payment Intent:
                  </Text>
                  <Text
                    className="text-black font-JakartaBold text-right flex-1 ml-2"
                    numberOfLines={1}
                  >
                    {order.payment_intent_id}
                  </Text>
                </View>
              </View>
            </View>

            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-base font-JakartaBold text-black mb-3">
                Customer Information
              </Text>
              <View className="space-y-2">
                <View className="mb-2">
                  <Text className="text-gray-600 font-JakartaMedium text-xs mb-1">
                    Name
                  </Text>
                  <Text className="text-black font-JakartaBold">
                    {order.customer_name}
                  </Text>
                </View>
                <View className="mb-2">
                  <Text className="text-gray-600 font-JakartaMedium text-xs mb-1">
                    Email
                  </Text>
                  <Text className="text-black font-JakartaBold break-words">
                    {order.customer_email}
                  </Text>
                </View>
                <View>
                  <Text className="text-gray-600 font-JakartaMedium text-xs mb-1">
                    Phone
                  </Text>
                  <Text className="text-black font-JakartaBold">
                    {order.customer_phone}
                  </Text>
                </View>
              </View>
            </View>

            {deliveryAddress && (
              <View className="bg-white rounded-lg p-4 mb-4">
                <Text className="text-base font-JakartaBold text-black mb-3">
                  Delivery Address
                </Text>
                <View className="space-y-2">
                  {deliveryAddress?.street && (
                    <Text className="text-black font-JakartaMedium">
                      {deliveryAddress.street}
                    </Text>
                  )}
                  {deliveryAddress?.city && (
                    <Text className="text-black font-JakartaMedium">
                      {deliveryAddress.city}
                      {deliveryAddress.postalCode &&
                        ` ${deliveryAddress.postalCode}`}
                    </Text>
                  )}
                  {deliveryAddress?.country && (
                    <Text className="text-black font-JakartaMedium">
                      {deliveryAddress.country}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Items */}
            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-base font-JakartaBold text-black mb-3">
                Order Items
              </Text>
              {items.length > 0 ? (
                items.map((item: any, index: number) => (
                  <View
                    key={index}
                    className="mb-4 pb-4 border-b border-gray-100 last:border-0"
                  >
                    {item.image_url && (
                      <Image
                        source={{ uri: item.image_url }}
                        className="w-full h-40 rounded-lg mb-2"
                        resizeMode="cover"
                      />
                    )}
                    <Text className="text-black font-JakartaBold text-base mb-1">
                      {item.cake_name || item.name || "Cake Item"}
                    </Text>
                    {item.description && (
                      <Text className="text-gray-600 font-JakartaMedium text-sm mb-2">
                        {item.description}
                      </Text>
                    )}
                    <View className="flex-row justify-between">
                      <Text className="text-gray-600 font-JakartaMedium">
                        Qty: {item.quantity || 1}
                      </Text>
                      <Text className="text-black font-JakartaBold">
                        LKR {(item.price_lkr || item.price || 0).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text className="text-gray-500 font-JakartaMedium">
                  No items in order
                </Text>
              )}
            </View>

            {/* Order Summary */}
            <View className="bg-white rounded-lg p-4 mb-6">
              <Text className="text-base font-JakartaBold text-black mb-3">
                Order Summary
              </Text>
              <View className="space-y-2">
                {items.length > 0 && (
                  <>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-600 font-JakartaMedium">
                        Subtotal:
                      </Text>
                      <Text className="text-black font-JakartaMedium">
                        LKR{" "}
                        {items
                          .reduce(
                            (sum, item) =>
                              sum +
                              (item.price_lkr || item.price || 0) *
                                (item.quantity || 1),
                            0,
                          )
                          .toFixed(2)}
                      </Text>
                    </View>
                    {order.total_amount >
                      items.reduce(
                        (sum, item) =>
                          sum +
                          (item.price_lkr || item.price || 0) *
                            (item.quantity || 1),
                        0,
                      ) && (
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600 font-JakartaMedium">
                          Delivery Fee:
                        </Text>
                        <Text className="text-black font-JakartaMedium">
                          LKR{" "}
                          {(
                            order.total_amount -
                            items.reduce(
                              (sum, item) =>
                                sum +
                                (item.price_lkr || item.price || 0) *
                                  (item.quantity || 1),
                              0,
                            )
                          ).toFixed(2)}
                        </Text>
                      </View>
                    )}
                  </>
                )}
                <View className="flex-row justify-between pt-2 border-t border-gray-200">
                  <Text className="text-black font-JakartaBold text-base">
                    Total:
                  </Text>
                  <Text className="text-red-400 font-JakartaBold text-lg">
                    LKR {(totalAmount || 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default OrderDetails;
