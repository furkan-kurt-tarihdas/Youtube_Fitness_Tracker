import "./global.css";
import React, { useEffect } from "react";
import { Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { useShareIntent } from "expo-share-intent";
import { addVideo, fetchVideos } from "./src/services/db";
import { AddVideoProvider, useAddVideo } from "./src/context/AddVideoContext";
import AddVideoBottomSheet from "./src/components/AddVideoBottomSheet";
import { 
  useFonts, 
  Overlock_400Regular, 
  Overlock_700Bold 
} from "@expo-google-fonts/overlock";
import { ToastProvider } from "./src/context/ToastContext";
import { PASTEL_COLORS } from "./src/constants/theme";

const YOUTUBE_REGEX = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;


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
        const existingVideos = await fetchVideos().catch(() => []);
        const usedColors = existingVideos.map(v => v.theme_color?.toLowerCase());
        
        let chosenColor = PASTEL_COLORS.find(c => !usedColors.includes(c.toLowerCase()));
        
        if (!chosenColor) {
           // Generate a random pastel if standard pastels are exhausted
           let r, g, b, newColor;
           do {
             r = Math.floor((Math.random() * 256 + 255) / 2);
             g = Math.floor((Math.random() * 256 + 255) / 2);
             b = Math.floor((Math.random() * 256 + 255) / 2);
             newColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
           } while (usedColors.includes(newColor.toLowerCase()));
           chosenColor = newColor;
        }

        await addVideo(url, 'Shared Video', chosenColor);
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
      <ToastProvider>
        <AddVideoProvider>
          <NavigationContainer>
            <ShareIntentHandler />
            <AppNavigator />
            <AddVideoBottomSheet />
          </NavigationContainer>
        </AddVideoProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
