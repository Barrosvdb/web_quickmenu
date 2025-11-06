// cadastro.js

// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { 
getAuth, 
createUserWithEmailAndPassword,
signOut // Importação do signOut
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


// Seleção dos elementos do HTML
const nomeInput = document.getElementById("nome_cadastro");
const telefoneInput = document.getElementById("telefone_cadastro");
const cpfCnpjInput = document.getElementById("c_cadastro");
const emailInput = document.getElementById("email_cadastro");
const senhaInput = document.getElementById("senha_cadastro");
const confirmarSenhaInput = document.getElementById("confirmar_cadastro");
const criarCadastroBtn = document.getElementById("criar_cadastro");


// Função para cadastro
function handleCadastro(event) {
 // Impede envio automático do formulário, se houver
 event.preventDefault();

 // Desabilita o botão e altera o texto
 criarCadastroBtn.disabled = true;
 criarCadastroBtn.textContent = "Cadastrando...";

 // Coleta de dados
 const nome = nomeInput.value.trim();
 const telefone = telefoneInput.value.trim();
 const cpfCnpj = cpfCnpjInput.value.trim();
 const email = emailInput.value.trim();
 const senha = senhaInput.value;
 const confirmar = confirmarSenhaInput.value;

 // Validações básicas
if (senha !== confirmar) {
alert("As senhas não coincidem!");
criarCadastroBtn.disabled = false;
criarCadastroBtn.textContent = "Criar Cadastro";
return;
 }

if (senha.length < 6) {
alert("A senha deve ter pelo menos 6 caracteres!");
criarCadastroBtn.disabled = false;
criarCadastroBtn.textContent = "Criar Cadastro";
return;
}

 // Cria o usuário no Firebase Authentication
 createUserWithEmailAndPassword(auth, email, senha)
 .then((userCredential) => {
 const user = userCredential.user;
 const userRef = doc(db, "operadores", user.uid);

     // Salva dados adicionais no Firestore
     return setDoc(userRef, {
     nome: nome,
     email: email,
 telefone: telefone,
 cpfCnpj: cpfCnpj,
 createdAt: new Date()
 })
            //Desloga o usuário IMEDIATAMENTE após salvar os dados
    .then(() => {
return signOut(auth);
 });
 })
    .then(() => {
 alert("✅ Usuário cadastrado com sucesso! Por favor, faça login.");
            // Agora o usuário está deslogado e será redirecionado para o login,
            // onde ele precisará inserir as credenciais.
 window.location.href = "login.html";
 })
 .catch((error) => {
 const errorCode = error.code;

 if (errorCode === 'auth/email-already-in-use') {
 alert("Erro: Este e-mail já está em uso. Tente fazer login.");
 } else if (errorCode === 'auth/invalid-email') {
 alert("Erro: O formato do e-mail é inválido.");
 } else {
 alert("Erro ao cadastrar: " + error.message);
}

     console.error("Erro de cadastro:", error);
    })
     .finally(() => {
     // Reativa o botão
    criarCadastroBtn.disabled = false;
    criarCadastroBtn.textContent = "Criar Cadastro";
});
}


// Adiciona o evento ao botão
criarCadastroBtn.addEventListener("click", handleCadastro);