import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { GameProvider } from "@/context/GameContext";
import { COLORS } from "@/constants/colors";

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.bg },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
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
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      PressStart2P_400Regular: 'https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivNm4I81.ttf',
      BarlowCondensed_400Regular: 'https://fonts.gstatic.com/s/barlowcondensed/v12/HTx3L3I-JCGChYJ8VI-L6OO_au7B6xTrF3DWvIMHYrtUxg.ttf',
      BarlowCondensed_700Bold: 'https://fonts.gstatic.com/s/barlowcondensed/v12/HTxxL3I-JCGChYJ8VI-L6OO_au7B4-7z_04gGnGlaQ.ttf',
    })
      .then(() => setFontsLoaded(true))
      .catch((e) => {
        console.log('Font loading error:', e);
        setFontsLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

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
