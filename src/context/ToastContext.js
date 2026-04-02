import React, { createContext, useContext, useState, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

const ToastContext = createContext();

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    
    setToast({ visible: true, message, type });
    
    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    toastTimer.current = setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setToast((t) => ({ ...t, visible: false }));
      });
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <Animated.View
          style={[
            styles.toast,
            toast.type === 'error' ? styles.toastError : styles.toastSuccess,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <Text className="font-overlockBold" style={styles.toastText}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 104,
    left: 24,
    right: 24,
    zIndex: 9999, // global z-index
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
});
