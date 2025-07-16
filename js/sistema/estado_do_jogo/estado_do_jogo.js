// ==========================
// ===== ESTADO DO JOGO =====
// ==========================
let serras = [];
const lateralImages = [];
let plataformas = [];
let keys = {};
let isGameOver = false;
let gameState = "tutorial";
let firstGamePlay = true; // Will be true every time page loads
let backgroundY = 0;
let money = 0;
let enemySpawnInterval = 100;
let lastEnemySpawn = 0;
let live = 0; // Vida inicial do jogador
let liveupgrade = 0;
// Armazena os corações que estão sendo animados
let animatingHearts = [];
let previousLive = 0; // Para detectar quando perdeu vida
let frameCount = 0; // Track frame count for animations and timing
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

// Referência ao input do jogador usando o novo sistema
const input = {
  get left() { return inputManager.isLeft(); },
  get right() { return inputManager.isRight(); },
  get up() { return inputManager.isUp(); },
  get down() { return inputManager.isDown(); },
  get jump() { return inputManager.isJump(); },
  get dash() { return inputManager.isDash(); }
};

// Os estados do jogo agora são verificados diretamente no gameLoop em Reset_e_Loop.js

if (typeof player !== 'undefined') {
  player.visible = true;
}