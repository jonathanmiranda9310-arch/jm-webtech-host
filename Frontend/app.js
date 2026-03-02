const API_URL = 'api.php';
let projetosLista = [];
let projetoAtualId = null;
let categoriaAtual = 'Game'; 
let isAdminLogado = false;
let isEditandoMontagem = false;
let isEditandoCodigo = false;
let galeriaAtual = [];

async function verificarSessaoAtiva() {
    try {
        const res = await fetch(`${API_URL}?action=check_auth`);
        if (res.ok) {
            const data = await res.json();
            if (data.logado) {
                isAdminLogado = true;
                document.getElementById('admin-status-area').innerHTML = `🟢 Bem-vindo, Admin! <span class="logout-link" onclick="fazerLogout()">Sair</span>`;
                document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
            }
        }
    } catch(e) {}
}
verificarSessaoAtiva();

async function buscarProjetosBackend() {
    try {
        const resposta = await fetch(API_URL);
        if (resposta.ok) {
            projetosLista = await resposta.json();
            renderizarPastas();
        }
    } catch (erro) {}
}
buscarProjetosBackend();

function mudarCategoria(novaCategoria, botaoClicado) {
    categoriaAtual = novaCategoria;
    document.getElementById('tab-game').classList.remove('active');
    document.getElementById('tab-maker').classList.remove('active');
    document.getElementById('tab-robotics').classList.remove('active');
    botaoClicado.classList.add('active');
    if(document.getElementById('search-input')) document.getElementById('search-input').value = '';
    renderizarPastas();
}

function renderizarPastas() {
    const grid = document.getElementById('main-folder-grid');
    let htmlHTML = '';

    const listaCategoria = projetosLista.filter(p => (p.categoria || 'Maker') === categoriaAtual);
    const termoBusca = document.getElementById('search-input') ? document.getElementById('search-input').value.toLowerCase() : '';
    const listaFiltrada = listaCategoria.filter(p => p.nome.toLowerCase().includes(termoBusca) || p.descricao.toLowerCase().includes(termoBusca));

    if (listaFiltrada && listaFiltrada.length > 0) {
        listaFiltrada.forEach(projeto => {
            htmlHTML += `
            <div class="folder-card" onclick="abrirProjeto('${projeto.id}')">
                <div class="folder-icon">📁</div>
                <h3 style="margin: 0; color: var(--royal-blue);">${projeto.nome}</h3>
                <span style="font-size: 0.8rem; opacity: 0.7; margin-top: 5px;">${projeto.descricao}</span>
            </div>`;
        });
    }

    const styleDisplay = isAdminLogado ? 'flex' : 'none';
    htmlHTML += `
    <div class="folder-card add-folder-btn admin-only" onclick="criarNovaPasta()" style="display: ${styleDisplay};">
        <div class="folder-icon" style="color: #ffaa00;">➕</div>
        <h3 style="margin: 0; color: #ffaa00;">Nova Pasta</h3>
        <span style="font-size: 0.8rem; opacity: 0.8; margin-top: 5px; color: #ffaa00;">(${categoriaAtual})</span>
    </div>`;

    grid.innerHTML = htmlHTML;
}

async function criarNovaPasta() {
    if (!isAdminLogado) { showNoPermissionModal(); return; }
    const nomeProjeto = prompt(`Digite o nome da Nova Pasta para ${categoriaAtual}:`);
    if (!nomeProjeto) return; 
    const descProjeto = prompt("Digite uma breve descrição:");

    try {
        const resposta = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ nome: nomeProjeto, descricao: descProjeto, categoria: categoriaAtual })
        });
        
        if (resposta.ok) {
             const projetoCriado = await resposta.json();
             projetosLista.push(projetoCriado);
             renderizarPastas();
        }
    } catch(e) {}
}

