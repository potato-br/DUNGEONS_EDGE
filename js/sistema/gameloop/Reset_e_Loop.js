


function resetGame({ pauseOnStart = true, showShop = false, il = true,  } = {}) {
  frameCount = 0; 
  Object.assign(player, { velocityY: 0, isJumping: false, jumpCount: 0 });
  isGameOver = false;
  serras = [];

  morcegos.length = 0;
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
    lastEnemyAllowedTime = performance.now() + 2000;
    lastSerraAllowedTime = lastEnemyAllowedTime + 1000; 
    if (pauseOnStart) {
      pausar();
    }
  }
  
  
  
  if (characterData[activeCharacter]?.purchases) {
    const purchases = characterData[activeCharacter].purchases;
    shopItems.forEach(item => {
      if (item.isTemporary && purchases[item.nome] && purchases[item.nome] > 0) {
        purchases[item.nome]--; 
      }
    });
  }
  
  
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
 if (typeof updateCerras === "function") updateCerras();
 if (typeof spawnCerras === "function") spawnCerras();
  
  updateMoedas();
  checkMoedaCollision();

  updateMorcegos(); 
  atualizarSpawnMorcegos(depthPoints); 

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
  }
}