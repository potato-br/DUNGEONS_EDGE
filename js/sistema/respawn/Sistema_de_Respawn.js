// ==========================
// ===== SISTEMA DE RESPAWN =====
// ==========================
let isRespawning = false; // Flag para indicar se o jogador está renascendo
let isInvulnerable = false; // Flag para indicar se o jogador está invulnerável (NÃO USAR MAIS, usar DASH.isInvulnerable)

function respawnPlayer() {
  if (isRespawning) return; // Evita múltiplos respawns simultâneos

  // Limpa partículas antigas
  particles.length = 0;

  const plataformaAlvo = getLowestVisiblePlatform();

  if (plataformaAlvo) {
   
    // Remove todos os inimigos da tela
    enemies.length = 0;
    // Reinicia as cerras ao respawnar
    serras.length = 0;
    if (typeof spawnCerras !== "undefined") {
      spawnCerras.lastSpawn = undefined;
    }

    // Reset player states
    player.velocityX = 0;
    player.velocityY = 0;
    player.jumpCount = 0;
    player.isJumping = false;

    // Reset ice physics
    if (icePhysics) {
      icePhysics.iceVelocity = 0;
      icePhysics.wasOnIce = false;
    }

  
    // Posiciona o jogador
    player.x = plataformaAlvo.x + Math.random() * (plataformaAlvo.width - player.width);
    player.y = plataformaAlvo.y - player.height - 5;
    
    // Força sprite parado ao respawn e durante todo o processo
    if (typeof setPlayerSpriteRow === 'function') {
      setPlayerSpriteRow(1);
      player._idleTimer = 0; // Reset idle timer to prevent animation changes
    }

    lastEnemyAllowedTime = performance.now() + 2000; // Bloqueia spawn de inimigos por 2s
    lastSerraAllowedTime = lastEnemyAllowedTime + 1000; // Bloqueia spawn de serras por 3s (1s após inimigos)

    isRespawning = true; // Ativa a flag de renascimento
    pausar();
  } else {
    
  }
}

function pausar({ piscadas = 5, velocidade = 180, tempoPausa = 1080 } = {}) {
  gameState = 'respawnando';
  player.visible = false;
  isRespawning = true; // Garante que flag está ativa durante todo o processo
  setPlayerSpriteRow(1); // Força sprite parado no início da pausa

  let blinkCount = 0;
  let blinkInterval;

  // Calcula o tempo total necessário para todas as piscadas
  const totalBlinkTime = velocidade * piscadas;
  
  // Garante que tempoPausa seja maior que o tempo total de piscadas
  tempoPausa = Math.max(tempoPausa, totalBlinkTime + 100);

  blinkInterval = setInterval(() => {
    if (blinkCount < piscadas) {
      player.visible = !player.visible;
      if (player.visible) {
        setPlayerSpriteRow(1); // Mantém sprite parado a cada piscada
      }
      blinkCount++;
    } else {
      clearInterval(blinkInterval);
      player.visible = true;
      setPlayerSpriteRow(1); // Garante sprite parado ao terminar piscada
    }
  }, velocidade);

  // Garante que o jogo só volta após todas as piscadas terminarem
  setTimeout(() => {
    if (blinkInterval) {
      clearInterval(blinkInterval);
    }
    player.visible = true;
    gameState = 'jogando';
    isRespawning = false;
    setPlayerSpriteRow(1); // Garante sprite parado uma última vez
  }, tempoPausa);
}

function getLowestVisiblePlatform() {
  let alvo = null;
  let fantasmaInvisivel = null;
  let fantasmaVisivel = null;
  let countNormais = 0;

  for (let i = 0; i < plataformas.length; i++) {
    const plat = plataformas[i];
    // Se a plataforma estiver dentro da tela (visível)
    if (plat.y + plat.height < screenHeight) {
      if (plat.type === PLATFORM_TYPES.FANTASMA) {
        if (plat.visible) {
          fantasmaVisivel = plat;
        } else {
          fantasmaInvisivel = plat;
        }
      } else {
        countNormais++;
        if (!alvo || plat.y > alvo.y) {
          alvo = plat;  // Salva a mais baixa visível
        }
      }
    }
  }

  // Failsafe: se só houver plataforma fantasma e ela estiver invisível, força ela a aparecer
  if (!alvo && fantasmaInvisivel && countNormais === 0) {
    fantasmaInvisivel.fadeState = 'fadeIn';
    fantasmaInvisivel.fadeTimer = 0;
    fantasmaInvisivel.visible = true;
    alvo = fantasmaInvisivel;
  } else if (!alvo && fantasmaVisivel) {
    alvo = fantasmaVisivel;
  }

  // Se não encontrou nenhuma, cria uma plataforma normal de emergência
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