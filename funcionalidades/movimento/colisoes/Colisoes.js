// ==========================
// ===== COLISÕES =====
// ==========================
function rectIntersect(a, b) {
  // Sempre usa a hitbox se existir, nunca o retângulo padrão
  function getRect(obj) {
    if (obj && obj.hitbox && typeof obj.hitbox.width === 'number' && typeof obj.hitbox.height === 'number') {
      return {
        x: obj.x + (obj.hitbox.offsetX || 0),
        y: obj.y + (obj.hitbox.offsetY || 0),
        width: obj.hitbox.width,
        height: obj.hitbox.height
      };
    }
    return {
      x: obj.x,
      y: obj.y,
      width: obj.width,
      height: obj.height
    };
  }
  const ra = getRect(a);
  const rb = getRect(b);

  return ra.x < rb.x + rb.width &&
         ra.x + ra.width > rb.x &&
         ra.y < rb.y + rb.height &&
         ra.y + ra.height > rb.y;
}


function checkSerraCollision() {
  if (isRespawning || (typeof DASH !== 'undefined' && DASH.isInvulnerable)) return;
  let hit = false;
  for (let i = 0; i < serras.length; i++) {
    if (rectIntersect(player, serras[i])) {
      hit = true;
      break;
    }
  }
  if (hit) {
    aplicarInvulnerabilidade(1000, true); // Ativa invulnerabilidade antes de processar o dano
    live--;
    if (live < 0) {
      gameOver();
    }
  }
}

// Adicione esta função para tratar queda no void corretamente:
function checkVoidFall() {
    if (player.y > screenHeight && !isRespawning && gameState === "jogando") {
      
        // Cavaleiro's void resurrection ability
        if (activeCharacter === 'Roderick, o Cavaleiro' && CAVALEIRO.voidResurrectionAvailable) {
          // Usa função padronizada
          const now = performance.now();
          if (handleCavaleiroVoidResurrection(now)) {
            respawnPlayer();
            return;
          }
        } 
        // Normal void fall handling
        live--;
        if (live < 0) {
          gameOver();
        } else {
          cancelarInvulnerabilidade();
          pararPiscar();
          respawnPlayer();
        }
      }
}

function checkEnemyCollision() {
    if (isRespawning || (typeof DASH !== 'undefined' && DASH.isInvulnerable) || (typeof DASH !== 'undefined' && DASH.isDashing)) return;
    
    // Check for enemy collisions
    let hit = false;
    for (let i = 0; i < enemies.length; i++) {
        if (rectIntersect(player, enemies[i])) {
            hit = true;
            break;
        }
    }

    if (!hit) return;

    // Handle Valthor, o Mago's ability
    if (activeCharacter === 'Valthor, o Mago') {
        live--;
        if (live < 0) {
            gameOver();
        } else {
            // Clear ALL enemies
            enemies.length = 0;
            // Block enemy spawning for 8 seconds
            lastEnemyAllowedTime = performance.now() + 8000;
            // Apply longer invulnerability with less blinks
            aplicarInvulnerabilidade(6000, true); // 6 segundos de invulnerabilidade, 12 piscadas

            // Create magic blast effect
            for (let i = 0; i < 30; i++) {
                createParticles(
                    player.x + player.width/2,
                    player.y + player.height/2,
                    1,
                    'rgba(138, 43, 226, 0.8)',
                    {
                        speedX: Math.cos(i * Math.PI / 15) * 8,
                        speedY: Math.sin(i * Math.PI / 15) * 8,
                        fadeSpeed: 0.02,
                        size: 6,
                        gravity: 0
                    }
                );
            }
        }
        return;
    }

  // Sistema da bomba de fumaça do Ninja
  if (activeCharacter === 'Kuroshi, o Ninja') {
      ninjasmokebomb();
      if (ninjasmokebomb() === true) {
        // Se a bomba de fumaça está em cooldown, toma dano normalmente
        live--;
        if (live < 0) {
          gameOver();
        } else {
         aplicarInvulnerabilidade(1000, true);
        }
      }
    
    return;
  } 
  live--;
  if (live < 0) {
    gameOver();
  } else {
    aplicarInvulnerabilidade(1200, true); // Ativa invulnerabilidade antes de processar o dano
  }
}

function gameOver() {
  if (live > 0) {
    respawnPlayer();
  } else {
    gameState = 'gameover';
    isGameOver = true;
    keys = {};
  }
}

