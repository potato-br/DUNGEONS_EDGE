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
  webAlpha: 1, // opacity of the web line (1 = visible, 0 = gone)
  webFade: false, // whether the web is currently fading out
  webFadeStart: 0,
  webFadeDuration: 600 + Math.random() * 400, // ms
  // wobble params for the web rope (visual oscillation)
  webWobbleAmount: 1 + Math.random() * 2,
  webWobbleSpeed: 0.003 + Math.random() * 0.006,
  webWobbleSeed: Math.random() * 1000,
  };
}




const particles = [];

// web ghosts: keep rope visuals after enemy removed so fade can finish
const webGhosts = [];

// helper to draw the rope given start/end and alpha
function drawRopeFor(startX, endX, endY, swingOffset, swingAmplitude, alpha, wobbleAmount = 1, wobbleSpeed = 0.005, wobbleSeed = 0) {
  if (!alpha || alpha <= 0) return;
  const prevAlpha = ctx.globalAlpha || 1;
  ctx.globalAlpha = prevAlpha * alpha;

  const startY = 0;
  const blockSize = 3;
  const totalHeight = Math.max(blockSize, Math.round(endY - startY));
  const blocks = Math.max(1, Math.ceil(totalHeight / blockSize));
  const baseColor = '#CFCFCF';
  const highlightColor = 'rgba(255,255,255,0.35)';
  const shadowColor = 'rgba(0,0,0,0.25)';

  const now = performance.now();
  for (let i = 0; i < blocks; i++) {
    const t = i / Math.max(1, blocks - 1);
    const cx = startX + (endX - startX) * t;
    // per-block wobble: combine swingOffset with a time-based sine seeded offset
    const phase = (t * 6) + (swingOffset || 0) + wobbleSeed + (now * wobbleSpeed);
    const wobble = Math.round(Math.sin(phase) * wobbleAmount);
    const qx = Math.round((cx + wobble) / blockSize) * blockSize;
    const y = startY + i * blockSize;

    ctx.fillStyle = baseColor;
    ctx.fillRect(qx - Math.floor(blockSize / 2), Math.round(y), blockSize, blockSize);

    const sparkleInterval = 6;
    if (i % sparkleInterval === Math.floor((swingOffset || 0) % sparkleInterval)) {
      ctx.fillStyle = highlightColor;
      ctx.fillRect(qx - Math.floor(blockSize / 4), Math.round(y + 1), Math.max(1, Math.floor(blockSize / 2)), Math.max(1, Math.floor(blockSize / 2)));
    }
  }

  const shadowY = Math.round(endY + 2);
  const shadowXcenter = Math.round(endX / blockSize) * blockSize;
  ctx.fillStyle = shadowColor;
  ctx.fillRect(shadowXcenter - blockSize, shadowY, blockSize * 2, Math.max(1, Math.floor(blockSize / 2)));

  ctx.globalAlpha = prevAlpha;
}

