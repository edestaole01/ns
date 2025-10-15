// Aguarda o conteúdo da página ser totalmente carregado
document.addEventListener('DOMContentLoaded', () => {
    // Procura o elemento HTML que criamos para a versão
    const versionElement = document.getElementById('app-version-display');
    
    // Verifica se o elemento e a variável APP_VERSION existem
    if (versionElement && typeof APP_VERSION !== 'undefined') {
      // Insere o texto da versão no elemento
      versionElement.textContent = 'v' + APP_VERSION;
    }
  });

// O array predefinedRisks agora está em risks-data.js
// Ele será carregado automaticamente quando o index.html incluir o arquivo

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

const request = indexedDB.open("fluentInspecoesDB", 1);
request.onerror = (e) => console.error("Erro no DB:", e);
request.onsuccess = (e) => { db = e.target.result; showDashboard(); };
request.onupgradeneeded = (e) => e.target.result.createObjectStore("inspections", { keyPath: "id", autoIncrement: true });

const dashboardView = document.getElementById('dashboard-view');
const wizardView = document.getElementById('wizard-view');
const actionPlanView = document.getElementById('action-plan-view');

document.getElementById('nav-dashboard').onclick = showDashboard;

// ==========================================
// HELPER: ADICIONAR VOZ EM TODOS OS CAMPOS
// ==========================================

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text || '').replace(/[&<>"']/g, m => map[m]);
}

/**
 * Envolve um input ou textarea com um botão de voz
 * @param {string} fieldId - ID do campo de entrada
 * @param {string} placeholder - Placeholder do campo (opcional)
 * @param {string} value - Valor inicial do campo (opcional)
 * @param {boolean} required - Se o campo é obrigatório (opcional)
 * @param {string} type - Tipo do input (text, date, etc)
 * @returns {string} HTML do campo envolvido com botão de voz
 */
function wrapWithVoiceButton(fieldId, placeholder = '', value = '', required = false, type = 'text') {
    const requiredAttr = required ? 'required' : '';
    const inputHTML = type === 'textarea' 
        ? `<textarea id="${fieldId}" ${requiredAttr} rows="3" placeholder="${placeholder}" style="flex-grow: 1;">${value}</textarea>`
        : `<input type="${type}" id="${fieldId}" ${requiredAttr} value="${escapeHtml(value)}" placeholder="${placeholder}" style="flex-grow: 1;">`;
    
    return `
        <div style="display: flex; gap: 0.5rem; align-items: ${type === 'textarea' ? 'flex-start' : 'center'};">
            ${inputHTML}
            <button type="button" class="outline" onclick="toggleRecognition(this)" data-target="${fieldId}" title="Ativar ditado por voz" style="${type === 'textarea' ? 'margin-top: 0.5rem;' : ''}">
                <i class="bi bi-mic-fill"></i>
            </button>
        </div>
    `;
}

// ==========================================
// FUNÇÕES AUXILIARES E GENÉRICAS
// ==========================================

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
    dashboardView.classList.add('hidden');
    wizardView.classList.add('hidden');
    actionPlanView.classList.add('hidden');
    if (viewName === 'dashboard') dashboardView.classList.remove('hidden');
    else if (viewName === 'wizard') wizardView.classList.remove('hidden');
    else if (viewName === 'actionPlan') actionPlanView.classList.remove('hidden');
}

function createButton(innerHTML, className, onClick) {
    const button = document.createElement('button');
    button.innerHTML = innerHTML;
    button.className = className;
    button.onclick = onClick;
    return button;
}

function deleteItem(type, index) {
    let list, itemName, listUpdater;

    if (type === 'departamento') {
        list = currentInspection.departamentos;
        itemName = list[index]?.nome;
        listUpdater = updateDepartamentoList;
    } else {
        const depto = currentInspection.departamentos[activeDepartamentoIndex];
        const itemMap = {
            cargo: { list: depto.cargos, name: depto.cargos[index]?.nome, updater: updateCargoList },
            funcionario: { list: depto.funcionarios, name: depto.funcionarios[index]?.nome, updater: updateFuncionarioList },
            grupo: { list: depto.grupos, name: `Grupo: ${depto.grupos[index]?.listaDeCargos.join(', ')}`, updater: updateGrupoList }
        };
        if (!itemMap[type]) return;
        list = itemMap[type].list;
        itemName = itemMap[type].name;
        listUpdater = itemMap[type].updater;
    }

    if (confirm(`Excluir o ${type} "${itemName}"? Esta ação não pode ser desfeita.`)) {
        list.splice(index, 1);
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} excluído!`, "success");
        listUpdater();
        persistCurrentInspection();
        if (type === 'departamento') updateDashboardStats();
    }
}

function duplicateItem(type, index) {
    let list, originalItem, newItem, listUpdater;

    if (type === 'departamento') {
        list = currentInspection.departamentos;
        originalItem = list[index];
        listUpdater = updateDepartamentoList;
        newItem = JSON.parse(JSON.stringify(originalItem));
        newItem.nome = `${originalItem.nome} (Cópia)`;
    } else {
        const depto = currentInspection.departamentos[activeDepartamentoIndex];
        const itemMap = {
            cargo: { list: depto.cargos, updater: updateCargoList },
            funcionario: { list: depto.funcionarios, updater: updateFuncionarioList },
            grupo: { list: depto.grupos, updater: updateGrupoList }
        };
        if (!itemMap[type]) return;
        list = itemMap[type].list;
        originalItem = list[index];
        listUpdater = itemMap[type].updater;
        newItem = JSON.parse(JSON.stringify(originalItem));

        if (type === 'grupo') {
            newItem.id = 'grupo_' + Date.now();
            if (newItem.listaDeCargos.length > 0) {
                newItem.listaDeCargos[0] = `${newItem.listaDeCargos[0]} (Cópia)`;
            }
        } else {
            newItem.nome = `${originalItem.nome} (Cópia)`;
        }
    }

    list.splice(index + 1, 0, newItem);
    listUpdater();
    persistCurrentInspection();
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} duplicado com sucesso!`, "success");
}

// ==========================================
// LÓGICA PRINCIPAL E NAVEGAÇÃO
// ==========================================

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
                    <button class="secondary" onclick="saveAndExit()">Salvar e Voltar ao Painel</button>
                </div>
            </div>`;
    } else {
        h.innerHTML = '';
    }
}

// ==========================================
// PASSO 1: EMPRESA - COM VOZ
// ==========================================

function renderEmpresaStep() {
    const e = currentInspection.empresa || {};
    document.getElementById('wizard-content').innerHTML = `
        <div class="card">
            <h2>Passo 1: Detalhes da Empresa</h2>
            <form id="empresa-form" oninput="triggerAutosave()">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="nome">Nome da Empresa *</label>
                        ${wrapWithVoiceButton('nome', 'Ex: Acme Corporation', e.nome || '', true)}
                    </div>
                    <div class="form-group">
                        <label for="cnpj">CNPJ</label>
                        ${wrapWithVoiceButton('cnpj', '00.000.000/0000-00', e.cnpj || '')}
                    </div>
                </div>
                <div class="form-grid">
                    <div class="form-group"><label for="data">Data da Inspeção</label><input type="date" id="data" value="${e.data || new Date().toISOString().slice(0,10)}"></div>
                    <div class="form-group">
                        <label for="elaborado">Elaborado por</label>
                        ${wrapWithVoiceButton('elaborado', 'Nome do responsável', e.elaborado || '')}
                    </div>
                </div>
                <div class="form-group">
                    <label for="aprovado">Aprovado por</label>
                    ${wrapWithVoiceButton('aprovado', 'Nome do aprovador', e.aprovado || '')}
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

// ==========================================
// PASSO 2: DEPARTAMENTOS - COM VOZ
// ==========================================

