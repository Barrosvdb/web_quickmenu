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
// ELEMENTOS DA PÁGINA
// ---------------------------------------------------------------
const nomeRestEl = document.querySelector(".nome-restaurante");
const descRestEl = document.querySelector(".nota-restaurante");
const imgRestEl = document.querySelector("#image-upload");

// Variável para armazenar ref do documento
let restauranteRef = null;

// ---------------------------------------------------------------
// CORREÇÃO DE NAVEGAÇÃO: Adiciona o ID aos links imediatamente
// ---------------------------------------------------------------
const currentParams = window.location.search;
if (currentParams) {
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    
    sidebarLinks.forEach(link => {
        let originalHref = link.getAttribute('href');
        if (originalHref && !originalHref.startsWith('http')) {
            // Junta o nome do arquivo (ex: cardapio.html) com o parâmetro (ex: ?id=xyz)
            link.href = originalHref + currentParams; 
        }
    });
}

// ---------------------------------------------------------------
// CARREGAR RESTAURANTE (Função crucial restaurada)
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
        // Aqui é onde você normalmente chamaria renderDestaques() e renderCategorias()
    });
}

// ---------------------------------------------------------------
// SALVAR ALTERAÇÕES DA DESCRIÇÃO EM TEMPO REAL (Restaurado)
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
// VERIFICAR LOGIN (Corrigido: Inclui o carregamento do restaurante)
// ---------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Se não houver usuário, redireciona
        window.location.href = "login.html";
    } else {
        // Se houver usuário, chama a função para carregar os dados
        carregarRestaurante(user.uid);
    }
});

// ... O restante do seu código (Img restaurante, destaques, categorias) ...
document.addEventListener('DOMContentLoaded', () => {
    // 1. Seleção dos elementos para atualização
    const productName = document.getElementById('product-name');
    const productPrice = document.getElementById('product-price');
    const productQuantity = document.getElementById('product-quantity');
    const confirmButton = document.getElementById('confirm-order-btn');
    const clientNameInput = document.getElementById('client-name-input');

    // 2. Função para atualizar os dados do produto (exemplo)
    function updateProductData(name, price, quantity) {
        productName.textContent = name;
        // Formata o preço para o padrão brasileiro
        productPrice.textContent = price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        productQuantity.textContent = quantity;
    }

    // Exemplo de uso: Carregar dados iniciais
    updateProductData("Pizza Marguerita", 45.50, 3);


    // 3. Adiciona funcionalidade ao botão
    confirmButton.addEventListener('click', () => {
        const name = productName.textContent;
        const client = clientNameInput.value.trim();
        const price = productPrice.textContent;
        const qty = productQuantity.textContent;

        if (client === "") {
            alert("Por favor, digite o nome do cliente para confirmar o pedido.");
            return;
        }

        const message = `
=========================
    PEDIDO CONFIRMADO
=========================
Produto: ${name}
Preço Unitário: ${price}
Quantidade: ${qty}
-------------------------
Nome do Cliente: ${client}
-------------------------
`;
        console.log(message);
        alert(`Pedido para ${client} confirmado! Veja os detalhes no console.`);
        
        // Opcional: Limpa o input após a confirmação
        clientNameInput.value = ""; 
    });
});