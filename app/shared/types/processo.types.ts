export interface Processo {
    id: string
    user_id: string
    data_recebimento: string | null // Nova: DATA DE RECEBIMENTO
    sei_numero: string | null       // Nova: SEI nº
    unidade: string | null          // Mapeia para ORIGEM
    numero_processo: string | null  // Mapeia para Nº PROCESSO
    interessado: string | null      // Mapeia para NOME DO SERVIDOR
    assunto: string | null          // Mapeia para ASSUNTO
    complemento_assunto: string | null // Nova: COMPLEMENTO DO ASSUNTO
    prazo_1: string | null          // Mapeia para PRAZO INTERNO
    acao_1: AcaoType | null         // Mapeia para SITUAÇÃO 1
    status_1: StatusType | null       // Mapeia para STATUS 1
    prazo_2: string | null          // Mapeia para PRAZO FATAL
    acao_2: AcaoType | null         // Mapeia para SITUAÇÃO 2
    status_2: StatusType | null       // Mapeia para STATUS 2
    observacoes: string | null
    tags: string[] | null
    created_at: string
    updated_at: string
}

export type StatusType =
    | 'CONCLUÍDO'
    | 'AGUARDANDO DESPACHO'
    | 'AGUARDANDO NOVO PRAZO'
    | 'PENDENTE'
    | 'ATRASADO'
    | 'COBRAR'
    | 'ALERTA'
    | 'NO PRAZO'

export type AcaoType = 'RESPONDIDO' | 'ANÁLISE' | 'BLOQUEIO'
