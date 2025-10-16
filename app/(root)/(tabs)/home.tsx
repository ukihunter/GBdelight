import GoogleTextInput from "@/components/GoogleTextInput";
import { icons } from "@/constants";
import { useUser } from "@clerk/clerk-expo";
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
import {
  categories,
  productsByCategory,
} from "../../../constants/categoriesData";
const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState<
    keyof typeof productsByCategory | null
  >(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { isLoaded, isSignedIn, user } = useUser();
  const handleDestinationPress = () => {
    console.log("Destination input pressed");
    // Implement navigation or other logic here
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
      <StatusBar hidden />

      <SafeAreaView style={{ flex: 1 }} className="bg-[#fcf1f1]">
        <Image
          source={require("../../../assets/icons/image.png")}
          style={{
            width: "100%",
            height: 220,
            resizeMode: "cover",
            zIndex: -1,
            position: "absolute",
            top: 0,
          }}
        />
        <View className="flex-row justify-between items-center ">
          <Text
            style={{
              color: "#ffffff",
              fontSize: 20,
              paddingLeft: 20,
              marginBottom: 60,
              fontWeight: "bold",
              fontFamily: "JakartaBold",
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
            style={{
              backgroundColor: "#FDAAAA",
              width: 45,
              height: 45,
              borderRadius: 28,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 20,
              marginBottom: 60,
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
          </TouchableOpacity>
        </View>
        <FlatList
          data={[]} // Provide an empty array if you only want to show the header for now
          renderItem={null} // No items to render
          ListHeaderComponent={
            <>
              <GoogleTextInput
                icon={icons.search}
                placeholder="Search for your cravings !!"
                containerStyle="mx-3 bg-[#E7CCCC] mb-2 shadow-md shadow-neutral-300 "
                handlePress={handleDestinationPress}
              />

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
                      >
                        <View
                          style={{
                            backgroundColor: "#FDF2F2",
                            borderRadius: 15,
                            padding: 12,
                            marginBottom: 12,
                            width: "100%",
                            alignItems: "center",
                          }}
                        >
                          <Image
                            source={product.image}
                            style={{
                              width: 70,
                              height: 70,
                              borderRadius: 10,
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
                            ${product.price ? product.price.toFixed(2) : "0.00"}
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
                          <Text style={{ fontSize: 16 }}>🤍</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </>
          }
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
