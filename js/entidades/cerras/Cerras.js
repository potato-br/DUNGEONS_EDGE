



let lastSerraAllowedTime = 0;

const serraDelayMin = 2000;
const serraDelayMax = 9000;
let lastSerraSpawn = performance.now();
let nextSerraDelay = serraDelayMin + Math.random() * (serraDelayMax - serraDelayMin);

function getRandomSerraSide() {
  return Math.random() < 0.5 ? 'left' : 'right';
}

function spawnCerras() {
  
  if (typeof serrasCarregadas !== 'undefined' && !serrasCarregadas) return;
  if (typeof lastSerraAllowedTime !== 'undefined' && performance.now() < lastSerraAllowedTime) return;
  if (typeof lastEnemyAllowedTime !== 'undefined' && performance.now() < lastEnemyAllowedTime) return;

  const now = performance.now();

  
  if (serras.length === 0 && (now - lastSerraSpawn > nextSerraDelay)) {
    const side = getRandomSerraSide();
    const serraSpeed = -2 * gameSpeed;
    if (side === 'left') {
      serras.push({
        x: gamePlayArea.x,  
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
        x: gamePlayArea.x + gamePlayArea.width - 110, 
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
    try {
      // play serra spawn sound immediately at low volume
      const newSerra = serras[serras.length - 1];
      if (newSerra) {
        // clear previous timeout if any
        try { if (newSerra._serraSpawnTimeout) clearTimeout(newSerra._serraSpawnTimeout); } catch (e) {}
        try {
          const VOL = 0.03; // very very quiet (relative multiplier)
          if (typeof AudioManager !== 'undefined') {
            // prefer using AudioManager to ensure global sfxVolume and baseVolume apply
            try {
              // playWithFade will return the audio element or null; pass volume as relative multiplier
              const played = AudioManager.playWithFade('serra_sfx', 400, { volume: VOL, loop: false });
              // track active serra sounds so they can be stopped when entering the shop
              if (played) {
                try {
                  window._activeSerraSounds = window._activeSerraSounds || [];
                  window._activeSerraSounds.push(played);
                  played.addEventListener('ended', () => {
                    try {
                      const idx = window._activeSerraSounds.indexOf(played);
                      if (idx >= 0) window._activeSerraSounds.splice(idx, 1);
                    } catch (e) {}
                  });
                } catch (e) {}
              }
            } catch (e) {
              // fallback to AudioManager.play which should also respect sfxVolume
              try { const p = AudioManager.play('serra_sfx', { volume: VOL }); if (p && typeof p.then === 'function') p.catch(()=>{}); } catch (er) {}
            }
          }
        } catch (err) {}
      }
    } catch (err) {}
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
      
      ctx.drawImage(
        serraSpritesheet,
        (serraFrame % serraSpriteTotalFrames) * serraSpriteFrameWidth, 
        0, 
        serraSpriteFrameWidth, 
        serraSpriteFrameHeight, 
        -serra.width / 2, 
        -serra.height / 2, 
        serra.width, 
        serra.height 
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


