import React from 'react';
import { View, Text, Image } from 'react-native';
import { colors } from '../utils/colors';

export default function Leaderboard({ data }) {
  return (
    <View className="bg-white rounded-3xl p-5 shadow-sm shadow-gray-200 mb-6 mx-6">
      <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
        Leaderboard
      </Text>
      {data.map((item, index) => {
        const isCurrentUser = item.isCurrentUser;
        return (
          <View 
            key={item.id} 
            className="flex-row items-center justify-between mb-3 p-3 rounded-2xl"
            style={{ backgroundColor: isCurrentUser ? `${colors.primary}40` : 'transparent' }} // 40 is opacity 25%
          >
            <View className="flex-row items-center">
              <Text className="text-gray-500 font-bold w-6 text-center mr-2">
                {index + 1}
              </Text>
              <Image 
                source={{ uri: `https://i.pravatar.cc/150?u=${item.id}` }} 
                className="w-10 h-10 rounded-full mr-3 bg-gray-200"
              />
              <Text 
                className="text-base" 
                style={{ 
                  color: colors.text, 
                  fontWeight: isCurrentUser ? '800' : '600'
                }}
              >
                {item.name}
              </Text>
            </View>
            <View className="px-3 py-1 rounded-full bg-black/5">
              <Text className="text-xs font-extrabold" style={{ color: colors.text }}>
                {item.streak}-day streak
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
