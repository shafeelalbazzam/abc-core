import { useState, useCallback } from 'react';

/**
 * Plays the native Windows exclamation / asterisk chime tone using Web Audio API
 */
export function playWindowsDing() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();

    // Primary bell tone
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    osc1.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.22);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1320, audioCtx.currentTime); // E6 harmonic
    osc2.frequency.exponentialRampToValueAtTime(660, audioCtx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 0.25);
    osc2.stop(audioCtx.currentTime + 0.25);
  } catch (e) {
    // Autoplay or audio not available in this environment
  }
}

/**
 * Hook for Windows-style modal dialog alert:
 * Prevents closing when clicking outside the dialog.
 * Flashes the dialog, shakes it horizontally, and plays the Windows chime.
 */
export function useWindowsModalAlert() {
  const [isAlerting, setIsAlerting] = useState(false);

  const handleBackdropClick = useCallback((e) => {
    // Only fire if the click is directly on the outer backdrop container
    if (e.target !== e.currentTarget) return;

    e.preventDefault();
    e.stopPropagation();

    playWindowsDing();
    setIsAlerting(true);

    const timer = setTimeout(() => {
      setIsAlerting(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return {
    isAlerting,
    handleBackdropClick,
  };
}
