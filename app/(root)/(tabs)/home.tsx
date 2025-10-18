import GoogleTextInput from "@/components/GoogleTextInput";
import { icons } from "@/constants";
import { useUser } from "@clerk/clerk-expo";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import CartModal from "../../../components/CartModal";
import { useCart } from "../../../components/CartProvider";
import {
  categories,
  productsByCategory,
} from "../../../constants/categoriesData";
type RootStackParamList = {
  CakeDetails: {
    productId: number;
    categoryKey: keyof typeof productsByCategory;
  };
};

const Home = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const flatListRef = useRef<FlatList>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    keyof typeof productsByCategory | null
  >(
    categories[0]?.key as keyof typeof productsByCategory // Set default to first category
  );
  const scrollY = useRef(new Animated.Value(0)).current;
  const { isLoaded, isSignedIn, user } = useUser();
  const { cart } = useCart();
  const [cartModalVisible, setCartModalVisible] = useState(false);

  const handleDestinationPress = () => {
    console.log("Destination input pressed");
  };
  const width = Dimensions.get("window").width;
  const ads = [
    { id: 1, image: require("../../../assets/add/add1.png") }, // local image
    { id: 2, image: require("../../../assets/add/add2.jpg") }, // remote image
    { id: 3, image: require("../../../assets/add/add3.png") }, // remote image
  ];

  const loading = false;
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
                  onPress={() => setCartModalVisible(true)}
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
                        source={
                          typeof item.image === "string"
                            ? { uri: item.image }
                            : item.image
                        }
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
              </View>

              <Text className="text-l font-JakartaBold mt-2 ml-2 mb-2">
                Category
              </Text>
              <View className="flex-row justify-between px-6">
                {/*category buttons*/}
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    className="rounded-full p-4 shadow-black shadow-lg"
                    style={{ backgroundColor: cat.color, marginBottom: 10 }}
                    activeOpacity={0.7}
                    onPress={() =>
                      setSelectedCategory(
                        cat.key as keyof typeof productsByCategory
                      )
                    }
                  >
                    <Image
                      source={cat.image}
                      style={{ width: 30, height: 30 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Display products of the selected category */}

              {selectedCategory && productsByCategory[selectedCategory] && (
                <View style={{ marginTop: 20 }}>
                  <Text className="text-base font-JakartaBold mb-2 ml-2">
                    All{" "}
                    {categories.find((c) => c.key === selectedCategory)?.label}
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
                          navigation.navigate("CakeDetails", {
                            productId: product.id,
                            categoryKey: selectedCategory,
                          })
                        }
                      >
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
                        <TouchableOpacity
                          style={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            backgroundColor: "#ffffff",
                            borderRadius: 15,
                            width: 30,
                            height: 30,
                            justifyContent: "center",
                            alignItems: "center",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 3,
                          }}
                        >
                          <Image
                            source={icons.heart}
                            style={{
                              width: 16,
                              height: 16,
                              tintColor: "brown",
                            }}
                          />
                        </TouchableOpacity>
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
          visible={cartModalVisible}
          onClose={() => setCartModalVisible(false)}
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
