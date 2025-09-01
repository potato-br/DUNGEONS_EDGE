

function getCharacterBtnRect() {
  const btnW = Math.max(180, Math.min(canvas.width * 0.22, 350));
  const btnH = Math.max(36, Math.min(canvas.height * 0.055, 60));
  const margin = Math.max(12, canvas.width * 0.015);
  const btnX = canvas.width - btnW - margin;
  const btnY = margin * 2 + btnH;
  return { x: btnX, y: btnY, w: btnW, h: btnH };
}

function getUnlockedCharacters() {
  const unlocked = ['O Errante de Eldoria'];
  
  
  // Check global-aware purchase counts so characters bought by any profile count as unlocked
  ['Kuroshi, o Ninja', 'Roderick, o Cavaleiro', 'Valthor, o Mago'].forEach(charName => {
    try {
      const count = (typeof getPurchasesCountByName === 'function') ? getPurchasesCountByName(charName) : (characterData.__global?.purchases?.[charName] || 0);
      if (count > 0 && !unlocked.includes(charName)) unlocked.push(charName);
    } catch (e) {
      // fallback: if helper not available yet, inspect characterData entries
      for (let character in characterData) {
        const purchases = characterData[character]?.purchases || {};
        if (purchases[charName] && purchases[charName] > 0 && !unlocked.includes(charName)) {
          unlocked.push(charName);
        }
      }
    }
  });
  
  return unlocked;
}


let showCharacterSelect = false;
let characterSelectRects = [];
let selectedCharacterModalIndex = 0;
let closeButtonHovered = false; 
let closeButtonSelected = false; 
// visual hover state (may be suppressed by keyboard until the mouse moves)
let closeButtonVisualHovered = false;
let closeButtonSuppressUntilMouseMove = false;
// preview rects drawn inside the character select modal
let modalPreviewRects = []; // { x,y,w,h, modal, type, charIndex, previewIndex, nome }
let hoveredPreview = null; // the preview currently highlighted by mouse
let modalPreviewMouseActive = false; // when true, keyboard navigation should be suppressed
let modalPreviewSelected = null; // selection state for previews (separate index space)
let modalPreviewSuppressUntilMouseMove = false; // when true, ignore mouse hover until mouse moves

// Track which previews have been 'read' (to show/remove the LEIA badge)
let previewsRead = new Set();

// Local mapping of ability/preview identifiers to description text (used when hovering previews)
const abilityPreviewDescriptions = {
  'Bomba de Fumaça': '"Porque enfrentar os problemas de frente é superestimado." --- Ao levar dano, o ninja ativa a bomba automaticamente e fica invencível por um tempo.',
  'Égide Lunar': '"Forjada no brilho de um eclipse e no choro de um unicórnio decepcionado." --- Cria um escudo lunar que bloqueia dano enquanto estiver ativo.',
  'Alma Reerguida': 'Grimório, página 87 – “Do Retorno Inesperado” "Quando o portador cai no abismo, a alma, irritada com tamanha burrice, o arrasta de volta ao plano terreno." --- Ao cair no void, evita a perda de vida e retorna ao jogo sem punição.',
  'Devastação Mística': 'O Mestre encontrou um feitiço num livro que sussurrava. Disse que era perfeito pra limpeza. Funcionou. Funcionou bem demais. A torre ficou impecável. O vale desapareceu. Ele só percebeu o detalhe quando uma carta chegou perguntando se queria nomear o novo deserto. --- Ao usar, elimina todos os inimigos da tela e impede que reapareçam por um tempo. uma versao mais fraca e desvinculada com a principal ativa ao tomar dano.',
  'DASH': 'Alguns chamam de fuga rapida. Outros, de avanço estratégico. Mas todos concordam: é rápido demais pra se discutir com resultado. --- Impulso para frente com invulnerabilidade logo após o dash.'
};


