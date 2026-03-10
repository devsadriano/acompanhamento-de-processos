export interface RegraStatus {
    id: string
    user_id: string
    acao_trigger: string
    status_resultado: string
    cor_fundo: string
    cor_texto: string
    prioridade: number
    ativo: boolean
    descricao: string | null
    created_at: string
    updated_at: string
}

export type RegraStatusInput = Omit<RegraStatus, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export const useRegrasStatus = () => {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()

    const regras = ref<RegraStatus[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchRegras = async () => {
        loading.value = true
        error.value = null
        try {
            const { data, error: fetchError } = await (supabase as any)
                .from('regras_status')
                .select('*')
                .order('prioridade', { ascending: true })

            if (fetchError) throw fetchError
            regras.value = (data as RegraStatus[]) || []
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erro ao buscar regras'
            console.error('Erro ao buscar regras:', err)
        } finally {
            loading.value = false
        }
    }

    const createRegra = async (input: RegraStatusInput) => {
        try {
            const userId = user.value?.id
            const { data, error: createError } = await (supabase as any)
                .from('regras_status')
                .insert({
                    ...input,
                    ...(userId ? { user_id: userId } : {})
                })
                .select()
                .single()

            if (createError) throw createError
            await fetchRegras()
            return data as RegraStatus
        } catch (err: any) {
            const msg = err.message || 'Erro ao criar regra'
            console.error('Erro ao criar regra:', err)
            throw new Error(msg)
        }
    }

    const updateRegra = async (id: string, input: Partial<RegraStatusInput>) => {
        try {
            const { error: updateError } = await (supabase as any)
                .from('regras_status')
                .update(input)
                .eq('id', id)

            if (updateError) throw updateError
            await fetchRegras()
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao atualizar regra'
            console.error('Erro ao atualizar regra:', err)
            throw new Error(msg)
        }
    }

    const deleteRegra = async (id: string) => {
        try {
            const { error: deleteError } = await (supabase as any)
                .from('regras_status')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError
            await fetchRegras()
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao deletar regra'
            console.error('Erro ao deletar regra:', err)
            throw new Error(msg)
        }
    }

    const toggleAtivo = async (id: string, ativo: boolean) => {
        await updateRegra(id, { ativo })
    }

    return {
        regras,
        loading,
        error,
        fetchRegras,
        createRegra,
        updateRegra,
        deleteRegra,
        toggleAtivo
    }
}
