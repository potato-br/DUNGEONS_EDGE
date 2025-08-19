


function resetGame({ pauseOnStart = true, showShop = false, il = true,  } = {}) {
  frameCount = 0; 
  Object.assign(player, { velocityY: 0, isJumping: false, jumpCount: 0 });
  isGameOver = false;
  serras = [];

  morcegos.length = 0;
  // limpar slimes (grandeInimigos) do jogo anterior, e liberar flags nas plataformas anexadas
  try {
    if (typeof grandeInimigos !== 'undefined') {
      for (const gi of grandeInimigos) {
        if (gi.attachedPlatform && gi.attachedPlatform._hasGrandeEnemy) gi.attachedPlatform._hasGrandeEnemy = false;
      }
      grandeInimigos.length = 0;
    }
    if (typeof lastGrandeInimigoSpawn !== 'undefined') lastGrandeInimigoSpawn = 0;
  } catch (e) {}
  SpawnSystem.inicializar();
  currentLateralLeftBg = lateralImages[0];
  nextLateralLeftBg = lateralImages[0];
  currentLateralRightBg =  lateralImages[0];
  nextLateralRightBg = lateralImages[0];
  lateralBackgroundY = 0;
  
  
  NINJA.smokeBombActive = false;
  ninjaSmokeBombCooldown = false;
  ninjaSmokeBombTimer = 0;

  if (il) {
     ajustarCanvas(); 
  } else if (!il) {
    ajustarCanvas(false); 
  }
 
      player.currentDashes = player.maxDashes;
      player.lastDashRecharge = 0;
  particles.length = 0;  dashCooldown = false;
  plataformas = [];
  DASH.trailActive = false;
        DASH.trailPoints = [];
        DASH.trailStack = [];
        DASH.startPoint = null;
  normalCount = -1;
  gameSpeed = 1;
  depthPoints = 0;
  trocaCount = 0;
  // ambient darkness timer (seconds) - reset so light returns on restart
  try { window.ambientDarknessTime = 0; } catch (e) {}
  
  
  if (activeCharacter === 'Kuroshi, o Ninja') {
    NINJA.smokeBombActive = false;
    ninjaSmokeBombCooldown = false;
    ninjaSmokeBombTimer = 0;
  }
  if (liveupgrade > 0) {
    live = liveupgrade;
  } else {
    live = 0; 
  }
  // Ensure UI doesn't animate from previous character's life count
  if (typeof previousLive !== 'undefined') previousLive = live;
  if (typeof animatingHearts !== 'undefined') animatingHearts = [];
  enemies = [];
  moedas = []; 
  createInitialPlataforma();
  direction = 'right';
  if (showShop) {
    gameState = 'loja';
   
    selectedIndex = 0;
  } else {
    gameState = firstGamePlay ? 'tutorial' : 'jogando';
    firstGamePlay = false; 
    // Default small grace before enemies/obstacles appear on a fresh start
    const DEFAULT_SPAWN_GRACE = 2000; // ms

    // Check if the activeCharacter has a savedStartDepth from a single-use shop item.
    // If present, start the player at that depth and consume the saved value (single-use).
      // prefer global saved start depth if present
      const globalSaved = _charData.__global && _charData.__global.savedStartDepth;
      const savedDepth = globalSaved || characterData[activeCharacter]?.savedStartDepth;
    if (typeof savedDepth === 'number' && savedDepth > 0) {
      // apply starting depth and increment the background/time accumulators so visual gradient
      // reflects the depth immediately
      depthPoints = savedDepth;
        // mark that this run used a saved start depth; if it was global, consume it from global
        window.currentRunUsedSavedStart = true;
        try {
          if (globalSaved) delete _charData.__global.savedStartDepth;
          else delete characterData[activeCharacter].savedStartDepth;
        } catch (e) {}
      // give a slightly larger grace window when appearing deep to avoid instant overwhelm
      lastEnemyAllowedTime = performance.now() + Math.max(DEFAULT_SPAWN_GRACE, 3500);
      lastSerraAllowedTime = lastEnemyAllowedTime + 1000;
      moneytime = lastEnemyAllowedTime;
      // also advance ambient darkness timer a little so background gradient responds
      try { window.ambientDarknessTime = Math.min((window.ambientDarknessTime || 0) + 10, AMBIENT_TIME_TO_MAX); } catch (e) {}
    } else {
      lastEnemyAllowedTime = performance.now() + DEFAULT_SPAWN_GRACE;
      lastSerraAllowedTime = lastEnemyAllowedTime + 1000;
      moneytime = lastEnemyAllowedTime;
    }
    if (pauseOnStart) {
      pausar();
    }
  }
  
  
  
  if (characterData[activeCharacter]?.purchases) {
    const purchases = characterData[activeCharacter].purchases;
    // decrement any temporary purchase counts (both regular shop items and secret items)
    const allItemsForTempCheck = (typeof shopItems !== 'undefined' ? shopItems : []).concat(typeof SECRET_ITEMS !== 'undefined' ? SECRET_ITEMS : []);
    allItemsForTempCheck.forEach(item => {
      if (!item) return;
      if (item.isTemporary && purchases[item.nome] && purchases[item.nome] > 0) {
        purchases[item.nome]--;
      }
    });
  }

  // Also decrement any global temporary purchases (for items purchased as globalItem)
  try {
    if (characterData.__global && characterData.__global.purchases) {
      const globalPurchases = characterData.__global.purchases;
      const allItems = (typeof shopItems !== 'undefined' ? shopItems : []).concat(typeof SECRET_ITEMS !== 'undefined' ? SECRET_ITEMS : []);
      allItems.forEach(item => {
        if (!item) return;
        if (item.isTemporary && item.globalItem && globalPurchases[item.nome] && globalPurchases[item.nome] > 0) {
          globalPurchases[item.nome]--;
        }
      });
    }
  } catch (e) {}
  
  
}



