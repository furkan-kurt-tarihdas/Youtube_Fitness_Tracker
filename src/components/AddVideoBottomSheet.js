import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Modal, Pressable, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, Dimensions,
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
import { addVideo, fetchVideos } from '../services/db';
import { colors } from '../utils/colors';
import { Plus } from 'lucide-react-native';
import ColorPickerModal from './ColorPickerModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const THEME_COLORS = [
  { hex: '#D8B4E2', label: 'Mor' },
  { hex: '#FDEFB2', label: 'Sarı' },
  { hex: '#B5E4CA', label: 'Yeşil' },
  { hex: '#F9C4C4', label: 'Pembe' },
  { hex: '#B4D4E7', label: 'Mavi' },
];

export default function AddVideoBottomSheet() {
  const { isBottomSheetVisible, hide, notifyVideoAdded } = useAddVideo();

  // Local state to keep Modal mounted during exit animation
  const [shouldRender, setShouldRender] = useState(isBottomSheetVisible);

  const [youtubeLink, setYoutubeLink] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [themeColor, setThemeColor] = useState(THEME_COLORS[0].hex);
  const [newVideoTarget, setNewVideoTarget] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [usedColors, setUsedColors] = useState([]);

  const isCustomColor = !THEME_COLORS.find(c => c.hex === themeColor);
  const isColorUsedContext = usedColors.includes(themeColor.toLowerCase());

  // Animation values
  const overlayOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    if (isBottomSheetVisible) {
      // Fetch videos to lock used colors
      fetchVideos().then((vids) => {
        setUsedColors(vids.map(v => v.theme_color?.toLowerCase()));
      }).catch(console.error);

      setShouldRender(true);
      // Wait for Modal mount
      const timer = setTimeout(() => {
        overlayOpacity.value = withTiming(1, { duration: 400 });
        sheetTranslateY.value = withSpring(0, {
          damping: 20,
          stiffness: 80,
          mass: 1,
        });
      }, 50);
      return () => clearTimeout(timer);
    } else {
      // Slower, smoother hide animation
      overlayOpacity.value = withTiming(0, { duration: 400 });
      sheetTranslateY.value = withTiming(SCREEN_HEIGHT, { 
        duration: 450,
        easing: Easing.bezier(0.33, 1, 0.68, 1) // Smooth ease-out
      }, (finished) => {
        if (finished) {
          runOnJS(setShouldRender)(false);
        }
      });
      
      // Clear inputs
      setYoutubeLink('');
      setVideoTitle('');
      setThemeColor(THEME_COLORS[0].hex);
      setNewVideoTarget(1);
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
      console.warn('Add Video: missing URL or title');
      return;
    }
    setAdding(true);
    try {
      await addVideo(youtubeLink.trim(), videoTitle.trim(), themeColor, newVideoTarget);
      hide();
      notifyVideoAdded(); // Instantly refresh HomeScreen
    } catch (err) {
      console.warn('Add Video Error:', err.message);
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
        <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
          <Pressable style={styles.absoluteFull} onPress={hide} />
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View style={[styles.sheet, animatedSheetStyle]}>
            <View style={styles.handle} />

            <View style={styles.content}>
              <Text className="font-overlockBold" style={styles.title}>Add Video</Text>
              <Text className="font-overlock" style={styles.subtitle}>Paste a YouTube link and give it a title.</Text>

              <TextInput
                className="font-overlock"
                style={styles.input}
                placeholder="YouTube URL"
                placeholderTextColor="#C4B8D4"
                value={youtubeLink}
                onChangeText={setYoutubeLink}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                className="font-overlock"
                style={styles.input}
                placeholder="Video Title"
                placeholderTextColor="#C4B8D4"
                value={videoTitle}
                onChangeText={setVideoTitle}
              />

              <Text className="font-overlockBold" style={styles.colorLabel}>Choose Card Color</Text>
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
                
                {/* Custom Color Button */}
                <TouchableOpacity
                  onPress={() => setShowPicker(true)}
                  style={[
                    styles.colorDot,
                    isCustomColor ? { backgroundColor: themeColor } : { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
                    isCustomColor && styles.colorDotSelected,
                  ]}
                >
                  {!isCustomColor && <Plus size={20} color="#9CA3AF" />}
                </TouchableOpacity>
              </View>

              {isColorUsedContext && (
                <Text 
                  className="font-overlock" 
                  style={{ color: '#FF6B6B', fontSize: 13, marginTop: -20, marginBottom: 12 }}
                >
                  This color is already used by another video
                </Text>
              )}

              <ColorPickerModal
                visible={showPicker}
                onClose={() => setShowPicker(false)}
                onSelectColor={setThemeColor}
                initialColor={themeColor}
              />

              <Text className="font-overlockBold" style={styles.colorLabel}>Daily Target (Reps)</Text>
              <View style={styles.colorRow}>
                {[1, 2, 3].map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => setNewVideoTarget(num)}
                    style={[
                      styles.colorDot,
                      { backgroundColor: newVideoTarget === num ? colors.primary : '#F3EEF9', alignItems: 'center', justifyContent: 'center' },
                      newVideoTarget === num && styles.colorDotSelected,
                    ]}
                  >
                    <Text 
                      className="font-overlockBold" 
                      style={{ fontSize: 16, color: newVideoTarget === num ? 'white' : '#9A8FB5' }}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.cancelBtn]}
                  onPress={hide}
                >
                  <Text className="font-overlockBold" style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.addBtn, (adding || isColorUsedContext) && styles.disabledBtn]}
                  onPress={handleAdd}
                  disabled={adding || isColorUsedContext}
                >
                  {adding ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="font-overlockBold" style={styles.addText}>Add</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
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
    backgroundColor: 'rgba(20,15,40,0.5)',
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
    // EXPLAIN: Padding bottom ensures no gap during spring bounce
    paddingBottom: Platform.OS === 'ios' ? 340 : 320, 
    marginBottom: -300, // Anchors the visible part back to the bottom
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 20,
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
