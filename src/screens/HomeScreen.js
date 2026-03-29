import React, { useState, useCallback } from 'react';
import {
  SafeAreaView, ScrollView, View, Text, StatusBar,
  TextInput, TouchableOpacity, Modal, Pressable,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { Plus } from 'lucide-react-native';
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
  { hex: '#B4D4E7', label: 'Mavi' },
];

export default function HomeScreen() {
  const [videos, setVideos]         = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading]       = useState(true);

  // Manual add modal state
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [youtubeLink, setYoutubeLink]             = useState('');
  const [videoTitle, setVideoTitle]               = useState('');
  const [themeColor, setThemeColor]               = useState(THEME_COLORS[0].hex);
  const [adding, setAdding]                       = useState(false);

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

  function openAddModal() {
    setYoutubeLink('');
    setVideoTitle('');
    setThemeColor(THEME_COLORS[0].hex);
    setIsAddModalVisible(true);
  }

  async function handleAddVideo() {
    if (!youtubeLink.trim() || !videoTitle.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen YouTube linkini ve video başlığını girin.');
      return;
    }
    setAdding(true);
    try {
      await addVideo(youtubeLink.trim(), videoTitle.trim(), themeColor);
      setIsAddModalVisible(false);
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

      {/* FAB — Manuel Link Ekle */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openAddModal}
        activeOpacity={0.85}
      >
        <Plus color="white" size={20} strokeWidth={2.5} />
        <Text style={styles.fabText}>Manuel Link Ekle</Text>
      </TouchableOpacity>

      {/* Manuel Ekleme Modalı */}
      <Modal
        visible={isAddModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsAddModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Manuel Video Ekle</Text>
            <Text style={styles.modalSubtitle}>YouTube linkini yapıştır ve başlığını gir.</Text>

            <TextInput
              style={styles.input}
              placeholder="YouTube linki (youtube.com veya youtu.be)"
              placeholderTextColor="#C4B8D4"
              value={youtubeLink}
              onChangeText={setYoutubeLink}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Video başlığı (örn: Morning Yoga)"
              placeholderTextColor="#C4B8D4"
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

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setIsAddModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.addBtn, adding && styles.btnDisabled]}
                onPress={handleAddVideo}
                disabled={adding}
                activeOpacity={0.8}
              >
                {adding
                  ? <ActivityIndicator color="white" size="small" />
                  : <Text style={styles.addBtnText}>Ekle</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
        Ya da sağ alttaki{' '}
        <Text style={{ fontWeight: '700' }}>+ Manuel Link Ekle</Text>{' '}
        butonunu kullanabilirsin.
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

  /* FAB */
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 13,
    paddingHorizontal: 18,
    shadowColor: '#D8B4E2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 7,
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30,20,50,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FDFAF8',
    borderRadius: 28,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#9A8FB5',
    marginBottom: 22,
    lineHeight: 19,
  },
  input: {
    backgroundColor: '#F3EEF9',
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
    marginTop: 4,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: colors.text,
    transform: [{ scale: 1.18 }],
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: { backgroundColor: '#EDE8F5' },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9A8FB5',
  },
  addBtn: {
    backgroundColor: colors.primary,
    shadowColor: '#D8B4E2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  btnDisabled: { opacity: 0.6 },
});
