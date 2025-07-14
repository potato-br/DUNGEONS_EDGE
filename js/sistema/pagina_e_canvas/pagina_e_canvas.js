// ==========================
// ===== CONFIGURAÇÃO DO CANVAS =====
// ==========================
const canvas = document.getElementById("gameCanvas");
const ctx    = canvas.getContext("2d");

// Função para configurar renderização pixel perfect
function configurePixelPerfect() {
  ctx.imageSmoothingEnabled = false;
  canvas.style.imageRendering = 'pixelated';
}

// Garante que as configurações sejam aplicadas no início
document.addEventListener('DOMContentLoaded', () => {
  configurePixelPerfect();
  ajustarCanvas();
});

let screenWidth, screenHeight;
let gamePlayArea = {
  width: 800,
  x: 0,
  y: 0,
  height: window.innerHeight
};

// Ajusta o tamanho do canvas à altura da janela
function ajustarCanvas(il = true) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  configurePixelPerfect(); // Reaplica após redimensionamento
  
  screenWidth = canvas.width;
  screenHeight = canvas.height;
  
  // Centraliza área jogável
  gamePlayArea.x = (canvas.width - gamePlayArea.width) / 2;
  gamePlayArea.y = 0;
  gamePlayArea.height = canvas.height;
  
  // Ajusta limites do jogador
  if (typeof player !== 'undefined') {
    if (player.x < gamePlayArea.x) player.x = gamePlayArea.x;
    if (player.x + player.width > gamePlayArea.x + gamePlayArea.width) {
      player.x = gamePlayArea.x + gamePlayArea.width - player.width;
    }
  }
}

