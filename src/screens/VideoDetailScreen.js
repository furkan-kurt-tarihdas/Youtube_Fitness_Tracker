import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image, ActivityIndicator, SafeAreaView, ImageBackground } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
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
import { 
  fetchCompletionCountForVideo, 
  recordCompletion,
  getVideoLeaderboard,
} from '../services/db';
import Leaderboard from '../components/Leaderboard';
import StreakCalendar from '../components/StreakCalendar';
import { useTheme } from '../context/ThemeContext';
// useFocusEffect combined above

const mascotImage = require('../../assets/day_completed.png');
const backgroundImage = require('../../assets/bg_lavender.png');

export default function VideoDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const video = route.params?.video || {
    title: 'Detail Screen',
    theme_color: colors.primary
  };

  const activeColor = video.theme_color || video.themeColor || colors.primary;

  const [count, setCount]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [buttonText, setButtonText]     = useState('Loading...');
  const [leaderboard, setLeaderboard]   = useState([]);
  
  const { setHomeTabColor, resetHomeTabColor } = useTheme();

  useFocusEffect(
    useCallback(() => {
      setHomeTabColor(activeColor);
      return () => resetHomeTabColor();
    }, [activeColor, setHomeTabColor, resetHomeTabColor])
  );

  useEffect(() => {
    async function loadStats() {
      try {
        const [c, lb] = await Promise.all([
          fetchCompletionCountForVideo(video.id),
          getVideoLeaderboard(video.youtube_id),
        ]);
        setCount(c);
        setButtonText(`Complete Day ${c + 1}`);
        setLeaderboard(lb);
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
  const opacity     = useSharedValue(0);
  const translateX  = useSharedValue(150);
  const translateY  = useSharedValue(200);
  const rotate      = useSharedValue(20);

  const mascotStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ]
  }));

  const handleFinish = async () => {
    try {
      await recordCompletion(video);
      const newCount = count + 1;
      setCount(newCount);

      // Refresh leaderboard after completing
      getVideoLeaderboard(video.youtube_id).then(setLeaderboard).catch(console.warn);
    } catch (error) {
      if (error.message.includes('already completed')) {
        // Already done today — silently ignore (button should be labelled accordingly)
        return;
      }
      console.warn('Completion error:', error.message);
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Haptics not available
    }
    
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
        if (finished) runOnJS(setButtonText)(`Day ${count + 1} Completed! 🎉`);
      }))
    );
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
        <BlurView 
          intensity={40} 
          tint="light" 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 24,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: 'rgba(216, 180, 226, 0.4)',
          }}
        >
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: 'white',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
              marginRight: 12
            }}
          >
            <ChevronLeft color={colors.text} size={22} />
          </TouchableOpacity>
          <Text 
            style={{ 
              fontSize: 18, 
              fontFamily: 'Overlock_700Bold', 
              color: colors.text,
              flex: 1
            }} 
            numberOfLines={1}
          >
            {video.title}
          </Text>
        </BlurView>
      </View>
      
      {/* Content */}
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 220, paddingTop: 20 }} 
        showsVerticalScrollIndicator={false}
      >
        <Leaderboard data={leaderboard} themeColor={activeColor} />
        <StreakCalendar 
          themeColor={activeColor} 
          videoId={video.id}
          refreshTrigger={count}
        />
      </ScrollView>

      {/* Mascot */}
      <Animated.View 
        style={[
          { position: 'absolute', bottom: 80, right: -20, zIndex: 10 },
          mascotStyle,
        ]}
        pointerEvents="none"
      >
        <Image 
          source={mascotImage} 
          style={{ width: 250, height: 250, resizeMode: 'contain' }} 
        />
      </Animated.View>

      {/* Complete Button */}
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
            <Text className="text-white text-lg font-overlockBold tracking-wider">
              {buttonText}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </ImageBackground>
  );
}
