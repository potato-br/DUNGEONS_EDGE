
function handleCavaleiroShield(now) {
    if (CAVALEIRO.shieldActive || CAVALEIRO.shieldCooldown) return true; 
    CAVALEIRO.shieldActive = true;
    CAVALEIRO.shieldCooldown = false;
    // record activation time for a light shockwave visual
    try { CAVALEIRO.activationPulseTime = now; } catch (e) {}
    aplicarInvulnerabilidade(CAVALEIRO.SHIELD_DURATION);
    // play lunar aegis sfx
    try { if (typeof AudioManager !== 'undefined' && AudioManager && typeof AudioManager.play === 'function') AudioManager.play('knight_lunar_aegis_sfx'); } catch (e) {}
    
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
    
    CAVALEIRO.shieldCooldownStart = now + CAVALEIRO.SHIELD_DURATION;
    activeAbilityTimers.shield.startTime = now;
    activeAbilityTimers.shield.duration = CAVALEIRO.SHIELD_DURATION;
    // small shockwave that damages/kills nearby enemies
    try {
        const shockRadius = 140; // light shock range
        if (typeof enemies !== 'undefined' && Array.isArray(enemies)) {
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                try {
                    const ex = (e.x !== undefined) ? (e.x + (e.width||0)/2) : null;
                    const ey = (e.y !== undefined) ? (e.y + (e.height||0)/2) : null;
                    const px = player.x + player.width/2;
                    const py = player.y + player.height/2;
                    if (ex !== null && ey !== null) {
                        const d = Math.hypot(ex - px, ey - py);
                        if (d <= shockRadius) {
                            // try to remove enemy cleanly if possible
                            if (typeof e.destroy === 'function') {
                                try { e.destroy(e); } catch (err) {}
                            }
                            enemies.splice(i, 1);
                        }
                    }
                } catch (err) {}
            }
        }
    } catch (e) {}
    return false; 
}


function handleCavaleiroVoidResurrection(now) {
    if (!CAVALEIRO.voidResurrectionAvailable) return false; 
    CAVALEIRO.voidResurrectionAvailable = false;
    CAVALEIRO.voidResurrectionLastUsed = now;
    if (!activeAbilityTimers.voidRes) activeAbilityTimers.voidRes = {};
    activeAbilityTimers.voidRes.startTime = now;
    activeAbilityTimers.voidRes.duration = CAVALEIRO.VOID_RESURRECTION_COOLDOWN;
    
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
    // play knight void resurrection sfx
    try { if (typeof AudioManager !== 'undefined' && AudioManager && typeof AudioManager.play === 'function') AudioManager.play('knight_void_res_sfx'); } catch (e) {}
    return true; 
}