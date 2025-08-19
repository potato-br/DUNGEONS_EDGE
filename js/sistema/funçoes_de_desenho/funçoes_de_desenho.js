



let parallaxOffset = 0;
let gradientAngle = 110;
let parallaxSpeed = 0.2;

// Ambient darkness / gradient overlay configuration
const AMBIENT_TIME_TO_MAX = 120; // seconds to reach full ambient effect (tunable)
const DEPTH_TO_MAX = 30000; // depth (meters) to normalize darkness effect (user requested slower fade)
const AMBIENT_MAX_ALPHA = 0.85; // cap for bottom alpha (increased so scene can get darker)
// use ambientDarknessTime (seconds) to accumulate time while playing


let currentLateralLeftBg = lateralImages[0];
let nextLateralLeftBg = lateralImages[0];
let currentLateralRightBg = lateralImages[0];  
let nextLateralRightBg = lateralImages[0];     
let lateralBackgroundY = 0;
let lateralTransitionSpeed = 0.7; 
let lateralTrocaCount = 0;

function drawlateral() {
    if (gameState === 'loja') {
        return;
    }

    if (gameState === 'jogando' && !isPaused && !isRespawning) {
        lateralBackgroundY -= lateralTransitionSpeed * gameSpeed;
    }
    gradientAngle = (gradientAngle + 0.3) % 360; 

    const leftWidth = canvas.width * 0.38;
    const rightWidth = canvas.width * 0.38;

    
    ctx.save();

    
    ctx.beginPath();
    ctx.rect(0, 0, leftWidth, canvas.height);
    ctx.clip();
    
    if (currentLateralLeftBg && nextLateralLeftBg) {
        ctx.drawImage(currentLateralLeftBg, 0, lateralBackgroundY, leftWidth, canvas.height);
        ctx.drawImage(nextLateralLeftBg, 0, lateralBackgroundY + canvas.height, leftWidth, canvas.height);
    }
    ctx.restore();

    
    ctx.save();
    ctx.beginPath();
    ctx.rect(canvas.width - rightWidth, 0, rightWidth, canvas.height);
    ctx.clip();
    
    if (currentLateralRightBg && nextLateralRightBg) {
        ctx.drawImage(currentLateralRightBg, canvas.width - rightWidth, lateralBackgroundY, rightWidth, canvas.height);
        ctx.drawImage(nextLateralRightBg, canvas.width - rightWidth, lateralBackgroundY + canvas.height, rightWidth, canvas.height);
    }
    ctx.restore();

  
  if (lateralBackgroundY <= -canvas.height) {
    lateralBackgroundY = 0;
    currentLateralLeftBg = nextLateralLeftBg;
    currentLateralRightBg = nextLateralRightBg;
    lateralTrocaCount++;
    
    
    if (Math.random() < 0.4) { 
      nextLateralLeftBg = lateralImages[0];
      nextLateralRightBg = lateralImages[0];
    } else {
      
      const leftIdx = Math.floor(Math.random() * lateralImages.length);
      const rightIdx = Math.floor(Math.random() * lateralImages.length);
      nextLateralLeftBg = lateralImages[leftIdx];
      nextLateralRightBg = lateralImages[rightIdx];
    }
  }

  
  const centerX = (Math.sin(gradientAngle * Math.PI / 180) * canvas.width) + canvas.width / 2;
  const centerY = canvas.height / 2;
  const gradient = ctx.createRadialGradient(
    centerX, centerY, 0,           
    centerX, centerY, canvas.width  
  );
  
  
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');   
  gradient.addColorStop(0.1, 'rgba(0, 0, 0, 0.5)');  
  gradient.addColorStop(0.2, 'rgba(0, 0, 0, 0.6)');  
  gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.7)');  
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');   
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBackground() {
  
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, gamePlayArea.x, canvas.height);
  ctx.fillRect(gamePlayArea.x + gamePlayArea.width, 0, canvas.width - (gamePlayArea.x + gamePlayArea.width), canvas.height);

  if (typeof gameState !== "undefined" && gameState === 'loja' && !isRespawning && !isPaused) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(gamePlayArea.x, 0, gamePlayArea.width, canvas.height);
  ctx.clip();
  ctx.drawImage(currentBg, gamePlayArea.x, backgroundY, gamePlayArea.width, screenHeight);
  ctx.drawImage(nextBg, gamePlayArea.x, backgroundY + screenHeight, gamePlayArea.width, screenHeight);
  ctx.restore();

    // Ambient overlay: vertical gradient from top (light) to bottom (dark)
    try {
        // compute normalized depth factor (0..1)
        const depthFactor = Math.max(0, Math.min(1, (typeof depthPoints !== 'undefined' ? depthPoints : 0) / DEPTH_TO_MAX));
        // compute normalized time factor (0..1) using global ambientDarknessTime in seconds (de-emphasized)
    const ambientTime = (typeof ambientDarknessTime === 'number') ? ambientDarknessTime : 0;
        const timeFactor = Math.max(0, Math.min(1, ambientTime / AMBIENT_TIME_TO_MAX));

        // prioritize depth; time has a small influence to allow slow progression but depth drives the effect
        const overallFactor = Math.max(0, Math.min(1, depthFactor * 0.98 + timeFactor * 0.02));

        // stronger mid and base alphas driven primarily by depth
        const alphaMid = Math.max(0.05, Math.min(0.7, depthFactor * 0.6 + timeFactor * 0.02));
        const alphaBase = Math.max(0.2, Math.min(AMBIENT_MAX_ALPHA, depthFactor * 0.9 + timeFactor * 0.05));

        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        // top: darkens progressively (less than bottom) so the whole scene gains atmosphere
        // topAlpha grows with combined but remains below the bottom alpha to keep contrast
        // top now darkens with depth (overallFactor) so it stops being too bright when scene darkens
    // make top darker with depth: higher multiplier and slightly higher minimum
    const topAlpha = Math.max(0.08, Math.min(0.95, overallFactor * 0.9 + timeFactor * 0.05));
        // bring the mid stop a bit closer to the top so the fade happens earlier
        const midStop = 0.25;
        // use slightly different tones so top/mid/bottom don't all share the exact same black
    grad.addColorStop(0, `rgba(10,12,18, ${topAlpha})`); // darker cool tone at top
        grad.addColorStop(midStop, `rgba(10,12,16, ${alphaMid})`); // near-black desaturated mid
        // bottom: stronger darkness controlled by depth/time but capped so BG remains visible
        grad.addColorStop(1, `rgba(0,0,0, ${alphaBase})`); // deepest black at bottom

        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = grad;
        ctx.fillRect(gamePlayArea.x, 0, gamePlayArea.width, canvas.height);
        ctx.restore();
    } catch (e) {
        // non-critical: if something fails, skip ambient overlay
    }

  if (gameState === 'gameover') return;
  if (typeof isPaused !== 'undefined' && isPaused) return;
  
  if (!isRespawning) {
    backgroundY -= backgroundSpeed;
  }

  if (backgroundY <= -screenHeight) {
    backgroundY = 0;
    currentBg = nextBg;
    trocaCount++;
    if (trocaCount % 2 === 0) {
      const idx = Math.floor(Math.random() * backgroundImages.length);
      nextBg = backgroundImages[idx];
    } else {
      nextBg = mainBg;
    }
  }
}

