import { AudioProfile } from '../data/types';

export class AcousticEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private oscLeft: OscillatorNode | null = null;
  private oscRight: OscillatorNode | null = null;
  private modOsc: OscillatorNode | null = null;
  private modGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private isRunning: boolean = false;
  private currentProfile: AudioProfile | null = null;
  private listeners: Set<(isPlaying: boolean, profile: AudioProfile | null) => void> = new Set();

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.85;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(fn: (isPlaying: boolean, profile: AudioProfile | null) => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.isRunning, this.currentProfile));
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  public getCurrentProfile(): AudioProfile | null {
    return this.currentProfile;
  }

  public setMasterGain(val: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime, 0.05);
    }
  }

  public updateParameters(params: Partial<AudioProfile>) {
    if (!this.currentProfile || !this.ctx) return;
    this.currentProfile = { ...this.currentProfile, ...params };
    const now = this.ctx.currentTime;

    if (params.carrierFreq !== undefined && this.oscLeft && this.oscRight) {
      const delta = params.binauralDelta ?? this.currentProfile.binauralDelta;
      this.oscLeft.frequency.setTargetAtTime(params.carrierFreq, now, 0.05);
      this.oscRight.frequency.setTargetAtTime(params.carrierFreq + delta, now, 0.05);
    }

    if (params.modFreq !== undefined && this.modOsc) {
      this.modOsc.frequency.setTargetAtTime(params.modFreq, now, 0.05);
    }

    if (params.filterCutoff !== undefined && this.filterNode) {
      this.filterNode.frequency.setTargetAtTime(params.filterCutoff, now, 0.05);
    }

    if (params.resonance !== undefined && this.filterNode) {
      this.filterNode.Q.setTargetAtTime(params.resonance, now, 0.05);
    }

    if (params.noiseLevel !== undefined && this.noiseGain) {
      this.noiseGain.gain.setTargetAtTime(params.noiseLevel * 0.35, now, 0.05);
    }

    this.notify();
  }

  public playProfile(profile: AudioProfile) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    this.stop();
    this.currentProfile = { ...profile };
    const now = this.ctx.currentTime;

    // Filter Node
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = profile.filterType;
    this.filterNode.frequency.setValueAtTime(profile.filterCutoff, now);
    this.filterNode.Q.setValueAtTime(profile.resonance, now);
    this.filterNode.connect(this.masterGain);

    // Channel merger for true stereo separation
    const merger = this.ctx.createChannelMerger(2);
    merger.connect(this.filterNode);

    // Left oscillator
    this.oscLeft = this.ctx.createOscillator();
    this.oscLeft.type = profile.waveform;
    this.oscLeft.frequency.setValueAtTime(profile.carrierFreq, now);

    // Right oscillator with binaural offset
    this.oscRight = this.ctx.createOscillator();
    this.oscRight.type = profile.waveform;
    this.oscRight.frequency.setValueAtTime(profile.carrierFreq + profile.binauralDelta, now);

    // Frequency modulation oscillator
    if (profile.modFreq > 0) {
      this.modOsc = this.ctx.createOscillator();
      this.modOsc.type = 'sine';
      this.modOsc.frequency.setValueAtTime(profile.modFreq, now);

      this.modGain = this.ctx.createGain();
      const modDepth = profile.carrierFreq * (profile.harmonicScatter * 0.4 + 0.1);
      this.modGain.gain.setValueAtTime(modDepth, now);

      this.modOsc.connect(this.modGain);
      this.modGain.connect(this.oscLeft.frequency);
      this.modGain.connect(this.oscRight.frequency);
      this.modOsc.start(now);
    }

    // Connect oscillators to merger
    const gainL = this.ctx.createGain();
    gainL.gain.setValueAtTime(0.5, now);
    this.oscLeft.connect(gainL);
    gainL.connect(merger, 0, 0);

    const gainR = this.ctx.createGain();
    gainR.gain.setValueAtTime(0.5, now);
    this.oscRight.connect(gainR);
    gainR.connect(merger, 0, 1);

    this.oscLeft.start(now);
    this.oscRight.start(now);

    // Stochastic noise source
    if (profile.noiseLevel > 0) {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        const pop = Math.random() > 0.992 ? (Math.random() - 0.5) * 3 : 0;
        data[i] = white * 0.4 + pop;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;

      this.noiseGain = this.ctx.createGain();
      this.noiseGain.gain.setValueAtTime(profile.noiseLevel * 0.35, now);

      this.noiseNode.connect(this.noiseGain);
      this.noiseGain.connect(this.filterNode);
      this.noiseNode.start(now);
    }

    this.isRunning = true;
    this.notify();
  }

  public stop() {
    if (!this.isRunning && !this.oscLeft) return;

    try {
      if (this.oscLeft) {
        this.oscLeft.stop();
        this.oscLeft.disconnect();
        this.oscLeft = null;
      }
      if (this.oscRight) {
        this.oscRight.stop();
        this.oscRight.disconnect();
        this.oscRight = null;
      }
      if (this.modOsc) {
        this.modOsc.stop();
        this.modOsc.disconnect();
        this.modOsc = null;
      }
      if (this.modGain) {
        this.modGain.disconnect();
        this.modGain = null;
      }
      if (this.noiseNode) {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
        this.noiseNode = null;
      }
      if (this.noiseGain) {
        this.noiseGain.disconnect();
        this.noiseGain = null;
      }
      if (this.filterNode) {
        this.filterNode.disconnect();
        this.filterNode = null;
      }
    } catch {
      // Ignore disconnect errors during abrupt teardown
    }

    this.isRunning = false;
    this.notify();
  }

  public toggle(profile?: AudioProfile) {
    if (this.isRunning) {
      this.stop();
    } else if (profile) {
      this.playProfile(profile);
    } else if (this.currentProfile) {
      this.playProfile(this.currentProfile);
    }
  }
}

export const audioEngine = new AcousticEngine();
