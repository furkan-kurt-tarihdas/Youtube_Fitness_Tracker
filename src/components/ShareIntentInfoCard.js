import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../utils/colors';

export default function ShareIntentInfoCard() {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoEmoji}>📱</Text>
      <Text className="font-overlockBold" style={styles.infoTitle}>Share from YouTube!</Text>
      <Text className="font-overlock" style={styles.infoBody}>
        Open any video in the YouTube app and tap{' '}
        <Text className="font-overlockBold" style={{ fontWeight: '700' }}>Share → Lavender</Text>.
        The video will be added to your list automatically.
      </Text>
      <View style={styles.infoDivider} />
      <Text className="font-overlock" style={styles.infoHint}>
        Or tap the{' '}
        <Text className="font-overlockBold" style={{ fontWeight: '700' }}>+</Text>{' '}
        button below to add a link manually.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    marginHorizontal: 24,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#C4B0D8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
    alignItems: 'center',
  },
  infoEmoji: { fontSize: 44, marginBottom: 14 },
  infoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  infoBody: {
    fontSize: 14,
    color: '#7B6F9A',
    lineHeight: 22,
    textAlign: 'center',
  },
  infoDivider: {
    width: 40,
    height: 2,
    backgroundColor: '#E8E0F5',
    borderRadius: 2,
    marginVertical: 16,
  },
  infoHint: {
    fontSize: 13,
    color: '#9A8FB5',
    lineHeight: 20,
    textAlign: 'center',
  },
});
