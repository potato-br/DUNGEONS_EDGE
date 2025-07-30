



function handleGhostPlatform(platform) {
    initializeGhostPlatform(platform);
    updateGhostVisibility(platform);
    updateGhostEffects(platform);
}

function initializeGhostPlatform(platform) {
    if (!platform.initialized) {
        platform.initialized = true;
        platform.fadeTimer = 0;
        platform.visible = true;
        platform.isGhost = true;
        platform.opacity = 1;
        platform.fadeState = 'visible';
        platform.particleTimer = 0;
        
        
        const specs = platform.isGrande ? 
            platformFactory.platformgrandeSpecs.fantasma :
            platformFactory.platformnormalSpecs.fantasma;
            
        platform.fadeTime = specs.fadeTime;
        platform.fadeInTime = specs.fadeInTime;
        platform.fadeOutTime = specs.fadeOutTime;
        platform.pulseSpeed = specs.pulseSpeed;
        platform.pulseIntensity = specs.pulseIntensity;
        platform.particleFrequency = specs.particleFrequency;
    }
}

function updateGhostVisibility(platform) {
    
    if (isRespawning && player.y + player.height <= platform.y + 5) {
        platform.fadeState = 'visible';
        platform.opacity = 1;
        platform.visible = true;
        platform.ignoreEnemyCollision = false;
        platform.fadeTimer = 0;
        return;
    }

    platform.fadeTimer++;

    
    switch (platform.fadeState) {
        case 'visible':
            if (platform.fadeTimer >= platform.fadeTime) {
                platform.fadeState = 'fadeOut';
                platform.fadeTimer = 0;
            }
            break;

        case 'fadeOut':
            platform.opacity = Math.max(0, 1 - (platform.fadeTimer / platform.fadeOutTime));
            if (platform.fadeTimer >= platform.fadeOutTime) {
                platform.fadeState = 'invisible';
                platform.fadeTimer = 0;
                platform.ignoreEnemyCollision = true;
                platform.visible = false;
            }
            break;

        case 'invisible':
            if (platform.fadeTimer >= platform.fadeTime / 2) {
                platform.fadeState = 'fadeIn';
                platform.fadeTimer = 0;
                platform.ignoreEnemyCollision = true; 
                platform.visible = true;
            }
            break;

        case 'fadeIn':
            platform.opacity = Math.min(1, platform.fadeTimer / platform.fadeInTime);
            if (platform.fadeTimer >= platform.fadeInTime) {
                platform.fadeState = 'visible';
                platform.ignoreEnemyCollision = false; 
                platform.fadeTimer = 0;
            }
            break;
    }
}

function updateGhostEffects(platform) {
    
    platform.particleTimer++;
    if (platform.visible && Math.random() < platform.particleFrequency && platform.particleTimer > 5) {
        const particleX = platform.x + Math.random() * platform.width;
        const particleY = platform.y + Math.random() * platform.height;
        
        createParticles(
            particleX,
            particleY,
            1, 
            platform.color || '#E6E6FA',
            {
                speedY: -0.5 - Math.random(), 
                fadeSpeed: 0.02,
                size: 2 + Math.random() * 2,
                gravity: -0.05 
            }
        );
        platform.particleTimer = 0;
    }
}

function drawGhostPlatform(ctx, platform, img) {
    if (!platform.visible) return;
    
    ctx.save();
    
    
    const pulse = Math.sin(platform.fadeTimer * platform.pulseSpeed) * platform.pulseIntensity;
    const baseOpacity = platform.opacity || 1;
    ctx.globalAlpha = Math.max(0, Math.min(1, baseOpacity + pulse));
    
    
    const waveAmplitude = 2;
    const waveFrequency = platform.fadeTimer * 0.05;
    ctx.setTransform(
        1, 
        Math.sin(waveFrequency) * 0.02, 
        0, 
        1, 
        platform.x, 
        platform.y + Math.sin(waveFrequency) * waveAmplitude 
    );
    
    
    if (platform.opacity > 0.5) {
        ctx.shadowColor = platform.color || '#E6E6FA';
        ctx.shadowBlur = 10;
    }
    
    ctx.drawImage(img, 0, 0, platform.width, platform.height);
    
    ctx.restore();
}
