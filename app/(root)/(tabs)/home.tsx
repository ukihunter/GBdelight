import GoogleTextInput from "@/components/GoogleTextInput";
import { icons } from "@/constants";
import { fetchAPI, useFetch } from "@/lib/fetch";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { showMessage } from "react-native-flash-message";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import CartModal from "../../../components/CartModal";
import { useCart } from "../../../components/CartProvider";
import ConfirmDetailsModal from "../../../components/ConfirmDetailsModal";
import PaymentDetailsModal from "../../../components/PaymentDetailsModal";
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
  image: any;
  price: number;
  description?: string;
  cake_code?: string;
  stock_quantity?: number;
  is_available?: boolean;
  image_url?: string;
};

const Home = () => {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categories[0]?.key || null,
  );
  const { isLoaded, isSignedIn, user } = useUser();
  const { cart, clearCart } = useCart();
  const [cartVisible, setCartVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch cakes from database
  const {
    data: cakesData,
    loading,
    error,
    refetch,
  } = useFetch<DatabaseCake[]>("/cakes");

  // Fetch advertisements from database
  type Advertisement = {
    id: number;
    cake_code: string;
    title: string;
    image_path: string;
    is_active: boolean;
    created_at: string;
  };

  const { data: adsData, loading: adsLoading } =
    useFetch<Advertisement[]>("/advertisements");

  // Add fetch for user favorites
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

  // Sync user with database to ensure they exist for favorites/orders
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
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
  }, [isLoaded, isSignedIn, user]);

  // Handle pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchFavorites && refetchFavorites()]);
    setRefreshing(false);
  };

  const handleToggleFavorite = async (cakeCode: string | undefined) => {
    if (!cakeCode) return;

    if (!isSignedIn) {
      showMessage({
        message: "Please sign in to save favorites",
        type: "warning",
      });
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
      setFavoriteCodes((prev) =>
        result.action === "added"
          ? [...(prev || []), cakeCode]
          : (prev || []).filter((c) => c !== cakeCode),
      );

      showMessage({
        message: result.message,
        type: "success",
        icon: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error(error);
      showMessage({
        message: "Failed to update favorite",
        type: "danger",
      });
    }
  };

  // Map database category to UI category keys
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

  // Transform database data to product format and group by category
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

  // Keep selected category valid when available categories change.
  useEffect(() => {
    if (uniqueCategories.length > 0) {
      if (
        !selectedCategory ||
        !uniqueCategories.some((c) => c.key === selectedCategory)
      ) {
        setSelectedCategory(uniqueCategories[0].key);
      }
    }
  }, [uniqueCategories, selectedCategory]);

  // Calculate cart total
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const [paymentVisible, setPaymentVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [userDetails, setUserDetails] = useState<{
    name: string;
    address: string;
    postalCode: string;
    nearestTown: string;
    mobile: string;
  } | null>(null);

  const handleDestinationPress = () => {
    console.log("Destination input pressed");
  };

  // Save order to database after payment
  const saveOrder = async (paymentIntentId: string) => {
    try {
      const response = await fetch("/(api)/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          customer_name: userDetails?.name,
          customer_email:
            user?.emailAddresses?.[0]?.emailAddress ?? "guest@example.com",
          customer_phone: userDetails?.mobile,
          delivery_address: {
            address: userDetails?.address,
            postalCode: userDetails?.postalCode,
            nearestTown: userDetails?.nearestTown,
          },
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          total_amount: cartTotal,
          order_type: "normal",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save order: ${response.status}`);
      }

      const result = await response.json();
      console.log("Order saved successfully:", result);
      return result;
    } catch (error) {
      console.error("Error saving order:", error);
      throw error;
    }
  };

  const width = Dimensions.get("window").width;

  // Use advertisements from database, fallback to empty array while loading
  const ads =
    adsData && adsData.length > 0
      ? adsData.map((ad) => ({
          id: ad.id,
          image: ad.image_path,
          title: ad.title,
        }))
      : [];

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="#f5718a"
        barStyle="dark-content"
      />

      <SafeAreaView style={{ flex: 1 }} className="bg-[#fcf1f1]">
        <FlatList
          ref={flatListRef}
          data={[]}
          renderItem={null}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#ff728a"]}
              tintColor="#ff728a"
            />
          }
          ListHeaderComponent={
            <>
              <Image
                source={require("../../../assets/icons/image.png")}
                style={{
                  width: "100%",
                  height: "12%",
                  resizeMode: "cover",
                  zIndex: -1,
                  position: "absolute",
                  top: 0,
                }}
              />
              <View>
                <Text className="text-white font-JakartaBold mr-10  text-xl px-6">
                  GB Delight
                </Text>
              </View>
              <View className="flex-row justify-between items-center ">
                <Text
                  style={{
                    color: "#ffffff",
                    fontSize: 20,
                    paddingLeft: 20,
                    marginBottom: 60,
                    fontWeight: "bold",
                  }}
                >
                  Hello{" "}
                  {isLoaded && isSignedIn && user?.username ? (
                    <Text
                      style={{
                        color: "#ffffff",
                        fontSize: 27,
                        fontFamily: "JakartaBold",
                      }}
                    >
                      {user.username}
                    </Text>
                  ) : (
                    <Text style={{ color: "#888" }}>Guest</Text>
                  )}{" "}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setCartVisible(true)}
                  style={{
                    backgroundColor: "#FDAAAA",
                    width: 45,
                    height: 45,
                    borderRadius: 28,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 20,
                    marginBottom: 60,
                    position: "relative",
                  }}
                >
                  <Image
                    source={icons.cart}
                    style={{
                      width: 26,
                      height: 26,
                      tintColor: "#ffffffff",
                      resizeMode: "contain",
                    }}
                  />
                  {cart.length > 0 && (
                    <View
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -5,
                        backgroundColor: "#ff4444",
                        borderRadius: 10,
                        minWidth: 20,
                        height: 20,
                        justifyContent: "center",
                        alignItems: "center",
                        borderWidth: 2,
                        borderColor: "#fff",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          fontWeight: "bold",
                        }}
                      >
                        {cart.length}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View>
                <GoogleTextInput
                  icon={icons.search}
                  placeholder="Search for your cravings !!"
                  containerStyle="mx-3 bg-[#E7CCCC] mb-2 shadow-md shadow-neutral-300 "
                  handlePress={handleDestinationPress}
                />
              </View>

              <View style={{ paddingHorizontal: 20 }}>
                {adsLoading && ads.length === 0 ? (
                  <View
                    style={{
                      backgroundColor: "#eee",
                      marginVertical: 50,
                      height: 180,
                      width: width - 60,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 10,
                    }}
                  >
                    <ActivityIndicator size="large" color="#ff728a" />
                  </View>
                ) : ads.length > 0 ? (
                  <Carousel
                    loop
                    width={width}
                    height={200}
                    autoPlay={true}
                    autoPlayInterval={3000}
                    data={ads}
                    scrollAnimationDuration={1000}
                    renderItem={({ item }) => (
                      <View
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#eee",
                          marginVertical: 50,
                          height: 90,
                          width: width - 60,
                          marginRight: 30,
                        }}
                      >
                        <Image
                          source={{
                            uri: item.image,
                          }}
                          style={{
                            width: width - 40,
                            height: 180,
                            resizeMode: "cover",
                            borderRadius: 10,
                          }}
                        />
                      </View>
                    )}
                  />
                ) : null}
              </View>

              <Text className="text-l font-JakartaBold mt-2 ml-2 mb-2">
                Category
              </Text>
              <View className="flex-row justify-between px-6">
                {/*category buttons*/}
                {uniqueCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    className="rounded-full p-4 shadow-black shadow-lg"
                    style={{ backgroundColor: cat.color, marginBottom: 10 }}
                    activeOpacity={0.7}
                    onPress={() => setSelectedCategory(cat.key)}
                  >
                    <Image
                      source={cat.image}
                      style={{ width: 30, height: 30 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Loading state */}
              {loading && (
                <View className="flex-1 justify-center items-center mt-20">
                  <ActivityIndicator size="large" color="#ff728a" />
                  <Text className="mt-3 text-gray-600">Loading cakes...</Text>
                </View>
              )}

              {/* Error state */}
              {error && (
                <View className="ml-8 mr-8 mt-4 p-3 bg-red-100 rounded">
                  <Text className="text-red-600 text-sm">
                    Error loading cakes: {error}
                  </Text>
                </View>
              )}

              {/* Display products of the selected category */}
              {!loading &&
                selectedCategory &&
                productsByCategory[selectedCategory] && (
                  <View style={{ marginTop: 20 }}>
                    <Text className="text-base font-JakartaBold mb-2 ml-2">
                      All{" "}
                      {
                        uniqueCategories.find((c) => c.key === selectedCategory)
                          ?.label
                      }
                    </Text>
                    <View className="flex-row flex-wrap justify-between px-4">
                      {productsByCategory[selectedCategory].map((product) => (
                        <TouchableOpacity
                          key={product.id}
                          activeOpacity={0.8}
                          style={{
                            width: "47%",
                            backgroundColor: "#ffffff",
                            borderRadius: 20,
                            padding: 16,
                            marginBottom: 16,
                            shadowColor: "#000",
                            shadowOffset: {
                              width: 0,
                              height: 4,
                            },
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
                            onPress={() =>
                              handleToggleFavorite(product.cake_code)
                            }
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
                                      ? "#ff4d6d"
                                      : "#ccc",
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
                              LKR{" "}
                              {"price" in product && product.price
                                ? product.price.toFixed(2)
                                : "0.00"}
                            </Text>
                          </View>

                          {/* Add a small heart icon for favorites */}

                        </TouchableOpacity>
                      ))}
                    </View>
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
                  </View>
                )}
            </>
          }
        />

        {/* Cart Modal */}
        <CartModal
          visible={cartVisible}
          onClose={() => setCartVisible(false)}
          onCheckout={() => {
            setCartVisible(false);
            setPaymentVisible(true);
          }}
        />
        <PaymentDetailsModal
          visible={paymentVisible}
          onClose={() => setPaymentVisible(false)}
          onSubmit={(details) => {
            // Save details and show confirmation modal
            setUserDetails(details);
            setPaymentVisible(false);
            setConfirmVisible(true);
          }}
        />

        {/* Confirmation Modal */}
        {userDetails && (
          <ConfirmDetailsModal
            visible={confirmVisible}
            details={userDetails}
            totalAmount={cartTotal}
            onConfirm={() => {
              // Handle final order confirmation here (for free orders)
              console.log("Order confirmed with details:", userDetails);

              // Clear cart and close all modals
              clearCart();
              setConfirmVisible(false);
              setPaymentVisible(false);
              setCartVisible(false);
              setUserDetails(null);

              // Show success message for free order
              showMessage({
                message: "Order Confirmed! ",
                description: "Your order has been placed successfully!",
                type: "success",
                backgroundColor: "#4CAF50",
                color: "#fff",
                icon: "success",
                duration: 4000,
                position: "top",
              });
            }}
            onEdit={() => {
              // Go back to edit details
              setConfirmVisible(false);
              setPaymentVisible(true);
            }}
            onPaymentSuccess={(paymentIntentId) => {
              // Handle successful payment
              console.log("Payment successful:", paymentIntentId);

              // Save order to database
              saveOrder(paymentIntentId)
                .then(() => {
                  // Clear cart and close all modals
                  clearCart();
                  setConfirmVisible(false);
                  setPaymentVisible(false);
                  setCartVisible(false);
                  setUserDetails(null);

                  // Show success message
                  showMessage({
                    message: "Payment Successful! ",
                    description:
                      "Your order has been placed successfully. Thank you for your purchase!",
                    type: "success",
                    backgroundColor: "#4CAF50",
                    color: "#fff",
                    icon: "success",
                    duration: 4000,
                    position: "top",
                  });
                })
                .catch((error) => {
                  console.error("Order save failed:", error);
                  showMessage({
                    message: "Order Failed",
                    description:
                      "Payment succeeded but order was not saved. Please contact support.",
                    type: "danger",
                    backgroundColor: "#ff6b6b",
                    color: "#fff",
                    icon: "danger",
                    duration: 4000,
                    position: "top",
                  });
                });
            }}
          />
        )}

        {/* Cart Modal */}
        <CartModal
          visible={cartVisible}
          onClose={() => setCartVisible(false)}
          onCheckout={() => {
            setCartVisible(false);
            setPaymentVisible(true);
          }}
        />
      </SafeAreaView>
    </>
  );
};

export default Home;

// const { signOut } = useClerk();

//  const handleSignOut = async () => {
//    try {
//     await signOut();
// Redirect to your desired page
// router.push("/(auth)/sign-in");
//    } catch (err) {
// See https://clerk.com/docs/custom-flows/error-handling
// for more info on error handling
//    console.error(JSON.stringify(err, null, 2));
///    }
// };

// Example user object; replace with actual user data from your auth provider
