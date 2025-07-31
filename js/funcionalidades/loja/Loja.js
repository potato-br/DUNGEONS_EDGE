


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
      2: 600     
    },
    disponivel: true,
    efeito: () => { if (player.maxJumps < 3) player.maxJumps += 1; },
    maxCompras: 3,
    compras: 0,
    exclusiveToCharacter: 'O Errante de Eldoria',
    imgWidth: 90, 
    imgHeight: 90 
  },
  {
    nome: 'Cinto Relâmpago',
    descricao: 'Aumenta a velocidade de movimento.',
    preco: 500,
    priceMultiplier: 1.35,
    priceIncrement: 0,
    disponivel: true,
    efeito: () => { if (player.speed < 6.2) player.speed = Math.min(player.speed + 0.5, 6.2); },
    maxCompras: 5,
    requiredDepthSteps: {
      0: 200,
      1: 300,
      2: 500,
      3: 700,
      4: 1000
    },
    requiredItem: 'Botas do Vento',
    requiredItemSteps: {
      0: 1,
      1: 1,
      2: 2,
      3: 3
    },
    compras: 0,
    exclusiveToCharacter: 'O Errante de Eldoria'
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
    requiredItem: 'Cálice da Chama Vital',
    requiredItemSteps: {
      0: 0,
      1: 1,
      2: 2,
      3: 3
    },
    disponivel: true,
    efeito: () => { enemySpawnInterval += 170; },
    maxCompras: 11,
    compras: 0,
    exclusiveToCharacter: 'O Errante de Eldoria'
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
    maxCompras: 5,
    compras: 0,
    exclusiveToCharacter: 'O Errante de Eldoria'
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
      2: 2
    },
    efeito: () => { moneyplus += 25; },
    maxCompras: 2,
    compras: 0,
    exclusiveToCharacter: 'O Errante de Eldoria'
  },


  {
    nome: 'Sopro do Ouro Invisível',
    descricao: 'Aumenta o valor das moedas coletadas com técnicas ninja',
    preco: 1250,
    priceMultiplier: 2,
    disponivel: true,
    priceIncrement: 0,
    requiredDepthSteps: {
      0: 15000
    },
    efeito: () => { moneyplus += 55; },
    maxCompras: 2,
    compras: 0,
    exclusiveToCharacter: 'Kuroshi, o Ninja'
  },
  {
    nome: 'Elmo do Destino Dourado',
    descricao: 'um Elmo antigo que abençoa suas moedas com poder de um super valor extra.',
    preco: 12500,
    priceMultiplier: 2,
    disponivel: true,
    priceIncrement: 0,
    requiredDepthSteps: {
      0: 25000
    },
    efeito: () => { moneyplus += 185; },
    maxCompras: 3,
    compras: 0,
    exclusiveToCharacter: 'Roderick, o Cavaleiro'
  },
  {
    nome: 'Codex da Fortuna Velada',
    descricao: 'Um livro esquecido de runas que amplificam o valor das moedas exponencialmente.',
    preco: 125000,
    priceMultiplier: 2,
    disponivel: true,
    priceIncrement: 0,
    requiredDepthSteps: {
      0: 500
    },
    efeito: () => { moneyplus += 300; },
    maxCompras: 5,
    compras: 0,
    exclusiveToCharacter: 'Valthor, o Mago'
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
    efeito: () => { DASH.cooldownTime = Math.max(1000, DASH.cooldownTime - 500); },
    maxCompras: 4,
    compras: 0,
    exclusiveToCharacter: 'O Errante de Eldoria'
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
    efeito: () => { if (typeof DASH.extraInvuln !== 'undefined') { DASH.extraInvuln = Math.min(DASH.extraInvuln + 500, DASH.extraInvulnMax); } },
    maxCompras: 3,
    compras: 0,
    exclusiveToCharacter: 'O Errante de Eldoria',
    imgWidth: 140, 
    imgHeight: 140 
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
    exclusiveToCharacter: 'O Errante de Eldoria'
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
    exclusiveToCharacter: 'O Errante de Eldoria'
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
    exclusiveToCharacter: 'O Errante de Eldoria',
    imgWidth: 105, 
   
  },
  
];

let isDebugMode = false;
let newItemsSeen = new Set();
let itemsRead = new Set();

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
            newSecretItems.add(novoItem.nome);
        }
    });
}

function onDepthChange(newDepth) {
    depthPoints = newDepth;
    revelarItensSecretos();
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
    if (!item.requiredItem || !item.requiredItemSteps) return true;
    
    const characterPurchases = characterData[activeCharacter].purchases;
    const requiredItemPurchases = characterPurchases[item.requiredItem] || 0;
    
    
    const nextCompra = compras;
    const currentRequired = item.requiredItemSteps[nextCompra] || 
                          item.requiredItemSteps[0] || 0;
    
    return requiredItemPurchases >= currentRequired;
}

