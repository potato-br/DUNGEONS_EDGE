function drawDashUI() {
    if (gameState === 'gameover') return;
    ctx.save();
    if (activeCharacter === 'Kuroshi, o Ninja' || activeCharacter === 'O Errante de Eldoria') {
        let now = performance.now();
        if (typeof isPaused !== 'undefined' && isPaused && typeof pauseStartTime !== 'undefined' && pauseStartTime !== null) {
            now = pauseStartTime;
        }
        const startX = 50;

        const startY = 100;
        const spriteScale = activeCharacter === 'O Errante de Eldoria' ? 3 : 3;
        const spacing = 50;
        const dashCount = activeCharacter === 'Kuroshi, o Ninja' ? player.maxDashes : 1;
        for (let i = 0; i < dashCount; i++) {
            const x = startX + i * spacing;
            
            let dashCooldown = false;
            let dashCooldownTime = 1000;
            let lastDashTime = 0;
            if (activeCharacter === 'O Errante de Eldoria') {
                dashCooldown = typeof DASH !== 'undefined' && DASH.cooldown;
                dashCooldownTime = typeof DASH !== 'undefined' && (DASH.dashRechargeTime || DASH.cooldownTime) ? (DASH.dashRechargeTime || DASH.cooldownTime) : 1000;
                lastDashTime = typeof DASH !== 'undefined' && DASH.lastDashTime ? DASH.lastDashTime : 0;
            }
            const isAvailable = activeCharacter === 'Kuroshi, o Ninja' ? 
                              (i < player.currentDashes) : 
                              !dashCooldown;
            const isRecharging = activeCharacter === 'Kuroshi, o Ninja' ? 
                               (!isAvailable && i === player.currentDashes) : 
                               dashCooldown;
            let rechargeProgress = 0;
            if (isRecharging) {
                let elapsed = 0;
                if (activeCharacter === 'Kuroshi, o Ninja') {
                    elapsed = now - player.lastDashRecharge;
                    rechargeProgress = Math.min(1, elapsed / player.dashRechargeTime);
                } else {
                    elapsed = now - lastDashTime;
                    rechargeProgress = Math.min(1, elapsed / dashCooldownTime);
                }
            }
            if (playerSprite && playerSprite.complete && playerSprites && playerSprites[activeCharacter]) {
                const config = playerSprites[activeCharacter].config[0];
                const ghostSpacing = activeCharacter === 'O Errante de Eldoria' ? 12 : 8;
                if (isAvailable || isRecharging) {
                    const ghostCount = 3;
                    for (let g = ghostCount - 1; g >= 0; g--) {
                        const ghostX = x - (g * ghostSpacing);
                        const ghostAlpha = isAvailable ? 
                            (0.4 - g * 0.1) : 
                            ((0.4 - g * 0.1) * rechargeProgress);
                        ctx.save();
                        if (isAvailable) {
                            ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
                            ctx.shadowBlur = activeCharacter === 'O Errante de Eldoria' ? 8 : 5;
                        }
                        ctx.globalAlpha = ghostAlpha;
                        ctx.drawImage(
                            playerSprite,
                            0, 0,
                            config.frameWidth, config.frameHeight,
                            ghostX, startY,
                            config.frameWidth * spriteScale, 
                            config.frameHeight * spriteScale
                        );
                        ctx.restore();
                    }
                }
                ctx.save();
                if (isRecharging) {
                    ctx.beginPath();
                    const height = config.frameHeight * spriteScale;
                    const rechargeHeight = height * rechargeProgress;
                    ctx.rect(x, startY + height - rechargeHeight, 
                            config.frameWidth * spriteScale, rechargeHeight);
                    ctx.clip();
                }
                if (isAvailable) {
                    ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
                    ctx.shadowBlur = activeCharacter === 'O Errante de Eldoria' ? 12 : 8;
                }
                ctx.globalAlpha = isAvailable ? 1 : (isRecharging ? 0.6 : 0.4);
                ctx.drawImage(
                    playerSprite,
                    0, 0,
                    config.frameWidth, config.frameHeight,
                    x, startY,
                    config.frameWidth * spriteScale, 
                    config.frameHeight * spriteScale
                );
                ctx.restore();
            }
        }
    } 
    ctx.restore();
}

function drawDashGhosts(ctx) {
    for (const trail of DASH.trailStack) {
        drawGhostTrail(ctx, trail.points, trail.endTime);
    }
    if ((DASH.isDashing || DASH.trailActive) && DASH.trailPoints.length > 1) {
        drawGhostTrail(ctx, DASH.trailPoints, null);
    }
}

function drawGhostTrail(ctx, points, endTime) {
    if (!points.length) return;
    const now = performance.now();
    let idleRow = 2;
    if (playerSprites && playerSprites[activeCharacter] && playerSprites[activeCharacter].config) {
        idleRow = playerSprites[activeCharacter].config.length - 1;
    }
    const idleFrameIndex = 0;
    for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        let baseAlpha = 0.45;
        if (pt.fadeStart) {
            const fadeElapsed = now - pt.fadeStart;
            const fadeDuration = 500;
            baseAlpha *= Math.max(0, 1 - (fadeElapsed / fadeDuration));
        }
        if (baseAlpha <= 0) continue;
        ctx.save();
        ctx.globalAlpha = baseAlpha;
        if (playerSprite && playerSprite.complete && playerSprites && playerSprites[activeCharacter]) {
            const config = playerSprites[activeCharacter].config[idleRow];
            const sx = idleFrameIndex * config.frameWidth;
            const sy = idleRow * config.frameHeight;
            const scale = 3.5;
            const dw = config.frameWidth * scale;
            const dh = config.frameHeight * scale;
            let offsetX = (config.offsetX || 0) * scale;
            const offsetY = (config.offsetY || 0) * scale;
            const facingRight = pt.facingRight !== undefined ? pt.facingRight : true;
            if (!facingRight && offsetX !== 0) {
                offsetX = -offsetX;
            }
            const dx = pt.x - dw/2 + offsetX;
            const dy = pt.y - dh/2 + offsetY;
            if (!facingRight) {
                ctx.translate(dx + dw/2, dy + dh/2);
                ctx.scale(-1, 1);
                ctx.translate(-(dx + dw/2), -(dy + dh/2));
            }
            ctx.drawImage(
                playerSprite,
                sx, sy, config.frameWidth, config.frameHeight,
                dx, dy, dw, dh
            );
        } else {
            ctx.fillStyle = 'rgba(200,200,255,' + baseAlpha + ')';
            ctx.fillRect(pt.x - player.width/2, pt.y - player.height/2, player.width, player.height);
        }
        ctx.restore();
    }
}