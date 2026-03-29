import React from 'react';
import { View, Text, Image } from 'react-native';
import { colors } from '../utils/colors';

export default function Header({ isEmpty }) {
  return (
    <View className="px-6 pt-4 mt-2">
      {/* Top Row: Avatar + Streak */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=47' }}
            className="w-12 h-12 rounded-full mr-4 bg-gray-200"
          />
          <Text className="text-lg font-bold" style={{ color: colors.text }}>
            Hello, Michelle!
          </Text>
        </View>
        <View
          className="px-3 py-1.5 rounded-xl flex-row items-center"
          style={{ backgroundColor: colors.secondary }}
        >
          <Text className="text-sm font-semibold" style={{ color: colors.text }}>
            {isEmpty ? '💤 0 Day Streak' : '🔥 7 Day Streak'}
          </Text>
        </View>
      </View>

      {/* Subtitle Row */}
      <Text className="text-sm" style={{ color: '#9CA3AF', paddingLeft: 64 }}>
        {isEmpty ? 'Add a video to get started!' : 'Ready to track your habits today?'}
      </Text>
    </View>
  );
}
