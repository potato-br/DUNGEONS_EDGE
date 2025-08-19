

function isGlobalPurchaseItemName(name) {
  if (!name) return false;
  
  const item = shopItems.concat(SECRET_ITEMS).find(i => i.nome === name);
  if (item?.globalItem) return true;
  
  return !!characterData[name];
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function wrapText(ctx, text, maxWidth) {
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

function getPurchasesCountByName(name) {
  if (!name) return 0;
  if (isGlobalPurchaseItemName(name)) return globalPurchases[name] || 0;
  return _charData[activeCharacter]?.purchases?.[name] || 0;
}

function incrementPurchaseByName(name) {
  if (!name) return;
  if (isGlobalPurchaseItemName(name)) {
    globalPurchases[name] = (globalPurchases[name] || 0) + 1;
  } else {
    if (!_charData[activeCharacter].purchases) _charData[activeCharacter].purchases = {};
    _charData[activeCharacter].purchases[name] = (_charData[activeCharacter].purchases[name] || 0) + 1;
  }
}

function revelarItensSecretos() {
    SECRET_ITEMS.forEach(secretItem => {
        if (!shopItems.find(i => i.nome === secretItem.nome) && (isDebugMode || depthPoints >= secretItem.requiredDepth)) {
            const novoItem = {
                ...secretItem,
                priceIncrement: 0,
                disponivel: true,
                compras: 0,
                isSecret: true,
                isNew: true, 
                efeito: secretItem.efeito || (() => {})
            };
            shopItems.push(novoItem);
        }
    });
}

function isItemRevealedGlobally(item) {
  if (!item) return false;
  if (globalRevealedItems[item.nome]) return true;
  return false;
}

function doesMeetRevealRequirements(item) {
  if (!item || !item.hiddenUntilPurchases) return false;
  for (const reqName in item.hiddenUntilPurchases) {
    const needed = item.hiddenUntilPurchases[reqName] || 0;
    const have = getPurchasesCountByName(reqName) || 0;
    if (have < needed) return false;
  }
  return true;
}

function checkAndRevealHiddenItems() {
  
  const allItems = shopItems.concat(SECRET_ITEMS || []);
  for (const it of allItems) {
    if (!it || !it.hiddenUntilPurchases) continue;
    if (isItemRevealedGlobally(it)) continue;
    if (doesMeetRevealRequirements(it)) {
      
      globalRevealedItems[it.nome] = true;
      
      if (it.revealGlobally) {
        delete it.exclusiveToCharacter;
      }
      
      it.hidden = false;
      
      it.disponivel = true;
    }
  }
}

function isItemVisible(item) {
  if (!item) return false;
  
  if (item.exclusiveToCharacter && item.exclusiveToCharacter !== activeCharacter) return false;
  
  if (item.hiddenUntilPurchases) {
    if (isItemRevealedGlobally(item)) return true;
    if (item.hidden === false) return true;
    return false;
  }
  return true;
}

function onDepthChange(newDepth) {
    depthPoints = newDepth;
    revelarItensSecretos();
  checkAndRevealHiddenItems();
    if (gameState === 'loja') {
        updateShopAvailability();
        drawLoja();
    }
}

function checkDepthRequirement(item, compras) {
    if (!item.requiredDepthSteps) return true;
    
    
    const nextCompra = compras;
    const currentDepth = item.requiredDepthSteps[nextCompra] || 
                        item.requiredDepthSteps[0] || 0;
    
    return depthPoints >= currentDepth;
}

function checkItemRequirement(item, compras) {
  
  
  const hasMulti = Array.isArray(item.requiredItems) && item.requiredItems.length > 0;
  const hasSingle = item.requiredItem && item.requiredItemSteps;
  if (!hasMulti && !hasSingle) return true;

  const nextCompra = compras;

  if (hasMulti) {
    
    for (const req of item.requiredItems) {
      const reqName = typeof req === 'string' ? req : req.nome;
      const reqSteps = (req.steps || req.requiredItemSteps) || item.requiredItemSteps;
      const currentRequired = reqSteps?.[nextCompra] || reqSteps?.[0] || 0;
      const requiredItemPurchases = getPurchasesCountByName(reqName);
      if (requiredItemPurchases < currentRequired) return false;
    }
    return true;
  }

  
  const requiredItemPurchases = getPurchasesCountByName(item.requiredItem);
  const currentRequired = item.requiredItemSteps[nextCompra] || item.requiredItemSteps[0] || 0;
  return requiredItemPurchases >= currentRequired;
}

function getCurrentRequirements(item) {
  
  const compras = getPurchasesCountByName(item.nome) || 0;
  const nextCompra = compras;

  const depthReq = item.requiredDepthSteps?.[nextCompra] || item.requiredDepthSteps?.[0] || 0;

  
  const itemReqs = [];

  if (Array.isArray(item.requiredItems) && item.requiredItems.length > 0) {
    for (const req of item.requiredItems) {
      const reqName = typeof req === 'string' ? req : req.nome;
      const reqSteps = (req.steps || req.requiredItemSteps) || item.requiredItemSteps;
      const itemReq = reqSteps?.[nextCompra] || reqSteps?.[0] || 0;
      itemReqs.push({ nome: reqName, quantidade: itemReq });
    }
  } else if (item.requiredItem && item.requiredItemSteps) {
    const itemReq = item.requiredItemSteps?.[nextCompra] || item.requiredItemSteps?.[0] || 0;
    itemReqs.push({ nome: item.requiredItem, quantidade: itemReq });
  }

  return { depthReq, itemReqs };
}

function updateShopAvailability() {
    shopItems.forEach(item => {
        if (item.exclusiveToCharacter && item.exclusiveToCharacter !== activeCharacter) {
            item.disponivel = false;
            return;
        }

        
        if (isDebugMode) {
            item.disponivel = true;
            return;
        }

  const compras = getPurchasesCountByName(item.nome);

  const depthRequirementMet = checkDepthRequirement(item, compras);
  const itemRequirementMet = checkItemRequirement(item, compras);

  item.disponivel = depthRequirementMet && itemRequirementMet;
    });
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

function drawDungeonButton() {
  
  const { x: btnX, y: btnY, w: btnW, h: btnH } = getDungeonBtnRect();

  ctx.save();
  ctx.globalAlpha = 0.97;
  if (isDungeonButtonHovered) {
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 15;
    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
  } else {
    ctx.fillStyle = 'rgba(40, 40, 60, 0.15)';
  }
  ctx.beginPath();
  ctx.roundRect(btnX, btnY, btnW, btnH, 12);
  ctx.fill();
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = `bold ${Math.max(18, Math.floor(btnH * 0.55))}px PixelFont`;
  ctx.fillStyle = isDungeonButtonHovered ? '#ffffff' : '#ffd700';
  ctx.textAlign = 'center';
  ctx.fillText('Ir para Dungeon →', btnX + btnW/2, btnY + btnH/2 + btnH*0.18);
  ctx.restore();
}

function drawLoja() {
  if (gameState === 'jogando' && gameState !== 'loja') return;
  updateShopAvailability();

  
  
  isDungeonButtonHovered = selectedElement.type === 'dungeon';
  isCharacterSelectButtonHovered = selectedElement.type === 'character';
  if (selectedElement.type === 'dungeon' || selectedElement.type === 'character') {
    selectedIndex = -1;
  }
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, 700, canvas.height);
  
  ctx.globalAlpha = 1;
  ctx.font = 'bold 42px PixelFont';
  ctx.textAlign = 'left';
  ctx.shadowColor = '#ff6b00';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#ffd700';
  ctx.fillText('LOJA', 20, 60);
  ctx.shadowBlur = 0;

  
  drawDungeonButton();
  
  drawActiveCharacterViewer();
  
  ctx.font = '28px PixelFont';
  ctx.fillStyle = '#ffd700';
  ctx.fillText(`Seu dinheiro: $${money}`, 20, 100);
  
  
  let startY = 140;
  const lineHeight = 20;
  
  ctx.font = '24px PixelFont';
  ctx.fillStyle = 'white';
  

  
  
  
  
  const nextSecretDepth = SECRET_ITEMS
    .filter(item => !shopItems.find(i => i.nome === item.nome))
    .reduce((nearest, item) => 
      item.requiredDepth > depthPoints && 
      (nearest === null || item.requiredDepth < nearest) ? 
      item.requiredDepth : nearest, null);

  
  
  const { x: charBtnX, y: charBtnY, w: charBtnW, h: charBtnH } = (typeof getCharacterBtnRect === 'function') ? getCharacterBtnRect() : getDungeonBtnRect();
  const profFontSize = Math.max(14, Math.min(canvas.width * 0.017, 22));
  ctx.font = `bold ${profFontSize}px PixelFont`;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'white';
  const profX = charBtnX + charBtnW/2;
  const profY = charBtnY + charBtnH + profFontSize + 10;
  ctx.fillText(`⬇⬇⬇ Profundidade atual: ${depthPoints}m`, profX, profY);
  if (nextSecretDepth) {
    ctx.font = `bold ${Math.max(12, Math.floor(profFontSize * 0.8))}px PixelFont`;
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`(Próximo segredo em: ${nextSecretDepth}m)`, profX, profY + profFontSize + 4);
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = 'white';
  ctx.font = '24px PixelFont';
  

  
  
  lojaOptionRects = [];
  
  const footerHeight = 50;
  
  let shopStartY = 360;
  const itemsPerRow = 3;
  const itemSize = 100; 
  const itemGap = 10;
  const gridStartX = 20;
  let visibleItems = shopItems.filter(item => isItemVisible(item));
  const totalRows = Math.ceil(visibleItems.length / itemsPerRow);
  
  const availableHeight = canvas.height - shopStartY - footerHeight - 10;
  const visibleRows = Math.floor(availableHeight / (itemSize + itemGap));
  let shopHeight = visibleRows * (itemSize + itemGap);
  let maxScroll = Math.max(0, (totalRows - visibleRows) * (itemSize + itemGap));
  scrollOffset = Math.min(scrollOffset, maxScroll);

  
  const gridWidth = itemsPerRow * itemSize + (itemsPerRow - 1) * itemGap;
  const gridX = gridStartX;
  const gridY = shopStartY;

  
  const arrowOffsetX = gridWidth + 30; 
  if (scrollOffset > 0) {
    ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
    ctx.beginPath();
    ctx.moveTo(gridX + arrowOffsetX, gridY - 10);
    ctx.lineTo(gridX + arrowOffsetX + 15, gridY - 20);
    ctx.lineTo(gridX + arrowOffsetX + 30, gridY - 10);
    ctx.closePath();
    ctx.fill();
  }
  if (scrollOffset < maxScroll) {
    ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
    ctx.beginPath();
    ctx.moveTo(gridX + arrowOffsetX, gridY + shopHeight + 10);
    ctx.lineTo(gridX + arrowOffsetX + 15, gridY + shopHeight + 20);
    ctx.lineTo(gridX + arrowOffsetX + 30, gridY + shopHeight + 10);
    ctx.closePath();
    ctx.fill();
  }

  
  (function drawScrollIndicators(){
    
    const rowHeight = itemSize + itemGap;
    const firstVisibleRow = Math.floor(scrollOffset / rowHeight);
    const lastVisibleRow = firstVisibleRow + visibleRows - 1;

    let newAbove = false, newBelow = false, leiaAbove = false, leiaBelow = false;
    for (let idx = 0; idx < visibleItems.length; idx++) {
      const row = Math.floor(idx / itemsPerRow);
      if (row >= firstVisibleRow && row <= lastVisibleRow) continue; 
      const it = visibleItems[idx];
      if (!it) continue;
      const isNewFlag = (it.isSecret || it.hiddenUntilPurchases) && !newItemsSeen.has(it.nome);
      const isLeiaFlag = (!it.isSecret && !it.hiddenUntilPurchases) && !itemsRead.has(it.nome);
      if (row < firstVisibleRow) {
        if (isNewFlag) newAbove = true;
        if (isLeiaFlag) leiaAbove = true;
      } else if (row > lastVisibleRow) {
        if (isNewFlag) newBelow = true;
        if (isLeiaFlag) leiaBelow = true;
      }
    }

    const badgeSpacing = 6;
    const badgeHeight = 18;
    const badgePadX = 8;
    const badgeGap = 6;
    
    const topBaseX = gridX + arrowOffsetX + 8;
    const topBaseY = gridY - 36;
    let bx = topBaseX;
    if (newAbove) {
      const text = 'NEW';
      ctx.font = '11px PixelFont';
      const w = Math.max(36, ctx.measureText(text).width + badgePadX);
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      roundRect(ctx, bx, topBaseY, w, badgeHeight, 6, true, false);
      ctx.fillStyle = '#00ffea';
      ctx.textAlign = 'center';
      ctx.fillText(text, bx + w/2, topBaseY + 13);
      bx += w + badgeGap;
    }
    if (leiaAbove) {
      const text = 'LEIA';
      ctx.font = '11px PixelFont';
      const w = Math.max(36, ctx.measureText(text).width + badgePadX);
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      roundRect(ctx, bx, topBaseY, w, badgeHeight, 6, true, false);
      ctx.fillStyle = '#ffd700';
      ctx.textAlign = 'center';
      ctx.fillText(text, bx + w/2, topBaseY + 13);
      bx += w + badgeGap;
    }

    
    const bottomBaseX = gridX + arrowOffsetX + 8;
    const bottomBaseY = gridY + shopHeight + 14;
    bx = bottomBaseX;
    if (newBelow) {
      const text = 'NEW';
      ctx.font = '11px PixelFont';
      const w = Math.max(36, ctx.measureText(text).width + badgePadX);
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      roundRect(ctx, bx, bottomBaseY, w, badgeHeight, 6, true, false);
      ctx.fillStyle = '#00ffea';
      ctx.textAlign = 'center';
      ctx.fillText(text, bx + w/2, bottomBaseY + 13);
      bx += w + badgeGap;
    }
    if (leiaBelow) {
      const text = 'LEIA';
      ctx.font = '11px PixelFont';
      const w = Math.max(36, ctx.measureText(text).width + badgePadX);
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      roundRect(ctx, bx, bottomBaseY, w, badgeHeight, 6, true, false);
      ctx.fillStyle = '#ffd700';
      ctx.textAlign = 'center';
      ctx.fillText(text, bx + w/2, bottomBaseY + 13);
      bx += w + badgeGap;
    }
  })();

  selectedIndex = Math.min(selectedIndex, visibleItems.length - 1);

  let gridRow = 0;
  let gridCol = 0;
  let selectedItemRect = null;
  
  updateLojaZooms(visibleItems, selectedIndex);
  
  for (let i = 0; i < visibleItems.length; i++) {
    if (i === selectedIndex) continue;
    gridRow = Math.floor(i / itemsPerRow);
    gridCol = i % itemsPerRow;
    let x = gridStartX + gridCol * (itemSize + itemGap);
    let y = shopStartY + gridRow * (itemSize + itemGap) - scrollOffset;
    if (y + itemSize > shopStartY && y < shopStartY + shopHeight) {
      const item = visibleItems[i];
      ctx.save();
      let centerX = x + itemSize / 2;
      let centerY = y + itemSize / 2;
      let scale = lojaZooms[i] || 1;
      let wobble = lojaWobbles[i] || 0;
      ctx.translate(centerX, centerY);
      ctx.rotate(wobble);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
      let imgW = item.imgWidth || itemSize;
      let imgH = item.imgHeight || itemSize;
      if (lojaItemImages[item.nome] && !lojaItemImageNotFound[item.nome]) {
        const offsetX = x + (itemSize - imgW) / 2;
        const offsetY = y + (itemSize - imgH) / 2;
        ctx.drawImage(lojaItemImages[item.nome], offsetX, offsetY, imgW, imgH);
      } else {
        ctx.fillStyle = 'rgba(40,40,40,0.7)';
        ctx.fillRect(x, y, itemSize, itemSize);
      }
      ctx.save();
      
      if ((item.isSecret || item.hiddenUntilPurchases) && !newItemsSeen.has(item.nome)) {
        ctx.font = 'bold 15px PixelFont';
        ctx.fillStyle = '#00ffea';
        ctx.textAlign = 'right';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;
        ctx.fillText('NEW', x + itemSize - 8, y + 22);
        ctx.shadowBlur = 0;
      }
      else if (!item.isSecret && !item.hiddenUntilPurchases && !itemsRead.has(item.nome)) {
        ctx.font = 'bold 13px PixelFont';
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'left';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;
        ctx.fillText('LEIA!!!!', x + 8, y + 22);
        ctx.shadowBlur = 0;
      }
      ctx.restore();
      ctx.restore();
      
      if (item.isStartDepthItem) {
        ctx.save();
        ctx.font = '11px PixelFont';
        const tagText = 'Perde ao entrar';
        const tagW = Math.min(itemSize - 8, ctx.measureText(tagText).width + 12);
        const tagX = x + (itemSize - tagW) / 2;
        const tagY = y + itemSize - 20;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        roundRect(ctx, tagX, tagY, tagW, 18, 6, true, false);
        ctx.fillStyle = '#ffcc66';
        ctx.textAlign = 'center';
        ctx.fillText(tagText, tagX + tagW/2, tagY + 13);
        ctx.restore();
      }
      lojaOptionRects.push({x, y, w: itemSize, h: itemSize, index: i});
    }
  }
  
  if (selectedIndex >= 0 && selectedIndex < visibleItems.length) {
    let i = selectedIndex;
    gridRow = Math.floor(i / itemsPerRow);
    gridCol = i % itemsPerRow;
    let x = gridStartX + gridCol * (itemSize + itemGap);
    let y = shopStartY + gridRow * (itemSize + itemGap) - scrollOffset;
    if (y + itemSize > shopStartY && y < shopStartY + shopHeight) {
      const item = visibleItems[i];
      
      if (item.isSecret || item.hiddenUntilPurchases) {
        newItemsSeen.add(item.nome);
      } else if (!item.isSecret && !item.hiddenUntilPurchases) {
        itemsRead.add(item.nome);
      }
      ctx.save();
      let centerX = x + itemSize / 2;
      let centerY = y + itemSize / 2;
      let scale = lojaZooms[i] || 1;
      let wobble = lojaWobbles[i] || 0;
      ctx.translate(centerX, centerY);
      ctx.rotate(wobble);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
      let imgW = item.imgWidth || itemSize;
      let imgH = item.imgHeight || itemSize;
      if (lojaItemImages[item.nome] && !lojaItemImageNotFound[item.nome]) {
        const offsetX = x + (itemSize - imgW) / 2;
        const offsetY = y + (itemSize - imgH) / 2;
        ctx.drawImage(lojaItemImages[item.nome], offsetX, offsetY, imgW, imgH);
      } else {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.10)';
        ctx.fillRect(x, y, itemSize, itemSize);
      }
  
  if (item.isStartDepthItem && !(selectedElement.type === 'items' && selectedIndex === i)) {
        ctx.save();
        ctx.font = '12px PixelFont';
        const tagText = 'Perde ao entrar';
        const tagW = Math.min(itemSize - 8, ctx.measureText(tagText).width + 14);
        const tagX = x + (itemSize - tagW) / 2;
        const tagY = y + itemSize - 22;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        roundRect(ctx, tagX, tagY, tagW, 20, 6, true, false);
        ctx.fillStyle = '#ffcc66';
        ctx.textAlign = 'center';
        ctx.fillText(tagText, tagX + tagW/2, tagY + 14);
        ctx.restore();
      }
      ctx.restore();
      selectedItemRect = { x, y, item };
      lojaOptionRects.push({x, y, w: itemSize, h: itemSize, index: i});
    }
  }

  
  if (selectedItemRect) {
    const { x, y, item } = selectedItemRect;
    const infoX = x + itemSize + 30;
    const infoY = y + 10;
    ctx.save();
    
    ctx.font = 'bold 18px PixelFont';
    const nomeWidth = ctx.measureText(item.nome).width;
    ctx.font = '16px PixelFont';
    
    const maxDescWidth = 320; 
    const descLines = wrapText(ctx, item.descricao || '', maxDescWidth);
    
    const MAX_DESC_LINES = 6;
    let truncated = false;
    if (descLines.length > MAX_DESC_LINES) {
      descLines.length = MAX_DESC_LINES;
      truncated = true;
    }
    if (truncated) {
      const lastIndex = descLines.length - 1;
      descLines[lastIndex] = descLines[lastIndex].trim().replace(/\.+$/, '') + '...';
    }
    const descWidth = descLines.reduce((w, l) => Math.max(w, ctx.measureText(l).width), 0);

    
  const comprasAtual = getPurchasesCountByName(item.nome) || 0;
    let precoText;
    if (comprasAtual >= item.maxCompras) {
      precoText = 'MAX';
    } else {
      precoText = `Preço: $${item.preco} (${comprasAtual}/${item.maxCompras})`;
    }
    const precoWidth = ctx.measureText(precoText).width;
    let reqText = '';
    if (!item.disponivel) {
      ctx.font = '14px PixelFont';
      const reqs = getCurrentRequirements(item);
      if (reqs.depthReq > 0 && depthPoints < reqs.depthReq) reqText = `Requer: ${reqs.depthReq}m`;
      if (reqs.itemReqs && reqs.itemReqs.length > 0) {
        for (let i = 0; i < reqs.itemReqs.length; i++) {
          const r = reqs.itemReqs[i];
          const currentItemCount = getPurchasesCountByName(r.nome) || 0;
          if (currentItemCount < r.quantidade) {
            reqText += reqText ? ' e ' : 'Requer: ';
            reqText += `${r.quantidade > 1 ? r.quantidade + 'x de ' : ''}${r.nome}`;
            reqText += ` (tem ${currentItemCount})`;
          }
        }
      }
    }
    ctx.font = '14px PixelFont';
    const reqWidth = reqText ? ctx.measureText('🔒 ' + reqText).width : 0;
    
  const maxWidth = Math.max(220, nomeWidth, descWidth, precoWidth, reqWidth) + 30;
    
  const lineHeight = 22;
  const baseLines = 3; 
  const descLineCount = Math.max(1, descLines.length);
  let linesCount = baseLines - 1 + descLineCount; 
  if (reqText) linesCount++;
  
  if (item.isStartDepthItem) linesCount++;
  const boxHeight = linesCount * lineHeight + 18;
    
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#222';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(infoX - 10, infoY + 10, maxWidth, boxHeight, 10);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.stroke();
    
    let textY = infoY + 28;
    ctx.font = 'bold 18px PixelFont';
    ctx.fillStyle = '#ffd700';
    ctx.textAlign = 'left';
    ctx.fillText(item.nome, infoX, textY);
    textY += lineHeight;
    ctx.font = '16px PixelFont';
    ctx.fillStyle = '#ffe066';
    
    for (let li = 0; li < descLines.length; li++) {
      ctx.fillText(descLines[li], infoX, textY);
      textY += lineHeight;
    }
    
    if (item.isStartDepthItem) {
      ctx.font = '13px PixelFont';
      ctx.fillStyle = '#ffdd99';
      ctx.fillText('Aviso: item será perdido ao entrar na dungeon', infoX, textY);
      textY += lineHeight;
    }
  ctx.font = '16px PixelFont';
  ctx.fillStyle = comprasAtual >= item.maxCompras ? '#ff4444' : '#fff';
  ctx.fillText(precoText, infoX, textY);
    if (reqText) {
      textY += lineHeight;
      ctx.font = '14px PixelFont';
      ctx.fillStyle = '#ff4444';
      ctx.fillText('🔒 ' + reqText, infoX, textY);
    }
    ctx.restore();
  }

  
  if (shopMessage) {
    ctx.font = '24px PixelFont';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'lightgreen';
    ctx.fillText(shopMessage, 20, canvas.height - 60);
  }
  
  
  if (insufficientFundsMessage) {
    ctx.save();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    
    
    ctx.font = 'bold 32px PixelFont';
    ctx.fillStyle = '#ff4444';
    ctx.textAlign = 'center';
    const maxWidth = Math.max(200, Math.min(canvas.width - 120, 800));
    const words = insufficientFundsMessage.split(' ');
    let line = '';
    const lines = [];
    let textMaxWidth = 0;
    for (let i = 0; i < words.length; i++) {
      const testLine = line ? (line + ' ' + words[i]) : words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line) {
        lines.push(line);
        textMaxWidth = Math.max(textMaxWidth, ctx.measureText(line).width);
        line = words[i];
      } else {
        line = testLine;
      }
    }
    if (line) {
      lines.push(line);
      textMaxWidth = Math.max(textMaxWidth, ctx.measureText(line).width);
    }

    const paddingX = 40;
    const paddingY = 24;
    const boxWidth = Math.min(canvas.width - 80, textMaxWidth + paddingX * 2);
    const boxHeight = lines.length * 40 + paddingY * 2;
    const boxX = (canvas.width - boxWidth) / 2;
    const boxY = (canvas.height - boxHeight) / 2;

    
    ctx.fillStyle = 'rgb(0, 0, 0)';
    roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 12, true, false);
    
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 3;
    roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 12, false, true);

    
    const startY = boxY + paddingY + 28; 
    for (let i = 0; i < lines.length; i++) {
      ctx.fillStyle = '#ff4444';
      ctx.fillText(lines[i], canvas.width / 2, startY + i * 40);
    }
    ctx.restore();
  }

  
  if (purchaseHistory.length > 0) {
    ctx.font = '24px PixelFont';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'lightgreen';
    purchaseHistory.forEach((msg, index) => {
      ctx.fillText(msg, 800, canvas.height - 420 + (index * 30));
    });
  }

  ctx.font = '24px PixelFont';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.fillText('"Setas/🖱️" Navegar   |   "⏎/🖱️" Confirmar   |   "Esc" ir para dungeon ', 20, canvas.height - 30);
  ctx.restore();

  if (!showCharacterSelect) drawCharacterSelectButton();
  if (showCharacterSelect) drawCharacterSelectModal();

    if (isDebugMode) {
        ctx.save();
        ctx.font = 'bold 20px PixelFont';
        ctx.fillStyle = '#ff0000';
        ctx.textAlign = 'right';
        ctx.fillText('DEBUG MODE', canvas.width - 20, 20);
        ctx.restore();
    }
}

