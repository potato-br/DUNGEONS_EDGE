// ==========================
// ===== CERRAS SUBINDO =====
// ==========================

let lastSerraAllowedTime = 0;

const serraDelayMin = 2000;
const serraDelayMax = 9000;
let lastSerraSpawn = performance.now();
let nextSerraDelay = serraDelayMin + Math.random() * (serraDelayMax - serraDelayMin);

function getRandomSerraSide() {
  return Math.random() < 0.5 ? 'left' : 'right';
}

function spawnCerras() {
  // Só permite spawn se as imagens das serras estiverem carregadas
  if (typeof serrasCarregadas !== 'undefined' && !serrasCarregadas) return;
  if (typeof lastSerraAllowedTime !== 'undefined' && performance.now() < lastSerraAllowedTime) return;
  if (typeof lastEnemyAllowedTime !== 'undefined' && performance.now() < lastEnemyAllowedTime) return;

  const now = performance.now();

  // Só permite uma cerra na tela por vez
  if (serras.length === 0 && (now - lastSerraSpawn > nextSerraDelay)) {
    const side = getRandomSerraSide();
    const serraSpeed = -2 * gameSpeed;
    if (side === 'left') {
      serras.push({
        x: gamePlayArea.x,  // Alinha com borda esquerda da área jogável
        y: screenHeight,
        width: 110,
        height: 110,
        speedY: serraSpeed,
        side: 'left',
        hitbox: {
          width: 79,
          height: 79,
          offsetX: -2,
          offsetY: 22
        }
      });
    } else {
      serras.push({
        x: gamePlayArea.x + gamePlayArea.width - 110, // Alinha com borda direita da área jogável
        y: screenHeight,
        width: 110,
        height: 110,
        speedY: serraSpeed,
        side: 'right',
        hitbox: {
          width: 79,
          height: 79,
          offsetX: 35,
          offsetY: 10
        }
      });
    }
    lastSerraSpawn = now;
    nextSerraDelay = serraDelayMin + Math.random() * (serraDelayMax - serraDelayMin);
  }
}

function updateCerras() {
  for (let i = serras.length - 1; i >= 0; i--) {
    const serra = serras[i];
    serra.y += serra.speedY;
    if (serra.y + serra.height < 0) {
      serras.splice(i, 1);
    }
  }
}

function drawCerras() {
  if (typeof serrasCarregadas !== 'undefined' && !serrasCarregadas) {
    // Fallback: desenha um círculo simples para depuração
    serras.forEach(serra => {
      ctx.save();
      ctx.translate(serra.x + serra.width / 2, serra.y + serra.height / 2);
      ctx.fillStyle = "#888";
      ctx.beginPath();
      ctx.arc(0, 0, serra.width / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    });
    return;
  }
  serras.forEach(serra => {
    ctx.save();
    ctx.translate(serra.x + serra.width / 2, serra.y + serra.height / 2);
    if (serra.side === 'left') {
      ctx.rotate(-Math.PI / 2);
    } else if (serra.side === 'right') {
      ctx.rotate(Math.PI / 2);
    }
    if (typeof serrasCarregadas !== 'undefined' && serrasCarregadas) {
      // Desenha o frame atual da spritesheet
      ctx.drawImage(
        serraSpritesheet,
        (serraFrame % serraSpriteTotalFrames) * serraSpriteFrameWidth, // sx
        0, // sy
        serraSpriteFrameWidth, // sw
        serraSpriteFrameHeight, // sh
        -serra.width / 2, // dx
        -serra.height / 2, // dy
        serra.width, // dw
        serra.height // dh
      );
    } else {
      ctx.fillStyle = "#888";
      ctx.beginPath();
      ctx.arc(0, 0, serra.width / 2, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.restore();
  });
  if (typeof serrasCarregadas !== 'undefined' && serrasCarregadas) {
    serraFrame = (serraFrame + 1) % serraSpriteTotalFrames;
  }
}


