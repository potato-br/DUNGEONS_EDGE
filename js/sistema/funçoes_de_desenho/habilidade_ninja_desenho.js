function drawNinjaAbilityCooldown() {
    if (gameState === 'gameover' || activeCharacter !== 'Kuroshi, o Ninja') return;
    ctx.save();
    const x = 20;
    const y = 190;
    const iconSize = 48;
    const cornerRadius = 5;
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.beginPath();
    ctx.roundRect(x - 5, y - 25, iconSize + 120, iconSize + 10, cornerRadius);
    ctx.fill();
    ctx.font = 'bold 16px PixelFont';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText('Bomba de Fumaça:', x + iconSize + 10, y + 20);

    let now = performance.now();
    if (typeof isPaused !== 'undefined' && isPaused && typeof pauseStartTime !== 'undefined' && pauseStartTime !== null) {
        now = pauseStartTime;
    }
    let elapsed = 0;
    let remaining = 0;
    let progress = 0;
    let remainingSeconds = 0;

    if (ninjaAbilityIconLoaded) {
        if (NINJA.smokeBombActive) {
            const pulseIntensity = (Math.sin(now * 0.01) * 0.3 + 0.7);
            ctx.globalAlpha = pulseIntensity;
            ctx.drawImage(ninjaAbilityIcon, x, y, iconSize, iconSize);
            ctx.fillStyle = '#ffffff';
            
            let remainingActive = 0;
            if (typeof activeAbilityTimers !== 'undefined' && activeAbilityTimers.ninjaSmoke && typeof activeAbilityTimers.ninjaSmoke.remainingTime !== 'undefined' && activeAbilityTimers.ninjaSmoke.remainingTime > 0) {
                remainingActive = activeAbilityTimers.ninjaSmoke.remainingTime;
            } else if (typeof activeAbilityTimers !== 'undefined' && activeAbilityTimers.ninjaSmoke && typeof activeAbilityTimers.ninjaSmoke.startTime !== 'undefined' && activeAbilityTimers.ninjaSmoke.startTime > 0) {
                remainingActive = NINJA.NINJA_SMOKE_DURATION - (now - activeAbilityTimers.ninjaSmoke.startTime);
            } else if (typeof NINJA.smokeBombTimer !== 'undefined' && NINJA.smokeBombTimer !== null && NINJA.smokeBombActive) {
                remainingActive = NINJA.NINJA_SMOKE_DURATION - (now - NINJA.smokeBombTimer);
            }
            remainingActive = Math.max(0, remainingActive);
            ctx.fillText(`ATIVO! ${(remainingActive/1000).toFixed(1)}s`, x + iconSize + 10, y + 40);
        } else if (NINJA.smokeBombCooldown) {
            if (typeof isPaused !== 'undefined' && isPaused && typeof activeAbilityTimers !== 'undefined' && activeAbilityTimers.ninjaSmokeCooldown && typeof activeAbilityTimers.ninjaSmokeCooldown.remainingTime !== 'undefined') {
                remaining = activeAbilityTimers.ninjaSmokeCooldown.remainingTime;
                progress = 1 - (remaining / NINJA.NINJA_SMOKE_COOLDOWN);
                remainingSeconds = Math.ceil(remaining / 1000);
            } else if (typeof NINJA.smokeBombTimer !== 'undefined' && NINJA.smokeBombTimer !== null) {
                elapsed = now - NINJA.smokeBombTimer;
                progress = Math.min(elapsed / NINJA.NINJA_SMOKE_COOLDOWN, 1);
                remaining = NINJA.NINJA_SMOKE_COOLDOWN - elapsed;
                remainingSeconds = Math.ceil(remaining / 1000);
            }
            ctx.filter = 'grayscale(100%)';
            ctx.globalAlpha = 0.5;
            ctx.drawImage(ninjaAbilityIcon, x, y, iconSize, iconSize);
            ctx.filter = 'none';
            ctx.globalAlpha = 1;
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y + iconSize * (1 - progress), iconSize, iconSize * progress);
            ctx.clip();
            ctx.drawImage(ninjaAbilityIcon, x, y, iconSize, iconSize);
            ctx.restore();
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`${remainingSeconds > 0 ? remainingSeconds : 0}s`, x + iconSize + 10, y + 40);
        } else {
            ctx.drawImage(ninjaAbilityIcon, x, y, iconSize, iconSize);
            ctx.fillStyle = '#ffffff';
            ctx.fillText('Pronto!', x + iconSize + 10, y + 40);
        }
    }
    ctx.restore();
}
