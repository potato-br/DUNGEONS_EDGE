function setupMenuInicial(onStart) {
    const menu = document.getElementById('menu');
    const introVideo = document.getElementById('introVideo');
    const videoElement = document.getElementById('gameIntro');
    let videoStarted = false;
    let menuReady = false;
    let startKeyHandler = null;
    // Helper to reveal Start button with fade-in (used by click or Enter after title animation)
    function showStartButtonTrigger() {
        try {
            if (window.__startButtonShown) return;
            const startBtn = document.getElementById('startButton');
            if (startBtn) {
                // show button first with no transition, then apply animation after reflow
                try { startBtn.style.transition = 'none'; } catch (e) {}
                try { startBtn.style.opacity = '0'; } catch (e) {}
                try { startBtn.style.display = ''; } catch (e) {}
                // double requestAnimationFrame ensures display: '' is rendered before animation starts
                requestAnimationFrame(() => {
                    try { startBtn.style.transition = 'opacity 500ms ease'; } catch (e) {}
                    requestAnimationFrame(() => {
                        try { startBtn.style.opacity = '1'; } catch (e) {}
                    });
                });
                setTimeout(() => { try { startBtn.style.transition = ''; } catch (e) {} }, 600);
                window.__startButtonShown = true;
                // cleanup temporary listeners used while waiting for first click/Enter
                try { document.getElementById('menu').removeEventListener('click', showStartButtonTrigger); } catch (e) {}
                try { document.removeEventListener('keydown', showStartButtonKeyHandler); } catch (e) {}
            }
        } catch (e) {}
    }

    function showStartButtonKeyHandler(e) {
        if (e && (e.key === 'Enter' || e.code === 'Enter')) {
            try { e.preventDefault(); e.stopPropagation(); } catch (err) {}
            try { if (window.__titleAnimationComplete && !window.__startButtonShown) showStartButtonTrigger(); } catch (err) {}
        }
    }

    // Reveal menu background with fade — shared by click and keyboard paths
    function revealMenuBackground() {
        try {
            const mb = document.getElementById('menuBackground');
            if (mb) {
                // Skip if background has already been revealed (only reveal once during menu initial press)
                if (window.__menuBackgroundRevealed) return;
                
                // Cancel any pending timeout from previous call
                try { clearTimeout(mb._revealTimeout); } catch (e) {}
                // Clear any existing transition immediately
                try { mb.style.transition = ''; } catch (e) {}
                // Display and reset opacity
                mb.style.display = '';
                mb.style.opacity = '0';
                // Force reflow to apply opacity change before starting transition
                void mb.offsetHeight;
                // Now apply transition and animate
                try { mb.style.transition = 'opacity 600ms ease'; } catch (e) {}
                requestAnimationFrame(() => { try { mb.style.opacity = '1'; } catch (e) {} });
                // After fade completes, remove transition
                mb._revealTimeout = setTimeout(() => { try { mb.style.transition = ''; } catch (e) {} }, 700);
                
                // Mark background as revealed
                window.__menuBackgroundRevealed = true;
            }
        } catch (e) {}
    }

    menu.style.display = 'none';
    menu.style.opacity = '0';

    var canvas = document.getElementById('gameCanvas');

    document.body.style.backgroundImage = '';
    // keep the page black until the menu background is shown
    document.body.style.backgroundColor = '#000';

    // Hide menu background image until the user presses the Start button
    try {
        const mb = document.getElementById('menuBackground');
        if (mb) mb.style.display = 'none';
    } catch (e) {}

    function skipIntro(event) {
        if (event) event.preventDefault();
        try { if (event && typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation(); } catch (e) {}
        introVideo.style.display = 'none';

        menu.style.opacity = '0';
        menu.style.display = 'flex';

        // One-time title fade-in when menu first appears
        try {
            if (!window.__menuTitleFaded) {
                const mt = document.getElementById('menuTitle');
                if (mt) {
                    try { mt.style.transition = 'none'; } catch (e) {}
                    try { mt.style.opacity = '0'; } catch (e) {}
                    // force reflow to ensure opacity 0 is rendered before transition
                    requestAnimationFrame(() => {
                        try { mt.style.transition = 'opacity 700ms ease'; } catch (e) {}
                        requestAnimationFrame(() => {
                            try { mt.style.opacity = '1'; } catch (e) {}
                        });
                    });
                    setTimeout(() => {
                        try { mt.style.transition = ''; } catch (e) {}
                        // mark animation as complete
                        try { window.__titleAnimationComplete = true; } catch (e) {}
                        // add listener to show button on first click after animation
                        try {
                            // while waiting for the first click after the title animation,
                            // allow both mouse click and Enter key to reveal the Start button
                            try { document.getElementById('menu').addEventListener('click', showStartButtonTrigger); } catch (e) {}
                            try { document.addEventListener('keydown', showStartButtonKeyHandler); } catch (e) {}
                        } catch (e) {}
                        // Auto-show button after 1 second of inactivity
                        setTimeout(() => {
                            try { showStartButtonTrigger(); } catch (e) {}
                        }, 1000);
                    }, 800);
                }
                window.__menuTitleFaded = true;
            }
        } catch (e) {}

        // Apply final visual state immediately (remove transition/animation)
        try {
            menu.style.transition = '';
            menu.style.transform = 'scale(1) rotate(0deg) translateY(0)';
            menu.style.opacity = '1';
            menu.style.filter = 'brightness(1) blur(0px)';

            var menuBg = document.getElementById('menuBackground');
            var startBtn = document.getElementById('startButton');

            if (menuBg) {
                menuBg.style.transition = '';
                menuBg.style.opacity = '1';
                menuBg.style.transform = 'scale(1)';
            }

            if (startBtn) {
                startBtn.style.transition = '';
                startBtn.style.opacity = '1';
                startBtn.style.transform = 'translateY(0)';
                
            }

            menuReady = true;
        } catch (e) {}

        // pause intro video and remove temporary skip listeners used during intro
        try { videoElement.pause(); } catch (e) {}
        try { document.removeEventListener('keydown', skipIntro); } catch (e) {}
        try { document.removeEventListener('click', startVideoOrSkip); } catch (e) {}
        try { videoElement.removeEventListener('ended', skipIntro); } catch (e) {}
    }

    function startVideoOrSkip(event) {
        if (!videoStarted) {
            videoStarted = true;
            videoElement.play().catch(error => {
                skipIntro();
            });
        } else {
            skipIntro(event);
        }
    }

    // attach temporary listeners so the user can skip the intro
    document.addEventListener('keydown', skipIntro);
    document.addEventListener('click', startVideoOrSkip);
    videoElement.addEventListener('ended', skipIntro);

    const startGame = function() {
        if (!menuReady) return; 
        // ensure any menu overlays/listeners are fully cleaned before starting
        try { cleanupMenu(); } catch (e) {}
        // Extra safeguard: remove any stale keyboard handlers from menu
        try { 
            if (window.startOptionsKeyHandler) { 
                window.removeEventListener('keydown', window.startOptionsKeyHandler);
                delete window.startOptionsKeyHandler;
            }
        } catch (e) {}
    // If options panel is open, close it before starting
    try { if (window.OptionsMenu && typeof window.OptionsMenu.close === 'function') window.OptionsMenu.close(); } catch (e) {}
        // hide menu and show canvas
        menu.style.display = 'none';
        document.getElementById('gameCanvas').style.display = 'block';
        // Só troca para gameplay_music ao iniciar o jogo
        try {
            if (typeof AudioManager !== 'undefined' && AudioManager.stopMusic) {
                AudioManager.stopMusic();
            }
        } catch (e) {}
        if (typeof onStart === 'function') onStart();
    };

    // Remove menu-related overlays and keyboard handlers so nothing remains active during gameplay
    function cleanupMenu() {
        try { if (startKeyHandler) { window.removeEventListener('keydown', startKeyHandler); startKeyHandler = null; } } catch (e) {}
        try { 
            if (window.startOptionsKeyHandler) { 
                window.removeEventListener('keydown', window.startOptionsKeyHandler);
                try { delete window.startOptionsKeyHandler; } catch (e) {} 
            } 
        } catch (e) {}
        // extra safeguard: try to clean up any remaining slot selection handlers
        try { 
            const slotOverlay = document.getElementById('slotSelectionOverlay');
            if (slotOverlay && typeof slotOverlay._removeKeyboardNav === 'function') {
                slotOverlay._removeKeyboardNav();
            }
            if (slotOverlay && typeof slotOverlay._removeBlockEnter === 'function') {
                slotOverlay._removeBlockEnter();
            }
        } catch (e) {}
        try { const ids = ['startOptions','slotSelectionOverlay','loadOverlay']; ids.forEach(id => { const el = document.getElementById(id); if (el && el.parentNode) el.parentNode.removeChild(el); }); } catch (e) {}
        try { const sb = document.getElementById('startButton'); if (sb) { sb.style.opacity = '1'; } } catch (e) {}
    }

    // Neutralino-only helpers for storing the last used slot
    async function getLastSlot() {
        try {
            if (typeof Neutralino !== 'undefined' && Neutralino.os && typeof Neutralino.os.getPath === 'function' && Neutralino.filesystem && typeof Neutralino.filesystem.readFile === 'function') {
                try {
                    const docPath = await Neutralino.os.getPath('documents');
                    const sep = (docPath.endsWith('/') || docPath.endsWith('\\')) ? '' : '\\';
                    const folderPath = `${docPath}${sep}dungeons edge save game`;
                    const filePath = `${folderPath}${folderPath.endsWith('/') || folderPath.endsWith('\\') ? '' : '\\'}last_slot.txt`;
                    const content = await Neutralino.filesystem.readFile(filePath);
                    if (content) return Number(content.toString()) || null;
                } catch (e) {}
            }
        } catch (e) {}
        return null;
    }

    async function setLastSlot(idx) {
        try {
            if (typeof Neutralino !== 'undefined' && Neutralino.os && typeof Neutralino.os.getPath === 'function' && Neutralino.filesystem && typeof Neutralino.filesystem.writeFile === 'function') {
                try {
                    const docPath = await Neutralino.os.getPath('documents');
                    const sep = (docPath.endsWith('/') || docPath.endsWith('\\')) ? '' : '\\';
                    const folderPath = `${docPath}${sep}dungeons edge save game`;
                    try { await Neutralino.filesystem.createDirectory(folderPath); } catch (e) {}
                    const filePath = `${folderPath}${folderPath.endsWith('/') || folderPath.endsWith('\\') ? '' : '\\'}last_slot.txt`;
                    await Neutralino.filesystem.writeFile(filePath, String(idx));
                } catch (e) {}
            }
        } catch (e) {}
    }

    // Play menu music with fade-in
    function playMenuMusic() {
        try {
            if (typeof AudioManager === 'undefined') return;
            const name = 'menu_music';
            try {
                // Apply saved volumes
                try {
                    if (typeof OptionsMenu !== 'undefined' && OptionsMenu.getSettings) {
                        const ss = OptionsMenu.getSettings();
                        if (ss && typeof ss.musicVolume === 'number' && typeof AudioManager.setMusicVolume === 'function') {
                            try { AudioManager.setMusicVolume(Number(ss.musicVolume)); } catch (e) {}
                        }
                        if (ss && typeof ss.sfxVolume === 'number' && typeof AudioManager.setSfxVolume === 'function') {
                            try { AudioManager.setSfxVolume(Number(ss.sfxVolume)); } catch (e) {}
                        }
                    }
                } catch (e) {}
                // Start or ensure menu music is playing
                if (typeof AudioManager.playMusic === 'function') {
                    try { AudioManager.playMusic(name, { loop: true }); } catch (e) {}
                } else if (AudioManager.ensureMusicPlaying) {
                    try { AudioManager.ensureMusicPlaying(name, { loop: true }); } catch (e) {}
                }
                // Fade in the audio element from 0 -> target over 800ms
                try {
                    const a = AudioManager.assets && AudioManager.assets[name];
                    if (a) {
                        try { a.volume = 0; } catch (e) {}
                        let target = 0.6;
                        try {
                            if (typeof OptionsMenu !== 'undefined' && OptionsMenu.getSettings) {
                                const s = OptionsMenu.getSettings();
                                if (s && typeof s.musicVolume === 'number') target = Number(s.musicVolume);
                                else if (AudioManager && typeof AudioManager.getDefaultMusicVolume === 'function') target = AudioManager.getDefaultMusicVolume();
                            } else if (AudioManager && typeof AudioManager.getDefaultMusicVolume === 'function') {
                                target = AudioManager.getDefaultMusicVolume();
                            }
                            if (AudioManager && typeof AudioManager.setMusicVolume === 'function') {
                                try { AudioManager.setMusicVolume(target); } catch (e) {}
                            }
                        } catch (e) {}
                        const dur = 800;
                        const start = performance.now();
                        const step = (now) => {
                            const t = Math.min(1, (now - start) / dur);
                            try { a.volume = target * t; } catch (e) {}
                            if (t < 1) requestAnimationFrame(step);
                        };
                        requestAnimationFrame(step);
                    }
                } catch (e) {}
            } catch (e) {}
        } catch (e) {}
    }

    // Show a small two-option overlay: Novo Jogo (starts) and Opções (no-op for now)
    function showStartOptions() {
        // Play menu music when Start button is first pressed (only once)
        if (!window.__menuMusicPlayed) {
            try { playMenuMusic(); window.__menuMusicPlayed = true; } catch (e) {}
        }
        // block opening the options while the title animation hasn't completed
        if (!window.__titleAnimationComplete || !window.__startButtonShown) return;
        if (!menuReady) return;
        if (document.getElementById('startOptions')) return; // already open

        // fade out the start button for a nicer transition
        const startBtnEl = document.getElementById('startButton');
        const prevStartStyles = {};
        if (startBtnEl) {
            try {
                prevStartStyles.opacity = startBtnEl.style.opacity || '';
                prevStartStyles.transform = startBtnEl.style.transform || '';
                prevStartStyles.transition = startBtnEl.style.transition || '';
                // Remove transition/animation: apply final styles immediately
                try {
                    startBtnEl.style.transition = '';
                    startBtnEl.style.opacity = '0';
                    startBtnEl.style.transform = (prevStartStyles.transform ? prevStartStyles.transform + ' ' : '') + 'translateY(-8px) scale(0.98)';
                } catch (e) {}
            } catch (e) {}
        }

        const overlay = document.createElement('div');
        overlay.id = 'startOptions';
        overlay.style.position = 'absolute';
        // move options menu lower on the screen
        overlay.style.top = '65%';
        overlay.style.left = '50%';
        overlay.style.transform = 'translate(-50%, -50%)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.gap = '12px';
        overlay.style.padding = '18px';
        overlay.style.borderRadius = '10px';
        // Keep a subtle tint while the decorative image loads. The actual
        // decorative image is inserted as an <img> so you can fully control
        // its size and position via data attributes on the overlay element.
        overlay.style.backgroundColor = 'rgba(0,0,0,0.0)';
        overlay.style.backdropFilter = 'blur(0px)';
        overlay.style.zIndex = '5';
        // prevent decorative image from overflowing the rounded overlay
        overlay.style.overflow = '';
        overlay.style.opacity = '1';
        overlay.style.transition = '';
        overlay.style.transform = 'translate(-50%, -50%)';

        try {
            const overlayBgImg = document.createElement('img');
            // Default image path; change by setting overlay.dataset.bgSrc
            overlayBgImg.src = overlay.dataset.bgSrc || 'images/imagens de fundo/fundo do menuprincipal/fundo do menu.png';
            overlayBgImg.alt = '';
            overlayBgImg.style.position = 'absolute';
            // Position/size defaults can be overridden using data attributes on the overlay:
            // data-bg-left, data-bg-top, data-bg-width, data-bg-height, data-bg-fit, data-bg-opacity
            overlayBgImg.style.left = overlay.dataset.bgLeft || '50%';
            overlayBgImg.style.top = overlay.dataset.bgTop || '50%';
            overlayBgImg.style.width = overlay.dataset.bgWidth || '200%';
            overlayBgImg.style.height = overlay.dataset.bgHeight || '200%';
            overlayBgImg.style.transform = overlay.dataset.bgTransform || 'translate(-50%, -50%)';
            overlayBgImg.style.objectFit = overlay.dataset.bgFit || 'contain';
            overlayBgImg.style.opacity = (typeof overlay.dataset.bgOpacity !== 'undefined') ? overlay.dataset.bgOpacity : '1';
            overlayBgImg.style.pointerEvents = 'none';
            // smooth transitions for size/opacity changes
            overlayBgImg.style.transition = 'width 300ms ease, height 300ms ease, opacity 300ms ease, transform 300ms ease';
            // ensure the image is painted behind the overlay content
            overlayBgImg.style.zIndex = '-1';
            overlay.appendChild(overlayBgImg);
        } catch (e) {}

    const novoBtn = document.createElement('button');
    novoBtn.textContent = 'Novo Jogo';
    novoBtn.classList.add('overlay-button');
    // create Opções button early so Continuar can be inserted before it
    const opcoesBtn = document.createElement('button');
    opcoesBtn.textContent = 'configurações';
    opcoesBtn.classList.add('overlay-button');
    opcoesBtn.style.padding = '0';
    opcoesBtn.style.fontFamily = "'PixelFont', monospace";
    opcoesBtn.style.fontSize = '18px';
    opcoesBtn.style.borderRadius = '0';
    opcoesBtn.style.border = 'none';
    opcoesBtn.style.cursor = 'pointer';
    opcoesBtn.style.background = 'transparent';
    opcoesBtn.style.color = '#fff';

    // Append base buttons early so async inserts can reference them
    overlay.appendChild(novoBtn);
    overlay.appendChild(opcoesBtn);

    // Condicional: adicionar botão Continuar se houver save
    let continuarBtn = null;
    let carregarBtn = null;
        try {
            let lastSlot = null;
            const findSaveSlot = async () => {
                // prefer lastSlot stored in Neutralino if present
                let ls = lastSlot;
                if (!ls) ls = await getLastSlot();
                if (ls) {
                    if (window.SaveManager && typeof SaveManager.loadSlot === 'function') {
                        try { const s = await SaveManager.loadSlot(ls); if (s) return ls; } catch (e) {}
                    }
                }
                // scan slots 1..3 using SaveManager only
                for (let i = 1; i <= 3; i++) {
                    try {
                        if (window.SaveManager && typeof SaveManager.loadSlot === 'function') {
                            try { const s = await SaveManager.loadSlot(i); if (s) return i; } catch (e) {}
                        }
                    } catch (e) {}
                }
                return null;
            };
            findSaveSlot().then(slotFound => {
                if (slotFound) {
                    lastSlot = slotFound;
                    continuarBtn = document.createElement('button');
                    continuarBtn.textContent = 'Continuar';
                    continuarBtn.classList.add('overlay-button');
                    continuarBtn.style.padding = '0';
                    continuarBtn.style.fontFamily = "'PixelFont', monospace";
                    continuarBtn.style.fontSize = '18px';
                    continuarBtn.style.borderRadius = '0';
                    continuarBtn.style.border = 'none';
                    continuarBtn.style.cursor = 'pointer';
                    continuarBtn.style.background = 'transparent';
                    continuarBtn.style.color = '#fff';
                    // show slot name (if available)
                    (async () => {
                        try { const s = await SaveManager.loadSlot(lastSlot); if (s && s.nome) continuarBtn.textContent = `Continuar (${s.nome})`; } catch (e) {}
                    })();
                    // insert Continuar button before Novo Jogo (to place it above)
                    try { overlay.insertBefore(continuarBtn, novoBtn); } catch (e) { overlay.insertBefore(continuarBtn, opcoesBtn); }
                    // create 'Carregar save' button that appears under Continuar when saves exist
                    carregarBtn = document.createElement('button');
                    carregarBtn.textContent = 'Carregar save';
                    carregarBtn.classList.add('overlay-button');
                    carregarBtn.style.padding = '0';
                    carregarBtn.style.fontFamily = "'PixelFont', monospace";
                    carregarBtn.style.fontSize = '16px';
                    carregarBtn.style.borderRadius = '0';
                    carregarBtn.style.border = 'none';
                    carregarBtn.style.cursor = 'pointer';
                    carregarBtn.style.background = 'transparent';
                    carregarBtn.style.color = '#ffffff';
                    // rely on overlay gap for vertical spacing (keep uniform)
                    // insert Carregar under Continuar (before Novo Jogo)
                    try { overlay.insertBefore(carregarBtn, novoBtn); } catch (e) { overlay.insertBefore(carregarBtn, opcoesBtn); }
                    // wire carregar handler
                    carregarBtn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        openLoadMenu();
                    });
                    // wire handler
                    continuarBtn.addEventListener('click', async function(e) {
                        e.stopPropagation();
                        try { if (window.OptionsMenu && typeof window.OptionsMenu.close === 'function') window.OptionsMenu.close(); } catch (e) {}
                        // Ensure the main menu is closed and canvas shown before starting the shop transition
                        try { startGame(); } catch (e) {}
                        // show loading and load slot, then open shop without intro
                        try {
                            showLoadingTransition((removeTransition) => {
                                (async () => {
                                    let s = null;
                                    try {
                                        s = await SaveManager.loadSlot(lastSlot);
                                    } catch (e) { s = null; }

                                    // Ensure subsequent progress saves target this slot
                                    try { await setLastSlot(lastSlot); } catch (e) {}

                                    // restore money if present
                                    try {
                                        if (s && typeof s.dinheiro !== 'undefined') {
                                            try { money = Number(s.dinheiro) || 0; } catch (e) {}
                                            if (typeof globalStats !== 'undefined') {
                                                try { globalStats.moneyplus = Number(s.dinheiro) || 0; } catch (e) {}
                                            }
                                        }
                                    } catch (e) {}

                                    // restore shop/purchase state if present
                                    try {
                                        if (s && typeof s.recentPurchases !== 'undefined') {
                                            try { recentPurchases = s.recentPurchases || {}; } catch (e) { recentPurchases = {}; }
                                        }
                                        // Do NOT restore transient purchaseHistory messages from a save.
                                        // Those messages are only for immediate purchases and should not be
                                        // re-displayed when loading a saved game.
                                        try { purchaseHistory = []; } catch (e) { purchaseHistory = []; }

                                        if (s && typeof s._charData !== 'undefined') {
                                            try {
                                                if (typeof characterData !== 'undefined') {
                                                    Object.assign(characterData, s._charData);
                                                } else {
                                                    window.characterData = s._charData;
                                                }
                                            } catch (e) {}
                                            // Rebind global shop state so global items/purchases are visible
                                            try { if (typeof rebindGlobalLojaState === 'function') rebindGlobalLojaState(); } catch (e) {}
                                        }

                                        // Restore dynamic shop state (prices/counts) if present in the save
                                        try {
                                            if (s && typeof s.shopState === 'object' && s.shopState !== null && typeof shopItems !== 'undefined' && Array.isArray(shopItems)) {
                                                shopItems.forEach(it => {
                                                    try {
                                                        const st = s.shopState[it.nome];
                                                        if (st) {
                                                            if (typeof st.preco !== 'undefined') it.preco = Number(st.preco) || it.preco;
                                                            if (typeof st.priceIncrement !== 'undefined') it.priceIncrement = st.priceIncrement || it.priceIncrement || 0;
                                                            if (typeof st.compras !== 'undefined') it.compras = Number(st.compras) || 0;
                                                            if (typeof st.disponivel !== 'undefined') it.disponivel = !!st.disponivel;
                                                        }
                                                    } catch (e) {}
                                                });
                                                // Also apply to SECRET_ITEMS so secret entries (not yet pushed to shopItems)
                                                try {
                                                    if (typeof SECRET_ITEMS !== 'undefined' && Array.isArray(SECRET_ITEMS)) {
                                                        SECRET_ITEMS.forEach(si => {
                                                            try {
                                                                const st2 = s.shopState[si.nome];
                                                                if (st2) {
                                                                    if (typeof st2.preco !== 'undefined') si.preco = Number(st2.preco) || si.preco;
                                                                    if (typeof st2.priceIncrement !== 'undefined') si.priceIncrement = st2.priceIncrement || si.priceIncrement || 0;
                                                                    if (typeof st2.compras !== 'undefined') si.compras = Number(st2.compras) || 0;
                                                                    if (typeof st2.disponivel !== 'undefined') si.disponivel = !!st2.disponivel;
                                                                }
                                                            } catch (e) {}
                                                        });
                                                    }
                                                } catch (e) {}
                                            }
                                        } catch (e) {}
                                    } catch (e) {}

                                    // Reset the game state first (so it doesn't later overwrite the restored depth),
                                    // then apply saved depth and notify the shop UI.
                                    try { resetGame({ pauseOnStart: false, showShop: true }); } catch (e) {}
                                    try {
                                        if (s && typeof s.profundidade !== 'undefined') {
                                            try { salvoprofundidade = Math.floor(Number(s.profundidade) || 0); } catch (e) { salvoprofundidade = salvoprofundidade || 0; }
                                            try { depthPoints = Number(s.profundidade) || 0; } catch (e) { depthPoints = depthPoints || 0; }
                                            try { if (typeof onDepthChange === 'function') onDepthChange(depthPoints); } catch (e) {}
                                        }
                                    } catch (e) {}

                                    // Apply saved item effects now that game and depth are initialized.
                                    try {
                                        if (typeof window.__appliedShopEffects === 'undefined') window.__appliedShopEffects = {};
                                        const applyEffectsForList = (list) => {
                                            if (!list || !Array.isArray(list)) return;
                                            list.forEach(it => {
                                                try {
                                                    const compras = (typeof getPurchasesCountByName === 'function') ? (getPurchasesCountByName(it.nome) || (it.compras || 0)) : (it.compras || 0);
                                                    const already = window.__appliedShopEffects[it.nome] || 0;
                                                    const toApply = Math.max(0, Number(compras) - Number(already || 0));
                                                    if (toApply > 0) {
                                                        for (let k = 0; k < toApply; k++) {
                                                            try { if (typeof it.efeito === 'function') it.efeito(); } catch (e) {}
                                                        }
                                                        window.__appliedShopEffects[it.nome] = Number(compras) || 0;
                                                    }
                                                } catch (e) {}
                                            });
                                        };
                                        try { applyEffectsForList(shopItems); } catch (e) {}
                                        try { applyEffectsForList(typeof SECRET_ITEMS !== 'undefined' ? SECRET_ITEMS : []); } catch (e) {}
                                        // Sync runtime player/character stats back into characterData like in purchase flow
                                        try {
                                            if (!characterData[activeCharacter]) characterData[activeCharacter] = { stats: {} };
                                            characterData[activeCharacter].stats = {
                                                speed: player.speed,
                                                maxJumps: player.maxJumps,
                                                liveupgrade: liveupgrade,
                                                moneyplus: moneyplus,
                                                dashRechargeTime: player.dashRechargeTime || (characterData[activeCharacter].stats && characterData[activeCharacter].stats.dashRechargeTime) || 1000,
                                                dashExtraInvuln: player.dashExtraInvuln || (characterData[activeCharacter].stats && characterData[activeCharacter].stats.dashExtraInvuln) || 0,
                                                enemySpawnInterval: enemySpawnInterval
                                            };
                                        } catch (e) {}
                                    } catch (e) {}

                                    try {
                                        // restore saved shop tutorial stage if present so the shop resumes where the player left
                                        try {
                                            const slotTutorials = (s && s.tutorials) ? s.tutorials : null;

                                            // Shop tutorial: prefer explicit `showShopTutorial` key.
                                            // Fallback to legacy `shop` flag (where `shop===true` meant "seen").
                                            try {
                                                if (window.Tutorial) {
                                                    // Determine whether this slot explicitly encodes shop-tutorial visibility.
                                                    // Only update `Tutorial.showShopTutorial` when the slot provides an explicit
                                                    // visibility flag (modern `showShopTutorial` or legacy `shop`). This avoids
                                                    // overwriting the current runtime visibility when loading slots that don't
                                                    // include tutorial visibility data (prevents unwanted toggles when switching slots).
                                                    let showShop;
                                                    let hasShowShop = false;
                                                    if (slotTutorials && typeof slotTutorials.showShopTutorial !== 'undefined') {
                                                        showShop = !!slotTutorials.showShopTutorial;
                                                        hasShowShop = true;
                                                    } else if (slotTutorials && typeof slotTutorials.shop !== 'undefined') {
                                                        // legacy: shop===true meant seen -> do not show
                                                        showShop = !(slotTutorials.shop === true);
                                                        hasShowShop = true;
                                                    }

                                                    if (hasShowShop) {
                                                        Tutorial.showShopTutorial = showShop;
                                                        if (showShop && slotTutorials && slotTutorials.shop_tutorial_stage) {
                                                            Tutorial._stage = slotTutorials.shop_tutorial_stage;
                                                            Tutorial._typing.fullText = null;
                                                            Tutorial._typing.revealedLength = 0;
                                                            try {
                                                                if (Tutorial._uiText && typeof Tutorial._uiText[Tutorial._stage + 'Text'] === 'string') {
                                                                    Tutorial._initTyping(Tutorial._stage + 'Text');
                                                                } else if (Tutorial._uiText && typeof Tutorial._uiText.shopTutorialText === 'string') {
                                                                    Tutorial._initTyping('shopTutorialText');
                                                                }
                                                            } catch (e) {}
                                                        } else if (slotTutorials && typeof slotTutorials.shop_tutorial_stage !== 'undefined') {
                                                            // If the slot explicitly stores a stage but the slot requests the tutorial hidden,
                                                            // keep the stored stage but don't show the overlay.
                                                            Tutorial._stage = slotTutorials.shop_tutorial_stage;
                                                            Tutorial._typing.fullText = null;
                                                            Tutorial._typing.revealedLength = 0;
                                                        }

                                                        try { if (typeof Tutorial._detachListeners === 'function') Tutorial._detachListeners(); } catch (e) {}
                                                        try { if (typeof Tutorial._attachListeners === 'function' && Tutorial.showShopTutorial) Tutorial._attachListeners(); } catch (e) {}
                                                    } else {
                                                        // No explicit show/hide information in the slot. If the slot still encodes
                                                        // a stored tutorial stage, restore that stage but do not toggle visibility
                                                        // or listeners — leave the current runtime visibility intact.
                                                        if (slotTutorials && typeof slotTutorials.shop_tutorial_stage !== 'undefined') {
                                                            Tutorial._stage = slotTutorials.shop_tutorial_stage;
                                                            Tutorial._typing.fullText = null;
                                                            Tutorial._typing.revealedLength = 0;
                                                        }
                                                    }
                                                }
                                            } catch (e) {}

                                            // Dungeon tutorial: restore per-slot stage/visibility explicitly
                                            try {
                                                const slotDungeonStage = slotTutorials && slotTutorials.dungeon_tutorial_stage;
                                                const acceptedDungeon = slotTutorials && slotTutorials.accepted_dungeon_tutorial;
                                                if (window.DungeonTutorial) {
                                                    if (slotDungeonStage) {
                                                        DungeonTutorial._stage = slotDungeonStage;
                                                        DungeonTutorial._typing.fullText = null;
                                                        DungeonTutorial._typing.revealedLength = 0;
                                                        // restore paused/movement-only flags from slot data
                                                        try { DungeonTutorial._tutorialPaused = slotTutorials.tutorial_paused; } catch (e) {}
                                                        try { DungeonTutorial._tutorialMovementOnly = slotTutorials.tutorial_movement_only; } catch (e) {}
                                                        DungeonTutorial.showDungeonTutorial = true;
                                                        try { if (typeof DungeonTutorial._detachListeners === 'function') DungeonTutorial._detachListeners(); } catch (e) {}
                                                        try { if (typeof DungeonTutorial._attachListeners === 'function') DungeonTutorial._attachListeners(); } catch (e) {}
                                                    } else {
                                                        // When no explicit saved stage, rely only on explicit acceptance flag
                                                        DungeonTutorial.showDungeonTutorial = !!acceptedDungeon;
                                                        // still restore paused/movement-only flags when present
                                                        try { DungeonTutorial._tutorialPaused = !!(slotTutorials && slotTutorials.tutorial_paused); } catch (e) {}
                                                        try { DungeonTutorial._tutorialMovementOnly = !!(slotTutorials && slotTutorials.tutorial_movement_only); } catch (e) {}
                                                        if (!DungeonTutorial.showDungeonTutorial) {
                                                            try { if (typeof DungeonTutorial._detachListeners === 'function') DungeonTutorial._detachListeners(); } catch (e) {}
                                                        }
                                                    }
                                                }
                                            } catch (e) {}
                                        } catch (e) {}
                                    } catch (e) {}
                                    try { updateBodyStyles(true); } catch (e) {}
                                    try { drawLoja(); } catch (e) {}
                                    try { setTimeout(removeTransition, 400); } catch (e) {}
                                })();
                            });
                        } catch (e) {}
                    });
                }
            }).catch(()=>{});
        } catch (e) {}
        novoBtn.style.padding = '0';
        novoBtn.style.fontFamily = "'PixelFont', monospace";
        novoBtn.style.fontSize = '18px';
        novoBtn.style.borderRadius = '0';
        novoBtn.style.border = 'none';
        novoBtn.style.cursor = 'pointer';
        novoBtn.style.background = 'transparent';
        novoBtn.style.color = '#fff';

    // base buttons already appended earlier
        
        const sairBtn = document.createElement('button');
    sairBtn.textContent = 'Sair';
    sairBtn.classList.add('overlay-button');
    sairBtn.style.padding = '0';
    sairBtn.style.fontFamily = "'PixelFont', monospace";
    sairBtn.style.fontSize = '18px';
    sairBtn.style.borderRadius = '0';
    sairBtn.style.border = 'none';
    sairBtn.style.cursor = 'pointer';
    sairBtn.style.background = 'transparent';
    sairBtn.style.color = '#fff';
    overlay.appendChild(sairBtn);
        menu.appendChild(overlay);

        // move the title element to sit above the options overlay (but do not append it inside the overlay)
        try {
            const menuTitle = document.getElementById('menuTitle');
            if (menuTitle) {
                // save original parent/position so we can restore later
                overlay._menuTitleOriginal = { parent: menuTitle.parentNode, nextSibling: menuTitle.nextSibling, style: { position: menuTitle.style.position || '', left: menuTitle.style.left || '', top: menuTitle.style.top || '', transform: menuTitle.style.transform || '', width: menuTitle.style.width || '', zIndex: menuTitle.style.zIndex || '' } };
                try { document.getElementById('menu').appendChild(menuTitle); } catch (e) {}
                // position absolutely above the overlay
                try { menuTitle.style.position = 'absolute'; menuTitle.style.zIndex = '6'; } catch (e) {}
                setTimeout(() => {
                    try {
                        const rect = overlay.getBoundingClientRect();
                        const mtw = menuTitle.offsetWidth || (parseFloat(menuTitle.style.width) || 300);
                        const mth = menuTitle.offsetHeight || 80;
                        // apply ease-in transition for smooth repositioning
                        try { menuTitle.style.transition = 'all 400ms ease-in'; } catch (e) {}
                        menuTitle.style.left = (rect.left + rect.width / 2 - mtw / 2) + 'px';
                        // increase vertical gap a bit for options overlay
                        menuTitle.style.top = (rect.top - mth - 50) + 'px';
                        // remove transition after animation
                        setTimeout(() => { try { menuTitle.style.transition = ''; } catch (e) {} }, 450);
                    } catch (e) {}
                }, 0);
            }
        } catch (e) {}

        // Keyboard navigation helpers: arrow keys to move, Enter to activate
        const focusable = [];
    // base items: prefer continuar first (it will be inserted asynchronously before novoBtn)
    if (continuarBtn) focusable.push(continuarBtn);
    focusable.push(novoBtn);
    if (carregarBtn) focusable.push(carregarBtn);
    focusable.push(opcoesBtn);
    focusable.push(sairBtn);

        function attachFocusableHandlers(b, i) {
            try { b.tabIndex = 0; } catch (e) {}
            try { b.setAttribute('data-menu-index', i); } catch (e) {}
            try {
                b.addEventListener('mouseover', () => {
                    focusable.forEach(x => { try { x.classList.remove('kbd-focused'); } catch(e){} });
                    try { b.classList.add('kbd-focused'); } catch (e) {}
                });
            } catch (e) {}
        }

        focusable.forEach((b, i) => attachFocusableHandlers(b, i));

        // If continuarBtn is created asynchronously after this point, insert it into the focusable array
        (function ensureContinuarInFocusable() {
            let changed = false;
            if (typeof continuarBtn !== 'undefined' && continuarBtn && !focusable.includes(continuarBtn)) {
                // insert at the start so it appears above 'Novo Jogo'
                focusable.splice(0, 0, continuarBtn);
                changed = true;
            }
            if (typeof carregarBtn !== 'undefined' && carregarBtn && !focusable.includes(carregarBtn)) {
                // place carregarBtn right after continuarBtn if present
                const idx = Math.max(0, focusable.indexOf(continuarBtn));
                focusable.splice(idx + 1, 0, carregarBtn);
                changed = true;
            }
            if (changed) {
                // attach handlers and reindex
                focusable.forEach((b, i) => attachFocusableHandlers(b, i));
                // Reapply visual highlight to the currently focused button (it may have moved in the array)
                try { setFocus(focusedIndex); } catch (e) {}
                return;
            }
            // retry shortly until the async creation runs (safe because this only runs while overlay is open)
            setTimeout(ensureContinuarInFocusable, 80);
        })();

        let focusedIndex = 0;
        function setFocus(i) {
            focusedIndex = (i + focusable.length) % focusable.length;
            focusable.forEach(x => x.classList.remove('kbd-focused'));
            try { focusable[focusedIndex].classList.add('kbd-focused'); focusable[focusedIndex].focus(); } catch (e) {}
        }

        // show immediately (no animation)
        try { overlay.style.opacity = '1'; overlay.style.transform = 'translate(-50%, -50%)'; } catch (e) {}

        function closeOptions() {
            if (!overlay) return;
            // restore menuTitle (if we moved it) before removing overlay, unless suppression requested
            try {
                if (!overlay._suppressRestore) {
                    const menuTitle = document.getElementById('menuTitle');
                    if (overlay && overlay._menuTitleOriginal && menuTitle) {
                        const orig = overlay._menuTitleOriginal;
                        try {
                            if (orig.parent && typeof orig.parent.appendChild === 'function') {
                                if (orig.nextSibling && orig.nextSibling.parentNode === orig.parent) orig.parent.insertBefore(menuTitle, orig.nextSibling);
                                else orig.parent.appendChild(menuTitle);
                            } else {
                                const menuContent = document.getElementById('menuContent');
                                if (menuContent) menuContent.appendChild(menuTitle);
                                else document.getElementById('menu')?.appendChild(menuTitle);
                            }
                        } catch (e) {}
                        try { menuTitle.style.position = orig.style.position || ''; menuTitle.style.left = orig.style.left || ''; menuTitle.style.top = orig.style.top || ''; menuTitle.style.transform = orig.style.transform || ''; menuTitle.style.width = orig.style.width || ''; menuTitle.style.zIndex = orig.style.zIndex || ''; } catch (e) {}
                        try { delete overlay._menuTitleOriginal; } catch (e) {}
                    }
                }
            } catch (e) {}
            try { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); } catch (e) {}
            try { if (window.startOptionsKeyHandler) window.removeEventListener('keydown', window.startOptionsKeyHandler); } catch (e) {}
            try { delete window.startOptionsKeyHandler; } catch (e) {}
            try { menu.focus?.(); } catch (e) {}
        }

        // Close the entire menu and keep start button hidden. Use when choosing Options or Sair.
        function closeAndHideMenu() {
            try {
                // remove overlay if still present
                if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
            } catch (e) {}
            try {
                // hide the full menu and menu background
                menu.style.display = 'none';
                menu.style.opacity = '0';
            } catch (e) {}
            try {
                // ensure game canvas remains hidden (we're only hiding menu for now)
                // but follow user's request: menu sumir (disappear)
                document.getElementById('gameCanvas').style.display = 'none';
            } catch (e) {}
            // remove key listener used for overlay
            try { if (window.startOptionsKeyHandler) window.removeEventListener('keydown', window.startOptionsKeyHandler); } catch (e) {}
            try { delete window.startOptionsKeyHandler; } catch (e) {}
            // also ensure menuTitle is restored if it was moved, unless suppression requested
            try {
                if (!overlay._suppressRestore) {
                    const menuTitle = document.getElementById('menuTitle');
                    if (overlay && overlay._menuTitleOriginal && menuTitle) {
                        const orig = overlay._menuTitleOriginal;
                        try {
                            if (orig.parent && typeof orig.parent.appendChild === 'function') {
                                if (orig.nextSibling && orig.nextSibling.parentNode === orig.parent) orig.parent.insertBefore(menuTitle, orig.nextSibling);
                                else orig.parent.appendChild(menuTitle);
                            } else {
                                const menuContent = document.getElementById('menuContent');
                                if (menuContent) menuContent.appendChild(menuTitle);
                                else document.getElementById('menu')?.appendChild(menuTitle);
                            }
                        } catch (e) {}
                        try { menuTitle.style.position = orig.style.position || ''; menuTitle.style.left = orig.style.left || ''; menuTitle.style.top = orig.style.top || ''; menuTitle.style.transform = orig.style.transform || ''; menuTitle.style.width = orig.style.width || ''; menuTitle.style.zIndex = orig.style.zIndex || ''; } catch (e) {}
                        try { delete overlay._menuTitleOriginal; } catch (e) {}
                    }
                }
            } catch (e) {}
            // do not restore start button styles (keep hidden)
        }

        novoBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            // when opening slot selection, suppress restoring title in closeOptions
            try { overlay._suppressRestore = true; } catch (err) {}
            closeOptions();
            try { if (window.OptionsMenu && typeof window.OptionsMenu.close === 'function') window.OptionsMenu.close(); } catch (e) {}
            showSlotSelectionMenu();
        });
