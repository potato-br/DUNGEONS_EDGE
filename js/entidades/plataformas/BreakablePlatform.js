// ==========================
// ===== PLATAFORMAS QUEBRÁVEIS =====
// ==========================

function handleBreakablePlatform(platform) {
    // Skip handling for initial platform
    if (platform.isInitial) {
        
        return;
    }

    // Inicialização básica se necessário
    if (!platform.initialized) {
        initializeBreakablePlatform(platform);
    }

    // Reset flag de atualização por frame
    platform._updatedThisFrame = false;
    // Se está caindo, continua caindo
    if (platform.falling) {
        updateFallingPlatform(platform);
        return;
    }

    // Se está quebrando, atualiza o timer
    if (platform.breaking) {
        updateBreakingPlatform(platform);
        return;
    }

    // Verifica suporte apenas se não estiver já quebrando ou caindo
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
    // Proteção: só atualiza uma vez por frame
    if (platform._updatedThisFrame) return;
    platform._updatedThisFrame = true;
    // Velocidade fixa de queda
    platform.currentFallSpeed = platform.isGrande ? 2 : 3;
    platform.y += platform.currentFallSpeed;
    
    // Efeito de partículas durante a queda
    if (Math.random() < 0.2) {
        createParticles(
            platform.x + Math.random() * platform.width,
            platform.y,
            2,
            platform.color || '#8B4513'
        );
    }

    
}

function updateBreakingPlatform(platform) {
    platform.breakTime = (platform.breakTime || 0) + 1;
    // Dobrar o tempo de quebra
    const maxBreakTime = platform.isGrande ? 150 : 140;
    
    
    
    // Efeitos visuais durante a quebra
    const progress = platform.breakTime / maxBreakTime;
    if (Math.random() < 0.3 * progress) {
        createParticles(
            platform.x + Math.random() * platform.width,
            platform.y,
            2,
            '#ffcc00'
        );
    }

    // Depois do tempo máximo, começa a cair
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
        // Flash effect while breaking
        const progress = platform.breakTime / (platform.isGrande ? 240 : 400);
        const flash = Math.sin(time * (10 + progress * 20)) * 0.5 + 0.5;
        ctx.globalAlpha = 0.5 + flash * 0.5;
        
        // Shaking effect
        const shake = Math.sin(time * 20) * (progress * 3);
        ctx.translate(shake, 0);
    } else if (platform.falling) {
        // Rotate slightly while falling
        const rotation = Math.sin(time * 2) * 0.1;
        ctx.translate(platform.x + platform.width/2, platform.y + platform.height/2);
        ctx.rotate(rotation);
        ctx.translate(-(platform.x + platform.width/2), -(platform.y + platform.height/2));
    }

    // Draw the platform
    try {
        // Se a imagem não estiver carregada ou estiver em estado inválido, usa fallback
        if (!img || !img.complete || img.naturalWidth === 0) {
            ctx.fillStyle = platform.color || '#ff9933';
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            return;
        }
        
        ctx.drawImage(img, platform.x, platform.y, platform.width, platform.height);
    } catch (error) {
        
        // Fallback em caso de erro
        ctx.fillStyle = platform.color || '#ff9933';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }
}
