// ==========================
// ===== PLATAFORMAS =====
// ==========================

const platformFactory = new PlatformFactory();
const PLATFORM_TYPES = platformFactory.platformTypes;

// Game variables
let gameSpeed = 1;

// Referência para o sistema de efeitos de tela
function updateGameSpeed() {
    // GameSpeed começa a aumentar só a partir de 2500 pontos, e sobe 0.5 a cada 2500 pontos
    if (depthPoints > 100) {
        const steps = Math.floor((depthPoints - 100) / 100);
        gameSpeed = 1 + steps * 0.01;
        if (gameSpeed > 5.5) gameSpeed = 5.5;
    } else {
        gameSpeed = 1;
    }
}

function movePlataformas() {
    updateGameSpeed();

    

    for (let i = plataformas.length - 1; i >= 0; i--) {
        const plat = plataformas[i];
        
        // Move platform up only if not falling
        if (!plat.falling) {
            plat.y -= 1 * gameSpeed;
        }

        // Handle platform specific behavior
        switch (plat.type) {
            case PLATFORM_TYPES.QUEBRAVEL:
                if (!plat.isInitial) {  // Skip breakable handling for initial platform
                    handleBreakablePlatform(plat);
                    // Remove breakable platforms that fall below screen
                    if (plat.falling && plat.y > screenHeight + 100) {
                        
                        plataformas.splice(i, 1);
                        continue;
                    }
                }
                break;
                
            case PLATFORM_TYPES.ESCORREGADIA:
                // Ice platforms are handled in player movement
                break;
                
            case PLATFORM_TYPES.MOVEL:
                handleMovingPlatform(plat);
                break;
                
            case PLATFORM_TYPES.FANTASMA:
                handleGhostPlatform(plat);
                break;
            
            case PLATFORM_TYPES.NORMAL:
                if (plat.isInitial) {
                    
                }
                break;
        }

        // Remove platforms that move off screen at the top
        if (plat.y + plat.height < -50) {
            
            plataformas.splice(i, 1);
            continue;
        }
    }

    // Update score if game is active
    if (gameState !== 'gameover') {
        depthPoints += 1 * gameSpeed;
    }

    // Create new platforms if needed
    while (plataformas.length < maxPlataformas) {
        createPlatform();
    }
}

function createFinalPlatform() {
    const platform = platformFactory.createPlatform(PLATFORM_TYPES.NORMAL);
    platform.width = 400;
    platform.height = 80;
    platform.y = canvas.height - 200;
    platform.x = canvas.width/2 - platform.width/2;
    platform.isFinal = true;
    platform.color = '#ffd700';
    plataformas.push(platform);
}

function handleGhostPlatform(platform) {
    if (platform.isInitial || platform.isFinal) return;
    // Agora as funções estão no arquivo GhostPlatform.js
    if (!platform.initialized) {
        initializeGhostPlatform(platform);
    }
    updateGhostVisibility(platform);
}

function createPlatform() {
    // Get current depth
    const depth = typeof depthPoints !== 'undefined' ? depthPoints : 0;

    // Get last two platforms for transitions
    const lastPlatform = plataformas[plataformas.length - 1];
    const penultima = plataformas[plataformas.length - 2];
    const canvas = document.getElementById('gameCanvas');

    // Check if we need a center platform for transition
    if (platformFactory.needsCenterTransition(lastPlatform, penultima)) {
        plataformas.splice(-2);
        const central = platformFactory.createPlatform(PLATFORM_TYPES.NORMAL);
        central.x = canvas.width/2 - central.width/2;
        plataformas.push(central);
        return central;
    }

    // Ensure at least one visible center platform
    const plataformasVisiveis = plataformas.filter(p => p.y > 0 && p.y < canvas.height);
    const centraisCount = plataformasVisiveis.filter(p => 
        platformFactory.getPlatformPosition(p) === 'center'
    ).length;

    if (centraisCount < 1) {
        const central = platformFactory.createPlatform(PLATFORM_TYPES.NORMAL);
        central.x = canvas.width/2 - central.width/2;
        plataformas.push(central);
        return central;
    }

    // Get available types for both normal and grande platforms
    const normalTypes = platformFactory.getAvailableTypes(false, depth);
    const grandeTypes = platformFactory.getAvailableTypes(true, depth);

    // Combine the types, ensuring GRANDE is included if available
    let availableTypes = [...normalTypes];
    if (grandeTypes.length > 0) {
        availableTypes.push(PLATFORM_TYPES.GRANDE);
    }

    // Prevent consecutive breakable platforms
    if (lastPlatform?.type === PLATFORM_TYPES.QUEBRAVEL) {
        const idx = availableTypes.indexOf(PLATFORM_TYPES.QUEBRAVEL);
        if (idx !== -1) availableTypes.splice(idx, 1);
    }

    // Add extra chance for GRANDE platforms
    for (let i = 0; i < 1; i++) {  // This gives a higher chance for GRANDE platforms
        if (grandeTypes.length > 0) {
            availableTypes.push(PLATFORM_TYPES.GRANDE);
        }
    }

    // Fallback: se não houver tipos disponíveis, use NORMAL
    if (availableTypes.length === 0) {
        availableTypes = [PLATFORM_TYPES.NORMAL];
    }

    // Create random platform type
    const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)] || PLATFORM_TYPES.NORMAL;
    const platform = platformFactory.createPlatform(randomType);

    // Ajusta posição X para respeitar área jogável
    if (platform.x < gamePlayArea.x) {
        platform.x = gamePlayArea.x;
    } else if (platform.x + platform.width > gamePlayArea.x + gamePlayArea.width) {
        platform.x = gamePlayArea.x + gamePlayArea.width - platform.width;
    }

    plataformas.push(platform);

    return platform;
}

