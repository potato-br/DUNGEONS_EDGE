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
  const Tutorial = { 
    
  showShopTutorial: true, 
  _listeners: {},
  _stage: 'consent',
  _tutorial_End: false,
  
    _typing: {
      fullText: null,
      revealedLength: 0,
      lastTime: 0,
      speed: 45, 
      isTyping: false
    },

    _markedItem: {
      itemName: null,
      startStage: null
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
      title: 'Bem-vindo à Loja',
      consentTitle: 'Ver Tutorial?',
      consentText: 'Deseja ver o tutorial? Pressione Y para sim ou N para não',
      typingTitle: 'Introdução à Loja',
      hintStart: 'Pressione qualquer tecla ou clique para continuar',
      hintTyping: 'Pressione qualquer tecla ou clique para completar',
      hintDone: 'Pressione qualquer tecla ou clique para continuar',
      shopTutorialText: 'Aqui, neste ambiente de loja, à medida que você avança na Dungeon e interage com a loja, poderá encontrar itens que auxiliam na sua jornada.',
      consentHintYN: '[Y] Sim     [N] Não',
      navigationFooter1: '"Setas/🖱️/wasd" Navegar   |   "⏎/🖱️" Confirmar   |   "Esc" ir para dungeon ',
      navigationFooter2: 'Segure X por 5s para fechar o jogo',
      previewSelectHint: 'Aguarde o texto terminar de escrever antes de navegar com o mouse ou o teclado',
      previewSelectHintDone: 'Interaja com os ícones de habilidade para continuar',
      storeBuyingIntroductionHint: 'Aguarde o texto terminar de escrever antes de interagir',
      storeBuyingIntroductionHintDone: 'Passe o cursor ou foque sobre o Cinto Relâmpago para continuar',
      buttonContinueHint: 'Clique ou selecione o botão para continuar',
      previewIntroTitle: 'introdução às Habilidades',
      previewIntroText: 'Aqui, na loja, você também poderá ver informações específicas sobre as habilidades do seu personagem. Dê uma olhada.',
      previewSelectTitle: 'introdução às Habilidades',
      previewSelectText: 'À direita do seu personagem há uma caixa. Passe o mouse ou selecione com as setas para ver a habilidade do personagem.',
      previewExplanationTitle: 'introdução às Habilidades',
      previewExplanationText: 'Essa é uma previsão de sua habilidade específica. Fique de olho nessa área onde você conseguiu ver essa previsão, mas para frente talvez algo mude.',
      buttonsTitle: 'Os Botões Principais',
      buttonsText: 'Vamos falar agora dos 3 botões na loja. Esses 3 botões têm os nomes explícitos do que eles fazem, mas vamos passar um por um para você não se perder.',
      navigationExplainedTitle: 'Barra de Navegação',
      navigationExplainedText: 'A navegação da loja fica na parte inferior da tela e permanecerá visível durante toda a sua experiência.',
      dungeonBtnTitle: 'Ir para Dungeon',
      dungeonBtnText: 'Esse botão de ir para dungeon faz você sair da loja para o dungeon.',
      settingsBtnTitle: 'Configuração',
      settingsBtnText: 'Esse botão de configuração abre o menu de configuração básico do jogo.',
      characterBtnTitle: 'Selecionar Personagem',
      characterBtnText: 'Esse botão de selecionar personagem deixa você selecionar entre personagens desbloqueados. No momento você só terá acesso ao Errante.',
      depthIntroTitle: 'Sistema de Profundidade',
      depthIntroText: 'Aqui você consegue ver informações relacionadas à profundidade',
      depthCurrentTitle: 'Profundidade Atual',
      depthCurrentText: 'A profundidade atual marca seu progresso no salvamento',
      depthNextTitle: 'Próximo Segredo',
      depthNextText: 'A profundidade até o próximo segredo será seu objetivo. Chegue até essa profundidade para liberar novos itens secretos na loja',
      depthCurrentLine: '⬇⬇⬇ Profundidade atual: {depth}m',
      depthNextLine: '(Próximo segredo em: {nextDepth}m)',
      moneyLine: 'Seu dinheiro: ${money}', 
      hintStart: 'Pressione qualquer tecla ou clique para continuar',
      moneyTitle: 'Seu Dinheiro',
      moneyText: 'Aqui você vê quantas moedas você tem. As moedas são usadas para comprar itens na loja. Colete mais moedas explorando a dungeon!',
      characterPreviewTitle: 'Visualização do Personagem',
      characterPreviewText: 'Este é o seu personagem com seus estados atuais. Você pode ver sua vida, capacidade de pulo e velocidade. Compre itens para melhorar essas estatísticas!',
      succeededDepth50Title: 'O Começo da Jornada',
      succeededDepth50Text: 'Boa! Você aguentou bem e conseguiu uma moeda! Sobreviver na dungeon não é fácil — e isso é de propósito, Sua jornada está apenas começando. A loja agora pode ter algo interessante para te ajudar nas próximas tentativas. Dê uma olhada!',
      storeBuyingIntroductionTitle: 'Introdução aos Items na Loja',
      storeBuyingIntroductionText: 'À esquerda da sua tela estão os itens da loja. Um novo item foi desbloqueado — dê uma olhada nele.',
      storeBuyingPurchaseTitle: 'Comprar Item',
      storeBuyingPurchaseText: 'Agora compre esse item para darmos continuidade.',
      storeBuyingPurchaseHint: 'Compre o item para continuar',
      storeBuyingFinalTitle: 'ultimas etapas ',
      storeBuyingFinalText: 'Ótimo! Você comprou o item e, com isso, um novo item apareceu as "Botas do Vento". Certos itens, quando comprados pela primeira vez, desbloqueiam outros itens na loja. Dê uma olhada nos novos itens; eles podem ser necessários para chegar mais fundo na dungeon. Fique atento a etiquetas como "NEW" ou "LEIA" no canto superior direito de um item, que indicam itens recém-desbloqueados. Verifique também os status do seu personagem para ver se o item adquirido trouxe alguma melhoria.',
      storeBuyingCompleteTitle: 'Boa sorte!',
      storeBuyingCompleteText: 'Com isso, o tutorial foi concluído. Agora é hora de aplicar o que aprendeu na dungeon — boa sorte! Lembre-se: a jornada é tão importante quanto o destino. Continue descendo e aprendendo a cada passo. Não esqueça o que aprendeu neste tutorial; tudo será útil durante sua jornada.',
      purchaseInstructionsTitle: 'Explicação de itens na Loja',
      purchaseInstructionsText: 'A caixa que aparece ao selecionar o Cinto Relâmpago é uma caixa de descrição. Nela são apresentados os requisitos específicos de compra, o preço (que pode variar a cada aquisição) e os efeitos que o item aplica ao seu personagem. Você conseguirá visualizar essa caixa sempre que passar o mouse sobre o item ou selecioná-lo com o teclado.',
      failedDepthButMoneyText:"Você não conseguiu sobreviver na dungeon por tempo suficiente, mas conseguiu juntar algumas moedas. Não se preocupe — você pode tentar novamente. Volte para a dungeon e tente chegar à profundidade de 50m. Boa sorte!",
      failedDepthAndMoneyText:"Você não conseguiu sobreviver na dungeon por tempo suficiente e não conseguiu juntar moedas. Não se preocupe — você pode tentar novamente. Volte para a dungeon e tente chegar à profundidade de 50m e tente pegar uma moeda. Boa sorte!",
      successDepthNoMoneyText:"Você conseguiu sobreviver por um tempo na dungeon, mas não conseguiu pegar uma moeda. Não se preocupe — você pode tentar novamente. Volte para a dungeon e tente pegar uma moeda. Boa sorte!",
      dungeonInteractionTitle: 'Preparado para a Dungeon?',
      dungeonInteractionText: 'Agora vamos para a dungeon. Selecione o botão \'Ir para a Dungeon\' usando o mouse ou o teclado.',
      failedDepth50Title: 'Quase lá',
      failedDepth50Text: 'SE VC ESTA LENDO ISSO O CODIGO DEU ERRO EM ALGUM LUGAR O POHAAAA',
    }, 

    
  
    drawShopTutorialOverlay: function() {
      try {
        const canvasEl = (typeof canvas !== 'undefined') ? canvas : document.getElementById('gameCanvas');
        const ctxLocal = (typeof ctx !== 'undefined') ? ctx : (canvasEl ? canvasEl.getContext('2d') : null);
        if (!ctxLocal || !canvasEl) return;

        const padding = Tutorial._uiConstants.padding;
        const maxW = Math.min(canvasEl.width - 160, Tutorial._uiConstants.maxWidth);
        let title = Tutorial._uiText.title;
        if (Tutorial._typing.isTyping) title = Tutorial._uiText.typingTitle;
        const titleFont = `bold ${Tutorial._uiConstants.titleFontSize}px PixelFont`;

        if (Tutorial._typing.fullText === null) {
          Tutorial._typing.fullText = Tutorial._uiText.shopTutorialText;
          Tutorial._typing.revealedLength = 0;
          Tutorial._typing.lastTime = performance.now();
          Tutorial._typing.isTyping = false;
        }

        // By default treat typing for all stages; for certain stages (consent, dungeonInteraction)
        // we want the full text visible immediately instead of showing a gradual typing effect.
        if (Tutorial._typing.isTyping) {
          const typingSkipStages = ['consent', 'dungeonInteraction'];
          if (typingSkipStages.indexOf(Tutorial._stage) !== -1) {
            // show full text immediately for skip stages
            Tutorial._typing.revealedLength = (Tutorial._typing.fullText || '').length;
            Tutorial._typing.isTyping = false;
          } else {
            const now = performance.now();
            const dt = (now - (Tutorial._typing.lastTime || now)) / 1000;
            Tutorial._typing.lastTime = now;
            const add = Math.max(1, Math.round(Tutorial._typing.speed * dt));
            Tutorial._typing.revealedLength = Math.min((Tutorial._typing.fullText || '').length, Tutorial._typing.revealedLength + add);
            if (Tutorial._typing.revealedLength >= (Tutorial._typing.fullText || '').length) {
              Tutorial._typing.isTyping = false;
            }
          }
        }

        ctxLocal.save();
        
               // By default DO NOT draw overlay; only these stages USE overlay
const overlayStages = [
  'consent',
  'shopIntro',
  'previewIntro'
];

// verifica se o estágio atual usa overlay
const hasOverlay = overlayStages.includes(Tutorial._stage);

// desenha overlay apenas se estiver na lista
if (hasOverlay) {
  ctxLocal.fillStyle = 'rgba(0,0,0,0.55)';
  ctxLocal.fillRect(0, 0, canvasEl.width, canvasEl.height);
}
        
        try {
          const hl = this._getHighlightForStage(Tutorial._stage, ctxLocal, canvasEl);
          if (hl) {
            // only draw previewSelect highlight after typing finished
            if (!(Tutorial._stage === 'previewSelect' && Tutorial._typing && Tutorial._typing.isTyping)) {
              this._drawHighlight(ctxLocal, hl, { padding: 12 });
            }
          }
        } catch (e) {}

        const stageHandlers = {
          consent: () => this._drawConsentBox(ctxLocal, canvasEl, Tutorial._uiText.consentTitle, titleFont, padding, maxW),
          shopIntro: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.typingTitle, titleFont, padding, maxW, (Tutorial._typing.fullText || Tutorial._uiText.shopTutorialText), { typing: true }),
          navigationExplained: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.navigationExplainedTitle, titleFont, padding, maxW, Tutorial._uiText.navigationExplainedText, { typing: true, yOffset: 120 }),
          buttons: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.buttonsTitle, titleFont, padding, maxW, Tutorial._uiText.buttonsText, { typing: true,}),
          dungeonBtn: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.dungeonBtnTitle, titleFont, padding, maxW, Tutorial._uiText.dungeonBtnText, { typing: true }),
          settingsBtn: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.settingsBtnTitle, titleFont, padding, maxW, Tutorial._uiText.settingsBtnText, { typing: true }),
          characterBtn: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.characterBtnTitle, titleFont, padding, maxW, Tutorial._uiText.characterBtnText, { typing: true }),
          depthIntro: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.depthIntroTitle, titleFont, padding, maxW, Tutorial._uiText.depthIntroText, { typing: true }),
          depthCurrent: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.depthCurrentTitle, titleFont, padding, maxW, Tutorial._uiText.depthCurrentText, { typing: true }),
          depthNext: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.depthNextTitle, titleFont, padding, maxW, Tutorial._uiText.depthNextText, { typing: true }),
          money: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.moneyTitle, titleFont, padding, maxW, Tutorial._uiText.moneyText, { typing: true }),
          characterPreview: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.characterPreviewTitle, titleFont, padding, maxW, Tutorial._uiText.characterPreviewText, { typing: true }),
          previewIntro: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.previewIntroTitle, titleFont, padding, maxW, Tutorial._uiText.previewIntroText, { typing: true }),
          previewSelect: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.previewSelectTitle, titleFont, padding, maxW, Tutorial._uiText.previewSelectText, { typing: true, yOffset: 120, hint: Tutorial._uiText.previewSelectHint }),
          previewExplanation: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.previewExplanationTitle, titleFont, padding, maxW, Tutorial._uiText.previewExplanationText, { typing: true, yOffset: 120 }),
          dungeonInteraction: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.dungeonInteractionTitle, titleFont, padding, maxW, Tutorial._uiText.dungeonInteractionText, { typing: true, hint: Tutorial._uiText.buttonContinueHint  }),
          failedDepth50: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.failedDepth50Title, titleFont, padding, maxW, Tutorial._uiText.failedDepth50Text, { typing: true, hint: Tutorial._uiText.buttonContinueHint }),
          succeededDepth50: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.succeededDepth50Title, titleFont, padding, maxW, Tutorial._uiText.succeededDepth50Text, { typing: true,}),
          storeBuyingIntroduction: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.storeBuyingIntroductionTitle, titleFont, padding, maxW, Tutorial._uiText.storeBuyingIntroductionText, { typing: true }),
          storeBuyingexplanation: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.purchaseInstructionsTitle, titleFont, padding, maxW, Tutorial._uiText.purchaseInstructionsText, { typing: true, yOffset: -120 }),
          storeBuyingPurchase: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.storeBuyingPurchaseTitle, titleFont, padding, maxW, Tutorial._uiText.storeBuyingPurchaseText, { typing: true, hint: Tutorial._uiText.storeBuyingPurchaseHint, yOffset: -80 }),
          storeBuyingFinal: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.storeBuyingFinalTitle || 'placeholder', titleFont, padding, maxW, Tutorial._uiText.storeBuyingFinalText || 'placeholder', { typing: true, yOffset: -80 }),
          storeBuyingComplete: () => this._drawStandardBox(ctxLocal, canvasEl, Tutorial._uiText.storeBuyingCompleteTitle || 'placeholder', titleFont, padding, maxW, Tutorial._uiText.storeBuyingCompleteText || 'placeholder', { typing: true, yOffset: -80 }),
          markseen: () => { Tutorial.showShopTutorial = false; Tutorial.savemarkSeen(); },
        };
        

        const handler = stageHandlers[Tutorial._stage];
        if (typeof handler === 'function') {
          handler();
          ctxLocal.restore();
          return;
        } else {
          try {
            console.warn('Tutorial: no handler for stage', Tutorial._stage);
            ctxLocal.save();
            ctxLocal.fillStyle = 'rgba(255,0,0,0.55)';
            ctxLocal.fillRect(8, 8, 360, 28);
            ctxLocal.fillStyle = '#ffffff';
            ctxLocal.font = '14px PixelFont';
            ctxLocal.textAlign = 'left';
            ctxLocal.fillText('Missing tutorial handler: ' + String(Tutorial._stage), 12, 28);
            ctxLocal.restore();
          } catch (e) {}
          ctxLocal.restore();
          return;
        }
      } catch (e) {
        
      }
    },

    

    _drawConsentBox: function(ctxLocal, canvasEl, title, titleFont, padding, maxW) {
      ctxLocal.font = `${Tutorial._uiConstants.descFontSize}px PixelFont`;
      const consentText = Tutorial._uiText.consentText;
      const lines = wrapTextLocal(ctxLocal, consentText, maxW - padding * 2);
      const lineH = Tutorial._uiConstants.lineHeight;
      const boxW = maxW;
      const boxH = padding * 2 + 36 + (lines.length * lineH) + 20;
      const boxX = (canvasEl.width - boxW) / 2;
      const boxY = (canvasEl.height - boxH) / 2;
        try {
          ctxLocal.fillStyle = Tutorial._uiConstants.backgroundColor;
          ctxLocal.beginPath();
          if (typeof ctxLocal.roundRect === 'function') ctxLocal.roundRect(boxX, boxY, boxW, boxH, Tutorial._uiConstants.borderRadius); else ctxLocal.rect(boxX, boxY, boxW, boxH);
          ctxLocal.fill();
          ctxLocal.strokeStyle = Tutorial._uiConstants.borderColor;
          ctxLocal.lineWidth = 3;
          try { ctxLocal.stroke(); } catch (e) {}
          ctxLocal.globalAlpha = 1;

          ctxLocal.fillStyle = Tutorial._uiConstants.titleColor;
          ctxLocal.font = titleFont;
          ctxLocal.textAlign = 'left';
          ctxLocal.fillText(title, boxX + padding, boxY + padding + 6);

          ctxLocal.font = `${Tutorial._uiConstants.descFontSize}px PixelFont`;
          ctxLocal.fillStyle = Tutorial._uiConstants.textColor;
          let ty = boxY + padding + 6 + 36;
          for (let i = 0; i < lines.length; i++) {
            ctxLocal.fillText(lines[i], boxX + padding, ty);
            ty += lineH;
          }

          ctxLocal.font = `${Tutorial._uiConstants.hintFontSize}px PixelFont`;
          ctxLocal.fillStyle = Tutorial._uiConstants.hintColor;
          const hint = Tutorial._uiText.consentHintYN || '[Y] Sim     [N] Não';
          const hintW = ctxLocal.measureText(hint).width;
          ctxLocal.textAlign = 'left';
          ctxLocal.fillText(hint, boxX + boxW - padding - hintW, boxY + boxH - padding + 6);
        } catch (err) {
          try {
            ctxLocal.save();
            ctxLocal.globalAlpha = 1;
            const fbW = Math.min(maxW || 600, 600);
            const fbH = 160;
            const fbX = (canvasEl.width - fbW) / 2;
            const fbY = (canvasEl.height - fbH) / 2;
            ctxLocal.fillStyle = Tutorial._uiConstants.backgroundColor;
            ctxLocal.fillRect(fbX, fbY, fbW, fbH);
            ctxLocal.strokeStyle = Tutorial._uiConstants.borderColor;
            ctxLocal.lineWidth = 3;
            try { ctxLocal.strokeRect(fbX, fbY, fbW, fbH); } catch (e) {}
            ctxLocal.fillStyle = Tutorial._uiConstants.titleColor;
            ctxLocal.font = titleFont;
            ctxLocal.textAlign = 'left';
            ctxLocal.fillText(title, fbX + 12, fbY + 28);
            ctxLocal.fillStyle = Tutorial._uiConstants.hintColor;
            ctxLocal.font = `${Tutorial._uiConstants.hintFontSize}px PixelFont`;
            const hintText = Tutorial._uiText.consentHintYN || '[Y] Sim     [N] Não';
            ctxLocal.fillText(hintText, fbX + fbW - 200, fbY + fbH - 12);
            ctxLocal.restore();
          } catch (e2) {}
        }

      
      
    },

    _drawStandardBox: function(ctxLocal, canvasEl, title, titleFont, padding, maxW, descText, opts) {
      opts = opts || {};
      const typing = !!opts.typing;
      const yOffset = Number(opts.yOffset) || 0;
      ctxLocal.font = `${Tutorial._uiConstants.descFontSize}px PixelFont`;
      let lines = [];
      if (typing) {
        const revealedLength = Tutorial._typing.revealedLength || 0;
        const revealedText = String(descText || '').substring(0, revealedLength);
        lines = wrapTextLocal(ctxLocal, revealedText, maxW - padding * 2);
      } else {
        lines = wrapTextLocal(ctxLocal, String(descText || ''), maxW - padding * 2);
      }
      const lineH = Tutorial._uiConstants.lineHeight;
      const boxW = maxW;
      const boxH = padding * 2 + 36 + (lines.length * lineH) + 20;
      const boxX = (canvasEl.width - boxW) / 2;
      const boxY = (canvasEl.height - boxH) / 2 + yOffset;

      
      ctxLocal.fillStyle = Tutorial._uiConstants.backgroundColor;
      ctxLocal.beginPath();
      if (typeof ctxLocal.roundRect === 'function') ctxLocal.roundRect(boxX, boxY, boxW, boxH, Tutorial._uiConstants.borderRadius); else ctxLocal.rect(boxX, boxY, boxW, boxH);
      ctxLocal.fill();
      ctxLocal.strokeStyle = Tutorial._uiConstants.borderColor;
      ctxLocal.lineWidth = 3;
      try { ctxLocal.stroke(); } catch (e) {}
      ctxLocal.globalAlpha = 1;

      
      ctxLocal.fillStyle = Tutorial._uiConstants.titleColor;
      ctxLocal.font = titleFont;
      ctxLocal.textAlign = 'left';
      ctxLocal.fillText(title, boxX + padding, boxY + padding + 6);

      
      ctxLocal.font = `${Tutorial._uiConstants.descFontSize}px PixelFont`;
      ctxLocal.fillStyle = Tutorial._uiConstants.textColor;
      let ty = boxY + padding + 6 + 36;
      for (let i = 0; i < lines.length; i++) {
        ctxLocal.fillText(lines[i], boxX + padding, ty);
        ty += lineH;
      }

      
      ctxLocal.font = `${Tutorial._uiConstants.hintFontSize}px PixelFont`;
      ctxLocal.fillStyle = Tutorial._uiConstants.hintColor;
      const isTyping = Tutorial._typing.isTyping !== false;
      let hint = null;
      try {
        if (Tutorial._stage === 'previewSelect') {
          hint = (Tutorial._typing && Tutorial._typing.isTyping) ? Tutorial._uiText.previewSelectHint : (Tutorial._uiText.previewSelectHintDone || Tutorial._uiText.previewSelectHint);
        } else if (Tutorial._stage === 'storeBuyingIntroduction') {
          hint = (Tutorial._typing && Tutorial._typing.isTyping) ? Tutorial._uiText.storeBuyingIntroductionHint : (Tutorial._uiText.storeBuyingIntroductionHintDone || Tutorial._uiText.storeBuyingIntroductionHint);
        } else {
          hint = opts.hint || (isTyping && typing ? Tutorial._uiText.hintTyping : Tutorial._uiText.hintDone);
        }
      } catch (e) {
        hint = opts.hint || (isTyping && typing ? Tutorial._uiText.hintTyping : Tutorial._uiText.hintDone);
      }
      const hintW = ctxLocal.measureText(hint).width;
      ctxLocal.textAlign = 'left';
      ctxLocal.fillText(hint, boxX + boxW - padding - hintW, boxY + boxH - padding + 6);

      return { boxX, boxY, boxW, boxH, lines };
    },

    _computeBoundingBox: function(rects) {
      if (!rects || rects.length === 0) return null;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const r of rects) {
        if (!r) continue;
        minX = Math.min(minX, r.x);
        minY = Math.min(minY, r.y);
        maxX = Math.max(maxX, r.x + r.w);
        maxY = Math.max(maxY, r.y + r.h);
      }
      if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) return null;
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    },

    _formatUiText: function(key, vars) {
      try {
        const tpl = (Tutorial._uiText && Tutorial._uiText[key]) ? String(Tutorial._uiText[key]) : '';
        if (!tpl) return '';
        if (!vars || typeof vars !== 'object') return tpl;
        return tpl.replace(/\{(\w+)\}/g, function(_, name) {
          return (vars[name] !== undefined && vars[name] !== null) ? String(vars[name]) : '';
        }).replace(/\$\{(\w+)\}/g, function(_, name) {
          return (vars[name] !== undefined && vars[name] !== null) ? String(vars[name]) : '';
        });
      } catch (e) { return '';}
    },

    _drawHighlight: function(ctxLocal, rect, opts) {
      try {
        if (!rect) return;
        opts = opts || {};
        const pad = Number(opts.padding) || 15;
        const fill = opts.fill || '#ffe066';
        const stroke = opts.stroke || '#ffd700';
        const alpha = typeof opts.alpha === 'number' ? opts.alpha : 0.2;
        const lineWidth = typeof opts.lineWidth === 'number' ? opts.lineWidth : 4;
        const shadowColor = opts.shadowColor || 'rgba(255, 215, 0, 0.6)';
        const shadowBlur = typeof opts.shadowBlur === 'number' ? opts.shadowBlur : 15;

        ctxLocal.save();
        ctxLocal.globalAlpha = alpha;
        ctxLocal.fillStyle = fill;
        ctxLocal.fillRect(rect.x - pad, rect.y - pad, rect.w + pad * 2, rect.h + pad * 2);
        ctxLocal.globalAlpha = 1;
        ctxLocal.strokeStyle = stroke;
        ctxLocal.lineWidth = lineWidth;
        ctxLocal.shadowColor = shadowColor;
        ctxLocal.shadowBlur = shadowBlur;
        ctxLocal.shadowOffsetX = 0;
        ctxLocal.shadowOffsetY = 0;
        ctxLocal.strokeRect(rect.x - pad + 0.5, rect.y - pad + 0.5, rect.w + pad * 2 - 1, rect.h + pad * 2 - 1);
        ctxLocal.restore();
      } catch (e) {}
    },

    _getHighlightForStage: function(stage, ctxLocal, canvasEl) {
      try {
        if (!stage) return null;
        
        if (stage === 'previewSelect') {
          if (typeof modalPreviewRects !== 'undefined' && modalPreviewRects.length > 0) {
            const nonModal = modalPreviewRects.filter(p => p && p.modal === false);
            return this._computeBoundingBox(nonModal);
          }
          return null;
        }

        
        if (stage === 'navigationExplained') {
          try {
            const navText1 = Tutorial._uiText.navigationFooter1 || '"Setas/🖱️/wasd" Navegar   |   "⏎/🖱️" Confirmar   |   "Esc" ir para dungeon ';
            const navText2 = Tutorial._uiText.navigationFooter2 || 'Segure X por 5s para fechar o jogo';
            ctxLocal.font = '24px PixelFont';
            const navWidth1 = ctxLocal.measureText(navText1).width;
            ctxLocal.font = '18px PixelFont';
            const navWidth2 = ctxLocal.measureText(navText2).width;
            const navX = 20;
            const navY1 = canvasEl.height - 30;
            const navY2 = canvasEl.height - 60;
            const maxNavWidth = Math.max(navWidth1, navWidth2);
            return { x: navX - 8, y: navY2 - 18 - 8, w: maxNavWidth + 16, h: (navY1 - navY2) + 24 + 16 };
          } catch (e) { return null; }
        }

        
        if (stage === 'dungeonInteraction' || stage === 'dungeonBtn' || stage === 'failedDepth50') {
          try { if (typeof getDungeonBtnRect === 'function') return getDungeonBtnRect(); } catch (e) {}
        }

        
        if (stage === 'buttons') {
          try {
            const rects = [];
            if (typeof getDungeonBtnRect === 'function') {
              const r = getDungeonBtnRect(); if (r) rects.push(r);
            }
            if (typeof getSettingsBtnRect === 'function') {
              const r = getSettingsBtnRect(); if (r) rects.push(r);
            }
            if (typeof getCharacterBtnRect === 'function') {
              const r = getCharacterBtnRect(); if (r) rects.push(r);
            }
            if (rects.length > 0) return this._computeBoundingBox(rects);
          } catch (e) {}
        }

        
        if (stage === 'settingsBtn') {
          try { if (typeof getSettingsBtnRect === 'function') return getSettingsBtnRect(); } catch (e) {}
        }

        
        if (stage === 'characterBtn') {
          try { if (typeof getCharacterBtnRect === 'function') return getCharacterBtnRect(); } catch (e) {}
        }

        
        if (stage === 'depthIntro' || stage === 'depthCurrent' || stage === 'depthNext') {
          try {
            let baseRect = null;
            if (typeof getCharacterBtnRect === 'function') baseRect = getCharacterBtnRect();
            else if (typeof getDungeonBtnRect === 'function') baseRect = getDungeonBtnRect();
            if (!baseRect) return null;

            const profFontSize = Math.max(14, Math.min(canvasEl.width * 0.017, 22));
            const profX = baseRect.x + baseRect.w / 2;
            const profY = baseRect.y + baseRect.h + profFontSize + 10;

            
            ctxLocal.font = `bold ${profFontSize}px PixelFont`;
            const depthVal = (typeof depthPoints !== 'undefined') ? depthPoints : '';
            const line1 = this._formatUiText('depthCurrentLine', { depth: depthVal });
            const w1 = ctxLocal.measureText(line1).width;

            
            let nextSecretDepth = null;
            try {
              if (typeof SECRET_ITEMS !== 'undefined' && Array.isArray(SECRET_ITEMS) && typeof shopItems !== 'undefined' && Array.isArray(shopItems)) {
                nextSecretDepth = SECRET_ITEMS.filter(item => !shopItems.find(i => i.nome === item.nome)).reduce((nearest, item) => item.requiredDepth > depthPoints && (nearest === null || item.requiredDepth < nearest) ? item.requiredDepth : nearest, null);
              }
            } catch (e) { nextSecretDepth = null; }

            let w2 = 0;
            if (nextSecretDepth) {
              const smallFont = Math.max(12, Math.floor(profFontSize * 0.8));
              ctxLocal.font = `bold ${smallFont}px PixelFont`;
              const line2 = this._formatUiText('depthNextLine', { nextDepth: nextSecretDepth });
              w2 = ctxLocal.measureText(line2).width;
            }

            const padding = 14;
            let boxW = Math.max(w1, w2) + padding * 2;
            
            boxW = Math.max(120, Math.round(boxW * 0.87));
            const boxX = profX - boxW / 2;

            if (stage === 'depthCurrent') {
              const boxH = profFontSize + padding;
              const boxY = profY - profFontSize - (padding / 2);
              return { x: boxX, y: boxY, w: boxW, h: boxH };
            }

            if (stage === 'depthNext') {
              const smallFont = Math.max(12, Math.floor(profFontSize * 0.8));
              const boxH = smallFont + padding;
              const boxY = profY + (padding / 2);
              return { x: boxX, y: boxY, w: boxW, h: boxH };
            }

            
            if (stage === 'depthIntro') {
              const smallFont = Math.max(12, Math.floor(profFontSize * 0.8));
              const totalH = profFontSize + (nextSecretDepth ? (smallFont + 6) : 0) + padding * 1.5;
              const topY = profY - profFontSize - (padding / 2);
              return { x: boxX, y: topY, w: boxW, h: totalH };
            }
          } catch (e) {}
        }

        
        if (stage === 'money') {
          try {
            ctxLocal.font = '28px PixelFont';
            const text = this._formatUiText('moneyLine', { money: (typeof money !== 'undefined' ? money : '') });
            const x = 20;
            const y = 100;
            const metrics = ctxLocal.measureText(text);
            const padding = 8;
            const height = 28;
            return { x: x - padding, y: y - height + 8, w: Math.ceil(metrics.width) + padding * 2, h: height };
          } catch (e) { }
        }

        
        if (stage === 'characterPreview') {
          try {
            const cx = 190, cy = 177; 
            const scale = 3.7;
            let frameW = null, frameH = null;
            if (typeof playerSprites !== 'undefined' && playerSprites[activeCharacter] && playerSprites[activeCharacter].config) {
              const cfg = playerSprites[activeCharacter].config[2] || playerSprites[activeCharacter].config[0];
              frameW = (cfg && cfg.frameWidth) ? cfg.frameWidth : null;
              frameH = (cfg && cfg.frameHeight) ? cfg.frameHeight : null;
            }
            if (frameW && frameH) {
              const fw = Math.round(frameW * scale);
              const fh = Math.round(frameH * scale);
              const pad = 12;
              const extraPadX = 20; 
              const extraPadY = 1;  
              return { x: Math.round(cx - fw/2) - pad - extraPadX, y: Math.round(cy - fh/2) - pad - extraPadY, w: fw + pad * 2 + extraPadX * 2, h: fh + pad * 2 + extraPadY * 2 };
            }
            
            return { x: 80, y: 40, w: 220, h: 240 };
          } catch (e) { }
        }

        // If an item was marked, compute highlight rects per-stage:
        // - For the purchase stage (`storeBuyingPurchase`) highlight the item itself.
        // - For the explanation (`storeBuyingexplanation`) and previewExplanation highlight the description box.
        if (stage === 'storeBuyingPurchase' || stage === 'storeBuyingFinal') {
          try {
            if (Tutorial && Tutorial._markedItem && Tutorial._markedItem.itemName) {
              if (typeof shopItems !== 'undefined' && typeof isItemVisible === 'function' && Array.isArray(lojaOptionRects)) {
                const visibleItems = shopItems.filter(it => isItemVisible(it));
                const idx = visibleItems.findIndex(it => it && it.nome === Tutorial._markedItem.itemName);
                if (idx >= 0) {
                  const rect = lojaOptionRects.find(r => r && r.index === idx);
                  if (rect) {
                    // highlight the item rect directly during the purchase stage
                    return { x: rect.x, y: rect.y, w: rect.w, h: rect.h };
                  }
                }
              }
            }
          } catch (e) {}
        } else if (stage === 'storeBuyingexplanation' || stage === 'previewExplanation') {
          try {
            if (Tutorial && Tutorial._markedItem && Tutorial._markedItem.itemName) {
              if (typeof shopItems !== 'undefined' && typeof isItemVisible === 'function' && Array.isArray(lojaOptionRects)) {
                const visibleItems = shopItems.filter(it => isItemVisible(it));
                const idx = visibleItems.findIndex(it => it && it.nome === Tutorial._markedItem.itemName);
                if (idx >= 0) {
                  const rect = lojaOptionRects.find(r => r && r.index === idx);
                  if (rect) {
                    const item = visibleItems[idx];
                    ctxLocal.save();
                    ctxLocal.font = 'bold 18px PixelFont';
                    const nomeWidth = ctxLocal.measureText(item.nome).width;
                    ctxLocal.font = '16px PixelFont';
                    const maxDescWidth = 320;
                    const descLines = wrapTextLocal(ctxLocal, item.descricao || '', maxDescWidth);
                    const descLineCount = Math.max(1, Math.min(descLines.length, 6));
                    const descWidth = descLines.reduce((w, l) => Math.max(w, ctxLocal.measureText(l).width), 0);
                    const comprasAtual = (typeof getPurchasesCountByName === 'function') ? (getPurchasesCountByName(item.nome) || 0) : 0;
                    let precoText = comprasAtual >= item.maxCompras ? (typeof characterData !== 'undefined' && characterData && characterData[item.nome] ? 'Trocar de personagem?' : 'MAX') : `Preço: $${item.preco} (${comprasAtual}/${item.maxCompras})`;
                    const precoWidth = ctxLocal.measureText(precoText).width;
                    const reqWidth = 0;
                    const maxWidth = Math.max(220, nomeWidth, descWidth, precoWidth, reqWidth) + 30;
                    const lineHeight = 22;
                    const baseLines = 3;
                    const linesCount = baseLines - 1 + descLineCount + (item.isStartDepthItem ? 1 : 0);
                    const boxHeight = linesCount * lineHeight + 18;
                    let infoX = rect.x + rect.w + 30;
                    let infoY = rect.y + 10;
                    if (infoX + maxWidth > canvasEl.width) infoX = canvasEl.width - maxWidth - 20;
                    if (infoX < 0) infoX = 10;
                    if (infoY + boxHeight + 20 > canvasEl.height) infoY = canvasEl.height - boxHeight - 30;
                    if (infoY < 0) infoY = 10;
                    ctxLocal.restore();
                    return { x: infoX - 10, y: infoY + 10, w: maxWidth, h: boxHeight };
                  }
                }
              }
            }
          } catch (e) {}
        }

        return null;
      } catch (e) { return null; }
    },
    savemarkSeen: function() {
      (async function() {
        try {
          try {
            const last = (typeof getLastSlot === 'function') ? await getLastSlot() : null;
            if (last && window.SaveManager && typeof SaveManager.loadSlot === 'function' && typeof SaveManager.saveSlot === 'function') {
              const slot = (await SaveManager.loadSlot(last)) || {};
              slot.tutorials = Object.assign({}, slot.tutorials || {});
              slot.tutorials.accepted_dungeon_tutorial = true;
              slot.tutorials.showShopTutorial = false;
              slot.tutorials.shop_tutorial_stage = Tutorial._stage;
              slot.tutorials._tutorial_End = true;
              slot.tutorials.tutorial_paused = DungeonTutorial._tutorialPaused;
              slot.tutorials.tutorial_movement_only = DungeonTutorial._tutorialMovementOnly;
              slot.tutorials.dungeon_tutorial_stage = (typeof DungeonTutorial !== 'undefined' ? DungeonTutorial._stage : slot.tutorials.dungeon_tutorial_stage);
              try { await SaveManager.saveSlot(last, slot); } catch (e) {}
            }
          } catch (e) {}
        } catch (e) {}
      })();

    },

    _saveProgress: function() {
      (async function() {
        try {
          try {
            const last = (typeof getLastSlot === 'function') ? await getLastSlot() : null;
            if (last && window.SaveManager && typeof SaveManager.loadSlot === 'function' && typeof SaveManager.saveSlot === 'function') {
              const slot = (await SaveManager.loadSlot(last)) || {};
              slot.tutorials = Object.assign({}, slot.tutorials || {});
              slot.tutorials.shop_tutorial_stage = Tutorial._stage;
              try { await SaveManager.saveSlot(last, slot); } catch (e) {}
            }
          } catch (e) {}
        } catch (e) {}
      })();
    },

    _initTyping: function(textKey) {
      try {
        const t = Tutorial._typing;
        
        if (typeof textKey === 'string' && (Tutorial._uiText && typeof Tutorial._uiText[textKey] === 'string')) {
          t.fullText = Tutorial._uiText[textKey] || '';
        } else {
          
          t.fullText = (textKey !== undefined && textKey !== null) ? String(textKey) : '';
        }
        t.revealedLength = 0;
        t.lastTime = performance.now();
        t.isTyping = true;
      } catch (e) {}
    },

    _lastAdvanceAt: 0,
    _maybeAdvance: function() {
      try {
        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        
        if (now - (Tutorial._lastAdvanceAt || 0) < 200) return;
        Tutorial._lastAdvanceAt = now;
        Tutorial._advanceStage();
      } catch (e) {}
    },

    _didTransferToDungeon: false,
    _transferDungeonStateToDungeon: async function() {
      try {
        if (Tutorial._didTransferToDungeon) return;
        Tutorial._didTransferToDungeon = true;
        let stage = null;
        try {
          try {
            const last = (typeof getLastSlot === 'function') ? await getLastSlot() : null;
            if (last && window.SaveManager && typeof SaveManager.loadSlot === 'function') {
              try {
                const slot = await SaveManager.loadSlot(last);
                if (slot && slot.tutorials && slot.tutorials.dungeon_tutorial_stage) stage = slot.tutorials.dungeon_tutorial_stage;
              } catch (e) {}
            }
          } catch (e) {}
        } catch (e) {}

        if (!stage && window.DungeonTutorial && DungeonTutorial._stage) stage = DungeonTutorial._stage;

        if (window.DungeonTutorial) {
          try {
            DungeonTutorial.showDungeonTutorial = true;
            if (stage) DungeonTutorial._stage = stage;
            DungeonTutorial._typing.fullText = null;
            DungeonTutorial._typing.revealedLength = 0;
            DungeonTutorial._inputTracking = DungeonTutorial._inputTracking || {};
            DungeonTutorial._inputTracking.pressedKeys = {};
            DungeonTutorial._inputTracking.practiceActionTime = null;
            DungeonTutorial._inputTracking.practiceActionNext = null;
            DungeonTutorial._inputTracking.ignoreKeyUntil = (typeof performance !== 'undefined' && performance.now) ? performance.now() + 300 : Date.now() + 300;
            try {
              if (typeof DungeonTutorial._initFor === 'object' && DungeonTutorial._initFor && DungeonTutorial._initFor[DungeonTutorial._stage]) {
                DungeonTutorial._initTyping(DungeonTutorial._initFor[DungeonTutorial._stage]);
              } else if (DungeonTutorial._uiText && DungeonTutorial._uiText[DungeonTutorial._stage + 'Text']) {
                DungeonTutorial._initTyping(DungeonTutorial._uiText[DungeonTutorial._stage + 'Text']);
              } else {
                DungeonTutorial._typing.fullText = null;
                DungeonTutorial._typing.revealedLength = 0;
                DungeonTutorial._typing.isTyping = false;
              }
            } catch (e) {}
            try { DungeonTutorial._attachListeners(); } catch (e) {}
          } catch (e) {}
        }
      } catch (e) {}
    },

    _advanceStage: function() {
      const typing = Tutorial._typing;

      const completeTyping = () => {
        typing.revealedLength = typing.fullText ? typing.fullText.length : 0;
        typing.isTyping = false;
      };

      if (Tutorial._stage === 'consent') return;
      if (Tutorial._stage === 'dungeonInteraction') return;
     

      
      if (typing.isTyping) {
        const typingSkipStages = ['consent', 'dungeonInteraction'];
        if (typingSkipStages.indexOf(Tutorial._stage) === -1) { completeTyping(); return; }
      }
      

      const nextMap = {
        shopIntro: 'navigationExplained',
        navigationExplained: 'buttons',
        buttons: 'dungeonBtn',
        dungeonBtn: 'settingsBtn',
        settingsBtn: 'characterBtn',
        characterBtn: 'depthIntro',
        depthIntro: 'depthCurrent',
        depthCurrent: 'depthNext',
        depthNext: 'money',
        money: 'characterPreview',
        characterPreview: 'previewIntro',
        previewIntro: 'previewSelect',
        previewSelect: 'previewExplanation',
        previewExplanation: 'dungeonInteraction',
        succeededDepth50: 'storeBuyingIntroduction',
        storeBuyingIntroduction: 'storeBuyingexplanation',
        storeBuyingexplanation: 'storeBuyingPurchase',
        storeBuyingPurchase: 'storeBuyingFinal',
        storeBuyingFinal: 'storeBuyingComplete',
        storeBuyingComplete: 'markseen',
  
      };

      const initFor = {
        navigationExplained: 'navigationExplainedText',
        buttons: 'buttonsText',
        dungeonBtn: 'dungeonBtnText',
        settingsBtn: 'settingsBtnText',
        characterBtn: 'characterBtnText',
        depthIntro: 'depthIntroText',
        depthCurrent: 'depthCurrentText',
        depthNext: 'depthNextText',
        money: 'moneyText',
        characterPreview: 'characterPreviewText',
        previewIntro: 'previewIntroText',
        previewSelect: 'previewSelectText',
        previewExplanation: 'previewExplanationText',
        dungeonInteraction: 'dungeonInteractionText',
        storeBuyingIntroduction: 'storeBuyingIntroductionText',
        storeBuyingexplanation: 'purchaseInstructionsText',
        storeBuyingPurchase: 'storeBuyingPurchaseText',
        storeBuyingFinal: 'storeBuyingFinalText',
        storeBuyingComplete: 'storeBuyingCompleteText',
        failedDepth50: 'failedDepth50Text',
      };
      if (typing.isTyping) {
        const typingSkipStages = ['consent', 'dungeonInteraction'];
        if (typingSkipStages.indexOf(Tutorial._stage) === -1) { completeTyping(); return; }
      }

      const curr = Tutorial._stage;
      const next = nextMap[curr];
      if (!next) return;

      

      

      Tutorial._stage = next;
      // Clear marked item when entering certain phases. Keep it for stages where
      // we still need the previously-marked item (storeBuyingexplanation, storeBuyingPurchase, previewExplanation).
      if (next !== 'storeBuyingexplanation' && next !== 'previewExplanation' && next !== 'storeBuyingPurchase') {
        Tutorial.clearMarkedItem();
      }
      const textKey = initFor[next];
      if (textKey) Tutorial._initTyping(textKey);
      try { if (typeof drawLoja === 'function') drawLoja(); } catch (err) {}
      try { Tutorial._saveProgress(); } catch (e) {}
    },

    _attachListeners: function() {
      try {
        // primary pointer/click handler
        const handlePointerEvent = function(e) {
          try {
            if (typeof gameState !== 'undefined' && gameState === 'loja' && Tutorial.showShopTutorial) {
              if (Tutorial._stage === 'previewSelect') {
                try {
                  const canvasEl = (typeof canvas !== 'undefined') ? canvas : document.getElementById('gameCanvas');
                  if (canvasEl && typeof modalPreviewRects !== 'undefined' && modalPreviewRects.length > 0) {
                    const rect = canvasEl.getBoundingClientRect();
                    const mx = (e.clientX - rect.left) * (canvasEl.width / rect.width);
                    const my = (e.clientY - rect.top) * (canvasEl.height / rect.height);
                    const nonModal = modalPreviewRects.filter(p => p && p.modal === false);
                    for (const r of nonModal) {
                      if (r && mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
                        return;
                      }
                    }
                  }
                } catch (err) {}
                e.preventDefault(); e.stopPropagation(); return;
              }

              if (Tutorial._stage === 'storeBuyingIntroduction') { e.preventDefault(); e.stopPropagation(); return; }

              try { if (Tutorial._stage !== 'storeBuyingPurchase') Tutorial._maybeAdvance(); } catch (err) {}

              if (['dungeonInteraction','failedDepth50','storeBuyingPurchase'].indexOf(Tutorial._stage) === -1) { e.preventDefault(); e.stopPropagation(); return; }

              try {
                const canvasEl = (typeof canvas !== 'undefined') ? canvas : document.getElementById('gameCanvas');
                if (!canvasEl) { e.preventDefault(); e.stopPropagation(); return; }
                const rect = canvasEl.getBoundingClientRect();
                const mx = (e.clientX - rect.left) * (canvasEl.width / rect.width);
                const my = (e.clientY - rect.top) * (canvasEl.height / rect.height);
                if (Tutorial._typing && Tutorial._typing.isTyping) { try { Tutorial._maybeAdvance(); } catch (err) {} e.preventDefault(); e.stopPropagation(); return; }
                // Only restrict pointer clicks to the dungeon button when the tutorial
                // is in the dungeonInteraction/failedDepth50 stages. During the
                // purchase-required stage we must allow pointer events to reach the
                // shop UI so the player can click to buy the marked item.
                if (Tutorial._stage === 'dungeonInteraction' || Tutorial._stage === 'failedDepth50') {
                  if (typeof getDungeonBtnRect === 'function') {
                    const b = getDungeonBtnRect();
                    if (!(mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h)) { e.preventDefault(); e.stopPropagation(); return; }
                    else { try { Tutorial._transferDungeonStateToDungeon(); } catch (err) {} }
                  } else { e.preventDefault(); e.stopPropagation(); return; }
                } else if (Tutorial._stage === 'storeBuyingPurchase') {
                  // Allow pointer only when clicking the marked item area. Block other
                  // clicks (including the dungeon button) so the player must buy the
                  // marked item to progress.
                  try {
                    if (Tutorial._markedItem && Tutorial._markedItem.itemName && Array.isArray(lojaOptionRects) && typeof shopItems !== 'undefined') {
                      const visibleItems = shopItems.filter(it => isItemVisible(it));
                      const markedIndex = visibleItems.findIndex(it => it && it.nome === Tutorial._markedItem.itemName);
                      if (markedIndex >= 0) {
                        const rect = lojaOptionRects.find(r => r && r.index === markedIndex);
                        if (rect && mx >= rect.x && mx <= rect.x + rect.w && my >= rect.y && my <= rect.y + rect.h) {
                          // click is on the marked item -> allow it through
                          return;
                        }
                      }
                    }
                    // not clicking the marked item -> block
                    e.preventDefault(); e.stopPropagation(); return;
                  } catch (err) { e.preventDefault(); e.stopPropagation(); return; }
                } else {
                  // other stages: block by default
                  e.preventDefault(); e.stopPropagation(); return;
                }
              } catch (err) { e.preventDefault(); e.stopPropagation(); return; }
            }
          } catch (err) {}
        };

        Tutorial._listeners.handlePointerEvent = handlePointerEvent;
        window.addEventListener('pointerdown', Tutorial._listeners.handlePointerEvent, true);
        window.addEventListener('mousedown', Tutorial._listeners.handlePointerEvent, true);
        window.addEventListener('click', Tutorial._listeners.handlePointerEvent, true);

        // primary key handler
        const handleKeyDownMain = function(e) {
          try {
            if (typeof gameState !== 'undefined' && gameState === 'loja' && Tutorial.showShopTutorial) {
              if (Tutorial._stage === 'consent') {
                const keyLower = String(e.key).toLowerCase();
                if (keyLower === 'y') {
                  Tutorial._stage = 'shopIntro';
                  Tutorial._initTyping('shopTutorialText');
                  DungeonTutorial.showDungeonTutorial = true;
                  DungeonTutorial._stage = 'welcomeIntro';
                  DungeonTutorial._typing.fullText = null;
                  DungeonTutorial._typing.revealedLength = 0;
                  Tutorial._tutorial_End = false;
                  DungeonTutorial._tutorialPaused = true;
                  DungeonTutorial._tutorialMovementOnly = false;
                  try { Tutorial._saveProgress(); DungeonTutorial._saveProgress(); } catch (e) {}
                  e.preventDefault(); e.stopPropagation(); return;
                } else if (keyLower === 'n') {
                  DungeonTutorial._stage = 'Dmarkseen'; Tutorial._stage = 'markseen'; DungeonTutorial._dungeonmarkSeen(); e.preventDefault(); e.stopPropagation(); return;
                }
                e.preventDefault(); e.stopPropagation(); return;
              }

              const keyLower = String(e.key || '').toLowerCase();
              const navKeys = ['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'];
              const navAllowedStages = ['dungeonInteraction','previewSelect','failedDepth50','storeBuyingIntroduction','storeBuyingPurchase'];
              if (navKeys.includes(keyLower)) { if (navAllowedStages.includes(Tutorial._stage)) return; e.preventDefault(); e.stopPropagation(); Tutorial._maybeAdvance(); return; }

              const isConfirm = (keyLower === 'enter' || keyLower === ' ' || keyLower === 'spacebar');
              const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
              if (isConfirm && Tutorial._ignoreConfirmUntil && now < Tutorial._ignoreConfirmUntil) { e.preventDefault(); e.stopPropagation(); return; }

              if (Tutorial._stage === 'previewSelect') { if (!isConfirm) { e.preventDefault(); e.stopPropagation(); return; } let allowPreviewKey = false; if (!allowPreviewKey) { e.preventDefault(); e.stopPropagation(); return; } try { Tutorial._maybeAdvance(); } catch (err) {} e.preventDefault(); e.stopPropagation(); return; }

              if (isConfirm) {
                if (Tutorial._stage === 'storeBuyingIntroduction') { e.preventDefault(); e.stopPropagation(); return; }
                // When in the purchase-required stage, allow confirm only if the
                // currently selected item matches the marked item. Otherwise block.
                if (Tutorial._stage === 'storeBuyingPurchase') {
                  try {
                    if (typeof selectedIndex !== 'undefined' && typeof shopItems !== 'undefined' && Array.isArray(lojaOptionRects) && Tutorial._markedItem && Tutorial._markedItem.itemName) {
                      const visibleItems = shopItems.filter(it => isItemVisible(it));
                      const markedIndex = visibleItems.findIndex(it => it && it.nome === Tutorial._markedItem.itemName);
                      if (markedIndex === selectedIndex) {
                        // allow confirm to reach game (will call attemptPurchase)
                        return;
                      }
                    }
                  } catch (err) {}
                  e.preventDefault(); e.stopPropagation(); return;
                }
                if (Tutorial._stage === 'dungeonInteraction' || Tutorial._stage === 'failedDepth50') {
                  if (Tutorial._typing && Tutorial._typing.isTyping) { try { Tutorial._maybeAdvance(); } catch (err) {} e.preventDefault(); e.stopPropagation(); return; }
                  try { if (typeof selectedElement !== 'undefined' && selectedElement && selectedElement.type === 'dungeon') return; } catch (err) {}
                  try { Tutorial._transferDungeonStateToDungeon(); } catch (err) {}
                  try { Tutorial._ignoreConfirmUntil = (typeof performance !== 'undefined' && performance.now) ? performance.now() + 450 : Date.now() + 450; } catch (e) {}
                  e.preventDefault(); e.stopPropagation(); return;
                }
                try { if (Tutorial._stage !== 'storeBuyingPurchase') Tutorial._maybeAdvance(); } catch (err) {}
                e.preventDefault(); e.stopPropagation(); return;
              }
              return;
            }
          } catch (err) {}
        };

        Tutorial._listeners.handleKeyDownMain = handleKeyDownMain;
        window.addEventListener('keydown', Tutorial._listeners.handleKeyDownMain, true);
      } catch (e) {}

      // Prevent pointer/keyboard interactions during typing in previewSelect and storeBuyingIntroduction
      try {
        const preventDuringTypingPointerDown = function(e) {
          try {
            if (typeof gameState !== 'undefined' && gameState === 'loja' && Tutorial.showShopTutorial && (Tutorial._stage === 'previewSelect' || Tutorial._stage === 'storeBuyingIntroduction' || Tutorial._stage === 'storeBuyingPurchase' || Tutorial._stage === 'storeBuyingexplanation') && Tutorial._typing && Tutorial._typing.isTyping) { e.stopImmediatePropagation(); e.preventDefault(); return; }
          } catch (err) {}
        };
        const preventDuringTypingKeyDown = function(e) {
          try {
            if (typeof gameState !== 'undefined' && gameState === 'loja' && Tutorial.showShopTutorial && (Tutorial._stage === 'previewSelect' || Tutorial._stage === 'storeBuyingIntroduction' || Tutorial._stage === 'storeBuyingPurchase' || Tutorial._stage === 'storeBuyingexplanation') && Tutorial._typing && Tutorial._typing.isTyping) { e.stopImmediatePropagation(); e.preventDefault(); return; }
          } catch (err) {}
        };
        const preventPointerMove = function(e) { try { if (typeof gameState !== 'undefined' && gameState === 'loja' && Tutorial.showShopTutorial && (Tutorial._stage === 'previewSelect' || Tutorial._stage === 'storeBuyingIntroduction' || Tutorial._stage === 'storeBuyingPurchase' || Tutorial._stage === 'storeBuyingexplanation') && Tutorial._typing && Tutorial._typing.isTyping) { e.stopImmediatePropagation(); e.preventDefault(); return; } } catch (err) {} };
        const preventMouseMove = function(e) { try { if (typeof gameState !== 'undefined' && gameState === 'loja' && Tutorial.showShopTutorial && (Tutorial._stage === 'previewSelect' || Tutorial._stage === 'storeBuyingIntroduction' || Tutorial._stage === 'storeBuyingPurchase' || Tutorial._stage === 'storeBuyingexplanation') && Tutorial._typing && Tutorial._typing.isTyping) { e.stopImmediatePropagation(); e.preventDefault(); return; } } catch (err) {} };
        const preventPointerOver = function(e) { try { if (typeof gameState !== 'undefined' && gameState === 'loja' && Tutorial.showShopTutorial && (Tutorial._stage === 'previewSelect' || Tutorial._stage === 'storeBuyingIntroduction' || Tutorial._stage === 'storeBuyingPurchase' || Tutorial._stage === 'storeBuyingexplanation') && Tutorial._typing && Tutorial._typing.isTyping) { e.stopImmediatePropagation(); e.preventDefault(); return; } } catch (err) {} };
        const preventMouseOver = function(e) { try { if (typeof gameState !== 'undefined' && gameState === 'loja' && Tutorial.showShopTutorial && (Tutorial._stage === 'previewSelect' || Tutorial._stage === 'storeBuyingIntroduction' || Tutorial._stage === 'storeBuyingPurchase' || Tutorial._stage === 'storeBuyingexplanation') && Tutorial._typing && Tutorial._typing.isTyping) { e.stopImmediatePropagation(); e.preventDefault(); return; } } catch (err) {} };

        Tutorial._listeners.preventDuringTypingPointerDown = preventDuringTypingPointerDown;
        Tutorial._listeners.preventDuringTypingKeyDown = preventDuringTypingKeyDown;
        Tutorial._listeners.preventPointerMove = preventPointerMove;
        Tutorial._listeners.preventMouseMove = preventMouseMove;
        Tutorial._listeners.preventPointerOver = preventPointerOver;
        Tutorial._listeners.preventMouseOver = preventMouseOver;

        window.addEventListener('pointerdown', Tutorial._listeners.preventDuringTypingPointerDown, true);
        window.addEventListener('keydown', Tutorial._listeners.preventDuringTypingKeyDown, true);
        window.addEventListener('pointermove', Tutorial._listeners.preventPointerMove, true);
        window.addEventListener('mousemove', Tutorial._listeners.preventMouseMove, true);
        window.addEventListener('pointerover', Tutorial._listeners.preventPointerOver, true);
        window.addEventListener('mouseover', Tutorial._listeners.preventMouseOver, true);
      } catch (e) {}

      const canvasEl = (typeof canvas !== 'undefined') ? canvas : document.getElementById('gameCanvas');
    },

    onStoreBuyingHover: function(itemName) {
      try {
        if (!Tutorial.showShopTutorial) return;
        if (Tutorial._stage !== 'storeBuyingIntroduction') return;
        if (!itemName) return;
        const n = String(itemName || '').trim();
        if (n === 'Cinto Relâmpago') {
          // Mark this item to stay highlighted in next phase
          Tutorial.markItemForNextPhase(n, 'storeBuyingIntroduction');
          try { Tutorial._maybeAdvance(); } catch (e) {}
        }
      } catch (e) {}
    },

    onPreviewInteracted: function() {
      try {
        if (!Tutorial.showShopTutorial) return;
        if (Tutorial._stage !== 'previewSelect') return;
        if (Tutorial._typing && Tutorial._typing.isTyping) return;
        try { Tutorial._maybeAdvance(); } catch (e) {}
      } catch (e) {}
    },

    markItemForNextPhase: function(itemName, currentStage) {
      try {
        if (!itemName) return;
        Tutorial._markedItem.itemName = String(itemName).trim();
        Tutorial._markedItem.startStage = currentStage;
      } catch (e) {}
    },

    isItemMarked: function(itemName) {
      try {
        if (!itemName || !Tutorial._markedItem.itemName) return false;
        return String(itemName).trim() === Tutorial._markedItem.itemName;
      } catch (e) { return false; }
    },

    clearMarkedItem: function() {
      try {
        Tutorial._markedItem.itemName = null;
        Tutorial._markedItem.startStage = null;
      } catch (e) {}
    },

    onPreviewItemHovered: function(itemName) {
      try {
        if (!Tutorial.showShopTutorial) return;
        if (Tutorial._stage !== 'previewExplanation') return;
        if (!itemName) return;
        // Mark the hovered ability/item for next phase
        Tutorial.markItemForNextPhase(itemName, 'previewExplanation');
      } catch (e) {}
    }
    ,
    onItemPurchased: function(itemName) {
      try {
        if (!Tutorial.showShopTutorial) return;
        if (Tutorial._stage !== 'storeBuyingPurchase') return;
        if (!itemName) return;
        if (!Tutorial.isItemMarked(itemName)) return;
        try { Tutorial._stage = 'storeBuyingFinal'; } catch (e) {}
        try { Tutorial._initTyping('storeBuyingFinalText'); } catch (e) {}
        // mark the next item that becomes visible after this purchase (if any)
        try {
          let nextItemName = null;
          const allItems = [];
          try { if (typeof shopItems !== 'undefined' && Array.isArray(shopItems)) allItems.push(...shopItems); } catch (e) {}
          try { if (typeof SECRET_ITEMS !== 'undefined' && Array.isArray(SECRET_ITEMS)) allItems.push(...SECRET_ITEMS); } catch (e) {}
          for (const it of allItems) {
            try {
              if (!it) continue;
              if (it.hiddenUntilPurchases && Object.prototype.hasOwnProperty.call(it.hiddenUntilPurchases, itemName)) {
                nextItemName = it.nome; break;
              }
            } catch (e) {}
          }
          if (nextItemName) {
            try { Tutorial.markItemForNextPhase(nextItemName, 'storeBuyingFinal'); } catch (e) {}
          }
        } catch (e) {}
        try { if (typeof drawLoja === 'function') drawLoja(); } catch (e) {}
        try { Tutorial._saveProgress(); } catch (e) {}
      } catch (e) {}
    }
    ,
    _detachListeners: function() {
      try {
        try { if (Tutorial._listeners && Tutorial._listeners.handlePointerEvent) { window.removeEventListener('pointerdown', Tutorial._listeners.handlePointerEvent, true); window.removeEventListener('mousedown', Tutorial._listeners.handlePointerEvent, true); window.removeEventListener('click', Tutorial._listeners.handlePointerEvent, true); } } catch (e) {}
        try { if (Tutorial._listeners && Tutorial._listeners.handleKeyDownMain) { window.removeEventListener('keydown', Tutorial._listeners.handleKeyDownMain, true); } } catch (e) {}
        try { if (Tutorial._listeners && Tutorial._listeners.preventDuringTypingPointerDown) window.removeEventListener('pointerdown', Tutorial._listeners.preventDuringTypingPointerDown, true); } catch (e) {}
        try { if (Tutorial._listeners && Tutorial._listeners.preventDuringTypingKeyDown) window.removeEventListener('keydown', Tutorial._listeners.preventDuringTypingKeyDown, true); } catch (e) {}
        try { if (Tutorial._listeners && Tutorial._listeners.preventPointerMove) window.removeEventListener('pointermove', Tutorial._listeners.preventPointerMove, true); } catch (e) {}
        try { if (Tutorial._listeners && Tutorial._listeners.preventMouseMove) window.removeEventListener('mousemove', Tutorial._listeners.preventMouseMove, true); } catch (e) {}
        try { if (Tutorial._listeners && Tutorial._listeners.preventPointerOver) window.removeEventListener('pointerover', Tutorial._listeners.preventPointerOver, true); } catch (e) {}
        try { if (Tutorial._listeners && Tutorial._listeners.preventMouseOver) window.removeEventListener('mouseover', Tutorial._listeners.preventMouseOver, true); } catch (e) {}
        Tutorial._listeners = {};
      } catch (e) {}
    },
   
  };

  window.Tutorial = Tutorial;
  
  try { Tutorial._attachListeners(); } catch (e) {}

  // Intercept changes to `_stage` and `showShopTutorial` to help debugging
  try {
    (function() {
      const obj = Tutorial;
      if (!obj) return;
      obj._stage_backup = obj._stage;
      Object.defineProperty(obj, '_stage', {
        configurable: true,
        enumerable: true,
        get: function() { return this._stage_backup; },
        set: function(v) {
          try { console.log('[Tutorial] _stage ->', v, '\nStack:', (new Error()).stack); } catch (e) {}
          this._stage_backup = v;
        }
      });

      obj._showShop_backup = obj.showShopTutorial;
      Object.defineProperty(obj, 'showShopTutorial', {
        configurable: true,
        enumerable: true,
        get: function() { return this._showShop_backup; },
        set: function(v) {
          try { console.log('[Tutorial] showShopTutorial ->', v, '\nStack:', (new Error()).stack); } catch (e) {}
          this._showShop_backup = v;
        }
      });
    })();
  } catch (e) {}

  // initFromSave removed: startup per-slot restore logic intentionally deleted.

})();

function seesuccessDepth50(salvoProfundidade, money) {
  if (!Tutorial.showShopTutorial) return;

  const reached = Number(salvoProfundidade) >= 50;
  const rich = Number(money) >= 250;

  const stageMap = {
    'true_true':  { stage: 'succeededDepth50', text: 'succeededDepth50Text', success: true },
    'true_false': { stage: 'failedDepth50',    text: 'successDepthNoMoneyText' },
    'false_true': { stage: 'failedDepth50',    text: 'failedDepthButMoneyText' },
    'false_false':{ stage: 'failedDepth50',    text: 'failedDepthAndMoneyText' }
  };

  const result = stageMap[`${reached}_${rich}`];
  if (!result) return;

  Tutorial._stage = result.stage;

  if (result.success) {
    Tutorial._initTyping(result.text);
  } else {
    
    Tutorial._uiText.failedDepth50Text = Tutorial._uiText[result.text];
    Tutorial._initTyping('failedDepth50Text');
  }

  if (typeof drawLoja === 'function') drawLoja();
}
