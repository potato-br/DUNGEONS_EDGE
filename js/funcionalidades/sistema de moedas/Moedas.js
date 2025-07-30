

let moedas = [];
let isPageVisible = true;


document.addEventListener('visibilitychange', () => {
  isPageVisible = !document.hidden;
});

function spawnMoeda() {
  
  if (gameState !== 'jogando' || isPaused || document.getElementById('blackScreenTransition')) return;

  
  let plataformaAlvo = null;
  
  for (const plat of plataformas) {
    if (
      player.x + player.width > plat.x &&
      player.x < plat.x + plat.width &&
      Math.abs(player.y + player.height - plat.y) < 10 &&
      !plat.falling && !plat.hole && plat.y > 0 && plat.y < screenHeight - 60
    ) {
      plataformaAlvo = plat;
      break;
    }
  }

  let plat;
  if (plataformaAlvo && Math.random() < 0.85) { 
    plat = plataformaAlvo;
  } else {
    
    const outras = plataformas.filter(p => p !== plataformaAlvo && p.y > 0 && p.y < screenHeight - 60 && !p.falling && !p.hole);
    if (outras.length > 0) {
      plat = outras[Math.floor(Math.random() * outras.length)];
    } else if (plataformaAlvo) {
      plat = plataformaAlvo;
    } else {
      return;
    }
  }

  
  let spawnX, spawnY;
  if (plat.hitbox) {
    
    spawnX = plat.x + plat.hitbox.offsetX + 10 + Math.random() * (plat.hitbox.width - 30);
    spawnY = plat.y + plat.hitbox.offsetY - 24; 
  } else {
    
    spawnX = plat.x + 10 + Math.random() * (plat.width - 30);
    spawnY = plat.y - 24;
  }

  moedas.push({ 
    x: spawnX, 
    y: spawnY, 
    width: 35, 
    height: 35, 
    collected: false, 
    spawnTime: Date.now(),
    activeTime: 0, 
    platformId: plat.id 
  });
}

function updateMoedas() {
  if(gameState !== 'jogando' ) return; 
  
  const delta = 16; 
  moedas.forEach(m => {
    if (!isPaused) {
      m.activeTime += delta;
    }
  });

  moedas = moedas.filter(m => 
    m.y < screenHeight &&
    !m.collected &&
    m.activeTime < 3500
  );

  
  moedas.forEach(m => {
    
    const prevX = m.x;
    
    
    const plat = plataformas.find(p => {
      if (p.hitbox) {
        
        const hitboxLeft = p.x + p.hitbox.offsetX;
        const hitboxRight = hitboxLeft + p.hitbox.width;
        return m.x + m.width/2 > hitboxLeft && 
               m.x + m.width/2 < hitboxRight && 
               Math.abs(m.y + m.height - (p.y + p.hitbox.offsetY)) < 30;
      } else {
        
        return m.x + m.width/2 > p.x && 
               m.x + m.width/2 < p.x + p.width && 
               Math.abs(m.y + m.height - p.y) < 30;
      }
    });
    
    if (plat) {
      
      if (plat.type === PLATFORM_TYPES.MOVEL) {
        
        if (!m.platformOffset) {
          
          const platLeft = plat.x + (plat.hitbox ? plat.hitbox.offsetX : 0);
          const platWidth = plat.hitbox ? plat.hitbox.width : plat.width;
          m.platformOffset = (m.x - platLeft) / platWidth;
        }
        
        
        const platLeft = plat.x + (plat.hitbox ? plat.hitbox.offsetX : 0);
        const platWidth = plat.hitbox ? plat.hitbox.width : plat.width;
        m.x = platLeft + (m.platformOffset * platWidth);
      }
      
      
      if (plat.hitbox) {
        m.y = plat.y + plat.hitbox.offsetY - m.height;
      } else {
        m.y = plat.y - m.height;
      }
    } else {
      m.y += 1 * gameSpeed; 
      m.platformOffset = undefined; 
    }
  });
}


const FLOATING_COIN_DURATION = 1000; 

