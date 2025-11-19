// ---------------------------------------------------------------
// IMPORTS DO FIREBASE
// ---------------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { 
    getAuth, 
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ---------------------------------------------------------------
// CONFIGURAÇÃO FIREBASE
// ---------------------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyDXlJIJFQZJ85CBphkkDr-axP9-ufri7No",
    authDomain: "quickmenu-1234.firebaseapp.com",
    databaseURL: "https://quickmenu-1234-default-rtdb.firebaseio.com",
    projectId: "quickmenu-1234",
    storageBucket: "quickmenu-1234.firebasestorage.app",
    messagingSenderId: "279494796257",
    appId: "1:279494796257:web:aae9121774efb0d7fae8a0",
    measurementId: "G-S457FE7BWM"
};

// ---------------------------------------------------------------
// INICIALIZAÇÕES
// ---------------------------------------------------------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// ---------------------------------------------------------------
// ELEMENTOS
// ---------------------------------------------------------------
const logoutButton = document.getElementById("logout");
const restaurantList = document.querySelector(".restaurant-list");

// ---------------------------------------------------------------
// LOGOUT
// ---------------------------------------------------------------
logoutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => window.location.href = "login.html")
    .catch((error) => {
      console.error("Erro ao sair:", error);
      alert("Erro ao sair da conta.");
    });
});

// ---------------------------------------------------------------
// CARREGAR RESTAURANTES DO USUÁRIO
// ---------------------------------------------------------------
async function carregarRestaurantes(userId) {
    // Limpa a lista e deixa apenas o botão de adicionar restaurante
    restaurantList.innerHTML = `
        <button class="btn-submit add-restaurant-btn"
            onclick="window.location.href='cadastror.html'">
            <i class="fa-solid fa-circle-plus add-icon"></i>
        </button>
    `;

    const restaurantesRef = collection(db, "users", userId, "restaurantes");
    const snapshot = await getDocs(restaurantesRef);

    if (snapshot.empty) {
        console.log("Nenhum restaurante cadastrado.");
        return;
    }

    snapshot.forEach(doc => {
        const dados = doc.data();

        // Cria o botão do restaurante
        const btn = document.createElement("button");
        btn.classList.add("btn-submit");

        btn.innerHTML = `
            <div class="restaurant-name">${dados.nome}</div>
        `;

        // Redirecionar para a página do restaurante
        btn.addEventListener("click", () => {
            window.location.href = `cardapio.html?id=${doc.id}`;
        });

        // Insere o restaurante ANTES do botão de adicionar
        const addBtn = document.querySelector(".add-restaurant-btn");
        restaurantList.insertBefore(btn, addBtn);
    });
}

// ---------------------------------------------------------------
// VERIFICAR LOGIN + CARREGAR LISTA
// ---------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        carregarRestaurantes(user.uid);
    }
});
