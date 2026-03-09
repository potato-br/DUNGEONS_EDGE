
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
  // preload default audio assets (place files under media/audio/)
  try { if (typeof AudioManager !== 'undefined' && typeof AudioManager.loadDefaults === 'function') AudioManager.loadDefaults(); } catch (e) {}
  // Ensure saved options override defaults after AudioManager initializes
  try {
    if (typeof window !== 'undefined' && window.OptionsMenu && typeof window.OptionsMenu.getSettings === 'function') {
      const s = window.OptionsMenu.getSettings();
      if (s) {
        try { if (AudioManager && typeof AudioManager.setMusicVolume === 'function' && typeof s.musicVolume === 'number') AudioManager.setMusicVolume(Number(s.musicVolume)); } catch (e) {}
        try { if (AudioManager && typeof AudioManager.setSfxVolume === 'function' && typeof s.sfxVolume === 'number') AudioManager.setSfxVolume(Number(s.sfxVolume)); } catch (e) {}
      }
    }
  } catch (e) {}
    setupMenuInicial(function () {
        showLoadingTransition(function (removeTransition) {
            startIntro();
            gameLoop();
            ajustarCanvas();
            setTimeout(removeTransition, 500);
        });
    });
});