// Exibe seleção de 3 slots de save ao iniciar novo jogo
function showSlotSelectionMenu() {
    // Clean up any previous menu handlers before adding new ones
    try { 
        if (window.startOptionsKeyHandler) { 
            window.removeEventListener('keydown', window.startOptionsKeyHandler);
            delete window.startOptionsKeyHandler;
        } 
    } catch (e) {}
    
    const menu = document.getElementById('menu');

    // Cria overlay para seleção de slots
    const slotOverlay = document.createElement('div');
    slotOverlay.id = 'slotSelectionOverlay';
    slotOverlay.style.position = 'absolute';
    slotOverlay.style.top = '65%';
    slotOverlay.style.left = '50%';
    slotOverlay.style.transform = 'translate(-50%, -50%)';
    slotOverlay.style.display = 'flex';
    slotOverlay.style.flexDirection = 'column';
    slotOverlay.style.alignItems = 'center';
    slotOverlay.style.gap = '18px';
    slotOverlay.style.padding = '28px';
    slotOverlay.style.borderRadius = '12px';
    slotOverlay.style.background = 'transparent';
    slotOverlay.style.backdropFilter = 'none';
    slotOverlay.style.zIndex = '10';
    slotOverlay.style.opacity = '1';
    slotOverlay.style.transition = '';
    slotOverlay.style.transform = 'translate(-50%, -50%)';

    try {
        const overlayBgImg = document.createElement('img');
        overlayBgImg.src = 'images/imagens de fundo/fundo do menuprincipal/fundo do menu.png';
        overlayBgImg.alt = '';
        overlayBgImg.style.position = 'absolute';
        overlayBgImg.style.left = '50%';
        overlayBgImg.style.top = '48%';
        overlayBgImg.style.width = '120%';
        overlayBgImg.style.height = '120%';
        overlayBgImg.style.transform = 'translate(-50%, -50%)';
        overlayBgImg.style.objectFit = 'contain';
        overlayBgImg.style.opacity = '1';
        overlayBgImg.style.pointerEvents = 'none';
        overlayBgImg.style.transition = 'width 300ms ease, height 300ms ease, opacity 300ms ease, transform 300ms ease';
        overlayBgImg.style.zIndex = '-1';
        slotOverlay.appendChild(overlayBgImg);
    } catch (e) {}

    // Aviso de erro no topo
    const warningTop = document.createElement('div');
    warningTop.id = 'slotNameWarningTop';
    warningTop.style.display = 'none';
    warningTop.style.color = '#ff0829';
    warningTop.style.fontFamily = "'PixelFont', monospace";
    warningTop.style.fontSize = '15px';
    warningTop.style.marginBottom = '8px';
    warningTop.style.background = 'rgba(0,0,0,0.8)';
    warningTop.style.borderRadius = '7px';
    warningTop.style.padding = '7px 18px';
    warningTop.style.boxShadow = '0 2px 12px rgba(255,0,0,0.10)';
    slotOverlay.appendChild(warningTop);

    const title = document.createElement('div');
    title.textContent = 'Selecione um slot de save:';
    title.style.fontFamily = "'PixelFont', monospace";
    title.style.fontSize = '22px';
    title.style.color = '#ffd700';
    title.style.marginBottom = '10px';
    slotOverlay.appendChild(title);

    // Cria 3 slots
    for (let i = 1; i <= 3; i++) {
        const slotDiv = document.createElement('div');
        slotDiv.classList.add('slot-row');
        slotDiv.style.display = 'flex';
        slotDiv.style.alignItems = 'center';
        slotDiv.style.gap = '10px';
        slotDiv.style.marginBottom = '8px';

    // Label on the left: 'slot X'
    const slotLabel = document.createElement('div');
    slotLabel.textContent = `Slot ${i}`;
    slotLabel.style.fontFamily = "'PixelFont', monospace";
    slotLabel.style.fontSize = '16px';
    slotLabel.style.color = '#ffd700';
    slotLabel.style.minWidth = '80px';
    slotLabel.style.textAlign = 'left';

    // Input para nome do slot (center)
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Nome do save';
    nameInput.style.fontFamily = "'PixelFont', monospace";
    nameInput.style.fontSize = '16px';
    nameInput.style.borderRadius = '6px';
    nameInput.style.border = '1px solid #ffd700';
    nameInput.style.padding = '6px 10px';
    nameInput.style.width = '140px';

    // Create button on the right with compact text
    const slotBtn = document.createElement('button');
    slotBtn.textContent = 'Criar';
    slotBtn.classList.add('overlay-button');
    slotBtn.style.padding = '8px 14px';
    slotBtn.style.fontFamily = "'PixelFont', monospace";
    slotBtn.style.fontSize = '16px';
    slotBtn.style.borderRadius = '6px';
    slotBtn.style.border = 'none';
    slotBtn.style.cursor = 'pointer';
    slotBtn.style.background = 'linear-gradient(to right, #ffd700, #ff0829)';
    slotBtn.style.color = 'white';

    slotBtn.addEventListener('click', function() {
            (async () => {
                const slotName = nameInput.value.trim();
                // Se não tiver nome, mostra aviso no topo
                if (!slotName) {
                    showSlotNameWarningTop();
                    nameInput.focus();
                    return;
                }
                // check if slot already exists (try SaveManager then localStorage)
                let exists = false;
                try {
                    if (window.SaveManager && typeof SaveManager.loadSlot === 'function') {
                        try { const s = await SaveManager.loadSlot(i); if (s) exists = true; } catch (e) {}
                    }
                } catch (e) {}

                const doSave = async () => {
                    try {
                        // Create a fresh save object for the new slot (overwrite completely)
                        const now = Date.now();
                        const saveObj = {
                            nome: slotName,
                            criadoEm: now,
                            modifiedAt: now,
                            dinheiro: (typeof money !== 'undefined') ? Number(money) : 0,
                            profundidade: (typeof salvoprofundidade !== 'undefined') ? Math.floor(Number(salvoprofundidade) || 0) : 0,
                            recentPurchases: (typeof recentPurchases !== 'undefined') ? recentPurchases : {},
                            purchaseHistory: [],
                            _charData: (typeof _charData !== 'undefined') ? JSON.parse(JSON.stringify(_charData)) : (typeof characterData !== 'undefined' ? JSON.parse(JSON.stringify(characterData)) : {}),
                            shopState: {}
                        };
                        // Ensure newly created slots explicitly indicate the shop tutorial
                        // has NOT been seen so the tutorial appears on first play.
                        try {
                            // When creating a brand-new slot (no existing tutorial metadata),
                            // initialize explicit tutorial defaults so the new slot will show
                            // the shop tutorial on first play. If the slot already exists,
                            // preserve its existing `tutorials` block to avoid cross-slot
                            // overwrites of per-slot settings like `tutorial_paused`.
                            if (!existing || !existing.tutorials) {
                                saveObj.tutorials = Object.assign({}, saveObj.tutorials || {}, {
                                    showShopTutorial: true,
                                    shop_tutorial_stage: 'consent',
                                    accepted_dungeon_tutorial: false,
                                    dungeon_tutorial_stage: 'welcomeIntro',
                                    _tutorial_End: false,
                                    // Default when starting a new slot: pause dungeon tutorial
                                    // so the tutorial can run when the player enters the dungeon.
                                    tutorial_paused: true,
                                    tutorial_movement_only: false
                                });
                            } else {
                                // Preserve existing tutorial settings for this slot
                                saveObj.tutorials = Object.assign({}, existing.tutorials || saveObj.tutorials || {});
                            }
                        } catch (e) {}
                        try { saveObj.dinheiro = (typeof money !== 'undefined') ? Number(money) : (saveObj.dinheiro || 0); } catch (e) { saveObj.dinheiro = saveObj.dinheiro || 0; }
                        try { saveObj.profundidade = (typeof salvoprofundidade !== 'undefined') ? Math.floor(Number(salvoprofundidade) || 0) : (saveObj.profundidade || 0); } catch (e) { saveObj.profundidade = saveObj.profundidade || 0; }
                        // purchase state: recentPurchases and purchaseHistory (shop UI state)
                        try { if (typeof recentPurchases !== 'undefined') saveObj.recentPurchases = recentPurchases; } catch (e) {}
                        // Do not persist transient UI messages into newly created saves.
                        try { saveObj.purchaseHistory = []; } catch (e) { saveObj.purchaseHistory = []; }
                        // character/global purchases and other shop-related data
                        try {
                            if (typeof _charData !== 'undefined') {
                                try { saveObj._charData = JSON.parse(JSON.stringify(_charData)); } catch (e) { saveObj._charData = saveObj._charData || {}; }
                            } else if (typeof characterData !== 'undefined') {
                                try { saveObj._charData = JSON.parse(JSON.stringify(characterData)); } catch (e) { saveObj._charData = saveObj._charData || {}; }
                            }
                        } catch (e) { saveObj._charData = saveObj._charData || {}; }

                        // Persist dynamic shop state (item prices and compra counts)
                        try {
                            const shopState = {};
                            if (typeof shopItems !== 'undefined' && Array.isArray(shopItems)) {
                                shopItems.forEach(it => {
                                    try { shopState[it.nome] = { preco: it.preco, priceIncrement: it.priceIncrement || 0, compras: it.compras || 0, disponivel: !!it.disponivel }; } catch (e) {}
                                });
                            }
                            saveObj.shopState = shopState;
                        } catch (e) {}

                        // Persist using SaveManager (Neutralino) only
                        try {
                            if (window.SaveManager && typeof SaveManager.saveSlot === 'function') {
                                try { await SaveManager.saveSlot(i, saveObj); } catch (e) { /* save failed */ }
                            }
                        } catch (e) {}
                    } catch (e) {}
                    try { await setLastSlot(i); } catch (e) {}
                    // Ensure the in-memory tutorial shows for this new game immediately
                    try {
                        if (window.Tutorial) {
                            try { Tutorial.showShopTutorial = true; } catch (e) {}
                            try { Tutorial._stage = 'consent'; } catch (e) {}
                            try { Tutorial._typing = Tutorial._typing || {}; Tutorial._typing.revealedLength = 0; Tutorial._typing.isTyping = false; } catch (e) {}
                        }
                    } catch (e) {}
                    // Remove overlay e inicia jogo
                    if (slotOverlay && slotOverlay.parentNode) {
                        if (typeof slotOverlay._removeBlockEnter === 'function') slotOverlay._removeBlockEnter();
                        if (typeof slotOverlay._removeKeyboardNav === 'function') slotOverlay._removeKeyboardNav();
                        slotOverlay.parentNode.removeChild(slotOverlay);
                    }
                    startGame();
                };

                if (exists) {
                    // Show confirmation before overwriting
                    showReplaceConfirm(i, slotName, () => { doSave(); }, () => { try { nameInput.focus(); } catch (e) {} });
                } else {
                    doSave();
                }
            })();
        });

    // Função para mostrar aviso de nome obrigatório no topo, sem sobrepor o menu e sem múltiplas instâncias
    let warningFrameId = null;
    let warningEndTime = 0;
    function showSlotNameWarningTop() {
        warningTop.textContent = 'Digite um nome para o save!';
        warningTop.style.display = 'block';
        warningTop.style.position = 'absolute';
        warningTop.style.top = '-38px';
        warningTop.style.left = '50%';
        warningTop.style.transform = 'translateX(-50%)';
        warningTop.style.width = '100%';
        warningTop.style.textAlign = 'center';
        // Timer: sempre reinicia para 2s a partir do último clique
        warningEndTime = performance.now() + 2000;
        if (!warningFrameId) {
            function hideWarningFrame() {
                if (performance.now() >= warningEndTime) {
                    warningTop.style.display = 'none';
                    warningFrameId = null;
                    return;
                }
                warningFrameId = requestAnimationFrame(hideWarningFrame);
            }
            hideWarningFrame();
        }
    }

        slotDiv.appendChild(slotLabel);
        slotDiv.appendChild(nameInput);
        slotDiv.appendChild(slotBtn);
        slotOverlay.appendChild(slotDiv);
    }

    // Botão de voltar
                            if (typeof slotOverlay._removeKeyboardNav === 'function') slotOverlay._removeKeyboardNav();
    // Cria botão de voltar
    const backBtn = document.createElement('button');
    backBtn.textContent = 'Voltar';
    backBtn.classList.add('overlay-button');
    backBtn.style.padding = '8px 18px';
    backBtn.style.fontFamily = "'PixelFont', monospace";
    backBtn.style.fontSize = '16px';
    backBtn.style.borderRadius = '8px';
    backBtn.style.border = 'none';
    backBtn.style.cursor = 'pointer';
    backBtn.style.background = 'linear-gradient(to right, #2196f3, #1565c0)';
                // --- Navegação por teclado em matriz 2x3 ---
                // Monta matriz: cada linha tem [botão, campo de texto], última linha é [botão de voltar, null]
                const slotRows = [];
                try {
                    // Use querySelectorAll to robustly find the slot rows regardless of other children
                    const slotDivs = slotOverlay.querySelectorAll('.slot-row');
                    for (let i = 0; i < slotDivs.length; i++) {
                        const sd = slotDivs[i];
                        slotRows.push([
                            sd.querySelector('button'),
                            sd.querySelector('input')
                        ]);
                    }
                } catch (e) {}
                // append the back button as the last row
                slotRows.push([backBtn, null]);

                let row = 0, col = 0;
                function setMatrixFocus(r, c) {
                    // Limpa foco anterior
                    slotRows.forEach((arr, i) => arr.forEach((el, j) => {
                        if (el) {
                            el.classList.remove('kbd-focused');
                            el.blur();
                        }
                    }));
                    const rows = slotRows.length;
                    if (rows === 0) return;
                    // wrap row index
                    r = ((r % rows) + rows) % rows;
                    // If last row (back button), force column 0
                    if (r === rows - 1) {
                        c = 0;
                    } else {
                        // columns normally 0..1; wrap column index
                        c = ((c % 2) + 2) % 2;
                        // If the target cell is missing (e.g., no input), try to find a present cell in the row
                        let attempts = 0;
                        while (attempts < 2 && !slotRows[r][c]) {
                            c = (c + 1) % 2;
                            attempts++;
                        }
                    }
                    row = r; col = c;
                    const el = slotRows[row][col];
                    if (el) {
                        el.classList.add('kbd-focused');
                        try { el.focus(); } catch (e) {}
                    }
                }
                // Mouse hover should move keyboard matrix focus so hover and keyboard match
                try {
                    slotRows.forEach((arr, ri) => {
                        arr.forEach((el, ci) => {
                            if (!el) return;
                            try {
                                el.addEventListener('mouseover', () => {
                                    try { setMatrixFocus(ri, ci); } catch (e) {}
                                });
                            } catch (e) {}
                        });
                    });
                    // also ensure back button shows pointer and reacts to hover
                    try { backBtn.addEventListener('mouseover', () => setMatrixFocus(slotRows.length - 1, 0)); } catch (e) {}
                } catch (e) {}
                function onMatrixKey(e) {
                    if (!document.getElementById('slotSelectionOverlay')) return;
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        // Remove slot selection overlay and return to main menu
                        if (slotOverlay && slotOverlay.parentNode) {
                            if (typeof slotOverlay._removeBlockEnter === 'function') slotOverlay._removeBlockEnter();
                            if (typeof slotOverlay._removeKeyboardNav === 'function') slotOverlay._removeKeyboardNav();
                            slotOverlay.parentNode.removeChild(slotOverlay);
                        }
                        // Return to startOptions menu
                        try { revealMenuBackground(); } catch (e) {}
                        try { showStartOptions(); } catch (e) {}
                        return;
                    }
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setMatrixFocus(row + 1, col);
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setMatrixFocus(row - 1, col);
                    } else if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        setMatrixFocus(row, col - 1);
                    } else if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        setMatrixFocus(row, col + 1);
                    } else if (e.key === 'Enter') { // NOTE: Space disabled for slot selection to avoid accidental saves
                        e.preventDefault();
                        const el = slotRows[row][col];
                        if (el) {
                            if (el.tagName === 'BUTTON') {
                                // Se for botão de slot, valida o campo de texto ao lado
                                if (row < 3 && slotRows[row][1]) {
                                    const nameInput = slotRows[row][1];
                                    const slotName = nameInput.value.trim();
                                    if (!slotName) {
                                        // Mostra aviso e foca campo
                                        if (typeof showSlotNameWarningTop === 'function') showSlotNameWarningTop();
                                        nameInput.focus();
                                        return;
                                    }
                                    
                                    // Verificar se o slot já existe
                                    (async () => {
                                        let exists = false;
                                        try {
                                            if (window.SaveManager && typeof SaveManager.loadSlot === 'function') {
                                                try { const s = await SaveManager.loadSlot(row+1); if (s) exists = true; } catch (e) {}
                                            }
                                        } catch (e) {}
                                        
                                        const doSave = async () => {
                                            try {
                                                // Create a fresh save object for the new slot (overwrite completely)
                                                const now = Date.now();
                                                const saveObj = {
                                                    nome: slotName,
                                                    criadoEm: now,
                                                    modifiedAt: now,
                                                    dinheiro: (typeof money !== 'undefined') ? Number(money) : 0,
                                                    profundidade: (typeof salvoprofundidade !== 'undefined') ? Math.floor(Number(salvoprofundidade) || 0) : 0,
                                                    recentPurchases: (typeof recentPurchases !== 'undefined') ? recentPurchases : {},
                                                    purchaseHistory: [],
                                                    _charData: (typeof _charData !== 'undefined') ? JSON.parse(JSON.stringify(_charData)) : (typeof characterData !== 'undefined' ? JSON.parse(JSON.stringify(characterData)) : {}),
                                                    shopState: {}
                                                };
                                                try {
                                                    const shopState = {};
                                                    if (typeof shopItems !== 'undefined' && Array.isArray(shopItems)) {
                                                        shopItems.forEach(it => {
                                                            try { shopState[it.nome] = { preco: it.preco, priceIncrement: it.priceIncrement || 0, compras: it.compras || 0, disponivel: !!it.disponivel }; } catch (e) {}
                                                        });
                                                    }
                                                    saveObj.shopState = shopState;
                                                } catch (e) {}
                                                // Persist using SaveManager (Neutralino) only
                                                try {
                                                    if (window.SaveManager && typeof SaveManager.saveSlot === 'function') {
                                                        try { await SaveManager.saveSlot(row+1, saveObj); } catch (e) { /* save failed */ }
                                                    }
                                                } catch (e) {}
                                            } catch (e) {}
                                            try { await setLastSlot(row+1); } catch (e) {}
                                            // Reset in-memory tutorial state for the newly created slot
                                            try {
                                                if (window.Tutorial) {
                                                    try { Tutorial.showShopTutorial = true; } catch (e) {}
                                                    try { Tutorial._stage = 'consent'; } catch (e) {}
                                                    try { Tutorial._typing = Tutorial._typing || {}; Tutorial._typing.revealedLength = 0; Tutorial._typing.isTyping = false; } catch (e) {}
                                                }
                                            } catch (e) {}
                                            if (slotOverlay && slotOverlay.parentNode) {
                                                if (typeof slotOverlay._removeBlockEnter === 'function') slotOverlay._removeBlockEnter();
                                                if (typeof slotOverlay._removeKeyboardNav === 'function') slotOverlay._removeKeyboardNav();
                                                slotOverlay.parentNode.removeChild(slotOverlay);
                                            }
                                            startGame();
                                        };
                                        
                                        if (exists) {
                                            // Show confirmation before overwriting
                                            showReplaceConfirm(row+1, slotName, () => { doSave(); }, () => { try { nameInput.focus(); } catch (e) {} });
                                        } else {
                                            doSave();
                                        }
                                    })();
                                } else {
                                    // Botão de voltar
                                    el.click();
                                }
                            } else if (el.tagName === 'INPUT') el.focus();
                        }
                    }
                }
                window.addEventListener('keydown', onMatrixKey);
                setTimeout(() => setMatrixFocus(0, 0), 80);
                slotOverlay._removeKeyboardNav = function() {
                    window.removeEventListener('keydown', onMatrixKey);
                };
    backBtn.style.color = 'white';
    backBtn.style.marginTop = '12px';
    backBtn.addEventListener('click', function() {
        if (slotOverlay && slotOverlay.parentNode) {
            if (typeof slotOverlay._removeBlockEnter === 'function') slotOverlay._removeBlockEnter();
                if (typeof slotOverlay._removeKeyboardNav === 'function') slotOverlay._removeKeyboardNav();
            slotOverlay.parentNode.removeChild(slotOverlay);
        }
        try { revealMenuBackground(); } catch (e) {}
        showStartOptions();
    });
    slotOverlay.appendChild(backBtn);

    // Remove botão Iniciar Jogo se existir
    const startBtn = document.getElementById('startButton');
    if (startBtn) startBtn.style.display = 'none';
    menu.appendChild(slotOverlay);
    // position the menu title above the slot selection overlay (keep it outside the overlay)
    try {
        const menuTitle = document.getElementById('menuTitle');
        if (menuTitle) {
            try { document.getElementById('menu').appendChild(menuTitle); } catch (e) {}
            try { menuTitle.style.position = 'absolute'; menuTitle.style.zIndex = '11'; } catch (e) {}
            setTimeout(() => {
                try {
                    const rect = slotOverlay.getBoundingClientRect();
                    const mtw = menuTitle.offsetWidth || (parseFloat(menuTitle.style.width) || 300);
                    const mth = menuTitle.offsetHeight || 80;
                    // apply ease-in transition for smooth repositioning
                    try { menuTitle.style.transition = 'all 400ms ease-in'; } catch (e) {}
                    menuTitle.style.left = (rect.left + rect.width / 2 - mtw / 2) + 'px';
                    // decrease vertical gap slightly for slot selection (novo jogo)
                    menuTitle.style.top = (rect.top - mth - 30) + 'px';
                    // remove transition after animation
                    setTimeout(() => { try { menuTitle.style.transition = ''; } catch (e) {} }, 450);
                } catch (e) {}
            }, 0);
        }
    } catch (e) {}
    // show immediately (no animation)
    try { slotOverlay.style.opacity = '1'; slotOverlay.style.transform = 'translate(-50%, -50%)'; } catch (e) {}

    // Prevent native Space activation while slot-selection overlay is open.
    // The matrix navigation handles Enter; we want to prevent the browser's default
    // behavior for Space (which otherwise clicks focused buttons).
    slotOverlay._blockSpaceHandler = function(e) {
        if (!document.getElementById('slotSelectionOverlay')) return;
        // Allow typing spaces when a text field is focused
        try {
            const active = document.activeElement;
            if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) {
                return; // allow normal typing
            }
        } catch (err) {}
        // block physical spacebar activation but don't treat it as 'confirm'
        if (e.key === ' ' || e.code === 'Space') {
            try { e.preventDefault(); e.stopPropagation(); } catch (err) {}
        }
    };
    try { window.addEventListener('keydown', slotOverlay._blockSpaceHandler); } catch (e) {}
    slotOverlay._removeBlockEnter = function() {
        try { window.removeEventListener('keydown', slotOverlay._blockSpaceHandler); } catch (e) {}
    };
}

