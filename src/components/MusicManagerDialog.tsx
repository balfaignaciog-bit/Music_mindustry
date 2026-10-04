import React, { useState, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, 
  Volume2, VolumeX, FolderPlus, X, Music, Search, Clock
} from 'lucide-react';
import { MusicTrack, LoopMode } from '../types';
import { MusicVisualizer } from './MusicVisualizer';

interface MusicManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: MusicTrack[];
  currentTrackId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isShuffle: boolean;
  loopMode: LoopMode;
  volume: number;
  isMuted: boolean;
  onPlayTrack: (track: MusicTrack) => void;
  onTogglePlayPause: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSeek: (seconds: number) => void;
  onToggleShuffle: () => void;
  onCycleLoopMode: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onAddTracks: (files: FileList) => void;
  onOpenFolderTab: () => void;
}

export const MusicManagerDialog: React.FC<MusicManagerDialogProps> = ({
  isOpen,
  onClose,
  tracks,
  currentTrackId,
  isPlaying,
  currentTime,
  duration,
  isShuffle,
  loopMode,
  volume,
  isMuted,
  onPlayTrack,
  onTogglePlayPause,
  onNextTrack,
  onPrevTrack,
  onSeek,
  onToggleShuffle,
  onCycleLoopMode,
  onVolumeChange,
  onToggleMute,
  onAddTracks,
  onOpenFolderTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const currentTrack = tracks.find(t => t.id === currentTrackId) || null;

  const filteredTracks = tracks.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (secs: number) => {
    const totalSecs = Math.max(0, Math.floor(secs));
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrubValue(val);
    onSeek(val);
  };

  const currentSec = isScrubbing ? scrubValue : currentTime;
  const currentTotal = duration || currentTrack?.duration || 1;
  const progressPercent = Math.min(100, Math.max(0, (currentSec / currentTotal) * 100));

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddTracks(e.target.files);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/75 backdrop-blur-sm select-none animate-fadeIn">
      {/* Mindustry Window Frame */}
      <div className="w-full max-w-4xl bg-[#12141a] border-2 border-[#2f3545] shadow-2xl rounded-sm flex flex-col max-h-[92vh] overflow-hidden text-slate-200">
        
        {/* Window Title Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1d26] border-b border-[#2f3545]">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xs font-mono font-bold">
              ♫
            </span>
            <div className="flex items-baseline gap-2">
              <h2 className="font-game font-bold tracking-wider text-base text-amber-400 uppercase">
                Your Music Manager
              </h2>
              <span className="hidden sm:inline text-xs text-slate-400 font-mono">
                [Ctrl + M]
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-[#242938] hover:bg-[#2d3447] text-amber-300 rounded border border-[#3b435a] transition-colors cursor-pointer"
              title="Añadir canciones a la carpeta your-music"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Añadir Canciones</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              multiple
              accept="audio/*,.mp3,.ogg,.wav,.flac"
              className="hidden"
            />
            
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 rounded border border-transparent transition-colors cursor-pointer"
              title="Cerrar ventana (Ctrl + M)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Directory Bar & Search */}
        <div className="px-4 py-2 bg-[#161821] border-b border-[#222735] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono text-slate-400">
            <span className="text-amber-500">Carpeta:</span>
            <code className="bg-[#0e1017] px-2 py-0.5 rounded border border-[#2a3042] text-amber-300">
              mods/your-music-manager/your-music/
            </code>
            <span className="text-slate-500">({tracks.length} archivos)</span>
          </div>

          <div className="relative flex items-center min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar archivo de audio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0f15] border border-[#2d3447] text-slate-200 placeholder-slate-500 rounded pl-8 pr-3 py-1 text-xs focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>
        </div>

        {/* Song List (Top to Bottom list of files as requested) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 min-h-[220px] max-h-[380px] bg-[#0f1117]">
          {filteredTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
              <Music className="w-10 h-10 mb-2 opacity-40 text-amber-500" />
              <p className="text-sm font-medium text-slate-400">No hay canciones en la lista</p>
              <p className="text-xs text-slate-500 mt-1">
                Haz clic en "Añadir Canciones" para cargar archivos .mp3, .ogg o .wav
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-3 py-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded cursor-pointer transition-colors"
              >
                Cargar archivos de audio
              </button>
            </div>
          ) : (
            filteredTracks.map((track, idx) => {
              const isCurrent = track.id === currentTrackId;
              const ext = track.filename.split('.').pop()?.toUpperCase() || 'AUDIO';

              return (
                <div
                  key={track.id}
                  onClick={() => onPlayTrack(track)}
                  className={`group flex items-center justify-between px-3.5 py-2.5 rounded border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-sm text-amber-200'
                      : 'bg-[#151821] hover:bg-[#1b202c] border-[#252b3b] text-slate-300'
                  }`}
                >
                  {/* Left: Icon, Number, Title & Filename */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-6 text-center font-mono text-xs text-slate-500">
                      {isCurrent && isPlaying ? (
                        <div className="flex items-end justify-center gap-0.5 h-3.5">
                          <span className="w-1 bg-amber-400 h-full animate-pulse" />
                          <span className="w-1 bg-amber-400 h-2/3 animate-bounce" />
                          <span className="w-1 bg-amber-400 h-5/6 animate-pulse" />
                        </div>
                      ) : (
                        <span className="group-hover:hidden">{(idx + 1).toString().padStart(2, '0')}</span>
                      )}
                      {!isCurrent && (
                        <Play className="w-3.5 h-3.5 hidden group-hover:block text-amber-400" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold truncate ${isCurrent ? 'text-amber-300' : 'text-slate-200'}`}>
                          {track.name}
                        </span>
                        <span className="text-[10px] px-1 py-0.2 bg-[#0e1016] text-amber-400/90 border border-amber-500/30 rounded font-mono shrink-0">
                          {ext}
                        </span>
                        {track.isSynthesized && (
                          <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                            · Preset Mindustry
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-mono truncate flex items-center gap-2 mt-0.5">
                        <span>{track.filename}</span>
                        {track.artist && (
                          <>
                            <span>·</span>
                            <span>{track.artist}</span>
                          </>
                        )}
                        {track.fileSize && (
                          <>
                            <span>·</span>
                            <span>{track.fileSize}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Duration & Status */}
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      {formatTime(track.duration)}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrent) {
                          onTogglePlayPause();
                        } else {
                          onPlayTrack(track);
                        }
                      }}
                      className={`w-8 h-8 rounded flex items-center justify-center border transition-colors cursor-pointer ${
                        isCurrent && isPlaying
                          ? 'bg-amber-500 text-black border-amber-400'
                          : 'bg-[#222736] hover:bg-amber-500 hover:text-black text-slate-300 border-[#32394d]'
                      }`}
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Player Controls Panel (Lower section with Scrubber & Buttons) */}
        <div className="p-4 bg-[#141720] border-t-2 border-[#2b3142]">
          
          {/* Track Info & Visualizer */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-500">
                  {isPlaying ? 'Reproduciendo Ahora:' : 'En Pausa:'}
                </span>
                <span className="text-sm font-bold text-white truncate">
                  {currentTrack ? currentTrack.name : 'Ninguna pista seleccionada'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate">
                {currentTrack ? `${currentTrack.filename} (${currentTrack.artist || 'Mindustry Track'})` : 'Selecciona una canción de la lista superior'}
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <MusicVisualizer isPlaying={isPlaying} barCount={20} height={28} />
            </div>
          </div>

          {/* Deslizador de segundo exacto y barra de progreso */}
          <div className="space-y-1 mb-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-amber-400 font-semibold tabular-nums">
                  {formatTime(currentSec)}
                </span>
                <span className="text-slate-500">
                  ({Math.floor(currentSec)}s)
                </span>
              </div>
              <div className="text-slate-400 font-mono tabular-nums">
                <span>{formatTime(currentTotal)}</span>
                <span className="text-slate-500 ml-1">({Math.floor(currentTotal)}s)</span>
              </div>
            </div>

            {/* Scrubber Range Slider (Elige el segundo mediante el deslizador) */}
            <div className="relative flex items-center group py-1">
              <input
                type="range"
                min={0}
                max={Math.max(1, currentTotal)}
                step={1}
                value={currentSec}
                onMouseDown={() => setIsScrubbing(true)}
                onTouchStart={() => setIsScrubbing(true)}
                onMouseUp={() => setIsScrubbing(false)}
                onTouchEnd={() => setIsScrubbing(false)}
                onChange={handleSliderChange}
                className="w-full h-2 bg-[#252b3b] rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${progressPercent}%, #252b3b ${progressPercent}%, #252b3b 100%)`
                }}
              />
            </div>
          </div>

          {/* Playback Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Playback Controls (Prev, Play/Pause, Next) */}
            <div className="flex items-center gap-2">
              <button
                onClick={onPrevTrack}
                disabled={tracks.length === 0}
                className="w-9 h-9 rounded bg-[#1e2330] hover:bg-[#282f42] text-slate-300 hover:text-white flex items-center justify-center border border-[#30374b] transition-colors cursor-pointer disabled:opacity-40"
                title="Canción anterior"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={onTogglePlayPause}
                disabled={tracks.length === 0}
                className="px-5 h-9 rounded bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-40"
                title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span className="text-xs uppercase tracking-wider">Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span className="text-xs uppercase tracking-wider">Reproducir</span>
                  </>
                )}
              </button>

              <button
                onClick={onNextTrack}
                disabled={tracks.length === 0}
                className="w-9 h-9 rounded bg-[#1e2330] hover:bg-[#282f42] text-slate-300 hover:text-white flex items-center justify-center border border-[#30374b] transition-colors cursor-pointer disabled:opacity-40"
                title="Siguiente canción"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Controls: Shuffle & Loop (Reproducción aleatoria o en bucle) */}
            <div className="flex items-center gap-2">
              {/* Shuffle button */}
              <button
                onClick={onToggleShuffle}
                className={`flex items-center gap-1.5 px-3 h-8 rounded text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
                  isShuffle
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                    : 'bg-[#1c202c] text-slate-400 border-[#2e3447] hover:text-slate-200'
                }`}
                title="Reproducción aleatoria (Shuffle)"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Aleatorio: {isShuffle ? 'ON' : 'OFF'}</span>
              </button>

              {/* Loop button */}
              <button
                onClick={onCycleLoopMode}
                className={`flex items-center gap-1.5 px-3 h-8 rounded text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer ${
                  loopMode !== 'off'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                    : 'bg-[#1c202c] text-slate-400 border-[#2e3447] hover:text-slate-200'
                }`}
                title="Modo de bucle"
              >
                {loopMode === 'one' ? (
                  <Repeat1 className="w-3.5 h-3.5" />
                ) : (
                  <Repeat className="w-3.5 h-3.5" />
                )}
                <span>
                  {loopMode === 'off' && 'Bucle: OFF'}
                  {loopMode === 'all' && 'Bucle: TODO'}
                  {loopMode === 'one' && 'Bucle: 1 PISTA'}
                </span>
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleMute}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                title={isMuted ? 'Desactivar silencio' : 'Silenciar'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-amber-400" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-20 sm:w-24 h-1.5 bg-[#252b3b] rounded appearance-none cursor-pointer accent-amber-400"
              />
              <span className="text-[11px] font-mono text-slate-400 w-8 tabular-nums">
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>
            </div>

          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-[#0d0f14] border-t border-[#1f232f] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">Mindustry v7 (v146+)</span>
            <span>·</span>
            <span>Atajo global: Ctrl + M</span>
          </div>
          <div>
            <button
              onClick={onOpenFolderTab}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Explorar carpeta 'your-music' →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
