

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
    blackScreen.innerHTML = '<span style="color:white;font-size:2.5rem;font-family:PixelFont;">Carregando...</span>';
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
            setTimeout(removeLoading, 300);
             updateBodyStyles(true);
        });
    }
});

function updateIntroTutorial(currentTime) {
    if (!introActive) return;

    
    if (introStep < introPhrases.length) {
        
        if (textIndex < introPhrases[introStep].length && currentTime - lastTypingTime >= TYPING_DELAY) {
            currentText += introPhrases[introStep][textIndex];
            textIndex++;
            lastTypingTime = currentTime;
        }
        
        else if (textIndex >= introPhrases[introStep].length && currentTime - lastTypingTime >= PHRASE_DELAY) {
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
