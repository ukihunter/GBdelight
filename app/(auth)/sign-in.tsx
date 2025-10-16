import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons, images } from "@/constants";
import { Link, useRouter } from "expo-router";

import { useSignIn } from "@clerk/clerk-expo";
import React, { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";

const SignIn = () => {
  const [Form, Setform] = useState({
    email: "",
    password: "",
  });

  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const onsignin = async () => {
    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: Form.email,
        password: Form.password,
      });

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px] ">
          <Image source={images.signupbanner} className="z-0 w-full h-[250]" />
          <Text className="text-3xl text-[#924c1d] font-JakartaBold absolute-bottom-1 mb-10 justify-center  text-center">
            Lets make Delight!!
          </Text>
          <View className="p-1 gap-2 ">
            <InputField
              label="Email"
              icon={icons.email}
              placeholder="Enter Your Email"
              value={Form.email}
              onChangeText={(value) => Setform({ ...Form, email: value })}
            />
            <InputField
              label="Password"
              icon={icons.lock}
              placeholder="Enter Your Password"
              value={Form.password}
              secureTextEntry={true}
              onChangeText={(value) => Setform({ ...Form, password: value })}
            />
          </View>
          <CustomButton
            title="Sign in"
            className="p-3  bg-[#924c1d] text-white"
            onPress={onsignin}
          />
          {/*   <OAuth />
       google auth*/}
          <View className="flex-row text-center justify-center text-lg">
            <Text className="text-gray"> Create an account? </Text>
            <Link href="/(auth)/sign-up">
              <Text className="text-[#924c1d]">Sign up </Text>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
