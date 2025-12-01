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
    setDoc           
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
// CORREÇÃO DE NAVEGAÇÃO: Adiciona o ID aos links imediatamente
// Esta é a solução para o problema de navegação.
// ---------------------------------------------------------------
const currentParams = window.location.search;
if (currentParams) {
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    
    sidebarLinks.forEach(link => {
        let originalHref = link.getAttribute('href');
        if (originalHref && !originalHref.startsWith('http')) {
            // Adiciona o parâmetro ID (?id=...) ao final do link de destino
            link.href = originalHref + currentParams; 
        }
    });
}
// ---------------------------------------------------------------


// ---------------------------------------------------------------
// ELEMENTOS DA PÁGINA
// ---------------------------------------------------------------
const nomeRestEl = document.querySelector(".nome-restaurante");
const descRestEl = document.querySelector(".nota-restaurante");
const imgRestEl = document.querySelector("#image-upload");

// Variável para armazenar ref do documento
let restauranteRef = null;

// ---------------------------------------------------------------
// CARREGAR RESTAURANTE
// ---------------------------------------------------------------
function carregarRestaurante(userId) {
    restauranteRef = doc(db, "operadores", userId, "restaurantes", restauranteId);

    onSnapshot(restauranteRef, (snapshot) => {
        if (!snapshot.exists()) {
            alert("Restaurante não encontrado.");
            return;
        }

        const dados = snapshot.data();

        nomeRestEl.textContent = dados.nome || "Sem nome";
        descRestEl.value = dados.descricao || "";

        if (dados.imageUrl) {
            imgRestEl.innerHTML = `
                <img src="${dados.imageUrl}" style="width:120px; border-radius:10px;">
            `;
        }
    });
}

// ---------------------------------------------------------------
// SALVAR ALTERAÇÕES DA DESCRIÇÃO EM TEMPO REAL
// ---------------------------------------------------------------
descRestEl.addEventListener("input", async () => {
    if (!restauranteRef) return;

    try {
        await updateDoc(restauranteRef, {
            descricao: descRestEl.value
        });
    } catch (erro) {
        console.error("Erro ao salvar descrição:", erro);
    }
});

// ---------------------------------------------------------------
// LOGIN (Verificação de login e Carregamento de dados)
// ---------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
    if (!user) return (window.location.href = "login.html");
    // Se o usuário estiver logado, carrega os dados
    carregarRestaurante(user.uid);
});


//-----------------------------------
//Img retaurante 
//-------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Certifique-se de que este bloco só é executado após o DOM estar pronto
    const imageUpload = document.getElementById('image-upload');
    const fileInput = document.getElementById('file-input');
    const removeBtn = document.getElementById('remove-image-btn');
    
    // 1. Lógica para abrir a seleção de arquivo ao clicar no contêiner .image
    imageUpload.addEventListener('click', (e) => {
        // Verifica se o clique NÃO foi no botão de remoção.
        if (e.target.id !== 'remove-image-btn') {
            fileInput.click();
        }
    });

    // 2. Lógica de Carregamento da Imagem (Input change)
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];

        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                // Remove qualquer imagem <img> existente antes de adicionar a nova
                const existingImage = imageUpload.querySelector('img');
                if (existingImage) {
                    existingImage.remove();
                }

                // Cria o elemento <img> e insere a imagem carregada
                const img = document.createElement('img');
                img.src = e.target.result;
                imageUpload.prepend(img); // Adiciona a imagem no início do contêiner

                // Controla a visibilidade:
                if (removeBtn) removeBtn.style.display = 'flex'; // Adicionado checagem
                imageUpload.classList.add('has-image'); // Adiciona classe para ocultar o SVG placeholder
            };
            
            reader.readAsDataURL(file);
        }
    });

    // 3. Lógica de Remoção da Imagem (Botão de remoção click)
    if (removeBtn) { // Adicionado checagem
        removeBtn.addEventListener('click', () => {
            // Encontra e remove o elemento <img>
            const img = imageUpload.querySelector('img');
            if (img) {
                img.remove();
            }

            // Limpa o valor do input file para que o usuário possa carregar a mesma imagem novamente, se quiser.
            fileInput.value = '';

            // Controla a visibilidade:
            removeBtn.style.display = 'none'; // Oculta o botão
            imageUpload.classList.remove('has-image'); // Remove a classe para reexibir o SVG placeholder
        });
    }
});

//------------------------------ 
//sessaõ destaques
//----------------------------------
// -------------------------------
// LISTAS QUE GUARDAM OS PRODUTOS
// -------------------------------
let destaques = [];
let categorias = [];


