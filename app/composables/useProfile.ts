interface Usuario {
    id: string
    email: string
    role: 'admin' | 'usuario'
    nome_completo: string | null
    telefone: string | null
    created_at: string
    updated_at: string
}

export const useProfile = () => {
    const supabase = useSupabaseClient()

    const perfil = useState<Usuario | null>('user-profile', () => null)
    const loading = useState('user-profile-loading', () => false)

    const isAdmin = computed(() => perfil.value?.role === 'admin')

    const fetchPerfil = async (userId: string) => {
        if (!userId) return

        loading.value = true
        try {
            const { data, error } = await (supabase as any)
                .from('usuarios')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) throw error
            perfil.value = data as Usuario
            console.log('✅ Perfil admin carregado:', perfil.value.role)
        } catch (err) {
            console.error('❌ Erro ao buscar perfil:', err)
            perfil.value = null
        } finally {
            loading.value = false
        }
    }

    const initProfile = async () => {
        // Busca a sessão atual diretamente (não depende de reatividade)
        const { data: { session } } = await (supabase as any).auth.getSession()
        if (session?.user?.id) {
            await fetchPerfil(session.user.id)
        }
    }

    return {
        perfil,
        isAdmin,
        loading,
        fetchPerfil: initProfile
    }
}
