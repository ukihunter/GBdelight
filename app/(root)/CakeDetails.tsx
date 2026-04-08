import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import { useCart } from "../../components/CartProvider";

type DatabaseCake = {
  id: number;
  cake_code: string;
  cake_name: string;
  description?: string;
  price_lkr: number | string;
  stock_quantity: number;
  is_available: boolean;
  image_url?: string;
  category: string;
  created_at?: string;
};

type Product = {
  id: number;
  name: string;
  image: any;
  price: number;
  description?: string;
  stock_quantity?: number;
  is_available?: boolean;
  cake_code?: string;
};

const CakeDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    productId?: string;
    categoryKey?: string;
  }>();
  const { addToCart } = useCart();
  const productId = Number(params.productId);

  // Fetch all cakes from database
  const {
    data: cakesData,
    loading,
    error,
  } = useFetch<DatabaseCake[]>("/cakes");

  // Find the specific cake and transform it
  const product: Product | undefined = useMemo(() => {
    if (!cakesData) return undefined;

    const cake = cakesData.find((c) => c.id === productId);
    if (!cake) return undefined;

    return {
      id: cake.id,
      name: cake.cake_name,
      price:
        typeof cake.price_lkr === "string"
          ? parseFloat(cake.price_lkr)
          : cake.price_lkr,
      image: cake.image_url
        ? { uri: cake.image_url }
        : require("../../assets/products/cake1.png"),
      description: cake.description,
      stock_quantity: cake.stock_quantity,
      is_available: cake.is_available,
      cake_code: cake.cake_code,
    };
  }, [cakesData, productId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FDAAAA" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#333", fontSize: 16, marginBottom: 16 }}>
          {error ? "Error loading product" : "Product not found."}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: "#FDAAAA",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView style={{ flex: 1, backgroundColor: "#fcf1f1" }}>
        {/* Header Image */}
        <View style={{ position: "relative" }}>
          <Image
            source={product.image}
            style={{
              width: "100%",
              height: 320,
              resizeMode: "cover",
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            }}
          />
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute",
              top: 40,
              left: 20,
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 8,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Image
              source={icons.backArrow}
              style={{ width: 24, height: 24, tintColor: "#FDAAAA" }}
            />
          </TouchableOpacity>
        </View>

        {/* Details */}
        <View style={{ padding: 24 }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#333",
              fontFamily: "JakartaBold",
              marginBottom: 8,
            }}
          >
            {product.name}
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: "#FDAAAA",
              fontWeight: "bold",
              marginBottom: 16,
              fontFamily: "JakartaBold",
            }}
          >
            LKR {product.price?.toFixed(2)}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#555",
              marginBottom: 20,
              lineHeight: 22,
            }}
          >
            {product.description || "No description available for this cake."}
          </Text>
          {/* Add to Cart Button */}
          <TouchableOpacity
            disabled={!product.is_available}
            style={{
              backgroundColor: product.is_available ? "#FDAAAA" : "#ccc",
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              marginTop: 16,
              shadowColor: "#FDAAAA",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 5,
            }}
            onPress={() => {
              if (!product.is_available) {
                showMessage({
                  message: "Out of Stock",
                  description: "This product is not available.",
                  type: "danger",
                  backgroundColor: "#ff6b6b",
                  color: "#fff",
                  icon: "danger",
                  duration: 2000,
                  position: "center",
                });
                return;
              }

              addToCart({
                id: product.id.toString(),
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1,
              });
              showMessage({
                message: "Added to Cart!",
                description: `${product.name} has been added to your cart.`,
                type: "success",
                backgroundColor: "#FDAAAA",
                color: "#fff",
                icon: "success",
                duration: 2000,
                position: "center",
              });
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
              {product.is_available ? "Add to Cart" : "Out of Stock"}
            </Text>
          </TouchableOpacity>

          {/* Stock Info */}
          <Text
            style={{
              fontSize: 14,
              color: (product.stock_quantity ?? 0) > 0 ? "#666" : "#ff6b6b",
              marginTop: 12,
              textAlign: "center",
            }}
          >
            {(product.stock_quantity ?? 0) > 0
              ? `${product.stock_quantity} in stock`
              : "Out of stock"}
          </Text>
        </View>

        {/* Other Products */}
        {cakesData && cakesData.length > 1 && (
          <View style={{ marginTop: 20 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 8,
                marginLeft: 24,
                fontFamily: "JakartaBold",
              }}
            >
              Similar Products
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 8, marginLeft: 24, marginBottom: 20 }}
            >
              {cakesData
                .filter((item) => item.id !== product?.id)
                .slice(0, 5) // Show only first 5 similar products
                .map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 20,
                      padding: 10,
                      marginRight: 12,
                      marginBottom: 10,
                      elevation: 3,
                      alignItems: "center",
                      width: 120,
                    }}
                    onPress={() =>
                      router.push({
                        pathname: "/(root)/CakeDetails",
                        params: {
                          productId: String(item.id),
                          categoryKey: item.category,
                        },
                      })
                    }
                  >
                    <Image
                      source={
                        item.image_url
                          ? { uri: item.image_url }
                          : require("../../assets/products/cake1.png")
                      }
                      style={{ width: 80, height: 80, borderRadius: 12 }}
                    />
                    <Text
                      style={{
                        marginTop: 8,
                        fontWeight: "bold",
                        textAlign: "center",
                        fontSize: 12,
                      }}
                      numberOfLines={2}
                    >
                      {item.cake_name}
                    </Text>
                    <Text
                      style={{
                        color: "#FDAAAA",
                        fontWeight: "bold",
                        marginTop: 4,
                      }}
                    >
                      LKR{" "}
                      {typeof item.price_lkr === "string"
                        ? parseFloat(item.price_lkr).toFixed(2)
                        : item.price_lkr.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </>
  );
};

export default CakeDetails;