function drawPlataformas() {
    const time = performance.now() * 0.001;
    ctx.save();
    for (let i = plataformas.length - 1; i >= 0; i--) {
        const platform = plataformas[i];
        if (platform.type === PLATFORM_TYPES.FANTASMA && !platform.visible) {
            continue;
        }
        ctx.save();
        if (platform.shakeTimer && platform.shakeTimer > 0) {
            const shakeX = Math.sin(time * 40) * platform.shakeMagnitude * (platform.shakeTimer / 15);
            ctx.translate(shakeX, 0);
            platform.shakeTimer--;
        }
        let img;
        if (platform.type === PLATFORM_TYPES.ESCORREGADIA || platform.isSlippery) {
            img = platform.isGrande ? plataformaGeloGrandeImg : plataformaGeloImg;
        } else if (platform.type === PLATFORM_TYPES.MOVEL) {
            img = plataformaMovelImg;
        } else {
            img = platform.isGrande ? plataformaGrandeImg : plataformaNormalImg;
        }
        if (platform.type === PLATFORM_TYPES.FANTASMA || platform.isGhost) {
            ctx.globalAlpha = Math.sin(platform.fadeTimer * 0.05) * 0.5 + 0.5;
        }
        if (platform.type === PLATFORM_TYPES.QUEBRAVEL) {
            drawBreakablePlatform(ctx, platform, time, img);
        } else if (platform.type === PLATFORM_TYPES.ESCORREGADIA) {
            drawIcePlatform(ctx, platform, img);
        } else if (platform.type === PLATFORM_TYPES.MOVEL) {
            drawMovingPlatform(ctx, platform, img, time);
        } else if (platform.type === PLATFORM_TYPES.FANTASMA) {
            drawGhostPlatform(ctx, platform, img);
        } else {
            ctx.drawImage(img, platform.x, platform.y, platform.width, platform.height);
        }
        if (
            platform.broken &&
            !platform.falling &&
            platform.type !== PLATFORM_TYPES.MOVEL &&
            (!platform.breakAnimTime || platform.breakAnimTime < 5)
        ) {
            if (!platform.breakAnimTime) platform.breakAnimTime = 0;
            platform.breakAnimTime += 1;
            ctx.globalAlpha = Math.max(0, 1 - platform.breakAnimTime / 30);
            if (platform.breakAnimTime < 30 && Math.random() < 0.4) {
                createParticles(
                    platform.x + Math.random() * platform.width,
                    platform.y + Math.random() * platform.height,
                    1,
                    '#ffcc00'
                );
            }
            if (platform.breakAnimTime >= 30) {
                platform.brokenDone = true;
            }
        }
        if (platform.broken) {
            if (drawBrokenPlatform(ctx, platform, img)) {
                ctx.restore();
                continue;
            }
        }
        ctx.restore();
    }
    ctx.restore();
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'red';
  ctx.font      = 'bold 60px PixelFont';
  ctx.textAlign = 'center';
  ctx.fillText('VOCE MORREU', canvas.width/2, canvas.height/2);
  ctx.font = '30px PixelFont';
  ctx.fillStyle = 'white';
  const depthText = `Profundidade: ${Math.floor(depthPoints)}`;
  ctx.fillText(depthText, canvas.width/2, canvas.height/2 + 50);
  let record = 0;
  try {
    record = Number(localStorage.getItem('recordDepth')) || 0;
  } catch (e) {}
  if (Math.floor(depthPoints) > record) {
    ctx.fillStyle = 'yellow';
    ctx.font = '28px PixelFont';
    ctx.fillText('NOVO RECORDE!', canvas.width/2, canvas.height/2 + 90);
  } else if (record > 0) {
    ctx.fillStyle = 'lightgray';
    ctx.font = '20px PixelFont';
    ctx.fillText(`Recorde: ${record}`, canvas.width/2, canvas.height/2 + 90);
  } 
  if (Math.floor(depthPoints) > salvoprofundidade) {
    salvoprofundidade = Math.floor(depthPoints);
  }
  ctx.font      = '30px PixelFont';
  ctx.fillStyle = 'white';
  ctx.fillText('Pressione R para ir para loja', canvas.width/2, canvas.height/2 + 140);
}

