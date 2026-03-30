import "./global.css";
import React, { useEffect } from "react";
import { Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { useShareIntent } from "expo-share-intent";
import { addVideo } from "./src/services/db";
import { AddVideoProvider, useAddVideo } from "./src/context/AddVideoContext";
import AddVideoBottomSheet from "./src/components/AddVideoBottomSheet";
import { 
  useFonts, 
  Overlock_400Regular, 
  Overlock_700Bold 
} from "@expo-google-fonts/overlock";

const YOUTUBE_REGEX = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

const PASTEL_COLORS = ['#D8B4E2', '#FDEFB2', '#B5E4CA', '#F9C4C4', '#B4D4E7'];

function randomPastel() {
  return PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)];
}

function ShareIntentHandler() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();
  const { notifyVideoAdded } = useAddVideo();

  useEffect(() => {
    if (!hasShareIntent) return;

    const url = shareIntent?.webUrl || shareIntent?.text || '';

    if (!YOUTUBE_REGEX.test(url)) {
      resetShareIntent();
      return;
    }

    (async () => {
      try {
        await addVideo(url, 'Shared Video', randomPastel());
        console.log('✅ Video added via Share Intent');
        notifyVideoAdded(); // Instantly refresh HomeScreen
      } catch (err) {
        console.log('Share Intent Error:', err.message);
      } finally {
        resetShareIntent();
      }
    })();
  }, [hasShareIntent]);

  return null;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Overlock_400Regular,
    Overlock_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AddVideoProvider>
        <NavigationContainer>
          <ShareIntentHandler />
          <AppNavigator />
          <AddVideoBottomSheet />
        </NavigationContainer>
      </AddVideoProvider>
    </SafeAreaProvider>
  );
}
