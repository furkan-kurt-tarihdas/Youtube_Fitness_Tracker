import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ScrollView, View, Text, StatusBar,
  TextInput, TouchableOpacity, Modal, Pressable,
  StyleSheet, ActivityIndicator, Animated, AppState,
  ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../utils/colors';
import { fetchVideos, fetchWeeklyCompletions, fetchTodayCompletions, updateVideo, deleteVideo } from '../services/db';
import { useAddVideo } from '../context/AddVideoContext';
import Header from '../components/Header';
import WeeklyChart from '../components/WeeklyChart';
import VideoCard from '../components/VideoCard';
import { Plus } from 'lucide-react-native';
import ColorPickerModal from '../components/ColorPickerModal';

const THEME_COLORS = [
  { hex: '#D8B4E2', label: 'Mor' },
  { hex: '#FDEFB2', label: 'Sarı' },
  { hex: '#B5E4CA', label: 'Yeşil' },
  { hex: '#F9C4C4', label: 'Pembe' },
  { hex: '#B4D4E7', label: 'Mavi' },
];

const backgroundImage = require('../../assets/bg_lavender.png');

export default function HomeScreen() {
  const [videos, setVideos] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayCompletions, setTodayCompletions] = useState([]);

  // Toast
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef(null);

  // Edit modal state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editVideoTarget, setEditVideoTarget] = useState(1);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const isCustomColor = !THEME_COLORS.find(c => c.hex === editColor);

  // Register loadData as the refresh callback for AddVideoBottomSheet
  const { registerOnVideoAdded } = useAddVideo();
  useEffect(() => {
    registerOnVideoAdded(loadData);
  }, [loadData]);

  // ─── Toast helper ────────────────────────────────────────
  function showToast(message, type = 'success') {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, message, type });
    Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setToast(t => ({ ...t, visible: false }));
      });
    }, 3000);
  }

  // ─── Data loading ────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [vids, weekly, today] = await Promise.all([
        fetchVideos(),
        fetchWeeklyCompletions(),
        fetchTodayCompletions(),
      ]);
      setVideos(vids);
      setWeeklyData(weekly);
      setTodayCompletions(today);
    } catch (err) {
      console.error(err);
      showToast('Failed to load data.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();

      const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          loadData();
        }
      });

      return () => {
        subscription.remove();
      };
    }, [loadData])
  );

  // ─── Edit modal ──────────────────────────────────────────
  function openEditModal(video) {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditColor(video.theme_color || THEME_COLORS[0].hex);
    setEditVideoTarget(video.daily_goal || 1);
    setIsEditModalVisible(true);
  }

  function closeEditModal() {
    setIsEditModalVisible(false);
    setEditingVideo(null);
  }

  const hasChanges = editingVideo && (
    editTitle.trim() !== editingVideo.title ||
    editColor !== editingVideo.theme_color ||
    editVideoTarget !== (editingVideo.daily_goal || 1)
  );

  async function handleSave() {
    if (!hasChanges || !editingVideo) return;
    setSaving(true);
    try {
      await updateVideo(editingVideo.id, editTitle, editColor, editVideoTarget);
      closeEditModal();
      await loadData();
      showToast('Video updated! ✏️');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingVideo) return;
    setDeleting(true);
    try {
      await deleteVideo(editingVideo.id);
      closeEditModal();
      await loadData();
      showToast('Video deleted. 🗑️');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  // ─── Render ──────────────────────────────────────────────
  const hasVideos = videos.length > 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground
      source={backgroundImage}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        {/* Toast Notification — above nav bar */}
        {toast.visible && (
          <Animated.View
            style={[
              styles.toast,
              toast.type === 'error' ? styles.toastError : styles.toastSuccess,
              { opacity: toastAnim, transform: [{ translateY: toastAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] },
            ]}
            pointerEvents="none"
          >
            <Text className="font-overlockBold" style={styles.toastText}>{toast.message}</Text>
          </Animated.View>
        )}

        <ScrollView
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Header isEmpty={!hasVideos} />
          <View style={{ height: 16 }} />
          <WeeklyChart data={weeklyData} isEmpty={!hasVideos} />

          {hasVideos ? (
            <>
              <View style={styles.sectionHeader}>
                <Text className="font-overlockBold" style={[styles.sectionTitle, { color: colors.text }]}>Daily Challenge</Text>
              </View>
              {videos.map((video) => {
                const isCompletedToday = todayCompletions.some(
                  c => c.youtube_id === video.youtube_id && (c.reps_completed ?? 1) >= (video.daily_goal ?? 1)
                );
                return (
                  <VideoCard
                    key={video.id}
                    video={video}
                    isCompletedToday={isCompletedToday}
                    onComplete={loadData}
                    onEditPress={openEditModal}
                  />
                );
              })}
            </>
          ) : (
            <ShareIntentInfoCard />
          )}
        </ScrollView>

        {/* Edit Modal */}
        <Modal
          visible={isEditModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeEditModal}
        >
          <Pressable style={styles.modalOverlay} onPress={closeEditModal}>
            <Pressable style={styles.modalCard} onPress={() => { }}>
              <Text className="font-overlockBold" style={styles.modalTitle}>Edit Video</Text>
              <Text className="font-overlock" style={styles.modalSubtitle}>You can change the title or card color.</Text>

              {/* Read-only URL field */}
              <TextInput
                className="font-overlock"
                style={[styles.input, styles.inputDisabled]}
                value={
                  editingVideo?.youtube_id
                    ? `youtube.com/watch?v=${editingVideo.youtube_id}`
                    : ''
                }
                editable={false}
              />

              <TextInput
                className="font-overlock"
                style={styles.input}
                placeholder="Video Title"
                placeholderTextColor="#C4B8D4"
                value={editTitle}
                onChangeText={setEditTitle}
              />

              {/* Color picker */}
              <Text className="font-overlockBold" style={styles.colorLabel}>Choose card color</Text>
              <View style={styles.colorRow}>
                {THEME_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c.hex}
                    onPress={() => setEditColor(c.hex)}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c.hex },
                      editColor === c.hex && styles.colorDotSelected,
                    ]}
                  />
                ))}
                {/* Custom Color Button */}
                <TouchableOpacity
                  onPress={() => setShowColorPicker(true)}
                  style={[
                    styles.colorDot,
                    isCustomColor ? { backgroundColor: editColor } : { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
                    isCustomColor && styles.colorDotSelected,
                  ]}
                >
                  {!isCustomColor && <Plus size={20} color="#9CA3AF" />}
                </TouchableOpacity>
              </View>

              <ColorPickerModal
                visible={showColorPicker}
                onClose={() => setShowColorPicker(false)}
                onSelectColor={setEditColor}
                initialColor={editColor || THEME_COLORS[0].hex}
              />

              <Text className="font-overlockBold" style={styles.colorLabel}>Daily Target (Reps)</Text>
              <View style={styles.colorRow}>
                {[1, 2, 3].map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => setEditVideoTarget(num)}
                    style={[
                      styles.colorDot,
                      { backgroundColor: editVideoTarget === num ? colors.primary : '#F3EEF9', alignItems: 'center', justifyContent: 'center' },
                      editVideoTarget === num && styles.colorDotSelected,
                    ]}
                  >
                    <Text 
                      className="font-overlockBold" 
                      style={{ fontSize: 16, color: editVideoTarget === num ? 'white' : '#9A8FB5' }}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sil / Kaydet */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.deleteBtn, deleting && styles.btnDisabled]}
                  onPress={handleDelete}
                  disabled={deleting || saving}
                >
                  {deleting
                    ? <ActivityIndicator color="white" size="small" />
                    : <Text className="font-overlockBold" style={styles.deleteBtnText}>🗑️ Delete</Text>}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalBtn, styles.saveBtn,
                    (!hasChanges || saving) && styles.btnDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={!hasChanges || saving || deleting}
                >
                  {saving
                    ? <ActivityIndicator color="white" size="small" />
                    : <Text className="font-overlockBold" style={styles.saveBtnText}>Save</Text>}
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

// ─── Empty State Info Card ──────────────────────────────────

function ShareIntentInfoCard() {
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

// ─── Styles ────────────────────────────────────────────────

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 104,
    left: 24,
    right: 24,
    zIndex: 999,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  toastSuccess: {
    backgroundColor: '#EBF9F1',
    borderWidth: 1,
    borderColor: '#A8E6C2',
  },
  toastError: {
    backgroundColor: '#FFF0F3',
    borderWidth: 1,
    borderColor: '#F9C4C4',
  },
  toastText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3D3D5C',
    flex: 1,
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

  // Empty State
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

  // Edit Modal
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
  inputDisabled: {
    backgroundColor: '#EDEAF2',
    color: '#B0A8C8',
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
  deleteBtn: {
    backgroundColor: '#FDE8E8',
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#C0392B',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    shadowColor: '#D8B4E2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  btnDisabled: {
    opacity: 0.45,
  },
});
