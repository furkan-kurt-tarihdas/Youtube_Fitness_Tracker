import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import ColorPicker, { Panel1, Swatches, Preview, HueSlider } from 'reanimated-color-picker';
import { runOnJS } from 'react-native-reanimated';
import { colors } from '../utils/colors';

export default function ColorPickerModal({ visible, onClose, onSelectColor, initialColor }) {
  const [selectedColor, setSelectedColor] = useState(initialColor || colors.primary);

  const onColorSelect = (color) => {
    'worklet';
    runOnJS(setSelectedColor)(color.hex);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <Text style={styles.title}>Pick a Custom Color</Text>
              
              <ColorPicker 
                style={styles.picker} 
                value={selectedColor} 
                onComplete={onColorSelect}
              >
                <Preview style={styles.preview} />
                <Panel1 style={styles.panel} />
                <HueSlider style={styles.slider} />
                <Swatches style={styles.swatches} colors={['#D8B4E2', '#FDEFB2', '#B5E4CA', '#F9C4C4', '#A0D2EB', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD']} />
              </ColorPicker>

              <View style={styles.buttons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.applyBtn, { backgroundColor: selectedColor }]} 
                  onPress={() => {
                    onSelectColor(selectedColor);
                    onClose();
                  }}
                >
                  <Text style={styles.applyText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Overlock_700Bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  picker: {
    gap: 16,
  },
  preview: {
    height: 40,
    borderRadius: 12,
    marginBottom: 10,
  },
  panel: {
    height: 150,
    borderRadius: 12,
  },
  slider: {
    height: 30,
    borderRadius: 15,
  },
  swatches: {
    marginTop: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  cancelText: {
    color: '#6B7280',
    fontFamily: 'Overlock_700Bold',
    fontSize: 15,
  },
  applyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  applyText: {
    color: 'white',
    fontFamily: 'Overlock_700Bold',
    fontSize: 15,
  },
});
