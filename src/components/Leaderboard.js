import React from 'react';
import { View, Text, Image } from 'react-native';
import { colors } from '../utils/colors';

const DEFAULT_AVATAR = (username) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'A')}&background=D8B4E2&color=3D3D5C&size=128`;

export default function Leaderboard({ data }) {
  if (!data || data.length === 0) {
    return (
      <View className="bg-white rounded-3xl p-5 shadow-sm shadow-gray-200 mb-6 mx-6">
        <Text className="text-lg font-overlockBold mb-2" style={{ color: colors.text }}>
          Leaderboard
        </Text>
        <Text className="text-sm font-overlock text-center py-4" style={{ color: '#9CA3AF' }}>
          No completions yet. Be the first! 🏆
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-3xl p-5 shadow-sm shadow-gray-200 mb-6 mx-6">
      <Text className="text-lg font-overlockBold mb-4" style={{ color: colors.text }}>
        Leaderboard
      </Text>
      {data.map((item, index) => (
        <View
          key={item.id}
          className="flex-row items-center justify-between mb-3 p-3 rounded-2xl"
          style={{ backgroundColor: item.isCurrentUser ? `${colors.primary}40` : 'transparent' }}
        >
          <View className="flex-row items-center flex-1">
            <Text className="text-gray-500 font-overlockBold w-6 text-center mr-2">
              {index + 1}
            </Text>
            <Image
              source={{ uri: item.avatar_url || DEFAULT_AVATAR(item.username) }}
              className="w-10 h-10 rounded-full mr-3 bg-gray-200"
            />
            <Text
              className="text-base flex-1 font-overlockBold"
              numberOfLines={1}
              style={{
                color: colors.text,
              }}
            >
              {item.username}
              {item.isCurrentUser ? ' (You)' : ''}
            </Text>
          </View>
          <View className="px-3 py-1 rounded-full bg-black/5 ml-2">
            <Text className="text-xs font-overlockBold" style={{ color: colors.text }}>
              {item.streak}-day streak
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
