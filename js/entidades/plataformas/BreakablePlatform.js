



function handleBreakablePlatform(platform) {
    // Só ativa a lógica se a plataforma estiver acima de uma parte da tela (exemplo: y > 0)
    // Altere o valor do limite conforme necessário
    const Y_LIMITE = 0; // pode ser, por exemplo, 0 ou outro valor como 50
    if (platform.y < Y_LIMITE) return;

    if (platform.isInitial) {
        return;
    }

    if (!platform.initialized) {
        initializeBreakablePlatform(platform);
    }

    platform._updatedThisFrame = false;

    if (platform.falling) {
        updateFallingPlatform(platform);
        return;
    }

    if (platform.breaking) {
        updateBreakingPlatform(platform);
        return;
    }

    checkPlatformSupport(platform);
}

function initializeBreakablePlatform(platform) {
    platform.initialized = true;
    platform.breaking = false;
    platform.falling = false;
    platform.currentFallSpeed = 0;
    platform.breakTime = 0;
    platform.fallSpeed = platform.isGrande ? 2 : 3;
    
}

function updateFallingPlatform(platform) {
    if (platform._updatedThisFrame) return;
    platform._updatedThisFrame = true;

    // Inicia o contador de tempo de queda se não existir
    if (platform.fallTime === undefined) platform.fallTime = 0;
    platform.fallTime++;

    platform.currentFallSpeed = platform.isGrande ? 2 : 3;
    platform.y += platform.currentFallSpeed;

    if (Math.random() < 0.2) {
        createParticles(
            platform.x + Math.random() * platform.width,
            platform.y,
            2,
            platform.color || '#8B4513'
        );
    }

    // Após 1 segundo (60 frames), quebra a plataforma automaticamente
    if (platform.fallTime >= 40) {
        platform.broken = true;
        platform.falling = false;
        platform.fallTime = 0;
        createParticles(platform.x + platform.width/2, platform.y, 15, '#ff0000');
    }
}

function updateBreakingPlatform(platform) {
    platform.breakTime = (platform.breakTime || 0) + 1;
    
    const maxBreakTime = platform.isGrande ? 150 : 140;
    
    
    
    
    const progress = platform.breakTime / maxBreakTime;
    if (Math.random() < 0.3 * progress) {
        createParticles(
            platform.x + Math.random() * platform.width,
            platform.y,
            2,
            '#ffcc00'
        );
    }

    
    if (platform.breakTime > maxBreakTime) {
        platform.falling = true;
        platform.breaking = false;
        platform.currentFallSpeed = platform.fallSpeed;
        
        createParticles(platform.x + platform.width/2, platform.y, 10, '#ff6600');
    }
}

function checkPlatformSupport(platform) {
    if (!platform.breaking && !platform.falling && platform.isColliding) {
        
        platform.breaking = true;
        platform.breakTime = 0;
        createParticles(platform.x + platform.width/2, platform.y, 5, '#ffcc00');
    }
}

function drawBreakablePlatform(ctx, platform, time, img) {
    if (platform.breaking) {
        
        const progress = platform.breakTime / (platform.isGrande ? 240 : 400);
        const flash = Math.sin(time * (10 + progress * 20)) * 0.5 + 0.5;
        ctx.globalAlpha = 0.5 + flash * 0.5;
        
        
        const shake = Math.sin(time * 20) * (progress * 3);
        ctx.translate(shake, 0);
    } else if (platform.falling) {
        
        const rotation = Math.sin(time * 2) * 0.1;
        ctx.translate(platform.x + platform.width/2, platform.y + platform.height/2);
        ctx.rotate(rotation);
        ctx.translate(-(platform.x + platform.width/2), -(platform.y + platform.height/2));
    }

    
    try {
        
        if (!img || !img.complete || img.naturalWidth === 0) {
            ctx.fillStyle = platform.color || '#ff9933';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            return;
        }
        
        ctx.drawImage(img, platform.x, platform.y, platform.width, platform.height);
    } catch (error) {
        
        
        ctx.fillStyle = platform.color || '#ff9933';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }
}