// Confirmation modal shown when trying to overwrite an existing save in slot selection
function showReplaceConfirm(slotIndex, newName, onYes, onNo) {
    try {
        const menu = document.getElementById('menu');
        if (!menu) return;
        // If a confirm already exists, don't stack
        if (document.getElementById('replaceConfirm')) return;

        // Helper to get existing save name
        async function getExistingSaveName() {
            try {
                if (window.SaveManager && typeof SaveManager.loadSlot === 'function') {
                    try {
                        const existing = await SaveManager.loadSlot(slotIndex);
                        if (existing && existing.nome) return existing.nome;
                    } catch (e) {}
                }
            } catch (e) {}
            return null;
        }

        // Load existing save name and create confirmation
        (async () => {
            const existingName = await getExistingSaveName();

            const confirm = document.createElement('div');
            confirm.id = 'replaceConfirm';
            Object.assign(confirm.style, {
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', borderRadius: '10px',
                background: 'rgba(0,0,0,0.9)', zIndex: '30', color: '#fff', alignItems: 'center'
            });

            const msg = document.createElement('div');
            // Show old name if it exists, otherwise generic message
            const msgText = existingName
                ? `Slot ${slotIndex} contém um salvamento com o nome de: "${existingName}". Deseja substituir e começar do 0 em : "${newName}"?`
                : `Slot ${slotIndex} já contém um save. Deseja substituir por "${newName}"?`;
            msg.textContent = msgText;
            msg.style.fontFamily = "'PixelFont', monospace";
            msg.style.textAlign = 'center';
            msg.style.maxWidth = '420px';
            confirm.appendChild(msg);

            const btnRow = document.createElement('div');
            btnRow.style.display = 'flex';
            btnRow.style.gap = '12px';

                const yes = document.createElement('button');
                yes.textContent = 'Sim';
                yes.classList.add('overlay-button');
                // match overlay text-only style
                try { yes.style.background = 'transparent'; yes.style.color = '#fff'; yes.style.padding = '0'; yes.style.border = 'none'; yes.style.cursor = 'pointer'; yes.style.fontFamily = "'PixelFont', monospace"; } catch (e) {}
                const no = document.createElement('button');
                no.textContent = 'Não';
                no.classList.add('overlay-button');
                try { no.style.background = 'transparent'; no.style.color = '#fff'; no.style.padding = '0'; no.style.border = 'none'; no.style.cursor = 'pointer'; no.style.fontFamily = "'PixelFont', monospace"; } catch (e) {}

            btnRow.appendChild(yes);
            btnRow.appendChild(no);
            // Make mouse hover follow same focus logic as keyboard
            try { yes.addEventListener('mouseover', () => { try { focusIdx = 0; updateFocus(); } catch (e) {} }); } catch (e) {}
            try { no.addEventListener('mouseover', () => { try { focusIdx = 1; updateFocus(); } catch (e) {} }); } catch (e) {}
            confirm.appendChild(btnRow);

            menu.appendChild(confirm);

            // suspend slotOverlay keyboard nav if present
            const slotOverlay = document.getElementById('slotSelectionOverlay');
            let suspended = false;
            if (slotOverlay && typeof slotOverlay._removeKeyboardNav === 'function') {
                try { slotOverlay._removeKeyboardNav(); suspended = true; } catch (e) {}
            }

            // keyboard navigation for confirm: Left/Right/Enter/Escape
            let focusIdx = 0; // 0=yes, 1=no
            const choices = [yes, no];
            function updateFocus() {
                choices.forEach(c => c.classList.remove('kbd-focused'));
                try { choices[focusIdx].classList.add('kbd-focused'); choices[focusIdx].focus(); } catch (e) {}
            }
            updateFocus();

            function onKey(e) {
                if (!document.getElementById('replaceConfirm')) return;
                if (e.key === 'Escape') {
                    e.preventDefault();
                    close(false);
                    return;
                }
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault(); focusIdx = (focusIdx - 1 + choices.length) % choices.length; updateFocus(); return;
                }
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault(); focusIdx = (focusIdx + 1) % choices.length; updateFocus(); return;
                }
                if (e.key === 'Enter') {
                    e.preventDefault(); choices[focusIdx].click(); return;
                }
            }
            window.startOptionsKeyHandler = onKey;
            window.addEventListener('keydown', window.startOptionsKeyHandler);

            yes.addEventListener('click', function() { close(true); });
            no.addEventListener('click', function() { close(false); });

            function close(choice) {
                try { window.removeEventListener('keydown', window.startOptionsKeyHandler || onKey); } catch (e) {}
                try { delete window.startOptionsKeyHandler; } catch (e) {}
                try { if (confirm && confirm.parentNode) confirm.parentNode.removeChild(confirm); } catch (e) {}
                // restore slotOverlay keyboard nav if it was suspended
                if (suspended && slotOverlay && typeof slotOverlay._removeKeyboardNav === 'undefined') {
                    // Re-attach matrix handler by re-creating it: the easiest approach is to call showSlotSelectionMenu's key init
                    // but since that function created the overlay, assume the overlay still exists and reattach its keyboard handler
                    try { if (slotOverlay && typeof slotOverlay._removeKeyboardNav === 'function') slotOverlay._removeKeyboardNav(); } catch (e) {}
                    try { /* no-op: handler will be reattached by the slot overlay logic when appropriate */ } catch (e) {}
                }
                (async function() {
                    if (choice) {
                        try { if (typeof onYes === 'function') await onYes(); } catch (e) {}
                    } else {
                        try { if (typeof onNo === 'function') onNo(); } catch (e) {}
                    }
                })();
            }
        })();
    } catch (e) {}
}

