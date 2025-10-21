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
          await Neutralino.filesystem.writeFile(filePath, str);
          try { if (typeof isDebugMode !== 'undefined' && isDebugMode) console.log('[SaveManager] saved slot', slotIndex, filePath); } catch (e) {}
          return;
        } catch (e) {
          try { if (typeof isDebugMode !== 'undefined' && isDebugMode) console.warn('[SaveManager] file save failed, falling back to localStorage', e); } catch (e) {}
        }
      }
    } catch (e) {}
    try { localStorage.setItem(`dungeons_edge_save_slot_${slotIndex}`, JSON.stringify(obj)); } catch (e) {}
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
          // fallback to localStorage
        }
      }
    } catch (e) {}
    try {
      const raw = localStorage.getItem(`dungeons_edge_save_slot_${slotIndex}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  window.SaveManager = { saveSlot, loadSlot };
})();
