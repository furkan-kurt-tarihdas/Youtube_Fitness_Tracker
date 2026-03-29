import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, StatusBar, Image, ActivityIndicator, Alert } from 'react-native';
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
import { 
  fetchCompletionCountForVideo, 
  fetchCompletionsForVideo, 
  recordCompletion 
} from '../services/db';
import Leaderboard from '../components/Leaderboard';
import StreakCalendar from '../components/StreakCalendar';

const mascotImage = require('../../assets/day_completed.png');

export default function VideoDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const video = route.params?.video || {
    title: 'Detail Screen',
    theme_color: colors.primary
  };

  const activeColor = video.theme_color || video.themeColor || colors.primary;

  const [count, setCount] = useState(0);
  const [completedDates, setCompletedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buttonText, setButtonText] = useState('Loading...');

  // Effect to load initial counts/dates
  React.useEffect(() => {
    async function loadStats() {
      try {
        const [c, dates] = await Promise.all([
          fetchCompletionCountForVideo(video.id),
          fetchCompletionsForVideo(video.id)
        ]);
        setCount(c);
        setCompletedDates(dates);
        setButtonText(`Complete Day ${c + 1}`);
      } catch (err) {
        console.error('Stats load failed:', err);
        setButtonText('Ready?');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [video.id]);

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
    // 1. Record in DB
    try {
      await recordCompletion(video.id);
      // Update local state to reflect new completion
      const newCount = count + 1;
      setCount(newCount);
      // We don't necessarily need to refetch all dates if it's just today 
      // but let's keep it simple for now or just add today locally.
      const today = new Date().toISOString().split('T')[0];
      setCompletedDates(ex => [...ex, today]);
    } catch (error) {
      if (error.message.includes('zaten tamamladınız')) {
        Alert.alert('Tamamlandı', 'Bu videoyu bugün zaten puanladınız! Yarın tekrar bekleriz. 🔥');
        return;
      }
      Alert.alert('Hata', error.message);
      return;
    }

    // 2. Titreşim (Haptics)
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.log('Haptics failed:', error);
    }
    
    // 3. Animasyon Başlat
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
          runOnJS(setButtonText)(`Day ${count + 1} Completed! 🎉`);
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
        <StreakCalendar 
          themeColor={activeColor} 
          completedDates={completedDates}
        />
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
          disabled={loading}
          className="w-full h-16 rounded-3xl justify-center items-center shadow-md shadow-gray-400"
          style={{ backgroundColor: activeColor, opacity: loading ? 0.6 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-black tracking-wider">
              {buttonText}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
