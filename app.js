// ==========================================
// ★ INICIALIZAÇÃO ROBUSTA E CONTROLE DE ESTADO
// ==========================================

// Aguarda o conteúdo da página ser totalmente carregado
document.addEventListener('DOMContentLoaded', () => {
    const versionElement = document.getElementById('app-version-display');
    if (versionElement && typeof APP_VERSION !== 'undefined') {
        versionElement.textContent = 'v' + APP_VERSION;
    }
    
    initializeDbAndApp();
    setupServiceWorker(); // ★ CHAMADA CORRETA
});


let db;
let dbReadyPromise; // ★ NOVO: Promise para controlar quando o DB está pronto

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
let examesTemporarios = [];
let isSaving = false;

const dashboardView = document.getElementById('dashboard-view');
const wizardView = document.getElementById('wizard-view');
const actionPlanView = document.getElementById('action-plan-view');

/**
 * ★ NOVO: Função central que inicializa o IndexedDB e garante que o app só rode depois.
 * Isso elimina 90% dos problemas de "dados não encontrados" em celulares.
 */
function initializeDbAndApp() {
    dbReadyPromise = new Promise((resolve, reject) => {
        // Manter a versão 2 para acionar a atualização corretamente
        const request = indexedDB.open("fluentInspecoesDB", 2);

        request.onerror = (e) => {
            console.error("Erro crítico no DB:", e.target.error);
            showToast("Erro crítico ao acessar o banco de dados!", "error");
            reject(e.target.error);
        };
        
        request.onsuccess = (e) => {
            db = e.target.result;
            console.log("✅ Banco de dados pronto para uso.");
            resolve(db);
        };
        
        // Esta é a função que foi corrigida
        request.onupgradeneeded = (e) => {
            console.log("onupgradeneeded: Atualizando a estrutura do banco de dados...");
            const db = e.target.result;

            // ★★★ CORREÇÃO CRÍTICA ★★★
            // Verifica se o 'inspections' Object Store já existe antes de tentar criá-lo.
            // Isso evita o erro "ConstraintError" que estava quebrando a inicialização.
            if (!db.objectStoreNames.contains('inspections')) {
                db.createObjectStore("inspections", { keyPath: "id", autoIncrement: true });
                console.log("Object store 'inspections' criado com sucesso.");
            } else {
                console.log("Object store 'inspections' já existe. Nenhuma ação de criação necessária.");
            }
            
            // Futuras atualizações (ex: para a versão 3) podem ser adicionadas aqui
            // Exemplo: if (e.oldVersion < 3) { /* adicionar um novo índice, etc. */ }
        };
    });

    // O resto da função permanece igual
    dbReadyPromise.then(() => {
        document.getElementById('nav-dashboard').onclick = showDashboard;
        showDashboard();
    }).catch(error => {
        document.body.innerHTML = `<div style="padding:2rem;text-align:center;"><h1>Erro Crítico</h1><p>Não foi possível iniciar o banco de dados. O aplicativo não pode funcionar.</p><p><em>Detalhes: ${error.message}</em></p></div>`;
    });
}

/**
 * ★ NOVO: Mostra uma barra no topo da página oferecendo a atualização.
 */
function showUpdateBar() {
    let updateBar = document.getElementById('update-bar-pwa');
    if (!updateBar) {
        updateBar = document.createElement('div');
        updateBar.id = 'update-bar-pwa';
        updateBar.style.cssText = `
            position: fixed; top: 70px; left: 0; right: 0; background: var(--primary); color: white;
            padding: 1rem; text-align: center; z-index: 1001; display: flex;
            justify-content: center; align-items: center; gap: 1rem; box-shadow: var(--shadow-lg);
        `;
        updateBar.innerHTML = `
            <span>Uma nova versão do aplicativo está disponível!</span>
            <button class="outline" style="background:white;color:var(--primary);border-color:var(--primary);" id="pwa-update-button">Atualizar Agora</button>
        `;
        document.body.appendChild(updateBar);
    }
}

function validateDataIntegrity() {
    if (!currentInspection) {
        console.error("ERRO CRÍTICO: currentInspection é null ou undefined. Resetando para objeto vazio.");
        currentInspection = { departamentos: [] };
        return false;
    }
    if (!currentInspection.departamentos) {
        currentInspection.departamentos = [];
    }
    currentInspection.departamentos.forEach((depto) => {
        if (!depto) return; // Pula departamentos nulos (defensivo)
        if (!depto.cargos) depto.cargos = [];
        if (!depto.funcionarios) depto.funcionarios = [];
        if (!depto.grupos) depto.grupos = [];
    });
    return true;
}
// ==========================================
// ★ NOVO: NAVEGAÇÃO CENTRALIZADA
// ==========================================

function goToStep(step, deptoIndex = null) {
    validateDataIntegrity();
    if (typeof deptoIndex === 'number' && !Number.isNaN(deptoIndex)) {
        activeDepartamentoIndex = deptoIndex;
    }
    if (step < 3) {
        activeCargoIndex = -1;
        activeFuncionarioIndex = -1;
        currentGroupId = null;
    }
    if (step >= 2) {
        if (activeDepartamentoIndex < 0 || !currentInspection.departamentos?.[activeDepartamentoIndex]) {
            showToast('Departamento inválido. Retornando à lista.', 'error');
            // Chama a função novamente para ir para o passo 1, em vez de continuar com erro
            return goToStep(1); 
        }
    }
    wizardStep = step;

    // ★ NOVO: Feedback visual de carregamento durante a transição
    const wizardContent = document.getElementById('wizard-content');
    if (wizardContent) {
        wizardContent.innerHTML = '<div style="text-align:center; padding: 4rem; color: var(--gray-500);">Carregando...</div>';
    }
    
    // Renderiza o cabeçalho e, em seguida, o conteúdo do passo após um pequeno delay
    // para garantir que a mensagem de "Carregando" seja exibida primeiro.
    renderWizardHeader();
    setTimeout(() => {
        renderWizardStep();
    }, 50); // 50ms é suficiente para a UI atualizar
}
function focusOnEditForm(type, item) {
    const detailsElement = document.getElementById(`${type}-form-details`);
    const formElement = document.getElementById(`${type}-form`);
    const nameField = document.getElementById(`${type}-${type === 'grupo' ? 'nomes' : 'nome'}`);
    
    if (!detailsElement || !formElement || !nameField) {
        return showToast("Erro: Elementos do formulário de edição não encontrados.", "error");
    }

    // 1. Abre o acordeão
    detailsElement.setAttribute("open", "");

    // 2. Preenche os dados
    if (type === 'grupo') {
        nameField.value = (item.listaDeCargos || []).join('\n');
    } else {
        nameField.value = item.nome || '';
    }
    populateForm(type, item);
    document.getElementById(`save-${type}-btn`).innerHTML = "Salvar Alterações";
    document.getElementById(`cancel-${type}-edit-btn`).classList.remove("hidden");

    // 3. Rola e foca após a UI ser renderizada
    setTimeout(() => {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        nameField.focus();
    }, 150); // Um pouco mais de tempo para garantir a renderização em dispositivos lentos
}

function retryOperation(operation, maxRetries = 3, delay = 100) {
    let retries = 0;
    
    function attempt() {
        return operation().catch(error => {
            if (retries++ < maxRetries) {
                console.log(`Tentativa ${retries} de ${maxRetries}...`);
                return new Promise(resolve => setTimeout(resolve, delay)).then(attempt);
            }
            throw error;
        });
    }
    
    return attempt();
}

/**
 * ★ NOVO: Gera os breadcrumbs clicáveis
 * @returns {string} O HTML do breadcrumb.
 */
function renderBreadcrumb() {
    if (wizardStep === 0) return '';
    const empresaNome = escapeHtml(currentInspection.empresa?.nome || "Empresa");
    let html = `<a href="#" onclick="event.preventDefault(); goToStep(0);">${empresaNome}</a>`;

    if (wizardStep > 1 && activeDepartamentoIndex > -1) {
        const deptoNome = escapeHtml(currentInspection.departamentos?.[activeDepartamentoIndex]?.nome || "Depto");
        html += ` › <a href="#" onclick="event.preventDefault(); goToStep(1);">${deptoNome}</a>`;
    }

    if (wizardStep > 2) {
        const { target, type } = getActiveTargetObject();
        let activeItemName = 'Item';
        if (target) {
            if (type === 'grupo') activeItemName = `Grupo: ${escapeHtml(target.listaDeCargos.join(', '))}`;
            else if (type === 'cargo') activeItemName = `Cargo: ${escapeHtml(target.nome)}`;
            else if (type === 'funcionario') activeItemName = `Funcionário: ${escapeHtml(target.nome)}`;
        }
        html += ` › <strong>${activeItemName}</strong>`;
    }
    return `<div class="breadcrumb" style="cursor:pointer;">${html}</div>`;
}


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
    atualizarListaDeExames();
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        // Aplica a animação de saída
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        // Remove o elemento após a animação
        setTimeout(() => toast.remove(), 300);
    }, 3000);
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
        persistCurrentInspectionWithPromise().catch(error => {
            console.error("Erro ao salvar:", error);
            showToast("Erro ao salvar. Tentando novamente...", "warning");
        });
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
    persistCurrentInspectionWithPromise().catch(error => {
        console.error("Erro ao salvar:", error);
        showToast("Erro ao salvar. Tentando novamente...", "warning");
    });
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} duplicado com sucesso!`, "success");
}

// ==========================================
// LÓGICA PRINCIPAL E NAVEGAÇÃO
// ==========================================

async function persistCurrentInspection(callback) {
    await dbReadyPromise; // Garante que o DB está pronto
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

// Removido nextStep() e prevStep() pois goToStep() agora centraliza a lógica

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
      // Esta linha garante que o botão só funciona se a inspeção já tiver um ID (ou seja, já foi salva)
      const reportButtonHTML = currentInspection.id
        // AQUI ESTÁ A CHAMADA CORRETA para o relatório HTML
        ? `<button class="outline" onclick="generateInspectionReport(${currentInspection.id})"><i class="bi bi-file-earmark-text"></i> Relatório HTML</button>`
        : `<button class="outline" disabled title="Salve a inspeção para gerar um relatório"><i class="bi bi-file-earmark-text"></i> Relatório HTML</button>`;

      h.innerHTML = `
        <div class="wizard-header">
          <h2>${currentInspection.id ? 'Editando' : 'Nova'} Inspeção: ${currentInspection.empresa?.nome || ''}</h2>
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <span id="autosave-status" style="color: var(--gray-500); font-size: 0.85rem; transition: all 0.3s ease; opacity: 0;"></span>
            ${reportButtonHTML}
            <button class="secondary" onclick="saveAndExit(this)">Salvar e Voltar ao Painel</button>
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
    persistCurrentInspection((success) => { if(success) { showToast("Dados da empresa salvos!", "success"); goToStep(1); } });
}

// ==========================================
// PASSO 2: DEPARTAMENTOS - COM VOZ
// ==========================================

