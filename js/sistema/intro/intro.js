

let introActive = false;
let introStep = 0;
let currentText = '';
let textIndex = 0;
let lastTypingTime = 0;
const TYPING_DELAY = 50; 
const PHRASE_DELAY = 2000; 


const introPhrases = [
    "Ao entrar na masmorra, uma sensação de desolação e mistério o envolve.",
    "Sua mente conjura pensamentos para lhe distrair do ambiente opressor,",
    "Dizem que a masmorra jamais repousou...",
    "Dizem que por eras, ela aguardou o momento exato para despertar.",
    "Agora com a princesa Amélia raptada e aprisionada aqui, essas lendas parecem mais reais do que nunca.",
    "Seus pensamentos são interrompidos por um escadaria à sua frente, descendo para as profundezas da masmorra.",
    "Ao descer, e chegar a um corredor escuro,",
    "Você continua a se adentrar. O silêncio antes abatido apenas pela sua tocha começa a ficar quase absoluto.",
    "Algo está errado aqui...",
    "Você sente algo que parece que escuta seus pensamentos.",

    "Então... quase imperceptível...",
    "sussurros ecoam pelas paredes ao seu redor parecendo vir de todas as direções ao mesmo tempo.",

    "\"Desça...\"",
    "\"Mais fundo...\"",
    "\"Ela precisa de você...\"",

    "Você para e olha ao redor.",
    "Não há ninguém.",
    "Você volta a andar",

    "\"Monstros...\"",
    "\"Delapidação...\"",
    "\"Tesouros...\"",
    "\"Infinidade...\"",
    

    "Um calafrio percorre sua espinha com o último sussurro que escuta.",
    "Você para e olha em volta.",
    "\"Nada...\" você murmura, apertando sua tocha em suas mãos com mais força.",
    "ainda assustado com os sussurros, você continua a andar, tentando se convencer de que são apenas sua mente pregando peças em você.",
 

    "Andando no escuro seus pensamentos começam a ruminar novamente.",
    "'Por que a princesa?' 'O que a torna tão especial?' 'Por que não o rei?'\n\n",
    "Sabendo que são perguntas sem respostas, você pondera: 'Amélia foi aprisionada no coração da masmorra, e todos que já entraram aqui jamais retornaram'.\n\n" ,
    "Mesmo sabendo disso, escolhi entrar. Por quê? A curiosidade, a glória e talvez algo mais profundo o impulsionaram a entrar, você se responde em seus pensamentos.\n\n" ,
    "Continuando a andar na escuridão seus pensamentos são cortados mais uma vez. Sua única fonte de luz, sua tocha, se apaga de uma forma sobrenatural. Parar agora significaria morrer, você sabe. Guiando-se pelas paredes frias, você segue na escuridão.\n" ,
    "À medida que avança, o ambiente ao seu redor começa a mudar. O ar fica ainda mais úmido e pesado. Em algum momento, você talvez tenha se perdido — talvez esteja andando em círculos. Pensamentos obscuros tomam conta, e antes que você pudesse os rejeitar, o chão começa a tremer.\n" ,
    "O chão cede — você cai para um nível ainda mais profundo. Ferido, mas vivo, percebe que a armadilha é falha,\n" ,
    "feita intencionalmente para falhar, difícil dizer por quê. De qualquer forma, você se levanta e continua a andar.\n" ,
    "Você percebe que está em uma espécie de passagem. Seja lá o que você ativou para cair, bloqueou a passagem para trás, tendo apenas a frente a se seguir.",
    "Logo adiante há luz de uma sala. Dirigindo-se a ela, você percebe que é uma espécie de depósito abandonado, cheio de itens antigos, e uma espécie de loja abandonada com itens à venda, mas sem ninguém para vender.",
    "Na parede, uma série de notas revela que este lugar era uma passagem secreta usada por guardas e ladrões para mover contrabando. Mas adiante, uma porta reforçada\n" ,
    "abrindo ela, você vê fragmentos do antigo sistema de locomoção da masmorra.",
    "O caminho mais rápido para o local mais profundo da masmorra parece ser por essas plataformas dilapidadas, mas entrar agora talvez desperte algo. Este lugar não abriga apenas ruínas — monstros antes aprisionados agora vagam livres, e sua presença apenas os atrairia para a próxima refeição.\n" ,
    "Ponderando se valeria a pena se aventurar mais a dentro sem saber onde a princesa reside.",
    "Um som atrás de você interrompe seus pensamentos e o faz se virar rapidamente.\n" ,
];


