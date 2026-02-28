(function(){
  
  function wrapTextLocal(ctx, text, maxWidth) {
    if (!text) return [];
    const words = String(text).split(' ');
    const lines = [];
    let line = '';
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = line ? (line + ' ' + word) : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) lines.push(line);
    return lines;
  }


  
  const DungeonTutorial = {

    showDungeonTutorial: false,
    _listeners: {}, 
    _tutorialPaused: false,
    _tutorialMovementOnly: false,
    _injectedFromShop: false,
    
    _typing: {
      fullText: null,
      revealedLength: 0,
      lastTime: 0,
      speed: 45,
      isTyping: false
    },

    _inputTracking: {
      usedArrowLeft: false,
      usedArrowRight: false,
      usedAKey: false,
      usedDKey: false,
      usedShift: false,
      shiftPressedTime: null, 
      practiceActionTime: null,
      practiceActionNext: null,
      ignoreKeyUntil: 0,
      pressedKeys: {} 
    },

    _uiConstants: {
      padding: 22,
      maxWidth: 720,
      titleFontSize: 26,
      descFontSize: 16,
      hintFontSize: 14,
      lineHeight: 26,
      borderRadius: 12,
      borderColor: '#ffd700',
      backgroundColor: '#111',
      titleColor: '#ffd700',
      textColor: '#fff',
      hintColor: '#ffddaa'
    },

    _uiText: {
  
  welcomeIntroTitle: 'Bem-vindo à Dungeon',
  welcomeIntroText: 'Bem-vindo à dungeon. É aqui que sua jornada tomara forma. e onde suas muitas tentativas de exploraçao irao acontecer. Vamos começar com o básico.',

  
  learningMovementTitle: 'Aprendendo a Se Mover',
  learningMovementText: 'Vamos primeiro aprender a se movimentar e se acustumar com sistemas basicos de controle do jogo.',

  practiceArrowsTitle: 'Prática: Setas',
  practiceArrowsText: 'Comece andando para os lados usando as setas esquerda e direita.',

  practiceADTitle: 'Prática: A/D',
  practiceADText: 'Você também pode andar para os lados usando as teclas A e D. Vamos lá, tente!',

  
  abilityIntroductionTitle: 'Habilidade: Introdução',
  abilityIntroductionText: 'Agora vamos aprender a usar a habilidade principal do seu personagem. Se você se lembrar, na loja vimos que ela e um simples avanço de uma experimentada.',

  practiceShiftTitle: 'Prática: Shift',
  practiceShiftText: 'Aperte Shift para usar sua habilidade.',

  
  uiExplanationInitTitle: 'Explicação: UI',
  uiExplanationInitText: 'Ótimo! Agora você já sabe o básico de movimentação. Vamos seguir para conhecer os elementos da sua tela.',

  depthInfoTitle: 'UI: Profundidade',
  depthInfoText: 'Essa é a sua profundidade atual. Ela influencia diretamente a dificuldade e o seu progresso nesta rodada da dungeon.',

  moneyInfoTitle: 'UI: Seu Dinheiro',
  moneyInfoText: 'Aqui fica seu dinheiro. Ele é usado na loja. Moedas aparecerão periodicamente durante a exploração. Pegue-as para aumentar seu dinheiro.',

  abilityUIExplanationTitle: 'UI: Sua habilidade ',
  abilityUIExplanationText: 'Essa e sua habilidade diponivel atualmente. Fique de olho nela para saber quando sua habilidade estiver pronta para uso novamente.',

  extraAbilityUIInfoTitle: 'UI: outras Habilidades',
  extraAbilityUIInfoText: 'Essa area tambem mostrara informações sobre outras habilidades, como recarga e quantidade de ussos. Fique de olho nela durante suas tentativas na dungeon.',

  
  survivalChallengeTitle: 'Hora de Testar suas habilidades!',
  survivalChallengeText: 'Agora é hora de testar tudo o que aprendeu! Tente sobreviver o máximo que conseguir. Boa sorte!',

  
  hintStart: 'Pressione qualquer tecla ou clique para continuar',
  hintTyping: 'Pressione qualquer tecla ou clique para completar',
  hintDone: 'Pressione qualquer tecla ou clique para continuar',
  praticehint: 'use o comando designado para continuar'
},

    _stage: 'welcomeIntro',
    _practiceSubStage: 'arrows', 
    _lastAdvanceAt: 0,

    _nextMap: {
      welcomeIntro: 'learningMovement',
      learningMovement: 'practice_arrows',
      practice_arrows: 'practice_ad',
      practice_ad: 'abilityIntroduction',
      abilityIntroduction: 'practice_shift',
      practice_shift: 'uiExplanationInit',
      uiExplanationInit: 'depthInfo',
      depthInfo: 'money',
      money: 'abilityUIExplanation',
      abilityUIExplanation: 'extraAbilityUIInfo',
      extraAbilityUIInfo: 'survivalChallenge',
      survivalChallenge: 'Dmarkseen',
    },

    

    _initFor: {
      welcomeIntro: 'welcomeIntroText',
      learningMovement: 'learningMovementText',
      practice_arrows: 'practiceArrowsText',
      practice_ad: 'practiceADText',
      practice_shift: 'practiceShiftText',
      abilityIntroduction: 'abilityIntroductionText',
      uiExplanationInit: 'uiExplanationInitText',
      depthInfo: 'depthInfoText',
      money: 'moneyInfoText',
      abilityUIExplanation: 'abilityUIExplanationText',
      extraAbilityUIInfo: 'extraAbilityUIInfoText',
      survivalChallenge: 'survivalChallengeText'
    },

    _initTyping: function(textKeyOrValue) {
      try {
        const t = DungeonTutorial._typing;
        if (typeof textKeyOrValue === 'string') {
          
          if (DungeonTutorial.hasOwnProperty(textKeyOrValue) && typeof DungeonTutorial[textKeyOrValue] === 'string') {
            t.fullText = DungeonTutorial[textKeyOrValue];
          } else if (DungeonTutorial._uiText && typeof DungeonTutorial._uiText[textKeyOrValue] === 'string') {
            t.fullText = DungeonTutorial._uiText[textKeyOrValue];
          } else {
            t.fullText = String(textKeyOrValue);
          }
        } else {
          t.fullText = (textKeyOrValue !== undefined && textKeyOrValue !== null) ? String(textKeyOrValue) : '';
        }
        t.revealedLength = 0;
        t.lastTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        t.isTyping = true;
      } catch (e) {}
    },

    _maybeAdvance: function() {
      try {
        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        if (now - (DungeonTutorial._lastAdvanceAt || 0) < 200) return;
        DungeonTutorial._lastAdvanceAt = now;
        DungeonTutorial._advanceStage();
      } catch (e) {}
    },

    _computeHint: function() {
      try {
        const t = DungeonTutorial._typing;
        const stage = DungeonTutorial._stage;
        if (stage === 'practice_arrows' || stage === 'practice_ad' || stage === 'practice_shift') return DungeonTutorial._uiText.praticehint;
        return (t.isTyping) ? DungeonTutorial._uiText.hintTyping : DungeonTutorial._uiText.hintStart;
      } catch (e) { return DungeonTutorial._uiText.hintStart; }
    },

    _isClickAllowed: function() {
      return !(DungeonTutorial._stage === 'practice_arrows' || DungeonTutorial._stage === 'practice_ad' || DungeonTutorial._stage === 'practice_shift');
    },

    _handleKeydown: function(e) {
      try {
        if (typeof gameState === 'undefined' || !(gameState === 'tutorial' || gameState === 'jogando') || !DungeonTutorial.showDungeonTutorial) return;
        const key = String(e.key || '').toLowerCase();
        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        const practiceStages = ['practice_arrows','practice_ad','practice_shift'];
        
        
        if (!practiceStages.includes(DungeonTutorial._stage) && DungeonTutorial._inputTracking.ignoreKeyUntil && now < DungeonTutorial._inputTracking.ignoreKeyUntil) {
          DungeonTutorial._inputTracking.pressedKeys[key] = true;
          e.preventDefault(); e.stopPropagation();
          return;
        }

        DungeonTutorial._checkMovement(e.key);
        if (DungeonTutorial._typing.isTyping && !practiceStages.includes(DungeonTutorial._stage) && !DungeonTutorial._inputTracking.pressedKeys[key]) {
          DungeonTutorial._typing.revealedLength = DungeonTutorial._typing.fullText ? DungeonTutorial._typing.fullText.length : 0;
          DungeonTutorial._typing.isTyping = false;
          DungeonTutorial._inputTracking.pressedKeys[key] = true;
          e.preventDefault(); e.stopPropagation();
          return;
        }

        if (!practiceStages.includes(DungeonTutorial._stage)) {
          if (!DungeonTutorial._inputTracking.pressedKeys[key]) {
            DungeonTutorial._maybeAdvance();
            DungeonTutorial._inputTracking.pressedKeys[key] = true;
            e.preventDefault(); e.stopPropagation();
          }
        }
      } catch (err) {}
    },

    _handleKeyup: function(e) {
      try {
        const key = String(e.key || '').toLowerCase();
        delete DungeonTutorial._inputTracking.pressedKeys[key];
      } catch (err) {}
    },

    _handleMousedown: function(e) {
      try {
        if (typeof gameState === 'undefined' || !(gameState === 'tutorial' || gameState === 'jogando') || !DungeonTutorial.showDungeonTutorial) return;
        if (!DungeonTutorial._isClickAllowed()) return;
        
        if (DungeonTutorial._typing.isTyping) {
          DungeonTutorial._typing.revealedLength = DungeonTutorial._typing.fullText ? DungeonTutorial._typing.fullText.length : 0;
          DungeonTutorial._typing.isTyping = false;
          e.preventDefault(); e.stopPropagation();
          return;
        }
        DungeonTutorial._maybeAdvance();
        e.preventDefault(); e.stopPropagation();
      } catch (err) {}
    },

    drawDungeonTutorialOverlay: function() {
      try {
        const canvasEl = (typeof canvas !== 'undefined') ? canvas : document.getElementById('gameCanvas');
        const ctxLocal = (typeof ctx !== 'undefined') ? ctx : (canvasEl ? canvasEl.getContext('2d') : null);
        if (!ctxLocal || !canvasEl) return;

        
        if (
          (DungeonTutorial._stage === 'practice_shift' && DungeonTutorial._inputTracking.usedShift && DungeonTutorial._inputTracking.shiftPressedTime !== null) ||
          ((DungeonTutorial._stage === 'practice_arrows' || DungeonTutorial._stage === 'practice_ad') && DungeonTutorial._inputTracking.practiceActionTime !== null)
        ) {
          const totalDuration = (typeof DASH !== 'undefined') ? (DASH.duration + DASH.extraInvuln) : 500;
          const sourceTime = (DungeonTutorial._stage === 'practice_shift') ? DungeonTutorial._inputTracking.shiftPressedTime : DungeonTutorial._inputTracking.practiceActionTime;
          const elapsed = performance.now() - sourceTime;
          if (elapsed >= totalDuration) {
            if (DungeonTutorial._stage === 'practice_shift') {
              DungeonTutorial._tutorialPaused = true;
              DungeonTutorial._tutorialMovementOnly = false;
            }
            const nextStage = DungeonTutorial._nextMap[DungeonTutorial._stage] || DungeonTutorial._inputTracking.practiceActionNext || 'uiExplanationInit';
              
              DungeonTutorial._stage = nextStage;
              try { if (typeof DungeonTutorial._saveProgress === 'function') DungeonTutorial._saveProgress(); } catch (e) {}
              DungeonTutorial._inputTracking.ignoreKeyUntil = performance.now() + 300;
            DungeonTutorial._typing.fullText = null;
            DungeonTutorial._typing.revealedLength = 0;
            DungeonTutorial._inputTracking.pressedKeys = {};
            DungeonTutorial._inputTracking.practiceActionTime = null;
            DungeonTutorial._inputTracking.practiceActionNext = null;
            return;
          }
        }
        
        const curr = DungeonTutorial._stage;
        if (curr === 'practice_arrows' || curr === 'practice_ad' || curr === 'practice_shift' && DungeonTutorial._tutorialPaused === true) {
          DungeonTutorial._tutorialPaused = false;
          DungeonTutorial._tutorialMovementOnly = true;
        }

        const padding = DungeonTutorial._uiConstants.padding;
        const maxW = Math.min(canvasEl.width - 160, DungeonTutorial._uiConstants.maxWidth);
        const titleFont = `bold ${DungeonTutorial._uiConstants.titleFontSize}px PixelFont`;

        
        const titleKey = DungeonTutorial._stage + 'Title';
        const stageTitle = (DungeonTutorial._uiText && DungeonTutorial._uiText[titleKey]) ? DungeonTutorial._uiText[titleKey] : DungeonTutorial._uiText.welcomeIntroTitle;

        
        if (DungeonTutorial._typing.fullText === null) {
          const initKey = DungeonTutorial._initFor[DungeonTutorial._stage];
          if (initKey) DungeonTutorial._initTyping(initKey);
          else if (DungeonTutorial._uiText && DungeonTutorial._uiText[DungeonTutorial._stage + 'Text']) DungeonTutorial._initTyping(DungeonTutorial._uiText[DungeonTutorial._stage + 'Text']);
        }

        
        const noOverlayStages = ['practice_arrows', 'practice_ad', 'practice_shift', 'abilityUIExplanation', 'extraAbilityUIInfo', 'money', 'depthInfo'];
        const hasNoOverlay = noOverlayStages.includes(DungeonTutorial._stage);

        
        ctxLocal.save();
        try {
          
          try { if (typeof DungeonTutorial.renderHighlight === 'function') DungeonTutorial.renderHighlight(ctxLocal, canvasEl); } catch (e) {}
        } catch (e) {}
        try {
            const stageHandlers = {
            welcomeIntro: () => DungeonTutorial._drawTutorialBox(ctxLocal, canvasEl, DungeonTutorial._uiText.welcomeIntroTitle, titleFont, padding, maxW),
            learningMovement: () => DungeonTutorial._drawTutorialBox(ctxLocal, canvasEl, DungeonTutorial._uiText.learningMovementTitle, titleFont, padding, maxW, false, true),
            practice_arrows: () => DungeonTutorial._drawTutorialBox(ctxLocal, canvasEl, DungeonTutorial._uiText.practiceArrowsTitle, titleFont, padding, maxW, true),
            practice_ad: () => DungeonTutorial._drawTutorialBox(ctxLocal, canvasEl, DungeonTutorial._uiText.practiceADTitle, titleFont, padding, maxW, true),
            abilityIntroduction: () => DungeonTutorial._drawTutorialBox(ctxLocal, canvasEl, DungeonTutorial._uiText.abilityIntroductionTitle, titleFont, padding, maxW, false),
            practice_shift: () => DungeonTutorial._drawTutorialBox(ctxLocal, canvasEl, DungeonTutorial._uiText.practiceShiftTitle, titleFont, padding, maxW, true),
            uiExplanationInit: () => DungeonTutorial._drawTutorialBox(ctxLocal, canvasEl, DungeonTutorial._uiText.uiExplanationInitTitle, titleFont, padding, maxW, false),
            depthInfo: () => DungeonTutorial._drawTutorialBox(ctxLocal, canvasEl, DungeonTutorial._uiText.depthInfoTitle, titleFont, padding, maxW, true),
            money: () => DungeonTutorial._drawTutorialBox(ctxLocal, canvasEl, DungeonTutorial._uiText.moneyInfoTitle, titleFont, padding, maxW, true),
            abilityUIExplanation: () => DungeonTutorial._drawTutorialBox(ctxLocal, canvasEl, DungeonTutorial._uiText.abilityUIExplanationTitle, titleFont, padding, maxW, true),
            extraAbilityUIInfo: () => DungeonTutorial._drawTutorialBox(ctxLocal, canvasEl, DungeonTutorial._uiText.extraAbilityUIInfoTitle, titleFont, padding, maxW, true),
            survivalChallenge: () => DungeonTutorial._drawTutorialBox(ctxLocal, canvasEl, DungeonTutorial._uiText.survivalChallengeTitle, titleFont, padding, maxW),
            Dmarkseen: () => DungeonTutorial._dungeonmarkSeen(),
          };

          const handlerFunc = stageHandlers[DungeonTutorial._stage];
          if (typeof handlerFunc === 'function') {
            try { handlerFunc(); } catch (e) {}
            ctxLocal.restore();
            return;
          }
          
          ctxLocal.fillStyle = 'rgba(255,0,0,0.55)';
          ctxLocal.fillRect(8, 8, 360, 28);
          ctxLocal.fillStyle = '#ffffff';
          ctxLocal.font = '14px PixelFont';
          ctxLocal.textAlign = 'left';
          ctxLocal.fillText('Tutorial: no handler for stage ' + DungeonTutorial._stage, 12, 28);
          ctxLocal.restore();
          return;
        } catch (e) {
          try { ctxLocal.restore(); } catch (e2) {}
          // Final fallback: try writing tutorial flags into current save slot
          try {
            (async function(){
              try {
                const last = (typeof getLastSlot === 'function') ? await getLastSlot() : null;
                if (last && window.SaveManager && typeof SaveManager.loadSlot === 'function' && typeof SaveManager.saveSlot === 'function') {
                  const slot = (await SaveManager.loadSlot(last)) || {};
                  slot.tutorials = Object.assign({}, slot.tutorials || {});
                  slot.tutorials._tutorial_End = true;
                  slot.tutorials.accepted_dungeon_tutorial = true;
                  try { await SaveManager.saveSlot(last, slot); } catch (e) {}
                }
              } catch (e) {}
            })();
          } catch (e) {}
        }
      } catch (e) {}
    },

    _drawTutorialBox: function(ctxLocal, canvasEl, title, titleFont, padding, maxW, noOverlay = false, moveUp = false) {
      const fullDesc = DungeonTutorial._typing.fullText || '';
      
      const now = performance.now();
      const lastTime = DungeonTutorial._typing.lastTime || now;
      const dt = (now - lastTime) / 1000;
      
      if (DungeonTutorial._typing.isTyping && dt > 0) {
        DungeonTutorial._typing.lastTime = now;
        const add = Math.max(1, Math.round(DungeonTutorial._typing.speed * dt));
        DungeonTutorial._typing.revealedLength = Math.min(DungeonTutorial._typing.fullText.length, DungeonTutorial._typing.revealedLength + add);
        if (DungeonTutorial._typing.revealedLength >= DungeonTutorial._typing.fullText.length) {
          DungeonTutorial._typing.isTyping = false;
        }
      }
      
      const descRevealed = fullDesc.substring(0, DungeonTutorial._typing.revealedLength);

      ctxLocal.save();
      
      if (!noOverlay) {
        ctxLocal.fillStyle = 'rgba(0,0,0,0.55)';
        ctxLocal.fillRect(0, 0, canvasEl.width, canvasEl.height);
      }

      ctxLocal.font = `${DungeonTutorial._uiConstants.descFontSize}px PixelFont`;
      const descLines = wrapTextLocal(ctxLocal, descRevealed, maxW - padding * 2);
      const lineH = DungeonTutorial._uiConstants.lineHeight;
      const boxW = maxW;
      const boxH = padding * 2 + 36 + (descLines.length * lineH) + 20;
      const boxX = (canvasEl.width - boxW) / 2;
      
      let boxY = (canvasEl.height - boxH) / 2;
      if (noOverlay) {
        boxY = canvasEl.height * 0.15;
      } else if (moveUp) {
        boxY = canvasEl.height * 0.25;
      }

      ctxLocal.fillStyle = DungeonTutorial._uiConstants.backgroundColor;
      ctxLocal.beginPath();
      if (typeof ctxLocal.roundRect === 'function') ctxLocal.roundRect(boxX, boxY, boxW, boxH, DungeonTutorial._uiConstants.borderRadius); else ctxLocal.rect(boxX, boxY, boxW, boxH);
      ctxLocal.fill();
      ctxLocal.strokeStyle = DungeonTutorial._uiConstants.borderColor;
      ctxLocal.lineWidth = 3;
      try { ctxLocal.stroke(); } catch (e) {}
      ctxLocal.globalAlpha = 1;

      ctxLocal.fillStyle = DungeonTutorial._uiConstants.titleColor;
      ctxLocal.font = titleFont;
      ctxLocal.textAlign = 'left';
      ctxLocal.fillText(title, boxX + padding, boxY + padding + 6);

      ctxLocal.font = `${DungeonTutorial._uiConstants.descFontSize}px PixelFont`;
      ctxLocal.fillStyle = DungeonTutorial._uiConstants.textColor;
      let ty = boxY + padding + 6 + 36;
      for (let i = 0; i < descLines.length; i++) {
        ctxLocal.fillText(descLines[i], boxX + padding, ty);
        ty += lineH;
      }

      ctxLocal.font = `${DungeonTutorial._uiConstants.hintFontSize}px PixelFont`;
      ctxLocal.fillStyle = DungeonTutorial._uiConstants.hintColor;
      const hint = DungeonTutorial._computeHint();
      
      const hintW = ctxLocal.measureText(hint).width;
      ctxLocal.textAlign = 'left';
      ctxLocal.fillText(hint, boxX + boxW - padding - hintW, boxY + boxH - padding + 6);

      ctxLocal.restore();
    },

    renderHighlight: function(ctxLocal, canvasEl) {
      try {
        if (!DungeonTutorial.showDungeonTutorial) return;
        const stage = DungeonTutorial._stage;
        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        const glowIntensity = 0.5 + Math.sin(now * 0.004) * 0.3;
        ctxLocal.save();
        ctxLocal.shadowColor = 'rgba(255, 215, 0, ' + glowIntensity + ')';
        ctxLocal.shadowBlur = 20;
        ctxLocal.shadowOffsetX = 0;
        ctxLocal.shadowOffsetY = 0;
        ctxLocal.strokeStyle = 'rgba(255, 215, 0, 0.8)';
        ctxLocal.lineWidth = 3;

        if (['abilityUIExplanation','extraAbilityUIInfo'].includes(stage)) {
          const startX = 50;
          const startY = 100;
          const dashCount = (typeof player !== 'undefined' && player && typeof player.maxDashes !== 'undefined' && activeCharacter === 'Kuroshi, o Ninja') ? player.maxDashes : 1;
          const spacing = 30;
          
          const highlightWidth = (stage === 'extraAbilityUIInfo') ? (dashCount * spacing) + 200 : (dashCount * spacing) + 50;
          const highlightHeight = (stage === 'extraAbilityUIInfo') ? 500 : 100;
          try {
            ctxLocal.beginPath();
            if (typeof ctxLocal.roundRect === 'function') ctxLocal.roundRect(startX - 25, startY - 20, highlightWidth, highlightHeight, 8);
            else ctxLocal.rect(startX - 25, startY - 20, highlightWidth, highlightHeight);
            ctxLocal.stroke();
          } catch (e) {}
        }

        if (stage === 'money') {
          try {
            ctxLocal.font = '20px PixelFont';
            const text = `$ ${typeof money !== 'undefined' ? money : ''}`;
            const metrics = ctxLocal.measureText(text || '$');
            const x = canvasEl.width - 90;
            const y = 30;
            const padding = 8;
            const height = 28;
            const boxX = x - metrics.width - padding;
            const boxY = y - height + 8;
            ctxLocal.beginPath();
            if (typeof ctxLocal.roundRect === 'function') ctxLocal.roundRect(boxX, boxY, metrics.width + 2 * padding, height, 8);
            else ctxLocal.rect(boxX, boxY, metrics.width + 2 * padding, height);
            ctxLocal.stroke();
          } catch (e) {}
        }

        if (stage === 'depthInfo') {
          try {
            ctxLocal.font = '20px PixelFont';
            const text = `Profundidade: ${typeof depthPoints !== 'undefined' ? Math.floor(depthPoints) : ''}`;
            const metrics = ctxLocal.measureText(text || 'Profundidade:');
            const x = canvasEl.width - 220, y = 90;
            const padding = 8;
            const height = 28;
            const boxX = x - padding;
            const boxY = y - height + 8;
            ctxLocal.beginPath();
            if (typeof ctxLocal.roundRect === 'function') ctxLocal.roundRect(boxX, boxY, metrics.width + 2 * padding, height, 8);
            else ctxLocal.rect(boxX, boxY, metrics.width + 2 * padding, height);
            ctxLocal.stroke();
          } catch (e) {}
        }
      } catch (e) {}
      try { ctxLocal.restore(); } catch (e) {}
    },

    _saveProgress: function() {
      (async function() {
        try {
          try {
            const last = (typeof getLastSlot === 'function') ? await getLastSlot() : null;
            if (last && window.SaveManager && typeof SaveManager.loadSlot === 'function' && typeof SaveManager.saveSlot === 'function') {
              const slot = (await SaveManager.loadSlot(last)) || {};
              slot.tutorials = Object.assign({}, slot.tutorials || {});
              slot.tutorials.accepted_dungeon_tutorial = true;
              slot.tutorials.dungeon_tutorial_stage = DungeonTutorial._stage;
              slot.tutorials._tutorialPaused = DungeonTutorial._tutorialPaused;
              slot.tutorials._tutorialMovementOnly = DungeonTutorial._tutorialMovementOnly;
              try { await SaveManager.saveSlot(last, slot); } catch (e) {}
            }
          } catch (e) {}
        } catch (e) {}
      })();
    },

    _dungeonmarkSeen: function() {
      DungeonTutorial.showDungeonTutorial = false;
      DungeonTutorial._injectedFromShop = true;
      DungeonTutorial._tutorialPaused = false;
      DungeonTutorial._tutorialMovementOnly = false;
      DungeonTutorial._inputTracking.pressedKeys = {};
      DungeonTutorial._inputTracking.practiceActionTime = null;
      DungeonTutorial._inputTracking.practiceActionNext = null;
      DungeonTutorial._inputTracking.ignoreKeyUntil = 0;
      try { if (typeof DungeonTutorial._saveProgress === 'function') DungeonTutorial._saveProgress(); } catch (e) {}
    },


    _advanceStage: function() {
      try {
        const typing = DungeonTutorial._typing;
        const curr = DungeonTutorial._stage;
        if (typing && typing.isTyping) {
          typing.revealedLength = typing.fullText ? typing.fullText.length : 0;
          typing.isTyping = false;
          return;
        }
        const next = DungeonTutorial._nextMap[curr];
        if (!next) return;

        

        const practiceStages = ['practice_arrows','practice_ad','practice_shift'];
        if (practiceStages.includes(curr) && !practiceStages.includes(next)) {
          try {
            DungeonTutorial._inputTracking.ignoreKeyUntil = (typeof performance !== 'undefined' && performance.now) ? performance.now() + 300 : Date.now() + 300;
          } catch (e) {}
        }

        DungeonTutorial._stage = next;
        try { if (typeof DungeonTutorial._saveProgress === 'function') DungeonTutorial._saveProgress(); } catch (e) {}
        DungeonTutorial._typing.fullText = null;
        DungeonTutorial._typing.revealedLength = 0;
        DungeonTutorial._inputTracking.pressedKeys = {};
        DungeonTutorial._inputTracking.practiceActionTime = null;
        DungeonTutorial._inputTracking.practiceActionNext = null;

        const initKey = DungeonTutorial._initFor[next];
        if (initKey) DungeonTutorial._initTyping(initKey);
        try { DungeonTutorial._saveProgress(); } catch (e) {}
      } catch (e) {}
    },

    _checkMovement: function(key) {
      try {
        const stage = DungeonTutorial._stage;
        const keyLower = String(key).toLowerCase();
        
        if (stage === 'practice_arrows') {
          if (key === 'ArrowLeft') DungeonTutorial._inputTracking.usedArrowLeft = true;
          if (key === 'ArrowRight') DungeonTutorial._inputTracking.usedArrowRight = true;
          
          if (DungeonTutorial._inputTracking.usedArrowLeft && DungeonTutorial._inputTracking.usedArrowRight) {
            if (DungeonTutorial._inputTracking.practiceActionTime === null) {
              DungeonTutorial._inputTracking.practiceActionTime = performance.now();
              DungeonTutorial._inputTracking.practiceActionNext = 'practice_ad';
              DungeonTutorial._inputTracking.pressedKeys = {};
            }
          }
          return;
        }
        
        if (stage === 'practice_ad') {
          if (keyLower === 'a') DungeonTutorial._inputTracking.usedAKey = true;
          if (keyLower === 'd') DungeonTutorial._inputTracking.usedDKey = true;
          if (DungeonTutorial._inputTracking.usedAKey && DungeonTutorial._inputTracking.usedDKey) {
            if (DungeonTutorial._inputTracking.practiceActionTime === null) {
              DungeonTutorial._inputTracking.practiceActionTime = performance.now();
              DungeonTutorial._inputTracking.practiceActionNext = 'abilityIntroduction';
              DungeonTutorial._inputTracking.pressedKeys = {};
            }
          }
          return;
        }

        if (stage === 'practice_shift') {
          if (key === 'Shift') {
            DungeonTutorial._inputTracking.usedShift = true;
            DungeonTutorial._inputTracking.shiftPressedTime = performance.now();
          }
          return;
        }
      } catch (e) {}
    },

    _detachListeners: function() {
      
      if (DungeonTutorial._listeners.keydown) {
        window.removeEventListener('keydown', DungeonTutorial._listeners.keydown, true);
      }
      if (DungeonTutorial._listeners.keyup) {
        window.removeEventListener('keyup', DungeonTutorial._listeners.keyup, true);
      }
      if (DungeonTutorial._listeners.mousedown) {
        const canvasEl = (typeof canvas !== 'undefined') ? canvas : document.getElementById('gameCanvas');
        if (canvasEl) {
          canvasEl.removeEventListener('mousedown', DungeonTutorial._listeners.mousedown, true);
        }
      }
    },

    _attachListeners: function() {
      
      DungeonTutorial._detachListeners();
      
      DungeonTutorial._listeners.keydown = DungeonTutorial._handleKeydown;
      window.addEventListener('keydown', DungeonTutorial._listeners.keydown, true);

      DungeonTutorial._listeners.keyup = DungeonTutorial._handleKeyup;
      window.addEventListener('keyup', DungeonTutorial._listeners.keyup, true);

      const canvasEl = (typeof canvas !== 'undefined') ? canvas : document.getElementById('gameCanvas');
      if (canvasEl) {
        DungeonTutorial._listeners.mousedown = DungeonTutorial._handleMousedown;
        canvasEl.addEventListener('mousedown', DungeonTutorial._listeners.mousedown, true);
      }
    }
  };

  window.DungeonTutorial = DungeonTutorial;
  
  try { DungeonTutorial._attachListeners(); } catch (e) {}

  // Intercept changes to `_stage` and `showDungeonTutorial` to help debugging
  try {
    (function() {
      const obj = DungeonTutorial;
      if (!obj) return;
      obj._stage_backup = obj._stage;
      Object.defineProperty(obj, '_stage', {
        configurable: true,
        enumerable: true,
        get: function() { return this._stage_backup; },
        set: function(v) {
          try { console.log('[DungeonTutorial] _stage ->', v, '\nStack:', (new Error()).stack); } catch (e) {}
          this._stage_backup = v;
        }
      });

      obj._show_backup = obj.showDungeonTutorial;
      Object.defineProperty(obj, 'showDungeonTutorial', {
        configurable: true,
        enumerable: true,
        get: function() { return this._show_backup; },
        set: function(v) {
          try { console.log('[DungeonTutorial] showDungeonTutorial ->', v, '\nStack:', (new Error()).stack); } catch (e) {}
          this._show_backup = v;
        }
      });
    })();
  } catch (e) {}

  // initFromSave removed: startup per-slot restore logic intentionally deleted.

})();