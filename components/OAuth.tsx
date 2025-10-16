import { icons } from "@/constants";
import { useOAuth } from "@clerk/clerk-expo";
import React from "react";
import { Image, Text, View } from "react-native";
import CustomButton from "./CustomButton";

import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();
const OAuth = () => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleGoogleSignIn = async () => {
    try {
      await startOAuthFlow();
      // Clerk will handle the session and redirect automatically
    } catch (err) {
      // Handle error (show message to user)
      console.error("Google sign-in error:", err);
    }
  };
  return (
    <View>
      <View className="flex flex-row justify-center items-center  gap-x-2">
        <Text className="text-gray-400"> - or -</Text>
      </View>

      <CustomButton
        title="Log in with google"
        className="bg-orange-400 shadow-orange-400 "
        IconLeft={() => (
          <Image
            source={icons.google}
            resizeMode="contain"
            className="w-6 h-6 mr-4"
          />
        )}
        onPress={handleGoogleSignIn}
      />
    </View>
  );
};

export default OAuth;
