import React, { useState } from 'react';
import { 
  Github, Copy, Check, Download, ExternalLink, Terminal, 
  HelpCircle, ArrowRight, ShieldCheck, CheckCircle2, RefreshCw
} from 'lucide-react';
import { ModConfig, DEFAULT_MOD_CONFIG, downloadModZip, getModJsonContent } from '../utils/modGenerator';

interface GitHubDownloaderIntegrationProps {
  config: ModConfig;
  onUpdateConfig: (config: ModConfig) => void;
}

export const GitHubDownloaderIntegration: React.FC<GitHubDownloaderIntegrationProps> = ({
  config,
  onUpdateConfig
}) => {
  const [copiedString, setCopiedString] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [testInput, setTestInput] = useState(`${config.githubUser}/${config.repoName}`);
  const [testResult, setTestResult] = useState<string | null>(null);

  const repoString = `${config.githubUser}/${config.repoName}`;
  const githubUrl = `https://github.com/${config.githubUser}/${config.repoName}`;

  const gitCommands = `# 1. Inicializar repositorio y agregar archivos
git init
git add .
git commit -m "Initial commit: Mindustry Music Manager v${config.version}"

# 2. Conectar con tu repositorio en GitHub
git branch -M main
git remote add origin ${githubUrl}.git

# 3. Subir el mod a GitHub
git push -u origin main`;

  const handleCopyRepoString = () => {
    navigator.clipboard.writeText(repoString);
    setCopiedString(true);
    setTimeout(() => setCopiedString(false), 2000);
  };

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedCommands(true);
    setTimeout(() => setCopiedCommands(false), 2000);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadModZip(config);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  const handleTestInGameImport = () => {
    if (!testInput.includes('/') || testInput.trim().length < 3) {
      setTestResult('error: El formato debe ser usuario/repositorio (ej: balfaignacio/your-music-manager)');
    } else {
      setTestResult('success');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Hero card: Direct In-Game Import String */}
      <div className="p-5 rounded-lg bg-[#141724] border border-[#2b334d] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mt-0.5">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-game uppercase tracking-wider flex items-center gap-2">
                <span>Compatibilidad con el Descargador de Mindustry</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Mindustry cuenta con un importador nativo de mods que descarga repositorios de GitHub con solo ingresar <code className="text-amber-400 font-mono">usuario/repositorio</code>.
              </p>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Generando...' : 'Descargar Repositorio GitHub (.zip)'}</span>
          </button>
        </div>

        {/* The Direct String Box */}
        <div className="p-4 rounded-lg bg-[#0d0f17] border border-[#23293d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Texto a ingresar en Mindustry ("Importar desde GitHub"):
            </span>
            <div className="font-mono text-base sm:text-lg font-bold text-amber-400 mt-0.5">
              {repoString}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyRepoString}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#1b2030] hover:bg-[#252c42] text-slate-200 hover:text-white rounded border border-[#2f3852] font-mono text-xs transition-colors cursor-pointer"
            >
              {copiedString ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar para el juego</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* GitHub Repository Config Settings */}
      <div className="p-5 rounded-lg bg-[#11131c] border border-[#23293a] space-y-4">
        <h3 className="text-sm font-semibold text-white font-game uppercase tracking-wider">
          Configuración de tu Repositorio de GitHub y mod.json
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1">Tu Usuario o Organización de GitHub:</label>
            <input
              type="text"
              value={config.githubUser}
              onChange={(e) => {
                const updated = { ...config, githubUser: e.target.value.trim() };
                onUpdateConfig(updated);
                setTestInput(`${updated.githubUser}/${updated.repoName}`);
              }}
              placeholder="ej: balfaignacio"
              className="w-full bg-[#090b10] border border-[#2a3044] rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Nombre del Repositorio (ID del mod):</label>
            <input
              type="text"
              value={config.repoName}
              onChange={(e) => {
                const updated = { ...config, repoName: e.target.value.trim().toLowerCase().replace(/\s+/g, '-') };
                onUpdateConfig(updated);
                setTestInput(`${updated.githubUser}/${updated.repoName}`);
              }}
              placeholder="ej: your-music-manager"
              className="w-full bg-[#090b10] border border-[#2a3044] rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* 2-Column: Step-by-Step in Mindustry vs Publishing to GitHub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Column 1: How players install it in Mindustry */}
        <div className="p-5 rounded-lg bg-[#10131d] border border-[#23293a] space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-game font-bold text-sm uppercase">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">1</span>
            <span>Cómo instalar el mod en el juego (Mindustry)</span>
          </div>

          <ol className="space-y-3 text-xs text-slate-300 leading-relaxed list-decimal list-inside">
            <li className="pl-1">
              Abre <strong className="text-white">Mindustry</strong> (Steam, itch.io o Android).
            </li>
            <li className="pl-1">
              En el menú principal, haz clic en <strong className="text-amber-300">Mods</strong>.
            </li>
            <li className="pl-1">
              Haz clic en el botón inferior <strong className="text-amber-300">Importar mod</strong> (Import mod).
            </li>
            <li className="pl-1">
              Elige <strong className="text-amber-300">Importar desde GitHub</strong> (Import from GitHub).
            </li>
            <li className="pl-1">
              Escribe o pega:
              <div className="my-1.5 p-2 bg-[#090b10] rounded border border-[#232938] font-mono text-amber-400 font-bold select-all">
                {repoString}
              </div>
            </li>
            <li className="pl-1">
              Mindustry descargará el repositorio, leerá <code className="text-slate-200">mod.json</code> y cargará <code className="text-slate-200">scripts/main.js</code> automáticamente.
            </li>
          </ol>

          {/* In-Game Dialog Mock Simulator */}
          <div className="mt-4 p-3.5 rounded bg-[#090b10] border border-[#212638] text-xs">
            <div className="text-[11px] font-mono text-slate-400 mb-2 uppercase tracking-wider flex items-center justify-between">
              <span>Simulador del diálogo de Mindustry</span>
              <span className="text-emerald-400 text-[10px]">Arc UI Dialog</span>
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 text-[11px]">Introduce github-user/repo-name:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="flex-1 bg-[#141722] border border-[#2f364e] rounded px-2.5 py-1.5 text-xs font-mono text-white"
                />
                <button
                  onClick={handleTestInGameImport}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded text-xs cursor-pointer"
                >
                  Probar
                </button>
              </div>

              {testResult === 'success' && (
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>¡Válido! Mindustry resolverá https://github.com/{testInput} y ejecutará scripts/main.js</span>
                </div>
              )}
              {testResult && testResult.startsWith('error') && (
                <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] font-mono">
                  {testResult}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: How you publish it to GitHub */}
        <div className="p-5 rounded-lg bg-[#10131d] border border-[#23293a] space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-game font-bold text-sm uppercase">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">2</span>
            <span>Cómo publicar tu mod en GitHub</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Para que el descargador de Mindustry pueda encontrarlo, crea un repositorio público en tu cuenta de GitHub con estos 3 pasos:
          </p>

          <ol className="space-y-2 text-xs text-slate-300 leading-relaxed list-decimal list-inside">
            <li>
              Crea un nuevo repositorio en <strong>github.com/new</strong> llamado <code className="text-amber-400">{config.repoName}</code> (debe ser <strong>Público</strong>).
            </li>
            <li>
              Descarga el archivo ZIP con el botón superior y extráelo en tu computadora.
            </li>
            <li>
              Abre la terminal en esa carpeta y corre estos comandos:
            </li>
          </ol>

          {/* Terminal Box */}
          <div className="rounded bg-[#08090e] border border-[#1f2434] overflow-hidden text-xs">
            <div className="px-3 py-2 bg-[#12141e] border-b border-[#1f2434] flex items-center justify-between">
              <span className="font-mono text-slate-400 text-[11px] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>Terminal / Git Bash</span>
              </span>
              <button
                onClick={handleCopyCommands}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-mono"
              >
                {copiedCommands ? (
                  <span className="text-emerald-400">¡Copiado!</span>
                ) : (
                  <span>Copiar comandos</span>
                )}
              </button>
            </div>
            <pre className="p-3 text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
              {gitCommands}
            </pre>
          </div>

          <div className="text-[11px] text-slate-400 bg-[#0d0f16] p-2.5 rounded border border-[#1e2332]">
            Una vez subido, cualquier jugador de Mindustry en el mundo podrá instalar tu mod al instante con el descargador del juego introduciendo <strong className="text-amber-300">{repoString}</strong>.
          </div>
        </div>

      </div>

      {/* Mindustry Mod File Structure Explanation */}
      <div className="p-4 rounded-lg bg-[#0e1017] border border-[#212635] space-y-2 text-xs">
        <h4 className="font-mono uppercase tracking-wider text-slate-300 font-bold">
          Estructura del repositorio en GitHub:
        </h4>
        <pre className="p-3 bg-[#08090d] border border-[#1d2230] rounded text-slate-300 font-mono text-[11px] leading-relaxed overflow-x-auto">
{`${config.repoName}/
  ├── mod.json            <-- Define "name", "repo": "${repoString}", "minGameVersion": "146"
  ├── README.md           <-- Guía con instrucciones para los jugadores de Mindustry
  ├── .gitignore          <-- Excluye archivos temporales
  ├── scripts/
  │    └── main.js        <-- Código Rhino JS con listener [Ctrl+M], botón HUD y audio
  └── your-music/
       ├── .gitkeep       <-- Permite que Git mantenga la carpeta en GitHub
       └── LEEME.txt      <-- Instrucciones de formatos (.mp3, .ogg, .wav)`}
        </pre>
      </div>

    </div>
  );
};
