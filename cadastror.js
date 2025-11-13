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

//seleção dos elementos html

const nomeInput = document.getElementById("nome_loja");
const endereçoInput = document.getElementById("Endereço_loja");
const descricaoInput = document.getElementById("descrição_loja");
