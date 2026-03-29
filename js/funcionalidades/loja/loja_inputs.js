canvas.addEventListener('click', function(e) {
  if (gameState !== 'loja') return;
  
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const my = (e.clientY - rect.top) * (canvas.height / rect.height);

  
  if (showCharacterSelect) {
    
    if (Math.hypot(mx-(canvas.width-60), my-100) < 28) {
      showCharacterSelect = false;
      drawLoja();
      return;
    }
    
    
    for (const r of characterSelectRects) {
      if (r.modal && mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
        selectedCharacterModalIndex = r.index;
        setActiveCharacter(r.nome);
        showCharacterSelect = false;
        drawLoja();
        return;
      }
    }
    return;
  }

  
  
  {
    const { x, y, w, h } = getCharacterBtnRect();
    if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
      showCharacterSelect = true;
      selectedCharacterModalIndex = 0;
      drawLoja();
      return;
    }
  }

  
  // Botão de dungeon agora usa a mesma função do desenho
  const { x: dungeonBtnX, y: dungeonBtnY, w: dungeonBtnW, h: dungeonBtnH } = getDungeonBtnRect();
  if (mx >= dungeonBtnX && mx <= dungeonBtnX + dungeonBtnW &&
      my >= dungeonBtnY && my <= dungeonBtnY + dungeonBtnH) {
    closeShop();
    return;
  }

  
  for (let i = 0; i < lojaOptionRects.length; i++) {
    const r = lojaOptionRects[i];
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
      
      selectedIndex = r.index;
      
      const visibleItems = shopItems.filter(item => isItemVisible(item));
      const item = visibleItems[r.index];
      if (item) {
        // mark as NEW for secrets/revealed items, otherwise mark as read only if it shows LEIA
        if (item.isSecret || item.hiddenUntilPurchases) {
          if (!newItemsSeen.has(item.nome)) newItemsSeen.add(item.nome);
        } else {
          if (!itemsRead.has(item.nome)) itemsRead.add(item.nome);
        }
      }
      drawLoja();
      return;
    }
  }
  {
    // Botão de personagem já usa getCharacterBtnRect(), que é proporcional ao canvas
    const { x, y, w, h } = getCharacterBtnRect();
    if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
      showCharacterSelect = true;
      selectedCharacterModalIndex = 0;
      drawLoja();
      return;
    }
  }
  
  // Botão de dungeon agora usa a mesma função do desenho
  const { x: dungeonBtnX2, y: dungeonBtnY2, w: dungeonBtnW2, h: dungeonBtnH2 } = getDungeonBtnRect();
  const wasHovered = isDungeonButtonHovered;
  isDungeonButtonHovered = (
    mx >= dungeonBtnX2 && mx <= dungeonBtnX2 + dungeonBtnW2 &&
    my >= dungeonBtnY2 && my <= dungeonBtnY2 + dungeonBtnH2
  );
  if (wasHovered !== isDungeonButtonHovered) {
    drawLoja();
  }
  
  
  {
    const { x, y, w, h } = getCharacterBtnRect();
    isCharacterSelectButtonHovered = (
      mx >= x && mx <= x + w &&
      my >= y && my <= y + h
    );
  }
  
  
  if (gameState === 'loja') {
    drawLoja();
  }
});


window.addEventListener('keydown', function(e) {
    if (e.key === 'F12') {
        isDebugMode = !isDebugMode;
        
        if (gameState === 'loja') {
            revelarItensSecretos();
            drawLoja();
        }
    }
});

canvas.addEventListener('mousemove', function(e) {
  if (gameState !== 'loja' || showCharacterSelect) return;

  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const my = (e.clientY - rect.top) * (canvas.height / rect.height);

  // Usar getDungeonBtnRect para hover
  const { x: dungeonBtnX, y: dungeonBtnY, w: dungeonBtnW, h: dungeonBtnH } = getDungeonBtnRect();
  if (mx >= dungeonBtnX && mx <= dungeonBtnX + dungeonBtnW &&
      my >= dungeonBtnY && my <= dungeonBtnY + dungeonBtnH) {
    selectedElement = { type: 'dungeon', index: -1 };
    isDungeonButtonHovered = true;
    isCharacterSelectButtonHovered = false;
    selectedIndex = -1;
    drawLoja();
  } else {
    const { x, y, w, h } = getCharacterBtnRect();
    if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
      selectedElement = { type: 'character', index: -1 };
      isDungeonButtonHovered = false;
      isCharacterSelectButtonHovered = true;
      selectedIndex = -1;
      drawLoja();
      return;
    }

    for (let i = 0; i < lojaOptionRects.length; i++) {
      const r = lojaOptionRects[i];
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
        if (selectedIndex !== r.index || selectedElement.type !== 'items') {
          selectedElement = { type: 'items', index: r.index };
          isDungeonButtonHovered = false;
          isCharacterSelectButtonHovered = false;
          selectedIndex = r.index;
          drawLoja();
        }
        return;
      }
    }
  }
});


