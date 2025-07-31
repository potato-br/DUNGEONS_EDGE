let MORCEGO_ZOOM = 2; 
let MORCEGO_NORMAL_DRAW_OFFSET_X = -6;
let MORCEGO_NORMAL_DRAW_OFFSET_Y = -8;
let MORCEGO_ONDULADO_DRAW_OFFSET_X = -5;
let MORCEGO_ONDULADO_DRAW_OFFSET_Y = -8;
let lastMorcegoAllowedTime = 0;
const morcegos = [];
const morcegoSprite = new Image();
morcegoSprite.src = './images/personagens e inimigos/morcego/mugerco1.png';

const MorcegoModo = {
    NORMAL: 'NORMAL',
    ONDULADO: 'ONDULADO',
    KAMIKAZE: 'KAMIKAZE',
    TRANSPORTADOR: 'TRANSPORTADOR'
};

const MODOS_POR_PROFUNDIDADE = [

    /*{
        profundidadeMin: 0,
        profundidadeMax: Infinity,
        modos: [
            
          { tipo: MorcegoModo.NORMAL},        
            { tipo: MorcegoModo.ONDULADO},      
            { tipo: MorcegoModo.KAMIKAZE},      
            { tipo: MorcegoModo.TRANSPORTADOR}   
        ]
    },*/
   
    {
        profundidadeMin: 15000,
        profundidadeMax: 25000,
        modos: [
            { tipo: MorcegoModo.NORMAL},
        ]
    },
    {
        profundidadeMin: 30000,
        profundidadeMax: 50000,
        modos: [
            
          { tipo: MorcegoModo.NORMAL},        
            { tipo: MorcegoModo.ONDULADO},      
            
        ]
    },
    {
        profundidadeMin: 65000,
        profundidadeMax: 80000,
        modos: [
            
          { tipo: MorcegoModo.NORMAL},        
            { tipo: MorcegoModo.ONDULADO},      
            { tipo: MorcegoModo.KAMIKAZE},      
             
        ]
    },
   {
        profundidadeMin: 82000,
        profundidadeMax: Infinity,
        modos: [
            
          { tipo: MorcegoModo.NORMAL},        
            { tipo: MorcegoModo.ONDULADO},      
            { tipo: MorcegoModo.KAMIKAZE},      
            { tipo: MorcegoModo.TRANSPORTADOR}   
        ]
    }
];

const MORCEGO_CONFIG = {
    MAX_MORCEGOS: 20,
    MAX_MORCEGOS_POR_TIPO: {
        NORMAL: 5,
        ONDULADO: 5,
        KAMIKAZE: 2,
        TRANSPORTADOR: 2
    },
    SPAWN_CHANCE: {
        NORMAL: 0.8, 
        ONDULADO: 0.8,
        KAMIKAZE: 0.6,
        TRANSPORTADOR: 0.5
    },
    SPAWN_INTERVAL: {
        NORMAL: 100, 
        ONDULADO: 100,
        KAMIKAZE: 500,
        TRANSPORTADOR: 800
    },
    MIN_DISTANCE_PLATFORM: 100,
    MIN_DISTANCE_HORIZONTAL: 150,
    VELOCIDADE_BASE: 4,
    REDUCAO_SPAWN_EFIGIE: 0.88,
    ZONA_EXCLUSAO: {
        get WIDTH() { return gamePlayArea.width; }, 
        HEIGHT: 150                               
    },
    ONDULADO: {
        AMPLITUDE_Y: 50,           
        VELOCIDADE: 0.05,         
        VELOCIDADE_X: 2,          
        AREA_PATRULHA: 100        
    }
};

const MORCEGO_FRAMES = {
  FLY_RIGHT_1: { x: 0, y: 18, w: 27, h: 40 }, 
  FLY_RIGHT_2: { x: 32, y: 17, w: 27, h: 40 }, 
  FLY_RIGHT_3: { x: 64, y: 25, w: 27, h: 39 }  
};

const MORCEGO_FRAMES_DESCENDO = {
  DOWN_1: { x: 0, y: 82, w: 37, h: 40 },   
  DOWN_2: { x: 34, y: 80, w: 39, h: 40 },  
  DOWN_3: { x: 65, y: 90, w: 40, h: 40 }   
};

const MORCEGO_FRAMES_SUBINDO = {
  UP_1: { x: 0, y: 50, w: 37, h: 40 },    
  UP_2: { x: 34, y: 50, w: 37, h: 40 },   
  UP_3: { x: 65, y: 54.5, w: 37, h: 40 }    
};

let lastSpawnDepth = {
    NORMAL: 0,
    ONDULADO: 0,
    KAMIKAZE: 0,
    TRANSPORTADOR: 0
};




function updateMorcegoOndulado(morcego) {
    morcego.tempoOndulacao += MORCEGO_CONFIG.ONDULADO.VELOCIDADE;
    morcego.areaPatrulha.y -= 1 * gameSpeed;
    morcego.zonaExclusao.y -= 1 * gameSpeed;
    morcego.x += morcego.velocidadeX;
    
    morcego.direcaoOlhar = {x: Math.sign(morcego.velocidadeX), y: 0};
    const amplitudeMax = (morcego.areaPatrulha.altura - morcego.height) / 2;
    const centroY = morcego.areaPatrulha.y + morcego.areaPatrulha.altura / 2 - morcego.height / 2;
    morcego.y = centroY + Math.sin(morcego.tempoOndulacao) * amplitudeMax;
    if (morcego.x <= gamePlayArea.x || morcego.x + morcego.width >= gamePlayArea.x + gamePlayArea.width) {
        morcego.velocidadeX *= -1;
        morcego.x = Math.max(gamePlayArea.x, Math.min(gamePlayArea.x + gamePlayArea.width - morcego.width, morcego.x));
    }
}

