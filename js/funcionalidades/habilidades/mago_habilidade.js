function usarHabilidadeMagica(now) {
    if (MAGO.magicBlastActive || MAGO.magicBlastCooldown) return false;
    MAGO.magicBlastActive = true;
    MAGO.magicBlastCooldown = false;
    MAGO.magicBlastCooldownStart = null;
    
    activeAbilityTimers.magicBlast.startTime = now;
    activeAbilityTimers.magicBlast.remainingTime = null;
    aplicarInvulnerabilidade(MAGO.MAGIC_BLAST_DURATION);

    
    enemies.length = 0;
    morcegos.length = 0;
    if (typeof grandeInimigos !== 'undefined') {
        // marca as plataformas dos slimes para que não possam mais spawnar slimes
        for (const gi of grandeInimigos) {
            if (gi.attachedPlatform) gi.attachedPlatform._hasGrandeEnemy = true;
        }
        grandeInimigos.length = 0;
    }
    lastEnemyAllowedTime = now + MAGO.MAGIC_BLAST_DURATION;

    
    for (let j = 0; j < 30; j++) {
        createParticles(
            player.x + player.width/2,
            player.y + player.height/2,
            1,
            'rgba(138, 43, 226, 0.8)', 
            {
                speedX: Math.cos(j * Math.PI / 15) * 8,
                speedY: Math.sin(j * Math.PI / 15) * 8,
                fadeSpeed: 0.02,
                size: 6,
                gravity: 0
            }
        );
    }
    // play mystic devastation sfx
    try { if (typeof AudioManager !== 'undefined' && AudioManager && typeof AudioManager.play === 'function') AudioManager.play('mage_mystic_devastation_sfx'); } catch (e) {}
    // trigger visual pulse for rune shockwave (used by drawing code)
    try { if (typeof MAGO !== 'undefined') MAGO.activationPulseTime = now; } catch (e) {}
    return true;
}