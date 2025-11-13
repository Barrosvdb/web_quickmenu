// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signOut
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

// Seleção dos elementos HTML
const nomeInput = document.getElementById("nome_loja");
const enderecoInput = document.getElementById("endereco_loja");
const descricaoInput = document.getElementById("descricao_loja");
const fileInput = document.getElementById('file-input');
const preview = document.getElementById('preview');
const previewImg = document.getElementById('preview-img');
const fileInfo = document.getElementById('file-info');
const removeBtn = document.getElementById('remove-btn');
const uploadArea = document.querySelector('.upload-area'); // área de texto

// Função para esconder o texto do upload
function hideUploadText() {
  uploadArea.querySelector('p').style.display = 'none';
  uploadArea.querySelector('span').style.display = 'none';
  uploadArea.querySelector('svg').style.display = 'none';
}

// Função para mostrar o texto do upload
function showUploadText() {
  uploadArea.querySelector('p').style.display = '';
  uploadArea.querySelector('span').style.display = '';
  uploadArea.querySelector('svg').style.display = '';
}

// Quando o usuário escolhe um arquivo
fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = e => {
      previewImg.src = e.target.result;
      preview.style.display = 'flex';
      hideUploadText(); // 🔥 esconde o texto ao adicionar imagem
    };

    reader.readAsDataURL(file);
    const fileType = file.type.split('/')[1] || 'desconhecido';
    fileInfo.textContent = `${file.name}`;
  }
});

// Quando o usuário clica em remover imagem
removeBtn.addEventListener('click', () => {
  fileInput.value = '';
  preview.style.display = 'none';
  previewImg.src = '';
  fileInfo.textContent = '';
  showUploadText(); // 🔥 mostra o texto novamente
});