function updateMorcegoNormal(morcego) {
    morcego.x += morcego.velocityX;
    morcego.y -= 1 * gameSpeed;
    morcego.zonaExclusao.y -= 1 * gameSpeed;
    
    morcego.direcaoOlhar = {x: Math.sign(morcego.velocityX), y: 0};
    if (morcego.x <= gamePlayArea.x || morcego.x + morcego.width >= gamePlayArea.x + gamePlayArea.width) {
        morcego.velocityX *= -1;
    }
}

function updateMorcegoTransportador(morcego) {
    
    const fila = morcegos.filter(m => m.modo === MorcegoModo.TRANSPORTADOR && m.carregandoEnemy);
    const idx = fila.indexOf(morcego);
    let alvoX, alvoY;
    const DISTANCIA_VERTICAL = 200; 
    if (idx === 0) {
        
        alvoX = player.x + player.width/2 - morcego.width/2;
        alvoY = player.y - DISTANCIA_VERTICAL;
    } else {
        
        const BASE_DIST = 100; 
        const DIAMOND_STEP = 70; 
        const dist = BASE_DIST + DIAMOND_STEP * (idx-1);
        const ang = Math.PI/4 * ((idx-1)%4);
        alvoX = player.x + player.width/2 - morcego.width/2 + Math.cos(ang) * dist;
        alvoY = player.y - DISTANCIA_VERTICAL + Math.sin(ang) * dist;
    }
    
    const dx = alvoX - morcego.x;
    const dy = alvoY - morcego.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    let speed = 2 * gameSpeed;
    // Limite máximo de movimento por frame para evitar bugs em FPS alto
    const MAX_MOVE_PER_FRAME = 4; // pixels
    if (speed > MAX_MOVE_PER_FRAME) speed = MAX_MOVE_PER_FRAME;
    if (dist > speed) {
        morcego.x += (dx/dist) * speed;
        morcego.y += (dy/dist) * speed;
    } else {
        morcego.x = alvoX;
        morcego.y = alvoY;
    }
    
    morcego.direcaoOlhar = {x: 0, y: 1};
    
    if (morcego.carregandoEnemy && morcego.enemy) {
        morcego.enemy.x = morcego.x + morcego.width/2 - morcego.enemy.width/2;
        morcego.enemy.y = morcego.y + morcego.height;
    }
    
    
    
    if (idx === 0 &&
        morcego.x + morcego.width/2 > player.x &&
        morcego.x + morcego.width/2 < player.x + player.width
    ) {
        morcego.tempoSobreJogador += 1/60 * gameSpeed;
        if (morcego.tempoSobreJogador > 2 && morcego.carregandoEnemy) {
            
            morcego.carregandoEnemy = false;
            if (morcego.enemy) {
                morcego.enemy.isDetached = true;
                morcego.enemy._transportado = false;
                
                enemies.push(morcego.enemy);
                morcego.enemy = null;
            }
            
            morcego.modo = MorcegoModo.KAMIKAZE;
            morcego.estado = 'SUBINDO';
            morcego.timerEstado = 0;
            morcego.anguloOrbita = 0;
            morcego.raioOrbita = 64 + Math.random() * 32;
            morcego.direcaoOrbita = Math.random() < 0.5 ? 1 : -1;
            morcego.transicaoDestino = null;
            morcego.yInicial = morcego.y;
            morcego.tempoAguardar = 60 + Math.floor(Math.random()*60);
            morcego.tempoAlerta = 30 + Math.floor(Math.random()*30); 
            morcego.velocidadeRasante = 7 * (0.7 + Math.random()*0.6); 
            morcego._rasanteDir = null;
            morcego.alvoRasante = null;
        }
    } else if (idx === 0) {
        
        
    } else {
        morcego.tempoSobreJogador = 0;
    }
}

function updateMorcegos() {
    for (let i = morcegos.length - 1; i >= 0; i--) {
        const morcego = morcegos[i];
        if (morcego.modo === MorcegoModo.ONDULADO) {
            updateMorcegoOndulado(morcego);
        } else if (morcego.modo === MorcegoModo.KAMIKAZE) {
            updateMorcegoKamikaze(morcego, i);
        } else if (morcego.modo === MorcegoModo.TRANSPORTADOR) {
            updateMorcegoTransportador(morcego);
        } else {
            updateMorcegoNormal(morcego);
        }

        
        
        const isTransportadorComAranha = morcego.modo === MorcegoModo.TRANSPORTADOR && (morcego.carregandoEnemy === true);
        if (!isTransportadorComAranha) {
            if (rectIntersect(player, morcego)) {
                checkColisaoMorcegoComPlayer(morcego, i);
            }
        }

        if (morcego.y + morcego.height < -50) {
            morcegos.splice(i, 1);
            continue;
        }

        for (const platform of plataformas) {
            if (rectIntersect(morcego, platform)) {
                morcego.velocityX *= -1;
                break;
            }
        }
    }
}

