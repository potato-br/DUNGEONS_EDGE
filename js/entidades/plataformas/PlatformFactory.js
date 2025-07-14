// ==========================
// ===== PLATFORM FACTORY =====
// ==========================

class PlatformFactory {
    constructor() {
        this.updateScreenDimensions();
        
        this.platformTypes = {
            NORMAL: 'normal',
            GRANDE: 'grande',
            ESCORREGADIA: 'escorregadia',
            QUEBRAVEL: 'quebravel',
            MOVEL: 'movel',
            FANTASMA: 'fantasma'
        };

        // Base specifications for normal platforms
        this.platformnormalSpecs = {
            normal: {
                width: 120,
                height: 25,
                color: '#996633',
                maxHits: 3
            },
            escorregadia: {
                width: 140,
                height: 30,
                color: '#33ccff',
                maxHits: 3,
                friction: 0.98
            },
            quebravel: {
                width: 90,
                height: 25,
                color: '#ff9933',
                maxHits: 3,
                breakDelay: 1500,    // Increased time before platform starts falling
                fallSpeed: 3,        // Reduced initial fall speed for smoother fall
                respawnTime: 500,    // Increased respawn time
                warningTime: 800,    // Time to show warning effects before breaking
                shakeMagnitude: 2    // How much the platform shakes before breaking
            },
            movel: {
                width: 120,
                height: 120,
                color: '#33cc33',
                maxHits: 3,
                moveSpeed: 2
            },            fantasma: {
                width: 120,
                height: 25,
                color: '#87CEFA', // Cor azul claro (Light Sky Blue)
                maxHits: 3,
                fadeTime: 120, // Tempo mais rápido de fade
                fadeInTime: 30, // Tempo para aparecer
                fadeOutTime: 60, // Tempo para desaparecer
                pulseSpeed: 0.08, // Velocidade da pulsação
                pulseIntensity: 0.4, // Intensidade da pulsação
                particleFrequency: 0.15 // Frequência de partículas espectrais
            }
        };

        // Specifications for large platforms
        this.platformgrandeSpecs = {            
            normal: {
                width: 300, // Fixed width for large platforms
                height: 60, // Fixed height for large platforms
                color: '#9933ff',
                maxHits: 7
            },
            escorregadia: {
                width: 300, // Fixed width for large platforms
                height: 60, // Fixed height for large platforms
                color: '#33ccff',
                maxHits: 3,
                friction: 0.98
            },
            quebravel: {
                width: 300, // Fixed width for large platforms
                height: 50, // Fixed height for large platforms
                color: '#ff9933',
                maxHits: 3,
                breakTime: 2000,     // Longer break time for large platforms
                warningTime: 1200,   // Longer warning time for large platforms
                shakeMagnitude: 3    // More intense shaking for large platforms
            },            
            fantasma: {
                width: 300, // Special flag for dynamic width
                height: 50, // Fixed height for large platforms
                color: '#E6E6FA', // Cor mais espectral
                maxHits: 3,
                fadeTime: 150, // Tempo maior para plataformas grandes
                fadeInTime: 40,
                fadeOutTime: 80,
                pulseSpeed: 0.06, // Pulsação mais lenta para plataformas grandes
                pulseIntensity: 0.5,
                particleFrequency: 0.25 // Mais partículas em plataformas grandes
            }
        };

        this.platformSpecs = {
            normal: this.platformnormalSpecs,
            grande: this.platformgrandeSpecs
        };

        // Define thresholds for when each platform type becomes available
        this.normalCategoryThresholds = {
            [this.platformTypes.NORMAL]:0,           // Always available
            [this.platformTypes.ESCORREGADIA]: 20000,   // Available after some progress
            [this.platformTypes.QUEBRAVEL]: 0,     // Available later in game
            [this.platformTypes.MOVEL]: 10000,         // Available even later
            [this.platformTypes.FANTASMA]: 70000,   // Disponível após 10000 pontos
        };

        this.grandeCategoryThresholds = {
            [this.platformTypes.NORMAL]: 15000,         // Large normal platforms available after some time
            [this.platformTypes.ESCORREGADIA]: 30000,  // Large ice platforms available mid-game
            [this.platformTypes.QUEBRAVEL]: 60000,     // Large breakable platforms available late-game
            [this.platformTypes.FANTASMA]: 75000,  // Plataformas fantasma grandes após 15000 pontos
        };
    }    

