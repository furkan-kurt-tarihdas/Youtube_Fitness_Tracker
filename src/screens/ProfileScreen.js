import React, { useState, useCallback } from 'react';
import { 
  View, Text, Image, ScrollView, TouchableOpacity, 
  StatusBar, Modal, Switch, TextInput, Pressable, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, User, LogOut, ChevronRight } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../utils/colors';
import { supabase } from '../services/supabase';
import { getUserGlobalStreak, fetchVideos } from '../services/db';

export default function ProfileScreen() {
  // User data
  const [profileUsername, setProfileUsername] = useState('');
  const [avatarUrl, setAvatarUrl]             = useState(null);
  const [joinYear, setJoinYear]               = useState('');
  const [totalVideos, setTotalVideos]         = useState(0);
  const [currentStreak, setCurrentStreak]     = useState(0);
  const [dataLoading, setDataLoading]         = useState(true);

  // Modal States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount]             = useState(false);
  const [showSignOut, setShowSignOut]             = useState(false);
  const [signOutLoading, setSignOutLoading]       = useState(false);
  const [dailyReminder, setDailyReminder]         = useState(true);
  const [streakAlert, setStreakAlert]             = useState(true);
  const [editUsername, setEditUsername]           = useState('');
  const [savingUsername, setSavingUsername]       = useState(false);

  // Refresh data every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      async function loadProfile() {
        setDataLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Join year from user metadata
          const created = user.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear();
          setJoinYear(created);

          // Profile table
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();

          const name = profile?.username
            || user.user_metadata?.username
            || user.user_metadata?.full_name
            || user.email?.split('@')[0]
            || 'Athlete';

          setProfileUsername(name);
          setAvatarUrl(profile?.avatar_url || null);
          setEditUsername(name);

          // Total videos + current streak (parallel)
          const [videos, streak] = await Promise.all([
            fetchVideos(),
            getUserGlobalStreak(user.id),
          ]);
          setTotalVideos(videos.length);
          setCurrentStreak(streak);
        } catch (err) {
          console.warn('Profile load error:', err.message);
        } finally {
          setDataLoading(false);
        }
      }
      loadProfile();
    }, [])
  );

  async function handleSaveUsername() {
    if (!editUsername.trim()) return;
    setSavingUsername(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('profiles')
        .update({ username: editUsername.trim() })
        .eq('id', user.id);
      setProfileUsername(editUsername.trim());
      setShowAccount(false);
    } catch (err) {
      console.warn('Save username error:', err.message);
    } finally {
      setSavingUsername(false);
    }
  }

  async function handleSignOut() {
    setSignOutLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err.message);
    } finally {
      setSignOutLoading(false);
      setShowSignOut(false);
    }
  }

  const STATS = [
    { value: String(totalVideos), label: 'Total Videos', bg: colors.secondary },
    { value: `${currentStreak} 🔥`, label: 'Current Streak', bg: colors.accent },
  ];

  const MENU_ITEMS = [
    { icon: Bell,    label: 'Notifications',    danger: false, onPress: () => setShowNotifications(true) },
    { icon: User,    label: 'Account Settings', danger: false, onPress: () => setShowAccount(true) },
    { icon: LogOut,  label: 'Sign Out',          danger: true,  onPress: () => setShowSignOut(true) },
  ];

  const avatarSource = avatarUrl
    ? { uri: avatarUrl }
    : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUsername || 'A')}&background=D8B4E2&color=3D3D5C&size=256` };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* Page Title */}
        <Text className="text-2xl font-overlockBold px-6 pt-6 pb-4" style={{ color: colors.text }}>
          Profile
        </Text>

        {/* User Header */}
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

        {/* Stats */}
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

        {/* Menu */}
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

      {/* Modal: Notifications */}
      <Modal visible={showNotifications} transparent animationType="fade" onRequestClose={() => setShowNotifications(false)}>
        <Pressable className="flex-1 bg-black/50 justify-center items-center px-6" onPress={() => setShowNotifications(false)}>
          <Pressable className="w-full rounded-3xl p-6" style={{ backgroundColor: colors.background }} onPress={e => e.stopPropagation()}>
            <Text className="text-xl font-overlockBold mb-6" style={{ color: colors.text }}>Notification Settings</Text>
            <View className="flex-row items-center justify-between mb-4 py-3 px-4 bg-white rounded-2xl">
              <Text className="text-sm font-overlock font-semibold flex-1 mr-3" style={{ color: colors.text }}>Daily Workout Reminder</Text>
              <Switch value={dailyReminder} onValueChange={setDailyReminder} trackColor={{ false: '#D1D5DB', true: colors.primary }} thumbColor="#FFF" />
            </View>
            <View className="flex-row items-center justify-between mb-6 py-3 px-4 bg-white rounded-2xl">
              <Text className="text-sm font-overlock font-semibold flex-1 mr-3" style={{ color: colors.text }}>Streak Alerts</Text>
              <Switch value={streakAlert} onValueChange={setStreakAlert} trackColor={{ false: '#D1D5DB', true: colors.primary }} thumbColor="#FFF" />
            </View>
            <TouchableOpacity onPress={() => setShowNotifications(false)} className="w-full h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: colors.primary }}>
              <Text className="text-base font-overlockBold" style={{ color: colors.text }}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal: Account Settings */}
      <Modal visible={showAccount} transparent animationType="fade" onRequestClose={() => setShowAccount(false)}>
        <Pressable className="flex-1 bg-black/50 justify-center items-center px-6" onPress={() => setShowAccount(false)}>
          <Pressable className="w-full rounded-3xl p-6" style={{ backgroundColor: colors.background }} onPress={e => e.stopPropagation()}>
            <Text className="text-xl font-overlockBold mb-6" style={{ color: colors.text }}>Account Settings</Text>
            <Text className="text-xs font-overlock font-semibold mb-2 ml-1" style={{ color: '#9CA3AF' }}>USERNAME</Text>
            <TextInput
              className="bg-white rounded-2xl px-4 py-4 text-base font-overlock mb-6"
              style={{ color: colors.text }}
              placeholder="Your username"
              placeholderTextColor="#9CA3AF"
              value={editUsername}
              onChangeText={setEditUsername}
            />
            <TouchableOpacity activeOpacity={0.6} className="mb-6">
              <Text className="text-sm font-overlockBold text-center text-red-500">Delete My Account</Text>
            </TouchableOpacity>
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setShowAccount(false)} className="flex-1 h-14 rounded-2xl items-center justify-center bg-gray-100">
                <Text className="text-base font-overlockBold text-gray-500">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveUsername}
                disabled={savingUsername}
                className="flex-1 h-14 rounded-2xl items-center justify-center"
                style={{ backgroundColor: colors.primary, opacity: savingUsername ? 0.6 : 1 }}
              >
                {savingUsername
                  ? <ActivityIndicator color={colors.text} />
                  : <Text className="text-base font-overlockBold" style={{ color: colors.text }}>Save</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal: Sign Out */}
      <Modal visible={showSignOut} transparent animationType="fade" onRequestClose={() => setShowSignOut(false)}>
        <Pressable className="flex-1 bg-black/50 justify-center items-center px-6" onPress={() => setShowSignOut(false)}>
          <Pressable className="w-full rounded-3xl p-6" style={{ backgroundColor: colors.background }} onPress={e => e.stopPropagation()}>
            <Text className="text-xl font-overlockBold mb-3 text-center" style={{ color: colors.text }}>Signing Out</Text>
            <Text className="text-sm font-overlock text-center mb-8" style={{ color: '#6B7280' }}>
              Are you sure you want to leave? The cool stuff will be waiting for you! 🏋️
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setShowSignOut(false)} className="flex-1 h-14 rounded-2xl items-center justify-center bg-gray-100">
                <Text className="text-base font-overlockBold text-gray-500">Stay</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSignOut} disabled={signOutLoading} className="flex-1 h-14 rounded-2xl items-center justify-center bg-red-100" style={{ opacity: signOutLoading ? 0.6 : 1 }}>
                {signOutLoading
                  ? <ActivityIndicator color="#EF4444" />
                  : <Text className="text-base font-overlockBold text-red-500">Sign Out</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
