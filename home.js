import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signOut,             // ✅ precisa importar
    onAuthStateChanged   // ✅ precisa importar
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Configuração do Firebase
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

// Inicializações
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const analytics = getAnalytics(app);
const db = getFirestore(app); 

// Se não estiver logado, volta pra tela de login
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    }
});

// Seleciona o botão de logout
const logoutButton = document.getElementById("logout");

// Adiciona evento de clique para deslogar
logoutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error("Erro ao sair:", error);
      alert("Erro ao sair da conta. Tente novamente.");
    });
});
