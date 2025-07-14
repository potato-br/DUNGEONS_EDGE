// ==========================
// ===== INIMIGOS =====
// ==========================

function createEnemy() {
  // Ajuste do tamanho baseado no sprite
  const width = 32;  // Largura menor para hitbox mais precisa
  const height = 32; // Altura menor para hitbox mais precisa
  // Faz os inimigos aparecerem em toda a tela, mas com maior densidade no centro
  // Distribuição: 60% dos inimigos no centro (30% a 70%), 40% nas bordas
  let x;
  if (Math.random() < 0.6) {
    // Centro: 30% a 70% da área jogável
    const minX = gamePlayArea.x + (gamePlayArea.width * 0.3);
    const maxX = gamePlayArea.x + (gamePlayArea.width * 0.7) - width;
    x = minX + Math.random() * (maxX - minX);
  } else {
    // Bordas: 0-30% ou 70-100% da área jogável
    if (Math.random() < 0.5) {
      // Esquerda
      x = gamePlayArea.x + Math.random() * (gamePlayArea.width * 0.3);
    } else {
      // Direita
      x = gamePlayArea.x + (gamePlayArea.width * 0.7) + Math.random() * (gamePlayArea.width * 0.3) - width;
    }
  }
  
  return {
    x,
    y: -height,
    width,
    height,
    speedY: 0.5 + Math.random() * 1, // Slower vertical descent
    baseX: x, // Original X position for swinging
    swingOffset: 0, // Current swing offset
    swingSpeed: 0.03 + Math.random() * 0.02, // Speed of swing
    swingAmplitude: 30 + Math.random() * 30, // How far it swings
    swingDirection: 1, // Add this new property for bounce direction
    isDetached: false, // Nova propriedade para controlar se soltou da teia
    detachDistance: 200 + Math.random() * 100, // Distância antes de soltar (entre 200-300 pixels)
    initialY: -height, // Guardar posição inicial para calcular distância
  };
}

// Usa a função rectIntersect do arquivo de colisões, não declare novamente aqui!

// Adiciona sistema de partículas
const particles = [];

function createParticles(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + Math.random() * 30 - 15,
      y: y + Math.random() * 30 - 15,
      vx: Math.random() * 6 - 3,
      vy: Math.random() * -4 - 2,
      life: 1,
      color: color
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2; // Gravidade
    p.life -= 0.02;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles() {
  particles.forEach(p => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 3, 3);
  });
  ctx.globalAlpha = 1;
}

function updateEnemies() {
  if (isRespawning) return;
  const now = performance.now();
  
  updateParticles(); // Atualiza partículas existentes

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];

    // Verifica se deve soltar da teia
    if (!e.isDetached && (e.y - e.initialY) >= e.detachDistance) {
      e.isDetached = true;
      e.speedY = 2 + Math.random() * 3; // Velocidade de queda mais rápida após soltar
    }

    if (!e.isDetached) {
      // Movimento na teia
      e.y += e.speedY;
      e.swingOffset += e.swingSpeed * e.swingDirection;
      const nextX = e.baseX + Math.sin(e.swingOffset) * e.swingAmplitude;
      
      // Verifica colisão com os limites e faz bounce
      if (nextX < gamePlayArea.x || nextX + e.width > gamePlayArea.x + gamePlayArea.width) {
        e.swingDirection *= -1; // Inverte direção
        e.swingSpeed *= 0.8; // Reduz velocidade no bounce
        e.swingAmplitude *= 0.9; // Reduz amplitude no bounce
        
        // Cria efeito de partículas na colisão
        createParticles(
          nextX < gamePlayArea.x ? gamePlayArea.x : gamePlayArea.x + gamePlayArea.width,
          e.y + e.height/2,
          3,
          '#CCCCCC'
        );
      }
      
      e.x = e.baseX + Math.sin(e.swingOffset) * e.swingAmplitude;
    } else {
      // Movimento após soltar da teia - queda livre
      e.y += e.speedY;
    }

    // Verificar colisão com plataformas
    let removeEnemy = false;
    for (let j = plataformas.length - 1; j >= 0; j--) {
      const platform = plataformas[j];
      if (platform.ignoreEnemyCollision) continue;
      if (rectIntersect(e, platform)) {
        removeEnemy = true;
        platform.hitCount = (platform.hitCount || 0) + 1;
        platform.isFlashing = true;
        // Efeito de sacudir ao ser atingida por inimigo
        if (platform.type === PLATFORM_TYPES.MOVEL) {
          // Não altera velocidade nem moveSpeed!
          platform.shakeTimer = 0;
          platform.shakeMagnitude = 0;
        } else if (!platform.isInitial) {
          platform.shakeTimer = 10;
          platform.shakeMagnitude = 4;
        } 
        // Cria partículas no ponto de impacto
        createParticles(e.x + e.width/2, e.y + e.height/2, 10, '#FF4444');

        // Define a área superior onde as plataformas podem ser quebradas (25% da tela)
        const breakableZone = screenHeight * 0.29;

       

        // Se a plataforma estiver na zona quebrável (parte superior da tela) e atingiu o limite de hits
        if (platform.y < breakableZone && platform.hitCount >= platform.maxHits && !platform.isInitial) {
          
          // Só marca como quebrada se ainda não estiver quebrando ou já finalizada
          if (!platform.broken && !platform.brokenDone) {
            platform.broken = true;
            platform.breakAnimTime = 0;
            platform.breakStartY = platform.y;
          }
          // Não remove ainda
        }
        break;
      }
    }

    // Remove a aranha se colidiu com plataforma ou saiu da tela
    if (removeEnemy || e.y > screenHeight) {
      enemies.splice(i, 1);
    }
  }
}

let lastEnemyAllowedTime = 0;

function spawnEnemies(now) {
  if (now < lastEnemyAllowedTime) return; // Bloqueia spawn de inimigos durante o delay
  if (isRespawning) return;
  if (now - lastEnemySpawn >= enemySpawnInterval) {
    const count = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      enemies.push(createEnemy());
    }
    lastEnemySpawn = now;
  }
}

function drawEnemies() {
  drawParticles();

  enemies.forEach(e => {
    if (!e.isDetached) {
      ctx.beginPath();
      ctx.strokeStyle = '#CCCCCC';
      ctx.lineWidth = 2;
      ctx.moveTo(e.baseX + e.width / 2, 0);
      ctx.lineTo(e.x + e.width / 2, e.y + 4);
      ctx.stroke();
    }

    const sprite = inimigoImages[0]; // usa a spritesheet
    if (sprite && sprite.complete) {
      const SPRITE_WIDTH = sprite.width / 2;  // 2 colunas
      const SPRITE_HEIGHT = sprite.height;    // 1 linha

      if (!e.spawnTime) e.spawnTime = Date.now();
      const tempo = Date.now() - e.spawnTime;
      const frame = Math.floor((tempo / 300) % 2); // alterna entre 0 e 1

      const sx = frame * SPRITE_WIDTH;
      const sy = 0;

      ctx.drawImage(
        sprite,
        sx, sy, SPRITE_WIDTH, SPRITE_HEIGHT, // recorte da sprite
        e.x, e.y, e.width, e.height          // onde desenhar na tela
      );
    } else {
      ctx.fillStyle = 'red';
      ctx.fillRect(e.x, e.y, e.width, e.height);
    }
  });
}


