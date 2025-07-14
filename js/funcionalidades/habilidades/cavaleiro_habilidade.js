// Habilidade: Escudo do Cavaleiro
function handleCavaleiroShield(now) {
    if (CAVALEIRO.shieldActive || CAVALEIRO.shieldCooldown) return true; // já ativo ou em cooldown, toma dano
    CAVALEIRO.shieldActive = true;
    CAVALEIRO.shieldCooldown = false;
    aplicarInvulnerabilidade(CAVALEIRO.SHIELD_DURATION);
    // Efeito visual do escudo
    for (let i = 0; i < 2; i++) {
        setTimeout(() => {
            createParticles(
                player.x + player.width/2,
                player.y + player.height/2,
                8,
                'rgba(30, 144, 255, 0.8)',
                {
                    speedX: Math.cos(i * Math.PI) * 2,
                    speedY: Math.sin(i * Math.PI) * 2,
                    fadeSpeed: 0.01,
                    size: 8,
                    gravity: 0
                }
            );
        }, i * 1000);
    }
    // Inicia timers
    CAVALEIRO.shieldCooldownStart = now + CAVALEIRO.SHIELD_DURATION;
    activeAbilityTimers.shield.startTime = now;
    activeAbilityTimers.shield.duration = CAVALEIRO.SHIELD_DURATION;
    return false; // Não toma dano agora
}

// Habilidade: Ressurreição do Cavaleiro (Alma Reerguida)
function handleCavaleiroVoidResurrection(now) {
    if (!CAVALEIRO.voidResurrectionAvailable) return false; // já usada, não ressuscita
    CAVALEIRO.voidResurrectionAvailable = false;
    CAVALEIRO.voidResurrectionLastUsed = now;
    activeAbilityTimers.voidRes.startTime = now;
    activeAbilityTimers.voidRes.duration = CAVALEIRO.VOID_RESURRECTION_COOLDOWN;
    // Efeito visual de ressurreição
    createParticles(
        player.x + player.width/2,
        player.y + player.height/2,
        20,
        'rgba(255,255,255,0.7)',
        {
            speedX: (-3 + Math.random() * 6),
            speedY: (-3 + Math.random() * 6),
            fadeSpeed: 0.02,
            size: 7,
            gravity: -0.1
        }
    );
    return true; // Ressuscita
}