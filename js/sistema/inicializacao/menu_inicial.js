


function setupMenuInicial(onStart) {
    const menu = document.getElementById('menu');
    const introVideo = document.getElementById('introVideo');
    const videoElement = document.getElementById('gameIntro');
    let videoStarted = false;
    let menuReady = false; 

    
    menu.style.display = 'none';
    menu.style.opacity = '0';
    
    var canvas = document.getElementById('gameCanvas');
    
    document.body.style.backgroundImage = '';
    document.body.style.backgroundColor = '#000';

    
    function skipIntro(event) {
        if (event) event.preventDefault();
        introVideo.style.display = 'none';

        menu.style.opacity = '0';
        menu.style.display = 'flex';
        menu.style.transform = 'scale(0.5) rotate(-15deg) translateY(100px)';
        menu.style.transition = 'all 2s cubic-bezier(0.34, 1.56, 0.64, 1)';
        menu.style.filter = 'brightness(0) blur(10px)';

        setTimeout(function() {
            menu.style.opacity = '1';
            menu.style.transform = 'scale(1) rotate(0deg) translateY(0)';
            menu.style.filter = 'brightness(1) blur(0px)';
            
            setTimeout(function() {
                var menuBg = document.getElementById('menuBackground');
                var startBtn = document.getElementById('startButton');
                
                if (menuBg) {
                    menuBg.style.transition = 'all 1.5s ease-out';
                    menuBg.style.opacity = '1';
                    
                    menuBg.style.transform = 'scale(1)';
                }
                
                if (startBtn) {
                    startBtn.style.transition = 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    startBtn.style.opacity = '1';
                    startBtn.style.transform = 'translateY(0)';
                    startBtn.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.6)';
                }
                
                
                setTimeout(() => {
                    menuReady = true;
                }, 1000);
            }, 500);
        }, 100);

        videoElement.pause();
        document.removeEventListener('keydown', skipIntro);
        document.removeEventListener('click', startVideoOrSkip);
        videoElement.removeEventListener('ended', skipIntro);
    }

    
    function startVideoOrSkip(event) {
        if (!videoStarted) {
            videoStarted = true;
            videoElement.play().catch(error => {
                
                skipIntro();
            });
        } else {
            skipIntro(event);
        }
    }

    document.addEventListener('keydown', skipIntro);
    document.addEventListener('click', startVideoOrSkip);
    videoElement.addEventListener('ended', skipIntro);

    const startGame = function() {
        if (!menuReady) return; 
        menu.style.display = 'none';
        document.getElementById('gameCanvas').style.display = 'block';
        if (typeof onStart === 'function') onStart();
    };

    document.getElementById('startButton').addEventListener('click', startGame);

    
    window.addEventListener('keydown', function(e) {
        if ((e.key === 'Enter' || e.key === ' ') && menu.style.display !== 'none') {
            e.preventDefault();
            startGame();
        }
    });
}

function aplicarEstilosMenuInicial() {
    
    document.documentElement.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
    document.body.style.height = '100vh';
    document.body.style.backgroundColor = '#5e5e5e';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.scrollbarWidth = 'none';
    document.documentElement.style.msOverflowStyle = 'none';
    const style = document.createElement('style');
    style.textContent = `::-webkit-scrollbar { display: none; }`;
    document.head.appendChild(style);

    
    const menuElement = document.getElementById('menu');
    menuElement.style.position = 'absolute';
    menuElement.style.top = '0';
    menuElement.style.left = '0';
    menuElement.style.width = '100vw';
    menuElement.style.height = '100vh';
    menuElement.style.display = 'flex';
    menuElement.style.justifyContent = 'center';
    menuElement.style.alignItems = 'center';
    menuElement.style.overflow = 'hidden';

    
    const menuBackground = document.getElementById('menuBackground');
    menuBackground.style.position = 'absolute';
    menuBackground.style.top = '50';
    menuBackground.style.left = '50';
    menuBackground.style.width = '100vw';
    menuBackground.style.height = '100vh';
    menuBackground.style.objectFit = 'fill';
    menuBackground.style.zIndex = '-1';

    
    const startButton = document.getElementById('startButton');
    startButton.style.padding = '15px 40px';
    startButton.style.fontSize = '20px';
    startButton.style.fontWeight = 'bold';
    startButton.style.background = 'linear-gradient(to right,rgb(209, 192, 37), #ff0829)';
    startButton.style.color = 'white';
    startButton.style.border = 'none';
    startButton.style.marginTop = '480px';
    startButton.style.borderRadius = '10px';
    startButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    startButton.style.cursor = 'pointer';
    startButton.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
    startButton.style.zIndex = '1';
    startButton.focus();
    startButton.addEventListener('mouseover', function () {
        startButton.style.transform = 'scale(1.05)';
        startButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
    });
    startButton.addEventListener('mouseout', function () {
        startButton.style.transform = 'scale(1)';
        startButton.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    });
}

function criarMenuInicialEDOM() {
    
    var menu = document.createElement('div');
    menu.id = 'menu';
    menu.style.fontFamily = "'PixelFont', monospace";
    var menuBg = document.createElement('img');
    menuBg.id = 'menuBackground';
    menuBg.src = 'images/imagens de fundo/fundo do menuprincipal/meu-fundo.gif';
    menuBg.alt = 'Menu Fundo';
    var startBtn = document.createElement('button');
    startBtn.id = 'startButton';
    startBtn.textContent = 'Iniciar Jogo';
    startBtn.style.fontFamily = "'PixelFont', monospace";
    menu.appendChild(menuBg);
    menu.appendChild(startBtn);
    document.body.appendChild(menu);

    
    var gameContainer = document.createElement('div');
    gameContainer.className = 'game-container';
    var canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    canvas.width = 0;
    canvas.height = 0;
    gameContainer.appendChild(canvas);
    document.body.appendChild(gameContainer);
}

function criarIntroVideoEDOM() {
    var introVideo = document.createElement('div');
    introVideo.id = 'introVideo';
    var video = document.createElement('video');
    video.id = 'gameIntro';
    video.setAttribute('preload', 'auto');
    video.setAttribute('playsinline', '');
    video.setAttribute('autoplay', ''); 
    video.style.width = '100%';
    video.style.height = '100%';
    video.style.objectFit = 'contain';
    video.style.border = 'none'; 
    video.style.outline = 'none'; 
    var source = document.createElement('source');
    source.src = 'media/video introduçao.mp4'; 
    source.type = 'video/mp4';
    video.appendChild(source);
    video.innerHTML += 'Seu navegador não suporta vídeos.';
    introVideo.appendChild(video);
    var info = document.createElement('div');
    info.textContent = 'Clique para iniciar o vídeo - Pressione qualquer tecla para pular';
    info.style.position = 'absolute';
    info.style.bottom = '20px';
    info.style.right = '20px';
    info.style.color = 'white';
    info.style.fontFamily = 'PixelFont';
    introVideo.appendChild(info);
    introVideo.style.position = 'fixed';
    introVideo.style.top = '0';
    introVideo.style.left = '0';
    introVideo.style.width = '100%';
    introVideo.style.height = '100%';
    introVideo.style.background = 'black';
    introVideo.style.zIndex = '9999';
    document.body.appendChild(introVideo);
}


criarIntroVideoEDOM();


if (!document.getElementById('menu')) {
    criarMenuInicialEDOM();
}
