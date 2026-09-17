import React, { useEffect, useRef, useState } from 'react';

export const SpectraLabConsole: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tempo, setTempo] = useState<number>(128);
  const [masterGain, setMasterGain] = useState<number>(62);
  const [pitch, setPitch] = useState<number>(50);
  const [activeKnobs] = useState({
    size: 340,
    dens: 0.72,
    pitch: 7,
    decay: 6.2,
    shim: 0.45,
    diff: 0.81,
    fbk: 0.66,
    mix: 38
  });

  const [activeCellGrid, setActiveCellGrid] = useState<boolean[]>(() => {
    return Array.from({ length: 64 }, (_, i) => (i % 7 === 0 || i % 11 === 0));
  });

  // Canvas refs
  const stageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bandsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const spectroCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio nodes ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Playhead position
  const [playheadPos, setPlayheadPos] = useState<number>(22);

  // Readouts
  const [fps, setFps] = useState<string>('60.0');
  const [xVal, setXVal] = useState<string>('0.412');
  const [yVal, setYVal] = useState<string>('0.781');
  const [zVal, setZVal] = useState<string>('0.294');
  const [energyVal, setEnergyVal] = useState<string>('0.628');
  const [centroidVal, setCentroidVal] = useState<string>('2480 Hz');

  // Toggle cell in modulation matrix
  const toggleMatrixCell = (index: number) => {
    setActiveCellGrid(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  // Sound start/stop
  const togglePlay = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    if (isPlaying) {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
        oscRef.current = null;
      }
      setIsPlaying(false);
    } else {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      const analyser = ctx.createAnalyser();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130.81, ctx.currentTime); // C3

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, ctx.currentTime);
      filter.Q.setValueAtTime(4.5, ctx.currentTime);

      gain.gain.setValueAtTime((masterGain / 100) * 0.15, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(analyser);
      analyser.connect(ctx.destination);

      osc.start();
      oscRef.current = osc;
      filterRef.current = filter;
      gainNodeRef.current = gain;
      analyserRef.current = analyser;
      setIsPlaying(true);
    }
  };

  // Playhead movement
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayheadPos(p => (p > 98 ? 2 : p + 0.05));
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // Main visualizer animation loop
  useEffect(() => {
    let animId: number;
    let t0 = performance.now();
    let frames = 0;

    // Particles for stage
    const particles: Array<{ x: number; y: number; a: number; r: number; s: number; h: number }> = [];
    for (let i = 0; i < 220; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        a: Math.random() * Math.PI * 2,
        r: Math.random() * 0.4 + 0.05,
        s: Math.random() * 0.5 + 0.2,
        h: Math.random()
      });
    }

    const draw = () => {
      const tnow = performance.now();
      const T = tnow * 0.001;
      frames++;
      if (tnow - t0 > 500) {
        setFps((frames * 1000 / (tnow - t0)).toFixed(1));
        frames = 0;
        t0 = tnow;
      }

      // Update readouts
      setXVal((Math.sin(T * 0.7) * 0.5 + 0.5).toFixed(3));
      setYVal((Math.cos(T * 0.9) * 0.5 + 0.5).toFixed(3));
      setZVal((Math.sin(T * 1.3 + 0.4) * 0.5 + 0.5).toFixed(3));
      const audioEnergy = isPlaying ? (0.7 + 0.3 * Math.sin(T * 2.5)) : (0.4 + 0.2 * Math.sin(T * 1.2));
      setEnergyVal(audioEnergy.toFixed(3));
      setCentroidVal((2000 + 800 * Math.sin(T * 0.6)).toFixed(0) + ' Hz');

      // 1. Stage Drawing
      if (stageCanvasRef.current) {
        const stage = stageCanvasRef.current;
        const ctx = stage.getContext('2d');
        if (ctx) {
          const W = stage.width = stage.clientWidth;
          const H = stage.height = stage.clientHeight;

          // Gradient
          const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7);
          grd.addColorStop(0, 'rgba(40, 8, 80, 0.35)');
          grd.addColorStop(0.5, 'rgba(8, 12, 30, 0.6)');
          grd.addColorStop(1, 'rgba(2, 3, 8, 1)');
          ctx.fillStyle = grd;
          ctx.fillRect(0, 0, W, H);

          // Concentric spectral rings
          const cx = W / 2;
          const cy = H / 2;
          for (let r = 0; r < 14; r++) {
            const radius = 35 + r * 24 + Math.sin(T * 0.8 + r * 0.3) * 10 * audioEnergy;
            const segs = 50;
            ctx.beginPath();
            for (let s = 0; s <= segs; s++) {
              const a = (s / segs) * Math.PI * 2;
              const wob = Math.sin(a * 5 + T * 1.4 + r * 0.7) * 8 * audioEnergy + Math.sin(a * 11 + T * 2.1) * 4;
              const rr = radius + wob;
              const x = cx + Math.cos(a) * rr;
              const y = cy + Math.sin(a) * rr * 0.6;
              if (s === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            const hue = (r * 22 + T * 30) % 360;
            ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${0.15 + 0.4 * audioEnergy * (1 - r / 14)})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }

          // Particles
          particles.forEach(p => {
            p.a += 0.005 + p.s * 0.01;
            const px = cx + Math.cos(p.a + T * 0.3) * p.r * Math.min(W, H) * 0.5 * (1 + Math.sin(T + p.h * 10) * 0.2);
            const py = cy + Math.sin(p.a + T * 0.3) * p.r * Math.min(W, H) * 0.3 * (1 + Math.cos(T * 1.2 + p.h * 8) * 0.2);
            const hue = (p.h * 360 + T * 60) % 360;
            ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.85)`;
            ctx.fillRect(px - 1, py - 1, 2, 2);
          });

          // Scanlines
          ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
          for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

          // Central core glow
          const coreR = 30 + 10 * audioEnergy;
          const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
          cg.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
          cg.addColorStop(0.4, 'rgba(255, 43, 214, 0.4)');
          cg.addColorStop(1, 'rgba(0, 240, 255, 0)');
          ctx.fillStyle = cg;
          ctx.beginPath();
          ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Waveform
      if (waveCanvasRef.current) {
        const wave = waveCanvasRef.current;
        const wctx = wave.getContext('2d');
        if (wctx) {
          const w = wave.width = wave.clientWidth;
          const h = wave.height = wave.clientHeight;
          wctx.clearRect(0, 0, w, h);

          // Top Channel (Cyan)
          wctx.fillStyle = 'rgba(0, 240, 255, 0.65)';
          for (let x = 0; x < w; x += 3) {
            const t = x / w;
            const env = 0.35 + 0.35 * Math.sin(t * 8 + T * 0.5) + 0.2 * Math.sin(t * 23);
            const noise = (Math.sin(x * 0.3) + Math.sin(x * 0.91) * 0.7) * 0.25;
            const amp = Math.max(0.05, env * (0.6 + noise)) * h * 0.22;
            wctx.fillRect(x, h * 0.25 - amp, 2, amp * 2);
          }

          // Bottom Channel (Magenta)
          wctx.fillStyle = 'rgba(255, 43, 214, 0.55)';
          for (let x = 0; x < w; x += 3) {
            const t = x / w;
            const env = 0.35 + 0.35 * Math.sin(t * 8 + 1 + T * 0.5) + 0.2 * Math.sin(t * 23 + 0.5);
            const noise = (Math.sin(x * 0.31 + 1) + Math.sin(x * 0.93) * 0.7) * 0.25;
            const amp = Math.max(0.05, env * (0.6 + noise)) * h * 0.22;
            wctx.fillRect(x, h * 0.75 - amp, 2, amp * 2);
          }

          // Center line
          wctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          wctx.beginPath();
          wctx.moveTo(0, h * 0.5);
          wctx.lineTo(w, h * 0.5);
          wctx.stroke();
        }
      }

      // 3. 64 Frequency Bands
      if (bandsCanvasRef.current) {
        const bands = bandsCanvasRef.current;
        const bctx = bands.getContext('2d');
        if (bctx) {
          const bw = bands.width = bands.clientWidth;
          const bh = bands.height = bands.clientHeight;
          bctx.clearRect(0, 0, bw, bh);
          const nb = 48;
          for (let i = 0; i < nb; i++) {
            const f = i / nb;
            const v = (Math.sin(T * 2 + i * 0.3) + Math.sin(T * 0.7 + i * 0.7) + Math.sin(T * 3 + i * 0.15)) / 3;
            const amp = Math.abs(v) * (1 - f * 0.5) * 0.9 + 0.05;
            const bbw = bw / nb;
            const hh = amp * bh * 0.85;
            const hue = 180 + f * 180;
            const gr = bctx.createLinearGradient(0, bh, 0, bh - hh);
            gr.addColorStop(0, `hsla(${hue}, 100%, 55%, 1)`);
            gr.addColorStop(1, `hsla(${(hue + 60) % 360}, 100%, 70%, 0.4)`);
            bctx.fillStyle = gr;
            bctx.fillRect(i * bbw + 1, bh - hh, bbw - 2, hh);
          }
        }
      }

      // 4. Spectrogram Waterfall
      if (spectroCanvasRef.current) {
        const spectro = spectroCanvasRef.current;
        const sctx = spectro.getContext('2d');
        if (sctx && spectro.clientWidth > 0 && spectro.clientHeight > 0) {
          const sw = spectro.width = spectro.clientWidth;
          const sh = spectro.height = spectro.clientHeight;
          try {
            const img = sctx.getImageData(2, 0, Math.max(1, sw - 2), sh);
            sctx.putImageData(img, 0, 0);
            sctx.fillStyle = '#06070b';
            sctx.fillRect(sw - 2, 0, 2, sh);
            for (let y = 0; y < sh; y += 2) {
              const f = 1 - y / sh;
              const v = Math.abs(Math.sin(T * 2 + f * 8) + Math.sin(T * 0.7 + f * 14) * 0.7);
              const a = Math.min(1, v * 0.7);
              const hue = 200 + f * 180;
              sctx.fillStyle = `hsla(${hue}, 100%, ${30 + a * 40}%, ${a})`;
              sctx.fillRect(sw - 2, y, 2, 2);
            }
          } catch {
            // Context resize boundary handling
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  return (
    <div className="bg-[#06070b] border border-[#1a1f33] rounded-lg overflow-hidden font-mono text-[#c9d4e6] flex flex-col shadow-2xl">
      {/* Top Banner / Ticker */}
      <div className="flex items-center h-9 bg-[#070910] border-b border-[#1a1f33] px-3 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h3l3-8 3 16 3-12 3 8h3" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-bold tracking-[.25em] text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]">
            SPECTRA//LAB
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] border border-[#00f0ff]/40 text-[#00f0ff]">
            v3.14.0 - KAIROS
          </span>
        </div>

        <div className="hidden md:flex flex-1 overflow-hidden h-5 items-center text-[10px] text-[#7d8aa6] border-x border-[#1a1f33] px-3">
          <div className="truncate animate-pulse">
            ▣ FFT_4096 SAMPLE_48kHz · BUFFER 256 · LATENCY 5.3ms · CPU 41.7% · GPU 62.1% · DSP_LOAD 0.38 · SR_DRIFT ±0.0002 · UPLINK SYNC OK · MIDI_BUS_A ACTIVE · OSC /spectra/* BOUND · SHADER_PASS 7
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#39ff8a] shadow-[0_0_6px_#39ff8a]"></span>
            <span>DSP</span>
          </span>
          <span className="text-[#00f0ff] font-bold">{tempo} BPM</span>
          <button
            onClick={togglePlay}
            className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${
              isPlaying
                ? 'bg-[#ff2bd6] text-black shadow-[0_0_12px_rgba(255,43,214,0.5)]'
                : 'border border-[#39ff8a] text-[#39ff8a] hover:bg-[#39ff8a]/10'
            }`}
          >
            {isPlaying ? '◼ STOP DSP' : '▶ START DSP'}
          </button>
        </div>
      </div>

      {/* Main Workspace: 3 Columns (Left Inspector, Stage, Right Matrix) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
        {/* Left Column: Input, Routing, Transport (3 cols) */}
        <div className="lg:col-span-3 border-r border-[#1a1f33] p-3 space-y-3 bg-[#080a10]">
          {/* Audio Source Input */}
          <div className="bg-[#0b0d14] border border-[#1a1f33] rounded p-2.5 text-xs">
            <div className="flex justify-between items-center text-[10px] text-[#7d8aa6] border-b border-[#1a1f33] pb-1 mb-2 font-bold uppercase">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]"></span> SRC // INPUT
              </span>
              <span className="text-[#00f0ff]">WAV/FLAC</span>
            </div>
            <div className="text-[10px] text-[#7d8aa6] space-y-1">
              <div className="flex justify-between"><span>FORMAT</span><span className="text-zinc-200">FLAC 24/96</span></div>
              <div className="flex justify-between"><span>CHANNELS</span><span className="text-zinc-200">STEREO 2.0</span></div>
              <div className="flex justify-between"><span>CARRIER HASH</span><span className="text-[#a26bff]">a9f3..c01e</span></div>
            </div>
          </div>

          {/* Transport & Controls */}
          <div className="bg-[#0b0d14] border border-[#1a1f33] rounded p-2.5 text-xs">
            <div className="flex justify-between items-center text-[10px] text-[#7d8aa6] border-b border-[#1a1f33] pb-1 mb-2 font-bold uppercase">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39ff8a]"></span> TRANSPORT
              </span>
              <span className="text-[#39ff8a]">SYNCED</span>
            </div>

            <div className="space-y-2 text-[10px]">
              <div>
                <div className="flex justify-between text-[#7d8aa6] mb-1">
                  <span>MASTER GAIN</span>
                  <span className="text-[#00f0ff]">{masterGain}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterGain}
                  onChange={e => setMasterGain(Number(e.target.value))}
                  className="w-full accent-[#00f0ff] h-1"
                />
              </div>

              <div>
                <div className="flex justify-between text-[#7d8aa6] mb-1">
                  <span>TEMPO</span>
                  <span className="text-[#ff2bd6]">{tempo}.00 BPM</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="180"
                  value={tempo}
                  onChange={e => setTempo(Number(e.target.value))}
                  className="w-full accent-[#ff2bd6] h-1"
                />
              </div>

              <div>
                <div className="flex justify-between text-[#7d8aa6] mb-1">
                  <span>PITCH BEND</span>
                  <span className="text-[#39ff8a]">+0.00 st</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pitch}
                  onChange={e => setPitch(Number(e.target.value))}
                  className="w-full accent-[#39ff8a] h-1"
                />
              </div>
            </div>
          </div>

          {/* I/O Routing */}
          <div className="bg-[#0b0d14] border border-[#1a1f33] rounded p-2.5 text-[10px]">
            <div className="text-[10px] text-[#7d8aa6] border-b border-[#1a1f33] pb-1 mb-2 font-bold uppercase">
              I/O ROUTING MATRIX
            </div>
            <div className="space-y-1">
              <div className="flex justify-between"><span>IN_01</span><span className="text-[#00f0ff]">ADC L</span></div>
              <div className="flex justify-between"><span>IN_02</span><span className="text-[#00f0ff]">ADC R</span></div>
              <div className="flex justify-between"><span>OUT_01</span><span className="text-[#ff2bd6]">MAIN L</span></div>
              <div className="flex justify-between"><span>OUT_02</span><span className="text-[#ff2bd6]">MAIN R</span></div>
              <div className="flex justify-between"><span>OUT_AUX</span><span className="text-[#a26bff]">SUB / NDI</span></div>
            </div>
          </div>
        </div>

        {/* Center Column: Volumetric Stage with Nodes & Crosshairs (6 cols) */}
        <div className="lg:col-span-6 relative bg-[#04060a] border-r border-[#1a1f33] flex flex-col">
          {/* Center Stage Canvas */}
          <div className="relative flex-1 min-h-[380px] overflow-hidden">
            <canvas ref={stageCanvasRef} className="absolute inset-0 w-full h-full block" />

            {/* Overlays & Crosshairs */}
            <div className="absolute top-3 left-3 text-[10px] text-[#00f0ff] tracking-widest font-bold">
              ◉ STAGE_01 - VOLUMETRIC SPECTRAL FIELD
            </div>

            <div className="absolute top-3 right-3 text-[10px] text-right text-[#9aa7c2]">
              <div>RES <span className="text-[#00f0ff]">2048×1152</span></div>
              <div>FPS <span className="text-[#39ff8a]">{fps}</span></div>
              <div>SHADER <span className="text-[#ff2bd6]">volumetric.frag</span></div>
            </div>

            {/* Floating Patch Nodes */}
            <div className="absolute top-12 left-4 bg-[#0a0d18]/90 border border-[#00f0ff]/50 rounded p-2 text-[9px] shadow-lg pointer-events-none">
              <div className="text-[#00f0ff] font-bold border-b border-[#1a1f33] pb-0.5 mb-1">⬢ FFT_ANALYZER</div>
              <div>window: hann</div>
              <div>bins: 2048</div>
              <div>centroid: {centroidVal}</div>
            </div>

            <div className="absolute bottom-12 right-4 bg-[#0a0d18]/90 border border-[#ff2bd6]/50 rounded p-2 text-[9px] shadow-lg pointer-events-none">
              <div className="text-[#ff2bd6] font-bold border-b border-[#1a1f33] pb-0.5 mb-1">⬢ PARTICLE_FIELD</div>
              <div>count: 32,768</div>
              <div>react: bass_band</div>
              <div>energy: {energyVal}</div>
            </div>

            {/* Mini meters readout bottom */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-4 text-[9px] text-[#7d8aa6] tracking-widest bg-black/60 px-3 py-1 rounded border border-white/10">
              <span>X <span className="text-[#00f0ff]">{xVal}</span></span>
              <span>Y <span className="text-[#ff2bd6]">{yVal}</span></span>
              <span>Z <span className="text-[#a26bff]">{zVal}</span></span>
              <span>ENERGY <span className="text-[#39ff8a]">{energyVal}</span></span>
            </div>
          </div>
        </div>

        {/* Right Column: DSP Rotary Knobs & Modulation Matrix (3 cols) */}
        <div className="lg:col-span-3 p-3 space-y-3 bg-[#080a10]">
          {/* DSP Knobs */}
          <div className="bg-[#0b0d14] border border-[#1a1f33] rounded p-2.5 text-xs">
            <div className="flex justify-between items-center text-[10px] text-[#7d8aa6] border-b border-[#1a1f33] pb-1 mb-2 font-bold uppercase">
              <span>DSP // GRANULAR_VERB</span>
              <span className="text-[#a26bff]">MOD</span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-[9px] text-[#7d8aa6]">
              <div>
                <div className="w-8 h-8 rounded-full border border-cyan-400/40 bg-zinc-900 mx-auto flex items-center justify-center text-[8px] text-cyan-300 font-bold">
                  {activeKnobs.size}
                </div>
                <div className="mt-1">SIZE</div>
              </div>

              <div>
                <div className="w-8 h-8 rounded-full border border-pink-400/40 bg-zinc-900 mx-auto flex items-center justify-center text-[8px] text-pink-300 font-bold">
                  {activeKnobs.dens}
                </div>
                <div className="mt-1">DENS</div>
              </div>

              <div>
                <div className="w-8 h-8 rounded-full border border-violet-400/40 bg-zinc-900 mx-auto flex items-center justify-center text-[8px] text-violet-300 font-bold">
                  +{activeKnobs.pitch}
                </div>
                <div className="mt-1">PITCH</div>
              </div>

              <div>
                <div className="w-8 h-8 rounded-full border border-emerald-400/40 bg-zinc-900 mx-auto flex items-center justify-center text-[8px] text-emerald-300 font-bold">
                  {activeKnobs.decay}s
                </div>
                <div className="mt-1">DECAY</div>
              </div>

              <div>
                <div className="w-8 h-8 rounded-full border border-cyan-400/40 bg-zinc-900 mx-auto flex items-center justify-center text-[8px] text-cyan-300 font-bold">
                  {activeKnobs.shim}
                </div>
                <div className="mt-1">SHIM</div>
              </div>

              <div>
                <div className="w-8 h-8 rounded-full border border-pink-400/40 bg-zinc-900 mx-auto flex items-center justify-center text-[8px] text-pink-300 font-bold">
                  {activeKnobs.diff}
                </div>
                <div className="mt-1">DIFF</div>
              </div>

              <div>
                <div className="w-8 h-8 rounded-full border border-violet-400/40 bg-zinc-900 mx-auto flex items-center justify-center text-[8px] text-violet-300 font-bold">
                  {activeKnobs.fbk}
                </div>
                <div className="mt-1">FBK</div>
              </div>

              <div>
                <div className="w-8 h-8 rounded-full border border-emerald-400/40 bg-zinc-900 mx-auto flex items-center justify-center text-[8px] text-emerald-300 font-bold">
                  {activeKnobs.mix}%
                </div>
                <div className="mt-1">MIX</div>
              </div>
            </div>
          </div>

          {/* 8x8 Modulation Matrix */}
          <div className="bg-[#0b0d14] border border-[#1a1f33] rounded p-2.5 text-xs">
            <div className="flex justify-between items-center text-[10px] text-[#7d8aa6] border-b border-[#1a1f33] pb-1 mb-2 font-bold uppercase">
              <span>MODULATION MATRIX</span>
              <span className="text-[#00f0ff]">8×8</span>
            </div>

            <div className="grid grid-cols-8 gap-1">
              {activeCellGrid.map((active, i) => (
                <button
                  key={i}
                  onClick={() => toggleMatrixCell(i)}
                  className={`w-full aspect-square rounded-xs border transition-all ${
                    active
                      ? i % 3 === 0
                        ? 'bg-[#00f0ff] border-[#00f0ff] shadow-[0_0_6px_#00f0ff]'
                        : i % 3 === 1
                        ? 'bg-[#ff2bd6] border-[#ff2bd6] shadow-[0_0_6px_#ff2bd6]'
                        : 'bg-[#a26bff] border-[#a26bff] shadow-[0_0_6px_#a26bff]'
                      : 'bg-[#0a0d18] border-[#14192c] hover:border-zinc-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Automation Lanes */}
          <div className="bg-[#0b0d14] border border-[#1a1f33] rounded p-2.5 text-[9px] space-y-2">
            <div>
              <div className="flex justify-between text-[#7d8aa6]"><span>LFO_01 ▸ SINE 0.42Hz</span><span className="text-[#00f0ff]">→ DENS</span></div>
              <svg viewBox="0 0 200 24" className="w-full h-5">
                <path d="M0,12 Q25,2 50,12 T100,12 T150,12 T200,12" fill="none" stroke="#00f0ff" strokeWidth="1.2" />
              </svg>
            </div>
            <div>
              <div className="flex justify-between text-[#7d8aa6]"><span>ENV_01 ▸ ADSR</span><span className="text-[#a26bff]">→ CUTOFF</span></div>
              <svg viewBox="0 0 200 24" className="w-full h-5">
                <path d="M0,22 L30,2 L70,10 L150,10 L200,22" fill="none" stroke="#a26bff" strokeWidth="1.2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Timeline & Analysis Meters */}
      <div className="h-[160px] border-t border-[#1a1f33] grid grid-cols-1 md:grid-cols-12 bg-[#070910]">
        {/* Waveform & Playhead (7 cols) */}
        <div className="md:col-span-7 flex flex-col border-r border-[#1a1f33]">
          <div className="flex justify-between items-center px-3 h-6 border-b border-[#1a1f33] text-[9.5px] text-[#7d8aa6]">
            <span>TIMELINE · BAR 1.1.1 → 32.4.4</span>
            <span className="text-[#00f0ff]">01:42.318 / 07:42.318</span>
          </div>

          <div className="relative flex-1 bg-[#04060a] overflow-hidden">
            <canvas ref={waveCanvasRef} className="w-full h-full block" />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-[#ff2bd6] shadow-[0_0_8px_#ff2bd6] pointer-events-none transition-all"
              style={{ left: `${playheadPos}%` }}
            />
          </div>
        </div>

        {/* 64-band frequency display (3 cols) */}
        <div className="md:col-span-3 flex flex-col border-r border-[#1a1f33]">
          <div className="px-3 h-6 border-b border-[#1a1f33] flex items-center text-[9.5px] text-[#7d8aa6]">
            32-BAND OCTAVE SPECTRUM
          </div>
          <div className="flex-1 bg-[#04060a]">
            <canvas ref={bandsCanvasRef} className="w-full h-full block" />
          </div>
        </div>

        {/* Scrolling Spectrogram Waterfall (2 cols) */}
        <div className="md:col-span-2 flex flex-col">
          <div className="px-2 h-6 border-b border-[#1a1f33] flex items-center text-[9.5px] text-[#7d8aa6]">
            SPECTROGRAM
          </div>
          <div className="flex-1 bg-[#04060a]">
            <canvas ref={spectroCanvasRef} className="w-full h-full block" />
          </div>
        </div>
      </div>
    </div>
  );
};
