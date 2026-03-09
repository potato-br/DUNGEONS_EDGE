


// Helpers to tidy reset logic. These are internal to this file and keep the
// original external API (resetGame, gameLoop, update, drawAll, gameOver).
// Audio volume defaults are handled centrally by AudioManager (use getters below)

// Prefer saved settings from OptionsMenu when available, otherwise fall back to AudioManager defaults
function getEffectiveMusicVolume() {
  try {
    if (typeof window !== 'undefined' && window.OptionsMenu && typeof window.OptionsMenu.getSettings === 'function') {
      const s = window.OptionsMenu.getSettings();
      if (s && typeof s.musicVolume === 'number') return Number(s.musicVolume);
    }
  } catch (e) {}
  try { return (AudioManager && typeof AudioManager.getDefaultMusicVolume === 'function') ? AudioManager.getDefaultMusicVolume() : 0.6; } catch (e) { return 0.6; }
}

// Prefer saved SFX volume from OptionsMenu when available, otherwise fall back to 1.0
function getEffectiveSfxVolume() {
  try {
    if (typeof window !== 'undefined' && window.OptionsMenu && typeof window.OptionsMenu.getSettings === 'function') {
      const s = window.OptionsMenu.getSettings();
      if (s && typeof s.sfxVolume === 'number') return Number(s.sfxVolume);
    }
  } catch (e) {}
  try { return (AudioManager && typeof AudioManager.getDefaultSfxVolume === 'function') ? AudioManager.getDefaultSfxVolume() : 1.0; } catch (e) { return 1.0; }
}

// Per-run selection state: use a run token to avoid global window collisions between tabs/sessions.
let CURRENT_RUN_TOKEN = 0;
const selectedHighDepthMusicByRun = Object.create(null);
// per-run shuffled decks to avoid repeats until all tracks are played
const shuffleDeckByRun = Object.create(null);
const HIGH_DEPTH_CHOICES = ['gameplay_music', 'gameplay_music_1', 'gameplay_music_2'];

// persisted record value loaded from disk when available (Neutralino-only storage)
let PERSISTED_RECORD_DEPTH = 0;

// --- Neutralino-friendly persistence helpers ----------------------------------
// When running under Neutralino, persist the record inside Documents/
// "dungeons edge save game/" as a simple text file `dungeons_edge_record.txt`.
// Falls back to localStorage in browsers or on errors.

async function _recordFilePath() {
  try {
    if (typeof Neutralino !== 'undefined' && Neutralino.os && typeof Neutralino.os.getPath === 'function') {
      const docPath = await Neutralino.os.getPath('documents');
      const sep = (docPath.endsWith('/') || docPath.endsWith('\\')) ? '' : '\\';
      const folderPath = `${docPath}${sep}dungeons edge save game`;
      try { await Neutralino.filesystem.createDirectory(folderPath); } catch (e) {}
      const filePath = `${folderPath}${folderPath.endsWith('/') || folderPath.endsWith('\\') ? '' : '\\'}dungeons_edge_record.txt`;
      return filePath;
    }
  } catch (e) {}
  return null;
}

async function _loadRecordDepthFromDiskFallback() {
  try {
    if (typeof Neutralino === 'undefined' || !Neutralino.os || typeof Neutralino.os.getPath !== 'function') return;
    const docPath = await Neutralino.os.getPath('documents');
    const sep = (docPath.endsWith('/') || docPath.endsWith('\\')) ? '' : '\\';
    const folderPath = `${docPath}${sep}dungeons edge save game`;
    try { await Neutralino.filesystem.createDirectory(folderPath); } catch (e) {}
    const filePath = `${folderPath}${folderPath.endsWith('/') || folderPath.endsWith('\\') ? '' : '\\'}dungeons_edge_record.txt`;
    try {
      if (typeof Neutralino !== 'undefined' && Neutralino.filesystem && typeof Neutralino.filesystem.readFile === 'function') {
        const raw = await Neutralino.filesystem.readFile(filePath);
        if (raw) {
          const num = Number((raw || '').toString().trim()) || 0;
          PERSISTED_RECORD_DEPTH = num;
          try { if (typeof window !== 'undefined') window.PERSISTED_RECORD_DEPTH = PERSISTED_RECORD_DEPTH; } catch (e) {}
          try { if (typeof isDebugMode !== 'undefined' && isDebugMode) console.log('[Record] loaded from file', num); } catch (e) {}
        }
      }
    } catch (e) {
      // ignore read errors
    }
  } catch (e) {}
}

function saveRecordDepthToDisk(value) {
  try {
    const numVal = Number(value) || 0;
    (async () => {
      try {
        const filePath = await _recordFilePath();
        if (!filePath) return;
        if (typeof Neutralino !== 'undefined' && Neutralino.filesystem && typeof Neutralino.filesystem.writeFile === 'function') {
          try { await Neutralino.filesystem.writeFile(filePath, String(numVal)); } catch (e) {}
        }
        PERSISTED_RECORD_DEPTH = numVal;
        try { if (typeof window !== 'undefined') window.PERSISTED_RECORD_DEPTH = PERSISTED_RECORD_DEPTH; } catch (e) {}
        try { if (typeof isDebugMode !== 'undefined' && isDebugMode) console.log('[Record] saved to file', numVal); } catch (e) {}
      } catch (e) {
        try { if (typeof isDebugMode !== 'undefined' && isDebugMode) console.warn('[Record] failed to save to file', e); } catch (e) {}
      }
    })();
    return;
  } catch (e) {}
  PERSISTED_RECORD_DEPTH = Number(value) || 0;
  try { if (typeof window !== 'undefined') window.PERSISTED_RECORD_DEPTH = PERSISTED_RECORD_DEPTH; } catch (e) {}
}

