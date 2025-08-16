


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
  dashRechargeTime: 2000,
      dashExtraInvuln: 0,
    }
  },
  'Kuroshi, o Ninja': {
    purchases: {},
    stats: {
    speed: 5.8,
    maxJumps: 4,
    liveupgrade: 3,
    maxDashes: 3,
    dashRechargeTime: 1000,
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
    
    
    Object.assign(player, charStats);
    
    
    Object.assign(player, globalStats);

    
    if (typeof live !== 'undefined' && typeof liveupgrade !== 'undefined') {
      if (nome === 'Valthor, o Mago') {
        liveupgrade = 2;
        live = 2;
      } else {
        liveupgrade = charStats.liveupgrade;
        live = liveupgrade;
      }
    }

  // Ensure UI shows correct lives immediately when changing character
  if (typeof previousLive !== 'undefined') previousLive = live;
  if (typeof animatingHearts !== 'undefined') animatingHearts = [];

    
    if (nome === 'Kuroshi, o Ninja') {
      player.currentDashes = charStats.maxDashes;
      player.lastDashRecharge = performance.now();
      player.smokeBombActive = false;
      player.smokeBombCooldown = false;
      player.smokeBombTimer = 0;
    }
    
    
    if (nome === 'Roderick, o Cavaleiro') {
      shieldActive = false;
      shieldCooldown = false;
      voidResurrectionAvailable = true;
    }
  }
}


setActiveCharacter(activeCharacter);