function drawCharacterSelectButton() {
 

  
  const { x: btnX, y: btnY, w: btnW, h: btnH } = getCharacterBtnRect();
  ctx.save();
  ctx.globalAlpha = 0.93;
  if (isCharacterSelectButtonHovered) {
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 15;
    ctx.fillStyle = 'rgba(40, 40, 60, 0.15)';
  } else {
    ctx.fillStyle = 'rgba(40, 40, 60, 0.09)';
  }
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(btnX, btnY, btnW, btnH, 12);
  ctx.fill();
  ctx.stroke();
  ctx.font = `bold ${Math.max(18, Math.floor(btnH * 0.55))}px PixelFont`;
  ctx.fillStyle = isCharacterSelectButtonHovered ? '#ffffff' : '#ffd700';
  ctx.textAlign = 'center';
  ctx.fillText('Selecionar Personagem', btnX + btnW/2, btnY + btnH/2 + btnH*0.18);
  ctx.restore();
}

let hoveredCharacterIndex = -1;

function drawCharacterSelectModal() {
  if (!showCharacterSelect) return;
  // reset modal preview rects so drawing repopulates them
  modalPreviewRects = [];
  ctx.save();
  ctx.globalAlpha = 0.98;
  ctx.fillStyle = 'rgba(0,0,0,0.92)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
  ctx.save();
  ctx.font = 'bold 38px PixelFont';
  ctx.fillStyle = '#ffd700';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 12;
  ctx.fillText('Selecione seu Personagem', canvas.width/2, 110);
  ctx.restore();
  
  // draw close button (visual hover can be suppressed by keyboard actions)
  ctx.save();
  ctx.globalAlpha = 0.85;
  const isCloseVisuallyHovered = closeButtonVisualHovered || closeButtonSelected;
  ctx.fillStyle = (isCloseVisuallyHovered) ? '#333' : '#222';
  ctx.beginPath();
  ctx.arc(canvas.width-60, 100, 28, 0, Math.PI*2);
  ctx.fill();
  ctx.font = 'bold 32px PixelFont';
  ctx.fillStyle = (isCloseVisuallyHovered) ? '#ffffff' : '#ffd700';
  ctx.textAlign = 'center';
  ctx.fillText('X', canvas.width-60, 112);
  ctx.restore();
  
  const unlocked = getUnlockedCharacters();
  const charW = 170, charH = 260;
  const gap = 30;
  
  const totalW = unlocked.length * charW + (unlocked.length - 1) * gap;
  const startX = Math.max(60, Math.floor((canvas.width - totalW) / 2));
  characterSelectRects = []; 

  for (let i = 0; i < unlocked.length; i++) {
      const nome = unlocked[i];
      const x = startX + i * (charW + gap);
      const y = 180;
      
      ctx.save();
      ctx.globalAlpha = 0.97;
      let isHovered = i === hoveredCharacterIndex;
      
       ctx.fillStyle = isHovered ? 'rgba(255,215,0,0.2)' : 
                   (selectedCharacterModalIndex===i) ? 'rgba(172, 83, 83, 0.13)' : 
                   'rgba(172, 83, 83, 0.13)';
      
      ctx.strokeStyle = isHovered ? '#fff' :
                     (activeCharacter===nome) ? '#ffd700' : 
                     '#fff';

      ctx.lineWidth = (activeCharacter===nome) ? 4 : 2;

       
    if (isHovered) {
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 15;
    }

    ctx.beginPath();
    ctx.roundRect(x, y, charW, charH, 22);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    
    ctx.save();
    
    let nomeLines = [];
    let nomeRest = nome.trim();
    const maxWidth = charW - 18;
    ctx.font = 'bold 16px PixelFont';
    
    let fontSize = 16;
    if (ctx.measureText(nome).width > maxWidth) {
      fontSize = 13;
      ctx.font = `bold ${fontSize}px PixelFont`;
    }
    
    while (nomeRest.length > 0) {
      let fit = nomeRest.length;
      while (fit > 0 && ctx.measureText(nomeRest.slice(0, fit)).width > maxWidth) fit--;
      if (fit === 0) fit = 1;
      let line = nomeRest.slice(0, fit);
      
      if (fit < nomeRest.length && nomeRest[fit] !== ' ') {
        let lastSpace = line.lastIndexOf(' ');
        if (lastSpace > 0) {
          fit = lastSpace;
          line = nomeRest.slice(0, fit);
        }
      }
      nomeLines.push(line.trim());
      nomeRest = nomeRest.slice(fit).trim();
      ctx.font = `bold ${fontSize}px PixelFont`;
    }
    ctx.font = `bold ${fontSize}px PixelFont`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    
    let nomeStartY = y + charH - 28 - (nomeLines.length - 1) * (fontSize + 1) / 2;
    for (let l = 0; l < nomeLines.length; l++) {
      ctx.fillText(nomeLines[l], x + charW / 2, nomeStartY + l * (fontSize + 1));
    }
    if (activeCharacter===nome) {
        ctx.font = 'bold 15px PixelFont';
        ctx.fillStyle = '#ffd700';
        ctx.fillText('ATIVO', x+charW/2, y+charH+15);
    }
    ctx.restore();
    
    ctx.save();
    let stats = characterData[nome]?.stats || { maxJumps: player.maxJumps, speed: player.speed, liveupgrade: live };
    const iconStats = [
      { icon: '⤴️', value: stats.maxJumps },
      { icon: '⚡', value: stats.speed ? stats.speed.toFixed(1) : '?' },
      { icon: '❤️', value: stats.liveupgrade || live }
    ];
    const iconFont = '16px PixelFont';
    const valueFont = '13px PixelFont';
    const iconY = y + 100;
    const iconSpacing = 85;
    
    ctx.font = iconFont;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.fillText(iconStats[0].icon, x + 18, iconY);
    ctx.font = valueFont;
    ctx.fillStyle = '#ffd700';
    ctx.fillText(iconStats[0].value, x + 43, iconY);
    
    ctx.font = iconFont;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';
    ctx.fillText(iconStats[1].icon, x + charW - 14, iconY);
    ctx.font = valueFont;
    ctx.fillStyle = '#ffd700';
    ctx.fillText(iconStats[1].value, x + charW - 34, iconY);
    
    ctx.font = iconFont;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText(iconStats[2].icon, x + charW/2, iconY + iconSpacing);
    ctx.font = valueFont;
    ctx.fillStyle = '#ffd700';
    ctx.fillText(iconStats[2].value, x + charW/2 + 18, iconY + iconSpacing);
    ctx.restore();
    
    drawCharacterIdlePreview(nome, x+charW/2, y+charH/2+10, 3.2, i===selectedCharacterModalIndex);
    
  // small per-card dash preview removed (using central preview below cards)

    characterSelectRects.push({x, y, w: charW, h: charH, nome, index: i, modal:true});
  }

  // Draw a larger dash preview below the character grid inside the modal.
  // If 'O Errante de Eldoria' is in the unlocked list, align preview to the left of its card (works for single or multiple characters).
  try {
    const modalBottomY = 180 + charH + 30; // under cards
    const previewScale = 1.9;
    const erranteName = 'O Errante de Eldoria';
    const ninjaName = 'Kuroshi, o Ninja';
    const errIndex = unlocked.indexOf(erranteName);
    const ninjaIndex = unlocked.indexOf(ninjaName);

    // If Errante exists, draw preview aligned to its card left edge
    if (errIndex >= 0) {
      const rectLeft = Math.floor(startX + errIndex * (charW + gap));
  drawDashPreview(erranteName, 0, modalBottomY, previewScale, false, true, rectLeft);
    }

    // Also draw preview for the Ninja if unlocked (aligned to ninja card left edge)
    if (ninjaIndex >= 0) {
      const rectLeft = Math.floor(startX + ninjaIndex * (charW + gap));
      // avoid drawing twice if ninja is the same as errante (unlikely) by checking index
      if (ninjaIndex !== errIndex) {
        drawDashPreview(ninjaName, 0, modalBottomY, previewScale, false, true, rectLeft);
      }

      // Draw a second preview for the Ninja aligned to the RIGHT of its card (ability icon)
  drawAbilityPreview(typeof ninjaAbilityIcon !== 'undefined' ? ninjaAbilityIcon : null, typeof ninjaAbilityIconLoaded !== 'undefined' ? ninjaAbilityIconLoaded : false, rectLeft, charW, modalBottomY, previewScale, { align: 'right', scaleMultiplier: 0.38, padding: 6, nome: 'Bomba de Fumaça' });
    }

    // Also add two ability previews (left + right) for Cavaleiro and Mago using the ninja icon as placeholder
    try {
      const cavaleiroName = 'Roderick, o Cavaleiro';
      const magoName = 'Valthor, o Mago';
      const cavIndex = unlocked.indexOf(cavaleiroName);
      const magoIndex = unlocked.indexOf(magoName);

      if (cavIndex >= 0) {
        const rectLeftC = Math.floor(startX + cavIndex * (charW + gap));
  // right aligned preview -> Alma Reerguida
  drawAbilityPreview(typeof knightResurrectionIcon !== 'undefined' ? knightResurrectionIcon : null, typeof knightResurrectionIconLoaded !== 'undefined' ? knightResurrectionIconLoaded : false, rectLeftC, charW, modalBottomY, previewScale, { align: 'right', scaleMultiplier: 0.38, padding: 6, nome: 'Alma Reerguida' });
  // left aligned preview -> Égide Lunar
  drawAbilityPreview(typeof knightShieldIcon !== 'undefined' ? knightShieldIcon : null, typeof knightShieldIconLoaded !== 'undefined' ? knightShieldIconLoaded : false, rectLeftC, charW, modalBottomY, previewScale, { align: 'left', scaleMultiplier: 0.38, padding: 6, nome: 'Égide Lunar' });
      }

      if (magoIndex >= 0) {
        const rectLeftM = Math.floor(startX + magoIndex * (charW + gap));
  // right aligned preview -> Devastação Mística
  drawAbilityPreview(typeof mageAbilityIcon !== 'undefined' ? mageAbilityIcon : null, typeof mageAbilityIconLoaded !== 'undefined' ? mageAbilityIconLoaded : false, rectLeftM, charW, modalBottomY, previewScale, { align: 'right', scaleMultiplier: 0.38, padding: 6, nome: 'Devastação Mística' });
      }
    } catch (e) {
      // ignore if placeholder icon isn't available
    }

    // If neither was found, fallback to centered preview for the activeCharacter
    if (errIndex < 0 && ninjaIndex < 0) {
      const approxIconW = Math.ceil((playerSprites[activeCharacter]?.config?.[0]?.frameWidth || 32) * previewScale);
      const centerX = Math.floor((canvas.width / 2) - (approxIconW / 2));
      drawDashPreview(activeCharacter || erranteName, centerX, modalBottomY, previewScale, false, true);
    }
  } catch (e) {
    // ignore if sprites or helpers not available
  }

  // If a preview is hovered via mouse, or explicitly selected, draw its description box
  try {
  const activePreview = (modalPreviewSuppressUntilMouseMove ? modalPreviewSelected : (hoveredPreview || modalPreviewSelected));
    if (activePreview) {
      drawPreviewDescriptionForModal(activePreview);
    }
  } catch (e) {}
}


