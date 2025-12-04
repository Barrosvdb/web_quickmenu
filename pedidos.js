// ---------------------------------------------------------------
// IMPORTS DO FIREBASE
// ---------------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    onSnapshot,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ---------------------------------------------------------------
// CONFIGURAÇÃO FIREBASE
// ---------------------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyDXlJIJFQZJ85CBphkkDr-axP9-ufri7No",
    authDomain: "quickmenu-1234.firebasestorage.app",
    projectId: "quickmenu-1234",
    storageBucket: "quickmenu-1234.firebasestorage.app",
    messagingSenderId: "279494796257",
    appId: "1:279494796257:web:aae9121774efb0d7fae8a0",
    measurementId: "G-S457FE7BWM"
};

// Inicializações
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---------------------------------------------------------------
// CONSTANTES E ELEMENTOS
// ---------------------------------------------------------------
const params = new URLSearchParams(window.location.search);
const restauranteId = params.get("id");

if (!restauranteId) {
    pedidosContainer.innerHTML = `
        <div class="loading">
            <i class="fa-solid fa-exclamation-triangle"></i>
            <p>Erro: ID do restaurante não encontrado na URL</p>
            <p>Por favor, acesse a página de pedidos através do cardápio.</p>
        </div>
    `;
    throw new Error("ID do restaurante não encontrado na URL");
}

const pedidosContainer = document.getElementById('pedidos-container');
const filtroStatus = document.getElementById('filtro-status');
const btnAtualizar = document.getElementById('btn-atualizar');
const templateCard = document.getElementById('template-pedido-card');

// ---------------------------------------------------------------
// FUNÇÃO PARA BUSCAR PEDIDOS COM ORDENAÇÃO CORRETA
// ---------------------------------------------------------------
async function buscarPedidos() {
    try {
        // Limpa o container e mostra loading
        pedidosContainer.innerHTML = `
            <div class="loading">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <p>Carregando pedidos...</p>
            </div>
        `;

        const todosPedidos = [];
        
        // Busca todos os usuários
        const usuariosSnapshot = await getDocs(collection(db, "Usuario"));
        
        // Para cada usuário, busca seus pedidos
        for (const usuarioDoc of usuariosSnapshot.docs) {
            const usuarioId = usuarioDoc.id;
            const usuarioData = usuarioDoc.data();
            const nomeUsuario = usuarioData.nome || usuarioData.email || "Cliente";
            
            // Referência à coleção de pedidos do usuário
            const pedidosRef = collection(db, "Usuario", usuarioId, "Pedidos");
            
            // Busca pedidos do restaurante específico
            const q = query(pedidosRef, 
                where("idRestaurante", "==", restauranteId)
            );
            const pedidosSnapshot = await getDocs(q);
            
            // Para cada pedido, busca os itens
            for (const pedidoDoc of pedidosSnapshot.docs) {
                const pedidoData = pedidoDoc.data();
                const pedidoId = pedidoDoc.id;
                
                // Busca os itens do pedido
                const itensRef = collection(db, "Usuario", usuarioId, "Pedidos", pedidoId, "Itens");
                const itensSnapshot = await getDocs(itensRef);
                
                const itens = [];
                itensSnapshot.forEach(itemDoc => {
                    itens.push({
                        id: itemDoc.id,
                        ...itemDoc.data()
                    });
                });
                
                // Formata a data corretamente
                let dataFormatada = "Data não disponível";
                let timestamp = null;
                
                if (pedidoData.dataPedido) {
                    try {
                        // Tenta converter o timestamp do Firestore
                        if (pedidoData.dataPedido.toDate) {
                            const data = pedidoData.dataPedido.toDate();
                            dataFormatada = data.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                            timestamp = data.getTime();
                        } else if (pedidoData.dataPedido) {
                            // Tenta um campo alternativo (corrigindo typo)
                            const data = pedidoData.dataPedido.toDate ? 
                                pedidoData.dataPedido.toDate() : 
                                new Date(pedidoData.dataPedido);
                            dataFormatada = data.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            });
                            timestamp = data.getTime();
                        }
                    } catch (e) {
                        console.warn("Erro ao formatar data:", e);
                    }
                }
                
                // Adiciona o pedido à lista
                todosPedidos.push({
                    id: pedidoId,
                    usuarioId: usuarioId,
                    nomeUsuario: nomeUsuario,
                    ...pedidoData,
                    dataFormatada: dataFormatada,
                    timestamp: timestamp || 0, // Para ordenação
                    itens: itens
                });
            }
        }
        
        // ORDENAÇÃO: Primeiro por status (Ativo primeiro), depois por data (mais recente primeiro)
        todosPedidos.sort((a, b) => {
            // 1. Ordena por status: Ativo (0) vem antes de Encerrado (1)
            const statusA = a.status === "Ativo" ? 0 : 1;
            const statusB = b.status === "Ativo" ? 0 : 1;
            
            if (statusA !== statusB) {
                return statusA - statusB;
            }
            
            // 2. Se mesmo status, ordena por data (mais recente primeiro)
            return b.timestamp - a.timestamp;
        });
        
        // Exibe os pedidos
        exibirPedidos(todosPedidos);
        
    } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        pedidosContainer.innerHTML = `
            <div class="loading">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <p>Erro ao carregar pedidos. Tente novamente.</p>
                <p style="font-size: 12px; margin-top: 10px;">${error.message}</p>
            </div>
        `;
    }
}