function updateMorcegoKamikaze(morcego, index) {
    switch (morcego.estado) {
        case 'SUBINDO': {
            {
                let move = 2.5 * gameSpeed;
                const MAX_MOVE_PER_FRAME = 10; // pixels
                if (move > MAX_MOVE_PER_FRAME) move = MAX_MOVE_PER_FRAME;
                morcego.y -= move;
            }
            if (morcego.y <= morcego.yInicial - 120) {
                
                const cx = player.x + player.width/2;
                const cy = player.y + player.height/2;
                const raio = morcego.raioOrbita || player.width * 2.2;
                const dx = morcego.x + morcego.width/2 - cx;
                const dy = morcego.y + morcego.height/2 - cy;
                morcego.anguloOrbita = Math.atan2(dy, dx);
                
                const destinoX = cx + Math.cos(morcego.anguloOrbita) * raio - morcego.width/2;
                const destinoY = cy + Math.sin(morcego.anguloOrbita) * raio - morcego.height/2;
                morcego.transicaoDestino = { x: destinoX, y: destinoY };
                morcego.estado = 'TRANSICAO_ORBITA';
                morcego.tempoEstado = 0;
            }
            
            morcego.direcaoOlhar = {x: 0, y: -1};
            break;
        }
        case 'TRANSICAO_ORBITA': {
            
            let tx = morcego.transicaoDestino.x - morcego.x;
            let ty = morcego.transicaoDestino.y - morcego.y;
            let dist = Math.sqrt(tx*tx + ty*ty);
            let speed = 6 * gameSpeed;
            const MAX_MOVE_PER_FRAME = 10; // pixels
            if (speed > MAX_MOVE_PER_FRAME) speed = MAX_MOVE_PER_FRAME;
            if (dist < speed) {
                morcego.x = morcego.transicaoDestino.x;
                morcego.y = morcego.transicaoDestino.y;
                morcego.estado = 'AGUARDANDO';
                morcego.tempoEstado = 0;
            } else {
                morcego.x += (tx/dist) * speed;
                morcego.y += (ty/dist) * speed;
            }
            
            if (dist > 0.01) {
                morcego.direcaoOlhar = {x: tx/dist, y: ty/dist};
            }
            break;
        }
        case 'AGUARDANDO': {
            morcego.tempoEstado++;
            
            const raio = morcego.raioOrbita || player.width * 2.2;
            const direcao = morcego.direcaoOrbita || 1;
            {
                let angSpeed = 0.045 * gameSpeed * direcao;
                const MAX_ANG_PER_FRAME = 0.09; // radianos
                if (Math.abs(angSpeed) > MAX_ANG_PER_FRAME) angSpeed = MAX_ANG_PER_FRAME * Math.sign(angSpeed);
                morcego.anguloOrbita += angSpeed;
            }
            morcego.x = player.x + player.width/2 + Math.cos(morcego.anguloOrbita) * raio - morcego.width/2;
            morcego.y = player.y + player.height/2 + Math.sin(morcego.anguloOrbita) * raio - morcego.height/2;
            
            const ang = morcego.anguloOrbita;
            const dir = morcego.direcaoOrbita || 1;
            morcego.direcaoOlhar = {x: -Math.sin(ang)*dir, y: Math.cos(ang)*dir};
            if (morcego.tempoEstado > morcego.tempoAguardar) {
                morcego.estado = 'ALERTA';
                morcego.tempoEstado = 0;
                
                morcego.alvoRasante = {
                    x: player.x + player.width/2 - morcego.width/2,
                    y: player.y + player.height/2 - morcego.height/2
                };
            }
            break;
        }
        case 'ALERTA': {
            morcego.tempoEstado++;
            
            if (morcego.alvoRasante) {
                const dx = morcego.alvoRasante.x - morcego.x;
                const dy = morcego.alvoRasante.y - morcego.y;
                const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                morcego.direcaoOlhar = {x: dx/dist, y: dy/dist};
            }
            
            const foraArea = (
                morcego.x + morcego.width < gamePlayArea.x ||
                morcego.x > gamePlayArea.x + gamePlayArea.width ||
                morcego.y + morcego.height < 0 ||
                morcego.y > screenHeight
            );
            if (foraArea) {
                
                morcego.x = gamePlayArea.x + gamePlayArea.width/2 - morcego.width/2;
                morcego.y = 0;
                
                morcego.alvoRasante = {
                    x: player.x + player.width/2 - morcego.width/2,
                    y: player.y + player.height/2 - morcego.height/2
                };
                
                const dx = morcego.alvoRasante.x - morcego.x;
                const dy = morcego.alvoRasante.y - morcego.y;
                const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                morcego.direcaoOlhar = {x: dx/dist, y: dy/dist};
                
                morcego.estado = 'RASANTE';
                morcego.tempoEstado = 0;
                break;
            }
            if (morcego.tempoEstado > morcego.tempoAlerta) {
                morcego.estado = 'RASANTE';
                morcego.tempoEstado = 0;
            }
            break;
        }
        case 'RASANTE': {
            
            if (!morcego.alvoRasante) {
                morcego.estado = 'MORRENDO';
                break;
            }
            
            if (!morcego._rasanteDir) {
                const dx = morcego.alvoRasante.x - morcego.x;
                const dy = morcego.alvoRasante.y - morcego.y;
                const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                morcego._rasanteDir = { x: dx/dist, y: dy/dist };
            }
            {
                let move = morcego.velocidadeRasante;
                const MAX_MOVE_PER_FRAME = 12; // pixels
                if (move > MAX_MOVE_PER_FRAME) move = MAX_MOVE_PER_FRAME;
                morcego.x += morcego._rasanteDir.x * move;
                morcego.y += morcego._rasanteDir.y * move;
            }

            
            if (
                morcego.x + morcego.width < gamePlayArea.x ||
                morcego.x > gamePlayArea.x + gamePlayArea.width ||
                morcego.y + morcego.height < 0 ||
                morcego.y > screenHeight
            ) {
                morcego.estado = 'MORRENDO';
                break;
            }
            
            if (rectIntersect(player, morcego)) {
                checkColisaoMorcegoComPlayer(morcego, index);
            }
            
            if (!morcego._rasanteDir && morcego.alvoRasante) {
                const dx = morcego.alvoRasante.x - morcego.x;
                const dy = morcego.alvoRasante.y - morcego.y;
                const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                morcego._rasanteDir = { x: dx/dist, y: dy/dist };
            }
            if (morcego._rasanteDir) {
                morcego.direcaoOlhar = {x: morcego._rasanteDir.x, y: morcego._rasanteDir.y};
            }
            break;
        }
        case 'MORRENDO':
            // Partículas ao morrer
            if (!morcego._particulasCriadas) {
                createParticles(
                    morcego.x + morcego.width/2,
                    morcego.y + morcego.height/2,
                    16,
                    'rgba(180,0,180,0.8)'
                );
                morcego._particulasCriadas = true;
            }
            const idx = morcegos.indexOf(morcego);
            if (idx !== -1) {
                morcegos.splice(idx, 1);
            }
            break;
    }
}

