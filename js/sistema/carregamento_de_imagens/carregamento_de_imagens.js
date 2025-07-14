// ==========================
// ===== CARREGAMENTO DE IMAGENS =====
// ==========================
// Plataformas
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

// Serras
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

// Jogador
// Spritesheets dos personagens
const playerSprites = {
    'O Errante de Eldoria': {
        sprite: new Image(),
        config: [
            { frameWidth: 15, frameHeight: 20, frames: 2, offsetX: 0, offsetY: 0.8 }, // Linha 1 - Correndo
            { frameWidth: 17, frameHeight: 20, frames: 1, offsetX: 0, offsetY: -1.2},   // Linha 2 - Parado
            { frameWidth: 18.1, frameHeight: 20, frames: 2, offsetX: 2, offsetY: -2.2}  // Linha 3 - Idle
        ],
        path: "./images/personagens e inimigos/normal/player_spritesheet.png"
    },
    'Kuroshi, o Ninja': {
        sprite: new Image(),
        config: [
            { frameWidth: 15, frameHeight: 20, frames: 2, offsetX: 0, offsetY: 0.8 }, // Linha 1 - Correndo
            { frameWidth: 17, frameHeight: 20, frames: 1, offsetX: 0, offsetY: -1.2},   // Linha 2 - Parado
            { frameWidth: 18.1, frameHeight: 20, frames: 2, offsetX: 2, offsetY: -2.2 }  // Linha 3 - Idle
        ],
        path: "./images/personagens e inimigos/ninja/ninja 1.png"
    },
    'Valthor, o Mago': {
        sprite: new Image(),
        config: [
            { frameWidth: 15, frameHeight: 20, frames: 2, offsetX: 0, offsetY: 0.8 }, // Linha 1 - Correndo
            { frameWidth: 17, frameHeight: 20, frames: 1, offsetX: 0, offsetY: -1.2},   // Linha 2 - Parado
            { frameWidth: 18.1, frameHeight: 20, frames: 2, offsetX: 2, offsetY: -2.2 }  // Linha 3 - Idle
        ],
        path: "./images/personagens e inimigos/mago/mago 1.png"
    },
    'Roderick, o Cavaleiro': {
        sprite: new Image(),
        config: [
            { frameWidth: 15, frameHeight: 20, frames: 2, offsetX: 0, offsetY: 0.8 }, // Linha 1 - Correndo
            { frameWidth: 17, frameHeight: 20, frames: 1, offsetX: 0, offsetY: -1.2},   // Linha 2 - Parado
            { frameWidth: 18.1, frameHeight: 20, frames: 2, offsetX: 2, offsetY: -2.2 }  // Linha 3 - Idle
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
    console.error('Erro ao carregar sprite dos corações:', error);
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

// FPS específico para cada linha/estado do player
const PLAYER_ANIMATION_FPS = {
    'O Errante de Eldoria': [5, 1, 1], // [andar, parado, idle]
    'Kuroshi, o Ninja': [8, 1, 1.5], // Ninja tem animação mais rápida
    'Valthor, o Mago': [4, 1, 1.2], // Mago tem animação mais suave
    'Roderick, o Cavaleiro': [3, 1, 0.8], // Cavaleiro tem animação mais lenta e pesada
    'default': [5, 1, 1] // Fallback para outros personagens
};

const PLAYER_ANIMATION_DELAY = {}; // Will be populated for each character
Object.entries(PLAYER_ANIMATION_FPS).forEach(([char, fps]) => {
    PLAYER_ANIMATION_DELAY[char] = fps.map(fps => Math.round(60 / fps));
});

let frameIndex = 0;
let frameTimer = 0;
let playerSpriteLoaded = false;

function updatePlayerAnimation() {
    if (!playerSpriteLoaded) return;

    frameTimer++;
    // Use character-specific animation delay or fallback to default
    const characterDelays = PLAYER_ANIMATION_DELAY[activeCharacter] || PLAYER_ANIMATION_DELAY['default'];
    const delay = characterDelays[playerFrameRow] || 12;
    
    if (frameTimer >= delay) {
        frameTimer = 0;
        // Use the number of frames in current row
        frameIndex = (frameIndex + 1) % playerFrameCount;
    }
}

// Função para atualizar linha e tamanho do frame do player
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

// Função para trocar o sprite do personagem
function setCharacterSprite(characterName) {
    
    
    // Verifica se o personagem existe
    if (!playerSprites[characterName]) {
        
        return false;
    }
    
    // Verifica se o sprite foi carregado
    if (!spriteLoadStatus[characterName]) {
        
        return false;
    }
    
    try {
        // Salva configuração atual
        const currentRow = playerFrameRow;
        
        // Atualiza referências
        playerSprite = playerSprites[characterName].sprite;
        currentSpriteConfig = playerSprites[characterName].config;
        
        // Reseta estados de animação
        frameIndex = 0;
        frameTimer = 0;
        
        // Restaura a linha de animação
        setPlayerSpriteRow(currentRow);
        
        
        return true;
    } catch (error) {
        
        return false;
    }
}

// Status de carregamento dos sprites
const spriteLoadStatus = {
    'O Errante de Eldoria': false,
    'Kuroshi, o Ninja': false,
    'Valthor, o Mago': false,
    'Roderick, o Cavaleiro': false
};

// Carrega todos os spritesheets
Object.entries(playerSprites).forEach(([name, data]) => {

    
    // Cria uma nova imagem para o personagem
    data.sprite = new Image();
    
    data.sprite.onload = () => {
        
        spriteLoadStatus[name] = true;
        // Se for o personagem O Errante de Eldoria, inicializa o jogo
        if (name === 'O Errante de Eldoria') {
            playerSpriteLoaded = true;
        }
        
        // Verifica se todos os sprites foram carregados
        const allLoaded = Object.values(spriteLoadStatus).every(status => status);
        if (allLoaded) {
            
        }
    };
    
    data.sprite.onerror = (error) => {
        
        
    };
    
    // Inicia o carregamento da imagem
    data.sprite.src = data.path;
});

// Inicializa com o sprite do Errante de Eldoria
playerSprite.src = playerSprites['O Errante de Eldoria'].path;
playerSprite.onload = () => {
     // Debug log
    FRAME_WIDTH = playerSprite.naturalWidth / SPRITE_COLS;
    FRAME_HEIGHT = playerSprite.naturalHeight / SPRITE_ROWS;
    playerSpriteLoaded = true;
};

// Backgrounds
const backgroundImages = [];
for (let i = 1; i <= 4; i++) {
  const img = new Image();
  img.src = `./images/imagens de fundo/fundos do jogo/imagemfundo${i}.jpg`;
  backgroundImages.push(img);
}
const mainBg = backgroundImages[0]; // imagem principal
let currentBg = mainBg;
let nextBg = mainBg;
let trocaCount = 0;

// NOVO: Imagens das laterais (pode ser o mesmo conjunto, mas permite expandir)
const lateralImages = [];
for (let i = 1; i <= 4; i++) {
  const img = new Image();
  img.src = `./images/imagens de fundo/fundos do jogo/imagemfundo${i}.jpg`;
  lateralImages.push(img);
}
let currentLateralLeft = lateralImages[0];
let currentLateralRight = lateralImages[1] || lateralImages[0];

// Função para sortear laterais sem repetir o fundo central
function sortearLaterais(bgCentral) {
  // Filtra para não repetir o fundo central
  const disponiveis = lateralImages.filter(img => img.src !== bgCentral.src);
  // Sorteia esquerda
  let idx = Math.floor(Math.random() * disponiveis.length);
  let lateral = disponiveis[idx];
  // Ambas as laterais podem ser iguais
  return [lateral, lateral];
}

// Função para resetar laterais e fundo para a primeira imagem
function resetarBackgroundsELaterais() {
  currentBg = mainBg;
  nextBg = mainBg;
  currentLateralLeft = lateralImages[0];
  currentLateralRight = lateralImages[0];
}

// Carregamento de sprites de inimigos
const inimigoImages = [];
inimigoImages[0] = new Image();
inimigoImages[0].src = "./images/personagens e inimigos/aranha/arranha_spritsheet.png";

// Para adicionar mais inimigos no futuro, basta seguir o padrão:
// inimigoImages[1] = new Image();
// inimigoImages[1].src = "images/inimigoB.png";
// ...etc...

// Atalho para debug visual do sprite (F3)
window.spriteDebug = false;
document.addEventListener('keydown', function(e) {
    if (e.code === 'F12') {
        window.spriteDebug = !window.spriteDebug;
    }
});

// Moedas
const moedaSprite = new Image();
moedaSprite.src = './images/variados/moeda_spritesheet.png';

// Imagem da habilidade do Ninja
const ninjaAbilityIcon = new Image();

ninjaAbilityIcon.src = './images/UI/bomba de fumaça.png';
let ninjaAbilityIconLoaded = false;
ninjaAbilityIcon.onload = () => {
    ninjaAbilityIconLoaded = true;
};

// Imagens das habilidades dos personagens
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


