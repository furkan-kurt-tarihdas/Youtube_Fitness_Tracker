import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Modal, Pressable, StyleSheet, ActivityIndicator,
  Alert, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useAddVideo } from '../context/AddVideoContext';
import { addVideo } from '../services/db';
import { colors } from '../utils/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const THEME_COLORS = [
  { hex: '#D8B4E2', label: 'Mor' },
  { hex: '#FDEFB2', label: 'Sarı' },
  { hex: '#B5E4CA', label: 'Yeşil' },
  { hex: '#F9C4C4', label: 'Pembe' },
  { hex: '#B4D4E7', label: 'Mavi' },
];

export default function AddVideoBottomSheet() {
  const { isBottomSheetVisible, hide } = useAddVideo();

  // Local state to keep Modal mounted during exit animation
  const [shouldRender, setShouldRender] = useState(isBottomSheetVisible);

  const [youtubeLink, setYoutubeLink] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0].hex);
  const [adding, setAdding] = useState(false);

  // Animation values
  const overlayOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    if (isBottomSheetVisible) {
      setShouldRender(true);
      // Wait a tiny bit for Modal to mount before starting animation
      const timer = setTimeout(() => {
        overlayOpacity.value = withTiming(1, { duration: 300 });
        sheetTranslateY.value = withSpring(0, {
          damping: 25, // Slightly less bouncy
          stiffness: 100,
        });
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Hide animations
      overlayOpacity.value = withTiming(0, { duration: 250 });
      sheetTranslateY.value = withTiming(SCREEN_HEIGHT, { 
        duration: 300,
        easing: Easing.out(Easing.exp) // Smoother exit
      }, (finished) => {
        if (finished) {
          runOnJS(setShouldRender)(false);
        }
      });
      
      // Clear inputs
      setYoutubeLink('');
      setVideoTitle('');
      setThemeColor(THEME_COLORS[0].hex);
      setAdding(false);
    }
  }, [isBottomSheetVisible]);

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  async function handleAdd() {
    if (!youtubeLink.trim() || !videoTitle.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen YouTube linkini ve video başlığını girin.');
      return;
    }
    setAdding(true);
    try {
      await addVideo(youtubeLink.trim(), videoTitle.trim(), themeColor);
      hide();
    } catch (err) {
      Alert.alert('Hata', err.message);
    } finally {
      setAdding(false);
    }
  }

  if (!shouldRender && !isBottomSheetVisible) return null;

  return (
    <Modal
      visible={shouldRender}
      transparent
      animationType="none"
      onRequestClose={hide}
    >
      <View style={styles.container}>
        {/* Fading Backdrop Overlay */}
        <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
          <Pressable style={styles.absoluteFull} onPress={hide} />
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Sliding Sheet */}
          <Animated.View style={[styles.sheet, animatedSheetStyle]}>
            <View style={styles.handle} />

            <View style={styles.content}>
              <Text style={styles.title}>Manuel Video Ekle</Text>
              <Text style={styles.subtitle}>YouTube linkini ve video adını yazarak listene ekleyebilirsin.</Text>

              <TextInput
                style={styles.input}
                placeholder="YouTube URL"
                placeholderTextColor="#C4B8D4"
                value={youtubeLink}
                onChangeText={setYoutubeLink}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.input}
                placeholder="Video Başlığı"
                placeholderTextColor="#C4B8D4"
                value={videoTitle}
                onChangeText={setVideoTitle}
              />

              <Text style={styles.colorLabel}>Kart Rengi Seç</Text>
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

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.cancelBtn]}
                  onPress={hide}
                >
                  <Text style={styles.cancelText}>Vazgeç</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.addBtn, adding && styles.disabledBtn]}
                  onPress={handleAdd}
                  disabled={adding}
                >
                  {adding ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.addText}>Ekle</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            {/* 🛡️ GAP BUFFER:
                We add a view that extends below the sheet to "fill" the gap 
                during spring overshoot/bounce. 
            */}
            <View style={styles.bottomBuffer} />
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,15,40,0.5)', // Slightly deeper for better focus
  },
  absoluteFull: {
    flex: 1,
  },
  keyboardView: {
    width: '100%',
  },
  sheet: {
    backgroundColor: '#FDFAF8',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 20,
  },
  bottomBuffer: {
    position: 'absolute',
    bottom: -200, // Extends far below
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#FDFAF8', // Same as sheet background
  },
  handle: {
    width: 44,
    height: 5,
    backgroundColor: '#E8E0F5',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  content: {
    padding: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9A8FB5',
    lineHeight: 20,
    marginBottom: 26,
  },
  input: {
    backgroundColor: '#F3EEF9',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    marginBottom: 14,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9A8FB5',
    marginTop: 8,
    marginBottom: 14,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 32,
  },
  colorDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: colors.text,
    transform: [{ scale: 1.2 }],
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 14,
  },
  btn: {
    flex: 1,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#EDE8F5',
  },
  cancelText: {
    fontSize: 16,
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
  addText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