function checkMorcegoCollision() {
    if (isRespawning || (typeof DASH !== 'undefined' && DASH.isInvulnerable)) return;
    for (let i = morcegos.length - 1; i >= 0; i--) {
        if (checkColisaoMorcegoComPlayer(morcegos[i], i)) {
            break;
        }
    }
}

function checkColisaoMorcegoComPlayer(morcego, index) {
    if (!rectIntersect(player, morcego)) return false;

    // Interação: cavaleiro mata morcego pulando em cima
    if (
        activeCharacter === 'Roderick, o Cavaleiro' &&
        player.velocityY > 0 &&
        (player.y + player.height - player.velocityY) <= morcego.y + 8 // tolerância para "por cima"
    ) {
        // Remover morcego
        const idx = morcegos.indexOf(morcego);
        if (idx !== -1) morcegos.splice(idx, 1);
        if (!morcego._particulasCriadas) {
                createParticles(
                    morcego.x + morcego.width/2,
                    morcego.y + morcego.height/2,
                    16,
                    'rgba(180,0,180,0.8)'
                );
                morcego._particulasCriadas = true;
            }
        // Recupera os pulos do player
        if (typeof player.jumpCount !== 'undefined') player.jumpCount = 0;
        // Efeito opcional: som, partículas, etc.
        return true;
    }

    if (morcego.modo === MorcegoModo.TRANSPORTADOR && morcego.estado !== 'RASANTE') {
        return false;
    }

    if (morcego.modo === MorcegoModo.KAMIKAZE && morcego.estado !== 'RASANTE') {
        return false;
    }

    if (morcego.modo === MorcegoModo.KAMIKAZE) {
        morcego.estado = 'MORRENDO';
    }

    applyDanoJogador(morcego);
    return true;
}

function getFaixaModosPorProfundidade(profundidade) {
    return MODOS_POR_PROFUNDIDADE.find(
        f => profundidade >= f.profundidadeMin && profundidade < f.profundidadeMax
    );
}

function sortearModoDaFaixa(faixa) {
    const random = Math.random();
    let chanceAcumulada = 0;
    for (const modo of faixa.modos) {
        chanceAcumulada += modo.chance;
        if (random <= chanceAcumulada) {
            return modo.tipo;
        }
    }
    return MorcegoModo.NORMAL;
}

function applyDanoJogador(morcego) {

    if (isRespawning || (typeof DASH !== 'undefined' && DASH.isInvulnerable) || (typeof DASH !== 'undefined' && DASH.isDashing)) return;

    if (activeCharacter === 'Valthor, o Mago') {
        const isKamikazeRasante = morcego && morcego.modo === MorcegoModo.KAMIKAZE && morcego.estado === 'RASANTE';
        const isTransportadorRasante = morcego && morcego.modo === MorcegoModo.TRANSPORTADOR && morcego.estado === 'RASANTE';
        const isOutroMorcego = morcego && (morcego.modo === MorcegoModo.NORMAL || morcego.modo === MorcegoModo.ONDULADO);
        if (isKamikazeRasante || isTransportadorRasante || isOutroMorcego) {
          live--;
          if (live < 0) {
            gameOver();
          } else {
            enemies.length = 0;
            morcegos.length = 0; 
            lastEnemyAllowedTime = performance.now() + 8000;
            lastMorcegoAllowedTime = performance.now() + 8000; 
            aplicarInvulnerabilidade(6000, true);
            for (let i = 0; i < 30; i++) {
              createParticles(
                player.x + player.width/2,
                player.y + player.height/2,
                1,
                'rgba(138, 43, 226, 0.8)',
                {
                  speedX: Math.cos(i * Math.PI / 15) * 8,
                  speedY: Math.sin(i * Math.PI / 15) * 8,
                  fadeSpeed: 0.02,
                  size: 6,
                  gravity: 0
                }
              );
            }
          }
        }
        return;
      }
  
  if (activeCharacter === 'Kuroshi, o Ninja') {
    
    const isKamikazeRasante = morcego && morcego.modo === MorcegoModo.KAMIKAZE && morcego.estado === 'RASANTE';
    const isTransportadorRasante = morcego && morcego.modo === MorcegoModo.TRANSPORTADOR && morcego.estado === 'RASANTE';
    const isOutroMorcego = morcego && (morcego.modo === MorcegoModo.NORMAL || morcego.modo === MorcegoModo.ONDULADO);
    if (isKamikazeRasante || isTransportadorRasante || isOutroMorcego) {
      ninjasmokebomb();
      if (ninjasmokebomb() === true) {
        live--;
        if (live < 0) {
          gameOver();
        } else {
          aplicarInvulnerabilidade(1000, true);
        }
      }
    }
    return;
  }
   
   if (!morcego || morcego.modo !== MorcegoModo.TRANSPORTADOR || (morcego.modo === MorcegoModo.TRANSPORTADOR && !morcego.carregandoEnemy)) {
       live--;
   }
   if (live < 0 ) {
       gameOver();
   } else {
       if (!morcego || morcego.modo !== MorcegoModo.TRANSPORTADOR || (morcego.modo === MorcegoModo.TRANSPORTADOR && !morcego.carregandoEnemy)) {
           aplicarInvulnerabilidade(1200, true);
       }
   }
}




