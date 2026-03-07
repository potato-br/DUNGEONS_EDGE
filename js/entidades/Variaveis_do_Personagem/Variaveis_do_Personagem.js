


// Template describing default player properties (immutable template)
const playerTemplate = {
  x: 0,
  y: 0,
  width: 50, 
  height: 50, 
  hitbox: { 
    width: 28,    
    height: 42,   
    offsetX: 11,  
    offsetY: 4    
  },
  speed: 1, 
  gravity: 0.7, 
  velocityY: 0,
  jumpPower: -30, 
  isJumping: false,
  jumpCount: 0,
  maxJumps: 0, 
  facingRight: true, 
};

// factory to create a mutable player instance from the template
function createPlayerInstance() {
  // deep clone to avoid shared nested objects like hitbox
  return JSON.parse(JSON.stringify(playerTemplate));
}

// Mutable player instance used at runtime
let player = createPlayerInstance();

let depthPoints = 0; 


const characters = {
  'O Errante de Eldoria': {
    getData: () => ({
      ...playerTemplate,
    })
  },
  'Kuroshi, o Ninja': {
    getData: () => ({
      ...playerTemplate,
    })
  },
  'Roderick, o Cavaleiro': {
    getData: () => ({
      ...playerTemplate,
    })
  },
  'Valthor, o Mago': {
    getData: () => ({
      ...playerTemplate,

    })
  }
};


let activeCharacter = 'O Errante de Eldoria';


const globalStats = {
  moneyplus: 250,  
  enemySpawnInterval: 100,  
};


const characterData = {
  'O Errante de Eldoria': {
    purchases: {},  
    stats: {
      speed: 1,
      maxJumps: 0,
      liveupgrade: 0,
  dashRechargeTime: 4300,
      dashExtraInvuln: 1000,
    }
  },
  'Kuroshi, o Ninja': {
    purchases: {},
    stats: {
    speed: 5.8,
    maxJumps: 4,
    liveupgrade: 3,
    maxDashes: 3,
    dashRechargeTime: 700,
    dashExtraInvuln: 0.5,
    }
  },
  'Roderick, o Cavaleiro': {
    purchases: {},
    stats: {
      speed: 4.6,
      maxJumps: 2,
      liveupgrade: 8,  
    }
  },
  'Valthor, o Mago': {
    purchases: {},
    stats: {
      speed: 5,  
      maxJumps: 3,  
      liveupgrade: 2,  
    }
  }
};


function setActiveCharacter(nome) {
  if (characters[nome]) {
    const novo = characters[nome].getData();
    Object.assign(player, novo);
    activeCharacter = nome;
    
    
    if (typeof setCharacterSprite === 'function') {
      setCharacterSprite(nome);
    }
    
    
    const charStats = characterData[nome].stats;
    
    // ========== CORREÇÃO: Primeiro aplica globalStats, depois as stats do personagem ==========
    // Isso garante que as stats específicas do personagem sobrescrevem as genéricas
    Object.assign(player, globalStats);
    Object.assign(player, charStats);
    
    // Ensure dash-related runtime fields come from the character's stats
    player.dashRechargeTime = (charStats && typeof charStats.dashRechargeTime !== 'undefined') ? charStats.dashRechargeTime : (player.dashRechargeTime || 1000);
    player.dashExtraInvuln = (charStats && typeof charStats.dashExtraInvuln !== 'undefined') ? charStats.dashExtraInvuln : (player.dashExtraInvuln || 0);
    
    // ========== CORREÇÃO: Garantir que maxDashes e currentDashes sejam configurados ==========
    // Se o personagem tem maxDashes definido (Ninja), usa esse valor
    if (charStats && typeof charStats.maxDashes !== 'undefined') {
      player.maxDashes = charStats.maxDashes;
      player.currentDashes = charStats.maxDashes;
      player.lastDashRecharge = performance.now();
    } else {
      // Se não tem maxDashes, garante que não haja dashes (Mago, Cavaleiro, Errante)
      player.maxDashes = 0;
      player.currentDashes = 0;
    }

    
    // ========== CORREÇÃO: Resetar vidas corretamente ao trocar de personagem ==========
    const novaVida = (nome === 'Valthor, o Mago') ? 2 : charStats.liveupgrade;
    // Tenta encontrar as variáveis globais em diferentes escopos
    if (typeof window !== 'undefined') {
      if (typeof window.liveupgrade !== 'undefined') window.liveupgrade = novaVida;
      if (typeof window.live !== 'undefined') window.live = novaVida;
    }
    // Também tenta no escopo global (para scripts que usam var/let no escopo global)
    try {
      if (typeof liveupgrade !== 'undefined') liveupgrade = novaVida;
      if (typeof live !== 'undefined') live = novaVida;
    } catch (e) {}
    // Atualiza diretamente as variáveis se existirem no escopo global
    if (typeof globalThis !== 'undefined') {
      if (typeof globalThis.liveupgrade !== 'undefined') globalThis.liveupgrade = novaVida;
      if (typeof globalThis.live !== 'undefined') globalThis.live = novaVida;
    }

    // Ensure UI shows correct lives immediately when changing character
    if (typeof previousLive !== 'undefined') previousLive = novaVida;
    if (typeof animatingHearts !== 'undefined') animatingHearts = [];

    
    if (nome === 'Kuroshi, o Ninja') {
      // Garante que o Ninja tenha os dashes configurados corretamente
      player.maxDashes = characterData[nome].stats.maxDashes || 3;
      player.currentDashes = player.maxDashes;
      player.lastDashRecharge = performance.now();
      player.smokeBombActive = false;
      player.smokeBombCooldown = false;
      player.smokeBombTimer = 0;
    }
    
    
    
    if (nome === 'Roderick, o Cavaleiro' && typeof CAVALEIRO !== 'undefined') {
      CAVALEIRO.shieldActive = false;
      CAVALEIRO.shieldCooldown = false;
      CAVALEIRO.voidResurrectionAvailable = true;
    }
    
    // ========== CORREÇÃO: Resetar estados do DASH ao trocar de personagem ==========
    if (typeof DASH !== 'undefined') {
      DASH.cooldown = false;
      DASH.isDashing = false;
      DASH.isInvulnerable = false;
      DASH.lastDashTime = 0;
      DASH.trailPoints = [];
      DASH.trailStack = [];
      DASH.startPoint = null;
    }
    
    // Resetar estado do Ninja se não for o Ninja
    if (nome !== 'Kuroshi, o Ninja' && typeof NINJA !== 'undefined') {
      NINJA.smokeBombActive = false;
      NINJA.smokeBombCooldown = false;
      NINJA.smokeBombTimer = 0;
    }
    
    // Resetar estado do Cavaleiro se não for o Cavaleiro
    if (nome !== 'Roderick, o Cavaleiro' && typeof CAVALEIRO !== 'undefined') {
      CAVALEIRO.shieldActive = false;
      CAVALEIRO.shieldCooldown = false;
      CAVALEIRO.voidResurrectionAvailable = true;
    }
    
    // Resetar estado do Mago se não for o Mago
    if (nome !== 'Valthor, o Mago' && typeof MAGO !== 'undefined') {
      MAGO.magicBlastActive = false;
      MAGO.magicBlastCooldown = false;
    }
  }
}


setActiveCharacter(activeCharacter);