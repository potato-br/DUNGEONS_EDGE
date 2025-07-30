

document.documentElement.style.overflow = 'hidden'; 
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.display = "flex";
document.body.style.justifyContent = "center";
document.body.style.alignItems = "center";
document.body.style.height = "100vh";
document.body.style.backgroundColor = "#5e5e5e";
document.body.style.overflow = "hidden";


document.documentElement.style.scrollbarWidth = 'none';  
document.documentElement.style.msOverflowStyle = 'none';  


const style = document.createElement('style');
style.textContent = `
  ::-webkit-scrollbar {
    display: none;
  }
`;
document.head.appendChild(style);


