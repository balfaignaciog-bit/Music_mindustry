import React, { useState } from 'react';
import { 
  Terminal, Monitor, Smartphone, Apple, 
  HelpCircle, Download, Copy, Check, Github, Sparkles 
} from 'lucide-react';
import { ModConfig, DEFAULT_MOD_CONFIG, downloadModZip } from '../utils/modGenerator';

interface InstallGuideProps {
  config?: ModConfig;
}

export const InstallGuide: React.FC<InstallGuideProps> = ({ config = DEFAULT_MOD_CONFIG }) => {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const repoString = `${config.githubUser}/${config.repoName}`;

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
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
      
      {/* Intro Hero */}
      <div className="p-5 rounded-lg bg-[#141722] border border-[#272e42] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-game uppercase tracking-wider flex items-center gap-2">
            <span>Guía de Instalación del Mod para Mindustry</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Puedes instalar el mod automáticamente mediante el <strong className="text-amber-300">descargador de GitHub en Mindustry</strong> 
            o descargando el archivo zip manualmente.
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Descargando...' : 'Descargar Repositorio (.zip)'}</span>
        </button>
      </div>

      {/* METODO 1: DESCARGADOR DE MINDUSTRY DESDE GITHUB (RECOMENDADO) */}
      <div className="p-5 rounded-lg bg-gradient-to-br from-[#121624] to-[#0f121d] border-2 border-amber-500/40 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-black font-game font-bold text-xs uppercase tracking-wider">
              Método 1 · Recomendado
            </span>
            <span className="font-bold text-white text-sm">Descargador de Mods de Mindustry (Desde GitHub)</span>
          </div>
          <Github className="w-5 h-5 text-amber-400" />
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          No necesitas descargar archivos a mano ni descomprimir nada. Mindustry puede descargar e instalar el mod directamente desde GitHub:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded bg-[#0b0d14] border border-[#23293d] space-y-1">
            <span className="text-amber-400 font-bold font-mono">Paso 1</span>
            <p className="text-slate-300">Abre Mindustry y entra al menú <strong>Mods</strong>.</p>
          </div>
          <div className="p-3 rounded bg-[#0b0d14] border border-[#23293d] space-y-1">
            <span className="text-amber-400 font-bold font-mono">Paso 2</span>
            <p className="text-slate-300">Haz clic en <strong>Importar mod</strong>.</p>
          </div>
          <div className="p-3 rounded bg-[#0b0d14] border border-[#23293d] space-y-1">
            <span className="text-amber-400 font-bold font-mono">Paso 3</span>
            <p className="text-slate-300">Selecciona <strong>Importar desde GitHub</strong>.</p>
          </div>
          <div className="p-3 rounded bg-[#0b0d14] border border-[#23293d] space-y-1">
            <span className="text-amber-400 font-bold font-mono">Paso 4</span>
            <p className="text-slate-300">Pega exactamente el texto de abajo y pulsa Aceptar.</p>
          </div>
        </div>

        {/* Copy String Banner */}
        <div className="p-3 rounded bg-[#080a0f] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Texto para el juego:</span>
            <code className="text-amber-300 font-mono font-bold text-sm bg-[#151926] px-2 py-0.5 rounded border border-[#273047]">
              {repoString}
            </code>
          </div>

          <button
            onClick={() => copyPath(repoString)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded text-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            {copiedPath === repoString ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar texto</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* METODO 2: INSTALACION MANUAL POR ARCHIVO ZIP */}
      <div className="rounded-lg border border-[#262c3e] bg-[#0d0f16] overflow-hidden">
        <div className="px-4 py-3 bg-[#131622] border-b border-[#262c3e]">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            Método 2 · Rutas directas de instalación manual por Sistema Operativo
          </h3>
        </div>

        <div className="divide-y divide-[#1e2332] text-xs">
          {/* Windows */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-sky-400 shrink-0" />
              <div>
                <span className="font-semibold text-white">Windows (Steam o Standalone)</span>
                <p className="font-mono text-slate-400 text-[11px] mt-0.5">
                  %AppData%\Mindustry\mods\{config.repoName}\
                </p>
              </div>
            </div>
            <button
              onClick={() => copyPath(`%AppData%\\Mindustry\\mods\\${config.repoName}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b202e] hover:bg-[#252c3f] text-slate-300 hover:text-white rounded border border-[#2e374e] transition-colors cursor-pointer self-start sm:self-auto shrink-0 font-mono text-[11px]"
            >
              {copiedPath === `%AppData%\\Mindustry\\mods\\${config.repoName}` ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Ruta copiada</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar ruta</span>
                </>
              )}
            </button>
          </div>

          {/* Linux */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold text-white">Linux</span>
                <p className="font-mono text-slate-400 text-[11px] mt-0.5">
                  ~/.local/share/Mindustry/mods/{config.repoName}/
                </p>
              </div>
            </div>
            <button
              onClick={() => copyPath(`~/.local/share/Mindustry/mods/${config.repoName}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b202e] hover:bg-[#252c3f] text-slate-300 hover:text-white rounded border border-[#2e374e] transition-colors cursor-pointer self-start sm:self-auto shrink-0 font-mono text-[11px]"
            >
              {copiedPath === `~/.local/share/Mindustry/mods/${config.repoName}` ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Ruta copiada</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar ruta</span>
                </>
              )}
            </button>
          </div>

          {/* Android */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-white">Android</span>
                <p className="font-mono text-slate-400 text-[11px] mt-0.5">
                  Android/data/io.anuke.mindustry/files/mods/{config.repoName}/
                </p>
              </div>
            </div>
            <button
              onClick={() => copyPath(`Android/data/io.anuke.mindustry/files/mods/${config.repoName}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1b202e] hover:bg-[#252c3f] text-slate-300 hover:text-white rounded border border-[#2e374e] transition-colors cursor-pointer self-start sm:self-auto shrink-0 font-mono text-[11px]"
            >
              {copiedPath === `Android/data/io.anuke.mindustry/files/mods/${config.repoName}` ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Ruta copiada</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar ruta</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Dónde colocar las canciones */}
      <div className="p-5 rounded-lg bg-[#11141e] border border-[#212635] space-y-3">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold flex items-center gap-2">
          <span>Carpeta your-music/ (Dónde colocar tus canciones)</span>
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          El mod escanea automáticamente <code className="text-amber-300">your-music/</code> en tu carpeta de datos de Mindustry:
        </p>
        <div className="p-3 bg-[#0a0c12] rounded border border-[#1e2330] font-mono text-xs text-amber-300/90 leading-relaxed">
          <div>• Windows: <span className="text-slate-300">%AppData%\Mindustry\your-music\</span></div>
          <div>• Linux: <span className="text-slate-300">~/.local/share/Mindustry/your-music/</span></div>
          <div>• Android: <span className="text-slate-300">Android/data/io.anuke.mindustry/files/your-music/</span></div>
        </div>
        <p className="text-xs text-slate-400">
          Formátos admitidos: <span className="text-amber-400">.mp3</span>, <span className="text-amber-400">.ogg</span> y <span className="text-amber-400">.wav</span>. Al entrar a una partida y presionar <strong className="text-white">Ctrl + M</strong>, todas las pistas aparecerán listadas de arriba a abajo.
        </p>
      </div>

    </div>
  );
};
