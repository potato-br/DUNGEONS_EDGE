let selectedElement = {
  type: 'dungeon', 
  index: -1 
};
const shopItems = [
  {
    nome: 'Botas do Vento',
    descricao: 'Aumenta a quantidade de pulos.',
    preco: 250,
    priceMultiplier: 1.5,
    priceIncrement: 0,
    requiredDepthSteps: {
      0: 200,    
      1: 400,    
      2: 600,
      3: 4200,
      4: 6400
    },
    disponivel: true,
    efeito: () => { if (player.maxJumps < 6) player.maxJumps += 1; },
    maxCompras: 6,
    compras: 0,
    exclusiveToCharacter: 'O Errante de Eldoria',
    imgWidth: 90, 
    imgHeight: 90,
    hiddenUntilPurchases: {
      'Cinto Relâmpago': 1
    },
    disponivel: false,
  },
  {
    nome: 'Efígie da Paz',
    descricao: 'Diminui a quantidade de inimigos.',
    preco: 1000,
    priceMultiplier: 1.25,
    priceIncrement: 0,
    requiredDepthSteps: {
      0: 300,
      1: 500,
      2: 800,
      3: 1700,
      4: 3000,
      5: 5000,
      6: 10000,
      7: 15000
    },
    requiredItems: [
      {
        nome: 'Cálice da Chama Vital',
        steps: {
          0: 0,
          1: 1,
          2: 2,
          3: 3
        }
      },
      {
        nome: 'Toque de Midas',
        steps: {
          0: 0,
          1: 0,
          2: 1,
          3: 1
        }
      }
    ],
    disponivel: true,
    efeito: () => { enemySpawnInterval += 170; },
    maxCompras: 11,
    compras: 0,
    globalItem: true,
    hiddenUntilPurchases: {
      'Botas do Vento': 1
    },
    revealGlobally: true, // quando satisfeito, fica disponível para todos os personagens
    disponivel: false,
  },
  {
    nome: 'Cálice da Chama Vital',
    descricao: 'Aumenta sua vida máxima.',
    preco: 1500,
    priceMultiplier: 2,
    disponivel: true,
    priceIncrement: 0,
    requiredDepthSteps: {
      0: 400,
      1: 600,
      2: 800,
      3: 1200,
      4: 3000
    },
    requiredItem: 'Efígie da Paz',
    requiredItemSteps: {
      0: 1,
      1: 2,
      2: 3,
      3: 4
    },
    efeito: () => { if (liveupgrade < 6) liveupgrade += 1; if (liveupgrade > 0) { live = liveupgrade; } },
    maxCompras: 6,
    compras: 0,
    exclusiveToCharacter: 'O Errante de Eldoria',
    hiddenUntilPurchases: {
      'Efígie da Paz': 1
    },
    disponivel: false,
  },


  {
    nome: 'Toque de Midas',
    descricao: 'Cada moeda coletada vale UM pouco mais.',
    preco: 2000,
    priceMultiplier: 2,
    priceIncrement: 0,
    disponivel: true,
    requiredDepthSteps: {
      0: 500
    },
    requiredItem: 'Cálice da Chama Vital',
    requiredItemSteps: {
      0: 1,
      1: 2
    },
    efeito: () => { moneyplus += 25; },
    maxCompras: 2,
    compras: 0,
    exclusiveToCharacter: 'O Errante de Eldoria',
    hiddenUntilPurchases: {
      'Cálice da Chama Vital': 1
    },
    disponivel: false,
  },


  {
    nome: 'Sopro do Ouro Invisível',
    descricao: 'Aumenta o valor das moedas coletadas com técnicas ninja',
    preco: 1250,
    priceMultiplier: 2,
    priceIncrement: 0,
    requiredDepthSteps: {
      0: 25000
    },
    requiredItem: 'Toque de Midas',
    requiredItemSteps: {
      0: 2,
    },
    efeito: () => { moneyplus += 55; },
    maxCompras: 2,
    compras: 0,

    hiddenUntilPurchases: {
      'Kuroshi, o Ninja': 1
    },
    disponivel: false,
    globalItem: true,
    revealGlobally: true, // quando satisfeito, fica disponível para todos os personagens
    disponivel: false,
  },
  {
    nome: 'Elmo do Destino Dourado',
    descricao: 'um Elmo antigo que abençoa suas moedas com poder de um super valor extra.',
    preco: 12500,
    priceMultiplier: 2,
    disponivel: true,
    priceIncrement: 0,
    requiredDepthSteps: {
      0: 45000
    },
    requiredItem: 'Sopro do Ouro Invisível',
    requiredItemSteps: {
      0: 2,
    },
    efeito: () => { moneyplus += 185; },
    maxCompras: 3,
    compras: 0,
    hiddenUntilPurchases: {
      'Roderick, o Cavaleiro': 1
    },
    disponivel: false,
    globalItem: true,
    revealGlobally: true, // quando satisfeito, fica disponível para todos os personagens
    disponivel: false,
  },
  {
    nome: 'Codex da Fortuna Velada',
    descricao: 'Um livro esquecido de runas que amplificam o valor das moedas exponencialmente.',
    preco: 125000,
    priceMultiplier: 2,
    disponivel: true,
    priceIncrement: 0,
    requiredDepthSteps: {
      0: 60000
    },
    requiredItem: 'Elmo do Destino Dourado',
    requiredItemSteps: {
      0: 1,
      2: 3
    },
    efeito: () => { moneyplus += 300; },
    maxCompras: 5,
    compras: 0,
    
    hiddenUntilPurchases: {
      'Valthor, o Mago': 1
    },
    disponivel: false,
    globalItem: true,
    revealGlobally: true, // quando satisfeito, fica disponível para todos os personagens
    disponivel: false,
  },

  {

    nome: 'Ampulheta do Fluxo Espectral',
    descricao: 'Reduz o tempo de recarga do dash.',
    preco: 2000,
    priceMultiplier: 2,
    disponivel: true,
    priceIncrement: 0,
    requiredDepthSteps: {
      0: 600,
      1: 1000,
      2: 12000,
      3: 15000,
      4: 20000
    },
    requiredItem: 'Cálice da Chama Vital',
    requiredItemSteps: {
      1: 1,
      3: 3
    },
  efeito: () => { DASH.dashRechargeTime = Math.max(1000, (DASH.dashRechargeTime || DASH.cooldownTime || 1000) - 500); },
    maxCompras: 4,
    compras: 0,
    exclusiveToCharacter: 'O Errante de Eldoria',
     hiddenUntilPurchases: {
      'Efígie da Paz': 1
    },
    disponivel: false,
  },
  {
    nome: 'Manto Fantasma',
    descricao: 'Aumenta o tempo de invulnerabilidade após usar dash.',
    preco: 2500,
    priceMultiplier: 2.5,
    disponivel: true,
    priceIncrement: 0,
    requiredDepthSteps: {
      0: 700,
      1: 1000,
      2: 5000,
      3: 7000,
      4: 12000
    },
    requiredItem: 'Efígie da Paz',
    requiredItemSteps: {
      0: 1,
      3: 4
    },
    efeito: () => { if (typeof DASH.extraInvuln !== 'undefined') { DASH.extraInvuln = Math.min(DASH.extraInvuln + 500, DASH.extraInvulnMax); } },
    maxCompras: 3,
    compras: 0,
    exclusiveToCharacter: 'O Errante de Eldoria',
    imgWidth: 140, 
    imgHeight: 140,
    hiddenUntilPurchases: {
      'Cálice da Chama Vital': 1
    },
    disponivel: false,
 
  },

  {
    nome: 'Rolo Secreto de Kage',
    descricao: 'Reduz o tempo de recarga da Bomba de Fumaça.',
    preco: 8000,
    priceMultiplier: 1.5,
    priceIncrement: 0,
    disponivel: true,
    requiredDepthSteps: {
      0: 15000,
      1: 17000,
      2: 22000
    },
    efeito: () => { 
      NINJA.NINJA_SMOKE_COOLDOWN = Math.max(3000, NINJA.NINJA_SMOKE_COOLDOWN - 1000);
    },
    maxCompras: 5,
    compras: 0,
    exclusiveToCharacter: 'Kuroshi, o Ninja'
  },
  {
    nome: 'Pendente lunar',
    descricao: 'Reduz o tempo de recarga da Égide lunar.',
    preco: 10000,
    priceMultiplier: 1.5,
    priceIncrement: 0,
    disponivel: true,
    requiredDepthSteps: {
      0: 25000,
      1: 30000,
      2: 32000
    },
    efeito: () => {
      CAVALEIRO.SHIELD_COOLDOWN = Math.max(3000, CAVALEIRO.SHIELD_COOLDOWN - 1000);
    },
    maxCompras: 5,
    compras: 0,
    exclusiveToCharacter: 'Roderick, o Cavaleiro'
  },
  {
    nome: 'Runa Arcana',
    descricao: 'Reduz o tempo de recarga da devastação mística.',
    preco: 300000,
    priceMultiplier: 1.5,
    priceIncrement: 0,
    disponivel: true,
    requiredDepthSteps: {
      0: 35000,
      1: 39000,
      2: 42000
    },
    efeito: () => {
      MAGO.MAGIC_BLAST_COOLDOWN = Math.max(5000, MAGO.MAGIC_BLAST_COOLDOWN - 2000);
    },
    maxCompras: 5,
    compras: 0,
    exclusiveToCharacter: 'Valthor, o Mago'
  }
];


