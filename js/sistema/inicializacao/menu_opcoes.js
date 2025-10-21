// Options menu module: creates a panel to the right of the main menu
(function(){
  const SETTINGS_FILENAME = 'dungeons_edge_settings.json';
  const SAVE_FOLDER = 'dungeons edge save game';

  const defaults = {
    musicVolume: (typeof AudioManager !== 'undefined' && typeof AudioManager.getDefaultMusicVolume === 'function') ? AudioManager.getDefaultMusicVolume() : 0.6,
    sfxVolume: 1,
    // default keybindings (display only for now)
    keys: {
      esquerda: 'A,seta para esquerda',
      direita: 'D,seta para direita',
      pular: 'W,seta para cima,espaço',
      especial: 'Shift',
      pausar: 'Esc,P'
    }
  };

  let settings = Object.assign({}, defaults);
  let panel = null;
  let isOpen = false;
  let _keyboardCaptureHandler = null;

  async function saveToDisk(obj) {
    const str = JSON.stringify(obj);
    try {
      if (typeof Neutralino !== 'undefined' && Neutralino.os && typeof Neutralino.os.getPath === 'function' && Neutralino.filesystem && typeof Neutralino.filesystem.writeFile === 'function') {
        const docPath = await Neutralino.os.getPath('documents');
        const sep = (docPath.endsWith('/') || docPath.endsWith('\\')) ? '' : '\\';
        const folderPath = `${docPath}${sep}${SAVE_FOLDER}`;
        try { await Neutralino.filesystem.createDirectory(folderPath); } catch (e) {}
        const filePath = `${folderPath}${folderPath.endsWith('/') || folderPath.endsWith('\\') ? '' : '\\'}${SETTINGS_FILENAME}`;
        await Neutralino.filesystem.writeFile(filePath, str);
        try { if (typeof isDebugMode !== 'undefined' && isDebugMode) console.log('[Options] saved to', filePath); } catch (e) {}
        return;
      }
    } catch (e) {}
    try { localStorage.setItem('dungeons_edge_settings', str); } catch (e) {}
  }

  async function loadFromDisk() {
    try {
      if (typeof Neutralino !== 'undefined' && Neutralino.os && typeof Neutralino.os.getPath === 'function' && Neutralino.filesystem && typeof Neutralino.filesystem.readFile === 'function') {
        const docPath = await Neutralino.os.getPath('documents');
        const sep = (docPath.endsWith('/') || docPath.endsWith('\\')) ? '' : '\\';
        const folderPath = `${docPath}${sep}${SAVE_FOLDER}`;
        const filePath = `${folderPath}${folderPath.endsWith('/') || folderPath.endsWith('\\') ? '' : '\\'}${SETTINGS_FILENAME}`;
        try {
          const content = await Neutralino.filesystem.readFile(filePath);
          if (content) return JSON.parse(content.toString());
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {}
    try {
      const raw = localStorage.getItem('dungeons_edge_settings');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function applySettingsToRuntime(obj) {
    try { if (obj && typeof obj.musicVolume === 'number' && AudioManager && typeof AudioManager.setMusicVolume === 'function') AudioManager.setMusicVolume(Number(obj.musicVolume)); } catch (e) {}
    try { if (obj && typeof obj.sfxVolume === 'number' && AudioManager && typeof AudioManager.setSfxVolume === 'function') AudioManager.setSfxVolume(Number(obj.sfxVolume)); } catch (e) {}
  }

  function createPanel() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'optionsPanel';
    panel.style.position = 'absolute';
    panel.style.width = '320px';
    panel.style.maxWidth = '38vw';
    panel.style.background = 'rgba(12,12,12,0.95)';
    panel.style.color = 'white';
    panel.style.border = '2px solid rgba(255,255,255,0.08)';
    panel.style.borderRadius = '8px';
    panel.style.padding = '14px';
    panel.style.boxShadow = '0 8px 40px rgba(0,0,0,0.6)';
    panel.style.zIndex = '10';
    panel.style.opacity = '0';
    panel.style.transition = 'opacity 260ms ease, transform 260ms ease';
    panel.style.transform = 'translateX(8px)';

    // close X
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.style.position = 'absolute';
    closeBtn.style.right = '8px';
    closeBtn.style.top = '8px';
    closeBtn.style.background = 'transparent';
    closeBtn.style.border = 'none';
    closeBtn.style.color = 'white';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.cursor = 'pointer';
    closeBtn.addEventListener('click', () => { toggle(); });
    panel.appendChild(closeBtn);

    // add focus-friendly class behavior for keyboard users
    function addFocusBehavior(el) {
      try {
        el.tabIndex = el.tabIndex >= 0 ? el.tabIndex : 0;
        el.addEventListener('focus', () => el.classList.add('kbd-focused'));
        el.addEventListener('blur', () => el.classList.remove('kbd-focused'));
      } catch (e) {}
    }
    addFocusBehavior(closeBtn);

    const title = document.createElement('div');
    title.textContent = 'configurações';
    title.style.fontSize = '18px';
    title.style.marginBottom = '8px';
    title.style.fontFamily = "'PixelFont', monospace";
    panel.appendChild(title);

    // music slider
    const musicLabel = document.createElement('label');
    musicLabel.textContent = 'Música';
    musicLabel.style.display = 'block';
    musicLabel.style.marginTop = '8px';
    panel.appendChild(musicLabel);
    const musicRange = document.createElement('input');
    musicRange.type = 'range';
    musicRange.min = '0';
    musicRange.max = '1';
    musicRange.step = '0.01';
    musicRange.style.width = '100%';
    musicRange.value = settings.musicVolume;
    musicRange.addEventListener('input', (e) => {
      const v = Number(e.target.value);
      settings.musicVolume = v;
      applySettingsToRuntime(settings);
      saveToDisk(settings);
    });
    panel.appendChild(musicRange);
  addFocusBehavior(musicRange);
  // expose music control reference so callers (open()) can focus it immediately
  try { panel.musicRangeRef = musicRange; } catch (e) {}

    // sfx slider
    const sfxLabel = document.createElement('label');
    sfxLabel.textContent = 'Efeitos (SFX)';
    sfxLabel.style.display = 'block';
    sfxLabel.style.marginTop = '8px';
    panel.appendChild(sfxLabel);
    const sfxRange = document.createElement('input');
    sfxRange.type = 'range';
    sfxRange.min = '0';
    sfxRange.max = '1';
    sfxRange.step = '0.01';
    sfxRange.style.width = '100%';
    sfxRange.value = settings.sfxVolume;
    sfxRange.addEventListener('input', (e) => {
      const v = Number(e.target.value);
      settings.sfxVolume = v;
      applySettingsToRuntime(settings);
      // play a small select sound for feedback if available
      try { if (AudioManager && typeof AudioManager.play === 'function') AudioManager.play('select_sfx', { volume: v }); } catch (e) {}
      saveToDisk(settings);
    });
    panel.appendChild(sfxRange);
  addFocusBehavior(sfxRange);

    // keys display
    const keysTitle = document.createElement('div');
    keysTitle.textContent = 'Teclas padrão';
    keysTitle.style.marginTop = '10px';
    keysTitle.style.fontSize = '14px';
    panel.appendChild(keysTitle);
    const keysList = document.createElement('div');
    keysList.style.fontFamily = "'PixelFont', monospace";
    keysList.style.fontSize = '13px';
    keysList.style.marginTop = '6px';
    for (const k in defaults.keys) {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.padding = '2px 0';
      const left = document.createElement('div'); left.textContent = k; left.style.opacity = '0.9';
      const right = document.createElement('div'); right.textContent = defaults.keys[k]; right.style.opacity = '0.9';
      row.appendChild(left); row.appendChild(right);
      keysList.appendChild(row);
    }
  panel.appendChild(keysList);

    // restore defaults (styled to match the options panel)
    const restore = document.createElement('button');
    restore.textContent = 'Restaurar padrões';
    restore.style.marginTop = '12px';
    restore.style.padding = '10px 14px';
    restore.style.border = '1px solid rgba(255,255,255,0.08)';
    restore.style.cursor = 'pointer';
    restore.style.background = 'linear-gradient(to right, rgba(255,255,255,0.04), rgba(255,255,255,0.02))';
    restore.style.color = 'white';
    restore.style.borderRadius = '6px';
    restore.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
    restore.style.transition = 'transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease';
    restore.style.fontFamily = "'PixelFont', monospace";
    restore.addEventListener('mouseover', function() {
      restore.style.transform = 'translateY(-2px)';
      restore.style.boxShadow = '0 8px 18px rgba(0,0,0,0.5)';
    });
    restore.addEventListener('mouseout', function() {
      restore.style.transform = 'translateY(0)';
      restore.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
    });
    restore.addEventListener('click', () => {
      settings = Object.assign({}, defaults);
      musicRange.value = settings.musicVolume;
      sfxRange.value = settings.sfxVolume;
      applySettingsToRuntime(settings);
      saveToDisk(settings);
    });
    panel.appendChild(restore);
    addFocusBehavior(restore);

    // Add keyboard navigation inside the panel: Tab works naturally; ArrowUp/Down move between sliders and buttons
    panel.addEventListener('keydown', (e) => {
      try {
        const active = document.activeElement;
        const focusables = panel.querySelectorAll('button, input');
        const arr = Array.prototype.slice.call(focusables);
        const idx = arr.indexOf(active);
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const next = arr[(idx + 1) % arr.length]; next && next.focus();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = arr[(idx - 1 + arr.length) % arr.length]; prev && prev.focus();
        }
      } catch (e) {}
    });

    document.body.appendChild(panel);
    // ensure there's a visible style for focused (kbd) elements if not already present
    try {
      if (!document.getElementById('options-kbd-styles')) {
        const st = document.createElement('style');
        st.id = 'options-kbd-styles';
        st.textContent = ".kbd-focused{box-shadow:0 0 0 4px rgba(255,255,255,0.08);outline:none;transform:translateY(-1px);}";
        document.head.appendChild(st);
      }
    } catch (e) {}
    return panel;
  }

  async function init() {
    const loaded = await loadFromDisk();
    if (loaded) settings = Object.assign({}, defaults, loaded);
    applySettingsToRuntime(settings);
  }

  function positionPanelRelativeToMenu(menuEl) {
    try {
      const p = createPanel();
      const rect = (menuEl && typeof menuEl.getBoundingClientRect === 'function') ? menuEl.getBoundingClientRect() : null;
      if (rect) {
        const left = rect.right + 12; // 12px gap
        const top = Math.max(8, rect.top - 400);
        p.style.left = left + 'px';
        p.style.top = top + 'px';
      } else {
        // fallback: align right side of screen
        p.style.right = '6vw';
        p.style.top = '10vh';
      }
      // animate in
      requestAnimationFrame(() => {
        p.style.opacity = '1';
        p.style.transform = 'translateX(0)';
      });
    } catch (e) {}
  }

  function open(menuEl) {
    if (isOpen) return;
    createPanel();
    positionPanelRelativeToMenu(menuEl || document.getElementById('menu'));
  // attach keyboard capture so only the options panel receives keyboard commands
  attachKeyboardCapture();
    isOpen = true;
    // focus the music slider so it is highlighted on open
    try {
      requestAnimationFrame(() => {
        try {
          if (panel && panel.musicRangeRef && typeof panel.musicRangeRef.focus === 'function') {
            panel.musicRangeRef.focus();
            // ensure class is applied in case focus doesn't trigger immediately
            panel.musicRangeRef.classList.add('kbd-focused');
          }
        } catch (e) {}
      });
    } catch (e) {}
  }

  function close() {
    if (!isOpen || !panel) return;
    try {
      panel.style.opacity = '0';
      panel.style.transform = 'translateX(8px)';
      setTimeout(() => {
        try { if (panel && panel.parentNode) panel.parentNode.removeChild(panel); } catch (e) {}
        panel = null;
      }, 260);
    } catch (e) {}
  // detach keyboard capture when panel closes
  detachKeyboardCapture();
    isOpen = false;
  }

  function toggle(menuEl) {
    if (isOpen) close(); else open(menuEl);
  }

  // --- keyboard capture helpers ---
  function attachKeyboardCapture() {
    try {
      if (_keyboardCaptureHandler) return; // already attached
      _keyboardCaptureHandler = function(e) {
        try {
          // prevent other parts of the app from handling keyboard while options is open
          e.stopImmediatePropagation();
          e.stopPropagation();
          // Allow default behavior for form-like inputs (e.g., text input) inside panel
          const active = document.activeElement;
          const insidePanel = panel && (panel === active || panel.contains(active));
          // If focus is not inside panel, place it on the first focusable control
          if (!insidePanel) {
            const focusables = panel ? panel.querySelectorAll('button, input') : [];
            if (focusables && focusables.length) {
              focusables[0].focus();
            }
          }

          // If pressed keys should be handled by panel controls, handle common keys
          const key = e.key;
          if (key === 'Escape') {
            // close panel on Escape
            try { toggle(); } catch (err) {}
            return;
          }
          // Navigate focus inside panel with arrows
          if (key === 'ArrowDown' || key === 'ArrowRight') {
            e.preventDefault();
            const focusables = panel.querySelectorAll('button, input');
            const arr = Array.prototype.slice.call(focusables);
            const idx = arr.indexOf(document.activeElement);
              if (key === 'ArrowRight' && document.activeElement && document.activeElement.type === 'range') {
                // Aumenta o valor do slider
                const el = document.activeElement;
                let step = Number(el.step) || 0.01;
                let max = Number(el.max) || 1;
                let val = Math.min(max, Number(el.value) + step);
                el.value = val;
                el.dispatchEvent(new Event('input', { bubbles: true }));
              } else {
                const next = arr[(idx + 1) % arr.length]; if (next) next.focus();
              }
            return;
          }
          if (key === 'ArrowUp' || key === 'ArrowLeft') {
            e.preventDefault();
            const focusables = panel.querySelectorAll('button, input');
            const arr = Array.prototype.slice.call(focusables);
            const idx = arr.indexOf(document.activeElement);
              if (key === 'ArrowLeft' && document.activeElement && document.activeElement.type === 'range') {
                // Diminui o valor do slider
                const el = document.activeElement;
                let step = Number(el.step) || 0.01;
                let min = Number(el.min) || 0;
                let val = Math.max(min, Number(el.value) - step);
                el.value = val;
                el.dispatchEvent(new Event('input', { bubbles: true }));
              } else {
                const prev = arr[(idx - 1 + arr.length) % arr.length]; if (prev) prev.focus();
              }
            return;
          }
          if (key === 'Enter' || key === ' ') {
            e.preventDefault();
            // Activate focused element if any
            try { const active = document.activeElement; if (active && typeof active.click === 'function') active.click(); } catch (err) {}
            return;
          }
        } catch (err) {}
      };
      // Use capture phase so we interpose before other listeners
      window.addEventListener('keydown', _keyboardCaptureHandler, true);
    } catch (e) {}
  }

  function detachKeyboardCapture() {
    try {
      if (!_keyboardCaptureHandler) return;
      window.removeEventListener('keydown', _keyboardCaptureHandler, true);
      _keyboardCaptureHandler = null;
    } catch (e) {}
  }

  // expose API
  window.OptionsMenu = {
    init, open, close, toggle, getSettings: () => Object.assign({}, settings)
  };

  // auto-init load settings
  try { init(); } catch (e) {}

})();
