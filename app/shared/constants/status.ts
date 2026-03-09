export const STATUS_COLORS = {
    'ATRASADO': 'bg-[#ff0000] text-black',
    'COBRAR': 'bg-[#ff9900] text-black',
    'ALERTA': 'bg-[#ffff00] text-black',
    'NO PRAZO': 'bg-[#38761d] text-black',
    'CONCLUÍDO': 'bg-[#1155cc] text-white',
    'AGUARDANDO DESPACHO': 'bg-[#a64d79] text-white',
    'AGUARDANDO NOVO PRAZO': 'bg-[#93c47d] text-black',
    'PENDENTE': 'bg-[#f6b26b] text-black',
} as const

export const ACOES = [
    'RESPONDIDO',
    'ANÁLISE',
    'BLOQUEIO'
] as const
