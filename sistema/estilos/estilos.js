// Aplicação de estilos via JavaScript
// Esconde barras de rolagem em todos os elementos
document.documentElement.style.overflow = 'hidden'; // html
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.display = "flex";
document.body.style.justifyContent = "center";
document.body.style.alignItems = "center";
document.body.style.height = "100vh";
document.body.style.backgroundColor = "#5e5e5e";
document.body.style.overflow = "hidden";

// Remove as barras de rolagem no Chrome, Safari e outros
document.documentElement.style.scrollbarWidth = 'none';  // Firefox
document.documentElement.style.msOverflowStyle = 'none';  // IE

// Aplica o estilo para esconder barras de rolagem em navegadores webkit (Chrome, Safari)
const style = document.createElement('style');
style.textContent = `
  ::-webkit-scrollbar {
    display: none;
  }
`;
document.head.appendChild(style);

// Toda a lógica de estilos do menu inicial foi movida para menu_inicial.js
