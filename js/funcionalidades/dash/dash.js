// ==========================
// ===== DASH SYSTEM ========
// ==========================

// === Dash State ===
const DASH = {
    isInvulnerable: false, // Invulnerabilidade geral
    isDashing: false,
    cooldown: false,
    duration: 150, // ms
    speed: 10,
    cooldownTime: 5000, // ms
    lastDashTime: 0,
    extraInvuln: 1000, // ms
    extraInvulnMax: 3000, // ms
    invulnTimeout: null,
    trailPoints: [],
    trailActive: false,
    startPoint: null,
    TRAIL_LENGTH: 20,
    trailStack: [],
    endTime: 0,
    trailFadeFrame: 0
};

// === Personagem: Roderick, o Cavaleiro ===
const CAVALEIRO = {
    shieldActive: false,
    shieldCooldown: false,
    SHIELD_DURATION: 6000,
    SHIELD_COOLDOWN: 8000,
    shieldCooldownStart: null,
    voidResurrectionAvailable: true,
    voidResurrectionLastUsed: null,
    VOID_RESURRECTION_COOLDOWN: 30000
};

// === Personagem: Valthor, o Mago ===
const MAGO = {
    magicBlastActive: false,
    magicBlastCooldown: false,
    MAGIC_BLAST_DURATION: 6000,
    MAGIC_BLAST_COOLDOWN: 15000,
    MAGIC_INVULN_DURATION: 5500,
    magicBlastCooldownStart: null
};

// === Personagem: Kuroshi, o Ninja ===
const NINJA = {
    smokeBombActive: false,
    smokeBombCooldown: false,
    smokeBombTimer: 0,
    NINJA_SMOKE_DURATION: 2000,
    NINJA_SMOKE_COOLDOWN: 8000,
    smokeBombCooldownStart: null,
    invulneravelPorDano: false // Flag para aura de dano
};

// === Controle de Pausa e Timers ===
let pauseStartTime = null;
let totalPausedTime = 0;
let activeAbilityTimers = {
    shield: { startTime: 0, remainingTime: 0 },
    magicBlast: { startTime: 0, remainingTime: 0 },
    ninjaSmoke: { startTime: 0, remainingTime: 0 },
    voidRes: { startTime: 0, remainingTime: 0 },
    // ... outros se necessário ...
};

