import CustomButton from "@/components/CustomButton";
import { onboarding, onboarding as onboardingData } from "@/constants";
import { router } from "expo-router";
import React, { useRef } from "react";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

const Welcome = () => {
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const isLastSlide = activeIndex === onboarding.length - 1;
  return (
    <SafeAreaView className="flex h-full items-center justify-between bg-[#f8e5e5]">
      <ImageBackground
        source={require("@/assets/images/image.png")}
        className="flex-1 w-full resizeModeCover  "
      >
        <TouchableOpacity
          onPress={() => {
            router.replace("/(auth)/sign-up");
          }}
          className="w-full flex justify-end items-end p-5"
        >
          <Text className="text-white text-md font-JakartaBold bg-[#ac5b3b] px-4 py-2 rounded-br-xl rounded-tl-2xl">
            Skip
          </Text>
        </TouchableOpacity>
        <Swiper
          ref={swiperRef}
          loop={false}
          dot={
            <View className="w-[32px] h-[4px] mx-1 bg-[#ffffff] rounded-full"></View>
          }
          activeDot={
            <View
              className="w-[32px] h-[4px] mx-1 
          bg-[#ac5b3b] rounded-full"
            ></View>
          }
          onIndexChanged={(index) => setActiveIndex(index)}
        >
          {onboardingData.map((item) => (
            <View
              key={item.id}
              className="flex items-center justify-center p-4"
            >
              <Image
                source={item.image}
                className="w-full h-[340px] mb-5"
              ></Image>

              <View className="flex flex-row items-center justify-center">
                <Text className="text-black text-3xl font-bold mx-10 text-center">
                  {item.title}
                </Text>
              </View>
              <View>
                <Text className="text-sm font-JakartaSemiBold text-center text-[#838181] mx-10 mt-3 ">
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </Swiper>
        <CustomButton
          title={isLastSlide ? "Let's GO !" : "Next"}
          onPress={() =>
            isLastSlide
              ? router.replace("/(auth)/sign-up")
              : swiperRef.current?.scrollBy(1)
          }
          className="w-11/12  mt-10 mb-6 bg-[#ac5b3b] py-4 rounded-3xl"
        />
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Welcome;
