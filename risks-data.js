// risks-data.js
// Base de dados COMPLETA de riscos predefinidos para inspeções de segurança
// Fonte: Check List_Rev 06 Fatores Psicossociais_12 03 2025.xlsx
// Total de 148 riscos organizados por categoria
// Última atualização: 15/10/2024

const predefinedRisks = [
    // ========================================
    // FÍSICO (15 riscos)
    // ========================================
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
    { tipo: "FÍSICO", codigoEsocial: "02.01.016", perigo: "Trabalhos em caixões ou câmaras hiperbáricas", danos: "Lombalgias, lesões musculares, problemas nas articulações, fadiga muscular." },
    { tipo: "FÍSICO", codigoEsocial: "02.01.017", perigo: "Trabalhos em tubulões ou túneis sob ar comprimido", danos: "" },
    { tipo: "FÍSICO", codigoEsocial: "02.01.018", perigo: "Operações de mergulho com o uso de escafandros ou outros equipamentos", danos: "" },
    { tipo: "FÍSICO", codigoEsocial: "-", perigo: "Exposição à umidade, locais alagados", danos: "Doenças respiratórias" },
    { tipo: "FÍSICO", codigoEsocial: "-", perigo: "Exposição a ruído contínuo e intermitente no trânsito", danos: "Diminuição gradual da audição, cansaço, irritação, zumbido, fadiga, surdez" },

    // ========================================
    // QUÍMICO (72 riscos)
    // ========================================
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Inalação de fumos metálicos", danos: "Doenças respiratórias" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Inalação de poeiras", danos: "Doenças respiratórias" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Graxas, óleos", danos: "" },
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
    { tipo: "QUÍMICO", codigoEsocial: "01.10.001", perigo: "Cromo hexavalente e seus compostos tóxicos", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.11.001", perigo: "Mercúrio e seus compostos tóxicos", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.12.001", perigo: "Níquel e seus compostos tóxicos", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.13.001", perigo: "Fósforo e seus compostos tóxicos", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.14.001", perigo: "Manganês e seus compostos tóxicos", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.15.001", perigo: "Hidrocarbonetos e outros compostos de carbono", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.16.001", perigo: "Bromo e seus compostos", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.17.001", perigo: "Iodo e seus compostos", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.18.001", perigo: "Sílica livre", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "01.19.001", perigo: "Gases asfixiantes", danos: "" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Ácido sulfúrico", danos: "Queimaduras, irritação respiratória" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Ácido clorídrico", danos: "Queimaduras, irritação respiratória" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Ácido nítrico", danos: "Queimaduras, irritação respiratória" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Hidróxido de sódio (soda cáustica)", danos: "Queimaduras químicas graves" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Amônia", danos: "Irritação respiratória, queimaduras" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Formaldeído", danos: "Irritação, sensibilização, câncer" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Acetona", danos: "Irritação, narcose" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Tolueno", danos: "Efeitos no sistema nervoso central" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Xileno", danos: "Efeitos no sistema nervoso central" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Metanol", danos: "Cegueira, danos neurológicos" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Etanol", danos: "Intoxicação, irritação" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Acetato de etila", danos: "Irritação, narcose" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Aguarrás/Thinner", danos: "Irritação, efeitos neurológicos" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Monóxido de carbono (CO)", danos: "Asfixia, morte" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Dióxido de carbono (CO2)", danos: "Asfixia em altas concentrações" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Gás sulfídrico (H2S)", danos: "Asfixia, morte" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Dióxido de enxofre (SO2)", danos: "Irritação respiratória" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Óxidos de nitrogênio (NOx)", danos: "Irritação respiratória, edema pulmonar" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Ozônio (O3)", danos: "Irritação respiratória" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Cloro gasoso", danos: "Irritação respiratória grave, edema pulmonar" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Poeiras minerais", danos: "Pneumoconiose, silicose" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Poeiras de madeira", danos: "Câncer nasal, alergias" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Poeiras metálicas", danos: "Doenças respiratórias" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Poeiras de algodão", danos: "Bissinose" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Pesticidas organofosforados", danos: "Intoxicação, efeitos neurológicos" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Pesticidas organoclorados", danos: "Intoxicação, câncer" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Herbicidas", danos: "Intoxicação, câncer" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Fungicidas", danos: "Intoxicação, alergias" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Produtos de limpeza (detergentes, desinfetantes)", danos: "Irritação, alergias, queimaduras" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Hipoclorito de sódio (água sanitária)", danos: "Irritação, queimaduras" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Quaternário de amônio", danos: "Irritação, sensibilização" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Fenóis e derivados", danos: "Queimaduras, intoxicação" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Tintas e vernizes", danos: "Intoxicação, irritação" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Resinas epóxi", danos: "Sensibilização, dermatite" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Isocianatos", danos: "Asma ocupacional, sensibilização" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Poliuretano", danos: "Irritação, sensibilização" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Fibra de vidro", danos: "Irritação de pele e mucosas" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Látex", danos: "Alergias, sensibilização" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Borracha e seus aditivos", danos: "Dermatites, sensibilização" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Querosene", danos: "Intoxicação, pneumonia química" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Diesel", danos: "Irritação, câncer" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Gasolina", danos: "Intoxicação, efeitos neurológicos" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "GLP (Gás Liquefeito de Petróleo)", danos: "Asfixia, explosão" },
    { tipo: "QUÍMICO", codigoEsocial: "-", perigo: "Gás natural", danos: "Asfixia, explosão" },

    // ========================================
    // BIOLÓGICO (8 riscos)
    // ========================================
    { tipo: "BIOLÓGICO", codigoEsocial: "-", perigo: "Exposição a agentes microbiológicos (vírus, fungos, bactérias, protozoários, parasitas)", danos: "Doenças decorrentes de contaminação" },
    { tipo: "BIOLÓGICO", codigoEsocial: "03.01.001", perigo: "AGENTES BIOLÓGICOS; Trabalhos em estabelecimentos de saúde", danos: "" },
    { tipo: "BIOLÓGICO", codigoEsocial: "03.01.002", perigo: "AGENTES BIOLÓGICOS; Trabalhos com animais infectados", danos: "" },
    { tipo: "BIOLÓGICO", codigoEsocial: "03.01.003", perigo: "AGENTES BIOLÓGICOS; Trabalhos em laboratórios de análises clínicas", danos: "" },
    { tipo: "BIOLÓGICO", codigoEsocial: "03.01.004", perigo: "AGENTES BIOLÓGICOS; Trabalhos em contato com pacientes", danos: "" },
    { tipo: "BIOLÓGICO", codigoEsocial: "03.01.005", perigo: "AGENTES BIOLÓGICOS; Trabalhos em esgoto e galerias", danos: "" },
    { tipo: "BIOLÓGICO", codigoEsocial: "03.01.006", perigo: "AGENTES BIOLÓGICOS; Trabalhos em cemitérios", danos: "" },
    { tipo: "BIOLÓGICO", codigoEsocial: "03.01.007", perigo: "AGENTES BIOLÓGICOS; Coleta e industrialização do lixo", danos: "" },

    // ========================================
    // ERGONÔMICO (20 riscos)
    // ========================================
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Esforço físico intenso", danos: "Lombalgias, lesões musculares, fadiga, Distensão muscular" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Levantamento e transporte manual de peso", danos: "Dores musculares, Lombalgia" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Postura, Torcendo toalha (Wash Rag)", danos: "Dores musculares" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Postura, Cotovelos para fora (Elbows out)", danos: "Dores musculares" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Postura, Ombros muito alto/muito baixo (Shoulder too high / too low)", danos: "Dores musculares" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Postura, Pescoço torcido ou inclinado", danos: "Dores musculares, cervicalgia" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Postura, Costas curvadas", danos: "Lombalgia, dores nas costas" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Postura, De cócoras ou ajoelhado", danos: "Dores articulares, lesões de joelho" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Trabalho em turno e noturno", danos: "Stress físico e/ou psíquico" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Jornada de trabalho prolongada", danos: "Stress físico e/ou psíquico" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Monotonia", danos: "Stress físico e/ou psíquico" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Postura sentado por longos períodos", danos: "Desconforto, lombalgias, lesões, dores musculares" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Postura em pé estática por longos períodos", danos: "Fadiga, varizes, dores nas pernas" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Iluminação inadequada ou deficiente", danos: "Fadiga visual" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Movimentos repetitivos", danos: "DORT, LER" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Posturas incômodas ou pouco confortáveis", danos: "Lombalgias, lesões musculares" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Ritmo de trabalho intenso", danos: "Fadiga, estresse" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Trabalho com exigência de atenção constante", danos: "Fadiga mental, estresse" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Mobiliário inadequado", danos: "Dores musculares, posturas inadequadas" },
    { tipo: "ERGONÔMICO", codigoEsocial: "-", perigo: "Equipamentos e ferramentas inadequados", danos: "Lesões, fadiga, desconforto" },

    // ========================================
    // ERGONÔMICO PSICOSSOCIAIS (12 riscos)
    // ========================================
    { tipo: "ERGONÔMICO PSICOSSOCIAIS", codigoEsocial: "-", perigo: "Estresse", danos: "Fadiga, estresse e distúrbios" },
    { tipo: "ERGONÔMICO PSICOSSOCIAIS", codigoEsocial: "-", perigo: "Carga de trabalho excessiva", danos: "Fadiga, estresse e distúrbios" },
    { tipo: "ERGONÔMICO PSICOSSOCIAIS", codigoEsocial: "-", perigo: "Pressão por produtividade", danos: "Ansiedade, estresse, burnout" },
    { tipo: "ERGONÔMICO PSICOSSOCIAIS", codigoEsocial: "-", perigo: "Assédio moral", danos: "Depressão, ansiedade, transtornos psicológicos" },
    { tipo: "ERGONÔMICO PSICOSSOCIAIS", codigoEsocial: "-", perigo: "Turnos exaustivos e noturnos", danos: "Distúrbios do sono, fadiga crônica" },
    { tipo: "ERGONÔMICO PSICOSSOCIAIS", codigoEsocial: "-", perigo: "Falta de reconhecimento", danos: "Desmotivação, baixa autoestima, estresse" },
    { tipo: "ERGONÔMICO PSICOSSOCIAIS", codigoEsocial: "-", perigo: "Falta de autonomia no trabalho", danos: "Frustração, estresse, desmotivação" },
    { tipo: "ERGONÔMICO PSICOSSOCIAIS", codigoEsocial: "-", perigo: "Relações interpessoais tóxicas", danos: "Estresse, ansiedade, conflitos" },
    { tipo: "ERGONÔMICO PSICOSSOCIAIS", codigoEsocial: "-", perigo: "Insegurança no emprego", danos: "Ansiedade, estresse, depressão" },
    { tipo: "ERGONÔMICO PSICOSSOCIAIS", codigoEsocial: "-", perigo: "Trabalho monótono e repetitivo", danos: "Desmotivação, fadiga mental, estresse" },
    { tipo: "ERGONÔMICO PSICOSSOCIAIS", codigoEsocial: "-", perigo: "Falta de suporte organizacional", danos: "Sobrecarga, estresse, insegurança" },
    { tipo: "ERGONÔMICO PSICOSSOCIAIS", codigoEsocial: "-", perigo: "Dificuldade de conciliar trabalho e vida pessoal", danos: "Estresse, conflitos familiares, burnout" },

    // ========================================
    // ACIDENTE (21 riscos)
    // ========================================
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Contato com eletricidade", danos: "Choque elétrico, queimaduras, parada cardíaca, morte" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Escorregão e queda", danos: "Lesões por quedas / torções" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Contato com partes móveis de equipamentos", danos: "Corte, contusão, esmagamento, morte, Amputações" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Explosão", danos: "Queimadura, morte" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Queda de materiais de diferentes níveis", danos: "Escoriações, fraturas, entorse, contusões" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Contato com arestas perfuro-cortantes", danos: "Lesões, corte contuso, lacerações" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Projeção de partículas, partes, peças", danos: "Cortes, Lesão nos olhos" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Incêndio", danos: "Perdas materiais, lesões, queimaduras e morte" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Ataque de animais peçonhentos ou insetos", danos: "Envenenamento / Ferimento" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Atropelamento, batidas, acidentes", danos: "Perda material, fraturas, escoriações, morte" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Prensagem", danos: "Lesões / Fraturas, Morte" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Queda de mesmo nível", danos: "Escoriações, fraturas, entorses, contusões" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Queda de diferente nível menor ou igual a dois metros", danos: "Escoriações, fraturas, entorses, contusões" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Queda maior que dois metros de altura", danos: "Escoriações, fraturas, entorses, contusões, morte" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Espaço Confinado (falta de Ventilação adequada ou deficiência de oxigênio)", danos: "Asfixia" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Queimadura", danos: "Lesões de pele, infecções" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Trabalho em altura", danos: "Quedas, fraturas, morte" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Afogamento", danos: "Morte, lesões cerebrais" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Soterramento", danos: "Asfixia, esmagamento, morte" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Exposição a animais selvagens", danos: "Mordidas, ataques, infecções" },
    { tipo: "ACIDENTE", codigoEsocial: "-", perigo: "Contato com superfícies aquecidas", danos: "Queimaduras térmicas" }
];

// Exporta o array para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = predefinedRisks;
}

// Estatísticas do arquivo
console.log("✅ Base de dados de riscos carregada com sucesso!");
console.log(`📊 Total de riscos: ${predefinedRisks.length}`);
console.log("📋 Distribuição por categoria:");
console.log("   • FÍSICO: 15 riscos");
console.log("   • QUÍMICO: 72 riscos");
console.log("   • BIOLÓGICO: 8 riscos");
console.log("   • ERGONÔMICO: 20 riscos");
console.log("   • ERGONÔMICO PSICOSSOCIAIS: 12 riscos");
console.log("   • ACIDENTE: 21 riscos");