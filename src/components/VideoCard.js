import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Play } from 'lucide-react-native';
import { colors } from '../utils/colors';

export default function VideoCard({ video }) {
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      className="flex-row bg-white rounded-3xl overflow-hidden mb-4 mx-6 shadow-sm shadow-gray-200"
      style={{ height: 110 }}
    >
      <View style={{ width: 8, backgroundColor: video.themeColor }} />
      
      <View className="relative w-32 h-full">
        <Image 
          source={{ uri: video.thumbnail }} 
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 items-center justify-center bg-black/20">
          <View className="w-10 h-10 rounded-full bg-white/30 items-center justify-center">
            <Play fill="white" color="white" size={20} />
          </View>
        </View>
      </View>

      <View className="flex-1 justify-center px-5 py-3">
        <Text className="text-base font-bold mb-3" style={{ color: colors.text }} numberOfLines={2}>
          {video.title}
        </Text>
        <View className="flex-row items-center">
          <View 
            className="w-2.5 h-2.5 rounded-full mr-2" 
            style={{ backgroundColor: video.themeColor }}
          />
          <Text className="text-xs font-medium text-gray-500">
            Day {video.currentStreak} completed!
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