function renderDepartamentoStep() {
    document.getElementById('wizard-content').innerHTML = `
        <div class="card">
            <div class="breadcrumb">Empresa: <strong>${escapeHtml(currentInspection.empresa.nome)}</strong></div>
            <h3>Departamentos Adicionados <small style="font-weight: 400; color: var(--gray-500);">(Arraste para reordenar)</small></h3>
            <ul id="departamento-list" class="item-list"></ul>
            <h3 id="depto-form-title">Novo Departamento</h3>
            <form id="depto-form">
                <div class="form-group">
                    <label for="depto-nome">Nome do Setor/Departamento *</label>
                    ${wrapWithVoiceButton('depto-nome', 'Ex: Produção, Administrativo', '', true)}
                </div>
                <div class="form-group">
                    <label for="depto-caracteristica">Característica do Setor</label>
                    ${wrapWithVoiceButton('depto-caracteristica', 'Ex: Área industrial', '')}
                </div>
                <div class="form-group">
                    <label for="depto-descricao">Descrição da Atividade do Setor</label>
                    ${wrapWithVoiceButton('depto-descricao', 'Descreva as principais atividades...', '', false, 'textarea')}
                </div>
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
    list.innerHTML = "";

    if (!currentInspection.departamentos || currentInspection.departamentos.length === 0) {
        list.innerHTML = '<li class="empty-state">Nenhum departamento adicionado.</li>';
        return;
    }
    
    currentInspection.departamentos.forEach((depto, index) => {
        const li = document.createElement("li");
        
        const itemInfo = document.createElement('div');
        itemInfo.className = 'item-info';
        itemInfo.innerHTML = `<strong>${escapeHtml(depto.nome)}</strong><small>${escapeHtml(depto.caracteristica || "Sem característica")}</small>`;
        
        const itemActions = document.createElement('div');
        itemActions.className = 'item-actions';
        
        itemActions.appendChild(createButton('Editar', 'outline', () => editDepartamento(index)));
        itemActions.appendChild(createButton('<i class="bi bi-copy"></i> Duplicar', 'outline', () => duplicateItem('departamento', index)));
        itemActions.appendChild(createButton('Excluir', 'danger', () => deleteItem('departamento', index)));
        itemActions.appendChild(createButton('Cargos/Func.', 'primary', () => goToCargos(index)));
        
        li.appendChild(itemInfo);
        li.appendChild(itemActions);
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
        if (!currentInspection.departamentos) {
            currentInspection.departamentos = [];
        }
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
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
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

// ==========================================
// PASSO 3: CARGOS/FUNCIONÁRIOS/GRUPOS - COM VOZ
// ==========================================

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
        <div class="form-group">
            <label for="${prefix}-perfil-exposicao">Observação específica (Perfil de Exposição)</label>
            ${wrapWithVoiceButton(`${prefix}-perfil-exposicao`, 'Ex: A soma da exposição ao agente FRD em todos os períodos de acesso é de ___ min...', '', false, 'textarea')}
        </div>
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
    
    // Verifica se está no mobile
    const isMobile = window.innerWidth <= 768;
    const detailsAttr = isMobile ? 'open' : ''; // No mobile, abre por padrão
    
    document.getElementById('wizard-content').innerHTML = `
        <div class="card">
            <div class="breadcrumb">${escapeHtml(currentInspection.empresa.nome)} › <strong>${escapeHtml(depto.nome)}</strong></div>
            <h3>Grupos de Cargos <small style="font-weight: 400; color: var(--gray-500);">(Arraste para reordenar)</small></h3>
            <ul id="grupo-list" class="item-list"></ul>
            <details id="grupo-form-details" class="accordion-section" ${detailsAttr}>
                <summary onclick="toggleAccordion(event, 'grupo-form-details')">Adicionar Novo Grupo</summary>
                <div>
                    <form id="grupo-form">
                        <div class="form-group">
                            <label for="grupo-nomes">Nomes dos Cargos do Grupo (um por linha) *</label>
                            ${wrapWithVoiceButton('grupo-nomes', 'Motorista A\nMotorista B', '', true, 'textarea')}
                            <small>Cargos em um grupo compartilham os mesmos riscos e detalhes.</small>
                        </div>
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
            <details id="cargo-form-details" class="accordion-section" ${detailsAttr}>
                <summary onclick="toggleAccordion(event, 'cargo-form-details')">Adicionar Novo Cargo Individual</summary>
                <div>
                    <form id="cargo-form">
                        <div class="form-group">
                            <label for="cargo-nome">Nome do Cargo *</label>
                            ${wrapWithVoiceButton('cargo-nome', 'Ex: Operador de Máquina', '', true)}
                        </div>
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
            <details id="funcionario-form-details" class="accordion-section" ${detailsAttr}>
                <summary onclick="toggleAccordion(event, 'funcionario-form-details')">Adicionar Novo Funcionário Individual</summary>
                <div>
                    <form id="funcionario-form">
                        <div class="form-group">
                            <label for="funcionario-nome">Nome do Funcionário *</label>
                            ${wrapWithVoiceButton('funcionario-nome', 'Ex: João da Silva', '', true)}
                        </div>
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
    const list = document.getElementById("cargo-list");
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    list.innerHTML = "";
    
    if (!depto.cargos || depto.cargos.length === 0) {
        list.innerHTML = '<li class="empty-state">Nenhum cargo individual.</li>';
        return;
    }

    depto.cargos.forEach((cargo, index) => {
        const li = document.createElement("li");
        const obsText = (cargo.observacoes || []).length > 0 ? (cargo.observacoes || []).slice(0, 2).join(', ') + ((cargo.observacoes || []).length > 2 ? '...' : '') : 'Sem observações';
        
        const itemInfo = document.createElement('div');
        itemInfo.className = 'item-info';
        itemInfo.innerHTML = `<strong>${escapeHtml(cargo.nome)}</strong><small>${(cargo.riscos || []).length} risco(s) | ${escapeHtml(obsText)}</small>`;
        
        const itemActions = document.createElement('div');
        itemActions.className = 'item-actions';
        
        itemActions.appendChild(createButton('Editar', 'outline', () => editCargo(index)));
        itemActions.appendChild(createButton('<i class="bi bi-copy"></i> Duplicar', 'outline', () => duplicateItem('cargo', index)));
        itemActions.appendChild(createButton('Excluir', 'danger', () => deleteItem('cargo', index)));
        itemActions.appendChild(createButton('Riscos', 'primary', () => goToRiscos(index, 'cargo')));

        li.appendChild(itemInfo);
        li.appendChild(itemActions);
        list.appendChild(li);
    });
}

function updateGrupoList() {
    const list = document.getElementById("grupo-list");
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    list.innerHTML = "";

    if (!depto.grupos || depto.grupos.length === 0) {
        list.innerHTML = '<li class="empty-state">Nenhum grupo.</li>';
        return;
    }

    depto.grupos.forEach((grupo, index) => {
        const li = document.createElement("li");
        
        const itemInfo = document.createElement('div');
        itemInfo.className = 'item-info';
        itemInfo.innerHTML = `<strong>Grupo: ${escapeHtml(grupo.listaDeCargos.join(', '))}</strong><small>${(grupo.riscos || []).length} risco(s)</small>`;

        const itemActions = document.createElement('div');
        itemActions.className = 'item-actions';
        
        itemActions.appendChild(createButton('Editar', 'outline', () => editGrupo(index)));
        itemActions.appendChild(createButton('<i class="bi bi-copy"></i> Duplicar', 'outline', () => duplicateItem('grupo', index)));
        itemActions.appendChild(createButton('Excluir', 'danger', () => deleteItem('grupo', index)));
        itemActions.appendChild(createButton('Riscos', 'primary', () => goToRiscos(index, 'grupo')));

        li.appendChild(itemInfo);
        li.appendChild(itemActions);
        list.appendChild(li);
    });
}