// 2) Passo 2 — Departamentos (render com pós-render seguro para mobile)
function renderDepartamentoStep() {
    // Garante que a estrutura existe
    if (!currentInspection.departamentos) {
        currentInspection.departamentos = [];
    }
    
    document.getElementById('wizard-content').innerHTML = `
        <div class="card">
            ${renderBreadcrumb()}
            <h3>Departamentos Adicionados <small style="font-weight: 400; color: var(--gray-500);">(Arraste para reordenar)</small></h3>
            <ul id="departamento-list" class="item-list"></ul>
            <details id="depto-form-details" class="accordion-section" ${window.innerWidth <= 768 ? 'open' : ''}>
                <summary id="depto-form-title" onclick="toggleAccordion(event, 'depto-form-details')">Novo Departamento</summary>
                <div>
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
                </div>
            </details>
            <div class="wizard-nav"><button class="nav" onclick="goToStep(0)">Voltar para Empresa</button></div>
        </div>`;
    
    // ★★★ CORREÇÃO CRÍTICA APLICADA AQUI ★★★
    // Envolve a manipulação do DOM em um requestAnimationFrame para garantir que
    // o navegador já tenha renderizado o HTML acima.
    requestAnimationFrame(() => {
        // Agora é seguro chamar estas funções, pois os elementos existem.
        updateDepartamentoList();
        
        // Adiciona um try-catch por segurança extra, caso SortableJS não carregue.
        try {
            if (typeof Sortable !== 'undefined') {
                initializeSortableLists();
            } else {
                console.warn('SortableJS não foi carregado. A funcionalidade de arrastar não está ativa.');
            }
        } catch (e) {
            console.error('Erro ao inicializar Sortable:', e);
        }
    });
}

function updateDepartamentoList() {
    if (!validateDataIntegrity()) {
        console.error("Dados inválidos ao atualizar lista de departamentos");
        return;
    }
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
        itemActions.appendChild(createButton('Cargos/Func.', 'primary', () => goToStep(2, index)));
        
        li.appendChild(itemInfo);
        li.appendChild(itemActions);
        list.appendChild(li);
    });
}

function saveDepartamento() {
    validateDataIntegrity();
    const deptoData = {
        nome: document.getElementById("depto-nome").value.trim(),
        caracteristica: document.getElementById("depto-caracteristica").value,
        descricao: document.getElementById("depto-descricao").value
    };

    if (!deptoData.nome) {
        return showToast("O nome do departamento é obrigatório.", "error");
    }
    
    if (!currentInspection.departamentos) {
        currentInspection.departamentos = [];
    }

    const isEditing = editingIndex > -1;
    
    if (isEditing) {
        // Usa Object.assign para modificar o objeto existente, preservando a referência.
        // É mais seguro do que criar um novo objeto com spread operator.
        Object.assign(currentInspection.departamentos[editingIndex], deptoData);
        showToast("Departamento atualizado!", "success");
    } else {
        // Garante que o novo departamento tenha todas as propriedades necessárias.
        const novoDepartamento = {
            ...deptoData,
            cargos: [],
            funcionarios: [],
            grupos: []
        };
        currentInspection.departamentos.push(novoDepartamento);
        showToast("Departamento adicionado!", "success");
    }
    
    const itemIndex = isEditing ? editingIndex : currentInspection.departamentos.length - 1;
    
    clearDeptoForm();
    updateDepartamentoList();
    
    // Feedback visual com scroll
    setTimeout(() => {
        const listItems = document.querySelectorAll('#departamento-list li');
        if (listItems[itemIndex]) {
            listItems[itemIndex].classList.add('item-highlight');
            listItems[itemIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => listItems[itemIndex].classList.remove('item-highlight'), 2500);
        }
    }, 100);

    // Persiste os dados no banco
    persistCurrentInspectionWithPromise().catch(error => {
        console.error("Erro ao salvar departamento:", error);
        showToast("Erro ao salvar no banco de dados!", "error");
    });
}

async function persistCurrentInspectionWithPromise() {
    await dbReadyPromise; // Garante que o DB está pronto
    return new Promise((resolve, reject) => {
        if (isSaving) {
            setTimeout(() => persistCurrentInspectionWithPromise().then(resolve).catch(reject), 100);
            return;
        }
        isSaving = true;
        
        if (!db || !currentInspection || !currentInspection.empresa) {
            isSaving = false;
            reject(new Error("Dados inválidos para persistir"));
            return;
        }
        
        currentInspection.updatedAt = new Date().toISOString();
        
        const transaction = db.transaction(["inspections"], "readwrite");
        const store = transaction.objectStore("inspections");
        const request = store.put(currentInspection);
        
        request.onsuccess = (event) => {
            if (!currentInspection.id) currentInspection.id = event.target.result;
            console.log("Inspeção salva com sucesso. ID:", currentInspection.id);
            isSaving = false;
            resolve(currentInspection.id);
        };
        request.onerror = (event) => {
            console.error("Erro ao persistir inspeção:", event.target.error);
            isSaving = false;
            reject(event.target.error);
        };
    });
}

function editDepartamento(index) {
    editingIndex = index; 
    editingType = 'departamento';
    const depto = currentInspection.departamentos[index];
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
    // Garante integridade e contexto
    if (!validateDataIntegrity()) { showToast("Erro ao carregar dados.", "warning"); return; }
    if (activeDepartamentoIndex < 0 || !currentInspection.departamentos[activeDepartamentoIndex]) {
      showToast("Selecione um departamento.", "warning");
      goToStep(1);
      return;
    }
  
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
  
    // Cabeçalho e 3 colunas com listas + formulários (accordions)
    const html = `
      ${renderBreadcrumb()}
      <div class="wizard-header"><h2>Cargos/Funcionários — ${depto.nome || "Departamento"}</h2></div>
  
      <div class="form-grid">
        <!-- CARGOS -->
        <div class="card">
          <h3>Cargos Individuais</h3>
          <ul id="cargo-list" class="item-list"></ul>
          <details id="cargo-form-details" class="accordion-section">
            <summary onclick="toggleAccordion(event, 'cargo-form-details')">Novo Cargo</summary>
            <div>
              <form id="cargo-form">
                <div class="form-group">
                  <label for="cargo-nome">Nome do Cargo *</label>
                  ${wrapWithVoiceButton('cargo-nome', 'Ex: Operador de Máquina', '', true)}
                </div>
                ${getFormFieldsHTML('cargo')}
                <div class="form-actions">
                  <button type="button" id="save-cargo-btn" class="primary" onclick="saveCargo()">Adicionar</button>
                  <button type="button" id="cancel-cargo-edit-btn" class="nav hidden" onclick="clearForm('cargo')">Cancelar</button>
                </div>
              </form>
            </div>
          </details>
        </div>
  
        <!-- GRUPOS -->
        <div class="card">
          <h3>Grupos de Cargos</h3>
          <ul id="grupo-list" class="item-list"></ul>
          <details id="grupo-form-details" class="accordion-section">
            <summary onclick="toggleAccordion(event, 'grupo-form-details')">Novo Grupo</summary>
            <div>
              <form id="grupo-form">
                <div class="form-group">
                  <label for="grupo-nomes">Cargos (um por linha) *</label>
                  ${wrapWithVoiceButton('grupo-nomes', 'Ex: Auxiliar de Produção\\nOperador I\\nOperador II', '', false, 'textarea')}
                </div>
                ${getFormFieldsHTML('grupo')}
                <div class="form-actions">
                  <button type="button" id="save-grupo-btn" class="primary" onclick="saveGrupo()">Criar Grupo</button>
                  <button type="button" id="cancel-grupo-edit-btn" class="nav hidden" onclick="clearForm('grupo')">Cancelar</button>
                </div>
              </form>
            </div>
          </details>
        </div>
  
        <!-- FUNCIONÁRIOS -->
        <div class="card">
          <h3>Funcionários</h3>
          <ul id="funcionario-list" class="item-list"></ul>
          <details id="funcionario-form-details" class="accordion-section">
            <summary onclick="toggleAccordion(event, 'funcionario-form-details')">Novo Funcionário</summary>
            <div>
              <form id="funcionario-form">
                <div class="form-group">
                  <label for="funcionario-nome">Nome do Funcionário *</label>
                  ${wrapWithVoiceButton('funcionario-nome', 'Ex: João da Silva', '', true)}
                </div>
                ${getFormFieldsHTML('funcionario')}
                <div class="form-actions">
                  <button type="button" id="save-funcionario-btn" class="primary" onclick="saveFuncionario()">Adicionar</button>
                  <button type="button" id="cancel-funcionario-edit-btn" class="nav hidden" onclick="clearForm('funcionario')">Cancelar</button>
                </div>
              </form>
            </div>
          </details>
        </div>
      </div>
  
      <div class="wizard-nav">
        <button class="nav" onclick="goToStep(1)">Voltar</button>
      </div>
    `;
  
    document.getElementById('wizard-content').innerHTML = html;
  
    // Aguarda o DOM aplicar, então popula listas e Sortable
    requestAnimationFrame(() => {
      updateAllLists(); // atualiza cargo/grupo/funcionário
      try {
        if (typeof Sortable !== 'undefined') initializeSortableLists();
      } catch (e) { console.warn('SortableJS não inicializado:', e); }
    });
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
        
        // ★ NOVO: Bloco que cria a lista de riscos
        let riscosHTML = '';
        if (cargo.riscos && cargo.riscos.length > 0) {
            const riscosList = cargo.riscos
                .map(risco => `<span class="badge" style="background-color: var(--gray-200); color: var(--gray-700); font-weight: 500;">${escapeHtml(risco.perigo)}</span>`)
                .join('');
            
            riscosHTML = `
                <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--gray-200);">
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${riscosList}
                    </div>
                </div>
            `;
        }

        const itemInfo = document.createElement('div');
        itemInfo.className = 'item-info';
        // HTML do card atualizado para incluir os riscos
        itemInfo.innerHTML = `
            <strong>${escapeHtml(cargo.nome)}</strong>
            <small>${(cargo.riscos || []).length} risco(s) | ${escapeHtml(obsText)}</small>
            ${riscosHTML}
        `;
        
        const itemActions = document.createElement('div');
        itemActions.className = 'item-actions';
        
        itemActions.appendChild(createButton('Editar', 'outline', () => editCargo(index)));
        itemActions.appendChild(createButton('<i class="bi bi-copy"></i> Duplicar', 'outline', () => duplicateItem('cargo', index)));
        itemActions.appendChild(createButton('Excluir', 'danger', () => deleteItem('cargo', index)));
        itemActions.appendChild(createButton('Riscos', 'primary', () => goToRiscos(index, 'cargo')));
        itemActions.appendChild(createButton('<i class="bi bi-clipboard2-pulse"></i> Exames', 'outline', () => mostrarModalExames(index, 'cargo')));

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
        
        // ★ NOVO: Bloco que cria a lista de riscos
        let riscosHTML = '';
        if (grupo.riscos && grupo.riscos.length > 0) {
            const riscosList = grupo.riscos
                .map(risco => `<span class="badge" style="background-color: var(--gray-200); color: var(--gray-700); font-weight: 500;">${escapeHtml(risco.perigo)}</span>`)
                .join('');
            
            riscosHTML = `
                <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--gray-200);">
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${riscosList}
                    </div>
                </div>
            `;
        }

        const itemInfo = document.createElement('div');
        itemInfo.className = 'item-info';
        // HTML do card atualizado para incluir os riscos
        itemInfo.innerHTML = `
            <strong>Grupo: ${escapeHtml(grupo.listaDeCargos.join(', '))}</strong>
            <small>${(grupo.riscos || []).length} risco(s)</small>
            ${riscosHTML}
        `;

        const itemActions = document.createElement('div');
        itemActions.className = 'item-actions';
        
        itemActions.appendChild(createButton('Editar', 'outline', () => editGrupo(index)));
        itemActions.appendChild(createButton('<i class="bi bi-copy"></i> Duplicar', 'outline', () => duplicateItem('grupo', index)));
        itemActions.appendChild(createButton('Excluir', 'danger', () => deleteItem('grupo', index)));
        itemActions.appendChild(createButton('Riscos', 'primary', () => goToRiscos(index, 'grupo')));
        itemActions.appendChild(createButton('<i class="bi bi-clipboard2-pulse"></i> Exames', 'outline', () => mostrarModalExames(index, 'grupo')));

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
        
        // ★ NOVO: Bloco que cria a lista de riscos
        let riscosHTML = '';
        if (func.riscos && func.riscos.length > 0) {
            const riscosList = func.riscos
                .map(risco => `<span class="badge" style="background-color: var(--gray-200); color: var(--gray-700); font-weight: 500;">${escapeHtml(risco.perigo)}</span>`)
                .join('');
            
            riscosHTML = `
                <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--gray-200);">
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${riscosList}
                    </div>
                </div>
            `;
        }

        const itemInfo = document.createElement('div');
        itemInfo.className = 'item-info';
        // HTML do card atualizado para incluir os riscos
        itemInfo.innerHTML = `
            <strong>${escapeHtml(func.nome)}</strong>
            <small>${(func.riscos || []).length} risco(s) | ${escapeHtml(obsText)}</small>
            ${riscosHTML}
        `;

        const itemActions = document.createElement('div');
        itemActions.className = 'item-actions';

        itemActions.appendChild(createButton('Editar', 'outline', () => editFuncionario(index)));
        itemActions.appendChild(createButton('<i class="bi bi-copy"></i> Duplicar', 'outline', () => duplicateItem('funcionario', index)));
        itemActions.appendChild(createButton('Excluir', 'danger', () => deleteItem('funcionario', index)));
        itemActions.appendChild(createButton('Riscos', 'primary', () => goToRiscos(index, 'funcionario')));
        itemActions.appendChild(createButton('<i class="bi bi-clipboard2-pulse"></i> Exames', 'outline', () => mostrarModalExames(index, 'funcionario')));
        
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
    
    const isEditing = editingIndex > -1 && editingType === 'cargo';
    const cargoData = { nome, ...collectFormData('cargo') };

    if (isEditing) {
        // Modifica o objeto existente, preservando 'riscos' e outras propriedades não coletadas no formulário.
        Object.assign(depto.cargos[editingIndex], cargoData);
        showToast("Cargo atualizado!", "success");
    } else {
        // Garante que o novo objeto tenha todas as propriedades esperadas.
        const novoCargo = { ...cargoData, riscos: [], exames: [] };
        depto.cargos.push(novoCargo);
        showToast("Cargo adicionado!", "success");
    }
    
    const itemIndex = isEditing ? editingIndex : depto.cargos.length - 1;
    clearForm('cargo');
    updateCargoList();
    
    // Feedback visual
    setTimeout(() => {
        const listItems = document.querySelectorAll('#cargo-list li');
        if (listItems[itemIndex]) {
            listItems[itemIndex].classList.add('item-highlight');
            listItems[itemIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => listItems[itemIndex].classList.remove('item-highlight'), 2500);
        }
    }, 100);

    persistCurrentInspectionWithPromise().catch(error => {
        console.error("Erro ao salvar cargo:", error);
        showToast("Erro ao salvar. Tentando novamente...", "warning");
    });
}