// -------------------------------
// GERAR CARDS DE DESTAQUES
// -------------------------------
function renderDestaques() {
    const lista = document.getElementById("listaDestaques");
    if (!lista) return; // Adicionado checagem para elemento inexistente
    lista.innerHTML = "";

    destaques.forEach((item, index) => {
        const card = document.createElement("div");
        card.classList.add("item-destaque");

        card.innerHTML = `
            <div class="remover-btn" data-index="${index}">X</div>

            <div class="image-destaque">
                ${item.img 
                    ? `<img src="${item.img}" style="width:100%;height:100%;border-radius:8px;">`
                    : `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="#ff7b4f" viewBox="0 0 16 16">
                        <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0z"/>
                        <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12z"/>
                       </svg>`
                }
            </div>

            <p class="titulo">${item.nome}</p>
            <p class="preco">R$ ${item.preco}</p>
        `;

        lista.appendChild(card);
    });
}


// -------------------------------
// GERAR CATEGORIAS E PRODUTOS
// -------------------------------
function renderCategorias() {
    const lista = document.getElementById("listaCategorias");
    if (!lista) return; // Adicionado checagem para elemento inexistente
    lista.innerHTML = "";

    categorias.forEach((categoria, catIndex) => {
        const bloco = document.createElement("div");
        bloco.classList.add("categoria-secao");

        bloco.innerHTML = `
            <h3 class="nome-categoria">${categoria.nome}</h3>
            <button class="add-produto" data-cat="${catIndex}">
                + adicionar produto
            </button>

            <div class="lista-produtos"></div>
        `;

        const listaProdutos = bloco.querySelector(".lista-produtos");

        categoria.produtos.forEach((prod, prodIndex) => {
            const item = document.createElement("div");
            item.classList.add("produto-item");
            item.style.position = "relative";

            item.innerHTML = `
                <div class="remover-produto-btn" data-cat="${catIndex}" data-prod="${prodIndex}">X</div>

                <div class="produto-imagem">
                    <img src="${prod.img}" style="width:100%;border-radius:8px;">
                </div>

                <div class="produto-detalhes">
                    <h4 class="produto-nome">${prod.nome}</h4>
                    <p class="produto-descricao">${prod.descricao}</p>
                    <p class="produto-preco">R$ ${prod.preco}</p>
                </div>
            `;

            listaProdutos.appendChild(item);
        });

        lista.appendChild(bloco);
    });
    
    // Se você usa o ativarRemoverProdutos, chame-o aqui após a renderização
    // ativarRemoverProdutos(); 
}
// ===============================
// ADICIONAR DESTAQUE
// ===============================

// Corrigido: Adicionado optional chaining (?) para evitar erro se o elemento não existir
document.getElementById("adicionar-destaque-btn")?.addEventListener("click", () => {

    const img = prompt("URL da imagem (ou deixe vazio):");
    const nome = prompt("Nome do item:");
    const preco = prompt("Preço:");

    destaques.push({ img, nome, preco });

    renderDestaques();
});


// ===============================
// REMOVER DESTAQUE
// ===============================

document.addEventListener("click", e => {

    if (e.target.classList.contains("remover-btn")) {

        const index = e.target.dataset.index;  // Dataset vem do render

        if (index !== undefined) {
            destaques.splice(index, 1);
            renderDestaques();
        }
    }
});


// ===============================
// ADICIONAR CATEGORIA
// ===============================

// Corrigido: Mantido o optional chaining (?)
document.getElementById("addCategoriaBtn")?.addEventListener("click", () => {

    const nome = prompt("Nome da categoria:");

    if (!nome) return;

    categorias.push({
        nome,
        produtos: []
    });

    renderCategorias();
});


// ===============================
// ADICIONAR PRODUTO A UMA CATEGORIA
// ===============================

document.addEventListener("click", e => {

    if (e.target.classList.contains("add-produto")) {

        const catIndex = e.target.dataset.cat;

        if (catIndex === undefined) return;

        const img = prompt("URL da imagem:");
        const nome = prompt("Nome do produto:");
        const descricao = prompt("Descrição:");
        const preco = prompt("Preço:");

        categorias[catIndex].produtos.push({
            img, nome, descricao, preco
        });

        renderCategorias();
    }
});


// ===============================
// REMOVER PRODUTO 
//------------------
// função que adiciona o evento de remover para todos os botões existentes
function ativarRemoverProdutos() {
  document.querySelectorAll('.remover-produto').forEach(btn => {
    // evita múltiplos listeners duplicados
    btn.replaceWith(btn.cloneNode(true));
  });

  document.querySelectorAll('.remover-produto').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const wrapper = btn.closest('.produto-wrapper');
      if (!wrapper) return;
      wrapper.remove();
    });
  });
}

// inicializa ao carregar
// Nota: Em módulos (script type="module"), o DOM já está pronto quando o script é executado.
// A função ativaRemoverProdutos só é realmente necessária se você adicionar produtos/categorias
// *depois* da renderização inicial.
document.addEventListener('DOMContentLoaded', ativarRemoverProdutos);