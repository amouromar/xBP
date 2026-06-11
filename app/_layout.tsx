import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

import { AppProviders } from "@/providers/AppProviders";
import { useAppTheme } from "@/providers/ThemeProvider";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { initializeDatabase } from "@/db";
import { SplashScreen as AppSplash } from "@/components/SplashScreen";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque: require(
      "../assets/font/BricolageGrotesque-VariableFont_opsz,wdth,wght.ttf"
    ),
  });

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      if (fontError) throw fontError;

      if (fontsLoaded) {
        await initializeDatabase();
        await SplashScreen.hideAsync();
        setAppReady(true);
      }
    }

    void prepare();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded || !appReady) {
    return null;
  }

  return (
    <KeyboardProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppProviders>
          <SplashGate />
        </AppProviders>
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
}

/**
 * Splash is now safely inside ThemeProvider context
 */
function SplashGate() {
  const { isDark, colors } = useAppTheme();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    return () => clearTimeout(t);
  }, []);

  if (showSplash) {
    return <AppSplash backgroundColor={colors.background} />;
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}