let newSecretItems = new Set();


const SECRET_ITEMS = [
  {
    nome: 'Cinto Relâmpago',
    descricao: 'Aumenta a velocidade de movimento.',
    preco: 500,
    priceMultiplier: 1.35,
    priceIncrement: 0,
    disponivel: true,
    efeito: () => { if (player.speed < 6.2) player.speed = Math.min(player.speed + 0.5, 6.2); },
    maxCompras: 11,
    requiredDepth: 50,
    requiredDepthSteps: {
      0: 200,
      1: 300,
      2: 500,
      3: 700,
      4: 1000,
      5: 1500,
      6: 2000
    },
    requiredItem: 'Botas do Vento',
    requiredItemSteps: {
      0: 0,
      1: 1,
      2: 2,
      3: 3,
      8: 6
    },
    compras: 0,
    exclusiveToCharacter: 'O Errante de Eldoria',
  },
  {
    nome: 'Kuroshi, o Ninja',
    descricao: 'Um personagem ágil e veloz, capaz de dar 3 dashs e usar bombas de fumaça de imortalidade.',
    preco: 70000,
    priceMultiplier: 1,
    priceIncrement: 0,
    disponivel: true,
    requiredItem: 'Cálice da Chama Vital',
     requiredItemSteps: {
      0: 2,
    },
    requiredDepth: 12000,
    efeito: () => {
      setActiveCharacter('Kuroshi, o Ninja');
    },
    maxCompras: 1,
    compras: 0,
    
  },
  {
    nome: 'Roderick, o Cavaleiro',
    descricao: 'Um guerreiro resistente, com altas habilidades defensivas e de vitalidade.',
    preco: 100000,
    priceMultiplier: 1,
    priceIncrement: 0,
    disponivel: true,
    requiredDepth: 20000,
    requiredItemSteps: {
      0: 3,
    },
    requiredItem: 'Cálice da Chama Vital',
    efeito: () => {
      setActiveCharacter('Roderick, o Cavaleiro');
    },
    maxCompras: 1,
    compras: 0,
    
  },
   {
    nome: 'Valthor, o Mago',
    descricao: 'Um estudioso dos mistérios arcanos, mestre das runas antigas capaz de manipular inimigos ao seu favor.',
    preco: 150000,
    priceMultiplier: 1,
    priceIncrement: 0,
    disponivel: true,
    requiredDepth: 30000,
    requiredItemSteps: {
      0: 4,
    },
    requiredItem: 'Cálice da Chama Vital',
    efeito: () => {
      setActiveCharacter('Valthor, o Mago');
    },
    maxCompras: 1,
    compras: 0,
   
    imgWidth: 105, 
   
  },
  
];

