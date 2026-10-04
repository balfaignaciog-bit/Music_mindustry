import React, { useRef, useState } from 'react';
import { 
  Folder, Music, Trash2, Play, Pause, 
  Upload, RefreshCw, FileAudio, Info
} from 'lucide-react';
import { MusicTrack } from '../types';

interface YourMusicFolderViewProps {
  tracks: MusicTrack[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onPlayTrack: (track: MusicTrack) => void;
  onTogglePlayPause: () => void;
  onAddTracks: (files: FileList) => void;
  onDeleteTrack: (id: string) => void;
  onResetPresets: () => void;
  onOpenDialog: () => void;
}

export const YourMusicFolderView: React.FC<YourMusicFolderViewProps> = ({
  tracks,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onTogglePlayPause,
  onAddTracks,
  onDeleteTrack,
  onResetPresets,
  onOpenDialog
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddTracks(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddTracks(e.target.files);
    }
  };

  const formatTime = (secs: number) => {
    const totalSecs = Math.max(0, Math.floor(secs));
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Explanation */}
      <div className="p-4 rounded-lg bg-[#141722] border border-[#272e42] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-game uppercase tracking-wider flex items-center gap-2">
              <span>Carpeta de Música:</span>
              <code className="text-amber-400 text-sm font-mono lowercase">your-music/</code>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              En Mindustry, esta carpeta se encuentra dentro de la carpeta del mod (<code className="text-slate-300">mods/your-music-manager/your-music/</code>). 
              Cualquier archivo <span className="text-amber-300">.mp3</span>, <span className="text-amber-300">.ogg</span> o <span className="text-amber-300">.wav</span> que coloques aquí 
              aparecerá automáticamente en la lista dentro del juego al presionar <strong className="text-white">Ctrl + M</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Añadir Canciones</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,.mp3,.ogg,.wav,.flac"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-amber-400 bg-amber-500/10 scale-[1.005]'
            : 'border-[#2f374e] hover:border-amber-500/50 bg-[#10121a]/80 hover:bg-[#131620]'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#1b202e] flex items-center justify-center text-amber-400">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-200">
            Arrastra y suelta tus archivos de audio aquí
          </p>
          <p className="text-xs text-slate-400 font-mono">
            Soporta formatos <span className="text-amber-400">.MP3</span>, <span className="text-amber-400">.OGG</span>, <span className="text-amber-400">.WAV</span>
          </p>
          <span className="text-[11px] text-slate-500">
            o haz clic para explorar en tu equipo
          </span>
        </div>
      </div>

      {/* Files List Table */}
      <div className="rounded-lg border border-[#262c3e] bg-[#0f1118] overflow-hidden">
        
        {/* Table Header */}
        <div className="px-4 py-3 bg-[#151822] border-b border-[#262c3e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Archivos en <span className="text-amber-400">your-music/</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#1f2433] text-slate-300 font-mono">
              {tracks.length} pistas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetPresets}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-[#1b202c] hover:bg-[#252c3d] rounded border border-[#2e364b] transition-colors cursor-pointer"
              title="Restaurar canciones de prueba de Mindustry"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Restaurar Presets</span>
            </button>
            <button
              onClick={onOpenDialog}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-400 hover:text-black hover:bg-amber-400 bg-amber-500/10 border border-amber-500/40 rounded transition-colors cursor-pointer"
            >
              <Music className="w-3 h-3" />
              <span>Abrir Reproductor</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        {tracks.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileAudio className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-500" />
            <p className="text-sm font-medium text-slate-300">La carpeta está vacía</p>
            <p className="text-xs text-slate-500 mt-1">
              Añade archivos de música o pulsa "Restaurar Presets" para cargar las pistas de demostración.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#1e2332]">
            {tracks.map((track, idx) => {
              const isCurrent = track.id === currentTrackId;
              const ext = track.filename.split('.').pop()?.toUpperCase() || 'AUDIO';

              return (
                <div
                  key={track.id}
                  className={`flex items-center justify-between px-4 py-3 transition-colors ${
                    isCurrent ? 'bg-amber-500/10' : 'hover:bg-[#141722]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => {
                        if (isCurrent) {
                          onTogglePlayPause();
                        } else {
                          onPlayTrack(track);
                        }
                      }}
                      className={`w-8 h-8 rounded flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                        isCurrent && isPlaying
                          ? 'bg-amber-500 text-black border-amber-400'
                          : 'bg-[#1b1f2b] hover:bg-amber-500 hover:text-black text-slate-300 border-[#2f364a]'
                      }`}
                      title={isCurrent && isPlaying ? 'Pausar' : 'Escuchar'}
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold truncate ${isCurrent ? 'text-amber-300' : 'text-slate-200'}`}>
                          {track.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-[#12151e] border border-[#2f3547] text-amber-400 rounded font-mono">
                          {ext}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono truncate flex items-center gap-2 mt-0.5">
                        <span>{track.filename}</span>
                        {track.artist && <span>· {track.artist}</span>}
                        {track.fileSize && <span>· {track.fileSize}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 ml-3">
                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      {formatTime(track.duration)}
                    </span>

                    <button
                      onClick={() => onDeleteTrack(track.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                      title="Eliminar de la lista"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Directory path reference card */}
      <div className="p-4 rounded-lg bg-[#11131a] border border-[#212635] text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Info className="w-4 h-4 text-amber-400" />
          <span>Estructura de archivos real en Mindustry:</span>
        </div>
        <pre className="p-3 rounded bg-[#090b10] border border-[#1e2230] text-amber-300/90 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`Mindustry/
  └── mods/
       └── your-music-manager/
            ├── mod.json            <-- Metadatos del mod
            ├── scripts/
            │    └── main.js        <-- Lógica Rhino JS (Ctrl+M, botones, reproductor)
            └── your-music/         <-- ¡AQUÍ COLOCAS TUS CANCIONES!
                 ├── tu_cancion_1.mp3
                 ├── tu_cancion_2.ogg
                 └── tu_cancion_3.wav`}
        </pre>
      </div>

    </div>
  );
};
