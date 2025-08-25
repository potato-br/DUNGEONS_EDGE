// Simple AudioManager: loads audio assets, exposes play/stop/mute and music management
var AudioManager = (function () {
  const assets = {};
  let musicAudio = null;
  // centralized default volume configuration (single source of truth)
  let DEFAULT_MUSIC_VOLUME = 0.6;
  let DEFAULT_AMBIENT_MULTIPLIER = 0.1; // ambient volume = music * multiplier by default
  let DEFAULT_PAUSED_MUSIC_VOLUME = 0.25;
  let DEFAULT_GAMEOVER_MUSIC_VOLUME = 0.1;
  let musicVolume = DEFAULT_MUSIC_VOLUME;
  let sfxVolume = 1;
  let muted = false;
  // AudioContext for modern autoplay policies; created lazily
  let audioContext = null;
  let _attachedGestureResume = false;

  function getAudioContext() {
    try {
      if (audioContext) return audioContext;
      const C = (typeof window !== 'undefined') ? (window.AudioContext || window.webkitAudioContext) : null;
      if (!C) return null;
      audioContext = new C();
      return audioContext;
    } catch (e) { return null; }
  }

  function tryResumeAudioContext() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        try { ctx.resume().catch(()=>{}); } catch (e) {}
      }
    } catch (e) {}
  }

  function attachUserGestureResume() {
    try {
      if (_attachedGestureResume) return;
      _attachedGestureResume = true;
      if (typeof window === 'undefined') return;
      const handler = function onUserGesture() {
        tryResumeAudioContext();
      };
      window.addEventListener('pointerdown', handler, { once: true, capture: true });
      window.addEventListener('keydown', handler, { once: true, capture: true });
    } catch (e) {}
  }

  function load(name, src, opts = {}) {
    const a = new Audio(src);
    a.preload = 'auto';
    a.loop = !!opts.loop;
    a.volume = typeof opts.volume === 'number' ? opts.volume : (opts.loop ? musicVolume : sfxVolume);
    assets[name] = a;
    return a;
  }

  function play(name, options = {}) {
    if (muted) return null;
    const a = assets[name];
    if (!a) return null;
    try {
  // ensure AudioContext resumed or user-gesture handler attached before attempting play
  tryResumeAudioContext();
  attachUserGestureResume();
      const restart = options.restart !== false;
      // If caller requests no restart and audio already playing, just return the element
      if (!restart && !a.paused) return a;
      // Prevent concurrent play() calls on the same element
      if (a.__isStarting) return a;
      if (restart) {
        try { a.currentTime = 0; } catch (e) {}
      }
      a.volume = typeof options.volume === 'number' ? options.volume : a.volume;
      a.__isStarting = true;
      const p = a.play();
      // handle promise for modern browsers and clear starting flag
      if (p && typeof p.then === 'function') {
        p.then(() => { try { a.__isStarting = false; } catch (e) {} })
         .catch(() => { try { a.__isStarting = false; } catch (e) {} });
      } else {
        // no promise available; clear flag shortly after
        setTimeout(() => { try { a.__isStarting = false; } catch (e) {} }, 50);
      }
      return a;
    } catch (e) { return null; }
  }

  function stop(name) {
    const a = assets[name];
    if (!a) return;
    try { a.pause(); a.currentTime = 0; } catch (e) {}
  }

  function playMusic(name, options = {}) {
  if (typeof isDebugMode !== 'undefined' && isDebugMode) console.log('[AudioManager] playMusic called:', name, options, { musicAudio });
    const FADE_DEFAULT = 600; // ms
    const fadeVolume = (audio, target, duration = FADE_DEFAULT, onComplete) => {
      if (!audio) { if (onComplete) onComplete(); return; }
      try {
        const start = performance.now();
        const from = typeof audio.volume === 'number' ? audio.volume : 1;
        const d = Math.max(1, duration);
        const step = () => {
          const now = performance.now();
          const t = Math.min(1, (now - start) / d);
          try { audio.volume = from + (target - from) * t; } catch (e) {}
          if (t < 1) requestAnimationFrame(step);
          else if (onComplete) onComplete();
        };
        requestAnimationFrame(step);
      } catch (e) { if (onComplete) onComplete(); }
    };

    const duration = FADE_DEFAULT;
    if (!assets[name]) return;
    // if switching music, crossfade old -> new
    if (musicAudio && musicAudio !== assets[name]) {
      const old = musicAudio;
      // start new music at 0 volume but don't interrupt old immediately
      const next = assets[name];
      // allow caller to override looping behavior (for single-play tracks use loop:false)
      next.loop = (typeof options.loop === 'boolean') ? options.loop : true;
      try { next.volume = 0; } catch (e) {}
      musicAudio = next;
      if (!muted) {
        try { play(name); } catch (e) {}
        // fade out old and fade in new
        fadeVolume(old, 0, duration, () => { try { old.pause(); old.currentTime = 0; } catch (e) {} });
        fadeVolume(next, musicVolume, duration);
      }
      else {
        // just set musicAudio to next but don't play when muted
        try { next.currentTime = 0; } catch (e) {}
      }
      return;
    }

    // same music or no previous music: ensure it's playing with proper volume
  // If it's already the current music and already playing, do nothing.
  if (musicAudio === assets[name]) {
    try {
      if (!musicAudio.paused) return; // already playing
      // if paused, resume with fade-in behavior
      try { resumeMusic(); } catch (e) { if (!muted) play(name, { restart: false }); }
      return;
    } catch (e) {}
  }
  musicAudio = assets[name];
  musicAudio.loop = (typeof options.loop === 'boolean') ? options.loop : true;
    try { musicAudio.volume = musicVolume; } catch (e) {}
    if (!muted) play(name);
  }

  function stopMusic() {
  if (typeof isDebugMode !== 'undefined' && isDebugMode) console.log('[AudioManager] stopMusic called', { musicAudio });
    if (!musicAudio) return;
    const FADE_OUT = 400;
    const audioToStop = musicAudio;
    const fadeVolume = (audio, target, duration = FADE_OUT, onComplete) => {
      if (!audio) { if (onComplete) onComplete(); return; }
      try {
        const start = performance.now();
        const from = typeof audio.volume === 'number' ? audio.volume : 1;
        const d = Math.max(1, duration);
        const step = () => {
          const now = performance.now();
          const t = Math.min(1, (now - start) / d);
          try { audio.volume = from + (target - from) * t; } catch (e) {}
          if (t < 1) requestAnimationFrame(step);
          else if (onComplete) onComplete();
        };
        requestAnimationFrame(step);
      } catch (e) { if (onComplete) onComplete(); }
    };
    fadeVolume(audioToStop, 0, FADE_OUT, () => { try { audioToStop.pause(); audioToStop.currentTime = 0; } catch (e) {} });
    musicAudio = null;
  }

  function pauseMusic() {
  if (typeof isDebugMode !== 'undefined' && isDebugMode) console.log('[AudioManager] pauseMusic called', { musicAudio });
    try {
      if (!musicAudio) return;
      // if already paused, noop
      if (musicAudio.paused) return;
      // smooth fade to 0 then pause (preserve currentTime so resume continues)
      try {
        // cancel any previous fade token so concurrent fades don't clash
        const token = {};
        musicAudio.__fadeToken = token;
        if (musicAudio.__isFading) {
          // allow ongoing fade to be cancelled by replacing token
        }
        musicAudio.__isFading = true;
        const start = performance.now();
        const from = typeof musicAudio.volume === 'number' ? musicAudio.volume : musicVolume;
        const dur = 300; // ms fade to pause
        const step = () => {
          // abort if a newer fade replaced this one
          if (musicAudio.__fadeToken !== token) {
            musicAudio.__isFading = false;
            return;
          }
          const now = performance.now();
          const t = Math.min(1, (now - start) / dur);
          try { musicAudio.volume = from * (1 - t); } catch (e) {}
          if (t < 1) requestAnimationFrame(step);
          else {
            try { musicAudio.pause(); } catch (e) {}
            // only clear flags if this fade is still the active one
            if (musicAudio.__fadeToken === token) {
              musicAudio.__isFading = false;
              musicAudio.__fadeToken = null;
            }
          }
        };
        requestAnimationFrame(step);
      } catch (e) {
        try { musicAudio.pause(); } catch (e) {}
        musicAudio.__isFading = false;
        musicAudio.__fadeToken = null;
      }
    } catch (e) {}
  }

  function resumeMusic() {
  if (typeof isDebugMode !== 'undefined' && isDebugMode) console.log('[AudioManager] resumeMusic called', { musicAudio });
    try {
      if (musicAudio) {
        try {
          // ensure volume restored
          // if we paused via fade, restore to saved musicVolume but start from 0 to fade in
          // if a pause fade was in progress, cancel it by replacing the token
          try { if (musicAudio.__fadeToken) musicAudio.__fadeToken = null; } catch (e) {}
          musicAudio.volume = 0;
        } catch (e) {}
  // ensure audio context resumed before resuming
  tryResumeAudioContext();
  attachUserGestureResume();
  if (musicAudio.paused) {
          try {
            if (musicAudio.__isStarting) return;
            musicAudio.__isStarting = true;
            const p = musicAudio.play();
            if (p && typeof p.then === 'function') {
              p.then(() => { try { musicAudio.__isStarting = false; } catch (e) {} }).catch(() => { try { musicAudio.__isStarting = false; } catch (e) {} });
            } else {
              setTimeout(() => { try { musicAudio.__isStarting = false; } catch (e) {} }, 50);
            }
            // fade in to musicVolume
            try {
              // cancel any existing fade token and replace with this fade
              const token = {};
              musicAudio.__fadeToken = token;
              musicAudio.__isFading = true;
              const start = performance.now();
              const from = 0;
              const to = musicVolume;
              const dur = 300;
              const step = () => {
                if (musicAudio.__fadeToken !== token) {
                  musicAudio.__isFading = false;
                  return;
                }
                const now = performance.now();
                const t = Math.min(1, (now - start) / dur);
                try { musicAudio.volume = from + (to - from) * t; } catch (e) {}
                if (t < 1) requestAnimationFrame(step);
                else {
                  if (musicAudio.__fadeToken === token) {
                    musicAudio.__isFading = false;
                    musicAudio.__fadeToken = null;
                  }
                }
              };
              requestAnimationFrame(step);
            } catch (e) { musicAudio.__isFading = false; musicAudio.__fadeToken = null; }
          } catch (e) { try { musicAudio.__isStarting = false; } catch (er) {} }
        }
      }
    } catch (e) {}
  }

  function setMuted(v) { muted = !!v; if (muted) { try { Object.values(assets).forEach(a => a.pause()); } catch (e) {} } }
  function isMuted() { return muted; }
  function setMusicVolume(v) { musicVolume = v; if (musicAudio) musicAudio.volume = musicVolume; }
  function setSfxVolume(v) { sfxVolume = v; }

  // getters/setters for centralized defaults (used by other modules to harmonize levels)
  function getDefaultMusicVolume() { return DEFAULT_MUSIC_VOLUME; }
  function setDefaultMusicVolume(v) { DEFAULT_MUSIC_VOLUME = Number(v) || DEFAULT_MUSIC_VOLUME; musicVolume = DEFAULT_MUSIC_VOLUME; if (musicAudio) musicAudio.volume = musicVolume; }

  function getDefaultAmbientMultiplier() { return DEFAULT_AMBIENT_MULTIPLIER; }
  function setDefaultAmbientMultiplier(v) { DEFAULT_AMBIENT_MULTIPLIER = Number(v) || DEFAULT_AMBIENT_MULTIPLIER; }

  function getPausedMusicVolume() { return DEFAULT_PAUSED_MUSIC_VOLUME; }
  function setPausedMusicVolume(v) { DEFAULT_PAUSED_MUSIC_VOLUME = Number(v) || DEFAULT_PAUSED_MUSIC_VOLUME; }

  function getGameoverMusicVolume() { return DEFAULT_GAMEOVER_MUSIC_VOLUME; }
  function setGameoverMusicVolume(v) { DEFAULT_GAMEOVER_MUSIC_VOLUME = Number(v) || DEFAULT_GAMEOVER_MUSIC_VOLUME; }

  // Play a sound and perform a quick fade-out (useful for short effects like void fall)
  function playWithFade(name, fadeOutMs = 300, options = {}) {
    if (muted) return null;
    const asset = assets[name];
    if (!asset) return null;
    try {
      const src = asset.src || (asset.currentSrc || (asset.getAttribute && asset.getAttribute('src')));
      const a = src ? new Audio(src) : asset;
      a.loop = !!options.loop;
      // allow override volume for this play
      a.volume = typeof options.volume === 'number' ? options.volume : a.volume;
      const p = a.play();
      if (p && typeof p.then === 'function') p.catch(()=>{});

      // quick fade-out and cleanup
      try {
        const start = performance.now();
        const from = typeof a.volume === 'number' ? a.volume : 1;
        const dur = Math.max(1, Number(fadeOutMs) || 1);
        const step = () => {
          const now = performance.now();
          const t = Math.min(1, (now - start) / dur);
          try { a.volume = from * (1 - t); } catch (e) {}
          if (t < 1) requestAnimationFrame(step);
          else {
            try { a.pause(); a.currentTime = 0; } catch (e) {}
          }
        };
        requestAnimationFrame(step);
      } catch (e) {}

      return a;
    } catch (e) { return null; }
  }

  // Ambient layer helpers: allow playing multiple ambient tracks alongside music
  function playAmbient(name, options = {}) {
    if (muted) return null;
    const a = assets[name];
    if (!a) return null;
    try {
      a.loop = true;
      if (typeof options.volume === 'number') a.volume = options.volume;
      // default to restart unless explicitly disabled
      const restart = options.restart !== false;
      return play(name, { restart, volume: a.volume });
    } catch (e) { return null; }
  }

  function stopAmbient(name) {
    try { stop(name); } catch (e) {}
  }

  function stopAllAmbients() {
    try {
      Object.keys(assets).forEach(k => {
        if (k && k.toLowerCase().startsWith('ambience')) {
          try { stop(k); } catch (e) {}
        }
      });
    } catch (e) {}
  }

  function setAmbientVolume(name, v) {
    try {
      if (assets[name]) assets[name].volume = v;
    } catch (e) {}
  }

  // convenience loader that registers default assets used by the game
  function loadDefaults() {
    // Put your audio files in media/audio/ and name accordingly.
  load('shop_music', 'media/audio/shop_music.ogg', { loop: true, volume: 0.8 });
  load('gameover_sfx', 'media/audio/gameover_sfx.ogg', { loop: false, volume: 0.3 });
  // footstep sound used when player walks; default volume kept low
  load('footstep', 'media/audio/footstep.ogg', { loop: false, volume: 0.3 });
  // jump sound effect
  load('jump_sfx', 'media/audio/jump_sfx.ogg', { loop: false, volume: 0.2 });
  // gameplay music (plays during 'jogando')
  load('gameplay_music', 'media/audio/gameplay_music.ogg', { loop: true, volume: 0.5 });
  load('gameplay_music_1', 'media/audio/gameplay_music_1.ogg', { loop: true, volume: 0.5 });
  load('gameplay_music_2', 'media/audio/gameplay_music_2.ogg', { loop: true, volume: 0.5 });
    // spider sound effect
    load('spider_sfx', 'media/audio/spider_sfx.ogg', { loop: false, volume: 0.1 });
    // coin pickup sound effect
    load('coin_sfx', 'media/audio/coin_sfx.ogg', { loop: false, volume: 0.2 });
    // select item/option sound effect
    load('select_sfx', 'media/audio/select_sfx.ogg', { loop: false, volume: 0.4 });
    // typing/text sound effect for intro
    load('type_sfx', 'media/audio/type_sfx.ogg', { loop: false, volume: 0.2 });
  // dash sound (used by Errante and Ninja)
  load('dash_sfx', 'media/audio/dash_sfx.ogg', { loop: false, volume: 0.2 });
  // ninja smoke bomb sfx (placeholder uses dash_sfx file) — replace with a dedicated file at media/audio/ninja_smoke_sfx.ogg if available
  load('ninja_smoke_sfx', 'media/audio/ninja_smoke_sfx.ogg', { loop: false, volume: 0.22 });
  // ambient layers for gameplay
  load('ambience', 'media/audio/ambience.ogg', { loop: true, volume: 0.1 });
  // platform break sound effect (uses existing serra_sfx as placeholder; replace with media/audio/platform_break.ogg if you have one)
    load('platform_break_sfx', 'media/audio/platform_break_sfx.ogg', { loop: false, volume: 0.06});
  // shop ambient
  load('shop_ambience', 'media/audio/shop_ambience.ogg', { loop: true, volume: 0.3 });
  // saw / serra spawn sound (very very low volume)
  load('serra_sfx', 'media/audio/serra_sfx.ogg', { loop: false, volume: 0.01 });
  // void fall sound effect (player falls off screen) - reduced default volume
  load('void_sfx', 'media/audio/void_sfx.ogg', { loop: false, volume: 0.08 });
  // generic enemy death sound (used for morcego, aranha, slime) - lower default volume
  load('enemy_death_sfx', 'media/audio/enemy_death.ogg', { loop: false, volume: 0.04 });
  // knight specific SFXs
  load('knight_hit_sfx', 'media/audio/knight_hit_sfx.ogg', { loop: false, volume: 0.25 });
  load('knight_void_res_sfx', 'media/audio/knight_void_res_sfx.ogg', { loop: false, volume: 0.25 });
  // alias for generic player hit (uses existing spider asset as placeholder)
  load('player_hit_sfx', 'media/audio/player_hit_sfx.ogg', { loop: false, volume: 0.3 });
    // lunar aegis sfx
    load('knight_lunar_aegis_sfx', 'media/audio/knight_lunar_aegis_sfx.ogg', { loop: false, volume: 0.22 });
  // mage mystic devastation sfx
  load('mage_mystic_devastation_sfx', 'media/audio/mage_mystic_devastation_sfx.ogg', { loop: false, volume: 0.22 });
  load('mage_damage_mystic_devastation_sfx', 'media/audio/mage_damage_mystic_devastation_sfx.ogg', { loop: false, volume: 0.22 });
  load('slime_sfx', 'media/audio/slime_sfx.ogg', { loop: false, volume: 0.2 });
  }

  return {
    load, play, stop, playMusic, stopMusic, setMuted, isMuted, setMusicVolume, setSfxVolume,
    pauseMusic, resumeMusic,
  // ensureMusicPlaying will start or resume the named music idempotently
  ensureMusicPlaying: function(name, options) { try { if (!name) return; if (musicAudio === assets[name] && musicAudio && !musicAudio.paused) return; if (musicAudio === assets[name] && musicAudio && musicAudio.paused) return resumeMusic(); return playMusic(name, options); } catch (e) {} },
    // ambient controls
    playAmbient, stopAmbient, stopAllAmbients, setAmbientVolume,
    // defaults API
    getDefaultMusicVolume, setDefaultMusicVolume,
    getDefaultAmbientMultiplier, setDefaultAmbientMultiplier,
    getPausedMusicVolume, setPausedMusicVolume,
    getGameoverMusicVolume, setGameoverMusicVolume,
  loadDefaults, assets, playWithFade
  };
})();