function saveFuncionario() {
    const nome = document.getElementById("funcionario-nome").value.trim();
    if (!nome) return showToast("O nome do funcionário é obrigatório.", "error");

    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    if (!depto.funcionarios) depto.funcionarios = [];

    const isEditing = editingIndex > -1 && editingType === 'funcionario';
    const funcionarioData = { nome, ...collectFormData('funcionario') };

    if (isEditing) {
        Object.assign(depto.funcionarios[editingIndex], funcionarioData);
        showToast("Funcionário atualizado!", "success");
    } else {
        const novoFuncionario = { ...funcionarioData, riscos: [], exames: [] };
        depto.funcionarios.push(novoFuncionario);
        showToast("Funcionário adicionado!", "success");
    }

    const itemIndex = isEditing ? editingIndex : depto.funcionarios.length - 1;
    clearForm('funcionario');
    updateFuncionarioList();

    // Feedback visual
    setTimeout(() => {
        const listItems = document.querySelectorAll('#funcionario-list li');
        if (listItems[itemIndex]) {
            listItems[itemIndex].classList.add('item-highlight');
            listItems[itemIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => listItems[itemIndex].classList.remove('item-highlight'), 2500);
        }
    }, 100);

    persistCurrentInspectionWithPromise().catch(error => {
        console.error("Erro ao salvar funcionário:", error);
        showToast("Erro ao salvar. Tentando novamente...", "warning");
    });
}

function saveGrupo() {
    const nomesText = document.getElementById("grupo-nomes").value.trim();
    if (!nomesText) return showToast("Digite os nomes dos cargos do grupo.", "error");
    
    const nomes = nomesText.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    if (nomes.length === 0) return showToast("Nomes de cargos inválidos.", "error");

    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    if (!depto.grupos) depto.grupos = [];

    const isEditing = editingIndex > -1 && editingType === 'grupo';
    const grupoData = { listaDeCargos: nomes, ...collectFormData('grupo') };
    
    if (isEditing) {
        Object.assign(depto.grupos[editingIndex], grupoData);
        showToast("Grupo atualizado!", "success");
    } else {
        const novoGrupo = { ...grupoData, id: 'grupo_' + Date.now(), riscos: [], exames: [] };
        depto.grupos.push(novoGrupo);
        showToast("Grupo criado!", "success");
    }

    const itemIndex = isEditing ? editingIndex : depto.grupos.length - 1;
    clearForm('grupo');
    updateGrupoList();

    // Feedback visual
    setTimeout(() => {
        const listItems = document.querySelectorAll('#grupo-list li');
        if (listItems[itemIndex]) {
            listItems[itemIndex].classList.add('item-highlight');
            listItems[itemIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => listItems[itemIndex].classList.remove('item-highlight'), 2500);
        }
    }, 100);

    persistCurrentInspectionWithPromise().catch(error => {
        console.error("Erro ao salvar grupo:", error);
        showToast("Erro ao salvar. Tentando novamente...", "warning");
    });
}

function populateForm(prefix, data) {
    if (!data) return;

    // --- ETAPA DE LIMPEZA (NOVO) ---
    // Limpa todos os checkboxes de observações
    const obsCheckboxes = ["altura", "espaco", "empilhadeira", "eletricidade", "movimentacao", "talhas", "paleteiras", "veiculos"];
    obsCheckboxes.forEach(obs => {
        const check = document.getElementById(`${prefix}-obs-${obs}`);
        if (check) check.checked = false;
    });

    // Limpa todos os checkboxes de dados LTCAT
    const ltcatCheckboxes = ["insalubre", "perigoso", "nho01", "ltcat"];
    ltcatCheckboxes.forEach(ltcat => {
        const check = document.getElementById(`${prefix}-${ltcat}`);
        if (check) check.checked = false;
    });
    // --- FIM DA ETAPA DE LIMPEZA ---

    // Etapa de Preenchimento (código antigo, agora mais seguro)
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
    focusOnEditForm('cargo', cargo);
}

function editFuncionario(index) {
    editingIndex = index;
    editingType = 'funcionario';
    const funcionario = currentInspection.departamentos[activeDepartamentoIndex].funcionarios[index];
    focusOnEditForm('funcionario', funcionario);
}

function editGrupo(index) {
    editingIndex = index;
    editingType = 'grupo';
    const grupo = currentInspection.departamentos[activeDepartamentoIndex].grupos[index];
    focusOnEditForm('grupo', grupo);
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
    // Validação de contexto
    if (activeDepartamentoIndex < 0 || !currentInspection.departamentos[activeDepartamentoIndex]) {
        showToast("Erro: Contexto inválido!", "error");
        return;
    }
    
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    
    // Validação específica por tipo
    if (type === 'cargo' && (!depto.cargos || !depto.cargos[index])) {
        showToast("Erro: Cargo não encontrado!", "error");
        return;
    }
    if (type === 'funcionario' && (!depto.funcionarios || !depto.funcionarios[index])) {
        showToast("Erro: Funcionário não encontrado!", "error");
        return;
    }
    if (type === 'grupo') {
        const grupo = depto.grupos && depto.grupos[index];
        if (!grupo) {
            showToast("Erro: Grupo não encontrado!", "error");
            return;
        }
        currentGroupId = grupo.id;
    }
    
    activeCargoIndex = type === 'cargo' ? index : -1;
    activeFuncionarioIndex = type === 'funcionario' ? index : -1;
    
    // Salva antes de navegar
    persistCurrentInspectionWithPromise().then(() => {
        goToStep(3);
    }).catch(error => {
        console.error("Erro ao salvar antes de navegar:", error);
        goToStep(3); // Navega mesmo assim
    });
}

function addMobileDebugInfo() {
    if (window.innerWidth <= 768) {
        console.log("=== DEBUG MOBILE ===");
        console.log("Inspeção atual:", currentInspection);
        console.log("Departamento ativo:", activeDepartamentoIndex);
        console.log("Total departamentos:", currentInspection.departamentos?.length || 0);
        console.log("===================");
    }
}

// Chamar debug em pontos críticos
window.addEventListener('error', (event) => {
    console.error('Erro global capturado:', event.error);
    addMobileDebugInfo();
});

// ==========================================
// ★★★ CAPTURA DE ERROS DE PROMISES (ESSENCIAL) ★★★
// ==========================================
window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason || {};
    const error = new Error(reason.message || 'Erro de Promise sem mensagem.');
    error.stack = reason.stack || error.stack; // Preserva o stack trace se disponível
    
    reportCriticalError(error, 'uma operação assíncrona');
    event.preventDefault();
});

// ==========================================
// PASSO 4: RISCOS - COM VOZ
// ==========================================

// app.js -> SUBSTITUA TODA A FUNÇÃO renderRiscoStep POR ESTE BLOCO