// try to pre-populate the persisted record when running under Neutralino
try { _loadRecordDepthFromDiskFallback(); } catch (e) {}



function _resetPlayerState() {
  frameCount = 0;
  if (player) Object.assign(player, { velocityY: 0, isJumping: false, jumpCount: 0 });
  if (typeof previousLive !== 'undefined') previousLive = typeof live !== 'undefined' ? live : 0;
  if (typeof animatingHearts !== 'undefined') animatingHearts = [];
  // dash reset
  if (player) {
    player.currentDashes = player.maxDashes;
    player.lastDashRecharge = 0;
  }
}

function _resetEntitiesAndPhysics() {
  isGameOver = false;
  serras = [];
  morcegos.length = 0;
  particles.length = 0;
  // clear any lingering web ghosts from enemies (teia fadeouts)
  try { if (typeof webGhosts !== 'undefined') webGhosts.length = 0; } catch (e) {}
  dashCooldown = false;
  plataformas = [];
  enemies = [];
  moedas = [];
  SpawnSystem && typeof SpawnSystem.inicializar === 'function' && SpawnSystem.inicializar();
}

function _resetGrandeInimigos() {
  try {
    if (typeof grandeInimigos !== 'undefined') {
      for (const gi of grandeInimigos) {
        if (gi && gi.attachedPlatform && gi.attachedPlatform._hasGrandeEnemy) gi.attachedPlatform._hasGrandeEnemy = false;
      }
      grandeInimigos.length = 0;
    }
    if (typeof lastGrandeInimigoSpawn !== 'undefined') lastGrandeInimigoSpawn = 0;
  } catch (e) {
    // swallow - non-critical cleanup
  }
}
// Helpers to tidy reset logic. These are internal to this file and keep the
// original external API (resetGame, gameLoop, update, drawAll, gameOver).
function _resetPlayerState() {
  frameCount = 0;
  if (player) Object.assign(player, { velocityY: 0, isJumping: false, jumpCount: 0 });
  if (typeof previousLive !== 'undefined') previousLive = typeof live !== 'undefined' ? live : 0;
  if (typeof animatingHearts !== 'undefined') animatingHearts = [];
  // dash reset
  if (player) {
    player.currentDashes = player.maxDashes;
    player.lastDashRecharge = 0;
  }
}

function _resetEntitiesAndPhysics() {
  isGameOver = false;
  serras = [];
  morcegos.length = 0;
  particles.length = 0;
  // clear any lingering web ghosts from enemies (teia fadeouts)
  try { if (typeof webGhosts !== 'undefined') webGhosts.length = 0; } catch (e) {}
  dashCooldown = false;
  plataformas = [];
  enemies = [];
  moedas = [];
  SpawnSystem && typeof SpawnSystem.inicializar === 'function' && SpawnSystem.inicializar();
}

function _resetGrandeInimigos() {
  try {
    if (typeof grandeInimigos !== 'undefined') {
      for (const gi of grandeInimigos) {
        if (gi && gi.attachedPlatform && gi.attachedPlatform._hasGrandeEnemy) gi.attachedPlatform._hasGrandeEnemy = false;
      }
      grandeInimigos.length = 0;
    }
    if (typeof lastGrandeInimigoSpawn !== 'undefined') lastGrandeInimigoSpawn = 0;
  } catch (e) {
    // swallow - non-critical cleanup
  }
}

function _resetDashTrail() {
  DASH.trailActive = false;
  DASH.trailPoints = [];
  DASH.trailStack = [];
  DASH.startPoint = null;
}

function _resetNinjaSmoke() {
  if (typeof NINJA !== 'undefined') NINJA.smokeBombActive = false;
  ninjaSmokeBombCooldown = false;
  ninjaSmokeBombTimer = 0;
}

