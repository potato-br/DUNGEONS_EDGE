// ==========================
// ===== MOVIMENTO E FÍSICA =====
// ==========================

function movePlayer() {
    plataformas.forEach(p => p.isColliding = false);

    let onPlat = false;
    let currentPlatform = null;
    let caindoComPlataforma = false;
    let plataformaCaindo = null;

    aplicarGravidade();
    checarColisaoTeto();
    checarColisaoChao();
    checarColisaoLateral();
    checarPlataformasEspeciais();
    checarColisaoDuranteQueda();

    const isOnIce = handleIcePhysics(player, currentPlatform);
    handleHorizontalMovement(player, input, isOnIce);
    atualizarPlataformasEspeciais(currentPlatform);

    const nextX = player.x + player.velocityX;
    handleScreenBounds(player, nextX, gamePlayArea);

    if (player.y < 0) {
        player.y = 0;
        player.velocityY = 0;
    }

    player._wasOnPlat = onPlat;
    updatePlayerSprite(player, input, currentPlatform);

    if (input.jump.pressed && !input.jump.wasPressed) {
            if (onPlat) {
                player.jumpCount = 0;
                jump();
            } else if (player.jumpCount < player.maxJumps) {
                jump();
            }
        } else if (!input.jump.pressed && player.isJumping && player.velocityY < -4) {
            player.velocityY *= 0.85;
        }
        input.jump.wasPressed = input.jump.pressed;

    function aplicarGravidade() {
        player.velocityY += player.gravity;
        if (player.velocityY > 15) player.velocityY = 15;
    }

    function checarColisaoTeto() {
        if (player.velocityY < 0) {
            const headOrigins = [
                { x: player.x + 1, y: player.y },
                { x: player.x + player.width / 2, y: player.y },
                { x: player.x + player.width - 1, y: player.y }
            ];

            for (const origin of headOrigins) {
                const ray = raycast(origin.x, origin.y, 0, -1, Math.abs(player.velocityY) + 1, plataformas);
                if (ray) {
                    const platBox = getPlatformHitbox(ray.plataforma);
                    player.velocityY = 0;
                    player.y = platBox.y + platBox.h;
                    player.isJumping = false;
                    player.jumpCount = player.maxJumps;
                    return;
                }
            }
        }
        player.y += player.velocityY;
    }

    function checarColisaoChao() {
        if (player.velocityY >= 0) {
            const rayOrigins = [
                { x: player.x + 1, y: player.y + player.height + 1 },
                { x: player.x + player.width / 2, y: player.y + player.height + 1 },
                { x: player.x + player.width - 1, y: player.y + player.height + 1 }
            ];

            for (const origin of rayOrigins) {
                const ray = raycast(origin.x, origin.y, 0, 1, 14, plataformas);
                if (ray) {
                    onPlat = true;
                    currentPlatform = ray.plataforma;
                    player.y = getPlatformHitbox(currentPlatform).y - player.height;
                    player.velocityY = 0;
                    player.isJumping = false;
                    player.jumpCount = 0;
                    currentPlatform.isColliding = true;
                    return;
                }
            }
        }
    }

    function checarColisaoLateral() {
        const sideOriginsLeft = [
            { x: player.x, y: player.y + 1 },
            { x: player.x, y: player.y + player.height / 2 },
            { x: player.x, y: player.y + player.height - 1 }
        ];

        const sideOriginsRight = [
            { x: player.x + player.width, y: player.y + 1 },
            { x: player.x + player.width, y: player.y + player.height / 2 },
            { x: player.x + player.width, y: player.y + player.height - 1 }
        ];

        for (const origin of sideOriginsLeft) {
            const ray = raycast(origin.x, origin.y, -1, 0, 10, plataformas);
            if (ray && player.velocityX < 0) {
                player.velocityX = 0;
                player.x = getPlatformHitbox(ray.plataforma).x + getPlatformHitbox(ray.plataforma).w;
                break;
            }
        }

        for (const origin of sideOriginsRight) {
            const ray = raycast(origin.x, origin.y, 1, 0, 10, plataformas);
            if (ray && player.velocityX > 0) {
                player.velocityX = 0;
                player.x = getPlatformHitbox(ray.plataforma).x - player.width;
                break;
            }
        }
    }

    function checarPlataformasEspeciais() {
        for (const platform of plataformas) {
            if (platform.type === PLATFORM_TYPES.FANTASMA && !platform.visible) continue;
            if (platform.broken) continue;

            const platBox = getPlatformHitbox(platform);
            if (platform.falling && checkFallingPlatform(player, platform, platBox)) {
                caindoComPlataforma = true;
                plataformaCaindo = platform;
                onPlat = true;
                currentPlatform = platform;
                platform.isColliding = true;
                player.y = platBox.y - player.height;
                player.velocityY = platform.currentFallSpeed;
                break;
            }
        }
    }

    function checarColisaoDuranteQueda() {
        if (caindoComPlataforma && plataformaCaindo) {
            const nextY = player.y + player.velocityY;
            for (const platform of plataformas) {
                if (platform === plataformaCaindo) continue;
                if (platform.type === PLATFORM_TYPES.FANTASMA && !platform.visible) continue;

                const platBox = getPlatformHitbox(platform);
                const willCollideVertically = nextY + player.height > platBox.y && nextY < platBox.y + platBox.h;
                const isOverlappingHorizontally = player.x + player.width > platBox.x && player.x < platBox.x + platBox.w;

                if (willCollideVertically && isOverlappingHorizontally) {
                    player.y = platBox.y - player.height;
                    player.velocityY = 0;
                    caindoComPlataforma = false;
                    plataformaCaindo = null;
                    onPlat = true;
                    currentPlatform = platform;
                    platform.isColliding = true;
                    player.isJumping = false;
                    player.jumpCount = 0;
                    break;
                }
            }
        }
    }

    function atualizarPlataformasEspeciais(currentPlatform) {
        if (!currentPlatform) return;
        if (currentPlatform.type === PLATFORM_TYPES.QUEBRAVEL) {
            handleBreakablePlatform(currentPlatform);
        } else if (currentPlatform.type === PLATFORM_TYPES.MOVEL) {
            handleMovingPlatform(currentPlatform);
            player.x += currentPlatform.moveSpeed;
        }
    }
}

