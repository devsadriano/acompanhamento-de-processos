<script setup lang="ts">
import { computed } from 'vue'

const user = useSupabaseUser()
const supabase = useSupabaseClient()

const navItems = [
    { label: '📊 Dashboard', value: 'dashboard' },
    { label: '🏢 Origens', value: 'origens' },
    { label: '📚 Assuntos', value: 'assuntos' },
    { label: '📝 Complementos', value: 'complementos' },
    { label: '🚥 STATUS', value: 'status' },
]

const activeView = useState('activeView', () => 'dashboard')

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
</script>

<template>
    <div v-if="user" class="flex h-screen bg-gray-50 overflow-hidden">
        <!-- Sidebar -->
        <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div class="p-6">
                <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Acompanhamento de Processos</h1>
                <p class="text-xs text-gray-500 uppercase font-bold mt-1 tracking-wider">Gestão SEI</p>
            </div>

            <nav class="flex-1 px-4 space-y-1">
                <button 
                    v-for="item in navItems" 
                    :key="item.value"
                    @click="activeView = item.value"
                    :class="[
                        'w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                        activeView === item.value 
                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    ]"
                >
                    {{ item.label }}
                </button>
            </nav>

            <div class="p-4 border-t border-gray-100 bg-gray-50">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {{ userDisplay.initial }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-gray-900 truncate">{{ userDisplay.email }}</p>
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
