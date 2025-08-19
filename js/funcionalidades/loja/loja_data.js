let selectedElement = {
  type: 'dungeon', 
  index: -1 
};
let newSecretItems = new Set();
let isDebugMode = false;
let newItemsSeen = new Set();
let itemsRead = new Set();
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
let lojaZooms = [];
let lojaWobbles = [];
let lojaWobbleTime = 0;
let lastLojaFrame = 0;
const lojaItemImages = {};
const lojaItemImageNotFound = {};
const _charData = (typeof characterData !== 'undefined') ? characterData : (window.characterData = window.characterData || {});
if (!_charData.__global) _charData.__global = { purchases: {} };

if (typeof _charData.__global.revealedItems === 'undefined') _charData.__global.revealedItems = {};
const globalPurchases = _charData.__global.purchases;
const globalRevealedItems = _charData.__global.revealedItems;

if (typeof moneyplus === 'undefined') {
  var moneyplus = 250;
}

const personagensComImagem = [
  'Kuroshi, o Ninja',
  'Roderick, o Cavaleiro',
  'Valthor, o Mago',

];


const shopItems = [

  {
    nome: 'Botas do Vento',
    descricao: 'Um par de botas leves como plumas que faz seus saltos ganharem asas. Ao comprar, você ganha mais pulos — e menos respeito pela gravidade. aumenta em +1 o número máximo de pulos',
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
    descricao: 'Aparentemente, os inimigos evitam quem carrega arte funerária com tanta naturalidade, diminui a frequência de aparecimento de inimigos.',
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
    revealGlobally: true, 
    disponivel: false,
  },
  {
    nome: 'Cálice da Chama Vital',
    descricao: 'Beber fogo líquido. Porque claramente, hidratação normal é para amadores. Aumenta o máximo de vidas.',
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
    descricao: 'Ótimo pra valorizar suas moedas… em cerca de 0,0001%. Invista já!, aumenta +25 o valor das moedas',
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
    hiddenUntilPurchases: {
      'Cálice da Chama Vital': 1
    },
    disponivel: false,
    globalItem: true,
  },
  {
    nome: 'Sopro do Ouro Invisível',
    descricao: 'Sim, deixar suas moedas invisíveis… exatamente o que você precisava pra continuar pobre, mas agora de forma mais misteriosa. aumenta +55 o valor das moedas',
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
    revealGlobally: true, 
    disponivel: false,
  },
  {
    nome: 'Elmo do Destino Dourado',
    descricao: 'Coloque na cabeça e sinta imediatamente vontade de dar nomes sofisticados para suas moedas “Este é o Senhor Centavo”. aumenta +185 o valor das moedas',
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
    revealGlobally: true, 
    disponivel: false,
  },
  {
    nome: 'Codex da Fortuna Velada',
    descricao: 'Um livro cheio de sabedoria milenar esquecida que você vai usar só pra procurar as figuras de moedas douradas. aumenta +355 o valor das moedas',
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
    efeito: () => { moneyplus += 355; },
    maxCompras: 5,
    compras: 0,
    
    hiddenUntilPurchases: {
      'Valthor, o Mago': 1
    },
    disponivel: false,
    globalItem: true,
    revealGlobally: true, 
    disponivel: false,
  },

  {

    nome: 'Ampulheta do Fluxo Espectral',
    descricao: 'Quem disse que tempo é relativo claramente já tinha uma dessas. reduz o tempo de recarga do dash',
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
    efeito: () => {
      
      const target = 'O Errante de Eldoria';
      if (!characterData[target]) characterData[target] = { stats: {} };
      const cur = (characterData[target].stats && characterData[target].stats.dashRechargeTime) || 2000;
      characterData[target].stats.dashRechargeTime = Math.max(1000, cur - 500);
      
      if (activeCharacter === target) {
        player.dashRechargeTime = characterData[target].stats.dashRechargeTime;
      }
    },
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
    descricao: 'Imortalidade garantida, mas com o leve efeito colateral de ser confundido com uma cortina ancestral em 87% dos castelos. adiciona mais tempo de invulnerabilidade extra após o dash',
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
      3: 3
    },
    efeito: () => {
      
      const target = 'O Errante de Eldoria';
      if (!characterData[target]) characterData[target] = { stats: {} };
      const cur = (characterData[target].stats && characterData[target].stats.dashExtraInvuln) || 0;
      const max = (characterData[target].stats && characterData[target].stats.dashExtraInvulnMax) || 2000;
      characterData[target].stats.dashExtraInvuln = Math.min(cur + 500, max);
      if (activeCharacter === target) {
        player.dashExtraInvuln = characterData[target].stats.dashExtraInvuln;
      }
    },
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
    descricao: 'O manual não-oficial de “como sumir antes que a confusão chegue” — versão fumaça. reduz o cooldown da bomba de fumaça',
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
      NINJA.NINJA_SMOKE_COOLDOWN = Math.max(2000, NINJA.NINJA_SMOKE_COOLDOWN - 1000);
    },
    maxCompras: 5,
    compras: 0,
    exclusiveToCharacter: 'Kuroshi, o Ninja'
  },
  {
    nome: 'Pendente lunar',
    descricao: 'A lua é um farol de inspiração… para poetas e lobisomens. Você, por outro lado, só quer parecer misterioso. reduz o cooldown da Égide lunar',
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
    descricao: 'Nada como invocar energias misteriosas e torcer para que sejam do tipo amigável. reduz o cooldown da devastação mistica',
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


const SECRET_ITEMS = [
  {
    nome: 'Cinto Relâmpago',
    descricao: 'Um cinto que te torna tão rápido que as pessoas vão perguntar se você tá treinando para algum torneio ou porque confundiu o cinto com uma cobra e correu em pânico. aumenta sua velocidade',
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
    descricao: 'Especialista em sumir no momento errado e aparecer depois fingindo que estava planejando tudo. troca seu personagem ativo para o Ninja, desbloqueando suas habilidades exclusivas.',
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
    descricao: 'Um muro com armadura e, surpreendentemente, bom senso de humor. troca seu personagem ativo para o Cavaleiro, desbloqueando suas habilidades exclusivas.',
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
    descricao: 'Encanta, manipula, e se precisar, transforma seu pior inimigo em… fã-clube particular. troca seu personagem ativo para o Mago, desbloqueando suas habilidades exclusivas.',
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
  {
    nome: 'Escada Grande',
    descricao: 'Uma escada esquisitamente gigantesca – perfeita pra quem adora alongar as canelas. Define seu ponto de partida em 30 000m.',
    preco: 25000,
    priceMultiplier: 1,
    priceIncrement: 0,
    disponivel: true,
    requiredDepth: 30000,
    compras: 0,
    maxCompras: 1,
    imgWidth: 90, 
    imgHeight: 90,
    isTemporary: true,
    globalItem: true,
    isStartDepthItem: true,
    requiredItems: [
      {
        nome: 'Cálice da Chama Vital',
        steps: {
          0: 4,
         
        }
      },
      {
        nome: 'Toque de Midas',
        steps: {
          0: 2,
          
        }
      }
    ],
    efeito: () => {
      if (!_charData.__global) _charData.__global = {};
      _charData.__global.savedStartDepth = 30000;
      _charData.__global.savedStartItemName = 'Escada Grande';
    }
  },
  {
    nome: 'Gárgula Fofinha',
    descricao: 'Feita pra espantar intrusos, mas sua inesperada doçura mudou as coisas – hoje é amiga que guia quem entra. Quem diria que amor toca até pedregulho. Define seu ponto de partida em 80 000 m.',
    preco: 60000,
    priceMultiplier: 1,
    priceIncrement: 0,
    disponivel: true,
    requiredDepth: 80000,
    compras: 0,
    maxCompras: 1,
    isTemporary: true,
    globalItem: true,
    isStartDepthItem: true,
     requiredItems: [
      {
        nome: 'Kuroshi, o Ninja',
        steps: {
          0: 1,
         
        }
      },
      {
        nome: 'Ampulheta do Fluxo Espectral',
        steps: {
          0: 4,
          
        }
      }
    ],
    efeito: () => {
      if (!_charData.__global) _charData.__global = {};
      _charData.__global.savedStartDepth = 80000;
      _charData.__global.savedStartItemName = 'Gárgula Fofinha';
    }
  },
  {
    nome: 'Escorregador de Pedras',
    descricao: 'Quando a vida te dá pedras, faça um escorregador — diversão garantida, mas pode ser meio turbulento. Define seu ponto de partida em 140 000 m.',
    preco: 90000,
    priceMultiplier: 1,
    priceIncrement: 0,
    disponivel: true,
    requiredDepth: 140000,
    compras: 0,
    maxCompras: 1,
    isTemporary: true,
    globalItem: true,
    isStartDepthItem: true,
    requiredItems: [
      {
        nome: 'Valthor, o Mago',
        steps: {
          0: 1,
         
        }
      },
      {
        nome: 'Codex da Fortuna Velada',
        steps: {
          0: 2,
          
        }
      }
    ],
    efeito: () => {
      if (!_charData.__global) _charData.__global = {};
      _charData.__global.savedStartDepth = 140000;
      _charData.__global.savedStartItemName = 'Escorregador de Pedras';
    }
  },
  {
    nome: 'Pórtico Místico',
    descricao: 'Quem diria que aquela casinha caída no mato escondia um portal de entrada? Nem todo musgo esconde só sujeira. Define seu ponto de partida em 200 000 m.',
    preco: 145000,
    priceMultiplier: 1,
    priceIncrement: 0,
    disponivel: true,
    requiredDepth: 200000,
    compras: 0,
    maxCompras: 1,
    isTemporary: true,
    globalItem: true,
    isStartDepthItem: true,
    requiredItems: [
      {
        nome: 'Pendente lunar',
        steps: {
          0: 5,
         
        }
      },
      {
        nome: 'Runa Arcana',
        steps: {
          0: 2,
          
        }
      },
      {
        nome: 'Rolo Secreto de Kage',
        steps: {
          0: 4,
          
        }
      }
    ],
    efeito: () => {
      if (!_charData.__global) _charData.__global = {};
      _charData.__global.savedStartDepth = 200000;
      _charData.__global.savedStartItemName = 'Pórtico Místico';
    }
  },
  
];