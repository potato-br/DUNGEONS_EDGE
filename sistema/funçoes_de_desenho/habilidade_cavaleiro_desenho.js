function drawCavaleiroAbilitiesCooldown() {
    if (gameState === 'gameover' || activeCharacter !== 'Roderick, o Cavaleiro') return;
    ctx.save();
    const x = 20;
    const y = 130;
    const iconSize = 48;
    const spacing = 10;
    const cornerRadius = 5;
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.beginPath();
    ctx.roundRect(x - 5, y - 25, iconSize + 120, iconSize * 2 + spacing + 20, cornerRadius);
    ctx.fill();
    ctx.font = 'bold 16px PixelFont';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText('Égide lunar:', x + iconSize + 10, y + 20);

    let now = performance.now();
    if (typeof isPaused !== 'undefined' && isPaused && typeof pauseStartTime !== 'undefined' && pauseStartTime !== null) {
        now = pauseStartTime;
    }
    let elapsed = 0;
    let remaining = 0;
    let progress = 0;
    let remainingSeconds = 0;

    if (knightShieldIconLoaded) {
        if (CAVALEIRO.shieldActive) {
            ctx.save();
            const pulseIntensity = (Math.sin(now * 0.01) * 0.3 + 0.7);
            ctx.globalAlpha = pulseIntensity;
            ctx.drawImage(knightShieldIcon, x, y, iconSize, iconSize);
            // Tempo restante
            let remainingActive = 0;
            if (typeof activeAbilityTimers !== 'undefined' && activeAbilityTimers.shield && typeof activeAbilityTimers.shield.startTime !== 'undefined') {
                remainingActive = CAVALEIRO.SHIELD_DURATION - (now - activeAbilityTimers.shield.startTime);
            } else if (CAVALEIRO.shieldCooldownStart !== null) {
                remainingActive = CAVALEIRO.SHIELD_DURATION - (CAVALEIRO.shieldCooldownStart - CAVALEIRO.SHIELD_DURATION - now);
            }
            remainingActive = Math.max(0, remainingActive);
            ctx.fillText(`ATIVO! ${(remainingActive/1000).toFixed(1)}s`, x + iconSize + 10, y + 40);
            ctx.restore();
        } else if (CAVALEIRO.shieldCooldown) {
            if (typeof isPaused !== 'undefined' && isPaused && typeof activeAbilityTimers !== 'undefined' && activeAbilityTimers.shieldCooldown && typeof activeAbilityTimers.shieldCooldown.remainingTime !== 'undefined') {
                remaining = activeAbilityTimers.shieldCooldown.remainingTime;
                progress = 1 - (remaining / CAVALEIRO.SHIELD_COOLDOWN);
                remainingSeconds = Math.ceil(remaining / 1000);
            } else if (CAVALEIRO.shieldCooldownStart !== null) {
                elapsed = now - CAVALEIRO.shieldCooldownStart;
                progress = Math.min(elapsed / CAVALEIRO.SHIELD_COOLDOWN, 1);
                remaining = CAVALEIRO.SHIELD_COOLDOWN - elapsed;
                remainingSeconds = Math.ceil(remaining / 1000);
            }
            ctx.filter = 'grayscale(100%)';
            ctx.globalAlpha = 0.5;
            ctx.drawImage(knightShieldIcon, x, y, iconSize, iconSize);
            ctx.filter = 'none';
            ctx.globalAlpha = 1;
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y + iconSize * (1 - progress), iconSize, iconSize * progress);
            ctx.clip();
            ctx.drawImage(knightShieldIcon, x, y, iconSize, iconSize);
            ctx.restore();
            ctx.fillText(`${remainingSeconds > 0 ? remainingSeconds : 0}s`, x + iconSize + 10, y + 40);
        } else {
            ctx.drawImage(knightShieldIcon, x, y, iconSize, iconSize);
            ctx.fillText('Pronto!', x + iconSize + 10, y + 40);
        }
    }

    const y2 = y + iconSize + spacing;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Alma Reerguida:', x + iconSize + 10, y2 + 20);

    if (knightResurrectionIconLoaded) {
        if (!CAVALEIRO.voidResurrectionAvailable) {
            let elapsed = 0;
            let remaining = 0;
            let progress = 0;
            let remainingSeconds = 0;
            if (CAVALEIRO.voidResurrectionLastUsed !== null) {
                elapsed = now - CAVALEIRO.voidResurrectionLastUsed;
                remaining = CAVALEIRO.VOID_RESURRECTION_COOLDOWN - elapsed;
                progress = Math.min(elapsed / CAVALEIRO.VOID_RESURRECTION_COOLDOWN, 1);
                remainingSeconds = Math.ceil(remaining / 1000);
            }
            ctx.filter = 'grayscale(100%)';
            ctx.globalAlpha = 0.5;
            ctx.drawImage(knightResurrectionIcon, x, y2, iconSize, iconSize);
            ctx.filter = 'none';
            ctx.globalAlpha = 1;
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y2 + iconSize * (1 - progress), iconSize, iconSize * progress);
            ctx.clip();
            ctx.drawImage(knightResurrectionIcon, x, y2, iconSize, iconSize);
            ctx.restore();
            ctx.fillText(`${remainingSeconds > 0 ? remainingSeconds : 0}s`, x + iconSize + 10, y2 + 40);
        } else {
            ctx.drawImage(knightResurrectionIcon, x, y2, iconSize, iconSize);
            ctx.fillText('Pronto!', x + iconSize + 10, y2 + 40);
        }
    }
    ctx.restore();
}
