// Sistema de Input
class InputManager {
    constructor() {        this.keys = {
            left: { pressed: false, keys: ['ArrowLeft', 'a'] },
            right: { pressed: false, keys: ['ArrowRight', 'd'] },
            down: { pressed: false, keys: ['ArrowDown', 's'] },
            jump: { pressed: false, keys: ['ArrowUp', 'w', ' ', 'z'] },
            dash: { pressed: false, keys: ['Shift'] },
            restart: { pressed: false, keys: ['r'] },
            next: { pressed: false, keys: ['n'] },
            up: { pressed: false, keys: [] } // Se não quiser usar, deixe o array vazio
        };

        this.jumpKeyWasPressed = false;

        // Adiciona os event listeners
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    // Verifica se uma tecla específica corresponde a uma ação
    getActionFromKey(key) {
        key = key.toLowerCase();
        for (const [action, config] of Object.entries(this.keys)) {
            if (config.keys.map(k => k.toLowerCase()).includes(key)) {
                return action;
            }
        }
        return null;
    }    // Manipula o evento keydown
    handleKeyDown(e) {
        const action = this.getActionFromKey(e.key);
        if (action) {
            // Só atualiza estado se não estava pressionada antes
            if (!this.keys[action].pressed) {
                this.keys[action].pressed = true;
                
                // Lógica especial para o pulo
                if (action === 'jump' && gameState === 'jogando') {
                    this.jumpKeyWasPressed = true;
                    if (typeof jump === 'function') {
                        jump(); // Chama a função de pulo existente
                    }
                }
            }
        }
    }

    // Manipula o evento keyup
    handleKeyUp(e) {
        const action = this.getActionFromKey(e.key);
        if (action) {
            this.keys[action].pressed = false;
            
            // Reset da flag de pulo
            if (action === 'jump') {
                this.jumpKeyWasPressed = false;
            }
        }
    }

    // Métodos de consulta para cada ação
    isLeft() { return this.keys.left.pressed; }
    isRight() { return this.keys.right.pressed; }
    isUp() { return this.keys.up.pressed; }
    isDown() { return this.keys.down.pressed; }
    isJump() { return this.keys.jump.pressed; }
    isDash() { return this.keys.dash.pressed; }
    isRestart() { return this.keys.restart.pressed; }
    isNext() { return this.keys.next.pressed; }

    // Reseta todos os inputs
    reset() {
        for (const action in this.keys) {
            this.keys[action].pressed = false;
        }
        this.jumpKeyWasPressed = false;
    }
}

// Cria uma instância global do gerenciador de input
const inputManager = new InputManager();