let isDebugMode = false;
let newItemsSeen = new Set();
let itemsRead = new Set();

// --- Global purchases & reveals support ---
// ensure there's a global purchases bucket stored on characterData so it's saved alongside other data
const _charData = (typeof characterData !== 'undefined') ? characterData : (window.characterData = window.characterData || {});
if (!_charData.__global) _charData.__global = { purchases: {} };
// ensure a bucket for globally revealed hidden items
if (typeof _charData.__global.revealedItems === 'undefined') _charData.__global.revealedItems = {};
const globalPurchases = _charData.__global.purchases;
const globalRevealedItems = _charData.__global.revealedItems;

function isGlobalPurchaseItemName(name) {
  if (!name) return false;
  // 2) itens que tenham globalItem: true
  const item = shopItems.concat(SECRET_ITEMS).find(i => i.nome === name);
  if (item?.globalItem) return true;
  // 3) itens cujo nome bate com personagem
  return !!characterData[name];
}
// helper: draw rounded rectangle (filled and/or stroked)
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

// --- Hidden items reveal logic ---
// Items can define a property `hiddenUntilPurchases` with shape { "Other Item Nome": requiredCount, ... }
// and `revealGlobally: true` to make them appear for all characters once requirements are met.
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
  // iterate all shop items and secret items
  const allItems = shopItems.concat(SECRET_ITEMS || []);
  for (const it of allItems) {
    if (!it || !it.hiddenUntilPurchases) continue;
    if (isItemRevealedGlobally(it)) continue;
    if (doesMeetRevealRequirements(it)) {
      // mark globally revealed so it persists across characters
      globalRevealedItems[it.nome] = true;
      // if requested, make it available to all characters
      if (it.revealGlobally) {
        delete it.exclusiveToCharacter;
      }
      // mark not hidden so drawLoja will show it
      it.hidden = false;
      // ensure availability recalculated
      it.disponivel = true;
    }
  }
}

