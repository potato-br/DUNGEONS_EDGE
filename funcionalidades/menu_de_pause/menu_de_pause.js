// ==========================
// ===== MENU DE PAUSE ======
// ==========================

let isPaused = false;
let pauseOptions = ["Continuar", "Ir para Loja"];
let selectedPauseIndex = 0;

// Abre/fecha o pause com 'p' ou 'esc'
window.addEventListener("keydown", function(e) {
    if (gameState === "loja") return; // Não pausa na loja
    if ((e.key === "p" || e.key === "P" || e.key === "Escape") && !isPaused && gameState === "jogando") {
        isPaused = true;
        gameState = "pause";
        selectedPauseIndex = 0;
        if (typeof onPauseToggle === "function") onPauseToggle(true);
    } else if ((e.key === "p" || e.key === "P" || e.key === "Escape") && isPaused) {
        closePauseMenu();
    }
    if (isPaused && gameState === "pause") {
        handlePauseMenuInput(e);
    }
});

function handlePauseMenuInput(e) {
    if (e.repeat) return;
    if (e.key === "ArrowUp") {
        selectedPauseIndex = (selectedPauseIndex - 1 + pauseOptions.length) % pauseOptions.length;
        drawPause();
    } else if (e.key === "ArrowDown") {
        selectedPauseIndex = (selectedPauseIndex + 1) % pauseOptions.length;
        drawPause();
    } else if (e.key === "Enter" || e.key === "c" || e.key === "C") {
        if (selectedPauseIndex === 0) {
            closePauseMenu();
        } else if (selectedPauseIndex === 1) {
            goToShopFromPause();
        }
    } else if (e.key === "r" || e.key === "R") {
        goToShopFromPause();
    }
}

function closePauseMenu() {
    isPaused = false;
    if (gameState === "pause") gameState = "jogando";
    if (typeof onPauseToggle === "function") onPauseToggle(false);
}

function goToShopFromPause() {
    if (typeof openShopWithTransition === "function") {
        openShopWithTransition();
    }
    isPaused = false;
    gameState = "loja";
}

// Desenha o menu de pause simples
function drawPause() {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;

    ctx.font = "bold 48px PixelFont";
    ctx.fillStyle = "#ffd700";
    ctx.textAlign = "center";
    ctx.fillText("PAUSADO", canvas.width/2, 180);

    ctx.font = "28px PixelFont";
    for (let i = 0; i < pauseOptions.length; i++) {
        ctx.fillStyle = i === selectedPauseIndex ? "#fff" : "#ffd700";
        ctx.fillText(
            (i === selectedPauseIndex ? "→ " : "") + pauseOptions[i],
            canvas.width/2,
            260 + i * 50
        );
    }

    ctx.font = "18px PixelFont";
    ctx.fillStyle = "#fff";
    ctx.fillText('Setas: Navegar   ⏎/C: Selecionar   R: Ir para Loja   P/Esc: Fechar', canvas.width/2, 400);

    ctx.restore();
}



