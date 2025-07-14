// ==========================
// ===== FUNÇÕES DE DESENHO =====
// ==========================

let parallaxOffset = 0;
let gradientAngle = 110;
let parallaxSpeed = 0.2; // Nova variável para controlar velocidade

function drawlateral() {
  if (gameState === 'loja') {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundRepeat = '';
    document.body.style.backgroundColor = '';
    return;
  }

  if (gameState === 'jogando' && !isPaused && !isRespawning) {
    parallaxOffset = (parallaxOffset + parallaxSpeed * gameSpeed) % window.innerHeight;
  }
  gradientAngle = (gradientAngle + 0.5) % 1;

  // SORTEIO DE LATERAIS: se mudou o fundo central, sorteia novas laterais
  if (typeof currentBg !== 'undefined' && (typeof lastBgCentral === 'undefined' || lastBgCentral !== currentBg)) {
    const [left, right] = sortearLaterais(currentBg);
    currentLateralLeft = left;
    currentLateralRight = right;
    lastBgCentral = currentBg;
  }

  document.body.style.backgroundImage = `
    linear-gradient(${gradientAngle}deg, 
      rgba(0, 0, 0, 0.88), 
      rgba(0, 0, 0, 0.52), 
      rgba(0, 0, 0, 0.59)
    ),
    url('${currentLateralLeft.src}'),
    url('${currentLateralRight.src}')
  `;
  document.body.style.backgroundPosition = `center, left 0px top ${parallaxOffset}px, right 0px top ${parallaxOffset}px`;
  document.body.style.backgroundRepeat = 'no-repeat, repeat-y, repeat-y';
  document.body.style.backgroundSize = 'cover, 38% 100%, 38% 100%';
  document.body.style.backgroundColor = '#5e5e5e';
  document.body.style.margin = '0';
  document.body.style.padding = '0';
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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

  if (gameState === 'gameover') return;
  if (typeof isPaused !== 'undefined' && isPaused) return;
  // Só move o background se não estiver respawnando
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
        if (platform.type !== PLATFORM_TYPES.QUEBRAVEL && platform.y < window.innerHeight / 3) {
            const blink = Math.floor(time * 5) % 2 === 0;
            if (blink) {
                ctx.globalAlpha = 0.2;
                ctx.fillStyle = 'rgba(99, 11, 5, 0.72)';
                ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            }
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