const finalintroText = 
    "Das sombras você vê alguém — uma figura humana.\n" +
    "Receoso, você o investiga sem se revelar.\n"+
    "Talvez não seja um inimigo.\n" +
    "\"Hmm... seja lá quem você for, eu escutei toda a algazarra ali atrás e sei que veio para cá em busca de refúgio: revele-se logo!\" \n"+
    "Das sombras, relutante, você sai... e a figura agora na sua frente o percebe.\n" +
    "Pressione ENTER para continuar..."
    /*texto salvo como string em vez de array para logica funcionar*/;
    


function startIntro() {
    introStep = 0;
        currentText = '';
        textIndex = 0;
        lastTypingTime = performance.now();
        gameState = 'intro';
    setTimeout(() => {
        introActive = true;
    }, 1300);
}

// --- Intro videos + dialog sequence (Video1 -> Video2) ---
const introVideo1Path = 'media/intro/intro1.mp4';
const introVideo2Path = 'media/intro/intro2.mp4';
let introVideo1 = null;
let introVideo2 = null;
// Diálogo do Harmilty refeito, pausas e humor negro
let dialogue = [
    { speaker: "vendor", text: "Olha só... você caiu de uma altura absurda e ainda está de pé. Impressionante — a maioria viraria decoração no chão." },
    { speaker: "player", text: "\"Para trás!\"" },

    { speaker: "vendor", text: "" },
    { speaker: "player", text: "\"Quem é você!?\"" },

    { speaker: "vendor", text: "Relaxe. Se eu quisesse te matar, você nem teria tempo de gritar." },
    { speaker: "player", text: "" },

    { speaker: "vendor", text: "Deixe-me adivinhar... você veio pela princesa Amélia." },
    { speaker: "player", text: "\"Como você sabe disso!? Quem te contou?!\"" },

    { speaker: "vendor", text: "Por favor, não faça essa cara. Você e eu sabemos muito bem que a sua laia de metidos a heróis são bem fáceis de perceber." },
    { speaker: "player", text: "Não fale de mim com esse tom! E do meu objetivo como se fosse apenas um detalhe!" },

    { speaker: "vendor", text: "Se acalma, esquentadinho, me matar não te trará benefícios, além do mais, eu estava aqui quando ela foi capturada." },
    { speaker: "player", text: "\"O quê!?\"" },

    { speaker: "vendor", text: "" },
    { speaker: "player", text: "\"Se estiver envolvido nisso, juro que..\"" },

    { speaker: "vendor", text: "UOU... eu sou apenas um mensageiro aqui, não criemos um tumulto à toa." },
    { speaker: "player", text: "" },

    { speaker: "vendor", text: "Se quer saber o que eu sei, terá de respirar fundo e parar de achar que estou aqui para te matar." },
    { speaker: "player", text: "...Tá, irei me acalmar, mas quero saber o que você sabe!" },

    { speaker: "vendor", text: "Hm... você realmente é cabeça quente, típico de imitadores de heróis." },
    { speaker: "player", text: "" },

    { speaker: "vendor", text: "Eu a vi sendo levada até o ponto mais profundo desta dungeon. Difícil dizer pelo quê, ela parecia estar em algum transe, desacordada." },
    { speaker: "player", text: "Droga, tinha a sensação que ela estaria lá." },

    { speaker: "vendor", text: "E pelos gritos que ecoaram das câmaras mais abaixo após um tempo, diria que, se estiver viva agora, não gostaria de estar... se me entende?" },
    { speaker: "player", text: "Então você viu tudo acontecer?" },

    { speaker: "vendor", text: "" },
    { speaker: "player", text: "Por que não fez nada!?" },

    { speaker: "vendor", text: "Ei, ei, sou mercadoria frágil, não sou apto a confrontos cara a cara." },
    { speaker: "player", text: "" },

    { speaker: "vendor", text: "Além disso, uma princesa capturada é ótima para os negócios." },
    { speaker: "player", text: "Como ousa dizer isso!?" },

    { speaker: "vendor", text: "Ah, você e sua cabeça quente não conseguem ver nada além de glória e fama, não é mesmo?" },
    { speaker: "player", text: "" },

    { speaker: "vendor", text: "Com a princesa em apuros, pessoas como você vão atrás de fama, glória e tesouros. E quando inevitavelmente morrerem nas mãos da masmorra, eu consigo tudo o que pegaram." },
    { speaker: "player", text: "O quê? Então você é um ladrão!" },

    { speaker: "vendor", text: "Ah, ladrão não... reposicionador de posse." },
    { speaker: "player", text: "Que seja — se-nomeie como quiser. Você ainda é um ladrão! Espera um pouco, como você consegue as coisas de outros sem morrer, já que disse que não é apto a combate?" },

    { speaker: "vendor", text: "HAHA... isso, meu caro, é algo que chamamos de segredo, e você não tem direito de saber os meus." },
    { speaker: "player", text: "....." },

    { speaker: "vendor", text: "" },
    { speaker: "player", text: "Tá... e o que você faz aqui, ladrão?" },

    { speaker: "vendor", text: "Você realmente não sabe quando parar, não é mesmo? Te entendo… sou igual. Meu nome é Harmilty." },
    { speaker: "player", text: "Harmilty… você disse?" },

    { speaker: "vendor", text: "Isso, Harmilty, o Custódio de ⬥ 𐌇𐌄𐌉𐌑𐌋𐌕." },
    { speaker: "player", text: "Ha ?..." },

    { speaker: "vendor", text: "HAHAHA, essa cara de confusão é a que eu mais gosto de ver nas pessoas." },
    { speaker: "player", text: "Tá bom... eu acho. Meu nome não lhe importa, me chame de errante ou qualquer outra coisa se precisar." },

    { speaker: "vendor", text: "Okay, errante esquentadinho HAHA..." },
    { speaker: "player", text: "..." },

    { speaker: "vendor", text: "tenho uma proposta para você, errante." },
    { speaker: "player", text: "hm... fale" },

    { speaker: "vendor", text: "Você, em suas \"aventuras\", bloqueou o caminho de saída que eu planejei." },
    { speaker: "player", text: "" },

    { speaker: "vendor", text: "Agora preciso arrumar a bagunça que você fez." },
    { speaker: "player", text: "" },

    { speaker: "vendor", text: "Que tal fazermos negócios?" },
    { speaker: "player", text: "Negócios?" },

    { speaker: "vendor", text: "Exatamente, esquentadinho. Eu gosto de tesouros, e este lugar está cheio deles." },
    { speaker: "player", text: "" },

    { speaker: "vendor", text: "O que acha de você ir atrás dos tesouros e me trazer de volta." },
    { speaker: "player", text: "E onde está o negócio nisso?" },

    { speaker: "vendor", text: "O negócio é simples: você me traz tesouros, e eu te deixo viver." },
    { speaker: "player", text: "O quê?" },

    { speaker: "vendor", text: "HAHA, esquentadinho, você é uma graça. Para que acha que pego itens de pessoas mortas? Para colecionar ?,HAHAHA..." },
    { speaker: "player", text: "Você é peculiar, eu te digo isso." },

    { speaker: "vendor", text: "HA.. uuu... muito Obrigado, eu não ria assim há muito tempo." },
    { speaker: "player", text: "" },

    { speaker: "vendor", text: "Então, o que me diz? Temos um acordo?" },
    { speaker: "player", text: "Não sei... não gosto de negociar com ladrões." },

    { speaker: "vendor", text: "" },
    { speaker: "player", text: "E por que você está me cobrando em um momento como este?" },
    
    { speaker: "vendor", text: "" },
    { speaker: "player", text: "É seu dever me ajudar a conseguir resgatar a princesa! mesmo sendo um ladrão." },
  
    { speaker: "vendor", text: "Ah, seria meu dever se eu fosse de Eldoria." },
    { speaker: "player", text: "Um viajante? Não vejo um de vocês há muito tempo." },

    { speaker: "vendor", text: "Me considero mais um comerciante nômade." },
    { speaker: "player", text: "Tanto faz, ainda é seu dever me ajudar." },
    
    { speaker: "vendor", text: "E estou te ajudando, por um preço, é claro." },
    { speaker: "player", text: "Então eu arrisco minha vida atrás de tesouros e, em troca, ganho o quê exatamente de você?" },
    
    { speaker: "vendor", text: "Meu estoque é quase infinito, caro errante: artefatos, almas perdidas, itens de auxílio, contatos com pessoas de alto escalão." },
    { speaker: "player", text: "Hmm, interessante. Vejo nas paredes que realmente tem bastante coisa." },

    { speaker: "vendor", text: "Aaa... não. Essa velharia não é o que procura. Além disso, não é parte do que ofereço." },
    { speaker: "player", text: "Então, por que os deixar aqui?" },

    { speaker: "vendor", text: "Esses itens nas paredes não são meus. Esse lugar tem uma história antiga, coisas que sobreviveram mais que qualquer um aqui. Se eu tentasse vender algo assim, quebraria fácil e só traria má reputação — não quero me envolver nisso." },
    { speaker: "player", text: "Mas… você não é ladrão?" },

    { speaker: "vendor", text: "Ladrão? Ah, errante, nem tudo é preto e branco. Não estou atrás de fama ruim. Quem compraria de um mal vendedor ?. arrependimento apos uma compra não vai me fazer parecer confiável, entende? Prefiro manter minha reputação intacta." },
    { speaker: "player", text: "Para um ladrão, você é bem… ajustado. Inteligente, até." },

    { speaker: "vendor", text: "HAHA, obrigado. Alguns de nós nesse mundo, ladrão ou não, ainda sabem que reputação vale mais que ouro." },
    { speaker: "player", text: "" },

    { speaker: "vendor", text: "Então, o que acha? Temos um Acordo?" },
    { speaker: "player", text: "Tá... eu não gosto disso, mas você parece ser um comerciante confiável, mesmo tendo itens roubados. Temos um acordo" },
    
    { speaker: "vendor", text: "EXCELENTE! Adoro clientes decididos." },
    { speaker: "player", text: "Você é alguém peculiar, não parece meu inimigo e não tem motivos para isso." },

    { speaker: "vendor", text: "" },
    { speaker: "player", text: "Mas lembre-se que ainda não confio totalmente em você, mas ainda preciso de qualquer vantagem que puder obter." },

    { speaker: "vendor", text: "HAHA, aí errante, você realmente me faz rir. Vamos fazer uma ótima dupla." },
    { speaker: "player", text: "" },

    { speaker: "vendor", text: "Agora vá. Desça, traga meus tesouros... e, se a sorte sorrir, traga a princesa também HAHAH." },
    { speaker: "player", text: "(Se isso me ajudar a salvar a princesa... então voltarei com o que for preciso.)" },

    { speaker: "vendor", text: "" },
    { speaker: "player", text: "Que assim seja. Mas quando eu voltar, exijo que cumpra sua parte." },

    { speaker: "vendor", text: "Quando voltar, terei o que prometi. Afinal de contas, eles não me chamam de Harmilty, o Custódio de ⬥ 𐌇𐌄𐌉𐌑𐌋𐌕 à toa. HAHAHA." },
    { speaker: "player", text: "" }
];
let dialogSequence = []; // will be built from vendorLines/playerLines
let currentSequenceIndex = -1;
let introFinalCallback = null;
let introSequenceActive = false;
let intro_lastAdvanceAt = 0;
let vendorActualName = 'Harmilty';
let vendorDisplayName = '???';
let vendorRevealTurn = null; // index in dialogSequence when name should be revealed
// Dialog typing state
let dialogTyping = {
    fullText: '',
    revealedLength: 0,
    lastTime: 0,
    speed: 45, // chars per second
    isTyping: false
};
let dialogTypingRaf = null;

