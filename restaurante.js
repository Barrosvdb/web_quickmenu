const imageInput = document.getElementById("image-input");
const previewImg  = document.getElementById("preview-img");
const removeBtn   = document.getElementById("remove-image");

/* UPLOAD DE IMAGEM */
imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = () => {
            previewImg.src = reader.result;
            previewImg.style.display = "block";
            removeBtn.style.display = "block";
        };

        reader.readAsDataURL(file);
    }
});

/* REMOVER IMAGEM */
removeBtn.addEventListener("click", () => {
    previewImg.src = "";
    previewImg.style.display = "none";
    imageInput.value = "";
    removeBtn.style.display = "none";
});
