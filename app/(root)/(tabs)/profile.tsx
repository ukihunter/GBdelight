import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

const Profile = () => {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  const handleMyOrders = () => {
    router.push("/(root)/MyOrders");
  };

  const handleSettings = () => {
    // Handle Settings navigation
    console.log("Navigate to Settings");
  };

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <Text className="text-base text-gray-600">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      showsVerticalScrollIndicator={false}
    >
      {/* User Details Card */}
      <View className="px-4 pt-10 pb-0">
        <View className="bg-white rounded-2xl p-5 shadow-sm shadow-black/10">
          {/* Profile Header */}
          <View className="flex-row items-center mb-5">
            <Image
              source={{ uri: "https://api.dicebear.com/9.x/open-peeps/png" }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                marginRight: 16,
              }}
            />
            <View className="flex-1">
              <Text className="text-lg font-JakartaBold color-black mb-1">
                {user?.firstName || user?.username || "Guest User"}
              </Text>
              <Text className="text-xs font-JakartaMedium text-gray-600 mb-1">
                {user?.emailAddresses
                  ? user.emailAddresses[0].emailAddress
                  : ""}
              </Text>
              <Text className="text-xs font-JakartaMedium text-gray-400">
                {user?.phoneNumbers && user.phoneNumbers[0]
                  ? user.phoneNumbers[0].phoneNumber
                  : "No phone"}
              </Text>
            </View>
          </View>

          {/* Stats Container */}
          <View className="flex-row justify-around pt-5 border-t border-gray-200">
            <View className="items-center flex-1">
              <Text className="text-base font-JakartaBold text-red-400">
                12
              </Text>
              <Text className="text-xs text-gray-600 mt-1 font-JakartaMedium">
                Orders
              </Text>
            </View>
            <View className="w-0.5 bg-gray-200" />
            <View className="items-center flex-1">
              <Text className="text-base font-JakartaBold text-red-400">5</Text>
              <Text className="text-xs text-gray-600 mt-1 font-JakartaMedium">
                Favorites
              </Text>
            </View>
            <View className="w-0.5 bg-gray-200" />
            <View className="items-center flex-1">
              <Text className="text-base font-JakartaBold text-red-400">3</Text>
              <Text className="text-xs text-gray-600 mt-1 font-JakartaMedium">
                Addresses
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Menu List */}
      <View className="px-4 pb-5 pt-4">
        {/* My Orders */}
        <TouchableOpacity
          className="flex-row items-center justify-between bg-white py-4 px-4 mb-3 rounded-xl shadow-sm shadow-black/8"
          onPress={handleMyOrders}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center flex-1">
            <Image
              source={require("../../../assets/icons/list.png")}
              className="w-6 h-6 mr-3"
              tintColor="#FF6B6B"
            />
            <View className="flex-1">
              <Text className="text-base font-JakartaBold text-black mb-0.5">
                My Orders
              </Text>
              <Text className="text-xs text-gray-400 font-JakartaMedium">
                View your order history
              </Text>
            </View>
          </View>
          <Image
            source={require("../../../assets/icons/arrow-up.png")}
            className="w-4 h-4"
            style={{ tintColor: "#FF6B6B", transform: [{ rotate: "45deg" }] }}
          />
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity
          className="flex-row items-center justify-between bg-white py-4 px-4 rounded-xl shadow-sm shadow-black/8"
          onPress={handleSettings}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center flex-1">
            <Image
              source={require("../../../assets/icons/dollar.png")}
              className="w-6 h-6 mr-3"
              tintColor="#FF6B6B"
            />
            <View className="flex-1">
              <Text className="text-base font-JakartaBold text-black mb-0.5">
                Settings
              </Text>
              <Text className="text-xs text-gray-400 font-JakartaMedium">
                Manage your preferences
              </Text>
            </View>
          </View>
          <Image
            source={require("../../../assets/icons/arrow-up.png")}
            className="w-4 h-4"
            style={{ tintColor: "#FF6B6B", transform: [{ rotate: "45deg" }] }}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Profile;
