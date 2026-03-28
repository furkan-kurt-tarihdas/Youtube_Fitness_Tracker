import React from 'react';
import { View, Text, Image } from 'react-native';
import { colors } from '../utils/colors';

export default function Header() {
  return (
    <View className="flex-row items-center justify-between px-6 py-4 mt-2">
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
          🔥 7 Day Streak
        </Text>
      </View>
    </View>
  );
}