function drawEnemyTransportado(enemy, morcego) {
    const sprite = inimigoImages && inimigoImages[0];
    const xOffset = 0; 
    const yOffset = -9; 
    if (sprite && sprite.complete) {
        const SPRITE_WIDTH = sprite.width / 2;
        const SPRITE_HEIGHT = sprite.height;
        if (!enemy.spawnTime) enemy.spawnTime = Date.now();
        const tempo = Date.now() - enemy.spawnTime;
        const frame = Math.floor((tempo / 300) % 2);
        const sx = frame * SPRITE_WIDTH;
        const sy = 0;
        ctx.drawImage(
            sprite,
            sx, sy, SPRITE_WIDTH, SPRITE_HEIGHT,
            (morcego ? morcego.x : enemy.x) + xOffset, (morcego ? morcego.y + morcego.height : enemy.y) + yOffset, enemy.width, enemy.height
        );
    } else {
        ctx.fillStyle = 'red';
        ctx.fillRect((morcego ? morcego.x : enemy.x) + xOffset, (morcego ? morcego.y + morcego.height : enemy.y) + yOffset, enemy.width, enemy.height);
    }
}

function drawMorcego(morcego) {
  const frame = getMorcegoFrame(morcego);
  let yOffset = 0;
  let xOffset = 0;
  
  const zoomAtual = morcego.modo === MorcegoModo.TRANSPORTADOR ? MORCEGO_ZOOM * 1.4 : MORCEGO_ZOOM;
  
  switch (true) {
    case (frame.x === MORCEGO_FRAMES.FLY_RIGHT_3.x && frame.y === MORCEGO_FRAMES.FLY_RIGHT_3.y):
      yOffset = 13;
      break;
    case (frame.x === MORCEGO_FRAMES_DESCENDO.DOWN_2.x && frame.y === MORCEGO_FRAMES_DESCENDO.DOWN_2.y):
      yOffset = -2;
      xOffset = 5;
      break;
    case (frame.x === MORCEGO_FRAMES_DESCENDO.DOWN_3.x && frame.y === MORCEGO_FRAMES_DESCENDO.DOWN_3.y):
      yOffset = 17;
      xOffset = 5;
      break;
    case (frame.x === MORCEGO_FRAMES_SUBINDO.UP_3.x && frame.y === MORCEGO_FRAMES_SUBINDO.UP_3.y):
      yOffset = 11;
      xOffset = 2;
      break;
    case (frame.x === MORCEGO_FRAMES_SUBINDO.UP_2.x && frame.y === MORCEGO_FRAMES_SUBINDO.UP_2.y):
      xOffset = 3;
      yOffset = 3;
      break;
    default:
      
      break;
  }
  
  const drawW = morcego.hitbox.width * zoomAtual;
  const drawH = morcego.hitbox.height * zoomAtual;
  const centerX = morcego.x + morcego.hitbox.offsetX + morcego.hitbox.width / 2;
  const centerY = morcego.y + morcego.hitbox.offsetY + morcego.hitbox.height / 2;
  
  let extraX = morcego.drawOffsetX || 0;
  let extraY = morcego.drawOffsetY || 0;
  if (morcego.modo === MorcegoModo.NORMAL) {
    extraX += MORCEGO_NORMAL_DRAW_OFFSET_X;
    extraY += MORCEGO_NORMAL_DRAW_OFFSET_Y;
  } else if (morcego.modo === MorcegoModo.ONDULADO) {
    extraX += MORCEGO_ONDULADO_DRAW_OFFSET_X;
    extraY += MORCEGO_ONDULADO_DRAW_OFFSET_Y;
  }
  
  let drawX, drawY;
  if (frame.flip) {
    drawX = centerX - drawW / 2 - (xOffset + extraX);
  } else {
    drawX = centerX - drawW / 2 + xOffset + extraX;
  }
  drawY = centerY - drawH / 2 + yOffset + extraY;
  if (morcegoSprite.complete && morcegoSprite.naturalWidth > 0) {
    ctx.save();
    if (frame.flip) {
      ctx.translate(centerX + drawW / 2 - (xOffset + extraX), drawY);
      ctx.scale(-1, 1);
      ctx.drawImage(
        morcegoSprite,
        frame.x, frame.y, frame.w, frame.h,
        0, 0, drawW, drawH
      );
    } else {
      ctx.drawImage(
        morcegoSprite,
        frame.x, frame.y, frame.w, frame.h,
        drawX, drawY, drawW, drawH
      );
    }
    ctx.restore();
    if (morcego.modo === MorcegoModo.TRANSPORTADOR && morcego.carregandoEnemy && morcego.enemy) {
      drawEnemyTransportado(morcego.enemy, morcego);
    }
  } else {
    
    ctx.fillStyle = '#440000';
    ctx.fillRect(drawX, drawY, drawW, drawH);
    ctx.strokeStyle = '#FFD700';
    ctx.strokeRect(drawX, drawY, drawW, drawH);
    
    if (morcego.modo === MorcegoModo.TRANSPORTADOR && morcego.carregandoEnemy && morcego.enemy) {
      drawEnemyTransportado(morcego.enemy, morcego);
    }
  }
  // Exclamação para kamikaze em ALERTA
  if (morcego.modo === MorcegoModo.KAMIKAZE && morcego.estado === 'ALERTA') {
    drawExclamacaoPixelArt(
      morcego.x + morcego.width/2,
      morcego.y - 10
    );
  }
  // Exclamação para transportador prestes a soltar aranha
  if (
    morcego.modo === MorcegoModo.TRANSPORTADOR &&
    morcego.carregandoEnemy &&
    typeof morcego.tempoSobreJogador === 'number' &&
    morcego.tempoSobreJogador > 1.5 && morcego.tempoSobreJogador < 2
  ) {
    drawExclamacaoPixelArt(
      morcego.x + morcego.width/2,
      morcego.y - 10
    );
  }
  if (window.spriteDebug) {
    drawMorcegoDebug(morcego);
  }
}

