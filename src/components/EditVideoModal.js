import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors } from '../utils/colors';
import { THEME_COLORS } from '../constants/theme';
import ColorPickerModal from './ColorPickerModal';
import { updateVideo, deleteVideo } from '../services/db';
import { useToast } from '../context/ToastContext';

export default function EditVideoModal({ visible, video, videos, onClose, onSaveSuccess, onDeleteSuccess }) {
  const [editTitle, setEditTitle] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editVideoTarget, setEditVideoTarget] = useState(1);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (visible && video) {
      setEditTitle(video.title);
      setEditColor(video.theme_color || THEME_COLORS[0].hex);
      setEditVideoTarget(video.daily_goal || 1);
    }
  }, [visible, video]);

  if (!video) return null;

  const isCustomColor = !THEME_COLORS.find(c => c.hex.toLowerCase() === editColor.toLowerCase());

  const hasChanges = (
    editTitle.trim() !== video.title ||
    editColor.toLowerCase() !== (video.theme_color || THEME_COLORS[0].hex).toLowerCase() ||
    editVideoTarget !== (video.daily_goal || 1)
  );

  const otherUsedColors = videos
    .filter(v => v.id !== video.id)
    .map(v => v.theme_color?.toLowerCase());
    
  const isColorUsedByOther = otherUsedColors.includes(editColor.toLowerCase());
  const isSaveDisabled = !hasChanges || isColorUsedByOther;

  async function handleSave() {
    if (!hasChanges) return;
    setSaving(true);
    try {
      await updateVideo(video.id, editTitle, editColor, editVideoTarget);
      onClose();
      if (onSaveSuccess) await onSaveSuccess();
      showToast('Video updated! ✏️');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteVideo(video.id);
      onClose();
      if (onDeleteSuccess) await onDeleteSuccess();
      showToast('Video deleted. 🗑️');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => { }}>
          <Text className="font-overlockBold" style={styles.modalTitle}>Edit Video</Text>
          <Text className="font-overlock" style={styles.modalSubtitle}>You can change the title or card color.</Text>

          <TextInput
            className="font-overlock"
            style={[styles.input, styles.inputDisabled]}
            value={video.youtube_id ? `youtube.com/watch?v=${video.youtube_id}` : ''}
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

          <Text className="font-overlockBold" style={styles.colorLabel}>Choose card color</Text>
          <View style={styles.colorRow}>
            {THEME_COLORS.map((c) => (
              <TouchableOpacity
                key={c.hex}
                onPress={() => setEditColor(c.hex)}
                style={[
                  styles.colorDot,
                  { backgroundColor: c.hex },
                  editColor.toLowerCase() === c.hex.toLowerCase() && styles.colorDotSelected,
                ]}
              />
            ))}
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

          {isColorUsedByOther && (
            <Text 
              className="font-overlock" 
              style={{ color: '#FF6B6B', fontSize: 13, marginTop: -12, marginBottom: 12 }}
            >
              This color is already used by another video
            </Text>
          )}

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
                (isSaveDisabled || saving) && styles.btnDisabled,
              ]}
              onPress={handleSave}
              disabled={isSaveDisabled || saving || deleting}
            >
              {saving
                ? <ActivityIndicator color="white" size="small" />
                : <Text className="font-overlockBold" style={styles.saveBtnText}>Save</Text>}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