function drawVictory() {
  ctx.fillStyle = 'rgba(0,50,0,0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'yellow';
  ctx.font      = 'bold 60px PixelFont';
  ctx.textAlign = 'center';
  ctx.fillText('VOCÊ VENCEU!', canvas.width/2, canvas.height/2);
  ctx.font      = '30px PixelFont';
  ctx.fillStyle = 'white';
  ctx.fillText('Pressione N para Novo Jogo', canvas.width/2, canvas.height/2 + 60);
}

function drawIceEffects() {
    if (typeof icePhysics !== 'undefined') {
        icePhysics.draw(ctx);
    }
}

function drawAllHitboxes() {
    if (!window.spriteDebug) return;
    ctx.save();
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 2;
    ctx.strokeRect(
        player.x + player.hitbox.offsetX,
        player.y + player.hitbox.offsetY,
        player.hitbox.width,
        player.hitbox.height
    );
    if (typeof enemies !== 'undefined') {
        ctx.strokeStyle = 'orange';
        enemies.forEach(e => {
            ctx.strokeRect(e.x, e.y, e.width, e.height);
        });
    }
    if (typeof moedas !== 'undefined') {
        ctx.strokeStyle = 'yellow';
        moedas.forEach(m => {
            ctx.strokeRect(m.x, m.y, m.width, m.height);
        });
    }
    if (typeof plataformas !== 'undefined') {
        ctx.strokeStyle = 'blue';
        plataformas.forEach(p => {
            if (p.type === PLATFORM_TYPES.FANTASMA && !p.visible) return;
            if (p.type === PLATFORM_TYPES.MOVEL && p.hitbox) {
                ctx.save();
                ctx.strokeStyle = 'purple';
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    p.x + p.hitbox.offsetX,
                    p.y + p.hitbox.offsetY,
                    p.hitbox.width,
                    p.hitbox.height
                );
                ctx.restore();
            } else if (p.hitbox) {
                ctx.strokeRect(
                    p.x + (p.hitbox.offsetX || 0),
                    p.y + (p.hitbox.offsetY || 0),
                    p.hitbox.width || p.width,
                    p.hitbox.height || p.height
                );
            } else {
                ctx.strokeRect(p.x, p.y, p.width, p.height);
            }
        });
    }
    if (typeof serras !== 'undefined') {
        serras.forEach(s => {
            ctx.save();
            ctx.strokeStyle = 'rgba(255,0,0,0.5)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(s.x, s.y, s.width, s.height);
            ctx.restore();
            if (s.hitbox) {
                ctx.save();
                ctx.strokeStyle = 'magenta';
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    s.x + (s.hitbox.offsetX || 0),
                    s.y + (s.hitbox.offsetY || 0),
                    s.hitbox.width || s.width,
                    s.hitbox.height || s.height
                );
                ctx.restore();
            }
        });
    }
    ctx.restore();
}