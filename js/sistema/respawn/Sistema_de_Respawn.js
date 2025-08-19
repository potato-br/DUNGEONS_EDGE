


let isRespawning = false; 
let isInvulnerable = false; 

function respawnPlayer() {
  if (isRespawning) return; 

  
  particles.length = 0;

  const plataformaAlvo = getLowestVisiblePlatform();

  if (plataformaAlvo) {
   
    
    enemies.length = 0;
     morcegos.length = 0;
     if (typeof grandeInimigos !== 'undefined') {
       for (const gi of grandeInimigos) {
         if (gi.attachedPlatform && gi.attachedPlatform._hasGrandeEnemy) gi.attachedPlatform._hasGrandeEnemy = false;
       }
       grandeInimigos.length = 0;
     }
    serras.length = 0;
    if (typeof spawnCerras !== "undefined") {
      spawnCerras.lastSpawn = undefined;
    }

    
    player.velocityX = 0;
    player.velocityY = 0;
    player.jumpCount = 0;
    player.isJumping = false;

    
    if (icePhysics) {
      icePhysics.iceVelocity = 0;
      icePhysics.wasOnIce = false;
    }

  
    
    player.x = plataformaAlvo.x + Math.random() * (plataformaAlvo.width - player.width);
    player.y = plataformaAlvo.y - player.height - 5;
    
    
    if (typeof setPlayerSpriteRow === 'function') {
      setPlayerSpriteRow(1);
      player._idleTimer = 0; 
    }

    lastEnemyAllowedTime = performance.now() + 2000; 
    lastSerraAllowedTime = lastEnemyAllowedTime + 1000; 

    isRespawning = true; 
    pausar();
  } else {
    
  }
}

function pausar({ piscadas = 5, velocidade = 180, tempoPausa = 1080 } = {}) {
  gameState = 'respawnando';
  player.visible = false;
  isRespawning = true; 
  setPlayerSpriteRow(1); 

  let blinkCount = 0;
  let blinkInterval;

  
  const totalBlinkTime = velocidade * piscadas;
  
  
  tempoPausa = Math.max(tempoPausa, totalBlinkTime + 100);

  blinkInterval = setInterval(() => {
    if (blinkCount < piscadas) {
      player.visible = !player.visible;
      if (player.visible) {
        setPlayerSpriteRow(1); 
      }
      blinkCount++;
    } else {
      clearInterval(blinkInterval);
      player.visible = true;
      setPlayerSpriteRow(1); 
    }
  }, velocidade);

  
  setTimeout(() => {
    if (blinkInterval) {
      clearInterval(blinkInterval);
    }
    player.visible = true;
    gameState = 'jogando';
    isRespawning = false;
    setPlayerSpriteRow(1); 
  }, tempoPausa);
}

function getLowestVisiblePlatform() {
  let alvo = null;
  let fantasmaInvisivel = null;
  let fantasmaVisivel = null;
  let countNormais = 0;

  for (let i = 0; i < plataformas.length; i++) {
    const plat = plataformas[i];
    
    if (plat.y + plat.height < screenHeight && !plat.falling) {
      if (plat.type === PLATFORM_TYPES.FANTASMA) {
        if (plat.visible) {
          fantasmaVisivel = plat;
        } else {
          fantasmaInvisivel = plat;
        }
      } else {
        countNormais++;
        if (!alvo || plat.y > alvo.y) {
          alvo = plat;  
        }
      }
    }
  }

  
  if (!alvo && fantasmaInvisivel && countNormais === 0) {
    fantasmaInvisivel.fadeState = 'fadeIn';
    fantasmaInvisivel.fadeTimer = 0;
    fantasmaInvisivel.visible = true;
    alvo = fantasmaInvisivel;
  } else if (!alvo && fantasmaVisivel) {
    alvo = fantasmaVisivel;
  }

  
  if (!alvo) {
    const canvas = document.getElementById('gameCanvas');
    const emergencyPlatform = platformFactory.createPlatform(PLATFORM_TYPES.NORMAL);
    emergencyPlatform.x = canvas.width/2 - emergencyPlatform.width/2;
    emergencyPlatform.y = canvas.height - 150;
    emergencyPlatform.isEmergency = true;
    plataformas.push(emergencyPlatform);
    alvo = emergencyPlatform;
  }

  return alvo;
}