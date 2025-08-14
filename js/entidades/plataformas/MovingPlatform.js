



function handleMovingPlatform(platform, canvas = document.getElementById('gameCanvas')) {
    if (!platform.initialized) {
        initializeMovingPlatform(platform);
    }

   

    platform.x += platform.moveSpeed * 0.5; 

    
    const margin = 5;
    const leftLimit = typeof gamePlayArea !== 'undefined' ? gamePlayArea.x + margin : margin;
    const rightLimit = typeof gamePlayArea !== 'undefined' ? gamePlayArea.x + gamePlayArea.width - platform.width - margin : canvas.width - platform.width - margin;
    if (platform.x <= leftLimit || platform.x >= rightLimit) {
        platform.moveSpeed *= -1;  
        platform.x = Math.max(leftLimit, Math.min(rightLimit, platform.x));
    }

    
    createMovingPlatformEffects(platform);
}

function initializeMovingPlatform(platform) {
    platform.initialized = true;
    platform.moveSpeed = platform.moveSpeed || (Math.random() > 0.5 ? 2 : -2);
    platform.baseX = platform.x;  
    platform.maxOffset = 100;     
    platform.effectTimer = 0;
    
    platform.hitbox = {
        width: platform.width * 1,
        height: platform.height * 0.25,
        offsetX: platform.width * -0.01,
        offsetY: platform.height * 0.78
    };
}

function createMovingPlatformEffects(platform) {
    
    if (Math.random() < 0.1) {
        const particleX = platform.moveSpeed > 0 ? 
            platform.x : 
            platform.x + platform.width;
          
        createParticles(
            particleX,
            platform.y + platform.hitbox.offsetY + platform.hitbox.height/2,
            2,
            '#33cc33'
        );
    }
}

function drawMovingPlatform(ctx, platform, img, time) {
    
    if (!img || !img.complete) return;
    
    ctx.save();
    
    
    const verticalOffset = Math.sin(time * 3) * 2;
    ctx.translate(0, verticalOffset);
    
    try {
        
        ctx.drawImage(img, platform.x, platform.y, platform.width, platform.height);
    } catch (error) {
        
        
        ctx.fillStyle = '#33cc33';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }
    
    ctx.restore();
}


