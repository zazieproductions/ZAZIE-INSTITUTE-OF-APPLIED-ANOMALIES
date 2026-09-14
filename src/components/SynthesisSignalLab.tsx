import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Play, Pause, Square, Upload, Cpu, Activity, 
  Radio, Layers, Zap, ExternalLink, FileAudio, 
  Terminal, Box, Waves, Grid3X3, Eye
} from 'lucide-react';

interface AudioParams {
  complexity: number;
  displacement: number;
  bassAvg: number;
  midAvg: number;
  trebAvg: number;
}

export const SynthesisSignalLab: React.FC = () => {
  // UI Refs
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);
  const freqCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Audio state
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const freqDataRef = useRef<Uint8Array | null>(null);
  const timeDataRef = useRef<Uint8Array | null>(null);

  // Three refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const mainMeshRef = useRef<THREE.Mesh | null>(null);
  const particlesMeshRef = useRef<THREE.Points | null>(null);
  const particlesGeoRef = useRef<THREE.BufferGeometry | null>(null);
  const mainGeoRef = useRef<THREE.TorusKnotGeometry | null>(null);
  const originalVerticesRef = useRef<THREE.Vector3[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // React state
  const [fileName, setFileName] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeDisplay, setTimeDisplay] = useState<string>('00:00:00');
  const [params, setParams] = useState<AudioParams>({
    complexity: 1.0,
    displacement: 0.5,
    bassAvg: 0,
    midAvg: 0,
    trebAvg: 0
  });
  const [fps, setFps] = useState<number>(60);
  const [cpuLoad, setCpuLoad] = useState<number>(12);
  const [hasAudio, setHasAudio] = useState<boolean>(false);
  const [matrixCells, setMatrixCells] = useState<boolean[]>(() => 
    Array.from({ length: 32 }, () => Math.random() > 0.75)
  );
  const [activeGeometry, setActiveGeometry] = useState<'torusKnot' | 'torus' | 'icosahedron'>('torusKnot');
  const [colorMode, setColorMode] = useState<number>(0);
  const [particleCount] = useState<number>(3000);

  // Performance tracking
  const lastFpsTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.85;
      analyserRef.current.connect(audioCtxRef.current.destination);
      
      freqDataRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      timeDataRef.current = new Uint8Array(analyserRef.current.fftSize);
    }
  }, []);

  // Release audio source
  const releaseSource = useCallback(() => {
    if (!sourceRef.current) return;
    sourceRef.current.onended = null;
    try { sourceRef.current.stop(); } catch {}
    try { sourceRef.current.disconnect(); } catch {}
    sourceRef.current = null;
  }, []);

  // Play logic
  const playAudio = useCallback(() => {
    if (!bufferRef.current) return;
    if (isPlaying) return;

    initAudio();
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const ctx = audioCtxRef.current!;
    const src = ctx.createBufferSource();
    src.buffer = bufferRef.current;
    src.connect(analyserRef.current!);

    const safeOffset = Math.min(pauseTimeRef.current, Math.max(0, bufferRef.current.duration - 0.01));
    src.start(0, safeOffset);
    pauseTimeRef.current = safeOffset;
    startTimeRef.current = ctx.currentTime - safeOffset;
    sourceRef.current = src;
    setIsPlaying(true);

    src.onended = () => {
      if (sourceRef.current) {
        try { sourceRef.current.disconnect(); } catch {}
        sourceRef.current = null;
      }
      // Check if still playing (not paused)
      setIsPlaying(prev => {
        if (prev) {
          pauseTimeRef.current = 0;
          setTimeDisplay('00:00:00');
          return false;
        }
        return prev;
      });
    };
  }, [isPlaying, initAudio]);

  const pauseAudio = useCallback(() => {
    if (!isPlaying || !sourceRef.current || !audioCtxRef.current) return;
    pauseTimeRef.current = Math.min(
      audioCtxRef.current.currentTime - startTimeRef.current,
      bufferRef.current ? bufferRef.current.duration : Number.POSITIVE_INFINITY
    );
    setIsPlaying(false);
    releaseSource();
  }, [isPlaying, releaseSource]);

  const stopAudio = useCallback(() => {
    setIsPlaying(false);
    releaseSource();
    pauseTimeRef.current = 0;
    startTimeRef.current = 0;
    setTimeDisplay('00:00:00');
  }, [releaseSource]);

  // File handling
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    initAudio();
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const arrayBuffer = ev.target?.result as ArrayBuffer;
        const decoded = await audioCtxRef.current!.decodeAudioData(arrayBuffer);
        bufferRef.current = decoded;
        setHasAudio(true);
        pauseTimeRef.current = 0;
        stopAudio();
      } catch (err) {
        console.error('Error decoding audio', err);
        setFileName('Error decoding file');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [initAudio, stopAudio]);

  // Initialize Three.js
  useEffect(() => {
    if (!threeCanvasRef.current) return;

    const canvas = threeCanvasRef.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.002);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 150;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Geometry
    let geometry: THREE.BufferGeometry;
    if (activeGeometry === 'torusKnot') {
      geometry = new THREE.TorusKnotGeometry(30, 8, 150, 16);
    } else if (activeGeometry === 'torus') {
      geometry = new THREE.TorusGeometry(35, 10, 24, 100);
    } else {
      geometry = new THREE.IcosahedronGeometry(35, 3);
    }
    
    const material = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });

    const mainMesh = new THREE.Mesh(geometry, material);
    scene.add(mainMesh);
    mainMeshRef.current = mainMesh;
    mainGeoRef.current = geometry as THREE.TorusKnotGeometry;

    // Store original vertices
    const posAttr = geometry.attributes.position;
    const originals: THREE.Vector3[] = [];
    for (let i = 0; i < posAttr.count; i++) {
      originals.push(new THREE.Vector3().fromBufferAttribute(posAttr as any, i));
    }
    originalVerticesRef.current = originals;

    // Particles
    const particlesGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    const colArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const r = 100 + Math.random() * 200;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      posArray[i] = r * Math.sin(phi) * Math.cos(theta);
      posArray[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      posArray[i + 2] = r * Math.cos(phi);
      colArray[i] = 1.0;
      colArray[i + 1] = 1.0;
      colArray[i + 2] = 1.0;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeo.setAttribute('color', new THREE.BufferAttribute(colArray, 3));

    const particlesMat = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8
    });

    const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlesMesh);
    particlesMeshRef.current = particlesMesh;
    particlesGeoRef.current = particlesGeo;

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      rendererRef.current.setSize(w, h);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      particlesGeo.dispose();
      material.dispose();
      particlesMat.dispose();
    };
  }, [activeGeometry, particleCount]);

  // Handle geometry change - recreate
  useEffect(() => {
    if (!sceneRef.current || !mainMeshRef.current) return;
    
    const scene = sceneRef.current;
    const oldMesh = mainMeshRef.current;
    scene.remove(oldMesh);
    oldMesh.geometry.dispose();

    let geometry: THREE.BufferGeometry;
    if (activeGeometry === 'torusKnot') {
      geometry = new THREE.TorusKnotGeometry(30, 8, 150, 16);
    } else if (activeGeometry === 'torus') {
      geometry = new THREE.TorusGeometry(35, 10, 24, 100);
    } else {
      geometry = new THREE.IcosahedronGeometry(35, 3);
    }

    const material = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });

    const mainMesh = new THREE.Mesh(geometry, material);
    scene.add(mainMesh);
    mainMeshRef.current = mainMesh;
    mainGeoRef.current = geometry as any;

    const posAttr = geometry.attributes.position;
    const originals: THREE.Vector3[] = [];
    for (let i = 0; i < posAttr.count; i++) {
      originals.push(new THREE.Vector3().fromBufferAttribute(posAttr as any, i));
    }
    originalVerticesRef.current = originals;
  }, [activeGeometry]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      
      const now = performance.now();
      frameCountRef.current++;
      if (now - lastFpsTimeRef.current >= 1000) {
        const calculatedFps = Math.round((frameCountRef.current * 1000) / (now - lastFpsTimeRef.current));
        setFps(calculatedFps);
        setCpuLoad(8 + Math.random() * 18 + (isPlaying ? 15 : 0));
        frameCountRef.current = 0;
        lastFpsTimeRef.current = now;

        // Random matrix activity
        if (Math.random() > 0.6) {
          setMatrixCells(prev => {
            const next = [...prev];
            const idx = Math.floor(Math.random() * next.length);
            next[idx] = !next[idx];
            return next;
          });
        }
      }

      // Time display
      if (isPlaying && audioCtxRef.current) {
        const t = audioCtxRef.current.currentTime - startTimeRef.current;
        const mins = Math.floor(t / 60).toString().padStart(2, '0');
        const secs = Math.floor(t % 60).toString().padStart(2, '0');
        const ms = Math.floor((t % 1) * 100).toString().padStart(2, '0');
        setTimeDisplay(`${mins}:${secs}:${ms}`);
      }

      // Audio analysis for 2D canvases and 3D modulation
      let bassAvg = params.bassAvg;
      let midAvg = params.midAvg;
      let trebAvg = params.trebAvg;

      if (analyserRef.current && freqDataRef.current && timeDataRef.current) {
        if (isPlaying) {
          analyserRef.current.getByteFrequencyData(freqDataRef.current as any);
          analyserRef.current.getByteTimeDomainData(timeDataRef.current as any);

          // Calculate bands
          const binCount = analyserRef.current.frequencyBinCount;
          const third = Math.floor(binCount / 3);
          let bSum = 0, mSum = 0, tSum = 0;
          for (let i = 0; i < third; i++) bSum += freqDataRef.current[i];
          for (let i = third; i < third * 2; i++) mSum += freqDataRef.current[i];
          for (let i = third * 2; i < binCount; i++) tSum += freqDataRef.current[i];
          bassAvg = bSum / third;
          midAvg = mSum / third;
          trebAvg = tSum / third;
          
          // Update params ref for next frame's 3D without causing re-render loop too often
          setParams(p => ({ ...p, bassAvg, midAvg, trebAvg }));
        } else {
          // Decay
          bassAvg *= 0.95;
          midAvg *= 0.95;
          trebAvg *= 0.95;
        }

        // Draw freq canvas
        if (freqCanvasRef.current) {
          const canvas = freqCanvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const w = canvas.width;
            const h = canvas.height;
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, w, h);
            
            if (isPlaying && freqDataRef.current) {
              const barWidth = (w / analyserRef.current!.frequencyBinCount) * 2.5;
              let x = 0;
              for (let i = 0; i < analyserRef.current!.frequencyBinCount; i++) {
                const barHeight = (freqDataRef.current[i] / 255) * h;
                const r = barHeight + (25 * (i / analyserRef.current!.frequencyBinCount));
                const g = 250 * (i / analyserRef.current!.frequencyBinCount);
                const b = 255;
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(x, h - barHeight, barWidth, barHeight);
                x += barWidth + 1;
                if (x > w) break;
              }
            } else {
              // Idle
              ctx.fillStyle = 'rgba(0,255,204,0.08)';
              for (let i = 0; i < 64; i++) {
                const bh = Math.random() * 8 + 2;
                ctx.fillRect(i * (w/64) + 1, h - bh, (w/64)-2, bh);
              }
            }
          }
        }

        // Draw wave canvas
        if (waveCanvasRef.current) {
          const canvas = waveCanvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const w = canvas.width;
            const h = canvas.height;
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, w, h);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#00ffcc';
            ctx.beginPath();
            if (isPlaying && timeDataRef.current && analyserRef.current) {
              const sliceWidth = w * 1.0 / analyserRef.current.fftSize;
              let x = 0;
              for (let i = 0; i < analyserRef.current.fftSize; i++) {
                const v = timeDataRef.current[i] / 128.0;
                const y = v * h / 2;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                x += sliceWidth;
              }
              ctx.lineTo(w, h/2);
              ctx.stroke();
            } else {
              // Idle sine
              ctx.strokeStyle = 'rgba(0,255,204,0.3)';
              ctx.beginPath();
              for (let x = 0; x < w; x++) {
                const y = h/2 + Math.sin(x * 0.02 + now * 0.002) * 10;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.stroke();
            }
          }
        }
      }

      // 3D Updates
      if (mainMeshRef.current && particlesMeshRef.current && mainGeoRef.current) {
        const timeOffset = now * 0.001;
        const mesh = mainMeshRef.current;
        const particlesMesh = particlesMeshRef.current;
        const geometry = mainGeoRef.current;

        mesh.rotation.x += 0.005 + (midAvg / 25500);
        mesh.rotation.y += 0.01 + (bassAvg / 25500);

        // Displacement
        const posAttr = geometry.attributes.position as THREE.BufferAttribute;
        const displacementFactor = params.displacement * (bassAvg / 255) * 5;
        const complexityFactor = params.complexity;

        for (let i = 0; i < posAttr.count; i++) {
          const v = originalVerticesRef.current[i];
          if (!v) continue;
          const d = Math.sin(v.x * 0.1 * complexityFactor + timeOffset) *
                    Math.cos(v.y * 0.1 * complexityFactor + timeOffset) *
                    displacementFactor;
          posAttr.setXYZ(
            i,
            v.x + (v.x > 0 ? d : -d),
            v.y + (v.y > 0 ? d : -d),
            v.z + (v.z > 0 ? d : -d)
          );
        }
        posAttr.needsUpdate = true;

        // Color based on treble + colorMode
        const hue = (timeOffset * 0.05 + (trebAvg / 255) * 0.3 + colorMode * 0.15) % 1;
        (mesh.material as THREE.MeshBasicMaterial).color.setHSL(hue, 1, 0.5);

        // Particles
        particlesMesh.rotation.y = -timeOffset * 0.05;
        const pPos = particlesGeoRef.current?.attributes.position as THREE.BufferAttribute;
        const pCol = particlesGeoRef.current?.attributes.color as THREE.BufferAttribute;
        if (pPos && pCol) {
          const bassScale = 1 + (bassAvg / 255) * 0.5;
          for (let i = 0; i < particleCount; i++) {
            let x = pPos.getX(i);
            let y = pPos.getY(i);
            x += Math.sin(timeOffset + y * 0.01) * 0.5 * params.complexity;
            y += Math.cos(timeOffset + x * 0.01) * 0.5 * params.complexity;
            pPos.setXYZ(i, x, y, pPos.getZ(i));

            const dist = Math.sqrt(x*x + y*y + pPos.getZ(i)*pPos.getZ(i));
            if (dist < 150) {
              pCol.setXYZ(i, 0, (midAvg/255), (trebAvg/255));
            } else {
              pCol.setXYZ(i, (trebAvg/255), 0, (bassAvg/255));
            }
          }
          particlesMesh.scale.set(bassScale, bassScale, bassScale);
          pPos.needsUpdate = true;
          pCol.needsUpdate = true;
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, params.complexity, params.displacement, params.bassAvg, params.midAvg, params.trebAvg, particleCount, colorMode]);

  // Canvas sizing effect
  useEffect(() => {
    const resizeAll = () => {
      if (freqCanvasRef.current) {
        const rect = freqCanvasRef.current.parentElement?.getBoundingClientRect();
        if (rect) {
          freqCanvasRef.current.width = rect.width;
          freqCanvasRef.current.height = rect.height;
        }
      }
      if (waveCanvasRef.current) {
        const rect = waveCanvasRef.current.parentElement?.getBoundingClientRect();
        if (rect) {
          waveCanvasRef.current.width = rect.width;
          waveCanvasRef.current.height = rect.height;
        }
      }
    };
    resizeAll();
    window.addEventListener('resize', resizeAll);
    const t = setTimeout(resizeAll, 300);
    return () => {
      window.removeEventListener('resize', resizeAll);
      clearTimeout(t);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full bg-[#050505] border border-[#222] rounded-xl overflow-hidden font-mono shadow-[0_0_80px_rgba(0,255,204,0.08)]">
      {/* Header - original SYNTHESIS style but with ZIAA archival framing */}
      <div className="h-10 bg-black border-b border-[#222] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="font-mono text-[18px] font-bold tracking-tighter flex items-center gap-2">
            <span className="text-white">SYNTH</span><span className="text-[#00ffcc] drop-shadow-[0_0_8px_#00ffcc]">ESIS</span>
            <span className="text-[#444] text-xs mx-1">//</span>
            <span className="text-[#ff00ff] text-xs tracking-[0.2em]">SIGNAL LAB</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[9px] bg-[#0a1a14] border border-emerald-900 text-emerald-300">ZIAA RECOVERY // PROT-161</span>
            <span className="px-2 py-0.5 rounded text-[9px] bg-[#161309] border border-[#8c6d31]/60 text-[#dfb76c]">EXTERNAL INTEGRATION</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="text-[#666]">CPU:</span>
            <span className="text-[#00ffcc] font-bold">{cpuLoad.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#666]">FPS:</span>
            <span className="text-[#facc15] font-bold">{fps}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
            <span className="text-emerald-300">LIVE DSP</span>
          </div>
          <a 
            href="https://github.com/zazieproductions/SYNTHESIS-SIGNAL" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 bg-[#111] hover:bg-[#1a1a1a] border border-[#333] hover:border-[#00ffcc] text-[#888] hover:text-[#00ffcc] rounded transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">GITHUB</span>
          </a>
        </div>
      </div>

      {/* Main Grid Layout - matching original prototype but responsive */}
      <div className="grid grid-cols-12 grid-rows-[auto] lg:grid-rows-[460px_220px] min-h-[700px]">
        
        {/* Left Sidebar */}
        <div className="col-span-12 lg:col-span-3 bg-[#0a0a0a] border-b lg:border-b-0 lg:border-r border-[#222] flex flex-col">
          {/* Source Input */}
          <div className="p-3 border-b border-[#222]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[10px] uppercase text-[#666] tracking-widest flex items-center gap-1.5">
                <FileAudio className="w-3 h-3" /> Source Input
              </h2>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1a1a1a] border border-[#333] text-[#00ffcc]">WAV/MP3</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 bg-[#111] hover:bg-[#1a1a1a] border border-dashed border-[#444] hover:border-[#facc15] text-xs text-[#aaa] hover:text-[#facc15] rounded transition-all flex items-center justify-center gap-2 group"
            >
              <Upload className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span className="truncate max-w-[160px]">{fileName || 'Load Audio File (.mp3, .wav)'}</span>
            </button>
            {hasAudio && (
              <div className="mt-2 text-[9px] text-emerald-400 flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                Audio buffer decoded • {bufferRef.current ? `${bufferRef.current.duration.toFixed(2)}s • ${bufferRef.current.sampleRate}Hz` : ''}
              </div>
            )}
          </div>

          {/* Transport */}
          <div className="p-3 border-b border-[#222]">
            <h2 className="text-[10px] uppercase text-[#666] tracking-widest mb-2 flex items-center gap-1.5">
              <Radio className="w-3 h-3" /> Transport
            </h2>
            <div className="flex gap-1.5 mb-3">
              <button
                onClick={playAudio}
                disabled={!hasAudio}
                className={`flex-1 py-2 rounded text-[11px] font-bold tracking-wider flex items-center justify-center gap-1 transition-all ${
                  isPlaying 
                    ? 'bg-[#00ffcc] text-black shadow-[0_0_12px_rgba(0,255,204,0.5)]' 
                    : 'bg-[#1a1a1a] border border-[#333] text-[#ddd] hover:border-[#00ffcc] hover:text-[#00ffcc] disabled:opacity-30 disabled:cursor-not-allowed'
                }`}
              >
                <Play className="w-3 h-3 fill-current" /> PLAY
              </button>
              <button
                onClick={pauseAudio}
                disabled={!isPlaying}
                className="flex-1 py-2 rounded text-[11px] font-bold bg-[#1a1a1a] border border-[#333] text-[#ddd] hover:border-[#facc15] hover:text-[#facc15] disabled:opacity-30 flex items-center justify-center gap-1 transition-colors"
              >
                <Pause className="w-3 h-3" /> PAUSE
              </button>
              <button
                onClick={stopAudio}
                className="flex-1 py-2 rounded text-[11px] font-bold bg-[#1a1a1a] border border-[#333] text-[#ddd] hover:border-[#ff00ff] hover:text-[#ff00ff] flex items-center justify-center gap-1 transition-colors"
              >
                <Square className="w-3 h-3 fill-current" /> STOP
              </button>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-[#666]">TIME</span>
              <span className="text-[#00ffcc] tracking-wider">{timeDisplay}</span>
            </div>
            <div className="mt-2 h-1 w-full bg-[#1a1a1a] rounded overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00ffcc] to-[#ff00ff] transition-all duration-100"
                style={{ 
                  width: bufferRef.current && audioCtxRef.current && isPlaying 
                    ? `${Math.min(100, ((audioCtxRef.current.currentTime - startTimeRef.current) / bufferRef.current.duration) * 100)}%`
                    : pauseTimeRef.current && bufferRef.current
                    ? `${(pauseTimeRef.current / bufferRef.current.duration) * 100}%`
                    : '0%'
                }}
              />
            </div>
          </div>

          {/* Project Hierarchy */}
          <div className="flex-1 p-3 overflow-y-auto">
            <div className="text-[10px] uppercase text-[#666] tracking-widest mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Layers className="w-3 h-3" /> Project Hierarchy</span>
              <span className="text-[#00ffcc] text-[9px]">● LIVE</span>
            </div>
            <ul className="font-mono text-[10px] text-[#666] space-y-0.5">
              <li className="py-1 cursor-pointer hover:text-white transition-colors">▼ Master Scene
                <ul className="pl-3 mt-1 border-l border-[#333] space-y-0.5">
                  <li className="py-1 text-[#00ffcc] flex items-center gap-1"><Box className="w-2.5 h-2.5" /> Audio_Analyzer_Node</li>
                  <li className="py-1 hover:text-white cursor-pointer">▼ Geometry_Gen
                    <ul className="pl-3 mt-1 border-l border-[#333] space-y-0.5">
                      <li className="py-0.5 hover:text-white">TorusKnot_01</li>
                      <li className="py-0.5 hover:text-white">Wireframe_Mat</li>
                    </ul>
                  </li>
                  <li className="py-1 hover:text-white cursor-pointer">Particle_System_Alpha</li>
                  <li className="py-1 hover:text-white cursor-pointer">Post_Processing_Stack</li>
                </ul>
              </li>
            </ul>

            <div className="mt-4 space-y-2">
              <div className="text-[10px] text-[#666] uppercase tracking-widest">Geometry Type</div>
              <div className="grid grid-cols-3 gap-1">
                {(['torusKnot','torus','icosahedron'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setActiveGeometry(g)}
                    className={`px-2 py-1.5 rounded text-[9px] uppercase border transition-all ${
                      activeGeometry === g 
                        ? 'bg-[#00ffcc] text-black border-[#00ffcc] font-bold' 
                        : 'bg-[#111] text-[#666] border-[#333] hover:border-[#00ffcc] hover:text-[#00ffcc]'
                    }`}
                  >
                    {g === 'torusKnot' ? 'KNOT' : g === 'torus' ? 'TORUS' : 'ICO'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modulation Matrix */}
          <div className="h-[130px] border-t border-[#222] p-2.5">
            <div className="flex justify-between items-center text-[10px] uppercase text-[#666] tracking-widest mb-2">
              <span className="flex items-center gap-1"><Grid3X3 className="w-3 h-3" /> Modulation Matrix</span>
              <span className="text-[9px] text-[#666]">8×4 • 32 ROUTES</span>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {matrixCells.map((active, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const next = [...matrixCells];
                    next[i] = !next[i];
                    setMatrixCells(next);
                  }}
                  className={`aspect-square rounded-[2px] border transition-all ${
                    active
                      ? i % 3 === 0 ? 'bg-[#00ffcc] border-[#00ffcc] shadow-[0_0_6px_#00ffcc]' 
                        : i % 3 === 1 ? 'bg-[#ff00ff] border-[#ff00ff] shadow-[0_0_6px_#ff00ff]'
                        : 'bg-[#facc15] border-[#facc15] shadow-[0_0_6px_#facc15]'
                      : 'bg-[#1a1a1a] border-[#222] hover:border-[#444]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center Stage */}
        <div className="col-span-12 lg:col-span-6 relative bg-[#050505] border-b lg:border-b-0 lg:border-r border-[#222] min-h-[420px] lg:min-h-0">
          <div className="absolute top-2 left-2 z-10 flex gap-2">
            <span className="bg-black/70 backdrop-blur text-[#facc15] px-2 py-1 text-[9px] font-mono rounded border border-[#facc15]/30 tracking-widest">RENDER_OUT</span>
            <span className="bg-black/70 backdrop-blur text-white px-2 py-1 text-[9px] font-mono rounded border border-[#333] tracking-widest">COMP: Main • {activeGeometry.toUpperCase()}</span>
            {isPlaying && <span className="bg-[#00ffcc]/20 text-[#00ffcc] px-2 py-1 text-[9px] font-mono rounded border border-[#00ffcc]/40 animate-pulse">● REC</span>}
          </div>
          
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 text-right">
            <div className="bg-black/70 backdrop-blur px-2 py-1 rounded border border-[#222] text-[9px] font-mono text-[#666]">
              <div>BASS <span className="text-[#ff00ff]">{params.bassAvg.toFixed(0)}</span></div>
              <div>MID <span className="text-[#00ffcc]">{params.midAvg.toFixed(0)}</span></div>
              <div>TREB <span className="text-[#facc15]">{params.trebAvg.toFixed(0)}</span></div>
            </div>
          </div>

          <canvas ref={threeCanvasRef} className="w-full h-full block" style={{ width: '100%', height: '100%' }} />

          {/* Crosshair overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-[#222]/50" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#222]/50" />
            <div className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 border border-[#333] rounded-full" />
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-2 left-2 right-2 z-10 flex justify-between items-center">
            <div className="flex items-center gap-2 text-[9px] font-mono text-[#555] bg-black/70 backdrop-blur px-2 py-1 rounded border border-[#222]">
              <Eye className="w-3 h-3" />
              <span>FFT 2048 • PARTICLES {particleCount} • WIREFRAME • FOG EXP2</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[9px] font-mono bg-black/70 backdrop-blur px-2 py-1 rounded border border-[#222]">
              <span className="text-[#666]">COMPLEX</span><span className="text-[#00ffcc]">{params.complexity.toFixed(2)}</span>
              <span className="text-[#666]">DISPLACE</span><span className="text-[#ff00ff]">{params.displacement.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-3 bg-[#0a0a0a] flex flex-col">
          {/* Node Editor */}
          <div className="h-[180px] border-b border-[#222] flex flex-col relative">
            <div className="h-6 bg-[#151515] border-b border-[#222] px-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-[#666]">
              <span>Node Editor</span>
              <span className="text-[#00ffcc]">ACTIVE</span>
            </div>
            <div className="flex-1 relative overflow-hidden bg-[#0a0a0a]" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}>
              <div className="absolute top-[20px] left-[10px] bg-[#111] border border-[#444] rounded px-2 py-1 text-[9px] text-[#aaa] shadow-lg">
                AudioIn <span className="inline-block w-1.5 h-1.5 bg-[#00ffcc] rounded-full ml-1" />
              </div>
              <div className="absolute top-[80px] left-[50px] bg-[#111] border border-[#444] rounded px-2 py-1 text-[9px] text-[#aaa] shadow-lg">
                <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mr-1" /> FFT_Analyze <span className="inline-block w-1.5 h-1.5 bg-[#00ffcc] rounded-full ml-1" />
              </div>
              <div className="absolute top-[40px] left-[150px] bg-[#111] border border-[#444] rounded px-2 py-1 text-[9px] text-[#aaa] shadow-lg">
                <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1" /> Math_Op <span className="inline-block w-1.5 h-1.5 bg-[#00ffcc] rounded-full ml-1" />
              </div>
              <div className="absolute top-[100px] left-[190px] bg-[#111] border border-[#00ffcc] rounded px-2 py-1 text-[9px] text-[#00ffcc] shadow-[0_0_8px_rgba(0,255,204,0.2)]">
                <span className="inline-block w-1.5 h-1.5 bg-[#00ffcc] rounded-full mr-1" /> Render_Target
              </div>
              <svg width="100%" height="100%" className="absolute inset-0 pointer-events-none">
                <path d="M 60 30 C 80 30, 40 90, 50 90" stroke="#555" fill="none" strokeWidth="1.5" />
                <path d="M 120 90 C 140 90, 130 50, 150 50" stroke="#555" fill="none" strokeWidth="1.5" />
                <path d="M 190 50 C 200 50, 180 110, 200 110" stroke="#00ffcc" fill="none" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.8" />
              </svg>
            </div>
          </div>

          {/* Parameters */}
          <div className="flex-1 p-3 space-y-4 overflow-y-auto">
            <div>
              <h3 className="text-[11px] font-bold text-[#ddd] mb-3 border-b border-[#222] pb-1 tracking-widest uppercase">Geometry Transformer</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-[#666] mb-1">
                    <span>Complexity</span>
                    <span className="text-[#00ffcc]">{params.complexity.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.01"
                    value={params.complexity}
                    onChange={e => setParams(p => ({ ...p, complexity: parseFloat(e.target.value) }))}
                    className="w-full h-1 accent-[#00ffcc] bg-[#222] rounded cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-[#666] mb-1">
                    <span>Displacement</span>
                    <span className="text-[#ff00ff]">{params.displacement.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={params.displacement}
                    onChange={e => setParams(p => ({ ...p, displacement: parseFloat(e.target.value) }))}
                    className="w-full h-1 accent-[#ff00ff] bg-[#222] rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-bold text-[#ddd] mb-3 border-b border-[#222] pb-1 tracking-widest uppercase">Particle Field Dynamics</h3>
              <div className="flex justify-around">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full border-2 border-[#333] relative bg-[#111]" style={{ background: `conic-gradient(#ff00ff 70%, transparent 70%)` }}>
                    <div className="absolute inset-[2px] bg-[#0a0a0a] rounded-full" />
                    <div className="absolute w-0.5 h-3 bg-white top-0.5 left-1/2 -translate-x-1/2 origin-bottom rotate-45" />
                  </div>
                  <span className="text-[8px] font-mono text-[#666]">VELOCITY</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full border-2 border-[#333] relative bg-[#111]" style={{ background: `conic-gradient(#00ffcc 40%, transparent 40%)` }}>
                    <div className="absolute inset-[2px] bg-[#0a0a0a] rounded-full" />
                    <div className="absolute w-0.5 h-3 bg-white top-0.5 left-1/2 -translate-x-1/2 origin-bottom -rotate-45" />
                  </div>
                  <span className="text-[8px] font-mono text-[#666]">TURBULENCE</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full border-2 border-[#333] relative bg-[#111]" style={{ background: `conic-gradient(#facc15 90%, transparent 90%)` }}>
                    <div className="absolute inset-[2px] bg-[#0a0a0a] rounded-full" />
                    <div className="absolute w-0.5 h-3 bg-white top-0.5 left-1/2 -translate-x-1/2 origin-bottom rotate-[120deg]" />
                  </div>
                  <span className="text-[8px] font-mono text-[#666]">DENSITY</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-bold text-[#ddd] mb-3 border-b border-[#222] pb-1 tracking-widest uppercase">Color Mapping</h3>
              <div className="flex gap-2">
                {[
                  { c: '#ff00ff', active: colorMode === 0 },
                  { c: '#00ffcc', active: colorMode === 1 },
                  { c: '#facc15', active: colorMode === 2 },
                  { c: '#ff3333', active: colorMode === 3 },
                ].map((col, i) => (
                  <button
                    key={i}
                    onClick={() => setColorMode(i)}
                    className={`w-8 h-8 rounded border-2 transition-all ${col.active ? 'border-white shadow-[0_0_10px_currentColor] scale-110' : 'border-[#444] hover:border-[#666]'}`}
                    style={{ backgroundColor: col.c, color: col.c }}
                  />
                ))}
                <div className="ml-auto text-[9px] text-[#555] font-mono self-center">
                  HSL • TREBLE_MOD
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#222]">
              <div className="flex items-center gap-2 text-[10px] text-[#666] mb-2">
                <Terminal className="w-3 h-3" /> SYSTEM TELEMETRY
              </div>
              <div className="space-y-1 text-[9px] font-mono">
                <div className="flex justify-between"><span className="text-[#555]">FFT_SIZE</span><span className="text-[#00ffcc]">2048</span></div>
                <div className="flex justify-between"><span className="text-[#555]">SMOOTHING</span><span className="text-[#00ffcc]">0.85</span></div>
                <div className="flex justify-between"><span className="text-[#555]">GEO_VERTS</span><span className="text-[#ff00ff]">{mainGeoRef.current ? (mainGeoRef.current.attributes.position as any)?.count || 0 : 0}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">PARTICLES</span><span className="text-[#facc15]">{particleCount}</span></div>
                <div className="flex justify-between"><span className="text-[#555]">RENDERER</span><span className="text-white">WebGL2</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="col-span-12 h-[220px] border-t border-[#222] flex flex-col bg-[#0a0a0a]">
          <div className="h-6 bg-[#151515] border-b border-[#222] px-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-[#666]">
            <span className="flex items-center gap-2"><Waves className="w-3 h-3" /> Audio Analysis Workspace</span>
            <div className="flex gap-3">
              <span className="text-[#00ffcc]">● Live</span>
              <span>FFT Size: 2048</span>
            </div>
          </div>
          <div className="flex-1 flex">
            <div className="w-2/3 h-full border-r border-[#222] p-2 relative">
              <span className="absolute top-2 left-3 text-[9px] font-mono text-[#555] z-10 tracking-widest">SPECTRUM_ANALYZER [Freq/Amp]</span>
              <canvas ref={freqCanvasRef} className="w-full h-full block" />
            </div>
            <div className="w-1/3 h-full p-2 relative">
              <span className="absolute top-2 left-3 text-[9px] font-mono text-[#555] z-10 tracking-widest">OSCILLOSCOPE [Time/Amp]</span>
              <canvas ref={waveCanvasRef} className="w-full h-full block" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer - ZIAA archival footer */}
      <div className="bg-black border-t border-[#222] px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[9px] font-mono text-[#555]">
        <div className="flex items-center gap-3">
          <span className="text-[#dfb76c]">SYNTHESIS-SIGNAL // ZIAA RECOVERY ARCHIVE</span>
          <span className="hidden sm:inline">• BROWSER-BASED AUDIOVISUAL DSP LABORATORY • WEB AUDIO API + THREE.JS • FFT-DRIVEN GEOMETRY</span>
        </div>
        <div className="flex items-center gap-3">
          <span>ORIGIN: github.com/zazieproductions/SYNTHESIS-SIGNAL</span>
          <span className="px-1.5 py-0.5 rounded bg-[#0a1a14] border border-emerald-900/50 text-emerald-400">INTEGRATED • INTERACTIVE</span>
        </div>
      </div>
    </div>
  );
};
