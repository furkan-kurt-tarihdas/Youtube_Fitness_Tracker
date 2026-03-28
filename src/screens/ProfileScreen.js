import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Bell, User, LogOut, ChevronRight } from 'lucide-react-native';
import { colors } from '../utils/colors';

const STATS = [
  { value: '12', label: 'Total Videos', bg: colors.secondary },
  { value: '7 👑', label: 'Best Streak', bg: colors.accent },
  { value: '5 🔥', label: 'Current Streak', bg: colors.secondary },
];

const MENU_ITEMS = [
  { icon: Bell, label: 'Notifications', danger: false },
  { icon: User, label: 'Account Settings', danger: false },
  { icon: LogOut, label: 'Sign Out', danger: true },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 120 }} 
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Sayfa Başlığı ─── */}
        <Text 
          className="text-2xl font-black px-6 pt-6 pb-4" 
          style={{ color: colors.text }}
        >
          Profile
        </Text>

        {/* ─── Kullanıcı Header'ı ─── */}
        <View className="items-center mb-8 px-6">
          <Image
            source={{ uri: 'https://i.pravatar.cc/300?u=michelle' }}
            className="w-28 h-28 rounded-full bg-gray-200 mb-4"
            style={{ borderWidth: 4, borderColor: colors.primary }}
          />
          <Text className="text-2xl font-extrabold" style={{ color: colors.text }}>
            Michelle
          </Text>
          <Text className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
            Premium Member · Joined 2026
          </Text>
        </View>

        {/* ─── İstatistik Kartları ─── */}
        <View className="flex-row justify-between mx-6 mb-8">
          {STATS.map((stat, i) => (
            <View 
              key={i}
              className="flex-1 items-center justify-center py-5 rounded-2xl"
              style={{ 
                backgroundColor: stat.bg, 
                marginHorizontal: i === 1 ? 10 : 0 
              }}
            >
              <Text className="text-2xl font-black mb-1" style={{ color: colors.text }}>
                {stat.value}
              </Text>
              <Text 
                className="text-xs font-semibold text-center" 
                style={{ color: colors.text, opacity: 0.6 }}
              >
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ─── Ayarlar Menüsü ─── */}
        <View className="mx-6 bg-white rounded-3xl overflow-hidden shadow-sm shadow-gray-200">
          {MENU_ITEMS.map((item, i) => {
            const Icon = item.icon;
            const iconColor = item.danger ? '#EF4444' : colors.text;
            return (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                className="flex-row items-center justify-between px-5 py-5"
                style={{ 
                  borderBottomWidth: i < MENU_ITEMS.length - 1 ? 1 : 0, 
                  borderBottomColor: '#F3F4F6' 
                }}
              >
                <View className="flex-row items-center">
                  <View 
                    className="w-9 h-9 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: item.danger ? '#FEE2E2' : `${colors.primary}30` }}
                  >
                    <Icon size={18} color={iconColor} strokeWidth={2.5} />
                  </View>
                  <Text 
                    className="text-base font-semibold" 
                    style={{ color: iconColor }}
                  >
                    {item.label}
                  </Text>
                </View>
                <ChevronRight size={18} color={iconColor} opacity={0.5} />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
