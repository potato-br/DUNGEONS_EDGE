


function rectIntersect(a, b) {
  
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
    aplicarInvulnerabilidade(1000, true); 
    live--;
    if (live < 0) {
      gameOver();
    }
  }
}


function checkVoidFall() {
  if (player.y > screenHeight && !isRespawning && gameState === "jogando") {
    const now = performance.now();
    DASH.isInvulnerable = false;
    // Se personagem tem habilidade ativa, coloca em cooldown
    if (activeCharacter === 'Kuroshi, o Ninja' && NINJA.smokeBombActive) {
      NINJA.smokeBombActive = false;
      NINJA.smokeBombCooldown = true;
      NINJA.smokeBombTimer = now;
      NINJA.smokeBombCooldownStart = now;
    }
    if (activeCharacter === 'Valthor, o Mago' && MAGO.magicBlastActive) {
      MAGO.magicBlastActive = false;
      MAGO.magicBlastCooldown = true;
      MAGO.magicBlastCooldownStart = now;
    }
    if (activeCharacter === 'Roderick, o Cavaleiro' && CAVALEIRO.shieldActive) {
      CAVALEIRO.shieldActive = false;
      CAVALEIRO.shieldCooldown = true;
      CAVALEIRO.shieldCooldownStart = now;
    }
    // Cavaleiro: ressurreição do void
    if (activeCharacter === 'Roderick, o Cavaleiro' && CAVALEIRO.voidResurrectionAvailable) {
      if (handleCavaleiroVoidResurrection(now)) {
        // cavalier handled the void resurrection — do not play void SFX
        respawnPlayer();
        return;
      }
    }
    live--;
    if (live < 0) {
       try { AudioManager && typeof AudioManager.play === 'function' && AudioManager.play('void_sfx'); } catch (e) {}
      gameOver();
    } else {
      // play void sound when player actually falls (before decrementing life) with quick fade
  try { if (AudioManager && typeof AudioManager.playWithFade === 'function') AudioManager.playWithFade('void_sfx', 1000, { volume: 0.08 }); else if (AudioManager && typeof AudioManager.play === 'function') AudioManager.play('void_sfx'); } catch (e) {}
      cancelarInvulnerabilidade();
      pararPiscar();
      respawnPlayer();
    }
  }
}

function checkEnemyCollision() {
    if (isRespawning || (typeof DASH !== 'undefined' && DASH.isInvulnerable) || (typeof DASH !== 'undefined' && DASH.isDashing)) return;
    
    
    let hit = false;
    for (let i = 0; i < enemies.length; i++) {
        if (rectIntersect(player, enemies[i])) {
            hit = true;
            break;
        }
    }

    if (!hit) return;

    
    if (activeCharacter === 'Valthor, o Mago') {
        live--;
        if (live < 0) {
            gameOver();
        } else {
            
            enemies.length = 0;
            morcegos.length = 0;
      if (typeof grandeInimigos !== 'undefined') {
        // marcar as bloqueadas as plataformas que tinham slimes (impede respawn nelas), igual à habilidade do mago
        for (const gi of grandeInimigos) {
          if (gi.attachedPlatform) gi.attachedPlatform._hasGrandeEnemy = true;
        }
        grandeInimigos.length = 0;
      }

            lastMorcegoAllowedTime = performance.now() + 8000; 
            
            lastEnemyAllowedTime = performance.now() + 8000;
            
            aplicarInvulnerabilidade(6000, true); 

            
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
            // play generic player hit sfx for non-knight characters
            try { if (typeof AudioManager !== 'undefined' && AudioManager && typeof AudioManager.play === 'function') AudioManager.play('player_hit_sfx'); } catch (e) {}
            try { if (typeof AudioManager !== 'undefined' && AudioManager && typeof AudioManager.play === 'function') AudioManager.play('mage_damage_mystic_devastation_sfx'); } catch (e) {}
                // trigger visual pulse for rune shockwave when mage takes damage
                try { if (typeof MAGO !== 'undefined') MAGO.damagePulseTime = performance.now(); } catch (e) {}
        }
        return;
    }

  
  if (activeCharacter === 'Kuroshi, o Ninja') {
      ninjasmokebomb();
      if (ninjasmokebomb() === true) {
        
        live--;
        if (live < 0) {
          gameOver();
        } else {
         aplicarInvulnerabilidade(1000, true);
         // play generic player hit sfx for ninja
         try { if (typeof AudioManager !== 'undefined' && AudioManager && typeof AudioManager.play === 'function') AudioManager.play('player_hit_sfx'); } catch (e) {}
        }
      }
    
    return;
  } 
  live--;
  if (live < 0) {
    gameOver();
  } else {
    aplicarInvulnerabilidade(1200, true); 
    // play knight hit sfx when cavaleiro is damaged (non-lethal)
    try { if (activeCharacter === 'Roderick, o Cavaleiro' && typeof AudioManager !== 'undefined' && AudioManager && typeof AudioManager.play === 'function') AudioManager.play('knight_hit_sfx'); } catch (e) {}
  // play generic hit sfx for other characters
  try { if (activeCharacter !== 'Roderick, o Cavaleiro' && typeof AudioManager !== 'undefined' && AudioManager && typeof AudioManager.play === 'function') AudioManager.play('player_hit_sfx'); } catch (e) {}
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

