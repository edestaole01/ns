const predefinedRisks = [
    { tipo: "FÍSICO", codigoEsocial: "02.01.001", perigo: "Exposição a ruído contínuo e intermitente", danos: "Diminuição gradual da audição, cansaço, irritação, zumbido, fadiga, surdez" },
    { tipo: "FÍSICO", codigoEsocial: "02.01.002", perigo: "Vibrações localizadas (mão-braço)", danos: "lesões musculares, problemas nas articulações, fadiga muscular." },
    { tipo: "FÍSICO", codigoEsocial: "02.01.003", perigo: "Vibração de corpo inteiro (aceleração resultante de exposição normalizada - aren)", danos: "" },
    { tipo: "FÍSICO", codigoEsocial: "02.01.004", perigo: "Vibração de corpo inteiro (Valor da Dose de Vibração Resultante - VDVR)", danos: "" },
    { tipo: "FÍSICO", codigoEsocial: "02.01.005", perigo: "Trabalhos com perfuratrizes e marteletes pneumáticos", danos: "" },
    { tipo: "FÍSICO", codigoEsocial: "02.01.006", perigo: "Radiações ionizantes", danos: "" },
    { tipo: "FÍSICO", codigoEsocial: "-", perigo: "Exposição a radiações não ionizantes", danos: "Queimaduras" },
    { tipo: "FÍSICO", codigoEsocial: "-", perigo: "Exposição a frio intenso", danos: "Congelamento" },
    { tipo: "FÍSICO", codigoEsocial: "02.01.014", perigo: "Trabalhos com exposição ao calor acima dos limites de tolerância estabelecidos na NR-15, da Portaria 3.214/1978", danos: "Desidratação" },
    { tipo: "FÍSICO", codigoEsocial: "02.01.015", perigo: "Pressão atmosférica anormal", danos: "lesões musculares, problemas nas articulações, fadiga muscular." },
    { tipo: "FÍSICO", codigoEsocial: "02.01.016", perigo: "Trabalhos em caixões ou câmaras hiperbáricas", danos: "Lombalgias, lesões musculares, prblemas nas articulações, fadiga muscular." },
    { tipo: "FÍSICO", codigoEsocial: "02.01.017", perigo: "Trabalhos em tubulões ou túneis sob ar comprimido", danos: "" },
    { tipo: "FÍSICO", codigoEsocial: "02.01.018", perigo: "Operações de mergulho com o uso de escafandros ou outros equipamentos", danos: "" },
    { tipo: "FÍSICO", codigoEsocial: "-", perigo: "Exposição à umidade, locais alagados.", danos: "Doenças respiratórias" },
    { tipo: "FÍSICO", codigoEsocial: "-", perigo: "Exposição a ruído contínuo e intermitente no transito", danos: "Diminuição gradual da audição, cansaço, irritação, zumbido, fadiga, surdez" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Inalação de fumos metálicos", danos: "Doenças respiratórias" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Inalação de poeiras", danos: "Doenças respiratórias" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Graxas, oleos", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Inalação de fibras", danos: "Doenças respiratórias" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Inalação de névoa", danos: "Doenças respiratórias, Queimaduras Químicas" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Lubrificantes", danos: "Dermatites de contato, irritação de mucosas" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Inalação de gases", danos: "Queimaduras Químicas, Doenças respiratórias" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Inalação de vapores", danos: "Doenças respiratórias, Queimaduras Químicas" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Contato da derme com substâncias compostos ou produtos químicos em geral", danos: "Dermatoses, Queimadura química" },
    { tipo: "QUÍMICO", codigoEsocial: "01.01.001", perigo: "Arsênio e seus compostos", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.02.001", perigo: "Asbestos (ou amianto)", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.03.001", perigo: "Benzeno e seus compostos tóxicos", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.03.002", perigo: "Estireno (vinilbenzeno)", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.04.001", perigo: "Berílio e seus compostos tóxicos", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.05.001", perigo: "Bromo e seus compostos tóxicos", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.06.001", perigo: "Cádmio e seus compostos tóxicos", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.07.001", perigo: "Carvão mineral e seus derivados", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.08.001", perigo: "Chumbo e seus compostos tóxicos", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.09.001", perigo: "Cloro e seus compostos tóxicos", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.18.001", perigo: "Sílica livre", danos: "" },
    { tipo: "BIOLÓGICO", codigoEsocial: "-", perigo: "Exposição a agentes microbiológicos (vírus, fungos, bactérias, protozoários, parasitas)", danos: "Doenças decorrentes de contaminação" },
    { tipo: "BIOLÓGICO", codigoEsocial: "03.01.001", perigo: "AGENTES BIOLÓGICOS; Trabalhos em estabelecimentos de saúde", danos: "" },
    { tipo: "BIOLÓGICO", codigoEsocial: "03.01.002", perigo: "AGENTES BIOLÓGICOS; Trabalhos com animais infectados", danos: "" },
    { tipo: "BIOLÓGICO", codigoEsocial: "03.01.007", perigo: "AGENTES BIOLÓGICOS; Coleta e industrialização do lixo", danos: "" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Esforço físico intenso", danos: "Lombalgias, lesões musculares, fadiga, Distensão muscular" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Levantamento e transporte manual de peso", danos: "Dores musculares, Lombalgia" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Postura,Torcendo toalha (Wash Rag)", danos: "Dores musculares" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Postura, Cotovelos para fora (Elbows out)", danos: "Dores musculares" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Postura, Ombros muito alto/muito baixo (Shoulder too high / too low)", danos: "Dores musculares" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Trabalho em turno e noturno", danos: "Stress físico e/ou psíquico" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Jornada de trabalho prolongada", danos: "Stress físico e/ou psíquico" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Monotonia", danos: "Stress físico e/ou psíquico" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Postura sentado por longos períodos", danos: "Desconforto, lombalgias, lesões, dores musculares" },
    { tipo: "ERGONÔMICO", codigoEsocial: "", perigo: "Iluminação inadequada ou deficiente", danos: "Fadiga visual" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Movimentos repetitivos", danos: "DORT" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Posturas incômodas ou pouco confortáveis", danos: "Lombalgias, lesões musculares" },
    { tipo: "ERGONÔMICO PSICOSSOCIAIS", codigoEsocial: "-", perigo: "Estresse", danos: "Fagida, estresse e distúrbios" },
    { tipo: "ERGONÔMICO PSICOSSOCIAIS", codigoEsocial: "-", perigo: "Carga de trabalho excessiva", danos: "Fagida, estresse e distúrbios" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Contato com eletricidade", danos: "Choque elétrico, quimaduras, parada cardíaca, morte" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Escorregão e queda", danos: "Lesões por quedas / torções" },
    { tipo: "ACIDENTE", codigoEsocial: "", perigo: "Contato com partes móveis de equipamentos", danos: "Corte, contusão, esmagamento, morte, Amputações" },
    { tipo: "ACIDENTE", codigoEsocial: "", perigo: "Explosão", danos: "queimadura/morte" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Queda de materiais de difente nível", danos: "Escoriações, faturas, entorse, contusões" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Contato com arestas pérfuro-cortantes", danos: "Lesões, corte contuso, lacerações" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Projeção de partículas, partes, peças", danos: "Cortes, Lesão nos olhos" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Incêndio", danos: "Perdas materiais, lesões, queimaduras e morte" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Ataque de animais peçonhentos ou insetos", danos: "Envenenamento / Ferimento" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Atropelamento, batidas, acidentes", danos: "Perda material, fraturas, escoriações, morte" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Prensagem", danos: "Lesões / Fraturas, Morte" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Queda de diferente nível menor ou igual a dois metros", danos: "Escoriações, fraturas, entorses, contusões" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Espaço Confinado (falta de Ventilação adequada ou deficiência de oxigênio)", danos: "Asfixia" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Queda maior que dois metros de altura", danos: "Escoriações, fraturas, entorses, contusões, morte" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Queimadura", danos: "Lesões de pele, infecções" }
];

let db;
let wizardStep = 0;
let currentInspection = {};
let activeDepartamentoIndex = -1;
let activeCargoIndex = -1;
let editingIndex = -1;
let editingType = null;
let currentGroupId = null;
let activeFuncionarioIndex = -1;
let autosaveTimer = null;
let isAutosaving = false;

// Garantir que nenhum reconhecimento de voz inicie automaticamente
window.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Aplicação carregada. Reconhecimento de voz desativado por padrão.');
});

// Detectar status de conexão
let isOnline = navigator.onLine;

function updateNetworkStatus() {
    const indicator = document.getElementById('network-status');
    if (!indicator) return;
    
    if (isOnline) {
        // Hide online indicator after a few seconds to be less intrusive
        indicator.className = 'network-status online';
        indicator.textContent = '🌐 Online';
        indicator.style.opacity = '1';
        setTimeout(() => { if(indicator.classList.contains('online')) indicator.style.opacity = '0'; }, 3000);
    } else {
        indicator.className = 'network-status offline';
        indicator.textContent = '📴 Offline';
        indicator.style.opacity = '1';
    }
}

window.addEventListener('online', () => {
    isOnline = true;
    updateNetworkStatus();
    showToast('✅ Conexão restaurada! Salvando dados...', 'success');
    if (currentInspection && currentInspection.id) {
        performAutosave();
    }
});

window.addEventListener('offline', () => {
    isOnline = false;
    updateNetworkStatus();
    showToast('⚠️ Modo offline ativo. Dados serão salvos localmente.', 'warning');
});

const request = indexedDB.open("fluentInspecoesDB", 1);
request.onerror = (e) => console.error("Erro no DB:", e);
request.onsuccess = (e) => { 
    db = e.target.result; 
    showDashboard(); 
    updateNetworkStatus();
};
request.onupgradeneeded = (e) => e.target.result.createObjectStore("inspections", { keyPath: "id", autoIncrement: true });

const dashboardView = document.getElementById('dashboard-view');
const wizardView = document.getElementById('wizard-view');
const actionPlanView = document.getElementById('action-plan-view');

document.getElementById('nav-dashboard').onclick = showDashboard;

function fillRiscoForm(selectedIndex) {
    if (selectedIndex === "") {
        document.getElementById("risco-esocial").value = "";
        document.getElementById("risco-perigo").value = "";
        document.getElementById("risco-danos").value = "";
        return;
    }
    
    const risk = predefinedRisks[parseInt(selectedIndex)];
    if (!risk) return;
    
    document.getElementById("risco-tipo").value = risk.tipo.replace(' PSICOSSOCIAIS', '');
    document.getElementById("risco-esocial").value = risk.codigoEsocial || "";
    document.getElementById("risco-perigo").value = risk.perigo || "";
    document.getElementById("risco-danos").value = risk.danos || "";
    
    showToast("Campos preenchidos com base no risco pré-definido.", "success");
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showView(viewName) {
    // Parar reconhecimento de voz ao trocar de view
    if (currentRecognition && isRecording) {
        const activeButton = document.querySelector('button.active[data-target]');
        stopRecognition(activeButton);
    }
    
    dashboardView.classList.add('hidden');
    wizardView.classList.add('hidden');
    actionPlanView.classList.add('hidden');
    
    if (viewName === 'dashboard') dashboardView.classList.remove('hidden');
    else if (viewName === 'wizard') wizardView.classList.remove('hidden');
    else if (viewName === 'actionPlan') actionPlanView.classList.remove('hidden');
}

function persistCurrentInspection(callback) {
    if (!db || !currentInspection || !currentInspection.empresa) {
        if (callback) callback(false);
        return;
    }
    currentInspection.updatedAt = new Date().toISOString();
    
    const transaction = db.transaction(["inspections"], "readwrite");
    const store = transaction.objectStore("inspections");
    const request = store.put(currentInspection);
    request.onsuccess = (event) => {
        if (!currentInspection.id) currentInspection.id = event.target.result;
        console.log("Inspeção salva com sucesso no DB. ID:", currentInspection.id);
        if (callback) callback(true);
    };
    request.onerror = (event) => {
        console.error("Erro ao persistir inspeção:", event.target.error);
        showToast("Erro ao salvar dados no banco de dados!", "error");
        if (callback) callback(false);
    };
}

function startNewInspection() {
    const now = new Date().toISOString();
    currentInspection = { 
        departamentos: [],
        createdAt: now,
        updatedAt: now
    };
    wizardStep = 0;
    showWizard();
}

function showDashboard() {
    showView('dashboard');
    loadInspections();
    updateDashboardStats();
}

function showWizard() {
    showView('wizard');
    renderWizardStep();
}

function updateDashboardStats() {
    if (!db) return;
    getAllInspections(inspections => {
        let totalDepartamentos = 0, totalCargos = 0, totalRiscos = 0;
        inspections.forEach(insp => {
            totalDepartamentos += (insp.departamentos || []).length;
            (insp.departamentos || []).forEach(dept => {
                totalCargos += (dept.cargos || []).length + (dept.funcionarios || []).length;
                (dept.cargos || []).forEach(cargo => totalRiscos += (cargo.riscos || []).length);
                (dept.funcionarios || []).forEach(func => totalRiscos += (func.riscos || []).length);
                (dept.grupos || []).forEach(grupo => {
                    totalCargos += (grupo.listaDeCargos || []).length;
                    totalRiscos += (grupo.riscos || []).length;
                });
            });
        });
        document.getElementById('stat-total').textContent = inspections.length;
        document.getElementById('stat-departamentos').textContent = totalDepartamentos;
        document.getElementById('stat-cargos').textContent = totalCargos;
        document.getElementById('stat-riscos').textContent = totalRiscos;
    });
}

function renderWizardStep() {
    editingIndex = -1;
    editingType = null;
    updateProgressBar();
    renderWizardHeader();
    document.getElementById('wizard-content').innerHTML = '';
    switch (wizardStep) {
        case 0: renderEmpresaStep(); break;
        case 1: renderDepartamentoStep(); break;
        case 2: renderCargoFuncionarioStep(); break;
        case 3: renderRiscoStep(); break;
    }
}

function nextStep() { wizardStep++; renderWizardStep(); }
function prevStep() { wizardStep--; renderWizardStep(); }

function updateProgressBar() {
    const steps = ['empresa', 'departamento', 'cargo', 'risco'];
    const totalSteps = steps.length;
    const progressBar = document.querySelector('.progress-bar');
    if (!progressBar) return;

    document.querySelectorAll('.progress-bar li').forEach(li => {
        li.classList.remove('active', 'completed');
    });

    for (let i = 0; i < totalSteps; i++) {
        const stepElement = document.getElementById(`step-${steps[i]}`);
        if (i < wizardStep) {
            stepElement.classList.add('completed');
        } else if (i === wizardStep) {
            stepElement.classList.add('active');
        }
    }

    const progressPercentage = wizardStep > 0 ? (wizardStep / (totalSteps - 1)) * 100 : 0;
    
    if (window.innerWidth <= 768) {
        progressBar.style.setProperty('--after-height', `${progressPercentage}%`);
        progressBar.style.setProperty('--after-width', '3px');
    } else {
        progressBar.style.setProperty('--after-width', `${progressPercentage}%`);
        progressBar.style.setProperty('--after-height', '4px');
    }
}

function renderWizardHeader() {
    const h = document.getElementById('wizard-header-container');
    if (wizardStep > 0) {
        h.innerHTML = `
            <div class="wizard-header">
                <h2>${currentInspection.id ? 'Editando' : 'Nova'} Inspeção: ${currentInspection.empresa?.nome || ''}</h2>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span id="autosave-status" style="color: var(--gray-500); font-size: 0.85rem; transition: all 0.3s ease; opacity: 0;"></span>
                    <button class="secondary" onclick="saveAndExit()">Salvar e Voltar</button>
                </div>
            </div>`;
    } else {
        h.innerHTML = '';
    }
}

function renderEmpresaStep() {
    const e = currentInspection.empresa || {};
    document.getElementById('wizard-content').innerHTML = `
        <div class="card">
            <h2>Passo 1: Detalhes da Empresa</h2>
            <form id="empresa-form" oninput="triggerAutosave()">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="nome">Nome da Empresa *</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" id="nome" required value="${e.nome || ''}" placeholder="Ex: Acme Corporation" style="flex-grow: 1;">
                            <button type="button" class="outline" onclick="toggleRecognition(this)" data-target="nome" title="Ativar ditado por voz">
                                <i class="bi bi-mic-fill"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="cnpj">CNPJ</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" id="cnpj" value="${e.cnpj || ''}" placeholder="00.000.000/0000-00" style="flex-grow: 1;">
                            <button type="button" class="outline" onclick="toggleRecognition(this)" data-target="cnpj" title="Ativar ditado por voz">
                                <i class="bi bi-mic-fill"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="form-grid">
                    <div class="form-group"><label for="data">Data da Inspeção</label><input type="date" id="data" value="${e.data || new Date().toISOString().slice(0,10)}"></div>
                    <div class="form-group">
                        <label for="elaborado">Elaborado por</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" id="elaborado" value="${e.elaborado || ''}" placeholder="Nome do responsável" style="flex-grow: 1;">
                            <button type="button" class="outline" onclick="toggleRecognition(this)" data-target="elaborado" title="Ativar ditado por voz">
                                <i class="bi bi-mic-fill"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="aprovado">Aprovado por</label>
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="text" id="aprovado" value="${e.aprovado || ''}" placeholder="Nome do aprovador" style="flex-grow: 1;">
                        <button type="button" class="outline" onclick="toggleRecognition(this)" data-target="aprovado" title="Ativar ditado por voz">
                            <i class="bi bi-mic-fill"></i>
                        </button>
                    </div>
                </div>
            </form>
            <div class="wizard-nav"><button class="nav" onclick="showDashboard()">Voltar ao Painel</button><button class="primary" onclick="saveEmpresaAndNext()">Salvar e Próximo</button></div>
        </div>`;
}

function saveEmpresaAndNext() {
    currentInspection.empresa = { nome: document.getElementById("nome").value, cnpj: document.getElementById("cnpj").value, data: document.getElementById("data").value, elaborado: document.getElementById("elaborado").value, aprovado: document.getElementById("aprovado").value };
    if (!currentInspection.empresa.nome) return showToast("O nome da empresa é obrigatório.", "error");
    persistCurrentInspection((success) => { if(success) { showToast("Dados da empresa salvos!", "success"); nextStep(); } });
}

function renderDepartamentoStep() {
    document.getElementById('wizard-content').innerHTML = `
        <div class="card">
            <div class="breadcrumb">Empresa: <strong>${currentInspection.empresa.nome}</strong></div>
            <h3>Departamentos Adicionados <small style="font-weight: 400; color: var(--gray-500);">(Arraste para reordenar)</small></h3>
            <ul id="departamento-list" class="item-list"></ul>
            <h3 id="depto-form-title">Novo Departamento</h3>
            <form id="depto-form">
                <div class="form-group"><label for="depto-nome">Nome do Setor/Departamento *</label><input type="text" id="depto-nome" required placeholder="Ex: Produção, Administrativo"></div>
                <div class="form-group"><label for="depto-caracteristica">Característica do Setor</label><input type="text" id="depto-caracteristica" placeholder="Ex: Área industrial"></div>
                <div class="form-group"><label for="depto-descricao">Descrição da Atividade do Setor</label><textarea id="depto-descricao" rows="3" placeholder="Descreva as principais atividades..."></textarea></div>
                <div class="form-actions">
                    <button type="button" class="primary" id="save-depto-btn" onclick="saveDepartamento()">Adicionar</button>
                    <button type="button" id="cancel-depto-edit-btn" class="nav hidden" onclick="clearDeptoForm()">Cancelar</button>
                </div>
            </form>
            <div class="wizard-nav"><button class="nav" onclick="prevStep()">Voltar</button></div>
        </div>`;
    updateDepartamentoList();
    setTimeout(() => initializeSortableLists(), 0);
}

function updateDepartamentoList() {
    const list = document.getElementById("departamento-list");
    if (!currentInspection.departamentos || currentInspection.departamentos.length === 0) { list.innerHTML = '<li class="empty-state">Nenhum departamento adicionado.</li>'; return; }
    list.innerHTML = "";
    currentInspection.departamentos.forEach((depto, index) => {
        const li = document.createElement("li");
        li.dataset.id = index;
        li.innerHTML = `<div class="item-info"><strong>${depto.nome}</strong><small>${depto.caracteristica || "Sem característica"}</small></div><div class="item-actions">
            <button class="outline" onclick="editDepartamento(${index})">Editar</button>
            <button class="outline" onclick="duplicateDepartamento(${index})"><i class="bi bi-copy"></i> Duplicar</button>
            <button class="danger" onclick="deleteDepartamento(${index})">Excluir</button>
            <button class="primary" onclick="goToCargos(${index})">Cargos/Func.</button>
        </div>`;
        list.appendChild(li);
    });
}

function saveDepartamento() {
    const deptoData = {
        nome: document.getElementById("depto-nome").value,
        caracteristica: document.getElementById("depto-caracteristica").value,
        descricao: document.getElementById("depto-descricao").value
    };
    if (!deptoData.nome) {
        return showToast("O nome do departamento é obrigatório.", "error");
    }
    if (editingIndex > -1) {
        const deptoToUpdate = currentInspection.departamentos[editingIndex];
        deptoToUpdate.nome = deptoData.nome;
        deptoToUpdate.caracteristica = deptoData.caracteristica;
        deptoToUpdate.descricao = deptoData.descricao;
        showToast("Departamento atualizado!", "success");
    } else {
        if (!currentInspection.departamentos) currentInspection.departamentos = [];
        deptoData.cargos = [];
        deptoData.funcionarios = [];
        deptoData.grupos = [];
        currentInspection.departamentos.push(deptoData);
        showToast("Departamento adicionado!", "success");
    }
    clearDeptoForm();
    updateDepartamentoList();
    persistCurrentInspection();
}

function editDepartamento(index) {
    editingIndex = index; const depto = currentInspection.departamentos[index];
    document.getElementById("depto-nome").value = depto.nome;
    document.getElementById("depto-caracteristica").value = depto.caracteristica;
    document.getElementById("depto-descricao").value = depto.descricao;
    document.getElementById("depto-form-title").innerText = "Editando Departamento";
    document.getElementById("save-depto-btn").innerHTML = "Salvar Alterações";
    document.getElementById("cancel-depto-edit-btn").classList.remove("hidden");
    document.getElementById("depto-nome").focus();
}

function deleteDepartamento(index) {
    if (confirm(`Excluir o departamento "${currentInspection.departamentos[index].nome}"?`)) {
        currentInspection.departamentos.splice(index, 1);
        showToast("Departamento excluído!", "success");
        updateDepartamentoList();
        persistCurrentInspection();
    }
}

function clearDeptoForm() {
    editingIndex = -1;
    document.getElementById("depto-form").reset();
    document.getElementById("depto-form-title").innerText = "Novo Departamento";
    document.getElementById("save-depto-btn").innerHTML = "Adicionar";
    document.getElementById("cancel-depto-edit-btn").classList.add("hidden");
}

function goToCargos(index) {
    activeDepartamentoIndex = index;
    nextStep();
}

function getFormFieldsHTML(prefix) {
    return `
        <fieldset><legend>Observação para os Cargos</legend>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
                <label style="display: flex; align-items: center; gap: 0.5rem;"><input type="checkbox" id="${prefix}-obs-altura"> Trabalho em altura</label>
                <label style="display: flex; align-items: center; gap: 0.5rem;"><input type="checkbox" id="${prefix}-obs-espaco"> Espaço Confinado</label>
                <label style="display: flex; align-items: center; gap: 0.5rem;"><input type="checkbox" id="${prefix}-obs-empilhadeira"> Operação de Empilhadeira</label>
                <label style="display: flex; align-items: center; gap: 0.5rem;"><input type="checkbox" id="${prefix}-obs-eletricidade"> Trabalho com Eletricidade</label>
                <label style="display: flex; align-items: center; gap: 0.5rem;"><input type="checkbox" id="${prefix}-obs-movimentacao"> Movimentação manual de cargas</label>
                <label style="display: flex; align-items: center; gap: 0.5rem;"><input type="checkbox" id="${prefix}-obs-talhas"> Operação de Talhas</label>
                <label style="display: flex; align-items: center; gap: 0.5rem;"><input type="checkbox" id="${prefix}-obs-paleteiras"> Operação de paleteiras</label>
                <label style="display: flex; align-items: center; gap: 0.5rem;"><input type="checkbox" id="${prefix}-obs-veiculos"> Condução de Veículos</label>
            </div>
        </fieldset>
        <div class="form-group"><label for="${prefix}-perfil-exposicao">Observação específica (Perfil de Exposição)</label><textarea id="${prefix}-perfil-exposicao" rows="2" placeholder="Ex: A soma da exposição ao agente FRD em todos os períodos de acesso é de ___ min..."></textarea></div>
        <div class="form-group"><label for="${prefix}-descricao-atividade">Descrição Atividade por função</label><select id="${prefix}-descricao-atividade"><option value="Sim">Sim</option><option value="Não">Não</option></select></div>
        <fieldset><legend>Atendimento aos requisitos das NR-06 e NR-01</legend>
            <div class="radio-group-container">
                <div class="radio-group-item">
                    <span>Medida de Proteção:</span>
                    <input type="radio" id="${prefix}-req-medida-sim" name="${prefix}-req-medida" value="Sim" checked><label for="${prefix}-req-medida-sim">S</label>
                    <input type="radio" id="${prefix}-req-medida-nao" name="${prefix}-req-medida" value="Não"><label for="${prefix}-req-medida-nao">N</label>
                </div>
                <div class="radio-group-item">
                    <span>Condição de Funcionamento do EPI:</span>
                    <input type="radio" id="${prefix}-req-condicao-sim" name="${prefix}-req-condicao" value="Sim" checked><label for="${prefix}-req-condicao-sim">S</label>
                    <input type="radio" id="${prefix}-req-condicao-nao" name="${prefix}-req-condicao" value="Não"><label for="${prefix}-req-condicao-nao">N</label>
                </div>
                <div class="radio-group-item">
                    <span>Prazo de Validade do EPI:</span>
                    <input type="radio" id="${prefix}-req-prazo-sim" name="${prefix}-req-prazo" value="Sim" checked><label for="${prefix}-req-prazo-sim">S</label>
                    <input type="radio" id="${prefix}-req-prazo-nao" name="${prefix}-req-prazo" value="Não"><label for="${prefix}-req-prazo-nao">N</label>
                </div>
                <div class="radio-group-item">
                    <span>Periodicidade da Troca do EPI:</span>
                    <input type="radio" id="${prefix}-req-periodicidade-sim" name="${prefix}-req-periodicidade" value="Sim" checked><label for="${prefix}-req-periodicidade-sim">S</label>
                    <input type="radio" id="${prefix}-req-periodicidade-nao" name="${prefix}-req-periodicidade" value="Não"><label for="${prefix}-req-periodicidade-nao">N</label>
                </div>
                <div class="radio-group-item">
                    <span>Higienização do EPI:</span>
                    <input type="radio" id="${prefix}-req-higienizacao-sim" name="${prefix}-req-higienizacao" value="Sim" checked><label for="${prefix}-req-higienizacao-sim">S</label>
                    <input type="radio" id="${prefix}-req-higienizacao-nao" name="${prefix}-req-higienizacao" value="Não"><label for="${prefix}-req-higienizacao-nao">N</label>
                </div>
            </div>
        </fieldset>
        <fieldset><legend>Classificações e Dados</legend>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
                <label style="display: flex; align-items: center; gap: 0.5rem;"><input type="checkbox" id="${prefix}-insalubre"> Insalubre (NR15)</label>
                <label style="display: flex; align-items: center; gap: 0.5rem;"><input type="checkbox" id="${prefix}-perigoso"> Perigoso (NR16)</label>
                <label style="display: flex; align-items: center; gap: 0.5rem;"><input type="checkbox" id="${prefix}-nho01"> NHO 01</label>
                <label style="display: flex; align-items: center; gap: 0.5rem;"><input type="checkbox" id="${prefix}-ltcat"> DADOS PARA LTCAT</label>
            </div>
        </fieldset>
    `;
}

function renderCargoFuncionarioStep() {
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    if (!depto.grupos) depto.grupos = [];
    if (!depto.cargos) depto.cargos = [];
    if (!depto.funcionarios) depto.funcionarios = [];
    document.getElementById('wizard-content').innerHTML = `
        <div class="card">
            <div class="breadcrumb">${currentInspection.empresa.nome} › <strong>${depto.nome}</strong></div>
            <h3>Grupos de Cargos <small style="font-weight: 400; color: var(--gray-500);">(Arraste para reordenar)</small></h3>
            <ul id="grupo-list" class="item-list"></ul>
            <details id="grupo-form-details" class="accordion-section">
                <summary>Adicionar Novo Grupo</summary>
                <div>
                    <form id="grupo-form">
                        <div class="form-group"><label for="grupo-nomes">Nomes dos Cargos do Grupo (um por linha) *</label><textarea id="grupo-nomes" rows="4" placeholder="Motorista A\nMotorista B" required></textarea><small>Cargos em um grupo compartilham os mesmos riscos e detalhes.</small></div>
                        ${getFormFieldsHTML('grupo')}
                        <div class="form-actions">
                            <button type="button" class="primary" id="save-grupo-btn" onclick="saveGrupo()">Criar Grupo</button>
                            <button type="button" class="nav hidden" id="cancel-grupo-edit-btn" onclick="clearForm('grupo')">Cancelar</button>
                        </div>
                    </form>
                </div>
            </details>
            <h3 style="margin-top: 2rem;">Cargos Individuais <small style="font-weight: 400; color: var(--gray-500);">(Arraste para reordenar)</small></h3>
            <ul id="cargo-list" class="item-list"></ul>
            <details id="cargo-form-details" class="accordion-section">
                <summary>Adicionar Novo Cargo Individual</summary>
                <div>
                    <form id="cargo-form">
                        <div class="form-group"><label for="cargo-nome">Nome do Cargo *</label><input type="text" id="cargo-nome" required></div>
                        ${getFormFieldsHTML('cargo')}
                        <div class="form-actions">
                            <button type="button" class="primary" id="save-cargo-btn" onclick="saveCargo()">Adicionar Cargo</button>
                            <button type="button" class="nav hidden" id="cancel-cargo-edit-btn" onclick="clearForm('cargo')">Cancelar</button>
                        </div>
                    </form>
                </div>
            </details>
            <h3 style="margin-top: 2rem;">Funcionários Individuais <small style="font-weight: 400; color: var(--gray-500);">(Arraste para reordenar)</small></h3>
            <ul id="funcionario-list" class="item-list"></ul>
            <details id="funcionario-form-details" class="accordion-section">
                <summary>Adicionar Novo Funcionário Individual</summary>
                <div>
                    <form id="funcionario-form">
                        <div class="form-group"><label for="funcionario-nome">Nome do Funcionário *</label><input type="text" id="funcionario-nome" required></div>
                         ${getFormFieldsHTML('funcionario')}
                        <div class="form-actions">
                            <button type="button" class="primary" id="save-funcionario-btn" onclick="saveFuncionario()">Adicionar Funcionário</button>
                            <button type="button" class="nav hidden" id="cancel-funcionario-edit-btn" onclick="clearForm('funcionario')">Cancelar</button>
                        </div>
                    </form>
                </div>
            </details>
            <div class="wizard-nav"><button class="nav" onclick="prevStep()">Voltar</button></div>
        </div>`;
    updateAllLists();
    setTimeout(() => initializeSortableLists(), 0);
}

function updateAllLists() {
    updateCargoList();
    updateGrupoList();
    updateFuncionarioList();
}

function updateCargoList() {
    const list = document.getElementById("cargo-list"), depto = currentInspection.departamentos[activeDepartamentoIndex];
    if (!depto.cargos || depto.cargos.length === 0) { list.innerHTML = '<li class="empty-state">Nenhum cargo individual.</li>'; return; }
    list.innerHTML = "";
    depto.cargos.forEach((cargo, index) => {
        const li = document.createElement("li");
        li.dataset.id = index;
        const obsText = (cargo.observacoes || []).length > 0 ? (cargo.observacoes || []).slice(0, 2).join(', ') + ((cargo.observacoes || []).length > 2 ? '...' : '') : 'Sem observações';
        li.innerHTML = `<div class="item-info"><strong>${cargo.nome}</strong><small>${(cargo.riscos || []).length} risco(s) | ${obsText}</small></div><div class="item-actions">
            <button class="outline" onclick="editCargo(${index})">Editar</button>
            <button class="outline" onclick="duplicateCargo(${index})"><i class="bi bi-copy"></i> Duplicar</button>
            <button class="danger" onclick="deleteCargo(${index})">Excluir</button>
            <button class="primary" onclick="goToRiscos(${index}, 'cargo')">Riscos</button>
        </div>`;
        list.appendChild(li);
    });
}

function updateGrupoList() {
    const list = document.getElementById("grupo-list"), depto = currentInspection.departamentos[activeDepartamentoIndex];
    if (!depto.grupos || depto.grupos.length === 0) { list.innerHTML = '<li class="empty-state">Nenhum grupo.</li>'; return; }
    list.innerHTML = "";
    depto.grupos.forEach((grupo, index) => {
        const li = document.createElement("li");
        li.dataset.id = index;
        li.innerHTML = `<div class="item-info"><strong>Grupo: ${grupo.listaDeCargos.join(', ')}</strong><small>${(grupo.riscos || []).length} risco(s)</small></div><div class="item-actions">
            <button class="outline" onclick="editGrupo(${index})">Editar</button>
            <button class="outline" onclick="duplicateGrupo(${index})"><i class="bi bi-copy"></i> Duplicar</button>
            <button class="danger" onclick="deleteGrupo(${index})">Excluir</button>
            <button class="primary" onclick="goToRiscos(${index}, 'grupo')">Riscos</button>
        </div>`;
        list.appendChild(li);
    });
}

function updateFuncionarioList() {
    const list = document.getElementById("funcionario-list"), depto = currentInspection.departamentos[activeDepartamentoIndex];
    if (!depto.funcionarios || depto.funcionarios.length === 0) { list.innerHTML = '<li class="empty-state">Nenhum funcionário individual.</li>'; return; }
    list.innerHTML = "";
    depto.funcionarios.forEach((func, index) => {
        const li = document.createElement("li");
        li.dataset.id = index;
        const obsText = (func.observacoes || []).length > 0 ? (func.observacoes || []).slice(0, 2).join(', ') + '...' : 'Sem observações';
        li.innerHTML = `<div class="item-info"><strong>${func.nome}</strong><small>${(func.riscos || []).length} risco(s) | ${obsText}</small></div><div class="item-actions">
            <button class="outline" onclick="editFuncionario(${index})">Editar</button>
            <button class="outline" onclick="duplicateFuncionario(${index})"><i class="bi bi-copy"></i> Duplicar</button>
            <button class="danger" onclick="deleteFuncionario(${index})">Excluir</button>
            <button class="primary" onclick="goToRiscos(${index}, 'funcionario')">Riscos</button>
        </div>`;
        list.appendChild(li);
    });
}

function collectFormData(prefix) {
    const observacoes = [];
    if (document.getElementById(`${prefix}-obs-altura`).checked) observacoes.push("Trabalho em altura");
    if (document.getElementById(`${prefix}-obs-espaco`).checked) observacoes.push("Espaço Confinado");
    if (document.getElementById(`${prefix}-obs-empilhadeira`).checked) observacoes.push("Operação de Empilhadeira");
    if (document.getElementById(`${prefix}-obs-eletricidade`).checked) observacoes.push("Trabalho com Eletricidade");
    if (document.getElementById(`${prefix}-obs-movimentacao`).checked) observacoes.push("Movimentação manual de cargas");
    if (document.getElementById(`${prefix}-obs-talhas`).checked) observacoes.push("Operação de Talhas");
    if (document.getElementById(`${prefix}-obs-paleteiras`).checked) observacoes.push("Operação de paleteiras");
    if (document.getElementById(`${prefix}-obs-veiculos`).checked) observacoes.push("Condução de Veículos");
    const dadosLtcat = [];
    if (document.getElementById(`${prefix}-insalubre`).checked) dadosLtcat.push("Insalubre (NR15)");
    if (document.getElementById(`${prefix}-perigoso`).checked) dadosLtcat.push("Perigoso (NR16)");
    if (document.getElementById(`${prefix}-nho01`).checked) dadosLtcat.push("NHO 01");
    if (document.getElementById(`${prefix}-ltcat`).checked) dadosLtcat.push("DADOS PARA LTCAT");
    return {
        observacoes,
        perfilExposicao: document.getElementById(`${prefix}-perfil-exposicao`).value,
        descricaoAtividade: document.getElementById(`${prefix}-descricao-atividade`).value,
        requisitosNR: {
            medida: document.querySelector(`input[name="${prefix}-req-medida"]:checked`).value,
            condicao: document.querySelector(`input[name="${prefix}-req-condicao"]:checked`).value,
            prazo: document.querySelector(`input[name="${prefix}-req-prazo"]:checked`).value,
            periodicidade: document.querySelector(`input[name="${prefix}-req-periodicidade"]:checked`).value,
            higienizacao: document.querySelector(`input[name="${prefix}-req-higienizacao"]:checked`).value
        },
        dadosLtcat
    };
}

function saveCargo() {
    const nome = document.getElementById("cargo-nome").value.trim();
    if (!nome) return showToast("O nome do cargo é obrigatório.", "error");
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    if (!depto.cargos) depto.cargos = [];
    const cargoData = { nome, ...collectFormData('cargo'), riscos: editingIndex > -1 && editingType === 'cargo' ? depto.cargos[editingIndex].riscos : [] };
    if (editingIndex > -1 && editingType === 'cargo') {
        depto.cargos[editingIndex] = cargoData;
        showToast("Cargo atualizado!", "success");
    } else {
        depto.cargos.push(cargoData);
        showToast("Cargo adicionado!", "success");
    }
    clearForm('cargo');
    updateCargoList();
    persistCurrentInspection();
}

function saveFuncionario() {
    const nome = document.getElementById("funcionario-nome").value.trim();
    if (!nome) return showToast("O nome do funcionário é obrigatório.", "error");
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    if (!depto.funcionarios) depto.funcionarios = [];
    const funcionarioData = { nome, ...collectFormData('funcionario'), riscos: editingIndex > -1 && editingType === 'funcionario' ? depto.funcionarios[editingIndex].riscos : [] };
    if (editingIndex > -1 && editingType === 'funcionario') {
        depto.funcionarios[editingIndex] = funcionarioData;
        showToast("Funcionário atualizado!", "success");
    } else {
        depto.funcionarios.push(funcionarioData);
        showToast("Funcionário adicionado!", "success");
    }
    clearForm('funcionario');
    updateFuncionarioList();
    persistCurrentInspection();
}

function saveGrupo() {
    const nomesText = document.getElementById("grupo-nomes").value.trim();
    if (!nomesText) return showToast("Digite os nomes dos cargos do grupo.", "error");
    const nomes = nomesText.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    if (nomes.length === 0) return showToast("Nomes de cargos inválidos.", "error");
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    if (!depto.grupos) depto.grupos = [];
    const grupoData = { listaDeCargos: nomes, ...collectFormData('grupo'), riscos: editingIndex > -1 && editingType === 'grupo' ? depto.grupos[editingIndex].riscos : [], id: editingIndex > -1 && editingType === 'grupo' ? depto.grupos[editingIndex].id : 'grupo_' + Date.now() };
    if (editingIndex > -1 && editingType === 'grupo') {
        depto.grupos[editingIndex] = grupoData;
        showToast("Grupo atualizado!", "success");
    } else {
        depto.grupos.push(grupoData);
        showToast("Grupo criado!", "success");
    }
    clearForm('grupo');
    updateGrupoList();
    persistCurrentInspection();
}

function deleteCargo(index) {
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    if (confirm(`Excluir o cargo "${depto.cargos[index].nome}"?`)) { depto.cargos.splice(index, 1); updateCargoList(); persistCurrentInspection(); showToast("Cargo excluído!", "success"); }
}

function deleteFuncionario(index) {
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    if (confirm(`Excluir o funcionário "${depto.funcionarios[index].nome}"?`)) { depto.funcionarios.splice(index, 1); updateFuncionarioList(); persistCurrentInspection(); showToast("Funcionário excluído!", "success"); }
}

function populateForm(prefix, data) {
    if (!data) return;
    
    // CORREÇÃO APLICADA AQUI:
    document.getElementById(`${prefix}-form`).reset(); // Resetar o formulário antes de preencher

    (data.observacoes || []).forEach(obs => {
        const checkboxId = {
            "Trabalho em altura": `${prefix}-obs-altura`,
            "Espaço Confinado": `${prefix}-obs-espaco`,
            "Operação de Empilhadeira": `${prefix}-obs-empilhadeira`,
            "Trabalho com Eletricidade": `${prefix}-obs-eletricidade`,
            "Movimentação manual de cargas": `${prefix}-obs-movimentacao`,
            "Operação de Talhas": `${prefix}-obs-talhas`,
            "Operação de paleteiras": `${prefix}-obs-paleteiras`,
            "Condução de Veículos": `${prefix}-obs-veiculos`
        }[obs];
        if (checkboxId && document.getElementById(checkboxId)) {
            document.getElementById(checkboxId).checked = true;
        }
    });

    document.getElementById(`${prefix}-perfil-exposicao`).value = data.perfilExposicao || '';
    document.getElementById(`${prefix}-descricao-atividade`).value = data.descricaoAtividade || 'Sim';

    const req = data.requisitosNR || {};
    document.querySelector(`input[name="${prefix}-req-medida"][value="${req.medida || 'Sim'}"]`).checked = true;
    document.querySelector(`input[name="${prefix}-req-condicao"][value="${req.condicao || 'Sim'}"]`).checked = true;
    document.querySelector(`input[name="${prefix}-req-prazo"][value="${req.prazo || 'Sim'}"]`).checked = true;
    document.querySelector(`input[name="${prefix}-req-periodicidade"][value="${req.periodicidade || 'Sim'}"]`).checked = true;
    document.querySelector(`input[name="${prefix}-req-higienizacao"][value="${req.higienizacao || 'Sim'}"]`).checked = true;

    (data.dadosLtcat || []).forEach(dado => {
        const checkboxId = {
            "Insalubre (NR15)": `${prefix}-insalubre`,
            "Perigoso (NR16)": `${prefix}-perigoso`,
            "NHO 01": `${prefix}-nho01`,
            "DADOS PARA LTCAT": `${prefix}-ltcat`
        }[dado];
        if (checkboxId && document.getElementById(checkboxId)) {
            document.getElementById(checkboxId).checked = true;
        }
    });
}

function editCargo(index) {
    editingIndex = index;
    editingType = 'cargo';
    const cargo = currentInspection.departamentos[activeDepartamentoIndex].cargos[index];
    document.getElementById("cargo-form-details").open = true;
    document.getElementById("cargo-nome").value = cargo.nome || '';
    populateForm('cargo', cargo);
    document.getElementById("save-cargo-btn").innerHTML = "Salvar Alterações";
    document.getElementById("cancel-cargo-edit-btn").classList.remove("hidden");
    document.getElementById("cargo-nome").focus();
}

function editFuncionario(index) {
    editingIndex = index;
    editingType = 'funcionario';
    const funcionario = currentInspection.departamentos[activeDepartamentoIndex].funcionarios[index];
    document.getElementById("funcionario-form-details").open = true;
    document.getElementById("funcionario-nome").value = funcionario.nome || '';
    populateForm('funcionario', funcionario);
    document.getElementById("save-funcionario-btn").innerHTML = "Salvar Alterações";
    document.getElementById("cancel-funcionario-edit-btn").classList.remove("hidden");
    document.getElementById("funcionario-nome").focus();
}

function editGrupo(index) {
    editingIndex = index;
    editingType = 'grupo';
    const grupo = currentInspection.departamentos[activeDepartamentoIndex].grupos[index];
    document.getElementById("grupo-form-details").open = true;
    document.getElementById("grupo-nomes").value = (grupo.listaDeCargos || []).join('\n');
    populateForm('grupo', grupo);
    document.getElementById("save-grupo-btn").innerHTML = "Salvar Alterações";
    document.getElementById("cancel-grupo-edit-btn").classList.remove("hidden");
    document.getElementById("grupo-nomes").focus();
}

function clearForm(type) {
    editingIndex = -1;
    editingType = null;
    document.getElementById(`${type}-form`).reset();
    document.getElementById(`save-${type}-btn`).innerHTML = type === 'grupo' ? "Criar Grupo" : `Adicionar ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    document.getElementById(`cancel-${type}-edit-btn`).classList.add("hidden");
    document.getElementById(`${type}-form-details`).open = false;
}

function deleteGrupo(index) {
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    if (confirm(`Excluir este grupo?`)) { depto.grupos.splice(index, 1); updateGrupoList(); persistCurrentInspection(); showToast("Grupo excluído!", "success"); }
}

function goToRiscos(index, type) {
    activeCargoIndex = type === 'cargo' ? index : -1;
    activeFuncionarioIndex = type === 'funcionario' ? index : -1;
    currentGroupId = type === 'grupo' ? currentInspection.departamentos[activeDepartamentoIndex].grupos[index].id : null;
    nextStep();
}

function renderRiscoStep() {
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    let breadcrumbText = '', tituloRiscos = '', infoBox = '';
    let currentContextValue = '';

    if (currentGroupId) {
        const grupo = depto.grupos.find(g => g.id === currentGroupId);
        if (!grupo) { showToast("Grupo não encontrado.", "error"); prevStep(); return; }
        const nomesGrupo = grupo.listaDeCargos.join(', ');
        breadcrumbText = `${currentInspection.empresa.nome} › ${depto.nome} › <strong>Grupo: ${nomesGrupo}</strong>`;
        tituloRiscos = `Riscos do Grupo (${grupo.listaDeCargos.length} cargos)`;
        infoBox = `<div style="padding:1rem;background:var(--primary-light);border-left:4px solid var(--primary);border-radius:.5rem;margin-bottom:1.5rem;"><strong style="display:block;margin-bottom:.5rem;color:var(--gray-900);">Modo Grupo</strong><p style="margin:0;color:var(--gray-700);font-size:.95rem;">Os riscos aqui serão aplicados a todos os cargos do grupo.</p></div>`;
        currentContextValue = `grupo-${depto.grupos.findIndex(g => g.id === currentGroupId)}`;
    } else if (activeCargoIndex > -1) {
        const targetObject = depto.cargos[activeCargoIndex];
        if (!targetObject) { showToast("Cargo não encontrado.", "error"); prevStep(); return; }
        breadcrumbText = `${currentInspection.empresa.nome} › ${depto.nome} › <strong>Cargo: ${targetObject.nome}</strong>`;
        tituloRiscos = 'Riscos Identificados';
        currentContextValue = `cargo-${activeCargoIndex}`;
    } else if (activeFuncionarioIndex > -1) {
        const targetObject = depto.funcionarios[activeFuncionarioIndex];
        if (!targetObject) { showToast("Funcionário não encontrado.", "error"); prevStep(); return; }
        breadcrumbText = `${currentInspection.empresa.nome} › ${depto.nome} › <strong>Funcionário: ${targetObject.nome}</strong>`;
        tituloRiscos = 'Riscos Identificados';
        currentContextValue = `funcionario-${activeFuncionarioIndex}`;
    } else {
        prevStep(); return;
    }

    const riskTypes = [...new Set(predefinedRisks.map(r => r.tipo.replace(' PSICOSSOCIAIS', '')))];
    let quickNavOptions = (depto.cargos || []).map((c, i) => `<option value="cargo-${i}" ${currentContextValue === `cargo-${i}` ? 'selected' : ''}>Cargo: ${c.nome}</option>`).join('');
    quickNavOptions += (depto.funcionarios || []).map((f, i) => `<option value="funcionario-${i}" ${currentContextValue === `funcionario-${i}` ? 'selected' : ''}>Funcionário: ${f.nome}</option>`).join('');
    quickNavOptions += (depto.grupos || []).map((g, i) => `<option value="grupo-${i}" ${currentContextValue === `grupo-${i}` ? 'selected' : ''}>Grupo: ${g.listaDeCargos.join(', ')}</option>`).join('');

    document.getElementById('wizard-content').innerHTML = `
        <div class="card">
            <div class="breadcrumb">${breadcrumbText}</div>
            <div class="form-group">
                <label for="quick-nav-select">Navegar para riscos de:</label>
                <select id="quick-nav-select" onchange="switchRiskContext(this.value)">${quickNavOptions}</select>
            </div>
            ${infoBox}
            <h3>${tituloRiscos}</h3>
            <ul id="risco-list" class="item-list"></ul>
            <h3 id="risco-form-title">Novo Risco</h3>
            <form id="risco-form" oninput="triggerAutosave()">
                 <div class="form-grid">
                    <div class="form-group">
                        <label for="risco-tipo">Tipo de Risco</label>
                        <select id="risco-tipo" onchange="updatePerigoOptions(this.value)">
                            <option value="">-- 1. Selecione o Tipo --</option>
                            ${riskTypes.map(type => `<option value="${type}">${type.charAt(0) + type.slice(1).toLowerCase()}</option>`).join('')}
                        </select>
                    </div>
                     <div class="form-group">
                        <label for="risk-perigo-select">Selecionar Perigo Pré-definido</label>
                        <select id="risk-perigo-select" onchange="fillRiscoForm(this.value)">
                            <option value="">-- Aguardando seleção do tipo --</option>
                        </select>
                    </div>
                </div>
                <hr style="margin: 1.5rem 0; border: none; border-top: 2px solid var(--gray-100);">
                <div class="form-group"><label for="risco-presente">Risco Presente?</label><select id="risco-presente"><option>Sim</option><option>Não</option></select></div>
                <div class="form-group"><label for="risco-perigo">Descrição (Nome) do Perigo *</label><input type="text" id="risco-perigo" required placeholder="Ex: Ruído contínuo acima de 85 dB"></div>
                <div class="form-group"><label for="risco-descricao-detalhada">Descrição Detalhada</label><textarea id="risco-descricao-detalhada" rows="2" placeholder="Detalhe o contexto do risco..."></textarea></div>
                <details class="accordion-section">
                    <summary>Fonte, Medição e Exposição</summary>
                    <div class="form-grid">
                        <div class="form-group"><label for="risco-fonte">Fonte Geradora</label><input type="text" id="risco-fonte" placeholder="Ex: Compressor"></div>
                        <div class="form-group"><label for="risco-perfil-exposicao">Perfil de exposição</label><input type="text" id="risco-perfil-exposicao" placeholder="Ex: Contínuo"></div>
                        <div class="form-group"><label for="risco-medicao">Medição</label><input type="text" id="risco-medicao" placeholder="Ex: 92 dB"></div>
                        <div class="form-group"><label for="risco-tempo-exposicao">Tempo de Exposição</label><input type="text" id="risco-tempo-exposicao" placeholder="Ex: 8h"></div>
                        <div class="form-group"><label for="risco-tipo-exposicao">Tipo de Exposição</label><select id="risco-tipo-exposicao"><option>Permanente</option><option>Ocasional</option><option>Intermitente</option></select></div>
                        <div class="form-group"><label for="risco-esocial">Código E-Social</label><input type="text" id="risco-esocial" placeholder="Ex: 01.01.001"></div>
                    </div>
                    <div class="form-group"><label for="risco-obs-ambientais">Observações de registros ambientais</label><textarea id="risco-obs-ambientais" rows="2"></textarea></div>
                </details>
                <details class="accordion-section">
                    <summary>Análise e Avaliação</summary>
                    <div class="form-grid">
                        <div class="form-group"><label for="risco-probabilidade">Probabilidade</label><select id="risco-probabilidade"><option>Improvável</option><option>Provável</option><option>Remota</option><option>Frequente</option></select></div>
                        <div class="form-group"><label for="risco-severidade">Severidade</label><select id="risco-severidade"><option>Baixa</option><option>Média</option><option>Alta</option><option>Crítica</option></select></div>
                        <div class="form-group"><label for="risco-aceitabilidade">Aceitabilidade</label><select id="risco-aceitabilidade"><option>Tolerável</option><option>Não Tolerável</option></select></div>
                    </div>
                    <div class="form-group"><label for="risco-danos">Danos Potenciais</label><textarea id="risco-danos" rows="2" placeholder="Descreva os possíveis danos..."></textarea></div>
                </details>
                <details class="accordion-section">
                    <summary>Controles e Ações</summary>
                    <div class="form-grid">
                        <div class="form-group"><label for="risco-epi-utilizado">EPI Utilizado</label><input type="text" id="risco-epi-utilizado" placeholder="Ex: Protetor auricular"></div>
                        <div class="form-group"><label for="risco-ca">CA (Certificado de Aprovação)</label><input type="text" id="risco-ca" placeholder="Ex: 12345"></div>
                        <div class="form-group"><label for="risco-epc">EPC Existente</label><input type="text" id="risco-epc" placeholder="Ex: Cabine acústica"></div>
                        <div class="form-group"><label for="risco-epi-sugerido">EPI Sugerido</label><input type="text" id="risco-epi-sugerido"></div>
                    </div>
                    <div class="form-group"><label for="risco-acoes">Ações Necessárias</label><textarea id="risco-acoes" rows="2" placeholder="Descreva as ações recomendadas..."></textarea></div>
                    <div class="form-group"><label for="risco-observacoes-gerais">Observações Gerais</label><textarea id="risco-observacoes-gerais" rows="2"></textarea></div>
                </details>
                <div class="form-actions"><button type="button" class="primary" id="save-risco-btn" onclick="saveRisco()"><i class="bi bi-plus-lg"></i> Adicionar</button><button type="button" id="cancel-risco-edit-btn" class="nav hidden" onclick="clearRiscoForm()">Cancelar</button></div>
            </form>
            <div class="wizard-nav"><button class="nav" onclick="voltarDosRiscos()">Voltar</button></div>
        </div>`;
    updateRiscoList();
}

function voltarDosRiscos() { 
    currentGroupId = null; 
    activeCargoIndex = -1;
    activeFuncionarioIndex = -1;
    prevStep(); 
}

function updatePerigoOptions(selectedType) {
    const perigoSelect = document.getElementById("risk-perigo-select");
    perigoSelect.innerHTML = '<option value="">-- Selecione um perigo (opcional) --</option>';
    if (!selectedType) return;
    predefinedRisks.forEach((risk, index) => {
        if (risk.tipo.replace(' PSICOSSOCIAIS', '') === selectedType) {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = risk.perigo;
            perigoSelect.appendChild(option);
        }
    });
}

function updateRiscoList() {
    const list = document.getElementById("risco-list");
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    let riscos = [];
    if (currentGroupId) { const grupo = depto.grupos.find(g => g.id === currentGroupId); riscos = grupo?.riscos || []; }
    else if (activeCargoIndex > -1) { riscos = depto.cargos[activeCargoIndex]?.riscos || []; }
    else if (activeFuncionarioIndex > -1) { riscos = depto.funcionarios[activeFuncionarioIndex]?.riscos || []; }
    if (riscos.length === 0) { list.innerHTML = '<li class="empty-state">Nenhum risco identificado.</li>'; return; }
    list.innerHTML = "";
    riscos.forEach((risco, index) => {
        const li = document.createElement("li");
        li.innerHTML = `<div class="item-info"><strong>${risco.perigo}</strong><span class="badge">${risco.tipo}</span><small>Fonte: ${risco.fonteGeradora||"N/A"} | Severidade: ${risco.severidade||"N/A"}</small></div><div class="item-actions"><button class="outline" onclick="editRisco(${index})">Editar</button><button class="danger" onclick="deleteRisco(${index})">Excluir</button></div>`;
        list.appendChild(li);
    });
}

function saveRisco() {
    const riscoData = {
        riscoPresente: document.getElementById("risco-presente").value, tipo: document.getElementById("risco-tipo").value, codigoEsocial: document.getElementById("risco-esocial").value, perigo: document.getElementById("risco-perigo").value, descricaoDetalhada: document.getElementById("risco-descricao-detalhada").value, fonteGeradora: document.getElementById("risco-fonte").value, perfilExposicao: document.getElementById("risco-perfil-exposicao").value, medicao: document.getElementById("risco-medicao").value, tempoExposicao: document.getElementById("risco-tempo-exposicao").value, tipoExposicao: document.getElementById("risco-tipo-exposicao").value, obsAmbientais: document.getElementById("risco-obs-ambientais").value, probabilidade: document.getElementById("risco-probabilidade").value, severidade: document.getElementById("risco-severidade").value, aceitabilidade: document.getElementById("risco-aceitabilidade").value, danos: document.getElementById("risco-danos").value, epiUtilizado: document.getElementById("risco-epi-utilizado").value, ca: document.getElementById("risco-ca").value, epc: document.getElementById("risco-epc").value, epiSugerido: document.getElementById("risco-epi-sugerido").value, acoesNecessarias: document.getElementById("risco-acoes").value, observacoesGerais: document.getElementById("risco-observacoes-gerais").value
    };
    if (!riscoData.perigo) return showToast("A descrição do perigo é obrigatória.", "error");
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    let targetArray;
    let message = `Risco ${editingIndex > -1 ? 'atualizado' : 'adicionado'}`;
    if (currentGroupId) {
        const grupo = depto.grupos.find(g => g.id === currentGroupId); if (!grupo.riscos) grupo.riscos = [];
        targetArray = grupo.riscos; message += ' para o grupo!';
    } else if (activeCargoIndex > -1) {
        const cargo = depto.cargos[activeCargoIndex]; if (!cargo.riscos) cargo.riscos = [];
        targetArray = cargo.riscos; message += '!';
    } else if (activeFuncionarioIndex > -1) {
        const funcionario = depto.funcionarios[activeFuncionarioIndex]; if (!funcionario.riscos) funcionario.riscos = [];
        targetArray = funcionario.riscos; message += '!';
    }
    if (editingIndex > -1) targetArray[editingIndex] = riscoData; else targetArray.push(riscoData);
    showToast(message, "success");
    clearRiscoForm(); updateRiscoList(); persistCurrentInspection();
}

function editRisco(index) {
    editingIndex = index;
    const depto = currentInspection.departamentos[activeDepartamentoIndex]; let risco;
    if (currentGroupId) { const grupo = depto.grupos.find(g => g.id === currentGroupId); risco = grupo?.riscos[index]; }
    else if (activeCargoIndex > -1) { risco = depto.cargos[activeCargoIndex].riscos[index]; }
    else if (activeFuncionarioIndex > -1) { risco = depto.funcionarios[activeFuncionarioIndex].riscos[index]; }
    if (!risco) return;
    document.getElementById("risco-presente").value = risco.riscoPresente || "Sim";
    document.getElementById("risco-tipo").value = risco.tipo || "Físico";
    updatePerigoOptions(risco.tipo || "Físico");
    document.getElementById("risco-esocial").value = risco.codigoEsocial || "";
    document.getElementById("risco-perigo").value = risco.perigo || "";
    document.getElementById("risco-descricao-detalhada").value = risco.descricaoDetalhada || "";
    document.getElementById("risco-fonte").value = risco.fonteGeradora || "";
    document.getElementById("risco-perfil-exposicao").value = risco.perfilExposicao || "";
    document.getElementById("risco-medicao").value = risco.medicao || "";
    document.getElementById("risco-tempo-exposicao").value = risco.tempoExposicao || "";
    document.getElementById("risco-tipo-exposicao").value = risco.tipoExposicao || "Permanente";
    document.getElementById("risco-obs-ambientais").value = risco.obsAmbientais || "";
    document.getElementById("risco-probabilidade").value = risco.probabilidade || "Improvável";
    document.getElementById("risco-severidade").value = risco.severidade || "Baixa";
    document.getElementById("risco-aceitabilidade").value = risco.aceitabilidade || "Tolerável";
    document.getElementById("risco-danos").value = risco.danos || "";
    document.getElementById("risco-epi-utilizado").value = risco.epiUtilizado || "";
    document.getElementById("risco-ca").value = risco.ca || "";
    document.getElementById("risco-epc").value = risco.epc || "";
    document.getElementById("risco-epi-sugerido").value = risco.epiSugerido || "";
    document.getElementById("risco-acoes").value = risco.acoesNecessarias || "";
    document.getElementById("risco-observacoes-gerais").value = risco.observacoesGerais || "";
    document.getElementById("risco-form-title").innerText = "Editando Risco";
    document.getElementById("save-risco-btn").innerHTML = "<i class='bi bi-save-fill'></i> Salvar";
    document.getElementById("cancel-risco-edit-btn").classList.remove("hidden");
    document.getElementById("risco-perigo").focus();
}

function deleteRisco(index) {
    const depto = currentInspection.departamentos[activeDepartamentoIndex]; let targetArray, nomeRisco;
    if (currentGroupId) { const grupo = depto.grupos.find(g => g.id === currentGroupId); targetArray = grupo.riscos; }
    else if (activeCargoIndex > -1) { targetArray = depto.cargos[activeCargoIndex].riscos; }
    else if (activeFuncionarioIndex > -1) { targetArray = depto.funcionarios[activeFuncionarioIndex].riscos; }
    nomeRisco = targetArray[index]?.perigo;
    if (!confirm(`Excluir o risco "${nomeRisco}"?`)) return;
    targetArray.splice(index, 1);
    showToast("Risco excluído!", "success");
    updateRiscoList();
    persistCurrentInspection();
}

function clearRiscoForm() {
    editingIndex = -1;
    document.getElementById("risco-form").reset();
    document.getElementById("risco-form-title").innerText = "Novo Risco";
    document.getElementById("save-risco-btn").innerHTML = "<i class='bi bi-plus-lg'></i> Adicionar";
    document.getElementById("cancel-risco-edit-btn").classList.add("hidden");
}

function saveAndExit() {
    persistCurrentInspection((success) => {
        if(success) { showToast('Inspeção salva!', 'success'); showDashboard(); }
        else { showToast('Não foi possível salvar.', 'error'); }
    });
}

function loadInspections() {
    if (!db) return;
    const request = db.transaction(["inspections"], "readonly").objectStore("inspections").getAll();
    request.onerror = () => {
        document.getElementById("inspection-list").innerHTML = 
            '<li class="empty-state" style="color: var(--danger);">Erro ao carregar as inspeções.</li>';
    };
    request.onsuccess = () => {
        const listElement = document.getElementById("inspection-list");
        const inspections = request.result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        if (inspections.length === 0) {
            listElement.innerHTML = '<li class="empty-state">Nenhuma inspeção salva. Crie uma nova para começar.</li>';
            return;
        }
        listElement.innerHTML = inspections.map(inspection => {
            const lastUpdated = inspection.updatedAt 
                ? new Date(inspection.updatedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) 
                : 'N/A';
            return `
                <li>
                    <div class="item-info">
                        <strong>${inspection.empresa.nome}</strong>
                        <small>Data da Inspeção: ${formatDateBR(inspection.empresa.data)}</small>  
                        <small style="display: block; margin-top: 4px; color: var(--gray-500);">
                            Última alteração: ${lastUpdated}
                        </small>
                    </div>
                    <div class="item-actions">
                        <button class="outline" onclick="generateInspectionReport(${inspection.id})"><i class="bi bi-file-earmark-text"></i> Relatório</button>
                        <button class="primary" onclick="showActionPlanView(${inspection.id})"><i class="bi bi-clipboard2-check"></i> Plano</button>
                        <button class="secondary" onclick="editInspection(${inspection.id})"><i class="bi bi-pencil-fill"></i> Editar</button>
                        <button class="outline" onclick="duplicateInspection(${inspection.id})"><i class="bi bi-copy"></i> Duplicar</button>
                        <button class="danger" onclick="deleteInspection(${inspection.id})"><i class="bi bi-trash3-fill"></i> Excluir</button>
                    </div>
                </li>`;
        }).join('');
    };
}

function editInspection(id) {
    const e = db.transaction(["inspections"], "readonly").objectStore("inspections").get(id);
    e.onsuccess = () => { currentInspection = e.result; wizardStep = 0; showWizard(); };
    e.onerror = (t) => console.error("Erro ao carregar inspeção:", t);
}

function deleteInspection(id) {
    if (confirm('Excluir esta inspeção? A ação não pode ser desfeita.')) {
        const e = db.transaction(["inspections"], "readwrite").objectStore("inspections").delete(id);
        e.onsuccess = () => { showToast('Inspeção excluída!', 'success'); loadInspections(); updateDashboardStats(); };
        e.onerror = (t) => console.error("Erro ao excluir:", t);
    }
}

function getAllInspections(callback) {
    if (!db) return callback([]);
    const t = db.transaction(["inspections"], "readonly").objectStore("inspections").getAll();
    t.onsuccess = () => callback(t.result);
    t.onerror = (e) => { console.error("Erro ao buscar inspeções:", e); callback([]); };
}

function renderCargoReport(cargo, titulo) {
    const req = cargo.requisitosNR || {};
    const formatChecklistItem = (value) => {
        const sim = value === 'Sim' ? 'X' : '&nbsp;';
        const nao = value === 'Não' ? 'X' : '&nbsp;';
        return `S&nbsp;(&nbsp;${sim}&nbsp;)&nbsp;&nbsp;N&nbsp;(&nbsp;${nao}&nbsp;)`;
    };
    let html = `<div style="border:2px solid #dbeafe;padding:15px;border-radius:8px;margin:20px 0;page-break-inside:avoid">
        <h3>${titulo}</h3>
        <div class="cargo-details">
            <p><strong>Observações:</strong> ${(cargo.observacoes||[]).join(', ')||'N/A'}</p>
            <p><strong>Perfil de Exposição (Observação Específica):</strong> ${cargo.perfilExposicao||'N/A'}</p>
            <p><strong>Descrição Atividade:</strong> ${cargo.descricaoAtividade||'N/A'}</p>
            <p><strong>Dados LTCAT:</strong> ${(cargo.dadosLtcat||[]).join(', ')||'N/A'}</p>
            <h4>✅ Requisitos NR-06/NR-01:</h4>
            <div class="report-checklist">
                <span class="report-checklist-item">Medida de Proteção ${formatChecklistItem(req.medida)}</span>
                <span class="report-checklist-item">Condição de Funcionamento do EPI ${formatChecklistItem(req.condicao)}</span>
                <span class="report-checklist-item">Prazo de Validade do EPI ${formatChecklistItem(req.prazo)}</span>
                <span class="report-checklist-item">Periodicidade da Troca do EPI ${formatChecklistItem(req.periodicidade)}</span>
                <span class="report-checklist-item">Higienização do EPI ${formatChecklistItem(req.higienizacao)}</span>
            </div>
        </div>
        <h4>⚠️ Riscos Identificados</h4>`;
    if (cargo.riscos && cargo.riscos.length > 0) {
        cargo.riscos.forEach((risco, idx) => {
            html += `<div class="risco-card"><h5>Risco ${idx+1}: ${risco.perigo||'N/A'}</h5>
            <table><thead><tr><th colspan="2" style="background:#2563eb">Informações Básicas</th></tr></thead><tbody><tr><td style="width:200px"><strong>Risco Presente:</strong></td><td>${risco.riscoPresente||'N/A'}</td></tr><tr><td><strong>Tipo:</strong></td><td>${risco.tipo||'N/A'}</td></tr><tr><td><strong>E-Social:</strong></td><td>${risco.codigoEsocial||'N/A'}</td></tr><tr><td><strong>Descrição:</strong></td><td>${risco.descricaoDetalhada||'N/A'}</td></tr></tbody></table>
            <table><thead><tr><th colspan="2" style="background:#10b981">Fonte e Exposição</th></tr></thead><tbody><tr><td style="width:200px"><strong>Fonte:</strong></td><td>${risco.fonteGeradora||'N/A'}</td></tr><tr><td><strong>Perfil Exposição:</strong></td><td>${risco.perfilExposicao||'N/A'}</td></tr><tr><td><strong>Medição:</strong></td><td>${risco.medicao||'N/A'}</td></tr><tr><td><strong>Tempo Exposição:</strong></td><td>${risco.tempoExposicao||'N/A'}</td></tr><tr><td><strong>Tipo Exposição:</strong></td><td>${risco.tipoExposicao||'N/A'}</td></tr><tr><td><strong>Obs. Ambientais:</strong></td><td>${risco.obsAmbientais||'N/A'}</td></tr></tbody></table>
            <table><thead><tr><th colspan="2" style="background:#f59e0b">Análise e Avaliação</th></tr></thead><tbody><tr><td style="width:200px"><strong>Probabilidade:</strong></td><td>${risco.probabilidade||'N/A'}</td></tr><tr><td><strong>Severidade:</strong></td><td>${risco.severidade||'N/A'}</td></tr><tr><td><strong>Aceitabilidade:</strong></td><td>${risco.aceitabilidade||'N/A'}</td></tr><tr><td><strong>Danos Potenciais:</strong></td><td>${risco.danos||'N/A'}</td></tr></tbody></table>
            <table><thead><tr><th colspan="2" style="background:#8b5cf6">Controles e Ações</th></tr></thead><tbody><tr><td style="width:200px"><strong>EPI Utilizado:</strong></td><td>${risco.epiUtilizado||'N/A'}</td></tr><tr><td><strong>CA:</strong></td><td>${risco.ca||'N/A'}</td></tr><tr><td><strong>EPC Existente:</strong></td><td>${risco.epc||'N/A'}</td></tr><tr><td><strong>EPI Sugerido:</strong></td><td>${risco.epiSugerido||'N/A'}</td></tr><tr><td><strong>Ações Necessárias:</strong></td><td>${risco.acoesNecessarias||'N/A'}</td></tr><tr><td><strong>Obs. Gerais:</strong></td><td>${risco.observacoesGerais||'N/A'}</td></tr></tbody></table></div>`;
        });
    } else { 
        html += `<p style="color:#999;font-style:italic;padding:20px;background:#f9fafb;border-radius:8px">Nenhum risco adicionado.</p>`; 
    }
    html += `</div>`; 
    return html;
}

function showActionPlanView(inspectionId) {
    const request = db.transaction(["inspections"], "readonly").objectStore("inspections").get(inspectionId);
    request.onsuccess = () => {
        currentInspection = request.result;
        if (currentInspection) { showView('actionPlan'); renderActionPlanView(); }
        else { showToast("Inspeção não encontrada!", "error"); }
    };
    request.onerror = () => showToast("Erro ao carregar inspeção.", "error");
}

function renderActionPlanView() {
    if (!currentInspection) return; const e = currentInspection.empresa || {};
    actionPlanView.innerHTML = `
        <div class="card">
            <div class="header">
                <div>
                    <h1>Plano de Ação</h1>
                    <p style="color:var(--gray-600)">Inspeção: ${e.nome}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span id="autosave-status" style="color: var(--gray-600); font-size: 0.85rem; transition: all 0.3s ease; opacity: 0;"></span>
                    <button class="nav" onclick="showDashboard()">Voltar ao Painel</button>
                </div>
            </div>
            <h3>Itens de Ação</h3><ul id="action-item-list" class="item-list"></ul><h3 id="action-form-title">Novo Item</h3>
            <form id="action-item-form" oninput="triggerAutosave()">
                <div class="form-group"><label for="action-atividade">Atividade *</label><input type="text" id="action-atividade" required></div>
                <div class="form-group"><label for="action-descricao">Descrição</label><textarea id="action-descricao" rows="4"></textarea></div>
                <div class="form-grid"><div class="form-group"><label for="action-prazo-inicio">Prazo Início</label><input type="date" id="action-prazo-inicio"></div><div class="form-group"><label for="action-prazo-fim">Prazo Fim</label><input type="date" id="action-prazo-fim"></div></div>
                <div class="form-group"><label for="action-status">Status</label><select id="action-status"><option>Pendente</option><option>Em Andamento</option><option>Concluída</option></select></div>
                <div class="form-actions"><button type="button" class="primary" id="save-action-btn" onclick="saveActionItem()">Adicionar Item</button><button type="button" class="nav hidden" id="cancel-action-edit-btn" onclick="clearActionForm()">Cancelar</button></div>
            </form>
        </div>`;
    updateActionItemList();
}

function updateActionItemList() {
    const list = document.getElementById("action-item-list");
    if (!currentInspection.planoDeAcao || currentInspection.planoDeAcao.length === 0) { list.innerHTML = '<li class="empty-state">Nenhum item no plano de ação.</li>'; return; }
    list.innerHTML = "";
    currentInspection.planoDeAcao.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `<div class="item-info"><strong>${item.atividade}</strong><small>Prazo: ${item.prazoInicio||'N/A'} a ${item.prazoFim||'N/A'}</small></div><div class="item-actions"><span class="badge">${item.status||'Pendente'}</span><button class="outline" onclick="editActionItem(${index})">Editar</button><button class="danger" onclick="deleteActionItem(${index})">Excluir</button></div>`;
        list.appendChild(li);
    });
}

function formatDateBR(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00'); 
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function saveActionItem() {
    const itemData = { atividade: document.getElementById("action-atividade").value, descricao: document.getElementById("action-descricao").value, prazoInicio: document.getElementById("action-prazo-inicio").value, prazoFim: document.getElementById("action-prazo-fim").value, status: document.getElementById("action-status").value, };
    if (!itemData.atividade) return showToast("A atividade é obrigatória.", "error");
    if (!currentInspection.planoDeAcao) currentInspection.planoDeAcao = [];
    if (editingIndex > -1) { currentInspection.planoDeAcao[editingIndex] = itemData; showToast("Item atualizado!", "success"); }
    else { currentInspection.planoDeAcao.push(itemData); showToast("Item adicionado!", "success"); }
    persistCurrentInspection(); clearActionForm(); updateActionItemList();
}

function editActionItem(index) {
    editingIndex = index; const item = currentInspection.planoDeAcao[index];
    document.getElementById("action-atividade").value = item.atividade;
    document.getElementById("action-descricao").value = item.descricao;
    document.getElementById("action-prazo-inicio").value = item.prazoInicio;
    document.getElementById("action-prazo-fim").value = item.prazoFim;
    document.getElementById("action-status").value = item.status;
    document.getElementById("action-form-title").innerText = "Editando Item";
    document.getElementById("save-action-btn").innerText = "Salvar Alterações";
    document.getElementById("cancel-action-edit-btn").classList.remove("hidden");
    document.getElementById("action-atividade").focus();
}

function deleteActionItem(index) {
    if (confirm("Excluir este item do plano de ação?")) {
        currentInspection.planoDeAcao.splice(index, 1);
        persistCurrentInspection();
        updateActionItemList();
        showToast("Item excluído.", "success");
    }
}

function clearActionForm() {
    editingIndex = -1;
    document.getElementById("action-item-form").reset();
    document.getElementById("action-form-title").innerText = "Novo Item";
    document.getElementById("save-action-btn").innerText = "Adicionar Item";
    document.getElementById("cancel-action-edit-btn").classList.add("hidden");
}

function duplicateInspection(id) {
    const request = db.transaction(["inspections"], "readonly").objectStore("inspections").get(id);
    request.onerror = (e) => showToast("Erro ao encontrar a inspeção para duplicar.", "error");
    request.onsuccess = () => {
        const originalInsp = request.result;
        if (!originalInsp) return;
        const newInsp = JSON.parse(JSON.stringify(originalInsp));
        delete newInsp.id;
        newInsp.empresa.nome = `${originalInsp.empresa.nome} (Cópia)`;
        const now = new Date().toISOString();
        newInsp.createdAt = now;
        newInsp.updatedAt = now;
        const addRequest = db.transaction(["inspections"], "readwrite").objectStore("inspections").add(newInsp);
        addRequest.onsuccess = () => {
            showToast("Inspeção duplicada com sucesso!", "success");
            loadInspections();
            updateDashboardStats();
        };
        addRequest.onerror = (e) => showToast("Erro ao salvar a inspeção duplicada.", "error");
    };
}

function duplicateDepartamento(index) {
    const originalDepto = currentInspection.departamentos[index];
    const newDepto = JSON.parse(JSON.stringify(originalDepto));
    newDepto.nome = `${originalDepto.nome} (Cópia)`;
    currentInspection.departamentos.splice(index + 1, 0, newDepto);
    updateDepartamentoList();
    persistCurrentInspection();
    showToast("Departamento duplicado com sucesso!", "success");
}

function duplicateCargo(index) {
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    const originalCargo = depto.cargos[index];
    const newCargo = JSON.parse(JSON.stringify(originalCargo));
    newCargo.nome = `${originalCargo.nome} (Cópia)`;
    depto.cargos.splice(index + 1, 0, newCargo);
    updateCargoList();
    persistCurrentInspection();
    showToast("Cargo duplicado com sucesso!", "success");
}

function duplicateFuncionario(index) {
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    const originalFunc = depto.funcionarios[index];
    const newFunc = JSON.parse(JSON.stringify(originalFunc));
    newFunc.nome = `${originalFunc.nome} (Cópia)`;
    depto.funcionarios.splice(index + 1, 0, newFunc);
    updateFuncionarioList();
    persistCurrentInspection();
    showToast("Funcionário duplicado com sucesso!", "success");
}

function duplicateGrupo(index) {
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    const originalGrupo = depto.grupos[index];
    const newGrupo = JSON.parse(JSON.stringify(originalGrupo));
    newGrupo.id = 'grupo_' + Date.now();
    if (newGrupo.listaDeCargos.length > 0) {
        newGrupo.listaDeCargos[0] = `${newGrupo.listaDeCargos[0]} (Cópia)`;
    }
    depto.grupos.splice(index + 1, 0, newGrupo);
    updateGrupoList();
    persistCurrentInspection();
    showToast("Grupo duplicado com sucesso!", "success");
}

function showAutosaveStatus(status) {
    const statusEl = document.getElementById('autosave-status');
    if (!statusEl) return;
    switch (status) {
        case 'saving':
            statusEl.innerHTML = '<i class="bi bi-arrow-repeat"></i> Salvando...';
            statusEl.style.opacity = '1';
            break;
        case 'saved':
            statusEl.innerHTML = '<i class="bi bi-check-lg"></i> Salvo';
            statusEl.style.opacity = '1';
            setTimeout(() => { statusEl.style.opacity = '0'; }, 2000);
            break;
        case 'error':
            statusEl.innerHTML = '<i class="bi bi-exclamation-triangle"></i> Erro ao salvar';
            statusEl.style.opacity = '1';
            break;
        default:
            statusEl.style.opacity = '0';
    }
}

function triggerAutosave() {
    clearTimeout(autosaveTimer);
    if (isAutosaving) return;
    autosaveTimer = setTimeout(performAutosave, 2500);
}

function performAutosave() {
    if (!db || !currentInspection || !currentInspection.id || isAutosaving) {
        return;
    }
    
    if (!isOnline) {
        console.log('📴 Modo offline: salvando localmente sem feedback visual');
        currentInspection.updatedAt = new Date().toISOString();
        const transaction = db.transaction(["inspections"], "readwrite");
        const store = transaction.objectStore("inspections");
        const request = store.put(currentInspection);
        request.onsuccess = () => console.log('✅ Dados salvos localmente (offline)');
        request.onerror = (event) => console.error('❌ Erro ao salvar offline:', event.target.error);
        return;
    }
    
    isAutosaving = true;
    showAutosaveStatus('saving');
    
    let dataUpdated = false;
    
    const empresaForm = document.getElementById('empresa-form');
    if (empresaForm && !wizardView.classList.contains('hidden')) {
        currentInspection.empresa = { 
            nome: document.getElementById("nome").value, cnpj: document.getElementById("cnpj").value, data: document.getElementById("data").value, elaborado: document.getElementById("elaborado").value, aprovado: document.getElementById("aprovado").value 
        };
        dataUpdated = true;
    }
    
    // Check for other forms and update data...

    if (dataUpdated) {
        persistCurrentInspection((success) => {
            if (success) showAutosaveStatus('saved');
            else showAutosaveStatus('error');
            isAutosaving = false;
        });
    } else {
        isAutosaving = false;
        showAutosaveStatus('hidden');
    }
}

function initializeSortableLists() {
    const sortableConfig = {
        animation: 150,
        ghostClass: 'sortable-ghost',
        forceFallback: true, // Melhor suporte touch
        touchStartThreshold: 3, // Sensibilidade touch
        delay: 100, // Delay para distinguir tap de drag
        delayOnTouchOnly: true, // Delay apenas no touch
        onEnd: (evt) => {
            const { from, oldIndex, newIndex } = evt;
            const listId = from.id;
            let targetArray;
            
            if (listId === 'departamento-list') targetArray = currentInspection.departamentos;
            else if (listId === 'cargo-list') targetArray = currentInspection.departamentos[activeDepartamentoIndex].cargos;
            else if (listId === 'funcionario-list') targetArray = currentInspection.departamentos[activeDepartamentoIndex].funcionarios;
            else if (listId === 'grupo-list') targetArray = currentInspection.departamentos[activeDepartamentoIndex].grupos;
            
            if (targetArray) {
                targetArray.splice(newIndex, 0, targetArray.splice(oldIndex, 1)[0]);
                persistCurrentInspection(() => {
                    showToast("✅ Ordem salva!", "success");
                    if ('vibrate' in navigator) navigator.vibrate(50);
                });
            }
        }
    };
    
    ['departamento-list', 'cargo-list', 'funcionario-list', 'grupo-list'].forEach(id => {
        const el = document.getElementById(id);
        if (el) Sortable.create(el, sortableConfig);
    });
}

function switchRiskContext(value) {
    if (!value) return;
    const [type, indexStr] = value.split('-');
    const index = parseInt(indexStr);
    activeCargoIndex = type === 'cargo' ? index : -1;
    activeFuncionarioIndex = type === 'funcionario' ? index : -1;
    currentGroupId = type === 'grupo' ? currentInspection.departamentos[activeDepartamentoIndex].grupos[index].id : null;
    renderRiscoStep();
}

function generateInspectionReport(id) {
    const request = db.transaction(["inspections"], "readonly").objectStore("inspections").get(id);
    request.onsuccess = () => {
        const insp = request.result;
        if (!insp) return showToast("Inspeção não encontrada!", "error");
        const e = insp.empresa || {};
        const reportDate = new Date().toLocaleString('pt-BR');
        let html = `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Relatório - ${e.nome}</title>
            <style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;margin:20px;color:#333;line-height:1.6}.header,.section{border-bottom:2px solid #eee;padding-bottom:15px;margin-bottom:20px;page-break-inside:avoid}h1{color:#1f2937;font-size:2rem}h2{color:#111827;border-bottom:1px solid #ccc;padding-bottom:5px;margin-top:2rem}h3{color:#374151;margin-top:1.5rem}h4{margin:1rem 0 .5rem;color:#4b5563}h5{color:#2563eb;margin:0 0 10px;font-size:1.1rem;padding-bottom:5px;border-bottom:1px solid #dbeafe}table{width:100%;border-collapse:collapse;margin-top:15px;font-size:.9em}th,td{border:1px solid #ccc;padding:8px;text-align:left;vertical-align:top}th{background-color:#f3f4f6;font-weight:600}.details-grid{display:grid;grid-template-columns:150px 1fr;gap:5px 15px;margin:1rem 0}.details-grid strong{color:#4b5563}.no-print{margin-bottom:20px}@media print{.no-print{display:none}body{margin:0}}.cargo-details p{margin:5px 0}.risco-card{background:#f9fafb;border:2px solid #e5e7eb;border-radius:8px;padding:15px;margin:15px 0;page-break-inside:avoid}.risco-card table{margin-bottom:15px}.risco-card th{color:white;font-weight:600}</style>
        </head><body>
            <div class="no-print"><button onclick="window.print()" style="padding:10px 20px;background:#2563eb;color:white;border:none;border-radius:5px;cursor:pointer;">🖨️ Imprimir/Salvar PDF</button></div>
            <div class="header"><h1>📋 Relatório de Inspeção</h1><h2>${e.nome||'N/A'}</h2><div class="details-grid"><strong>CNPJ:</strong><span>${e.cnpj||'N/A'}</span><strong>Data de Inspeção:</strong><span>${formatDateBR(e.data)}</span><strong>Elaborado por:</strong><span>${e.elaborado||'N/A'}</span><strong>Aprovado por:</strong><span>${e.aprovado||'N/A'}</span><strong>Gerado em:</strong><span>${reportDate}</span></div></div>`;
        (insp.departamentos || []).forEach(depto => {
            html += `<div class="section"><h2>📂 Departamento: ${depto.nome||'N/A'}</h2><p><strong>Característica:</strong> ${depto.caracteristica||'N/A'}</p><p><strong>Descrição:</strong> ${depto.descricao||'N/A'}</p>`;
            (depto.grupos || []).forEach(grupo => { html += renderCargoReport({ ...grupo, nome: `Grupo: ${grupo.listaDeCargos.join(', ')}` }, `👥 Grupo: ${grupo.listaDeCargos.join(', ')}`); });
            (depto.cargos || []).forEach(cargo => { html += renderCargoReport(cargo, `👤 Cargo: ${cargo.nome||'N/A'}`); });
            (depto.funcionarios || []).forEach(func => { html += renderCargoReport(func, `👨‍💼 Funcionário: ${func.nome||'N/A'}`); });
            html += `</div>`;
        });
        html += `<div class="section" style="page-break-before: always;"><h2>📝 Plano de Ação</h2>`;
        if (insp.planoDeAcao && insp.planoDeAcao.length > 0) {
            html += `<table><thead><tr><th style="width:25%">Atividade</th><th>Descrição</th><th style="width:20%">Prazo</th><th style="width:15%">Status</th></tr></thead><tbody>`;
            insp.planoDeAcao.forEach(item => {
                const prazo = (item.prazoInicio ? formatDateBR(item.prazoInicio) : 'N/A') + ' a ' + (item.prazoFim ? formatDateBR(item.prazoFim) : 'N/A');
                html += `<tr><td>${item.atividade||''}</td><td>${item.descricao||''}</td><td>${prazo}</td><td>${item.status||''}</td></tr>`;
            });
            html += `</tbody></table>`;
        } else {
            html += `<p>Nenhum item no plano de ação.</p>`;
        }
        html += `</div>`;
        html += '</body></html>';
        const win = window.open('', `Relatório - ${e.nome}`);
        win.document.write(html);
        win.document.close();
        showToast("Relatório gerado!", "success");
    };
    request.onerror = (e) => console.error("Erro ao gerar relatório:", e);
}

// ==========================================
// RECONHECIMENTO DE VOZ - WEB SPEECH API
// ==========================================
let currentRecognition = null;
let currentTargetInput = null;
let isRecording = false;

function toggleRecognition(button) {
    const targetId = button.dataset.target;
    const input = document.getElementById(targetId);
    if (!input) return showToast("Campo de entrada não encontrado!", "error");

    if (isRecording) return stopRecognition(button);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return showToast("❌ Reconhecimento de voz não suportado.", "error");

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;
    currentRecognition = recognition;
    currentTargetInput = input;

    recognition.onstart = () => {
        isRecording = true;
        button.classList.add('active');
        button.innerHTML = '<i class="bi bi-mic-fill" style="color: red;"></i>';
        button.style.animation = 'pulse 1.5s infinite';
        if ('vibrate' in navigator) navigator.vibrate(50);
        showToast("🎤 Ouvindo...", "success");
    };

    recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            }
        }
        if (finalTranscript) addTextToInput(finalTranscript);
    };

    recognition.onerror = (event) => {
        console.error('Erro no reconhecimento:', event.error);
        showToast(`Erro: ${event.error}`, "error");
        stopRecognition(button);
    };
    
    recognition.onend = () => {
        if(isRecording) stopRecognition(button); // Garante que pare se a conexão for perdida, etc.
    };

    recognition.start();
}

function stopRecognition(button) {
    if (currentRecognition) {
        currentRecognition.stop();
        currentRecognition = null;
    }
    isRecording = false;
    if (button) {
        button.classList.remove('active');
        button.innerHTML = '<i class="bi bi-mic-fill"></i>';
        button.style.animation = '';
    }
    showToast("⏸️ Gravação parada.", "warning");
}

function addTextToInput(text) {
    if (!currentTargetInput || !text) return;
    const currentValue = currentTargetInput.value.trim();
    currentTargetInput.value = currentValue ? currentValue + ' ' + text : text.charAt(0).toUpperCase() + text.slice(1);
    currentTargetInput.dispatchEvent(new Event('input', { bubbles: true }));
}

window.addEventListener('beforeunload', () => {
    if (currentRecognition) stopRecognition(null);
});

if (!document.getElementById('voice-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'voice-styles';
    styleSheet.textContent = `
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        button.active { background-color: #fee2e2 !important; border-color: #ef4444 !important; }
        .sortable-ghost { opacity: 0.4; background: var(--primary-light); }
    `;
    document.head.appendChild(styleSheet);
}

// PWA Install Prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log(`'beforeinstallprompt' event was fired.`);
});

console.log("✅ App.js carregado com sucesso!");