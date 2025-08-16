let MORCEGO_ZOOM = 2; 
let MORCEGO_NORMAL_DRAW_OFFSET_X = -6;
let MORCEGO_NORMAL_DRAW_OFFSET_Y = -8;
let MORCEGO_ONDULADO_DRAW_OFFSET_X = -5;
let MORCEGO_ONDULADO_DRAW_OFFSET_Y = -8;
const morcegos = [];
const morcegoSprite = new Image();
morcegoSprite.src = './images/personagens e inimigos/morcego/mugerco1.png';

const MorcegoModo = {
    NORMAL: 'NORMAL',
    ONDULADO: 'ONDULADO',
    KAMIKAZE: 'KAMIKAZE',
    TRANSPORTADOR: 'TRANSPORTADOR'
};

class Hitbox {
    constructor(width, height, offsetX = 0, offsetY = 0) {
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }

    getWorldBounds(entity) {
        return {
            x: entity.x + this.offsetX,
            y: entity.y + this.offsetY,
            width: this.width,
            height: this.height
        };
    }

    intersects(entityA, entityB) {
        const boundsA = this.getWorldBounds(entityA);
        const boundsB = this.getWorldBounds(entityB);
        
        return (
            boundsA.x < boundsB.x + boundsB.width &&
            boundsA.x + boundsA.width > boundsB.x &&
            boundsA.y < boundsB.y + boundsB.height &&
            boundsA.y + boundsA.height > boundsB.y
        );
    }
}

const CollisionSystem = {
    checkMorcegoCollisions(morcego, index) {
        
        if (morcego.modo === MorcegoModo.TRANSPORTADOR && morcego.carregandoEnemy) return false;
        if (morcego.modo === MorcegoModo.KAMIKAZE && morcego.estado !== MorcegoEstado.RASANTE) return false;

        if (!morcego.hitbox.intersects(morcego, player)) return false;

        
        
        
        
        
        
        const stompResult = this.checkCavaleiroStomp(morcego);
        
        if (stompResult) {
            
            this.destroyMorcego(morcego);
            if (typeof player.jumpCount !== 'undefined') player.jumpCount = 0;
            return true;
        }

        
        if (isRespawning || (typeof DASH !== 'undefined' && DASH.isInvulnerable)) return false;

        if (morcego.modo === MorcegoModo.KAMIKAZE) {
            morcego.estado = MorcegoEstado.MORRENDO;
        }

        applyDanoJogador();
        return true;
    },

    checkCavaleiroStomp(morcego) {
        
        
        
        
        
        const result = (
            activeCharacter === 'Roderick, o Cavaleiro' &&
            player.velocityY > 0 &&
            Math.abs((player.y + player.height - player.velocityY) - morcego.y) < 25
        );
        
        return result;
    },

    checkPlatformCollisions(morcego) {
        for (const platform of plataformas) {
            if (morcego.hitbox.intersects(morcego, platform)) {
                morcego.velocityX *= -1;
                return true;
            }
        }
        return false;
    },

    destroyMorcego(morcego) {
        const idx = morcegos.indexOf(morcego);
        if (idx !== -1) {
            if (!morcego._particulasCriadas) {
                createParticles(
                    morcego.x + morcego.width/2,
                    morcego.y + morcego.height/2,
                    16,
                    'rgba(180,0,180,0.8)'
                );
                morcego._particulasCriadas = true;
            }
            morcegos.splice(idx, 1);
        }
    }
};

const MorcegoEstado = {
  SUBINDO:          'subindo',
  TRANSICAO_ORBITA: 'transicaoOrbita',
  AGUARDANDO:       'aguardando',
  alerta:           'alerta',
  RASANTE:          'rasante',
  MORRENDO:         'morrendo'
};

