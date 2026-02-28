

let introActive = false;
let introStep = 0;
let currentText = '';
let textIndex = 0;
let lastTypingTime = 0;
const TYPING_DELAY = 50; 
const PHRASE_DELAY = 2000; 


const introPhrases = [
    "A dungeon nunca repousa... e talvez você também não devesse.",
    "Antigos poderes, antes esquecidos, despertam lentamente com a sua presença.",
    "Não espere misericórdia — este lugar não conhece gentileza.",
    "O caminho à frente é árduo, mas há prazer em cada conquista. Uma falha não define o fim.",
    "Tente quantas vezes for preciso. Com persistência, o impossível se torna real."
];

const tutorialText = 
    "Em Dungeons Edge, seu caminho o levará cada vez mais para baixo.\n\n" +
    "Os desafios à sua frente, exigem atenção e calma.\n\n" +
    "Nem tudo será simples no início, mas há formas de facilitar a jornada.\n\n" +
    "Explore os recursos disponíveis, leia com atenção — eles podem surpreender.\n\n" +
    "Há mais para descobrir, mas só quem continua descendo encontrará os segredos ocultos.\n\n" +
    "Pressione ENTER para começar...";

function startIntroTutorial() {
    introStep = 0;
        currentText = '';
        textIndex = 0;
        lastTypingTime = performance.now();
        gameState = 'intro_tutorial';
    setTimeout(() => {
        introActive = true;
    }, 1300);
}


function showLoadingScreen(callback) {
    if (gameState !== 'intro_tutorial') {
        console.log("Attempting to show loading screen outside intro tutorial state");
        return;
    }
    let blackScreen = document.createElement('div');
    blackScreen.id = 'loadingScreen';
    blackScreen.style.position = 'fixed';
    blackScreen.style.top = '0';
    blackScreen.style.left = '0';
    blackScreen.style.width = '100vw';
    blackScreen.style.height = '100vh';
    blackScreen.style.backgroundColor = 'black';
    blackScreen.style.zIndex = '9999';
    blackScreen.style.display = 'flex';
    blackScreen.style.justifyContent = 'center';
    blackScreen.style.alignItems = 'center';
    blackScreen.style.opacity = '0';
    blackScreen.style.transition = 'opacity 0.4s';
blackScreen.innerHTML = '<span style="color:white;font-size:2.5rem;font-family:PixelFont;letter-spacing:2px;">Indo para loja...</span>';
    document.body.appendChild(blackScreen);

    
    blackScreen.offsetHeight;
    blackScreen.style.opacity = '1';

    setTimeout(() => {
        if (typeof callback === 'function') {
            callback(() => {
                blackScreen.style.opacity = '0';
                setTimeout(() => {
                    if (blackScreen.parentNode) {

                        blackScreen.parentNode.removeChild(blackScreen);
                    }
                }, 400);
            });
        }
    }, 400);
}


document.addEventListener('keydown', function(e) {
    if (!introActive) return;
    
    // Para o som de digitação ao pressionar qualquer tecla para avançar
    try {
        if (typeof AudioManager !== 'undefined' && AudioManager.stop) {
            AudioManager.stop('type_sfx');
        }
    } catch (err) {}
    
    if (introStep < introPhrases.length && textIndex < introPhrases[introStep].length) {
        currentText = introPhrases[introStep];
        textIndex = introPhrases[introStep].length;
        return;
    }
    
    else if (introStep === introPhrases.length && textIndex < tutorialText.length) {
        currentText = tutorialText;
        textIndex = tutorialText.length;
        return;
    }
    
    else if (introStep < introPhrases.length) {
        introStep++;
        textIndex = 0;
        currentText = '';
        return;
    }
    
    else if (introStep === introPhrases.length && textIndex >= tutorialText.length && e.key === 'Enter') {
        introActive = false;
                showLoadingScreen((removeLoading) => {
                        resetGame({ pauseOnStart: false, showShop: true });
                        // Toca música da loja se não estiver tocando
                        try {
                            // Apply saved music volume (if the options menu saved one) before starting shop music
                            try {
                                var _mv = 0.6;
                                if (typeof OptionsMenu !== 'undefined' && OptionsMenu.getSettings) {
                                    var _s = OptionsMenu.getSettings();
                                    if (_s && typeof _s.musicVolume === 'number') _mv = _s.musicVolume;
                                    else if (AudioManager && AudioManager.getDefaultMusicVolume) _mv = AudioManager.getDefaultMusicVolume();
                                } else if (AudioManager && AudioManager.getDefaultMusicVolume) {
                                    _mv = AudioManager.getDefaultMusicVolume();
                                }
                                if (AudioManager && typeof AudioManager.setMusicVolume === 'function') {
                                    AudioManager.setMusicVolume(_mv);
                                }
                            } catch (e) {}

                            if (AudioManager && typeof AudioManager.assets === 'object' && AudioManager.assets['shop_music'] && AudioManager.assets['shop_music'].paused) {
                                AudioManager.playMusic('shop_music');
                            }
                        } catch (e) {}
                        setTimeout(removeLoading, 300);
                        updateBodyStyles(true);
                });
    }
});

