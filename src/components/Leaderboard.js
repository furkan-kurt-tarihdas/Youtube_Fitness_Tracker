import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../utils/colors';

const DEFAULT_AVATAR = (username) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'A')}&background=D8B4E2&color=3D3D5C&size=128`;

export default function Leaderboard({ data, themeColor }) {
  const highlightColor = themeColor || colors.primary;
  
  if (!data || data.length === 0) {
    return (
      <BlurView 
        intensity={40} 
        tint="light" 
        style={styles.container}
      >
        <Text style={styles.title}>
          Leaderboard
        </Text>
        <Text style={styles.emptyText}>
          No completions yet. Be the first! 🏆
        </Text>
      </BlurView>
    );
  }

  return (
    <BlurView 
      intensity={40} 
      tint="light" 
      style={styles.container}
    >
      <Text style={styles.title}>
        Leaderboard
      </Text>
      {data.map((item, index) => (
        <View
          key={item.id}
          style={[
            styles.row,
            { backgroundColor: item.isCurrentUser ? `${highlightColor}40` : 'transparent' }
          ]}
        >
          <View style={styles.userInfo}>
            <Text style={styles.rank}>
              {index + 1}
            </Text>
            <Image
              source={{ uri: item.avatar_url || DEFAULT_AVATAR(item.username) }}
              style={styles.avatar}
            />
            <Text
              style={styles.username}
              numberOfLines={1}
            >
              {item.username}
              {item.isCurrentUser ? ' (You)' : ''}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.streakText}>
              {item.streak}-day streak
            </Text>
          </View>
        </View>
      ))}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(216, 180, 226, 0.4)',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Overlock_700Bold',
    color: colors.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'Overlock_400Regular',
    textAlign: 'center',
    paddingVertical: 12,
    color: '#9CA3AF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 8,
    borderRadius: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rank: {
    color: '#6B7280',
    fontFamily: 'Overlock_700Bold',
    fontSize: 13,
    width: 20,
    textAlign: 'center',
    marginRight: 6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: '#F3F4F6',
  },
  username: {
    fontSize: 14,
    flex: 1,
    fontFamily: 'Overlock_700Bold',
    color: colors.text,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginLeft: 6,
  },
  streakText: {
    fontSize: 11,
    fontFamily: 'Overlock_700Bold',
    color: colors.text,
  },
});
