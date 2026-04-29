import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image, ActivityIndicator, SafeAreaView, ImageBackground, Dimensions } from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';
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
const placeholderImage = require('../../assets/video_placeholder.png');

const SCREEN_WIDTH = Dimensions.get('window').width;
const VIDEO_WIDTH = SCREEN_WIDTH - 32;
const PLAYER_HEIGHT = Math.round(VIDEO_WIDTH * (9 / 16));

/**
 * Extracts an 11-character YouTube video ID from any known URL format:
 *  - https://www.youtube.com/watch?v=XXXXXXXXXXX
 *  - https://youtu.be/XXXXXXXXXXX
 *  - https://www.youtube.com/embed/XXXXXXXXXXX
 *  - https://www.youtube.com/shorts/XXXXXXXXXXX
 *  - Raw 11-char IDs
 */
function extractVideoId(raw) {
  if (!raw) return null;
  const str = String(raw).trim();

  // Already a bare 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;

  try {
    const url = new URL(str);
    // youtube.com/watch?v=...
    const v = url.searchParams.get('v');
    if (v && v.length === 11) return v;
    // youtu.be/<id> or youtube.com/embed/<id> or youtube.com/shorts/<id>
    const match = url.pathname.match(/\/(?:embed\/|shorts\/|v\/)?([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];
  } catch (_) {
    // Fallback regex for malformed URLs
    const match = str.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];
  }

  return null;
}

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

  const [isVideoReady, setIsVideoReady] = useState(false);

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
          {/* ── YouTube In-App Player ── */}
          {(() => {
            const videoId = extractVideoId(video.youtube_id) || extractVideoId(video.url);
            if (!videoId) return null;
            return (
              <View
                style={{
                  marginHorizontal: 16,
                  marginBottom: 16,
                  borderRadius: 16,
                  overflow: 'hidden',
                  elevation: 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  borderWidth: 1,
                  borderColor: activeColor,
                  height: PLAYER_HEIGHT,
                }}
              >
                {!isVideoReady && (
                  <Image 
                    source={placeholderImage}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
                    resizeMode="cover"
                  />
                )}
                <YoutubeIframe
                  height={PLAYER_HEIGHT}
                  width={VIDEO_WIDTH}
                  videoId={videoId}
                  play={false}
                  onReady={() => setIsVideoReady(true)}
                />
              </View>
            );
          })()}

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