// === Função: Pausa/Despausa ===
function onPauseToggle(paused) {
    if (paused) {
        pauseStartTime = performance.now();
        // Salva o tempo restante de cada habilidade ativa
        if (CAVALEIRO.shieldActive && activeAbilityTimers.shield.startTime) {
            activeAbilityTimers.shield.remainingTime = 
                CAVALEIRO.SHIELD_DURATION - (pauseStartTime - activeAbilityTimers.shield.startTime);
        }
        if (CAVALEIRO.shieldCooldown && CAVALEIRO.shieldCooldownStart) {
            activeAbilityTimers.shieldCooldown = {
                remainingTime: CAVALEIRO.SHIELD_COOLDOWN - (pauseStartTime - CAVALEIRO.shieldCooldownStart)
            };
        }
        if (!CAVALEIRO.voidResurrectionAvailable && CAVALEIRO.voidResurrectionLastUsed) {
            activeAbilityTimers.voidRes = {
                remainingTime: CAVALEIRO.VOID_RESURRECTION_COOLDOWN - (pauseStartTime - CAVALEIRO.voidResurrectionLastUsed)
            };
        }
        if (MAGO.magicBlastActive && activeAbilityTimers.magicBlast.startTime) {
            activeAbilityTimers.magicBlast.remainingTime = 
                MAGO.MAGIC_BLAST_DURATION - (pauseStartTime - activeAbilityTimers.magicBlast.startTime);
        }
        if (NINJA.smokeBombActive) {
            activeAbilityTimers.ninjaSmoke.remainingTime = 
                NINJA.NINJA_SMOKE_DURATION - (pauseStartTime - activeAbilityTimers.ninjaSmoke.startTime);
        }
        // Invulnerabilidade
        if (DASH.isInvulnerable && typeof invulnEndTime !== 'undefined' && invulnEndTime > pauseStartTime) {
            activeAbilityTimers.invulnerabilidade = {
                remainingTime: invulnEndTime - pauseStartTime
            };
        }
        // Cooldowns
        if (MAGO.magicBlastCooldown && MAGO.magicBlastCooldownStart) {
            activeAbilityTimers.magicBlastCooldown = {
                remainingTime: MAGO.MAGIC_BLAST_COOLDOWN - (pauseStartTime - MAGO.magicBlastCooldownStart)
            };
        }
        if (NINJA.smokeBombCooldown) {
            activeAbilityTimers.ninjaSmokeCooldown = {
                remainingTime: NINJA.NINJA_SMOKE_COOLDOWN - (pauseStartTime - NINJA.smokeBombTimer)
            };
        }
        if (CAVALEIRO.shieldCooldown && CAVALEIRO.shieldCooldownStart) {
            activeAbilityTimers.shieldCooldown = {
                remainingTime: CAVALEIRO.SHIELD_COOLDOWN - (pauseStartTime - CAVALEIRO.shieldCooldownStart)
            };
        }
        // --- PAUSA O BLOQUEIO DE INIMIGOS DO MAGO ---
        if (typeof lastEnemyAllowedTime !== 'undefined' && lastEnemyAllowedTime > pauseStartTime) {
            activeAbilityTimers.magoEnemyBlock = {
                remainingTime: lastEnemyAllowedTime - pauseStartTime
            };
        }
    } else if (pauseStartTime !== null) {
        const pauseDuration = performance.now() - pauseStartTime;
        totalPausedTime += pauseDuration;
        if (player.lastDashRecharge) player.lastDashRecharge += pauseDuration;
        if (DASH.lastDashTime) DASH.lastDashTime += pauseDuration;
        // Restaura timers do escudo
        if (activeAbilityTimers.shield.remainingTime) {
            // Garante que o escudo dure o tempo correto após o pause
            activeAbilityTimers.shield.startTime = performance.now();
            // Atualiza o shieldCooldownStart para o novo fim do escudo
            if (CAVALEIRO.shieldActive) {
                CAVALEIRO.shieldCooldownStart = performance.now() + activeAbilityTimers.shield.remainingTime;
            }
        }
        if (activeAbilityTimers.shieldCooldown && activeAbilityTimers.shieldCooldown.remainingTime) {
            CAVALEIRO.shieldCooldownStart = performance.now() - (CAVALEIRO.SHIELD_COOLDOWN - activeAbilityTimers.shieldCooldown.remainingTime);
            activeAbilityTimers.shieldCooldown = null;
        }
        // Restaura timer da ressurreição
        if (activeAbilityTimers.voidRes && activeAbilityTimers.voidRes.remainingTime) {
            CAVALEIRO.voidResurrectionLastUsed = performance.now() - (CAVALEIRO.VOID_RESURRECTION_COOLDOWN - activeAbilityTimers.voidRes.remainingTime);
            activeAbilityTimers.voidRes = null;
        }
        // Restaura timers
        if (activeAbilityTimers.magicBlast.remainingTime) {
            activeAbilityTimers.magicBlast.startTime = performance.now() - 
                (MAGO.MAGIC_BLAST_DURATION - activeAbilityTimers.magicBlast.remainingTime);
        }
        if (activeAbilityTimers.ninjaSmoke.remainingTime) {
            activeAbilityTimers.ninjaSmoke.startTime = performance.now() - 
                (NINJA.NINJA_SMOKE_DURATION - activeAbilityTimers.ninjaSmoke.remainingTime);
        }
        // Corrige o fim da invulnerabilidade
        if (typeof DASH.invulnEndTime !== 'undefined' && DASH.isInvulnerable && DASH.invulnEndTime) {
            DASH.invulnEndTime += pauseDuration;
        }
        // Corrige o timer da bomba de fumaça
        if (NINJA.smokeBombActive && NINJA.smokeBombTimer) {
            NINJA.smokeBombTimer += pauseDuration;
        }
        // --- RETOMA O BLOQUEIO DE INIMIGOS DO MAGO ---
        if (activeAbilityTimers.magoEnemyBlock && activeAbilityTimers.magoEnemyBlock.remainingTime) {
            lastEnemyAllowedTime = performance.now() + activeAbilityTimers.magoEnemyBlock.remainingTime;
            activeAbilityTimers.magoEnemyBlock = null;
        }
        if (activeAbilityTimers.invulnerabilidade && activeAbilityTimers.invulnerabilidade.remainingTime) {
            invulnEndTime = performance.now() + activeAbilityTimers.invulnerabilidade.remainingTime;
            activeAbilityTimers.invulnerabilidade = null;
        }
        if (activeAbilityTimers.magicBlastCooldown && activeAbilityTimers.magicBlastCooldown.remainingTime) {
            MAGO.magicBlastCooldownStart = performance.now() - (MAGO.MAGIC_BLAST_COOLDOWN - activeAbilityTimers.magicBlastCooldown.remainingTime);
            activeAbilityTimers.magicBlastCooldown = null;
        }
        if (activeAbilityTimers.ninjaSmokeCooldown && activeAbilityTimers.ninjaSmokeCooldown.remainingTime) {
            NINJA.smokeBombTimer = performance.now() - (NINJA.NINJA_SMOKE_COOLDOWN - activeAbilityTimers.ninjaSmokeCooldown.remainingTime);
            activeAbilityTimers.ninjaSmokeCooldown = null;
        }
        if (activeAbilityTimers.shieldCooldown && activeAbilityTimers.shieldCooldown.remainingTime) {
            CAVALEIRO.shieldCooldownStart = performance.now() - (CAVALEIRO.SHIELD_COOLDOWN - activeAbilityTimers.shieldCooldown.remainingTime);
            activeAbilityTimers.shieldCooldown = null;
        }
        pauseStartTime = null;
    }
    if (typeof onPauseTogglePiscada === 'function') onPauseTogglePiscada(paused);
}

