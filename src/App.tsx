/**
 * Mindustry Music Manager Mod Studio
 * Compatible con GitHub y el descargador de mods dentro de Mindustry.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MindustryGameSim } from './components/MindustryGameSim';
import { MusicManagerDialog } from './components/MusicManagerDialog';
import { YourMusicFolderView } from './components/YourMusicFolderView';
import { ModCodeViewer } from './components/ModCodeViewer';
import { InstallGuide } from './components/InstallGuide';
import { GitHubDownloaderIntegration } from './components/GitHubDownloaderIntegration';
import { DEFAULT_TRACKS } from './data/defaultTracks';
import { MusicTrack, LoopMode } from './types';
import { audioEngine } from './utils/audioEngine';
import { ModConfig, DEFAULT_MOD_CONFIG, downloadModZip } from './utils/modGenerator';
import { Music, Github, Copy, Check } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'sim' | 'github' | 'folder' | 'code' | 'guide'>('sim');
  const [modConfig, setModConfig] = useState<ModConfig>(DEFAULT_MOD_CONFIG);
  const [tracks, setTracks] = useState<MusicTrack[]>(DEFAULT_TRACKS);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>('track-1');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(148);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [loopMode, setLoopMode] = useState<LoopMode>('all');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [copiedRepo, setCopiedRepo] = useState<boolean>(false);

  const currentTrack = tracks.find(t => t.id === currentTrackId) || null;
  const repoString = `${modConfig.githubUser}/${modConfig.repoName}`;

  // Set up audio engine callbacks
  useEffect(() => {
    audioEngine.setCallbacks(
      (time, dur) => {
        setCurrentTime(time);
        if (dur > 0) setDuration(dur);
      },
      () => {
        handleNextTrack();
      },
      (playing) => {
        setIsPlaying(playing);
      }
    );
  }, [tracks, currentTrackId, isShuffle, loopMode]);

  // Handle global keyboard shortcut: [Ctrl + M] or [Cmd + M]
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl + M or Cmd + M
      if ((e.ctrlKey || e.metaKey) && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        setIsDialogOpen(prev => !prev);
        return;
      }

      // Spacebar to play/pause when dialog is open and not focusing input
      if (e.code === 'Space' && isDialogOpen) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          handleTogglePlayPause();
        }
      }

      // Escape to close dialog
      if (e.key === 'Escape' && isDialogOpen) {
        setIsDialogOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDialogOpen, isPlaying, currentTrack]);

  const handlePlayTrack = (track: MusicTrack) => {
    setCurrentTrackId(track.id);
    setDuration(track.duration);
    setCurrentTime(0);
    audioEngine.playTrack(track, 0);
  };

  const handleTogglePlayPause = () => {
    if (!currentTrack) {
      if (tracks.length > 0) {
        handlePlayTrack(tracks[0]);
      }
      return;
    }

    if (isPlaying) {
      audioEngine.pause();
    } else {
      audioEngine.resume();
    }
  };

  const handleNextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    const currentIdx = tracks.findIndex(t => t.id === currentTrackId);

    if (loopMode === 'one' && currentTrack) {
      handlePlayTrack(currentTrack);
      return;
    }

    if (isShuffle && tracks.length > 1) {
      let nextIdx = Math.floor(Math.random() * tracks.length);
      if (nextIdx === currentIdx) {
        nextIdx = (nextIdx + 1) % tracks.length;
      }
      handlePlayTrack(tracks[nextIdx]);
    } else {
      let nextIdx = currentIdx + 1;
      if (nextIdx >= tracks.length) {
        if (loopMode === 'all') {
          handlePlayTrack(tracks[0]);
        } else {
          audioEngine.pause();
          setCurrentTime(0);
        }
      } else {
        handlePlayTrack(tracks[nextIdx]);
      }
    }
  }, [tracks, currentTrackId, isShuffle, loopMode, currentTrack]);

  const handlePrevTrack = useCallback(() => {
    if (tracks.length === 0) return;
    const currentIdx = tracks.findIndex(t => t.id === currentTrackId);
    let prevIdx = currentIdx - 1;
    if (prevIdx < 0) {
      prevIdx = tracks.length - 1;
    }
    handlePlayTrack(tracks[prevIdx]);
  }, [tracks, currentTrackId]);

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seekTo(seconds);
  };

  const handleToggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const handleCycleLoopMode = () => {
    setLoopMode(prev => {
      const next: LoopMode = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      audioEngine.setLoopMode(next);
      return next;
    });
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    audioEngine.setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
      audioEngine.setMuted(false);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioEngine.setMuted(nextMuted);
  };

  const handleAddTracks = async (files: FileList) => {
    const newTracks: MusicTrack[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const objectUrl = URL.createObjectURL(file);
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

      let songDuration = 180;
      try {
        const tempAudio = new Audio();
        tempAudio.src = objectUrl;
        await new Promise<void>((resolve) => {
          tempAudio.addEventListener('loadedmetadata', () => {
            if (tempAudio.duration && !isNaN(tempAudio.duration)) {
              songDuration = Math.round(tempAudio.duration);
            }
            resolve();
          });
          tempAudio.addEventListener('error', () => resolve());
          setTimeout(() => resolve(), 600);
        });
      } catch {
        // fallback
      }

      newTracks.push({
        id: `custom-${Date.now()}-${i}`,
        name: nameWithoutExt,
        filename: file.name,
        artist: 'Archivos your-music/',
        duration: songDuration,
        url: objectUrl,
        isSynthesized: false,
        fileSize: sizeMb,
        dateAdded: new Date().toISOString().split('T')[0]
      });
    }

    if (newTracks.length > 0) {
      setTracks(prev => [...prev, ...newTracks]);
      if (!currentTrackId) {
        handlePlayTrack(newTracks[0]);
      }
    }
  };

  const handleDeleteTrack = (id: string) => {
    setTracks(prev => {
      const updated = prev.filter(t => t.id !== id);
      if (currentTrackId === id) {
        if (updated.length > 0) {
          handlePlayTrack(updated[0]);
        } else {
          audioEngine.stopCurrent();
          setCurrentTrackId(null);
        }
      }
      return updated;
    });
  };

  const handleResetPresets = () => {
    setTracks(DEFAULT_TRACKS);
    handlePlayTrack(DEFAULT_TRACKS[0]);
  };

  const handleCopyRepoString = () => {
    navigator.clipboard.writeText(repoString);
    setCopiedRepo(true);
    setTimeout(() => setCopiedRepo(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col font-sans">
      
      {/* Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        trackCount={tracks.length}
        config={modConfig}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Quick Context & GitHub In-Game Import Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-3.5 bg-[#121520] border border-[#232a3d] rounded-lg">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shrink-0">
              ♫
            </span>
            <div className="text-xs">
              <span className="font-semibold text-white">Importar en Mindustry:</span>{' '}
              <span className="text-slate-300">
                Mods → Importar mod → Importar desde GitHub →
              </span>{' '}
              <code className="text-amber-400 font-mono font-bold bg-[#090b10] px-1.5 py-0.5 rounded border border-[#273047]">
                {repoString}
              </code>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyRepoString}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b2030] hover:bg-[#252c42] text-slate-200 hover:text-white rounded border border-[#2f3852] font-mono text-xs transition-colors cursor-pointer"
              title="Copiar texto para el descargador de Mindustry"
            >
              {copiedRepo ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar para el juego</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-game font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
            >
              <Music className="w-3.5 h-3.5" />
              <span>Abrir Mod (Ctrl + M)</span>
            </button>
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === 'sim' && (
          <div className="space-y-6">
            <MindustryGameSim
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onOpenMusicManager={() => setIsDialogOpen(true)}
              onTogglePlayPause={handleTogglePlayPause}
              onNextTrack={handleNextTrack}
            />

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div 
                onClick={() => setIsDialogOpen(true)}
                className="p-4 rounded-lg bg-[#11141e] border border-[#222838] hover:border-amber-500/40 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="text-amber-400 font-bold font-game uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-sm">⌨</span>
                  <span>Atajo Ctrl + M</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Presiona <strong className="text-slate-200">Ctrl + M</strong> en tu teclado o el botón especial del HUD para desplegar la pantalla normal de música.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('folder')}
                className="p-4 rounded-lg bg-[#11141e] border border-[#222838] hover:border-amber-500/40 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="text-amber-400 font-bold font-game uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-sm">📁</span>
                  <span>Carpeta your-music/</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Coloca archivos .mp3, .ogg o .wav en la subcarpeta del mod o en la carpeta de datos de Mindustry.
                </p>
              </div>

              <div 
                onClick={() => setIsDialogOpen(true)}
                className="p-4 rounded-lg bg-[#11141e] border border-[#222838] hover:border-amber-500/40 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="text-amber-400 font-bold font-game uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-sm">⏱</span>
                  <span>Deslizador de Segundo</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Elige el segundo exacto de cualquier pista arrastrando el control deslizante y viendo la barra de progreso en tiempo real.
                </p>
              </div>

              <div 
                onClick={() => setActiveTab('github')}
                className="p-4 rounded-lg bg-[#11141e] border border-[#222838] hover:border-amber-500/40 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="text-amber-400 font-bold font-game uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-sm">🌐</span>
                  <span>Descargador GitHub</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  100% compatible con la función de descarga de mods dentro de Mindustry sin necesidad de instalar manualmente.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'github' && (
          <GitHubDownloaderIntegration
            config={modConfig}
            onUpdateConfig={setModConfig}
          />
        )}

        {activeTab === 'folder' && (
          <YourMusicFolderView
            tracks={tracks}
            currentTrackId={currentTrackId}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayTrack}
            onTogglePlayPause={handleTogglePlayPause}
            onAddTracks={handleAddTracks}
            onDeleteTrack={handleDeleteTrack}
            onResetPresets={handleResetPresets}
            onOpenDialog={() => setIsDialogOpen(true)}
          />
        )}

        {activeTab === 'code' && (
          <ModCodeViewer config={modConfig} />
        )}

        {activeTab === 'guide' && (
          <InstallGuide config={modConfig} />
        )}

      </main>

      {/* The Central Music Manager Dialog requested by user */}
      <MusicManagerDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        tracks={tracks}
        currentTrackId={currentTrackId}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        isShuffle={isShuffle}
        loopMode={loopMode}
        volume={volume}
        isMuted={isMuted}
        onPlayTrack={handlePlayTrack}
        onTogglePlayPause={handleTogglePlayPause}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onSeek={handleSeek}
        onToggleShuffle={handleToggleShuffle}
        onCycleLoopMode={handleCycleLoopMode}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onAddTracks={handleAddTracks}
        onOpenFolderTab={() => {
          setIsDialogOpen(false);
          setActiveTab('folder');
        }}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-[#1a1f2c] px-6 py-4 bg-[#0a0c12] text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono">
          <span className="text-slate-400 font-game">Mindustry Music Manager Mod</span>
          <span>·</span>
          <span>Compatible con Mindustry v146+ (PC & Android)</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <button
            onClick={() => setIsDialogOpen(true)}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Abrir Reproductor [Ctrl + M]
          </button>
          <span>·</span>
          <button
            onClick={() => downloadModZip(modConfig)}
            className="hover:text-amber-400 transition-colors cursor-pointer"
          >
            Descargar Repositorio GitHub (.zip)
          </button>
        </div>
      </footer>

    </div>
  );
}