function initIntroVideos() {
    if (!introVideo1) {
        introVideo1 = document.createElement('video');
        introVideo1.id = 'intro-video-1';
        introVideo1.muted = false;
        introVideo1.playsInline = true;
        introVideo1.src = introVideo1Path;
        Object.assign(introVideo1.style, {
            position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', objectFit: 'fill', zIndex: '9997', backgroundColor: 'black'
        });
        introVideo1.preload = 'auto';
    }
    if (!introVideo2) {
        introVideo2 = document.createElement('video');
        introVideo2.id = 'intro-video-2';
        introVideo2.muted = true;
        introVideo2.playsInline = true;
        introVideo2.src = introVideo2Path;
        introVideo2.loop = true;
        Object.assign(introVideo2.style, {
            position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', objectFit: 'fill', zIndex: '9997', backgroundColor: 'black'
        });
        introVideo2.preload = 'auto';
    }
}

function createIntroDialogOverlay() {
    // Use a tutorial-like style (dark box, gold border) and ensure bottom-center placement
    if (document.getElementById('intro-dialog-overlay')) return;
    const ov = document.createElement('div');
    ov.id = 'intro-dialog-overlay';
    Object.assign(ov.style, {
        position: 'fixed', left: '50%', bottom: '28px', transform: 'translateX(-50%)',
        zIndex: '10000', pointerEvents: 'auto', width: 'min(920px, calc(100% - 56px))'
    });

    const box = document.createElement('div');
    box.id = 'intro-dialog-box';
    Object.assign(box.style, {
        background: '#111', color: '#fff', border: '2px solid #ffd700', borderRadius: '12px',
        padding: '18px', fontFamily: 'PixelFont, monospace', boxSizing: 'border-box'
    });

    const nameEl = document.createElement('div');
    nameEl.id = 'intro-dialog-name';
    Object.assign(nameEl.style, { color: '#ffd700', fontSize: '14px', marginBottom: '6px' });
    nameEl.textContent = vendorDisplayName;
    box.appendChild(nameEl);

    const p = document.createElement('div');
    p.id = 'intro-dialog-text';
    Object.assign(p.style, { fontSize: '18px', whiteSpace: 'pre-wrap', minHeight: '44px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' });
    box.appendChild(p);

    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.justifyContent = 'space-between';
    controls.style.marginTop = '8px';

    const hint = document.createElement('div');
    hint.id = 'intro-dialog-hint';
    hint.textContent = 'Clique em qualquer lugar ou pressione Enter para continuar';
    Object.assign(hint.style, { color: '#ffddaa', fontSize: '12px' });
    controls.appendChild(hint);

    box.appendChild(controls);
    ov.appendChild(box);
    document.body.appendChild(ov);
    // add global click/tap listener (advances dialog from anywhere)
    addGlobalAdvanceListener();
    document.addEventListener('keydown', introDialogKeyHandler);
    // try to start shop music in background (if available)
    try {
        if (typeof AudioManager !== 'undefined' && AudioManager && AudioManager.assets && AudioManager.assets['shop_music']) {
            if (typeof AudioManager.playMusic === 'function') AudioManager.playMusic('shop_music');
        }
    } catch (e) {}
}

