// Seletores que receberão zoom ao passar o mouse
const elementosComZoom = [
    "button",
    ".item-destaque",
    ".produto",
    ".produto-imagem img",
    ".image-destaque",
    ".categoria",
    ".restaurante-header .image",
];

// Função que aplica o efeito
function aplicarZoom(seletor) {
    const elementos = document.querySelectorAll(seletor);

    elementos.forEach(el => {
        // Armazena o estilo original
        el.style.transition = "transform 0.25s ease";

        el.addEventListener("mouseenter", () => {
            el.style.transform = "scale(1.05)";
            el.style.cursor = "pointer";
        });

        el.addEventListener("mouseleave", () => {
            el.style.transform = "scale(1)";
        });
    });
}

// Aplica zoom a todos os elementos da lista
elementosComZoom.forEach(seletor => aplicarZoom(seletor));