function makeShuffledDeck(exclude) {
  try {
    const arr = HIGH_DEPTH_CHOICES.slice();
    if (exclude) {
      const idx = arr.indexOf(exclude);
      if (idx !== -1) arr.splice(idx, 1);
    }
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  } catch (e) {
    return HIGH_DEPTH_CHOICES.slice();
  }
}

function ensureDeckForRun(runToken, lastPlayed) {
  try {
    if (!shuffleDeckByRun[runToken] || !Array.isArray(shuffleDeckByRun[runToken]) || shuffleDeckByRun[runToken].length === 0) {
      shuffleDeckByRun[runToken] = makeShuffledDeck(lastPlayed);
  try { if (typeof isDebugMode !== 'undefined' && isDebugMode) console.log('[shuffle] initialized deck for run', runToken, shuffleDeckByRun[runToken]); } catch (e) {}
    }
  } catch (e) { shuffleDeckByRun[runToken] = makeShuffledDeck(lastPlayed); }
}

function drawNextFromDeck(runToken, lastPlayed) {
  try {
    ensureDeckForRun(runToken, lastPlayed);
    const deck = shuffleDeckByRun[runToken] || [];
    if (deck.length === 0) {
      // refill excluding lastPlayed to avoid immediate repeat
      shuffleDeckByRun[runToken] = makeShuffledDeck(lastPlayed);
    }
  const next = shuffleDeckByRun[runToken].pop();
  try { if (typeof isDebugMode !== 'undefined' && isDebugMode) console.log('[shuffle] draw next for run', runToken, { lastPlayed, next, remaining: shuffleDeckByRun[runToken].slice() }); } catch (e) {}
  return next;
  } catch (e) {
    // fallback to simple random
    try {
      const filtered = HIGH_DEPTH_CHOICES.filter(c => c !== lastPlayed);
      return filtered[Math.floor(Math.random() * filtered.length)];
    } catch (er) { return HIGH_DEPTH_CHOICES[0]; }
  }
}

