import type { StatusType, AcaoType } from '../shared/types/processo.types'
import { differenceInDays } from 'date-fns'

export const useStatusCalculator = () => {
    /**
     * Calcula o status baseado nas regras de negócio do Excel
     * 
     * Fórmula original do Excel (Coluna I):
     * =IF(H2="","",IF(J2="RESPONDIDO","CONCLUÍDO",IF(J2="ANÁLISE","AGUARDANDO DESPACHO",
     * IF(J2="DILAÇÃO","AGUARDANDO NOVO PRAZO",IF(J2="ELABORAR","PENDENTE",
     * IF(H2-TODAY()<0,"ATRASADO",IF(H2-TODAY()=0,"COBRAR",
     * IF(H2-TODAY()<=5,"ALERTA","NO PRAZO")))))))
     * 
     * @param prazo - Data do prazo (formato ISO string)
     * @param acao - Ação atual do processo
     * @returns Status calculado ou null se não houver prazo
     */
    /**
     * Converte uma string de data (YYYY-MM-DD ou ISO) para Date local,
     * evitando o bug de UTC que faz datas aparecerem um dia antes no Brasil.
     */
    const parseLocalDate = (dateStr: string): Date => {
        const datePart = dateStr.split('T')[0] ?? dateStr
        const parts = datePart.split('-').map(Number)
        const year = parts[0] ?? 0
        const month = parts[1] ?? 1
        const day = parts[2] ?? 1
        return new Date(year, month - 1, day, 0, 0, 0, 0)
    }

    const calculateStatus = (prazo: string | null, acao: AcaoType | null): StatusType | null => {
        // Se não há prazo, não há status
        if (!prazo) return null

        // 1. Ações definitivas
        if (acao === 'RESPONDIDO') return 'CONCLUÍDO'
        if (acao === 'ANÁLISE') return 'AGUARDANDO DESPACHO'
        if (acao === 'BLOQUEIO') return 'ATRASADO'

        // 2. Urgência por Prazo
        const hoje = new Date()
        hoje.setHours(0, 0, 0, 0)

        const dataPrazo = parseLocalDate(prazo)
        const diasRestantes = differenceInDays(dataPrazo, hoje)

        if (diasRestantes < 0) return 'ATRASADO'
        if (diasRestantes === 0) return 'COBRAR'
        if (diasRestantes <= 5) return 'ALERTA'

        return 'NO PRAZO'
    }

    /**
     * Calcula ambos os status de um processo
     */
    const calculateAllStatus = (processo: {
        prazo_1: string | null
        acao_1: AcaoType | null
        prazo_2: string | null
        acao_2: AcaoType | null
    }) => {
        return {
            status_1: calculateStatus(processo.prazo_1, processo.acao_1),
            status_2: calculateStatus(processo.prazo_2, processo.acao_2)
        }
    }

    /**
     * Retorna a cor CSS para um status
     */
    const getStatusColor = (status: StatusType | null): string => {
        if (!status) return 'bg-gray-100 text-gray-800'

        const colors: Record<string, string> = {
            'ATRASADO': 'bg-[#ff0000] text-black',
            'COBRAR': 'bg-[#ff9900] text-black',
            'ALERTA': 'bg-[#ffff00] text-black',
            'NO PRAZO': 'bg-[#38761d] text-black',
            'CONCLUÍDO': 'bg-[#1155cc] text-white',
            'AGUARDANDO DESPACHO': 'bg-[#a64d79] text-white',
            'AGUARDANDO NOVO PRAZO': 'bg-[#93c47d] text-black',
            'PENDENTE': 'bg-[#f6b26b] text-black',
        }

        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    return {
        calculateStatus,
        calculateAllStatus,
        getStatusColor
    }
}
