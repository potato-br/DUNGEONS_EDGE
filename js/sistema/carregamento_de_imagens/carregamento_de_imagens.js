



const plataformaNormalImg = new Image();
plataformaNormalImg.src = "./images/plataformas/plataforamas normais/plataformanormal.PNG";

const plataformaInicialImg = new Image();
plataformaInicialImg.src = "./images/plataformas/plataformas variadas/plataformainicial 1.png";

const plataformaGrandeImg = new Image();
plataformaGrandeImg.src = "./images/plataformas/plataforma grandes/plataformagrande.png";

const plataformaGeloImg = new Image();
plataformaGeloImg.src = "./images/plataformas/plataforamas normais/plataformadegelo.png";

const plataformaGeloGrandeImg = new Image();
plataformaGeloGrandeImg.src = "./images/plataformas/plataforma grandes/plataformadegelogrande.png";

const plataformaMovelImg = new Image();
plataformaMovelImg.src = "./images/plataformas/plataforamas normais/plataformamovel.png";

const plataformaquebravelImg = new Image();
plataformaquebravelImg.src = "./images/plataformas/plataforamas normais/plataformaquebravel.png";

const plataformaquebravelgrandeImg = new Image();
plataformaquebravelgrandeImg.src = "./images/plataformas/plataforma grandes/plataformaquebravelgrande.png";

const plataformaFantasmaImg = new Image();
plataformaFantasmaImg.src = "./images/plataformas/plataforamas normais/plataformafantasma.png";

const plataformaFantasmaGrandeImg = new Image();
plataformaFantasmaGrandeImg.src = "./images/plataformas/plataforma grandes/plataformafantasmagrande.png";

const plataformafantasmaImg = new Image();
plataformafantasmaImg.src = "./images/plataformas/plataforamas normais/plataformafantasma.png";

const plataformafanstamagrandeImg = new Image();
plataformafanstamagrandeImg.src = "./images/plataformas/plataforma grandes/plataformafantasmagrande.png";

plataformafantasmaImg.onerror = () => {
    
};

plataformafanstamagrandeImg.onerror = () => {
    
};


const serraSpritesheet = new Image();
serraSpritesheet.src = "./images/personagens e inimigos/serra/serra_spritesheet.png";
const serraSpriteFrameWidth = 173.8;
const serraSpriteFrameHeight = 190;
const serraSpriteTotalFrames = 8;
let serrasCarregadas = false;
serraSpritesheet.onload = () => {
    serrasCarregadas = true;
};
let serraFrame = 0;



const playerSprites = {
    'O Errante de Eldoria': {
        sprite: new Image(),
        config: [
            { frameWidth: 15, frameHeight: 20, frames: 2, offsetX: 0, offsetY: 0.8 }, 
            { frameWidth: 17, frameHeight: 20, frames: 1, offsetX: 0, offsetY: -1.2},   
            { frameWidth: 18.1, frameHeight: 20, frames: 2, offsetX: 2, offsetY: -2.2}  
        ],
        path: "./images/personagens e inimigos/normal/player_spritesheet.png"
    },
    'Kuroshi, o Ninja': {
        sprite: new Image(),
        config: [
            { frameWidth: 15, frameHeight: 20, frames: 2, offsetX: 0, offsetY: 0.8 }, 
            { frameWidth: 17, frameHeight: 20, frames: 1, offsetX: 0, offsetY: -1.2},   
            { frameWidth: 18.1, frameHeight: 20, frames: 2, offsetX: 2, offsetY: -2.2 }  
        ],
        path: "./images/personagens e inimigos/ninja/ninja 1.png"
    },
    'Valthor, o Mago': {
        sprite: new Image(),
        config: [
            { frameWidth: 15, frameHeight: 20, frames: 2, offsetX: 0, offsetY: 0.8 }, 
            { frameWidth: 17, frameHeight: 20, frames: 1, offsetX: 0, offsetY: -1.2},   
            { frameWidth: 18.1, frameHeight: 20, frames: 2, offsetX: 2, offsetY: -2.2 }  
        ],
        path: "./images/personagens e inimigos/mago/mago 1.png"
    },
    'Roderick, o Cavaleiro': {
        sprite: new Image(),
        config: [
            { frameWidth: 15, frameHeight: 20, frames: 2, offsetX: 0, offsetY: 0.8 }, 
            { frameWidth: 17, frameHeight: 20, frames: 1, offsetX: 0, offsetY: -1.2},   
            { frameWidth: 18.1, frameHeight: 20, frames: 2, offsetX: 2, offsetY: -2.2 }  
        ],
        path: "./images/personagens e inimigos/cavaleiro/cavaleiro 1.png"
    }
};

