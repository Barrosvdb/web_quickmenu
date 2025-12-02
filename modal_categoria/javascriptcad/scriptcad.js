console.log("script carregado");

const openButton = document.querySelector('.open-modal');
const modal = document.getElementById('modalcat-categoria');
const closeButton = document.querySelector('.close-modal');
const form = document.getElementById('form-produto');
const btnSair = document.getElementById('btn-sair');
const btnSalvar = document.getElementById('btn-salvar');

const nomeInput = document.getElementById('nome');

console.log("openButton:", openButton ? "ok" : "erro");
console.log("modal:", modal ? "ok" : "erro");
console.log("closeButton:", closeButton ? "ok" : "erro");
console.log("form:", form ? "ok" : "erro");
console.log("nomeInput:", nomeInput ? "ok" : "erro");
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


    reader.readAsDataURL(file);

/* Ativar botão salvar */
function validar() {
    // CORRIGIDO: Removido o '||' que estava quebrando o script.
    btnSalvar.disabled = nomeInput.value.trim().length < 3; 
}

nomeInput.addEventListener("input", validar);

/* Salvar */
form.addEventListener('submit', (e) => {
    e.preventDefault();

    alert("Categotia salva com sucesso!");

    form.reset();

    // CORREÇÃO: Mostra o texto do placeholder novamente ao salvar
    const textoUpload = document.getElementById('texto-upload');
    if (textoUpload) {
        textoUpload.style.display = "block";
    }

    modal.close();
    btnSalvar.disabled = true;
});