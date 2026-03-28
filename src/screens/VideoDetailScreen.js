import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { colors } from '../utils/colors';
import { mockLeaderboard } from '../data/mockData';
import Leaderboard from '../components/Leaderboard';
import StreakCalendar from '../components/StreakCalendar';

export default function VideoDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const video = route.params?.video || {
    title: 'Detail Screen',
    themeColor: colors.primary
  };

  const handleFinish = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
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

      {/* Sticky Bottom Butonu - Alt tab bar'dan biraz daha yüksekte */}
      <View className="absolute bottom-28 left-6 right-6 pb-2 bg-transparent" pointerEvents="box-none">
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={handleFinish}
          className="w-full h-16 rounded-3xl justify-center items-center shadow-md shadow-gray-400"
          style={{ backgroundColor: video.themeColor }}
        >
          <Text className="text-white text-lg font-black tracking-wider">
            Day 6 completed!
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
