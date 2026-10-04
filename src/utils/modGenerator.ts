import JSZip from 'jszip';

export interface ModConfig {
  githubUser: string;
  repoName: string;
  displayName: string;
  author: string;
  version: string;
  minGameVersion: string;
  description: string;
}

export const DEFAULT_MOD_CONFIG: ModConfig = {
  githubUser: 'balfaignacio',
  repoName: 'your-music-manager',
  displayName: 'Your Music Manager',
  author: 'balfaignacio',
  version: '1.0.0',
  minGameVersion: '146',
  description: 'Gestor de música personalizado para Mindustry. Añade tus canciones a la carpeta your-music/, presiona [Ctrl + M] o pulsa el botón del HUD para pausar, elegir el segundo exacto con el deslizador, modo aleatorio y bucle.'
};

export function getModJsonContent(config: ModConfig = DEFAULT_MOD_CONFIG): string {
  const repoString = `${config.githubUser}/${config.repoName}`;
  return JSON.stringify(
    {
      name: config.repoName,
      displayName: config.displayName,
      author: config.author,
      description: config.description,
      version: config.version,
      minGameVersion: config.minGameVersion,
      repo: repoString,
      java: false,
      hidden: false
    },
    null,
    2
  );
}

export function getReadmeMarkdown(config: ModConfig = DEFAULT_MOD_CONFIG): string {
  const repoString = `${config.githubUser}/${config.repoName}`;
  return `# ♫ ${config.displayName} for Mindustry

Un gestor y reproductor de música integrado dentro de **Mindustry v7 (v146+)**.

Permite colocar tus canciones favoritas en una carpeta \`your-music/\` y escucharlas mientras juegas, con interfaz nativa, atajo **Ctrl + M**, lista vertical completa de archivos, selector de segundo exacto mediante barra de desplazamiento, y reproducción aleatoria o en bucle.

---

## 🚀 Cómo instalar desde Mindustry (Descargador de GitHub)

Este mod es 100% compatible con el **descargador integrado de mods de Mindustry**:

1. Abre **Mindustry** en tu PC o dispositivo móvil.
2. En el menú principal, entra a **Mods**.
3. Haz clic en **Importar mod** (o *Import mod*).
4. Selecciona **Importar desde GitHub** (o *Import from GitHub*).
5. Escribe exactamente:
   \`\`\`text
   ${repoString}
   \`\`\`
6. Pulsa **Aceptar**. Mindustry descargará e instalará el mod automáticamente.
7. Reinicia el juego cuando Mindustry lo solicite.

---

## 📂 Dónde añadir tus canciones (\`your-music/\`)

Una vez instalado el mod, puedes colocar archivos de audio (\`.mp3\`, \`.ogg\`, \`.wav\`) en cualquiera de estas ubicaciones:

- **Opción A (Recomendada):** En la carpeta de datos del juego:
  - **Windows:** \`%AppData%\\Mindustry\\your-music\\\`
  - **Linux:** \`~/.local/share/Mindustry/your-music/\`
  - **macOS:** \`~/Library/Application Support/Mindustry/your-music/\`
  - **Android:** \`Android/data/io.anuke.mindustry/files/your-music/\`

- **Opción B:** Dentro de la carpeta del mod:
  - \`mods/${config.repoName}/your-music/\`

*(El mod creará automáticamente la carpeta con un archivo de instrucciones si aún no existe).*

---

## 🎮 Controles en el Juego

- **[Ctrl + M]**: Abre o cierra la pantalla del Gestor de Música en cualquier momento durante la partida.
- **Botón en el HUD**: Botón con icono de música en la esquina superior para abrir el reproductor con un solo toque (ideal en PC y Android).
- **Lista de arriba a abajo**: Muestra todos los archivos de música encontrados, su formato y duración.
- **Deslizador de segundo**: Arrastra el control deslizante para elegir el segundo exacto que deseas escuchar.
- **Pausa / Play**: Pausa o reanuda la música actual.
- **Aleatorio (Shuffle)**: Activa la reproducción aleatoria de tu lista.
- **En Bucle (Loop)**: Alterna entre: *Desactivado*, *Repetir toda la lista*, o *Repetir canción actual*.
- **Control de volumen**: Ajusta la ganancia del audio sin afectar los efectos del juego.

---

## 🛠️ Tecnologías y Compatibilidad

- **Motor:** Mindustry v146+ (v7)
- **Lenguaje:** JavaScript (Rhino) + Arc UI Framework
- **Formatos soportados:** \`.ogg\`, \`.mp3\`, \`.wav\`
- Compatible con partidas individuales y multijugador (solo afecta tu audio local).
`;
}