const heartSprite = new Image();
let heartSpriteLoaded = false;
heartSprite.onload = () => {
    heartSpriteLoaded = true;
};
heartSprite.onerror = (error) => {
    
};
heartSprite.src = './images/UI/coraçoes.png';


let playerSprite = new Image();
let currentSpriteConfig = playerSprites['O Errante de Eldoria'].config;
let FRAME_WIDTH, FRAME_HEIGHT;
const SPRITE_ROWS = 3;
const SPRITE_COLS = 2;

let playerFrameWidth = currentSpriteConfig[0].frameWidth;
let playerFrameHeight = currentSpriteConfig[0].frameHeight;
let playerFrameCount = currentSpriteConfig[0].frames;
let playerFrameRow = 0;
let playerFrameOffsetX = currentSpriteConfig[0].offsetX;
let playerFrameOffsetY = currentSpriteConfig[0].offsetY;


const PLAYER_ANIMATION_FPS = {
    'O Errante de Eldoria': [5, 1, 1], 
    'Kuroshi, o Ninja': [8, 1, 1.5], 
    'Valthor, o Mago': [4, 1, 1.2], 
    'Roderick, o Cavaleiro': [3, 1, 0.8], 
    'default': [5, 1, 1] 
};

const PLAYER_ANIMATION_DELAY = {}; 
Object.entries(PLAYER_ANIMATION_FPS).forEach(([char, fps]) => {
    PLAYER_ANIMATION_DELAY[char] = fps.map(fps => Math.round(60 / fps));
});

let frameIndex = 0;
let frameTimer = 0;
let playerSpriteLoaded = false;

function updatePlayerAnimation() {
    if (!playerSpriteLoaded) return;

    frameTimer++;
    
    const characterDelays = PLAYER_ANIMATION_DELAY[activeCharacter] || PLAYER_ANIMATION_DELAY['default'];
    const delay = characterDelays[playerFrameRow] || 12;
    
    if (frameTimer >= delay) {
        frameTimer = 0;
        
        frameIndex = (frameIndex + 1) % playerFrameCount;
    }
}


function setPlayerSpriteRow(row) {
    playerFrameRow = row;
    const config = currentSpriteConfig[row];
    playerFrameWidth = config.frameWidth;
    playerFrameHeight = config.frameHeight;
    playerFrameCount = config.frames;
    playerFrameOffsetX = config.offsetX || 0;
    playerFrameOffsetY = config.offsetY || 0;
    if (frameIndex >= playerFrameCount) frameIndex = 0;
}


function setCharacterSprite(characterName) {
    
    
    
    if (!playerSprites[characterName]) {
        
        return false;
    }
    
    
    if (!spriteLoadStatus[characterName]) {
        
        return false;
    }
    
    try {
        
        const currentRow = playerFrameRow;
        
        
        playerSprite = playerSprites[characterName].sprite;
        currentSpriteConfig = playerSprites[characterName].config;
        
        
        frameIndex = 0;
        frameTimer = 0;
        
        
        setPlayerSpriteRow(currentRow);
        
        
        return true;
    } catch (error) {
        
        return false;
    }
}


