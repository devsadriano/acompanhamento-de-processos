<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const { users, loading, error, fetchUsers, updateUser } = useUsers()
const updating = ref<string | null>(null)
const updateError = ref<string | null>(null)

const showEditModal = ref(false)
const editingUser = ref<any>(null)
const form = reactive<{
    nome_completo: string
    telefone: string
    role: 'admin' | 'usuario'
}>({
    nome_completo: '',
    telefone: '',
    role: 'usuario'
})

onMounted(fetchUsers)

const openEdit = (user: any) => {
    editingUser.value = user
    form.nome_completo = user.nome_completo || ''
    form.telefone = user.telefone || ''
    form.role = user.role
    showEditModal.value = true
}

const handleUpdate = async () => {
    if (!editingUser.value) return
    updating.value = editingUser.value.id
    updateError.value = null
    try {
        await updateUser(editingUser.value.id, { ...form })
        showEditModal.value = false
    } catch (err: any) {
        updateError.value = err.message
    } finally {
        updating.value = null
    }
}

const handleRoleToggle = async (user: any) => {
    const newRole = user.role === 'admin' ? 'usuario' : 'admin'
    updating.value = user.id
    try {
        await updateUser(user.id, { role: newRole })
    } catch (err: any) {
        updateError.value = err.message
    } finally {
        updating.value = null
    }
}
</script>

<template>
    <div class="space-y-6">
        <div>
            <h2 class="text-2xl font-extrabold text-gray-900">👥 Gerenciar Usuários</h2>
            <p class="text-gray-500 text-sm mt-1">Gerencie permissões, nomes e contatos de todos os usuários.</p>
        </div>

        <div v-if="error || updateError" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ error || updateError }}
        </div>

        <div v-if="loading && users.length === 0" class="p-20 text-center">
            <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>

        <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table class="min-w-full divide-y divide-gray-100">
                <thead class="bg-gray-200">
                    <tr>
                        <th class="px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase">Usuário / Nome</th>
                        <th class="px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase">Contato</th>
                        <th class="px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase">Papel</th>
                        <th class="px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase">Membro desde</th>
                        <th class="px-4 py-3 text-right text-[10px] font-black text-gray-600 uppercase">Ações</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                    <tr v-for="u in users" :key="u.id" class="hover:bg-gray-50 transition">
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                                    :class="u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'">
                                    {{ u.email?.charAt(0).toUpperCase() }}
                                </div>
                                <div class="min-w-0">
                                    <p class="text-sm font-bold text-gray-900 truncate">{{ u.nome_completo || 'Sem nome' }}</p>
                                    <p class="text-[10px] text-gray-500 truncate">{{ u.email }}</p>
                                </div>
                            </div>
                        </td>
                        <td class="px-4 py-3">
                            <p class="text-xs font-medium text-gray-700">{{ u.telefone || '-' }}</p>
                        </td>
                        <td class="px-4 py-3">
                            <span :class="[
                                'px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider',
                                u.role === 'admin' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                            ]">
                                {{ u.role }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-[11px] text-gray-500">
                            {{ new Date(u.created_at).toLocaleDateString('pt-BR') }}
                        </td>
                        <td class="px-4 py-3 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <button @click="openEdit(u)" 
                                    class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar Usuário">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                                <button @click="handleRoleToggle(u)"
                                    :disabled="updating === u.id"
                                    class="px-2 py-1 text-[10px] font-bold rounded border transition"
                                    :class="u.role === 'admin' ? 'border-gray-300 text-gray-600 hover:bg-gray-100' : 'border-red-200 text-red-600 hover:bg-red-50'">
                                    {{ u.role === 'admin' ? 'Remover Admin' : 'Tornar Admin' }}
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="users.length === 0">
                        <td colspan="5" class="px-4 py-10 text-center text-gray-400 text-sm">Nenhum usuário encontrado.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            ⚠️ <strong>Atenção:</strong> Administrators can edit all rules and manage other users' permissions.
        </div>

        <!-- Edit Modal -->
        <Teleport to="body">
            <div v-if="showEditModal" class="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-sm">
                    <div class="bg-blue-700 px-6 py-4 rounded-t-xl flex justify-between items-center text-white">
                        <h3 class="text-base font-bold">👤 Editar Perfil</h3>
                        <button @click="showEditModal = false" class="hover:bg-white/10 p-1 rounded-lg">
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <form @submit.prevent="handleUpdate" class="p-6 space-y-4">
                        <div>
                            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">E-mail (Leitura)</label>
                            <input :value="editingUser.email" disabled class="block w-full bg-gray-50 border border-gray-200 rounded-xl text-sm px-4 py-2 text-gray-500" />
                        </div>
                        <div>
                            <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Nome Completo</label>
                            <input v-model="form.nome_completo" type="text" placeholder="Nome Completo" class="block w-full border border-gray-300 rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 transition" />
                        </div>
                        <div>
                            <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Telefone / WhatsApp</label>
                            <input v-model="form.telefone" type="text" placeholder="(00) 00000-0000" class="block w-full border border-gray-300 rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 transition" />
                        </div>
                        <div>
                            <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Papel do Usuário</label>
                            <select v-model="form.role" class="block w-full border border-gray-300 rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 transition">
                                <option value="usuario">Usuário Comum</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        <div class="flex gap-3 pt-4 border-t border-gray-100">
                            <button type="button" @click="showEditModal = false" class="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 transition">Cancelar</button>
                            <button type="submit" :disabled="updating === editingUser?.id" class="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition shadow-md shadow-blue-200">
                                {{ updating === editingUser?.id ? 'Salvando...' : '💾 Atualizar' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>
    </div>
</template>