function drawCharacterIdlePreview(nome, cx, cy, scale, highlight) {
  if (!playerSpriteLoaded) return;
  
  
  const characterSprite = playerSprites[nome].sprite;
  const characterConfig = playerSprites[nome].config;
  
  
  const frameHeight = characterConfig[2].frameHeight; 
  const frameWidth = characterConfig[2].frameWidth;
  const offsetX = characterConfig[2].offsetX || 0;
  const offsetY = characterConfig[2].offsetY || 0;
  
  
  let frame;
  if (nome === 'Kuroshi, o Ninja') {
    frame = Math.floor((performance.now()/1000)%2); 
  } else if (nome === 'Roderick, o Cavaleiro') {
    frame = Math.floor((performance.now()/1600)%2); 
  } else if (nome === 'Valthor, o Mago') {
    frame = Math.floor((performance.now()/1200)%2); 
  } else {
    frame = Math.floor((performance.now()/1400)%2); 
  }

  const fw = frameWidth * scale;
  const fh = frameHeight * scale;
  const sx = frame * frameWidth;
  const sy = 2 * frameHeight; 
  
  ctx.save();
 
  
  
  ctx.drawImage(
    characterSprite,
    sx, sy, frameWidth, frameHeight,
    cx - fw/2 + offsetX * scale, cy - fh/2 + offsetY * scale, fw, fh
  );
  
  ctx.restore();
if (showCharacterSelect) return;
  
  ctx.save();
  let stats = characterData[nome]?.stats || { maxJumps: player.maxJumps, speed: player.speed, liveupgrade: live };
  const iconStats = [
    { icon: '⤴️', value: stats.maxJumps },
    { icon: '⚡', value: stats.speed ? stats.speed.toFixed(1) : '?' },
    { icon: '❤️', value: stats.liveupgrade || live }
  ];
  const iconFont = '16px PixelFont';
  const valueFont = '13px PixelFont';
  const iconY = 155;
  const iconSpacing = 70;
  
  ctx.font = iconFont;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff';
  ctx.fillText(iconStats[0].icon, cx - iconSpacing, iconY);
  ctx.font = valueFont;
  ctx.fillStyle = '#ffd700';
  ctx.fillText(iconStats[0].value, cx - iconSpacing + 25, iconY);
  
  ctx.font = iconFont;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'right';
  ctx.fillText(iconStats[1].icon, cx + iconSpacing, iconY);
  ctx.font = valueFont;
  ctx.fillStyle = '#ffd700';
  ctx.fillText(iconStats[1].value, cx + iconSpacing - 20, iconY);
  
  ctx.font = iconFont;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText(iconStats[2].icon, cx, iconY + iconSpacing);
  ctx.font = valueFont;
  ctx.fillStyle = '#ffd700';
  ctx.fillText(iconStats[2].value, cx + 18, iconY + iconSpacing);
  ctx.restore();
  
}

