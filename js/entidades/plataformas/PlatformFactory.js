



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
                breakDelay: 1500,    
                fallSpeed: 3,        
                respawnTime: 500,    
                warningTime: 800,    
                shakeMagnitude: 2    
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
                color: '#87CEFA', 
                maxHits: 3,
                fadeTime: 120, 
                fadeInTime: 30, 
                fadeOutTime: 60, 
                pulseSpeed: 0.08, 
                pulseIntensity: 0.4, 
                particleFrequency: 0.15 
            }
        };

        
        this.platformgrandeSpecs = {            
            normal: {
                width: 300, 
                height: 60, 
                color: '#9933ff',
                maxHits: 7
            },
            escorregadia: {
                width: 300, 
                height: 60, 
                color: '#33ccff',
                maxHits: 3,
                friction: 0.98
            },
            quebravel: {
                width: 300, 
                height: 50, 
                color: '#ff9933',
                maxHits: 3,
                breakTime: 2000,     
                warningTime: 1200,   
                shakeMagnitude: 3    
            },            
            fantasma: {
                width: 300, 
                height: 50, 
                color: '#E6E6FA', 
                maxHits: 3,
                fadeTime: 150, 
                fadeInTime: 40,
                fadeOutTime: 80,
                pulseSpeed: 0.06, 
                pulseIntensity: 0.5,
                particleFrequency: 0.25 
            }
        };

        this.platformSpecs = {
            normal: this.platformnormalSpecs,
            grande: this.platformgrandeSpecs
        };

        
        this.normalCategoryThresholds = {
            [this.platformTypes.NORMAL]:0,           
            [this.platformTypes.ESCORREGADIA]: 20000,   
            [this.platformTypes.QUEBRAVEL]: 40000,     
            [this.platformTypes.MOVEL]: 10000,         
            [this.platformTypes.FANTASMA]: 70000,   
        };

        this.grandeCategoryThresholds = {
            [this.platformTypes.NORMAL]: 15000,         
            [this.platformTypes.ESCORREGADIA]: 30000,  
            [this.platformTypes.QUEBRAVEL]: 60000,     
            [this.platformTypes.FANTASMA]: 75000,  
        };
    }    

    createPlatform(type, x, y) {
        
        
        
        const depth = typeof depthPoints !== 'undefined' ? depthPoints : 0;

        
        let specs;
        let baseType = type;
        let isLargePlatform = type === this.platformTypes.GRANDE;

        if (isLargePlatform) {
            
            const availableTypes = this.getAvailableTypes(true, depth);
            const subType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            specs = this.platformgrandeSpecs[subType] || this.platformgrandeSpecs.normal;
            baseType = subType; 
            
        } else {
            specs = this.platformnormalSpecs[type] || this.platformnormalSpecs.normal;
        }        
        const canvas = document.getElementById('gameCanvas');
        
        const dynamicWidth = baseType === this.platformTypes.QUEBRAVEL ? 
            Math.min(500, canvas.width - 40) : 
            Math.min(620, canvas.width - 40);  

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
        
        const minSpacing = 170;
        const maxSpacing = 250;
        
        const depth = typeof depthPoints !== 'undefined' ? depthPoints : 0;
        
        const slowMultiplier = 1 + Math.min(0.5, Math.max(0, (depth - 10000) / 50000)); 
        const spacing = (minSpacing + Math.random() * (maxSpacing - minSpacing)) * slowMultiplier;
        
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