function atualizarSpawnMorcegos(profundidadeAtual) {
    const tempoAtual = performance.now();
    
    
    if (tempoAtual - SpawnSystem.ultimoSpawnTime < MORCEGO_CONFIG.SPAWN.INTERVALO) {
        return;
    }

    
    if (Math.random() > MORCEGO_CONFIG.SPAWN.CHANCE) {
        return;
    }

    
    const tiposDisponiveis = Object.values(MorcegoModo).filter(tipo => {
        
        if ((tipo === MorcegoModo.KAMIKAZE || tipo === MorcegoModo.TRANSPORTADOR) && (gameState === 'gameover')) {
            return false;
        }
        
        if (typeof MAGO !== 'undefined' && MAGO.magicBlastActive) {
            return false;
        }
        const now = performance.now();

         if (now < lastEnemyAllowedTime) return;

        return SpawnSystem.podeSpawnarTipo(tipo, profundidadeAtual);
    });

    if (tiposDisponiveis.length === 0) return;

    
    const tipoEscolhido = tiposDisponiveis[Math.floor(Math.random() * tiposDisponiveis.length)];
    
    
    const posicao = SpawnSystem.getPosicoesSpawn(tipoEscolhido);
    
    
    let tentativas = 0;
    const maxTentativas = 5;
    let posicaoValida = false;
    let novoMorcego;

    while (!posicaoValida && tentativas < maxTentativas) {
        
        if (tentativas > 0) {
            posicao.x = gamePlayArea.x + Math.random() * (gamePlayArea.width - 32);
        }

        
        novoMorcego = createMorcegoUnificado(posicao.x, posicao.y, tipoEscolhido);
        
        
        if (SpawnSystem.verificarZonaExclusao(novoMorcego)) {
            posicaoValida = true;
            break;
        }

        tentativas++;
    }

    
    if (posicaoValida) {
        morcegos.push(novoMorcego);
        SpawnSystem.ultimoSpawnTime = tempoAtual;
    }
}

const DebugRenderer = {
    options: {
        showHitboxes: false,
        showPatrolAreas: false,
        showZonaExclusao: false,
        showMovementVectors: false,
        showOrbitRadius: false
    },

    render(morcego) {
        if (!window.spriteDebug) return;

        this.setDefaultStyle();
        
        if (this.options.showHitboxes) {
            this.drawHitbox(morcego);
        }
        
        if (this.options.showZonaExclusao && morcego.zonaExclusao) {
            this.drawZonaExclusao(morcego);
        }
        
        if (this.options.showPatrolAreas && morcego.modo === MorcegoModo.ONDULADO) {
            this.drawPatrolArea(morcego);
        }
        
        if (this.options.showOrbitRadius && morcego.modo === MorcegoModo.KAMIKAZE) {
            this.drawOrbitRadius(morcego);
        }
        
        if (this.options.showMovementVectors && morcego.direcaoOlhar) {
            this.drawMovementVector(morcego);
        }

        if (morcego.alvoRasante && morcego.modo === MorcegoModo.KAMIKAZE) {
            this.drawRasantePath(morcego);
        }
    },

    setDefaultStyle() {
        ctx.save();
        ctx.lineWidth = 2;
    },

    drawHitbox(morcego) {
        ctx.strokeStyle = 'lime';
        ctx.strokeRect(
            morcego.x + morcego.hitbox.offsetX,
            morcego.y + morcego.hitbox.offsetY,
            morcego.hitbox.width,
            morcego.hitbox.height
        );
    },

    drawZonaExclusao(morcego) {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.strokeRect(
            morcego.zonaExclusao.x,
            morcego.zonaExclusao.y,
            morcego.zonaExclusao.width,
            morcego.zonaExclusao.height
        );
    },

    drawPatrolArea(morcego) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.strokeRect(
            gamePlayArea.x,
            morcego.areaPatrulha.y,
            gamePlayArea.width,
            morcego.areaPatrulha.altura
        );
    },

    drawOrbitRadius(morcego) {
        if (typeof player === 'undefined') return;
        
        ctx.beginPath();
        ctx.arc(
            player.x + player.width/2,
            player.y + player.height/2,
            player.width * 2.2,
            0,
            2 * Math.PI
        );
        ctx.strokeStyle = 'rgba(0,0,255,0.3)';
        ctx.stroke();
    },

    drawMovementVector(morcego) {
        ctx.strokeStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(
            morcego.x + morcego.width/2,
            morcego.y + morcego.height/2
        );
        ctx.lineTo(
            morcego.x + morcego.width/2 + morcego.direcaoOlhar.x * 24,
            morcego.y + morcego.height/2 + morcego.direcaoOlhar.y * 24
        );
        ctx.stroke();
    },

    drawRasantePath(morcego) {
        ctx.beginPath();
        ctx.moveTo(
            morcego.x + morcego.width/2,
            morcego.y + morcego.height/2
        );
        ctx.lineTo(
            morcego.alvoRasante.x + morcego.width/2,
            morcego.alvoRasante.y + morcego.height/2
        );
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.7)';
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
    },

    end() {
        ctx.restore();
    }
};

