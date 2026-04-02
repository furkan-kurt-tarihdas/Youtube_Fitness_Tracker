import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { getUserGlobalStreak, fetchVideos, updateNotificationSettings } from '../services/db';
import { scheduleDailyReminder, cancelAllNotifications } from '../services/notificationService';
import { useToast } from '../context/ToastContext';

export function useProfileData() {
  const { showToast } = useToast();
  const [profileUsername, setProfileUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [joinYear, setJoinYear] = useState('');
  const [totalVideos, setTotalVideos] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  // Form states inside hook since they map 1:1 to the username update
  const [editUsername, setEditUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);
  const [signOutLoading, setSignOutLoading] = useState(false);

  const [dailyReminder, setDailyReminder] = useState(false);
  const [streakAlerts, setStreakAlerts] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function loadProfile() {
        setDataLoading(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const created = user.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear();
          setJoinYear(created);

          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url, daily_reminder, streak_alerts')
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

          setDailyReminder(profile?.daily_reminder ?? false);
          setStreakAlerts(profile?.streak_alerts ?? false);

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

  async function handleSaveUsername(onSuccess) {
    if (!editUsername.trim()) return;
    setSavingUsername(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('profiles')
        .update({ username: editUsername.trim() })
        .eq('id', user.id);
      
      setProfileUsername(editUsername.trim());
      if (onSuccess) onSuccess();
    } catch (err) {
      console.warn('Save username error:', err.message);
    } finally {
      setSavingUsername(false);
    }
  }

  async function handleSignOut(onSuccess) {
    setSignOutLoading(true);
    try {
      await supabase.auth.signOut();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.warn('Sign out error:', err.message);
    } finally {
      setSignOutLoading(false);
    }
  }

  async function handleSaveNotifications(onSuccess) {
    setSavingNotifications(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Update DB
      await updateNotificationSettings(user.id, { dailyReminder, streakAlerts });

      // 2. Handle Local Notifications
      if (dailyReminder) {
        const scheduled = await scheduleDailyReminder();
        if (scheduled) {
          showToast("Settings Updated! 💜", "success");
        } else {
          // If fail (e.g. permission denied), we might want to revert the switch or alert
          showToast("Permission required for notifications", "error");
        }
      } else {
        await cancelAllNotifications();
        showToast("Settings Updated", "success");
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.warn('Save notifications error:', err.message);
      showToast("Error updating settings", "error");
    } finally {
      setSavingNotifications(false);
    }
  }

  return {
    profileUsername,
    avatarUrl,
    joinYear,
    totalVideos,
    currentStreak,
    dataLoading,
    editUsername,
    setEditUsername,
    savingUsername,
    signOutLoading,
    handleSaveUsername,
    handleSignOut,
    dailyReminder,
    setDailyReminder,
    streakAlerts,
    setStreakAlerts,
    savingNotifications,
    handleSaveNotifications,
  };
}
