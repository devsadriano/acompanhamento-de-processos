import type { Processo } from '../shared/types/processo.types'

export const useProcessos = () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    const { calculateAllStatus } = useStatusCalculator()

    const processos = ref<Processo[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Buscar todos os processos do usuário
    const fetchProcessos = async () => {
        loading.value = true
        error.value = null

        try {
            const { data, error: fetchError } = await (supabase as any)
                .from('processos')
                .select('*')
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            // Calcular status em tempo real para cada processo
            processos.value = ((data as any[]) || []).map(processo => {
                const status = calculateAllStatus({
                    prazo_1: processo.prazo_1,
                    acao_1: processo.acao_1,
                    prazo_2: processo.prazo_2,
                    acao_2: processo.acao_2
                })

                return {
                    ...processo,
                    status_1: status.status_1,
                    status_2: status.status_2,
                } as Processo
            })
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erro ao buscar processos'
            console.error('Erro ao buscar processos:', err)
        } finally {
            loading.value = false
        }
    }

    // Criar novo processo
    const createProcesso = async (processo: Partial<Processo>) => {
        try {
            // Limpar dados (remover ids e campos calculados)
            const { id, created_at, updated_at, status_1, status_2, ...cleanData } = processo as any

            const { data, error: createError } = await (supabase as any)
                .from('processos')
                .insert({
                    ...cleanData,
                    user_id: user.value?.id
                })
                .select()
                .single()

            if (createError) throw createError

            await fetchProcessos()
            return data
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao criar processo'
            console.error('Erro ao criar processo:', err)
            throw new Error(errorMsg)
        }
    }

    // Atualizar processo
    const updateProcesso = async (id: string, updates: Partial<Processo>) => {
        try {
            // Limpar dados (remover campos calculados e metadados fixos)
            const {
                id: _id,
                user_id,
                created_at,
                updated_at,
                status_1,
                status_2,
                ...cleanData
            } = updates as any

            const { error: updateError } = await (supabase as any)
                .from('processos')
                .update(cleanData)
                .eq('id', id)

            if (updateError) throw updateError

            await fetchProcessos()
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar processo'
            console.error('Erro ao atualizar processo:', err)
            throw new Error(errorMsg)
        }
    }

    // Deletar processo
    const deleteProcesso = async (id: string) => {
        try {
            const { error: deleteError } = await (supabase as any)
                .from('processos')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError

            await fetchProcessos()
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar processo'
            error.value = errorMsg
            throw new Error(errorMsg)
        }
    }

    // Estatísticas dos processos
    const stats = computed(() => {
        const total = processos.value.length
        const atrasados = processos.value.filter(p =>
            p.status_1 === 'ATRASADO' || p.status_2 === 'ATRASADO'
        ).length
        const alertas = processos.value.filter(p =>
            p.status_1 === 'ALERTA' || p.status_2 === 'ALERTA'
        ).length
        const concluidos = processos.value.filter(p =>
            p.status_1 === 'CONCLUÍDO' && p.status_2 === 'CONCLUÍDO'
        ).length

        return {
            total,
            atrasados,
            alertas,
            concluidos,
            pendentes: total - concluidos
        }
    })

    return {
        processos,
        loading,
        error,
        stats,
        fetchProcessos,
        createProcesso,
        updateProcesso,
        deleteProcesso
    }
}
