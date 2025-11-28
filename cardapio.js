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
// LOGIN
// ---------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
    if (!user) return (window.location.href = "login.html");
    carregarRestaurante(user.uid);
});
