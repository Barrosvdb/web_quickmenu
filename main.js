import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
// 1. IMPORTAR MÓDULOS DO FIRESTORE
import { 
    getFirestore, 
    doc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";


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

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const analytics = getAnalytics(app);
// Inicializar o Firestore
const db = getFirestore(app); 


// 2. Selecionar TODOS os elementos do HTML usando seus IDs
const nomeInput = document.getElementById("nome_cadastro"); // NOVO
const telefoneInput = document.getElementById("telefone_cadastro"); // NOVO
const cpfCnpjInput = document.getElementById("c_cadastro"); // NOVO

const emailInput = document.getElementById("email_cadastro");
const senhaInput = document.getElementById("senha_cadastro");
const confirmarSenhaInput = document.getElementById("confirmar_cadastro");
const criarCadastroBtn = document.getElementById("criar_cadastro");


// 3. Função para lidar com o cadastro
function handleCadastro() {
    // Coletar todos os valores
    const nome = nomeInput.value; // NOVO
    const telefone = telefoneInput.value; // NOVO
    const cpfCnpj = cpfCnpjInput.value; // NOVO
    
    const email = emailInput.value;
    const senha = senhaInput.value;
    const confirmar = confirmarSenhaInput.value;

    // Lógica básica de validação (mantida)
    if (senha !== confirmar) {
        alert("As senhas não coincidem!");
        return;
    }
    
    if (senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres!");
        return;
    }
    
    // 4. Criar o usuário no Firebase Authentication
    createUserWithEmailAndPassword(auth, email, senha)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // 5. SALVAR DADOS ADICIONAIS NO FIRESTORE
            const userRef = doc(db, "operadores", user.uid);
            
            return setDoc(userRef, {
                nome: nome,
                email: email, // Armazenamos o email aqui também por conveniência
                telefone: telefone,
                cpfCnpj: cpfCnpj,
                createdAt: new Date()
            });
        })
        .then(() => {
            // Se tudo (Auth e Firestore) deu certo
            alert("Usuário e dados adicionais cadastrados com sucesso!");
        })
        .catch((error) => {
            // Ocorreu um erro
            const errorCode = error.code;
            const errorMessage = error.message;

            if (errorCode === 'auth/email-already-in-use') {
                alert("Erro: Este e-mail já está em uso. Tente fazer login.");
            } else if (errorCode === 'auth/invalid-email') {
                alert("Erro: O formato do e-mail é inválido.");
            } else {
                alert("Erro ao cadastrar: " + errorMessage);
            }
            console.error("Erro de cadastro:", error);
        });
}


// 6. Adicionar um 'ouvinte' de evento ao botão
criarCadastroBtn.addEventListener("click", handleCadastro);