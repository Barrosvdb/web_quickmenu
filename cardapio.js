// ---------------------------------------------------------------
// IMPORTS DO FIREBASE
// ---------------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
    getFirestore,
    setDoc,
    doc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    orderBy,
    serverTimestamp,
    onSnapshot,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ---------------------------------------------------------------
// CONFIGURAÇÃO FIREBASE
// ---------------------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyDXlJIJFQZJ85CBphkkDr-axP9-ufri7No",
    authDomain: "quickmenu-1234.firebaseapp.com",
    projectId: "quickmenu-1234",
    storageBucket: "quickmenu-1234.firebasestorage.app",
    messagingSenderId: "279494796257",
    appId: "1:279494796257:web:aae9121774efb0d7fae8a0"
};

// Inicializações
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --------------------
// DEBUG / DEV helpers (cole logo após inicializar auth e db)
// Use somente para TESTES LOCAIS — NÃO deixar em produção.
// --------------------
const OPERADOR_DEFAULT = 'hBBhGaxHy1V5mtlBvXkXeXiREaw1';
const RESTAURANTE_DEFAULT = 'JpyZ7KWF1RWDbR02mG31';

// Expor para console (útil para testes)
// Note: as funções referenciadas aqui existem mais abaixo; a arrow function só será executada quando chamada.
window._QM_DEBUG = {
  db,
  auth,
  getUserId: () => userId,
  getRestauranteId: () => restauranteId,
  carregarCategorias: () => carregarCategorias().catch(e => console.error(e)),
  carregarRestaurante: () => carregarRestaurante().catch(e => console.error(e))
};

console.log('Firebase inicializado — debug pronto');

// Configuração ImgBB
const IMGBB_API_KEY = "3b1fc0436f09d45aab3d2388edf3099e";

// ---------------------------------------------------------------
// ELEMENTOS DO DOM
// ---------------------------------------------------------------
// Elementos do restaurante
const nomeRestauranteEl = document.getElementById('nome-restaurante');
const descricaoRestauranteEl = document.getElementById('descricao-restaurante');
const imageUploadEl = document.getElementById('image-upload');
const fileInputRest = document.getElementById('file-input');
const previewImg = document.getElementById('preview-img');
const uploadArea = document.getElementById('upload-area');
const removeImageBtn = document.getElementById('remove-image-btn');

// Elementos das categorias
const categoriasContainer = document.getElementById('categorias-container');
const btnAddCategoria = document.getElementById('btn-add-categoria');

// Elementos modal categoria
const modalCategoria = document.getElementById('modal-categoria');
const formCategoria = document.getElementById('form-categoria');
const inputNomeCategoria = document.getElementById('input-nome-categoria');
const btnFecharCategoria = document.getElementById('btn-fechar-categoria');
const btnCancelarCategoria = document.getElementById('btn-cancelar-categoria');
const btnSalvarCategoria = document.getElementById('btn-salvar-categoria');

// Elementos modal produto
const modalProduto = document.getElementById('modal-produto');
const formProduto = document.getElementById('form-produto');
const inputNomeProduto = document.getElementById('input-nome-produto');
const inputPrecoProduto = document.getElementById('input-preco-produto');
const inputDescricaoProduto = document.getElementById('input-descricao-produto');
const inputImagemProduto = document.getElementById('input-imagem-produto');
const previewImagemProduto = document.getElementById('preview-imagem-produto');
const previewAreaProduto = document.getElementById('preview-area-produto');
const btnRemoverImagemProduto = document.getElementById('btn-remover-imagem-produto');
const btnFecharProduto = document.getElementById('btn-fechar-produto');
const btnCancelarProduto = document.getElementById('btn-cancelar-produto');
const btnSalvarProduto = document.getElementById('btn-salvar-produto');
const areaUploadProduto = document.getElementById('area-upload-produto');

// Elementos de logout
const logoutBtn = document.getElementById('logout-btn');

