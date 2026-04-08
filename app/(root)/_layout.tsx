import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SidebarProvider } from "../SidebarProvider";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function AuthRoutesLayout() {
  return (
    <SidebarProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SidebarProvider>
  );
}
