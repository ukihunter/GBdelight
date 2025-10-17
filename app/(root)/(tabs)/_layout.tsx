import { icons } from "@/constants";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import React from "react";
import {
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  View,
} from "react-native";
import { useSidebar } from "../../SidebarProvider";
const TabIcon = ({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) => (
  <View
    className={`flex flex-row  items-center rounded-full jus ${
      focused ? "bg-general-300" : ""
    }`}
  >
    <View
      className={`rounded-full w-12 h-12 items-center justify-center ${
        focused ? "bg-[#ff728a]" : ""
      }`}
    >
      <Image
        source={source}
        tintColor="white"
        resizeMode="contain"
        className="w-7 h-7"
      />
    </View>
  </View>
);

const ProfileTabIcon = ({
  source,
  focused,
  onPress,
}: {
  source: ImageSourcePropType;
  focused: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress}>
    <View
      className={`flex flex-row  items-center rounded-full jus ${
        focused ? "bg-general-300" : ""
      }`}
    >
      <View
        className={`rounded-full w-12 h-12 items-center justify-center ${
          focused ? "bg-[#ff728a]" : ""
        }`}
      >
        <Image
          source={source}
          tintColor="white"
          resizeMode="contain"
          className="w-7 h-7"
        />
      </View>
    </View>
  </TouchableOpacity>
);

const Layout = () => {
  const { openSidebar } = useSidebar();

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderRadius: 50,
          paddingBottom: 30,
          overflow: "hidden",
          marginHorizontal: 20,
          marginBottom: 20,
          height: 65,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          position: "absolute",
        },
        tabBarBackground: () => (
          <View
            style={{
              flex: 1,
              borderRadius: 50,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={["#ff748c", "#ff8da1", "#ffc0cb"]}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} source={icons.home} />
          ),
        }}
      />
      <Tabs.Screen
        name="allcake"
        options={{
          title: "allcake",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} source={icons.cake} />
          ),
        }}
      />

      <Tabs.Screen
        name="aigen"
        options={{
          title: "AI Generator",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} source={icons.chat} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <ProfileTabIcon
              focused={focused}
              source={icons.profile}
              onPress={openSidebar}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default action
            e.preventDefault();
            // Open sidebar instead
            openSidebar();
          },
        }}
      />
    </Tabs>
  );
};

export default Layout;
