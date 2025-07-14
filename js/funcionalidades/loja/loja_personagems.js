
// Função utilitária para obter o retângulo do botão de seleção de personagem de forma responsiva
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
  
  // Check purchases for all special characters
  for (let character in characterData) {
    const purchases = characterData[character].purchases;
    // Check each special character
    ['Kuroshi, o Ninja', 'Roderick, o Cavaleiro', 'Valthor, o Mago'].forEach(charName => {
      if (purchases[charName] && purchases[charName] > 0 && !unlocked.includes(charName)) {
        unlocked.push(charName);
      }
    });
  }
  
  return unlocked;
}

// ====== VARIÁVEIS PARA MODAL DE SELEÇÃO DE PERSONAGEM ======
let showCharacterSelect = false;
let characterSelectRects = [];
let selectedCharacterModalIndex = 0;
let closeButtonHovered = false; // Variável para hover do botão fechar
let closeButtonSelected = false; // Nova variável para seleção via teclado

// Botão para abrir seleção de personagem
function drawCharacterSelectButton() {
  if(insufficientFundsMessage) return;

  // Usa a função utilitária para obter o retângulo do botão
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
// Modal de seleção de personagem
function drawCharacterSelectModal() {
  if (!showCharacterSelect) return;
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
  // Botão de fechar
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = (closeButtonHovered || closeButtonSelected) ? '#333' : '#222';
  ctx.beginPath();
  ctx.arc(canvas.width-60, 100, 28, 0, Math.PI*2);
  ctx.fill();
  ctx.font = 'bold 32px PixelFont';
  ctx.fillStyle = (closeButtonHovered || closeButtonSelected) ? '#ffffff' : '#ffd700';
  ctx.textAlign = 'center';
  ctx.fillText('X', canvas.width-60, 112);
  ctx.restore();
  // Lista de personagens desbloqueados
  const unlocked = getUnlockedCharacters();
  const charW = 170, charH = 260;
  const gap = 30;
  // Corrige: calcula corretamente o startX para centralizar e evitar overflow
  const totalW = unlocked.length * charW + (unlocked.length - 1) * gap;
  const startX = Math.max(60, Math.floor((canvas.width - totalW) / 2));
  characterSelectRects = []; // Corrige: limpa antes de preencher

  for (let i = 0; i < unlocked.length; i++) {
      const nome = unlocked[i];
      const x = startX + i * (charW + gap);
      const y = 180;
      // Card com efeito hover
      ctx.save();
      ctx.globalAlpha = 0.97;
      let isHovered = i === hoveredCharacterIndex;
      // Fundo do card com efeito hover
       ctx.fillStyle = isHovered ? 'rgba(255,215,0,0.2)' : 
                   (selectedCharacterModalIndex===i) ? 'rgba(172, 83, 83, 0.13)' : 
                   'rgba(172, 83, 83, 0.13)';
      // Card// Borda com brilho no hover
      ctx.strokeStyle = isHovered ? '#fff' :
                     (activeCharacter===nome) ? '#ffd700' : 
                     '#fff';

      ctx.lineWidth = (activeCharacter===nome) ? 4 : 2;

       // Adiciona sombra no hover
    if (isHovered) {
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 15;
    }

    ctx.beginPath();
    ctx.roundRect(x, y, charW, charH, 22);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    // Nome - Ajustado para texto mais longo
    ctx.save();
    // Quebra o nome em múltiplas linhas se necessário
    let nomeLines = [];
    let nomeRest = nome.trim();
    const maxWidth = charW - 18;
    ctx.font = 'bold 16px PixelFont';
    // Reduz fonte se nome for muito longo
    let fontSize = 16;
    if (ctx.measureText(nome).width > maxWidth) {
      fontSize = 13;
      ctx.font = `bold ${fontSize}px PixelFont`;
    }
    // Algoritmo simples de quebra de linha por palavra
    while (nomeRest.length > 0) {
      let fit = nomeRest.length;
      while (fit > 0 && ctx.measureText(nomeRest.slice(0, fit)).width > maxWidth) fit--;
      if (fit === 0) fit = 1;
      let line = nomeRest.slice(0, fit);
      // Evita quebrar no meio da palavra
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
    // Centraliza verticalmente as linhas do nome no card
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
    // Ícones e stats menores, distribuídos entre esquerda e direita, sem inimigos
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
    // Esquerda (pulos)
    ctx.font = iconFont;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff';
    ctx.fillText(iconStats[0].icon, x + 18, iconY);
    ctx.font = valueFont;
    ctx.fillStyle = '#ffd700';
    ctx.fillText(iconStats[0].value, x + 43, iconY);
    // Direita (velocidade)
    ctx.font = iconFont;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';
    ctx.fillText(iconStats[1].icon, x + charW - 14, iconY);
    ctx.font = valueFont;
    ctx.fillStyle = '#ffd700';
    ctx.fillText(iconStats[1].value, x + charW - 34, iconY);
    // Centro (vidas)
    ctx.font = iconFont;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText(iconStats[2].icon, x + charW/2, iconY + iconSpacing);
    ctx.font = valueFont;
    ctx.fillStyle = '#ffd700';
    ctx.fillText(iconStats[2].value, x + charW/2 + 18, iconY + iconSpacing);
    ctx.restore();
    // Animação idle do personagem
    drawCharacterIdlePreview(nome, x+charW/2, y+charH/2+10, 3.2, i===selectedCharacterModalIndex);
    // Corrige: registra corretamente a área de clique para cada personagem
    characterSelectRects.push({x, y, w: charW, h: charH, nome, index: i, modal:true});
  }
}

// Função para desenhar animação idle do personagem
function drawCharacterIdlePreview(nome, cx, cy, scale, highlight) {
  if (!playerSpriteLoaded) return;
  
  // Get the correct sprite and config
  const characterSprite = playerSprites[nome].sprite;
  const characterConfig = playerSprites[nome].config;
  
  // Get frame info from character config
  const frameHeight = characterConfig[2].frameHeight; // Row 2 = idle animation
  const frameWidth = characterConfig[2].frameWidth;
  const offsetX = characterConfig[2].offsetX || 0;
  const offsetY = characterConfig[2].offsetY || 0;
  
  // Idle animation frame calculation
  let frame;
  if (nome === 'Kuroshi, o Ninja') {
    frame = Math.floor((performance.now()/1000)%2); // Standard idle speed for ninja
  } else if (nome === 'Roderick, o Cavaleiro') {
    frame = Math.floor((performance.now()/1600)%2); // Slower idle
  } else if (nome === 'Valthor, o Mago') {
    frame = Math.floor((performance.now()/1200)%2); // Faster idle
  } else {
    frame = Math.floor((performance.now()/1400)%2); // Default speed
  }

  const fw = frameWidth * scale;
  const fh = frameHeight * scale;
  const sx = frame * frameWidth;
  const sy = 2 * frameHeight; // Row 2 = idle animation
  
  ctx.save();
  if (highlight) {
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 24;
  }
  
  // Draw the sprite with proper offset
  ctx.drawImage(
    characterSprite,
    sx, sy, frameWidth, frameHeight,
    cx - fw/2 + offsetX * scale, cy - fh/2 + offsetY * scale, fw, fh
  );
  
  ctx.restore();
if (showCharacterSelect) return;
  // Stats no idle preview: igual ao card do modal
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
  // Esquerda (pulos)
  ctx.font = iconFont;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff';
  ctx.fillText(iconStats[0].icon, cx - iconSpacing, iconY);
  ctx.font = valueFont;
  ctx.fillStyle = '#ffd700';
  ctx.fillText(iconStats[0].value, cx - iconSpacing + 25, iconY);
  // Direita (velocidade)
  ctx.font = iconFont;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'right';
  ctx.fillText(iconStats[1].icon, cx + iconSpacing, iconY);
  ctx.font = valueFont;
  ctx.fillStyle = '#ffd700';
  ctx.fillText(iconStats[1].value, cx + iconSpacing - 20, iconY);
  // Centro (vidas)
  ctx.font = iconFont;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.fillText(iconStats[2].icon, cx, iconY + iconSpacing);
  ctx.font = valueFont;
  ctx.fillStyle = '#ffd700';
  ctx.fillText(iconStats[2].value, cx + 18, iconY + iconSpacing);
  ctx.restore();
}