function updateIntroTutorial(currentTime) {
    if (!introActive) return;

    
    const isLastTutorialText = introStep === introPhrases.length;
    const currentTextToType = isLastTutorialText ? tutorialText : introPhrases[introStep];
    
    // Só reinicia o som se houver mais texto relevante após o ponto final
    if (textIndex === 0 || (window._lastStopPoint && textIndex === window._lastStopPoint + 1)) {
        // Verifica se há mais texto relevante (não espaço, não \n)
        let nextChar = currentTextToType[textIndex];
        let hasMoreSentence = false;
        for (let i = textIndex; i < currentTextToType.length; i++) {
            if (currentTextToType[i] && ![' ', '\n'].includes(currentTextToType[i])) {
                hasMoreSentence = true;
                break;
            }
        }
        if (hasMoreSentence) {
            try {
                if (typeof AudioManager !== 'undefined' && AudioManager.play) {
                    AudioManager.play('type_sfx');
                    window._lastStopPoint = null; // limpa o marcador de ponto
                }
            } catch (err) {}
        }
    }

    if (textIndex < currentTextToType.length && currentTime - lastTypingTime >= TYPING_DELAY) {
        currentText += currentTextToType[textIndex];
        
        // Se encontramos um ponto final (e o próximo caractere não é um ponto)
        if (currentTextToType[textIndex] === '.' && currentTextToType[textIndex + 1] !== '.') {
            try {
                if (typeof AudioManager !== 'undefined' && AudioManager.stop) {
                    AudioManager.stop('type_sfx');
                    window._lastStopPoint = textIndex; // marca onde paramos para reiniciar depois
                }
            } catch (err) {}
        }
        
        textIndex++;
        lastTypingTime = currentTime;
    }
    else if (textIndex >= currentTextToType.length && currentTime - lastTypingTime >= PHRASE_DELAY) {
        // Garantir que o som pare no final da frase
        try {
            if (typeof AudioManager !== 'undefined' && AudioManager.stop) {
                AudioManager.stop('type_sfx');
            }
        } catch (err) {}
        
        if (!isLastTutorialText) {
            introStep++;
            textIndex = 0;
            currentText = '';
            lastTypingTime = currentTime;
        }
    }
    
    else if (introStep === introPhrases.length) {
        if (textIndex < tutorialText.length && currentTime - lastTypingTime >= TYPING_DELAY) {
            currentText += tutorialText[textIndex];
            textIndex++;
            lastTypingTime = currentTime;
        }
    }
}

function drawIntroTutorial() {
    
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    
    ctx.fillStyle = 'white';
    ctx.font = '24px PixelFont';
    ctx.textAlign = 'center';

    
    if (introStep < introPhrases.length) {
        ctx.fillText(currentText, canvas.width / 2, canvas.height / 2);
    } else {
        
        const lines = currentText.split('\n');
        lines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, canvas.height / 3 + index * 30);
        });
    }
}
