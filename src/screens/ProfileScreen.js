import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, User, LogOut, ChevronRight } from 'lucide-react-native';
import { colors } from '../utils/colors';

import { useProfileData } from '../hooks/useProfileData';
import { NotificationModal, AccountSettingsModal, SignOutModal } from '../components/ProfileModals';

export default function ProfileScreen() {
  const {
    profileUsername, avatarUrl, joinYear, totalVideos, currentStreak, dataLoading,
    editUsername, setEditUsername, savingUsername, signOutLoading,
    handleSaveUsername, handleSignOut,
  } = useProfileData();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount]             = useState(false);
  const [showSignOut, setShowSignOut]             = useState(false);

  const STATS = [
    { value: String(totalVideos), label: 'Total Videos', bg: colors.secondary },
    { value: `${currentStreak} 🔥`, label: 'Current Streak', bg: colors.accent },
  ];

  const MENU_ITEMS = [
    { icon: Bell,    label: 'Notifications',    danger: false, onPress: () => setShowNotifications(true) },
    { icon: User,    label: 'Account Settings', danger: false, onPress: () => setShowAccount(true) },
    { icon: LogOut,  label: 'Sign Out',         danger: true,  onPress: () => setShowSignOut(true) },
  ];

  const avatarSource = avatarUrl
    ? { uri: avatarUrl }
    : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUsername || 'A')}&background=D8B4E2&color=3D3D5C&size=256` };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        <Text className="text-2xl font-overlockBold px-6 pt-6 pb-4" style={{ color: colors.text }}>
          Profile
        </Text>

        <View className="items-center mb-8 px-6">
          {dataLoading ? (
            <View className="w-28 h-28 rounded-full bg-gray-200 mb-4 items-center justify-center">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <Image
              source={avatarSource}
              className="w-28 h-28 rounded-full bg-gray-200 mb-4"
              style={{ borderWidth: 4, borderColor: colors.primary }}
            />
          )}
          <Text className="text-2xl font-overlockBold" style={{ color: colors.text }}>
            {profileUsername || '...'}
          </Text>
          <Text className="text-sm font-overlock mt-1" style={{ color: '#9CA3AF' }}>
            Joined {joinYear || '...'}
          </Text>
        </View>

        <View className="flex-row justify-center mx-6 mb-8 gap-3">
          {STATS.map((stat, i) => (
            <View
              key={i}
              className="flex-1 items-center justify-center py-5 rounded-2xl"
              style={{ backgroundColor: stat.bg }}
            >
              {dataLoading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <>
                  <Text className="text-2xl font-overlockBold mb-1" style={{ color: colors.text }}>{stat.value}</Text>
                  <Text className="text-xs font-overlock font-semibold text-center" style={{ color: colors.text, opacity: 0.6 }}>
                    {stat.label}
                  </Text>
                </>
              )}
            </View>
          ))}
        </View>

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
                  <Text className="text-base font-overlockBold font-semibold" style={{ color: iconColor }}>{item.label}</Text>
                </View>
                <ChevronRight size={18} color={iconColor} opacity={0.5} />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <NotificationModal 
        visible={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />

      <AccountSettingsModal 
        visible={showAccount} 
        onClose={() => setShowAccount(false)}
        editUsername={editUsername}
        setEditUsername={setEditUsername}
        saving={savingUsername}
        onSave={() => handleSaveUsername(() => setShowAccount(false))}
      />

      <SignOutModal 
        visible={showSignOut} 
        onClose={() => setShowSignOut(false)}
        loading={signOutLoading}
        onSignOut={() => handleSignOut(() => setShowSignOut(false))}
      />
    </SafeAreaView>
  );
}
