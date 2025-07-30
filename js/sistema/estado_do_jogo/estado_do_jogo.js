


let serras = [];
const lateralImages = [];
let plataformas = [];
let keys = {};
let isGameOver = false;
let gameState = "tutorial";
let firstGamePlay = true; 
let backgroundY = 0;
let money = 0;
let enemySpawnInterval = 100;
let lastEnemySpawn = 0;
let live = 0; 
let liveupgrade = 0;

let animatingHearts = [];
let previousLive = 0; 
let frameCount = 0; 
let isloja = false;
const backgroundSpeed = 0.5;
let maxPlataformas = 15;
let normalCount = 0;
const variationChance = 0.25;
let lastNormalSide = 'center';
let lastvariationside = null;
let salvoprofundidade = 0;
const targetFPS = 60;
const fpsInterval = 1000 / targetFPS;
let lastFrameTime = performance.now();
const FINAL_DEPTH = 250000;


const input = {
  get left() { return inputManager.isLeft(); },
  get right() { return inputManager.isRight(); },
  get up() { return inputManager.isUp(); },
  get down() { return inputManager.isDown(); },
  get jump() { return inputManager.isJump(); },
  get dash() { return inputManager.isDash(); }
};



if (typeof player !== 'undefined') {
  player.visible = true;
}