function updateFuncionarioList() {
    const list = document.getElementById("funcionario-list");
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    list.innerHTML = "";

    if (!depto.funcionarios || depto.funcionarios.length === 0) {
        list.innerHTML = '<li class="empty-state">Nenhum funcionário individual.</li>';
        return;
    }

    depto.funcionarios.forEach((func, index) => {
        const li = document.createElement("li");
        const obsText = (func.observacoes || []).length > 0 ? (func.observacoes || []).slice(0, 2).join(', ') + '...' : 'Sem observações';
        
        const itemInfo = document.createElement('div');
        itemInfo.className = 'item-info';
        itemInfo.innerHTML = `<strong>${escapeHtml(func.nome)}</strong><small>${(func.riscos || []).length} risco(s) | ${escapeHtml(obsText)}</small>`;

        const itemActions = document.createElement('div');
        itemActions.className = 'item-actions';

        itemActions.appendChild(createButton('Editar', 'outline', () => editFuncionario(index)));
        itemActions.appendChild(createButton('<i class="bi bi-copy"></i> Duplicar', 'outline', () => duplicateItem('funcionario', index)));
        itemActions.appendChild(createButton('Excluir', 'danger', () => deleteItem('funcionario', index)));
        itemActions.appendChild(createButton('Riscos', 'primary', () => goToRiscos(index, 'funcionario')));
        
        li.appendChild(itemInfo);
        li.appendChild(itemActions);
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

function populateForm(prefix, data) {
    if (!data) return;
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
        if (checkboxId && document.getElementById(checkboxId)) document.getElementById(checkboxId).checked = true;
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
        if (checkboxId && document.getElementById(checkboxId)) document.getElementById(checkboxId).checked = true;
    });
}

function editCargo(index) {
    editingIndex = index;
    editingType = 'cargo';
    const cargo = currentInspection.departamentos[activeDepartamentoIndex].cargos[index];
    
    forceOpenAccordionOnMobile('cargo-form-details'); // ADICIONE ESTA LINHA
    document.getElementById("cargo-form-details").setAttribute("open", "");
    
    document.getElementById("cargo-nome").value = cargo.nome || '';
    populateForm('cargo', cargo);
    document.getElementById("save-cargo-btn").innerHTML = "Salvar Alterações";
    document.getElementById("cancel-cargo-edit-btn").classList.remove("hidden");
    document.getElementById('cargo-form-details').scrollIntoView({ behavior: 'smooth' });
}

function editFuncionario(index) {
    editingIndex = index;
    editingType = 'funcionario';
    const funcionario = currentInspection.departamentos[activeDepartamentoIndex].funcionarios[index];
    
    forceOpenAccordionOnMobile('funcionario-form-details'); // ADICIONE ESTA LINHA
    document.getElementById("funcionario-form-details").setAttribute("open", "");
    
    document.getElementById("funcionario-nome").value = funcionario.nome || '';
    populateForm('funcionario', funcionario);
    document.getElementById("save-funcionario-btn").innerHTML = "Salvar Alterações";
    document.getElementById("cancel-funcionario-edit-btn").classList.remove("hidden");
    document.getElementById('funcionario-form-details').scrollIntoView({ behavior: 'smooth' });
}

function editGrupo(index) {
    editingIndex = index;
    editingType = 'grupo';
    const grupo = currentInspection.departamentos[activeDepartamentoIndex].grupos[index];
    
    forceOpenAccordionOnMobile('grupo-form-details'); // ADICIONE ESTA LINHA
    document.getElementById("grupo-form-details").setAttribute("open", "");
    
    document.getElementById("grupo-nomes").value = (grupo.listaDeCargos || []).join('\n');
    populateForm('grupo', grupo);
    document.getElementById("save-grupo-btn").innerHTML = "Salvar Alterações";
    document.getElementById("cancel-grupo-edit-btn").classList.remove("hidden");
    document.getElementById('grupo-form-details').scrollIntoView({ behavior: 'smooth' });
}

function clearForm(type) {
    editingIndex = -1;
    editingType = null;
    document.getElementById(`${type}-form`).reset();
    document.getElementById(`save-${type}-btn`).innerHTML = type === 'grupo' ? "Criar Grupo" : `Adicionar ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    document.getElementById(`cancel-${type}-edit-btn`).classList.add("hidden");
    document.getElementById(`${type}-form-details`).removeAttribute("open");
}

function goToRiscos(index, type) {
    activeCargoIndex = type === 'cargo' ? index : -1;
    activeFuncionarioIndex = type === 'funcionario' ? index : -1;
    currentGroupId = type === 'grupo' ? currentInspection.departamentos[activeDepartamentoIndex].grupos[index].id : null;
    nextStep();
}

// ==========================================
// PASSO 4: RISCOS - COM VOZ
// ==========================================

function renderRiscoStep() {
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    const isMobile = window.innerWidth <= 768;
    let breadcrumbText = '', tituloRiscos = '', infoBox = '', targetObject;
    let currentContextValue = '';
    
    if (currentGroupId) {
        const grupo = depto.grupos.find(g => g.id === currentGroupId);
        if (!grupo) { showToast("Grupo não encontrado.", "error"); prevStep(); return; }
        const nomesGrupo = grupo.listaDeCargos.join(', ');
        breadcrumbText = `${escapeHtml(currentInspection.empresa.nome)} › ${escapeHtml(depto.nome)} › <strong>Grupo: ${escapeHtml(nomesGrupo)}</strong>`;
        tituloRiscos = `Riscos do Grupo (${grupo.listaDeCargos.length} cargos)`;
        infoBox = `<div style="padding:1rem;background:var(--primary-light);border-left:4px solid var(--primary);border-radius:.5rem;margin-bottom:1.5rem;"><strong style="display:block;margin-bottom:.5rem;color:var(--gray-900);">Modo Grupo</strong><p style="margin:0;color:var(--gray-700);font-size:.95rem;">Os riscos aqui serão aplicados a todos os cargos do grupo.</p></div>`;
        currentContextValue = `grupo-${depto.grupos.findIndex(g => g.id === currentGroupId)}`;
    } else if (activeCargoIndex > -1) {
        targetObject = depto.cargos[activeCargoIndex];
        if (!targetObject) { showToast("Cargo não encontrado.", "error"); prevStep(); return; }
        breadcrumbText = `${escapeHtml(currentInspection.empresa.nome)} › ${escapeHtml(depto.nome)} › <strong>Cargo: ${escapeHtml(targetObject.nome)}</strong>`;
        tituloRiscos = 'Riscos Identificados';
        currentContextValue = `cargo-${activeCargoIndex}`;
    } else if (activeFuncionarioIndex > -1) {
        targetObject = depto.funcionarios[activeFuncionarioIndex];
        if (!targetObject) { showToast("Funcionário não encontrado.", "error"); prevStep(); return; }
        breadcrumbText = `${escapeHtml(currentInspection.empresa.nome)} › ${escapeHtml(depto.nome)} › <strong>Funcionário: ${escapeHtml(targetObject.nome)}</strong>`;
        tituloRiscos = 'Riscos Identificados';
        currentContextValue = `funcionario-${activeFuncionarioIndex}`;
    } else {
        prevStep(); return;
    }
    
    const riskTypes = [...new Set(predefinedRisks.map(r => r.tipo.replace(' PSICOSSOCIAIS', '')))];
    let quickNavOptions = (depto.cargos || []).map((c, i) => `<option value="cargo-${i}" ${currentContextValue === `cargo-${i}` ? 'selected' : ''}>Cargo: ${escapeHtml(c.nome)}</option>`).join('');
    quickNavOptions += (depto.funcionarios || []).map((f, i) => `<option value="funcionario-${i}" ${currentContextValue === `funcionario-${i}` ? 'selected' : ''}>Funcionário: ${escapeHtml(f.nome)}</option>`).join('');
    quickNavOptions += (depto.grupos || []).map((g, i) => `<option value="grupo-${i}" ${currentContextValue === `grupo-${i}` ? 'selected' : ''}>Grupo: ${escapeHtml(g.listaDeCargos.join(', '))}</option>`).join('');
    
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
                <div class="form-group">
                    <label for="risco-perigo">Descrição (Nome) do Perigo *</label>
                    ${wrapWithVoiceButton('risco-perigo', 'Ex: Ruído contínuo acima de 85 dB', '', true)}
                </div>
                <div class="form-group">
                    <label for="risco-descricao-detalhada">Descrição Detalhada</label>
                    ${wrapWithVoiceButton('risco-descricao-detalhada', 'Detalhe o contexto do risco...', '', false, 'textarea')}
                </div>
                <details class="accordion-section">
                    <summary>Fonte, Medição e Exposição</summary>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="risco-fonte">Fonte Geradora</label>
                            ${wrapWithVoiceButton('risco-fonte', 'Ex: Compressor', '')}
                        </div>
                        <div class="form-group">
                            <label for="risco-perfil-exposicao">Perfil de exposição</label>
                            ${wrapWithVoiceButton('risco-perfil-exposicao', 'Ex: Contínuo', '')}
                        </div>
                        <div class="form-group">
                            <label for="risco-medicao">Medição</label>
                            ${wrapWithVoiceButton('risco-medicao', 'Ex: 92 dB', '')}
                        </div>
                        <div class="form-group">
                            <label for="risco-tempo-exposicao">Tempo de Exposição</label>
                            ${wrapWithVoiceButton('risco-tempo-exposicao', 'Ex: 8h', '')}
                        </div>
                        <div class="form-group"><label for="risco-tipo-exposicao">Tipo de Exposição</label><select id="risco-tipo-exposicao"><option>Permanente</option><option>Ocasional</option><option>Intermitente</option></select></div>
                        <div class="form-group">
                            <label for="risco-esocial">Código E-Social</label>
                            ${wrapWithVoiceButton('risco-esocial', 'Ex: 01.01.001', '')}
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="risco-obs-ambientais">Observações de registros ambientais</label>
                        ${wrapWithVoiceButton('risco-obs-ambientais', 'Observações...', '', false, 'textarea')}
                    </div>
                </details>
                <details class="accordion-section">
                    <summary>Análise e Avaliação</summary>
                    <div class="form-grid">
                        <div class="form-group"><label for="risco-probabilidade">Probabilidade</label><select id="risco-probabilidade"><option>Improvável</option><option>Provável</option><option>Remota</option><option>Frequente</option></select></div>
                        <div class="form-group"><label for="risco-severidade">Severidade</label><select id="risco-severidade"><option>Baixa</option><option>Média</option><option>Alta</option><option>Crítica</option></select></div>
                        <div class="form-group"><label for="risco-aceitabilidade">Aceitabilidade</label><select id="risco-aceitabilidade"><option>Tolerável</option><option>Não Tolerável</option></select></div>
                    </div>
                    <div class="form-group">
                        <label for="risco-danos">Danos Potenciais</label>
                        ${wrapWithVoiceButton('risco-danos', 'Descreva os possíveis danos...', '', false, 'textarea')}
                    </div>
                </details>
                <details class="accordion-section">
                    <summary>Controles e Ações</summary>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="risco-epi-utilizado">EPI Utilizado</label>
                            ${wrapWithVoiceButton('risco-epi-utilizado', 'Ex: Protetor auricular', '')}
                        </div>
                        <div class="form-group">
                            <label for="risco-ca">CA (Certificado de Aprovação)</label>
                            ${wrapWithVoiceButton('risco-ca', 'Ex: 12345', '')}
                        </div>
                        <div class="form-group">
                            <label for="risco-epc">EPC Existente</label>
                            ${wrapWithVoiceButton('risco-epc', 'Ex: Cabine acústica', '')}
                        </div>
                        <div class="form-group">
                            <label for="risco-epi-sugerido">EPI Sugerido</label>
                            ${wrapWithVoiceButton('risco-epi-sugerido', 'Ex: Protetor tipo concha', '')}
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="risco-acoes">Ações Necessárias</label>
                        ${wrapWithVoiceButton('risco-acoes', 'Descreva as ações recomendadas...', '', false, 'textarea')}
                    </div>
                    <div class="form-group">
                        <label for="risco-observacoes-gerais">Observações Gerais</label>
                        ${wrapWithVoiceButton('risco-observacoes-gerais', 'Observações adicionais...', '', false, 'textarea')}
                    </div>
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
        li.innerHTML = `<div class="item-info"><strong>${escapeHtml(risco.perigo)}</strong><span class="badge">${escapeHtml(risco.tipo)}</span><small>Fonte: ${escapeHtml(risco.fonteGeradora||"N/A")} | Severidade: ${escapeHtml(risco.severidade||"N/A")}</small></div><div class="item-actions"><button class="outline" onclick="editRisco(${index})">Editar</button><button class="danger" onclick="deleteRisco(${index})">Excluir</button></div>`;
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
    updatePerigoOptions(risco.tipo);
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
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
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
    updatePerigoOptions('');
    document.getElementById("risco-form-title").innerText = "Novo Risco";
    document.getElementById("save-risco-btn").innerHTML = "<i class='bi bi-plus-lg'></i> Adicionar";
    document.getElementById("cancel-risco-edit-btn").classList.add("hidden");
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

// ==========================================
// DASHBOARD E GERENCIAMENTO DE INSPEÇÕES
// ==========================================

function saveAndExit() {
    persistCurrentInspection((success) => {
        if(success) { showToast('Inspeção salva!', 'success'); showDashboard(); }
        else { showToast('Não foi possível salvar.', 'error'); }
    });
}

function loadInspections() {
    const request = db.transaction(["inspections"], "readonly").objectStore("inspections").getAll();
    request.onerror = () => {
        document.getElementById("inspection-list").innerHTML = 
            '<li class="empty-state" style="color: var(--danger);">Erro ao carregar as inspeções.</li>';
    };
    request.onsuccess = () => {
        const listElement = document.getElementById("inspection-list");
        const inspections = request.result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        if (inspections.length === 0) {
            listElement.innerHTML = '<li class="empty-state">Nenhuma inspeção salva.</li>';
            return;
        }
        const listHTML = inspections.map(inspection => {
            const lastUpdated = inspection.updatedAt 
                ? new Date(inspection.updatedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) 
                : 'N/A';
            return `
                <li>
                    <div class="item-info">
                        <strong>${escapeHtml(inspection.empresa.nome)}</strong>
                        <small>Data da Inspeção: ${formatDateBR(inspection.empresa.data)}</small>  
                        <small style="display: block; margin-top: 4px; color: var(--gray-500);">
                            Última alteração: ${lastUpdated}
                        </small>
                    </div>
                    <div class="item-actions">
                        <button class="outline" onclick="generateInspectionReport(${inspection.id})"><i class="bi bi-file-earmark-text"></i> Relatório</button>
                        <button class="primary" onclick="showActionPlanView(${inspection.id})"><i class="bi bi-clipboard2-check"></i> Plano de Ação</button>
                        <button class="secondary" onclick="editInspection(${inspection.id})"><i class="bi bi-pencil-fill"></i> Editar</button>
                        <button class="outline" onclick="duplicateInspection(${inspection.id})"><i class="bi bi-copy"></i> Duplicar</button>
                        <button class="danger" onclick="deleteInspection(${inspection.id})"><i class="bi bi-trash3-fill"></i> Excluir</button>
                    </div>
                </li>`;
        }).join('');
        listElement.innerHTML = listHTML;
    };
}

function editInspection(id) {
    const request = db.transaction(["inspections"], "readonly").objectStore("inspections").get(id);
    request.onsuccess = () => {
        currentInspection = request.result;
        wizardStep = 0;
        showWizard();
    };
    request.onerror = (e) => console.error("Erro ao carregar inspeção:", e);
}

function deleteInspection(id) {
    if (confirm('Excluir esta inspeção permanentemente? A ação não pode ser desfeita.')) {
        const request = db.transaction(["inspections"], "readwrite").objectStore("inspections").delete(id);
        request.onsuccess = () => {
            showToast('Inspeção excluída!', 'success');
            loadInspections();
            updateDashboardStats();
        };
        request.onerror = (e) => console.error("Erro ao excluir:", e);
    }
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

function getAllInspections(callback) {
    const request = db.transaction(["inspections"], "readonly").objectStore("inspections").getAll();
    request.onsuccess = () => callback(request.result);
    request.onerror = (e) => console.error("Erro ao buscar inspeções:", e);
}

// ==========================================
// PLANO DE AÇÃO - COM VOZ
// ==========================================

function renderActionPlanView() {
    if (!currentInspection) return; 
    const e = currentInspection.empresa || {};
    actionPlanView.innerHTML = `
        <div class="card">
            <div class="header">
                <div>
                    <h1>Plano de Ação</h1>
                    <p style="color:var(--gray-600)">Inspeção: ${escapeHtml(e.nome)}</p>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span id="autosave-status" style="color: var(--gray-600); font-size: 0.85rem; transition: all 0.3s ease; opacity: 0;"></span>
                    <button class="nav" onclick="showDashboard()">Voltar ao Painel</button>
                </div>
            </div>
            <h3>Itens de Ação</h3>
            <ul id="action-item-list" class="item-list"></ul>
            <h3 id="action-form-title">Novo Item</h3>
            <form id="action-item-form" oninput="triggerAutosave()">
                <div class="form-group">
                    <label for="action-atividade">Atividade *</label>
                    ${wrapWithVoiceButton('action-atividade', 'Ex: Implementar treinamento de segurança', '', true)}
                </div>
                <div class="form-group">
                    <label for="action-descricao">Descrição</label>
                    ${wrapWithVoiceButton('action-descricao', 'Descreva os detalhes da ação...', '', false, 'textarea')}
                </div>
                <div class="form-grid">
                    <div class="form-group"><label for="action-prazo-inicio">Prazo Início</label><input type="date" id="action-prazo-inicio"></div>
                    <div class="form-group"><label for="action-prazo-fim">Prazo Fim</label><input type="date" id="action-prazo-fim"></div>
                </div>
                <div class="form-group"><label for="action-status">Status</label><select id="action-status"><option>Pendente</option><option>Em Andamento</option><option>Concluída</option></select></div>
                <div class="form-actions">
                    <button type="button" class="primary" id="save-action-btn" onclick="saveActionItem()">Adicionar Item</button>
                    <button type="button" class="nav hidden" id="cancel-action-edit-btn" onclick="clearActionForm()">Cancelar</button>
                </div>
            </form>
        </div>`;
    updateActionItemList();
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

function updateActionItemList() {
    const list = document.getElementById("action-item-list");
    if (!currentInspection.planoDeAcao || currentInspection.planoDeAcao.length === 0) { 
        list.innerHTML = '<li class="empty-state">Nenhum item no plano de ação.</li>'; 
        return; 
    }
    list.innerHTML = "";
    currentInspection.planoDeAcao.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `<div class="item-info"><strong>${escapeHtml(item.atividade)}</strong><small>Prazo: ${item.prazoInicio||'N/A'} a ${item.prazoFim||'N/A'}</small></div><div class="item-actions"><span class="badge">${escapeHtml(item.status||'Pendente')}</span><button class="outline" onclick="editActionItem(${index})">Editar</button><button class="danger" onclick="deleteActionItem(${index})">Excluir</button></div>`;
        list.appendChild(li);
    });
}

function formatDateBR(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
    } catch (e) {
        return 'Data inválida';
    }
}

function saveActionItem() {
    const itemData = { 
        atividade: document.getElementById("action-atividade").value, 
        descricao: document.getElementById("action-descricao").value, 
        prazoInicio: document.getElementById("action-prazo-inicio").value, 
        prazoFim: document.getElementById("action-prazo-fim").value, 
        status: document.getElementById("action-status").value 
    };
    if (!itemData.atividade) return showToast("A atividade é obrigatória.", "error");
    if (!currentInspection.planoDeAcao) currentInspection.planoDeAcao = [];
    if (editingIndex > -1) { 
        currentInspection.planoDeAcao[editingIndex] = itemData; 
        showToast("Item atualizado!", "success"); 
    } else { 
        currentInspection.planoDeAcao.push(itemData); 
        showToast("Item adicionado!", "success"); 
    }
    persistCurrentInspection(); 
    clearActionForm(); 
    updateActionItemList();
}

function editActionItem(index) {
    editingIndex = index; 
    const item = currentInspection.planoDeAcao[index];
    document.getElementById("action-atividade").value = item.atividade;
    document.getElementById("action-descricao").value = item.descricao;
    document.getElementById("action-prazo-inicio").value = item.prazoInicio;
    document.getElementById("action-prazo-fim").value = item.prazoFim;
    document.getElementById("action-status").value = item.status;
    document.getElementById("action-form-title").innerText = "Editando Item";
    document.getElementById("save-action-btn").innerText = "Salvar Alterações";
    document.getElementById("cancel-action-edit-btn").classList.remove("hidden");
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
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

// ==========================================
// RELATÓRIOS
// ==========================================

function generateInspectionReport(id) {
    const request = db.transaction(["inspections"], "readonly").objectStore("inspections").get(id);
    request.onsuccess = () => {
        const insp = request.result;
        if (!insp) {
            return showToast("Inspeção não encontrada!", "error");
        }
        const e = insp.empresa || {};
        const reportDate = new Date().toLocaleString('pt-BR');
        let html = `<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Relatório - ${escapeHtml(e.nome)}</title>
            <style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;margin:20px;color:#333;line-height:1.6}.header,.section{border-bottom:2px solid #eee;padding-bottom:15px;margin-bottom:20px;page-break-inside:avoid}h1{color:#1f2937;font-size:2rem}h2{color:#111827;border-bottom:1px solid #ccc;padding-bottom:5px;margin-top:2rem}h3{color:#374151;margin-top:1.5rem}h4{margin:1rem 0 .5rem;color:#4b5563}h5{color:#2563eb;margin:0 0 10px;font-size:1.1rem;padding-bottom:5px;border-bottom:1px solid #dbeafe}table{width:100%;border-collapse:collapse;margin-top:15px;font-size:.9em}th,td{border:1px solid #ccc;padding:8px;text-align:left;vertical-align:top}th{background-color:#f3f4f6;font-weight:600}.details-grid{display:grid;grid-template-columns:150px 1fr;gap:5px 15px;margin:1rem 0}.details-grid strong{color:#4b5563}.no-print{margin-bottom:20px}@media print{.no-print{display:none}body{margin:0}}.cargo-details p{margin:5px 0}.risco-card{background:#f9fafb;border:2px solid #e5e7eb;border-radius:8px;padding:15px;margin:15px 0;page-break-inside:avoid}.risco-card table{margin-bottom:15px}.risco-card th{color:white;font-weight:600}</style>
        </head><body>
            <div class="no-print"><button onclick="window.print()" style="padding:10px 20px;background:#2563eb;color:white;border:none;border-radius:5px;cursor:pointer;">🖨️ Imprimir/Salvar PDF</button></div>
            <div class="header"><h1>📋 Relatório de Inspeção</h1><h2>${escapeHtml(e.nome||'N/A')}</h2><div class="details-grid"><strong>CNPJ:</strong><span>${escapeHtml(e.cnpj||'N/A')}</span><strong>Data de Inspeção:</strong><span>${formatDateBR(e.data)}</span><strong>Elaborado por:</strong><span>${escapeHtml(e.elaborado||'N/A')}</span><strong>Aprovado por:</strong><span>${escapeHtml(e.aprovado||'N/A')}</span><strong>Gerado em:</strong><span>${reportDate}</span></div></div>`;
        (insp.departamentos || []).forEach(depto => {
            html += `<div class="section"><h2>🏢 Departamento: ${escapeHtml(depto.nome||'N/A')}</h2><p><strong>Característica:</strong> ${escapeHtml(depto.caracteristica||'N/A')}</p><p><strong>Descrição:</strong> ${escapeHtml(depto.descricao||'N/A')}</p>`;
            (depto.grupos || []).forEach(grupo => {
                const g = { ...grupo, nome: `Grupo: ${grupo.listaDeCargos.join(', ')}` };
                html += renderCargoReport(g, `👥 ${g.nome}`);
            });
            (depto.cargos || []).forEach(cargo => {
                html += renderCargoReport(cargo, `👤 Cargo: ${cargo.nome||'N/A'}`);
            });
            (depto.funcionarios || []).forEach(func => {
                html += renderCargoReport(func, `👷 Funcionário: ${func.nome||'N/A'}`);
            });
            html += `</div>`;
        });
        html += `<div class="section" style="page-break-before: always;"><h2>🎯 Plano de Ação</h2>`;
        if (insp.planoDeAcao && insp.planoDeAcao.length > 0) {
            html += `<table><thead><tr><th style="width:25%">Atividade</th><th>Descrição</th><th style="width:20%">Prazo</th><th style="width:15%">Status</th></tr></thead><tbody>`;
            insp.planoDeAcao.forEach(item => {
                const prazo = (item.prazoInicio ? formatDateBR(item.prazoInicio) : 'N/A') + ' a ' + (item.prazoFim ? formatDateBR(item.prazoFim) : 'N/A');
                html += `<tr><td>${escapeHtml(item.atividade||'')}</td><td>${escapeHtml(item.descricao||'')}</td><td>${prazo}</td><td>${escapeHtml(item.status||'')}</td></tr>`;
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

function renderCargoReport(cargo, titulo) {
    const req = cargo.requisitosNR || {};
    const formatChecklistItem = (value) => {
        const sim = value === 'Sim' ? 'X' : '&nbsp;';
        const nao = value === 'Não' ? 'X' : '&nbsp;';
        return `S&nbsp;(&nbsp;${sim}&nbsp;)&nbsp;&nbsp;N&nbsp;(&nbsp;${nao}&nbsp;)`;
    };
    let html = `<div style="border:2px solid #dbeafe;padding:15px;border-radius:8px;margin:20px 0;page-break-inside:avoid">
        <h3>${escapeHtml(titulo)}</h3>
        <div class="cargo-details">
            <p><strong>Observações:</strong> ${escapeHtml((cargo.observacoes||[]).join(', ')||'N/A')}</p>
            <p><strong>Perfil de Exposição (Observação Específica):</strong> ${escapeHtml(cargo.perfilExposicao||'N/A')}</p>
            <p><strong>Descrição Atividade:</strong> ${escapeHtml(cargo.descricaoAtividade||'N/A')}</p>
            <p><strong>Dados LTCAT:</strong> ${escapeHtml((cargo.dadosLtcat||[]).join(', ')||'N/A')}</p>
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
            html += `<div class="risco-card"><h5>Risco ${idx+1}: ${escapeHtml(risco.perigo||'N/A')}</h5>
            <table><thead><tr><th colspan="2" style="background:#2563eb">Informações Básicas</th></tr></thead><tbody><tr><td style="width:200px"><strong>Risco Presente:</strong></td><td>${escapeHtml(risco.riscoPresente||'N/A')}</td></tr><tr><td><strong>Tipo:</strong></td><td>${escapeHtml(risco.tipo||'N/A')}</td></tr><tr><td><strong>E-Social:</strong></td><td>${escapeHtml(risco.codigoEsocial||'N/A')}</td></tr><tr><td><strong>Descrição:</strong></td><td>${escapeHtml(risco.descricaoDetalhada||'N/A')}</td></tr></tbody></table>
            <table><thead><tr><th colspan="2" style="background:#10b981">Fonte e Exposição</th></tr></thead><tbody><tr><td style="width:200px"><strong>Fonte:</strong></td><td>${escapeHtml(risco.fonteGeradora||'N/A')}</td></tr><tr><td><strong>Perfil Exposição:</strong></td><td>${escapeHtml(risco.perfilExposicao||'N/A')}</td></tr><tr><td><strong>Medição:</strong></td><td>${escapeHtml(risco.medicao||'N/A')}</td></tr><tr><td><strong>Tempo Exposição:</strong></td><td>${escapeHtml(risco.tempoExposicao||'N/A')}</td></tr><tr><td><strong>Tipo Exposição:</strong></td><td>${escapeHtml(risco.tipoExposicao||'N/A')}</td></tr><tr><td><strong>Obs. Ambientais:</strong></td><td>${escapeHtml(risco.obsAmbientais||'N/A')}</td></tr></tbody></table>
            <table><thead><tr><th colspan="2" style="background:#f59e0b">Análise e Avaliação</th></tr></thead><tbody><tr><td style="width:200px"><strong>Probabilidade:</strong></td><td>${escapeHtml(risco.probabilidade||'N/A')}</td></tr><tr><td><strong>Severidade:</strong></td><td>${escapeHtml(risco.severidade||'N/A')}</td></tr><tr><td><strong>Aceitabilidade:</strong></td><td>${escapeHtml(risco.aceitabilidade||'N/A')}</td></tr><tr><td><strong>Danos Potenciais:</strong></td><td>${escapeHtml(risco.danos||'N/A')}</td></tr></tbody></table>
            <table><thead><tr><th colspan="2" style="background:#8b5cf6">Controles e Ações</th></tr></thead><tbody><tr><td style="width:200px"><strong>EPI Utilizado:</strong></td><td>${escapeHtml(risco.epiUtilizado||'N/A')}</td></tr><tr><td><strong>CA:</strong></td><td>${escapeHtml(risco.ca||'N/A')}</td></tr><tr><td><strong>EPC Existente:</strong></td><td>${escapeHtml(risco.epc||'N/A')}</td></tr><tr><td><strong>EPI Sugerido:</strong></td><td>${escapeHtml(risco.epiSugerido||'N/A')}</td></tr><tr><td><strong>Ações Necessárias:</strong></td><td>${escapeHtml(risco.acoesNecessarias||'N/A')}</td></tr><tr><td><strong>Obs. Gerais:</strong></td><td>${escapeHtml(risco.observacoesGerais||'N/A')}</td></tr></tbody></table></div>`;
        });
    } else { 
        html += `<p style="color:#999;font-style:italic;padding:20px;background:#f9fafb;border-radius:8px">Nenhum risco adicionado.</p>`; 
    }
    html += `</div>`; 
    return html;
}

