// Sistema de moedas para o jogo
// =============================
let moedas = [];
let isPageVisible = true;

// Detecta quando a página fica visível/invisível
document.addEventListener('visibilitychange', () => {
  isPageVisible = !document.hidden;
});

function spawnMoeda() {
  // Não spawna moedas se não estiver jogando, se estiver pausado ou se a tela de carregamento estiver ativa
  if (gameState !== 'jogando' || isPaused || document.getElementById('blackScreenTransition')) return;

  // Chance maior de aparecer na plataforma do jogador
  let plataformaAlvo = null;
  // Tenta identificar a plataforma atual do jogador
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
  if (plataformaAlvo && Math.random() < 0.85) { // 85% de chance na plataforma do jogador
    plat = plataformaAlvo;
  } else {
    // 15% de chance em outra plataforma aleatória
    const outras = plataformas.filter(p => p !== plataformaAlvo && p.y > 0 && p.y < screenHeight - 60 && !p.falling && !p.hole);
    if (outras.length > 0) {
      plat = outras[Math.floor(Math.random() * outras.length)];
    } else if (plataformaAlvo) {
      plat = plataformaAlvo;
    } else {
      return;
    }
  }

  // Gera posição aleatória sobre a plataforma, considerando hitbox
  let spawnX, spawnY;
  if (plat.hitbox) {
    // Se a plataforma tem hitbox personalizada, usa ela para posicionar
    spawnX = plat.x + plat.hitbox.offsetX + 10 + Math.random() * (plat.hitbox.width - 30);
    spawnY = plat.y + plat.hitbox.offsetY - 24; // Posiciona acima da hitbox
  } else {
    // Se não tem hitbox, usa os limites visuais da plataforma
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
    activeTime: 0, // tempo acumulado que o jogo está rodando
    platformId: plat.id // Guarda referência à plataforma de origem
  });
}

function updateMoedas() {
  if(gameState !== 'jogando' ) return; // Não atualiza moedas se não estiver jogando
  // Removes moedas fora da tela ou após 3.5 segundos
  const delta = 16; // aproximado para 60 FPS, ou você pode calcular o real entre frames
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

  // Move moedas junto com as plataformas
  moedas.forEach(m => {
    // Guarda posição anterior da moeda para calcular movimento relativo
    const prevX = m.x;
    
    // Procura plataforma abaixo
    const plat = plataformas.find(p => {
      if (p.hitbox) {
        // Se a plataforma tem hitbox, verifica colisão com ela
        const hitboxLeft = p.x + p.hitbox.offsetX;
        const hitboxRight = hitboxLeft + p.hitbox.width;
        return m.x + m.width/2 > hitboxLeft && 
               m.x + m.width/2 < hitboxRight && 
               Math.abs(m.y + m.height - (p.y + p.hitbox.offsetY)) < 30;
      } else {
        // Se não tem hitbox, verifica com os limites visuais
        return m.x + m.width/2 > p.x && 
               m.x + m.width/2 < p.x + p.width && 
               Math.abs(m.y + m.height - p.y) < 30;
      }
    });
    
    if (plat) {
      // Para plataformas móveis, posiciona a moeda em relação à plataforma
      if (plat.type === PLATFORM_TYPES.MOVEL) {
        // Calcula a posição relativa da moeda na plataforma (0 a 1)
        if (!m.platformOffset) {
          // Se ainda não tem offset, calcula baseado na posição atual
          const platLeft = plat.x + (plat.hitbox ? plat.hitbox.offsetX : 0);
          const platWidth = plat.hitbox ? plat.hitbox.width : plat.width;
          m.platformOffset = (m.x - platLeft) / platWidth;
        }
        
        // Atualiza posição baseada no offset relativo
        const platLeft = plat.x + (plat.hitbox ? plat.hitbox.offsetX : 0);
        const platWidth = plat.hitbox ? plat.hitbox.width : plat.width;
        m.x = platLeft + (m.platformOffset * platWidth);
      }
      
      // Atualiza posição Y baseada na hitbox
      if (plat.hitbox) {
        m.y = plat.y + plat.hitbox.offsetY - m.height;
      } else {
        m.y = plat.y - m.height;
      }
    } else {
      m.y += 1 * gameSpeed; // Cai devagar se não tem plataforma
      m.platformOffset = undefined; // Limpa o offset quando cai da plataforma
    }
  });
}