// === Função: Lidar com Cooldowns ===
function updateCooldowns(now) {
    if (isPaused && typeof pauseStartTime !== 'undefined' && pauseStartTime !== null) {
        now = pauseStartTime;
    }
    // Dash global cooldown (exceto Ninja)
    if (DASH.cooldown && now - DASH.lastDashTime >= DASH.cooldownTime) {
        DASH.cooldown = false;
    }
    // Ninja: recarrega dash individual
    if (activeCharacter === 'Kuroshi, o Ninja' && player.currentDashes < player.maxDashes) {
        const timeSinceLastDash = now - player.lastDashRecharge;
        if (!input.dash && timeSinceLastDash >= player.dashRechargeTime && !DASH.isDashing) {
            player.currentDashes++;
            player.lastDashRecharge = now;
        }
    }
    // Ninja: cooldown da bomba de fumaça
    if (NINJA.smokeBombActive) {
        if (!DASH.isInvulnerable) {
            NINJA.smokeBombActive = false;
            NINJA.smokeBombCooldown = true;
            NINJA.smokeBombTimer = now;
        }
    }
    if (NINJA.smokeBombCooldown && now - NINJA.smokeBombTimer >= NINJA.NINJA_SMOKE_COOLDOWN) {
        NINJA.smokeBombCooldown = false;
        NINJA.smokeBombTimer = 0;
    }
    // Cavaleiro: cooldown do escudo
    if (CAVALEIRO.shieldActive && CAVALEIRO.shieldCooldownStart && now >= CAVALEIRO.shieldCooldownStart) {
        CAVALEIRO.shieldActive = false;
        DASH.isInvulnerable = false;
        CAVALEIRO.shieldCooldown = true;
        CAVALEIRO.shieldCooldownStart = now;
    }
    if (CAVALEIRO.shieldCooldown && CAVALEIRO.shieldCooldownStart && now - CAVALEIRO.shieldCooldownStart >= CAVALEIRO.SHIELD_COOLDOWN) {
        CAVALEIRO.shieldCooldown = false;
        CAVALEIRO.shieldCooldownStart = null;
    }
    if (CAVALEIRO.shieldActive && activeAbilityTimers.shield.startTime) {
        const elapsed = now - activeAbilityTimers.shield.startTime;
        if (elapsed >= CAVALEIRO.SHIELD_DURATION) {
            CAVALEIRO.shieldActive = false;
            DASH.isInvulnerable = false;
            CAVALEIRO.shieldCooldown = true;
            CAVALEIRO.shieldCooldownStart = now;
            activeAbilityTimers.shield.startTime = null;
            activeAbilityTimers.shield.remainingTime = null;
        }
    }
    // Mago: cooldown da magia
    if (MAGO.magicBlastActive && activeAbilityTimers.magicBlast.startTime) {
        const elapsed = now - activeAbilityTimers.magicBlast.startTime;
        if (elapsed >= MAGO.MAGIC_BLAST_DURATION) {
            MAGO.magicBlastActive = false;
            DASH.isInvulnerable = false;
            MAGO.magicBlastCooldown = true;
            MAGO.magicBlastCooldownStart = now;
            activeAbilityTimers.magicBlast.startTime = null;
            activeAbilityTimers.magicBlast.remainingTime = null;
        }
    }
    if (MAGO.magicBlastCooldown && MAGO.magicBlastCooldownStart && now - MAGO.magicBlastCooldownStart >= MAGO.MAGIC_BLAST_COOLDOWN) {
        MAGO.magicBlastCooldown = false;
        MAGO.magicBlastCooldownStart = null;
    }
    // Cooldown da ressurreição do cavaleiro
    if (!CAVALEIRO.voidResurrectionAvailable && CAVALEIRO.voidResurrectionLastUsed !== null) {
        if (now - CAVALEIRO.voidResurrectionLastUsed >= CAVALEIRO.VOID_RESURRECTION_COOLDOWN) {
            CAVALEIRO.voidResurrectionAvailable = true;
            CAVALEIRO.voidResurrectionLastUsed = null;
        }
    }
}