// ==========================================
// AUTOSAVE E OUTRAS FUNCIONALIDADES
// ==========================================

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
    isAutosaving = true;
    showAutosaveStatus('saving');
    const empresaForm = document.getElementById('empresa-form');
    const riscoForm = document.getElementById('risco-form');
    const actionForm = document.getElementById('action-item-form');
    let dataUpdated = false;
    if (empresaForm && !wizardView.classList.contains('hidden')) {
        currentInspection.empresa = { 
            nome: document.getElementById("nome").value, 
            cnpj: document.getElementById("cnpj").value, 
            data: document.getElementById("data").value, 
            elaborado: document.getElementById("elaborado").value, 
            aprovado: document.getElementById("aprovado").value 
        };
        dataUpdated = true;
    }
    if (riscoForm && !wizardView.classList.contains('hidden') && editingIndex > -1) {
        const riscoData = {
            riscoPresente: document.getElementById("risco-presente").value, 
            tipo: document.getElementById("risco-tipo").value, 
            codigoEsocial: document.getElementById("risco-esocial").value, 
            perigo: document.getElementById("risco-perigo").value, 
            descricaoDetalhada: document.getElementById("risco-descricao-detalhada").value, 
            fonteGeradora: document.getElementById("risco-fonte").value, 
            perfilExposicao: document.getElementById("risco-perfil-exposicao").value, 
            medicao: document.getElementById("risco-medicao").value, 
            tempoExposicao: document.getElementById("risco-tempo-exposicao").value, 
            tipoExposicao: document.getElementById("risco-tipo-exposicao").value, 
            obsAmbientais: document.getElementById("risco-obs-ambientais").value, 
            probabilidade: document.getElementById("risco-probabilidade").value, 
            severidade: document.getElementById("risco-severidade").value, 
            aceitabilidade: document.getElementById("risco-aceitabilidade").value, 
            danos: document.getElementById("risco-danos").value, 
            epiUtilizado: document.getElementById("risco-epi-utilizado").value, 
            ca: document.getElementById("risco-ca").value, 
            epc: document.getElementById("risco-epc").value, 
            epiSugerido: document.getElementById("risco-epi-sugerido").value, 
            acoesNecessarias: document.getElementById("risco-acoes").value, 
            observacoesGerais: document.getElementById("risco-observacoes-gerais").value
        };
        const depto = currentInspection.departamentos[activeDepartamentoIndex];
        let targetArray;
        if (currentGroupId) targetArray = depto.grupos.find(g => g.id === currentGroupId)?.riscos;
        else if (activeCargoIndex > -1) targetArray = depto.cargos[activeCargoIndex]?.riscos;
        else if (activeFuncionarioIndex > -1) targetArray = depto.funcionarios[activeFuncionarioIndex]?.riscos;
        if (targetArray && targetArray[editingIndex]) {
            targetArray[editingIndex] = riscoData;
            dataUpdated = true;
        }
    }
    if (actionForm && !actionPlanView.classList.contains('hidden') && editingIndex > -1) {
        const itemData = { 
            atividade: document.getElementById("action-atividade").value, 
            descricao: document.getElementById("action-descricao").value, 
            prazoInicio: document.getElementById("action-prazo-inicio").value, 
            prazoFim: document.getElementById("action-prazo-fim").value, 
            status: document.getElementById("action-status").value 
        };
        if (currentInspection.planoDeAcao && currentInspection.planoDeAcao[editingIndex]) {
            currentInspection.planoDeAcao[editingIndex] = itemData;
            dataUpdated = true;
        }
    }
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
        onEnd: (evt) => {
            const { from, oldIndex, newIndex } = evt;
            const listId = from.id;
            let targetArray;
            if (listId === 'departamento-list') {
                targetArray = currentInspection.departamentos;
            } else if (listId === 'cargo-list') {
                targetArray = currentInspection.departamentos[activeDepartamentoIndex].cargos;
            } else if (listId === 'funcionario-list') {
                targetArray = currentInspection.departamentos[activeDepartamentoIndex].funcionarios;
            } else if (listId === 'grupo-list') {
                targetArray = currentInspection.departamentos[activeDepartamentoIndex].grupos;
            }
            if (targetArray) {
                targetArray.splice(newIndex, 0, targetArray.splice(oldIndex, 1)[0]);
                persistCurrentInspection(() => showToast("Ordem salva!", "success"));
            }
        }
    };
    ['departamento-list', 'cargo-list', 'funcionario-list', 'grupo-list'].forEach(id => {
        const el = document.getElementById(id);
        if (el) Sortable.create(el, sortableConfig);
    });
}
// ==========================================
// RECONHECIMENTO DE VOZ - WEB SPEECH API
// Versão Melhorada com Feedback Detalhado
// ==========================================

