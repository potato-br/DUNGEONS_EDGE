canvas.addEventListener('click', function(e) {
  if (gameState !== 'loja') return;
  if(insufficientFundsMessage) return;
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
  const my = (e.clientY - rect.top) * (canvas.height / rect.height);

  
  if (showCharacterSelect) {
      // if mouse is actively highlighting a modal preview, keyboard navigation is suppressed
      try {
        if (typeof modalPreviewMouseActive !== 'undefined' && modalPreviewMouseActive) {
          // allow non-navigation keys like Escape to still close modal
          if (e.key && e.key.toLowerCase() === 'escape') {
            showCharacterSelect = false;
            drawLoja();
          }
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      } catch (err) {}
    
    if (Math.hypot(mx-(canvas.width-60), my-100) < 28) {
      try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
  showCharacterSelect = false;
  // clear any keyboard lock when modal is closed
  try { modalPreviewKeyboardLock = null; } catch (e) {}
      drawLoja();
      return;
    }
    
    
    for (const r of characterSelectRects) {
      if (r.modal && mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
        try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
        selectedCharacterModalIndex = r.index;
        setActiveCharacter(r.nome);
        showCharacterSelect = false;
        modalPreviewSelected = null;
        hoveredPreview = null;
        modalPreviewMouseActive = false;
        drawLoja();
        return;
      }
    }
  // Previews are not clickable by design; ignore clicks on modal previews so only
  // keyboard selection or mouse hover controls preview highlighting.
    return;
  }

  
  
  {
    const { x, y, w, h } = getCharacterBtnRect();
    if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
  try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
  // Ensure options menu is closed when opening character modal
  try { if (window.OptionsMenu && typeof window.OptionsMenu.close === 'function') window.OptionsMenu.close(); } catch (e) {}
  showCharacterSelect = true;
      selectedCharacterModalIndex = 0;
      drawLoja();
      return;
    }
  }

  // Settings button click
  {
    const { x, y, w, h } = getSettingsBtnRect();
    if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
      try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
      try {
        if (window.OptionsMenu && typeof window.OptionsMenu.toggle === 'function') {
          window.OptionsMenu.toggle(document.getElementById('menu'));
        } else if (window.OptionsMenu && typeof window.OptionsMenu.open === 'function') {
          window.OptionsMenu.open(document.getElementById('menu'));
        }
      } catch (e) {}
      drawLoja();
      return;
    }
  }

  // hover detection for active (non-modal) previews (small viewer)
  try {
    let found = false;
    for (const pr of modalPreviewRects) {
      if (pr && pr.modal === false && mx >= pr.x && mx <= pr.x + pr.w && my >= pr.y && my <= pr.y + pr.h) {
        if (!hoveredPreview || hoveredPreview.x !== pr.x || hoveredPreview.y !== pr.y) {
          try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
        }
        hoveredPreview = pr;
        modalPreviewMouseActive = true;
        modalPreviewSelected = pr;
        // clear keyboard lock when using mouse
        try { modalPreviewKeyboardLock = null; } catch (e) {}
  // clear item selection when preview is hovered
  try { selectedElement = { type: 'preview', index: -1 }; } catch (e) {}
  try { selectedIndex = -1; } catch (e) {}
  try { isDungeonButtonHovered = false; isCharacterSelectButtonHovered = false; } catch (e) {}
  // mark this preview as read (remove LEIA badge)
  try { if (typeof previewsRead !== 'undefined' && pr && pr.nome) previewsRead.add(pr.nome); } catch (e) {}
        drawLoja();
        found = true;
        break;
      }
    }
    if (!found && modalPreviewMouseActive) {
      // mouse left active previews area
      hoveredPreview = null;
      modalPreviewMouseActive = false;
      modalPreviewSelected = null;
      drawLoja();
    }
  } catch (e) {}

  // Active (non-modal) previews should not be clickable. Mouse hover is allowed
  // (handled in mousemove), but clicks must be ignored so keyboard remains the
  // only activation mechanism for selection.

  
  // Botão de dungeon agora usa a mesma função do desenho
  const { x: dungeonBtnX, y: dungeonBtnY, w: dungeonBtnW, h: dungeonBtnH } = getDungeonBtnRect();
  if (mx >= dungeonBtnX && mx <= dungeonBtnX + dungeonBtnW &&
      my >= dungeonBtnY && my <= dungeonBtnY + dungeonBtnH) {
    try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
  // Close options menu if open
  try { if (window.OptionsMenu && typeof window.OptionsMenu.close === 'function') window.OptionsMenu.close(); } catch (e) {}
  closeShop();
    return;
  }

  
  for (let i = 0; i < lojaOptionRects.length; i++) {
    const r = lojaOptionRects[i];
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
      // play select sound effect when selection changes
      if (selectedIndex !== r.index) {
        try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
      }
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
    if (isDungeonButtonHovered) {
      try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
    }
    drawLoja();
  }
  
  
  {
    const { x, y, w, h } = getCharacterBtnRect();
    const wasChar = isCharacterSelectButtonHovered;
    isCharacterSelectButtonHovered = (
      mx >= x && mx <= x + w &&
      my >= y && my <= y + h
    );
    if (wasChar !== isCharacterSelectButtonHovered && isCharacterSelectButtonHovered) {
      try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
    }
  }

  // settings hover
  try {
    const { x, y, w, h } = getSettingsBtnRect();
    const wasSettings = isSettingsButtonHovered;
    isSettingsButtonHovered = (
      mx >= x && mx <= x + w &&
      my >= y && my <= y + h
    );
    if (wasSettings !== isSettingsButtonHovered && isSettingsButtonHovered) {
      try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
    }
  } catch (e) {}
  
  
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
  // play sound when hovering dungeon or character button
  const wasDungeon = isDungeonButtonHovered;
  const wasCharacterBtn = isCharacterSelectButtonHovered;
    if (mx >= dungeonBtnX && mx <= dungeonBtnX + dungeonBtnW &&
      my >= dungeonBtnY && my <= dungeonBtnY + dungeonBtnH) {
    selectedElement = { type: 'dungeon', index: -1 };
    isDungeonButtonHovered = true;
    isCharacterSelectButtonHovered = false;
    selectedIndex = -1;
    // When another UI element is hovered, preview highlight must disappear.
    hoveredPreview = null;
    modalPreviewSelected = null;
    modalPreviewMouseActive = false;
    if (!wasDungeon && isDungeonButtonHovered) {
      try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
    }
    drawLoja();
  } else {
    // check hover over active (non-modal) previews first to avoid flicker
    try {
      for (const pr of modalPreviewRects) {
        if (pr && pr.modal === false && mx >= pr.x && mx <= pr.x + pr.w && my >= pr.y && my <= pr.y + pr.h) {
          if (!hoveredPreview || hoveredPreview.x !== pr.x || hoveredPreview.y !== pr.y) {
            try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
          }
          hoveredPreview = pr;
          modalPreviewMouseActive = true;
          modalPreviewSelected = pr;
          // ensure character/dungeon button hover are cleared
          isDungeonButtonHovered = false;
          isCharacterSelectButtonHovered = false;
          selectedElement = { type: 'preview', index: -1 };
          // clear item selection when preview is hovered
          selectedIndex = -1;
          // mark preview as read when hovered
          try { if (typeof previewsRead !== 'undefined' && pr && pr.nome) previewsRead.add(pr.nome); } catch (e) {}
          drawLoja();
          return;
        }
      }
      if (modalPreviewMouseActive) {
        hoveredPreview = null;
        modalPreviewMouseActive = false;
        modalPreviewSelected = null;
        drawLoja();
      }
    } catch (e) {}
    const { x, y, w, h } = getCharacterBtnRect();
    if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
      selectedElement = { type: 'character', index: -1 };
      isDungeonButtonHovered = false;
      isCharacterSelectButtonHovered = true;
      selectedIndex = -1;
      // Clear preview highlight when hovering other UI elements
      hoveredPreview = null;
      modalPreviewSelected = null;
      modalPreviewMouseActive = false;
      if (!wasCharacterBtn && isCharacterSelectButtonHovered) {
        try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
      }
      drawLoja();
      return;
    }

    // settings hover detection
    try {
      const sRect = getSettingsBtnRect();
      const wasSettings = isSettingsButtonHovered;
      if (mx >= sRect.x && mx <= sRect.x + sRect.w && my >= sRect.y && my <= sRect.y + sRect.h) {
        selectedElement = { type: 'settings', index: -1 };
        isDungeonButtonHovered = false;
        isCharacterSelectButtonHovered = false;
        isSettingsButtonHovered = true;
        selectedIndex = -1;
        hoveredPreview = null;
        modalPreviewSelected = null;
        modalPreviewMouseActive = false;
        if (!wasSettings) {
          try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
        }
        drawLoja();
        return;
      }
    } catch (e) {}

    for (let i = 0; i < lojaOptionRects.length; i++) {
      const r = lojaOptionRects[i];
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
        // Only switch hover/focus to items if the corresponding visible item exists
        const visibleItems = shopItems.filter(item => !item.exclusiveToCharacter || item.exclusiveToCharacter === activeCharacter);
        const item = visibleItems[r.index];
        if (item) {
      // Clear preview highlight when hovering items
      hoveredPreview = null;
      modalPreviewSelected = null;
      modalPreviewMouseActive = false;
          if (selectedIndex !== r.index || selectedElement.type !== 'items') {
            selectedElement = { type: 'items', index: r.index };
            isDungeonButtonHovered = false;
            isCharacterSelectButtonHovered = false;
            if (selectedIndex !== r.index) {
              try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
            }
            selectedIndex = r.index;
            drawLoja();
          }
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
  let foundPreview = false;
  // Compute unlocked count to map 'close' as the last focus index
  const unlocked = getUnlockedCharacters();
  const total = unlocked.length; // last index is the close button

  // Close button hover (circle 'X')
  const wasHovered = closeButtonHovered;
  closeButtonHovered = Math.hypot(mx-(canvas.width-60), my-100) < 28;

  if (wasHovered !== closeButtonHovered) {
    if (closeButtonHovered) {
      try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
      // mouse now is highlighting the close button -> make it the single selection and enable visual hover
      closeButtonSelected = true;
      hoveredCharacterIndex = -1;
      selectedCharacterModalIndex = total;
      closeButtonVisualHovered = true;
  // clear keyboard lock and keyboard-selected preview when mouse interacts
  try { modalPreviewKeyboardLock = null; } catch (e) {}
  modalPreviewSelected = null;
  hoveredPreview = null;
    } else {
      // if mouse left the close button, clear the "close selected" flag and visual hover but keep selectedCharacterModalIndex
      closeButtonSelected = false;
      closeButtonVisualHovered = false;
    }
    drawLoja();
  }

  // Character card hover: when mouse moves over a character, make it the single selection
  for (const r of characterSelectRects) {
    if (r.modal && mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
      const prevHovered = hoveredCharacterIndex;
      hoveredCharacterIndex = r.index;
      foundHover = true;
  // mouse is now selecting a character card -> reflect it in keyboard selection too
  selectedCharacterModalIndex = r.index;
  closeButtonSelected = false;
  // mouse moved over a character -> clear any keyboard suppression and enable visual hover state logic
  closeButtonSuppressUntilMouseMove = false;
  closeButtonVisualHovered = false;
  // any mouse interaction should clear the keyboard lock so mouse controls selection now
  try { modalPreviewKeyboardLock = null; } catch (e) {}
  // when hovering a character via mouse, clear any preview selection created by keyboard
  modalPreviewSelected = null;
  hoveredPreview = null;
      if (prevHovered !== hoveredCharacterIndex) {
        try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
      }
      drawLoja();
      break;
    }
  }

  // Check modal preview rects (if any) to highlight previews;
  // only do this when we're NOT hovering a character card or the close button
  try {
    // scale mouse coords to canvas coordinate space
    const scaledMx = mx; const scaledMy = my;
    if (!foundHover && !closeButtonHovered) {
      for (const pr of modalPreviewRects) {
      if (scaledMx >= pr.x && scaledMx <= pr.x + pr.w && scaledMy >= pr.y && scaledMy <= pr.y + pr.h) {
        if (!hoveredPreview || hoveredPreview.x !== pr.x || hoveredPreview.y !== pr.y) {
          try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
        }
  hoveredPreview = pr;
  // mouse interaction should remove any keyboard lock so mouse controls selection now
  try { modalPreviewKeyboardLock = null; } catch (e) {}
  modalPreviewMouseActive = true;
  modalPreviewSelected = pr;
        // when hovering a preview with mouse, we must NOT keep character card highlight simultaneously
        hoveredCharacterIndex = -1;
        closeButtonSelected = false;
        foundPreview = true;
        drawLoja();
        break;
      }
      }
    }
    if (!foundPreview && modalPreviewMouseActive) {
      // mouse left previews area
      hoveredPreview = null;
      modalPreviewMouseActive = false;
      modalPreviewSelected = null;
      drawLoja();
    }
  } catch (e) {}

  // If the mouse is over any interactive element (close button, a character card, or a preview),
  // clear keyboard suppression so mouse hover takes over and also remove any keyboard-driven hoveredCharacterIndex.
  const isOverInteractive = closeButtonHovered || foundHover || foundPreview;
  if (isOverInteractive) {
    if (closeButtonSuppressUntilMouseMove) closeButtonSuppressUntilMouseMove = false;
    if (typeof modalPreviewSuppressUntilMouseMove !== 'undefined' && modalPreviewSuppressUntilMouseMove) modalPreviewSuppressUntilMouseMove = false;
    if (hoveredCharacterIndex !== -1 && !foundHover) {
      // if the mouse is over something else, clear the keyboard-highlighted character
      hoveredCharacterIndex = -1;
    }
    // ensure rendering updates to reflect interactive hover changes
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
      // Only set selectedIndex if the corresponding visible item exists
      const visibleItems = shopItems.filter(item => isItemVisible(item));
      const item = visibleItems[r.index];
      if (item) {
        if (selectedIndex !== r.index) {
          selectedIndex = r.index;
          try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
          drawLoja();
        }
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
      try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
      drawLoja();
      return;
    }
  }
  for (let i = 0; i < lojaOptionRects.length; i++) {
    if (showCharacterSelect) return;
    const r = lojaOptionRects[i];
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
      selectedIndex = r.index;
      try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
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
  if (insufficientFundsMessage) return;
  if (gameState === 'loja') {
  if (showCharacterSelect) {
      // Allow system/browser shortcuts and global exit keys to pass through
      // so users can still use Alt+F4, F5, or hold 'x' to exit while the modal is open.
      if (e.altKey || e.ctrlKey || e.metaKey || (/^F\d+$/i).test(e.key) || (e.key && e.key.toLowerCase() === 'x')) {
        return; // don't intercept these — let OS/browser or global handlers run
      }

      const unlocked = getUnlockedCharacters();
      const key = e.key.toLowerCase();

      // Focus index cycles through characters (0..N-1) and the close button as N
      const total = unlocked.length;
      const focusCount = total + 1; // last index is close button
      if (typeof selectedCharacterModalIndex !== 'number') selectedCharacterModalIndex = 0;

      if (key === 'arrowleft' || key === 'a') {
        // If a modal preview is currently selected, navigate previews horizontally
        if (modalPreviewSelected) {
          // Build an ordered list of previews by character order (modal order), then by X inside each character.
          const allPreviews = modalPreviewRects.filter(r => r.modal && (r.type === 'dash' || r.type === 'ability'));
          const unlockedOrder = (typeof getUnlockedCharacters === 'function') ? getUnlockedCharacters() : [];
          let ordered = [];
          for (const name of unlockedOrder) {
            const group = allPreviews.filter(p => p.nome === name).sort((a, b) => a.x - b.x);
            ordered = ordered.concat(group);
          }
          // Append any previews that don't belong to an unlocked character (or extras), sorted top->left
          const remainder = allPreviews.filter(p => !ordered.includes(p)).sort((a, b) => (a.y - b.y) || (a.x - b.x));
          ordered = ordered.concat(remainder);

          if (ordered.length > 0) {
            let idx = ordered.findIndex(p => p === modalPreviewSelected || (p.x === modalPreviewSelected.x && p.y === modalPreviewSelected.y && p.w === modalPreviewSelected.w && p.h === modalPreviewSelected.h && p.nome === modalPreviewSelected.nome && p.type === modalPreviewSelected.type));
            if (idx === -1) idx = 0;
            const nextIdx = (idx - 1 + ordered.length) % ordered.length;
            modalPreviewSelected = ordered[nextIdx];
            // update keyboard lock to follow the newly selected preview so toggles always target the current preview's owner
            try {
              const makeId = p => (p.nome || '') + '|' + (p.type || '') + '|' + (p.x||0) + '|' + (p.y||0);
              const newPreview = modalPreviewSelected;
              let ownerIdx = -1;
              try {
                const unlockedOrder = (typeof getUnlockedCharacters === 'function') ? getUnlockedCharacters() : [];
                ownerIdx = unlockedOrder.indexOf(newPreview.nome);
                
              } catch (err) { ownerIdx = -1; }
              // fallback: try to find the character card index directly from characterSelectRects
              if (ownerIdx < 0) {
                try {
                  // Try to find owner by matching character card name first
                  let ownerRect = characterSelectRects.find(r => r && r.nome === newPreview.nome);
                  // If not found (ability previews store ability name), fall back to overlap test
                  if (!ownerRect) {
                    ownerRect = characterSelectRects.find(r => r && r.modal && !(newPreview.x + newPreview.w < r.x || newPreview.x > r.x + r.w));
                  }
                  if (ownerRect && typeof ownerRect.index === 'number') ownerIdx = ownerRect.index;
                } catch (err) { ownerIdx = -1; }
              }
              modalPreviewKeyboardLock = { previewId: makeId(newPreview), charIdx: (ownerIdx >= 0 ? ownerIdx : (typeof modalPreviewKeyboardLock !== 'undefined' && modalPreviewKeyboardLock ? modalPreviewKeyboardLock.charIdx : 0)) };
              
            } catch (err) {}
            hoveredPreview = null;
            modalPreviewMouseActive = false;
            modalPreviewSuppressUntilMouseMove = true;
            hoveredCharacterIndex = -1;
            closeButtonSelected = false;
            closeButtonVisualHovered = false;
            try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
            drawLoja();
            e.preventDefault(); e.stopPropagation();
            return;
          }
        }
        selectedCharacterModalIndex = (selectedCharacterModalIndex - 1 + focusCount) % focusCount;
      } else if (key === 'arrowright' || key === 'd') {
        // If a modal preview is currently selected, navigate previews horizontally
        if (modalPreviewSelected) {
          // Build an ordered list of previews by character order (modal order), then by X inside each character.
          const allPreviews = modalPreviewRects.filter(r => r.modal && (r.type === 'dash' || r.type === 'ability'));
          const unlockedOrder = (typeof getUnlockedCharacters === 'function') ? getUnlockedCharacters() : [];
          let ordered = [];
          for (const name of unlockedOrder) {
            const group = allPreviews.filter(p => p.nome === name).sort((a, b) => a.x - b.x);
            ordered = ordered.concat(group);
          }
          // Append any previews that don't belong to an unlocked character (or extras), sorted top->left
          const remainder = allPreviews.filter(p => !ordered.includes(p)).sort((a, b) => (a.y - b.y) || (a.x - b.x));
          ordered = ordered.concat(remainder);

          if (ordered.length > 0) {
            let idx = ordered.findIndex(p => p === modalPreviewSelected || (p.x === modalPreviewSelected.x && p.y === modalPreviewSelected.y && p.w === modalPreviewSelected.w && p.h === modalPreviewSelected.h && p.nome === modalPreviewSelected.nome && p.type === modalPreviewSelected.type));
            if (idx === -1) idx = 0;
            const nextIdx = (idx + 1) % ordered.length;
            modalPreviewSelected = ordered[nextIdx];
            // update keyboard lock to follow the newly selected preview so toggles always target the current preview's owner
            try {
              const makeId = p => (p.nome || '') + '|' + (p.type || '') + '|' + (p.x||0) + '|' + (p.y||0);
              const newPreview = modalPreviewSelected;
              let ownerIdx = -1;
              try {
                const unlockedOrder = (typeof getUnlockedCharacters === 'function') ? getUnlockedCharacters() : [];
                ownerIdx = unlockedOrder.indexOf(newPreview.nome);
                
              } catch (err) { ownerIdx = -1; }
              if (ownerIdx < 0) {
                try {
                  let ownerRect = characterSelectRects.find(r => r && r.nome === newPreview.nome);
                  if (!ownerRect) {
                    ownerRect = characterSelectRects.find(r => r && r.modal && !(newPreview.x + newPreview.w < r.x || newPreview.x > r.x + r.w));
                  }
                  if (ownerRect && typeof ownerRect.index === 'number') ownerIdx = ownerRect.index;
                } catch (err) { ownerIdx = -1; }
              }
              modalPreviewKeyboardLock = { previewId: makeId(newPreview), charIdx: (ownerIdx >= 0 ? ownerIdx : (typeof modalPreviewKeyboardLock !== 'undefined' && modalPreviewKeyboardLock ? modalPreviewKeyboardLock.charIdx : 0)) };
              
            } catch (err) {}
            hoveredPreview = null;
            modalPreviewMouseActive = false;
            modalPreviewSuppressUntilMouseMove = true;
            hoveredCharacterIndex = -1;
            closeButtonSelected = false;
            closeButtonVisualHovered = false;
            try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
            drawLoja();
            e.preventDefault(); e.stopPropagation();
            return;
          }
        }
        selectedCharacterModalIndex = (selectedCharacterModalIndex + 1) % focusCount;
      } else if (key === 'arrowup' || key === 'w') {
        // Mirror ArrowDown behavior: toggle between locked character and locked preview when a lock exists,
        // otherwise move from character to its associated preview and create the lock.
        try {
          if (typeof modalPreviewKeyboardLock !== 'undefined' && modalPreviewKeyboardLock) {
            const makeId = p => (p.nome || '') + '|' + (p.type || '') + '|' + (p.x||0) + '|' + (p.y||0);
            // Determine owner character index from the currently selected preview if present, otherwise fall back to lock.charIdx
            let lock = modalPreviewKeyboardLock;
            if (modalPreviewSelected) {
              const makeIdFromSelected = makeId(modalPreviewSelected);
              const unlockedOrder = (typeof getUnlockedCharacters === 'function') ? getUnlockedCharacters() : [];
              const ownerIdx = unlockedOrder.indexOf(modalPreviewSelected.nome);
              
              // first branch: if we're currently on a preview, pressing Up should return to its owner
              selectedCharacterModalIndex = (ownerIdx >= 0) ? ownerIdx : lock.charIdx;
              hoveredPreview = null;
              modalPreviewMouseActive = false;
              modalPreviewSelected = null;
              modalPreviewSuppressUntilMouseMove = true;
              hoveredCharacterIndex = selectedCharacterModalIndex;
              closeButtonSelected = false;
              closeButtonVisualHovered = false;
              drawLoja();
              e.preventDefault(); e.stopPropagation();
              return;
            }
            // If no preview is currently selected, but the lock matches current character, try to re-select the locked preview
            if (!modalPreviewSelected && typeof selectedCharacterModalIndex === 'number') {
              const target = modalPreviewRects.find(p => makeId(p) === lock.previewId) || null;
              if (target) {
                modalPreviewSelected = target;
                hoveredPreview = null;
                modalPreviewMouseActive = false;
                modalPreviewSuppressUntilMouseMove = true;
                hoveredCharacterIndex = -1;
                closeButtonSelected = false;
                closeButtonVisualHovered = false;
                drawLoja();
                e.preventDefault(); e.stopPropagation();
                return;
              }
            }
          }
        } catch (err) {}

        // If no lock handling above, fall through to the same behavior as ArrowDown: select the preview under character
        try {
          const unlockedChars = getUnlockedCharacters();
          if (typeof selectedCharacterModalIndex === 'number' && selectedCharacterModalIndex >= 0 && selectedCharacterModalIndex < unlockedChars.length) {
            const charIdx = selectedCharacterModalIndex;
            const charRect = characterSelectRects.find(r => r.modal && r.index === charIdx) || null;
            let found = null;
            if (charRect) {
              const candidates = modalPreviewRects.filter(r => r.modal && (r.type === 'dash' || r.type === 'ability') && !(r.x + r.w < charRect.x || r.x > charRect.x + charRect.w));
              if (candidates.length > 0) {
                const charCenterX = charRect.x + (charRect.w / 2);
                const leftCandidates = candidates.filter(c => (c.x + c.w / 2) < charCenterX);
                const pickNearestByVertical = arr => {
                  arr.sort((a, b) => Math.abs(a.y - (charRect.y + charRect.h)) - Math.abs(b.y - (charRect.y + charRect.h)));
                  return arr[0];
                };
                if (leftCandidates.length > 0) {
                  found = pickNearestByVertical(leftCandidates);
                } else {
                  found = pickNearestByVertical(candidates);
                }
              }
            }
            if (!found) {
              const charName = unlockedChars[charIdx];
              for (const pr of modalPreviewRects) {
                if (pr.modal && pr.type === 'dash' && pr.nome === charName) { found = pr; break; }
              }
            }
            if (!found) found = modalPreviewRects.find(r => r.modal && (r.type === 'dash' || r.type === 'ability')) || null;

            if (found) {
              modalPreviewSelected = found;
              hoveredPreview = null;
              modalPreviewMouseActive = false;
              modalPreviewSuppressUntilMouseMove = true;
              hoveredCharacterIndex = -1;
              closeButtonSelected = false;
              closeButtonVisualHovered = false;
        try {
          const makeId = p => (p.nome || '') + '|' + (p.type || '') + '|' + (p.x||0) + '|' + (p.y||0);
          modalPreviewKeyboardLock = { previewId: makeId(found), charIdx: charIdx };
              } catch (err) {}
            }
          }
        } catch (err) {}
        drawLoja();
        e.preventDefault();
        e.stopPropagation();
        return;
      } else if (key === 'arrowdown' || key === 's') {
        // If there's a keyboard lock between a character and a preview, toggle between them.
        try {
          if (typeof modalPreviewKeyboardLock !== 'undefined' && modalPreviewKeyboardLock) {
            const makeId = p => (p.nome || '') + '|' + (p.type || '') + '|' + (p.x||0) + '|' + (p.y||0);
            const lock = modalPreviewKeyboardLock;
            // If any preview is currently selected (keyboard moved horizontally), pressing ↓ should move back to the owner of that preview
            if (modalPreviewSelected) {
              let ownerIdx = -1;
              try {
                const unlockedOrder = (typeof getUnlockedCharacters === 'function') ? getUnlockedCharacters() : [];
                ownerIdx = unlockedOrder.indexOf(modalPreviewSelected.nome);
              } catch (err) { ownerIdx = -1; }
              if (ownerIdx < 0) {
                try {
                  const ownerRect = characterSelectRects.find(r => r && r.nome === modalPreviewSelected.nome);
                  if (ownerRect && typeof ownerRect.index === 'number') ownerIdx = ownerRect.index;
                } catch (err) { ownerIdx = -1; }
              }
              const targetIdx = (ownerIdx >= 0) ? ownerIdx : lock.charIdx;
              selectedCharacterModalIndex = targetIdx;
              hoveredPreview = null;
              modalPreviewMouseActive = false;
              // deselect preview visually (keep the lock so next ↓ goes back to the locked preview)
              modalPreviewSelected = null;
              modalPreviewSuppressUntilMouseMove = true;
              hoveredCharacterIndex = targetIdx;
              closeButtonSelected = false;
              closeButtonVisualHovered = false;
              drawLoja();
              e.preventDefault(); e.stopPropagation();
              return;
            }
            // If no preview is selected (we're on the character), pressing ↓ should select the locked preview
            if (!modalPreviewSelected && typeof selectedCharacterModalIndex === 'number' && selectedCharacterModalIndex === lock.charIdx) {
              // try to find the locked preview in modalPreviewRects
              const target = modalPreviewRects.find(p => makeId(p) === lock.previewId) || null;
              if (target) {
                modalPreviewSelected = target;
                hoveredPreview = null;
                modalPreviewMouseActive = false;
                modalPreviewSuppressUntilMouseMove = true;
                hoveredCharacterIndex = -1;
                closeButtonSelected = false;
                closeButtonVisualHovered = false;
                drawLoja();
                e.preventDefault(); e.stopPropagation();
                return;
              }
            }
          }
        } catch (err) {}

        // Move focus from the currently selected character down to its ability/dash preview (keyboard-driven)
  try {
          const unlockedChars = getUnlockedCharacters();
          if (typeof selectedCharacterModalIndex === 'number' && selectedCharacterModalIndex >= 0 && selectedCharacterModalIndex < unlockedChars.length) {
            const charIdx = selectedCharacterModalIndex;
            // find the character card rect for the selected index
            const charRect = characterSelectRects.find(r => r.modal && r.index === charIdx) || null;
            let found = null;
            if (charRect) {
              // prefer previews whose horizontal extent overlaps the character card
              const candidates = modalPreviewRects.filter(r => r.modal && (r.type === 'dash' || r.type === 'ability') && !(r.x + r.w < charRect.x || r.x > charRect.x + charRect.w));
              if (candidates.length > 0) {
                // Prefer previews to the left of the character card's center.
                const charCenterX = charRect.x + (charRect.w / 2);
                const leftCandidates = candidates.filter(c => (c.x + c.w / 2) < charCenterX);
                const pickNearestByVertical = arr => {
                  arr.sort((a, b) => Math.abs(a.y - (charRect.y + charRect.h)) - Math.abs(b.y - (charRect.y + charRect.h)));
                  return arr[0];
                };
                if (leftCandidates.length > 0) {
                  found = pickNearestByVertical(leftCandidates);
                } else {
                  // fallback to the nearest by vertical distance (original behavior)
                  found = pickNearestByVertical(candidates);
                }
              }
            }
            // fallback: try to find a dash preview by character name
            if (!found) {
              const charName = unlockedChars[charIdx];
              for (const pr of modalPreviewRects) {
                if (pr.modal && pr.type === 'dash' && pr.nome === charName) { found = pr; break; }
              }
            }
            // last resort: any preview
            if (!found) found = modalPreviewRects.find(r => r.modal && (r.type === 'dash' || r.type === 'ability')) || null;

            if (found) {
              // select the preview via keyboard (mouse suppressed until movement)
              modalPreviewSelected = found;
              hoveredPreview = null;
              modalPreviewMouseActive = false;
              modalPreviewSuppressUntilMouseMove = true;
              // clear character hover visuals
              hoveredCharacterIndex = -1;
              closeButtonSelected = false;
              closeButtonVisualHovered = false;
              // create a keyboard lock so ↓ toggles between this character and this preview
              try {
                const makeId = p => (p.nome || '') + '|' + (p.type || '') + '|' + (p.x||0) + '|' + (p.y||0);
                modalPreviewKeyboardLock = { previewId: makeId(found), charIdx: charIdx };
              } catch (err) {}
            }
          }
        } catch (err) {}
        drawLoja();
        e.preventDefault();
        e.stopPropagation();
        return;
      } else if (key === 'escape') {
        showCharacterSelect = false;
      }

  // update hover/selection state used by rendering
  closeButtonSelected = (selectedCharacterModalIndex === total);
  hoveredCharacterIndex = closeButtonSelected ? -1 : selectedCharacterModalIndex;

  // Keyboard moved the selection: suppress the visual hover on the close button until the mouse moves.
  closeButtonSuppressUntilMouseMove = true;
  // ensure visual hover is disabled until mouse actually moves
  if (closeButtonSuppressUntilMouseMove) closeButtonVisualHovered = false;

  // Also suppress modal preview hover until the mouse moves; clear any active preview hover now
  modalPreviewSuppressUntilMouseMove = true;
  modalPreviewMouseActive = false;
  hoveredPreview = null;
  modalPreviewSelected = null;

  try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
  drawLoja();

      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // If mouse is highlighting a modal preview, allow preview-navigation keys to still work
    // (so users can hover with mouse and continue using the keyboard to move previews).
    try {
      if (typeof modalPreviewMouseActive !== 'undefined' && modalPreviewMouseActive) {
        const keyLower = e.key ? e.key.toLowerCase() : '';
        const allowed = ['arrowleft','arrowright','arrowup','arrowdown','a','d','w','s'];
        if (!allowed.includes(keyLower)) {
          // block other global navigation while mouse controls preview hover
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        // if key is a preview-navigation key, allow handling to continue
      }
    } catch (err) {}
    
  const visibleItems = shopItems.filter(item => isItemVisible(item));

    // Normalize selection state when there are no visible items.
    // This prevents keyboard handlers from trying to focus 'items' when the list is empty.
    if (visibleItems.length === 0) {
      if (selectedElement.type === 'items') {
        // Prefer moving focus to character button when items are absent.
        selectedElement.type = 'character';
        selectedElement.index = -1;
        selectedIndex = -1;
        isCharacterSelectButtonHovered = true;
        isDungeonButtonHovered = false;
      }
    } else {
      // Clamp selectedIndex into the visible range when items exist
      if (selectedIndex >= visibleItems.length) selectedIndex = visibleItems.length - 1;
      if (selectedIndex < 0 && selectedElement.type === 'items') selectedIndex = 0;
    }

    const itemsPerRow = 3;
    const totalRows = Math.ceil(visibleItems.length / itemsPerRow);
    let currentRow = selectedIndex >= 0 ? Math.floor(selectedIndex / itemsPerRow) : 0;
    let currentCol = selectedIndex >= 0 ? selectedIndex % itemsPerRow : 0;

    if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
      let prevType = selectedElement.type;
      switch (selectedElement.type) {
        case 'character':
          // Move from character to items if any, otherwise continue the loop to dungeon
          if (visibleItems.length > 0) {
            selectedElement.type = 'items';
            selectedElement.index = -1;
            isCharacterSelectButtonHovered = false;
            isDungeonButtonHovered = false;
            isSettingsButtonHovered = false;
            selectedIndex = 0;
            scrollOffset = 0;
          } else {
            // no items -> advance to dungeon
            selectedElement.type = 'dungeon';
            selectedElement.index = -1;
            isCharacterSelectButtonHovered = false;
            isDungeonButtonHovered = true;
          }
          break;
        case 'dungeon':
          // From dungeon, move to settings (dungeon -> settings)
          selectedElement.type = 'settings';
          selectedElement.index = -1;
          isDungeonButtonHovered = false;
          isSettingsButtonHovered = true;
          break;
        case 'settings':
          // from settings go to character (settings -> character)
          selectedElement.type = 'character';
          isSettingsButtonHovered = false;
          isCharacterSelectButtonHovered = true;
          break;
        case 'items': {
          if (selectedIndex >= 0) {
            currentRow = Math.floor(selectedIndex / itemsPerRow);
            if (currentRow === totalRows - 1) {
              // last row -> move to dungeon (wrap)
              selectedElement.type = 'dungeon';
              selectedElement.index = -1;
              selectedIndex = -1;
              isDungeonButtonHovered = true;
              isSettingsButtonHovered = false;
              isCharacterSelectButtonHovered = false;
              break;
            }
            let nextIndex = selectedIndex + itemsPerRow;
            if (nextIndex < visibleItems.length) {
              selectedIndex = nextIndex;
              ensureSelectedItemVisible();
            }
          } else {
            // if somehow items focused with no index, go to first
            selectedIndex = 0;
            ensureSelectedItemVisible();
          }
          break;
        }
      }
      // Play select sound if selection type or index changed
      if (selectedElement.type !== prevType || selectedIndex !== -1) {
        try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
      }
      drawLoja();
    }
    // --- Keyboard: toggle focus between the previously-focused button and the active viewer preview ---
    try {
      if (!showCharacterSelect && gameState === 'loja') {
        const keyLower = e.key ? e.key.toLowerCase() : '';
        // left/right (or A/D) toggle between last button and the active preview
        if (e.key === 'ArrowLeft' || keyLower === 'a' || e.key === 'ArrowRight' || keyLower === 'd') {
          // remember a return target when we move from button -> preview
          if (selectedElement && (selectedElement.type === 'dungeon' || selectedElement.type === 'character' || selectedElement.type === 'settings')) {
            // find the active preview for the currently selected character (prefer stored last selection, then matching nome)
            const previews = modalPreviewRects.filter(p => p && p.modal === false);
            // try stored last preview first
            let activePreview = null;
            try { if (typeof window !== 'undefined' && window._lastActivePreview) activePreview = previews.find(p => p.x === window._lastActivePreview.x && p.y === window._lastActivePreview.y && p.w === window._lastActivePreview.w && p.h === window._lastActivePreview.h) || null; } catch (e) {}
            if (!activePreview) activePreview = previews.find(p => p.nome === activeCharacter) || previews[0] || null;
            if (activePreview) {
              // store return target
              try { window._activePreviewReturnTarget = { ...selectedElement }; } catch (e) { window._activePreviewReturnTarget = selectedElement; }
              selectedElement = { type: 'preview', index: -1 };
              modalPreviewSelected = activePreview;
              hoveredPreview = activePreview;
              // persist last active preview
              try { window._lastActivePreview = { x: activePreview.x, y: activePreview.y, w: activePreview.w, h: activePreview.h }; } catch (e) {}
              // clear item selection when entering preview via keyboard toggle
              selectedIndex = -1;
              // mark preview as read when toggled to via keyboard
              try { if (typeof previewsRead !== 'undefined' && activePreview && activePreview.nome) previewsRead.add(activePreview.nome); } catch (e) {}
              modalPreviewSuppressUntilMouseMove = true;
              modalPreviewMouseActive = false;
              isDungeonButtonHovered = false;
              isCharacterSelectButtonHovered = false;
              try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
              drawLoja();
              e.preventDefault(); e.stopPropagation();
              return;
            }
          } else if (selectedElement && selectedElement.type === 'preview') {
            // go back to previously focused button
              const ret = (typeof window !== 'undefined' && window._activePreviewReturnTarget) ? window._activePreviewReturnTarget : { type: 'dungeon', index: -1 };
            selectedElement = ret;
            // clear preview selection
              modalPreviewSelected = null;
            hoveredPreview = null;
            modalPreviewSuppressUntilMouseMove = false;
            modalPreviewMouseActive = false;
            // clear stored return
            try { window._activePreviewReturnTarget = null; } catch (e) {}
            // set visual hover for returned button
            isDungeonButtonHovered = (selectedElement.type === 'dungeon');
            isCharacterSelectButtonHovered = (selectedElement.type === 'character');
            isSettingsButtonHovered = (selectedElement.type === 'settings');
            if (isSettingsButtonHovered) {
              try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
            }
            try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
            drawLoja();
            e.preventDefault(); e.stopPropagation();
            return;
          }
        }
        // while focused on preview, allow up/down to cycle that character's previews (stack order)
        if ((e.key === 'ArrowUp' || keyLower === 'w' || e.key === 'ArrowDown' || keyLower === 's') && selectedElement && selectedElement.type === 'preview') {
          try {
            const previews = modalPreviewRects.filter(p => p && p.modal === false).slice().sort((a,b) => (a.y - b.y) || (a.x - b.x));
            if (!previews || previews.length === 0) {
              e.preventDefault(); e.stopPropagation();
              return;
            }
            // find current index
            let cur = -1;
            if (modalPreviewSelected) {
              cur = previews.findIndex(p => p.x === modalPreviewSelected.x && p.y === modalPreviewSelected.y && p.w === modalPreviewSelected.w && p.h === modalPreviewSelected.h);
            }
            if (cur === -1) cur = 0;
            const dir = (e.key === 'ArrowDown' || keyLower === 's') ? 1 : -1;
            if (previews.length === 1) {
              // only one preview: keep selection
              modalPreviewSelected = previews[0];
            } else {
              const nextIdx = (cur + dir + previews.length) % previews.length;
              modalPreviewSelected = previews[nextIdx];
            }
            // persist last active preview
            try { if (modalPreviewSelected) window._lastActivePreview = { x: modalPreviewSelected.x, y: modalPreviewSelected.y, w: modalPreviewSelected.w, h: modalPreviewSelected.h }; } catch (e) {}
            hoveredPreview = null;
            // mark newly keyboard-selected preview as read
            try { if (typeof previewsRead !== 'undefined' && modalPreviewSelected && modalPreviewSelected.nome) previewsRead.add(modalPreviewSelected.nome); } catch (e) {}
            // clear item selection when navigating previews via keyboard
            selectedIndex = -1;
            modalPreviewSuppressUntilMouseMove = true;
            modalPreviewMouseActive = false;
            try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
            drawLoja();
            e.preventDefault(); e.stopPropagation();
            return;
          } catch (err) {
            // fallback: swallow the event
            e.preventDefault(); e.stopPropagation();
            return;
          }
        }
      }
    } catch (err) {}
    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
      let prevType = selectedElement.type;
      let prevIndex = selectedIndex;
      switch (selectedElement.type) {
        case 'dungeon':
          // Move up from dungeon to items if present, otherwise to character
          if (visibleItems.length > 0) {
            selectedElement.type = 'items';
            selectedIndex = Math.max(0, visibleItems.length - 1);
            ensureSelectedItemVisible();
            isDungeonButtonHovered = false;
            isCharacterSelectButtonHovered = false;
            isSettingsButtonHovered = false;
          } else {
            selectedElement.type = 'character';
            isDungeonButtonHovered = false;
            isCharacterSelectButtonHovered = true;
            selectedIndex = -1;
          }
          break;
        case 'character':
          // Move up from character to settings (character -> settings)
          selectedElement.type = 'settings';
          isCharacterSelectButtonHovered = false;
          isSettingsButtonHovered = true;
          selectedIndex = -1;
          break;
        case 'settings':
          // up from settings goes to dungeon (settings -> dungeon)
          selectedElement.type = 'dungeon';
          isSettingsButtonHovered = false;
          isDungeonButtonHovered = true;
          selectedIndex = -1;
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
            let prevIndex2 = selectedIndex - itemsPerRow;
            if (prevIndex2 >= 0) {
              selectedIndex = prevIndex2;
              ensureSelectedItemVisible();
            }
          }
          break;
        }
      }
      // Play select sound if selection type or index changed
      if (selectedElement.type !== prevType || selectedIndex !== prevIndex) {
        try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
      }
      drawLoja();
    }
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
      if (selectedElement.type === 'items' && selectedIndex > 0) {
        let col = selectedIndex % itemsPerRow;
        if (col > 0) {
          selectedIndex--;
          ensureSelectedItemVisible();
          try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
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
          try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
          drawLoja();
        }
      }
    }
    if (e.key === 'Enter') {
      // Previews are not activatable via Enter by design. Enter only activates
      // buttons/items; ignore Enter when a preview is selected.
  switch (selectedElement.type) {
        case 'dungeon':
          try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
            try { if (window.OptionsMenu && typeof window.OptionsMenu.close === 'function') window.OptionsMenu.close(); } catch (e) {}
            closeShop();
          break;
        case 'settings':
          try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
            try {
              if (window.OptionsMenu && typeof window.OptionsMenu.toggle === 'function') {
                window.OptionsMenu.toggle(document.getElementById('menu'));
              } else if (window.OptionsMenu && typeof window.OptionsMenu.open === 'function') {
                window.OptionsMenu.open(document.getElementById('menu'));
              }
            } catch (e) {}
          drawLoja();
          break;
        case 'character':
          try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
            // Close options if open when opening character modal
            try { if (window.OptionsMenu && typeof window.OptionsMenu.close === 'function') window.OptionsMenu.close(); } catch (e) {}
            showCharacterSelect = true;
          selectedCharacterModalIndex = 0;
          drawLoja();
          break;
        case 'items':
          if (!showCharacterSelect) {
            try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
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
    try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
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
        if (selectedIndex !== r.index) {
          try { if (typeof AudioManager !== 'undefined' && AudioManager.play) AudioManager.play('select_sfx'); } catch (err) {}
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
      const visibleItems = shopItems.filter(item => isItemVisible(item));
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
  const totalRows = Math.ceil(shopItems.filter(item => isItemVisible(item)).length / itemsPerRow);
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