// === Função: Aplicar Invulnerabilidade ===
function aplicarInvulnerabilidade(duration) {
    DASH.isInvulnerable = true;
    clearTimeout(DASH.invulnTimeout);
    DASH.invulnTimeout = setTimeout(() => {
        DASH.isInvulnerable = false;
    }, duration);
}

// === Função: Atualizar Trail ===
function atualizarTrail(now) {
    // Limpa o trail apenas quando NÃO estiver em dash nem invulnerável
    if (!DASH.isDashing && !DASH.isInvulnerable && DASH.trailPoints.length) {
        DASH.trailFadeFrame++;
        if (DASH.trailFadeFrame % 3 === 0) {
            DASH.trailPoints.pop();
            if (DASH.trailPoints.length === 0) {
                DASH.startPoint = null;
            }
        }
    }
    // Atualiza o fade dos pontos
    for (let i = DASH.trailPoints.length - 1; i >= 0; i--) {
        const point = DASH.trailPoints[i];
        if (!point.fadeStart && !DASH.isDashing) {
            point.fadeStart = now;
        }
        if (point.fadeStart) {
            const fadeElapsed = now - point.fadeStart;
            const fadeDuration = 500;
            if (fadeElapsed >= fadeDuration) {
                DASH.trailPoints.splice(i, 1);
            }
        }
    }
    if (DASH.trailPoints.length === 0) {
        DASH.startPoint = null;
    }
}

