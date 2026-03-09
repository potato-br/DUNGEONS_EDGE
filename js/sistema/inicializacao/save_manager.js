// SaveManager: save/load slot data using Neutralino file storage with localStorage fallback
(function(){
  async function saveSlot(slotIndex, obj) {
    try {
      const str = JSON.stringify(obj);
      if (typeof Neutralino !== 'undefined' && Neutralino.os && typeof Neutralino.os.getPath === 'function' && Neutralino.filesystem && typeof Neutralino.filesystem.writeFile === 'function') {
        try {
          const docPath = await Neutralino.os.getPath('documents');
          const sep = (docPath.endsWith('/') || docPath.endsWith('\\')) ? '' : '\\';
          const folderPath = `${docPath}${sep}dungeons edge save game`;
          try { await Neutralino.filesystem.createDirectory(folderPath); } catch (e) {}
          const filePath = `${folderPath}${folderPath.endsWith('/') || folderPath.endsWith('\\') ? '' : '\\'}slot_${slotIndex}.json`;
          try {
            if (Neutralino.filesystem && typeof Neutralino.filesystem.removeFile === 'function') {
              await Neutralino.filesystem.removeFile(filePath);
            }
          } catch (e) {}
          await Neutralino.filesystem.writeFile(filePath, str);
          try { if (typeof isDebugMode !== 'undefined' && isDebugMode) console.log('[SaveManager] saved slot', slotIndex, filePath); } catch (e) {}
          return;
        } catch (e) {
          try { if (typeof isDebugMode !== 'undefined' && isDebugMode) console.warn('[SaveManager] file save failed', e); } catch (e) {}
          return;
        }
      }
      try { if (typeof isDebugMode !== 'undefined' && isDebugMode) console.warn('[SaveManager] Neutralino unavailable; save aborted'); } catch (e) {}
      return;
    } catch (e) {
      try { if (typeof isDebugMode !== 'undefined' && isDebugMode) console.warn('[SaveManager] save failed', e); } catch (e) {}
      return;
    }
  }

  async function loadSlot(slotIndex) {
    try {
      if (typeof Neutralino !== 'undefined' && Neutralino.os && typeof Neutralino.os.getPath === 'function' && Neutralino.filesystem && typeof Neutralino.filesystem.readFile === 'function') {
        try {
          const docPath = await Neutralino.os.getPath('documents');
          const sep = (docPath.endsWith('/') || docPath.endsWith('\\')) ? '' : '\\';
          const folderPath = `${docPath}${sep}dungeons edge save game`;
          const filePath = `${folderPath}${folderPath.endsWith('/') || folderPath.endsWith('\\') ? '' : '\\'}slot_${slotIndex}.json`;
          const content = await Neutralino.filesystem.readFile(filePath);
          if (content) return JSON.parse(content.toString());
        } catch (e) {
          try { if (typeof isDebugMode !== 'undefined' && isDebugMode) console.warn('[SaveManager] file load failed', e); } catch (e) {}
          return null;
        }
      }
      try { if (typeof isDebugMode !== 'undefined' && isDebugMode) console.warn('[SaveManager] Neutralino unavailable; load aborted'); } catch (e) {}
      return null;
    } catch (e) {
      try { if (typeof isDebugMode !== 'undefined' && isDebugMode) console.warn('[SaveManager] load failed', e); } catch (e) {}
      return null;
    }
  }

  window.SaveManager = { saveSlot, loadSlot };
})();
