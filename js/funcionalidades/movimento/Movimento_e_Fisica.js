



function movePlayer() {
    plataformas.forEach(p => p.isColliding = false);

    let onPlat = false;
    let currentPlatform = null;
    let caindoComPlataforma = false;
    let plataformaCaindo = null;
    
    // Reset do estado de colisão lateral
    player.emColisaoLateral = false;

    // Primeiro verificamos colisões laterais para prevenir o teleporte
    checarColisaoLateral();
    // Depois aplicamos gravidade e outras colisões
    aplicarGravidade();
    checarColisaoTeto();
    checarColisaoChao();
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
        // Guarda a posição anterior
        player.previousY = player.y;
        
        // Só aplica gravidade se não estiver subindo em colisão lateral
        if (!player.emColisaoLateral || player.velocityY >= 0) {
            player.velocityY += player.gravity;
            if (player.velocityY > 15) player.velocityY = 15;
        }
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
                if (ray && !ray.plataforma.falling) {
                    const platBox = getPlatformHitbox(ray.plataforma);
                    player.velocityY = 0;
                    player.y = platBox.y + platBox.h;
                    player.isJumping = false;
                    
                    return;
                }
            }
        }
        player.y += player.velocityY;
    }

    function checarColisaoChao() {
        if (player.velocityY >= 0) {
            // Reduzindo a largura da hitbox de colisão dos pés
            const hitboxWidth = player.width * 0.6; // 60% da largura do player
            const hitboxOffset = (player.width - hitboxWidth) / 2;
            
            const rayOrigins = [
                { x: player.x + hitboxOffset, y: player.y + player.height },
                { x: player.x + player.width/2, y: player.y + player.height },
                { x: player.x + player.width - hitboxOffset, y: player.y + player.height }
            ];

            for (const origin of rayOrigins) {
                const ray = raycast(origin.x, origin.y, 0, 1, 5, plataformas); // Reduzindo a distância do raycast de 14 para 5
                if (ray) {
                    // Ignora plataformas que estão caindo
                    if (ray.plataforma.falling) continue;
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
            { x: player.x, y: player.y + player.height * 0.2 },
            { x: player.x, y: player.y + player.height * 0.5 },
            { x: player.x, y: player.y + player.height * 0.8 }
        ];

        const sideOriginsRight = [
            { x: player.x + player.width, y: player.y + player.height * 0.2 },
            { x: player.x + player.width, y: player.y + player.height * 0.5 },
            { x: player.x + player.width, y: player.y + player.height * 0.8 }
        ];

        let lateralCollision = false;

        for (const origin of sideOriginsLeft) {
            const ray = raycast(origin.x, origin.y, -1, 0, 5, plataformas);
            if (ray && !ray.plataforma.falling && player.velocityX < 0) {
                lateralCollision = true;
                player.velocityX = 0;
                player.x = getPlatformHitbox(ray.plataforma).x + getPlatformHitbox(ray.plataforma).w;
                break;
            }
        }

        for (const origin of sideOriginsRight) {
            const ray = raycast(origin.x, origin.y, 1, 0, 5, plataformas);
            if (ray && !ray.plataforma.falling && player.velocityX > 0) {
                lateralCollision = true;
                player.velocityX = 0;
                player.x = getPlatformHitbox(ray.plataforma).x - player.width;
                break;
            }
        }

        // Se houve colisão lateral e o jogador está subindo, mantenha a velocidade vertical
        if (lateralCollision && player.velocityY < 0) {
            player.velocityY = player.velocityY;
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
    
    if (player.jumpCount < player.maxJumps) {
        
        player.velocityY = player.jumpPower;
        player.isJumping = true;
        player.jumpCount++;

        
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
            if (plataforma.falling) continue; 
            if (plataforma.broken) continue;
            // Ignora plataformas caindo em qualquer colisão
            const { x: px, y: py, w: pw, h: ph } = getPlatformHitbox(plataforma);
            if (checkX >= px && checkX <= px + pw &&
                checkY >= py && checkY <= py + ph) {
                return { plataforma, x: checkX, y: checkY };
            }
        }
    }
    return null;
}
