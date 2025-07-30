


const player = {
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

let depthPoints = 0; 


const characters = {
  'O Errante de Eldoria': {
    getData: () => ({
      ...player,
    })
  },
  'Kuroshi, o Ninja': {
    getData: () => ({
      ...player,
  
      maxDashes: 3, 
      currentDashes: 3, 
      dashRechargeTime: 2000, 
      lastDashRecharge: 0, 
      lastIndividualDash: 0, 
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