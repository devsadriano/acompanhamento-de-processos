<script setup lang="ts">
import { computed } from 'vue'

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const { perfil, isAdmin, fetchPerfil } = useProfile()

const navItems = [
    { label: '📊 Dashboard', value: 'dashboard' },
    { label: '🏢 Origens', value: 'origens' },
    { label: '📚 Assuntos', value: 'assuntos' },
    { label: '📝 Complementos', value: 'complementos' },
    { label: '🚥 STATUS', value: 'status' },
]

const adminNavItems = [
    { 
        label: '⚙️ Regras de Status', 
        path: '/admin/regras',
        description: 'Configure triggers e cores de status.'
    },
    { 
        label: '👥 Usuários', 
        path: '/admin/usuarios',
        description: 'Gerencie permissões e roles.'
    },
]

const activeView = useState('activeView', () => 'dashboard')

const handleNavClick = (view: string) => {
    activeView.value = view
    // Se estiver em uma página de admin, volta para a home
    if (useRoute().path.startsWith('/admin')) {
        navigateTo('/')
    }
}

const userDisplay = computed(() => {
    const email = user.value?.email || ''
    return {
        email: email,
        initial: email ? email.charAt(0).toUpperCase() : '?'
    }
})

const handleLogout = async () => {
    await supabase.auth.signOut()
    navigateTo('/login')
}

onMounted(async () => {
    await fetchPerfil()
})
</script>


<template>
    <div v-if="user" class="flex h-screen bg-gray-50 overflow-hidden">
        <!-- Sidebar -->
        <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div class="p-6">
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Acompanhamento de Processos</h1>
                <p class="text-xs text-gray-500 uppercase font-bold mt-1 tracking-wider">Gestão SEI</p>
            </div>

            <nav class="flex-1 px-4 space-y-1 overflow-y-auto pb-4">
                <button 
                    v-for="item in navItems" 
                    :key="item.value"
                    @click="handleNavClick(item.value)"
                    :class="[
                        'w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                        activeView === item.value 
                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    ]"
                >
                    {{ item.label }}
                </button>

                <!-- Admin Section as Cards -->
                <div v-if="isAdmin" class="pt-6 mt-6 border-t border-gray-100">
                    <p class="px-4 pb-3 text-[10px] font-black text-red-500 uppercase tracking-widest text-center">Administrador</p>
                    <div class="space-y-3 px-2">
                        <NuxtLink
                            v-for="item in adminNavItems"
                            :key="item.path"
                            :to="item.path"
                            class="group block p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-red-50 hover:border-red-100 transition-all duration-200"
                            active-class="bg-red-50 border-red-200 shadow-sm"
                        >
                            <p class="text-xs font-bold text-gray-800 group-hover:text-red-700 transition-colors">{{ item.label }}</p>
                            <p class="text-[10px] text-gray-400 group-hover:text-red-500 mt-1 leading-tight">{{ item.description }}</p>
                        </NuxtLink>
                    </div>
                </div>
            </nav>

            <div class="p-4 border-t border-gray-100 bg-gray-50">
                <div class="flex items-center gap-3 mb-4">
                    <div class="relative">
                        <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            {{ userDisplay.initial }}
                        </div>
                        <span v-if="isAdmin" class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" title="Admin"></span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-gray-900 truncate">{{ userDisplay.email }}</p>
                        <p v-if="isAdmin" class="text-[10px] font-black text-red-500 uppercase tracking-wider">Administrador</p>
                    </div>
                </div>
                <button 
                    @click="handleLogout"
                    class="w-full px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all shadow-sm"
                >
                    Sair do Sistema
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto p-8 relative">
            <slot />
        </main>
    </div>
    <div v-else>
        <slot />
    </div>
</template>