canvas.addEventListener('wheel', function(e) {
  if (gameState !== 'loja' || showCharacterSelect) return; 
  e.preventDefault();
  if (e.deltaY < 0) {
    scrollOffset = Math.max(0, scrollOffset - SCROLL_SPEED);
  } else {
    scrollOffset = Math.min((shopItems.length * 45) - (LOJA_ITENS_POR_PAGINA * 45), scrollOffset + SCROLL_SPEED);
  }
  drawLoja();
},{ passive: false });

canvas.addEventListener('mousemove', function(e) {
  if (!showCharacterSelect) return;
  
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  
  let foundHover = false;
  
  
  const wasHovered = closeButtonHovered;
  closeButtonHovered = Math.hypot(mx-(canvas.width-60), my-100) < 28;
  
  if (wasHovered !== closeButtonHovered) {
    drawLoja();
  }
  
  for (const r of characterSelectRects) {
    if (r.modal && mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
      hoveredCharacterIndex = r.index;
      foundHover = true;
      drawLoja();
      break;
    }
  }
  
  if (!foundHover && hoveredCharacterIndex !== -1) {
    hoveredCharacterIndex = -1;
    drawLoja();
  }
});


canvas.addEventListener('mouseout', function() {
  if (hoveredCharacterIndex !== -1) {
    hoveredCharacterIndex = -1;
    drawLoja();
  }
});


canvas.addEventListener('mousemove', function(e) {
  if (showCharacterSelect) return;
  if (gameState !== 'loja') return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  for (let i = 0; i < lojaOptionRects.length; i++) {
    const r = lojaOptionRects[i];
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
      if (selectedIndex !== r.index) {
        selectedIndex = r.index;
        drawLoja();
      }
      return;
    }
  }
});


canvas.addEventListener('click', function(e) {
  if (gameState !== 'loja') return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  for (let i = 0; i < characterBarRects.length; i++) {
    const r = characterBarRects[i];
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
      selectedCharacterIndex = i;
      setActiveCharacter(r.nome);
      drawLoja();
      return;
    }
  }
  for (let i = 0; i < lojaOptionRects.length; i++) {
    if (showCharacterSelect) return;
    const r = lojaOptionRects[i];
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
      selectedIndex = r.index;
      attemptPurchase();
      break;
    }
  }
});



