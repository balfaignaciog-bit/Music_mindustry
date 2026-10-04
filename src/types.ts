export interface MusicTrack {
  id: string;
  name: string;
  filename: string;
  artist?: string;
  duration: number; // in seconds
  url?: string;
  isSynthesized?: boolean;
  synthTheme?: 'industrial' | 'ambient' | 'techno' | 'overdrive';
  fileSize?: string;
  dateAdded: string;
}

export type LoopMode = 'off' | 'all' | 'one';

export interface PlayerState {
  currentTrackId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  loopMode: LoopMode;
}
