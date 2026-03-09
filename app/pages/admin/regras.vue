<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const { regras, loading, error, fetchRegras, createRegra, updateRegra, deleteRegra, toggleAtivo } = useRegrasStatus()

const showForm = ref(false)
const editingRegra = ref<any>(null)
const saving = ref(false)
const formError = ref<string | null>(null)

const emptyForm = () => ({
    acao_trigger: '',
    status_resultado: '',
    cor_fundo: '#6b7280',
    cor_texto: '#ffffff',
    prioridade: 10,
    ativo: true,
    descricao: ''
})

const form = reactive(emptyForm())

onMounted(fetchRegras)

const openCreate = () => {
    editingRegra.value = null
    Object.assign(form, emptyForm())
    showForm.value = true
}

const openEdit = (regra: any) => {
    editingRegra.value = regra
    Object.assign(form, {
        acao_trigger: regra.acao_trigger,
        status_resultado: regra.status_resultado,
        cor_fundo: regra.cor_fundo,
        cor_texto: regra.cor_texto,
        prioridade: regra.prioridade,
        ativo: regra.ativo,
        descricao: regra.descricao || ''
    })
    showForm.value = true
}

const handleSave = async () => {
    saving.value = true
    formError.value = null
    try {
        if (editingRegra.value) {
            await updateRegra(editingRegra.value.id, { ...form })
        } else {
            await createRegra({ ...form })
        }
        showForm.value = false
    } catch (err: any) {
        formError.value = err.message
    } finally {
        saving.value = false
    }
}

const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return
    await deleteRegra(id)
}
</script>

<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-extrabold text-gray-900">⚙️ Regras de Status</h2>
                <p class="text-gray-500 text-sm mt-1">Configure como as ações mapeiam para status e cores.</p>
            </div>
            <button @click="openCreate"
                class="px-4 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-md">
                + Nova Regra
            </button>
        </div>

        <!-- Error -->
        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{{ error }}</div>

        <!-- Loading -->
        <div v-if="loading" class="p-20 text-center">
            <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>

        <!-- Table -->
        <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table class="min-w-full divide-y divide-gray-100">
                <thead class="bg-gray-200">
                    <tr>
                        <th class="px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase">Prioridade</th>
                        <th class="px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase">Ação Trigger</th>
                        <th class="px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase">Status Resultado</th>
                        <th class="px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase">Cores</th>
                        <th class="px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase">Ativo</th>
                        <th class="px-4 py-3 text-left text-[10px] font-black text-gray-600 uppercase">Descrição</th>
                        <th class="px-4 py-3 text-right text-[10px] font-black text-gray-600 uppercase">Ações</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                    <tr v-for="regra in regras" :key="regra.id" class="hover:bg-gray-50 transition">
                        <td class="px-4 py-3 text-sm font-black text-gray-700">{{ regra.prioridade }}</td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-bold">{{ regra.acao_trigger }}</span>
                        </td>
                        <td class="px-4 py-3">
                            <span class="px-2 py-1 rounded text-xs font-black" :style="{backgroundColor: regra.cor_fundo, color: regra.cor_texto}">
                                {{ regra.status_resultado }}
                            </span>
                        </td>
                        <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                                <div class="w-5 h-5 rounded border" :style="{backgroundColor: regra.cor_fundo}" :title="regra.cor_fundo"></div>
                                <div class="w-5 h-5 rounded border" :style="{backgroundColor: regra.cor_texto}" :title="regra.cor_texto"></div>
                                <span class="text-[10px] text-gray-400">{{ regra.cor_fundo }}</span>
                            </div>
                        </td>
                        <td class="px-4 py-3">
                            <button @click="toggleAtivo(regra.id, !regra.ativo)"
                                :class="['relative inline-flex h-5 w-10 items-center rounded-full transition', regra.ativo ? 'bg-green-500' : 'bg-gray-300']">
                                <span :class="['inline-block h-4 w-4 transform rounded-full bg-white shadow transition', regra.ativo ? 'translate-x-5' : 'translate-x-1']"></span>
                            </button>
                        </td>
                        <td class="px-4 py-3 text-sm text-gray-500">{{ regra.descricao || '-' }}</td>
                        <td class="px-4 py-3 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <button @click="openEdit(regra)" class="text-xs font-bold text-blue-600 hover:text-blue-800">Editar</button>
                                <button @click="handleDelete(regra.id)" class="text-xs font-bold text-red-600 hover:text-red-800">Excluir</button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="regras.length === 0">
                        <td colspan="7" class="px-4 py-10 text-center text-gray-400 text-sm">Nenhuma regra cadastrada.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Form Modal -->
        <Teleport to="body">
            <div v-if="showForm" class="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
                    <div class="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-4 rounded-t-xl flex justify-between items-center">
                        <h3 class="text-base font-bold text-white">{{ editingRegra ? '✏️ Editar Regra' : '➕ Nova Regra' }}</h3>
                        <button @click="showForm = false" class="text-white/70 hover:text-white rounded-lg p-1">
                            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <form @submit.prevent="handleSave" class="p-5 space-y-4">
                        <div v-if="formError" class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{{ formError }}</div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Ação Trigger *</label>
                            <input v-model="form.acao_trigger" type="text" placeholder="Ex: RESPONDIDO" required class="block w-full rounded-lg border border-gray-300 text-sm px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Status Resultado *</label>
                            <input v-model="form.status_resultado" type="text" placeholder="Ex: CONCLUÍDO" required class="block w-full rounded-lg border border-gray-300 text-sm px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Cor de Fundo</label>
                                <div class="flex items-center gap-2">
                                    <input v-model="form.cor_fundo" type="color" class="w-10 h-10 rounded border border-gray-300 cursor-pointer" />
                                    <input v-model="form.cor_fundo" type="text" class="flex-1 rounded-lg border border-gray-300 text-sm px-3 py-2" />
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Cor do Texto</label>
                                <div class="flex items-center gap-2">
                                    <input v-model="form.cor_texto" type="color" class="w-10 h-10 rounded border border-gray-300 cursor-pointer" />
                                    <input v-model="form.cor_texto" type="text" class="flex-1 rounded-lg border border-gray-300 text-sm px-3 py-2" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Prioridade (menor = maior prioridade)</label>
                            <input v-model.number="form.prioridade" type="number" min="1" class="block w-full rounded-lg border border-gray-300 text-sm px-3 py-2" />
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                            <input v-model="form.descricao" type="text" placeholder="Opcional" class="block w-full rounded-lg border border-gray-300 text-sm px-3 py-2" />
                        </div>
                        <!-- Preview -->
                        <div class="p-3 bg-gray-50 rounded-lg">
                            <p class="text-xs font-bold text-gray-500 uppercase mb-2">Preview do Badge</p>
                            <span class="px-3 py-1 rounded text-sm font-black" :style="{backgroundColor: form.cor_fundo, color: form.cor_texto}">
                                {{ form.status_resultado || 'STATUS' }}
                            </span>
                        </div>
                        <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
                            <button type="button" @click="showForm = false" class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                            <button type="submit" :disabled="saving" class="px-5 py-2 bg-blue-600 rounded-lg text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">
                                {{ saving ? 'Salvando...' : '💾 Salvar' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>
    </div>
</template>
