import React, { useEffect, useRef, useState, useCallback } from 'react';
import { audioEngine } from '../audio/audioEngine';
import type { AudioProfile, Prototype } from '../data/types';
import { benchPresets } from '../data/archive';
import { Play, Square, Activity, Radio, Volume2, AlertTriangle } from 'lucide-react';

interface AcousticBenchProps {
  initialProfile?: AudioProfile;
  initialPrototype?: Prototype;
  compact?: boolean;
}

export const AcousticBench: React.FC<AcousticBenchProps> = ({
  initialProfile,
  compact = false
}) => {
  const defaultProfile: AudioProfile = initialProfile || {
    presetName: 'ACOUSTIC FEEDBACK PROFILE',
    carrierFreq: 220.0,
    modFreq: 6.2,
    waveform: 'sine',
    filterType: 'bandpass',
    filterCutoff: 440,
    resonance: 8.5,
    noiseLevel: 0.12,
    binauralDelta: 3.5,
    harmonicScatter: 0.45,
    description: 'Dynamic acoustic feedback profile with optical limiting and subtle room-mode harmonic overtones.'
  };

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [profile, setProfile] = useState<AudioProfile>(defaultProfile);
  const [selectedProtId, setSelectedProtId] = useState<string>('PROT-001');
  const [masterVolume, setMasterVolume] = useState<number>(0.35);

  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const freqCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const unsub = audioEngine.subscribe((playing, current) => {
      setIsPlaying(playing);
      if (current) setProfile(current);
    });
    return () => {
      unsub();
    };
  }, []);

  const handleToggle = () => {
    if (isPlaying) {
      audioEngine.stop();
    } else {
      audioEngine.playProfile(profile);
    }
  };

  const handleUpdate = (updates: Partial<AudioProfile>) => {
    const next = { ...profile, ...updates };
    setProfile(next);
    if (isPlaying) {
      audioEngine.updateParameters(updates);
    }
  };

  const handleSelectPrototype = (protId: string) => {
    setSelectedProtId(protId);
    const found = benchPresets.find(p => p.id === protId);
    if (found && found.audioProfile) {
      setProfile(found.audioProfile);
      if (isPlaying) {
        audioEngine.playProfile(found.audioProfile);
      }
    }
  };

  const triggerAnomaly = useCallback(() => {
    const anomalyProfile: AudioProfile = {
      presetName: 'RECURSIVE FEEDBACK CASCADE',
      carrierFreq: 88.0,
      modFreq: 14.5,
      waveform: 'sawtooth',
      filterType: 'notch',
      filterCutoff: 840,
      resonance: 18.0,
      noiseLevel: 0.38,
      binauralDelta: 7.2,
      harmonicScatter: 0.82,
      description: 'Simulated high-gain acoustic feedback loop with nonlinear harmonic saturation and multi-mode room resonance.'
    };
    setProfile(anomalyProfile);
    audioEngine.playProfile(anomalyProfile);
  }, []);

  // Visualizer animation loop
  useEffect(() => {
    const analyser = audioEngine.getAnalyser();

    const drawVisuals = () => {
      // Waveform Oscilloscope
      if (waveCanvasRef.current) {
        const canvas = waveCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.fillStyle = '#04070a';
          ctx.fillRect(0, 0, w, h);

          // Grid lines
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(0, h / 2);
          ctx.lineTo(w, h / 2);
          ctx.stroke();

          for (let x = 0; x < w; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
          }

          if (analyser && isPlaying) {
            const bufferLen = analyser.fftSize;
            const dataArray = new Uint8Array(bufferLen);
            analyser.getByteTimeDomainData(dataArray);

            ctx.lineWidth = 1.8;
            ctx.strokeStyle = '#10b981';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 8;
            ctx.beginPath();

            const sliceWidth = w / bufferLen;
            let x = 0;
            for (let i = 0; i < bufferLen; i++) {
              const v = dataArray[i] / 128.0;
              const y = (v * h) / 2;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
              x += sliceWidth;
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
          } else {
            // Idle simulated gentle line
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
            ctx.beginPath();
            const time = performance.now() * 0.002;
            for (let x = 0; x < w; x++) {
              const y = h / 2 + Math.sin(x * 0.04 + time) * 3;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
        }
      }

      // Frequency Spectrum Bar Analyzer
      if (freqCanvasRef.current) {
        const canvas = freqCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.fillStyle = '#04070a';
          ctx.fillRect(0, 0, w, h);

          if (analyser && isPlaying) {
            const bufferLen = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLen);
            analyser.getByteFrequencyData(dataArray);

            const bars = 64;
            const barWidth = w / bars;
            for (let i = 0; i < bars; i++) {
              const dataIdx = Math.floor(Math.pow(i / bars, 1.8) * (bufferLen / 2));
              const val = dataArray[dataIdx] || 0;
              const barHeight = (val / 255) * h * 0.9;

              const hue = 160 + (i / bars) * 60; // Emerald to Cyan
              ctx.fillStyle = `hsl(${hue}, 90%, 50%)`;
              ctx.fillRect(i * barWidth + 1, h - barHeight, barWidth - 1.5, barHeight);
            }
          } else {
            // Static ambient noise floor
            const bars = 64;
            const barWidth = w / bars;
            for (let i = 0; i < bars; i++) {
              const barHeight = Math.random() * 4 + 1;
              ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
              ctx.fillRect(i * barWidth + 1, h - barHeight, barWidth - 1.5, barHeight);
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(drawVisuals);
    };

    animFrameRef.current = requestAnimationFrame(drawVisuals);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  return (
    <div className={`bg-[#05080c] border border-emerald-950/80 rounded-md p-4 text-emerald-300 font-mono ${compact ? 'text-xs' : 'text-sm'}`}>
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-emerald-950/90 gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="font-bold tracking-widest text-emerald-400">
            ZIAA ACOUSTIC SYNTHESIS TEST BENCH // V4.1
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
            {isPlaying ? 'ACTIVE EMISSION' : 'STANDBY'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={triggerAnomaly}
            className="flex items-center gap-1 px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/60 rounded text-xs transition-colors"
            title="Inject non-Hermitian acoustic cavitation anomaly"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>TRIGGER ANOMALY</span>
          </button>

          <button
            type="button"
            aria-pressed={isPlaying}
            onClick={handleToggle}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded font-bold transition-all shadow-md ${
              isPlaying
                ? 'bg-red-500 hover:bg-red-600 text-black shadow-red-500/20'
                : 'bg-emerald-400 hover:bg-emerald-300 text-black shadow-emerald-500/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>HALT EMISSION</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>COMMENCE TEST</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="mt-3 flex flex-wrap items-center gap-2 py-2 px-3 bg-[#030508] border border-emerald-950/70 rounded">
        <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <label htmlFor="bench-preset" className="text-zinc-400 text-xs">LOAD PROTOTYPE PRESET:</label>
        <select
          id="bench-preset"
          value={selectedProtId}
          onChange={e => handleSelectPrototype(e.target.value)}
          className="bg-[#080d14] border border-emerald-900/80 text-emerald-300 text-xs rounded px-2.5 py-1 focus:outline-none focus:border-emerald-400 min-w-0 w-full basis-full sm:basis-auto sm:grow sm:max-w-md"
        >
          {benchPresets.map(p => (
            <option key={p.id} value={p.id}>
              {p.id} — {p.codeName} ({p.discipline})
            </option>
          ))}
        </select>
        <div className="text-[11px] text-zinc-400 italic">
          {profile.presetName}
        </div>
      </div>

      {/* Dual Visualizer Displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {/* Oscilloscope */}
        <div className="bg-[#030508] border border-emerald-950 rounded p-2.5 relative">
          <div className="flex justify-between items-center text-[10px] text-emerald-400/80 mb-1">
            <span>CH-A TIME-DOMAIN OSCILLOSCOPE (1024-PT)</span>
            <span className="text-zinc-400">STEREO BINAURAL</span>
          </div>
          <canvas
            ref={waveCanvasRef}
            width={compact ? 360 : 480}
            height={compact ? 100 : 130}
            className="w-full h-24 md:h-28 rounded bg-[#020406] block border border-emerald-950/60"
            role="img"
            aria-label="Time-domain oscilloscope of the synthesized signal"
          />
        </div>

        {/* FFT Frequency Waterfall */}
        <div className="bg-[#030508] border border-emerald-950 rounded p-2.5 relative">
          <div className="flex justify-between items-center text-[10px] text-emerald-400/80 mb-1">
            <span>CH-B 64-BAND SPECTRAL OCTAVE DECOMPOSITION</span>
            <span className="text-zinc-400">20 Hz – 20 kHz</span>
          </div>
          <canvas
            ref={freqCanvasRef}
            width={compact ? 360 : 480}
            height={compact ? 100 : 130}
            className="w-full h-24 md:h-28 rounded bg-[#020406] block border border-emerald-950/60"
            role="img"
            aria-label="64-band spectral decomposition of the synthesized signal"
          />
        </div>
      </div>

      {/* Interactive Synthesizer Parameter Sliders */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 p-3 bg-[#030508] border border-emerald-950/80 rounded">
        {/* Carrier Freq */}
        <div>
          <div className="flex justify-between text-[11px] text-zinc-400">
            <span>CARRIER</span>
            <span className="text-emerald-400 font-bold">{profile.carrierFreq.toFixed(1)} Hz</span>
          </div>
          <input
            type="range"
            aria-label="Carrier frequency"
            min="20"
            max="1800"
            step="1"
            value={profile.carrierFreq}
            onChange={e => handleUpdate({ carrierFreq: parseFloat(e.target.value) })}
            className="w-full accent-emerald-400 h-1 mt-1 cursor-pointer"
          />
        </div>

        {/* FM Mod Freq */}
        <div>
          <div className="flex justify-between text-[11px] text-zinc-400">
            <span>FM RATE</span>
            <span className="text-cyan-400 font-bold">{profile.modFreq.toFixed(1)} Hz</span>
          </div>
          <input
            type="range"
            aria-label="FM modulation rate"
            min="0"
            max="45"
            step="0.1"
            value={profile.modFreq}
            onChange={e => handleUpdate({ modFreq: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 h-1 mt-1 cursor-pointer"
          />
        </div>

        {/* Binaural Delta */}
        <div>
          <div className="flex justify-between text-[11px] text-zinc-400">
            <span>BINAURAL Δ</span>
            <span className="text-violet-400 font-bold">±{profile.binauralDelta.toFixed(1)} Hz</span>
          </div>
          <input
            type="range"
            min="0"
            max="18"
            step="0.1"
            value={profile.binauralDelta}
            aria-label="Binaural frequency delta"
            onChange={e => handleUpdate({ binauralDelta: parseFloat(e.target.value) })}
            className="w-full accent-violet-400 h-1 mt-1 cursor-pointer"
          />
        </div>

        {/* Filter Cutoff */}
        <div>
          <div className="flex justify-between text-[11px] text-zinc-400">
            <span>CUTOFF</span>
            <span className="text-amber-400 font-bold">{Math.round(profile.filterCutoff)} Hz</span>
          </div>
          <input
            type="range"
            aria-label="Filter cutoff frequency"
            min="60"
            max="6000"
            step="10"
            value={profile.filterCutoff}
            onChange={e => handleUpdate({ filterCutoff: parseFloat(e.target.value) })}
            className="w-full accent-amber-400 h-1 mt-1 cursor-pointer"
          />
        </div>

        {/* Resonance Q */}
        <div>
          <div className="flex justify-between text-[11px] text-zinc-400">
            <span>RESONANCE Q</span>
            <span className="text-pink-400 font-bold">{profile.resonance.toFixed(1)}</span>
          </div>
          <input
            type="range"
            aria-label="Resonance Q"
            min="0.5"
            max="20"
            step="0.5"
            value={profile.resonance}
            onChange={e => handleUpdate({ resonance: parseFloat(e.target.value) })}
            className="w-full accent-pink-400 h-1 mt-1 cursor-pointer"
          />
        </div>

        {/* Stochastic Noise */}
        <div>
          <div className="flex justify-between text-[11px] text-zinc-400">
            <span>CAVITATION</span>
            <span className="text-emerald-300 font-bold">{Math.round(profile.noiseLevel * 100)}%</span>
          </div>
          <input
            type="range"
            aria-label="Cavitation noise level"
            min="0"
            max="1"
            step="0.02"
            value={profile.noiseLevel}
            onChange={e => handleUpdate({ noiseLevel: parseFloat(e.target.value) })}
            className="w-full accent-emerald-300 h-1 mt-1 cursor-pointer"
          />
        </div>
      </div>

      {/* Waveform & Filter Type Selectors + Volume */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-emerald-950/70 text-xs">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-zinc-400">WAVE:</span>
            {(['sine', 'triangle', 'sawtooth', 'square'] as const).map(w => (
              <button
                key={w}
                onClick={() => handleUpdate({ waveform: w })}
                className={`min-h-[32px] rounded px-2.5 py-1.5 text-[10px] uppercase md:min-h-0 md:px-2 md:py-0.5 ${
                  profile.waveform === w
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-zinc-400">FILTER:</span>
            {(['bandpass', 'lowpass', 'notch', 'highpass'] as const).map(f => (
              <button
                key={f}
                onClick={() => handleUpdate({ filterType: f })}
                className={`min-h-[32px] rounded px-2.5 py-1.5 text-[10px] uppercase md:min-h-0 md:px-2 md:py-0.5 ${
                  profile.filterType === f
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Master Gain Control */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={masterVolume}
            onChange={e => {
              const v = parseFloat(e.target.value);
              setMasterVolume(v);
              audioEngine.setMasterGain(v);
            }}
            className="w-24 accent-emerald-400 h-1 cursor-pointer"
            aria-label="Master gain"
          />
          <span className="text-[11px] text-zinc-400 w-8">{Math.round(masterVolume * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
