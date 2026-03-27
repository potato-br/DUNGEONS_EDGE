



function createEnemy() {
  
  const width = 32;  
  const height = 32; 
  
  
  let x;
  if (Math.random() < 0.6) {
    
    const minX = gamePlayArea.x + (gamePlayArea.width * 0.3);
    const maxX = gamePlayArea.x + (gamePlayArea.width * 0.7) - width;
    x = minX + Math.random() * (maxX - minX);
  } else {
    
    if (Math.random() < 0.5) {
      
      x = gamePlayArea.x + Math.random() * (gamePlayArea.width * 0.3);
    } else {
      
      x = gamePlayArea.x + (gamePlayArea.width * 0.7) + Math.random() * (gamePlayArea.width * 0.3) - width;
    }
  }
  
  return {
    x,
    y: -height,
    width,
    height,
    speedY: 0.5 + Math.random() * 1, 
    baseX: x, 
    swingOffset: 0, 
    swingSpeed: 0.03 + Math.random() * 0.02, 
    swingAmplitude: 30 + Math.random() * 30, 
    swingDirection: 1, 
    isDetached: false, 
    detachDistance: 200 + Math.random() * 100, 
    initialY: -height, 
  };
}




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
    p.vy += 0.2; 
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
  
  updateParticles(); 

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];

    
    if (!e.isDetached && (e.y - e.initialY) >= e.detachDistance) {
      e.isDetached = true;
      e.speedY = 2 + Math.random() * 3; 
    }

    if (!e.isDetached) {
      
      e.y += e.speedY;
      e.swingOffset += e.swingSpeed * e.swingDirection;
      const nextX = e.baseX + Math.sin(e.swingOffset) * e.swingAmplitude;
      
      
      if (nextX < gamePlayArea.x || nextX + e.width > gamePlayArea.x + gamePlayArea.width) {
        e.swingDirection *= -1; 
        e.swingSpeed *= 0.8; 
        e.swingAmplitude *= 0.9; 
        
        
        createParticles(
          nextX < gamePlayArea.x ? gamePlayArea.x : gamePlayArea.x + gamePlayArea.width,
          e.y + e.height/2,
          3,
          '#CCCCCC'
        );
      }
      
      e.x = e.baseX + Math.sin(e.swingOffset) * e.swingAmplitude;
    } else {
      
      e.y += e.speedY;
    }

    
    let removeEnemy = false;
    for (let j = plataformas.length - 1; j >= 0; j--) {
      const platform = plataformas[j];
      if (platform.ignoreEnemyCollision) continue;
      if (rectIntersect(e, platform)) {
        removeEnemy = true;
        platform.hitCount = (platform.hitCount || 0) + 1;
        platform.isFlashing = true;
        
        if (platform.type === PLATFORM_TYPES.MOVEL) {
          
          platform.shakeTimer = 0;
          platform.shakeMagnitude = 0;
        } else if (!platform.isInitial) {
          platform.shakeTimer = 10;
          platform.shakeMagnitude = 4;
        } 
        
        createParticles(e.x + e.width/2, e.y + e.height/2, 10, '#FF4444');

        
        const breakableZone = screenHeight * 0.45;
        const breakableZonem = screenHeight * 0.15;

       if (platform.y < breakableZonem && platform.hitCount >= platform.maxHits && !platform.isInitial && platform.type === PLATFORM_TYPES.MOVEL) {
          
          
          if (!platform.broken && !platform.brokenDone) {
            platform.broken = true;
            platform.breakAnimTime = 0;
            platform.breakStartY = platform.y;
            if (typeof onPlatformBroken === 'function') onPlatformBroken(platform);
          }
          
        }

        
        if (platform.y < breakableZone && platform.hitCount >= platform.maxHits && !platform.isInitial && platform.type !== PLATFORM_TYPES.MOVEL) {
          
          
          if (!platform.broken && !platform.brokenDone) {
            platform.broken = true;
            platform.breakAnimTime = 0;
            platform.breakStartY = platform.y;
            if (typeof onPlatformBroken === 'function') onPlatformBroken(platform);
          }
          
        }
        break;
      }
    }

    
    if (removeEnemy || e.y > screenHeight) {
      enemies.splice(i, 1);
    }
  }
}

let lastEnemyAllowedTime = 0;

function spawnEnemies(now) {
  if (now < lastEnemyAllowedTime) return; 
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

    const sprite = inimigoImages[0]; 
    if (sprite && sprite.complete) {
      const SPRITE_WIDTH = sprite.width / 2;  
      const SPRITE_HEIGHT = sprite.height;    

      if (!e.spawnTime) e.spawnTime = Date.now();
      const tempo = Date.now() - e.spawnTime;
      const frame = Math.floor((tempo / 300) % 2); 

      const sx = frame * SPRITE_WIDTH;
      const sy = 0;

      ctx.drawImage(
        sprite,
        sx, sy, SPRITE_WIDTH, SPRITE_HEIGHT, 
        e.x, e.y, e.width, e.height          
      );
    } else {
      ctx.fillStyle = 'red';
      ctx.fillRect(e.x, e.y, e.width, e.height);
    }
  });
}


