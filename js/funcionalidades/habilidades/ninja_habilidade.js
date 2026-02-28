
function ninjasmokebomb() {
    const now = performance.now();

    
    if (NINJA.smokeBombActive) return false;
   
    
    if (NINJA.smokeBombCooldown) {
        return true;
    }

    try { if (typeof AudioManager !== 'undefined' && AudioManager && typeof AudioManager.play === 'function') AudioManager.play('ninja_smoke_sfx'); } catch (e) {}
    NINJA.smokeBombActive = true;
    NINJA.smokeBombTimer = now;
    // record smoke origin so drawing can render smoke where it was activated
    try { NINJA.smokeOrigin = { x: player.x + player.width/2, y: player.y + player.height/2 }; } catch (e) { NINJA.smokeOrigin = null; }

    // record start time for active ability timers so pause/resume can compute remaining time
    if (typeof activeAbilityTimers !== 'undefined') {
        activeAbilityTimers.ninjaSmoke = { startTime: now, remainingTime: 0 };
    }

    
    aplicarInvulnerabilidade(NINJA.NINJA_SMOKE_DURATION);

    
    createParticles(
        player.x + player.width/2,
        player.y + player.height/2,
        30,  
        'rgba(128, 128, 128, 0.8)', 
        {
            speedX: (-3 + Math.random() * 6),
            speedY: (-3 + Math.random() * 6),
            fadeSpeed: 0.02,
            size: 5,
            gravity: -0.1
        }
    );
    
    
    NINJA.smokeBombCooldownStart = now + NINJA.NINJA_SMOKE_DURATION;

    return false; 
}