    createPlatform(type, x, y) {
        
        
        // Get current depth
        const depth = typeof depthPoints !== 'undefined' ? depthPoints : 0;

        // Get platform specifications based on type
        let specs;
        let baseType = type;
        let isLargePlatform = type === this.platformTypes.GRANDE;

        if (isLargePlatform) {
            // For large platforms, we need to randomize the subtype
            const availableTypes = this.getAvailableTypes(true, depth);
            const subType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            specs = this.platformgrandeSpecs[subType] || this.platformgrandeSpecs.normal;
            baseType = subType; // Use the subtype as the actual type
            
        } else {
            specs = this.platformnormalSpecs[type] || this.platformnormalSpecs.normal;
        }        // Create base platform
        const canvas = document.getElementById('gameCanvas');
        // Define dynamic width based on platform type
        const dynamicWidth = baseType === this.platformTypes.QUEBRAVEL ? 
            Math.min(500, canvas.width - 40) : // Smaller width for breakable platforms
            Math.min(620, canvas.width - 40);  // Larger width for other platforms

        const platform = {
            type: baseType,
            x: x ?? this._getRandomX(isLargePlatform ? dynamicWidth : specs.width, type),
            y: y ?? this._getNextY(),
            width: isLargePlatform ? dynamicWidth : specs.width,
            height: specs.height,
            hitCount: 0,
            maxHits: specs.maxHits,
            color: specs.color,
            isGrande: isLargePlatform
        };

        

        // Set platform-specific properties
        if (platform.type === this.platformTypes.ESCORREGADIA) {
            platform.isSlippery = true;
            platform.friction = isLargePlatform ? 
                this.platformgrandeSpecs.escorregadia.friction :
                this.platformnormalSpecs.escorregadia.friction;
        } else if (platform.type === this.platformTypes.QUEBRAVEL) {
            platform.breaking = false;
            platform.breakTimer = 0;
            platform.maxStandTime = (isLargePlatform ? 
                this.platformgrandeSpecs.quebravel.breakTime : 
                this.platformnormalSpecs.quebravel.breakTime) / (1000 / 60);
        } else if (platform.type === this.platformTypes.FANTASMA) {
            platform.fadeTimer = 0;
            platform.visible = true;
            platform.isGhost = true;
        } else if (platform.type === this.platformTypes.MOVEL && !isLargePlatform) {
            platform.moveSpeed = this.platformnormalSpecs.movel.moveSpeed * (Math.random() > 0.5 ? 1 : -1);
        }

        return platform;
    }

    updateScreenDimensions() {
        const canvas = document.getElementById('gameCanvas');
        this.screenWidth = canvas.width;
        this.screenHeight = canvas.height;
    }
    
    getAvailableTypes(isGrande, depth) {
        const thresholds = isGrande ? this.grandeCategoryThresholds : this.normalCategoryThresholds;
        return Object.keys(thresholds).filter(type => depth >= thresholds[type]);
    }

    _getRandomX(width, platformType) {
        // Special margin only for breakable platforms
        const margin = platformType === this.platformTypes.QUEBRAVEL ? 20 : 0;
        
        const leftPosition = margin;
        const centerPosition = Math.max(margin, Math.min(this.screenWidth - width - margin, this.screenWidth / 2 - width / 2));
        const rightPosition = this.screenWidth - width - margin;
        
        const rand = Math.random();
        if (rand < 0.2) {
            return leftPosition;
        } else if (rand < 0.4) {
            return rightPosition;
        } else {
            return centerPosition;
        }
    }

    _getNextY() {
        const lastPlatform = plataformas[plataformas.length - 1];
        const baseY = lastPlatform ? lastPlatform.y + lastPlatform.height : this.screenHeight - 150;
        // Espaçamento inicial
        const minSpacing = 170;
        const maxSpacing = 250;
        // Aumenta o espaçamento de acordo com a profundidade, mas de forma bem lenta
        const depth = typeof depthPoints !== 'undefined' ? depthPoints : 0;
        // O espaçamento só começa a aumentar de verdade depois de 10.000 pontos
        const slowMultiplier = 1 + Math.min(0.5, Math.max(0, (depth - 10000) / 50000)); // máximo 1.5x, começa só após 10k
        const spacing = (minSpacing + Math.random() * (maxSpacing - minSpacing)) * slowMultiplier;
        // Limite absoluto de 350px
        return baseY + Math.min(spacing, 350);
    }

    getPlatformPosition(platform) {
        const platformCenter = platform.x + platform.width / 2;
        const screenCenter = this.screenWidth / 2;
        const tolerance = 15;

        if (Math.abs(platformCenter - screenCenter) < tolerance) {
            return 'center';
        }
        return platformCenter < screenCenter ? 'left' : 'right';
    }

    needsCenterTransition(lastPlatform, penultima) {
        if (!lastPlatform || !penultima) return false;

        const lastPos = this.getPlatformPosition(lastPlatform);
        const penultimaPos = this.getPlatformPosition(penultima);

        return (lastPos !== 'center' && penultimaPos !== 'center') && 
               ((lastPos === 'left' && penultimaPos === 'right') ||
                (lastPos === 'right' && penultimaPos === 'left'));
    }
}