function showNextIntroDialog() {
    const p = document.getElementById('intro-dialog-text');
    const nameEl = document.getElementById('intro-dialog-name');
    if (!p) return;
    currentSequenceIndex++;
    // Skip any entries that have empty text
    while (currentSequenceIndex < dialogSequence.length && (!dialogSequence[currentSequenceIndex].text || dialogSequence[currentSequenceIndex].text.trim() === '')) {
        currentSequenceIndex++;
    }

    if (currentSequenceIndex < dialogSequence.length) {
        const item = dialogSequence[currentSequenceIndex];
        // reveal vendor name if this turn matches vendorRevealTurn
        if (vendorRevealTurn !== null && currentSequenceIndex >= vendorRevealTurn) {
            vendorDisplayName = vendorActualName;
        }
        if (item.speaker === 'vendor') {
            // If the vendor explicitly says his name in the line, reveal it in the name header
            try {
                const nameRegex = new RegExp(vendorActualName.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'), 'i');
                if (nameRegex.test(item.text)) {
                    vendorDisplayName = vendorActualName;
                }
            } catch (e) {}
            if (nameEl) nameEl.textContent = vendorDisplayName;
            startDialogTyping(item.text);
        } else {
            const playerName = (typeof activeCharacter !== 'undefined' && activeCharacter) ? activeCharacter : 'Você';
            if (nameEl) nameEl.textContent = playerName;
            startDialogTyping(item.text);
        }
    } else {
        // End of dialog sequence
        removeIntroDialogOverlay();
        cleanupIntroVideos();
        introSequenceActive = false;
        if (typeof introFinalCallback === 'function') introFinalCallback();
    }
}

function removeIntroDialogOverlay() {
    const ov = document.getElementById('intro-dialog-overlay');
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    document.removeEventListener('keydown', introDialogKeyHandler);
    removeGlobalAdvanceListener();
}

function maybeAdvanceIntroDialog() {
    try {
        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        if (now - (intro_lastAdvanceAt || 0) < 500) return;
        intro_lastAdvanceAt = now;
        showNextIntroDialog();
    } catch (e) {}
}

function introDialogKeyHandler(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        // complete typing if in progress, otherwise advance
        if (dialogTyping.isTyping) {
            completeDialogTyping();
        } else {
            // behave like tutorial: allow holding Enter to advance repeatedly (browser auto-repeat will trigger keydown)
            maybeAdvanceIntroDialog();
        }
    } else if (e.key === 'Escape') {
        // skip entire sequence
        skipIntroSequence();
    }
}