// --- audio handler helpers for high-depth random music ---
function attachHighDepthEndedHandler(name) {
  if (typeof isDebugMode !== 'undefined' && isDebugMode) console.log('[AudioManager] attachHighDepthEndedHandler for', name);
  try {
  const assets = AudioManager && AudioManager.assets ? AudioManager.assets : {};
    const a = assets[name];
    if (!a) return;
    // remove any previous handler on this element
    try { if (a.__onEndedHandler) { a.removeEventListener('ended', a.__onEndedHandler); a.__onEndedHandler = null; } } catch (e) {}
  const handler = function onEnded() {
      try {
    // draw next from this run's shuffled deck (avoid repeats until deck exhausted)
    const lastPlayed = name;
    const next = drawNextFromDeck(CURRENT_RUN_TOKEN, lastPlayed);
        // cleanup this handler
        try { a.removeEventListener('ended', onEnded); } catch (e) {}
        a.__onEndedHandler = null;
        // set and play next (single run)
    try { selectedHighDepthMusicByRun[CURRENT_RUN_TOKEN] = next; } catch (e) {}
    try { if (AudioManager && typeof AudioManager.playMusic === 'function') AudioManager.playMusic(next, { loop: false }); } catch (e) {}
        // attach handler for the next track
        attachHighDepthEndedHandler(next);
      } catch (e) {}
    };
  a.__onEndedHandler = handler;
  a.addEventListener('ended', handler);
  } catch (e) {}
}

function removeHighDepthHandler(name) {
  try {
    const assets = AudioManager && AudioManager.assets ? AudioManager.assets : {};
    const a = assets[name];
    if (!a) return;
    try { if (a.__onEndedHandler) { a.removeEventListener('ended', a.__onEndedHandler); a.__onEndedHandler = null; } } catch (e) {}
    try { a.pause(); a.currentTime = 0; } catch (e) {}
  } catch (e) {}
}

function clearHighDepthSelection() {
  try {
  const sel = selectedHighDepthMusicByRun[CURRENT_RUN_TOKEN];
  if (sel) removeHighDepthHandler(sel);
  try { delete selectedHighDepthMusicByRun[CURRENT_RUN_TOKEN]; } catch (e) { selectedHighDepthMusicByRun[CURRENT_RUN_TOKEN] = null; }
  try { delete shuffleDeckByRun[CURRENT_RUN_TOKEN]; } catch (e) { shuffleDeckByRun[CURRENT_RUN_TOKEN] = null; }
  } catch (e) {}
}