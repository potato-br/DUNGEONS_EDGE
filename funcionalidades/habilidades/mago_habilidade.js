function usarHabilidadeMagica(now) {
    if (MAGO.magicBlastActive || MAGO.magicBlastCooldown) return false;
    MAGO.magicBlastActive = true;
    MAGO.magicBlastCooldown = false;
    MAGO.magicBlastCooldownStart = null;
    // Timer centralizado para pausa
    activeAbilityTimers.magicBlast.startTime = now;
    activeAbilityTimers.magicBlast.remainingTime = null;
    aplicarInvulnerabilidade(MAGO.MAGIC_INVULN_DURATION);

    // Clear all enemies
    enemies.length = 0;
    // Block enemy spawning
    lastEnemyAllowedTime = now + MAGO.MAGIC_BLAST_DURATION;

    // Create magic blast effect
    for (let j = 0; j < 30; j++) {
        createParticles(
            player.x + player.width/2,
            player.y + player.height/2,
            1,
            'rgba(138, 43, 226, 0.8)', // Purple color for magic
            {
                speedX: Math.cos(j * Math.PI / 15) * 8,
                speedY: Math.sin(j * Math.PI / 15) * 8,
                fadeSpeed: 0.02,
                size: 6,
                gravity: 0
            }
        );
    }
    return true;
}