function insertVideoToDOM(videoEl) {
    try {
        if (videoEl && !document.body.contains(videoEl)) document.body.insertBefore(videoEl, document.body.firstChild);
    } catch (e) {}
}

function cleanupIntroVideos() {
    try {
        if (introVideo1 && introVideo1.parentNode) { introVideo1.pause(); introVideo1.parentNode.removeChild(introVideo1); }
        if (introVideo2 && introVideo2.parentNode) { introVideo2.pause(); introVideo2.parentNode.removeChild(introVideo2); }
    } catch (e) {}
    introVideo1 = null; introVideo2 = null;
    // remove skip button if present
    const sb = document.getElementById('intro-skip-btn'); if (sb && sb.parentNode) sb.parentNode.removeChild(sb);
    document.removeEventListener('keydown', introSkipKeyHandler);
}

function introSkipKeyHandler(e) {
    if (e.key === 'Escape') skipIntroSequence();
}

function addSkipButton() {
    if (document.getElementById('intro-skip-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'intro-skip-btn';
    btn.textContent = 'Pular (Esc)';
    Object.assign(btn.style, { position: 'fixed', right: '18px', top: '18px', zIndex: '10001', padding: '8px 10px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: '1px solid #666', borderRadius: '6px', cursor: 'pointer' });
    btn.onclick = skipIntroSequence;
    document.body.appendChild(btn);
    document.addEventListener('keydown', introSkipKeyHandler);
}

// Global advance listener (click anywhere)
function globalAdvanceHandler(e) {
    try {
        if (!introSequenceActive) return;
        // complete typing if typing, otherwise allow clicks anywhere to advance
        if (dialogTyping.isTyping) {
            completeDialogTyping();
        } else {
            maybeAdvanceIntroDialog();
        }
    } catch (err) {}
}

function addGlobalAdvanceListener() {
    try { document.addEventListener('pointerdown', globalAdvanceHandler, true); } catch (e) {}
}

function removeGlobalAdvanceListener() {
    try { document.removeEventListener('pointerdown', globalAdvanceHandler, true); } catch (e) {}
}

function skipIntroSequence() {
    removeIntroDialogOverlay();
    cleanupIntroVideos();
    introSequenceActive = false;
    if (typeof introFinalCallback === 'function') introFinalCallback();
}

function startIntroVideoSequence(finalCb) {
    introFinalCallback = finalCb || null;
    currentSequenceIndex = -1;
    vendorDisplayName = '???';
    introSequenceActive = true;
    initIntroVideos();
    // Clear any intro typing text so it doesn't remain visible under the dialog/video
    try { currentText = ''; textIndex = 0; } catch (e) {}
    try { if (typeof canvas !== 'undefined' && canvas && canvas.getContext) { const c = canvas.getContext('2d'); c.clearRect(0,0,canvas.width, canvas.height); } } catch (e) {}
    // insert and play video1 (plays once)
    insertVideoToDOM(introVideo1);
    try { const p = introVideo1.play(); if (p) p.catch(() => {}); } catch (e) {}
    addSkipButton();
    // Copy dialogue array to dialogSequence
    dialogSequence = dialogue.map(d => ({ ...d }));
    // detect reveal turn: first vendor line that contains the vendor's actual name
    vendorRevealTurn = null;
    for (let i = 0; i < dialogSequence.length; i++) {
        const it = dialogSequence[i];
        if (it.speaker === 'vendor' && new RegExp(vendorActualName, 'i').test(it.text)) {
            vendorRevealTurn = i;
            break;
        }
    }
    // when video1 ends, start video2 (loop) and show dialog overlay
    introVideo1.onended = function() {
        try { if (introVideo1.parentNode) introVideo1.parentNode.removeChild(introVideo1); } catch (e) {}
        insertVideoToDOM(introVideo2);
        try { const p = introVideo2.play(); if (p) p.catch(() => {}); } catch (e) {}
        // show dialog now that video2 is running (loop)
        createIntroDialogOverlay();
        // show first dialog item
        currentSequenceIndex = -1;
        maybeAdvanceIntroDialog();
    };
    // safety: if video1 fails to load/play quickly, fallback to directly start video2 and dialog
    introVideo1.onerror = function() {
        try { if (introVideo1.parentNode) introVideo1.parentNode.removeChild(introVideo1); } catch (e) {}
        insertVideoToDOM(introVideo2);
        introVideo2.loop = true;
        try { const p = introVideo2.play(); if (p) p.catch(() => {}); } catch (e) {}
        createIntroDialogOverlay();
        currentSequenceIndex = -1;
        maybeAdvanceIntroDialog();
    };
}

// Typing control for dialog text
function startDialogTyping(text) {
    const p = document.getElementById('intro-dialog-text');
    const hint = document.getElementById('intro-dialog-hint');
    if (!p) return;
    dialogTyping.fullText = String(text || '');
    dialogTyping.revealedLength = 0;
    dialogTyping.lastTime = performance.now();
    dialogTyping.isTyping = true;
    p.textContent = '';
    if (hint) hint.textContent = 'Pressione Enter para completar';
    if (dialogTypingRaf) cancelAnimationFrame(dialogTypingRaf);
    function step(t) {
        try {
            if (!dialogTyping.isTyping) { dialogTypingRaf = null; return; }
            const now = t || performance.now();
            const dt = (now - (dialogTyping.lastTime || now)) / 1000;
            dialogTyping.lastTime = now;
            const add = Math.max(1, Math.round(dialogTyping.speed * dt));
            dialogTyping.revealedLength = Math.min(dialogTyping.fullText.length, dialogTyping.revealedLength + add);
            p.textContent = dialogTyping.fullText.slice(0, dialogTyping.revealedLength);
            if (dialogTyping.revealedLength >= dialogTyping.fullText.length) {
                dialogTyping.isTyping = false;
                if (hint) hint.textContent = 'Clique em qualquer lugar ou pressione Enter para continuar';
                dialogTypingRaf = null;
                return;
            }
        } catch (e) {}
        dialogTypingRaf = requestAnimationFrame(step);
    }
    dialogTypingRaf = requestAnimationFrame(step);
}

function completeDialogTyping() {
    const p = document.getElementById('intro-dialog-text');
    const hint = document.getElementById('intro-dialog-hint');
    if (!p || !dialogTyping.isTyping) return;
    dialogTyping.revealedLength = dialogTyping.fullText.length;
    p.textContent = dialogTyping.fullText;
    dialogTyping.isTyping = false;
    if (hint) hint.textContent = 'Clique em qualquer lugar ou pressione Enter para continuar';
    if (dialogTypingRaf) { cancelAnimationFrame(dialogTypingRaf); dialogTypingRaf = null; }
}


function showLoadingScreen(callback) {
    if (gameState !== 'intro') {
        console.log("Attempting to show loading screen outside intro state");
        return;
    }
    let blackScreen = document.createElement('div');
    blackScreen.id = 'loadingScreen';
    blackScreen.style.position = 'fixed';
    blackScreen.style.top = '0';
    blackScreen.style.left = '0';
    blackScreen.style.width = '100vw';
    blackScreen.style.height = '100vh';
    blackScreen.style.backgroundColor = 'black';
    blackScreen.style.zIndex = '9999';
    blackScreen.style.display = 'flex';
    blackScreen.style.justifyContent = 'center';
    blackScreen.style.alignItems = 'center';
    blackScreen.style.opacity = '0';
    blackScreen.style.transition = 'opacity 0.4s';
blackScreen.innerHTML = '<span style="color:white;font-size:2.5rem;font-family:PixelFont;letter-spacing:2px;">Indo para loja...</span>';
    document.body.appendChild(blackScreen);

    
    blackScreen.offsetHeight;
    blackScreen.style.opacity = '1';

    setTimeout(() => {
        if (typeof callback === 'function') {
            callback(() => {
                blackScreen.style.opacity = '0';
                setTimeout(() => {
                    if (blackScreen.parentNode) {

                        blackScreen.parentNode.removeChild(blackScreen);
                    }
                }, 400);
            });
        }
    }, 400);
}


document.addEventListener('keydown', function(e) {
    if (!introActive) return;
    
    // Para o som de digitação ao pressionar qualquer tecla para avançar
    try {
        if (typeof AudioManager !== 'undefined' && AudioManager.stop) {
            AudioManager.stop('type_sfx');
        }
    } catch (err) {}
    
    if (introStep < introPhrases.length && textIndex < introPhrases[introStep].length) {
        currentText = introPhrases[introStep];
        textIndex = introPhrases[introStep].length;
        return;
    }
    
    else if (introStep === introPhrases.length && textIndex < finalintroText.length) {
        currentText = finalintroText;
        textIndex = finalintroText.length;
        return;
    }
    
    else if (introStep < introPhrases.length) {
        introStep++;
        textIndex = 0;
        currentText = '';
        return;
    }
    
    else if (introStep === introPhrases.length && textIndex >= finalintroText.length && e.key === 'Enter') {
        introActive = false;
        // Start intro video + dialog sequence; after completion proceed to the original loading/shop flow
        startIntroVideoSequence(() => {
            showLoadingScreen((removeLoading) => {
                resetGame({ pauseOnStart: false, showShop: true });
                // Toca música da loja se não estiver tocando
                try {
                    // Apply saved music volume (if the options menu saved one) before starting shop music
                    try {
                        var _mv = 0.6;
                        if (typeof OptionsMenu !== 'undefined' && OptionsMenu.getSettings) {
                            var _s = OptionsMenu.getSettings();
                            if (_s && typeof _s.musicVolume === 'number') _mv = _s.musicVolume;
                            else if (AudioManager && AudioManager.getDefaultMusicVolume) _mv = AudioManager.getDefaultMusicVolume();
                        } else if (AudioManager && AudioManager.getDefaultMusicVolume) {
                            _mv = AudioManager.getDefaultMusicVolume();
                        }
                        if (AudioManager && typeof AudioManager.setMusicVolume === 'function') {
                            AudioManager.setMusicVolume(_mv);
                        }
                    } catch (e) {}

                    if (AudioManager && typeof AudioManager.assets === 'object' && AudioManager.assets['shop_music'] && AudioManager.assets['shop_music'].paused) {
                        AudioManager.playMusic('shop_music');
                    }
                } catch (e) {}
                setTimeout(removeLoading, 300);
                updateBodyStyles(true);
            });
        });
    }
});

function updateIntro(currentTime) {
    if (!introActive) return;

    
    const isLastfinalintroText = introStep === introPhrases.length;
    const currentTextToType = isLastfinalintroText ? finalintroText : introPhrases[introStep];
    
    // Só reinicia o som se houver mais texto relevante após o ponto final
    if (textIndex === 0 || (window._lastStopPoint && textIndex === window._lastStopPoint + 1)) {
        // Verifica se há mais texto relevante (não espaço, não \n)
        let nextChar = currentTextToType[textIndex];
        let hasMoreSentence = false;
        for (let i = textIndex; i < currentTextToType.length; i++) {
            if (currentTextToType[i] && ![' ', '\n'].includes(currentTextToType[i])) {
                hasMoreSentence = true;
                break;
            }
        }
        if (hasMoreSentence) {
            try {
                if (typeof AudioManager !== 'undefined' && AudioManager.play) {
                    AudioManager.play('type_sfx');
                    window._lastStopPoint = null; // limpa o marcador de ponto
                }
            } catch (err) {}
        }
    }

    if (textIndex < currentTextToType.length && currentTime - lastTypingTime >= TYPING_DELAY) {
        currentText += currentTextToType[textIndex];
        
        // Se encontramos um ponto final (e o próximo caractere não é um ponto)
        if (currentTextToType[textIndex] === '.' && currentTextToType[textIndex + 1] !== '.') {
            try {
                if (typeof AudioManager !== 'undefined' && AudioManager.stop) {
                    AudioManager.stop('type_sfx');
                    window._lastStopPoint = textIndex; // marca onde paramos para reiniciar depois
                }
            } catch (err) {}
        }
        
        textIndex++;
        lastTypingTime = currentTime;
    }
    else if (textIndex >= currentTextToType.length && currentTime - lastTypingTime >= PHRASE_DELAY) {
        // Garantir que o som pare no final da frase
        try {
            if (typeof AudioManager !== 'undefined' && AudioManager.stop) {
                AudioManager.stop('type_sfx');
            }
        } catch (err) {}
        
        if (!isLastfinalintroText) {
            introStep++;
            textIndex = 0;
            currentText = '';
            lastTypingTime = currentTime;
        }
    }
    
    else if (introStep === introPhrases.length) {
        if (textIndex < finalintroText.length && currentTime - lastTypingTime >= TYPING_DELAY) {
            currentText += finalintroText[textIndex];
            textIndex++;
            lastTypingTime = currentTime;
        }
    }
}

function drawIntro() {
    
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    
    ctx.fillStyle = 'white';
    ctx.font = '24px PixelFont';
    ctx.textAlign = 'center';

    
    // função auxiliar para quebrar texto em múltiplas linhas respeitando largura máxima
    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        const paragraphs = text.split('\n');
        let offsetY = 0;
        paragraphs.forEach((para) => {
            const words = para.split(' ');
            let line = '';
            for (let n = 0; n < words.length; n++) {
                const testLine = line ? line + ' ' + words[n] : words[n];
                const metrics = context.measureText(testLine);
                if (metrics.width > maxWidth && line) {
                    context.fillText(line, x, y + offsetY);
                    line = words[n];
                    offsetY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            if (line) {
                context.fillText(line, x, y + offsetY);
                offsetY += lineHeight;
            }
            // adicionar espaçamento extra entre parágrafos
            offsetY += lineHeight / 2;
        });
    }

    const maxTextWidth = Math.min(canvas.width * 0.85, 900);
    const startX = canvas.width / 2;

    if (introStep < introPhrases.length) {
        wrapText(ctx, currentText, startX, canvas.height / 2 - 20, maxTextWidth, 30);
    } else {
        // show finalintroText near the top of the screen
        const topY = Math.max(64, Math.floor(canvas.height * 0.08));
        wrapText(ctx, currentText, startX, topY, maxTextWidth, 28);
    }
}
