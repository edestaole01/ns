// exames-data.js
// Base de dados de exames médicos ocupacionais por tipo de risco
// Baseado nas normas regulamentadoras e boas práticas de medicina do trabalho
// Última atualização: 15/10/2024

const examesPorRisco = {
    // ========================================
    // RISCOS FÍSICOS
    // ========================================
    "Exposição a ruído contínuo e intermitente": {
        codigoEsocial: "02.01.001",
        exames: [
            {
                nome: "AUDIOMETRIA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: true,
                demissional: true,
                observacoes: "Obrigatório para exposição entre nível de ação e acima do limite de tolerância"
            }
        ]
    },
    
    "Exposição a ruído contínuo e intermitente no trânsito": {
        codigoEsocial: "-",
        exames: [
            {
                nome: "AUDIOMETRIA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: true,
                demissional: true,
                observacoes: ""
            }
        ]
    },
    
    "Vibração de corpo inteiro (aceleração resultante de exposição normalizada - aren)": {
        codigoEsocial: "02.01.003",
        exames: [
            {
                nome: "AUDIOMETRIA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: true,
                demissional: true,
                observacoes: ""
            }
        ]
    },
    
    "Radiações ionizantes": {
        codigoEsocial: "02.01.006",
        exames: [
            {
                nome: "HEMOGRAMA COMPLETO + CONTAGEM DE PLAQUETAS E RETICULÓCITOS",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: "Monitoramento de células sanguíneas"
            }
        ]
    },
    
    "Exposição a frio intenso": {
        codigoEsocial: "-",
        exames: [
            {
                nome: "ESPIROMETRIA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: false,
                retornoTrabalho: false,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "RAIO X DE TÓRAX",
                admissional: true,
                periodico: "24 MESES",
                mudancaRisco: false,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            }
        ]
    },
    
    "Trabalhos com exposição ao calor acima dos limites de tolerância estabelecidos na NR-15, da Portaria 3.214/1978": {
        codigoEsocial: "02.01.014",
        exames: [
            {
                nome: "CPK (CREATINOQUINASE)",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: "Avaliação de lesão muscular"
            }
        ]
    },

    // ========================================
    // RISCOS QUÍMICOS
    // ========================================
    "Inalação de fumos metálicos": {
        codigoEsocial: "-",
        exames: [
            {
                nome: "ESPIROMETRIA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: false,
                retornoTrabalho: false,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "RAIO X DE TÓRAX",
                admissional: true,
                periodico: "24 MESES",
                mudancaRisco: false,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            }
        ]
    },
    
    "Inalação de poeiras": {
        codigoEsocial: "-",
        exames: [
            {
                nome: "ESPIROMETRIA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: false,
                retornoTrabalho: false,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "RAIO X DE TÓRAX",
                admissional: true,
                periodico: "24 MESES",
                mudancaRisco: false,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            }
        ]
    },
    
    "Graxas, óleos": {
        codigoEsocial: "-",
        exames: [
            {
                nome: "GAMA GT",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: "Função hepática"
            },
            {
                nome: "TGO (AST)",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: "Função hepática"
            },
            {
                nome: "TGP (ALT)",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: "Função hepática"
            },
            {
                nome: "HEMOGRAMA COMPLETO",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            }
        ]
    },
    
    "Inalação de névoa": {
        codigoEsocial: "-",
        exames: [
            {
                nome: "ESPIROMETRIA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "RAIO X DE TÓRAX",
                admissional: true,
                periodico: "24 MESES",
                mudancaRisco: false,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            }
        ]
    },
    
    "Lubrificantes": {
        codigoEsocial: "-",
        exames: [
            {
                nome: "GAMA GT",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "TGO (AST)",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "TGP (ALT)",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "HEMOGRAMA COMPLETO",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            }
        ]
    },
    
    "Inalação de gases": {
        codigoEsocial: "-",
        exames: [
            {
                nome: "ESPIROMETRIA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: true,
                observacoes: ""
            }
        ]
    },
    
    "Inalação de vapores": {
        codigoEsocial: "-",
        exames: [
            {
                nome: "ESPIROMETRIA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: true,
                observacoes: ""
            }
        ]
    },
    
    "Benzeno e seus compostos tóxicos": {
        codigoEsocial: "01.03.001",
        exames: [
            {
                nome: "ÁCIDO TRANSMUCÔNICO",
                admissional: true,
                periodico: "6 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: true,
                observacoes: "Indicador biológico de exposição ao benzeno"
            },
            {
                nome: "RETICULÓCITOS",
                admissional: true,
                periodico: "6 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "HEMOGRAMA COM CONTAGEM DE PLAQUETAS",
                admissional: true,
                periodico: "6 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: true,
                observacoes: ""
            }
        ]
    },

    // ========================================
    // RISCOS BIOLÓGICOS
    // ========================================
    "Exposição a agentes microbiológicos (vírus, fungos, bactérias, protozoários, parasitas)": {
        codigoEsocial: "-",
        exames: [
            {
                nome: "HEMOGRAMA COMPLETO",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            }
        ]
    },
    
    "AGENTES BIOLÓGICOS; Trabalhos em estabelecimentos de saúde": {
        codigoEsocial: "03.01.001",
        exames: [
            {
                nome: "ANTI HBS (Anticorpo Hepatite B)",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: true,
                demissional: true,
                observacoes: "Área da saúde"
            },
            {
                nome: "ANTI HBC TOTAL (Anticorpo Hepatite B Core)",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: true,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "HBSAG (Antígeno Hepatite B)",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: true,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "HCV (Hepatite C)",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: true,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "HEMOGRAMA COMPLETO",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: true,
                demissional: true,
                observacoes: ""
            }
        ]
    },
    
    "AGENTES BIOLÓGICOS; Trabalhos com animais infectados": {
        codigoEsocial: "03.01.002",
        exames: [
            {
                nome: "ANTI HBS (Anticorpo Hepatite B)",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: true,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "ANTI HBC TOTAL",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: true,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "HBSAG",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: true,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "HCV",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: true,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "HEMOGRAMA COMPLETO",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: true,
                demissional: true,
                observacoes: ""
            }
        ]
    },

    // ========================================
    // RISCOS ERGONÔMICOS
    // ========================================
    "Esforço físico intenso": {
        codigoEsocial: "-",
        exames: [
            {
                nome: "RAIO X LOMBO SACRO",
                admissional: true,
                periodico: false,
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: "Aplicar quando houver dois riscos simultâneos"
            }
        ]
    },
    
    "Levantamento e transporte manual de peso": {
        codigoEsocial: "-",
        exames: [
            {
                nome: "RAIO X DE COLUNA LOMBO SACRO",
                admissional: false,
                periodico: false,
                mudancaRisco: false,
                retornoTrabalho: false,
                demissional: false,
                observacoes: "Avaliar necessidade conforme caso"
            }
        ]
    },

    // ========================================
    // RISCOS DE ACIDENTES
    // ========================================
    "Contato com eletricidade": {
        codigoEsocial: "-",
        exames: [
            {
                nome: "ECG (ELETROCARDIOGRAMA)",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "ACUIDADE VISUAL",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            }
        ]
    },
    
    "Contato com partes móveis de equipamentos": {
        codigoEsocial: "-",
        exames: [
            {
                nome: "ACUIDADE VISUAL",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: false,
                retornoTrabalho: false,
                demissional: false,
                observacoes: "NR 12"
            }
        ]
    },
    
    "Contato com arestas perfuro-cortantes": {
        codigoEsocial: "-",
        exames: [
            {
                nome: "ANTI HBS",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: true,
                observacoes: "Área da saúde"
            },
            {
                nome: "ANTI HBC TOTAL",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "HBSAG",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "HCV",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "HEMOGRAMA COMPLETO",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: true,
                observacoes: ""
            }
        ]
    },
    
    "Espaço Confinado (falta de Ventilação adequada ou deficiência de oxigênio)": {
        codigoEsocial: "-",
        exames: [
            {
                nome: "ACUIDADE VISUAL",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "ECG",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "EEG (ELETROENCEFALOGRAMA)",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "AUDIOMETRIA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "HEMOGRAMA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "GLICEMIA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "AVALIAÇÃO PSICOSSOCIAL",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            }
        ]
    },
    
    "Queda maior que dois metros de altura": {
        codigoEsocial: "-",
        exames: [
            {
                nome: "ACUIDADE VISUAL",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "ECG",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "EEG",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "AUDIOMETRIA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "HEMOGRAMA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "GLICEMIA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "AVALIAÇÃO PSICOSSOCIAL",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: "NR 35"
            }
        ]
    }
};

// Atividades especiais que requerem exames específicos
const examesPorAtividade = {
    "EMPILHADEIRA": {
        exames: [
            {
                nome: "ACUIDADE VISUAL",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: "Operador"
            },
            {
                nome: "ECG",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "EEG",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "AUDIOMETRIA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "HEMOGRAMA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "GLICEMIA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "RAIO X LOMBO SACRO",
                admissional: true,
                periodico: false,
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: "Somente admissional e mudança de risco"
            }
        ]
    },
    
    "MOTORISTA": {
        exames: [
            {
                nome: "ACUIDADE VISUAL",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: false,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "ECG",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: false,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "EEG",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: false,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "AUDIOMETRIA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: false,
                retornoTrabalho: false,
                demissional: true,
                observacoes: ""
            },
            {
                nome: "HEMOGRAMA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: false,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "GLICEMIA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: false,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "RAIO X LOMBO SACRO",
                admissional: true,
                periodico: false,
                mudancaRisco: false,
                retornoTrabalho: false,
                demissional: false,
                observacoes: "Se aplicável altura"
            },
            {
                nome: "AVALIAÇÃO PSICOSSOCIAL",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: false,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            }
        ]
    },
    
    "MANIPULAÇÃO DE ALIMENTOS": {
        exames: [
            {
                nome: "COPROCULTURA",
                admissional: true,
                periodico: false,
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: "Somente admissional e mudança de risco"
            },
            {
                nome: "PARASITOLÓGICO DE FEZES",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "MICOLÓGICO DE UNHA",
                admissional: true,
                periodico: false,
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            },
            {
                nome: "HEMOGRAMA",
                admissional: true,
                periodico: "12 MESES",
                mudancaRisco: true,
                retornoTrabalho: false,
                demissional: false,
                observacoes: ""
            }
        ]
    }
};

// Função auxiliar para buscar exames por risco
function getExamesPorRisco(perigoDescricao) {
    return examesPorRisco[perigoDescricao] || null;
}

// Função auxiliar para buscar exames por atividade
function getExamesPorAtividade(atividade) {
    return examesPorAtividade[atividade] || null;
}

// Exporta para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { examesPorRisco, examesPorAtividade, getExamesPorRisco, getExamesPorAtividade };
}

console.log("✅ Base de dados de exames médicos carregada!");
console.log(`📋 Total de riscos com exames: ${Object.keys(examesPorRisco).length}`);
console.log(`🏥 Total de atividades especiais: ${Object.keys(examesPorAtividade).length}`);