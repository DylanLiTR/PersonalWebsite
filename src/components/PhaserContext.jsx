import React, { createContext, useContext, useRef, useState } from 'react';

const PhaserContext = createContext();

export const usePhaser = () => {
  const context = useContext(PhaserContext);
  if (!context) {
    throw new Error('usePhaser must be used within a PhaserProvider');
  }
  return context;
};

export const PhaserProvider = ({ children }) => {
  const sceneRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const sendResponse = (data) => {
    if (sceneRef.current?.sceneManager?.speechBubble) {
      sceneRef.current.sceneManager.speechBubble.addText(data);
    }
  };

  return (
    <PhaserContext.Provider value={{ sceneRef, sendResponse, isLoading, loadingProgress, setIsLoading, setLoadingProgress }}>
      {children}
    </PhaserContext.Provider>
  );
};