// Draw a compact dash icon/ghost preview for a given character
function drawDashPreview(nome, x, y, scale = 1, highlight = false, large = false, alignLeftX) {
  if (!playerSpriteLoaded) return;
  if (!playerSprites || !playerSprites[nome]) return;
  const sprite = playerSprites[nome].sprite || playerSprite;
  const config = playerSprites[nome].config && playerSprites[nome].config[0];
  if (!config || !sprite) return;

  const spriteScale = scale; // scale multiplier for preview
  const ghostCount = 3;
  const ghostSpacing = large ? 7 : 7;
  // startX may be ignored if alignLeftX provided
  let startX = x;
  const startY = y;
  const w = Math.ceil(config.frameWidth * spriteScale);
  const h = Math.ceil(config.frameHeight * spriteScale);
  const padding = Math.max(4, Math.floor(4 * spriteScale));

  // compute full horizontal extent including ghosts (ghosts drawn to the left)
  const leftMostGhostX = startX - (ghostCount - 1) * ghostSpacing;
  const rightMostIconX = startX + w;
  // If alignLeftX provided, align the left border of the square rect to that value
  const rectX = (typeof alignLeftX === 'number') ? alignLeftX : (leftMostGhostX - padding);
  if (typeof alignLeftX === 'number') {
    // place startX so that the leftMostGhost aligns inside the rect with padding
    startX = rectX + padding + (ghostCount - 1) * ghostSpacing;
  }
  // make the rect square: width should cover ghosts to icon, height match width
  const contentW = Math.ceil((rightMostIconX - leftMostGhostX));
  const squareSize = Math.max(contentW + padding * 2, h + padding * 2);
  const rectW = squareSize;
  const rectH = squareSize;
  // adjust rectY to center vertically around the icon + ghosts
  const centerY = startY + h / 2;
  let rectY = Math.round(centerY - rectH / 2);

  // draw background/ghosts
  for (let g = ghostCount - 1; g >= 0; g--) {
    const ghostX = startX - (g * ghostSpacing);
    const ghostAlpha = Math.max(0.05, 0.4 - g * 0.1);
    ctx.save();
    ctx.globalAlpha = ghostAlpha;
    ctx.drawImage(
      sprite,
      0, 0,
      config.frameWidth, config.frameHeight,
      ghostX, startY,
      config.frameWidth * spriteScale, config.frameHeight * spriteScale
    );
    ctx.restore();
  }

  // draw border square around the dash icon
  ctx.save();
  // if mouse hovered preview corresponds to this rect, treat it as highlighted with distinct style
  const previewRectCandidate = { x: rectX, y: rectY, w: rectW, h: rectH };
  const isPreviewHighlighted = ((typeof hoveredPreview !== 'undefined' && hoveredPreview && hoveredPreview.x === rectX && hoveredPreview.y === rectY)
                               || (typeof modalPreviewSelected !== 'undefined' && modalPreviewSelected && modalPreviewSelected.x === rectX && modalPreviewSelected.y === rectY));
  const finalHighlight = highlight || isPreviewHighlighted;
  ctx.lineWidth = finalHighlight ? 4 : 2;
  ctx.strokeStyle = finalHighlight ? '#ffd700' : 'rgba(255,255,255,0.6)';
  ctx.fillStyle = 'rgba(0,0,0,0)';
  if (finalHighlight) {
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 18;
  }
  ctx.beginPath();
  // use round rect if available
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(rectX, rectY, rectW, rectH, 6);
  } else {
    const r = 6;
    ctx.moveTo(rectX + r, rectY);
    ctx.lineTo(rectX + rectW - r, rectY);
    ctx.quadraticCurveTo(rectX + rectW, rectY, rectX + rectW, rectY + r);
    ctx.lineTo(rectX + rectW, rectY + rectH - r);
    ctx.quadraticCurveTo(rectX + rectW, rectY + rectH, rectX + rectW - r, rectY + rectH);
    ctx.lineTo(rectX + r, rectY + rectH);
    ctx.quadraticCurveTo(rectX, rectY + rectH, rectX, rectY + rectH - r);
    ctx.lineTo(rectX, rectY + r);
    ctx.quadraticCurveTo(rectX, rectY, rectX + r, rectY);
  }
  ctx.stroke();
  // draw keyboard-lock badge if this preview matches the keyboard lock
  try {
    const makeId = p => (p.nome || '') + '|' + (p.type || 'dash') + '|' + (Math.round(p.x)||0) + '|' + (Math.round(p.y)||0);
    const isLockedPreview = (typeof modalPreviewKeyboardLock !== 'undefined' && modalPreviewKeyboardLock && makeId(previewRectCandidate) === modalPreviewKeyboardLock.previewId);
    if (isLockedPreview) {
      const bx = previewRectCandidate.x + previewRectCandidate.w - 12;
      const by = previewRectCandidate.y + 8;
      ctx.beginPath();
      ctx.fillStyle = '#ffd700';
      ctx.arc(bx, by, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = '#222';
      ctx.arc(bx, by, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } catch (e) {}
  ctx.restore();

  // register rect for modal preview interaction if inside modal (large previews)
  try {
    if (showCharacterSelect && large) {
      // compute rect used for hit detection
      const rect = { x: rectX, y: rectY, w: rectW, h: rectH, modal: true, type: 'dash', nome };
      // store with a small padding
      modalPreviewRects.push(rect);
    } else if (typeof window !== 'undefined' && window._registerActivePreviews) {
      // when drawing previews for the small active-character viewer, register non-modal rects
      const rect = { x: rectX, y: rectY, w: rectW, h: rectH, modal: false, type: 'dash', nome };
      modalPreviewRects.push(rect);
    }
  } catch (e) {}

  // draw badge (NEW/LEIA) on the right side of the preview box when applicable
  try {
    const badgeText = (!previewsRead.has(nome) ? 'LEIA!!!' : null);
    if (badgeText) {
      const bx = rectX + rectW - 6;
      const by = rectY + 8;
      ctx.save();
      ctx.font = '22px PixelFont';
      const pad = 8;
      const measuredW = ctx.measureText(badgeText).width;
      const w = Math.max(36, measuredW + pad);
      const textX = bx - w/2 + 44; // center inside the former badge area
      const textY = by + 13;
      ctx.fillText(badgeText, textX, textY);
      ctx.restore();
    }
  } catch (e) {}

  // draw main icon
  ctx.save();
  ctx.globalAlpha = 1.0;
  ctx.drawImage(
    sprite,
    0, 0,
    config.frameWidth, config.frameHeight,
    startX, startY,
    w, h
  );
  ctx.restore();
}

// Draw a small ability icon preview aligned to a character card (reusable)
function drawAbilityPreview(iconImg, iconLoaded, cardLeft, cardW, y, previewScale, options = {}) {
  if (!iconLoaded || !iconImg) return;
  const align = options.align || 'right'; // 'left' or 'right'
  const scaleMultiplier = typeof options.scaleMultiplier === 'number' ? options.scaleMultiplier : 0.45; // default smaller
  const padding = typeof options.padding === 'number' ? options.padding : Math.max(6, Math.floor(6 * previewScale * 0.5));

  const iconNaturalW =  65;
  const iconNaturalH =  65;
  const iconW = Math.ceil(iconNaturalW * (previewScale * scaleMultiplier));
  const iconH = Math.ceil(iconNaturalH * (previewScale * scaleMultiplier));

  let drawX;
  if (align === 'right') {
    drawX = Math.floor(cardLeft + cardW - iconW - padding);
  } else {
    drawX = Math.floor(cardLeft + padding);
  }
  const yOffset = typeof options.yOffset === 'number' ? options.yOffset : -7;
  const drawY = y + yOffset;

  // Draw a rounded border behind the icon
  ctx.save();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.fillStyle = 'rgba(0,0,0,0)';
  const rx = drawX - padding;
  const ry = drawY - Math.floor(padding);
  const rw = iconW + padding * 2;
  const rh = iconH + padding * 2;
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, 6);
    ctx.stroke();
  } else {
    const r = 6;
    ctx.beginPath();
    ctx.moveTo(rx + r, ry);
    ctx.lineTo(rx + rw - r, ry);
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
    ctx.lineTo(rx + rw, ry + rh - r);
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
    ctx.lineTo(rx + r, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
    ctx.lineTo(rx, ry + r);
    ctx.quadraticCurveTo(rx, ry, rx + r, ry);
    ctx.stroke();
  }
  ctx.restore();

  // Draw the ability icon image
  ctx.save();
  ctx.globalAlpha = 1.0;
  ctx.drawImage(iconImg, drawX, drawY, iconW, iconH);
  ctx.restore();

  // register rect for modal preview interaction
  try {
    if (showCharacterSelect) {
      const rect = { x: rx, y: ry, w: rw, h: rh, modal:true, type: 'ability', nome: options.nome || null };
      modalPreviewRects.push(rect);
    } else if (typeof window !== 'undefined' && window._registerActivePreviews) {
      const rect = { x: rx, y: ry, w: rw, h: rh, modal:false, type: 'ability', nome: options.nome || null };
      modalPreviewRects.push(rect);
    }
  } catch (e) {}

  // visual highlight when mouse is over this ability preview
  try {
  const isAbilityHighlighted = ((typeof hoveredPreview !== 'undefined' && hoveredPreview && hoveredPreview.x === rx && hoveredPreview.y === ry)
                 || (typeof modalPreviewSelected !== 'undefined' && modalPreviewSelected && modalPreviewSelected.x === rx && modalPreviewSelected.y === ry));
    if (isAbilityHighlighted) {
      ctx.save();
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 16;
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffd700';
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath(); ctx.roundRect(rx, ry, rw, rh, 6); ctx.stroke();
      } else {
        ctx.strokeRect(rx, ry, rw, rh);
      }
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,215,0,0.05)';
      ctx.fillRect(rx, ry, rw, rh);
      ctx.restore();
    }
  } catch (e) {}

  // draw LEIA badge for ability previews if not read (no black background)
  try {
    const badgeText = (options && options.nome && !previewsRead.has(options.nome)) ? 'LEIA!!!' : null;
    if (badgeText) {
      const bx = rx + rw - 6;
      const by = ry + 8;
      ctx.save();
      ctx.font = '22px PixelFont';
      const pad = 8;
      const measuredW = ctx.measureText(badgeText).width;
      const w = Math.max(36, measuredW + pad);
      const textX = bx - w/2 + 44;
      const textY = by + 13;
      ctx.fillText(badgeText, textX, textY);
      ctx.restore();
    }
  } catch (e) {}
}

