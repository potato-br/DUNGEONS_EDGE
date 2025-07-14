canvas.addEventListener('click', function(e) {
  if (gameState !== 'loja') return;
  
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const my = (e.clientY - rect.top) * (canvas.height / rect.height);

  // Se o modal de seleção de personagem estiver aberto
  if (showCharacterSelect) {
    // Checa clique no X (botão fechar)
    if (Math.hypot(mx-(canvas.width-60), my-100) < 28) {
      showCharacterSelect = false;
      drawLoja();
      return;
    }
    
    // Checa clique nos personagens do modal
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

  // Checa clique no botão de seleção de personagem
  // Botão Selecionar Personagem (agora responsivo)
  {
    const { x, y, w, h } = getCharacterBtnRect();
    if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
      showCharacterSelect = true;
      selectedCharacterModalIndex = 0;
      drawLoja();
      return;
    }
  }

  // Botão Dungeon
  const dungeonBtnX = canvas.width - 220;
  const dungeonBtnY = 20;
  const dungeonBtnW = 200;
  const dungeonBtnH = 40;

  // Checa clique no botão dungeon
  if (mx >= dungeonBtnX && mx <= dungeonBtnX + dungeonBtnW &&
      my >= dungeonBtnY && my <= dungeonBtnY + dungeonBtnH) {
    closeShop();
    return;
  }

  // Checa cliques nos itens da loja
  for (let i = 0; i < lojaOptionRects.length; i++) {
    const r = lojaOptionRects[i];
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
      // Apenas atualiza o índice selecionado sem tentar comprar
      selectedIndex = r.index;
      // Marca o item como lido quando selecionado
      const visibleItems = shopItems.filter(item => 
        !item.exclusiveToCharacter || item.exclusiveToCharacter === activeCharacter
      );
      const item = visibleItems[r.index];
      if (item) {
        if (item.isSecret) {
          newItemsSeen.add(item.nome);
        } else {
          itemsRead.add(item.nome);
        }
      }
      drawLoja();
      return;
    }
  }
});

canvas.addEventListener('mousemove', function(e) {
  if (gameState !== 'loja') return;
  
  // Obtém coordenadas do mouse relativas ao canvas
  const rect = canvas.getBoundingClientRect();  const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const my = (e.clientY - rect.top) * (canvas.height / rect.height);
  
  // Dungeon button hover check
  const dungeonBtnX = canvas.width - 220;
  const dungeonBtnY = 20;
  const dungeonBtnW = 200;
  const dungeonBtnH = 40;
  const wasHovered = isDungeonButtonHovered;
  isDungeonButtonHovered = (
    mx >= dungeonBtnX && mx <= dungeonBtnX + dungeonBtnW &&
    my >= dungeonBtnY && my <= dungeonBtnY + dungeonBtnH
  );
  if (wasHovered !== isDungeonButtonHovered) {
    drawLoja();
  }
  
  // Verifica se o mouse está sobre o botão
  {
    const { x, y, w, h } = getCharacterBtnRect();
    isCharacterSelectButtonHovered = (
      mx >= x && mx <= x + w &&
      my >= y && my <= y + h
    );
  }
  
  // Redesenha a loja para atualizar o efeito hover
  if (gameState === 'loja') {
    drawLoja();
  }
});

// Add debug mode toggle
window.addEventListener('keydown', function(e) {
    if (e.key === 'F12') {
        isDebugMode = !isDebugMode;
        // Refresh shop display
        if (gameState === 'loja') {
            revelarItensSecretos();
            drawLoja();
        }
    }
});

