// ---------------------------------------------------------------
// IMPORTS DO FIREBASE
// ---------------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
    doc,
    onSnapshot,
    updateDoc,
    collection, // Importado
    addDoc,     // Importado
    serverTimestamp // Importado
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ---------------------------------------------------------------
// CONFIG
// ---------------------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyDXlJIJFQZJ85CBphkkDr-axP9-ufri7No",
    authDomain: "quickmenu-1234.firebaseapp.com",
    projectId: "quickmenu-1234",
    storageBucket: "quickmenu-1234.firebasestorage.app",
};

// **IMPORTANTE**: Substitua pela sua chave API do ImgBB.
const IMGBB_API_KEY = "SUA_CHAVE_API_DO_IMGBB_AQUI"; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});

// ---------------------------------------------------------------
// PEGAR ID DO RESTAURANTE PELA URL
// ---------------------------------------------------------------
const params = new URLSearchParams(window.location.search);
const restauranteId = params.get("id");

// ---------------------------------------------------------------
// CORREÇÃO DE NAVEGAÇÃO
// ---------------------------------------------------------------
const currentParams = window.location.search;
if (currentParams) {
    document.querySelectorAll('.sidebar a').forEach(link => {
        let href = link.getAttribute('href');
        if (href && !href.startsWith('http')) {
            link.href = href + currentParams;
        }
    });
}

// ---------------------------------------------------------------
// ELEMENTOS E VARIÁVEIS GLOBAIS
// ---------------------------------------------------------------
const nomeRestEl = document.querySelector(".nome-restaurante");
const descRestEl = document.querySelector(".nota-restaurante");
const imgRestEl = document.querySelector("#image-upload");
const fileInputRest = document.getElementById('file-input');
const placeholderIcon = document.getElementById('placeholder-icon');
const removeImgRestBtn = document.getElementById('remove-image-btn');

let restauranteRef = null;
let userIdGlobal = null; 
let categoriaAtual = null; // Armazena o nome da categoria selecionada

// Elementos do Modal
const modal = document.getElementById("modal-categoria");
const btnAbrir = document.querySelector(".open-modal");
const btnFechar = document.getElementById("btn-fechar-modal"); 
const btnSair = document.getElementById("btn-sair");
const formProduto = document.getElementById("form-produto");
const salvarBtn = document.getElementById("btn-salvar");
const inputNome = document.getElementById("nome");
const inputPreco = document.getElementById("preco");
const inputDescricao = document.getElementById("descricao");
const areaUpload = document.getElementById("area-upload");
const inputImagem = document.getElementById("imagem");
const previewImagem = document.getElementById("preview-imagem");
const textoUpload = document.getElementById("texto-upload");
const removerImagemBtn = document.getElementById("remover-imagem");


// ---------------------------------------------------------------
// FUNÇÕES DE UTILIDADE
// ---------------------------------------------------------------

async function uploadToImgBB(file) {
    // ... (Função uploadToImgBB inalterada) ...
    const reader = new FileReader();

    const base64Image = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const formData = new FormData();
    formData.append("image", base64Image);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
    });

    const data = await res.json();
    if (!data.success) throw new Error("Falha no upload da imagem para o ImgBB.");

    return data.data.url;
}

function limparPreviewImagem() {
    previewImagem.src = "";
    previewImagem.style.display = "none";
    inputImagem.value = "";
    textoUpload.style.display = "block";
    removerImagemBtn.style.display = "none";
}

function checkFormValidity() {
    // **IMAGEM DO PRODUTO AGORA É OBRIGATÓRIA**
    const isImageSelected = inputImagem.files.length > 0 || previewImagem.src; 
    const isNameValid = inputNome.value.trim().length > 0;
    const isPriceValid = parseFloat(inputPreco.value) > 0;

    salvarBtn.disabled = !(isImageSelected && isNameValid && isPriceValid);
}

