import React, { useState } from 'react';
import { 
  View, Text, Image, ScrollView, TouchableOpacity, SafeAreaView, 
  StatusBar, Modal, Switch, TextInput, Pressable 
} from 'react-native';
import { Bell, User, LogOut, ChevronRight } from 'lucide-react-native';
import { colors } from '../utils/colors';

const STATS = [
  { value: '12', label: 'Total Videos', bg: colors.secondary },
  { value: '7 👑', label: 'Best Streak', bg: colors.accent },
  { value: '5 🔥', label: 'Current Streak', bg: colors.secondary },
];

export default function ProfileScreen() {
  // Modal States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  // Notification Switch States
  const [dailyReminder, setDailyReminder] = useState(true);
  const [streakAlert, setStreakAlert] = useState(true);

  // Account Input State
  const [username, setUsername] = useState('');

  const MENU_ITEMS = [
    { icon: Bell, label: 'Notifications', danger: false, onPress: () => setShowNotifications(true) },
    { icon: User, label: 'Account Settings', danger: false, onPress: () => setShowAccount(true) },
    { icon: LogOut, label: 'Sign Out', danger: true, onPress: () => setShowSignOut(true) },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* ─── Sayfa Başlığı ─── */}
        <Text className="text-2xl font-black px-6 pt-6 pb-4" style={{ color: colors.text }}>
          Profile
        </Text>

        {/* ─── Kullanıcı Header'ı ─── */}
        <View className="items-center mb-8 px-6">
          <Image
            source={{ uri: 'https://i.pravatar.cc/300?u=michelle' }}
            className="w-28 h-28 rounded-full bg-gray-200 mb-4"
            style={{ borderWidth: 4, borderColor: colors.primary }}
          />
          <Text className="text-2xl font-extrabold" style={{ color: colors.text }}>Michelle</Text>
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
              style={{ backgroundColor: stat.bg, marginHorizontal: i === 1 ? 10 : 0 }}
            >
              <Text className="text-2xl font-black mb-1" style={{ color: colors.text }}>{stat.value}</Text>
              <Text className="text-xs font-semibold text-center" style={{ color: colors.text, opacity: 0.6 }}>
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
                onPress={item.onPress}
                className="flex-row items-center justify-between px-5 py-5"
                style={{ borderBottomWidth: i < MENU_ITEMS.length - 1 ? 1 : 0, borderBottomColor: '#F3F4F6' }}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-9 h-9 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: item.danger ? '#FEE2E2' : `${colors.primary}30` }}
                  >
                    <Icon size={18} color={iconColor} strokeWidth={2.5} />
                  </View>
                  <Text className="text-base font-semibold" style={{ color: iconColor }}>{item.label}</Text>
                </View>
                <ChevronRight size={18} color={iconColor} opacity={0.5} />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* ═══════════════════════════════════════
          MODAL 1: Bildirim Ayarları
      ════════════════════════════════════════ */}
      <Modal visible={showNotifications} transparent animationType="fade" onRequestClose={() => setShowNotifications(false)}>
        <Pressable 
          className="flex-1 bg-black/50 justify-center items-center px-6"
          onPress={() => setShowNotifications(false)}
        >
          <Pressable 
            className="w-full rounded-3xl p-6"
            style={{ backgroundColor: colors.background }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-xl font-black mb-6" style={{ color: colors.text }}>
              Notification Settings
            </Text>

            {/* Günlük Hatırlatıcı */}
            <View className="flex-row items-center justify-between mb-4 py-3 px-4 bg-white rounded-2xl">
              <Text className="text-sm font-semibold flex-1 mr-3" style={{ color: colors.text }}>
                Daily Workout Reminder
              </Text>
              <Switch
                value={dailyReminder}
                onValueChange={setDailyReminder}
                trackColor={{ false: '#D1D5DB', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Streak Uyarıları */}
            <View className="flex-row items-center justify-between mb-6 py-3 px-4 bg-white rounded-2xl">
              <Text className="text-sm font-semibold flex-1 mr-3" style={{ color: colors.text }}>
                Streak Alerts
              </Text>
              <Switch
                value={streakAlert}
                onValueChange={setStreakAlert}
                trackColor={{ false: '#D1D5DB', true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <TouchableOpacity
              onPress={() => setShowNotifications(false)}
              className="w-full h-14 rounded-2xl items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-base font-black" style={{ color: colors.text }}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ═══════════════════════════════════════
          MODAL 2: Hesap Ayarları
      ════════════════════════════════════════ */}
      <Modal visible={showAccount} transparent animationType="fade" onRequestClose={() => setShowAccount(false)}>
        <Pressable 
          className="flex-1 bg-black/50 justify-center items-center px-6"
          onPress={() => setShowAccount(false)}
        >
          <Pressable 
            className="w-full rounded-3xl p-6"
            style={{ backgroundColor: colors.background }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-xl font-black mb-6" style={{ color: colors.text }}>
              Account Settings
            </Text>

            <Text className="text-xs font-semibold mb-2 ml-1" style={{ color: '#9CA3AF' }}>
              USERNAME
            </Text>
            <TextInput
              className="bg-white rounded-2xl px-4 py-4 text-base mb-6"
              style={{ color: colors.text }}
              placeholder="Michelle"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
            />

            <TouchableOpacity activeOpacity={0.6} className="mb-6">
              <Text className="text-sm font-bold text-center text-red-500">Delete My Account</Text>
            </TouchableOpacity>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowAccount(false)}
                className="flex-1 h-14 rounded-2xl items-center justify-center bg-gray-100"
              >
                <Text className="text-base font-bold text-gray-500">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowAccount(false)}
                className="flex-1 h-14 rounded-2xl items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-base font-black" style={{ color: colors.text }}>Save</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ═══════════════════════════════════════
          MODAL 3: Çıkış Yap
      ════════════════════════════════════════ */}
      <Modal visible={showSignOut} transparent animationType="fade" onRequestClose={() => setShowSignOut(false)}>
        <Pressable 
          className="flex-1 bg-black/50 justify-center items-center px-6"
          onPress={() => setShowSignOut(false)}
        >
          <Pressable 
            className="w-full rounded-3xl p-6"
            style={{ backgroundColor: colors.background }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text className="text-xl font-black mb-3 text-center" style={{ color: colors.text }}>
              Signing Out
            </Text>
            <Text className="text-sm text-center mb-8" style={{ color: '#6B7280' }}>
              Are you sure you want to leave? The cool stuff will be waiting for you! 🏋️
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowSignOut(false)}
                className="flex-1 h-14 rounded-2xl items-center justify-center bg-gray-100"
              >
                <Text className="text-base font-bold text-gray-500">Stay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowSignOut(false)}
                className="flex-1 h-14 rounded-2xl items-center justify-center bg-red-100"
              >
                <Text className="text-base font-black text-red-500">Sign Out</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