const MORCEGO_CONFIG = {
    VELOCIDADE_BASE: 4,
    ZONA_EXCLUSAO: {
        get WIDTH() { return gamePlayArea.width; },
        HEIGHT: 150
    },
    ONDULADO: {
        AMPLITUDE_Y: 50,
        VELOCIDADE: 0.05,
        VELOCIDADE_X: 2,
        AREA_PATRULHA: 100
    },
     SPAWN: {
       PROFUNDIDADE: {
            NORMAL: 10000,
            ONDULADO: 15000,
            KAMIKAZE: 30000,
            TRANSPORTADOR: 35000
        },
        LIMITE_POR_TIPO: {
            NORMAL: 2,
            ONDULADO: 3,
            KAMIKAZE: 1,
            TRANSPORTADOR: 2
        },
        INTERVALO: 2000, 
        CHANCE: 0.5 
    }
};

const SpawnSystem = {
    filaSpawn: [],
    ultimoSpawnTime: 0,

    inicializar() {
        this.filaSpawn = [];
        this.ultimoSpawnTime = 0;
    },

    getPosicoesSpawn(tipo) {
        const posicoes = {
            x: 0,
            y: 0
        };

        switch(tipo) {
            case MorcegoModo.NORMAL:
                
                posicoes.x = Math.random() < 0.5 ? 
                    gamePlayArea.x : 
                    gamePlayArea.x + gamePlayArea.width - 32;
                posicoes.y = screenHeight + 50; 
                break;

            case MorcegoModo.ONDULADO:
                
                posicoes.x = gamePlayArea.x + Math.random() * (gamePlayArea.width - 32);
                posicoes.y = screenHeight + 50;
                break;

            case MorcegoModo.KAMIKAZE:
                
                posicoes.x = gamePlayArea.x + Math.random() * (gamePlayArea.width - 32);
                posicoes.y = screenHeight + 50; 
                break;

            case MorcegoModo.TRANSPORTADOR:
                
                posicoes.x = gamePlayArea.x + Math.random() * (gamePlayArea.width - 32);
                posicoes.y = -100; 
                break;
        }

        return posicoes;
    },

    podeSpawnarTipo(tipo, profundidade) {
        
        if (profundidade < MORCEGO_CONFIG.SPAWN.PROFUNDIDADE[tipo]) {
            return false;
        }

        
        const countTipo = morcegos.filter(m => m.modo === tipo).length;
        return countTipo < MORCEGO_CONFIG.SPAWN.LIMITE_POR_TIPO[tipo];
    },

    verificarZonaExclusao(morcego) {
        
        if (morcego.modo === MorcegoModo.KAMIKAZE || morcego.modo === MorcegoModo.TRANSPORTADOR) {
            return true;
        }

        
        for (const platform of plataformas) {
            const zona = morcego.zonaExclusao;
            if (zona && 
                platform.x < zona.x + zona.width &&
                platform.x + platform.width > zona.x &&
                platform.y < zona.y + zona.height &&
                platform.y + platform.height > zona.y) {
                return false;
            }
        }

        
        for (const outroMorcego of morcegos) {
            if (outroMorcego === morcego) continue;
            
            
            if (!outroMorcego.zonaExclusao) continue;

            
            const zona1 = morcego.zonaExclusao;
            const zona2 = outroMorcego.zonaExclusao;

            if (zona1 && zona2) {
                
                if (!(zona1.x + zona1.width < zona2.x ||
                    zona1.x > zona2.x + zona2.width ||
                    zona1.y + zona1.height < zona2.y ||
                    zona1.y > zona2.y + zona2.height)) {
                    return false;
                }
            }

            
            if (zona2 && 
                morcego.x < zona2.x + zona2.width &&
                morcego.x + morcego.width > zona2.x &&
                morcego.y < zona2.y + zona2.height &&
                morcego.y + morcego.height > zona2.y) {
                return false;
            }
        }

        return true;
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




function updateMorcegoOndulado(morcego) {
    morcego.tempoOndulacao += MORCEGO_CONFIG.ONDULADO.VELOCIDADE;
    
    
    morcego.areaPatrulha.y -= gameSpeed;
    morcego.zonaExclusao.y -= gameSpeed;
    
    
    morcego.x += morcego.velocidadeX;
    
    
    if (morcego.x <= gamePlayArea.x) {
        morcego.x = gamePlayArea.x + 1;
        morcego.velocidadeX = Math.abs(morcego.velocidadeX);
    } else if (morcego.x + morcego.width >= gamePlayArea.x + gamePlayArea.width) {
        morcego.x = gamePlayArea.x + gamePlayArea.width - morcego.width - 1;
        morcego.velocidadeX = -Math.abs(morcego.velocidadeX);
    }
    
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
    
    
    if (morcego.x <= gamePlayArea.x) {
        morcego.x = gamePlayArea.x + 1;
        morcego.velocityX = Math.abs(morcego.velocityX);
    } else if (morcego.x + morcego.width >= gamePlayArea.x + gamePlayArea.width) {
        morcego.x = gamePlayArea.x + gamePlayArea.width - morcego.width - 1;
        morcego.velocityX = -Math.abs(morcego.velocityX);
    }

    
    morcego.y -= gameSpeed; 
    morcego.zonaExclusao.y -= gameSpeed;
    
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
    
    const MAX_MOVE_PER_FRAME = 4; 
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
            
            morcego.modo   = MorcegoModo.KAMIKAZE;
            morcego.estado = MorcegoEstado.SUBINDO;
            morcego.timerEstado = 0;
            morcego.raioOrbita = 2.2 * player.width;
            morcego.direcaoOrbita = Math.random() < 0.5 ? 1 : -1;
            morcego.anguloOrbita = Math.PI;
            morcego.transicaoDestino = null;
            morcego.yInicial = morcego.y;
            morcego.tempoAguardar = 120 + Math.random() * 60;
            morcego.tempoAlerta = 45 + Math.random() * 30;
            morcego.velocidadeRasante = 8 + Math.random() * 3;
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

        
        CollisionSystem.checkMorcegoCollisions(morcego, i);

        
        if (morcego.y > screenHeight + 150) {
            morcegos.splice(i, 1);
            continue;
        }
        
        
        if (morcego.y < -150) {
            morcegos.splice(i, 1);
            continue;
        }
        for (const platform of plataformas) {
            if (morcego.hitbox.intersects(morcego, platform)) {
                morcego.velocityX *= -1;
                break;
            }
        }
    }
}

const estadoKamikaze = {
    subindo(morcego) {
    
    const velocidadeSubida = 3;
    morcego.y -= velocidadeSubida;
        
        
        if (morcego.y <= player.y) {
            const cx = player.x + player.width/2;
            const cy = player.y + player.height/2;
            const raio = morcego.raioOrbita || player.width * 2.2;
            morcego.anguloOrbita = -Math.PI/2;
            morcego.transicaoDestino = {
                x: cx + Math.cos(morcego.anguloOrbita) * raio - morcego.width/2,
                y: cy + Math.sin(morcego.anguloOrbita) * raio - morcego.height/2
            };
            this.mudarEstado(morcego, MorcegoEstado.TRANSICAO_ORBITA);
        }
        morcego.direcaoOlhar = {x: 0, y: -1}; 
    },

    transicaoOrbita(morcego) {
        const cx = player.x + player.width/2;
        const cy = player.y + player.height/2;
        const raio = morcego.raioOrbita || player.width * 2.2;
        
        
        morcego.transicaoDestino = {
            x: cx + Math.cos(morcego.anguloOrbita) * raio - morcego.width/2,
            y: cy + Math.sin(morcego.anguloOrbita) * raio - morcego.height/2
        };

        const tx = morcego.transicaoDestino.x - morcego.x;
        const ty = morcego.transicaoDestino.y - morcego.y;
        const dist = Math.sqrt(tx*tx + ty*ty);
    let speed = 9;

        if (dist < speed) {
            morcego.x = morcego.transicaoDestino.x;
            morcego.y = morcego.transicaoDestino.y;
            morcego.tempoEstado = 0;
            this.mudarEstado(morcego, MorcegoEstado.AGUARDANDO);
        } else {
            morcego.x += (tx/dist) * speed;
            morcego.y += (ty/dist) * speed;
            morcego.direcaoOlhar = {x: tx/dist, y: ty/dist};
        }
    },

    aguardando(morcego) {
        morcego.tempoEstado++;
        
        const raio = morcego.raioOrbita || player.width * 2.2;
        const direcao = morcego.direcaoOrbita || 1;
    let angSpeed = 0.03 * direcao;
    morcego.anguloOrbita += angSpeed;

        
        const cx = player.x + player.width/2;
        const cy = player.y + player.height/2;
        morcego.x = cx + Math.cos(morcego.anguloOrbita) * raio - morcego.width/2;
        morcego.y = cy + Math.sin(morcego.anguloOrbita) * raio - morcego.height/2;
        
        
        morcego.direcaoOlhar = {
            x: -Math.sin(morcego.anguloOrbita) * direcao, 
            y: Math.cos(morcego.anguloOrbita) * direcao
        };

        
        if (morcego.tempoEstado > morcego.tempoAguardar) {
            
            const dentroArea = (
                morcego.x + morcego.width > gamePlayArea.x &&
                morcego.x < gamePlayArea.x + gamePlayArea.width &&
                morcego.y + morcego.height > 0 &&
                morcego.y < screenHeight
            );
            if (dentroArea) {
                morcego.alvoRasante = {
                    x: cx - morcego.width/2,
                    y: cy - morcego.height/2
                };
                this.mudarEstado(morcego, MorcegoEstado.alerta);
            } else {
                
                morcego.tempoAguardar += 30; 
            }
        }
    },

    alerta(morcego) {
        morcego.tempoEstado++;
        
        
        
        if (!morcego._rasantePreparado) {
            
            const cx = player.x + player.width/2;
            const cy = player.y + player.height/2;
            morcego.alvoRasante = {
                x: cx - morcego.width/2,
                y: cy - morcego.height/2
            };
            
            const dx = morcego.alvoRasante.x - morcego.x;
            const dy = morcego.alvoRasante.y - morcego.y;
            const dist = Math.sqrt(dx*dx + dy*dy) || 1;
            morcego.direcaoOlhar = {x: dx/dist, y: dy/dist};
            morcego._rasanteDir = {x: dx/dist, y: dy/dist};
            morcego._rasantePreparado = true;
        }
        
        if (morcego.tempoEstado > morcego.tempoAlerta) {
            this.mudarEstado(morcego, MorcegoEstado.RASANTE);
        }
    },

    rasante(morcego, index) {
        if (!morcego.alvoRasante) {
            this.mudarEstado(morcego, MorcegoEstado.MORRENDO);
            return;
        }

        
        morcego.alvoRasante = {
            x: player.x + player.width/2 - morcego.width/2,
            y: player.y + player.height/2 - morcego.height/2
        };

        if (!morcego._rasanteDir) {
            const dx = morcego.alvoRasante.x - morcego.x;
            const dy = morcego.alvoRasante.y - morcego.y;
            const dist = Math.sqrt(dx*dx + dy*dy) || 1;
            morcego._rasanteDir = { x: dx/dist, y: dy/dist };
        }

    let move = Math.min(morcego.velocidadeRasante, 12);
    morcego.x += morcego._rasanteDir.x * move;
    morcego.y += morcego._rasanteDir.y * move;

        if (this.estaForaDaArea(morcego)) {
            this.mudarEstado(morcego, MorcegoEstado.MORRENDO);
            return;
        }

        CollisionSystem.checkMorcegoCollisions(morcego, index);

        morcego.direcaoOlhar = morcego._rasanteDir;
    },

    morrendo(morcego) {
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
    },

    
    mudarEstado(morcego, novoEstado) {
        morcego.estado = novoEstado;
        morcego.tempoEstado = 0;
    },

    estaForaDaArea(morcego) {
        return (
            morcego.x + morcego.width < gamePlayArea.x ||
            morcego.x > gamePlayArea.x + gamePlayArea.width ||
            morcego.y + morcego.height < 0 ||
            morcego.y > screenHeight
        );
    },

    reposicionarParaRasante(morcego) {
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
        
        this.mudarEstado(morcego, MorcegoEstado.RASANTE);
    }
};

function updateMorcegoKamikaze(morcego, index) {
    const estadoAtual = morcego.estado;
    if (estadoKamikaze[estadoAtual]) {
        estadoKamikaze[estadoAtual](morcego, index);
    }
}

function checkMorcegoCollision() {
    if (isRespawning || (typeof DASH !== 'undefined' && DASH.isInvulnerable)) return;
    for (let i = morcegos.length - 1; i >= 0; i--) {
        if (CollisionSystem.checkMorcegoCollisions(morcegos[i], i)) {
            break;
        }
    }
}

function applyDanoJogador() {
    if (isRespawning || (typeof DASH !== 'undefined' && DASH.isInvulnerable) || (typeof DASH !== 'undefined' && DASH.isDashing)) return;

    if (activeCharacter === 'Valthor, o Mago') {
         live--;
          if (live < 0) {
            gameOver();
          } else {
            enemies.length = 0;
            morcegos.length = 0; 
            lastEnemyAllowedTime = performance.now() + 8000;
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
        
        return;
      }
  
  if (activeCharacter === 'Kuroshi, o Ninja') {
         ninjasmokebomb();
      if (ninjasmokebomb() === true) {
        live--;
        if (live < 0) {
          gameOver();
        } else {
          aplicarInvulnerabilidade(1000, true);
        }
      }
    
    return;
  }
   
   live--;
   
   if (live < 0 ) {
       gameOver();
   } else {
     aplicarInvulnerabilidade(1200, true);
       
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
  
  if (morcego.modo === MorcegoModo.KAMIKAZE && morcego.estado === 'alerta') {
    drawExclamacaoPixelArt(
      morcego.x + morcego.width/2,
      morcego.y - 10
    );
  }
  
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
    ctx.fillStyle = '#FFD700'; 
    ctx.fillRect(cx-2, cy-12, 4, 8); 
    ctx.beginPath();
    ctx.arc(cx, cy-2, 2, 0, 2*Math.PI);
    ctx.fill(); 
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
    DebugRenderer.options = {
        showHitboxes: true,
        showPatrolAreas: true,
        showZonaExclusao: true,
        showMovementVectors: true,
        showOrbitRadius: true
    };
    
    DebugRenderer.render(morcego);
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
    return new Hitbox(32, 32, 0, 0);
}

function criarMorcegoBase(x, y, modo) {
    return {
        x,
        y,
        width: 32,
        height: 32,
        modo,
        hitbox: criarHitbox(),
        direcaoOlhar: {x: 1, y: 0}
    };
}

function criarMorcegoNormal(x, y) {
    return {
        ...criarMorcegoBase(x, y, MorcegoModo.NORMAL),
        velocityX: MORCEGO_CONFIG.VELOCIDADE_BASE * (Math.random() > 0.5 ? 1 : -1),
        tempoOndulacao: 0,
        velocidadeX: 0,
        areaPatrulha: null,
        zonaExclusao: criarZonaExclusaoNormal(y)
    };
}

function criarMorcegoOndulado(x, y) {
    return {
        ...criarMorcegoBase(x, y, MorcegoModo.ONDULADO),
        velocityX: MORCEGO_CONFIG.VELOCIDADE_BASE * (Math.random() > 0.5 ? 1 : -1),
        tempoOndulacao: Math.random() * Math.PI * 2,
        velocidadeX: MORCEGO_CONFIG.ONDULADO.VELOCIDADE_X * (Math.random() > 0.5 ? 1 : -1),
        areaPatrulha: criarAreaPatrulhaOndulado(y),
        zonaExclusao: criarZonaExclusaoOndulado(y)
    };
}

function criarMorcegoKamikaze(x, y) {
    const kamikazesAtuais = morcegos.filter(m => m.modo === MorcegoModo.KAMIKAZE);
    const idx = kamikazesAtuais.length;
    const raioBase = 2.2 * player.width;
    const raio = raioBase + idx * 40;
    const direcaoOrbita = idx % 2 === 0 ? 1 : -1;

    return {
        ...criarMorcegoBase(x, y, MorcegoModo.KAMIKAZE),
        velocityX: 0,
        estado: MorcegoEstado.SUBINDO,
        tempoEstado: 0,
        tempoAguardar: 120 + Math.random() * 60,
        tempoAlerta: 45 + Math.random() * 30,
        velocidadeRasante: 8 + Math.random() * 3,
        alvoRasante: null,
        zonaExclusao: null,
        yInicial: y,
        anguloOrbita: Math.PI,
        transicaoDestino: null,
        raioOrbita: raio,
        direcaoOrbita: direcaoOrbita,
        _rasanteDir: null
    };
}

function criarMorcegoTransportador(x, y) {
    const enemy = createEnemy();
    enemy.x = x + 4;
    enemy.y = y + 32;
    enemy.isDetached = false;
    enemy._transportado = true;

    return {
        ...criarMorcegoBase(x, y, MorcegoModo.TRANSPORTADOR),
        velocityX: 0,
        tempoSobreJogador: 0,
        carregandoEnemy: true,
        enemy,
        direcaoOlhar: {x: 0, y: 1}
    };
}

function createMorcegoUnificado(x, y, modo) {
    switch (modo) {
        case MorcegoModo.ONDULADO:
            return criarMorcegoOndulado(x, y);
        case MorcegoModo.KAMIKAZE:
            return criarMorcegoKamikaze(x, y);
        case MorcegoModo.TRANSPORTADOR:
            return criarMorcegoTransportador(x, y);
        default:
            return criarMorcegoNormal(x, y);
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