function abrirProjeto(id) {
    const projeto = projetosLista.find(p => String(p.id) === String(id));
    if (!projeto) return;
    
    projetoAtualId = projeto.id;
    
    document.getElementById('projeto-titulo-montagem').innerText = 'Montagem: ' + projeto.nome;
    document.getElementById('montagem-text-area').innerHTML = projeto.montagem || '<p>(passo a passo vazio)</p>';
    
    const blockCode = document.getElementById('codigo-cancela');
    blockCode.innerText = projeto.codigo || '// Sem código ainda';
    delete blockCode.dataset.highlighted; 
    if (typeof hljs !== 'undefined') hljs.highlightElement(blockCode);
    
    const imgElement = document.getElementById('project-image');
    const placeholder = document.getElementById('image-placeholder');
    
    if (projeto.imagem) {
        imgElement.src = projeto.imagem + '?t=' + new Date().getTime(); 
        imgElement.style.display = 'block';
        placeholder.style.display = 'none';
    } else {
        imgElement.src = '';
        imgElement.style.display = 'none';
        placeholder.style.display = 'inline';
    }

    if (projeto.categoria === 'Game') {
        document.getElementById('game-gallery-section').style.display = 'block';
        galeriaAtual = projeto.galeria ? JSON.parse(projeto.galeria) : [];
        renderizarGaleria();
    } else {
        document.getElementById('game-gallery-section').style.display = 'none';
        galeriaAtual = [];
    }
    
    if(isEditandoMontagem) toggleEditMontagem(true); 
    if(isEditandoCodigo) toggleEditCodigo(true);

    openTab({currentTarget: document.querySelectorAll('.tab-btn')[0]}, 'tab-montagem');
    navigateTo('page-project');
}

function renderizarGaleria() {
    const container = document.getElementById('gallery-container');
    container.innerHTML = '';
    galeriaAtual.forEach((imgSrc, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        const finalSrc = imgSrc.startsWith('data:image') ? imgSrc : (imgSrc + '?t=' + new Date().getTime());
        item.innerHTML = `
            <img src="${finalSrc}" alt="Screenshot ${index + 1}" onclick="window.open(this.src, '_blank')">
            <button class="delete-gallery-btn admin-only" onclick="removerDaGaleria(${index})" style="display: ${isEditandoMontagem && isAdminLogado ? 'flex' : 'none'};">X</button>
        `;
        container.appendChild(item);
    });
}

function removerDaGaleria(index) {
    galeriaAtual.splice(index, 1);
    renderizarGaleria();
}

function carregarGaleria(event) {
    const arquivos = event.target.files;
    for (let i = 0; i < arquivos.length; i++) {
        const leitor = new FileReader();
        leitor.onload = function(e) {
            galeriaAtual.push(e.target.result);
            renderizarGaleria();
        }
        leitor.readAsDataURL(arquivos[i]);
    }
}

async function salvarProjetoNoBackend(dadosAtualizados) {
    try {
        const urlEdit = `${API_URL}?id=${projetoAtualId}`;
        const projetoOriginal = projetosLista.find(p => String(p.id) === String(projetoAtualId));
        const dadosCompletos = { ...projetoOriginal, ...dadosAtualizados };

        const resposta = await fetch(urlEdit, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(dadosCompletos)
        });
        
        if (resposta.ok) {
            const dataServidor = await resposta.json();
            const index = projetosLista.findIndex(p => String(p.id) === String(projetoAtualId));
            if(index > -1) projetosLista[index] = dataServidor;

            if (dataServidor.categoria === 'Game') {
                galeriaAtual = dataServidor.galeria ? JSON.parse(dataServidor.galeria) : [];
                renderizarGaleria();
            }
        }
    } catch(e) {}
}

async function excluirProjetoAtual() {
    if (!isAdminLogado) { showNoPermissionModal(); return; }
    const confirmacao = confirm("⚠️ Tem certeza que deseja excluir esta pasta inteira? Essa ação não tem volta.");
    if (!confirmacao) return;

    try {
        const resposta = await fetch(`${API_URL}?id=${projetoAtualId}&action=delete`, {
            method: 'POST',
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });

        if (resposta.ok) {
            projetosLista = projetosLista.filter(p => String(p.id) !== String(projetoAtualId));
            renderizarPastas();
            navigateTo('page-folders');
        }
    } catch(e) {}
}