canvas.addEventListener('mousemove', function(e) {
  if (gameState !== 'loja' || showCharacterSelect) return;
  
  // Obtém coordenadas do mouse relativas ao canvas
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const my = (e.clientY - rect.top) * (canvas.height / rect.height);
  
  // Botão Dungeon
  const dungeonBtnX = canvas.width - 220;
  const dungeonBtnY = 20;
  const dungeonBtnW = 200;
  const dungeonBtnH = 40;

  // Checa hover nos botões
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
    // Checa hover nos itens da loja
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

// Rolagem da loja
canvas.addEventListener('wheel', function(e) {
  if (gameState !== 'loja' || showCharacterSelect) return; // Bloqueia scroll no modal
  e.preventDefault();
  if (e.deltaY < 0) {
    scrollOffset = Math.max(0, scrollOffset - SCROLL_SPEED);
  } else {
    scrollOffset = Math.min((shopItems.length * 45) - (LOJA_ITENS_POR_PAGINA * 45), scrollOffset + SCROLL_SPEED);
  }
  drawLoja();
});

canvas.addEventListener('mousemove', function(e) {
  if (!showCharacterSelect) return;
  
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  
  let foundHover = false;
  
  // Checar hover no botão X
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

// Adicione este evento de mouseout
canvas.addEventListener('mouseout', function() {
  if (hoveredCharacterIndex !== -1) {
    hoveredCharacterIndex = -1;
    drawLoja();
  }
});

// Mouse: detecta clique na opção e mouseover
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

// Mouse: troca personagem na barra
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

// Teclado: navegação e compra

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

      // Navegação entre X e personagens
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
        // Navegação horizontal apenas quando não estiver no X
        const direction = (key === 'arrowleft') ? -1 : 1;
        selectedCharacterModalIndex = (selectedCharacterModalIndex + direction + unlocked.length) % unlocked.length;
        drawLoja();
      }

      // Ação no Enter
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

      // Ação no Escape
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
          // Só permite sair para dungeon se estiver na última linha
          if (selectedIndex >= 0) {
            currentRow = Math.floor(selectedIndex / itemsPerRow);
            if (currentRow === totalRows - 1) {
              selectedElement.type = 'dungeon';
              selectedElement.index = -1;
              selectedIndex = -1;
              isDungeonButtonHovered = true;
              break;
            }
            // Move para baixo na grid
            let nextIndex = selectedIndex + itemsPerRow;
            if (nextIndex < visibleItems.length) {
              selectedIndex = nextIndex;
              ensureSelectedItemVisible();
            }
          }
          break;
        }
      }
      // Ajusta scroll para grid
      if (selectedElement.type === 'items' && selectedIndex >= 0) {
        let rowY = Math.floor(selectedIndex / itemsPerRow) * 100; // 100 = itemHeight+gap
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
          // Agora vai para o último item da loja
          selectedElement.type = 'items';
          isDungeonButtonHovered = false;
          selectedIndex = visibleItems.length - 1;
          ensureSelectedItemVisible(); // Garante que o último item fique visível
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
            // Move para cima na grid
            let prevIndex = selectedIndex - itemsPerRow;
            if (prevIndex >= 0) {
              selectedIndex = prevIndex;
              ensureSelectedItemVisible();
            }
          }
          break;
        }
      }
      // Ajusta scroll para grid
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

// Click handler for Dungeon button
canvas.addEventListener('click', function(e) {
  if (gameState !== 'loja' || isShopLoading || showCharacterSelect) return;

  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const my = (e.clientY - rect.top) * (canvas.height / rect.height);
  
  // Botão Dungeon
  const dungeonBtnX = canvas.width - 220;
  const dungeonBtnY = 20;
  const dungeonBtnW = 200;
  const dungeonBtnH = 40;

  // Checa clique no botão dungeon
  if (mx >= dungeonBtnX && mx <= dungeonBtnX + dungeonBtnW &&
      my >= dungeonBtnY && my <= dungeonBtnY + dungeonBtnH) {
    closeShop();
  }
});

// Também atualiza o evento de teclado para o ESC
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

// Adiciona lógica de marcação de itens lidos no evento mousemove
canvas.addEventListener('mousemove', function(e) {
    if (gameState !== 'loja' || showCharacterSelect) return;
    
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    for (let i = 0; i < lojaOptionRects.length; i++) {
        const r = lojaOptionRects[i];
        if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
            const visibleItems = shopItems.filter(item => 
                !item.exclusiveToCharacter || item.exclusiveToCharacter === activeCharacter
            );
            const item = visibleItems[r.index];
            if (item) {
                if (item.isSecret) {
                    newItemsSeen.add(item.nome);
                } else {
                    itemsRead.add(item.nome);
                }
                selectedIndex = r.index;
                drawLoja();
            }
            break;
        }
    }
});

// Modifica o event listener do teclado para marcar itens como lidos
window.addEventListener('keydown', e => {
    if (gameState !== 'loja' || showCharacterSelect) return;

    // Marcar como lido ao navegar com qualquer tecla de navegação ou Enter
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
                if (item.isSecret) {
                    newItemsSeen.add(item.nome);
                } else {
                    itemsRead.add(item.nome);
                }
                drawLoja();
            }
        }
    }
});

// Garante que o item selecionado está visível no grid da loja
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


