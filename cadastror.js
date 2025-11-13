// Importações Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { 
  getAuth, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// 🔧 Configuração Firebase
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

// Inicializações Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const analytics = getAnalytics(app);
const db = getFirestore(app); 

// ======== ELEMENTOS HTML ========
const nomeInput = document.getElementById("nome_loja");
const enderecoInput = document.getElementById("endereco_loja");
const descricaoInput = document.getElementById("descricao_loja");
const fileInput = document.getElementById("file-input");
const preview = document.getElementById("preview");
const previewImg = document.getElementById("preview-img");
const fileInfo = document.getElementById("file-info");
const removeBtn = document.getElementById("remove-btn");
const uploadArea = document.querySelector('.upload-area');
const cadastrarBtn = document.querySelector('.btn-submit');

// ======== CONFIG IMGBB ========
const IMGBB_API_KEY = "3b1fc0436f09d45aab3d2388edf3099e";

// ======== LOGIN CHECK ========
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Você precisa estar logado para cadastrar um restaurante.");
    window.location.href = "login.html";
  } else {
    console.log("Usuário autenticado:", user.uid);
  }
});

// ======== FUNÇÕES VISUAIS DA IMAGEM ========

function hideUploadText() {
  uploadArea.querySelector('p').style.display = 'none';
  uploadArea.querySelector('span').style.display = 'none';
  uploadArea.querySelector('svg').style.display = 'none';
}

function showUploadText() {
  uploadArea.querySelector('p').style.display = '';
  uploadArea.querySelector('span').style.display = '';
  uploadArea.querySelector('svg').style.display = '';
}

// Preview da imagem
fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = e => {
      previewImg.src = e.target.result;
      preview.style.display = 'flex';
      hideUploadText();
    };

    reader.readAsDataURL(file);
    fileInfo.textContent = file.name;
  }
});

// Remover imagem
removeBtn.addEventListener('click', () => {
  fileInput.value = '';
  preview.style.display = 'none';
  previewImg.src = '';
  fileInfo.textContent = '';
  showUploadText();
});

// ======== UPLOAD E CADASTRO ========

cadastrarBtn.addEventListener("click", async () => {
  const user = auth.currentUser;

  if (!user) {
    alert("Você precisa estar logado para cadastrar um restaurante.");
    return;
  }

  const nome = nomeInput.value.trim();
  const endereco = enderecoInput.value.trim();
  const descricao = descricaoInput.value.trim();

  if (!nome || !endereco) {
    alert("Preencha o nome e o endereço do restaurante.");
    return;
  }

  cadastrarBtn.disabled = true;
  cadastrarBtn.textContent = "Cadastrando...";

  try {
    let imageUrl = "";

    // Se o usuário adicionou imagem, envia para o ImgBB
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();

      const base64Image = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const formData = new FormData();
      formData.append("image", base64Image);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) throw new Error("Falha no upload da imagem para o ImgBB.");

      imageUrl = data.data.url;
    }

    // Salva o restaurante no Firestore, dentro do user
    await addDoc(collection(db, "users", user.uid, "restaurantes"), {
      nome,
      endereco,
      descricao,
      imageUrl,
      criadoEm: serverTimestamp(),
    });

    alert("Restaurante cadastrado com sucesso! ✅");

    // Reseta o formulário
    nomeInput.value = "";
    enderecoInput.value = "";
    descricaoInput.value = "";
    fileInput.value = "";
    preview.style.display = "none";
    showUploadText();

  } catch (error) {
    console.error("Erro ao cadastrar restaurante:", error);
    alert("Erro ao cadastrar restaurante. Veja o console.");
  } finally {
    cadastrarBtn.disabled = false;
    cadastrarBtn.textContent = "Cadastrar Restaurante";
  }
});
