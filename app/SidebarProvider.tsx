import { useClerk, useUser } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";

import { useRouter } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useContext,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const SIDEBAR_WIDTH = 290;
const { height: SCREEN_HEIGHT } = Dimensions.get("screen");

// Types
interface SidebarContextType {
  openSidebar: () => void;
  closeSidebar: () => void;
  isVisible: boolean;
}

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

interface SidebarProviderProps {
  children: ReactNode;
}

// Sidebar Context
const SidebarContext = createContext<SidebarContextType>({
  openSidebar: () => {},
  closeSidebar: () => {},
  isVisible: false,
});

export const useSidebar = () => useContext(SidebarContext);

// Sidebar Component
const Sidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { signOut } = useClerk();
  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SIDEBAR_WIDTH,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible, slideAnim, overlayOpacity]);

  const { user } = useUser();
  if (!visible) return null;
  // Use `useClerk()` to access the `signOut()` function

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to your desired page
      router.replace("/(auth)/sign-in");
      onClose();
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View className=" flex-row justify-end">
        {/* Dark Overlay */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={{ opacity: overlayOpacity }}
            className="absolute top-0 left-0 right-0 bottom-0 bg-black"
          />
        </TouchableWithoutFeedback>

        {/* Sidebar */}
        <Animated.View
          style={[
            {
              width: SIDEBAR_WIDTH,
              height: SCREEN_HEIGHT,
              transform: [{ translateX: slideAnim }],
              elevation: 20,
              shadowColor: "#000",
              shadowOpacity: 0.4,
              shadowOffset: { width: -4, height: 0 },
              shadowRadius: 15,
            },
          ]}
        >
          <LinearGradient
            colors={["#ffffff", "#ffffff", "#ffffff"]}
            className="flex-1"
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <View className="flex-1">
              {/* Header */}
              <View className="flex-row justify-between items-start px-6 pb-5 pt-10">
                <TouchableOpacity
                  onPress={onClose}
                  className="w-7 h-7 rounded-full bg-white/20 justify-center items-center mt-1"
                >
                  <Image
                    source={require("../assets/icons/close.png")}
                    className="w-5 h-5"
                    tintColor={"black"}
                  />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-black font-JakartaBold">
                  Menu
                </Text>
              </View>

              {/* Profile Section */}
              <View className="items-center py-6 px-6 m-2 bg-[#F5BABB] blur-sm rounded-lg">
                <View className=" justify-between items-center mb-3   flex-row">
                  <Image
                    source={{ uri: "https://avatar.iran.liara.run/public/boy" }}
                    className="w-16 h-16 rounded-full mr-10"
                  />
                  <View className="flex-1">
                    <Text
                      style={{
                        color: "black",
                        fontSize: 18,
                        fontWeight: "bold",
                        fontFamily: "JakartaBold",
                      }}
                    >
                      {user?.firstName || user?.username || "Guest User"}
                    </Text>
                    <Text
                      style={{
                        color: "black",
                        fontSize: 8,
                        fontFamily: "JakartaBold",
                      }}
                    >
                      {user?.emailAddresses
                        ? ` ${user.emailAddresses[0].emailAddress}`
                        : ""}
                    </Text>
                  </View>
                </View>
              </View>
              {/* Menu Items */}
              <View className="px-6 py-4 flex-1">
                {/* My Orders */}
                <TouchableOpacity className="flex-row items-center py-4 border-b border-black/10">
                  <Image
                    source={require("../assets/icons/list.png")}
                    className="w-6 h-6 mr-4"
                    tintColor={"black"}
                  />
                  <Text className="text-base text-black font-JakartaBold">
                    My Orders
                  </Text>
                </TouchableOpacity>

                {/* Favorites */}
                <TouchableOpacity className="flex-row items-center py-4 border-b border-black/10">
                  <Image
                    source={require("../assets/icons/heart.png")}
                    className="w-6 h-6 mr-4"
                    tintColor={"black"}
                  />
                  <Text className="text-base text-black font-JakartaBold">
                    Favorites
                  </Text>
                </TouchableOpacity>

                {/* Addresses */}
                <TouchableOpacity className="flex-row items-center py-4 border-b border-black/10">
                  <Image
                    source={require("../assets/icons/pin.png")}
                    className="w-6 h-6 mr-4"
                    tintColor={"black"}
                  />
                  <Text className="text-base text-black font-JakartaBold">
                    My Addresses
                  </Text>
                </TouchableOpacity>

                {/* Notifications */}
                <TouchableOpacity className="flex-row items-center py-4 border-b border-black/10">
                  <Image
                    source={require("../assets/icons/bell.png")}
                    className="w-6 h-6 mr-4"
                    tintColor={"black"}
                  />
                  <Text className="text-base text-black font-JakartaBold">
                    Notifications
                  </Text>
                </TouchableOpacity>

                {/* Settings */}
                <TouchableOpacity className="flex-row items-center py-4 border-b border-black/10">
                  <Image
                    source={require("../assets/icons/dollar.png")}
                    className="w-6 h-6 mr-4"
                    tintColor={"black"}
                  />
                  <Text className="text-base text-black font-JakartaBold">
                    Settings
                  </Text>
                </TouchableOpacity>

                {/* Help & Support */}
                <TouchableOpacity className="flex-row items-center py-4 border-b border-black/10">
                  <Image
                    source={require("../assets/icons/info.png")}
                    className="w-6 h-6 mr-4"
                    tintColor={"black"}
                  />
                  <Text className="text-base text-black font-JakartaBold">
                    Help & Support
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Logout Button */}
              <View className="px-6 pb-4">
                <TouchableOpacity
                  className="w-full flex-row justify-center items-center p-4 bg-red-100 rounded-lg"
                  onPress={handleSignOut}
                >
                  <Image
                    source={require("../assets/icons/arrow-up.png")}
                    className="w-5 h-5 mr-2"
                    tintColor={"#EF4444"}
                  />
                  <Text className="text-base text-red-500 font-JakartaBold">
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Footer */}
              <View className="px-6 pb-10 pt-2 items-center">
                <Text className="text-xs text-black/60 font-JakartaBold">
                  GBdelight v1.0
                </Text>
                <Text className="text-xs text-black/50 mt-1 font-JakartaBold">
                  Made with 💕 BY gayu
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Sidebar Provider
export const SidebarProvider: React.FC<SidebarProviderProps> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);

  const openSidebar = () => setVisible(true);
  const closeSidebar = () => setVisible(false);

  return (
    <SidebarContext.Provider
      value={{ openSidebar, closeSidebar, isVisible: visible }}
    >
      {children}
      <Sidebar visible={visible} onClose={closeSidebar} />
    </SidebarContext.Provider>
  );
};

// Default export
export default SidebarProvider;
