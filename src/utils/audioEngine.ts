// Web Audio and HTML5 Audio hybrid engine for Mindustry Music Manager
import { MusicTrack, LoopMode } from '../types';

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private analyserNode: AnalyserNode | null = null;
  private synthGainNode: GainNode | null = null;
  private isSynthesizing = false;
  private synthInterval: number | null = null;
  private currentTrack: MusicTrack | null = null;
  private volume = 0.8;
  private isMuted = false;
  private currentTime = 0;
  private duration = 0;
  private isPlaying = false;
  private loopMode: LoopMode = 'all';

  private onTimeUpdateCallback: ((time: number, duration: number) => void) | null = null;
  private onTrackEndedCallback: (() => void) | null = null;
  private onPlayStateChangeCallback: ((playing: boolean) => void) | null = null;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.preload = 'metadata';

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement && !this.isSynthesizing) {
        this.currentTime = this.audioElement.currentTime;
        this.duration = this.audioElement.duration || this.currentTrack?.duration || 0;
        this.onTimeUpdateCallback?.(this.currentTime, this.duration);
      }
    });

    this.audioElement.addEventListener('ended', () => {
      this.handleTrackEnded();
    });

    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.onPlayStateChangeCallback?.(true);
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.onPlayStateChangeCallback?.(false);
    });
  }

  private initAudioContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 64;
      this.analyserNode.smoothingTimeConstant = 0.8;

      this.synthGainNode = this.audioCtx.createGain();
      this.synthGainNode.gain.value = this.isMuted ? 0 : this.volume;
      this.synthGainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioCtx.destination);
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setCallbacks(
    onTimeUpdate: (time: number, duration: number) => void,
    onTrackEnded: () => void,
    onPlayStateChange: (playing: boolean) => void
  ) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onTrackEndedCallback = onTrackEnded;
    this.onPlayStateChangeCallback = onPlayStateChange;
  }

  public async playTrack(track: MusicTrack, startFromSecond?: number) {
    this.initAudioContext();
    this.stopCurrent();
    this.currentTrack = track;
    this.duration = track.duration;

    if (track.url && !track.isSynthesized) {
      // Real file playback (from "your-music" folder or user upload)
      if (!this.audioElement) return;
      this.audioElement.src = track.url;
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
      if (startFromSecond !== undefined) {
        this.audioElement.currentTime = startFromSecond;
      }
      try {
        await this.audioElement.play();
        this.isPlaying = true;
        this.isSynthesizing = false;
        this.onPlayStateChangeCallback?.(true);
      } catch (err) {
        console.warn('Playback error, falling back to simulated playback:', err);
        this.startSynthPlayback(track, startFromSecond || 0);
      }
    } else {
      // Procedural synthesizer for built-in Mindustry industrial tracks
      this.startSynthPlayback(track, startFromSecond || 0);
    }
  }

  private startSynthPlayback(track: MusicTrack, startFrom = 0) {
    this.initAudioContext();
    this.isSynthesizing = true;
    this.isPlaying = true;
    this.currentTime = startFrom;
    this.duration = track.duration || 140;
    this.onPlayStateChangeCallback?.(true);

    // Industrial synth sequencer pattern
    let step = Math.floor(startFrom * 4) % 16;
    const bpm = 124;
    const stepDuration = 60 / bpm / 2; // eighth notes

    // Bass notes (frequencies in Hz)
    const basePitches = track.synthTheme === 'techno'
      ? [55, 55, 65.41, 55, 73.42, 65.41, 55, 49]
      : track.synthTheme === 'ambient'
      ? [65.41, 77.78, 87.31, 98.0, 87.31, 77.78]
      : track.synthTheme === 'overdrive'
      ? [43.65, 43.65, 51.91, 58.27, 43.65, 65.41]
      : [55, 55, 61.74, 65.41, 55, 49, 55, 73.42];

    if (this.synthInterval) {
      window.clearInterval(this.synthInterval);
    }

    const timerStartTime = performance.now() - (this.currentTime * 1000);

    const playStepSound = () => {
      if (!this.isPlaying || !this.isSynthesizing || !this.audioCtx || !this.synthGainNode) return;

      const now = this.audioCtx.currentTime;
      const pitch = basePitches[step % basePitches.length];

      // Bass synth note
      if (step % 2 === 0) {
        const osc = this.audioCtx.createOscillator();
        const noteGain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400 + (Math.sin(step) * 200), now);

        osc.type = track.synthTheme === 'overdrive' ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(pitch, now);

        noteGain.gain.setValueAtTime(0.25, now);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.synthGainNode);

        osc.start(now);
        osc.stop(now + 0.32);
      }

      // Industrial kick / snare
      if (step % 4 === 0) {
        // Kick
        const kickOsc = this.audioCtx.createOscillator();
        const kickGain = this.audioCtx.createGain();
        kickOsc.frequency.setValueAtTime(120, now);
        kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
        kickGain.gain.setValueAtTime(0.35, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        kickOsc.connect(kickGain);
        kickGain.connect(this.synthGainNode);
        kickOsc.start(now);
        kickOsc.stop(now + 0.16);
      } else if (step % 4 === 2) {
        // Hi-hat / metallic click
        const noiseBuffer = this.audioCtx.createBuffer(1, this.audioCtx.sampleRate * 0.05, this.audioCtx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.audioCtx.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseFilter = this.audioCtx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(5000, now);
        const noiseGain = this.audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.08, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.synthGainNode);
        noise.start(now);
        noise.stop(now + 0.05);
      }

      // Arpeggio melody note
      if (step % 2 === 1 && (step % 8 !== 7)) {
        const leadOsc = this.audioCtx.createOscillator();
        const leadGain = this.audioCtx.createGain();
        leadOsc.type = 'sine';
        leadOsc.frequency.setValueAtTime(pitch * 4, now);
        leadGain.gain.setValueAtTime(0.06, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        leadOsc.connect(leadGain);
        leadGain.connect(this.synthGainNode);
        leadOsc.start(now);
        leadOsc.stop(now + 0.22);
      }

      step = (step + 1) % 64;

      // Update current time
      const elapsed = (performance.now() - timerStartTime) / 1000;
      this.currentTime = elapsed;
      if (this.currentTime >= this.duration) {
        this.handleTrackEnded();
      } else {
        this.onTimeUpdateCallback?.(this.currentTime, this.duration);
      }
    };

    this.synthInterval = window.setInterval(playStepSound, stepDuration * 1000);
  }

  private handleTrackEnded() {
    if (this.loopMode === 'one' && this.currentTrack) {
      this.seekTo(0);
      this.playTrack(this.currentTrack, 0);
    } else {
      this.onTrackEndedCallback?.();
    }
  }

  public pause() {
    if (this.isSynthesizing) {
      if (this.synthInterval) {
        clearInterval(this.synthInterval);
        this.synthInterval = null;
      }
      this.isPlaying = false;
      this.onPlayStateChangeCallback?.(false);
    } else if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  public resume() {
    if (this.currentTrack) {
      if (this.isSynthesizing) {
        this.startSynthPlayback(this.currentTrack, this.currentTime);
      } else if (this.audioElement) {
        this.audioElement.play().catch(console.warn);
      }
    }
  }

  public stopCurrent() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.isPlaying = false;
    this.isSynthesizing = false;
    this.onPlayStateChangeCallback?.(false);
  }

  public seekTo(second: number) {
    this.currentTime = Math.max(0, Math.min(second, this.duration));
    if (this.isSynthesizing && this.currentTrack) {
      if (this.isPlaying) {
        this.startSynthPlayback(this.currentTrack, this.currentTime);
      } else {
        this.onTimeUpdateCallback?.(this.currentTime, this.duration);
      }
    } else if (this.audioElement) {
      this.audioElement.currentTime = this.currentTime;
      this.onTimeUpdateCallback?.(this.currentTime, this.duration);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    if (this.synthGainNode) {
      this.synthGainNode.gain.value = this.isMuted ? 0 : this.volume;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.audioElement) {
      this.audioElement.volume = muted ? 0 : this.volume;
    }
    if (this.synthGainNode) {
      this.synthGainNode.gain.value = muted ? 0 : this.volume;
    }
  }

  public setLoopMode(mode: LoopMode) {
    this.loopMode = mode;
  }

  public getVisualizerData(dataArray: Uint8Array): void {
    if (this.analyserNode && this.isPlaying) {
      // Use cast for DOM lib TypedArray buffer variance compatibility
      (this.analyserNode as unknown as { getByteFrequencyData: (arr: Uint8Array) => void }).getByteFrequencyData(dataArray);
    } else {
      dataArray.fill(0);
    }
  }
}

export const audioEngine = new AudioEngine();
