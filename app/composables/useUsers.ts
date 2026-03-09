interface UsuarioAdmin {
    id: string
    email: string
    role: 'admin' | 'usuario'
    nome_completo: string | null
    telefone: string | null
    created_at: string
}

export const useUsers = () => {
    const supabase = useSupabaseClient()

    const users = ref<UsuarioAdmin[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // Busca todos os usuários diretamente da tabela 'usuarios'
    const fetchUsers = async () => {
        loading.value = true
        error.value = null
        try {
            const { data, error: fetchError } = await (supabase as any)
                .from('usuarios')
                .select('*')
                .order('role', { ascending: false })

            if (fetchError) throw fetchError
            users.value = (data as UsuarioAdmin[]) || []
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erro ao buscar usuários'
            console.error('Erro ao buscar usuários:', err)
        } finally {
            loading.value = false
        }
    }

    // Atualiza o role ou outros campos de um usuário
    const updateUser = async (userId: string, updates: Partial<UsuarioAdmin>) => {
        try {
            const { error: updateError } = await (supabase as any)
                .from('usuarios')
                .update(updates)
                .eq('id', userId)

            if (updateError) throw updateError
            await fetchUsers()
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro ao atualizar usuário'
            console.error('Erro ao atualizar usuário:', err)
            throw new Error(msg)
        }
    }

    return {
        users,
        loading,
        error,
        fetchUsers,
        updateUser
    }
}