// helper: return the user's configured SFX multiplier (0..1) or a safe fallback
function getEffectiveSfxMultiplier() {
  try {
    if (typeof OptionsMenu !== 'undefined' && OptionsMenu && typeof OptionsMenu.getSettings === 'function') {
      const s = OptionsMenu.getSettings();
      if (s && typeof s.sfxVolume === 'number') return s.sfxVolume;
    }
    if (typeof AudioManager !== 'undefined') {
      if (typeof AudioManager.getDefaultSfxVolume === 'function') return AudioManager.getDefaultSfxVolume();
      if (typeof AudioManager.sfxVolume === 'number') return AudioManager.sfxVolume;
    }
  } catch (e) {}
  return 1;
}

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
  // global cooldown to avoid multiple spider sfx when many detach at once
  if (typeof window !== 'undefined' && window.__lastSpiderSfxTime === undefined) window.__lastSpiderSfxTime = 0;
  
  updateParticles(); 

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];

    
    if (!e.isDetached && (e.y - e.initialY) >= e.detachDistance) {
  e.isDetached = true;
  e.speedY = 2 + Math.random() * 3; 
  // spawn a few small particles when the spider detaches
  createParticles(e.x + e.width/2, e.y + e.height/2, 2 + Math.floor(Math.random() * 2), '#FFFFFF');
  // start web fadeout instead of instantly removing the rope
  e.webFade = true;
    e.webFadeStart = now || performance.now();
    // capture fixed web coordinates so the rope stays in place while fading
    e.webStartX = e.baseX + e.width / 2;
    e.webEndX = e.x + e.width / 2;
    e.webEndY = e.y + 4;
    e.webFixed = true;
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

    // progress web fade if active
    if (e.webFade) {
      const elapsed = now - (e.webFadeStart || now);
      e.webAlpha = Math.max(0, 1 - (elapsed / (e.webFadeDuration || 600)));
      // when fully faded, ensure webAlpha is 0 (rope no longer drawn)
      if (e.webAlpha <= 0) {
        e.webAlpha = 0;
        // keep webFade false to stop further work
        e.webFade = false;
      }
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
             try { if (typeof AudioManager !== 'undefined' && AudioManager && typeof AudioManager.play === 'function') AudioManager.play('platform_break_sfx'); } catch (e) {}
            platform.breakAnimTime = 0;
            platform.breakStartY = platform.y;
            if (typeof onPlatformBroken === 'function') onPlatformBroken(platform);
          }
          
        }

        
        if (platform.y < breakableZone && platform.hitCount >= platform.maxHits && !platform.isInitial && platform.type !== PLATFORM_TYPES.MOVEL) {
          
          
          if (!platform.broken && !platform.brokenDone) {
            platform.broken = true;
             try { if (typeof AudioManager !== 'undefined' && AudioManager && typeof AudioManager.play === 'function') AudioManager.play('platform_break_sfx'); } catch (e) {}
            platform.breakAnimTime = 0;
            platform.breakStartY = platform.y;
            if (typeof onPlatformBroken === 'function') onPlatformBroken(platform);
          }
          
        }
        break;
      }
    }

    
  if (removeEnemy || e.y > screenHeight) {
      // if removed while web still visible, create a ghost to finish fade
      if ((e.webAlpha === undefined ? 1 : e.webAlpha) > 0) {
        webGhosts.push({
            startX: (e.webStartX !== undefined ? e.webStartX : (e.baseX + e.width / 2)),
            endX: (e.webEndX !== undefined ? e.webEndX : (e.x + e.width / 2)),
            endY: (e.webEndY !== undefined ? e.webEndY : (e.y + 4)),
          swingOffset: e.swingOffset,
          alpha: e.webAlpha === undefined ? 1 : e.webAlpha,
          initialAlpha: e.webAlpha === undefined ? 1 : e.webAlpha,
          // copy wobble params so the ghost rope retains same motion
          wobbleAmount: e.webWobbleAmount || 1,
          wobbleSpeed: e.webWobbleSpeed || 0.005,
          wobbleSeed: e.webWobbleSeed || 0,
          startTime: now,
          duration: e.webFadeDuration || 600
        });
      }
  try {
    // play death SFX only when removed due to collision/platform (removeEnemy === true)
    if (removeEnemy) {
      if (typeof AudioManager !== 'undefined' && AudioManager) {
        try {
          const deathBase = 0.04;
          const deathVol = deathBase * getEffectiveSfxMultiplier();
          if (typeof AudioManager.playWithFade === 'function') AudioManager.playWithFade('enemy_death_sfx', 250, { volume: deathVol });
          else if (typeof AudioManager.play === 'function') AudioManager.play('enemy_death_sfx', { volume: deathVol });
        } catch (e) {}
      }
    }
  } catch (err) {}
      enemies.splice(i, 1);
    }
  }

  // update webGhosts fade
  for (let gi = webGhosts.length - 1; gi >= 0; gi--) {
    const g = webGhosts[gi];
    const elapsed = now - g.startTime;
    const t = Math.min(1, elapsed / g.duration);
    g.alpha = Math.max(0, (g.initialAlpha || g.alpha) * (1 - t));
    if (g.alpha <= 0) webGhosts.splice(gi, 1);
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
      try {
        const baseVOL = 0.02;
        const VOL = baseVOL * getEffectiveSfxMultiplier();
        // schedule a per-enemy delayed spawn sound (random delay up to 1000ms)
        const enemyRef = enemies[enemies.length - 1];
        const delay = Math.random() * 1000; // 0 .. 1000 ms
        enemyRef._spawnSoundDelay = delay;
        enemyRef._spawnSoundTimeout = setTimeout(() => {
          try {
            // ensure enemy still exists (wasn't removed)
            if (!enemies.includes(enemyRef)) return;
            if (typeof AudioManager !== 'undefined' && AudioManager.assets && AudioManager.assets['spider_sfx']) {
              const asset = AudioManager.assets['spider_sfx'];
              const src = asset.src || (asset.currentSrc || (asset.getAttribute && asset.getAttribute('src')));
              if (src) {
                // Prefer using AudioManager so the play respects global sfxVolume and per-asset baseVolume.
                try {
                  if (typeof AudioManager !== 'undefined' && AudioManager) {
                    if (typeof AudioManager.playWithFade === 'function') {
                      AudioManager.playWithFade('spider_sfx', 200, { volume: VOL });
                    } else if (typeof AudioManager.play === 'function') {
                      AudioManager.play('spider_sfx', { volume: VOL });
                    }
                  } else {
                    // fallback to direct Audio if AudioManager not present
                    const a = new Audio(src);
                    a.volume = VOL;
                    a.play().catch(()=>{});
                  }
                } catch (e) {
                  try { const a = new Audio(src); a.volume = VOL; a.play().catch(()=>{}); } catch (er) {}
                }
              } else {
                try {
                  if (typeof AudioManager !== 'undefined' && AudioManager) {
                    if (typeof AudioManager.playWithFade === 'function') {
                      AudioManager.playWithFade('spider_sfx', 200, { volume: VOL });
                    } else if (typeof AudioManager.play === 'function') {
                      AudioManager.play('spider_sfx', { volume: VOL });
                    }
                  }
                } catch (e) {}
              }
            }
          } catch (err) {}
        }, delay);
      } catch (err) {}
    }
    lastEnemySpawn = now;
  }
}

function drawEnemies() {
  drawParticles();

  // draw any web ghosts (fading ropes left behind by detached/removed enemies)
  for (let gi = 0; gi < webGhosts.length; gi++) {
    const g = webGhosts[gi];
  drawRopeFor(g.startX, g.endX, g.endY, g.swingOffset, 0, g.alpha, g.wobbleAmount, g.wobbleSpeed, g.wobbleSeed);
  }

  enemies.forEach(e => {
    // draw per-enemy rope/web while visible. If the web was fixed at detach,
    // use the fixed coordinates so the rope doesn't follow the falling spider.
    const webAlpha = (e.webAlpha === undefined ? 1 : e.webAlpha);
    if (webAlpha > 0) {
      const startX = (e.webStartX !== undefined ? e.webStartX : (e.baseX + e.width / 2));
      const endX = (e.webEndX !== undefined ? e.webEndX : (e.x + e.width / 2));
      const endY = (e.webEndY !== undefined ? e.webEndY : (e.y + 4));
  drawRopeFor(startX, endX, endY, e.swingOffset, e.swingAmplitude, webAlpha, e.webWobbleAmount, e.webWobbleSpeed, e.webWobbleSeed);
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


