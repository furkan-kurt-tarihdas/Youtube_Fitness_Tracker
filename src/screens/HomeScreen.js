import React, { useState, useCallback } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, StatusBar,
  TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../utils/colors';
import { fetchVideos, fetchWeeklyCompletions, addVideo } from '../services/db';
import Header from '../components/Header';
import WeeklyChart from '../components/WeeklyChart';
import VideoCard from '../components/VideoCard';

const THEME_COLORS = [
  { hex: '#D8B4E2', label: 'Mor' },
  { hex: '#FDEFB2', label: 'Sarı' },
  { hex: '#B5E4CA', label: 'Yeşil' },
  { hex: '#F9C4C4', label: 'Pembe' },
];

export default function HomeScreen() {
  const [videos, setVideos]           = useState([]);
  const [weeklyData, setWeeklyData]   = useState([]);
  const [loading, setLoading]         = useState(true);

  // Add-video form state
  const [youtubeUrl, setYoutubeUrl]   = useState('');
  const [videoTitle, setVideoTitle]   = useState('');
  const [themeColor, setThemeColor]   = useState(THEME_COLORS[0].hex);
  const [adding, setAdding]           = useState(false);

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
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  async function handleAddVideo() {
    if (!youtubeUrl.trim() || !videoTitle.trim()) {
      Alert.alert('Eksik bilgi', 'Lütfen YouTube linkini ve video başlığını girin.');
      return;
    }
    setAdding(true);
    try {
      await addVideo(youtubeUrl.trim(), videoTitle.trim(), themeColor);
      setYoutubeUrl('');
      setVideoTitle('');
      setThemeColor(THEME_COLORS[0].hex);
      await loadData();
    } catch (err) {
      Alert.alert('Hata', err.message);
    } finally {
      setAdding(false);
    }
  }

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
        contentContainerStyle={{ paddingBottom: 130 }}
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
          <AddVideoCard
            youtubeUrl={youtubeUrl}
            setYoutubeUrl={setYoutubeUrl}
            videoTitle={videoTitle}
            setVideoTitle={setVideoTitle}
            themeColor={themeColor}
            setThemeColor={setThemeColor}
            onAdd={handleAddVideo}
            adding={adding}
          />
        )}

        {/* Floating add button (when videos already exist) */}
        {hasVideos && (
          <View style={styles.addCardWrapper}>
            <Text style={styles.addCardTitle}>Yeni Video Ekle</Text>
            <TextInput
              style={styles.input}
              placeholder="YouTube linki"
              placeholderTextColor="#B0AEBA"
              value={youtubeUrl}
              onChangeText={setYoutubeUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Video başlığı"
              placeholderTextColor="#B0AEBA"
              value={videoTitle}
              onChangeText={setVideoTitle}
            />
            <View style={styles.colorRow}>
              {THEME_COLORS.map((c) => (
                <TouchableOpacity
                  key={c.hex}
                  onPress={() => setThemeColor(c.hex)}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c.hex },
                    themeColor === c.hex && styles.colorDotSelected,
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity
              style={[styles.addButton, adding && styles.addButtonDisabled]}
              onPress={handleAddVideo}
              disabled={adding}
              activeOpacity={0.8}
            >
              {adding
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.addButtonText}>Videoyu Ekle</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Empty State + Add Form ────────────────────────────────────────────────

function AddVideoCard({
  youtubeUrl, setYoutubeUrl,
  videoTitle, setVideoTitle,
  themeColor, setThemeColor,
  onAdd, adding,
}) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyEmoji}>🎯</Text>
      <Text style={styles.emptyTitle}>İlk videonı ekle!</Text>
      <Text style={styles.emptySubtitle}>
        Takip etmek istediğin YouTube videosunun linkini yapıştır ve günlük antrenmanını başlat.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="YouTube linki"
        placeholderTextColor="#B0AEBA"
        value={youtubeUrl}
        onChangeText={setYoutubeUrl}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Video başlığı (örn: Morning Yoga)"
        placeholderTextColor="#B0AEBA"
        value={videoTitle}
        onChangeText={setVideoTitle}
      />

      <Text style={styles.colorLabel}>Kart rengi seç</Text>
      <View style={styles.colorRow}>
        {THEME_COLORS.map((c) => (
          <TouchableOpacity
            key={c.hex}
            onPress={() => setThemeColor(c.hex)}
            style={[
              styles.colorDot,
              { backgroundColor: c.hex },
              themeColor === c.hex && styles.colorDotSelected,
            ]}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.addButton, adding && styles.addButtonDisabled]}
        onPress={onAdd}
        disabled={adding}
        activeOpacity={0.8}
      >
        {adding
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.addButtonText}>Videoyu Ekle</Text>}
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────

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

  /* Empty state / add card */
  emptyCard: {
    marginHorizontal: 24,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#C4B0D8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
  },
  emptyEmoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9A8FB5',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },

  /* Inline add card (when videos exist) */
  addCardWrapper: {
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#C4B0D8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  addCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },

  /* Shared form elements */
  input: {
    backgroundColor: '#F7F4FC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  colorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9A8FB5',
    marginBottom: 12,
  },
  colorRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: colors.text,
    transform: [{ scale: 1.15 }],
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#D8B4E2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  addButtonDisabled: { opacity: 0.6 },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
