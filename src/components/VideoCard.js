import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Play, Pencil, Target, CheckCircle2, Clock } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../utils/colors';

export default function VideoCard({ video, onComplete, onEditPress, isCompletedToday }) {
  const navigation = useNavigation();

  const thumbnailUri = video.thumbnail_url || video.thumbnail;
  const themeColor = video.theme_color || video.themeColor || colors.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('VideoDetailScreen', { video })}
      className="mb-4 mx-6 shadow-sm shadow-gray-200"
      style={{ height: 110 }}
    >
      <BlurView
        intensity={40}
        tint="light"
        className="flex-row rounded-3xl overflow-hidden w-full h-full"
        style={{ borderWidth: 1.5, borderColor: themeColor }}
      >
        {/* Left color accent */}
        <View style={{ width: 8, backgroundColor: themeColor }} />

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
          className="text-base font-overlockBold mb-1"
          style={{ color: colors.text }}
          numberOfLines={1}
        >
          {video.title}
        </Text>
        
        <View className="flex-row items-center justify-between mt-auto">
          {/* Left: Goal */}
          <View className="flex-row items-center">
            <Target size={14} color={themeColor} strokeWidth={2.5} />
            <Text className="text-[11px] font-overlock ml-1.5" style={{ color: '#7B6F9A' }}>
              Hedef: {video.daily_goal || 1} Tekrar
            </Text>
          </View>

          {/* Right: Status */}
          <View className="flex-row items-center">
            {isCompletedToday ? (
              <>
                <CheckCircle2 size={13} color="#27AE60" strokeWidth={2.5} />
                <Text className="text-[11px] font-overlock ml-1 text-green-600">
                  Tamamlandı
                </Text>
              </>
            ) : (
              <>
                <Clock size={13} color="#9A8FB5" strokeWidth={2.5} />
                <Text className="text-[11px] font-overlock ml-1 text-gray-400">
                  Bekliyor
                </Text>
              </>
            )}

            {/* Edit Button - slightly shifted to not overlap much */}
            {onEditPress && (
              <TouchableOpacity
                style={[styles.editBtn, { marginLeft: 8 }]}
                onPress={(e) => {
                  e.stopPropagation();
                  onEditPress(video);
                }}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Pencil size={12} color="#9A8FB5" strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      </BlurView>
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