function gameLoop(now = performance.now()) {
    requestAnimationFrame(gameLoop);
    const elapsed = now - lastFrameTime;
    if (elapsed < fpsInterval) return;
    lastFrameTime = now - (elapsed % fpsInterval);

    frameCount++;

    
    if (gameState === 'intro_tutorial') {
        updateIntroTutorial(now);
        drawIntroTutorial();
        return;
    }
    
    
    if (gameState === 'gameover' && inputManager.isRestart()) {
        openShopWithTransition();
    }
    if (gameState === 'vitoria' && inputManager.isNext()) {
        resetGame({ pauseOnStart: true, showShop: false });
        gameState = 'jogando';
    }

    if (!isPaused && (gameState === 'jogando' || gameState === 'gameover' || gameState === 'tutorial') && !isRespawning) {
        update(now);
    }
    // advance ambient darkness timer while actually playing (not paused, not respawning, in 'jogando')
    try {
      if (!isPaused && !isRespawning && gameState === 'jogando') {
        window.ambientDarknessTime = (window.ambientDarknessTime || 0) + (elapsed / 1000);
        // clamp to reasonable max
        window.ambientDarknessTime = Math.min(window.ambientDarknessTime, AMBIENT_TIME_TO_MAX * 2);
      }
    } catch (e) {}
    updatePlayerAnimation();
    drawAll();

    if (isPaused) {
        drawPause();
    }
}

function update(now) {
  checarInvulnerabilidade(); 
  updateCooldowns(now); 
  movePlayer();
  handleDash(now);
  movePlataformas();
  
  icePhysics.updateParticles();
  


   updateEnemies();
    spawnEnemies(now);
  // spawn e update dos inimigos exclusivos das plataformas grandes
  if (typeof spawnGrandeInimigos === 'function') spawnGrandeInimigos(now);
  if (typeof updateGrandeInimigos === 'function') updateGrandeInimigos();
 if (typeof updateCerras === "function") updateCerras();
 if (typeof spawnCerras === "function") spawnCerras();
  
  updateMoedas();
  checkMoedaCollision();

  updateMorcegos(); 
  atualizarSpawnMorcegos(depthPoints); 

  // checagem de colisões para grande inimigos
  if (typeof checkGrandeInimigosCollision === 'function') checkGrandeInimigosCollision();

  if (gameState !== 'gameover') {
    
    checkMorcegoCollision(); 
    checkSerraCollision();
    if (typeof checkCerrasCollision === "function") checkCerrasCollision();
    checkVoidFall();
    checkEnemyCollision();
  } else {
    
    try {
      const record = Number(localStorage.getItem('recordDepth')) || 0;
      if (Math.floor(depthPoints) > record) {
        localStorage.setItem('recordDepth', Math.floor(depthPoints));
      }
    } catch (e) {}
  }
}

function drawAll() {
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
  drawMorcegos()
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
  if (gameState === 'tutorial') {
        drawTutorial();
    }
  
  
  if (typeof drawAllHitboxes === 'function') drawAllHitboxes();
}

function gameOver() {
  if (live > 0) {
    respawnPlayer();
  } else {
    gameState = 'gameover';
    isGameOver = true;
    keys = {};
    reachedEndGame = false; 
    // If the player used a saved-start item this run, consuming it should remove the
    // global saved depth for everyone (one died with it -> all lose it).
    try {
      if (window.currentRunUsedSavedStart && _charData && _charData.__global && _charData.__global.savedStartDepth) {
        delete _charData.__global.savedStartDepth;
      }
    } catch (e) {}
    // clear runtime flag
    window.currentRunUsedSavedStart = false;
  }
}