// Abre menu de carregamento de saves (escolher slot 1..3)
function openLoadMenu() {
    const menu = document.getElementById('menu');
    if (!menu) return;
    if (document.getElementById('loadOverlay')) return; // já aberto

    // Clean up any previous menu handlers before adding new ones
    try { 
        if (window.startOptionsKeyHandler) { 
            window.removeEventListener('keydown', window.startOptionsKeyHandler);
            delete window.startOptionsKeyHandler;
        } 
    } catch (e) {}

    // Hide startOptions overlay if open to show load menu in its place
    try {
        const startOpts = document.getElementById('startOptions');
        if (startOpts && startOpts.parentNode) {
            startOpts.parentNode.removeChild(startOpts);
        }
    } catch (e) {}

    const loadOverlay = document.createElement('div');
    loadOverlay.id = 'loadOverlay';
    Object.assign(loadOverlay.style, {
        position: 'absolute', top: '65%', left: '50%', transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', gap: '12px', padding: '18px', borderRadius: '10px',
        background: 'transparent', backdropFilter: 'none', zIndex: '12', color: '#fff'
    });

    try {
        const overlayBgImg = document.createElement('img');
        overlayBgImg.src = 'images/imagens de fundo/fundo do menuprincipal/fundo do menu.png';
        overlayBgImg.alt = '';
        overlayBgImg.style.position = 'absolute';
        overlayBgImg.style.left = '50%';
        overlayBgImg.style.top = '40%';
        overlayBgImg.style.width = '120%';
        overlayBgImg.style.height = '126%';
        overlayBgImg.style.transform = 'translate(-50%, -50%)';
        overlayBgImg.style.objectFit = 'flex';
        overlayBgImg.style.opacity = '1';
        overlayBgImg.style.pointerEvents = 'none';
        overlayBgImg.style.transition = 'width 300ms ease, height 300ms ease, opacity 300ms ease, transform 300ms ease';
        overlayBgImg.style.zIndex = '-1';
        loadOverlay.appendChild(overlayBgImg);
    } catch (e) {}

    const title = document.createElement('div');
    title.textContent = 'Carregar save';
    title.style.fontFamily = "'PixelFont', monospace";
    title.style.fontSize = '20px';
    title.style.color = '#ffd700';
    loadOverlay.appendChild(title);

    const slotsContainer = document.createElement('div');
    slotsContainer.style.display = 'flex';
    slotsContainer.style.flexDirection = 'column';
    slotsContainer.style.gap = '8px';

    // helper to get slot data (try SaveManager then localStorage)
    async function getSlot(i) {
        try {
            if (window.SaveManager && typeof SaveManager.loadSlot === 'function') {
                try { const s = await SaveManager.loadSlot(i); if (s) return s; } catch (e) {}
            }
        } catch (e) {}
        return null;
    }

    for (let i = 1; i <= 3; i++) {
        const row = document.createElement('div');
        row.classList.add('load-row');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.justifyContent = 'space-between';
        row.style.gap = '8px';

        const info = document.createElement('div');
        info.textContent = `Slot ${i}: (carregando...)`;
        info.style.fontFamily = "'PixelFont', monospace";
        info.style.fontSize = '16px';
        info.style.color = '#fff';
        row.appendChild(info);

        const btns = document.createElement('div');
        btns.style.display = 'flex';
        btns.style.gap = '8px';

    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Carregar';
    loadBtn.classList.add('overlay-button');
        loadBtn.style.padding = '6px 12px';
        loadBtn.style.background = 'linear-gradient(to right,#4caf50,#2e7d32)';
        loadBtn.style.border = 'none';
        loadBtn.style.color = 'white';
        loadBtn.style.borderRadius = '6px';

    const emptyBtn = document.createElement('button');
    emptyBtn.textContent = 'Vazio';
    emptyBtn.classList.add('overlay-button');
        emptyBtn.style.padding = '6px 12px';
        emptyBtn.style.background = 'rgba(255,255,255,0.06)';
        emptyBtn.style.border = 'none';
        emptyBtn.style.color = '#aaa';
        emptyBtn.style.borderRadius = '6px';

    // make loadBtn reachable by keyboard
    try { loadBtn.tabIndex = 0; } catch (e) {}
    btns.appendChild(loadBtn);
        row.appendChild(btns);
        slotsContainer.appendChild(row);

        // populate info and wire load
        (async (idx, infoEl, lbtn) => {
            const s = await getSlot(idx);
            if (!s) {
                infoEl.textContent = `Slot ${idx}: (vazio)`;
                lbtn.disabled = true;
                lbtn.style.opacity = '0.5';
                return;
            }
            const name = s.nome || `Slot ${idx}`;
            const dinheiro = (typeof s.dinheiro !== 'undefined') ? s.dinheiro : '—';
            const profundidade = (typeof s.profundidade !== 'undefined') ? s.profundidade : '—';
            
            // Format dates
            const formatDate = (timestamp) => {
                if (!timestamp) return '—';
                try {
                    const d = new Date(timestamp);
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    const hours = String(d.getHours()).padStart(2, '0');
                    const mins = String(d.getMinutes()).padStart(2, '0');
                    return `${day}/${month}/${year} ${hours}:${mins}`;
                } catch (e) { return '—'; }
            };
            
            const dataCriacao = formatDate(s.criadoEm);
            const dataModificacao = formatDate(s.modifiedAt);
            
            // Display info on multiple lines for better readability
            infoEl.innerHTML = `<div>${name}</div><div style="font-size:14px; color:#ccc; margin-top:4px;">💰 $${dinheiro} | 🕳 Profundidade: ${profundidade}</div><div style="font-size:12px; color:#aaa; margin-top:2px;">📅 Criado: ${dataCriacao} | 🕐 Último: ${dataModificacao}</div>`;
            lbtn.addEventListener('click', async function(e) {
                e.stopPropagation();
                try { setLastSlot(idx); } catch (e) {}
                try { if (window.OptionsMenu && typeof OptionsMenu.close === 'function') OptionsMenu.close(); } catch (e) {}
                try { startGame(); } catch (e) {}
                showLoadingTransition((removeTransition) => {
                    (async () => {
                        let loaded = null;
                        try { loaded = await getSlot(idx); } catch (e) { loaded = null; }


                        try {
                            if (loaded && typeof loaded.dinheiro !== 'undefined') {
                                try { money = Number(loaded.dinheiro) || 0; } catch (e) {}
                                if (typeof globalStats !== 'undefined') try { globalStats.moneyplus = Number(loaded.dinheiro) || 0; } catch (e) {}
                            }
                        } catch (e) {}

                        // restore shop/purchase state if present
                        try {
                            if (loaded && typeof loaded.recentPurchases !== 'undefined') {
                                try { recentPurchases = loaded.recentPurchases || {}; } catch (e) { recentPurchases = {}; }
                            }
                            // Don't restore transient purchaseHistory UI messages from saves.
                            try { purchaseHistory = []; } catch (e) { purchaseHistory = []; }
                            if (loaded && typeof loaded._charData !== 'undefined') {
                                try { if (typeof characterData !== 'undefined') { Object.assign(characterData, loaded._charData); } else { window.characterData = loaded._charData; } } catch (e) {}
                                try { if (typeof rebindGlobalLojaState === 'function') rebindGlobalLojaState(); } catch (e) {}
                            }
                            // Restore dynamic shop state (prices/counts) if present in the save
                            try {
                                if (loaded && typeof loaded.shopState === 'object' && loaded.shopState !== null && typeof shopItems !== 'undefined' && Array.isArray(shopItems)) {
                                    shopItems.forEach(it => {
                                        try {
                                            const st = loaded.shopState[it.nome];
                                            if (st) {
                                                if (typeof st.preco !== 'undefined') it.preco = Number(st.preco) || it.preco;
                                                if (typeof st.priceIncrement !== 'undefined') it.priceIncrement = st.priceIncrement || it.priceIncrement || 0;
                                                if (typeof st.compras !== 'undefined') it.compras = Number(st.compras) || 0;
                                                if (typeof st.disponivel !== 'undefined') it.disponivel = !!st.disponivel;
                                            }
                                        } catch (e) {}
                                    });
                                    try {
                                        if (typeof SECRET_ITEMS !== 'undefined' && Array.isArray(SECRET_ITEMS)) {
                                            SECRET_ITEMS.forEach(si => {
                                                try {
                                                    const st2 = loaded.shopState[si.nome];
                                                    if (st2) {
                                                        if (typeof st2.preco !== 'undefined') si.preco = Number(st2.preco) || si.preco;
                                                        if (typeof st2.priceIncrement !== 'undefined') si.priceIncrement = st2.priceIncrement || si.priceIncrement || 0;
                                                        if (typeof st2.compras !== 'undefined') si.compras = Number(st2.compras) || 0;
                                                        if (typeof st2.disponivel !== 'undefined') si.disponivel = !!st2.disponivel;
                                                    }
                                                } catch (e) {}
                                            });
                                        }
                                    } catch (e) {}
                                }
                            } catch (e) {}
                        } catch (e) {}

                        // Reset game first, then apply saved depth so it isn't overwritten by reset logic
                        try { resetGame({ pauseOnStart: false, showShop: true }); } catch (e) {}
                        try {
                            if (loaded && typeof loaded.profundidade !== 'undefined') {
                                try { salvoprofundidade = Math.floor(Number(loaded.profundidade) || 0); } catch (e) { salvoprofundidade = salvoprofundidade || 0; }
                                try { depthPoints = Number(loaded.profundidade) || 0; } catch (e) { depthPoints = depthPoints || 0; }
                                try { if (typeof onDepthChange === 'function') onDepthChange(depthPoints); } catch (e) {}
                            }
                        } catch (e) {}

                        // Restore per-slot tutorial state (shop + dungeon) without causing bleed
                        try {
                            const slotTutorials = (loaded && loaded.tutorials) ? loaded.tutorials : null;
                            try {
                                if (window.Tutorial) {
                                    let showShop;
                                    if (slotTutorials && typeof slotTutorials.showShopTutorial !== 'undefined') showShop = !!slotTutorials.showShopTutorial;
                                    else if (slotTutorials && typeof slotTutorials.shop !== 'undefined') showShop = !(slotTutorials.shop === true);
                                    else showShop = false;

                                    Tutorial.showShopTutorial = showShop;
                                    if (showShop && slotTutorials && slotTutorials.shop_tutorial_stage) {
                                        Tutorial._stage = slotTutorials.shop_tutorial_stage;
                                        Tutorial._typing.fullText = null;
                                        Tutorial._typing.revealedLength = 0;
                                        try { if (Tutorial._uiText && typeof Tutorial._uiText[Tutorial._stage + 'Text'] === 'string') Tutorial._initTyping(Tutorial._stage + 'Text'); else if (Tutorial._uiText && typeof Tutorial._uiText.shopTutorialText === 'string') Tutorial._initTyping('shopTutorialText'); } catch (e) {}
                                    } else if (slotTutorials && typeof slotTutorials.shop_tutorial_stage !== 'undefined') {
                                        Tutorial._stage = slotTutorials.shop_tutorial_stage;
                                        Tutorial._typing.fullText = null;
                                        Tutorial._typing.revealedLength = 0;
                                    }
                                    try { if (typeof Tutorial._detachListeners === 'function') Tutorial._detachListeners(); } catch (e) {}
                                    try { if (typeof Tutorial._attachListeners === 'function' && Tutorial.showShopTutorial) Tutorial._attachListeners(); } catch (e) {}
                                }
                            } catch (e) {}

                            try {
                                if (window.DungeonTutorial) {
                                    const slotDungeonStage = slotTutorials && slotTutorials.dungeon_tutorial_stage;
                                    const acceptedDungeon = slotTutorials && slotTutorials.accepted_dungeon_tutorial;
                                    if (slotDungeonStage) {
                                        DungeonTutorial._stage = slotDungeonStage;
                                        DungeonTutorial._typing.fullText = null;
                                        DungeonTutorial._typing.revealedLength = 0;
                                        // restore paused/movement-only flags from slot data
                                        try { DungeonTutorial._tutorialPaused = !!(slotTutorials && slotTutorials.tutorial_paused); } catch (e) {}
                                        try { DungeonTutorial._tutorialMovementOnly = !!(slotTutorials && slotTutorials.tutorial_movement_only); } catch (e) {}
                                        DungeonTutorial.showDungeonTutorial = true;
                                        try { if (typeof DungeonTutorial._detachListeners === 'function') DungeonTutorial._detachListeners(); } catch (e) {}
                                        try { if (typeof DungeonTutorial._attachListeners === 'function') DungeonTutorial._attachListeners(); } catch (e) {}
                                    } else {
                                        DungeonTutorial.showDungeonTutorial = !!acceptedDungeon;
                                        // still restore paused/movement-only flags when present
                                        try { DungeonTutorial._tutorialPaused = !!(slotTutorials && slotTutorials.tutorial_paused); } catch (e) {}
                                        try { DungeonTutorial._tutorialMovementOnly = !!(slotTutorials && slotTutorials.tutorial_movement_only); } catch (e) {}
                                        if (!DungeonTutorial.showDungeonTutorial) {
                                            try { if (typeof DungeonTutorial._detachListeners === 'function') DungeonTutorial._detachListeners(); } catch (e) {}
                                        }
                                    }
                                }
                            } catch (e) {}
                        } catch (e) {}

                        try { updateBodyStyles(true); } catch (e) {}
                        try { drawLoja(); } catch (e) {}
                        try { setTimeout(removeTransition, 400); } catch (e) {}
                    })();
                });
                // close overlay and cleanup keyboard handler
                if (loadOverlay && loadOverlay.parentNode) {
                    try { if (typeof loadOverlay._removeLoadKey === 'function') loadOverlay._removeLoadKey(); } catch (e) {}
                    loadOverlay.parentNode.removeChild(loadOverlay);
                }
            });
        })(i, info, loadBtn);
    }

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Voltar';
    closeBtn.classList.add('overlay-button');
    closeBtn.style.padding = '8px 16px';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '6px';
    closeBtn.style.background = 'linear-gradient(to right,#2196f3,#1565c0)';
    closeBtn.style.color = 'white';
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        // Cleanup keyboard handler before removing overlay
        try { if (typeof loadOverlay._removeLoadKey === 'function') loadOverlay._removeLoadKey(); } catch (e) {}
        if (loadOverlay && loadOverlay.parentNode) loadOverlay.parentNode.removeChild(loadOverlay);
        // Clean up load menu handler before reopening start menu
        try { if (typeof loadOverlay._removeLoadKey === 'function') loadOverlay._removeLoadKey(); } catch (e) {}
        // Restore main menu (startOptions) when closing load menu
        try { showStartOptions(); } catch (err) {}
    });

    loadOverlay.appendChild(slotsContainer);
    loadOverlay.appendChild(closeBtn);
    menu.appendChild(loadOverlay);

    // position the menu title above the load overlay and raise it a bit for better spacing
    try {
        const menuTitle = document.getElementById('menuTitle');
        if (menuTitle) {
            try { document.getElementById('menu').appendChild(menuTitle); } catch (e) {}
            try { menuTitle.style.position = 'absolute'; menuTitle.style.zIndex = '13'; } catch (e) {}
            setTimeout(() => {
                try {
                    const rect = loadOverlay.getBoundingClientRect();
                    const mtw = menuTitle.offsetWidth || (parseFloat(menuTitle.style.width) || 300);
                    const mth = menuTitle.offsetHeight || 80;
                    try { menuTitle.style.transition = 'all 300ms ease-in'; } catch (e) {}
                    // raise title slightly more than other overlays for clearer separation
                    menuTitle.style.left = (rect.left + rect.width / 2 - mtw / 2) + 'px';
                    menuTitle.style.top = (rect.top - mth - 60) + 'px';
                    setTimeout(() => { try { menuTitle.style.transition = ''; } catch (e) {} }, 360);
                } catch (e) {}
            }, 0);
        }
    } catch (e) {}

    // When opening the load overlay, remove keyboard focus from the main start options
    // and temporarily disable its key handler so keyboard navigation is exclusive to this modal.
    const _prevHandler = (typeof window.startOptionsKeyHandler !== 'undefined') ? window.startOptionsKeyHandler : null;
    try { if (_prevHandler) window.removeEventListener('keydown', _prevHandler); } catch (e) {}
    try { if (Array.isArray(focusable)) focusable.forEach(b => { try { b.classList.remove('kbd-focused'); b.blur(); } catch (e) {} }); } catch (e) {}

    // Keyboard navigation for loadOverlay: ArrowUp/ArrowDown to move between all buttons, Enter to interact, Escape to close
    (function attachLoadKeyboardNav() {
        const loadButtons = Array.from(loadOverlay.querySelectorAll('button')).filter(b => b.textContent === 'Carregar');
        if (!loadButtons || loadButtons.length === 0) return;
        
        // Include all navigable buttons: load buttons + close button
        const allButtons = [...loadButtons, closeBtn];
        let focused = 0;
        
        const makeFocus = (i) => {
            const n = allButtons.length;
            if (n === 0) return;
            // normalize requested index
            let target = ((i % n) + n) % n;
            // determine navigation direction: prefer forward unless caller requested backward
            let step = 1;
            try {
                if (typeof focused === 'number') {
                    const diff = i - focused;
                    step = diff === 0 ? 1 : (diff > 0 ? 1 : -1);
                }
            } catch (e) {}

            let attempts = 0;
            // advance in the chosen direction, skipping disabled buttons (but always allow closeBtn)
            while (attempts < n) {
                const btn = allButtons[target];
                if (!btn.disabled || btn === closeBtn) break;
                target = (target + step + n) % n;
                attempts++;
            }

            focused = target;
            allButtons.forEach(b => b.classList.remove('kbd-focused'));
            try { allButtons[focused].classList.add('kbd-focused'); allButtons[focused].focus(); } catch (e) {}
        };
        // initial focus: find first enabled button after slots are loaded
        setTimeout(() => {
            // Find first enabled button (skip disabled empty slots)
            let firstEnabledIdx = 0;
            for (let i = 0; i < allButtons.length; i++) {
                if (!allButtons[i].disabled || allButtons[i] === closeBtn) {
                    firstEnabledIdx = i;
                    break;
                }
            }
            makeFocus(firstEnabledIdx);
        }, 150);
        // Mouse hover should update focused index so mouse and keyboard behave consistently
        try {
            allButtons.forEach((b, idx) => {
                try { b.addEventListener('mouseover', () => { makeFocus(idx); }); } catch (e) {}
            });
        } catch (e) {}

        function onLoadKey(e) {
            if (!document.getElementById('loadOverlay')) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                if (loadOverlay && loadOverlay.parentNode) loadOverlay.parentNode.removeChild(loadOverlay);
                // Clean up load menu handler before reopening start menu
                try { window.removeEventListener('keydown', onLoadKey); } catch (e) {}
                // Restore main menu when pressing Escape
                try { showStartOptions(); } catch (e) {}
                return;
            }
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                // move to next button (including close button)
                makeFocus(focused + 1);
                return;
            }
            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                // move to previous button (including close button)
                makeFocus(focused - 1);
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                try {
                    const btn = allButtons[focused];
                    // Only trigger click if button is enabled (or if it's the close button)
                    if (!btn.disabled || btn === closeBtn) {
                        btn.click();
                    }
                    // If button is disabled, do nothing (already prevented)
                } catch (err) {}
                return;
            }
        }
        window.addEventListener('keydown', onLoadKey);
        // cleanup helper so other code can remove listener when overlay removed
        loadOverlay._removeLoadKey = () => { try { window.removeEventListener('keydown', onLoadKey); } catch (e) {} };
        // ensure cleanup when overlay removed by closeBtn
        const origClose = closeBtn.onclick;
        closeBtn.addEventListener('click', () => { try { loadOverlay._removeLoadKey(); } catch (e) {} });
    })();
}

        opcoesBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            // toggle the options panel anchored to the start button so it appears to the right
            try {
                    // prefer opcoesBtn as anchor; allow optional offsets via data-options-offset-x/y
                    const baseAnchor = opcoesBtn || document.getElementById('menu') || menu;
                    let anchor = baseAnchor;
                    try {
                        const dx = baseAnchor && baseAnchor.dataset ? parseFloat(baseAnchor.dataset.optionsOffsetX || '-600') : 0;
                        const dy = baseAnchor && baseAnchor.dataset ? parseFloat(baseAnchor.dataset.optionsOffsetY || '200') : 0;
                        if (baseAnchor && (dx || dy)) {
                            const srcRect = baseAnchor.getBoundingClientRect();
                            anchor = {
                                getBoundingClientRect: () => ({
                                    left: srcRect.left + dx,
                                    right: srcRect.right + dx,
                                    top: srcRect.top + dy,
                                    bottom: srcRect.bottom + dy,
                                    width: srcRect.width,
                                    height: srcRect.height
                                })
                            };
                        }
                    } catch (err) {}
                    if (window.OptionsMenu && typeof window.OptionsMenu.toggle === 'function') window.OptionsMenu.toggle(anchor);
                } catch (e) {}
        });

        sairBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            // close overlay and hide menu before attempting to exit
            closeAndHideMenu();
            // attempt to exit the app: prefer Neutralino, then window.close(), then fallback
            function tryExit() {
                try {
                    if (typeof Neutralino !== 'undefined' && Neutralino.app && Neutralino.app.exit) {
                        Neutralino.app.exit();
                        return;
                    }
                } catch (err) {}
                try {
                    // window.close may be blocked in some browsers
                    if (typeof window.close === 'function') {
                        window.close();
                        return;
                    }
                } catch (err) {}
                // final fallback: navigate away
                try { window.location.href = 'about:blank'; } catch (e) {}
            }

            setTimeout(tryExit, 120);
        });

    // clicking outside should NOT close the options per request
    overlay.addEventListener('click', function(e) { e.stopPropagation(); });

        function onKey(e) {
            if (e.key === 'Escape') {
                // Do nothing on Escape in main menu - keep menu open
                e.preventDefault();
                return;
            }
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                setFocus(focusedIndex + 1);
                return;
            }
            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                setFocus(focusedIndex - 1);
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                try { focusable[focusedIndex].click(); } catch (err) {}
            }
        }

        window.startOptionsKeyHandler = onKey;
        window.addEventListener('keydown', window.startOptionsKeyHandler);

    // initial focus for keyboard navigation
    setTimeout(() => setFocus(0), 50);

    // restore start button when overlay closes
        const originalClose = closeOptions;
        closeOptions = function() {
            // restore start button visuals immediately (no animation)
            if (startBtnEl) {
                try {
                    startBtnEl.style.transition = '';
                    startBtnEl.style.opacity = prevStartStyles.opacity || '1';
                    startBtnEl.style.transform = prevStartStyles.transform || 'translateY(0)';
                    // restore previous transition flag immediately
                    try { startBtnEl.style.transition = prevStartStyles.transition || ''; } catch (e) {}
                } catch (e) {}
            }
            // call original cleanup
            try { originalClose(); } catch (e) {}
        };
    }

    document.getElementById('startButton').addEventListener('click', function(e) {
        // ignore clicks during title animation
        if (!window.__titleAnimationComplete) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        showStartOptions();
    });

