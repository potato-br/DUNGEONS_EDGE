// Configuração visual do slime
const SLIME_DRAW_CONFIG = {
    scale: 1.0, // escala do sprite
    offsetX: 0, // deslocamento horizontal
    offsetY: 11, // deslocamento vertical
    frameWidth: 128, // largura do frame (padrão: GRANDE_INIMIGO_CONFIG.WIDTH)
    frameHeight: 120, // altura do frame (padrão: GRANDE_INIMIGO_CONFIG.HEIGHT)
    hitboxColor: 'lime', // cor da hitbox no debug
    hitboxLineWidth: 1.5 // espessura da linha da hitbox
};
// Inimigo exclusivo de plataformas grandes ("slime")
const grandeInimigos = [];
let lastGrandeInimigoSpawn = 0;

const GRANDE_INIMIGO_CONFIG = {
    SPAWN_DEPTH: 35000,
    INTERVAL: 1000,
    CHANCE: 0.25,
    SPEED: 1.0,
    WIDTH: 60,
    HEIGHT: 48,
    GRAVITY: 0.6
};

// Spritesheet do slime (animação horizontal)
const slimeSprite = new Image();
slimeSprite.src = './images/personagens e inimigos/slime/slime.jpg';
const SLIME_FRAMES = 8; // assumimos 8 frames horizontais

function getSlimeFrame(e) {
    if (!slimeSprite.complete || slimeSprite.naturalWidth === 0) return 0;
    const frameIndex = Math.floor((performance.now() / 120) % SLIME_FRAMES);
    return frameIndex;
}

function criarGrandeInimigoEmPlataforma(platform) {
    const w = GRANDE_INIMIGO_CONFIG.WIDTH;
    const h = GRANDE_INIMIGO_CONFIG.HEIGHT;
    return {
        x: platform.x + platform.width - w - 8, // sempre na direita da plataforma
        y: platform.y - h,
        width: w,
        height: h,
        velocityX: -GRANDE_INIMIGO_CONFIG.SPEED,
        velocityY: 0,
        gravity: GRANDE_INIMIGO_CONFIG.GRAVITY,
        isFalling: false,
        attachedPlatform: platform,
        ignorePlatformCollision: false,
        spawnTime: performance.now(),
        hitbox: { width: w, height: h, offsetX: 0, offsetY: 0 }
    };
}

function spawnGrandeInimigos(now) {
    if (typeof depthPoints === 'undefined') return;
    if (depthPoints < GRANDE_INIMIGO_CONFIG.SPAWN_DEPTH) return;
    if (now < lastEnemyAllowedTime) return;
    if (now - lastGrandeInimigoSpawn < GRANDE_INIMIGO_CONFIG.INTERVAL) return;

    // percorre plataformas grandes e tenta spawnar
    for (const plat of plataformas) {
        if (!plat.isGrande) continue;
        if (plat.broken) continue;
        if (plat.type === PLATFORM_TYPES.FANTASMA) continue;
        if (plat.type === PLATFORM_TYPES.QUEBRAVEL) continue;
        // não spawnar em plataformas iniciais
        if (plat.isInitial) continue;
        // somente spawnar em plataformas que estejam no "void" (abaixo da tela visível)
        if (typeof screenHeight !== 'undefined' && !(plat.y > screenHeight)) continue;
    // já tem inimigo nessa plataforma? (flag ou array)
    if (plat._hasGrandeEnemy) continue;
    const ocupado = grandeInimigos.some(e => e.attachedPlatform === plat && !e.isFalling);
        if (ocupado) continue;

        if (Math.random() < GRANDE_INIMIGO_CONFIG.CHANCE) {
            const novo = criarGrandeInimigoEmPlataforma(plat);
            grandeInimigos.push(novo);
            plat._hasGrandeEnemy = true; // marca plataforma
            lastGrandeInimigoSpawn = now;
            // limitamos um por intervalo
            break;
        }
    }
}