function renderRiscoStep() {

    if (!validateDataIntegrity()) {
        showToast("Erro ao carregar dados. Recarregando...", "warning");
        return;
    }

    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    let tituloRiscos = '', infoBox = '', targetObject;
    let currentContextValue = '', nomeParaSugestoes = null; 

    // Etapa 1: Determinar o contexto atual (Grupo, Cargo ou Funcionário)
    if (currentGroupId) {
        targetObject = depto.grupos.find(g => g.id === currentGroupId);
        if (!targetObject) { showToast("Grupo não encontrado.", "error"); goToStep(2, activeDepartamentoIndex); return; }
        
        tituloRiscos = `Riscos do Grupo (${targetObject.listaDeCargos.length} cargos)`;
        infoBox = `<div style="padding:1rem;background:var(--primary-light);border-left:4px solid var(--primary);border-radius:.5rem;margin-bottom:1.5rem;"><strong style="display:block;margin-bottom:.5rem;color:var(--gray-900);">Modo Grupo</strong><p style="margin:0;color:var(--gray-700);font-size:.95rem;">Os riscos aqui serão aplicados a todos os cargos do grupo.</p></div>`;
        currentContextValue = `grupo-${depto.grupos.findIndex(g => g.id === currentGroupId)}`;

    } else if (activeCargoIndex > -1) {
        targetObject = depto.cargos[activeCargoIndex];
        if (!targetObject) { showToast("Cargo não encontrado.", "error"); goToStep(2, activeDepartamentoIndex); return; }

        tituloRiscos = 'Riscos Identificados';
        currentContextValue = `cargo-${activeCargoIndex}`;
        nomeParaSugestoes = targetObject.nome.toLowerCase();

    } else if (activeFuncionarioIndex > -1) {
        targetObject = depto.funcionarios[activeFuncionarioIndex];
        if (!targetObject) { showToast("Funcionário não encontrado.", "error"); goToStep(2, activeDepartamentoIndex); return; }

        tituloRiscos = 'Riscos Identificados';
        currentContextValue = `funcionario-${activeFuncionarioIndex}`;
        nomeParaSugestoes = targetObject.nome.toLowerCase(); 
        
    } else {
        goToStep(2, activeDepartamentoIndex); 
        return;
    }

    // Etapa 2: Gerar sugestões de risco (COM VERIFICAÇÃO DE SEGURANÇA)
    let sugestoesHTML = '';
    // ESTA LINHA FOI CORRIGIDA para verificar se 'sugestoesPorCargo' existe antes de usá-la.
    if (typeof sugestoesPorCargo !== 'undefined' && nomeParaSugestoes && sugestoesPorCargo[nomeParaSugestoes]) {
        const sugestoes = sugestoesPorCargo[nomeParaSugestoes];
        const sugestoesFiltradas = sugestoes.filter(sugestao => 
            !(targetObject.riscos || []).some(r => r.perigo === sugestao)
        );

        if (sugestoesFiltradas.length > 0) {
            sugestoesHTML = `
                <div id="risk-suggestions" style="margin-bottom: 2rem; padding: 1.5rem; border: 2px dashed var(--primary); border-radius: 0.75rem; background: var(--primary-light);">
                    <h4 style="margin-top: 0; color: var(--primary-hover);"><i class="bi bi-lightbulb-fill"></i> Sugestões de Risco para ${escapeHtml(targetObject.nome)}</h4>
                    <p style="font-size: 0.9rem; color: var(--gray-600); margin-bottom: 1rem;">Clique para adicionar rapidamente os riscos mais comuns para esta função.</p>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${sugestoesFiltradas.map(sugestao => `<button class="outline" type="button" onclick='addSuggestedRisk("${sugestao.replace(/"/g, '&quot;')}")'>+ ${escapeHtml(sugestao)}</button>`).join('')}
                    </div>
                </div>`;
        }
    }

    // Etapa 3: Preparar dados para o HTML
    const riskTypes = [...new Set(predefinedRisks.map(r => r.tipo.replace(' PSICOSSOCIAIS', '')))];
    let quickNavOptions = (depto.cargos || []).map((c, i) => `<option value="cargo-${i}" ${currentContextValue === `cargo-${i}` ? 'selected' : ''}>Cargo: ${escapeHtml(c.nome)}</option>`).join('');
    quickNavOptions += (depto.funcionarios || []).map((f, i) => `<option value="funcionario-${i}" ${currentContextValue === `funcionario-${i}` ? 'selected' : ''}>Funcionário: ${escapeHtml(f.nome)}</option>`).join('');
    quickNavOptions += (depto.grupos || []).map((g, i) => `<option value="grupo-${i}" ${currentContextValue === `grupo-${i}` ? 'selected' : ''}>Grupo: ${escapeHtml(g.listaDeCargos.join(', '))}</option>`).join('');
    
    // Etapa 4: Renderizar o HTML da página
    document.getElementById('wizard-content').innerHTML = `
        <div class="card">
            ${renderBreadcrumb()}
            <div class="form-group">
                <label for="quick-nav-select">Navegar para riscos de:</label>
                <select id="quick-nav-select" onchange="switchRiskContext(this.value)">${quickNavOptions}</select>
            </div>
            ${infoBox}
            ${sugestoesHTML}
            <h3>${tituloRiscos} <small style="font-weight: 400; color: var(--gray-500);">(Arraste para reordenar)</small></h3>
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
                    ${wrapWithVoiceButton('risco-perigo', 'Ex: Ruído contínuo acima de 85 dB', '', true).replace('id="risco-perigo"', 'id="risco-perigo" oninput="atualizarListaDeExames()"')}
                </div>
                <div class="form-group">
                    <label for="risco-descricao-detalhada">Descrição Detalhada</label>
                    ${wrapWithVoiceButton('risco-descricao-detalhada', 'Detalhe o contexto do risco...', '', false, 'textarea')}
                </div>
                <details class="accordion-section"><summary>Fonte, Medição e Exposição</summary><div class="form-grid"><div class="form-group"><label for="risco-fonte">Fonte Geradora</label>${wrapWithVoiceButton('risco-fonte', 'Ex: Compressor', '')}</div><div class="form-group"><label for="risco-perfil-exposicao">Perfil de exposição</label>${wrapWithVoiceButton('risco-perfil-exposicao', 'Ex: Contínuo', '')}</div><div class="form-group"><label for="risco-medicao">Medição</label>${wrapWithVoiceButton('risco-medicao', 'Ex: 92 dB', '')}</div><div class="form-group"><label for="risco-tempo-exposicao">Tempo de Exposição</label>${wrapWithVoiceButton('risco-tempo-exposicao', 'Ex: 8h', '')}</div><div class="form-group"><label for="risco-tipo-exposicao">Tipo de Exposição</label><select id="risco-tipo-exposicao"><option>Permanente</option><option>Ocasional</option><option>Intermitente</option></select></div><div class="form-group"><label for="risco-esocial">Código E-Social</label>${wrapWithVoiceButton('risco-esocial', 'Ex: 01.01.001', '')}</div></div><div class="form-group"><label for="risco-obs-ambientais">Observações de registros ambientais</label>${wrapWithVoiceButton('risco-obs-ambientais', 'Observações...', '', false, 'textarea')}</div></details>
                <details class="accordion-section"><summary>Análise e Avaliação</summary><div class="form-grid"><div class="form-group"><label for="risco-probabilidade">Probabilidade</label><select id="risco-probabilidade"><option>Improvável</option><option>Provável</option><option>Remota</option><option>Frequente</option></select></div><div class="form-group"><label for="risco-severidade">Severidade</label><select id="risco-severidade"><option>Baixa</option><option>Média</option><option>Alta</option><option>Crítica</option></select></div><div class="form-group"><label for="risco-aceitabilidade">Aceitabilidade</label><select id="risco-aceitabilidade"><option>Tolerável</option><option>Não Tolerável</option></select></div></div><div class="form-group"><label for="risco-danos">Danos Potenciais</label>${wrapWithVoiceButton('risco-danos', 'Descreva os possíveis danos...', '', false, 'textarea')}</div></details>
                <details class="accordion-section"><summary>Controles e Ações</summary><div class="form-grid"><div class="form-group"><label for="risco-epi-utilizado">EPI Utilizado</label>${wrapWithVoiceButton('risco-epi-utilizado', 'Ex: Protetor auricular', '')}</div><div class="form-group"><label for="risco-ca">CA (Certificado de Aprovação)</label>${wrapWithVoiceButton('risco-ca', 'Ex: 12345', '')}</div><div class="form-group"><label for="risco-epc">EPC Existente</label>${wrapWithVoiceButton('risco-epc', 'Ex: Cabine acústica', '')}</div><div class="form-group"><label for="risco-epi-sugerido">EPI Sugerido</label>${wrapWithVoiceButton('risco-epi-sugerido', 'Ex: Protetor tipo concha', '')}</div></div><div class="form-group"><label for="risco-acoes">Ações Necessárias</label>${wrapWithVoiceButton('risco-acoes', 'Descreva as ações recomendadas...', '', false, 'textarea')}</div><div class="form-group"><label for="risco-observacoes-gerais">Observações Gerais</label>${wrapWithVoiceButton('risco-observacoes-gerais', 'Observações adicionais...', '', false, 'textarea')}</div></details>
                ${renderCampoExamesCustomizados()}
                <div class="form-actions"><button type="button" class="primary" id="save-risco-btn" onclick="saveRisco()"><i class="bi bi-plus-lg"></i> Adicionar</button><button type="button" id="cancel-risco-edit-btn" class="nav hidden" onclick="clearRiscoForm()">Cancelar</button></div>
            </form>
            <div class="wizard-nav"><button class="nav" onclick="goToStep(2, activeDepartamentoIndex)">Voltar para Cargos</button></div>
        </div>`;
    
    // PÓS-RENDER: Funções que manipulam o HTML recém-criado
    setTimeout(() => {
        updateRiscoList();
        initializeSortableLists();
        atualizarListaDeExames();
        ensureAllAccordionsOpenOnMobile();
    }, 0);
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


async function atualizarAplicativo() {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      try {
        if (reg) {
          await reg.update();
        }
        showToast('Aplicativo atualizado. Reabrindo...', 'success');
        setTimeout(() => location.reload(), 600);
      } catch (e) {
        console.warn('Falha ao atualizar SW:', e);
        location.reload();
      }
    } else {
      location.reload();
    }
  }

  function updateRiscoList() {
    const list = document.getElementById("risco-list");
    const { risks } = getActiveTargetObject(); // ★ Lógica simplificada!
    
    if (!risks || risks.length === 0) { 
        list.innerHTML = '<li class="empty-state">Nenhum risco identificado.</li>'; 
        return; 
    }
    
    list.innerHTML = "";
    risks.forEach((risco, index) => {
        const li = document.createElement("li");

        if (index === editingIndex) {
            li.classList.add('editing');
        }

        let examesHTML = '';
        if (risco.exames && risco.exames.length > 0) {
            const examesList = risco.exames.map(exame => `<span class="badge" style="background-color: var(--primary-light); color: var(--primary-hover);">${escapeHtml(exame.nome)}</span>`).join('');
            examesHTML = `<div class="risk-card-exames"><strong><i class="bi bi-clipboard2-pulse"></i> Exames:</strong><div>${examesList}</div></div>`;
        }

        li.innerHTML = `
            <div class="item-info">
                <strong>${escapeHtml(risco.perigo)}</strong>
                <span class="badge">${escapeHtml(risco.tipo)}</span>
                <small>Fonte: ${escapeHtml(risco.fonteGeradora||"N/A")} | Severidade: ${escapeHtml(risco.severidade||"N/A")}</small>
                ${examesHTML}
            </div>
            <div class="item-actions">
                <button class="outline" onclick="editRisco(${index})">Editar</button>
                <button class="danger" onclick="deleteRisco(${index})">Excluir</button>
            </div>`;
        list.appendChild(li);
    });
}


/**
 * ★ MODIFICADO: Usa a nova função auxiliar e adiciona feedback visual.
 */


function saveRisco() {
    // Força o teclado virtual a "confirmar" o valor do último campo focado
    const perigoInput = document.getElementById("risco-perigo");
    if (perigoInput) {
        perigoInput.blur();
    }

    // Coleta os dados do formulário de forma segura
    const riscoData = collectRiscoFormData();

    // Valida o campo obrigatório
    if (!riscoData.perigo) {
        showToast("A descrição do perigo é obrigatória.", "error");
        if (perigoInput) perigoInput.focus(); // Ajuda o usuário a corrigir
        return;
    }
  
    // Vincula os exames à nova data de risco
    riscoData.exames = Array.isArray(examesTemporarios) ? [...examesTemporarios] : [];
  
    const { risks: targetArray, type } = getActiveTargetObject();
    if (!targetArray) {
        return showToast("Contexto inválido para salvar risco.", "error");
    }
  
    const isEditing = editingIndex > -1;
    let message = `Risco ${isEditing ? 'atualizado' : 'adicionado'}`;
    if (type === 'grupo') message += ' para o grupo!';

    // Adiciona ou atualiza o risco no array
    if (isEditing) {
        targetArray[editingIndex] = riscoData;
    } else {
        targetArray.push(riscoData);
    }
  
    showToast(message, "success");
    const itemIndex = isEditing ? editingIndex : targetArray.length - 1;
    
    // Limpa o formulário e atualiza a UI
    clearRiscoForm();
    updateRiscoList();
    
    // Feedback visual com scroll
    setTimeout(() => {
        const listItems = document.querySelectorAll('#risco-list li');
        if (listItems[itemIndex]) {
            listItems[itemIndex].classList.add('item-highlight');
            listItems[itemIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => listItems[itemIndex].classList.remove('item-highlight'), 2500);
        }
    }, 100);
    
    // Persiste os dados no banco
    persistCurrentInspectionWithPromise().catch(error => {
        console.error("Erro ao salvar risco:", error);
        showToast("Erro ao salvar no banco de dados.", "warning");
    });
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
    atualizarListaDeExames();
}