function getCurrentRequirements(item) {
    const characterPurchases = characterData[activeCharacter].purchases;
    const compras = characterPurchases[item.nome] || 0;
    
    
    const nextCompra = compras;
    
    const depthReq = item.requiredDepthSteps?.[nextCompra] || 
                    item.requiredDepthSteps?.[0] || 
                    0;

    const itemReq = item.requiredItemSteps?.[nextCompra] || 
                    item.requiredItemSteps?.[0] || 
                    0;

    return { depthReq, itemReq };
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

        const characterPurchases = characterData[activeCharacter].purchases;
        const compras = characterPurchases[item.nome] || 0;

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
  
  const btnW = Math.max(180, Math.min(canvas.width * 0.22, 350));
  const btnH = Math.max(36, Math.min(canvas.height * 0.055, 60));
  const margin = Math.max(12, canvas.width * 0.015);
  const btnX = canvas.width - btnW - margin;
  const btnY = margin;

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

  
  const margin = Math.max(12, canvas.width * 0.015);
  const profFontSize = Math.max(14, Math.min(canvas.width * 0.017, 22));
  ctx.font = `bold ${profFontSize}px PixelFont`;
  ctx.textAlign = 'right';
  ctx.fillStyle = 'white';
  const profX = canvas.width - margin;
  const profY = startY + lineHeight * 2;
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
  let visibleItems = shopItems.filter(item => !item.exclusiveToCharacter || item.exclusiveToCharacter === activeCharacter);
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
      if (item.isSecret && !newItemsSeen.has(item.nome)) {
        ctx.font = 'bold 15px PixelFont';
        ctx.fillStyle = '#00ffea';
        ctx.textAlign = 'right';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;
        ctx.fillText('NEW', x + itemSize - 8, y + 22);
        ctx.shadowBlur = 0;
      }
      if (!item.isSecret && !itemsRead.has(item.nome)) {
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
      ctx.save();
      if (item.isSecret && !newItemsSeen.has(item.nome)) {
        ctx.font = 'bold 15px PixelFont';
        ctx.fillStyle = '#00ffea';
        ctx.textAlign = 'right';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 6;
        ctx.fillText('NEW', x + itemSize - 8, y + 22);
        ctx.shadowBlur = 0;
      }
      if (!item.isSecret && !itemsRead.has(item.nome)) {
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

    
    const characterPurchases = characterData[activeCharacter]?.purchases || {};
    const comprasAtual = characterPurchases[item.nome] || 0;
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
      if (reqs.itemReq > 0) {
        const currentItemCount = characterPurchases[item.requiredItem] || 0;
        if (currentItemCount < reqs.itemReq) {
          reqText += reqText ? ' e ' : 'Requer: ';
          reqText += `${reqs.itemReq}x ${item.requiredItem}`;
          reqText += ` (tem ${currentItemCount})`;
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
    
    
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, canvas.height/2 - 50, canvas.width, 100);
    
    
    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, canvas.height/2 - 50, canvas.width, 100);
    
    
    ctx.font = 'bold 32px PixelFont';
    ctx.fillStyle = '#ff4444';
    ctx.textAlign = 'center';
    ctx.fillText(insufficientFundsMessage, canvas.width/2, canvas.height/2);
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
  ctx.fillText('"Setas/🖱️" Navegar   |   "⏎/🖱️" Comprar   |   "Esc" ir para dungeon ', 20, canvas.height - 30);
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
  'Valthor, o Mago'
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
  insufficientFundsTimeout = setTimeout(() => {
    show = false;
    insufficientFundsMessage = '';
    drawLoja();
     
  }, 1000);
  
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
    }, 1000);
}

function attemptPurchase() {
  if (showCharacterSelect || isShopLoading || gameState !== 'loja' || show) return;

  const visibleItems = shopItems.filter(item => !item.exclusiveToCharacter || item.exclusiveToCharacter === activeCharacter);
  const item = visibleItems[selectedIndex];
  if (!item) return;

  
  if (item.isSecret) {
        newItemsSeen.add(item.nome);
    }

  const characterPurchases = characterData[activeCharacter].purchases;
  const compras = characterPurchases[item.nome] || 0;

  
  if (compras >= item.maxCompras) {
    showShopMessage('Limite máximo de compras atingido!');
    return;
  }

  
  if (!isDebugMode) {
    
    const depthMet = checkDepthRequirement(item, compras);
    const itemMet = checkItemRequirement(item, compras);

    if (!depthMet || !itemMet) {
      const { depthReq, itemReq } = getCurrentRequirements(item);
      let reqMessage = '';
      
      if (!depthMet) {
          reqMessage = `Requer ${depthReq}m de profundidade`;
      }
      
      if (!itemMet) {
          const currentItemCount = characterPurchases[item.requiredItem] || 0;
          reqMessage += reqMessage ? ' e ' : '';
          reqMessage += `${itemReq}x ${item.requiredItem} (tem ${currentItemCount})`;
      }
      
      showShopMessage(`Requisitos não atendidos! ${reqMessage}`);
      return;
    }
  }

  if (isDebugMode || money >= item.preco) {
    if (!isDebugMode) {
      money -= item.preco;
    }
    
    
    characterPurchases[item.nome] = (characterPurchases[item.nome] || 0) + 1;
    
    
    item.efeito();
    
    
    characterData[activeCharacter].stats = {
        speed: player.speed,
        maxJumps: player.maxJumps,
        liveupgrade: liveupgrade,
        moneyplus: moneyplus,
        dashCooldownTime: DASH.cooldownTime,
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
      const visibleItems = shopItems.filter(item => !item.exclusiveToCharacter || item.exclusiveToCharacter === activeCharacter);
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