function updateGrandeInimigos() {
    for (let i = grandeInimigos.length - 1; i >= 0; i--) {
        const e = grandeInimigos[i];

        if (!e.isFalling) {
            const plat = e.attachedPlatform;
            // se a plataforma que o prendia quebrou -> cai
            if (!plat || plat.broken) {
                e.isFalling = true;
                e.ignorePlatformCollision = true;
                e.velocityY = 1;
                // libera a marcação da plataforma para segurança
                if (plat && plat._hasGrandeEnemy) plat._hasGrandeEnemy = false;
            } else {
                // acompanha movimento da plataforma móvel
                if (plat.moveSpeed) e.x += plat.moveSpeed;

                e.x += e.velocityX;
                // limita aos limites da plataforma
                const leftLimit = plat.x;
                const rightLimit = plat.x + plat.width - e.width;
                if (e.x <= leftLimit) {
                    e.x = leftLimit + 1;
                    e.velocityX = Math.abs(e.velocityX);
                } else if (e.x >= rightLimit) {
                    e.x = rightLimit - 1;
                    e.velocityX = -Math.abs(e.velocityX);
                }
                e.y = plat.y - e.height;
            }
        } else {
            // em queda: aplica gravidade e ignora colisões com plataformas
            e.velocityY += e.gravity;
            e.y += e.velocityY;
            e.x += e.velocityX * 0.25; // pequeno deslocamento horizontal durante queda
        }

        // remove quando fora da tela
        if (e.y > screenHeight + 300) {
            if (e.attachedPlatform && e.attachedPlatform._hasGrandeEnemy) e.attachedPlatform._hasGrandeEnemy = false;
            grandeInimigos.splice(i, 1);
        }
    }
}

function drawGrandeInimigos() {
    grandeInimigos.forEach(e => {
        ctx.save();
        // desenha sprite se disponível
        if (slimeSprite.complete && slimeSprite.naturalWidth > 0) {
            const frameW = SLIME_DRAW_CONFIG.frameWidth;
            const frameH = SLIME_DRAW_CONFIG.frameHeight;
            const frame = getSlimeFrame(e);
            const sx = frame * frameW;
            const sy = 0;
            const drawW = frameW * SLIME_DRAW_CONFIG.scale;
            const drawH = frameH * SLIME_DRAW_CONFIG.scale;
            const drawY = e.y + SLIME_DRAW_CONFIG.offsetY;
            // compute X so sprite aligns with hitbox; offsetX is sprite-left relative to hitbox-left when sprite is not flipped
            const unflippedX = e.x + SLIME_DRAW_CONFIG.offsetX;
            const flippedX = e.x + e.width - SLIME_DRAW_CONFIG.offsetX - drawW;
            if (e.velocityX < 0) {
                // Flip horizontal drawing, use flippedX to align with hitbox
                ctx.save();
                ctx.translate(flippedX + drawW, drawY);
                ctx.scale(-1, 1);
                ctx.drawImage(slimeSprite, sx, sy, frameW, frameH, 0, 0, drawW, drawH);
                ctx.restore();
            } else {
                ctx.drawImage(slimeSprite, sx, sy, frameW, frameH, unflippedX, drawY, drawW, drawH);
            }
        } else {
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(e.x, e.y, e.width, e.height);
        }

        // debug: desenha hitbox quando spriteDebug ativo
        if (window.spriteDebug) {
            ctx.strokeStyle = SLIME_DRAW_CONFIG.hitboxColor;
            ctx.lineWidth = SLIME_DRAW_CONFIG.hitboxLineWidth;
            const hx = e.x + (e.hitbox.offsetX || 0);
            const hy = e.y + (e.hitbox.offsetY || 0);
            ctx.strokeRect(hx, hy, e.hitbox.width, e.hitbox.height);
        }

        ctx.restore();
    });
}

function checkGrandeInimigosCollision() {
    

    for (let i = grandeInimigos.length - 1; i >= 0; i--) {
        const e = grandeInimigos[i];
        if (!rectIntersect(player, e)) continue;

        // Cavaleiro: stomp na cabeça
        const stomp = (
            activeCharacter === 'Roderick, o Cavaleiro' &&
            player.velocityY > 0 &&
            Math.abs((player.y + player.height - player.velocityY) - e.y) < 28
        );
        if (stomp) {
            // morre por stomp: marca a plataforma para nunca mais spawnar slimes
            if (e.attachedPlatform) e.attachedPlatform._hasGrandeEnemy = true;
            grandeInimigos.splice(i, 1);
            if (typeof player.jumpCount !== 'undefined') player.jumpCount = 0;
            // começos de partículas para feedback
            createParticles(e.x + e.width/2, e.y + e.height/2, 8, '#FF6666');
            return true;
        }
if (isRespawning || (typeof DASH !== 'undefined' && DASH.isInvulnerable) || (typeof DASH !== 'undefined' && DASH.isDashing)) return;
        // se mage está em invulnerabilidade especial? reutiliza applyDanoJogador
        if (typeof applyDanoJogador === 'function') {
            applyDanoJogador();
        } else {
            // fallback simples
            if (activeCharacter === 'Valthor, o Mago') {
                live--;
                if (live < 0) gameOver();
            } else {
                live--;
                if (live < 0) gameOver(); else aplicarInvulnerabilidade(1200, true);
            }
        }

        return true;
    }
}