function _resetBackgroundAndUI() {
  currentLateralLeftBg = lateralImages[0];
  nextLateralLeftBg = lateralImages[0];
  currentLateralRightBg = lateralImages[0];
  nextLateralRightBg = lateralImages[0];
  lateralBackgroundY = 0;
  normalCount = -1;
  gameSpeed = 1;
  depthPoints = 0;
  trocaCount = 0;
  try { ambientDarknessTime = 0; } catch (e) {}
  // Ensure any saved-start ramp state is cleared when resetting background/UI so
  // it doesn't accidentally continue running in a later session.
  try {
    if (typeof savedStartRamp !== 'undefined' && savedStartRamp) {
      savedStartRamp.active = false;
      savedStartRamp.startTime = 0;
      savedStartRamp.duration = 0;
      savedStartRamp.targetGameSpeed = 1;
      savedStartRamp.startGameSpeed = 1;
      savedStartRamp._lastLog = 0;
    }
  } catch (e) {}
  // Ensure any ability state that could make the player invulnerable is cleared
  try {
    // cancel visual invulnerability effects (stops blinking and clears timers)
    if (typeof cancelarInvulnerabilidade === 'function') try { cancelarInvulnerabilidade(); } catch (e) {}
    // reset dash/ability cooldown bookkeeping
    if (typeof resetarCooldownsHabilidades === 'function') try { resetarCooldownsHabilidades(); } catch (e) {}
    // clear global invuln end time if present
    try { if (typeof invulnEndTime !== 'undefined') invulnEndTime = 0; } catch (e) {}
    // ensure DASH state is clean
    try {
      if (typeof DASH !== 'undefined') {
        DASH.isInvulnerable = false;
        if (DASH.invulnTimeout) try { clearTimeout(DASH.invulnTimeout); } catch (e) {}
        DASH.invulnTimeout = null;
      }
    } catch (e) {}
    // ninja-specific flag
    try { if (typeof NINJA !== 'undefined') NINJA.invulneravelPorDano = false; } catch (e) {}
    // active ability timers entry
    try { if (typeof activeAbilityTimers !== 'undefined' && activeAbilityTimers.invulnerabilidade) activeAbilityTimers.invulnerabilidade = null; } catch (e) {}
    // stop any blinking intervals
    if (typeof pararPiscar === 'function') try { pararPiscar(); } catch (e) {}
  } catch (e) {}
}

function _applySavedStartDepthIfAny(DEFAULT_SPAWN_GRACE) {
  try {
    const globalSaved = _charData && _charData.__global && _charData.__global.savedStartDepth;
    const savedDepth = globalSaved || (characterData[activeCharacter] && characterData[activeCharacter].savedStartDepth);
    if (typeof savedDepth === 'number' && savedDepth > 0) {
      depthPoints = savedDepth;
      currentRunUsedSavedStart = true;
      try {
        if (globalSaved) delete _charData.__global.savedStartDepth;
        else delete characterData[activeCharacter].savedStartDepth;
      } catch (e) {}

      lastEnemyAllowedTime = performance.now() + Math.max(DEFAULT_SPAWN_GRACE, 3500);
      lastSerraAllowedTime = lastEnemyAllowedTime + 1000;
      moneytime = lastEnemyAllowedTime;
      try { ambientDarknessTime = Math.min((ambientDarknessTime || 0) + 10, AMBIENT_TIME_TO_MAX); } catch (e) {}

      // savedStartRamp support (optional feature)
      try {
        if (typeof savedStartRamp !== 'undefined') {
          const target = typeof computeGameSpeedForDepth === 'function' ? computeGameSpeedForDepth(depthPoints) : 1;
          const cfg = (typeof savedStartRampConfig !== 'undefined' ? savedStartRampConfig : null) || {};
          const minD = typeof cfg.minDuration === 'number' ? cfg.minDuration : 1200;
          const maxD = typeof cfg.maxDuration === 'number' ? cfg.maxDuration : 8000;
          const scale = typeof cfg.scaleMsPerDepthDiv10 === 'number' ? cfg.scaleMsPerDepthDiv10 : 200;

          savedStartRamp.active = true;
          savedStartRamp.startTime = performance.now();
          savedStartRamp.duration = Math.min(maxD, Math.max(minD, Math.floor((depthPoints / 10) * scale)));
          savedStartRamp.startGameSpeed = 1;
          savedStartRamp.targetGameSpeed = target;
          try { if (cfg.debug) console.log('[savedStartRamp] activated', { depthPoints, duration: savedStartRamp.duration, target }); } catch (e) {}
        }
      } catch (e) {}
      return;
    }
  } catch (e) {}

  // if depth falls below the high-depth threshold, clear any high-depth music handlers
  try {
    // if depth falls below the high-depth threshold, clear any high-depth music handlers
    try {
      if (typeof depthPoints !== 'undefined' && depthPoints < 30000) {
        try { clearHighDepthSelection(); } catch (e) {}
      }
    } catch (e) {}
  } catch (e) {}

  // default grace when no saved depth
  lastEnemyAllowedTime = performance.now() + DEFAULT_SPAWN_GRACE;
  lastSerraAllowedTime = lastEnemyAllowedTime + 1000;
  moneytime = lastEnemyAllowedTime;
}

function _decrementTemporaryPurchasesFor(obj) {
  try {
    if (!obj || !obj.purchases) return;
    const purchases = obj.purchases;
    const allItems = (typeof shopItems !== 'undefined' ? shopItems : []).concat(typeof SECRET_ITEMS !== 'undefined' ? SECRET_ITEMS : []);
    allItems.forEach(item => {
      if (!item) return;
      if (item.isTemporary && purchases[item.nome] && purchases[item.nome] > 0) purchases[item.nome]--;
    });
  } catch (e) {}
}

