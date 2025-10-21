
class InputManager {
    constructor() {        this.keys = {
            left: { pressed: false, keys: ['ArrowLeft', 'a'] },
            right: { pressed: false, keys: ['ArrowRight', 'd'] },
            down: { pressed: false, keys: ['ArrowDown', 's'] },
            jump: { pressed: false, keys: ['ArrowUp', 'w', ' ', 'z'] },
            dash: { pressed: false, keys: ['Shift'] },
            restart: { pressed: false, keys: ['r'] },
            next: { pressed: false, keys: ['n'] },
            up: { pressed: false, keys: [] } 
        };

        this.jumpKeyWasPressed = false;

        
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    
    getActionFromKey(key) {
        key = key.toLowerCase();
        for (const [action, config] of Object.entries(this.keys)) {
            if (config.keys.map(k => k.toLowerCase()).includes(key)) {
                return action;
            }
        }
        return null;
    }    
    handleKeyDown(e) {
        const action = this.getActionFromKey(e.key);
        if (action) {
            
            if (!this.keys[action].pressed) {
                this.keys[action].pressed = true;
                
                
                if (action === 'jump' && gameState === 'jogando') {
                    this.jumpKeyWasPressed = true;
                    if (typeof jump === 'function') {
                        jump(); 
                    }
                }
            }
        }
    }

    
    handleKeyUp(e) {
        const action = this.getActionFromKey(e.key);
        if (action) {
            this.keys[action].pressed = false;
            
            
            if (action === 'jump') {
                this.jumpKeyWasPressed = false;
            }
        }
    }

    
    isLeft() { return this.keys.left.pressed; }
    isRight() { return this.keys.right.pressed; }
    isUp() { return this.keys.up.pressed; }
    isDown() { return this.keys.down.pressed; }
    isJump() { return this.keys.jump.pressed; }
    isDash() { return this.keys.dash.pressed; }
    isRestart() { return this.keys.restart.pressed; }
    isNext() { return this.keys.next.pressed; }

    
    reset() {
        for (const action in this.keys) {
            this.keys[action].pressed = false;
        }
        this.jumpKeyWasPressed = false;
    }
}


const inputManager = new InputManager();

// --- Hold X to exit (neutralino) -------------------------------------------------
// Shows a small overlay while holding X and exits after 5s when allowed.
(function() {
    let exitHoldStart = 0;
    let exitTimeout = null;
    let exitInterval = null;
    let exitAttempted = false; // becomes true when timeout fires (prevents auto-restart if exit didn't close)
    const HOLD_MS = 5000;

    // create overlay element
    const exitOverlay = document.createElement('div');
    exitOverlay.style.position = 'fixed';
    exitOverlay.style.left = '50%';
    exitOverlay.style.top = '10%';
    exitOverlay.style.transform = 'translateX(-50%)';
    exitOverlay.style.padding = '12px 18px';
    exitOverlay.style.background = 'rgba(0,0,0,0.75)';
    exitOverlay.style.color = '#fff';
    exitOverlay.style.fontFamily = 'PixelFont, monospace';
    exitOverlay.style.fontSize = '16px';
    exitOverlay.style.borderRadius = '8px';
    exitOverlay.style.zIndex = 9999;
    exitOverlay.style.display = 'none';
    exitOverlay.textContent = '';
    document.body.appendChild(exitOverlay);

    function showExitOverlay(remainingMs) {
        const sec = Math.max(0, (remainingMs/1000).toFixed(1));
        exitOverlay.textContent = `Segurando X para fechar o jogo... ${sec}s`;
        exitOverlay.style.display = 'block';
    }
    function hideExitOverlay() {
        exitOverlay.style.display = 'none';
        exitOverlay.textContent = '';
    }

    function canAttemptExit() {
        // allowed when pause menu open, or on gameover, or when in loja (shop)
        try {
            if (typeof isPaused !== 'undefined' && isPaused && gameState === 'pause') return true;
            if (typeof gameState !== 'undefined' && (gameState === 'gameover' || gameState === 'loja')) return true;
        } catch (e) {}
        return false;
    }

    window.addEventListener('keydown', function(e) {
        if (e.key !== 'x' && e.key !== 'X') return;
        // ignore auto-repeat events
        if (e.repeat) return;
        if (exitAttempted) return; // already attempted exit — wait for keyup to allow another try
        if (!canAttemptExit()) return;
        if (exitTimeout) return; // already running

        exitHoldStart = performance.now();
        // update overlay immediately
        showExitOverlay(HOLD_MS);

        // interval to update overlay progress
        exitInterval = setInterval(() => {
            const elapsed = performance.now() - exitHoldStart;
            const remaining = Math.max(0, HOLD_MS - elapsed);
            showExitOverlay(remaining);
        }, 100);
    
        // final timeout to exit
        exitTimeout = setTimeout(() => {
            hideExitOverlay();
            clearInterval(exitInterval);
            exitInterval = null;
            exitTimeout = null;
            exitAttempted = true; // mark that we already tried to exit (prevents immediate restart)
            try {
                if (typeof Neutralino !== 'undefined' && Neutralino.app && typeof Neutralino.app.exit === 'function') {
                    Neutralino.app.exit();
                } else if (typeof window !== 'undefined' && window.close) {
                    // fallback for non-neutralino environments
                    window.close();
                }
            } catch (err) {
                
            }
        }, HOLD_MS);
    });

    window.addEventListener('keyup', function(e) {
        if (e.key !== 'x' && e.key !== 'X') return;
        if (exitTimeout) {
            clearTimeout(exitTimeout);
            exitTimeout = null;
        }
        if (exitInterval) {
            clearInterval(exitInterval);
            exitInterval = null;
        }
        hideExitOverlay();
        // allow future attempts after the key is released
        exitAttempted = false;
    });

    // also cancel if state changes (e.g., pause closed) to avoid accidental exit
    const stateWatch = setInterval(() => {
        if (!exitTimeout) return;
        if (!canAttemptExit()) {
            if (exitTimeout) { clearTimeout(exitTimeout); exitTimeout = null; }
            if (exitInterval) { clearInterval(exitInterval); exitInterval = null; }
            hideExitOverlay();
        }
    }, 250);

})();