// Adicione estas constantes no topo do arquivo
const FLOATING_COIN_DURATION = 1000; // 1 segundo
// Para subir/descer a moeda flutuante, ajuste FLOATING_COIN_HEIGHT
const FLOATING_COIN_HEIGHT = 100; // exemplo: aumente para subir mais, diminua para subir menos
let floatingCoins = []; // Array para moedas flutuantes

function checkMoedaCollision() {
  if(gameState !== 'jogando' || isPaused) return;
  moedas.forEach(m => {
    if (!m.collected && rectIntersect(player, m)) {
      m.collected = true;
      
      let valorMoeda = moneyplus;
      money += valorMoeda;

      // Cria a moeda flutuante com sprite
      floatingCoins.push({
        x: player.x + player.width/2, // ajuste horizontal (adicione +N para direita, -N para esquerda)
        y: player.y - 25,             // ajuste vertical (adicione +N para mais baixo, -N para mais alto)
        value: valorMoeda,
        startTime: performance.now(),
        alpha: 1,
        frameIndex: 0,
        lastFrameUpdate: performance.now()
      });

      // Efeito visual de partículas
      createParticles(m.x + m.width/2, m.y + m.height/2, 8, 'yellow');
    }
  });
}

// Modifique a função drawMoedas para incluir as moedas flutuantes
function drawMoedas() {
  if(gameState !== 'jogando' ) return;
  const FRAME_WIDTH = 220;
  const FRAME_HEIGHT = 220;
  const FRAMES_POR_LINHA = 4;
  const OFFSET_Y_LINHA2 = 12; // quanto "sobe" a moeda na linha 2
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
        // Se for linha 2, desenha a moeda mais pra cima (ajuste visual)
        if (linha === 1) {
          dy -= OFFSET_Y_LINHA2 * (m.height / FRAME_HEIGHT); // sobe a moeda renderizada
        }
        // Corrige: nunca altere sy/sh, só a posição de destino
        ctx.drawImage(
          moedaSprite,
          coluna * FRAME_WIDTH, sy, // sx, sy
          FRAME_WIDTH, FRAME_HEIGHT, // sw, sh
          m.x, dy, m.width, m.height // dx, dy, dw, dh
        );
      }
    }
  });

  // Desenha moedas flutuantes
  const now = performance.now();
  const FRAME_DURATION = 80;
  const SPRITE_SIZE = 25;

  floatingCoins = floatingCoins.filter(coin => {
    const elapsed = now - coin.startTime;
    if (elapsed >= FLOATING_COIN_DURATION) return false;

    const progress = elapsed / FLOATING_COIN_DURATION;
    const y = coin.y - (FLOATING_COIN_HEIGHT * progress);

    // Atualiza frame do sprite
    if (now - coin.lastFrameUpdate > FRAME_DURATION) {
      coin.frameIndex = (coin.frameIndex + 1) % 8;
      coin.lastFrameUpdate = now;
    }

    const linha = coin.frameIndex < 4 ? 0 : 1;
    const coluna = coin.frameIndex % 4;

    // Pisca nos últimos 30% do tempo
    const shouldDraw = progress > 0.7 ? Math.floor(progress * 10) % 2 === 0 : true;

    if (shouldDraw) {
      ctx.save();
      ctx.globalAlpha = 1 - progress;

      // Centraliza o texto e o sprite exatamente no mesmo ponto
      const centerX = coin.x;
      const centerY = y;

      // Desenha o sprite da moeda
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

      // Desenha o valor exatamente centralizado na moeda (ajuste +N para baixo, -N para cima)
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

// Spawna moedas periodicamente
setInterval(() => {
  if (!isPageVisible) return;
  if(gameState !== 'jogando' || isPaused) return; // Não atualiza moedas se não estiver jogando
  if (gameState === 'jogando' && plataformas.length > 0) {
    if (moedas.length < 20) spawnMoeda(); // aumenta o limite de moedas simultâneas
  }
}, 800); // reduz o intervalo para moedas aparecerem mais rápido
