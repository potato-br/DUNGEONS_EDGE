function drawMagoAbilityCooldown() {
    if (gameState === 'gameover' || activeCharacter !== 'Valthor, o Mago') return;
    ctx.save();
    const x = 20;
    const y = 130;
    const iconSize = 48;
    const cornerRadius = 5;
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.beginPath();
    ctx.roundRect(x - 5, y - 25, iconSize + 120, iconSize + 10, cornerRadius);
    ctx.fill();
    ctx.font = 'bold 16px PixelFont';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText('devastação mística:', x + iconSize + 10, y + 20);

    let now = performance.now();
    if (typeof isPaused !== 'undefined' && isPaused && typeof pauseStartTime !== 'undefined' && pauseStartTime !== null) {
        now = pauseStartTime;
    }

    if (mageAbilityIconLoaded) {
        if (MAGO.magicBlastActive) {
            ctx.save();
            const pulseIntensity = (Math.sin(now * 0.01) * 0.3 + 0.7);
            ctx.globalAlpha = pulseIntensity;
            ctx.drawImage(mageAbilityIcon, x, y, iconSize, iconSize);
            // Tempo restante
            let remainingActive = 0;
            if (typeof activeAbilityTimers !== 'undefined' && activeAbilityTimers.magicBlast && typeof activeAbilityTimers.magicBlast.startTime !== 'undefined') {
                remainingActive = MAGO.MAGIC_BLAST_DURATION - (now - activeAbilityTimers.magicBlast.startTime);
            } else if (typeof MAGO.magicBlastCooldownStart !== 'undefined' && MAGO.magicBlastCooldownStart !== null) {
                remainingActive = MAGO.MAGIC_BLAST_DURATION - (now - (MAGO.magicBlastCooldownStart - MAGO.MAGIC_BLAST_DURATION));
            }
            remainingActive = Math.max(0, remainingActive);
            ctx.fillText(`ATIVO! ${(remainingActive/1000).toFixed(1)}s`, x + iconSize + 10, y + 40);
            ctx.restore();
        } else if (MAGO.magicBlastCooldown) {
            let elapsed = 0;
            if (typeof MAGO.magicBlastCooldownStart !== 'undefined' && MAGO.magicBlastCooldownStart !== null) {
                elapsed = now - MAGO.magicBlastCooldownStart;
            }
            const progress = Math.min(elapsed / MAGO.MAGIC_BLAST_COOLDOWN, 1);
            ctx.filter = 'grayscale(100%)';
            ctx.globalAlpha = 0.5;
            ctx.drawImage(mageAbilityIcon, x, y, iconSize, iconSize);
            ctx.filter = 'none';
            ctx.globalAlpha = 1;
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y + iconSize * (1 - progress), iconSize, iconSize * progress);
            ctx.clip();
            ctx.drawImage(mageAbilityIcon, x, y, iconSize, iconSize);
            ctx.restore();
            const remainingSeconds = Math.ceil((MAGO.MAGIC_BLAST_COOLDOWN - elapsed) / 1000);
            ctx.fillText(`${remainingSeconds > 0 ? remainingSeconds : 0}s`, x + iconSize + 10, y + 40);
        } else {
            ctx.drawImage(mageAbilityIcon, x, y, iconSize, iconSize);
            ctx.fillText('Pronto!', x + iconSize + 10, y + 40);
        }
    }
    ctx.restore();
}