function isItemVisible(item) {
  if (!item) return false;
  // respect character exclusivity first
  if (item.exclusiveToCharacter && item.exclusiveToCharacter !== activeCharacter) return false;
  // if item has a hiddenUntilPurchases requirement, only show if globally revealed or explicitly unhidden
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
  // Support multiple required items (new) or single requiredItem (legacy)
  // If neither exists, no requirement
  const hasMulti = Array.isArray(item.requiredItems) && item.requiredItems.length > 0;
  const hasSingle = item.requiredItem && item.requiredItemSteps;
  if (!hasMulti && !hasSingle) return true;

  const nextCompra = compras;

  if (hasMulti) {
    // item.requiredItems is expected to be array of { nome, steps }
    for (const req of item.requiredItems) {
      const reqName = typeof req === 'string' ? req : req.nome;
      const reqSteps = (req.steps || req.requiredItemSteps) || item.requiredItemSteps;
      const currentRequired = reqSteps?.[nextCompra] || reqSteps?.[0] || 0;
      const requiredItemPurchases = getPurchasesCountByName(reqName);
      if (requiredItemPurchases < currentRequired) return false;
    }
    return true;
  }

  // legacy single requiredItem
  const requiredItemPurchases = getPurchasesCountByName(item.requiredItem);
  const currentRequired = item.requiredItemSteps[nextCompra] || item.requiredItemSteps[0] || 0;
  return requiredItemPurchases >= currentRequired;
}