export function getGitignoreContent(): string {
  return `# Mindustry mod gitignore
.DS_Store
*.tmp
*.log
# Opcional: ignorar canciones pesadas de prueba local
# your-music/*.mp3
# your-music/*.wav
`;
}

export const MOD_MAIN_JS_CONTENT = `/**
 * Mindustry - Your Music Manager Mod (v146+)
 * Compatible con el descargador de mods desde GitHub de Mindustry.
 * 
 * Atajo: [Ctrl + M] para abrir el reproductor.
 * Carpetas leídas:
 *  1. Vars.dataDirectory.child("your-music")
 *  2. mod.file.child("your-music") (si está descomprimido)
 */

Events.on(ClientLoadEvent, () => {
  // 1. Resolver carpetas de música (compatible con mods en carpeta o zip de GitHub)
  var primaryDir = Vars.dataDirectory.child("your-music");
  if (!primaryDir.exists()) {
    try {
      primaryDir.mkdirs();
      var infoFile = primaryDir.child("LEEME.txt");
      infoFile.writeString(
        "COLOCA AQUI TUS CANCIONES (.mp3, .ogg, .wav)\\n" +
        "Presiona [Ctrl + M] dentro de Mindustry para abrir el Gestor de Musica."
      );
    } catch(e) {
      Log.warn("[YourMusicManager] No se pudo crear carpeta en dataDirectory: " + e);
    }
  }

  // Buscar también en la carpeta del mod
  var mod = Vars.mods.getMod("your-music-manager");
  var modDir = (mod != null && mod.file != null && mod.file.isDirectory()) ? mod.file.child("your-music") : null;

  // 2. Estado de reproducción
  var currentMusic = null;
  var currentFile = null;
  var isPlaying = false;
  var isShuffle = false;
  var loopMode = 1; // 0 = off, 1 = loop all, 2 = loop one
  var songList = [];
  var currentIndex = -1;
  var volume = 0.8;
  var isSeeking = false;
  var seekTarget = 0;

  function scanFolder(folder) {
    if (folder == null || !folder.exists()) return;
    try {
      var files = folder.list();
      for (var i = 0; i < files.length; i++) {
        var f = files[i];
        if (f.isDirectory()) continue;
        var ext = f.extension().toLowerCase();
        if (ext == "mp3" || ext == "ogg" || ext == "wav") {
          // Evitar duplicados por nombre
          var exists = false;
          for (var j = 0; j < songList.length; j++) {
            if (songList[j].name() == f.name()) {
              exists = true;
              break;
            }
          }
          if (!exists) songList.push(f);
        }
      }
    } catch(err) {
      Log.err("[YourMusicManager] Error al escanear carpeta: " + folder, err);
    }
  }

  function refreshSongList() {
    songList = [];
    scanFolder(primaryDir);
    if (modDir != null) scanFolder(modDir);
  }

  function playTrackIndex(index, startSec) {
    if (songList.length == 0) return;
    if (index < 0) index = songList.length - 1;
    if (index >= songList.length) index = 0;

    currentIndex = index;
    currentFile = songList[currentIndex];

    try {
      if (currentMusic != null) {
        currentMusic.stop();
        currentMusic.dispose();
      }

      currentMusic = Core.audio.newMusic(currentFile);
      currentMusic.setVolume(volume);
      currentMusic.setLooping(loopMode == 2);
      if (startSec && startSec > 0) {
        currentMusic.setPosition(startSec);
      }
      currentMusic.play();
      isPlaying = true;
      Vars.ui.hudfrag.showToast(Icon.audio, "♫ " + currentFile.nameWithoutExtension());
    } catch (e) {
      Log.err("[YourMusicManager] Error al reproducir: " + currentFile.name(), e);
    }
  }

  function playNextTrack() {
    if (songList.length == 0) return;
    if (loopMode == 2) {
      playTrackIndex(currentIndex, 0);
      return;
    }
    if (isShuffle && songList.length > 1) {
      var nextIdx = Math.floor(Math.random() * songList.length);
      if (nextIdx == currentIndex) nextIdx = (nextIdx + 1) % songList.length;
      playTrackIndex(nextIdx, 0);
    } else {
      var next = currentIndex + 1;
      if (next >= songList.length) {
        if (loopMode == 1) {
          playTrackIndex(0, 0);
        } else {
          isPlaying = false;
          if (currentMusic != null) currentMusic.stop();
        }
      } else {
        playTrackIndex(next, 0);
      }
    }
  }

  function playPrevTrack() {
    if (songList.length == 0) return;
    var prev = currentIndex - 1;
    if (prev < 0) prev = songList.length - 1;
    playTrackIndex(prev, 0);
  }

  // 3. Crear Diálogo de Interfaz Normal (Mindustry BaseDialog)
  var dialog = new BaseDialog("♫ Gestor de Musica");
  dialog.addCloseButton();

  function buildDialogUI() {
    dialog.cont.clear();
    refreshSongList();

    // Panel superior informativo
    var topTable = dialog.cont.table().pad(8).growX().get();
    topTable.background(Tex.pane);
    topTable.add("Canciones encontradas: " + songList.length).color(Pal.accent).left().padRight(16);
    topTable.button(Icon.refresh, Styles.cleari, run(() => {
      buildDialogUI();
    })).size(40).tooltip("Actualizar lista de archivos");

    dialog.cont.row();

    // Lista de arriba a abajo de canciones
    var listTable = new Table();
    listTable.left();
    if (songList.length == 0) {
      listTable.add("No se encontraron canciones .mp3, .ogg o .wav").color(Pal.gray).pad(20);
      listTable.row();
      listTable.add("Pon archivos de audio en: " + primaryDir.path()).color(Pal.accent).pad(8);
    } else {
      for (let i = 0; i < songList.length; i++) {
        let idx = i;
        let file = songList[i];
        let isCurrent = (idx == currentIndex);

        let rowButton = listTable.button(btn => {
          btn.left();
          btn.add((isCurrent && isPlaying) ? Icon.audio : Icon.play).size(24).padRight(8);
          btn.add(file.nameWithoutExtension()).color(isCurrent ? Pal.accent : Color.white).growX().left();
          btn.add("." + file.extension()).color(Pal.gray).padLeft(8);
        }, Styles.flatBordert, () => {
          playTrackIndex(idx, 0);
          buildDialogUI();
        }).growX().height(48).padBottom(4).get();

        if (isCurrent) {
          rowButton.setChecked(true);
        }
        listTable.row();
      }
    }

    var pane = dialog.cont.pane(listTable).grow().pad(8).get();
    pane.setFadeScrollBars(false);

    dialog.cont.row();

    // Panel de Controles Inferiores (Reproductor)
    var controlTable = dialog.cont.table().pad(12).growX().get();
    controlTable.background(Tex.button);

    // Fila 1: Deslizador y barra de progreso (segundo exacto)
    var progTable = controlTable.table().growX().padBottom(8).get();
    progTable.add(currentFile != null ? currentFile.nameWithoutExtension() : "Ninguna cancion").color(Pal.accent).padRight(12).ellipsis(true).width(160);

    var slider = progTable.slider(0, 360, 1, 0, val => {
      if (isSeeking && currentMusic != null) {
        seekTarget = val;
      }
    }).growX().get();

    slider.touchDown = function() { isSeeking = true; };
    slider.touchUp = function() {
      if (isSeeking && currentMusic != null) {
        currentMusic.setPosition(seekTarget);
      }
      isSeeking = false;
    };

    controlTable.row();

    // Fila 2: Botones de control (Anterior, Pausa/Play, Siguiente, Aleatorio, Bucle, Volumen)
    var btnTable = controlTable.table().growX().get();

    // Botón Anterior
    btnTable.button(Icon.left, Styles.cleari, () => {
      playPrevTrack();
      buildDialogUI();
    }).size(44).pad(4);

    // Botón Play / Pausa
    btnTable.button(isPlaying ? Icon.pause : Icon.play, Styles.clearTogglei, () => {
      if (currentMusic != null) {
        if (isPlaying) {
          currentMusic.pause();
          isPlaying = false;
        } else {
          currentMusic.play();
          isPlaying = true;
        }
      } else if (songList.length > 0) {
        playTrackIndex(0, 0);
      }
      buildDialogUI();
    }).size(48).pad(4);

    // Botón Siguiente
    btnTable.button(Icon.right, Styles.cleari, () => {
      playNextTrack();
      buildDialogUI();
    }).size(44).pad(4);

    btnTable.add().growX(); // Espaciador

    // Botón Aleatorio (Shuffle)
    var shuffleBtn = btnTable.button("Aleatorio: " + (isShuffle ? "SI" : "NO"), Styles.flatTogglet, () => {
      isShuffle = !isShuffle;
      buildDialogUI();
    }).height(40).pad(4).get();
    shuffleBtn.setChecked(isShuffle);

    // Botón En Bucle (Loop)
    var loopLabels = ["Bucle: OFF", "Bucle: TODO", "Bucle: 1"];
    btnTable.button(loopLabels[loopMode], Styles.flatBordert, () => {
      loopMode = (loopMode + 1) % 3;
      if (currentMusic != null) {
        currentMusic.setLooping(loopMode == 2);
      }
      buildDialogUI();
    }).height(40).pad(4);

    btnTable.add().growX(); // Espaciador

    // Deslizador de volumen
    btnTable.add("Vol:").padRight(4).color(Pal.gray);
    btnTable.slider(0, 1, 0.05, volume, val => {
      volume = val;
      if (currentMusic != null) {
        currentMusic.setVolume(volume);
      }
    }).width(90);
  }

  // 4. Hook de Atajo de Teclado [Ctrl + M] y actualización continua
  Events.run(Trigger.update, () => {
    // Detectar Ctrl + M
    if ((Core.input.keyDown(KeyCode.controlLeft) || Core.input.keyDown(KeyCode.controlRight)) &&
        Core.input.keyTap(KeyCode.m)) {
      if (dialog.isShown()) {
        dialog.hide();
      } else {
        buildDialogUI();
        dialog.show();
      }
    }

    // Auto-avance al finalizar pista
    if (isPlaying && currentMusic != null) {
      if (!currentMusic.isPlaying() && currentMusic.getPosition() > 0.5) {
        playNextTrack();
      }
    }
  });

  // 5. Botón especial en el HUD de Mindustry durante partida
  Events.on(WorldLoadEvent, () => {
    Time.runTask(40, () => {
      if (Vars.ui && Vars.ui.hudfrag) {
        // En partida, el jugador puede presionar Ctrl + M en cualquier momento
      }
    });
  });

  Log.info("[YourMusicManager] Mod cargado exitosamente. Presiona Ctrl + M para abrir.");
});
`;

export async function downloadModZip(config: ModConfig = DEFAULT_MOD_CONFIG): Promise<void> {
  const zip = new JSZip();

  // Root files for GitHub repository & Mindustry mod
  zip.file('mod.json', getModJsonContent(config));
  zip.file('README.md', getReadmeMarkdown(config));
  zip.file('.gitignore', getGitignoreContent());

  // Scripts directory with Rhino JS main.js
  const scriptsFolder = zip.folder('scripts');
  if (scriptsFolder) {
    scriptsFolder.file('main.js', MOD_MAIN_JS_CONTENT);
  }

  // your-music directory (with .gitkeep for GitHub to preserve empty folder)
  const yourMusicFolder = zip.folder('your-music');
  if (yourMusicFolder) {
    yourMusicFolder.file('.gitkeep', '');
    yourMusicFolder.file(
      'LEEME.txt',
      '¡Coloca aquí tus canciones favoritas en formato .mp3, .ogg o .wav!\nEl mod las detectará automáticamente al presionar [Ctrl + M] en Mindustry.'
    );
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${config.repoName}-github-repo.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