// ---------------------------------------------------------------
// FUNÇÃO PARA EXIBIR PEDIDOS
// ---------------------------------------------------------------
function exibirPedidos(pedidos) {
    // Limpa o container
    pedidosContainer.innerHTML = '';
    
    // Filtra pedidos por status se necessário
    const statusFiltro = filtroStatus.value;
    const pedidosFiltrados = statusFiltro === 'todos' ? 
        pedidos : 
        pedidos.filter(pedido => pedido.status === statusFiltro);
    
    if (pedidosFiltrados.length === 0) {
        pedidosContainer.innerHTML = `
            <div class="loading">
                <i class="fa-solid fa-inbox"></i>
                <p>Nenhum pedido encontrado</p>
                <p style="font-size: 14px; margin-top: 10px;">
                    ${statusFiltro === 'Ativo' ? 
                        'Nenhum pedido aguardando retirada' : 
                        'Nenhum pedido retirado'}
                </p>
            </div>
        `;
        return;
    }
    
    // Cria os cards de pedido
    pedidosFiltrados.forEach(pedido => {
        const cardClone = templateCard.content.cloneNode(true);
        const pedidoCard = cardClone.querySelector('.pedido-card');
        
        // Define a classe baseada no status
        if (pedido.status === 'Encerrado') {
            pedidoCard.classList.add('encerrado');
        }
        
        // Preenche os dados
        cardClone.querySelector('.pedido-data').textContent = pedido.dataFormatada;
        
        const statusSpan = cardClone.querySelector('.pedido-status');
        // Ajusta o texto do status para ser mais amigável
        const statusText = pedido.status === 'Ativo' ? 'Aguardando Retirada' : 'Retirado';
        statusSpan.textContent = statusText;
        statusSpan.classList.add(pedido.status === 'Ativo' ? 'ativo' : 'retirado');
        
        cardClone.querySelector('.pedido-total').textContent = 
            pedido.precoTotal?.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }) || 'R$ 0,00';
        
        cardClone.querySelector('.cliente-nome').textContent = pedido.nomeUsuario;
        
        // Adiciona os itens
        const itensLista = cardClone.querySelector('.itens-lista');
        pedido.itens.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item-pedido';
            itemDiv.innerHTML = `
                ${item.imageUrl ? 
                    `<img src="${item.imageUrl}" alt="${item.nome}" class="item-imagem" 
                         onerror="this.src='https://via.placeholder.com/60x60/eee/666?text=${encodeURIComponent(item.nome?.charAt(0) || 'P')}'">` :
                    `<div class="item-imagem" style="background: #eee; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-utensils"></i>
                    </div>`
                }
                <div class="item-info">
                    <div class="item-nome">${item.nome || 'Produto sem nome'}</div>
                    <div class="item-quantidade">Quantidade: ${item.quantidade || 1}</div>
                </div>
            `;
            itensLista.appendChild(itemDiv);
        });
        
        // Configura o botão apenas para pedidos ativos
        const btnRetirado = cardClone.querySelector('.btn-retirado');
        
        if (pedido.status === 'Encerrado') {
            // Pedido já retirado - muda o botão
            btnRetirado.disabled = true;
            btnRetirado.classList.add('retirado');
            btnRetirado.innerHTML = '<i class="fa-solid fa-check-circle"></i> Pedido Retirado';
        } else {
            // Pedido ativo - adiciona evento
            btnRetirado.addEventListener('click', () => {
                marcarComoRetirado(pedido.usuarioId, pedido.id, pedidoCard);
            });
        }
        
        pedidosContainer.appendChild(cardClone);
    });
}