function getCurrentRequirements(item) {
  // Determine how many times this item has been bought (global for some items)
  const compras = getPurchasesCountByName(item.nome) || 0;
  const nextCompra = compras;

  const depthReq = item.requiredDepthSteps?.[nextCompra] || item.requiredDepthSteps?.[0] || 0;

  // Build array of item requirements: [{ nome, itemReq }]
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

if (typeof moneyplus === 'undefined') {
  var moneyplus = 250;
}

let shopMessage = '';
let shopMessageTimeout;
let selectedIndex = 0;
let lojaOptionRects = [];
let lojaScrollOffset = 0; 
const LOJA_ITENS_POR_PAGINA = 4;
let scrollOffset = 0;
const SCROLL_SPEED = 45; 
let insufficientFundsMessage = '';
let insufficientFundsTimeout;
let purchaseHistory = []; 
const MAX_HISTORY = 3; 
let recentPurchases = {}; 
let purchaseHistoryTimeout;
let isShopLoading = false;
let isDungeonButtonHovered = false;
let show = false;


let characterBarRects = [];
let selectedCharacterIndex = 0;
let isCharacterSelectButtonHovered = false;  



const _oldDrawLoja = drawLoja;
drawLoja = function() {
  _oldDrawLoja.apply(this, arguments);
  if (!showCharacterSelect) drawCharacterSelectButton();
  if (showCharacterSelect) drawCharacterSelectModal();
};

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

  
  // Texto de profundidade alinhado ao botão de seleção de personagem (usa dungeon como fallback)
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
      // Indicador NEW para itens secretos ou revelados, LEIA para os demais
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
      // Marcar como lido ao visualizar o painel de detalhes
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
    const descWidth = ctx.measureText(item.descricao).width;

    
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
    
    let lines = 4; 
    if (reqText) lines++;
    const lineHeight = 22;
    const boxHeight = lines * lineHeight + 10;
    
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
    ctx.fillText(item.descricao, infoX, textY);
    textY += lineHeight;
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
    
    
    // compute wrapped lines and size of background box
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

    // dark inner box
    ctx.fillStyle = 'rgb(0, 0, 0)';
    roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 12, true, false);
    // border
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 3;
    roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 12, false, true);

    // draw text lines centered inside box
    const startY = boxY + paddingY + 28; // baseline offset
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

  
    if (isDebugMode) {
        ctx.save();
        ctx.font = 'bold 20px PixelFont';
        ctx.fillStyle = '#ff0000';
        ctx.textAlign = 'right';
        ctx.fillText('DEBUG MODE', canvas.width - 20, 20);
        ctx.restore();
    }
}

const lojaItemImages = {};
const lojaItemImageNotFound = {};


const personagensComImagem = [
  'Kuroshi, o Ninja',
  'Roderick, o Cavaleiro',
  'Valthor, o Mago',
  'Cinto Relâmpago'
];

[...shopItems, ...SECRET_ITEMS.filter(i => personagensComImagem.includes(i.nome))].forEach(item => {
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
  // keep message longer so user can read
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
    // display custom shop messages for longer by default
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
        // For each required item, check current count and who lists it
        for (const r of itemReqs) {
          const currentItemCount = getPurchasesCountByName(r.nome) || 0;
          // Find which character (if any) has this required item listed in their shop
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

    // record the purchase (global for some items)
    incrementPurchaseByName(item.nome);

    item.efeito();
    
    
  characterData[activeCharacter].stats = {
        speed: player.speed,
        maxJumps: player.maxJumps,
        liveupgrade: liveupgrade,
        moneyplus: moneyplus,
    dashRechargeTime: DASH.dashRechargeTime || DASH.cooldownTime || 1000,
        dashExtraInvuln: DASH.extraInvuln,
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
  // after every purchase, try to reveal hidden items that depend on purchase counts
  try { checkAndRevealHiddenItems(); } catch (e) { /* non-critical */ }
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


let lojaZooms = [];
let lojaWobbles = [];
let lojaWobbleTime = 0;



let lastLojaFrame = 0;
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








