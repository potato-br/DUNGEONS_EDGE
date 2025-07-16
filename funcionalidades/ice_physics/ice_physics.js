// ==========================
// ===== ICE PHYSICS =====
// ==========================

class IcePhysics {
    constructor() {
        this.particles = [];
        this.maxParticles = 50;
        this.lastParticleTime = 0;
        this.iceVelocity = 0;
        this.wasOnIce = false;
        this.airControl = 0.25;          // Controle no ar
        this.momentumDecay = 0.995;     // Decaimento normal do momentum
    }

    update(player, platform) {
        // Atualiza partículas sempre
        this.updateParticles();

        // Flag se está no gelo neste frame
        const isIceNow = platform && (platform.isSlippery || platform.type === PLATFORM_TYPES.ESCORREGADIA);
        // Detecta saída do gelo neste frame
        const justExited = !isIceNow && this.wasOnIce;

        // Se acabou de sair do gelo, transfere momentum uma vez
        if (justExited) {
            player.velocityX = this.iceVelocity;
        }

        // Atualiza flag para o próximo frame
        this.wasOnIce = isIceNow;

        if (isIceNow) {
            // Lógica de gelo
            const isLargePlatform = platform.isGrande === true;
            const maxSpeed = isLargePlatform ? 10 : 8;
            const acceleration = isLargePlatform ? 0.5 : 0.4;
            const deceleration = isLargePlatform ? 0.99 : 0.98;

            if (input.right) {
                this.iceVelocity = Math.min(this.iceVelocity + acceleration, maxSpeed);
                player.facingRight = true;
            } else if (input.left) {
                this.iceVelocity = Math.max(this.iceVelocity - acceleration, -maxSpeed);
                player.facingRight = false;
            } else {
                this.iceVelocity *= deceleration;
            }

            // Aplica velocidade do gelo ao player
            player.velocityX = this.iceVelocity;

            // Cria partículas se estiver rápido o suficiente
            if (Math.abs(this.iceVelocity) > 2) {
                const now = performance.now();
                if (now - this.lastParticleTime > 50) {
                    this.createIceParticles(player);
                    this.lastParticleTime = now;
                }
            }

        } else {
            // Fora do gelo: decaimento suave do momentum
            this.iceVelocity *= this.momentumDecay;

            if (player.isJumping) {
                // Controle parcial no ar
                if (input.right && this.iceVelocity < 0) {
                    this.iceVelocity += this.airControl;
                } else if (input.left && this.iceVelocity > 0) {
                    this.iceVelocity -= this.airControl;
                }
            } else if (!justExited) {
                // No chão, cancela totalmente se apertar direção oposta (mas não na saída)
                if (input.right && this.iceVelocity < 0 ||
                    input.left && this.iceVelocity > 0) {
                    this.iceVelocity = 0;
                }
            }

            // Se o momentum ficar muito pequeno, zera de vez
            if (Math.abs(this.iceVelocity) < 0.01) {
                this.iceVelocity = 0;
            }

            // Aplica ao player
            player.velocityX = this.iceVelocity;
        }
    }

    createIceParticles(player) {
        const particleCount = Math.floor(Math.abs(player.velocityX));
        const currentPlatform = typeof plataformas !== 'undefined'
            ? plataformas.find(p => p.isColliding)
            : null;
        const isLargePlatform = currentPlatform && currentPlatform.type === PLATFORM_TYPES.GRANDE;
        const spread = isLargePlatform ? 40 : 20;

        for (let i = 0; i < particleCount && this.particles.length < this.maxParticles; i++) {
            const particle = {
                x: player.x + player.width / 2 + (Math.random() * spread - spread / 2),
                y: player.y + player.height,
                vx: (Math.random() - 0.5) * (isLargePlatform ? 3 : 2),
                vy: -Math.random() * (isLargePlatform ? 3 : 2),
                life: 1,
                size: Math.random() * (isLargePlatform ? 4 : 3) + 1,
                color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`
            };
            this.particles.push(particle);
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.vy += 0.1;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    draw(ctx) {
        ctx.save();
        for (const p of this.particles) {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

// Instância global
const icePhysics = new IcePhysics();
