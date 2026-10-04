import React, { useState } from 'react';
import { Copy, Check, FileCode, Download } from 'lucide-react';
import { 
  MOD_MAIN_JS_CONTENT, 
  getModJsonContent, 
  getReadmeMarkdown, 
  getGitignoreContent, 
  ModConfig, 
  DEFAULT_MOD_CONFIG, 
  downloadModZip 
} from '../utils/modGenerator';

interface ModCodeViewerProps {
  config?: ModConfig;
}

export const ModCodeViewer: React.FC<ModCodeViewerProps> = ({ config = DEFAULT_MOD_CONFIG }) => {
  const [activeFile, setActiveFile] = useState<'main.js' | 'mod.json' | 'README.md' | '.gitignore'>('main.js');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const getContent = () => {
    switch (activeFile) {
      case 'main.js':
        return MOD_MAIN_JS_CONTENT;
      case 'mod.json':
        return getModJsonContent(config);
      case 'README.md':
        return getReadmeMarkdown(config);
      case '.gitignore':
        return getGitignoreContent();
    }
  };

  const currentContent = getContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadModZip(config);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Download CTA */}
      <div className="p-4 rounded-lg bg-[#141722] border border-[#272e42] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white font-game uppercase tracking-wider flex items-center gap-2">
            <FileCode className="w-5 h-5 text-amber-400" />
            <span>Archivos del Mod para GitHub y Mindustry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Estructura compatible con el motor Rhino de Mindustry v7 (v146+) y el descargador de GitHub. 
            El archivo <code className="text-amber-300">mod.json</code> incluye el identificador de repositorio <code className="text-amber-300">{config.githubUser}/{config.repoName}</code>.
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Generando...' : 'Descargar Repositorio (.zip)'}</span>
        </button>
      </div>

      {/* Code Viewer Container */}
      <div className="rounded-lg border border-[#262c3e] bg-[#0c0e14] overflow-hidden">
        
        {/* File Tabs & Actions */}
        <div className="px-4 py-2.5 bg-[#141722] border-b border-[#262c3e] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveFile('main.js')}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFile === 'main.js'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>scripts/main.js</span>
            </button>
            <button
              onClick={() => setActiveFile('mod.json')}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFile === 'mod.json'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>mod.json</span>
            </button>
            <button
              onClick={() => setActiveFile('README.md')}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFile === 'README.md'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>README.md</span>
            </button>
            <button
              onClick={() => setActiveFile('.gitignore')}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeFile === '.gitignore'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>.gitignore</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 text-xs text-slate-300 hover:text-white bg-[#1e2330] hover:bg-[#282f42] rounded border border-[#31384e] transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Archivo</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-x-auto max-h-[500px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
          <pre>
            <code>{currentContent}</code>
          </pre>
        </div>
      </div>

      {/* API Reference & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-[#12151e] border border-[#252b3b] space-y-2">
          <h3 className="text-sm font-semibold text-amber-300 font-mono">1. Atajo Ctrl + M en Juego</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Se captura cada frame mediante <code className="text-slate-200">Events.run(Trigger.update)</code> verificando <code className="text-slate-200">Core.input.keyDown(KeyCode.controlLeft)</code> y <code className="text-slate-200">Core.input.keyTap(KeyCode.m)</code>.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#12151e] border border-[#252b3b] space-y-2">
          <h3 className="text-sm font-semibold text-amber-300 font-mono">2. Compatibilidad Descargador</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            El mod lee <code className="text-slate-200">Vars.dataDirectory.child("your-music")</code>, lo que garantiza que los jugadores puedan añadir canciones sin descomprimir el mod si Mindustry lo descargó como zip.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#12151e] border border-[#252b3b] space-y-2">
          <h3 className="text-sm font-semibold text-amber-300 font-mono">3. Deslizador y Audio</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Usa <code className="text-slate-200">Core.audio.newMusic(file)</code> para cargar el audio, y <code className="text-slate-200">table.slider()</code> junto con <code className="text-slate-200">setPosition(sec)</code> para elegir el segundo exacto.
          </p>
        </div>
      </div>

    </div>
  );
};
