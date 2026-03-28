import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StatusBar } from 'react-native';
import { colors } from '../utils/colors';
import { mockVideos, mockWeeklyLog } from '../data/mockData';
import Header from '../components/Header';
import WeeklyChart from '../components/WeeklyChart';
import VideoCard from '../components/VideoCard';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 130 }} // Spacer for tab bar
        showsVerticalScrollIndicator={false}
      >
        <Header />
        
        <WeeklyChart data={mockWeeklyLog} />
        
        <View className="px-6 mt-6 mb-5">
          <Text className="text-xl font-extrabold" style={{ color: colors.text }}>
            Daily Challenge
          </Text>
        </View>
        
        {mockVideos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