function drawExclamacaoPixelArt(cx, cy) {
    ctx.save();
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillStyle = '#FFD700'; // amarelo vibrante
    ctx.fillRect(cx-2, cy-12, 4, 8); // haste
    ctx.beginPath();
    ctx.arc(cx, cy-2, 2, 0, 2*Math.PI);
    ctx.fill(); // bolinha
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(cx-2, cy-12, 4, 8);
    ctx.beginPath();
    ctx.arc(cx, cy-2, 2, 0, 2*Math.PI);
    ctx.stroke();
    ctx.restore();
}

function drawMorcegoDebug(morcego) {
    
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 2;
    ctx.strokeRect(
        morcego.x + morcego.hitbox.offsetX,
        morcego.y + morcego.hitbox.offsetY,
        morcego.hitbox.width,
        morcego.hitbox.height
    );
    
    
    if (morcego.zonaExclusao) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            morcego.zonaExclusao.x,
            morcego.zonaExclusao.y,
            morcego.zonaExclusao.width,
            morcego.zonaExclusao.height
        );
    }
    
    if (morcego.modo === MorcegoModo.ONDULADO) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            gamePlayArea.x,
            morcego.areaPatrulha.y,
            gamePlayArea.width,
            morcego.areaPatrulha.altura
        );
    }

    
    if (typeof player !== 'undefined') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(player.x + player.width/2, player.y + player.height/2, player.width * 2.2, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0,0,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    
    if (morcego.modo === MorcegoModo.KAMIKAZE && morcego.alvoRasante) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(morcego.x + morcego.width/2, morcego.y + morcego.height/2);
        ctx.lineTo(morcego.alvoRasante.x + morcego.width/2, morcego.alvoRasante.y + morcego.height/2);
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
    }

    
    if (morcego.direcaoOlhar) {
        ctx.save();
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(morcego.x + morcego.width/2, morcego.y + morcego.height/2);
        ctx.lineTo(
            morcego.x + morcego.width/2 + morcego.direcaoOlhar.x * 24,
            morcego.y + morcego.height/2 + morcego.direcaoOlhar.y * 24
        );
        ctx.stroke();
        ctx.restore();
    }
}

function drawMorcegos() {
    morcegos.forEach(drawMorcego);
}

function getMorcegoFrame(morcego) {
  
  if (morcego.direcaoOlhar && morcego.direcaoOlhar.y > 0.5) {
    const frameIndex = Math.floor((performance.now() / 120) % 3);
    const frameNames = ['DOWN_1', 'DOWN_2', 'DOWN_3'];
    const frame = MORCEGO_FRAMES_DESCENDO[frameNames[frameIndex]];
    let flip = false;
    if (morcego.direcaoOlhar && typeof morcego.direcaoOlhar.x === 'number') {
      flip = morcego.direcaoOlhar.x < 0;
    } else {
      flip = morcego.velocityX < 0;
    }
    return { ...frame, flip };
  }
  
  if (morcego.direcaoOlhar && morcego.direcaoOlhar.y < -0.5) {
    const frameIndex = Math.floor((performance.now() / 120) % 3);
    const frameNames = ['UP_1', 'UP_2', 'UP_3'];
    const frame = MORCEGO_FRAMES_SUBINDO[frameNames[frameIndex]];
    let flip = false;
    if (morcego.direcaoOlhar && typeof morcego.direcaoOlhar.x === 'number') {
      flip = morcego.direcaoOlhar.x < 0;
    } else {
      flip = morcego.velocityX < 0;
    }
    return { ...frame, flip };
  }
  
  const frameIndex = Math.floor((performance.now() / 130) % 3);
  const frameNames = ['FLY_RIGHT_1', 'FLY_RIGHT_2', 'FLY_RIGHT_3'];
  const frame = MORCEGO_FRAMES[frameNames[frameIndex]];
  let flip = false;
  if (morcego.direcaoOlhar && typeof morcego.direcaoOlhar.x === 'number') {
    flip = morcego.direcaoOlhar.x < 0;
  } else {
    flip = morcego.velocityX < 0;
  }
  return { ...frame, flip };
}