[...shopItems, ...SECRET_ITEMS].forEach(item => {
  if (!item.nome) return;
  const img = new Image();
  
  const imgName = item.nome.toLowerCase().replace(/ /g, ' ').replace(/[^a-z0-9 ]/gi, '').replace(/ +/g, ' ').trim();
  const imgPath = `./images/loja/${imgName}.png`;
  img.src = imgPath;
  img.onerror = () => {
    lojaItemImageNotFound[item.nome] = true;
  };
  img.onload = () => {
    lojaItemImages[item.nome] = img;
  };
});

function closeShop() {
  if (isShopLoading) return;
  updateBodyStyles(false);
  isShopLoading = true;

  if (typeof resetarCooldownsHabilidades === 'function') resetarCooldownsHabilidades();
  
  if (typeof resetarBackgroundsELaterais === 'function') resetarBackgroundsELaterais();
  

  const blackScreen = document.createElement('div');
  Object.assign(blackScreen.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    transition: 'opacity 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  });
  blackScreen.innerHTML = '<span style="color:white;font-size:2.5rem;font-family:PixelFont;letter-spacing:2px;">Carregando...</span>';
  document.body.appendChild(blackScreen);

  
  canvas.style.opacity = '0';
  setTimeout(() => {
    resetGame({ pauseOnStart: true, showShop: false, il: false, la: true });
    
    
    platformFactory.updateScreenDimensions();
    
    if (typeof drawlateral === 'function') drawlateral();
    canvas.style.opacity = '1';
    setTimeout(() => {
      if (typeof drawlateral === 'function') drawlateral();
      
      blackScreen.style.opacity = '0';
      setTimeout(() => {
        if (blackScreen.parentNode) blackScreen.parentNode.removeChild(blackScreen);
        isShopLoading = false;
      }, 400);
    }, 50);
  }, 300); 
}

function updateBodyStyles(isLoja) {
  if (gameState !== 'loja') return;
  if (isLoja) {
    
    document.body.style.backgroundImage = `
      linear-gradient(
        135deg,
        rgba(0,0,0,0.9) 0%,
        rgba(40,10,10,0.4) 50%,
        rgba(61, 26, 5, 0.4) 100%
      ),
      url("./images/imagens de fundo/fundo da loja/loja_fundo.gif")
    `;
    document.body.style.backgroundSize = '100vw 100vh';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundColor = '#000'; 
     
    
    canvas.style.transition = 'all 0.3s ease-in-out';
  } else {
    
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundRepeat = '';
    document.body.style.backgroundColor = '';
    canvas.style.transition = '';
  }
}

function showInsufficientFunds(price) {
  if (showCharacterSelect) return;
  show = true;
  insufficientFundsMessage = `Dinheiro insuficiente! Faltam $${price - money}`;
  clearTimeout(insufficientFundsTimeout);
  
  insufficientFundsTimeout = setTimeout(() => {
    show = false;
    insufficientFundsMessage = '';
    drawLoja();
  }, 2200);
  
}

function showShopMessage(message) {
    if (showCharacterSelect) return;
    show = true;
    insufficientFundsMessage = message;
    clearTimeout(insufficientFundsTimeout);
    
    insufficientFundsTimeout = setTimeout(() => {
      show = false;
      insufficientFundsMessage = '';
      drawLoja();
    }, 2200);
}

function attemptPurchase() {
  if (showCharacterSelect || isShopLoading || gameState !== 'loja' || show) return;

  const visibleItems = shopItems.filter(item => isItemVisible(item));
  const item = visibleItems[selectedIndex];
  if (!item) return;

  
  if (item.isSecret) {
        newItemsSeen.add(item.nome);
    }

  const compras = getPurchasesCountByName(item.nome) || 0;

  
  if (compras >= item.maxCompras) {
    showShopMessage('Limite máximo de compras atingido!');
    return;
  }

  
  if (item.isStartDepthItem && _charData.__global && _charData.__global.savedStartDepth) {
    const existing = _charData.__global.savedStartItemName || `Selo (${_charData.__global.savedStartDepth}m)`;
    showShopMessage(`Você já possui um item de início: ${existing}`);
    return;
  }

  
  if (!isDebugMode) {
    
    const depthMet = checkDepthRequirement(item, compras);
    const itemMet = checkItemRequirement(item, compras);

    if (!depthMet || !itemMet) {
      const { depthReq, itemReqs } = getCurrentRequirements(item);
      let reqMessage = '';

      if (!depthMet) {
        reqMessage = `Requer ${depthReq}m de profundidade`;
      }

      if (!itemMet && Array.isArray(itemReqs) && itemReqs.length > 0) {
        
        for (const r of itemReqs) {
          const currentItemCount = getPurchasesCountByName(r.nome) || 0;
          
          let ownerCharacter = null;
          try {
            for (let chName in _charData) {
              if (chName === '__global') continue;
              const found = shopItems.concat(SECRET_ITEMS || []).find(si => si.nome === r.nome && si.exclusiveToCharacter === chName);
              if (found) { ownerCharacter = chName; break; }
            }
          } catch (e) {
            ownerCharacter = null;
          }

          if (ownerCharacter) {
            if (ownerCharacter === activeCharacter) {
              reqMessage += reqMessage ? ' e ' : '';
              reqMessage += `Requer ${r.quantidade > 1 ? r.quantidade + 'x de ' : ''}${r.nome}`;
            } else {
              reqMessage += reqMessage ? ' e ' : '';
              reqMessage += `Requer ${r.quantidade > 1 ? r.quantidade + 'x de ' : ''}${r.nome} disponível no personagem ${ownerCharacter}`;
            }
          } else {
            reqMessage += reqMessage ? ' e ' : '';
            reqMessage += `${r.quantidade > 1 ? r.quantidade + 'x de ' : ''}${r.nome} (tem ${currentItemCount})`;
          }
        }
      }

      showShopMessage(`Requisitos não atendidos! ${reqMessage}`);
      return;
    }
  }

  if (isDebugMode || money >= item.preco) {
    if (!isDebugMode) {
      money -= item.preco;
    }

    
    incrementPurchaseByName(item.nome);

    item.efeito();
    
    
  
  
  if (!characterData[activeCharacter]) characterData[activeCharacter] = { stats: {} };
  characterData[activeCharacter].stats = {
    speed: player.speed,
    maxJumps: player.maxJumps,
    liveupgrade: liveupgrade,
    moneyplus: moneyplus,
    dashRechargeTime: player.dashRechargeTime || (characterData[activeCharacter].stats && characterData[activeCharacter].stats.dashRechargeTime) || 1000,
    dashExtraInvuln: player.dashExtraInvuln || (characterData[activeCharacter].stats && characterData[activeCharacter].stats.dashExtraInvuln) || 0,
    enemySpawnInterval: enemySpawnInterval
  };

    
    item.preco = Math.floor(item.preco * item.priceMultiplier + item.priceIncrement);

    
    if (!recentPurchases[item.nome]) {
      recentPurchases[item.nome] = 1;
    } else {
      recentPurchases[item.nome]++;
    }
    
    purchaseHistory = Object.entries(recentPurchases)
            .map(([nome, count]) => `${nome} comprado! (${count}x)`);
        
        clearTimeout(purchaseHistoryTimeout);
        purchaseHistoryTimeout = setTimeout(() => {
            purchaseHistory = [];
            recentPurchases = {};
            drawLoja();
        }, 3000);
        
        
        updateShopAvailability();
  
  try { checkAndRevealHiddenItems(); } catch (e) { }
        drawLoja();
  } else {
    showInsufficientFunds(item.preco);
  }
}

function openShopWithTransition() {
  isShopLoading = true;
  showLoadingTransition((removeTransition) => {
    resetGame({ pauseOnStart: false, showShop: true });
    
    selectedElement = { type: 'dungeon', index: -1 };
    isDungeonButtonHovered = true;
    isCharacterSelectButtonHovered = false;
    selectedIndex = -1;
    scrollOffset = 0;
    
    onDepthChange(salvoprofundidade);
    setTimeout(() => {
      updateBodyStyles(true);
      drawLoja(); 
      removeTransition();
      isShopLoading = false;
    }, 300);
  });
}

function tickLojaAnimation(now) {
  if (!now) now = performance.now();
  if (now - lastLojaFrame >= 1000 / 60) { 
    lastLojaFrame = now;
    if (gameState === 'loja') {
      lojaWobbleTime += 0.06;
  const visibleItems = shopItems.filter(item => isItemVisible(item));
      if (!lojaZooms || lojaZooms.length !== visibleItems.length) {
        lojaZooms = new Array(visibleItems.length).fill(1);
        lojaWobbles = new Array(visibleItems.length).fill(0);
      }
      for (let i = 0; i < visibleItems.length; i++) {
        const target = (i === selectedIndex) ? 1.32 : 1;
        lojaZooms[i] += (target - lojaZooms[i]) * 0.28;
        if (i === selectedIndex && !personagensComImagem.includes(visibleItems[i].nome)) {
          lojaWobbles[i] = Math.sin(lojaWobbleTime * 2.2) * 0.13;
        } else {
          lojaWobbles[i] = 0;
        }
      }
      drawLoja();
    }
  }
  requestAnimationFrame(tickLojaAnimation);
}

tickLojaAnimation();

function updateLojaZooms(visibleItems, selectedIndex) {
  if (!lojaZooms || lojaZooms.length !== visibleItems.length) {
    lojaZooms = new Array(visibleItems.length).fill(1);
    lojaWobbles = new Array(visibleItems.length).fill(0);
  }
}