// ==========================
// ===== VARIÁVEIS DO PERSONAGEM =====
// ==========================
const player = {
  x: 0,
  y: 0,
  width: 50, // Tamanho visual do sprite
  height: 50, // Tamanho visual do sprite
  hitbox: { // Hitbox ajustada para o sprite do mago
    width: 28,    // Largura menor que considera apenas o corpo do mago
    height: 42,   // Altura maior para cobrir quase todo o sprite
    offsetX: 11,  // (50 - 28) / 2 para centralizar horizontalmente
    offsetY: 4    // Pequeno offset do topo para alinhar com o visual
  },
  speed: 1, // valor padrão original
  gravity: 0.7, // Reduced gravity for more floaty jumps
  velocityY: 0,
  jumpPower: -30, // Slightly reduced jump power to match new gravity
  isJumping: false,
  jumpCount: 0,
  maxJumps: 0, // valor padrão original
  facingRight: true, // direção que o jogador está olhando
};

let depthPoints = 0; // Pontos de profundidade (maior y já atingido pelo player)

// Suporte a múltiplos personagens jogáveis
const characters = {
  'O Errante de Eldoria': {
    getData: () => ({
      ...player,
    })
  },
  'Kuroshi, o Ninja': {
    getData: () => ({
      ...player,
  
      maxDashes: 3, // Número de dashes disponíveis
      currentDashes: 3, // Dashes atuais
      dashRechargeTime: 2000, // Tempo para recarregar um dash
      lastDashRecharge: 0, // Último tempo que recarregou um dash
      lastIndividualDash: 0, // Último momento que usou um dash
    })
  },
  'Roderick, o Cavaleiro': {
    getData: () => ({
      ...player,
    })
  },
  'Valthor, o Mago': {
    getData: () => ({
      ...player,

     
    })
  }
};

// Personagem ativo
let activeCharacter = 'O Errante de Eldoria';

// Stats globais que são compartilhados entre todos os personagens
const globalStats = {
  moneyplus: 250,  // Bonus de dinheiro base
  enemySpawnInterval: 100,  // Intervalo de spawn de inimigos base
};

// Estrutura para armazenar dados de itens por personagem
const characterData = {
  'O Errante de Eldoria': {
    purchases: {},  // armazena quantidade de compras de cada item
    stats: {
      speed: 1,
      maxJumps: 0,
      liveupgrade: 0,
      dashCooldownTime: 2000,
      dashExtraInvuln: 0,
    }
  },
  'Kuroshi, o Ninja': {
    purchases: {},
    stats: {
      speed: 5.5,
      maxJumps: 4,
      liveupgrade: 3,  
      dashCooldownTime: 1000,
      dashExtraInvuln: 0.5,
    }
  },
  'Roderick, o Cavaleiro': {
    purchases: {},
    stats: {
      speed: 4,
      maxJumps: 2,
      liveupgrade: 8,  
    }
  },
  'Valthor, o Mago': {
    purchases: {},
    stats: {
      speed: 4,  
      maxJumps: 3,  
      liveupgrade: 2,  
    }
  }
};

// Modifica a função setActiveCharacter para carregar os stats do personagem
function setActiveCharacter(nome) {
  if (characters[nome]) {
    const novo = characters[nome].getData();
    Object.assign(player, novo);
    activeCharacter = nome;
    
    // Troca para o sprite sheet correto do personagem
    if (typeof setCharacterSprite === 'function') {
      setCharacterSprite(nome);
    }
    
    // Carrega os stats específicos do personagem
    const charStats = characterData[nome].stats;
    
    // Aplica stats específicos do personagem
    Object.assign(player, charStats);
    
    // Aplica stats globais
    Object.assign(player, globalStats);

    // Inicializa vidas corretamente
    if (typeof live !== 'undefined' && typeof liveupgrade !== 'undefined') {
      if (nome === 'Valthor, o Mago') {
        liveupgrade = 2;
        live = 2;
      } else {
        liveupgrade = charStats.liveupgrade;
        live = liveupgrade;
      }
    }

    // Setup especial para Kuroshi, o Ninja
    if (nome === 'Kuroshi, o Ninja') {
      player.currentDashes = charStats.maxDashes;
      player.lastDashRecharge = performance.now();
      player.smokeBombActive = false;
      player.smokeBombCooldown = false;
      player.smokeBombTimer = 0;
    }
    
    // Reseta cooldowns do Roderick, o Cavaleiro
    if (nome === 'Roderick, o Cavaleiro') {
      shieldActive = false;
      shieldCooldown = false;
      voidResurrectionAvailable = true;
    }
  }
}

// Ao iniciar o jogo, sempre garante que o personagem ativo está correto
setActiveCharacter(activeCharacter);