function createInitialPlataforma() {
    const canvas = document.getElementById('gameCanvas');
    plataformas = [];
    
    // Cria a plataforma inicial com dimensões baseadas na imagem
    const platform = platformFactory.createPlatform(PLATFORM_TYPES.NORMAL);
    platform.width = 150; // Largura fixa desejada
    platform.height = 120; // Altura fixa desejada
    platform.y = canvas.height - 200;
    platform.x = gamePlayArea.x + (gamePlayArea.width / 2) - (platform.width / 2);
    platform.isInitial = true;
    
    // Hitbox customizada para a plataforma inicial
    platform.hitbox = {
        width: platform.width * 1, // 80% da largura
        height: platform.height * 0.2, // 30% da altura
        offsetX: platform.width * 0.010, // Centraliza horizontalmente
        offsetY: platform.height * 0.8 // Ajusta verticalmente
    };

    plataformas.push(platform);
    
    // Posiciona o jogador na plataforma considerando a hitbox
    player.x = platform.x + platform.width / 2 - player.width / 2;
    player.y = platform.y + platform.hitbox.offsetY - player.height;
}

function drawPlataformas() {
    const time = performance.now() * 0.001;
    ctx.save();

    for (let i = plataformas.length - 1; i >= 0; i--) {
        const platform = plataformas[i];
        if (platform.type === PLATFORM_TYPES.FANTASMA && !platform.visible) {
            continue;
        }

        ctx.save();
        // Efeito de sacudir se shakeTimer ativo
        if (platform.shakeTimer && platform.shakeTimer > 0) {
            const shakeX = Math.sin(time * 40) * platform.shakeMagnitude * (platform.shakeTimer / 15);
            ctx.translate(shakeX, 0);
            platform.shakeTimer--;
        }
        
        // Seleciona a textura correta baseada no tipo da plataforma        let img;        // Determine platform image based on type and size
        if (platform.type === PLATFORM_TYPES.ESCORREGADIA || platform.isSlippery) {
            img = platform.isGrande ? plataformaGeloGrandeImg : plataformaGeloImg;
        } else if (platform.type === PLATFORM_TYPES.MOVEL) {
            img = plataformaMovelImg;
        } else if (platform.type === PLATFORM_TYPES.QUEBRAVEL) {
            img = platform.isGrande ? plataformaquebravelgrandeImg : plataformaquebravelImg;
        } else if (platform.type === PLATFORM_TYPES.FANTASMA) {
            img = platform.isGrande ? plataformafanstamagrandeImg : plataformafantasmaImg;
        } else if (platform.isGrande) {
            img = plataformaGrandeImg; // Para todas outras plataformas grandes
        } else {
            img = plataformaNormalImg; // Para todas outras plataformas normais
        }

        if (platform.broken) {
            // Remove a colisão da plataforma imediatamente ao iniciar a animação de quebra
            platform.isColliding = false;
            // Opcional: marca para lógica de colisão ignorar
            platform.ignoreCollision = true;
            platform.brokenDone = true;
             platform.ignoreEnemyCollision = true;
            // Só faz shake global se for grande e no início da quebra
            if (platform.isGrande && platform.breakAnimTime === 1) {
                triggerScreenShake(7, 12);
            }

           // Inicialização dos parâmetros de animação
            if (!platform.breakAnim) {
                platform.breakAnim = {
                    time: 0,
                    leftY: 0,
                    rightY: 0,
                    leftVY: -2 - Math.random() * 1.5,   // impulso inicial para cima
                    rightVY: -2 - Math.random() * 1.5,
                    leftAngle: 0,
                    rightAngle: 0,
                    leftVA: 0.08 - Math.random() * 0.04, // rotação angular
                    rightVA: -0.08 + Math.random() * 0.04
                };
                triggerScreenShake(1, 8);
            }
            const anim = platform.breakAnim;
            anim.time++;

            // Gravidade
            anim.leftVY += 0.45;
            anim.rightVY += 0.45;
            anim.leftY += anim.leftVY;
            anim.rightY += anim.rightVY;

            // Rotação
            anim.leftAngle += anim.leftVA;
            anim.rightAngle += anim.rightVA;

            // Fade out
            const DURATION = 32;
            const fade = Math.max(0, 1 - anim.time / DURATION);

            // Escalas e pontos de quebra
            const scaleX = img.width / platform.width;
            const breakPointCanvas = platform.width / 2;
            const breakPointImg = breakPointCanvas * scaleX;
            const leftWCanvas = breakPointCanvas;
            const rightWCanvas = platform.width - breakPointCanvas;
            const leftWImg = breakPointImg;
            const rightWImg = img.width - breakPointImg;
            const pivotY = platform.y + platform.height / 2;

            // Metade esquerda
            ctx.save();
            ctx.globalAlpha = fade;
            ctx.translate(platform.x + leftWCanvas / 2, pivotY + anim.leftY);
            ctx.rotate(anim.leftAngle);
            if (img.complete) {
                ctx.drawImage(
                    img,
                    0, 0,
                    leftWImg, img.height,
                    -leftWCanvas / 2, -platform.height / 2,
                    leftWCanvas, platform.height
                );
            }
            ctx.restore();

            // Metade direita
            ctx.save();
            ctx.globalAlpha = fade;
            ctx.translate(platform.x + breakPointCanvas + rightWCanvas / 2, pivotY + anim.rightY);
            ctx.rotate(anim.rightAngle);
            if (img.complete) {
                ctx.drawImage(
                    img,
                    breakPointImg, 0,
                    rightWImg, img.height,
                    -rightWCanvas / 2, -platform.height / 2,
                    rightWCanvas, platform.height
                );
            }
            ctx.restore();

            // Remove plataforma após animação
            if (anim.time > DURATION) {
                const idx = plataformas.indexOf(platform);
                if (idx !== -1) plataformas.splice(idx, 1);
            }

            ctx.restore();
            return;
        }

        if (platform.type === PLATFORM_TYPES.QUEBRAVEL) {
            drawBreakablePlatform(ctx, platform, time, img);
        } else if (platform.type === PLATFORM_TYPES.ESCORREGADIA) {
            drawIcePlatform(ctx, platform, img);
        } else if (platform.type === PLATFORM_TYPES.MOVEL) {
            drawMovingPlatform(ctx, platform, img, time);
        } else if (platform.type === PLATFORM_TYPES.FANTASMA) {
            drawGhostPlatform(ctx, platform, img);
        } else if (platform.isInitial) {
            // Desenha a plataforma inicial mantendo proporções
            ctx.drawImage(plataformaInicialImg, platform.x, platform.y, platform.width, platform.height);
            
            // Debug: desenha hitbox se debug estiver ativo
            if (window.spriteDebug) {
                ctx.strokeStyle = 'lime';
                ctx.strokeRect(
                    platform.x + platform.hitbox.offsetX,
                    platform.y + platform.hitbox.offsetY,
                    platform.hitbox.width,
                    platform.hitbox.height
                );
            }
            continue;
        } else {
            ctx.drawImage(img, platform.x, platform.y, platform.width, platform.height);
        }

        if (platform.y < window.innerHeight / 3) {
            const blink = Math.floor(time * 5) % 2 === 0;
            if (blink) {
                ctx.globalAlpha = 0.2;
                ctx.fillStyle = 'rgba(99, 11, 5, 0.72)';
                ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            }
        }

        ctx.restore();
    }

    ctx.restore(); // Restaura o canvas após desenhar tudo
}

