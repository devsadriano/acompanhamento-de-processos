export const STATUS_COLORS = {
    'CONCLUÍDO': 'bg-[#002060] text-white',
    'AGUARDANDO DESPACHO': 'bg-blue-100 text-blue-800 border-blue-200',
    'AGUARDANDO NOVO PRAZO': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'PENDENTE': 'bg-gray-100 text-gray-800 border-gray-200',
    'ATRASADO': 'bg-red-600 text-white border-red-700',
    'COBRAR': 'bg-orange-500 text-white border-orange-600',
    'ALERTA': 'bg-amber-400 text-black border-amber-500',
    'NO PRAZO': 'bg-[#0070c0] text-white border-blue-700',
} as const

export const ACOES = [
    'RESPONDIDO',
    'ANÁLISE',
    'DILAÇÃO',
    'ELABORAR',
    'BLOQUEIO'
] as const

export const PRIORIDADES = [
    'ALTA',
    'MÉDIA',
    'BAIXA'
] as const
