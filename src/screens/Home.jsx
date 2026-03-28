import React from 'react';
import { View, Text } from 'react-native';

export default function Home() {
  return (
    <View className="flex-1 bg-background px-6 pt-16">
      {/* Top Section - Greeting */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-primary">Hello, Michelle!</Text>
        <Text className="text-gray-500 mt-2">Ready to track your habits today?</Text>
      </View>

      {/* Middle Section - Chart Placeholder */}
      {/* NOTE: This chart will eventually become a stacked bar chart where days 
          with multiple challenges will have stacked colors. */}
      <View className="flex-1 bg-white rounded-2xl shadow-sm justify-center items-center mb-6 border border-gray-100">
        <Text className="text-gray-400 font-medium">7-Day Stacked Bar Chart Placeholder</Text>
      </View>

      {/* Bottom Section - Empty State Share Intent Guide */}
      <View className="bg-secondary/30 rounded-2xl p-6 items-center border border-secondary/50 mb-10">
        <View className="bg-accent/20 p-4 rounded-full mb-4">
          <Text className="text-accent text-2xl">📱</Text>
        </View>
        <Text className="text-lg font-semibold text-gray-800 text-center mb-2">Track Your Workouts</Text>
        <Text className="text-gray-500 text-center mb-4 leading-5">
          Send a YouTube video to the app via "Share" to log your new challenge here.
        </Text>
        <View className="bg-primary px-6 py-3 rounded-xl">
          <Text className="text-white font-medium">How to Share Guide</Text>
        </View>
      </View>
    </View>
  );
}