// Reveal the menu background when the Start button is pressed
    try {
        const startBtnEl = document.getElementById('startButton');
        if (startBtnEl) {
            startBtnEl.addEventListener('click', function() {
                try { revealMenuBackground(); } catch (e) {}
            });
        }
    } catch (e) {}

    
    startKeyHandler = function(e) {
        if (e.key === 'Enter' || e.code === 'Enter') {
            if (menu.style.display === 'none') return;
            // If title animation not complete, ignore Enter
            if (!window.__titleAnimationComplete) {
                try { e.preventDefault(); e.stopPropagation(); } catch (err) {}
                return;
            }
            // If title animation complete but Start button not yet shown, Enter should reveal the button
            if (!window.__startButtonShown) {
                try { e.preventDefault(); e.stopPropagation(); } catch (err) {}
                try { showStartButtonTrigger(); } catch (err) {}
                return;
            }
            // Otherwise proceed to open start options if slot selection overlay not open
            if (!document.getElementById('slotSelectionOverlay')) {
                try { e.preventDefault(); } catch (err) {}
                try { revealMenuBackground(); } catch (err) {}
                try { showStartOptions(); } catch (err) {}
            }
        }
    };
    window.addEventListener('keydown', startKeyHandler);
}

function aplicarEstilosMenuInicial() {
    
    document.documentElement.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
    document.body.style.height = '100vh';
    document.body.style.backgroundColor = '#5e5e5e';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.scrollbarWidth = 'none';
    document.documentElement.style.msOverflowStyle = 'none';
    const style = document.createElement('style');
    style.id = 'kbd-styles';
    style.textContent = `::-webkit-scrollbar { display: none; }
/* Remove visual focus rings and outlines for overlay buttons and kbd-focused state */
.kbd-focused { outline: none !important; box-shadow: none !important; transform: none !important; }
.kbd-focused:focus { outline: none !important; box-shadow: none !important; }
button.kbd-focused { border-radius: 0; }
/* Make focused overlay option text gold */
.overlay-button.kbd-focused, #startOptions button.kbd-focused, #slotSelectionOverlay button.kbd-focused, #loadOverlay button.kbd-focused, #startButton.kbd-focused {
    color: #ffd700 !important;
}
/* Ensure native focus rings are also suppressed for these controls */
button:focus, button:focus-visible, .overlay-button:focus, .overlay-button:focus-visible, #startOptions button:focus, #startOptions button:focus-visible, #startButton:focus, #startButton:focus-visible {
    outline: none !important;
    box-shadow: none !important;
}
/* Normalize overlay buttons: consistent vertical size and alignment */
.overlay-button, #startOptions button, #slotSelectionOverlay button, #loadOverlay button {
    box-sizing: border-box;
    min-height: 40px; /* fixed visual height for uniformity */
    height: 40px; /* force buttons to same height */
    padding: 0 14px; /* left/right padding preserved; vertical padding removed to keep height consistent */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'PixelFont', monospace;
    background: transparent !important;
    border: none !important;
#}
/* Hover state: show gold text and pointer */
.overlay-button:hover, #startOptions button:hover, #slotSelectionOverlay button:hover, #loadOverlay button:hover, #startButton:hover {
    color: #ffd700 !important;
    cursor: pointer;
}
/* Smooth transitions for color changes */
.overlay-button, #startOptions button, #slotSelectionOverlay button, #loadOverlay button, #startButton {
    transition: color 160ms ease, opacity 160ms ease, text-shadow 160ms ease;
}
/* Slot selection rows: subtle hover to highlight the row */
.slot-row { display:flex; align-items:center; gap:10px; }
.slot-row:hover { color: #ffd700 !important; }
.slot-row input { transition: border-color 160ms ease, color 160ms ease; }
.slot-row input:focus { border-color: #ffd700 !important; outline: none !important; }
/* Load menu row hover */
.load-row:hover { color: #ffd700 !important; }
.load-row:hover button { color: #ffd700 !important; cursor: pointer; }
/* Ensure inputs align nicely with the normalized buttons in slot selection */
#slotSelectionOverlay input[type="text"] {
    height: 32px;
    box-sizing: border-box;
    padding: 6px 10px;
}
`;
    document.head.appendChild(style);

    
    const menuElement = document.getElementById('menu');
    menuElement.style.position = 'absolute';
    menuElement.style.top = '0';
    menuElement.style.left = '0';
    menuElement.style.width = '100vw';
    menuElement.style.height = '100vh';
    menuElement.style.display = 'flex';
    menuElement.style.justifyContent = 'center';
    menuElement.style.alignItems = 'center';
    menuElement.style.overflow = 'hidden';

    
    const menuBackground = document.getElementById('menuBackground');
    menuBackground.style.position = 'absolute';
    menuBackground.style.top = '50';
    menuBackground.style.left = '50';
    menuBackground.style.width = '100vw';
    menuBackground.style.height = '100vh';
    menuBackground.style.objectFit = 'fill';
    menuBackground.style.zIndex = '-1';

    
    const startButton = document.getElementById('startButton');
    startButton.style.padding = '15px 40px';
    startButton.style.fontSize = '20px';
    startButton.style.fontWeight = 'bold';
    startButton.style.background = 'transparent';
    startButton.style.color = 'white';
    startButton.style.border = 'none';
    startButton.style.marginTop = '4vh';
    startButton.style.position = 'relative';
    startButton.style.overflow = 'visible';
    startButton.style.borderRadius = '10px';
    startButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    startButton.style.cursor = 'pointer';
    startButton.style.transition = '';
    startButton.style.zIndex = '1';
    // hide button until animation completes and user clicks
    startButton.style.display = 'none';
    startButton.addEventListener('mouseover', function () {
        startButton.style.transform = 'scale(1.05)';
        startButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
    });
    startButton.addEventListener('mouseout', function () {
        startButton.style.transform = 'scale(1)';
        startButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    });
}