function ajustaChancePorEfigie(chanceBase) {
  let chance = chanceBase;
  if (typeof inventario !== 'undefined') {
    const numEfigies = inventario.filter(item => item === 'Efgie da Paz').length;
    for (let i = 0; i < numEfigies; i++) {
      chance *= MORCEGO_CONFIG.REDUCAO_SPAWN_EFIGIE;
    }
  }
  return chance;
}

function getSpawnY(modo, height) {
  const OFFSET = 32;
  if (modo === MorcegoModo.TRANSPORTADOR) {
    
    return -height - OFFSET;
  } else {
    
    return screenHeight;
  }
}

function tentarSpawnarMorcegoTipo(profundidadeAtual, modo) {
    const counts = contarMorcegosPorTipo();
    if (counts[modo] >= MORCEGO_CONFIG.MAX_MORCEGOS_POR_TIPO[modo]) return;
    const width = 32, height = 32;
    const x = gamePlayArea.x + Math.random() * (gamePlayArea.width - width);
    let y = getSpawnY(modo, height);
    if (modo === MorcegoModo.TRANSPORTADOR && y >= 0) {
        y = -height - 32;
    }
    
    if (modo === MorcegoModo.KAMIKAZE) {
        morcegos.push(createMorcego(x, y, profundidadeAtual, modo));
        return;
    }
    if (!isPosicaoSegura(x, y, width, height)) return;
    morcegos.push(createMorcego(x, y, profundidadeAtual, modo));
}

function spawnMorcegos(profundidadeAtual) {
    if (profundidadeAtual < MODOS_POR_PROFUNDIDADE[0].profundidadeMin) return;
    
    const faixaAtual = MODOS_POR_PROFUNDIDADE.find(faixa => 
        profundidadeAtual >= faixa.profundidadeMin && profundidadeAtual <= faixa.profundidadeMax
    );
    
    if (!faixaAtual) return;
    
    const modosPermitidos = faixaAtual.modos.map(m => m.tipo);
    
    if (modosPermitidos.includes(MorcegoModo.NORMAL) &&
        (typeof isGameOver !== 'undefined' && isGameOver) ||
        profundidadeAtual - lastSpawnDepth.NORMAL >= MORCEGO_CONFIG.SPAWN_INTERVAL.NORMAL
    ) {
        if (morcegos.length < MORCEGO_CONFIG.MAX_MORCEGOS) {
            if (Math.random() < ajustaChancePorEfigie(MORCEGO_CONFIG.SPAWN_CHANCE.NORMAL)) {
                tentarSpawnarMorcegoTipo(profundidadeAtual, MorcegoModo.NORMAL);
            }
        }
        lastSpawnDepth.NORMAL = profundidadeAtual;
    }
    
    if (modosPermitidos.includes(MorcegoModo.ONDULADO) &&
        (typeof isGameOver !== 'undefined' && isGameOver) ||
        profundidadeAtual - lastSpawnDepth.ONDULADO >= MORCEGO_CONFIG.SPAWN_INTERVAL.ONDULADO
    ) {
        if (morcegos.length < MORCEGO_CONFIG.MAX_MORCEGOS) {
            if (Math.random() < ajustaChancePorEfigie(MORCEGO_CONFIG.SPAWN_CHANCE.ONDULADO)) {
                tentarSpawnarMorcegoTipo(profundidadeAtual, MorcegoModo.ONDULADO);
            }
        }
        lastSpawnDepth.ONDULADO = profundidadeAtual;
    }
    
    if (modosPermitidos.includes(MorcegoModo.KAMIKAZE) &&
        profundidadeAtual - lastSpawnDepth.KAMIKAZE >= MORCEGO_CONFIG.SPAWN_INTERVAL.KAMIKAZE
    ) {
        if (morcegos.length < MORCEGO_CONFIG.MAX_MORCEGOS) {
            if (Math.random() < ajustaChancePorEfigie(MORCEGO_CONFIG.SPAWN_CHANCE.KAMIKAZE)) {
                tentarSpawnarMorcegoTipo(profundidadeAtual, MorcegoModo.KAMIKAZE);
            }
        }
        lastSpawnDepth.KAMIKAZE = profundidadeAtual;
    }
    
    if (modosPermitidos.includes(MorcegoModo.TRANSPORTADOR) &&
        profundidadeAtual - lastSpawnDepth.TRANSPORTADOR >= MORCEGO_CONFIG.SPAWN_INTERVAL.TRANSPORTADOR
    ) {
        if (morcegos.length < MORCEGO_CONFIG.MAX_MORCEGOS) {
            if (Math.random() < ajustaChancePorEfigie(MORCEGO_CONFIG.SPAWN_CHANCE.TRANSPORTADOR)) {
                tentarSpawnarMorcegoTipo(profundidadeAtual, MorcegoModo.TRANSPORTADOR);
            }
        }
        lastSpawnDepth.TRANSPORTADOR = profundidadeAtual;
    }
}

function isPosicaoSegura(x, y, width, height) {
    return isPosicaoSeguraPlataformas(x, y, width, height) && isPosicaoSeguraMorcegos(x, y, width, height);
}

