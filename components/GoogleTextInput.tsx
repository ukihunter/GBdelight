import { GoogleInputProps } from "@/types/type";
import { Image, Text, View } from "react-native";

const GoogleTextInput = ({
  icon,
  initialLocation,
  textInputBackgroundColor,
  containerStyle,
  handlePress,
  placeholder,
}: GoogleInputProps) => (
  <View
    className={`flex flex-row items-center justify-center relative z-50 rounded-full ${containerStyle} p-3`}
  >
    <Image
      source={typeof icon === "string" ? { uri: icon } : icon}
      className="w-6 h-6 p-3 mr-20"
    />
    <Text>{placeholder}</Text>
  </View>
);

export default GoogleTextInput;