function resetGame({ pauseOnStart = true, showShop = false, il = true } = {}) {
  // start a fresh run token so high-depth selections persist only for this run
  try { CURRENT_RUN_TOKEN = (CURRENT_RUN_TOKEN || 0) + 1; } catch (e) { CURRENT_RUN_TOKEN = 1; }
  // allow next transition to start music afresh
  try { transitionMusicStarted = false; } catch (e) {}
  // Stop music/ambients only if we're resetting to a non-gameplay, non-shop state
  // This prevents unnecessary stops when starting gameplay or shop
  const willEnterGameplay = !showShop && (!firstGamePlay || pauseOnStart);
  if (!showShop && !willEnterGameplay) {
    try { if (AudioManager && typeof AudioManager.stopMusic === 'function') AudioManager.stopMusic(); } catch (e) {}
    try { if (AudioManager && typeof AudioManager.stopAllAmbients === 'function') AudioManager.stopAllAmbients(); } catch (e) {}
    try { if (AudioManager && typeof AudioManager.stopAmbient === 'function') AudioManager.stopAmbient('shop_ambience'); } catch (e) {}
    try { if (AudioManager && typeof AudioManager.stop === 'function') AudioManager.stop('serra_sfx'); } catch (e) {}
    try { if (typeof window !== 'undefined' && Array.isArray(window._activeSerraSounds)) { window._activeSerraSounds.forEach(a => { try { a.pause(); a.currentTime = 0; } catch (e) {} }); window._activeSerraSounds.length = 0; } } catch (e) {}
      try {
        if (AudioManager && typeof AudioManager.setMusicVolume === 'function') AudioManager.setMusicVolume(getEffectiveMusicVolume());
        if (AudioManager && typeof AudioManager.setSfxVolume === 'function') AudioManager.setSfxVolume(getEffectiveSfxVolume());
      } catch (e) {}
}
  // if a pending selection was placed on window (from shop helpers), consume it for this run
  try { if (typeof window !== 'undefined' && window.__highDepthSelectionPending) { selectedHighDepthMusicByRun[CURRENT_RUN_TOKEN] = window.__highDepthSelectionPending; try { delete window.__highDepthSelectionPending; } catch (e) { window.__highDepthSelectionPending = null; } } } catch (e) {}
  // high-level reset sequence: player, entities, environment, UI/state
  _resetPlayerState();
  _resetEntitiesAndPhysics();
  _resetGrandeInimigos();
  _resetDashTrail();
  _resetNinjaSmoke();
  _resetBackgroundAndUI();

  if (il) ajustarCanvas(); else ajustarCanvas(false);

  // lives handling
  live = (typeof liveupgrade === 'number' && liveupgrade > 0) ? liveupgrade : 0;

  createInitialPlataforma();
  direction = 'right';

  if (showShop) {
    gameState = 'loja';
    selectedIndex = 0;
  // playMusic is handled centrally in the transition logic (tickUpdate)
  } else {
    const DEFAULT_SPAWN_GRACE = 2000; // ms
    gameState = firstGamePlay ? 'tutorial' : 'jogando';
    firstGamePlay = false;
    _applySavedStartDepthIfAny(DEFAULT_SPAWN_GRACE);
    // decrement temporary purchases for active character and global scope (only when actually entering gameplay)
    try {
      _decrementTemporaryPurchasesFor(characterData[activeCharacter]);
      _decrementTemporaryPurchasesFor(characterData.__global);
    } catch (e) {}
    if (pauseOnStart) pausar();
  }
}

// rAF id so we can avoid duplicate loops and allow explicit stop/start
let rAFId = null;
// track previous gameState to react to transitions (e.g., stop shop music when leaving loja)
let lastGameState = null;
// guard to avoid starting music multiple times during a single state transition
let transitionMusicStarted = false;
// remember if we were paused in the previous frame, so we only resume when leaving pause
let lastIsPaused = false;
// guard to avoid triggering multiple shop-open transitions from repeated input
let _shopOpenRequested = false;

function startGameLoop() {
  if (rAFId != null) return; // already running
  rAFId = requestAnimationFrame(gameLoop);
}

function stopGameLoop() {
  if (rAFId == null) return;
  cancelAnimationFrame(rAFId);
  rAFId = null;
}