const spriteLoadStatus = {
    'O Errante de Eldoria': false,
    'Kuroshi, o Ninja': false,
    'Valthor, o Mago': false,
    'Roderick, o Cavaleiro': false
};


Object.entries(playerSprites).forEach(([name, data]) => {

    
    
    data.sprite = new Image();
    
    data.sprite.onload = () => {
        
        spriteLoadStatus[name] = true;
        
        if (name === 'O Errante de Eldoria') {
            playerSpriteLoaded = true;
        }
        
        
        const allLoaded = Object.values(spriteLoadStatus).every(status => status);
        if (allLoaded) {
            
        }
    };
    
    data.sprite.onerror = (error) => {
        
        
    };
    
    
    data.sprite.src = data.path;
});


playerSprite.src = playerSprites['O Errante de Eldoria'].path;
playerSprite.onload = () => {
     
    FRAME_WIDTH = playerSprite.naturalWidth / SPRITE_COLS;
    FRAME_HEIGHT = playerSprite.naturalHeight / SPRITE_ROWS;
    playerSpriteLoaded = true;
};


const backgroundImages = [];
for (let i = 1; i <= 4; i++) {
  const img = new Image();
  img.src = `./images/imagens de fundo/fundos do jogo/imagemfundo${i}.jpg`;
  backgroundImages.push(img);
}
const mainBg = backgroundImages[0]; 
let currentBg = mainBg;
let nextBg = mainBg;
let trocaCount = 0;



for (let i = 1; i <= 4; i++) {
  const img = new Image();
  img.src = `./images/imagens de fundo/fundos do jogo/imagemfundo${i}.jpg`;
  lateralImages.push(img);
}
let currentLateralLeft = lateralImages[0];
let currentLateralRight = lateralImages[0];


function sortearLaterais(bgCentral) {
  
  const disponiveis = lateralImages.filter(img => img.src !== bgCentral.src);
  
  let idx = Math.floor(Math.random() * disponiveis.length);
  let lateral = disponiveis[idx];
  
  return [lateral, lateral];
}


function resetarBackgroundsELaterais() {
  currentBg = mainBg;
  nextBg = mainBg;
  currentLateralLeft = lateralImages[0];
  currentLateralRight = lateralImages[0];
  
  nextLateralLeftBg = lateralImages[0];
  nextLateralRightBg = lateralImages[0];
}


const inimigoImages = [];
inimigoImages[0] = new Image();
inimigoImages[0].src = "./images/personagens e inimigos/aranha/arranha_spritsheet.png";







window.spriteDebug = false;
document.addEventListener('keydown', function(e) {
    if (e.code === 'F12') {
        window.spriteDebug = !window.spriteDebug;
    }
});


const moedaSprite = new Image();
moedaSprite.src = './images/variados/moeda_spritesheet.png';


const ninjaAbilityIcon = new Image();

ninjaAbilityIcon.src = './images/UI/bomba de fumaça.png';
let ninjaAbilityIconLoaded = false;
ninjaAbilityIcon.onload = () => {
    ninjaAbilityIconLoaded = true;
};


const mageAbilityIcon = new Image();
mageAbilityIcon.src = './images/UI/devastaçao mistica.png';
let mageAbilityIconLoaded = false;
mageAbilityIcon.onload = () => {
    mageAbilityIconLoaded = true;
};

const knightShieldIcon = new Image();
knightShieldIcon.src = './images/UI/edigie lunar.png';
let knightShieldIconLoaded = false;
knightShieldIcon.onload = () => {
    knightShieldIconLoaded = true;
};

const knightResurrectionIcon = new Image();
knightResurrectionIcon.src = './images/UI/alma reerguida.png';
let knightResurrectionIconLoaded = false;
knightResurrectionIcon.onload = () => {
    knightResurrectionIconLoaded = true;
};


