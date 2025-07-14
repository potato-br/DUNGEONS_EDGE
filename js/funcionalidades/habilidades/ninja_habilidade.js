// Função para ser chamada quando o Ninja usa a bomba de fumaça
function ninjasmokebomb() {
    const now = performance.now();

    // Se a bomba de fumaça está ativa, não toma dano
    if (NINJA.smokeBombActive) return false;
   
    // Se está em cooldown, toma dano normalmente
    if (NINJA.smokeBombCooldown) {
        return true;
    }

    // Ativa a bomba de fumaça
    NINJA.smokeBombActive = true;
    NINJA.smokeBombTimer = now;

    // Aplica invulnerabilidade com aura cinza
    aplicarInvulnerabilidade(NINJA.NINJA_SMOKE_DURATION);

    // Cria o efeito de fumaça
    createParticles(
        player.x + player.width/2,
        player.y + player.height/2,
        30,  // mais partículas para efeito de fumaça
        'rgba(128, 128, 128, 0.8)', // cor cinza para fumaça
        {
            speedX: (-3 + Math.random() * 6),
            speedY: (-3 + Math.random() * 6),
            fadeSpeed: 0.02,
            size: 5,
            gravity: -0.1
        }
    );
    
    // Em vez de setTimeout, usa timestamps que serão checados em lidarcomCooldowns
    NINJA.smokeBombCooldownStart = now + NINJA.NINJA_SMOKE_DURATION;

    return false; // Não toma dano agora
}














