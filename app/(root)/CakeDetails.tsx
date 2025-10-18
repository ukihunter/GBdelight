import { icons } from "@/constants";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Stack } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { showMessage } from "react-native-flash-message";
import { useCart } from "../../components/CartProvider";
import { productsByCategory } from "../../constants/categoriesData";

type Product = {
  id: number;
  name: string;
  image: any;
  price?: number;
  description?: string;
  ingredients?: string[];
};

type RootStackParamList = {
  CakeDetails: { productId: string; categoryKey: string };
  // ...other routes
};

const CakeDetails = () => {
  const route = useRoute();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, "CakeDetails">
    >();
  const { addToCart } = useCart();
  const { productId, categoryKey } = route.params as {
    productId: string;
    categoryKey: string;
  };

  // Find the product by id and category
  const product: Product | undefined =
    productsByCategory[categoryKey as keyof typeof productsByCategory]?.find(
      (item) => item.id === parseInt(productId)
    ) ||
    Object.values(productsByCategory)
      .flat()
      .find((item) => item.id === parseInt(productId));

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Product not found.</Text>
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
            onPress={() => navigation.goBack()}
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
          {product.ingredients && (
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{ fontWeight: "bold", marginBottom: 8, fontSize: 16 }}
              >
                Ingredients:
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {product.ingredients.map((ing: string, idx: number) => (
                  <View
                    key={idx}
                    style={{
                      backgroundColor: "#fde4e4",
                      borderRadius: 16,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: "#b85c5c", fontSize: 14 }}>
                      {ing}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "#FDAAAA",
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
              addToCart({
                id: product.id.toString(),
                name: product.name,
                price: product.price || 0,
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
              Add to Cart
            </Text>
          </TouchableOpacity>
        </View>

        {/* Other Products */}
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
            {(
              productsByCategory[
                categoryKey as keyof typeof productsByCategory
              ] ?? []
            )
              .filter((item) => item.id !== product.id)
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
                    navigation.navigate("CakeDetails", {
                      productId: item.id.toString(),
                      categoryKey,
                    })
                  }
                >
                  <Image
                    source={item.image}
                    style={{ width: 80, height: 80, borderRadius: 12 }}
                  />
                  <Text
                    style={{
                      marginTop: 8,
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text style={{ color: "#FDAAAA", fontWeight: "bold" }}>
                    {"price" in item && typeof item.price === "number"
                      ? `LKR ${item.price.toFixed(2)}`
                      : ""}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </ScrollView>
    </>
  );
};

export default CakeDetails;
