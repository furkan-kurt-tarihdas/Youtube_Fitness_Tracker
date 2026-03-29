import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pencil } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../utils/colors';

export default function VideoCard({ video, onComplete, onEditPress }) {
  const navigation = useNavigation();

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
              : require('../../assets/icon.png')
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
          className="text-base font-bold mb-2"
          style={{ color: colors.text }}
          numberOfLines={2}
        >
          {video.title}
        </Text>
        
        <View className="flex-row items-center justify-between mt-auto">
          <View className="flex-row items-center flex-1 pr-2">
            <View
              className="w-2.5 h-2.5 rounded-full mr-2"
              style={{ backgroundColor: video.theme_color || video.themeColor }}
            />
            <Text className="text-xs font-medium text-gray-500" numberOfLines={1}>
              {video.youtube_id ? `youtube.com/watch?v=${video.youtube_id}` : 'Tap to watch'}
            </Text>
          </View>

          {/* Edit Button */}
          {onEditPress && (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={(e) => {
                e.stopPropagation();
                onEditPress(video);
              }}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Pencil size={14} color="#9A8FB5" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3EEF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
