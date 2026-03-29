import React, { useState, useCallback } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, StatusBar,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../utils/colors';
import { fetchVideos, fetchWeeklyCompletions } from '../services/db';
import Header from '../components/Header';
import WeeklyChart from '../components/WeeklyChart';
import VideoCard from '../components/VideoCard';

export default function HomeScreen() {
  const [videos, setVideos]         = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading]       = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [vids, weekly] = await Promise.all([
        fetchVideos(),
        fetchWeeklyCompletions(),
      ]);
      setVideos(vids);
      setWeeklyData(weekly);
    } catch (err) {
      Alert.alert('Veri Yüklenemedi', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => { loadData(); }, [loadData])
  );

  const hasVideos = videos.length > 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Header isEmpty={!hasVideos} />
        <WeeklyChart data={weeklyData} isEmpty={!hasVideos} />

        {hasVideos ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Challenge</Text>
            </View>
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} onComplete={loadData} />
            ))}
          </>
        ) : (
          <ShareIntentInfoCard />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Empty State Info Card ────────────────────────────────────────────────────

function ShareIntentInfoCard() {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoEmoji}>📱</Text>
      <Text style={styles.infoTitle}>YouTube'dan Paylaş!</Text>
      <Text style={styles.infoBody}>
        YouTube uygulamasında bir video açıp{' '}
        <Text style={{ fontWeight: '700' }}>Paylaş → Lavender</Text>{' '}
        seçeneğine dokun. Video otomatik olarak listenize eklenir.
      </Text>
      <View style={styles.infoDivider} />
      <Text style={styles.infoHint}>
        Ya da aşağıdaki{' '}
        <Text style={{ fontWeight: '700' }}>+</Text>{' '}
        butonuna dokunarak manuel ekleyebilirsin.
      </Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },

  /* Info card (empty state) */
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