function tickUpdate(now) {
  // throttle to target fps
  const elapsed = now - lastFrameTime;
  if (elapsed < fpsInterval) return false; // skipped this frame
  lastFrameTime = now - (elapsed % fpsInterval);

  frameCount++;
  // whether the previous frame was paused
  const wasPaused = !!lastIsPaused;

  // detect gameState transitions and act accordingly
  try {
    if (lastGameState !== gameState) {
      // Só para música se saiu da loja para um estado que não seja gameplay
      if (lastGameState === 'loja' && gameState !== 'loja' && gameState !== 'jogando') {
        try { AudioManager && typeof AudioManager.stopMusic === 'function' && AudioManager.stopMusic(); } catch (e) {}
      }
      // se entrou em gameplay, toca música normal
  if (gameState === 'jogando' && lastGameState !== 'jogando') {
    if (typeof isDebugMode !== 'undefined' && isDebugMode) console.log('[Reset_e_Loop] Entrou em jogando', { lastGameState, gameState, transitionMusicStarted });

        // Música aleatória se profundidade >= 30000, mas só sorteia UMA vez por sessão de gameplay
        let musicaEscolhida = null;
        if (typeof depthPoints !== 'undefined' && depthPoints >= 30000) {
          if (typeof window !== 'undefined') {
            // ensure this run has a deck
            try { ensureDeckForRun(CURRENT_RUN_TOKEN, null); } catch (e) {}
            let current = selectedHighDepthMusicByRun[CURRENT_RUN_TOKEN];
            if (!current) {
              // if shop placed a pending selection for this run, use it as first-played
              let pending = null;
              try { pending = (typeof window !== 'undefined' ? window.__highDepthSelectionPending : null); } catch (e) { pending = null; }
              let chosen = null;
              if (pending && HIGH_DEPTH_CHOICES.includes(pending)) {
                chosen = pending;
                try { delete window.__highDepthSelectionPending; } catch (e) { window.__highDepthSelectionPending = null; }
              } else {
                chosen = drawNextFromDeck(CURRENT_RUN_TOKEN, null);
              }
              try { selectedHighDepthMusicByRun[CURRENT_RUN_TOKEN] = chosen; } catch (e) {}
              // Apenas registra a escolha e o handler; AudioManager.js inicia a música
              try { attachHighDepthEndedHandler(chosen); } catch (e) {}
            }
            musicaEscolhida = selectedHighDepthMusicByRun[CURRENT_RUN_TOKEN];
          } else {
            musicaEscolhida = HIGH_DEPTH_CHOICES[Math.floor(Math.random() * HIGH_DEPTH_CHOICES.length)];
          }
        } else {
          // Se saiu do modo high depth, limpa a escolha
          try { clearHighDepthSelection(); } catch (e) {}
          musicaEscolhida = 'gameplay_music';
        }

  // Apenas registra a escolha; AudioManager.js inicia a música
  try {
    if (AudioManager && typeof AudioManager.setMusicVolume === 'function') AudioManager.setMusicVolume(getEffectiveMusicVolume());
    if (AudioManager && typeof AudioManager.setSfxVolume === 'function') AudioManager.setSfxVolume(getEffectiveSfxVolume());
  } catch (e) {}
        // Play the chosen track immediately for this transition so we don't start the
        // default gameplay music and then get it crossfaded/cut by the high-depth selection.
        try {
          const toPlay = musicaEscolhida || 'gameplay_music';
          const isHighDepth = (typeof depthPoints !== 'undefined' && depthPoints >= 30000);
          if (!transitionMusicStarted) {
            transitionMusicStarted = true;
            try { if (AudioManager && typeof AudioManager.playMusic === 'function') AudioManager.playMusic(toPlay, { loop: !isHighDepth }); } catch (e) {}
          }
        } catch (e) {}
  } else if (gameState === 'jogando') {
    // Se já está em jogando, só restaura o volume sem reiniciar
  try {
    if (AudioManager && typeof AudioManager.setMusicVolume === 'function') AudioManager.setMusicVolume(getEffectiveMusicVolume());
    if (AudioManager && typeof AudioManager.setSfxVolume === 'function') AudioManager.setSfxVolume(getEffectiveSfxVolume());
  } catch (e) {}
  }
      // start ambient layers when entering gameplay
      try {
        if (gameState === 'jogando' && lastGameState !== 'jogando') {
              try {
                if (AudioManager && typeof AudioManager.assets === 'object' && AudioManager.assets['ambience'] && AudioManager.assets['ambience'].paused && typeof AudioManager.playAmbient === 'function') {
                    try {
                    const am = (AudioManager && typeof AudioManager.getDefaultAmbientMultiplier === 'function') ? AudioManager.getDefaultAmbientMultiplier() : 0.1;
                    AudioManager.playAmbient('ambience', { volume: am });
                  } catch (e) {}
                }
              } catch (e) {}
          // only a single ambience layer is used now
        }
  // do not stop ambients when leaving gameplay; ambients should continue playing
      } catch (e) {}
      // pause vs respawn/gameover policy:
      // - pause: actually pause music (so resume restores without re-randomizing or volume change)
      // - respawn/gameover: fade out (stopMusic) and when returning to gameplay, crossfade-in via playMusic
      if (lastGameState !== gameState) {
        try {
          // entered pause
          if (typeof isPaused !== 'undefined' && isPaused && gameState !== lastGameState) {
            try { if (AudioManager && typeof AudioManager.pauseMusic === 'function') AudioManager.pauseMusic(); } catch (e) {}
            // lower ambient modestly (but keep it running)
            try {
              const am = (AudioManager && typeof AudioManager.getDefaultAmbientMultiplier === 'function') ? AudioManager.getDefaultAmbientMultiplier() : 0.1;
              if (AudioManager && typeof AudioManager.setAmbientVolume === 'function') AudioManager.setAmbientVolume('ambience', am * 0.5);
            } catch (e) {}
          }
          // When leaving gameplay to respawn, pause music (preserve position); on gameover stop it
          if (gameState === 'respawnando' && lastGameState === 'jogando') {
            try { if (AudioManager && typeof AudioManager.pauseMusic === 'function') AudioManager.pauseMusic(); } catch (e) {}
            try {
              const am = (AudioManager && typeof AudioManager.getDefaultAmbientMultiplier === 'function') ? AudioManager.getDefaultAmbientMultiplier() : 0.1;
              if (AudioManager && typeof AudioManager.setAmbientVolume === 'function') AudioManager.setAmbientVolume('ambience', am * 0.05);
            } catch (e) {}
          }
          if (gameState === 'gameover' && lastGameState === 'jogando') {
            // Bloqueia qualquer tentativa de tocar música durante a transição para gameover
            try { if (AudioManager && typeof AudioManager.stopMusic === 'function') AudioManager.stopMusic(); } catch (e) {}
            try {
              const am = (AudioManager && typeof AudioManager.getDefaultAmbientMultiplier === 'function') ? AudioManager.getDefaultAmbientMultiplier() : 0.1;
              if (AudioManager && typeof AudioManager.setAmbientVolume === 'function') AudioManager.setAmbientVolume('ambience', am * 0.05);
            } catch (e) {}
            // Sinaliza para não tocar música até sair do gameover
            if (typeof window !== 'undefined') window.__blockMusicDuringGameOver = true;
          }
          // Nunca chama stopMusic ao entrar em jogando
          // left pause and returned to gameplay
          if (gameState === 'jogando' && lastGameState !== 'jogando') {
            // if we were paused and now unpaused, resume music instead of restarting
            try { if (wasPaused && typeof isPaused !== 'undefined' && !isPaused) {
              try { if (AudioManager && typeof AudioManager.resumeMusic === 'function' && !transitionMusicStarted) AudioManager.resumeMusic(); } catch (e) {}
            } } catch (e) {}
            // if we came from respawn/gameover, ensure music is (re)started via playMusic
            try {
              if ((lastGameState === 'respawnando' || lastGameState === 'gameover')) {
                // Só permite tocar música se não estiver em gameover
                if (typeof window === 'undefined' || !window.__blockMusicDuringGameOver) {
                  try {
                    const musicaAtual = (typeof selectedHighDepthMusicByRun !== 'undefined' ? selectedHighDepthMusicByRun[CURRENT_RUN_TOKEN] : null) || 'gameplay_music';
                    if (!transitionMusicStarted) {
                      transitionMusicStarted = true;
                      if (AudioManager && typeof AudioManager.ensureMusicPlaying === 'function') AudioManager.ensureMusicPlaying(musicaAtual);
                    }
                  } catch (e) {}
                }
              }
            } catch (e) {}
            // restore ambient volume
            try {
              const am = (AudioManager && typeof AudioManager.getDefaultAmbientMultiplier === 'function') ? AudioManager.getDefaultAmbientMultiplier() : 0.1;
              if (AudioManager && typeof AudioManager.setAmbientVolume === 'function') AudioManager.setAmbientVolume('ambience', am);
            } catch (e) {}
          }
        } catch (e) {}
      }
      // se foi para loja, toca a música da loja (não parar antes — playMusic já faz crossfade quando necessário)
      if (gameState === 'loja' && lastGameState !== 'loja') {
    // Stop void fall sound effect when entering shop
    try { if (AudioManager && typeof AudioManager.stop === 'function') AudioManager.stop('void_sfx'); } catch (e) {}
        try {
          transitionMusicStarted = true;
          try {
            if (AudioManager && typeof AudioManager.setMusicVolume === 'function') AudioManager.setMusicVolume(getEffectiveMusicVolume());
            if (AudioManager && typeof AudioManager.setSfxVolume === 'function') AudioManager.setSfxVolume(getEffectiveSfxVolume());
          } catch (e) {}
          AudioManager && typeof AudioManager.playMusic === 'function' && AudioManager.playMusic('shop_music');
        } catch (e) {}
  // reduz o volume do layer de ambience herdado da gameplay para um nível bem baixo
  try {
    const am = (AudioManager && typeof AudioManager.getDefaultAmbientMultiplier === 'function') ? AudioManager.getDefaultAmbientMultiplier() : 0.1;
    if (AudioManager && typeof AudioManager.setAmbientVolume === 'function') AudioManager.setAmbientVolume('ambience', am * 0.01);
  } catch (e) {}
      }
      // stop any active serra sounds when entering shop
      try {
        if (gameState === 'loja' && lastGameState !== 'loja') {
          try {
            if (typeof window !== 'undefined' && Array.isArray(window._activeSerraSounds)) {
              window._activeSerraSounds.forEach(a => { try { a.pause(); a.currentTime = 0; } catch (e) {} });
              window._activeSerraSounds.length = 0;
            }
          } catch (e) {}
          try { if (AudioManager && typeof AudioManager.stop === 'function') AudioManager.stop('serra_sfx'); } catch (e) {}
        }
      } catch (e) {}
      // also ensure gameplay ambience plays in the shop (so ambient layers are present)
      try {
        if (gameState === 'loja' && lastGameState !== 'loja') {
          try {
            if (AudioManager && typeof AudioManager.assets === 'object' && AudioManager.assets['ambience'] && typeof AudioManager.playAmbient === 'function') {
              // if ambience isn't playing, start it; otherwise, adjust its volume to the shop level
              const am = (AudioManager && typeof AudioManager.getDefaultAmbientMultiplier === 'function') ? AudioManager.getDefaultAmbientMultiplier() : 0.1;
              if (AudioManager.assets['ambience'].paused) {
                try { AudioManager.playAmbient('ambience', { volume: am }); } catch (e) {}
              } else {
                try { AudioManager.setAmbientVolume('ambience', am); } catch (e) {}
              }
            }
          } catch (e) {}
        }
      } catch (e) {}
      // play shop ambient when entering loja, stop it when leaving loja
      try {
        if (gameState === 'loja' && lastGameState !== 'loja') {
          try { if (AudioManager && typeof AudioManager.playAmbient === 'function' && AudioManager.assets['shop_ambience']) AudioManager.playAmbient('shop_ambience', { volume: 0.25 }); } catch (e) {}
        }
        if (lastGameState === 'loja' && gameState !== 'loja') {
          try { if (AudioManager && typeof AudioManager.stopAmbient === 'function' && AudioManager.assets['shop_ambience']) AudioManager.stopAmbient('shop_ambience'); } catch (e) {}
        }
      } catch (e) {}
      // se saiu da tela de gameover, para o som de gameover
      if (lastGameState === 'gameover' && gameState !== 'gameover') {
        try { AudioManager && typeof AudioManager.stop === 'function' && AudioManager.stop('gameover_sfx'); } catch (e) {}
      }
      // cleanup: if we left gameplay to a non-pause/non-respawn state (e.g., loja), clear selection
      try {
        const leftGameplay = (lastGameState === 'jogando' && gameState !== 'jogando');
        const isTemporaryLeave = (typeof isPaused !== 'undefined' && isPaused) || (gameState === 'respawnando');
        if (leftGameplay && !isTemporaryLeave) {
          try { clearHighDepthSelection(); } catch (e) {}
        }
      } catch (e) {}
  // Se saiu do gameover, libera o bloqueio de música
  if (lastGameState === 'gameover' && gameState !== 'gameover') {
    if (typeof window !== 'undefined') window.__blockMusicDuringGameOver = false;
  }
  lastGameState = gameState;
  // end of transition handling — allow next transition to start music again
  try { transitionMusicStarted = false; } catch (e) {}
  // remember pause state for next frame
  try { lastIsPaused = !!isPaused; } catch (e) { lastIsPaused = false; }
  // reset shop-open guard after any state transition so future gameovers can open the shop
  try { _shopOpenRequested = false; } catch (e) {}
    }
  } catch (e) {}

  // high-depth music loop handling is now event-driven via 'ended' listeners

  // intro tutorial uses its own update/draw flow
  if (gameState === 'intro') {
    updateIntro(now);
    return true;
  }

  // input-driven transitions
  if (gameState === 'gameover' && inputManager.isRestart()) {
    try {
      if (!_shopOpenRequested) {
        _shopOpenRequested = true;
        openShopWithTransition();
      }
    } catch (e) {}
  }
  if (gameState === 'vitoria' && inputManager.isNext()) {
    resetGame({ pauseOnStart: true, showShop: false });
    gameState = 'jogando';
  }

  const shouldSimulate = !isPaused && !isRespawning && (gameState === 'jogando' || gameState === 'gameover' || gameState === 'tutorial') && !(typeof DungeonTutorial !== 'undefined' && DungeonTutorial._tutorialPaused);
  
  // Se estiver em movimento-only, simula APENAS movimento do personagem
  const tutorialMovementOnly = (typeof DungeonTutorial !== 'undefined' && DungeonTutorial._tutorialMovementOnly);
  if (tutorialMovementOnly) {
    // Só atualiza movimento do personagem
    try { movePlayer();
          handleDash(now);
          checarInvulnerabilidade(); 
          updateCooldowns(now); 
          updateParticles(); 
     } catch (err) {}
  } else if (shouldSimulate) {
    update(now);
  }

  // ---- collision checks durante tutorial movimento-only ----
  if (tutorialMovementOnly && gameState !== 'gameover') {
    try { if (typeof checkVoidFall === 'function') checkVoidFall(); } catch (e) {}
  }

  // ambient darkness advances only while actively playing
  try {
    if (!isPaused && !isRespawning && gameState === 'jogando' && !(typeof DungeonTutorial !== 'undefined' && DungeonTutorial._tutorialPaused)) {
      ambientDarknessTime = (ambientDarknessTime || 0) + (elapsed / 1000);
      ambientDarknessTime = Math.min(ambientDarknessTime, AMBIENT_TIME_TO_MAX * 2);
    }
  } catch (e) {}

  // Only update animations if not in tutorial pause (but allow in movement-only mode)
  const tutorialPausedFull = (typeof DungeonTutorial !== 'undefined' && DungeonTutorial._tutorialPaused);
  if (!tutorialPausedFull) {
    updatePlayerAnimation();
  }
  return true;
}

