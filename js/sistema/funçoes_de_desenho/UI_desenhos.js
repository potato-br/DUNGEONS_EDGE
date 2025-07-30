function drawLives() {
  if (gameState === 'gameover') return;

  
  if (live < previousLive) {
    
    for (let i = live; i < previousLive; i++) {
      animatingHearts.push({
        index: i,
        startTime: performance.now(),
        duration: 1000, 
      });
    }
  }
  previousLive = live;

  
  animatingHearts = animatingHearts.filter(heart => {
    const elapsed = performance.now() - heart.startTime;
    return elapsed < heart.duration;
  });

  if (activeCharacter === 'Kuroshi, o Ninja') {
    drawNinjaAbilityCooldown();
  } else if (activeCharacter === 'Roderick, o Cavaleiro') {
    drawCavaleiroAbilitiesCooldown();
  } else if (activeCharacter === 'Valthor, o Mago') {
    drawMagoAbilityCooldown();
  }

  ctx.save();
  let x, y, heartSize;

switch (activeCharacter) {
  case 'Roderick, o Cavaleiro':
    x = 8;
    y = 40;
    heartSize = 47;
    break;
  case 'Valthor, o Mago':
    x = 30;
    y = 45;
    heartSize = 52;
    break;
    case 'Kuroshi, o Ninja':
    x = 40;
    y = 30;
    heartSize = 52;
    break;
  default:
    x = -11;
    y = 30;
    heartSize = 52;
    break;
}
  const spacing = 4;
  const heartsPerRow = 5;
  const rowCount = Math.ceil(live / heartsPerRow);
  const lastRowHearts = live % heartsPerRow || heartsPerRow;
  const maxWidth = (heartSize * Math.min(heartsPerRow, live)) + (spacing * (Math.min(heartsPerRow, live) - 1));
  const totalHeight = (rowCount * heartSize) + ((rowCount - 1) * spacing);
  const padding = 8;

  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.beginPath();
  ctx.roundRect(x - padding, y - heartSize + 8, maxWidth + (padding * 2), totalHeight + (padding * 2), 8);
  ctx.fill();

  let row = 0, col = 0;
  if (activeCharacter === 'Kuroshi, o Ninja') {
    row = 0; col = 1;
  } else if (activeCharacter === 'Roderick, o Cavaleiro') {
    row = 1; col = 1;
  } else if (activeCharacter === 'Valthor, o Mago') {
    row = 1; col = 0;
  } else if (activeCharacter === 'O Errante de Eldoria') {
    row = 0; col = 0;
  }

  if (typeof heartSpriteLoaded !== 'undefined' && heartSpriteLoaded) {
    
    for (let i = 0; i < live; i++) {
      const currentRow = Math.floor(i / heartsPerRow);
      const currentCol = i % heartsPerRow;
      const heartX = x + (currentCol * (heartSize + spacing));
      const heartY = y - heartSize + padding + 8 + (currentRow * (heartSize + spacing));
      
      
      const now = performance.now();
      const swing = Math.sin(now * 0.005 + i) * 0.18;
      ctx.save();
      ctx.translate(heartX + heartSize/2, heartY + heartSize/2);
      ctx.rotate(swing);
      ctx.translate(-heartSize/2, -heartSize/2);
      ctx.drawImage(heartSprite,
        col * 420, row * 420, 300, 350,
        0, 0,
        heartSize, heartSize
      );
      ctx.restore();
    }

    
    for (const heart of animatingHearts) {
      const currentRow = Math.floor(heart.index / heartsPerRow);
      const currentCol = heart.index % heartsPerRow;
      const heartX = x + (currentCol * (heartSize + spacing));
      const heartY = y - heartSize + padding + 8 + (currentRow * (heartSize + spacing));
      
      const elapsed = performance.now() - heart.startTime;
      const progress = elapsed / heart.duration;
      
      
      const scale = 1 + Math.sin(progress * Math.PI) * 0.5; 
      const opacity = 1 - progress; 
      
      ctx.save();
      ctx.translate(heartX + heartSize/2, heartY + heartSize/2);
      ctx.scale(scale, scale);
      ctx.translate(-heartSize/2, -heartSize/2);
      ctx.globalAlpha = opacity;
      
      
      ctx.filter = 'drop-shadow(0 0 5px red)';
      ctx.drawImage(heartSprite,
        col * 420, row * 420, 300, 350,
        0, 0,
        heartSize, heartSize
      );
      ctx.restore();
    }
  } else {
    ctx.fillStyle = '#ff3333';
    for (let i = 0; i < live; i++) {
      const currentRow = Math.floor(i / heartsPerRow);
      const currentCol = i % heartsPerRow;
      const heartX = x + (currentCol * (heartSize + spacing));
      const heartY = y - heartSize/2 + padding + 8 + (currentRow * (heartSize + spacing));
      
      const now = performance.now();
      const swing = Math.sin(now * 0.005 + i) * 0.18;
      ctx.save();
      ctx.translate(heartX + heartSize/2, heartY + heartSize/2);
      ctx.rotate(swing);
      ctx.translate(-heartSize/2, -heartSize/2);
      ctx.beginPath();
      ctx.moveTo(heartSize/2, heartSize/2 + 10);
      ctx.bezierCurveTo(heartSize/2 + 15, heartSize/2 - 10, heartSize, heartSize/2 + 15, heartSize/2, heartSize);
      ctx.bezierCurveTo(0, heartSize/2 + 15, heartSize/2 - 15, heartSize/2 - 10, heartSize/2, heartSize/2 + 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

function drawMoney() {
  if (gameState === 'gameover') return;
  ctx.save();
  const x = canvas.width - 90;
  const y = 30;
  ctx.font = '20px PixelFont';
  ctx.textAlign = 'right';
  const text = `$ ${money}`;
  const metrics = ctx.measureText(text);
  const padding = 8;
  const height = 28;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.roundRect(x - metrics.width - padding, y - height + 8, metrics.width + 2 * padding, height, 8);
  ctx.fill();
  ctx.fillStyle = 'yellow';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawDepthPoints() {
  if (gameState === 'gameover') return;
  ctx.save();
  ctx.font = '20px PixelFont';
  ctx.textAlign = 'left';
  const text = `Profundidade: ${Math.floor(depthPoints)}`;
  const x = canvas.width - 220, y = 90;
  const metrics = ctx.measureText(text);
  const padding = 8;
  const height = 28;
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.roundRect(x - padding, y - height + 8, metrics.width + 2 * padding, height, 8);
  ctx.fill();
  ctx.fillStyle = 'cyan';
  ctx.fillText(text, x, y);
  ctx.restore();
}