console.log("script carregado");

const openButton = document.querySelector('.open-modal');
const modal = document.getElementById('modal-categoria');
const closeButton = document.querySelector('.close-modal');
const form = document.getElementById('form-produto');
const btnSair = document.getElementById('btn-sair');
const btnSalvar = document.getElementById('btn-salvar');

/* NOVO COMPONENTE DE IMAGEM */
const imagemInput = document.getElementById('imagem');
const areaUpload = document.getElementById('area-upload');
const previewImagem = document.getElementById('preview-imagem');
const removerImagem = document.getElementById('remover-imagem');

const nomeInput = document.getElementById('nome');
const precoInput = document.getElementById('preco');
const descricaoInput = document.getElementById('descricao');

console.log("openButton:", openButton ? "ok" : "erro");
console.log("modal:", modal ? "ok" : "erro");
console.log("closeButton:", closeButton ? "ok" : "erro");
console.log("form:", form ? "ok" : "erro");
console.log("nomeInput:", nomeInput ? "ok" : "erro");
console.log("precoInput:", precoInput ? "ok" : "erro");
console.log("event listeners anexados com sucesso");

/* Abrir modal */
openButton.addEventListener('click', () => {
    modal.showModal();
    console.log("modal aberto");
});

/* Fechar no X */
closeButton.addEventListener('click', () => {
    modal.close();
    console.log("modal fechado (X)");
});

/* Botão sair */
btnSair.addEventListener('click', () => {
    modal.close();
});

/* ÁREA DE UPLOAD — CLICAR NA ÁREA → abre input */
areaUpload.addEventListener("click", () => {
    imagemInput.click();
});

/* Quando usuário escolhe imagem */
imagemInput.addEventListener('change', () => {
    const file = imagemInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        previewImagem.src = e.target.result;
        previewImagem.style.display = "block";
        

        // remover texto padrão da área
         const textoUpload = document.getElementById('texto-upload')
         if (textoUpload) {
            textoUpload.style.display = "none";
            if (removerImagem) {
            removerImagem.style.display = "flex";
        }
    }
};
    reader.readAsDataURL(file);
});

/* Remover imagem */
if (removerImagem) {
    removerImagem.addEventListener("click", (e) => {
        e.stopPropagation(); // evita abrir input ao clicar no X

        imagemInput.value = "";
        previewImagem.style.display = "none";
        removerImagem.style.display = "none";
         const textoUpload = document.getElementById('texto-upload');
        if (textoUpload) {
            textoUpload.style.display = "block";
        }
    }
    )}
/* Ativar botão salvar */
function validar() {
    btnSalvar.disabled =
        nomeInput.value.trim().length < 3 ||
        precoInput.value <= 0;
}

nomeInput.addEventListener("input", validar);
precoInput.addEventListener("input", validar);

/* Salvar */
form.addEventListener('submit', (e) => {
    e.preventDefault();

    alert("Produto salvo com sucesso!");

    form.reset();

    // resetar área de upload também
    imagemInput.value = "";
    previewImagem.style.display = "none";
    if (removerImagem) {
        removerImagem.style.display = "none";
    }
    
    // CORREÇÃO: Mostra o texto do placeholder novamente ao salvar
    const textoUpload = document.getElementById('texto-upload');
    if (textoUpload) {
        textoUpload.style.display = "block";
    }

    modal.close();
    btnSalvar.disabled = true;
});
