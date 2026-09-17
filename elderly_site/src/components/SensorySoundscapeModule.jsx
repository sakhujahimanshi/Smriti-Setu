import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Play, Pause, Wind, Droplets, Music, Bell } from 'lucide-react';

export default function SensorySoundscapeModule({ onSessionComplete, apiUrl, lang = 'en', t }) {
  const sStrings = t?.soundscapes || {};
  const [playingTrack, setPlayingTrack] = useState(null);
  const [isInhaling, setIsInhaling] = useState(true);
  const audioContextRef = useRef(null);
  const oscillatorNodesRef = useRef([]);

  // Breathing cycle timer
  useEffect(() => {
    const interval = setInterval(() => {
      setIsInhaling(prev => !prev);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const breathePhase = isInhaling
    ? (sStrings.breatheIn || 'Breathe In Slowly...')
    : (sStrings.breatheOut || 'Breathe Out Peacefully...');

  // Stop active Web Audio synth sounds
  const stopAudio = () => {
    oscillatorNodesRef.current.forEach(node => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {}
    });
    oscillatorNodesRef.current = [];
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopAudio();
  }, []);

  // Synthesize ambient calming tones using native Web Audio API
  const playTrack = (trackId) => {
    stopAudio();

    if (playingTrack === trackId) {
      setPlayingTrack(null);
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      if (trackId === 'naam_ghor_bell') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, ctx.currentTime);

        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscillatorNodesRef.current.push(osc);
      } else if (trackId === 'bamboo_flute') {
        const freqs = [330, 440, 495, 660];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          oscillatorNodesRef.current.push(osc);
        });
      } else if (trackId === 'brahmaputra_rain') {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          output[i] = (b0 + b1 + b2) * 0.08;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(ctx.destination);
        whiteNoise.start();
        oscillatorNodesRef.current.push(whiteNoise);
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscillatorNodesRef.current.push(osc);
      }

      setPlayingTrack(trackId);
    } catch (e) {
      console.warn("Web Audio error:", e);
    }
  };

  const tracks = [
    {
      id: 'brahmaputra_rain',
      title: lang === 'bn' ? 'ব্রহ্মপুত্রের শান্ত বৃষ্টি' : lang === 'ne' ? 'ब्रह्मपुत्रको शान्त वर्षा' : lang === 'as' ? 'ব্ৰহ্মপুত্ৰৰ বৰষুণ' : 'Brahmaputra Gentle Rain',
      description: lang === 'bn' ? 'টিনের চালে মিষ্টি বৃষ্টির শব্দ' : lang === 'ne' ? 'छानामा पर्ने पानीको मधुर आवाज' : lang === 'as' ? 'বাৰান্দাত পৰা বৰষুণৰ টোপাল' : 'Soothing sound of rain tapping on the veranda.',
      icon: Droplets,
      color: '#0284C7'
    },
    {
      id: 'bamboo_flute',
      title: lang === 'bn' ? 'বাঁশির সুর' : lang === 'ne' ? 'बाँसुरीको धुन' : lang === 'as' ? 'বাঁহীৰ সুৰ' : 'Soothing Bamboo Flute',
      description: lang === 'bn' ? 'মন শান্ত করা মিষ্টি বাঁশির ধ্বনি' : lang === 'ne' ? 'मनलाई शान्ति दिने बाँसुरी' : lang === 'as' ? 'পৰম্পৰাগত বাঁহীৰ শান্তিময় সুৰ' : 'Gentle traditional flute notes for peaceful relaxation.',
      icon: Music,
      color: '#D97706'
    },
    {
      id: 'naam_ghor_bell',
      title: lang === 'bn' ? 'মন্দিরের পবিত্র ঘণ্টা' : lang === 'ne' ? 'मन्दिरको घण्टी र ध्वनि' : lang === 'as' ? 'নামঘৰৰ কাঁহ আৰু ঘণ্টা' : 'Sacred Chime & Bell',
      description: lang === 'bn' ? 'সন্ধ্যার প্রার্থনার গম্ভীর ও মধুর ঘণ্টা' : lang === 'ne' ? 'साँझको पवित्र घण्टीको धुन' : lang === 'as' ? 'সন্ধিয়াৰ পৱিত্ৰ ঘণ্টাধ্বনি' : 'Resonant harmonic bell tones from the prayer hall.',
      icon: Bell,
      color: '#7C3AED'
    },
    {
      id: 'morning_breeze',
      title: lang === 'bn' ? 'সকালের স্নিগ্ধ বাতাস' : lang === 'ne' ? 'बिहानीको चिसो हावा' : lang === 'as' ? 'পুৱাৰ বতাহ আৰু পখী' : 'Morning River Breeze',
      description: lang === 'bn' ? 'প্রকৃতির নির্মল প্রশান্তি' : lang === 'ne' ? 'प्रकृतिको शान्त वायु' : lang === 'as' ? 'নৈৰ পাৰৰ জুৰ বতাহ' : 'Serene natural frequency that calms the thoughts.',
      icon: Wind,
      color: '#059669'
    }
  ];

  return (
    <div className="focus-card">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        borderBottom: '2px solid var(--border-subtle)',
        paddingBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Sparkles size={36} color="#4F46E5" />
          <h2 style={{ fontSize: '32px' }}>
            {t?.modules?.sensory_soundscape?.title || 'Calming Soundscapes'}
          </h2>
        </div>
        <button
          className="btn-large btn-outline"
          onClick={() => {
            stopAudio();
            onSessionComplete();
          }}
          style={{ minHeight: '60px', padding: '10px 24px', fontSize: '20px' }}
        >
          <span>{sStrings.finish || 'Finish'}</span>
        </button>
      </div>

      {/* Gentle Breathing Circle Animation */}
      <div style={{
        background: '#F0FDF4',
        border: '3px solid #BBF7D0',
        borderRadius: '24px',
        padding: '2.5rem',
        textAlign: 'center',
        marginBottom: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div
          className="breathing-circle"
          style={{
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 10px 25px rgba(5, 150, 105, 0.25)',
            marginBottom: '1.5rem'
          }}
        >
          <Wind size={54} color="#FFFFFF" />
        </div>

        <h3 style={{ fontSize: '32px', color: '#065F46', marginBottom: '8px' }}>
          {breathePhase}
        </h3>
        <p style={{ fontSize: '22px', color: '#047857' }}>
          {sStrings.breatheDesc || 'Feel the peaceful air fill your lungs. Rest your mind in calm comfort.'}
        </p>
      </div>

      {/* Sound Selection Grid */}
      <h3 style={{ fontSize: '28px', marginBottom: '1.25rem' }}>
        {sStrings.selectMelody || 'Select a Soothing Melody:'}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {tracks.map((track) => {
          const isPlaying = playingTrack === track.id;
          const IconComp = track.icon;
          return (
            <button
              key={track.id}
              onClick={() => playTrack(track.id)}
              style={{
                background: isPlaying ? '#EFF6FF' : '#FFFFFF',
                border: `3px solid ${isPlaying ? '#3B82F6' : 'var(--border-subtle)'}`,
                borderRadius: '20px',
                padding: '1.5rem 1.75rem',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isPlaying ? '0 8px 20px rgba(59, 130, 246, 0.15)' : 'var(--shadow-soft)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  background: `${track.color}15`,
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <IconComp size={32} color={track.color} />
                </div>
                <div>
                  <h4 style={{ fontSize: '22px', color: 'var(--text-main)', marginBottom: '4px' }}>
                    {track.title}
                  </h4>
                  <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>
                    {track.description}
                  </p>
                </div>
              </div>

              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: isPlaying ? '#2563EB' : 'var(--accent-amber-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {isPlaying ? (
                  <Pause size={28} color="#FFFFFF" />
                ) : (
                  <Play size={28} color="var(--accent-amber-hover)" style={{ marginLeft: '3px' }} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