function isPosicaoSeguraPlataformas(x, y, width, height) {
    for (const platform of plataformas) {
        // Considera a posição futura da plataforma se ela estiver se movendo
        const plataformaX = platform.velocityX ? platform.x + platform.velocityX : platform.x;
        const plataformaY = platform.velocityY ? platform.y + platform.velocityY : platform.y;

        const distanciaVertical = Math.abs(y - plataformaY);
        if (distanciaVertical < MORCEGO_CONFIG.MIN_DISTANCE_PLATFORM) return false;

        if (platform.isGrande) {
            const centroMorcego = x + width / 2;
            const centroPlataforma = plataformaX + platform.width / 2;
            const distanciaHorizontal = Math.abs(centroMorcego - centroPlataforma);
            if (distanciaHorizontal < MORCEGO_CONFIG.MIN_DISTANCE_HORIZONTAL) return false;
        }

        if (x < plataformaX + platform.width &&
            x + width > plataformaX &&
            y < plataformaY + platform.height &&
            y + height > plataformaY) return false;
    }
    return true;
}

function isPosicaoSeguraMorcegos(x, y, width, height) {
    for (const outroMorcego of morcegos) {
        
        if (outroMorcego.modo === MorcegoModo.KAMIKAZE || outroMorcego.modo === MorcegoModo.TRANSPORTADOR) continue;
        const zona = outroMorcego.zonaExclusao;
        if (zona && x < zona.x + zona.width &&
            x + width > zona.x &&
            y < zona.y + zona.height &&
            y + height > zona.y) return false;
    }
    return true;
}

function selecionarModoMorcego(profundidade) {
    const faixa = getFaixaModosPorProfundidade(profundidade);
    if (!faixa) return MorcegoModo.NORMAL;
    return sortearModoDaFaixa(faixa);
}

function criarAreaPatrulhaOndulado(y) {
    return {
        y: y - MORCEGO_CONFIG.ONDULADO.AREA_PATRULHA / 2 + 16,
        altura: MORCEGO_CONFIG.ONDULADO.AREA_PATRULHA
    };
}

function criarZonaExclusaoOndulado(y) {
    return {
        width: gamePlayArea.width,
        height: MORCEGO_CONFIG.ZONA_EXCLUSAO.HEIGHT,
        x: gamePlayArea.x,
        y: y - MORCEGO_CONFIG.ZONA_EXCLUSAO.HEIGHT / 2 + 16
    };
}

function criarZonaExclusaoNormal(y) {
    return {
        width: gamePlayArea.width,
        height: MORCEGO_CONFIG.ZONA_EXCLUSAO.HEIGHT,
        x: gamePlayArea.x,
        y: y - (MORCEGO_CONFIG.ZONA_EXCLUSAO.HEIGHT - 32) / 2
    };
}

function criarHitbox() {
    return {
        width: 32,
        height: 32,
        offsetX: 0,
        offsetY: 0
    };
}

function createMorcegoUnificado(x, y, modo) {
    
    let base = {
        x,
        y,
        width: 32,
        height: 32,
        modo,
        hitbox: criarHitbox(),
        direcaoOlhar: {x: 1, y: 0}
    };
    if (modo === MorcegoModo.ONDULADO) {
        return {
            ...base,
            velocityX: MORCEGO_CONFIG.VELOCIDADE_BASE * (Math.random() > 0.5 ? 1 : -1),
            tempoOndulacao: Math.random() * Math.PI * 2,
            velocidadeX: MORCEGO_CONFIG.ONDULADO.VELOCIDADE_X * (Math.random() > 0.5 ? 1 : -1),
            areaPatrulha: criarAreaPatrulhaOndulado(y),
            zonaExclusao: criarZonaExclusaoOndulado(y)
        };
    } else if (modo === MorcegoModo.KAMIKAZE) {
        const kamikazesAtuais = morcegos.filter(m => m.modo === MorcegoModo.KAMIKAZE);
        const idx = kamikazesAtuais.length;
        const raioBase = 2.2 * player.width;
        const raio = raioBase + idx * 40;
        const direcaoOrbita = idx % 2 === 0 ? 1 : -1;
        return {
            ...base,
            velocityX: 0,
            estado: 'SUBINDO',
            tempoEstado: 0,
            tempoAguardar: 40 + Math.random() * 30,
            tempoAlerta: 30,
            velocidadeRasante: 13,
            alvoRasante: null,
            zonaExclusao: null,
            yInicial: y,
            anguloOrbita: null,
            transicaoDestino: null,
            raioOrbita: raio,
            direcaoOrbita: direcaoOrbita
        };
    } else if (modo === MorcegoModo.TRANSPORTADOR) {
        const enemy = createEnemy();
        enemy.x = x + 4;
        enemy.y = y + 32;
        enemy.isDetached = false;
        enemy._transportado = true;
        return {
            ...base,
            velocityX: 0,
            tempoSobreJogador: 0,
            carregandoEnemy: true,
            enemy,
            direcaoOlhar: {x: 0, y: 1}
        };
    } else {
        
        return {
            ...base,
            velocityX: MORCEGO_CONFIG.VELOCIDADE_BASE * (Math.random() > 0.5 ? 1 : -1),
            tempoOndulacao: 0,
            velocidadeX: 0,
            areaPatrulha: null,
            zonaExclusao: criarZonaExclusaoNormal(y)
        };
    }
}

function criarAranhaTransportada(x, y) {
    return {
        x,
        y,
        width: 24,
        height: 24,
        velocityY: 0,
        ativaFisica: false
    };
}

function createMorcego(x, y, profundidadeAtual, modo) {
    return createMorcegoUnificado(x, y, modo);
}

function contarMorcegosPorTipo() {
  const counts = {
    NORMAL: 0,
    ONDULADO: 0,
    KAMIKAZE: 0,
    TRANSPORTADOR: 0
  };
  for (const m of morcegos) {
    if (counts[m.modo] !== undefined) counts[m.modo]++;
  }
  return counts;
}