function deleteRisco(index) {
    const { risks: targetArray, target } = getActiveTargetObject();
    if (!targetArray || !targetArray[index]) return;

    const nomeRisco = targetArray[index]?.perigo;
    if (confirm(`Excluir o risco "${nomeRisco}"?`)) {
        targetArray.splice(index, 1);
        showToast("Risco excluído!", "success");
        updateRiscoList();
        persistCurrentInspectionWithPromise().catch(error => console.error("Erro ao salvar:", error));
    }
}

function addSuggestedRisk(perigoDescricao) {
    try {
        const riscoParaAdicionar = predefinedRisks.find(r => r.perigo === perigoDescricao);
        if (!riscoParaAdicionar) {
            return showToast("Erro: Risco sugerido não encontrado na base de dados.", "error");
        }

        // Usa a função segura para obter o objeto e seu array de riscos
        const { target: targetObject, risks: targetArray } = getActiveTargetObject();

        // A verificação agora é muito mais simples e segura
        if (!targetObject || !targetArray) {
            reportCriticalError(new Error("Contexto inválido ao adicionar risco sugerido."), "adição de risco");
            return;
        }

        const novoRisco = JSON.parse(JSON.stringify(riscoParaAdicionar));
        
        adicionarExamesSugeridos(novoRisco);

        targetArray.push(novoRisco);

        showToast(`Risco "${novoRisco.perigo}" adicionado!`, "success");
        
        // Renderiza novamente a etapa para atualizar a lista e as sugestões
        renderRiscoStep(); 
        
        persistCurrentInspectionWithPromise().catch(error => {
            console.error("Erro ao salvar risco sugerido:", error);
            showToast("Erro ao salvar. Tentando novamente...", "warning");
        });

    } catch (error) {
        reportCriticalError(error, "adição de risco sugerido");
    }
}

function adicionarExamesSugeridos(riscoData) {
    const examData = getExamesPorRisco(riscoData.perigo);
    if (examData && Array.isArray(examData.exames)) {
      // ✅ CORREÇÃO: espalha corretamente os exames sugeridos
      riscoData.exames = [...examData.exames];
    }
    return riscoData;
}


function clearRiscoForm() {
    editingIndex = -1; 
    document.getElementById("risco-form").reset();
    updatePerigoOptions('');
    document.getElementById("risco-form-title").innerText = "Novo Risco";
    document.getElementById("save-risco-btn").innerHTML = "<i class='bi bi-plus-lg'></i> Adicionar";
    document.getElementById("cancel-risco-edit-btn").classList.add("hidden");
    examesTemporarios = []; 
    renderExamesEditaveis(); 
    
    // A chamada para updateRiscoList() foi REMOVIDA daqui, pois a saveRisco já faz isso.
    // A rolagem da tela também foi movida para a saveRisco.
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

async function saveAndExit(button) {
    // ★ NOVO: Desabilita o botão e mostra feedback
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="bi bi-arrow-repeat"></i> Salvando...';
    }

    try {
        await persistCurrentInspectionWithPromise();
        showToast('Inspeção salva com sucesso!', 'success');
        showDashboard();
    } catch (error) {
        showToast('Não foi possível salvar a inspeção.', 'error');
        // ★ NOVO: Reabilita o botão em caso de erro
        if (button) {
            button.disabled = false;
            button.innerHTML = 'Salvar e Voltar ao Painel';
        }
    }
}

