import { icons } from "@/constants";
import { fetchAPI, useFetch } from "@/lib/fetch";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { showMessage } from "react-native-flash-message";
import { categories } from "../../../constants/categoriesData";

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
  price: number;
  image?: any;
  description?: string;
  cake_code?: string;
  stock_quantity?: number;
  is_available?: boolean;
  image_url?: string;
};

const AllCake = () => {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categories[0]?.key || null,
  );
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: cakesData,
    loading,
    error,
    refetch,
  } = useFetch<DatabaseCake[]>("/cakes");

  // Handle pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchFavorites && refetchFavorites()]);
    setRefreshing(false);
  };

  const { isSignedIn, user } = useUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const { data: favData, refetch: refetchFavorites } = useFetch<{
    favorites: string[];
  }>(userEmail ? `/(api)/favorites?email=${userEmail}` : "");

  const [favoriteCodes, setFavoriteCodes] = useState<string[]>([]);

  useEffect(() => {
    if (favData && favData.favorites) {
      setFavoriteCodes(favData.favorites);
    }
  }, [favData]);

  // Sync user with database
  useEffect(() => {
    if (isSignedIn && user) {
      const syncUser = async () => {
        try {
          await fetchAPI("/(api)/user", {
            method: "POST",
            body: JSON.stringify({
              name: user.username || user.firstName || user.emailAddresses[0].emailAddress.split('@')[0],
              email: user.emailAddresses[0].emailAddress,
              clerkId: user.id,
            }),
          });
        } catch (error) {
          console.error("User sync error:", error);
        }
      };
      syncUser();
    }
  }, [isSignedIn, user]);

  const handleToggleFavorite = async (cakeCode: string | undefined) => {
    if (!cakeCode) return;

    if (!isSignedIn) {
      // you could show a message here if needed
      return;
    }

    try {
      const result = await fetchAPI("/(api)/favorites", {
        method: "POST",
        body: JSON.stringify({
          userEmail,
          cakeCode,
          clerkId: user?.id,
          name: user?.username || user?.firstName || "User",
        }),
      });

      // Update local state for immediate feedback
      const action = result.action === "added" ? "added" : "removed";
      setFavoriteCodes((prev) =>
        action === "added"
          ? [...(prev || []), cakeCode]
          : (prev || []).filter((c) => c !== cakeCode),
      );

      showMessage({
        message: action === "added" ? "Added to Favorites" : "Removed from Favorites",
        type: action === "added" ? "success" : "info",
        backgroundColor: action === "added" ? "#ff4d6d" : "#666",
        icon: action === "added" ? "success" : "none",
      });
    } catch (error) {
      console.error(error);
      showMessage({
        message: "Error",
        description: "Failed to update favorites. Please check your connection.",
        type: "danger",
        backgroundColor: "#ff6b6b",
      });
    }
  };

  // Debug logging
  useEffect(() => {
    // console.log("=== AllCake Debug ===");
    // console.log("Loading:", loading);
    // console.log("Error:", error);
    // console.log("CakesData:", cakesData);
    //console.log("SelectedCategory:", selectedCategory);
  }, [cakesData, loading, error, selectedCategory]);

  // Map database category to our category keys
  const getCategoryKey = (dbCategory: string): string => {
    const categoryMap: { [key: string]: string } = {
      "cake slice": "cake-slice",
      "cake-slice": "cake-slice",
      cake: "cake",
      cookies: "cookies",
      cupcake: "cupcake",
      muffin: "cupcake",
    };
    return categoryMap[dbCategory.toLowerCase()] || "cake";
  };

  // Transform database data to product format
  const productsByCategory = useMemo(() => {
    if (!cakesData) return {};

    const grouped: { [key: string]: Product[] } = {};

    cakesData.forEach((cake) => {
      const categoryKey = getCategoryKey(cake.category);
      if (!grouped[categoryKey]) {
        grouped[categoryKey] = [];
      }

      grouped[categoryKey].push({
        id: cake.id,
        name: cake.cake_name,
        price:
          typeof cake.price_lkr === "string"
            ? parseFloat(cake.price_lkr)
            : cake.price_lkr,
        image: cake.image_url
          ? { uri: cake.image_url }
          : require("../../../assets/products/cake1.png"),
        description: cake.description,
        cake_code: cake.cake_code,
        stock_quantity: cake.stock_quantity,
        is_available: cake.is_available,
        image_url: cake.image_url,
      });
    });

    return grouped;
  }, [cakesData]);

  // Get unique categories from fetched data
  const uniqueCategories = useMemo(() => {
    if (!cakesData || cakesData.length === 0) return categories;

    const fetchedCategoryKeys = [
      ...new Set(cakesData.map((c) => getCategoryKey(c.category))),
    ];
    return categories.filter((cat) => fetchedCategoryKeys.includes(cat.key));
  }, [cakesData]);

  // Set default category on first load - updates when data arrives
  useEffect(() => {
    if (uniqueCategories.length > 0) {
      // Only set if not already set, or if current selection is not in available categories
      if (
        !selectedCategory ||
        !uniqueCategories.some((c) => c.key === selectedCategory)
      ) {
        setSelectedCategory(uniqueCategories[0].key);
      }
    }
  }, [uniqueCategories]);
  return (
    <SafeAreaView className="flex-1">
      <View className=" ml-8 mt-5  text-2xl">
        <Text className="font-JakartaBold text-2xl">All Products</Text>
      </View>

      {/* Error state */}
      {error && (
        <View className="ml-8 mr-8 mt-4 p-3 bg-red-100 rounded">
          <Text className="text-red-600 text-sm">
            Error loading cakes: {error}
          </Text>
        </View>
      )}

      <View className=" flex justify-between flex-row  mt-5 ml-5 mr-8">
        {uniqueCategories.map((category) => (
          <TouchableOpacity
            key={category.key}
            onPress={() => setSelectedCategory(category.key)}
            activeOpacity={0.7}
          >
            <Text
              className={`font-JakartaRegular text-sm m-1 p-3 rounded-full text-white ${
                selectedCategory === category.key
                  ? "bg-[#ff728a]"
                  : "bg-[#FDAAAA]"
              }`}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loading state */}
      {loading && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff728a" />
          <Text className="mt-3 text-gray-600">Loading cakes...</Text>
        </View>
      )}

      {/* Display products of the selected category */}
      {!loading && selectedCategory && productsByCategory[selectedCategory] && (
        <View className="flex-1 mt-5">
          <Text className="text-base font-JakartaBold mb-2 ml-2">
            All{" "}
            {uniqueCategories.find((c) => c.key === selectedCategory)?.label}
          </Text>

          <FlatList
            ref={flatListRef}
            data={productsByCategory[selectedCategory]}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#ff728a"]}
                tintColor="#ff728a"
              />
            }
            renderItem={({ item: product }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  width: "47%",
                  backgroundColor: "#ffffff",
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 16,
                  marginRight: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 5,
                  alignItems: "center",
                }}
                onPress={() =>
                  router.push({
                    pathname: "/(root)/CakeDetails",
                    params: {
                      productId: String(product.id),
                      categoryKey: selectedCategory || "cake",
                    },
                  })
                }
              >
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 10,
                    backgroundColor: "rgba(255,255,255,0.7)",
                    borderRadius: 15,
                    padding: 5,
                  }}
                  onPress={() => handleToggleFavorite(product.cake_code)}
                >
                  <View>
                    <Image
                      source={
                        product.cake_code &&
                        favoriteCodes.includes(product.cake_code)
                          ? icons.favorites // Active heart icon
                          : icons.favourite // Outline heart icon
                      }
                      style={{
                        width: 20,
                        height: 20,
                        tintColor:
                          product.cake_code &&
                          favoriteCodes.includes(product.cake_code)
                            ? "#ff4d6d" // A more vibrant red
                            : "#ccc",   // Gray for inactive
                      }}
                    />
                    {product.cake_code && favoriteCodes.includes(product.cake_code) && (
                      <View
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          backgroundColor: "#ff4d6d",
                          borderRadius: 10,
                          width: 14,
                          height: 14,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>+</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
                <View>
                  <Image
                    source={product.image}
                    style={{
                      width: 130,
                      height: 130,
                      borderRadius: 20,
                      resizeMode: "cover",
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#333",
                    textAlign: "center",
                    marginBottom: 8,
                    fontFamily: "JakartaBold",
                  }}
                  numberOfLines={2}
                >
                  {product.name}
                </Text>
                <View
                  style={{
                    backgroundColor: "#FDAAAA",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 15,
                    minWidth: 60,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: "#ffffff",
                      fontFamily: "JakartaBold",
                    }}
                  >
                    LKR {product.price.toFixed(2)}
                  </Text>
                </View>

              </TouchableOpacity>
            )}
            ListFooterComponent={
              <View className="mb-40 mt-10">
                <TouchableOpacity
                  onPress={() =>
                    flatListRef.current?.scrollToOffset({
                      offset: 0,
                      animated: true,
                    })
                  }
                  style={{
                    alignSelf: "center",
                    backgroundColor: "#fde8e8",
                    borderRadius: 9999,
                    paddingVertical: 5,
                    paddingHorizontal: 24,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <View>
                    <Image
                      source={icons.bottomtoup}
                      style={{ width: 30, height: 30 }}
                      tintColor={"brown"}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Empty state */}
      {!loading && (!cakesData || cakesData.length === 0) && (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600 text-lg">No cakes available</Text>
        </View>
      )}
    </SafeAreaView>
  );
};
export default AllCake;
