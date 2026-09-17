import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speechService } from '../services/speechService';

export default function SpeechSpeaker({ text, label = "Listen Aloud", lang = "en" }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Sync state with global speech service
    const unsubscribe = speechService.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => unsubscribe();
  }, []);

  const handleSpeak = (e) => {
    e.stopPropagation();

    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
      return;
    }

    speechService.speak(text, lang, 0.85, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  return (
    <button
      type="button"
      className="speaker-btn"
      onClick={handleSpeak}
      title={isSpeaking ? "Stop Voice" : label}
      aria-label={label}
    >
      {isSpeaking ? (
        <>
          <VolumeX size={24} color="#B45309" />
          <span>Speaking... (Tap to Pause)</span>
        </>
      ) : (
        <>
          <Volume2 size={24} color="#B45309" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
