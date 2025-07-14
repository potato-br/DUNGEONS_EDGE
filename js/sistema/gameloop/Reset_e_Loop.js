// ==========================
// ===== RESET E LOOP =====
// ==========================
function resetGame({ pauseOnStart = true, showShop = false, il = true, la = false } = {}) {
  frameCount = 0; // Reset frame count
  Object.assign(player, { velocityY: 0, isJumping: false, jumpCount: 0 });
  isGameOver = false;
  serras = [];
  
  // Reset do sistema da bomba de fumaça do Ninja
  NINJA.smokeBombActive = false;
  ninjaSmokeBombCooldown = false;
  ninjaSmokeBombTimer = 0;
  
  drawlateral();
  if (il) {
     ajustarCanvas(); // Garante que o player esteja visível
  } else if (!il) {
    ajustarCanvas(false); // Garante que o canvas tenha largura fixa
  }
 if (la) {
   drawlateral();
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
  
  // Reseta cooldowns do Ninja
  if (activeCharacter === 'Kuroshi, o Ninja') {
    NINJA.smokeBombActive = false;
    ninjaSmokeBombCooldown = false;
    ninjaSmokeBombTimer = 0;
  }// Define a vida inicial ou usa o upgrade se tiver
  if (liveupgrade > 0) {
    live = liveupgrade;
  } else {
    live = 0; // Vida inicial padrão
  }
  enemies = [];
  moedas = []; // <--- Adiciona esta linha para resetar as moedas
  createInitialPlataforma();
  direction = 'right';
  if (showShop) {
    gameState = 'loja';
   
    selectedIndex = 0;
  } else {
    gameState = firstGamePlay ? 'tutorial' : 'jogando';
    firstGamePlay = false; // Just set to false after first time
    lastEnemyAllowedTime = performance.now() + 2000;
    lastSerraAllowedTime = lastEnemyAllowedTime + 1000; // Bloqueia spawn de serras por 3s (1s após inimigos)
    if (pauseOnStart) {
      pausar();
    }
  }
  // reachedEndGame = false; // removido pois não é mais usado
  
  // Reset temporary items - only decrease by 1
  if (characterData[activeCharacter]?.purchases) {
    const purchases = characterData[activeCharacter].purchases;
    shopItems.forEach(item => {
      if (item.isTemporary && purchases[item.nome] && purchases[item.nome] > 0) {
        purchases[item.nome]--; // Decrease by 1 instead of resetting to 0
      }
    });
  }
  
  // Reset end game flag removido (Chave do Portal Final removida)
}



function gameLoop(now = performance.now()) {
    requestAnimationFrame(gameLoop);
    const elapsed = now - lastFrameTime;
    if (elapsed < fpsInterval) return;
    lastFrameTime = now - (elapsed % fpsInterval);

    frameCount++;

    // Handle intro tutorial state
    if (gameState === 'intro_tutorial') {
        updateIntroTutorial(now);
        drawIntroTutorial();
        return;
    }
    
    // Verifica os inputs de estado do jogo
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
  checarInvulnerabilidade(); // Adicionar esta linha
  updateCooldowns(now); // Garante atualização dos cooldowns do dash e bomba de fumaça
  movePlayer();
  handleDash(now);
  movePlataformas();
  // Always update ice particles
  icePhysics.updateParticles();
  // Ice physics are now handled inside movePlayer()


   updateEnemies();
    spawnEnemies(now);
 if (typeof updateCerras === "function") updateCerras();
 if (typeof spawnCerras === "function") spawnCerras();
  
  updateMoedas();
  checkMoedaCollision();

  if (gameState !== 'gameover') {
    
    checkSerraCollision();
    if (typeof checkCerrasCollision === "function") checkCerrasCollision();
    checkVoidFall();
    checkEnemyCollision();
  } else {
    // Salva recorde se for maior
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
    // Limpa o canvas e só desenha a loja, nada mais
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLoja();
    return;
  }

  // Limpa o canvas e desenha na ordem correta  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (typeof drawlateral === 'function') drawlateral();
  drawBackground();
  drawPlataformas();
  if (typeof drawMoedas === 'function') drawMoedas();
  // Draw dash ghost trails before the player
  if (typeof drawDashGhosts === 'function') drawDashGhosts(ctx);
  drawPlayer();
  drawCerras();
  drawEnemies();
  
  // Draw ice particles
  icePhysics.draw(ctx);
  
  // Só desenha HUD se não estiver em game over
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
  
  // Mostra todas as hitboxes se debug ativado
  if (typeof drawAllHitboxes === 'function') drawAllHitboxes();
}

function gameOver() {
  if (live > 0) {
    respawnPlayer();
  } else {
    gameState = 'gameover';
    isGameOver = true;
    keys = {};
    reachedEndGame = false; // Reset end game state on death
  }
}