// ---- FUNÇÃO GERAL DE UPLOAD ----
function aplicarUpload(elemento, callback) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = () => {
        const arquivo = input.files[0];
        if (!arquivo) return;

        const url = URL.createObjectURL(arquivo);
        callback(url);
    };

    input.click();
}



// ------------------------------
// IMAGEM PRINCIPAL DO RESTAURANTE
// ------------------------------
const imageUpload = document.getElementById("image-upload");

if (imageUpload) {
    imageUpload.addEventListener("click", () => {
        aplicarUpload(imageUpload, (url) => {
            imageUpload.style.backgroundImage = `url(${url})`;
            imageUpload.style.backgroundSize = "cover";
            imageUpload.style.backgroundPosition = "center";
            imageUpload.innerHTML = ""; // remove o ícone
        });
    });
}



// ------------------------------
// UPLOAD NAS IMAGENS DE DESTAQUE
// ------------------------------
document.querySelectorAll(".image-destaque").forEach((div) => {
    div.addEventListener("click", () => {
        aplicarUpload(div, (url) => {
            div.style.backgroundImage = `url(${url})`;
            div.style.backgroundSize = "cover";
            div.style.backgroundPosition = "center";
        });
    });
});



// ------------------------------
// UPLOAD NAS IMAGENS DOS PRODUTOS
// ------------------------------
document.querySelectorAll(".produto-imagem img").forEach((img) => {
    img.addEventListener("click", () => {
        aplicarUpload(img, (url) => {
            img.src = url;
        });
    });
});