function tickRender() {
  // rendering
  if (gameState === 'loja') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLoja();
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (typeof drawlateral === 'function') drawlateral();
  drawBackground();
  drawPlataformas();
  if (typeof drawMoedas === 'function') drawMoedas();
  if (typeof drawDashGhosts === 'function') drawDashGhosts(ctx);
  drawPlayer();
  drawCerras();
  drawEnemies();
  drawMorcegos();
  if (typeof drawGrandeInimigos === 'function') drawGrandeInimigos();
  icePhysics.draw(ctx);

  if (gameState !== 'gameover') {
    drawMoney();
    drawDepthPoints();
    drawLives();
    drawDashUI();
  }

  if (gameState === 'gameover') drawGameOver();
  if (gameState === 'vitoria') drawVictory();
  if (gameState === 'tutorial') drawTutorial();
  if (DungeonTutorial.showDungeonTutorial) {
  DungeonTutorial.drawDungeonTutorialOverlay();
  }
    if (DungeonTutorial.showDungeonTutorial === false && typeof Tutorial !== 'undefined' && Tutorial._stage === 'dungeonInteraction' && !DungeonTutorial._injectedFromShop) {
      // Only inject the dungeon tutorial once after leaving the shop to avoid loops
      DungeonTutorial._injectedFromShop = true;
      // If a stage was already restored (from initFromSave), preserve it; otherwise default to welcomeIntro
      try {
        if (!DungeonTutorial._stage) DungeonTutorial._stage = 'welcomeIntro';
      } catch (e) {}
      DungeonTutorial.showDungeonTutorial = true;
      DungeonTutorial._typing.fullText = null;
      DungeonTutorial._typing.revealedLength = 0;
      DungeonTutorial._inputTracking.pressedKeys = {}; // Limpar pressedKeys ao inicializar
      DungeonTutorial._detachListeners();
      DungeonTutorial._attachListeners();
      // set pause/movement flags according to stage
      try {
        const PAUSEstates = ['practice_arrows','practice_ad','practice_shift'];
        if (PAUSEstates.includes(DungeonTutorial._stage)) {
          DungeonTutorial._tutorialPaused = false;
          DungeonTutorial._tutorialMovementOnly = true;
        } else {
          DungeonTutorial._tutorialPaused = true;
          DungeonTutorial._tutorialMovementOnly = false;
        }
      } catch (e) {}
    }
  

  if (typeof drawAllHitboxes === 'function') drawAllHitboxes();

  if (isPaused) drawPause();
}

