// ==========================
// ===== PLATAFORMAS MÓVEIS =====
// ==========================

function handleMovingPlatform(platform, canvas = document.getElementById('gameCanvas')) {
    if (!platform.initialized) {
        initializeMovingPlatform(platform);
    }

    // Se estiver quebrando, faz cair
    if (platform.broken) {
        if (!platform.falling) {
            platform.falling = true;
            platform.currentFallSpeed = 2;
        }
        platform.y += platform.currentFallSpeed;
        platform.currentFallSpeed += 0.5; // acelera a queda
        return;
    }

    // Move a plataforma horizontalmente normalmente
    platform.x += platform.moveSpeed * 0.5; 

    // Verifica colisão com as bordas da área jogável
    const margin = 5;
    const leftLimit = typeof gamePlayArea !== 'undefined' ? gamePlayArea.x + margin : margin;
    const rightLimit = typeof gamePlayArea !== 'undefined' ? gamePlayArea.x + gamePlayArea.width - platform.width - margin : canvas.width - platform.width - margin;
    if (platform.x <= leftLimit || platform.x >= rightLimit) {
        platform.moveSpeed *= -1;  // Inverte a direção
        platform.x = Math.max(leftLimit, Math.min(rightLimit, platform.x));
    }

    // Aplica efeitos visuais
    createMovingPlatformEffects(platform);
}

function initializeMovingPlatform(platform) {
    platform.initialized = true;
    platform.moveSpeed = platform.moveSpeed || (Math.random() > 0.5 ? 2 : -2);
    platform.baseX = platform.x;  // Guarda a posição inicial
    platform.maxOffset = 100;     // Define o deslocamento máximo
    platform.effectTimer = 0;
    // Hitbox diferenciada para plataforma móvel
    platform.hitbox = {
        width: platform.width * 1,
        height: platform.height * 0.25,
        offsetX: platform.width * -0.01,
        offsetY: platform.height * 0.78
    };
}

function createMovingPlatformEffects(platform) {
    // Cria partículas de movimento ocasionais
    if (Math.random() < 0.1) {
        const particleX = platform.moveSpeed > 0 ? 
            platform.x : 
            platform.x + platform.width;
          // Cria partículas na posição da hitbox
        createParticles(
            particleX,
            platform.y + platform.hitbox.offsetY + platform.hitbox.height/2,
            2,
            '#33cc33'
        );
    }
}

function drawMovingPlatform(ctx, platform, img, time) {
    // Skip if image is not loaded
    if (!img || !img.complete) return;
    
    ctx.save();
    
    // Pequena oscilação vertical para dar sensação de movimento
    const verticalOffset = Math.sin(time * 3) * 2;
    ctx.translate(0, verticalOffset);
    
    try {
        // Tenta desenhar a plataforma
        ctx.drawImage(img, platform.x, platform.y, platform.width, platform.height);
    } catch (error) {
        
        // Em caso de erro, desenha um retângulo colorido como fallback
        ctx.fillStyle = '#33cc33';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }
    
    ctx.restore();
}