async function loadInspections() {
    await dbReadyPromise; // Garante que o DB está pronto
    const transaction = db.transaction(["inspections"], "readonly");
    const store = transaction.objectStore("inspections");
    const request = store.getAll();

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
            // Defensivo: Garante que inspection.empresa existe
            const empresaNome = inspection.empresa ? escapeHtml(inspection.empresa.nome) : 'Inspeção Inválida';
            const dataInspecao = inspection.empresa ? formatDateBR(inspection.empresa.data) : 'N/A';
            const lastUpdated = inspection.updatedAt 
                ? new Date(inspection.updatedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) 
                : 'N/A';
            return `
                <li>
                    <div class="item-info">
                        <strong>${empresaNome}</strong>
                        <small>Data da Inspeção: ${dataInspecao}</small>  
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

async function editInspection(id) {
    await dbReadyPromise; // Garante que o DB está pronto
    const request = db.transaction(["inspections"], "readonly").objectStore("inspections").get(id);
    request.onsuccess = () => {
        currentInspection = request.result;
        if (!currentInspection) {
            showToast("Inspeção não encontrada!", "error");
            return;
        }
        
        activeDepartamentoIndex = -1;
        activeCargoIndex = -1;
        activeFuncionarioIndex = -1;
        currentGroupId = null;
        editingIndex = -1;
        editingType = null;
        
        validateDataIntegrity();
        
        wizardStep = 0;
        showWizard();
    };
    request.onerror = (e) => {
        console.error("Erro ao carregar inspeção:", e);
        showToast("Erro ao carregar inspeção!", "error");
    };
}

async function deleteInspection(id) {
    await dbReadyPromise; // Garante que o DB está pronto
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

async function duplicateInspection(id) {
    await dbReadyPromise; // Garante que o DB está pronto
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

async function getAllInspections(callback) {
    await dbReadyPromise; // Garante que o DB está pronto
    const request = db.transaction(["inspections"], "readonly").objectStore("inspections").getAll();
    request.onsuccess = () => callback(request.result);
    request.onerror = (e) => console.error("Erro ao buscar inspeções:", e);
}


// ==========================================
// PLANO DE AÇÃO - COM VOZ
// ==========================================

// app.js -> SUBSTITUA TODA A FUNÇÃO renderActionPlanView POR ESTE BLOCO

function renderActionPlanView() {
    if (!currentInspection) return; 
    const e = currentInspection.empresa || {};

    // Renderiza o HTML da tela
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
    
    // PÓS-RENDER: A chamada foi movida para dentro de um requestAnimationFrame para consistência
    requestAnimationFrame(() => {
        updateActionItemList();
    });
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
    persistCurrentInspectionWithPromise().catch(error => {
        console.error("Erro ao salvar:", error);
        showToast("Erro ao salvar. Tentando novamente...", "warning");
    });
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
        persistCurrentInspectionWithPromise().catch(error => {
            console.error("Erro ao salvar:", error);
            showToast("Erro ao salvar. Tentando novamente...", "warning");
        });
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

async function generateInspectionReport(id) {
    showToast("Gerando relatório...", "success"); // Feedback imediato para o usuário

    try {
        // 1. GARANTE QUE O DB ESTEJA PRONTO ANTES DE TENTAR USÁ-LO
        await dbReadyPromise;

        // 2. BUSCA A INSPEÇÃO ESPECÍFICA NO BANCO DE DADOS
        // Usamos uma Promise para encapsular o request do IndexedDB e usar async/await
        const insp = await new Promise((resolve, reject) => {
            const transaction = db.transaction(["inspections"], "readonly");
            const store = transaction.objectStore("inspections");
            const request = store.get(id);
            
            request.onerror = (event) => {
                // Rejeita a promise se houver um erro na transação
                reject(event.target.error);
            };
            request.onsuccess = () => {
                // Resolve a promise com o resultado da busca
                resolve(request.result);
            };
        });

        // 3. VALIDA SE A INSPEÇÃO FOI ENCONTRADA
        if (!insp) {
            console.error(`Inspeção com ID ${id} não foi encontrada no banco de dados.`);
            showToast("Erro: Inspeção não encontrada!", "error");
            return;
        }

        // 4. GERA O CONTEÚDO HTML DO RELATÓRIO
        // Esta parte é envolvida em seu próprio try...catch para isolar erros de renderização
        // que podem ocorrer se os dados da inspeção estiverem corrompidos.
        try {
            const e = insp.empresa || {};
            const reportDate = new Date().toLocaleString('pt-BR');

            let html = `
            <!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><title>Relatório de Inspeção - ${escapeHtml(e.nome)}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
                h1, h2, h3, h4, h5 { color: #1e293b; }
                .report-header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; }
                .report-header h1 { margin: 0; }
                .section { margin-bottom: 30px; page-break-inside: avoid; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; word-break: break-word; }
                th { background-color: #f1f5f9; font-weight: bold; }
                .cargo-details, .risco-card { margin-bottom: 20px; }
                .report-checklist { font-family: 'Courier New', Courier, monospace; font-size: 0.9em; background-color: #f8fafc; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0; display: flex; flex-wrap: wrap; gap: 1rem; }
                .report-checklist-item { white-space: nowrap; }
                .print-button-container { text-align: center; margin-bottom: 20px; padding: 10px; background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; }
                .print-button { background: #3b82f6; color: white; border: none; padding: 12px 24px; font-size: 16px; border-radius: 6px; cursor: pointer; }
                footer { text-align: center; font-size: 0.8em; color: #64748b; margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px; }
                @media print {
                    .print-button-container { display: none; }
                    body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .section { page-break-before: auto; }
                    .risco-card, .cargo-details { page-break-inside: avoid; }
                }
            </style>
            </head><body>
            <div class="print-button-container">
                <button class="print-button" onclick="window.print()">🖨️ Imprimir / Salvar como PDF</button>
            </div>
            <div class="report-header">
                <h1>Relatório de Inspeção de Riscos</h1>
                <p><strong>Empresa:</strong> ${escapeHtml(e.nome)}</p>
            </div>
            <div class="section">
                <h2>Dados Gerais da Inspeção</h2>
                <table>
                    <tr><th style="width:200px">CNPJ:</th><td>${escapeHtml(e.cnpj || 'N/A')}</td></tr>
                    <tr><th>Data da Inspeção:</th><td>${formatDateBR(e.data)}</td></tr>
                    <tr><th>Elaborado por:</th><td>${escapeHtml(e.elaborado || 'N/A')}</td></tr>
                    <tr><th>Aprovado por:</th><td>${escapeHtml(e.aprovado || 'N/A')}</td></tr>
                    <tr><th>Data do Relatório:</th><td>${reportDate}</td></tr>
                </table>
            </div>
            `;

            (insp.departamentos || []).forEach(depto => {
                html += `<div class="section" style="page-break-before: always;">
                    <h2>Departamento: ${escapeHtml(depto.nome)}</h2>
                    <p><strong>Característica do Setor:</strong> ${escapeHtml(depto.caracteristica || 'N/A')}</p>
                    <p><strong>Descrição da Atividade:</strong> ${escapeHtml(depto.descricao || 'N/A')}</p>`;
                (depto.grupos || []).forEach(grupo => {
                    html += renderCargoReport(grupo, `Grupo: ${escapeHtml(grupo.listaDeCargos.join(', '))}`);
                });
                (depto.cargos || []).forEach(cargo => {
                    html += renderCargoReport(cargo, `Cargo: ${escapeHtml(cargo.nome)}`);
                });
                (depto.funcionarios || []).forEach(func => {
                    html += renderCargoReport(func, `Funcionário: ${escapeHtml(func.nome)}`);
                });
                html += `</div>`;
            });

            if (insp.planoDeAcao && insp.planoDeAcao.length > 0) {
                html += `
                <div class="section" style="page-break-before: always;">
                    <h2>Plano de Ação</h2>
                    <table>
                        <thead><tr><th>Atividade</th><th>Descrição</th><th>Prazo Início</th><th>Prazo Fim</th><th>Status</th></tr></thead>
                        <tbody>`;
                insp.planoDeAcao.forEach(item => {
                    html += `
                            <tr>
                                <td>${escapeHtml(item.atividade)}</td>
                                <td>${escapeHtml(item.descricao || 'N/A')}</td>
                                <td>${formatDateBR(item.prazoInicio)}</td>
                                <td>${formatDateBR(item.prazoFim)}</td>
                                <td><span>${escapeHtml(item.status || 'Pendente')}</span></td>
                            </tr>`;
                });
                html += `</tbody></table></div>`;
            } else {
                 html += `<div class="section"><h2>Plano de Ação</h2><p>Nenhum item cadastrado no plano de ação.</p></div>`;
            }

            html += `<footer>Relatório gerado pelo Assistente de Inspeção de Riscos</footer></body></html>`;

            // 5. TENTA EXIBIR O HTML GERADO
            const nomeArquivo = `Relatorio_${(e.nome || 'inspecao').replace(/[^a-zA-Z0-9]/g, '_')}.html`;
            downloadOrOpenHTML(html, nomeArquivo, { openSameTab: true });

        } catch (renderError) {
            console.error('Erro crítico durante a geração do HTML do relatório:', renderError);
            showToast('Falha ao processar os dados para o relatório. Verifique a integridade dos dados.', 'error');
        }

    } catch (dbError) {
        // Captura erros da conexão com o DB ou da busca dos dados
        console.error("Erro ao acessar o banco de dados para gerar o relatório:", dbError);
        showToast("Banco de dados indisponível. Não foi possível gerar o relatório.", "error");
    }
}
/**
 * Gera o relatório de um cargo/grupo, agora com filtro de segurança para
 * ignorar riscos nulos ou indefinidos em dados antigos/corrompidos.
 */
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
    
    const riscosValidos = (cargo.riscos || []).filter(Boolean);

    if (riscosValidos.length > 0) {
        riscosValidos.forEach((risco, idx) => {
            let examesTableHTML = '';
            
            if (risco.exames && Array.isArray(risco.exames) && risco.exames.length > 0) {
                // ★★★ CORREÇÃO APLICADA AQUI ★★★
                const examesValidos = risco.exames.filter(exame => exame && typeof exame === 'object' && exame.nome);

                if (examesValidos.length > 0) {
                    const examesRows = examesValidos.map(exame => `
                        <tr>
                            <td>
                                <strong>${escapeHtml(exame.nome)}</strong>
                                ${exame.observacoes ? `<br><small style="color:#555">${escapeHtml(exame.observacoes)}</small>` : ''}
                                ${exame.periodicidade && !exame.observacoes ? `<br><small style="color:#555">${escapeHtml(exame.periodicidade)}</small>` : ''}
                            </td>
                            <td style="text-align:center; font-weight:bold;">${exame.admissional ? '✓' : '-'}</td>
                            <td style="text-align:center;">${escapeHtml(exame.periodico || (exame.customizado ? '-' : '✓'))}</td>
                            <td style="text-align:center; font-weight:bold;">${exame.mudancaRisco ? '✓' : '-'}</td>
                            <td style="text-align:center; font-weight:bold;">${exame.retornoTrabalho ? '✓' : '-'}</td>
                            <td style="text-align:center; font-weight:bold;">${exame.demissional ? '✓' : '-'}</td>
                        </tr>
                    `).join('');

                    examesTableHTML = `
                        <table>
                            <thead>
                                <tr><th colspan="6" style="background-color:#d1fae5; color: #065f46;">🏥 Exames Médicos Ocupacionais</th></tr>
                                <tr>
                                    <th style="width:40%">Exame</th><th>Adm.</th><th>Periódico</th><th>Mud. Risco</th><th>Ret. Trab.</th><th>Dem.</th>
                                </tr>
                            </thead>
                            <tbody>${examesRows}</tbody>
                        </table>`;
                }
            }

            html += `<div class="risco-card"><h5>Risco ${idx+1}: ${escapeHtml(risco.perigo||'N/A')}</h5>
            <table><thead><tr><th colspan="2" style="background:#dbeafe; color: #1e40af;">Informações Básicas</th></tr></thead><tbody><tr><td style="width:200px"><strong>Risco Presente:</strong></td><td>${escapeHtml(risco.riscoPresente||'N/A')}</td></tr><tr><td><strong>Tipo:</strong></td><td>${escapeHtml(risco.tipo||'N/A')}</td></tr><tr><td><strong>E-Social:</strong></td><td>${escapeHtml(risco.codigoEsocial||'N/A')}</td></tr><tr><td><strong>Descrição:</strong></td><td>${escapeHtml(risco.descricaoDetalhada||'N/A')}</td></tr></tbody></table>
            <table><thead><tr><th colspan="2" style="background:#dcfce7; color: #166534;">Fonte e Exposição</th></tr></thead><tbody><tr><td style="width:200px"><strong>Fonte:</strong></td><td>${escapeHtml(risco.fonteGeradora||'N/A')}</td></tr><tr><td><strong>Perfil Exposição:</strong></td><td>${escapeHtml(risco.perfilExposicao||'N/A')}</td></tr><tr><td><strong>Medição:</strong></td><td>${escapeHtml(risco.medicao||'N/A')}</td></tr><tr><td><strong>Tempo Exposição:</strong></td><td>${escapeHtml(risco.tempoExposicao||'N/A')}</td></tr><tr><td><strong>Tipo Exposição:</strong></td><td>${escapeHtml(risco.tipoExposicao||'N/A')}</td></tr><tr><td><strong>Obs. Ambientais:</strong></td><td>${escapeHtml(risco.obsAmbientais||'N/A')}</td></tr></tbody></table>
            <table><thead><tr><th colspan="2" style="background:#fef3c7; color: #92400e;">Análise e Avaliação</th></tr></thead><tbody><tr><td style="width:200px"><strong>Probabilidade:</strong></td><td>${escapeHtml(risco.probabilidade||'N/A')}</td></tr><tr><td><strong>Severidade:</strong></td><td>${escapeHtml(risco.severidade||'N/A')}</td></tr><tr><td><strong>Aceitabilidade:</strong></td><td>${escapeHtml(risco.aceitabilidade||'N/A')}</td></tr><tr><td><strong>Danos Potenciais:</strong></td><td>${escapeHtml(risco.danos||'N/A')}</td></tr></tbody></table>
            <table><thead><tr><th colspan="2" style="background:#ede9fe; color: #5b21b6;">Controles e Ações</th></tr></thead><tbody><tr><td style="width:200px"><strong>EPI Utilizado:</strong></td><td>${escapeHtml(risco.epiUtilizado||'N/A')}</td></tr><tr><td><strong>CA:</strong></td><td>${escapeHtml(risco.ca||'N/A')}</td></tr><tr><td><strong>EPC Existente:</strong></td><td>${escapeHtml(risco.epc||'N/A')}</td></tr><tr><td><strong>EPI Sugerido:</strong></td><td>${escapeHtml(risco.epiSugerido||'N/A')}</td></tr><tr><td><strong>Ações Necessárias:</strong></td><td>${escapeHtml(risco.acoesNecessarias||'N/A')}</td></tr><tr><td><strong>Obs. Gerais:</strong></td><td>${escapeHtml(risco.observacoesGerais||'N/A')}</td></tr></tbody></table>
            ${examesTableHTML}
            </div>`;
        });
    } else { 
        html += `<p style="color:#999;font-style:italic;padding:20px;background:#f9fafb;border-radius:8px">Nenhum risco válido adicionado.</p>`; 
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
            } else if (listId === 'risco-list') { // ★ NOVO: Adicionado suporte para reordenar riscos
                const depto = currentInspection.departamentos[activeDepartamentoIndex];
                if (currentGroupId) { targetArray = depto.grupos.find(g => g.id === currentGroupId)?.riscos; }
                else if (activeCargoIndex > -1) { targetArray = depto.cargos[activeCargoIndex]?.riscos; }
                else if (activeFuncionarioIndex > -1) { targetArray = depto.funcionarios[activeFuncionarioIndex]?.riscos; }
            }
            if (targetArray) {
                targetArray.splice(newIndex, 0, targetArray.splice(oldIndex, 1)[0]);
                persistCurrentInspection(() => showToast("Ordem salva!", "success"));
            }
        }
    };
    ['departamento-list', 'cargo-list', 'funcionario-list', 'grupo-list', 'risco-list'].forEach(id => {
        const el = document.getElementById(id);
        if (el) Sortable.create(el, sortableConfig);
    });
}
// Utilitário seguro para mobile/PWA: gera um arquivo HTML e baixa/abre no mesmo clique
function downloadOrOpenHTML(htmlString, filename, { openSameTab = false } = {}) {
    try {
      const blob = new Blob([htmlString], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
  
      if (openSameTab) {
        // Abre NO MESMO CONTEXTO — evita bloqueio de pop-up em standalone/PWA
        window.location.href = url;
      } else {
        // Dispara download (mais seguro ainda em iOS/Android)
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'relatorio.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
  
      // Libera o objeto depois
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error('Erro ao baixar/abrir HTML:', err);
      showToast('Não foi possível gerar o relatório no dispositivo. Tente novamente.', 'error');
    }
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
    event.preventDefault(); // Previne o comportamento padrão do summary
    const details = document.getElementById(detailsId);
    if (!details) return;
  
    // Toggle simples que funciona em todos os dispositivos
    if (details.hasAttribute('open')) {
      details.removeAttribute('open');
    } else {
      details.setAttribute('open', '');
    }
}
/**
 * Força abertura dos accordions no mobile ao editar
 */
function forceOpenAccordionOnMobile(id) {
    const el = document.getElementById(id);
    if (el && window.innerWidth <= 768) {
      el.setAttribute('open', '');
    }
}
// Abre todos os <details> da área do wizard no mobile — evita conteúdo "sumido"
function ensureAllAccordionsOpenOnMobile() {
    if (window.innerWidth <= 768) {
      document.querySelectorAll('details.accordion-section').forEach(d => {
        d.setAttribute('open', '');
      });
    }
}

function getActiveTargetObject() {
    if (activeDepartamentoIndex < 0) return { target: null, risks: null, type: null };
    
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    if (!depto) return { target: null, risks: null, type: null };

    if (currentGroupId) {
        const grupo = depto.grupos.find(g => g.id === currentGroupId);
        if (grupo && !Array.isArray(grupo.riscos)) grupo.riscos = [];
        return { target: grupo, risks: grupo?.riscos, type: 'grupo' };
    }
    if (activeCargoIndex > -1) {
        const cargo = depto.cargos[activeCargoIndex];
        if (cargo && !Array.isArray(cargo.riscos)) cargo.riscos = [];
        return { target: cargo, risks: cargo?.riscos, type: 'cargo' };
    }
    if (activeFuncionarioIndex > -1) {
        const func = depto.funcionarios[activeFuncionarioIndex];
        if (func && !Array.isArray(func.riscos)) func.riscos = [];
        return { target: func, risks: func?.riscos, type: 'funcionario' };
    }
    
    return { target: null, risks: null, type: null };
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
// ==========================================
// GERENCIAMENTO DE EXAMES MÉDICOS
// Adicionar estas funções no app.js
// ==========================================

/**
 * Mostra os exames recomendados para um risco específico
 * @param {string} perigoDescricao - Descrição do perigo/risco
 */
function mostrarExamesRecomendados(perigoDescricao) {
    const examData = getExamesPorRisco(perigoDescricao);
    
    if (!examData || !examData.exames || examData.exames.length === 0) {
        return `<div style="padding: 1rem; background: var(--gray-50); border-radius: 0.5rem; margin: 1rem 0;">
            <p style="color: var(--gray-600); margin: 0;">
                ℹ️ Não há exames pré-definidos para este risco. Você pode adicionar exames customizados no campo abaixo.
            </p>
        </div>`;
    }
    
    let html = `
        <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 0.75rem; padding: 1.5rem; margin: 1.5rem 0;">
            <h4 style="color: #047857; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                <i class="bi bi-heart-pulse-fill"></i> Exames Recomendados
            </h4>
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 0.5rem; overflow: hidden;">
                <thead>
                    <tr style="background: #d1fae5;">
                        <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid #10b981;">Exame</th>
                        <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #10b981; font-size: 0.85rem;">Admissional</th>
                        <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #10b981; font-size: 0.85rem;">Periódico</th>
                        <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #10b981; font-size: 0.85rem;">Mudança</th>
                        <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #10b981; font-size: 0.85rem;">Retorno</th>
                        <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid #10b981; font-size: 0.85rem;">Demissional</th>
                    </tr>
                </thead>
                <tbody>`;
    
    examData.exames.forEach((exame, idx) => {
        const bgColor = idx % 2 === 0 ? 'white' : '#f9fafb';
        html += `
            <tr style="background: ${bgColor};">
                <td style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb;">
                    <strong>${exame.nome}</strong>
                    ${exame.observacoes ? `<br><small style="color: var(--gray-600);">${exame.observacoes}</small>` : ''}
                </td>
                <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid #e5e7eb;">
                    ${exame.admissional ? '✓' : '-'}
                </td>
                <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid #e5e7eb; font-size: 0.85rem;">
                    ${exame.periodico || '-'}
                </td>
                <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid #e5e7eb;">
                    ${exame.mudancaRisco ? '✓' : '-'}
                </td>
                <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid #e5e7eb;">
                    ${exame.retornoTrabalho ? '✓' : '-'}
                </td>
                <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid #e5e7eb;">
                    ${exame.demissional ? '✓' : '-'}
                </td>
            </tr>`;
    });
    
    html += `
                </tbody>
            </table>
            <p style="margin: 1rem 0 0 0; font-size: 0.85rem; color: var(--gray-600);">
                💡 <strong>Dica:</strong> Estes exames podem ser adicionados automaticamente ao salvar o risco, ou você pode customizá-los abaixo.
            </p>
        </div>`;
    
    return html;
}

/**
 * Adiciona campo de exames customizados ao formulário de risco
 * @returns {string} HTML do campo de exames
 */
function renderCampoExamesCustomizados() {
    return `
        <details class="accordion-section" open style="margin-top: 1.5rem;">
            <summary>🏥 Exames Médicos Ocupacionais</summary>
            
            <!-- Texto de ajuda adicionado -->
            <p style="font-size: 0.9rem; color: var(--gray-600); margin: 1rem 0; padding: 1rem; background: var(--gray-50); border-radius: 0.5rem;">
                Abaixo estão os exames <strong>sugeridos</strong> para este risco. Você pode remover itens clicando no <i class="bi bi-trash3-fill"></i> ou adicionar novos exames manualmente no formulário abaixo.
            </p>

            <div id="exames-editaveis-container">
                 <h4 style="font-size: 1rem; margin-top:0;">Exames Vinculados</h4>
                 <ul id="exames-editaveis-list" class="item-list" style="margin-top: 1rem;">
                    <!-- Os exames serão inseridos aqui via JavaScript -->
                 </ul>
            </div>
            <div id="add-exame-form" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--gray-200);">
                <h4 style="font-size: 1rem;">Adicionar Novo Exame</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="novo-exame-nome">Nome do Exame</label>
                        <input type="text" id="novo-exame-nome" placeholder="Ex: Hemograma Completo">
                    </div>
                    <div class="form-group">
                        <label for="novo-exame-periodicidade">Periodicidade / Observações</label>
                        <input type="text" id="novo-exame-periodicidade" placeholder="Ex: Admissional, 12 meses">
                    </div>
                </div>
                <button type="button" class="secondary" onclick="adicionarExameManual()"><i class="bi bi-plus-lg"></i> Adicionar Exame à Lista</button>
            </div>
        </details>`;
}
/**
 * ★★★ CORREÇÃO CRÍTICA (5.0) ★★★
 * Gera relatório consolidado, agora com um filtro de segurança para ignorar
 * riscos nulos ou indefinidos que possam existir em dados antigos/corrompidos.
 * @param {Object} cargo - Cargo ou funcionário com riscos
 * @returns {string} HTML do relatório de exames
 */
function gerarRelatorioExames(cargo) {
    // A verificação `(cargo.riscos || [])` previne erro se 'riscos' não existir.
    // O `.filter(Boolean)` remove quaisquer entradas 'undefined' ou 'null' do array.
    const riscosValidos = (cargo.riscos || []).filter(Boolean);

    if (riscosValidos.length === 0) {
        return '<p style="color: var(--gray-500); font-style: italic;">Nenhum risco válido cadastrado para este item.</p>';
    }
    
    const examesConsolidados = new Map();
    
    // Agora iteramos sobre o array limpo e seguro.
    riscosValidos.forEach(risco => {
        if (risco.exames && Array.isArray(risco.exames)) {
            // ★★★ CORREÇÃO APLICADA AQUI ★★★
            // Filtra o array interno para garantir que cada 'exame' é um objeto válido com a propriedade 'nome'.
            const examesValidos = risco.exames.filter(exame => exame && typeof exame === 'object' && exame.nome);

            examesValidos.forEach(exame => {
                const key = exame.nome;
                if (!examesConsolidados.has(key)) {
                    examesConsolidados.set(key, {
                        nome: exame.nome,
                        riscos: [],
                        admissional: exame.admissional || false,
                        periodico: exame.periodico || false,
                        mudancaRisco: exame.mudancaRisco || false,
                        retornoTrabalho: exame.retornoTrabalho || false,
                        demissional: exame.demissional || false,
                        observacoes: exame.observacoes || exame.periodicidade || ''
                    });
                }
                examesConsolidados.get(key).riscos.push(risco.perigo);
            });
        }
    });
    
    if (examesConsolidados.size === 0) {
        return '<p style="color: var(--gray-500); font-style: italic;">Não há exames definidos para os riscos deste item.</p>';
    }
    
    let html = `
        <div style="background: white; border: 2px solid var(--primary); border-radius: 0.75rem; padding: 1.5rem; margin: 1rem 0;">
            <h4 style="color: var(--primary); margin: 0 0 1rem 0;">
                <i class="bi bi-clipboard2-pulse"></i> Exames Necessários - ${escapeHtml(cargo.nome)}
            </h4>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--primary-light);">
                        <th style="padding: 0.75rem; text-align: left; border-bottom: 2px solid var(--primary);">Exame</th>
                        <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--primary); font-size: 0.85rem;">Adm.</th>
                        <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--primary); font-size: 0.85rem;">Periódico</th>
                        <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--primary); font-size: 0.85rem;">Mud.</th>
                        <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--primary); font-size: 0.85rem;">Ret.</th>
                        <th style="padding: 0.75rem; text-align: center; border-bottom: 2px solid var(--primary); font-size: 0.85rem;">Dem.</th>
                    </tr>
                </thead>
                <tbody>`;
    
    let idx = 0;
    examesConsolidados.forEach((exame) => {
        const bgColor = idx % 2 === 0 ? 'white' : 'var(--gray-50)';
        html += `
            <tr style="background: ${bgColor};">
                <td style="padding: 0.75rem; border-bottom: 1px solid var(--gray-200);">
                    <strong>${escapeHtml(exame.nome)}</strong>
                    <br><small style="color: var(--gray-600);">Riscos: ${escapeHtml(exame.riscos.slice(0, 2).join(', '))}${exame.riscos.length > 2 ? '...' : ''}</small>
                    ${exame.observacoes ? `<br><small style="color: var(--gray-500);">${escapeHtml(exame.observacoes)}</small>` : ''}
                </td>
                <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid var(--gray-200);">${exame.admissional ? '✓' : '-'}</td>
                <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid var(--gray-200); font-size: 0.85rem;">${exame.periodico || '-'}</td>
                <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid var(--gray-200);">${exame.mudancaRisco ? '✓' : '-'}</td>
                <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid var(--gray-200);">${exame.retornoTrabalho ? '✓' : '-'}</td>
                <td style="padding: 0.75rem; text-align: center; border-bottom: 1px solid var(--gray-200);">${exame.demissional ? '✓' : '-'}</td>
            </tr>`;
        idx++;
    });
    
    html += `
                </tbody>
            </table>
            <p style="margin: 1rem 0 0 0; font-size: 0.85rem; color: var(--gray-600);">
                📋 Total de exames: <strong>${examesConsolidados.size}</strong>
            </p>
        </div>`;
    
    return html;
}

// ==========================================
// ADICIONAR BOTÃO DE RELATÓRIO DE EXAMES
// ==========================================

/**
 * Adiciona botão para ver relatório de exames no card do cargo
 * Chame esta função após renderizar a lista de cargos
 */
function adicionarBotaoRelatorioExames() {
    // Esta função pode ser integrada diretamente nos botões de ação
    // Exemplo de uso no updateCargoList():
    /*
    itemActions.appendChild(createButton(
        '<i class="bi bi-clipboard2-pulse"></i> Exames', 
        'outline', 
        () => mostrarModalExames(index, 'cargo')
    ));
    */
}

/**
 * Mostra modal com relatório de exames
 */
function mostrarModalExames(index, tipo) {
    const depto = currentInspection.departamentos[activeDepartamentoIndex];
    let item;
    
    if (tipo === 'cargo') {
        item = depto.cargos[index];
    } else if (tipo === 'funcionario') {
        item = depto.funcionarios[index];
    } else if (tipo === 'grupo') {
        item = depto.grupos[index];
        item.nome = `Grupo: ${item.listaDeCargos.join(', ')}`;
    }
    
    if (!item) return;
    
    const relatorio = gerarRelatorioExames(item);
    
    // Cria modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 2rem;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 1rem; max-width: 900px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 2rem; position: relative;">
            <button onclick="this.closest('div').parentElement.remove()" style="position: absolute; top: 1rem; right: 1rem; background: var(--gray-200); border: none; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                <i class="bi bi-x-lg"></i>
            </button>
            <h2 style="margin-top: 0;">📋 Relatório de Exames Médicos</h2>
            ${relatorio}
            <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: flex-end;">
                <button class="outline" onclick="window.print()">
                    <i class="bi bi-printer"></i> Imprimir
                </button>
                <button class="primary" onclick="this.closest('div').parentElement.parentElement.remove()">
                    Fechar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fecha ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

console.log("✅ Funções de gerenciamento de exames médicos carregadas!");


function atualizarListaDeExames() {
    const perigoInput = document.getElementById('risco-perigo');
    const riscoAtual = perigoInput ? perigoInput.value.trim() : '';

    examesTemporarios = []; // Limpa a lista
    
    // Se estiver editando um risco, carrega os exames já salvos
    if (editingIndex > -1) {
        const depto = currentInspection.departamentos[activeDepartamentoIndex];
        let risco;
        if (currentGroupId) { risco = depto.grupos.find(g => g.id === currentGroupId)?.riscos[editingIndex]; }
        else if (activeCargoIndex > -1) { risco = depto.cargos[activeCargoIndex].riscos[editingIndex]; }
        else if (activeFuncionarioIndex > -1) { risco = depto.funcionarios[activeFuncionarioIndex].riscos[editingIndex]; }
        
        if (risco && risco.exames) {
            examesTemporarios = JSON.parse(JSON.stringify(risco.exames)); // Carrega os exames salvos
        }
    } 
    // Se for um risco novo ou sem exames salvos, busca sugestões
    else if (riscoAtual) {
        const examData = getExamesPorRisco(riscoAtual);
        if (examData && examData.exames) {
            examesTemporarios = JSON.parse(JSON.stringify(examData.exames)); // Carrega sugestões
        }
    }
    
    renderExamesEditaveis(); // Renderiza a lista na tela
}

// 2. RENDERIZA a lista de exames na tela
function renderExamesEditaveis() {
    const listContainer = document.getElementById('exames-editaveis-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = ''; // Limpa a lista visual
    
    if (examesTemporarios.length === 0) {
        listContainer.innerHTML = '<li class="empty-state">Nenhum exame vinculado a este risco.</li>';
        return;
    }
    
    examesTemporarios.forEach((exame, index) => {
        const li = document.createElement('li');
        li.style.padding = "0.75rem";
        const periodicidade = exame.observacoes || exame.periodicidade || 'Não especificado';
        
        li.innerHTML = `
            <div class="item-info">
                <strong>${escapeHtml(exame.nome)}</strong>
                <small>${escapeHtml(periodicidade)}</small>
            </div>
            <div class="item-actions">
                <button type="button" class="danger" onclick="removerExame(${index})"><i class="bi bi-trash3-fill"></i></button>
            </div>
        `;
        listContainer.appendChild(li);
    });
}

// 3. REMOVE um exame da lista temporária
function removerExame(index) {
    examesTemporarios.splice(index, 1);
    showToast("Exame removido da lista.", "warning");
    renderExamesEditaveis(); // Re-renderiza a lista atualizada
}

// 4. ADICIONA um exame manual à lista temporária
function adicionarExameManual() {
    const nomeInput = document.getElementById('novo-exame-nome');
    const periodicidadeInput = document.getElementById('novo-exame-periodicidade');
    
    const nome = nomeInput.value.trim();
    const periodicidade = periodicidadeInput.value.trim();
    
    if (!nome) {
        return showToast("O nome do exame é obrigatório.", "error");
    }
    
    examesTemporarios.push({
        nome: nome,
        periodicidade: periodicidade,
        customizado: true // Marca como um exame adicionado manualmente
    });
    
    showToast("Exame adicionado à lista!", "success");
    nomeInput.value = '';
    periodicidadeInput.value = '';
    renderExamesEditaveis(); // Re-renderiza
}
function logCurrentState(context) {
    if (window.innerWidth <= 768) { // Só no mobile
        console.log(`=== ${context} ===`);
        console.log("ID da inspeção:", currentInspection?.id);
        console.log("Departamentos:", currentInspection?.departamentos?.length || 0);
        console.log("Depto ativo:", activeDepartamentoIndex);
        if (activeDepartamentoIndex >= 0 && currentInspection?.departamentos?.[activeDepartamentoIndex]) {
            const depto = currentInspection.departamentos[activeDepartamentoIndex];
            console.log("Nome depto:", depto.nome);
            console.log("Cargos:", depto.cargos?.length || 0);
            console.log("Funcionários:", depto.funcionarios?.length || 0);
            console.log("Grupos:", depto.grupos?.length || 0);
        }
        console.log("================");
    }
}
// ==========================================
// ★★★ TRATAMENTO DE ERRO GLOBAL ★★★
// Adicione este bloco no final do seu arquivo app.js
// ==========================================
window.addEventListener('error', function(event) {
    const error = event.error || new Error(event.message);
    reportCriticalError(error, `operação no arquivo ${event.filename.split('/').pop()} na linha ${event.lineno}`);
    event.preventDefault();
});

/**
 * ★★★ NOVA FERRAMENTA DE DEBUG (4.0) ★★★
 * Centraliza a exibição do overlay de erro, fornecendo mais contexto.
 * @param {Error} error - O objeto de erro capturado.
 * @param {string} context - Uma descrição de onde o erro ocorreu (ex: "ao salvar departamento").
 */
function reportCriticalError(error, context = 'uma operação desconhecida') {
    const errorMessage = `ERRO CRÍTICO durante ${context}: ${error.message}`;
    console.error(errorMessage);
    if (error.stack) {
        console.error("Stack Trace:", error.stack);
    }

    let errorOverlay = document.getElementById('error-overlay');
    if (errorOverlay) return; // Evita mostrar múltiplos overlays

    errorOverlay = document.createElement('div');
    errorOverlay.id = 'error-overlay';
    errorOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background-color: rgba(0,0,0,0.8); z-index: 10000;
        display: flex; align-items: center; justify-content: center; padding: 1rem;
    `;
    errorOverlay.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 1rem; text-align: center; max-width: 500px; box-shadow: var(--shadow-lg);">
            <h2 style="color: var(--danger);"><i class="bi bi-exclamation-triangle-fill"></i> Oops! Algo deu errado.</h2>
            <p style="margin: 1rem 0; color: var(--gray-700);">
                O aplicativo encontrou um erro inesperado durante: <strong>${context}</strong>.
                Recomendamos recarregar a página para continuar.
            </p>
            <p style="font-size: 0.8rem; color: var(--gray-500); margin-bottom: 1.5rem; word-break: break-all;">
                <i>Detalhes técnicos foram registrados no console de depuração (🐞).</i>
            </p>
            <button class="primary" onclick="location.reload()">Recarregar Aplicativo</button>
        </div>
    `;
    document.body.appendChild(errorOverlay);
}

/**
 * ★★★ CORREÇÃO CRÍTICA (3.0) ★★★
 * Lê o valor de um campo de forma segura, retornando um valor padrão se o elemento não for encontrado.
 * Isso evita o erro "Cannot read properties of null".
 * @param {string} id - O ID do elemento a ser lido.
 * @param {any} defaultValue - O valor a ser retornado se o elemento não for encontrado.
 * @returns {string} - O valor do elemento ou o valor padrão.
 */
function getFieldValue(id, defaultValue = '') {
    const element = document.getElementById(id);
    // Se o elemento existir, retorna seu valor; senão, retorna o padrão.
    return element ? element.value : defaultValue;
}

/**
 * ★★★ CORREÇÃO CRÍTICA (3.0) ★★★
 * Coleta todos os dados do formulário de risco de forma robusta e à prova de falhas,
 * usando o auxiliar getFieldValue.
 * @returns {object} - O objeto riscoData com todos os campos.
 */
function collectRiscoFormData() {
    return {
        riscoPresente: getFieldValue("risco-presente", "Sim"),
        tipo: getFieldValue("risco-tipo"),
        codigoEsocial: getFieldValue("risco-esocial"),
        perigo: getFieldValue("risco-perigo").trim(), // .trim() é seguro aqui pois getFieldValue retorna string
        descricaoDetalhada: getFieldValue("risco-descricao-detalhada"),
        fonteGeradora: getFieldValue("risco-fonte"),
        perfilExposicao: getFieldValue("risco-perfil-exposicao"),
        medicao: getFieldValue("risco-medicao"),
        tempoExposicao: getFieldValue("risco-tempo-exposicao"),
        tipoExposicao: getFieldValue("risco-tipo-exposicao", "Permanente"),
        obsAmbientais: getFieldValue("risco-obs-ambientais"),
        probabilidade: getFieldValue("risco-probabilidade", "Improvável"),
        severidade: getFieldValue("risco-severidade", "Baixa"),
        aceitabilidade: getFieldValue("risco-aceitabilidade", "Tolerável"),
        danos: getFieldValue("risco-danos"),
        epiUtilizado: getFieldValue("risco-epi-utilizado"),
        ca: getFieldValue("risco-ca"),
        epc: getFieldValue("risco-epc"),
        epiSugerido: getFieldValue("risco-epi-sugerido"),
        acoesNecessarias: getFieldValue("risco-acoes"),
        observacoesGerais: getFieldValue("risco-observacoes-gerais")
    };
}

function setupServiceWorker() {
    if (!('serviceWorker' in navigator)) {
        console.warn("Service Worker não suportado.");
        return;
    }
    let newWorker;

    navigator.serviceWorker.register('./sw.js').then(reg => {
        console.log('Service Worker registrado com sucesso.');
        
        if (reg.waiting) {
            newWorker = reg.waiting;
            showUpdateBar();
            return;
        }

        reg.addEventListener('updatefound', () => {
            newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    showUpdateBar();
                }
            });
        });
    }).catch(error => {
        console.error('Falha ao registrar o Service Worker:', error);
    });

    document.body.addEventListener('click', (event) => {
        if (event.target.id === 'pwa-update-button' && newWorker) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
        }
    });

    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        console.log("Novo Service Worker assumiu o controle. Recarregando página...");
        window.location.reload();
        refreshing = true;
    });
}

  // ==========================================
// ★★★ CONSOLE DE DEBUG MÓVEL ★★★
// ==========================================
(function() {
    // Cria os elementos visuais do console
    const consoleContainer = document.createElement('div');
    consoleContainer.id = 'mobile-debug-console';
    consoleContainer.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        right: 10px;
        max-height: 30vh;
        background-color: rgba(0, 0, 0, 0.85);
        color: #fff;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        overflow-y: scroll;
        padding: 10px;
        z-index: 99999;
        display: none; /* Começa escondido */
        border: 1px solid #444;
    `;

    const consoleHeader = document.createElement('div');
    consoleHeader.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 5px;
        margin-bottom: 5px;
        border-bottom: 1px solid #555;
    `;

    const consoleTitle = document.createElement('span');
    consoleTitle.textContent = 'Mobile Console';
    consoleTitle.style.fontWeight = 'bold';

    const clearButton = document.createElement('button');
    clearButton.textContent = 'Limpar';
    clearButton.style.cssText = `background: #555; color: white; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer;`;
    clearButton.onclick = () => { consoleContainer.innerHTML = ''; consoleContainer.appendChild(consoleHeader); };

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fechar';
    closeButton.style.cssText = `background: #555; color: white; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer; margin-left: 5px;`;
    closeButton.onclick = () => { consoleContainer.style.display = 'none'; };

    const headerActions = document.createElement('div');
    headerActions.appendChild(clearButton);
    headerActions.appendChild(closeButton);

    consoleHeader.appendChild(consoleTitle);
    consoleHeader.appendChild(headerActions);
    consoleContainer.appendChild(consoleHeader);
    document.body.appendChild(consoleContainer);

    // Função para adicionar mensagens ao console visual
    function logToScreen(message, color = '#0f0') { // Verde por padrão
        const line = document.createElement('div');
        line.style.cssText = `border-bottom: 1px solid #333; padding: 2px 0; color: ${color};`;
        
        if (typeof message === 'object') {
            line.textContent = `[${new Date().toLocaleTimeString()}] ${JSON.stringify(message, null, 2)}`;
        } else {
            line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        }
        
        consoleContainer.appendChild(line);
        consoleContainer.scrollTop = consoleContainer.scrollHeight; // Rola para o final
    }

    // Sobrescreve as funções originais do console
    const oldLog = console.log;
    const oldError = console.error;
    const oldWarn = console.warn;

    console.log = function(message, ...args) {
        logToScreen(message, '#0f0'); // Verde
        oldLog.apply(console, [message, ...args]);
    };

    console.error = function(message, ...args) {
        logToScreen(message, '#f00'); // Vermelho
        oldError.apply(console, [message, ...args]);
    };

    console.warn = function(message, ...args) {
        logToScreen(message, '#ff0'); // Amarelo
        oldWarn.apply(console, [message, ...args]);
    };
    
    // Adiciona um botão para abrir o console
    const openButton = document.createElement('button');
    openButton.textContent = '🐞';
    openButton.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary);
        color: white;
        font-size: 24px;
        border: none;
        box-shadow: var(--shadow-lg);
        z-index: 99998;
    `;
    openButton.onclick = () => {
        const consoleEl = document.getElementById('mobile-debug-console');
        consoleEl.style.display = consoleEl.style.display === 'none' ? 'block' : 'none';
    };
    document.body.appendChild(openButton);
    
})();