// Variáveis globais
let userId = null;
let restauranteId = null;
let restauranteRef = null;
let categoriaAtualId = null;
let restauranteData = null;

// Cache de produtos
let cacheProdutos = new Map();

// ---------------------------------------------------------------
// FUNÇÕES DE UTILIDADE
// ---------------------------------------------------------------

// Upload de imagem para ImgBB
async function uploadToImgBB(file) {
    return new Promise(async (resolve, reject) => {
        try {
            const reader = new FileReader();
            
            reader.onload = async () => {
                const base64Image = reader.result.split(',')[1];
                
                const formData = new FormData();
                formData.append('image', base64Image);
                
                const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    resolve(data.data.url);
                } else {
                    reject(new Error('Falha no upload da imagem'));
                }
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        } catch (error) {
            reject(error);
        }
    });
}

// Formatar preço
function formatarPreco(preco) {
    return parseFloat(preco).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

// Validar imagem
function validarImagem(file) {
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const tamanhoMaximo = 5 * 1024 * 1024; // 5MB
    
    if (!tiposPermitidos.includes(file.type)) {
        throw new Error('Tipo de arquivo não permitido. Use JPG, PNG ou GIF.');
    }
    
    if (file.size > tamanhoMaximo) {
        throw new Error('Arquivo muito grande. O tamanho máximo é 5MB.');
    }
    
    return true;
}

// Exibir mensagem de erro
function exibirErro(elementId, mensagem) {
    const elemento = document.getElementById(elementId);
    elemento.textContent = mensagem;
    elemento.style.display = 'block';
}

// Limpar erro
function limparErro(elementId) {
    const elemento = document.getElementById(elementId);
    elemento.textContent = '';
    elemento.style.display = 'none';
}

// Validar formulário produto
function validarFormProduto() {
    let valido = true;
    
    limparErro('error-nome-produto');
    limparErro('error-preco-produto');
    limparErro('error-imagem-produto');
    
    if (!inputNomeProduto.value.trim()) {
        exibirErro('error-nome-produto', 'Nome do produto é obrigatório');
        valido = false;
    }
    
    if (!inputPrecoProduto.value || parseFloat(inputPrecoProduto.value) <= 0) {
        exibirErro('error-preco-produto', 'Preço inválido');
        valido = false;
    }
    
    if (!inputImagemProduto.files[0] && !previewImagemProduto.src) {
        exibirErro('error-imagem-produto', 'Imagem do produto é obrigatória');
        valido = false;
    }
    
    return valido;
}

// Carregar todos os produtos do restaurante (para cache)
async function carregarTodosProdutos() {
    try {
        const produtosRef = collection(db, 'operadores', userId, 'restaurantes', restauranteId, 'produtos');
        const querySnapshot = await getDocs(produtosRef);
        
        cacheProdutos.clear();
        querySnapshot.forEach((docSnap) => {
            const produto = docSnap.data();
            produto.id = docSnap.id;
            cacheProdutos.set(docSnap.id, produto);
        });
        
        console.log('cacheProdutos carregado:', cacheProdutos.size);
        return cacheProdutos;
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        return new Map();
    }
}

// Obter produtos de uma categoria específica (versão robusta)
async function obterProdutosDaCategoria(categoriaId) {
    try {
        const produtosCategoriaRef = collection(
            db, 
            'operadores', userId, 
            'restaurantes', restauranteId, 
            'categorias', categoriaId, 
            'produtosCategoria'
        );
        
        const querySnapshot = await getDocs(produtosCategoriaRef);
        const produtos = [];
        
        for (const docSnap of querySnapshot.docs) {
            const refData = docSnap.data();
            console.log('produtosCategoria doc:', docSnap.id, 'data:', refData);
            // Possíveis formatos:
            // A) { produtoId: 'abc' }
            // B) { nome, preco, ... } (produto embutido)
            // C) ID do doc é o produto (docSnap.id)
            const produtoId = refData.produtoId || refData.produtoID || null;

            if (produtoId) {
                if (cacheProdutos.has(produtoId)) {
                    produtos.push(cacheProdutos.get(produtoId));
                } else {
                    const produtoDoc = await getDoc(doc(db, 'operadores', userId, 'restaurantes', restauranteId, 'produtos', produtoId));
                    if (produtoDoc.exists()) {
                        const produto = produtoDoc.data();
                        produto.id = produtoDoc.id;
                        produtos.push(produto);
                        cacheProdutos.set(produtoId, produto);
                    } else {
                        // fallback: se o doc de produtosCategoria tiver os dados do produto
                        if (refData.nome) {
                            const produtoFromRef = {
                                id: docSnap.id,
                                nome: refData.nome,
                                preco: refData.preco,
                                descricao: refData.descricao,
                                imageUrl: refData.imageUrl
                            };
                            produtos.push(produtoFromRef);
                        } else {
                            console.warn(`produtoId ${produtoId} referenciado mas /produtos/${produtoId} não existe`);
                        }
                    }
                }
            } else if (refData.nome) {
                // produto armazenado diretamente no doc da categoria
                const produtoFromRef = {
                    id: docSnap.id,
                    nome: refData.nome,
                    preco: refData.preco,
                    descricao: refData.descricao,
                    imageUrl: refData.imageUrl
                };
                produtos.push(produtoFromRef);
                cacheProdutos.set(docSnap.id, produtoFromRef);
            } else {
                // tentar usar o id do doc como produtoId
                const possibleId = docSnap.id;
                if (cacheProdutos.has(possibleId)) {
                    produtos.push(cacheProdutos.get(possibleId));
                } else {
                    const produtoDoc = await getDoc(doc(db, 'operadores', userId, 'restaurantes', restauranteId, 'produtos', possibleId));
                    if (produtoDoc.exists()) {
                        const produto = produtoDoc.data();
                        produto.id = produtoDoc.id;
                        produtos.push(produto);
                        cacheProdutos.set(possibleId, produto);
                    } else {
                        console.warn('Formato inesperado em produtosCategoria:', docSnap.id, refData);
                    }
                }
            }
        }
        
        return produtos;
    } catch (error) {
        console.error('Erro ao obter produtos da categoria:', error);
        return [];
    }
}

// ---------------------------------------------------------------
// CARREGAMENTO DO RESTAURANTE
// ---------------------------------------------------------------
async function carregarRestaurante() {
    try {
        console.log('carregarRestaurante() chamado — params:', window.location.search);
        console.log('userId no início de carregarRestaurante =', userId);

        const params = new URLSearchParams(window.location.search);
        // Para DEV: você pode usar fallback, mas não recomendo em produção.
        // restauranteId = params.get('id') || RESTAURANTE_DEFAULT;
        restauranteId = params.get('id');

        if (!restauranteId || !userId) {
            // Se estiver em DEV e quiser evitar redirect, descomente as linhas de fallback no topo.
            console.warn('restauranteId ou userId falta — atual: ', { restauranteId, userId });
            window.location.href = 'home.html';
            return;
        }
        
        restauranteRef = doc(db, 'operadores', userId, 'restaurantes', restauranteId);
        const restauranteSnap = await getDoc(restauranteRef);
        
        if (!restauranteSnap.exists()) {
            alert('Restaurante não encontrado');
            window.location.href = 'home.html';
            return;
        }
        
        restauranteData = restauranteSnap.data();
        
        // Atualizar interface
        nomeRestauranteEl.textContent = restauranteData.nome || 'Nome do Restaurante';
        descricaoRestauranteEl.value = restauranteData.descricao || '';
        
        if (restauranteData.imageUrl) {
            previewImg.src = restauranteData.imageUrl;
            previewImg.style.display = 'block';
            uploadArea.style.display = 'none';
            removeImageBtn.style.display = 'block';
            imageUploadEl.querySelector('.image-wrapper').classList.add('has-image');
        }
        
        // Carregar cache de produtos
        await carregarTodosProdutos();
        
        // Carregar categorias
        await carregarCategorias();
        
    } catch (error) {
        console.error('Erro ao carregar restaurante:', error);
        alert('Erro ao carregar dados do restaurante');
    }
}

// ---------------------------------------------------------------
// GERENCIAMENTO DE IMAGEM DO RESTAURANTE
// ---------------------------------------------------------------
imageUploadEl.addEventListener('click', () => {
    fileInputRest.click();
});

fileInputRest.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    try {
        validarImagem(file);
        
        // Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            uploadArea.style.display = 'none';
            removeImageBtn.style.display = 'block';
            imageUploadEl.querySelector('.image-wrapper').classList.add('has-image');
        };
        reader.readAsDataURL(file);
        
        // Upload para ImgBB
        const imageUrl = await uploadToImgBB(file);
        
        // Atualizar no Firestore
        await updateDoc(restauranteRef, {
            imageUrl: imageUrl,
        });
        
        alert('Foto do restaurante atualizada com sucesso!');
        
    } catch (error) {
        alert(error.message);
        fileInputRest.value = '';
    }
});

removeImageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Não permitir remover - apenas substituir
    alert('Não é possível remover a foto do restaurante. Clique na imagem para substituí-la.');
});

// Autosave da descrição do restaurante
let timeoutDescricao;
descricaoRestauranteEl.addEventListener('input', () => {
    clearTimeout(timeoutDescricao);
    
    timeoutDescricao = setTimeout(async () => {
        if (restauranteRef) {
            try {
                await updateDoc(restauranteRef, {
                    descricao: descricaoRestauranteEl.value,
                });
            } catch (error) {
                console.error('Erro ao salvar descrição:', error);
            }
        }
    }, 1000);
});

// ---------------------------------------------------------------
// GERENCIAMENTO DE CATEGORIAS
// ---------------------------------------------------------------
async function carregarCategorias() {
    try {
        categoriasContainer.innerHTML = '<div class="loading active">Carregando categorias...</div>';
        
        console.log('Buscando categorias em:', `operadores/${userId}/restaurantes/${restauranteId}/categorias`);
        const categoriasRef = collection(db, 'operadores', userId, 'restaurantes', restauranteId, 'categorias');
        const q = query(categoriasRef, orderBy('criadaEm', 'desc'));
        const querySnapshot = await getDocs(q);
        
        categoriasContainer.innerHTML = '';
        
        if (querySnapshot.empty) {
            categoriasContainer.innerHTML = `
                <div class="categoria-item placeholder">
                    <p>Nenhuma categoria cadastrada. Clique em "Adicionar Categoria" para começar.</p>
                </div>
            `;
            return;
        }
        
        for (const docSnap of querySnapshot.docs) {
            const categoria = docSnap.data();
            categoria.id = docSnap.id;
            
            // Obter produtos desta categoria
            const produtos = await obterProdutosDaCategoria(categoria.id);
            
            const categoriaHTML = criarHTMLCategoria(categoria, produtos);
            categoriasContainer.appendChild(categoriaHTML);
        }

        console.log('Categorias carregadas:', querySnapshot.docs.length);
        
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        categoriasContainer.innerHTML = '<p class="error">Erro ao carregar categorias</p>';
    }
}

