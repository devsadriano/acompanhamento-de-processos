<script setup lang="ts">
const props = defineProps<{
    title: string
    table: string
}>()

const { fetchItems, addItem, deleteItem } = useAuxiliares()
const items = ref<{id: string, nome: string}[]>([])
const newItem = ref('')
const loading = ref(false)

const load = async () => {
    loading.value = true
    try {
        items.value = await fetchItems(props.table)
    } finally {
        loading.value = false
    }
}

const handleAdd = async () => {
    if (!newItem.value.trim()) return
    loading.value = true
    try {
        await addItem(props.table, newItem.value)
        newItem.value = ''
        await load()
    } catch (err: any) {
        console.error('Erro ao adicionar item:', err)
        alert('Erro ao salvar. Verifique se as tabelas foram criadas no Supabase.\nErro: ' + (err.message || 'Desconhecido'))
    } finally {
        loading.value = false
    }
}

const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este item?')) {
        await deleteItem(props.table, id)
        await load()
    }
}

onMounted(load)
</script>

<template>
    <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-6 h-full flex flex-col">
        <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span class="w-2 h-6 bg-blue-600 rounded-full mr-3"></span>
            Gerenciar {{ title }}
        </h2>

        <div class="flex gap-2 mb-6">
            <input 
                v-model="newItem" 
                type="text" 
                :placeholder="'Novo(a) ' + title"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                @keyup.enter="handleAdd"
            />
            <button 
                @click="handleAdd"
                class="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
                Adicionar
            </button>
        </div>

        <div v-if="loading" class="flex-1 flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <div v-else class="flex-1 overflow-y-auto space-y-2">
            <div 
                v-for="item in items" 
                :key="item.id"
                class="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
            >
                <span class="text-gray-700 font-medium">{{ item.nome }}</span>
                <button 
                    @click="handleDelete(item.id)"
                    class="text-red-400 hover:text-red-600 p-1 rounded opacity-0 group-hover:opacity-100 transition"
                >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            <p v-if="items.length === 0" class="text-center text-gray-500 py-8">
                Nenhum item cadastrado.
            </p>
        </div>
    </div>
</template>
