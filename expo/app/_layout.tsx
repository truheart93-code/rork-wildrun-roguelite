import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { GameProvider } from "@/context/GameContext";
import { COLORS } from "@/constants/colors";
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { BarlowCondensed_400Regular, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg }, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="intro" />
      <Stack.Screen name="starter-camp" />
      <Stack.Screen name="world-map" />
      <Stack.Screen name="dungeon-map" />
      <Stack.Screen name="battle" />
      <Stack.Screen name="rest" />
      <Stack.Screen name="treasure" />
      <Stack.Screen name="game-over" />
      <Stack.Screen name="field-journal" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="field-store" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PressStart2P_400Regular,
    BarlowCondensed_400Regular,
    BarlowCondensed_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GameProvider>
          <StatusBar style="light" />
          <RootLayoutNav />
        </GameProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}