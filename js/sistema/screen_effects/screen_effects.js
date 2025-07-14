// Screen Effects System
let screenShakeTimer = 0;
let screenShakeMagnitude = 0;
const gameCanvas = document.getElementById('gameCanvas');

function triggerScreenShake(magnitude = 0.01, duration = 10) {
    screenShakeTimer = duration;
    screenShakeMagnitude = magnitude;
    updateScreenShake();
}

function updateScreenShake() {
    if (screenShakeTimer > 0) {
        // Calculate shake based on canvas dimensions
        const canvasWidth = gameCanvas.width || gameCanvas.clientWidth;
        const canvasHeight = gameCanvas.height || gameCanvas.clientHeight;
        
        // Use relative values based on canvas size
        const shakeX = (Math.random() - 0.5) * (canvasWidth * screenShakeMagnitude);
        const shakeY = (Math.random() - 0.5) * (canvasHeight * screenShakeMagnitude);
        
        // Apply transform to the canvas
        gameCanvas.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
        
        screenShakeTimer--;
        if (screenShakeTimer <= 0) {
            // Reset transform when shake is done
            gameCanvas.style.transform = 'translate(0px, 0px)';
            screenShakeMagnitude = 0;
        } else {
            // Continue shaking
            requestAnimationFrame(updateScreenShake);
        }
    }
}