function criarMenuInicialEDOM() {
    
    var menu = document.createElement('div');
    menu.id = 'menu';
    menu.style.fontFamily = "'PixelFont', monospace";
    var menuBg = document.createElement('video');
    menuBg.id = 'menuBackground';
    menuBg.autoplay = true;
    menuBg.muted = true;
    menuBg.loop = true;
    var source = document.createElement('source');
    source.src = 'media/fundo.mp4';
    source.type = 'video/mp4';
    menuBg.appendChild(source);
    var startBtn = document.createElement('button');
    startBtn.id = 'startButton';
    startBtn.textContent = 'Adentrar as Profundezas';
    startBtn.style.fontFamily = "'PixelFont";
    // make the start button a positioned container so a configurable background image
    // (like the overlays) can be inserted behind the text and be sized/positioned via data-attrs
    startBtn.style.position = 'relative';
    startBtn.style.overflow = 'visible';
    startBtn.style.background = 'transparent';
    startBtn.style.width = '15%';
    startBtn.style.height = '15%';
    startBtn.style.border = 'none';
    try {
        const startBgImg = document.createElement('img');
        startBgImg.src = startBtn.dataset.bgSrc || 'images/imagens de fundo/fundo do menuprincipal/buot.png';
        startBgImg.alt = '';
        startBgImg.style.position = 'absolute';
        startBgImg.style.left = startBtn.dataset.bgLeft || '46%';
        startBgImg.style.top = startBtn.dataset.bgTop || '50%';
        startBgImg.style.width = startBtn.dataset.bgWidth || '170%';
        startBgImg.style.height = startBtn.dataset.bgHeight || '170%';
        startBgImg.style.transform = startBtn.dataset.bgTransform || 'translate(-50%, -50%)';
        startBgImg.style.objectFit = startBtn.dataset.bgFit || 'flex';
        startBgImg.style.opacity = (typeof startBtn.dataset.bgOpacity !== 'undefined') ? startBtn.dataset.bgOpacity : '1';
        startBgImg.style.pointerEvents = 'none';
        startBgImg.style.zIndex = '-1';
        startBgImg.style.transition = 'width 300ms ease, height 300ms ease, opacity 300ms ease, transform 300ms ease';
        startBtn.appendChild(startBgImg);
    } catch (e) {}
    menu.appendChild(menuBg);

    // central content container holding title above the start button
    var menuContent = document.createElement('div');
    menuContent.id = 'menuContent';
    menuContent.style.position = 'absolute';
    menuContent.style.top = '0';
    menuContent.style.left = '0';
    menuContent.style.width = '100%';
    menuContent.style.height = '100%';
    menuContent.style.display = 'flex';
    menuContent.style.flexDirection = 'column';
    menuContent.style.alignItems = 'center';
    menuContent.style.justifyContent = 'center';
    menuContent.style.gap = '3vh';
    menuContent.style.zIndex = '2';

    var menuTitle = document.createElement('img');
    menuTitle.id = 'menuTitle';
    menuTitle.src = 'images/imagens de fundo/fundo do menuprincipal/titulo.png';
    menuTitle.alt = 'Título';
    menuTitle.style.width = 'clamp(220px, 40vw, 800px)';
    menuTitle.style.height = 'auto';
    menuTitle.style.objectFit = 'contain';
    menuTitle.style.pointerEvents = 'none';

    // place title above start button
    menuContent.appendChild(menuTitle);
    menuContent.appendChild(startBtn);
    menu.appendChild(menuContent);
    document.body.appendChild(menu);

    
    var gameContainer = document.createElement('div');
    gameContainer.className = 'game-container';
    var canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.width = 0;
    canvas.height = 0;
    gameContainer.appendChild(canvas);
    document.body.appendChild(gameContainer);
}