// ---------------------------------------------------------------
// CARREGAR RESTAURANTE
// ---------------------------------------------------------------
function carregarRestaurante(userId) {
    restauranteRef = doc(db, "operadores", userId, "restaurantes", restauranteId);
    // ... (onSnapshot e lógica visual inalterada) ...
    onSnapshot(restauranteRef, (snapshot) => {
        if (!snapshot.exists()) {
            alert("Restaurante não encontrado.");
            return;
        }

        const dados = snapshot.data();

        nomeRestEl.textContent = dados.nome || "Nome do Restaurante";
        descRestEl.value = dados.descricao || "";

        // Limpa o conteúdo anterior
        imgRestEl.querySelectorAll('img, #placeholder-icon, #remove-image-btn').forEach(el => {
            if (el.id !== 'file-input' && el.id !== 'remove-image-btn') el.remove();
        });
        
        // Exibe a imagem ou o placeholder
        if (dados.imageUrl) {
            const img = document.createElement('img');
            img.src = dados.imageUrl;
            img.style.width = '120px'; 
            img.style.borderRadius = '10px';
            imgRestEl.prepend(img);
            removeImgRestBtn.style.display = 'block';
            if(placeholderIcon) placeholderIcon.style.display = 'none';
            imgRestEl.classList.add('has-image');
        } else {
            if(placeholderIcon) {
                if (!imgRestEl.contains(placeholderIcon)) imgRestEl.prepend(placeholderIcon);
                placeholderIcon.style.display = 'block';
            }
            removeImgRestBtn.style.display = 'none';
            imgRestEl.classList.remove('has-image');
        }
    });
}

// ---------------------------------------------------------------
// AUTOSAVE DESCRIÇÃO
// ---------------------------------------------------------------
descRestEl.addEventListener("input", async () => {
    if (!restauranteRef) return;

    try {
        await updateDoc(restauranteRef, { descricao: descRestEl.value });
    } catch (erro) {
        console.error("Erro ao salvar descrição:", erro);
    }
});

// ---------------------------------------------------------------
// LOGIN
// ---------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
    if (!user) return (window.location.href = "login.html");
    userIdGlobal = user.uid;
    carregarRestaurante(userIdGlobal);
});

// ---------------------------------------------------------------
// UPLOAD E REMOÇÃO DE IMAGEM DO RESTAURANTE
// ---------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

    imgRestEl.addEventListener('click', (e) => {
        if (e.target !== removeImgRestBtn && e.target.tagName !== 'IMG') { 
            fileInputRest.click();
        }
    });

    fileInputRest.addEventListener('change', async event => {
        const file = event.target.files[0];
        if (!file) return;

        // Pré-visualização
        const reader = new FileReader();
        reader.onload = e => {
            imgRestEl.querySelector("img")?.remove();
            if(placeholderIcon) placeholderIcon.style.display = 'none';

            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '120px'; 
            img.style.borderRadius = '10px';
            imgRestEl.prepend(img);

            removeImgRestBtn.style.display = 'block';
            imgRestEl.classList.add('has-image');
        };
        reader.readAsDataURL(file);

        // Upload e Salvamento no Firestore
        if (restauranteRef) {
            try {
                const imageUrl = await uploadToImgBB(file);
                await updateDoc(restauranteRef, { imageUrl: imageUrl });
            } catch (error) {
                alert("Erro ao fazer upload da imagem do restaurante. Tente novamente.");
                console.error("Erro no upload:", error);
            }
        }
    });

    removeImgRestBtn.addEventListener('click', async (e) => {
        e.stopPropagation(); 
        
        // Remove visualmente
        imgRestEl.querySelector("img")?.remove();
        fileInputRest.value = "";
        removeImgRestBtn.style.display = 'none';
        imgRestEl.classList.remove('has-image');
        if(placeholderIcon) placeholderIcon.style.display = 'block';

        // Remove do Firestore
        if (restauranteRef) {
            try {
                await updateDoc(restauranteRef, { imageUrl: "" });
            } catch (error) {
                alert("Erro ao remover a URL da imagem do restaurante.");
                console.error("Erro ao remover URL:", error);
            }
        }
    });
});