function gameLoop(now = performance.now()) {
  // schedule next frame and keep id for stop control
  rAFId = requestAnimationFrame(gameLoop);

  // update step (may be skipped due to fps throttle)
  const updated = tickUpdate(now);

  // special-case intro tutorial drawing
  if (gameState === 'intro') {
    drawIntro();
    return;
  }

  // only render when update allowed (keeps rendering consistent with throttle)
  if (updated) tickRender();
}

function update(now) {
  // ---- pre-update: states & cooldowns ----
  try { checarInvulnerabilidade(); } catch (e) {}
  try { updateCooldowns(now); } catch (e) {}

  // ---- player physics & movement ----
  try { movePlayer(); } catch (e) {}
  try { handleDash(now); } catch (e) {}
  try { movePlataformas(); } catch (e) {}
  try { icePhysics && typeof icePhysics.updateParticles === 'function' && icePhysics.updateParticles(); } catch (e) {}

  // ---- enemies & spawns ----
  try { if (typeof updateEnemies === 'function') updateEnemies(); } catch (e) {}
  try { if (typeof spawnEnemies === 'function') spawnEnemies(now); } catch (e) {}

  // grande-inimigos (platform-attached enemies)
  try { if (typeof spawnGrandeInimigos === 'function') spawnGrandeInimigos(now); } catch (e) {}
  try { if (typeof updateGrandeInimigos === 'function') updateGrandeInimigos(); } catch (e) {}

  // cerras (saws)
  try { if (typeof updateCerras === 'function') updateCerras(); } catch (e) {}
  try { if (typeof spawnCerras === 'function') spawnCerras(); } catch (e) {}

  // moedas (coins)
  try { if (typeof updateMoedas === 'function') updateMoedas(); } catch (e) {}
  try { if (typeof checkMoedaCollision === 'function') checkMoedaCollision(); } catch (e) {}

  // morcegos (bats)
  try { if (typeof updateMorcegos === 'function') updateMorcegos(); } catch (e) {}
  try { if (typeof atualizarSpawnMorcegos === 'function') atualizarSpawnMorcegos(depthPoints); } catch (e) {}

  // collision checks for platform-attached large enemies
  try { if (typeof checkGrandeInimigosCollision === 'function') checkGrandeInimigosCollision(); } catch (e) {}

  // ---- collision checks & end-run handling ----
  if (gameState !== 'gameover') {
    try { if (typeof checkMorcegoCollision === 'function') checkMorcegoCollision(); } catch (e) {}
    try { if (typeof checkSerraCollision === 'function') checkSerraCollision(); } catch (e) {}
    try { if (typeof checkCerrasCollision === 'function') checkCerrasCollision(); } catch (e) {}
    try { if (typeof checkVoidFall === 'function') checkVoidFall(); } catch (e) {}
    try { if (typeof checkEnemyCollision === 'function') checkEnemyCollision(); } catch (e) {}
  } else {
    // store record depth on gameover
    try {
        const record = Number(PERSISTED_RECORD_DEPTH) || 0;
        if (Math.floor(depthPoints) > record) {
          const newVal = Math.floor(depthPoints);
          PERSISTED_RECORD_DEPTH = newVal;
          try { saveRecordDepthToDisk(newVal); } catch (e) {}
        }
    } catch (e) {}
  }
}

function gameOver() {
  if(gameState === 'gameover') return;
    gameState = 'gameover';
    isGameOver = true;
  // reduz volume da gameplay_music
  try { AudioManager && typeof AudioManager.setMusicVolume === 'function' && AudioManager.setMusicVolume(AudioManager.getGameoverMusicVolume()); } catch (e) {}
    // toca som de gameover
    try { AudioManager && typeof AudioManager.play === 'function' && AudioManager.play('gameover_sfx'); } catch (e) {}
    keys = {};
    reachedEndGame = false; 
    // If the player used a saved-start item this run, consuming it should remove the
    // global saved depth for everyone (one died with it -> all lose it).
    try {
      if (currentRunUsedSavedStart && _charData && _charData.__global && _charData.__global.savedStartDepth) {
        delete _charData.__global.savedStartDepth;
      }
    } catch (e) {}
    // clear runtime flag
    currentRunUsedSavedStart = false;
}