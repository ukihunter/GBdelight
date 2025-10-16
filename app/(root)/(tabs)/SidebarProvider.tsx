import { useUser } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
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
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View className="flex-1 flex-row justify-end">
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
                    source={require("../../../assets/icons/close.png")}
                    className="w-5 h-5"
                    tintColor={"black"}
                  />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-black font-JakartaBold">
                  Menu
                </Text>
              </View>

              {/* Profile Section */}
              <View className="items-center py-6 px-6 m-2 bg-slate-200 blur-sm rounded-lg">
                <View className=" justify-between items-center mb-3   flex-row">
                  <Image
                    source={require("../../../assets/icons/profile.png")}
                    className="w-16 h-16 rounded-full mr-10"
                  />
                  <View className="flex-1">
                    <Text
                      style={{
                        color: "black",
                        fontSize: 18,
                        fontFamily: "JakartaBold",
                      }}
                    >
                      {user?.firstName || user?.username || "Guest User"}
                    </Text>
                    <Text
                      style={{
                        color: "black",
                        fontSize: 8,
                        fontFamily: "JakartaRegular",
                      }}
                    >
                      {user?.emailAddresses
                        ? ` ${user.emailAddresses[0].emailAddress}`
                        : ""}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="px-6 pb-4 pt-2 items-center">
                <View>
                  <TouchableOpacity className="w-full flex-row justify-center items-center p-4">
                    <Image
                      source={require("../../../assets/icons/dollar.png")}
                      className="w-5 h-5"
                      tintColor={"black"}
                    />
                    <Text className="text-sm text-black/60">Settings</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity className="w-full flex-row justify-center items-center p-3 bg-red-100 rounded-lg">
                  <Image
                    source={require("../../../assets/icons/arrow-up.png")}
                    className="w-5 h-5"
                    tintColor={"black"}
                  />
                  <Text className="text-sm text-black/60">Logout</Text>
                </TouchableOpacity>
              </View>
              {/* Footer */}
              <View className="px-6 pb-10 pt-5 items-center">
                <Text className="text-xs text-black/60">GBdelight v1.0</Text>
                <Text className="text-xs text-black/50 mt-1">
                  Made with 💕 for cake lovers
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
