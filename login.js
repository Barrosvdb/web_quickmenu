// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Configuração do Firebase (mesma do cadastro)
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

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Seleção dos elementos HTML
const emailInput = document.getElementById("email_login");
const senhaInput = document.getElementById("senha_login");
const entrarBtn = document.getElementById("entrar_login");

// Função de login
function handleLogin(event) {
    event.preventDefault();

    // Desabilita o botão para evitar múltiplos cliques
    entrarBtn.disabled = true;
    entrarBtn.textContent = "Entrando...";

    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    if (email === "" || senha === "") {
        alert("Por favor, preencha todos os campos!");
        entrarBtn.disabled = false;
        entrarBtn.textContent = "Entrar";
        return;
    }

    // Faz login com Firebase Authentication
    signInWithEmailAndPassword(auth, email, senha)
        .then((userCredential) => {
            const user = userCredential.user;
            alert("✅ Login realizado com sucesso!");
            
            // Redireciona para a tela "Meus Restaurantes"
            window.location.href = "home.html";
        })
        .catch((error) => {
            const errorCode = error.code;

            if (errorCode === "auth/invalid-email") {
                alert("Erro: e-mail inválido.");
            } else if (errorCode === "auth/user-not-found") {
                alert("Erro: usuário não encontrado.");
            } else if (errorCode === "auth/wrong-password") {
                alert("Erro: senha incorreta.");
            } else {
                alert("Erro ao fazer login: " + error.message);
            }

            console.error("Erro no login:", error);
        })
        .finally(() => {
            entrarBtn.disabled = false;
            entrarBtn.textContent = "Entrar";
        });
}

// Adiciona evento ao botão
entrarBtn.addEventListener("click", handleLogin);
//autenticação automatica de login
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "home.html";
    }
});