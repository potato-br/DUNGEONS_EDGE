



const platformFactory = new PlatformFactory();
const PLATFORM_TYPES = platformFactory.platformTypes;


let gameSpeed = 1;


function updateGameSpeed() {
    
    if (depthPoints > 100) {
        const steps = Math.floor((depthPoints - 100) / 100);
        // Use a curve that starts slower and accelerates faster as depth increases.
        // Apply a sqrt curve to make initial progress slow, then grow faster as steps increase.
        const baseFactor = Math.sqrt(Math.max(0, steps)) * 0.02; // tuned multiplier
        gameSpeed = 1 + baseFactor;
        if (gameSpeed > 5.5) gameSpeed = 5.5;
    } else {
        gameSpeed = 1;
    }
}

function movePlataformas() {
    updateGameSpeed();

    


    for (let i = plataformas.length - 1; i >= 0; i--) {
        const plat = plataformas[i];

        // Se a plataforma está na parte de cima da tela (y < 0), quebra automaticamente
        if (!plat.broken && !plat.brokenDone && !plat.isInitial && plat.y < 80) {
            plat.broken = true;
            plat.breakAnimTime = 0;
            plat.breakStartY = plat.y;
            if (typeof onPlatformBroken === 'function') onPlatformBroken(plat);
        }

        if (!plat.falling) {
            plat.y -= 1 * gameSpeed;
        }

        switch (plat.type) {
            case PLATFORM_TYPES.QUEBRAVEL:
                if (!plat.isInitial) {  
                    handleBreakablePlatform(plat);
                    if (plat.falling && plat.y > screenHeight + 100) {
                        plataformas.splice(i, 1);
                        continue;
                    }
                }
                break;
            case PLATFORM_TYPES.ESCORREGADIA:
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

        if (plat.y + plat.height < -50) {
            plataformas.splice(i, 1);
            continue;
        }
    }

    
    if (gameState !== 'gameover') {
        depthPoints += 1 * gameSpeed;
    }

    
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
    
    if (!platform.initialized) {
        initializeGhostPlatform(platform);
    }
    updateGhostVisibility(platform);
}

function createPlatform() {
    
    const depth = typeof depthPoints !== 'undefined' ? depthPoints : 0;

    
    const lastPlatform = plataformas[plataformas.length - 1];
    const penultima = plataformas[plataformas.length - 2];
    const canvas = document.getElementById('gameCanvas');

    
    if (platformFactory.needsCenterTransition(lastPlatform, penultima)) {
        plataformas.splice(-2);
        const central = platformFactory.createPlatform(PLATFORM_TYPES.NORMAL);
        central.x = canvas.width/2 - central.width/2;
        plataformas.push(central);
        return central;
    }

    
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

    
    const normalTypes = platformFactory.getAvailableTypes(false, depth);
    const grandeTypes = platformFactory.getAvailableTypes(true, depth);

    
    let availableTypes = [...normalTypes];
    if (grandeTypes.length > 0) {
        availableTypes.push(PLATFORM_TYPES.GRANDE);
    }

    
    if (lastPlatform?.type === PLATFORM_TYPES.QUEBRAVEL) {
        const idx = availableTypes.indexOf(PLATFORM_TYPES.QUEBRAVEL);
        if (idx !== -1) availableTypes.splice(idx, 1);
    }

    
    for (let i = 0; i < 1; i++) {  
        if (grandeTypes.length > 0) {
            availableTypes.push(PLATFORM_TYPES.GRANDE);
        }
    }

    
    if (availableTypes.length === 0) {
        availableTypes = [PLATFORM_TYPES.NORMAL];
    }

    
    const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)] || PLATFORM_TYPES.NORMAL;
    const platform = platformFactory.createPlatform(randomType);

    
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
    
    
    const platform = platformFactory.createPlatform(PLATFORM_TYPES.NORMAL);
    platform.width = 150; 
    platform.height = 120; 
    platform.y = canvas.height - 200;
    platform.x = gamePlayArea.x + (gamePlayArea.width / 2) - (platform.width / 2);
    platform.isInitial = true;
    
    
    platform.hitbox = {
        width: platform.width * 1, 
        height: platform.height * 0.2, 
        offsetX: platform.width * 0.010, 
        offsetY: platform.height * 0.8 
    };

    plataformas.push(platform);
    
    
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
        
        if (platform.shakeTimer && platform.shakeTimer > 0) {
            const shakeX = Math.sin(time * 40) * platform.shakeMagnitude * (platform.shakeTimer / 15);
            ctx.translate(shakeX, 0);
            platform.shakeTimer--;
        }
        
        
        if (platform.type === PLATFORM_TYPES.ESCORREGADIA || platform.isSlippery) {
            img = platform.isGrande ? plataformaGeloGrandeImg : plataformaGeloImg;
        } else if (platform.type === PLATFORM_TYPES.MOVEL) {
            img = plataformaMovelImg;
        } else if (platform.type === PLATFORM_TYPES.QUEBRAVEL) {
            img = platform.isGrande ? plataformaquebravelgrandeImg : plataformaquebravelImg;
        } else if (platform.type === PLATFORM_TYPES.FANTASMA) {
            img = platform.isGrande ? plataformafanstamagrandeImg : plataformafantasmaImg;
        } else if (platform.isGrande) {
            img = plataformaGrandeImg; 
        } else {
            img = plataformaNormalImg; 
        }

        if (platform.broken) {
            
            platform.isColliding = false;
            
            platform.ignoreCollision = true;
            platform.brokenDone = true;
             platform.ignoreEnemyCollision = true;
           
            if (!platform.breakAnim) {
                platform.breakAnim = {
                    time: 0,
                    leftY: 0,
                    rightY: 0,
                    leftVY: -2 - Math.random() * 1.5,   
                    rightVY: -2 - Math.random() * 1.5,
                    leftAngle: 0,
                    rightAngle: 0,
                    leftVA: 0.08 - Math.random() * 0.04, 
                    rightVA: -0.08 + Math.random() * 0.04
                };
            }
            const anim = platform.breakAnim;
            anim.time++;

            
            anim.leftVY += 0.45;
            anim.rightVY += 0.45;
            anim.leftY += anim.leftVY;
            anim.rightY += anim.rightVY;

            
            anim.leftAngle += anim.leftVA;
            anim.rightAngle += anim.rightVA;

            
            const DURATION = 32;
            const fade = Math.max(0, 1 - anim.time / DURATION);

            
            const scaleX = img.width / platform.width;
            const breakPointCanvas = platform.width / 2;
            const breakPointImg = breakPointCanvas * scaleX;
            const leftWCanvas = breakPointCanvas;
            const rightWCanvas = platform.width - breakPointCanvas;
            const leftWImg = breakPointImg;
            const rightWImg = img.width - breakPointImg;
            const pivotY = platform.y + platform.height / 2;

            
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
            
            ctx.drawImage(plataformaInicialImg, platform.x, platform.y, platform.width, platform.height);
            
            
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


        ctx.restore();
    }

    ctx.restore(); 
}