function criarHTMLCategoria(categoria, produtos) {
    const div = document.createElement('div');
    div.className = 'categoria-item';
    div.dataset.categoriaId = categoria.id;
    
    div.innerHTML = `
        <div class="categoria-header">
            <h3 class="nome-categoria">${categoria.nome}</h3>
            <div class="categoria-actions">
                <button class="btn-editar-categoria" data-id="${categoria.id}">
                    <i class="fa-solid fa-edit"></i> Editar
                </button>
                <button class="btn-excluir-categoria" data-id="${categoria.id}">
                    <i class="fa-solid fa-trash"></i> Excluir
                </button>
            </div>
        </div>
        <div class="produtos-container" id="produtos-${categoria.id}">
            ${produtos.length > 0 ? produtos.map(produto => criarHTMLProduto(produto, categoria.id)).join('') : ''}
            <button class="btn-add-produto" data-categoria-id="${categoria.id}">
                <i class="fa-solid fa-plus"></i> Adicionar Produto
            </button>
        </div>
    `;
    
    return div;
}

function criarHTMLProduto(produto, categoriaId) {
    return `
        <div class="produto-item" data-produto-id="${produto.id}" data-categoria-id="${categoriaId}">
            <div class="produto-imagem">
                <img src="${produto.imageUrl || ''}" alt="${produto.nome || ''}" onerror="this.src='https://via.placeholder.com/80?text=Sem+Imagem'">
            </div>
            <div class="produto-info">
                <h4 class="produto-nome">${produto.nome || 'Sem nome'}</h4>
                <p class="produto-descricao">${produto.descricao || 'Sem descrição'}</p>
                <p class="produto-preco">${produto.preco !== undefined ? formatarPreco(produto.preco) : ''}</p>
            </div>
            <div class="produto-actions">
                <button class="btn-editar-produto" data-id="${produto.id}">
                    <i class="fa-solid fa-edit"></i>
                </button>
                <button class="btn-excluir-produto" data-id="${produto.id}" data-categoria-id="${categoriaId}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// ---------------------------------------------------------------
// MODAL CATEGORIA
// ---------------------------------------------------------------
btnAddCategoria.addEventListener('click', () => {
    inputNomeCategoria.value = '';
    limparErro('error-nome-categoria');
    modalCategoria.showModal();
});

btnFecharCategoria.addEventListener('click', () => {
    modalCategoria.close();
});

btnCancelarCategoria.addEventListener('click', () => {
    modalCategoria.close();
});

formCategoria.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nomeCategoria = inputNomeCategoria.value.trim();
    
    if (!nomeCategoria) {
        exibirErro('error-nome-categoria', 'Nome da categoria é obrigatório');
        return;
    }
    
    try {
        btnSalvarCategoria.disabled = true;
        btnSalvarCategoria.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
        
        const categoriasRef = collection(db, 'operadores', userId, 'restaurantes', restauranteId, 'categorias');
        
        await addDoc(categoriasRef, {
            nome: nomeCategoria,
            criadaEm: serverTimestamp()
        });
        
        modalCategoria.close();
        await carregarCategorias();
        
        alert('Categoria criada com sucesso!');
        
    } catch (error) {
        console.error('Erro ao criar categoria:', error);
        alert('Erro ao criar categoria. Tente novamente.');
    } finally {
        btnSalvarCategoria.disabled = false;
        btnSalvarCategoria.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Categoria';
    }
});

// ---------------------------------------------------------------
// MODAL PRODUTO
// ---------------------------------------------------------------
// Abrir modal de produto
document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-add-produto')) {
        const categoriaId = e.target.closest('.btn-add-produto').dataset.categoriaId;
        categoriaAtualId = categoriaId;
        
        // Limpar formulário
        formProduto.reset();
        previewImagemProduto.style.display = 'none';
        previewAreaProduto.style.display = 'flex';
        btnRemoverImagemProduto.style.display = 'none';
        limparErro('error-nome-produto');
        limparErro('error-preco-produto');
        limparErro('error-imagem-produto');
        
        modalProduto.showModal();
    }
});

// Upload de imagem do produto
areaUploadProduto.addEventListener('click', () => {
    inputImagemProduto.click();
});

inputImagemProduto.addEventListener('change', (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    try {
        validarImagem(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImagemProduto.src = e.target.result;
            previewImagemProduto.style.display = 'block';
            previewAreaProduto.style.display = 'none';
            btnRemoverImagemProduto.style.display = 'block';
            limparErro('error-imagem-produto');
        };
        reader.readAsDataURL(file);
        
    } catch (error) {
        alert(error.message);
        inputImagemProduto.value = '';
    }
});

btnRemoverImagemProduto.addEventListener('click', (e) => {
    e.stopPropagation();
    previewImagemProduto.style.display = 'none';
    previewAreaProduto.style.display = 'flex';
    btnRemoverImagemProduto.style.display = 'none';
    inputImagemProduto.value = '';
});

btnFecharProduto.addEventListener('click', () => {
    modalProduto.close();
});

btnCancelarProduto.addEventListener('click', () => {
    modalProduto.close();
});

formProduto.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Verificação de segurança: Se não tiver categoria selecionada, não pode salvar
    if (!categoriaAtualId) {
        alert("Erro: Nenhuma categoria selecionada para vincular o produto.");
        return;
    }

    if (!validarFormProduto()) return;
    
    try {
        btnSalvarProduto.disabled = true;
        btnSalvarProduto.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
        
        let imageUrl = '';
        
        if (inputImagemProduto.files[0]) {
            imageUrl = await uploadToImgBB(inputImagemProduto.files[0]);
        }
        
        // --- 1. Criar o produto na coleção MESTRE de produtos ---
        const produtosRef = collection(db, 'operadores', userId, 'restaurantes', restauranteId, 'produtos');
        
        const novoProdutoRef = await addDoc(produtosRef, {
            nome: inputNomeProduto.value.trim(),
            preco: parseFloat(inputPrecoProduto.value),
            descricao: inputDescricaoProduto.value.trim(),
            imageUrl: imageUrl,
            criadaEm: serverTimestamp()
        });
        
        // --- 2. Criar o vínculo na categoria (Usando o ID do produto) ---
        
        // Referência da coleção onde vai ficar o vínculo
        const produtosCategoriaRef = collection(
            db, 
            'operadores', userId, 
            'restaurantes', restauranteId, 
            'categorias', categoriaAtualId, 
            'produtosCategoria'
        );
        
        // AQUI ESTÁ A MÁGICA:
        // Criamos uma referência de Documento forçando o ID a ser igual ao ID do produto criado acima (novoProdutoRef.id)
        const docRef = doc(produtosCategoriaRef, novoProdutoRef.id);

        // Usamos setDoc para escrever nesse local exato
        await setDoc(docRef, {
            criadaEm: serverTimestamp()
             // Não precisa gravar produtoId como campo, pois o ID do documento JÁ É o produtoId
        });
        
        // --- 3. Atualizar cache local e UI ---
        const novoProduto = {
            id: novoProdutoRef.id,
            nome: inputNomeProduto.value.trim(),
            preco: parseFloat(inputPrecoProduto.value),
            descricao: inputDescricaoProduto.value.trim(),
            imageUrl: imageUrl
        };
        cacheProdutos.set(novoProdutoRef.id, novoProduto);
        
        modalProduto.close();
        await carregarCategorias();
        
        alert('Produto criado com sucesso!');
        
    } catch (error) {
        console.error('Erro detalhado:', error); // Isso ajuda a ver o erro real no console (F12)
        alert('Erro ao criar produto: ' + error.message);
    } finally {
        btnSalvarProduto.disabled = false;
        btnSalvarProduto.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Produto';
    }
});

// ---------------------------------------------------------------
// DELEGATION DE EVENTOS PARA EDIÇÃO/EXCLUSÃO
// ---------------------------------------------------------------
categoriasContainer.addEventListener('click', async (e) => {
    // Editar categoria
    if (e.target.closest('.btn-editar-categoria')) {
        const categoriaId = e.target.closest('.btn-editar-categoria').dataset.id;
        // Implementar edição de categoria
        alert('Funcionalidade de edição de categoria em desenvolvimento');
    }
    
    // Excluir categoria
    if (e.target.closest('.btn-excluir-categoria')) {
        const categoriaId = e.target.closest('.btn-excluir-categoria').dataset.id;
        
        if (confirm('Tem certeza que deseja excluir esta categoria? Esta ação removerá apenas a categoria, os produtos permanecerão disponíveis.')) {
            try {
                // 1. Excluir a categoria
                const categoriaRef = doc(db, 'operadores', userId, 'restaurantes', restauranteId, 'categorias', categoriaId);
                await deleteDoc(categoriaRef);
                
                // 2. Excluir todos os documentos da coleção produtosCategoria desta categoria
                const produtosCategoriaRef = collection(categoriaRef, 'produtosCategoria');
                const produtosCategoriaSnapshot = await getDocs(produtosCategoriaRef);
                
                const batch = writeBatch(db);
                produtosCategoriaSnapshot.forEach((docSnap) => {
                    batch.delete(docSnap.ref);
                });
                await batch.commit();
                
                // Recarregar categorias
                await carregarCategorias();
                
                alert('Categoria excluída com sucesso!');
            } catch (error) {
                console.error('Erro ao excluir categoria:', error);
                alert('Erro ao excluir categoria.');
            }
        }
    }
    
    // Editar produto
    if (e.target.closest('.btn-editar-produto')) {
        const produtoId = e.target.closest('.btn-editar-produto').dataset.id;
        // Implementar edição de produto
        alert('Funcionalidade de edição de produto em desenvolvimento');
    }
    
    // Excluir produto de uma categoria específica
    if (e.target.closest('.btn-excluir-produto')) {
        const produtoId = e.target.closest('.btn-excluir-produto').dataset.id;
        const categoriaId = e.target.closest('.btn-excluir-produto').dataset.categoriaId;
        
        if (confirm('Deseja remover este produto desta categoria?')) {
            try {
                // 1. Encontrar a referência na coleção produtosCategoria
                const produtosCategoriaRef = collection(
                    db, 
                    'operadores', userId, 
                    'restaurantes', restauranteId, 
                    'categorias', categoriaId, 
                    'produtosCategoria'
                );
                
                const q = query(produtosCategoriaRef, where('produtoId', '==', produtoId));
                const querySnapshot = await getDocs(q);
                
                if (querySnapshot.empty) {
                    alert('Produto não encontrado nesta categoria');
                    return;
                }
                
                // 2. Excluir a referência
                const batch = writeBatch(db);
                querySnapshot.forEach((docSnap) => {
                    batch.delete(docSnap.ref);
                });
                await batch.commit();
                
                // Recarregar categorias
                await carregarCategorias();
                
                alert('Produto removido da categoria com sucesso!');
                
            } catch (error) {
                console.error('Erro ao remover produto da categoria:', error);
                alert('Erro ao remover produto da categoria.');
            }
        }
    }
});

// ---------------------------------------------------------------
// LOGOUT
// ---------------------------------------------------------------
logoutBtn.addEventListener('click', async () => {
    if (confirm('Deseja realmente sair?')) {
        try {
            await signOut(auth);
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    }
});

// ---------------------------------------------------------------
// VERIFICAÇÃO DE AUTENTICAÇÃO
// ---------------------------------------------------------------
// Substitua o bloco onAuthStateChanged original por este (para debug/dev)
onAuthStateChanged(auth, (user) => {
    console.log('onAuthStateChanged -> user:', user);
    if (user) {
        userId = user.uid;
        console.log('Usuário autenticado. userId =', userId);
        carregarRestaurante();
    } else {
        console.warn('Nenhum usuário autenticado. ativando fallback DEV (apenas para teste).');
        // Fallback DEV — FORÇAR IDs (remova em produção)
        userId = OPERADOR_DEFAULT;
        // restauranteId será obtido dentro de carregarRestaurante() a partir da query string,
        // mas se quiser forçar também:
        // restauranteId = RESTAURANTE_DEFAULT;
        carregarRestaurante();
        // NÃO redirecionar para login durante debug
        // window.location.href = 'login.html';
    }
});

// Adicionar parâmetros de ID aos links do sidebar
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (id) {
        document.querySelectorAll('.sidebar a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.includes('?')) {
                link.href = `${href}?id=${id}`;
            }
        });
    }
});