const canvas = document.getElementById('binary-canvas');
const ctx = canvas.getContext('2d');
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
const letters = '01';
const fontSize = 16;
let columns = Math.floor(canvas.width / fontSize);
let drops = [];
for (let x = 0; x < columns; x++) drops[x] = 1;

function drawMatrix() {
    const isLightMode = document.body.classList.contains('light-theme');
    ctx.fillStyle = isLightMode ? 'rgba(244, 246, 249, 0.15)' : 'rgba(5, 5, 5, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = isLightMode ? '#1e3094' : '#4deeea';
    ctx.font = fontSize + 'px monospace';

    if(drops.length < canvas.width / fontSize) {
        let oldLength = drops.length;
        columns = Math.floor(canvas.width / fontSize);
        for(let i = oldLength; i < columns; i++) drops[i] = 1;
    }

    for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}
setInterval(drawMatrix, 50);

async function processarLogin() {
    const emailInput = document.getElementById('loginEmail').value.trim();
    const senhaInput = document.getElementById('loginSenha').value.trim();
    const erroMsg = document.getElementById('errorMsg');

    try {
        const resposta = await fetch(`${API_URL}?action=login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ email: emailInput, senha: senhaInput })
        });

        if (resposta.ok) {
            erroMsg.style.display = 'none';
            closeAdminModal();
            isAdminLogado = true;
            
            document.getElementById('admin-status-area').innerHTML = `🟢 Bem-vindo, Admin! <span class="logout-link" onclick="fazerLogout()">Sair</span>`;
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginSenha').value = '';
            
            renderizarPastas(); 
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
        } else {
            const erroServidor = await resposta.json();
            erroMsg.innerText = "❌ " + (erroServidor.erro || "E-mail ou senha incorretos.");
            erroMsg.style.display = 'block';
        }
    } catch(e) {
        erroMsg.innerText = "❌ Erro de conexão com o servidor.";
        erroMsg.style.display = 'block';
    }
}

async function fazerLogout() {
    await fetch(`${API_URL}?action=logout`, { method: 'POST' });
    
    isAdminLogado = false;
    if(isEditandoMontagem) toggleEditMontagem(true);
    if(isEditandoCodigo) toggleEditCodigo(true);
    
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    document.getElementById('admin-status-area').innerHTML = `Você é admin? <span class="admin-link" onclick="openAdminModal()">Acesse com o login aqui</span>`;
    
    renderizarPastas();
}

const adminModal = document.getElementById('adminModal');
const noPermissionModal = document.getElementById('noPermissionModal');
function openAdminModal() { adminModal.classList.add('active'); document.getElementById('errorMsg').style.display = 'none'; }
function closeAdminModal() { adminModal.classList.remove('active'); }
function showNoPermissionModal() { noPermissionModal.classList.add('active'); }
function closeNoPermissionModal() { noPermissionModal.classList.remove('active'); }
window.onclick = function(event) { if (event.target == adminModal) closeAdminModal(); if (event.target == noPermissionModal) closeNoPermissionModal(); }

function toggleEditMontagem(forcarDesligar = false) {
    if (!isAdminLogado && !forcarDesligar) { showNoPermissionModal(); return; }

    const areaTexto = document.getElementById('montagem-text-area');
    const containerImagem = document.getElementById('image-container');
    const btn = document.getElementById('btn-edit-montagem');
    const btnGallery = document.getElementById('btn-add-gallery');

    isEditandoMontagem = forcarDesligar ? false : !isEditandoMontagem;

    if (isEditandoMontagem) {
        areaTexto.contentEditable = "true"; areaTexto.focus();
        btn.innerHTML = "💾 Salvar Passo a Passo"; btn.classList.add('saving');
        containerImagem.classList.add('editing-img');
        if (categoriaAtual === 'Game') btnGallery.style.display = 'inline-block';
        renderizarGaleria();
    } else {
        areaTexto.contentEditable = "false";
        btn.innerHTML = "✏️ Editar Passo a Passo"; btn.classList.remove('saving');
        containerImagem.classList.remove('editing-img');
        if (categoriaAtual === 'Game') btnGallery.style.display = 'none';
        
        const imgElement = document.getElementById('project-image');
        let imagemBase64 = imgElement.src;
        
        if (!imagemBase64 || imagemBase64 === window.location.href) {
            imagemBase64 = null;
        }
        
        if(isAdminLogado) {
            salvarProjetoNoBackend({ 
                montagem: areaTexto.innerHTML, 
                imagem: imagemBase64,
                galeria: galeriaAtual 
            });
        }
        renderizarGaleria();
    }
}

function toggleEditCodigo(forcarDesligar = false) {
    if (!isAdminLogado && !forcarDesligar) { showNoPermissionModal(); return; }

    const blocoCodigo = document.getElementById('codigo-cancela');
    const btn = document.getElementById('btn-edit-codigo');

    isEditandoCodigo = forcarDesligar ? false : !isEditandoCodigo;

    if (isEditandoCodigo) {
        blocoCodigo.contentEditable = "true"; blocoCodigo.focus();
        btn.innerHTML = "💾 Salvar Código"; btn.classList.add('saving');
        blocoCodigo.style.color = "var(--text-color)"; 
    } else {
        blocoCodigo.contentEditable = "false";
        btn.innerHTML = "✏️ Editar Código"; btn.classList.remove('saving');
        
        if(isAdminLogado) salvarProjetoNoBackend({ codigo: blocoCodigo.innerText });
        
        delete blocoCodigo.dataset.highlighted; 
        if (typeof hljs !== 'undefined') hljs.highlightElement(blocoCodigo);
    }
}

function tryEditImage() {
    if (!isAdminLogado) { showNoPermissionModal(); return; }
    if (!isEditandoMontagem) return; 
    document.getElementById('image-upload').click();
}

function carregarImagem(event) {
    const arquivo = event.target.files[0];
    if (arquivo) {
        const leitor = new FileReader();
        leitor.onload = function(e) {
            document.getElementById('project-image').src = e.target.result;
            document.getElementById('project-image').style.display = 'block';
            document.getElementById('image-placeholder').style.display = 'none'; 
        }
        leitor.readAsDataURL(arquivo);
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    document.getElementById('theme-btn').innerHTML = document.body.classList.contains('light-theme') ? '🌙 Modo Escuro' : '☀️ Modo Claro';
}

const btnStart = document.getElementById('btn-start');
const mascot = document.getElementById('mascot');
btnStart.addEventListener('mouseenter', () => { mascot.classList.remove('mascot-idle'); mascot.classList.add('mascot-active'); });
btnStart.addEventListener('mouseleave', () => { mascot.classList.remove('mascot-active'); mascot.classList.add('mascot-idle'); });

let lastMouseMoveTime = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastMouseMoveTime < 30) return;
    lastMouseMoveTime = now;
    if (!document.getElementById('page-home').classList.contains('active')) return;
    const pupilLeft = document.getElementById('pupil-left');
    const pupilRight = document.getElementById('pupil-right');

    function moveEye(pupil) {
        if (!pupil) return;
        const rect = pupil.getBoundingClientRect();
        const angle = Math.atan2(e.clientY - (rect.top + rect.height/2), e.clientX - (rect.left + rect.width/2));
        pupil.style.transform = `translate(${Math.cos(angle)*3}px, ${Math.sin(angle)*3}px)`;
    }
    moveEye(pupilLeft); moveEye(pupilRight);
});

function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openTab(evt, tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if(evt && evt.currentTarget) evt.currentTarget.classList.add('active');
}

let copyTimeout = null;
function copyCode(btn, codeId) {
    const text = document.getElementById(codeId).innerText;
    navigator.clipboard.writeText(text).then(() => {
        btn.innerText = "Copiado!"; btn.style.backgroundColor = "#4caf50";
        if (copyTimeout) clearTimeout(copyTimeout);
        copyTimeout = setTimeout(() => { btn.innerText = "Copiar"; btn.style.backgroundColor = "var(--royal-blue)"; copyTimeout = null; }, 2000);
    });
}