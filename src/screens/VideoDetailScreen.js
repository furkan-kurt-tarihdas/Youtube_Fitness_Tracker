import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image, ActivityIndicator, SafeAreaView, ImageBackground } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Animated from 'react-native-reanimated';

import { colors } from '../utils/colors';
import Leaderboard from '../components/Leaderboard';
import StreakCalendar from '../components/StreakCalendar';
import VideoHeader from '../components/VideoHeader';
import { useTheme } from '../context/ThemeContext';
import { useVideoData } from '../hooks/useVideoData';
import { useMascotAnimation } from '../hooks/useMascotAnimation';

const mascotImage = require('../../assets/day_completed.png');
const backgroundImage = require('../../assets/bg_lavender.png');

export default function VideoDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const video = route.params?.video || {
    title: 'Detail Screen',
    theme_color: colors.primary
  };

  const { setHomeTabColor, resetHomeTabColor } = useTheme();

  const {
    count,
    loading,
    leaderboard,
    goal,
    isCompletedForToday,
    nextRep,
    currentStreak,
    activeColor,
    handleRecordCompletion
  } = useVideoData(video, setHomeTabColor, resetHomeTabColor);

  const { mascotStyle, triggerAnimation } = useMascotAnimation();

  const onCompletePress = () => {
    handleRecordCompletion(async () => {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (e) {
        // Haptics not available
      }
      triggerAnimation();
    });
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
        <VideoHeader 
          title={video.title} 
          onBackPress={() => navigation.goBack()} 
        />
        
        <ScrollView 
          contentContainerStyle={{ paddingBottom: 220, paddingTop: 20 }} 
          showsVerticalScrollIndicator={false}
        >
          <Leaderboard data={leaderboard} themeColor={activeColor} />
          <StreakCalendar 
            themeColor={activeColor} 
            videoId={video.id}
            refreshTrigger={count}
            videoGoal={video.daily_goal || 1}
          />
        </ScrollView>

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

        <View className="absolute bottom-28 left-6 right-6 pb-2 bg-transparent" pointerEvents="box-none">
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={onCompletePress}
            disabled={loading || isCompletedForToday}
            className="w-full h-16 rounded-3xl justify-center items-center shadow-md shadow-gray-400"
            style={{ backgroundColor: isCompletedForToday ? '#B5E4CA' : activeColor, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text 
                className="text-lg font-overlockBold tracking-wider"
                style={{ color: isCompletedForToday ? '#2E7D32' : 'white' }}
              >
                {isCompletedForToday 
                  ? 'Done for Today! 🎉' 
                  : `Complete Day ${currentStreak + 1} (${nextRep}/${goal})`}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
