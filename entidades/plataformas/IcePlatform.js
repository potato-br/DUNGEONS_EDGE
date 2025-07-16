// ==========================
// ===== PLATAFORMAS DE GELO =====
//
// Toda a física de gelo agora é centralizada em funcionalidades/ice_physics.js
// Este arquivo serve apenas para desenhar a plataforma de gelo.

function drawIcePlatform(ctx, platform, img) {
    if (img.complete) {
        ctx.drawImage(img, platform.x, platform.y, platform.width, platform.height);
    }
    if (platform.isColliding && Math.random() < 0.1) {
        createParticles(
            platform.x + Math.random() * platform.width,
            platform.y,
            1,
            '#33ccff'
        );
    }
}