function criarIntroVideoEDOM() {
    var introVideo = document.createElement('div');
    introVideo.id = 'introVideo';
    var video = document.createElement('video');
    video.id = 'gameIntro';
    video.setAttribute('preload', 'auto');
    video.setAttribute('playsinline', '');
    video.setAttribute('autoplay', ''); 
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'contain';
    video.style.border = 'none'; 
    video.style.outline = 'none'; 
    var source = document.createElement('source');
    source.src = 'media/videointroducao.mp4'; 
    source.type = 'video/mp4';
    video.appendChild(source);
    video.innerHTML += 'Seu navegador não suporta vídeos.';
    introVideo.appendChild(video);
    var info = document.createElement('div');
    info.textContent = 'Clique para iniciar o vídeo - Pressione qualquer tecla para pular';
    info.style.position = 'absolute';
    info.style.bottom = '20px';
    info.style.right = '20px';
    info.style.color = 'white';
    info.style.fontFamily = 'PixelFont';
    introVideo.appendChild(info);
    introVideo.style.position = 'fixed';
    introVideo.style.top = '0';
    introVideo.style.left = '0';
    introVideo.style.width = '100%';
    introVideo.style.height = '100%';
    introVideo.style.background = 'black';
    introVideo.style.zIndex = '9999';
    document.body.appendChild(introVideo);
}


criarIntroVideoEDOM();


if (!document.getElementById('menu')) {
    criarMenuInicialEDOM();
}