window.addEventListener('keydown', e => {
  if (gameState === 'loja' && isShopLoading) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  if (gameState === 'loja') {
    if (showCharacterSelect) {
      const unlocked = getUnlockedCharacters();
      const key = e.key.toLowerCase();

      
      if (key === 'arrowup' || key === 'w') {
        if (!closeButtonSelected && selectedCharacterModalIndex === 0) {
          closeButtonSelected = true;
          selectedCharacterModalIndex = -1;
          drawLoja();
        }
      } else if (key === 'arrowdown' || key === 's') {
        if (closeButtonSelected) {
          closeButtonSelected = false;
          selectedCharacterModalIndex = 0;
          drawLoja();
        }
      } else if ((key === 'arrowleft' || key === 'arrowright') && !closeButtonSelected) {
        
        const direction = (key === 'arrowleft') ? -1 : 1;
        selectedCharacterModalIndex = (selectedCharacterModalIndex + direction + unlocked.length) % unlocked.length;
        drawLoja();
      }

      
      if (key === 'enter') {
        if (closeButtonSelected) {
          showCharacterSelect = false;
          closeButtonSelected = false;
        } else {
          setActiveCharacter(unlocked[selectedCharacterModalIndex]);
          showCharacterSelect = false;
        }
        drawLoja();
      }

      
      if (key === 'escape') {
        showCharacterSelect = false;
        closeButtonSelected = false;
        drawLoja();
      }

      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    const visibleItems = shopItems.filter(item => !item.exclusiveToCharacter || item.exclusiveToCharacter === activeCharacter);

    const itemsPerRow = 3;
    const totalRows = Math.ceil(visibleItems.length / itemsPerRow);
    let currentRow = selectedIndex >= 0 ? Math.floor(selectedIndex / itemsPerRow) : 0;
    let currentCol = selectedIndex >= 0 ? selectedIndex % itemsPerRow : 0;

    if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
      switch (selectedElement.type) {
        case 'character':
          selectedElement.type = 'items';
          selectedElement.index = -1;
          isCharacterSelectButtonHovered = false;
          selectedIndex = 0;
          scrollOffset = 0;
          break;
        case 'dungeon':
          selectedElement.type = 'character';
          isDungeonButtonHovered = false;
          isCharacterSelectButtonHovered = true;
          break;
        case 'items': {
          
          if (selectedIndex >= 0) {
            currentRow = Math.floor(selectedIndex / itemsPerRow);
            if (currentRow === totalRows - 1) {
              selectedElement.type = 'dungeon';
              selectedElement.index = -1;
              selectedIndex = -1;
              isDungeonButtonHovered = true;
              break;
            }
            
            let nextIndex = selectedIndex + itemsPerRow;
            if (nextIndex < visibleItems.length) {
              selectedIndex = nextIndex;
              ensureSelectedItemVisible();
            }
          }
          break;
        }
      }
      
      if (selectedElement.type === 'items' && selectedIndex >= 0) {
        let rowY = Math.floor(selectedIndex / itemsPerRow) * 100; 
        let visibleRows = Math.floor((canvas.height - 360 - 40) / 100);
        let minScroll = rowY;
        let maxScroll = rowY - (visibleRows - 1) * 100;
        if (rowY + 100 > scrollOffset + visibleRows * 100) {
          scrollOffset = Math.min((totalRows - visibleRows) * 100, rowY - (visibleRows - 1) * 100);
        }
      }
      drawLoja();
    }

    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
      switch (selectedElement.type) {
        case 'dungeon':
          
          selectedElement.type = 'items';
          isDungeonButtonHovered = false;
          selectedIndex = visibleItems.length - 1;
          ensureSelectedItemVisible(); 
          break;
        case 'character':
          selectedElement.type = 'dungeon';
          isCharacterSelectButtonHovered = false;
          isDungeonButtonHovered = true;
          break;
        case 'items': {
          if (selectedIndex >= 0) {
            currentRow = Math.floor(selectedIndex / itemsPerRow);
            if (currentRow === 0) {
              selectedElement.type = 'character';
              selectedElement.index = -1;
              selectedIndex = -1;
              isCharacterSelectButtonHovered = true;
              break;
            }
            
            let prevIndex = selectedIndex - itemsPerRow;
            if (prevIndex >= 0) {
              selectedIndex = prevIndex;
              ensureSelectedItemVisible();
            }
          }
          break;
        }
      }
      
      if (selectedElement.type === 'items' && selectedIndex >= 0) {
        let rowY = Math.floor(selectedIndex / itemsPerRow) * 100;
        if (rowY < scrollOffset) {
          scrollOffset = rowY;
        }
      }
      drawLoja();
    }

    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
      if (selectedElement.type === 'items' && selectedIndex > 0) {
        let col = selectedIndex % itemsPerRow;
        if (col > 0) {
          selectedIndex--;
          ensureSelectedItemVisible();
          drawLoja();
        }
      }
    }
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
      if (selectedElement.type === 'items' && selectedIndex < visibleItems.length - 1) {
        let col = selectedIndex % itemsPerRow;
        if (col < itemsPerRow - 1 && selectedIndex + 1 < visibleItems.length) {
          selectedIndex++;
          ensureSelectedItemVisible();
          drawLoja();
        }
      }
    }

    if (e.key === 'Enter') {
      switch (selectedElement.type) {
        case 'dungeon':
          closeShop();
          break;
        case 'character':
          showCharacterSelect = true;
          selectedCharacterModalIndex = 0;
          drawLoja();
          break;
        case 'items':
          if (!showCharacterSelect) {
            attemptPurchase();
          }
          break;
      }
    }

    if (e.key === 'Escape' && !isShopLoading) {
      if (showCharacterSelect) {
        showCharacterSelect = false;
      } else {
        closeShop();
      }
      drawLoja();
    }
  }
});