// ---------------------------------------------------------------
// FUNÇÃO PARA MARCAR PEDIDO COMO RETIRADO
// ---------------------------------------------------------------
async function marcarComoRetirado(usuarioId, pedidoId, pedidoCard) {
    if (!confirm("Confirmar que o pedido foi retirado pelo cliente?")) {
        return;
    }
    
    try {
        const pedidoRef = doc(db, "Usuario", usuarioId, "Pedidos", pedidoId);
        
        await updateDoc(pedidoRef, {
            status: "Encerrado",
            dataRetirada: new Date().toISOString() // Adiciona data da retirada
        });
        
        // Atualiza visualmente o card
        pedidoCard.classList.add('encerrado');
        
        // Atualiza o status
        const statusSpan = pedidoCard.querySelector('.pedido-status');
        statusSpan.textContent = 'Retirado';
        statusSpan.classList.remove('ativo');
        statusSpan.classList.add('retirado');
        
        // Atualiza o botão
        const btnRetirado = pedidoCard.querySelector('.btn-retirado');
        btnRetirado.disabled = true;
        btnRetirado.classList.add('retirado');
        btnRetirado.innerHTML = '<i class="fa-solid fa-check-circle"></i> Pedido Retirado';
        
        // Feedback para o usuário
        showNotification('✅ Pedido marcado como retirado!', 'success');
        
        // Se estiver filtrando apenas ativos, remove o card da lista
        if (filtroStatus.value === 'Ativo') {
            setTimeout(() => {
                pedidoCard.style.opacity = '0';
                pedidoCard.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    pedidoCard.remove();
                    
                    // Se não houver mais cards, mostra mensagem
                    if (pedidosContainer.children.length === 0) {
                        pedidosContainer.innerHTML = `
                            <div class="loading">
                                <i class="fa-solid fa-check-circle"></i>
                                <p>Todos os pedidos foram retirados!</p>
                            </div>
                        `;
                    }
                }, 300);
            }, 1000);
        }
        
    } catch (error) {
        console.error("Erro ao marcar pedido como retirado:", error);
        showNotification('❌ Erro ao marcar pedido como retirado', 'error');
    }
}

// ---------------------------------------------------------------
// FUNÇÃO PARA MOSTRAR NOTIFICAÇÃO
// ---------------------------------------------------------------
function showNotification(message, type = 'info') {
    // Remove notificação anterior se existir
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Cria nova notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Estilos da notificação
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // Cores baseadas no tipo
    if (type === 'success') {
        notification.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#f44336';
    } else {
        notification.style.backgroundColor = '#2196F3';
    }
    
    // Botão de fechar
    notification.querySelector('button').style.cssText = `
        background: transparent;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    `;
    
    document.body.appendChild(notification);
    
    // Remove automaticamente após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Adiciona os estilos de animação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ---------------------------------------------------------------
// INICIALIZAÇÃO E EVENT LISTENERS
// ---------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Verifica autenticação
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            showNotification("Você precisa estar logado para acessar os pedidos", "error");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } else {
            console.log("Usuário autenticado:", user.uid);
            buscarPedidos();
        }
    });
    
    // Atualiza os links da sidebar
    const currentParams = window.location.search;
    if (currentParams) {
        const sidebarLinks = document.querySelectorAll('.sidebar a');
        sidebarLinks.forEach(link => {
            let originalHref = link.getAttribute('href');
            if (originalHref && !originalHref.startsWith('http')) {
                link.href = originalHref + currentParams;
            }
        });
    }
    
    // Event listeners
    filtroStatus.addEventListener('change', buscarPedidos);
    btnAtualizar.addEventListener('click', buscarPedidos);
    
    // Atualiza automático a cada 30 segundos
    setInterval(buscarPedidos, 30000);
    
    // Adiciona evento de logout
    const logoutBtn = document.querySelector('.sidebar ul li:last-child');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                window.location.href = "login.html";
            });
        });
    }
});