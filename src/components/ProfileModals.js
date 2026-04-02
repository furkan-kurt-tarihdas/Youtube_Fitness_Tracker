import React, { useState } from 'react';
import { View, Text, Modal, Pressable, Switch, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../utils/colors';

export function NotificationModal({ 
  visible, onClose, 
  dailyReminder, setDailyReminder, 
  streakAlerts, setStreakAlerts, 
  onSave, saving 
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center px-6" onPress={onClose}>
        <Pressable className="w-full rounded-3xl p-6" style={{ backgroundColor: colors.background }} onPress={e => e.stopPropagation()}>
          <Text className="text-xl font-overlockBold mb-6" style={{ color: colors.text }}>Notification Settings</Text>
          <View className="flex-row items-center justify-between mb-4 py-3 px-4 bg-white rounded-2xl">
            <Text className="text-sm font-overlock font-semibold flex-1 mr-3" style={{ color: colors.text }}>Daily Workout Reminder</Text>
            <Switch value={dailyReminder} onValueChange={setDailyReminder} trackColor={{ false: '#e5e5e5', true: '#c4a6d1' }} thumbColor="#FFFFFF" />
          </View>
          <View className="flex-row items-center justify-between mb-6 py-3 px-4 bg-white rounded-2xl">
            <Text className="text-sm font-overlock font-semibold flex-1 mr-3" style={{ color: colors.text }}>Streak Alerts</Text>
            <Switch value={streakAlerts} onValueChange={setStreakAlerts} trackColor={{ false: '#e5e5e5', true: '#c4a6d1' }} thumbColor="#FFFFFF" />
          </View>
          <TouchableOpacity onPress={onSave} disabled={saving} className="w-full h-14 rounded-2xl items-center justify-center" style={{ backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }}>
            {saving ? <ActivityIndicator color={colors.text} /> : <Text className="text-base font-overlockBold" style={{ color: colors.text }}>Done</Text>}
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function AccountSettingsModal({ visible, onClose, editUsername, setEditUsername, onSave, saving }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center px-6" onPress={onClose}>
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
            <TouchableOpacity onPress={onClose} className="flex-1 h-14 rounded-2xl items-center justify-center bg-gray-100">
              <Text className="text-base font-overlockBold text-gray-500">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSave}
              disabled={saving}
              className="flex-1 h-14 rounded-2xl items-center justify-center"
              style={{ backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }}
            >
              {saving
                ? <ActivityIndicator color={colors.text} />
                : <Text className="text-base font-overlockBold" style={{ color: colors.text }}>Save</Text>}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function SignOutModal({ visible, onClose, onSignOut, loading }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 justify-center items-center px-6" onPress={onClose}>
        <Pressable className="w-full rounded-3xl p-6" style={{ backgroundColor: colors.background }} onPress={e => e.stopPropagation()}>
          <Text className="text-xl font-overlockBold mb-3 text-center" style={{ color: colors.text }}>Signing Out</Text>
          <Text className="text-sm font-overlock text-center mb-8" style={{ color: '#6B7280' }}>
            Are you sure you want to leave? The cool stuff will be waiting for you! 🏋️
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={onClose} className="flex-1 h-14 rounded-2xl items-center justify-center bg-gray-100">
              <Text className="text-base font-overlockBold text-gray-500">Stay</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSignOut} disabled={loading} className="flex-1 h-14 rounded-2xl items-center justify-center bg-red-100" style={{ opacity: loading ? 0.6 : 1 }}>
              {loading
                ? <ActivityIndicator color="#EF4444" />
                : <Text className="text-base font-overlockBold text-red-500">Sign Out</Text>}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
