import React from 'react';
import { Download, Github } from 'lucide-react';
import { ModConfig, downloadModZip } from '../utils/modGenerator';

interface NavbarProps {
  activeTab: 'sim' | 'github' | 'folder' | 'code' | 'guide';
  setActiveTab: (tab: 'sim' | 'github' | 'folder' | 'code' | 'guide') => void;
  trackCount: number;
  config: ModConfig;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, trackCount, config }) => {
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadModZip(config);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-amber-950/40 bg-[#0d0f15]/95 backdrop-blur-md sticky top-0 z-40 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2">
        <a 
          href="#sim" 
          onClick={(e) => { e.preventDefault(); setActiveTab('sim'); }} 
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5 hover:text-amber-400 transition-colors font-game"
        >
          <span className="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 text-sm font-mono font-bold">
            ♫
          </span>
          <span>Mindustry Music Mod Studio</span>
        </a>
      </div>

      {/* Zone 2: 4-6 clean text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('sim')}
          className={`transition-colors text-left py-1 hover:text-white ${
            activeTab === 'sim' ? 'text-amber-400 border-b-2 border-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Simulador In-Game
        </button>
        <button
          onClick={() => setActiveTab('github')}
          className={`transition-colors text-left py-1 hover:text-white flex items-center gap-1.5 ${
            activeTab === 'github' ? 'text-amber-400 border-b-2 border-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Github className="w-3.5 h-3.5" />
          <span>GitHub & Descargador</span>
        </button>
        <button
          onClick={() => setActiveTab('folder')}
          className={`transition-colors text-left py-1 hover:text-white flex items-center gap-1.5 ${
            activeTab === 'folder' ? 'text-amber-400 border-b-2 border-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <span>Carpeta your-music</span>
          <span className="text-xs px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-mono">
            {trackCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`transition-colors text-left py-1 hover:text-white ${
            activeTab === 'code' ? 'text-amber-400 border-b-2 border-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Código del Mod
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`transition-colors text-left py-1 hover:text-white ${
            activeTab === 'guide' ? 'text-amber-400 border-b-2 border-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Instalación
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded border border-amber-300 shadow-sm transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{downloading ? 'Generando...' : 'Descargar (.zip)'}</span>
        </button>
      </div>
    </header>
  );
};
