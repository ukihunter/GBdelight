import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

const MyOrders = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [aiRequests, setAIRequests] = useState<AIRequest[]>([]);
  const [aiOrders, setAIOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get status color helper
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

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fetch orders and AI requests
  useEffect(() => {
    if (!isLoaded || !user?.primaryEmailAddress?.emailAddress) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const userEmail = user.primaryEmailAddress.emailAddress;
        const userId = user.id;

        // Fetch orders
        const ordersResponse = await fetch(
          `/orders?email=${encodeURIComponent(userEmail)}`,
        );
        if (!ordersResponse.ok) {
          const errorData = await ordersResponse.text();
          console.error("Orders API error:", ordersResponse.status, errorData);
          throw new Error(`Failed to fetch orders: ${ordersResponse.status}`);
        }
        const ordersData = await ordersResponse.json();

        // Fetch AI requests
        const aiResponse = await fetch(
          `/ai-cake-design?userId=${encodeURIComponent(userId)}`,
        );
        if (!aiResponse.ok) {
          const errorData = await aiResponse.text();
          console.error("AI API error:", aiResponse.status, errorData);
          throw new Error(`Failed to fetch AI requests: ${aiResponse.status}`);
        }
        const aiData = await aiResponse.json();

        // Separate normal orders and AI orders
        const normalOrders = (ordersData.data || []).filter(
          (o: Order) => o.order_type === "normal",
        );
        const purchasedAIOrders = (ordersData.data || []).filter(
          (o: Order) => o.order_type === "ai",
        );

        setOrders(normalOrders);
        setAIOrders(purchasedAIOrders);
        setAIRequests(aiData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoaded, user]);

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 border border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-base font-JakartaBold text-black">
            #{item.id}
          </Text>
          <Text className="text-xs text-gray-500 font-JakartaMedium mt-1">
            {formatDate(item.created_at)}
          </Text>
        </View>
        <View className="flex-col items-end gap-2">
          <View
            style={{ backgroundColor: getStatusColor(item.status) + "15" }}
            className="px-2 py-1 rounded-full"
          >
            <Text
              style={{ color: getStatusColor(item.status) }}
              className="text-xs font-JakartaBold capitalize"
            >
              Payment: {item.status}
            </Text>
          </View>
          {item.cake_status && (
            <View
              style={{
                backgroundColor: getStatusColor(item.cake_status) + "15",
              }}
              className="px-2 py-1 rounded-full"
            >
              <Text
                style={{ color: getStatusColor(item.cake_status) }}
                className="text-xs font-JakartaBold capitalize"
              >
                Cake: {item.cake_status}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Text className="text-sm text-gray-700 font-JakartaMedium mb-2">
        {Array.isArray(item.items)
          ? item.items
              .map((i: any) => i.cake_name || i.name || "Cake")
              .join(", ")
          : "Order items"}
      </Text>

      <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
        <Text className="text-base font-JakartaBold text-black">
          LKR {item.total_amount.toFixed(2)}
        </Text>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/OrderDetails",
              params: {
                orderData: encodeURIComponent(JSON.stringify(item)),
              },
            });
          }}
          className="flex-row items-center"
        >
          <Text className="text-sm text-red-400 font-JakartaBold">
            View Details
          </Text>
          <Image
            source={require("../../assets/icons/arrow-up.png")}
            className="w-3 h-3 ml-1"
            tintColor="#FF6B6B"
            style={{ transform: [{ rotate: "45deg" }] }}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderAIRequestItem = ({ item }: { item: AIRequest }) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 border border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-JakartaBold text-black">
            AI Design #{item.id}
          </Text>
          <Text className="text-xs text-gray-500 font-JakartaMedium mt-1">
            {formatDate(item.created_at)}
          </Text>
        </View>
        <View
          style={{ backgroundColor: getStatusColor(item.status) + "15" }}
          className="px-3 py-1.5 rounded-full"
        >
          <Text
            style={{ color: getStatusColor(item.status) }}
            className="text-xs font-JakartaBold capitalize"
          >
            {item.status}
          </Text>
        </View>
      </View>

      <Text className="text-sm text-gray-600 font-JakartaMedium mb-2">
        {item.generated_description}
      </Text>

      {item.price_lkr && (
        <Text className="text-base font-JakartaBold text-red-400 mb-2">
          Price: LKR {item.price_lkr.toFixed(2)}
        </Text>
      )}

      {item.admin_note && (
        <Text className="text-xs text-gray-500 font-JakartaMedium mb-2">
          Admin Note: {item.admin_note}
        </Text>
      )}

      <View className="flex-row justify-end items-center pt-2 border-t border-gray-100">
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/OrderDetails",
              params: {
                orderData: encodeURIComponent(JSON.stringify(item)),
              },
            });
          }}
          className="flex-row items-center"
        >
          <Text className="text-sm text-red-400 font-JakartaBold">
            View Design
          </Text>
          <Image
            source={require("../../assets/icons/arrow-up.png")}
            className="w-3 h-3 ml-1"
            tintColor="#FF6B6B"
            style={{ transform: [{ rotate: "45deg" }] }}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderAIOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 border border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-base font-JakartaBold text-black">
            AI Cake Order #{item.id}
          </Text>
          <Text className="text-xs text-gray-500 font-JakartaMedium mt-1">
            {formatDate(item.created_at)}
          </Text>
        </View>
        <View className="flex-col items-end gap-2">
          <View
            style={{ backgroundColor: getStatusColor(item.status) + "15" }}
            className="px-2 py-1 rounded-full"
          >
            <Text
              style={{ color: getStatusColor(item.status) }}
              className="text-xs font-JakartaBold capitalize"
            >
              Payment: {item.status}
            </Text>
          </View>
          {item.cake_status && (
            <View
              style={{
                backgroundColor: getStatusColor(item.cake_status) + "15",
              }}
              className="px-2 py-1 rounded-full"
            >
              <Text
                style={{ color: getStatusColor(item.cake_status) }}
                className="text-xs font-JakartaBold capitalize"
              >
                Cake: {item.cake_status}
              </Text>
            </View>
          )}
        </View>
      </View>

      <Text className="text-sm text-gray-700 font-JakartaMedium mb-2">
        {Array.isArray(item.items)
          ? item.items
              .map((i: any) => i.cake_name || i.name || "AI Design")
              .join(", ")
          : "AI Cake Design"}
      </Text>

      <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
        <Text className="text-base font-JakartaBold text-black">
          LKR {item.total_amount.toFixed(2)}
        </Text>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/OrderDetails",
              params: {
                orderData: encodeURIComponent(JSON.stringify(item)),
              },
            });
          }}
          className="flex-row items-center"
        >
          <Text className="text-sm text-red-400 font-JakartaBold">
            View Details
          </Text>
          <Image
            source={require("../../assets/icons/arrow-up.png")}
            className="w-3 h-3 ml-1"
            tintColor="#FF6B6B"
            style={{ transform: [{ rotate: "45deg" }] }}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white pt-4 pb-0 px-4 border-b border-gray-200">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Image
              source={require("../../assets/icons/close.png")}
              className="w-6 h-6"
              tintColor="#000"
            />
          </TouchableOpacity>
          <Text className="text-xl font-JakartaBold text-black flex-1 mt-10">
            My Orders
          </Text>
        </View>

        {/* Tabs */}
        <View className="flex-row mb-0">
          <TouchableOpacity
            onPress={() => setActiveTab("orders")}
            className={`flex-1 py-4 px-4 border-b-2 ${
              activeTab === "orders" ? "border-red-400" : "border-gray-200"
            }`}
          >
            <Text
              className={`text-center font-JakartaBold text-sm ${
                activeTab === "orders" ? "text-red-400" : "text-gray-500"
              }`}
            >
              Orders ({orders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("ai")}
            className={`flex-1 py-4 px-4 border-b-2 ${
              activeTab === "ai" ? "border-red-400" : "border-gray-200"
            }`}
          >
            <Text
              className={`text-center font-JakartaBold text-sm ${
                activeTab === "ai" ? "text-red-400" : "text-gray-500"
              }`}
            >
              AI ({aiRequests.length + aiOrders.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-500 font-JakartaMedium text-center">
            {error}
          </Text>
        </View>
      ) : activeTab === "orders" ? (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id.toString()}
          className="px-4 py-4"
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
              <Text className="text-gray-500 font-JakartaMedium">
                No orders yet
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={
            aiRequests.length > 0 || aiOrders.length > 0
              ? [
                  ...aiRequests.map((r) => ({ ...r, _type: "request" })),
                  ...aiOrders.map((o) => ({ ...o, _type: "order" })),
                ]
              : []
          }
          renderItem={({ item }: any) => {
            if (item._type === "request") {
              return renderAIRequestItem({ item: item as AIRequest });
            } else {
              return renderAIOrderItem({ item: item as Order });
            }
          }}
          keyExtractor={(item, index) => {
            if (item._type === "request") {
              return `req-${item.id}`;
            } else {
              return `order-${item.id}`;
            }
          }}
          className="px-4 py-4"
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
              <Text className="text-gray-500 font-JakartaMedium">
                No AI requests or orders yet
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default MyOrders;