let currentRecognition = null;
let currentTargetInput = null;
let isRecording = false;
let recognitionPreview = null;

/**
 * Cria o preview visual da gravação
 */
function createRecognitionPreview() {
    if (recognitionPreview) return recognitionPreview;
    
    const preview = document.createElement('div');
    preview.id = 'recognition-preview';
    preview.style.cssText = `
        position: fixed;
        bottom: 6rem;
        right: 2rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 1rem;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 2001;
        max-width: 400px;
        min-width: 300px;
        animation: slideInUp 0.3s ease-out;
        border: 2px solid rgba(255,255,255,0.2);
    `;
    
    preview.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.3);">
            <i class="bi bi-mic-fill" style="font-size: 1.5rem; animation: pulse 1.5s infinite;"></i>
            <div>
                <strong style="display: block; font-size: 1.1rem;">Gravando...</strong>
                <small style="opacity: 0.9;">Fale claramente no microfone</small>
            </div>
        </div>
        <div id="preview-interim" style="color: rgba(255,255,255,0.7); font-style: italic; min-height: 1.5rem; margin-bottom: 0.5rem; font-size: 0.9rem;"></div>
        <div id="preview-final" style="font-weight: 500; min-height: 1.5rem; line-height: 1.4; font-size: 0.95rem;"></div>
        <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid rgba(255,255,255,0.3); font-size: 0.85rem; opacity: 0.8;">
            💡 Clique no botão de microfone novamente para parar
        </div>
    `;
    
    document.body.appendChild(preview);
    recognitionPreview = preview;
    return preview;
}

/**
 * Atualiza o preview com o texto reconhecido
 */
function updateRecognitionPreview(interimText, finalText) {
    if (!recognitionPreview) return;
    
    const interimEl = document.getElementById('preview-interim');
    const finalEl = document.getElementById('preview-final');
    
    if (interimEl) {
        interimEl.textContent = interimText || '🎤 Aguardando fala...';
    }
    
    if (finalEl) {
        finalEl.textContent = finalText || '';
    }
}

/**
 * Remove o preview da tela
 */
function removeRecognitionPreview() {
    if (recognitionPreview) {
        recognitionPreview.style.animation = 'slideOutDown 0.3s ease-out';
        setTimeout(() => {
            if (recognitionPreview && recognitionPreview.parentNode) {
                recognitionPreview.parentNode.removeChild(recognitionPreview);
            }
            recognitionPreview = null;
        }, 300);
    }
}

/**
 * Adiciona texto ao campo de forma inteligente
 * @param {string} text - Texto a ser adicionado
 */
function appendTextToInput(text) {
    if (!currentTargetInput || !text) return;

    const currentValue = currentTargetInput.value;
    // Adiciona espaço apenas se necessário
    const space = (currentValue.length > 0 && !currentValue.endsWith(' ')) ? ' ' : '';
    
    currentTargetInput.value += space + text;

    // Dispara evento para acionar autosave
    currentTargetInput.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Para o reconhecimento de voz e limpa recursos
 * @param {HTMLElement} button - Botão do microfone
 * @param {Object} options - Opções de reinício
 */
function stopRecognition(button, { autoRestart = false, delayMs = 120 } = {}) {
    try {
        // Para com segurança
        if (currentRecognition) {
            try { currentRecognition.stop(); } catch (_) {}
            try { currentRecognition.abort(); } catch (_) {}
        }
    } finally {
        isRecording = false;
        currentRecognition = null;
    }

    // Restaura visual do botão
    if (button) {
        button.classList.remove("active");
        button.innerHTML = '<i class="bi bi-mic-fill"></i>';
        button.style.animation = "";
        button.title = "Clique para ditar por voz";
    }

    // Limpa o preview
    try { 
        updateRecognitionPreview("", ""); 
        removeRecognitionPreview();
    } catch (_) {}

    // Foco e cursor no fim do campo
    if (currentTargetInput) {
        // Normaliza espaços e pontuação
        currentTargetInput.value = currentTargetInput.value
            .replace(/\s{2,}/g, " ")              // múltiplos espaços -> 1
            .replace(/\s+([,.!?;:])/g, "$1");     // remove espaço antes de pontuação

        currentTargetInput.focus();
        const len = currentTargetInput.value.length;
        currentTargetInput.setSelectionRange(len, len);
    }

    // Reinício automático (opcional)
    if (autoRestart) {
        setTimeout(() => {
            if (!isRecording && button && currentTargetInput) {
                toggleRecognition(button);
            }
        }, delayMs);
    }
}

/**
 * Verifica se o navegador suporta reconhecimento de voz
 * @returns {boolean}
 */
function checkSpeechRecognitionSupport() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!SR;
}

/**
 * Verifica se está em ambiente seguro (HTTPS ou localhost)
 * @returns {boolean}
 */
function isSecureContext() {
    return window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
}

/**
 * Mostra instruções detalhadas sobre como permitir o microfone
 */
function showMicrophoneInstructions() {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    let instructions = "📋 COMO PERMITIR O MICROFONE:\n\n";
    
    if (isChrome || (!isFirefox && !isSafari)) {
        instructions += "CHROME/EDGE:\n";
        instructions += "1. Clique no cadeado 🔒 ao lado da URL\n";
        instructions += "2. Procure 'Microfone'\n";
        instructions += "3. Selecione 'Permitir'\n";
        instructions += "4. Recarregue a página (F5)\n";
    } else if (isFirefox) {
        instructions += "FIREFOX:\n";
        instructions += "1. Clique no ícone à esquerda da URL\n";
        instructions += "2. Vá em 'Conexão Segura' > 'Mais informações'\n";
        instructions += "3. Aba 'Permissões' > 'Usar o microfone'\n";
        instructions += "4. Desmarque 'Usar padrão' e marque 'Permitir'\n";
        instructions += "5. Recarregue a página (F5)\n";
    } else if (isSafari) {
        instructions += "SAFARI:\n";
        instructions += "1. Menu Safari > Preferências\n";
        instructions += "2. Aba 'Sites' > 'Microfone'\n";
        instructions += "3. Encontre este site e selecione 'Permitir'\n";
        instructions += "4. Recarregue a página\n";
    }
    
    return instructions;
}

/**
 * Trata erros do reconhecimento de voz
 * @param {SpeechRecognitionErrorEvent} event - Evento de erro
 * @param {HTMLElement} button - Botão do microfone
 */
function handleRecognitionError(event, button) {
    console.error("Erro no reconhecimento de voz:", event.error);
    
    let errorMessage = "";
    let showInstructions = false;
    
    switch(event.error) {
        case "not-allowed":
        case "permission-denied":
            errorMessage = "🚫 Permissão de microfone negada!";
            showInstructions = true;
            
            showToast(errorMessage, "error");
            
            if (confirm(errorMessage + "\n\nDeseja ver como permitir o microfone?")) {
                alert(showMicrophoneInstructions());
            }
            break;
            
        case "no-speech":
            errorMessage = "🔇 Nenhuma fala detectada. Tente falar mais alto e mais perto do microfone.";
            showToast(errorMessage, "warning");
            break;
            
        case "audio-capture":
            errorMessage = "🎙️ Microfone não encontrado ou está sendo usado por outro aplicativo.\n\nVerifique:\n• Se o microfone está conectado\n• Se está selecionado como padrão\n• Se outro programa não está usando";
            showToast(errorMessage, "error");
            break;
            
        case "network":
            errorMessage = "📡 Erro de rede. Verifique sua conexão com a internet.";
            showToast(errorMessage, "error");
            break;
            
        case "aborted":
            // Ignorar - é quando o usuário para manualmente
            return;
            
        case "service-not-allowed":
            errorMessage = "⚠️ Serviço de reconhecimento não disponível. Tente novamente.";
            showToast(errorMessage, "error");
            break;
            
        default:
            errorMessage = `❌ Erro: ${event.error}`;
            showToast(errorMessage, "error");
    }
    
    stopRecognition(button);
}

/**
 * Função principal - Liga/desliga o reconhecimento de voz
 * @param {HTMLElement} button - Botão do microfone clicado
 */
function toggleRecognition(button) {
    // Se já está gravando, para
    if (isRecording) {
        stopRecognition(button);
        return;
    }

    // Identifica o campo de destino
    const targetId = button.dataset.target;
    currentTargetInput = document.getElementById(targetId);
    if (!currentTargetInput) {
        console.error("Campo de destino não encontrado:", targetId);
        return;
    }

    // Verifica suporte do navegador
    if (!checkSpeechRecognitionSupport()) {
        showToast("❌ Seu navegador não suporta reconhecimento de voz.", "error");
        
        if (confirm("❌ Navegador Incompatível\n\nO reconhecimento de voz não é suportado neste navegador.\n\nNavegadores compatíveis:\n• Google Chrome\n• Microsoft Edge\n• Safari (Mac/iOS)\n\nDeseja saber mais?")) {
            window.open("https://caniuse.com/speech-recognition", "_blank");
        }
        return;
    }

    // Verifica contexto seguro (HTTPS)
    if (!isSecureContext()) {
        showToast("⚠️ A gravação de voz requer conexão segura (HTTPS) ou localhost", "warning");
        return;
    }

    // Cria instância do reconhecimento
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    currentRecognition = new SR();
    currentRecognition.lang = "pt-BR";
    currentRecognition.continuous = false;      // Encerra após cada frase
    currentRecognition.interimResults = true;   // Mostra resultados parciais
    currentRecognition.maxAlternatives = 1;

    currentRecognition._lastCommitted = "";

    // Evento: Gravação iniciada
    currentRecognition.onstart = () => {
        isRecording = true;
        button.classList.add("active");
        button.innerHTML = '<i class="bi bi-mic-fill" style="color: red;"></i>';
        button.style.animation = "pulse 1.5s infinite";
        button.title = "Clique para parar a gravação";
        createRecognitionPreview();
        showToast("🎤 Microfone ativado! Pode falar.", "success");
    };

    // Evento: Erro na gravação
    currentRecognition.onerror = (event) => {
        handleRecognitionError(event, button);
    };

    // Evento: Gravação encerrada
    currentRecognition.onend = () => {
        if (isRecording) {
            console.log("Reconhecimento de voz encerrado");
        }
        stopRecognition(button);
    };

    // Evento: Resultados do reconhecimento
    currentRecognition.onresult = (event) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            const transcript = (res[0]?.transcript || "").trim();

            if (!transcript) continue;

            if (res.isFinal) {
                // Resultado final - adiciona ao campo
                if (transcript !== currentRecognition._lastCommitted) {
                    appendTextToInput(transcript);
                    currentRecognition._lastCommitted = transcript;
                }
            } else {
                // Resultado parcial - mostra no preview
                interimTranscript += transcript + " ";
            }
        }

        updateRecognitionPreview(interimTranscript.trim(), "");
    };

    // Inicia o reconhecimento
    try {
        currentRecognition.start();
    } catch (error) {
        console.error("Erro ao iniciar reconhecimento:", error);
        
        if (error.name === "InvalidStateError") {
            showToast("⚠️ Já existe uma gravação em andamento. Aguarde ou pare a anterior.", "warning");
        } else {
            showToast("❌ Erro ao iniciar gravação: " + error.message, "error");
        }
        
        stopRecognition(button);
    }
}

// ==========================================
// AJUSTES MOBILE E ACCORDION
// ==========================================

/**
 * Garante que os botões sejam sempre visíveis no mobile
 */
function ensureMobileButtonsVisible() {
    if (window.innerWidth <= 768) {
        const formActions = document.querySelectorAll('.form-actions');
        formActions.forEach(container => {
            if (container) {
                container.style.display = 'flex';
                container.style.flexDirection = 'column';
                container.style.width = '100%';
                container.style.gap = '0.75rem';
                
                const buttons = container.querySelectorAll('button');
                buttons.forEach(btn => {
                    btn.style.width = '100%';
                    btn.style.minHeight = '48px';
                });
            }
        });
    }
}

/**
 * Aplica ajustes mobile ao renderizar step de riscos
 */
const originalRenderRiscoStep = renderRiscoStep;
renderRiscoStep = function() {
    originalRenderRiscoStep();
    setTimeout(ensureMobileButtonsVisible, 100);
};

/**
 * Controla abertura/fechamento de accordions no mobile
 */
function toggleAccordion(event, detailsId) {
    if (window.innerWidth <= 768) {
        event.preventDefault();
        const details = document.getElementById(detailsId);
        if (details) {
            if (details.hasAttribute('open')) {
                details.removeAttribute('open');
            } else {
                details.setAttribute('open', '');
            }
        }
    }
}

/**
 * Força abertura dos accordions no mobile ao editar
 */
function forceOpenAccordionOnMobile(detailsId) {
    if (window.innerWidth <= 768) {
        const details = document.getElementById(detailsId);
        if (details) {
            details.setAttribute('open', '');
        }
    }
}

// ==========================================
// LOGS E INFORMAÇÕES DE DEBUG
// ==========================================

console.log("✅ Sistema com reconhecimento de voz carregado!");
console.log(`
🎤 DICAS PARA USAR O DITADO POR VOZ:

1️⃣ PRIMEIRA VEZ:
   • Clique no botão de microfone 🎤
   • Permita o acesso quando o navegador pedir
   • Comece a falar claramente

2️⃣ NÃO FUNCIONA?
   • Clique no cadeado 🔒 ao lado da URL
   • Verifique se permitiu o microfone
   • Recarregue a página (F5)
   • Teste em outro navegador se persistir

3️⃣ NAVEGADORES COMPATÍVEIS:
   ✅ Google Chrome (Recomendado)
   ✅ Microsoft Edge
   ✅ Safari (Mac/iOS)
   ⚠️ Firefox (Suporte limitado)
   ❌ Internet Explorer (Não suporta)

4️⃣ DICAS DE USO:
   • Fale claramente e pausadamente
   • Mantenha-se a 15-30cm do microfone
   • Evite ruídos de fundo
   • Pause entre frases longas
   • Use em ambiente silencioso

📞 Suporte: Se tiver problemas, pressione F12 e veja as mensagens no Console.
`);