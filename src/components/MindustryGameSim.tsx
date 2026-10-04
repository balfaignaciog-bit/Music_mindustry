import React, { useEffect, useRef, useState } from 'react';
import { 
  Music, Play, Pause, SkipForward, ShieldAlert, Maximize2, Zap, Box
} from 'lucide-react';
import { MusicTrack } from '../types';
import { MusicVisualizer } from './MusicVisualizer';

interface MindustryGameSimProps {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  onOpenMusicManager: () => void;
  onTogglePlayPause: () => void;
  onNextTrack: () => void;
}

export const MindustryGameSim: React.FC<MindustryGameSimProps> = ({
  currentTrack,
  isPlaying,
  onOpenMusicManager,
  onTogglePlayPause,
  onNextTrack
}) => {
  const [wave, setWave] = useState(28);
  const [copper, setCopper] = useState(14820);
  const [lead, setLead] = useState(9450);
  const [silicon, setSilicon] = useState(6210);
  const [titanium, setTitanium] = useState(3890);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Show in-game toast whenever track changes or plays
  useEffect(() => {
    if (currentTrack && isPlaying) {
      setToastMessage(`♫ ${currentTrack.name}`);
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [currentTrack?.id, isPlaying]);

  // Resource ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setCopper(c => c + 4);
      setLead(l => l + 3);
      setSilicon(s => s + 2);
      setTitanium(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Procedural Mindustry 2D Game Canvas (no image assets needed)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#0f121a';
      ctx.fillRect(0, 0, w, h);

      // 1. Grid of tiles
      const tileSize = 32;
      ctx.strokeStyle = '#181d2a';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 2. Conveyor belts (horizontal and vertical lines)
      ctx.fillStyle = '#222838';
      // Main conveyor line
      ctx.fillRect(80, 160, w - 160, 24);
      ctx.fillRect(w / 2 - 12, 100, 24, h - 200);

      // Moving conveyor rollers
      offset = (offset + 1.2) % 16;
      ctx.fillStyle = '#37415a';
      for (let x = 80; x < w - 160; x += 16) {
        const rollerX = x + offset;
        if (rollerX < w - 160) {
          ctx.fillRect(rollerX, 162, 4, 20);
        }
      }
      for (let y = 100; y < h - 100; y += 16) {
        const rollerY = y + offset;
        if (rollerY < h - 100) {
          ctx.fillRect(w / 2 - 10, rollerY, 20, 4);
        }
      }

      // 3. Moving items on conveyor (Copper & Silicon items)
      for (let i = 0; i < 8; i++) {
        const itemX = 100 + ((offset * 12 + i * 80) % (w - 240));
        ctx.fillStyle = '#d97706'; // Copper
        ctx.fillRect(itemX, 168, 8, 8);

        const itemY = 120 + ((offset * 10 + i * 50) % (h - 220));
        ctx.fillStyle = '#94a3b8'; // Silicon
        ctx.fillRect(w / 2 - 4, itemY, 8, 8);
      }

      // 4. Core Vault / Factory Hub at center
      const centerX = w / 2;
      const centerY = 172;
      ctx.fillStyle = '#1e2433';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.fillRect(centerX - 28, centerY - 28, 56, 56);
      ctx.strokeRect(centerX - 28, centerY - 28, 56, 56);

      // Core glow
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
      ctx.fill();

      // 5. Turrets (Duo / Scatter)
      const turretPositions = [
        { x: 140, y: 110 },
        { x: w - 140, y: 110 },
        { x: 140, y: 260 },
        { x: w - 140, y: 260 }
      ];

      turretPositions.forEach((pos, idx) => {
        ctx.fillStyle = '#283144';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Barrel pointing towards mouse or rotating
        const angle = Date.now() / 1500 + idx;
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x + Math.cos(angle) * 18, pos.y + Math.sin(angle) * 18);
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="relative w-full h-[520px] rounded-lg overflow-hidden border border-[#2b3347] bg-[#090b10] shadow-2xl flex flex-col select-none">
      
      {/* Mindustry Game Canvas */}
      <div className="relative flex-1 w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          width={900}
          height={460}
          className="w-full h-full object-cover block"
        />

        {/* Top Game HUD Bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#10131b]/95 border-b border-[#252c3d] backdrop-blur-md">
          {/* Sector & Wave info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-game font-bold text-sm tracking-wider text-amber-400 uppercase">
                Sector 174 · Serpulo
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-[#161a25] px-2.5 py-1 rounded border border-[#2e3649]">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Ola {wave}</span>
              <span className="text-slate-500">·</span>
              <span className="text-emerald-400">Activa</span>
            </div>
          </div>

          {/* Resources Bar (Mindustry Items) */}
          <div className="hidden md:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-amber-300" title="Cobre">
              <span className="w-2 h-2 rounded-sm bg-amber-500 inline-block" />
              <span className="tabular-nums">{copper.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-300" title="Plomo">
              <span className="w-2 h-2 rounded-sm bg-purple-400 inline-block" />
              <span className="tabular-nums">{lead.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300" title="Silicio">
              <span className="w-2 h-2 rounded-sm bg-slate-400 inline-block" />
              <span className="tabular-nums">{silicon.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sky-300" title="Titanio">
              <span className="w-2 h-2 rounded-sm bg-sky-400 inline-block" />
              <span className="tabular-nums">{titanium.toLocaleString()}</span>
            </div>
          </div>

          {/* SPECIAL BUTTON: Open Music Manager (Requested by user) */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenMusicManager}
              className="group flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-game font-bold text-xs uppercase tracking-wider rounded border border-amber-300 shadow-md transition-all cursor-pointer transform active:scale-95"
              title="Abrir Gestor de Música (Ctrl + M)"
            >
              <Music className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
              <span>Music Manager</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 bg-black/30 rounded text-[10px] text-black font-mono border border-black/20">
                Ctrl + M
              </kbd>
            </button>
          </div>
        </div>

        {/* Hotkey notification badge */}
        <div className="absolute top-14 left-4 z-20 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#12151e]/90 backdrop-blur-md border border-[#2b3347] rounded text-xs text-slate-300 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Presiona</span>
            <kbd className="px-1.5 py-0.5 bg-[#1f2433] text-amber-300 border border-[#374059] rounded font-mono font-semibold text-[11px]">
              Ctrl + M
            </kbd>
            <span>para abrir el Gestor en cualquier momento</span>
          </div>
        </div>

        {/* In-Game Toast (Mindustry style HUD toast) */}
        {toastMessage && (
          <div className="absolute top-14 right-4 z-30">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-[#141822]/95 border-l-4 border-amber-400 text-slate-200 rounded shadow-2xl text-xs font-mono">
              <span className="text-amber-400">♫</span>
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Floating Mini In-Game Player Overlay in Bottom-Right */}
        <div className="absolute bottom-4 right-4 z-20 w-80 bg-[#12151f]/95 border border-[#2b3348] rounded-md p-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Music className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate font-game tracking-wide">
                  {currentTrack ? currentTrack.name : 'Mindustry Music Manager'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  {currentTrack ? currentTrack.filename : 'your-music/ folder'}
                </p>
              </div>
            </div>

            <button
              onClick={onOpenMusicManager}
              className="p-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              title="Abrir pantalla completa (Ctrl + M)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#23293a]">
            <MusicVisualizer isPlaying={isPlaying} barCount={14} height={20} className="w-24" />

            <div className="flex items-center gap-1.5">
              <button
                onClick={onTogglePlayPause}
                className="w-7 h-7 rounded bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center font-bold transition-colors cursor-pointer"
                title={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              </button>
              <button
                onClick={onNextTrack}
                className="w-7 h-7 rounded bg-[#202534] hover:bg-[#2c3347] text-slate-300 hover:text-white flex items-center justify-center border border-[#323a4f] transition-colors cursor-pointer"
                title="Siguiente pista"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Simulator Bottom Control Bar */}
      <div className="px-4 py-2.5 bg-[#0d0f15] border-t border-[#212635] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-300">Mod en Ejecución (JavaScript Rhino v146+)</span>
          <span className="text-slate-600">|</span>
          <span>Captura atajo Ctrl + M y botón en HUD durante la partida.</span>
        </div>

        <button
          onClick={onOpenMusicManager}
          className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
        >
          Abrir Interfaz del Mod →
        </button>
      </div>

    </div>
  );
};
