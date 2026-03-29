import React, { createContext, useState, useContext } from 'react';

const AddVideoContext = createContext();

export function AddVideoProvider({ children }) {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  const show = () => setIsBottomSheetVisible(true);
  const hide = () => setIsBottomSheetVisible(false);

  return (
    <AddVideoContext.Provider value={{ isBottomSheetVisible, show, hide }}>
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