const FLOATING_COIN_HEIGHT = 100; 
let floatingCoins = []; 

function checkMoedaCollision() {
  if(gameState !== 'jogando' || isPaused) return;
  moedas.forEach(m => {
    if (!m.collected && rectIntersect(player, m)) {
      m.collected = true;
      
      let valorMoeda = moneyplus;
      money += valorMoeda;

      
      floatingCoins.push({
        x: player.x + player.width/2, 
        y: player.y - 25,             
        value: valorMoeda,
        startTime: performance.now(),
        alpha: 1,
        frameIndex: 0,
        lastFrameUpdate: performance.now()
      });

      
      createParticles(m.x + m.width/2, m.y + m.height/2, 8, 'yellow');
    }
  });
}


function drawMoedas() {
  if(gameState !== 'jogando' ) return;
  const FRAME_WIDTH = 220;
  const FRAME_HEIGHT = 220;
  const FRAMES_POR_LINHA = 4;
  const OFFSET_Y_LINHA2 = 12; 
  moedas.forEach(m => {
    if (!m.collected) {
      let tempoNaTela = m.activeTime;
      let blink = true;
      if (tempoNaTela > 2300 && !isPaused) {
        blink = Math.floor((tempoNaTela - 2300) / 300) % 2 === 0;
      }
      if (tempoNaTela <= 3500 && (tempoNaTela <= 2300 || blink)) {
        let totalFrames = 8;
        let frame = Math.floor((tempoNaTela / 80) % totalFrames);
        let linha = frame < 4 ? 0 : 1;
        let coluna = frame % 4;
        let sy = linha * FRAME_HEIGHT;
if (linha === 1) sy += 90;
        let sh = FRAME_HEIGHT;
        let dy = m.y;
        
        if (linha === 1) {
          dy -= OFFSET_Y_LINHA2 * (m.height / FRAME_HEIGHT); 
        }
        
        ctx.drawImage(
          moedaSprite,
          coluna * FRAME_WIDTH, sy, 
          FRAME_WIDTH, FRAME_HEIGHT, 
          m.x, dy, m.width, m.height 
        );
      }
    }
  });

  
  const now = performance.now();
  const FRAME_DURATION = 80;
  const SPRITE_SIZE = 25;

  floatingCoins = floatingCoins.filter(coin => {
    const elapsed = now - coin.startTime;
    if (elapsed >= FLOATING_COIN_DURATION) return false;

    const progress = elapsed / FLOATING_COIN_DURATION;
    const y = coin.y - (FLOATING_COIN_HEIGHT * progress);

    
    if (now - coin.lastFrameUpdate > FRAME_DURATION) {
      coin.frameIndex = (coin.frameIndex + 1) % 8;
      coin.lastFrameUpdate = now;
    }

    const linha = coin.frameIndex < 4 ? 0 : 1;
    const coluna = coin.frameIndex % 4;

    
    const shouldDraw = progress > 0.7 ? Math.floor(progress * 10) % 2 === 0 : true;

    if (shouldDraw) {
      ctx.save();
      ctx.globalAlpha = 1 - progress;

      
      const centerX = coin.x;
      const centerY = y;

      
      ctx.drawImage(
        moedaSprite,
        coluna * 220,
        (linha * 220) + (linha === 1 ? 90 : 0),
        220,
        220,
        centerX - SPRITE_SIZE/2,
        centerY - SPRITE_SIZE/2,
        SPRITE_SIZE,
        SPRITE_SIZE
      );

      
      ctx.font = 'bold 20px PixelFont';
      ctx.fillStyle = '#FFD700';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText(`$${coin.value}`, centerX, centerY + 25);
      ctx.fillText(`$${coin.value}`, centerX, centerY + 25);

      ctx.restore();
    }
    return true;
  });
}


setInterval(() => {
  if (!isPageVisible) return;
  if(gameState !== 'jogando' || isPaused) return; 
  if (gameState === 'jogando' && plataformas.length > 0) {
    if (moedas.length < 20) spawnMoeda(); 
  }
}, 800); 