// Draw a small info box near the hovered/selected preview showing its description
function drawPreviewDescriptionForModal(previewRect) {
  if (!previewRect) return;
  let key = previewRect.nome || null;
  let text = '';
  if (previewRect.type === 'ability' && key) {
    text = abilityPreviewDescriptions[key] || '';
  } else if (previewRect.type === 'dash' && key) {
    text = abilityPreviewDescriptions['DASH'] || `Dash: Avanço rápido característico de ${key}.`;
  }
  if (!text) return;

  // Improved layout parameters
  ctx.save();
  const padding = 14; // uniform padding on all sides
  const wordGap = 2; // 2px between words
  const titleFont = 'bold 18px PixelFont';
  const descFont = '16px PixelFont';
  const titleLineHeight = 22;
  const descLineHeight = 20;

  // Determine maximum available width to the right and left of the preview rect
  const margin = 12;
  const availableRight = Math.max(0, canvas.width - (previewRect.x + previewRect.w) - margin);
  const availableLeft = Math.max(0, previewRect.x - margin);
  // prefer right placement if it fits nicely, otherwise place left
  const preferRight = availableRight >= Math.min(380, canvas.width * 0.45);

  // working max width is the larger of available sides but cap to canvas - margins
  const maxGlobalWidth = Math.min(420, canvas.width - margin * 2);
  const targetMaxWidth = preferRight ? Math.min(availableRight, maxGlobalWidth) : Math.min(availableLeft, maxGlobalWidth);
  const usedMaxWidth = Math.max(160, targetMaxWidth - padding * 2);

  // wrap preserving original spaces so the actual space characters remain active
  function wrapPreserveSpaces(ctx, text, maxW) {
    const tokens = text.split(/(\s+)/); // tokens include spaces
    const lines = [];
    let cur = '';
    let curW = 0;
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      const w = ctx.measureText(t).width;
      if (cur === '') {
        cur = t;
        curW = w;
      } else {
        if (curW + w > maxW) {
          lines.push(cur);
          cur = t;
          curW = w;
        } else {
          cur += t;
          curW += w;
        }
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  // prepare lines using space-preserving wrap
  ctx.font = descFont;
  const descLines = wrapPreserveSpaces(ctx, text, usedMaxWidth);

  ctx.font = titleFont;
  const title = (previewRect.type === 'ability' && key) ? (key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())) : (previewRect.type === 'dash' ? 'Dash' : 'Descrição');
  const titleWidth = ctx.measureText(title).width;

  // measure desc width from wrapped lines directly
  ctx.font = descFont;
  let descMaxW = 0;
  for (const l of descLines) {
    descMaxW = Math.max(descMaxW, ctx.measureText(l).width);
  }

  const contentW = Math.max(titleWidth, descMaxW);
  const boxW = Math.min(maxGlobalWidth, Math.max(160, Math.ceil(contentW + padding * 2)));
  const boxH = Math.ceil(padding * 2 + titleLineHeight + descLines.length * descLineHeight);

  // choose side and position
  let infoX = previewRect.x + previewRect.w + margin; // right by default
  if (infoX + boxW > canvas.width - margin || (!preferRight && availableLeft > availableRight)) {
    // place left
    infoX = previewRect.x - boxW - margin;
  }
  let infoY = previewRect.y;
  if (infoY + boxH > canvas.height - margin) infoY = canvas.height - boxH - margin;
  if (infoY < margin) infoY = margin;

  // draw box
  ctx.globalAlpha = 0.94;
  ctx.fillStyle = '#111';
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(infoX, infoY, boxW, boxH, 10);
  else ctx.rect(infoX, infoY, boxW, boxH);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.stroke();

  // draw title
  ctx.font = titleFont;
  ctx.fillStyle = '#ffd700';
  ctx.textAlign = 'left';
  let ty = infoY + padding + titleLineHeight - 6;
  ctx.fillText(title, infoX + padding, ty);

  // draw description lines preserving their spaces
  ctx.font = descFont;
  ctx.fillStyle = '#ffe066';
  ty += descLineHeight;
  for (let i = 0; i < descLines.length; i++) {
    ctx.fillText(descLines[i], infoX + padding, ty);
    ty += descLineHeight;
  }
  ctx.restore();
}

function drawActiveCharacterViewer() {
  const nome = activeCharacter || 'O Errante de Eldoria';
  const cx = 190, cy = 190, scale = 3.7;
  
  ctx.save();
  ctx.globalAlpha = 0.97;
  ctx.fillStyle = 'rgba(40, 40, 60, 0)';
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 4;
  
  ctx.restore();
  
  drawCharacterIdlePreview(nome, cx, cy-10, scale, true);
  
  ctx.save();
  ctx.font = 'bold 22px PixelFont';
  ctx.fillStyle = '#ffd700';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 8;
  ctx.fillText(nome, cx, cy+65);
  ctx.restore();
}

