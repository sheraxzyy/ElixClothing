import { useState, useEffect, useCallback } from 'react';
import soundManager from '../utils/soundManager';

export const useSound = () => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(soundManager.isEnabled());

  useEffect(() => {
    const unsubscribe = soundManager.subscribe((enabled) => {
      setSoundEnabled(enabled);
    });
    return unsubscribe;
  }, []);

  const toggleSound = useCallback(() => {
    return soundManager.toggleSound();
  }, []);

  const playClick = useCallback(() => {
    soundManager.playClick();
  }, []);

  const playAddToCart = useCallback(() => {
    soundManager.playAddToCart();
  }, []);

  const playSuccess = useCallback(() => {
    soundManager.playSuccess();
  }, []);

  const playNotification = useCallback(() => {
    soundManager.playNotification();
  }, []);

  const playRemove = useCallback(() => {
    soundManager.playRemove();
  }, []);

  const playModeSwitch = useCallback((isUltra: boolean) => {
    soundManager.playModeSwitch(isUltra);
  }, []);

  return {
    soundEnabled,
    toggleSound,
    playClick,
    playAddToCart,
    playSuccess,
    playNotification,
    playRemove,
    playModeSwitch,
  };
};

export default useSound;

