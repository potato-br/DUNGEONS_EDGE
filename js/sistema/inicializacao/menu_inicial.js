function setupMenuInicial(onStart) {
    const menu = document.getElementById('menu');
    const introVideo = document.getElementById('introVideo');
    const videoElement = document.getElementById('gameIntro');
    let videoStarted = false;
    let menuReady = false;
    let startKeyHandler = null;

    menu.style.display = 'none';
    menu.style.opacity = '0';

    var canvas = document.getElementById('gameCanvas');

    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = '#000';

    function skipIntro(event) {
        if (event) event.preventDefault();
        introVideo.style.display = 'none';

        menu.style.opacity = '0';
        menu.style.display = 'flex';

        try {
            if (typeof AudioManager !== 'undefined') {
                const name = 'menu_music';
                try {
                    // Apply saved volumes (if any) before starting/fading music so the
                    // fade target will be the user's configured value.
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

                    // start or ensure menu music playing
                    if (typeof AudioManager.playMusic === 'function') {
                        try { AudioManager.playMusic(name, { loop: true }); } catch (e) {}
                    }
                    else if (AudioManager.ensureMusicPlaying) {
                        try { AudioManager.ensureMusicPlaying(name, { loop: true }); } catch (e) {}
                    }

                    // fade the actual audio element from 0 -> target over ~800ms
                    try {
                        const a = AudioManager.assets && AudioManager.assets[name];
                        if (a) {
                            try { a.volume = 0; } catch (e) {}
                            // compute fade target preferring saved musicVolume
                            let target = 0.6;
                            try {
                                if (typeof OptionsMenu !== 'undefined' && OptionsMenu.getSettings) {
                                    const s = OptionsMenu.getSettings();
                                    if (s && typeof s.musicVolume === 'number') target = Number(s.musicVolume);
                                    else if (AudioManager && typeof AudioManager.getDefaultMusicVolume === 'function') target = AudioManager.getDefaultMusicVolume();
                                } else if (AudioManager && typeof AudioManager.getDefaultMusicVolume === 'function') {
                                    target = AudioManager.getDefaultMusicVolume();
                                }
                                // Keep AudioManager internal value consistent
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
            }
        } catch (e) {}

        menu.style.transform = 'scale(0.5) rotate(-15deg) translateY(100px)';
        menu.style.transition = 'all 2s cubic-bezier(0.34, 1.56, 0.64, 1)';
        menu.style.filter = 'brightness(0) blur(10px)';

        setTimeout(function() {
            menu.style.opacity = '1';
            menu.style.transform = 'scale(1) rotate(0deg) translateY(0)';
            menu.style.filter = 'brightness(1) blur(0px)';

            setTimeout(function() {
                var menuBg = document.getElementById('menuBackground');
                var startBtn = document.getElementById('startButton');

                if (menuBg) {
                    menuBg.style.transition = 'all 1.5s ease-out';
                    menuBg.style.opacity = '1';
                    menuBg.style.transform = 'scale(1)';
                }

                if (startBtn) {
                    startBtn.style.transition = 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    startBtn.style.opacity = '1';
                    startBtn.style.transform = 'translateY(0)';
                    startBtn.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.6)';
                }

                setTimeout(() => {
                    menuReady = true;
                }, 1000);
            }, 500);
        }, 100);

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
        try { if (window.startOptionsKeyHandler) { window.removeEventListener('keydown', window.startOptionsKeyHandler); try { delete window.startOptionsKeyHandler; } catch (e) {} } } catch (e) {}
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

    // Show a small two-option overlay: Novo Jogo (starts) and Opções (no-op for now)
    function showStartOptions() {
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
                startBtnEl.style.transition = 'opacity 220ms ease, transform 220ms ease';
                // slight upward motion while fading
                requestAnimationFrame(() => {
                    startBtnEl.style.opacity = '0';
                    startBtnEl.style.transform = (prevStartStyles.transform ? prevStartStyles.transform + ' ' : '') + 'translateY(-8px) scale(0.98)';
                });
            } catch (e) {}
        }

        const overlay = document.createElement('div');
        overlay.id = 'startOptions';
        overlay.style.position = 'absolute';
        overlay.style.top = '50%';
        overlay.style.left = '50%';
        overlay.style.transform = 'translate(-50%, -50%)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.gap = '12px';
        overlay.style.padding = '18px';
        overlay.style.borderRadius = '10px';
        overlay.style.background = 'rgba(0,0,0,0.6)';
        overlay.style.backdropFilter = 'blur(4px)';
        overlay.style.zIndex = '5';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 300ms ease, transform 300ms ease';
        overlay.style.transform += ' translateY(8px)';

    const novoBtn = document.createElement('button');
    novoBtn.textContent = 'Novo Jogo';
    novoBtn.classList.add('overlay-button');
    // create Opções button early so Continuar can be inserted before it
    const opcoesBtn = document.createElement('button');
    opcoesBtn.textContent = 'configurações';
    opcoesBtn.classList.add('overlay-button');
    opcoesBtn.style.padding = '10px 22px';
    opcoesBtn.style.fontFamily = "'PixelFont', monospace";
    opcoesBtn.style.fontSize = '18px';
    opcoesBtn.style.borderRadius = '8px';
    opcoesBtn.style.border = 'none';
    opcoesBtn.style.cursor = 'pointer';
    opcoesBtn.style.background = 'linear-gradient(to right, #2196f3, #1565c0)';
    opcoesBtn.style.color = 'white';

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
                    continuarBtn.style.padding = '10px 22px';
                    continuarBtn.style.fontFamily = "'PixelFont', monospace";
                    continuarBtn.style.fontSize = '18px';
                    continuarBtn.style.borderRadius = '8px';
                    continuarBtn.style.border = 'none';
                    continuarBtn.style.cursor = 'pointer';
                    continuarBtn.style.background = 'linear-gradient(to right, #ff9800, #f57c00)';
                    continuarBtn.style.color = 'white';
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
                    carregarBtn.style.padding = '10px 22px';
                    carregarBtn.style.fontFamily = "'PixelFont', monospace";
                    carregarBtn.style.fontSize = '16px';
                    carregarBtn.style.borderRadius = '8px';
                    carregarBtn.style.border = 'none';
                    carregarBtn.style.cursor = 'pointer';
                    carregarBtn.style.background = 'linear-gradient(to right, #9c27b0, #6a1b9a)';
                    carregarBtn.style.color = 'white';
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

                                            // Dungeon tutorial: restore per-slot stage/visibility/flags explicitly.
                                            // Only toggle `showDungeonTutorial` when the slot provides explicit info
                                            // (stage or acceptance). Always restore paused/movement flags when present
                                            // so transient behavior is preserved even if visibility isn't encoded.
                                            try {
                                                const slotDungeonStage = slotTutorials && slotTutorials.dungeon_tutorial_stage;
                                                const acceptedDungeon = (slotTutorials && typeof slotTutorials.accepted_dungeon_tutorial !== 'undefined') ? slotTutorials.accepted_dungeon_tutorial : undefined;
                                                const hasPaused = !!(slotTutorials && typeof slotTutorials.tutorial_paused !== 'undefined');
                                                const hasMovementOnly = !!(slotTutorials && typeof slotTutorials.tutorial_movement_only !== 'undefined');
                                                if (window.DungeonTutorial) {
                                                    if (typeof slotDungeonStage !== 'undefined') {
                                                        // Explicit saved stage: restore stage and show overlay
                                                        DungeonTutorial._stage = slotDungeonStage;
                                                        DungeonTutorial._typing.fullText = null;
                                                        DungeonTutorial._typing.revealedLength = 0;
                                                        if (hasPaused) {
                                                            try { DungeonTutorial._tutorialPaused = !!slotTutorials.tutorial_paused; } catch (e) {}
                                                        }
                                                        if (hasMovementOnly) {
                                                            try { DungeonTutorial._tutorialMovementOnly = !!slotTutorials.tutorial_movement_only; } catch (e) {}
                                                        }
                                                        DungeonTutorial.showDungeonTutorial = true;
                                                        try { if (typeof DungeonTutorial._detachListeners === 'function') DungeonTutorial._detachListeners(); } catch (e) {}
                                                        try { if (typeof DungeonTutorial._attachListeners === 'function') DungeonTutorial._attachListeners(); } catch (e) {}
                                                    } else if (typeof acceptedDungeon !== 'undefined') {
                                                        // Explicit acceptance flag only: restore visibility accordingly
                                                        DungeonTutorial.showDungeonTutorial = !!acceptedDungeon;
                                                        if (hasPaused) {
                                                            try { DungeonTutorial._tutorialPaused = !!slotTutorials.tutorial_paused; } catch (e) {}
                                                        }
                                                        if (hasMovementOnly) {
                                                            try { DungeonTutorial._tutorialMovementOnly = !!slotTutorials.tutorial_movement_only; } catch (e) {}
                                                        }
                                                        try { if (!DungeonTutorial.showDungeonTutorial) { if (typeof DungeonTutorial._detachListeners === 'function') DungeonTutorial._detachListeners(); } else { if (typeof DungeonTutorial._detachListeners === 'function') DungeonTutorial._detachListeners(); if (typeof DungeonTutorial._attachListeners === 'function') DungeonTutorial._attachListeners(); } } catch (e) {}
                                                    } else {
                                                        // No explicit visibility/stage info: restore paused/movement flags if present
                                                        if (hasPaused) {
                                                            try { DungeonTutorial._tutorialPaused = !!slotTutorials.tutorial_paused; } catch (e) {}
                                                        }
                                                        if (hasMovementOnly) {
                                                            try { DungeonTutorial._tutorialMovementOnly = !!slotTutorials.tutorial_movement_only; } catch (e) {}
                                                        }
                                                        // Do not change visibility or listeners when the slot lacks explicit info
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
        novoBtn.style.padding = '10px 22px';
        novoBtn.style.fontFamily = "'PixelFont', monospace";
        novoBtn.style.fontSize = '18px';
        novoBtn.style.borderRadius = '8px';
        novoBtn.style.border = 'none';
        novoBtn.style.cursor = 'pointer';
        novoBtn.style.background = 'linear-gradient(to right, #4caf50, #2e7d32)';
        novoBtn.style.color = 'white';

    // base buttons already appended earlier
        
        const sairBtn = document.createElement('button');
    sairBtn.textContent = 'Sair';
    sairBtn.classList.add('overlay-button');
    sairBtn.style.padding = '10px 22px';
    sairBtn.style.fontFamily = "'PixelFont', monospace";
    sairBtn.style.fontSize = '18px';
    sairBtn.style.borderRadius = '8px';
    sairBtn.style.border = 'none';
    sairBtn.style.cursor = 'pointer';
    sairBtn.style.background = 'linear-gradient(to right, #f44336, #b71c1c)';
    sairBtn.style.color = 'white';
    overlay.appendChild(sairBtn);
        menu.appendChild(overlay);

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

        // animate in
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            overlay.style.transform = overlay.style.transform.replace(' translateY(8px)', '');
        });

        function closeOptions() {
            if (!overlay) return;
            overlay.style.opacity = '0';
            overlay.style.transform = overlay.style.transform + ' translateY(8px)';
            setTimeout(() => {
                if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
                try { window.removeEventListener('keydown', window.startOptionsKeyHandler || onKey); } catch (e) {}
                try { delete window.startOptionsKeyHandler; } catch (e) {}
                menu.focus?.();
            }, 300);
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
            try { window.removeEventListener('keydown', window.startOptionsKeyHandler || onKey); } catch (e) {}
            try { delete window.startOptionsKeyHandler; } catch (e) {}
            // do not restore start button styles (keep hidden)
        }

        novoBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeOptions();
            try { if (window.OptionsMenu && typeof window.OptionsMenu.close === 'function') window.OptionsMenu.close(); } catch (e) {}
            showSlotSelectionMenu();
        });
// Exibe seleção de 3 slots de save ao iniciar novo jogo
function showSlotSelectionMenu() {
    const menu = document.getElementById('menu');

    // Cria overlay para seleção de slots
    const slotOverlay = document.createElement('div');
    slotOverlay.id = 'slotSelectionOverlay';
    slotOverlay.style.position = 'absolute';
    slotOverlay.style.top = '50%';
    slotOverlay.style.left = '50%';
    slotOverlay.style.transform = 'translate(-50%, -50%)';
    slotOverlay.style.display = 'flex';
    slotOverlay.style.flexDirection = 'column';
    slotOverlay.style.alignItems = 'center';
    slotOverlay.style.gap = '18px';
    slotOverlay.style.padding = '28px';
    slotOverlay.style.borderRadius = '12px';
    slotOverlay.style.background = 'rgba(0,0,0,0.8)';
    slotOverlay.style.backdropFilter = 'blur(6px)';
    slotOverlay.style.zIndex = '10';
    slotOverlay.style.opacity = '0';
    slotOverlay.style.transition = 'opacity 300ms ease, transform 300ms ease';
    slotOverlay.style.transform += ' translateY(12px)';

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
        slotDiv.style.display = 'flex';
        slotDiv.style.alignItems = 'center';
        slotDiv.style.gap = '10px';
        slotDiv.style.marginBottom = '8px';

    const slotBtn = document.createElement('button');
    slotBtn.textContent = `Slot ${i}`;
    slotBtn.classList.add('overlay-button');
        slotBtn.style.padding = '10px 22px';
        slotBtn.style.fontFamily = "'PixelFont', monospace";
        slotBtn.style.fontSize = '18px';
        slotBtn.style.borderRadius = '8px';
        slotBtn.style.border = 'none';
        slotBtn.style.cursor = 'pointer';
        slotBtn.style.background = 'linear-gradient(to right, #ffd700, #ff0829)';
        slotBtn.style.color = 'white';

        // Input para nome do slot
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = 'Nome do save';
        nameInput.style.fontFamily = "'PixelFont', monospace";
        nameInput.style.fontSize = '16px';
        nameInput.style.borderRadius = '6px';
        nameInput.style.border = '1px solid #ffd700';
        nameInput.style.padding = '6px 10px';
        nameInput.style.width = '140px';

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
                        // Try to load existing slot to preserve unknown fields, then overwrite the fields we control
                        let existing = null;
                        try { if (window.SaveManager && typeof SaveManager.loadSlot === 'function') existing = await SaveManager.loadSlot(i); } catch (e) { existing = null; }
                        try { /* rely on SaveManager only */ } catch (e) { existing = existing || null; }

                        const now = Date.now();
                        const saveObj = Object.assign({}, existing || {}, { nome: slotName, criadoEm: existing && existing.criadoEm ? existing.criadoEm : now, modifiedAt: now });
                        // Ensure newly created slots explicitly indicate the shop tutorial
                        // has NOT been seen so the tutorial appears on first play.
                        try {
                            // Always reset tutorial flags for a new/overwritten slot so the
                            // shop tutorial starts at the consent stage and the dungeon
                            // tutorial is reset to its initial state.
                            saveObj.tutorials = Object.assign({}, saveObj.tutorials || {}, {
                                showShopTutorial: true,
                                shop_tutorial_stage: 'consent',
                                accepted_dungeon_tutorial: false,
                                dungeon_tutorial_stage: 'welcomeIntro',
                                _tutorial_End: false,
                                tutorial_paused: false,
                                tutorial_movement_only: false
                            });
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

        slotDiv.appendChild(slotBtn);
        slotDiv.appendChild(nameInput);
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
                for (let i = 1; i <= 3; i++) {
                    const slotDiv = slotOverlay.children[i+1]; // warningTop + title + slots
                    slotRows.push([
                        slotDiv.querySelector('button'),
                        slotDiv.querySelector('input')
                    ]);
                }
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
                    // Corrige limites
                    r = Math.max(0, Math.min(r, slotRows.length - 1));
                    // Se última linha, só coluna 0
                    if (r === slotRows.length - 1) c = 0;
                    else c = Math.max(0, Math.min(c, 1));
                    row = r; col = c;
                    const el = slotRows[row][col];
                    if (el) {
                        el.classList.add('kbd-focused');
                        el.focus();
                    }
                }
                function onMatrixKey(e) {
                    if (!document.getElementById('slotSelectionOverlay')) return;
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
                                                // Try to load existing slot to preserve unknown fields, then overwrite the fields we control
                                                let existing = null;
                                                try { if (window.SaveManager && typeof SaveManager.loadSlot === 'function') existing = await SaveManager.loadSlot(row+1); } catch (e) { existing = null; }
                                                try { /* rely on SaveManager only */ } catch (e) { existing = existing || null; }

                                                const now = Date.now();
                                                const saveObj = Object.assign({}, existing || {}, { nome: slotName, criadoEm: existing && existing.criadoEm ? existing.criadoEm : now, modifiedAt: now });
                                                // Ensure newly created/overwritten slots start with consent
                                                try {
                                                    saveObj.tutorials = Object.assign({}, saveObj.tutorials || {}, {
                                                        showShopTutorial: true,
                                                        shop_tutorial_stage: 'consent',
                                                        accepted_dungeon_tutorial: false,
                                                        dungeon_tutorial_stage: 'welcomeIntro',
                                                        _tutorial_End: false,
                                                        tutorial_paused: false,
                                                        tutorial_movement_only: false
                                                    });
                                                } catch (e) {}
                                                try { saveObj.dinheiro = (typeof money !== 'undefined') ? Number(money) : (saveObj.dinheiro || 0); } catch (e) { saveObj.dinheiro = saveObj.dinheiro || 0; }
                                                try { saveObj.profundidade = (typeof salvoprofundidade !== 'undefined') ? Math.floor(Number(salvoprofundidade) || 0) : (saveObj.profundidade || 0); } catch (e) { saveObj.profundidade = saveObj.profundidade || 0; }
                                                
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
        showStartOptions();
    });
    slotOverlay.appendChild(backBtn);

    // Remove botão Iniciar Jogo se existir
    const startBtn = document.getElementById('startButton');
    if (startBtn) startBtn.style.display = 'none';
    menu.appendChild(slotOverlay);
    // animação de entrada
    requestAnimationFrame(() => {
        slotOverlay.style.opacity = '1';
        slotOverlay.style.transform = slotOverlay.style.transform.replace(' translateY(12px)', '');
    });

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

        const confirm = document.createElement('div');
        confirm.id = 'replaceConfirm';
        Object.assign(confirm.style, {
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', borderRadius: '10px',
            background: 'rgba(0,0,0,0.9)', zIndex: '30', color: '#fff', alignItems: 'center'
        });

        const msg = document.createElement('div');
        msg.textContent = `Slot ${slotIndex} já contém um save. Deseja substituir por "${newName}"?`;
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
        const no = document.createElement('button');
        no.textContent = 'Não';
        no.classList.add('overlay-button');

        btnRow.appendChild(yes);
        btnRow.appendChild(no);
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
    } catch (e) {}
}

// Abre menu de carregamento de saves (escolher slot 1..3)
function openLoadMenu() {
    const menu = document.getElementById('menu');
    if (!menu) return;
    if (document.getElementById('loadOverlay')) return; // já aberto

    const loadOverlay = document.createElement('div');
    loadOverlay.id = 'loadOverlay';
    Object.assign(loadOverlay.style, {
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', gap: '12px', padding: '18px', borderRadius: '10px',
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: '12', color: '#fff'
    });

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
            infoEl.textContent = `Slot ${idx}: ${name} — $${dinheiro}`;
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
                                    const acceptedDungeon = (slotTutorials && typeof slotTutorials.accepted_dungeon_tutorial !== 'undefined') ? slotTutorials.accepted_dungeon_tutorial : undefined;
                                    const hasPaused = !!(slotTutorials && typeof slotTutorials.tutorial_paused !== 'undefined');
                                    const hasMovementOnly = !!(slotTutorials && typeof slotTutorials.tutorial_movement_only !== 'undefined');
                                    if (typeof slotDungeonStage !== 'undefined') {
                                        DungeonTutorial._stage = slotDungeonStage;
                                        DungeonTutorial._typing.fullText = null;
                                        DungeonTutorial._typing.revealedLength = 0;
                                        if (hasPaused) {
                                            try { DungeonTutorial._tutorialPaused = !!slotTutorials.tutorial_paused; } catch (e) {}
                                        }
                                        if (hasMovementOnly) {
                                            try { DungeonTutorial._tutorialMovementOnly = !!slotTutorials.tutorial_movement_only; } catch (e) {}
                                        }
                                        DungeonTutorial.showDungeonTutorial = true;
                                        try { if (typeof DungeonTutorial._detachListeners === 'function') DungeonTutorial._detachListeners(); } catch (e) {}
                                        try { if (typeof DungeonTutorial._attachListeners === 'function') DungeonTutorial._attachListeners(); } catch (e) {}
                                    } else if (typeof acceptedDungeon !== 'undefined') {
                                        DungeonTutorial.showDungeonTutorial = !!acceptedDungeon;
                                        if (hasPaused) {
                                            try { DungeonTutorial._tutorialPaused = !!slotTutorials.tutorial_paused; } catch (e) {}
                                        }
                                        if (hasMovementOnly) {
                                            try { DungeonTutorial._tutorialMovementOnly = !!slotTutorials.tutorial_movement_only; } catch (e) {}
                                        }
                                        try { if (!DungeonTutorial.showDungeonTutorial) { if (typeof DungeonTutorial._detachListeners === 'function') DungeonTutorial._detachListeners(); } else { if (typeof DungeonTutorial._detachListeners === 'function') DungeonTutorial._detachListeners(); if (typeof DungeonTutorial._attachListeners === 'function') DungeonTutorial._attachListeners(); } } catch (e) {}
                                    } else {
                                        if (hasPaused) {
                                            try { DungeonTutorial._tutorialPaused = !!slotTutorials.tutorial_paused; } catch (e) {}
                                        }
                                        if (hasMovementOnly) {
                                            try { DungeonTutorial._tutorialMovementOnly = !!slotTutorials.tutorial_movement_only; } catch (e) {}
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
                // close overlay
                if (loadOverlay && loadOverlay.parentNode) loadOverlay.parentNode.removeChild(loadOverlay);
                try { _restoreMainFocus(); } catch (e) {}
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
        if (loadOverlay && loadOverlay.parentNode) loadOverlay.parentNode.removeChild(loadOverlay);
        try { _restoreMainFocus(); } catch (err) {}
    });

    loadOverlay.appendChild(slotsContainer);
    loadOverlay.appendChild(closeBtn);
    menu.appendChild(loadOverlay);

    // When opening the load overlay, remove keyboard focus from the main start options
    // and temporarily disable its key handler so keyboard navigation is exclusive to this modal.
    const _prevMainFocusedIndex = (typeof focusedIndex !== 'undefined') ? focusedIndex : null;
    try { window.removeEventListener('keydown', window.startOptionsKeyHandler || onKey); } catch (e) {}
    try { if (Array.isArray(focusable)) focusable.forEach(b => { try { b.classList.remove('kbd-focused'); b.blur(); } catch (e) {} }); } catch (e) {}

    function _restoreMainFocus() {
        try { window.startOptionsKeyHandler = onKey; window.addEventListener('keydown', window.startOptionsKeyHandler); } catch (e) {}
        try {
            if (typeof _prevMainFocusedIndex === 'number' && typeof setFocus === 'function') {
                // small timeout to allow overlay removal to complete
                setTimeout(() => { try { setFocus(_prevMainFocusedIndex); } catch (e) {} }, 40);
            } else {
                try { const sb = document.getElementById('startButton'); if (sb) sb.focus(); } catch (e) {}
            }
        } catch (e) {}
    }

    // Keyboard navigation for loadOverlay: ArrowUp/ArrowDown to move between enabled load buttons, Enter to load, Escape to close
    (function attachLoadKeyboardNav() {
        const loadButtons = Array.from(loadOverlay.querySelectorAll('button')).filter(b => b.textContent === 'Carregar');
        if (!loadButtons || loadButtons.length === 0) return;
        let focused = 0;
        const makeFocus = (i) => {
            // find next enabled
            let j = i;
            const n = loadButtons.length;
            for (let k = 0; k < n; k++) {
                const idx = (j + k + n) % n;
                if (!loadButtons[idx].disabled) {
                    focused = idx;
                    break;
                }
            }
            loadButtons.forEach(b => b.classList.remove('kbd-focused'));
            try { loadButtons[focused].classList.add('kbd-focused'); loadButtons[focused].focus(); } catch (e) {}
        };
        // initial focus: first enabled
        makeFocus(0);

        function onLoadKey(e) {
            if (!document.getElementById('loadOverlay')) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                if (loadOverlay && loadOverlay.parentNode) loadOverlay.parentNode.removeChild(loadOverlay);
                try { _restoreMainFocus(); } catch (e) {}
                window.removeEventListener('keydown', onLoadKey);
                return;
            }
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                // move to next enabled
                const n = loadButtons.length;
                for (let k = 1; k <= n; k++) {
                    const idx = (focused + k) % n;
                    if (!loadButtons[idx].disabled) { makeFocus(idx); break; }
                }
                return;
            }
            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const n = loadButtons.length;
                for (let k = 1; k <= n; k++) {
                    const idx = (focused - k + n) % n;
                    if (!loadButtons[idx].disabled) { makeFocus(idx); break; }
                }
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                try { loadButtons[focused].click(); } catch (err) {}
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
                const anchor = document.getElementById('startButton') || menu;
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
                e.preventDefault();
                closeOptions();
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
            // restore start button visuals
            if (startBtnEl) {
                try {
                    startBtnEl.style.transition = 'opacity 200ms ease, transform 200ms ease';
                    requestAnimationFrame(() => {
                        startBtnEl.style.opacity = prevStartStyles.opacity || '1';
                        startBtnEl.style.transform = prevStartStyles.transform || 'translateY(0)';
                    });
                    // after restore, put back previous transition if any
                    setTimeout(() => {
                        try { startBtnEl.style.transition = prevStartStyles.transition || ''; } catch (e) {}
                    }, 250);
                } catch (e) {}
            }
            // call original cleanup
            try { originalClose(); } catch (e) {}
        };
    }

    document.getElementById('startButton').addEventListener('click', showStartOptions);

    
    startKeyHandler = function(e) {
        if (e.key === 'Enter' && menu.style.display !== 'none') {
            // Só executa se o overlay de seleção de slot NÃO estiver aberto
            if (!document.getElementById('slotSelectionOverlay')) {
                e.preventDefault();
                showStartOptions();
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
.kbd-focused { outline: 3px solid rgba(255,215,0,0.95); box-shadow: 0 8px 28px rgba(255,215,0,0.12); transform: translateY(-3px) scale(1.02); }
.kbd-focused:focus { outline: 3px solid rgba(255,215,0,1); }
button.kbd-focused { border-radius: 8px; }
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
}
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
    startButton.style.background = 'linear-gradient(to right,rgb(209, 192, 37), #ff0829)';
    startButton.style.color = 'white';
    startButton.style.border = 'none';
    startButton.style.marginTop = '480px';
    startButton.style.borderRadius = '10px';
    startButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    startButton.style.cursor = 'pointer';
    startButton.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
    startButton.style.zIndex = '1';
    startButton.focus();
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
    var menuBg = document.createElement('img');
    menuBg.id = 'menuBackground';
    menuBg.src = 'images/imagens de fundo/fundo do menuprincipal/meu-fundo.gif';
    menuBg.alt = 'Menu Fundo';
    var startBtn = document.createElement('button');
    startBtn.id = 'startButton';
    startBtn.textContent = 'Iniciar Jogo';
    startBtn.style.fontFamily = "'PixelFont', monospace";
    menu.appendChild(menuBg);
    menu.appendChild(startBtn);
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
