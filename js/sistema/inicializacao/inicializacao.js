
function showLoadingTransition(callback) {
  let blackScreen = document.createElement('div');
  blackScreen.id = 'blackScreenTransition';
  blackScreen.style.position = 'fixed';
  blackScreen.style.top = '0';
  blackScreen.style.left = '0';
  blackScreen.style.width = '100vw';
  blackScreen.style.height = '100vh';
  blackScreen.style.backgroundColor = 'black';
  blackScreen.style.zIndex = '9999';
  blackScreen.style.opacity = '1';
  blackScreen.style.display = 'flex';
  blackScreen.style.justifyContent = 'center';
  blackScreen.style.alignItems = 'center';
  blackScreen.style.transition = 'opacity 0.4s';
  blackScreen.innerHTML = '<span style="color:white;font-size:2.5rem;font-family:PixelFont;letter-spacing:2px;">Carregando...</span>';
  document.body.appendChild(blackScreen);

  setTimeout(() => {
    if (typeof callback === 'function') callback(() => {
      blackScreen.style.opacity = '0';
      setTimeout(() => {
        if (blackScreen.parentNode) blackScreen.parentNode.removeChild(blackScreen);
      }, 400);
    });
  }, 100); 
}




document.addEventListener('DOMContentLoaded', function () {
    aplicarEstilosMenuInicial();
    setupMenuInicial(function () {
        showLoadingTransition(function (removeTransition) {
            startIntroTutorial();
            gameLoop();
            ajustarCanvas();
            setTimeout(removeTransition, 500);
        });
    });
});