// === Função: Handle Dash Principal ===
function handleDash(now) {
    updateCooldowns(now);
    if (gameState !== 'jogando' || isRespawning) return;
    if (isGameOver || gameState !== 'jogando' || isRespawning) {
        // Reset de estados
        DASH.isDashing = false;
        DASH.isInvulnerable = false;
        DASH.trailActive = false;
        DASH.trailPoints = [];
        DASH.trailStack = [];
        DASH.startPoint = null;
        CAVALEIRO.shieldActive = false;
        CAVALEIRO.shieldCooldown = false;
        CAVALEIRO.voidResurrectionAvailable = true;
        player.visible = true;
        return;
    }
    // Habilidades Especiais
    if (activeCharacter === 'Roderick, o Cavaleiro' && input.dash && !CAVALEIRO.shieldActive && !CAVALEIRO.shieldCooldown) {
        return handleCavaleiroShield(now);
    }
    if (activeCharacter === 'Valthor, o Mago' && input.dash && !MAGO.magicBlastCooldown) {
        return usarHabilidadeMagica(now);
    }
    if (activeCharacter === 'Valthor, o Mago' || activeCharacter === 'Roderick, o Cavaleiro') return;
    // Ninja: recarrega dash
    if (activeCharacter === 'Kuroshi, o Ninja' && player.currentDashes < player.maxDashes) {
        const timeSinceLastDash = now - player.lastDashRecharge;
        if (!input.dash && timeSinceLastDash >= player.dashRechargeTime && !DASH.isDashing) {
            player.currentDashes++;
            player.lastDashRecharge = now;
        }
    }
    // Criação de fantasmas
    let podeCriarFantasma = DASH.isDashing || DASH.isInvulnerable || NINJA.smokeBombActive;
    if (podeCriarFantasma && !isBlinking) {
        if (!DASH.startPoint) {
            DASH.startPoint = {
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
                facingRight: player.facingRight
            };
        }
        const MIN_DIST = 40;
        const last = DASH.trailPoints[0];
        const px = player.x + player.width / 2;
        const py = player.y + player.height / 2;
        if (!last || Math.hypot(px - last.x, py - last.y) >= MIN_DIST) {
            DASH.trailPoints.unshift({
                x: px,
                y: py,
                time: now,
                fadeStart: null,
                facingRight: player.facingRight
            });
            if (DASH.trailPoints.length > DASH.TRAIL_LENGTH) {
                DASH.trailPoints.pop();
            }
        }
    }
    atualizarTrail(now);
    // Verifica se já terminou o dash
    if (DASH.isDashing && now - DASH.lastDashTime >= DASH.duration) {
        DASH.isDashing = false;
        player.visible = true;
        for (const point of DASH.trailPoints) {
            if (!point.fadeStart) {
                point.fadeStart = now;
            }
        }
        if (activeCharacter === 'Kuroshi, o Ninja') {
            player.lastIndividualDash = now;
        }
    }
    // Dash real: movimento
    if (DASH.isDashing) {
        const MIN_DIST_DASH = 40;
        const last = DASH.trailPoints[0];
        const px = player.x + player.width / 2;
        const py = player.y + player.height / 2;
        if (!last || Math.hypot(px - last.x, py - last.y) >= MIN_DIST_DASH) {
            DASH.trailPoints.unshift({
                x: px,
                y: py,
                time: now,
                fadeStart: null,
                facingRight: player.facingRight
            });
            if (DASH.trailPoints.length > DASH.TRAIL_LENGTH) {
                DASH.trailPoints.pop();
            }
        }
        // Partículas
        if (typeof createParticles === 'function' && Math.random() < 0.4) {
            const particleX = player.x + player.width/2 + (player.facingRight ? -10 : 10);
            const particleY = player.y + player.height/2;
            createParticles(particleX, particleY, 2, 'rgba(255, 215, 0, 0.6)');
        }
        // Direção
        let dashDirection = handleDash.dashInitialDirection;
        if (input.right) {
            dashDirection = 1;
            player.facingRight = true;
        } else if (input.left) {
            dashDirection = -1;
            player.facingRight = false;
        }
        // Colisão
        const newX = player.x + DASH.speed * dashDirection;
        if (newX <= 0 || newX + player.width >= screenWidth) {
            DASH.isDashing = false;
            player.visible = true;
            player.velocityX = 0;
            player.x = newX <= 0 ? 0 : screenWidth - player.width;
            return;
        }
        player.x = newX;
        return;
    }
    // Inicia novo dash
    if (input.dash && !DASH.isDashing && !DASH.cooldown && !handleDash._dashPressed) {
        let canDash = true;
        if (activeCharacter === 'Kuroshi, o Ninja') {
            canDash = player.currentDashes > 0;
            if (canDash) {
                player.currentDashes--;
                player.lastDashRecharge = now;
            }
        } else {
            canDash = !DASH.cooldown;
            if (canDash) {
                DASH.cooldown = true;
                DASH.lastDashTime = now;
            }
        }
        if (canDash) {
            DASH.isDashing = true;
            DASH.trailActive = true;
            DASH.lastDashTime = now;
            handleDash._dashPressed = true;
            if (activeCharacter === 'Kuroshi, o Ninja') {
                player.lastDashRecharge = now;
            }
            let invulnDuration;
            if (activeCharacter === 'Kuroshi, o Ninja') {
                invulnDuration = DASH.duration + 1000;
            } else {
                invulnDuration = DASH.duration + DASH.extraInvuln;
            }
            aplicarInvulnerabilidade(invulnDuration);
            handleDash.dashInitialDirection = player.facingRight ? 1 : -1;
            dashGhosts = [];
        }
    }
    if (!input.dash) {
        handleDash._dashPressed = false;
    }
    // Limpa trails antigos
    for (let i = DASH.trailStack.length - 1; i >= 0; i--) {
        const trail = DASH.trailStack[i];
        const elapsed = now - trail.endTime;
        if (elapsed > DASH.extraInvuln) {
            DASH.trailStack.splice(i, 1);
        }
    }
    // Limpa o trail do dash atual
    if (!DASH.isDashing && !DASH.trailActive && DASH.trailPoints.length > 0 && DASH.endTime) {
        const elapsed = now - DASH.endTime;
        if (elapsed > DASH.extraInvuln) {
            DASH.trailPoints = [];
            DASH.startPoint = null;
        }
    }
}

