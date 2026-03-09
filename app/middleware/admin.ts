export default defineNuxtRouteMiddleware(async (to) => {
    // Apenas protege rotas /admin
    if (!to.path.startsWith('/admin')) return

    const supabase = useSupabaseClient()

    // Busca a sessão ATIVA diretamente (mais confiável que o ref reativo)
    const { data: { session } } = await (supabase as any).auth.getSession()

    if (!session?.user?.id) {
        return navigateTo('/login')
    }

    // Busca o perfil do usuário na tabela 'usuarios'
    const { data, error } = await (supabase as any)
        .from('usuarios')
        .select('role')
        .eq('id', session.user.id)
        .single()

    if (error) {
        console.error('Middleware Admin - Erro ao buscar role:', error)
        return navigateTo('/')
    }

    console.log('Middleware Admin - Role:', data?.role)

    if (!data || data.role !== 'admin') {
        console.warn('Middleware Admin - Acesso negado: role =', data?.role)
        return navigateTo('/')
    }
})

