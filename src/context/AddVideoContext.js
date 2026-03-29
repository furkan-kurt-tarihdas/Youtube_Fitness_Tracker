import React, { createContext, useState, useContext, useRef } from 'react';

const AddVideoContext = createContext();

export function AddVideoProvider({ children }) {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  
  // Stores the callback registered by HomeScreen to refresh its list
  const onVideoAddedRef = useRef(null);

  const show = () => setIsBottomSheetVisible(true);
  const hide = () => setIsBottomSheetVisible(false);

  // Called by AddVideoBottomSheet after a successful add
  const notifyVideoAdded = () => {
    if (onVideoAddedRef.current) {
      onVideoAddedRef.current();
    }
  };

  // Called by HomeScreen to register its refresh callback
  const registerOnVideoAdded = (cb) => {
    onVideoAddedRef.current = cb;
  };

  return (
    <AddVideoContext.Provider value={{ isBottomSheetVisible, show, hide, notifyVideoAdded, registerOnVideoAdded }}>
      {children}
    </AddVideoContext.Provider>
  );
}

export function useAddVideo() {
  const context = useContext(AddVideoContext);
  if (!context) {
    throw new Error('useAddVideo must be used within an AddVideoProvider');
  }
  return context;
}
