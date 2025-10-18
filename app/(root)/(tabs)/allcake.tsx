import { icons } from "@/constants";
import { NavigationProp, useNavigation } from "@react-navigation/core";
import React, { useRef, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

const AllCake = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const flatListRef = useRef<FlatList>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    keyof typeof productsByCategory | null
  >(
    categories[0]?.key as keyof typeof productsByCategory // Set default to first category
  );
  return (
    <SafeAreaView className="flex-1">
      <View className=" ml-8 mt-5  text-2xl">
        <Text className="font-JakartaBold text-2xl">All Products</Text>
      </View>
      <View className=" flex justify-between flex-row  mt-5 ml-5 mr-8">
        {categories.map((category) => (
          <TouchableOpacity
            key={category.key}
            onPress={() =>
              setSelectedCategory(
                category.key as keyof typeof productsByCategory
              )
            }
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

      {/* Display products of the selected category */}

      {selectedCategory && productsByCategory[selectedCategory] && (
        <View className="flex-1 mt-5">
          <Text className="text-base font-JakartaBold mb-2 ml-2">
            All {categories.find((c) => c.key === selectedCategory)?.label}
          </Text>

          <FlatList
            ref={flatListRef}
            data={productsByCategory[selectedCategory]}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 80 }}
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
                    LKR {""}
                    {"price" in product && product.price
                      ? product.price.toFixed(2)
                      : "0.00"}
                  </Text>
                </View>
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
    </SafeAreaView>
  );
};
export default AllCake;