canvas.addEventListener('click', function(e) {
  if (gameState !== 'loja' || isShopLoading || showCharacterSelect) return;

  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const my = (e.clientY - rect.top) * (canvas.height / rect.height);
  
  
  const dungeonBtnX = canvas.width - 220;
  const dungeonBtnY = 20;
  const dungeonBtnW = 200;
  const dungeonBtnH = 40;

  
  if (mx >= dungeonBtnX && mx <= dungeonBtnX + dungeonBtnW &&
      my >= dungeonBtnY && my <= dungeonBtnY + dungeonBtnH) {
    closeShop();
  }
});


window.addEventListener('keydown', e => {
  if (gameState === 'loja') {
    if (e.key === 'Escape' && !isShopLoading) {
      if (showCharacterSelect) {
        showCharacterSelect = false;
      } else {
        closeShop();
      }
      drawLoja();
    }
  }
});


canvas.addEventListener('mousemove', function(e) {
    if (gameState !== 'loja' || showCharacterSelect) return;
    
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    for (let i = 0; i < lojaOptionRects.length; i++) {
        const r = lojaOptionRects[i];
        if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
      const visibleItems = shopItems.filter(item => isItemVisible(item));
      const item = visibleItems[r.index];
      if (item) {
        if (item.isSecret || item.hiddenUntilPurchases) {
          if (!newItemsSeen.has(item.nome)) newItemsSeen.add(item.nome);
        } else {
          if (!itemsRead.has(item.nome)) itemsRead.add(item.nome);
        }
        selectedIndex = r.index;
        drawLoja();
      }
            break;
        }
    }
});


window.addEventListener('keydown', e => {
    if (gameState !== 'loja' || showCharacterSelect) return;

    
    const navigationKeys = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'w', 'a', 's', 'd', 'Enter'
    ];
    if (navigationKeys.includes(e.key) || navigationKeys.includes(e.key.toLowerCase())) {
        const visibleItems = shopItems.filter(item => 
            !item.exclusiveToCharacter || item.exclusiveToCharacter === activeCharacter
        );
    if (selectedIndex >= 0 && selectedIndex < visibleItems.length) {
      const item = visibleItems[selectedIndex];
      if (item) {
        if (item.isSecret || item.hiddenUntilPurchases) {
          if (!newItemsSeen.has(item.nome)) newItemsSeen.add(item.nome);
        } else {
          if (!itemsRead.has(item.nome)) itemsRead.add(item.nome);
        }
        drawLoja();
      }
    }
    }
});


function ensureSelectedItemVisible() {
  if (selectedElement.type !== 'items' || selectedIndex < 0) return;
  const itemsPerRow = 3;
  const itemSize = 100;
  const itemGap = 10;
  const shopStartY = 360;
  const footerHeight = 50;
  const availableHeight = canvas.height - shopStartY - footerHeight - 10;
  const visibleRows = Math.floor(availableHeight / (itemSize + itemGap));
  const totalRows = Math.ceil(shopItems.filter(item => !item.exclusiveToCharacter || item.exclusiveToCharacter === activeCharacter).length / itemsPerRow);
  let rowY = Math.floor(selectedIndex / itemsPerRow) * (itemSize + itemGap);
  let minScroll = rowY;
  let maxScroll = rowY - (visibleRows - 1) * (itemSize + itemGap);
  if (rowY + itemSize > scrollOffset + visibleRows * (itemSize + itemGap)) {
    scrollOffset = Math.min((totalRows - visibleRows) * (itemSize + itemGap), rowY - (visibleRows - 1) * (itemSize + itemGap));
  } else if (rowY < scrollOffset) {
    scrollOffset = rowY;
  }
  scrollOffset = Math.max(0, Math.min(scrollOffset, Math.max(0, (totalRows - visibleRows) * (itemSize + itemGap))));
}

// Retorna o retângulo do botão de dungeon, igual ao de personagem
function getDungeonBtnRect() {
  const btnW = Math.max(180, Math.min(canvas.width * 0.22, 350));
  const btnH = Math.max(36, Math.min(canvas.height * 0.055, 60));
  const margin = Math.max(12, canvas.width * 0.015);
  const btnX = canvas.width - btnW - margin;
  const btnY = margin;
  return { x: btnX, y: btnY, w: btnW, h: btnH };
}

