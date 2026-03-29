import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Play } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../utils/colors';

export default function VideoCard({ video, onComplete }) {
  const navigation = useNavigation();

  // DB uses 'thumbnail_url'; support legacy 'thumbnail' field too
  const thumbnailUri = video.thumbnail_url || video.thumbnail;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('VideoDetailScreen', { video })}
      className="flex-row bg-white rounded-3xl overflow-hidden mb-4 mx-6 shadow-sm shadow-gray-200"
      style={{ height: 110 }}
    >
      {/* Left color accent */}
      <View style={{ width: 8, backgroundColor: video.theme_color || video.themeColor }} />

      {/* Thumbnail */}
      <View className="relative w-32 h-full">
        <Image
          source={
            thumbnailUri
              ? { uri: thumbnailUri }
              : require('../../assets/icon.png') // fallback
          }
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 items-center justify-center bg-black/20">
          <View className="w-10 h-10 rounded-full bg-white/30 items-center justify-center">
            <Play fill="white" color="white" size={20} />
          </View>
        </View>
      </View>

      {/* Info */}
      <View className="flex-1 justify-center px-5 py-3">
        <Text
          className="text-base font-bold mb-3"
          style={{ color: colors.text }}
          numberOfLines={2}
        >
          {video.title}
        </Text>
        <View className="flex-row items-center">
          <View
            className="w-2.5 h-2.5 rounded-full mr-2"
            style={{ backgroundColor: video.theme_color || video.themeColor }}
          />
          <Text className="text-xs font-medium text-gray-500">
            {video.youtube_id ? `youtube.com/watch?v=${video.youtube_id}` : 'Tap to watch'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
