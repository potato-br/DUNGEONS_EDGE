


const canvas = document.getElementById("gameCanvas");
const ctx    = canvas.getContext("2d");


function configurePixelPerfect() {
  ctx.imageSmoothingEnabled = false;
  canvas.style.imageRendering = 'pixelated';
}


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


function ajustarCanvas(il = true) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  configurePixelPerfect(); 
  
  screenWidth = canvas.width;
  screenHeight = canvas.height;
  
  
  gamePlayArea.x = (canvas.width - gamePlayArea.width) / 2;
  gamePlayArea.y = 0;
  gamePlayArea.height = canvas.height;
  
  
  if (typeof player !== 'undefined') {
    if (player.x < gamePlayArea.x) player.x = gamePlayArea.x;
    if (player.x + player.width > gamePlayArea.x + gamePlayArea.width) {
      player.x = gamePlayArea.x + gamePlayArea.width - player.width;
    }
  }
}

