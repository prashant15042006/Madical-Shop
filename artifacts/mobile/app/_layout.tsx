import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/contexts/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: "#f6fbf8" },
        headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#f6fbf8" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="customer/dashboard"
        options={{ title: "Medicines", headerBackTitle: "" }}
      />
      <Stack.Screen
        name="customer/buy"
        options={{ title: "Buy Medicine", headerBackTitle: "" }}
      />
      <Stack.Screen
        name="customer/payment"
        options={{ title: "Payment", headerBackTitle: "" }}
      />
      <Stack.Screen
        name="customer/orders"
        options={{ title: "My Orders", headerBackTitle: "" }}
      />
      <Stack.Screen
        name="customer/order/[id]"
        options={{ title: "Order Details", headerBackTitle: "" }}
      />
      <Stack.Screen
        name="shop/setup"
        options={{ title: "Shop Setup", headerBackTitle: "" }}
      />
      <Stack.Screen
        name="shop/dashboard"
        options={{ title: "Shop Dashboard", headerBackTitle: "" }}
      />
      <Stack.Screen
        name="shop/medicines"
        options={{ title: "Inventory", headerBackTitle: "" }}
      />
      <Stack.Screen
        name="shop/order/[id]"
        options={{ title: "Order", headerBackTitle: "" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <GestureHandlerRootView>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </AppProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
