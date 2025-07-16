// ==========================
// ===== EFEITOS VISUAIS E IMORTALIDADE =====
// ==========================

let invulnEndTime = 0;
let isBlinking = false;
let blinkTimer = null;
let blinkPauseData = null;

function aplicarInvulnerabilidade(tempoMs, comPiscadas = false) {
    const now = performance.now();
    DASH.isInvulnerable = true;
    DASH.invulnEndTime = now + tempoMs;
    // --- INTEGRAÇÃO NINJA: seta flag de invulnerabilidade por dano ---
    if (activeCharacter === 'Kuroshi, o Ninja' && !DASH.isDashing && !NINJA.smokeBombActive) {
        NINJA.invulneravelPorDano = true;
    }
    if (comPiscadas) {
        piscarJogador(tempoMs);
    } else {
        pararPiscar();
        player.visible = true;
    }
}

function checarInvulnerabilidade() {
    if (!DASH.isInvulnerable) return;
    if (typeof isPaused !== 'undefined' && isPaused) return;
    if (performance.now() >= DASH.invulnEndTime) {
        DASH.isInvulnerable = false;
        pararPiscar();
        player.visible = true;
        // --- INTEGRAÇÃO NINJA: limpa flag de invulnerabilidade por dano ---
        if (activeCharacter === 'Kuroshi, o Ninja') {
            NINJA.invulneravelPorDano = false;
        }
    }
}

function piscarJogador(tempoMs = 1000, piscadas = 6) {
    pararPiscar();
    isBlinking = true;
    let blinkCount = 0;
    const blinkInterval = tempoMs / piscadas;
    let blinkStart = performance.now();
    blinkPauseData = { tempoMs, piscadas, blinkCount, blinkStart, blinkInterval, remaining: tempoMs };
    blinkTimer = setInterval(() => {
        player.visible = !player.visible;
        blinkCount++;
        blinkPauseData.blinkCount = blinkCount;
        if (blinkCount >= piscadas) {
            pararPiscar();
            player.visible = true;
        }
    }, blinkInterval);
}

function onPauseTogglePiscada(paused) {
    if (paused && isBlinking && blinkPauseData) {
        blinkPauseData.pauseTime = performance.now();
        if (blinkTimer) clearInterval(blinkTimer);
        blinkTimer = null;
    } else if (!paused && isBlinking && blinkPauseData && typeof blinkPauseData.pauseTime !== 'undefined') {
        const pauseDuration = performance.now() - blinkPauseData.pauseTime;
        blinkPauseData.blinkStart += pauseDuration;
        // Calcula o tempo restante de piscadas
        const remainingPiscadas = blinkPauseData.piscadas - blinkPauseData.blinkCount;
        if (remainingPiscadas > 0) {
            blinkTimer = setInterval(() => {
                player.visible = !player.visible;
                blinkPauseData.blinkCount++;
                if (blinkPauseData.blinkCount >= blinkPauseData.piscadas) {
                    pararPiscar();
                    player.visible = true;
                }
            }, blinkPauseData.blinkInterval);
        }
        delete blinkPauseData.pauseTime;
    }
}

function pararPiscar() {
    if (blinkTimer) clearInterval(blinkTimer);
    blinkTimer = null;
    isBlinking = false;
    player.visible = true;
}

function cancelarInvulnerabilidade() {
    DASH.isInvulnerable = false;
    if (typeof pararPiscar === 'function') pararPiscar();
    player.visible = true;
}

