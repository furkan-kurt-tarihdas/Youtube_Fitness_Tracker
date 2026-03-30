import React, { useState, useCallback } from 'react';
import { View, Text, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../utils/colors';
import { getUserGlobalStreak } from '../services/db';
import { supabase } from '../services/supabase';

export default function Header({ isEmpty }) {
  const [username, setUsername]       = useState('');
  const [avatarUrl, setAvatarUrl]     = useState(null);
  const [globalStreak, setGlobalStreak] = useState(0);
  const [loaded, setLoaded]           = useState(false);

  // Refresh every time HomeScreen is focused (e.g. after completing a video)
  useFocusEffect(
    useCallback(() => {
      async function loadUserData() {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const meta = user.user_metadata || {};
          const fallbackName = meta.username || meta.full_name || user.email?.split('@')[0] || 'Athlete';
          setUsername(fallbackName);

          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();

          if (profile?.username) setUsername(profile.username);
          if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);

          const streak = await getUserGlobalStreak(user.id);
          setGlobalStreak(streak);
        } catch (err) {
          console.warn('Header load error:', err.message);
        } finally {
          setLoaded(true);
        }
      }
      loadUserData();
    }, [])
  );

  const hasStreak = globalStreak > 0;
  const streakLabel = !loaded ? '⏳' : `${hasStreak ? '🔥' : '💤'} ${globalStreak} Day Streak`;

  const avatarSource = avatarUrl
    ? { uri: avatarUrl }
    : { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'A')}&background=D8B4E2&color=3D3D5C&size=128` };

  return (
    <View className="px-6 pt-4 mt-2">
      <View className="flex-row items-center justify-between mb-0">
        {/* Left: Avatar + Texts */}
        <View className="flex-row items-center flex-1 mr-2">
          <Image
            source={avatarSource}
            className="w-12 h-12 rounded-full mr-3 bg-gray-200"
          />
          <View className="flex-1">
            <Text className="text-lg font-bold" style={{ color: colors.text }} numberOfLines={1}>
              Hello, {username || '...'}!
            </Text>
            <Text className="text-sm" style={{ color: '#9CA3AF' }} numberOfLines={2}>
              {isEmpty ? 'Add a video to get started!' : 'Ready to track your habits today?'}
            </Text>
          </View>
        </View>

        {/* Right: Streak Badge */}
        <View
          className="px-3 py-1.5 rounded-xl flex-row items-center"
          style={{ backgroundColor: hasStreak ? colors.secondary : '#EFF2F5' }}
        >
          <Text
            className="text-sm font-semibold"
            style={{ color: hasStreak ? colors.text : '#9CA3AF' }}
          >
            {streakLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}
