import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, StatusBar, Image } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withDelay,
  withSequence,
  runOnJS 
} from 'react-native-reanimated';

import { colors } from '../utils/colors';
import { mockLeaderboard } from '../data/mockData';
import Leaderboard from '../components/Leaderboard';
import StreakCalendar from '../components/StreakCalendar';

const mascotImage = require('../../assets/day_completed.png');

export default function VideoDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const video = route.params?.video || {
    title: 'Detail Screen',
    themeColor: colors.primary
  };

  const [buttonText, setButtonText] = useState('Complete Day 7');

  // Reanimated Shared Values
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(150);
  const translateY = useSharedValue(200);
  const rotate = useSharedValue(20);

  const mascotStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
      ]
    };
  });

  const handleFinish = async () => {
    // 1. Titreşim (Haptics)
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.log('Haptics failed (simulator limitation):', error);
    }
    
    // 2. Çapraz yörünge: sağ alttan yaylanarak giriş, 2.5sn, çıkış
    opacity.value = withSequence(
      withSpring(1),
      withDelay(2500, withTiming(0, { duration: 500 }))
    );

    translateX.value = withSequence(
      withSpring(-20),
      withDelay(2500, withTiming(150, { duration: 500 }))
    );

    translateY.value = withSequence(
      withSpring(-20),
      withDelay(2500, withTiming(200, { duration: 500 }))
    );

    rotate.value = withSequence(
      withSpring(-5),
      withDelay(2500, withTiming(20, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(setButtonText)('Day 7 Completed! 🎉');
        }
      }))
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header Alanı */}
      <View className="flex-row items-center px-6 py-4 mt-2 mb-2">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm shadow-gray-200 mr-4"
        >
          <ChevronLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-extrabold flex-1" style={{ color: colors.text }} numberOfLines={1}>
          {video.title}
        </Text>
      </View>
      
      {/* İçerik */}
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 220 }} 
        showsVerticalScrollIndicator={false}
      >
        <Leaderboard data={mockLeaderboard} />
        <StreakCalendar themeColor={video.themeColor} />
      </ScrollView>

      {/* Maskot Animasyon Alanı */}
      <Animated.View 
        style={[
          {
            position: 'absolute',
            bottom: 80,
            right: -20,
            zIndex: 10,
          },
          mascotStyle
        ]}
        pointerEvents="none"
      >
        <Image 
          source={mascotImage} 
          style={{ width: 250, height: 250, resizeMode: 'contain' }} 
        />
      </Animated.View>

      {/* Sticky Bottom Butonu - Alt tab bar'dan biraz daha yüksekte */}
      <View className="absolute bottom-28 left-6 right-6 pb-2 bg-transparent" pointerEvents="box-none">
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={handleFinish}
          className="w-full h-16 rounded-3xl justify-center items-center shadow-md shadow-gray-400"
          style={{ backgroundColor: video.themeColor }}
        >
          <Text className="text-white text-lg font-black tracking-wider">
            {buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
