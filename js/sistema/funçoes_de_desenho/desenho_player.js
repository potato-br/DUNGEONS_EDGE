function drawPlayer() {
    if (gameState === 'gameover') return;
    if (isGameOver) return;
    if (!playerSpriteLoaded) return;
    const sx = frameIndex * playerFrameWidth;
    const sy = playerFrameRow * playerFrameHeight;
    const scale = 3.5;
    const dw = playerFrameWidth * scale;
    const dh = playerFrameHeight * scale;
    let offsetX = (typeof playerFrameOffsetX !== 'undefined' ? playerFrameOffsetX : 0) * scale;
    const offsetY = (typeof playerFrameOffsetY !== 'undefined' ? playerFrameOffsetY : 0) * scale;
    if (!player.facingRight && offsetX !== 0) {
        offsetX = -offsetX;
    }
    const dx = player.x + player.width/2 - dw/2 + offsetX;
    const dy = player.y + player.height/2 - dh/2 + offsetY;
    ctx.save();
    
    if (isRespawning) {
        if (!player.visible) return;
        ctx.restore();
        
        ctx.drawImage(
            playerSprite,
            sx, sy, playerFrameWidth, playerFrameHeight,
            dx, dy, dw, dh
        );
        ctx.restore();
        return;
    }
    if ((typeof DASH !== 'undefined' && DASH.isInvulnerable) && !(typeof DASH !== 'undefined' && DASH.isDashing) || (activeCharacter === 'Roderick, o Cavaleiro' && typeof CAVALEIRO !== 'undefined' && CAVALEIRO.shieldActive)) {
        ctx.save();
        const now = performance.now();
        const baseIntensity = (Math.sin(now * 0.002) * 0.4 + 1.2);
        const fastPulse = (Math.sin(now * 0.006) * 0.4 + 1.1);

        const centerX = dx + dw/2;
        const centerY = dy + dh/2;
        const radius = Math.max(dw, dh) / 1.1;
        
        const pixelSize = 6;
        const pixelRows = Math.ceil(radius * 2 / pixelSize);
        const pixelCols = Math.ceil(radius * 2 / pixelSize);

        let config;
        switch(activeCharacter) {
            case 'Roderick, o Cavaleiro':
                config = {
                    colors: {
                        primary: 'rgba(30, 144, 255, 0.6)',
                        secondary: 'rgba(240, 248, 255, 1)',
                        glow: 'rgba(135, 206, 250, 0.95)',
                        particles: 'rgba(173, 216, 230, 1)',
                        rays: 'rgba(220, 220, 255, 1)'
                    },
                    particleCount: 24,
                    rayCount: 12,
                    waveCount: 12,
                    particleSize: 6,
                    rayWidth: 5,
                    drawSpecial: (ctx) => {
                        
                        const shieldLayers = 4;
                        for(let layer = 0; layer < shieldLayers; layer++) {
                            const layerRadius = radius * (0.9 - layer * 0.05);
                            const segments = 36 + layer * 8;
                            
                            
                            const damageIntensity = (typeof DASH !== 'undefined' && DASH.isInvulnerable) ? 1.5 : 1.0;
                            
                            for(let i = 0; i < segments; i++) {
                                const angle = (i / segments) * Math.PI * 2;
                                const segmentAngle = angle - now * (0.001 + layer * 0.0005);
                                const pulseOffset = Math.sin(now * 0.003 + layer * Math.PI / 3) * radius * 0.04;
                                
                                
                                const x = centerX + Math.cos(segmentAngle) * (layerRadius + pulseOffset);
                                const y = centerY + Math.sin(segmentAngle) * (layerRadius + pulseOffset);
                                
                                
                                const baseColor = layer === 0 ? '240, 248, 255' : 
                                                layer === 1 ? '135, 206, 250' : 
                                                layer === 2 ? '70, 130, 180' : 
                                                '25, 25, 112'; 
                                
                                const opacity = (0.9 - layer * 0.15 + Math.sin(now * 0.002 + i) * 0.2) * damageIntensity;
                                ctx.fillStyle = `rgba(${baseColor}, ${opacity})`;
                                
                                
                                const segmentSize = pixelSize * (1.8 - layer * 0.2);
                                ctx.fillRect(
                                    Math.floor(x / pixelSize) * pixelSize - segmentSize/2,
                                    Math.floor(y / pixelSize) * pixelSize - segmentSize/2,
                                    segmentSize, segmentSize
                                );
                                
                                
                                if (i % 2 === 0 && layer < 3) {
                                    const nextAngle = ((i + 1) / segments) * Math.PI * 2;
                                    const nextX = centerX + Math.cos(nextAngle) * (layerRadius + pulseOffset);
                                    const nextY = centerY + Math.sin(nextAngle) * (layerRadius + pulseOffset);
                                    
                                    const midX = (x + nextX) / 2;
                                    const midY = (y + nextY) / 2;
                                    
                                    
                                    const connectorOpacity = opacity * (0.7 + Math.sin(now * 0.004 + i) * 0.3) * damageIntensity;
                                    ctx.fillStyle = `rgba(${baseColor}, ${connectorOpacity})`;
                                    ctx.fillRect(
                                        Math.floor(midX / pixelSize) * pixelSize - segmentSize/3,
                                        Math.floor(midY / pixelSize) * pixelSize - segmentSize/3,
                                        segmentSize/1.5, segmentSize/1.5
                                    );
                                }
                            }
                        }

                        
                        if (activeCharacter === 'Roderick, o Cavaleiro' && typeof CAVALEIRO !== 'undefined' && CAVALEIRO.shieldActive) {
                            
                            const lunarSymbols = [
                                [ 
                                    [0,1,1,1,1,1,1,0],
                                    [1,1,1,1,1,1,1,1],
                                    [1,1,0,1,1,0,1,1],
                                    [1,1,1,1,1,1,1,1],
                                    [1,1,1,1,1,1,1,1],
                                    [1,1,0,1,1,0,1,1],
                                    [1,1,1,1,1,1,1,1],
                                    [0,1,1,1,1,1,1,0]
                                ],
                                [ 
                                    [0,0,1,1,1,1,0,0],
                                    [0,1,1,0,0,1,1,0],
                                    [1,1,0,0,1,0,1,1],
                                    [1,1,0,0,0,0,1,1],
                                    [1,1,0,0,0,0,1,1],
                                    [1,1,0,0,1,0,1,1],
                                    [0,1,1,0,0,1,1,0],
                                    [0,0,1,1,1,1,0,0]
                                ],
                                [ 
                                    [0,0,1,1,1,1,0,0],
                                    [0,1,1,0,0,1,1,0],
                                    [1,1,0,1,1,0,1,1],
                                    [1,0,1,1,1,1,0,1],
                                    [1,0,1,1,1,1,0,1],
                                    [1,1,0,1,1,0,1,1],
                                    [0,1,1,0,0,1,1,0],
                                    [0,0,1,1,1,1,0,0]
                                ],
                                [ 
                                    [0,0,1,1,1,1,0,0],
                                    [0,1,1,0,0,1,1,0],
                                    [1,1,0,1,0,0,1,1],
                                    [1,1,0,0,0,0,1,1],
                                    [1,1,0,0,0,0,1,1],
                                    [1,1,0,1,0,0,1,1],
                                    [0,1,1,0,0,1,1,0],
                                    [0,0,1,1,1,1,0,0]
                                ],
                                [ 
                                    [0,0,1,0,0,1,0,0],
                                    [0,1,1,1,1,1,1,0],
                                    [1,1,0,1,1,0,1,1],
                                    [0,1,1,1,1,1,1,0],
                                    [0,1,1,1,1,1,1,0],
                                    [1,1,0,1,1,0,1,1],
                                    [0,1,1,1,1,1,1,0],
                                    [0,0,1,0,0,1,0,0]
                                ]
                            ];

                            
                            const symbolSize = 8;
                            const symbolScale = pixelSize * 0.8;
                            const symbolCount = lunarSymbols.length;

                            const orbits = [
                                radius * 0.45, 
                                radius * 0.5,  
                                radius * 0.55, 
                                radius * 0.6,  
                                radius * 0.65  
                            ];

                            
                            for(let i = 0; i < symbolCount; i++) {
                                const baseAngle = (i / symbolCount) * Math.PI * 2;
                                
                                const rotationSpeed = 0.0005 * (1 + (i % 3) * 0.1);
                                const angle = baseAngle + now * rotationSpeed;
                                
                                const symbol = lunarSymbols[i];
                                const orbitRadius = orbits[i];
                                
                                const orbitX = centerX + Math.cos(angle) * orbitRadius;
                                const orbitY = centerY + Math.sin(angle) * orbitRadius;
                                
                                
                                if (i > 0) {
                                    const prevX = centerX + Math.cos(baseAngle - (2 * Math.PI / symbolCount) + now * rotationSpeed) * orbits[i-1];
                                    const prevY = centerY + Math.sin(baseAngle - (2 * Math.PI / symbolCount) + now * rotationSpeed) * orbits[i-1];
                                    
                                    ctx.beginPath();
                                    ctx.moveTo(orbitX, orbitY);
                                    
                                    
                                    const controlX = (orbitX + prevX) / 2 - Math.sin(angle) * 20;
                                    const controlY = (orbitY + prevY) / 2 + Math.cos(angle) * 20;
                                    
                                    ctx.quadraticCurveTo(controlX, controlY, prevX, prevY);
                                    
                                    const gradient = ctx.createLinearGradient(orbitX, orbitY, prevX, prevY);
                                    gradient.addColorStop(0, `rgba(135, 206, 250, ${0.3 + Math.sin(now * 0.002 + i) * 0.2})`);
                                    gradient.addColorStop(1, `rgba(240, 248, 255, ${0.2 + Math.sin(now * 0.002 + i) * 0.1})`);
                                    ctx.strokeStyle = gradient;
                                    ctx.lineWidth = 2 * Math.sin(now * 0.002 + i) + 2;
                                    ctx.stroke();
                                }

                                
                                ctx.save();
                                ctx.globalAlpha = 0.8 + Math.sin(now * 0.003 + i * Math.PI/3) * 0.2;
                                
                                for(let y = 0; y < symbol.length; y++) {
                                    for(let x = 0; x < symbol[y].length; x++) {
                                        if(symbol[y][x]) {
                                            const px = orbitX + (x - symbolSize/2) * symbolScale;
                                            const py = orbitY + (y - symbolSize/2) * symbolScale;
                                            
                                            
                                            const hue = (240 + Math.sin(now * 0.001 + i * Math.PI/2) * 20);
                                            const brightness = 75 + Math.sin(now * 0.002 + i) * 10;
                                            ctx.fillStyle = `hsla(${hue}, 80%, ${brightness}%, ${0.7 + Math.sin(now * 0.004 + x * y) * 0.3})`;
                                            
                                            ctx.fillRect(
                                                Math.floor(px),
                                                Math.floor(py),
                                                Math.ceil(symbolScale),
                                                Math.ceil(symbolScale)
                                            );
                                        }
                                    }
                                }
                                ctx.restore();
                            }
                        }
                    }
                };
                break;

            case 'Kuroshi, o Ninja':
                config = {
                    colors: {
                        primary: 'rgba(75, 0, 130, 0.85)',
                        secondary: 'rgba(255, 255, 0, 0.95)',
                        glow: 'rgba(138, 43, 226, 0.9)',
                        particles: 'rgba(255, 255, 224, 0.95)',
                        rays: 'rgba(148, 0, 211, 0.8)'
                    },
                    drawSpecial: (ctx) => {
                        
                        if (typeof NINJA !== 'undefined' && NINJA.smokeBombActive) {
                            
                            const smokeRadius = Math.max(dw, dh) * (0.7 + Math.sin(performance.now()*0.002)*0.05);
                            const smokeLayers = 5;
                            const pixelSize = 10;
                            for (let l = 0; l < smokeLayers; l++) {
                                const alpha = 0.18 + 0.08 * Math.sin(performance.now()*0.003 + l);
                                const layerRadius = smokeRadius * (1 - l*0.13);
                                for (let a = 0; a < 32 + l*8; a++) {
                                    const angle = (a / (32 + l*8)) * Math.PI * 2;
                                    const x = centerX + Math.cos(angle) * layerRadius;
                                    const y = centerY + Math.sin(angle) * layerRadius;
                                    ctx.save();
                                    ctx.globalAlpha = alpha;
                                    ctx.fillStyle = `rgba(120,120,120,0.7)`;
                                    ctx.shadowColor = 'rgba(180,180,180,0.3)';
                                    ctx.shadowBlur = 6 - l*1.5;
                                    ctx.fillRect(
                                        Math.floor(x / pixelSize) * pixelSize - pixelSize/2,
                                        Math.floor(y / pixelSize) * pixelSize - pixelSize/2,
                                        pixelSize, pixelSize
                                    );
                                    ctx.restore();
                                }
                            }
                            
                            const smokeParticles = 18;
                            for (let i = 0; i < smokeParticles; i++) {
                                const angle = (i / smokeParticles) * Math.PI * 2 + performance.now()*0.0007;
                                const dist = smokeRadius * (0.7 + Math.sin(performance.now()*0.001 + i)*0.08);
                                const px = centerX + Math.cos(angle) * dist + Math.sin(performance.now()*0.002 + i)*6;
                                const py = centerY + Math.sin(angle) * dist + Math.cos(performance.now()*0.002 + i)*6;
                                ctx.save();
                                ctx.globalAlpha = 0.22 + Math.sin(performance.now()*0.003 + i)*0.08;
                                ctx.fillStyle = 'rgba(180,180,180,0.7)';
                                ctx.fillRect(
                                    Math.floor(px / 8) * 8 - 4,
                                    Math.floor(py / 8) * 8 - 4,
                                    8, 8
                                );
                                ctx.restore();
                            }
                        
                        } else if (typeof NINJA !== 'undefined' && NINJA.invulneravelPorDano) {
                            
                            const shadowRadius = Math.max(dw, dh) * 0.62;
                            const pulse = 0.09 + Math.sin(performance.now()*0.002) * 0.09;
                            const pixelSizeShadow = 6;
                            const shadowLayers = [
                                { mult: 1.0, color: '138,43,226', alpha: 0.38 },
                                { mult: 0.88, color: '75,0,130', alpha: 0.28 },
                                { mult: 0.76, color: '40,0,80', alpha: 0.18 },
                                { mult: 1.13, color: '200,120,255', alpha: 0.13 }
                            ];
                            for (let l = 0; l < shadowLayers.length; l++) {
                                const layer = shadowLayers[l];
                                const layerRadius = shadowRadius * (layer.mult + pulse * (l === 0 ? 1 : 0.5));
                                const alpha = layer.alpha + Math.sin(performance.now()*0.001 + l) * 0.03;
                                for (let a = 0; a < 40 + l*8; a++) {
                                    const angle = (a / (40 + l*8)) * Math.PI * 2;
                                    const x = centerX + Math.cos(angle) * layerRadius;
                                    const y = centerY + Math.sin(angle) * layerRadius;
                                    ctx.fillStyle = `rgba(${layer.color},${alpha})`;
                                    ctx.fillRect(
                                        Math.floor(x / pixelSizeShadow) * pixelSizeShadow - pixelSizeShadow/2,
                                        Math.floor(y / pixelSizeShadow) * pixelSizeShadow - pixelSizeShadow/2,
                                        pixelSizeShadow, pixelSizeShadow
                                    );
                                }
                            }
                            
                            const energyCircleRadius = Math.max(dw, dh) * 0.41 + Math.sin(performance.now()*0.002) * 1.5;
                            const pixelSizeCircle = 5;
                            for (let a = 0; a < 36; a++) {
                                const angle = (a / 36) * Math.PI * 2 + performance.now()*0.0015;
                                const x = centerX + Math.cos(angle) * energyCircleRadius;
                                const y = centerY + Math.sin(angle) * energyCircleRadius;
                                ctx.fillStyle = 'rgba(255,255,200,0.18)';
                                ctx.fillRect(
                                    Math.floor(x / pixelSizeCircle) * pixelSizeCircle - pixelSizeCircle/2,
                                    Math.floor(y / pixelSizeCircle) * pixelSizeCircle - pixelSizeCircle/2,
                                    pixelSizeCircle, pixelSizeCircle
                                );
                            }
                        } else {
                            
                            const shadowRadius = Math.max(dw, dh) * 0.62;
                            const pulse = 0.09 + Math.sin(performance.now()*0.002) * 0.09;
                            const pixelSizeShadow = 6;
                            const shadowLayers = [
                                { mult: 1.0, color: '138,43,226', alpha: 0.38 }, 
                                { mult: 0.88, color: '75,0,130', alpha: 0.28 },  
                                { mult: 0.76, color: '40,0,80', alpha: 0.18 },   
                                { mult: 1.13, color: '200,120,255', alpha: 0.13 } 
                            ];
                            for (let l = 0; l < shadowLayers.length; l++) {
                                const layer = shadowLayers[l];
                                const layerRadius = shadowRadius * (layer.mult + pulse * (l === 0 ? 1 : 0.5));
                                const alpha = layer.alpha + Math.sin(performance.now()*0.001 + l) * 0.03;
                                for (let a = 0; a < 40 + l*8; a++) {
                                    const angle = (a / (40 + l*8)) * Math.PI * 2;
                                    const x = centerX + Math.cos(angle) * layerRadius;
                                    const y = centerY + Math.sin(angle) * layerRadius;
                                    ctx.fillStyle = `rgba(${layer.color},${alpha})`;
                                    ctx.fillRect(
                                        Math.floor(x / pixelSizeShadow) * pixelSizeShadow - pixelSizeShadow/2,
                                        Math.floor(y / pixelSizeShadow) * pixelSizeShadow - pixelSizeShadow/2,
                                        pixelSizeShadow, pixelSizeShadow
                                    );
                                }
                            }
                            
                            const energyCircleRadius = Math.max(dw, dh) * 0.41 + Math.sin(performance.now()*0.002) * 1.5;
                            const pixelSizeCircle = 5;
                            for (let a = 0; a < 36; a++) {
                                const angle = (a / 36) * Math.PI * 2 + performance.now()*0.0015;
                                const x = centerX + Math.cos(angle) * energyCircleRadius;
                                const y = centerY + Math.sin(angle) * energyCircleRadius;
                                ctx.fillStyle = 'rgba(255,255,200,0.28)';
                                ctx.fillRect(
                                    Math.floor(x / pixelSizeCircle) * pixelSizeCircle - pixelSizeCircle/2,
                                    Math.floor(y / pixelSizeCircle) * pixelSizeCircle - pixelSizeCircle/2,
                                    pixelSizeCircle, pixelSizeCircle
                                );
                            }
                            
                            const arcPoints = 6;
                            for(let i=0; i<arcPoints; i++) {
                                const angle1 = (i / arcPoints) * Math.PI * 2 + performance.now()*0.0012;
                                const angle2 = ((i+1) / arcPoints) * Math.PI * 2 + Math.sin(performance.now()*0.002 + i)*0.2;
                                const x1 = centerX + Math.cos(angle1) * energyCircleRadius;
                                const y1 = centerY + Math.sin(angle1) * energyCircleRadius;
                                const x2 = centerX + Math.cos(angle2) * energyCircleRadius;
                                const y2 = centerY + Math.sin(angle2) * energyCircleRadius;
                                const steps = 8;
                                for(let s=0; s<=steps; s++) {
                                    const t = s/steps;
                                    const cx = (x1 + x2)/2 + Math.sin(performance.now()*0.003 + i)*7;
                                    const cy = (y1 + y2)/2 + Math.cos(performance.now()*0.003 + i)*7;
                                    const px = (1-t)*(1-t)*x1 + 2*(1-t)*t*cx + t*t*x2;
                                    const py = (1-t)*(1-t)*y1 + 2*(1-t)*t*cy + t*t*y2;
                                    ctx.fillStyle = 'rgba(255, 255, 25, 0.65)';
                                    ctx.fillRect(
                                        Math.floor(px / pixelSizeCircle) * pixelSizeCircle - pixelSizeCircle/2,
                                        Math.floor(py / pixelSizeCircle) * pixelSizeCircle - pixelSizeCircle/2,
                                        pixelSizeCircle, pixelSizeCircle
                                    );
                                }
                            }
                            
                            const lightningCount = 7;
                            const pixelSizeLightning = 5;
                            for(let i = 0; i < lightningCount; i++) {
                                const baseAngle = (i / lightningCount) * Math.PI * 2 + Math.sin(performance.now()*0.001 + i) * 0.1;
                                let x0 = centerX;
                                let y0 = centerY;
                                let prevX = x0;
                                let prevY = y0;
                                let angle = baseAngle;
                                const segments = 4 + Math.floor(Math.random()*2);
                                for(let j = 1; j <= segments; j++) {
                                    const segLen = (Math.max(dw, dh) * 0.13) + Math.random() * 5;
                                    angle += (Math.random() - 0.5) * 0.7 + Math.sin(performance.now()*0.002 + i + j) * 0.13;
                                    const x1 = prevX + Math.cos(angle) * segLen;
                                    const y1 = prevY + Math.sin(angle) * segLen;
                                    const steps = Math.ceil(Math.hypot(x1-prevX, y1-prevY)/pixelSizeLightning);
                                    for(let s=0; s<=steps; s++) {
                                        const t = s/steps;
                                        const px = prevX + (x1-prevX)*t;
                                        const py = prevY + (y1-prevY)*t;
                                        ctx.fillStyle = 'rgb(209, 209, 11)';
                                        ctx.fillRect(
                                            Math.floor(px / pixelSizeLightning) * pixelSizeLightning - pixelSizeLightning/2,
                                            Math.floor(py / pixelSizeLightning) * pixelSizeLightning - pixelSizeLightning/2,
                                            pixelSizeLightning, pixelSizeLightning
                                        );
                                    }
                                    
                                    if ((j === 2 || j === 3) && Math.random() > 0.3) {
                                        for(let b=0; b<2; b++) {
                                            const branchAngle = angle + (b ? 1 : -1) * (Math.PI/4 + Math.sin(performance.now()*0.002 + i + b) * 0.2);
                                            const branchLen = segLen * (0.7 + Math.random()*0.3);
                                            const bx = prevX + Math.cos(branchAngle) * branchLen;
                                            const by = prevY + Math.sin(branchAngle) * branchLen;
                                            const branchSteps = Math.ceil(Math.hypot(bx-prevX, by-prevY)/pixelSizeLightning);
                                            for(let s=0; s<=branchSteps; s++) {
                                                const t = s/branchSteps;
                                                const px = prevX + (bx-prevX)*t;
                                                const py = prevY + (by-prevY)*t;
                                                ctx.fillStyle = 'rgba(255,255,220,0.6)';
                                                ctx.fillRect(
                                                    Math.floor(px / pixelSizeLightning) * pixelSizeLightning - pixelSizeLightning/2,
                                                    Math.floor(py / pixelSizeLightning) * pixelSizeLightning - pixelSizeLightning/2,
                                                    pixelSizeLightning, pixelSizeLightning
                                                );
                                            }
                                        }
                                    }
                                    prevX = x1;
                                    prevY = y1;
                                }
                            }
                            
                            const sparkCount = 7;
                            const pixelSizeSpark = 5;
                            for(let i=0; i<sparkCount; i++) {
                                const t = performance.now()*0.002 + i*1.3;
                                const angle = t + Math.sin(t*1.7 + i)*0.2;
                                const dist = energyCircleRadius + 8 + Math.sin(t*2 + i)*6;
                                const px = centerX + Math.cos(angle) * dist;
                                const py = centerY + Math.sin(angle) * dist;
                                ctx.fillStyle = 'rgba(255,255,180,0.95)';
                                ctx.fillRect(
                                    Math.floor(px / pixelSizeSpark) * pixelSizeSpark - pixelSizeSpark/2,
                                    Math.floor(py / pixelSizeSpark) * pixelSizeSpark - pixelSizeSpark/2,
                                    pixelSizeSpark, pixelSizeSpark
                                );
                            }
                        }
                    }
                };
                break;

            case 'Valthor, o Mago':
                config = {
                    colors: {
                        primary: 'rgba(138, 43, 226, 0.5)',
                        secondary: 'rgba(216, 191, 216, 1)',
                        glow: 'rgba(147, 112, 219, 0.9)',
                        particles: 'rgba(230, 230, 250, 1)',
                        rays: 'rgba(216, 191, 216, 1)'
                    },
                    particleCount: 20,
                    rayCount: 8,
                    waveCount: 14,
                    particleSize: 5,
                    rayWidth: 4,
                    drawSpecial: (ctx) => {
                        
                        if (MAGO.magicBlastActive){
                        const runePatterns = [
                            [ 
                                [0,1,0,1,0],
                                [1,0,1,0,1],
                                [0,1,1,1,0],
                                [0,0,1,0,0],
                                [0,1,1,1,0]
                            ],
                            [ 
                                [1,1,1,1,1],
                                [1,0,0,0,1],
                                [1,0,1,0,1],
                                [1,0,0,0,1],
                                [1,1,1,1,1]
                            ],
                            [ 
                                [0,1,1,1,0],
                                [1,0,1,0,1],
                                [1,1,0,1,1],
                                [1,0,1,0,1],
                                [0,1,1,1,0]
                            ],
                            [ 
                                [1,0,1,0,1],
                                [0,1,1,1,0],
                                [1,1,0,1,1],
                                [0,1,1,1,0],
                                [1,0,1,0,1]
                            ]
                        
                        ];
                        
                        
                        const runeCount = 6;
                        for(let r = 0; r < runeCount; r++) {
                            const runeAngle = (r / runeCount) * Math.PI * 2 + now * 0.001;
                            const runeRadius = radius * 0.6;
                            const runeX = centerX + Math.cos(runeAngle) * runeRadius;
                            const runeY = centerY + Math.sin(runeAngle) * runeRadius;
                            
                            
                            const runePattern = runePatterns[Math.floor((now / 1000 + r) % runePatterns.length)];
                            const runeSize = pixelSize * 0.8;
                            
                            ctx.save();
                            ctx.translate(runeX, runeY);
                            ctx.rotate(runeAngle + Math.sin(now * 0.002 + r) * 0.5);
                            
                            for(let i = 0; i < 5; i++) {
                                for(let j = 0; j < 5; j++) {
                                    if(runePattern[i][j]) {
                                        const px = (j - 2) * runeSize;
                                        const py = (i - 2) * runeSize;
                                        const opacity = 0.8 + Math.sin(now * 0.003 + r + i + j) * 0.2;
                                        
                                        
                                        ctx.fillStyle = `rgba(147, 112, 219, ${opacity})`;
                                        ctx.fillRect(px, py, runeSize, runeSize);
                                        
                                        
                                        if(Math.random() > 0.8) {
                                            ctx.fillStyle = 'rgba(230, 230, 250, 0.9)';
                                            ctx.fillRect(px + runeSize/4, py + runeSize/4, 
                                                       runeSize/2, runeSize/2);
                                        }
                                    }
                                }
                            }
                            ctx.restore();
                        }
                    } 
                        
                        for(let i = 0; i < pixelRows; i++) {
                            for(let j = 0; j < pixelCols; j++) {
                                const px = centerX - radius + j * pixelSize;
                                const py = centerY - radius + i * pixelSize;
                                const dist = Math.sqrt(Math.pow(px - centerX, 2) + Math.pow(py - centerY, 2));
                                const angle = Math.atan2(py - centerY, px - centerX);
                                
                                if(dist > radius * 0.35 && dist < radius * 0.45) {
                                    const runeEnergy = Math.sin(angle * 12 + now * 0.002) * 
                                                     Math.cos(dist * 0.2 + now * 0.003);
                                    
                                    if(runeEnergy > 0.7) {
                                        const opacity = 0.9 + Math.sin(now * 0.004 + dist) * 0.1;
                                        ctx.fillStyle = `rgba(147, 112, 219, ${opacity})`;
                                        ctx.fillRect(px, py, pixelSize, pixelSize);
                                        
                                        
                                        if(Math.random() > 0.7) {
                                            const lineAngle = Math.random() * Math.PI * 2;
                                            const lineLength = pixelSize * 2;
                                            const endX = px + Math.cos(lineAngle) * lineLength;
                                            const endY = py + Math.sin(lineAngle) * lineLength;
                                            
                                            ctx.fillStyle = 'rgba(230, 230, 250, 0.6)';
                                            ctx.fillRect(px, py, 
                                                       endX - px > 0 ? lineLength : -lineLength, 
                                                       pixelSize/2);
                                        }
                                    }
                                }
                            }
                        }
                        
                        
                        const glowColor = Math.sin(now * 0.001) > 0 ? 
                            'rgba(147, 112, 219, 1)' : 
                            'rgba(216, 191, 216, 1)';
                        ctx.shadowColor = glowColor;
                        ctx.shadowBlur = 25;
                    }
                };
                break;

            default: 
                config = {
                    colors: {
                        primary: 'rgba(255, 215, 0, 0.5)',
                        secondary: 'rgba(255, 255, 224, 1)',
                        glow: 'rgba(255, 223, 0, 0.9)',
                        particles: 'rgba(255, 250, 205, 1)',
                        rays: 'rgba(255, 255, 224, 1)'
                    },
                    particleCount: 24,
                    rayCount: 14,
                    waveCount: 18,
                    particleSize: 5,
                    rayWidth: 4,
                    drawSpecial: (ctx) => {
                        
                        const spiralCount = 3;
                        const pointsPerSpiral = 20;
                        const baseHue = 46; 
                        const now2 = performance.now();
                        
                        for (let layer = 0; layer < 3; layer++) {
                            const layerRadius = radius * (0.77 + layer * 0.09 + Math.sin(now2*0.001+layer)*0.015);
                            const layerAlpha = 0.20 - layer*0.06 + Math.sin(now2*0.002+layer)*0.03;
                            const pixelSizeAura = 7 - layer*2;
                            for (let a = 0; a < 36 + layer*10; a++) {
                                const angle = (a / (36 + layer*10)) * Math.PI * 2 + Math.sin(now2*0.001 + layer)*0.2;
                                const x = centerX + Math.cos(angle) * layerRadius;
                                const y = centerY + Math.sin(angle) * layerRadius;
                                ctx.save();
                                ctx.globalAlpha = layerAlpha;
                                ctx.fillStyle = `hsla(${baseHue + layer*8}, 95%, 62%, 1)`;
                                ctx.shadowColor = `hsla(${baseHue + layer*8}, 100%, 70%, 0.7)`;
                                ctx.shadowBlur = 8 - layer*2;
                                ctx.fillRect(
                                    Math.floor(x / pixelSizeAura) * pixelSizeAura - pixelSizeAura/2,
                                    Math.floor(y / pixelSizeAura) * pixelSizeAura - pixelSizeAura/2,
                                    pixelSizeAura, pixelSizeAura
                                );
                                ctx.restore();
                            }
                        }
                        
                        for(let s = 0; s < spiralCount; s++) {
                            const spiralOffset = (s / spiralCount) * Math.PI * 2;
                            const spiralSpeed = 0.002 * (s + 1);
                            for(let i = 0; i < pointsPerSpiral; i++) {
                                const t = i / pointsPerSpiral;
                                const angle = spiralOffset + t * Math.PI * 6 + now2 * spiralSpeed;
                                const dist = radius * t * 0.8;
                                const x = centerX + Math.cos(angle) * dist;
                                const y = centerY + Math.sin(angle) * dist;
                                const size = pixelSize * (1.2 + Math.sin(t * Math.PI) * 0.5 + Math.sin(now2*0.003 + s + i)*0.1);
                                const opacity = 0.8 * (1 - t) + Math.sin(now2 * 0.004 + t) * 0.2;
                                ctx.save();
                                ctx.globalAlpha = opacity;
                                ctx.fillStyle = `hsla(${baseHue + s*10}, 98%, 60%, 1)`;
                                ctx.shadowColor = `hsla(${baseHue + s*10}, 100%, 80%, 1)`;
                                ctx.shadowBlur = 8;
                                ctx.fillRect(
                                    Math.floor(x / pixelSize) * pixelSize,
                                    Math.floor(y / pixelSize) * pixelSize,
                                    size, size
                                );
                                ctx.restore();
                                
                                if(i > 0 && Math.random() > 0.7) {
                                    const smallSize = pixelSize / 2;
                                    ctx.save();
                                    ctx.globalAlpha = 0.5;
                                    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                                    ctx.fillRect(
                                        Math.floor(x / pixelSize) * pixelSize + size/2,
                                        Math.floor(y / pixelSize) * pixelSize + size/2,
                                        smallSize, smallSize
                                    );
                                    ctx.restore();
                                }
                            }
                        }
                        
                        if(Math.random() > 0.92) {
                            const burstX = centerX + (Math.random() - 0.5) * radius * 0.8;
                            const burstY = centerY + (Math.random() - 0.5) * radius * 0.8;
                            const burstSize = pixelSize * (2.5 + Math.random()*2);
                            for(let i = 0; i < 4; i++) {
                                const angle = (i / 4) * Math.PI * 2;
                                const dx = Math.cos(angle) * burstSize;
                                const dy = Math.sin(angle) * burstSize;
                                ctx.save();
                                ctx.globalAlpha = 0.7;
                                ctx.fillStyle = 'rgba(255, 255, 224, 1)';
                                ctx.shadowColor = 'rgba(255, 255, 180, 0.9)';
                                ctx.shadowBlur = 8;
                                ctx.fillRect(
                                    burstX + dx, burstY + dy,
                                    pixelSize, pixelSize
                                );
                                ctx.restore();
                            }
                        }
                        
                        for (let i = 0; i < 8; i++) {
                            const angle = (i / 8) * Math.PI * 2 + now2*0.0011;
                            const dist = radius * 0.9 + Math.sin(now2*0.002 + i)*8;
                            const px = centerX + Math.cos(angle) * dist;
                            const py = centerY + Math.sin(angle) * dist;
                            ctx.save();
                            ctx.globalAlpha = 0.25 + Math.sin(now2*0.003 + i)*0.15;
                            ctx.fillStyle = 'rgba(255, 230, 120, 1)';
                            ctx.fillRect(
                                Math.floor(px / 6) * 6,
                                Math.floor(py / 6) * 6,
                                5, 5
                            );
                            ctx.restore();
                        }
                    }
                };
                break;
        }

        
        ctx.beginPath();
        for(let i = 0; i < pixelRows; i++) {
            for(let j = 0; j < pixelCols; j++) {
                const px = centerX - radius + j * pixelSize;
                const py = centerY - radius + i * pixelSize;
                const dist = Math.sqrt(Math.pow(px - centerX, 2) + Math.pow(py - centerY, 2));
                
                if (dist < radius) {
                    let waveEffect = 0;
                    
                    
                    switch(activeCharacter) {
                        case 'Kuroshi, o Ninja':
                            waveEffect = Math.sin(dist * 0.2 + now * 0.006) * 
                                       Math.cos(Math.atan2(py - centerY, px - centerX) * 4);
                            break;
                        case 'Roderick, o Cavaleiro':
                            waveEffect = Math.sin(dist * 0.15 + now * 0.003) * 
                                       Math.cos(Math.atan2(py - centerY, px - centerX) * 2);
                            break;
                        case 'Valthor, o Mago':
                            waveEffect = Math.sin(dist * 0.1 + now * 0.004) * 
                                       Math.sin(Math.atan2(py - centerY, px - centerX) * 6);
                            break;
                        default:
                            waveEffect = Math.sin(dist * 0.1 + now * 0.004) * 
                                       Math.sin(Math.atan2(py - centerY, px - centerX) * 3);
                    }
                    
                    const opacity = Math.max(0, 1 - (dist / radius)) * baseIntensity * Math.abs(waveEffect) * 0.7;
                    ctx.fillStyle = config.colors.glow.replace(')', `, ${opacity})`).replace('rgba', 'rgba');
                    ctx.fillRect(px, py, pixelSize, pixelSize);
                }
            }
        }

        
        config.drawSpecial(ctx);

        ctx.restore();
    }
    
    if (!player.visible) return;
    if (!player.facingRight) {
        ctx.translate(dx + dw/2, dy + dh/2);
        ctx.scale(-1, 1);
        ctx.translate(-(dx + dw/2), -(dy + dh/2));
    }
    ctx.drawImage(
        playerSprite,
        sx, sy, playerFrameWidth, playerFrameHeight,
        dx, dy, dw, dh
    );
    ctx.restore();
}