// Função para resetar cooldowns e estados de habilidades ao sair da loja
function resetarCooldownsHabilidades() {
    // Ninja
    NINJA.smokeBombActive = false;
    NINJA.smokeBombCooldown = false;
    NINJA.smokeBombTimer = 0;
    NINJA.smokeBombCooldownStart = null;
    NINJA.invulneravelPorDano = false;
    if (typeof activeAbilityTimers !== 'undefined') {
        activeAbilityTimers.ninjaSmoke = { startTime: 0, remainingTime: 0 };
        activeAbilityTimers.ninjaSmokeCooldown = { remainingTime: 0 };
    }
    // Cavaleiro
    CAVALEIRO.shieldActive = false;
    CAVALEIRO.shieldCooldown = false;
    CAVALEIRO.shieldCooldownStart = null;
    CAVALEIRO.voidResurrectionAvailable = true;
    CAVALEIRO.voidResurrectionLastUsed = null;
    if (typeof activeAbilityTimers !== 'undefined') {
        activeAbilityTimers.shield = { startTime: 0, remainingTime: 0 };
        activeAbilityTimers.shieldCooldown = { remainingTime: 0 };
        activeAbilityTimers.voidRes = { startTime: 0, remainingTime: 0 };
    }
    // Mago
    MAGO.magicBlastActive = false;
    MAGO.magicBlastCooldown = false;
    MAGO.magicBlastCooldownStart = null;
    if (typeof activeAbilityTimers !== 'undefined') {
        activeAbilityTimers.magicBlast = { startTime: 0, remainingTime: 0 };
        activeAbilityTimers.magicBlastCooldown = { remainingTime: 0 };
    }
    // Dash global
    DASH.cooldown = false;
    DASH.lastDashTime = 0;
    // Outros resets se necessário...
}