// ---------------------------------------------------------------
// SISTEMA DO MODAL E PRODUTOS (COM VALIDAÇÃO DE IMAGEM)
// ---------------------------------------------------------------

formProduto.addEventListener('input', checkFormValidity);
areaUpload.addEventListener("click", () => { inputImagem.click(); });

inputImagem.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        previewImagem.src = e.target.result;
        previewImagem.style.display = "block";
        textoUpload.style.display = "none";
        removerImagemBtn.style.display = "inline-block";
        checkFormValidity();
    };
    reader.readAsDataURL(file);
});

removerImagemBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    limparPreviewImagem();
    checkFormValidity();
});

// --- ABRIR MODAL (Pegando Categoria) ---
document.querySelectorAll(".open-modal").forEach(btn => {
    btn.addEventListener("click", () => {
        const categoriaHeader = btn.closest(".categoria-secao")?.querySelector(".nome-categoria");
        
        if (!categoriaHeader) {
            alert("Erro: Não foi possível identificar a categoria. Verifique a estrutura HTML.");
            return;
        }

        // Armazena o nome da categoria (ex: "salgados" ou "doce")
        categoriaAtual = categoriaHeader.textContent.trim().toLowerCase(); 

        formProduto.reset();
        limparPreviewImagem();
        salvarBtn.disabled = true;
        salvarBtn.textContent = "Salvar Produto";
        modal.showModal();
    });
});

// --- FECHAR MODAL ---
[btnSair, btnFechar].forEach(btn => {
    btn.addEventListener("click", () => {
        modal.close();
        formProduto.reset();
        limparPreviewImagem();
        categoriaAtual = null; // Limpa a categoria
    });
});


// ---------------------------------------------------------------
// SALVAR PRODUTO NO FIRESTORE (CORRIGIDO PARA O PATH ESPECIFICADO)
// ---------------------------------------------------------------
salvarBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (salvarBtn.disabled) return;

    salvarBtn.disabled = true;
    salvarBtn.textContent = "Criando produto...";

    const file = inputImagem.files[0];
    let imageUrl = "";

    try {
        if (!userIdGlobal || !restauranteId) throw new Error("Dados do usuário ou restaurante ausentes.");
        if (!categoriaAtual) throw new Error("Categoria do produto não definida. Tente reabrir o modal.");

        // 1. Upload da Imagem para o ImgBB (obrigatório)
        if (file) {
            imageUrl = await uploadToImgBB(file);
        } else {
             // Redundância de segurança, já validado pelo checkFormValidity
             throw new Error("A imagem do produto é obrigatória."); 
        }
        
        // 2. Coleta dos dados do formulário
        const produtoData = {
            imageUrl: imageUrl, 
            nome: inputNome.value,
            preco: parseFloat(inputPreco.value), 
            descricao: inputDescricao.value,
            criadoEm: serverTimestamp(),
            categoria: categoriaAtual
        };

        // 3. Salvamento no Firestore DENTRO DO CAMINHO ANINHADO CORRETO
        // Caminho de destino: operadores/{uid}/restaurantes/{id}/categorias/{nomeCat}/produtos
        const produtosRef = collection(db, 
            "operadores", userIdGlobal, 
            "restaurantes", restauranteId, 
            "categorias", categoriaAtual, // {nomeCategoria}
            "produtos" // Nome da coleção de produtos
        );
        
        await addDoc(produtosRef, produtoData);

        alert("Produto criado com sucesso! ✅");

        modal.close();
        formProduto.reset();
        limparPreviewImagem();
        
    } catch (error) {
        alert(`Erro ao criar produto: ${error.message}`);
        console.error("Erro ao salvar produto:", error);
    } finally {
        salvarBtn.disabled = false;
        salvarBtn.textContent = "Salvar Produto";
        categoriaAtual = null; 
    }
});