function handleIcePhysics(player, currentPlatform) {
    const isOnIce = currentPlatform && currentPlatform.type === PLATFORM_TYPES.ESCORREGADIA;
    icePhysics.update(player, currentPlatform);
    return isOnIce;
}

function handleHorizontalMovement(player, input, isOnIce) {
    if (!isOnIce && Math.abs(player.velocityX) < 1) {
        if (input.right) {
            player.velocityX = player.speed;
            player.facingRight = true;
        } else if (input.left) {
            player.velocityX = -player.speed;
            player.facingRight = false;
        } else if (!player.isJumping && Math.abs(player.velocityX) < 0.1) {
            player.velocityX = 0;
        }
    }
}

function handleScreenBounds(player, nextX, gamePlayArea) {
    if (nextX < gamePlayArea.x) {
        player.x = gamePlayArea.x;
        player.velocityX = 0;
        icePhysics.iceVelocity = player.velocityX;
    } else if (nextX + player.width > gamePlayArea.x + gamePlayArea.width) {
        player.x = gamePlayArea.x + gamePlayArea.width - player.width;
        player.velocityX = 0;
        icePhysics.iceVelocity = player.velocityX;
    } else {
        player.x = nextX;
    }
}

function updatePlayerSprite(player, input, currentPlatform) {
    if (isRespawning || gameState === 'respawnando') {
        setPlayerSpriteRow(1);
        player._idleTimer = 0;
        return;
    }
    if (DASH && DASH.isDashing) {
        setPlayerSpriteRow(0);
        player._idleTimer = 0;
        return;
    }
    if (window.spriteDebug) {
        setPlayerSpriteRow(1);
        player._idleTimer = 0;
    } else if (player.isJumping) {
        setPlayerSpriteRow(1);
        player._idleTimer = 0;
    } else if (input.right || input.left) {
        setPlayerSpriteRow(0);
        player._idleTimer = 0;
    } else {
        if (!player._idleTimer) player._idleTimer = 0;
        player._idleTimer++;
        const idleThreshold = activeCharacter === 'Kuroshi, o Ninja' ? 45 : 60;
        if (player._idleTimer > idleThreshold) {
            setPlayerSpriteRow(2);
        } else {
            setPlayerSpriteRow(1);
        }
    }
}

function getPlatformHitbox(platform) {
    return {
        x: platform.hitbox ? platform.x + (platform.hitbox.offsetX || 0) : platform.x,
        y: platform.hitbox ? platform.y + (platform.hitbox.offsetY || 0) : platform.y,
        w: platform.hitbox ? platform.hitbox.width : platform.width,
        h: platform.hitbox ? platform.hitbox.height : platform.height
    };
}

function checkFallingPlatform(player, platform, platBox) {
    const isAbove = player.y + player.height <= platBox.y + 5;
    const willCollide = player.y + player.height + player.velocityY >= platBox.y;
    const isOverlapping = player.x + player.width > platBox.x && player.x < platBox.x + platBox.w;
    return player.velocityY >= 0 && isAbove && willCollide && isOverlapping;
}

function jump() {
    // Se não tem pulos disponíveis, mostra dica
    if (player.maxJumps === 0) {
        createParticles(
            player.x + player.width/2,
            player.y + player.height,
            5,
            '#ff0000',
            {
                speedY: -2,
                fadeSpeed: 0.05,
                size: 2,
                gravity: 0.1
            }
        );
        return;
    }
    // Check if we can jump and haven't exceeded max jumps
    if (player.jumpCount < player.maxJumps) {
        // Always set consistent initial velocity
        player.velocityY = player.jumpPower;
        player.isJumping = true;
        player.jumpCount++;

        // Criar efeito de partículas no pulo
        createParticles(
            player.x + player.width/2,
            player.y + player.height,
            10,
            "#FFFFFF",
            {
                speedY: 2 + Math.random(),
                fadeSpeed: 0.03,
                size: 3 + Math.random() * 2,
                gravity: 0.2
            }
        );
    }
}

function raycast(x, y, dx, dy, length, plataformas) {
    const steps = Math.ceil(length);
    for (let i = 1; i <= steps; i++) {
        const checkX = x + dx * i;
        const checkY = y + dy * i;

        for (const plataforma of plataformas) {
            if (plataforma.type === PLATFORM_TYPES.FANTASMA && !plataforma.visible) continue;
            const { x: px, y: py, w: pw, h: ph } = getPlatformHitbox(plataforma);
            if (checkX >= px && checkX <= px + pw &&
                checkY >= py && checkY <= py + ph) {
                return { plataforma, x: checkX, y: checkY };
            }
        }
    }
    return null;
}
