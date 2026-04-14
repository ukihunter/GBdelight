import { Stack } from "expo-router";
//import * as SplashScreen from "expo-splash-screen";

// Prevent the splash screen from auto-hiding before asset loading is complete.
//SplashScreen.preventAutoHideAsync();

export default function AuthRoutesLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="MyOrders" options={{ headerShown: false }} />
      <Stack.Screen name="OrderDetails" options={{ headerShown: false }} />
      <Stack.Screen name="CakeDetails" options={{ headerShown: false }} />
    </Stack>
  );
}
