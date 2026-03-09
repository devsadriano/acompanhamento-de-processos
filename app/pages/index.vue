<script setup lang="ts">
import ImportModal from '~/components/ImportModal.vue'
import ProcessForm from '~/components/ProcessForm.vue'
import FilterBar from '~/components/FilterBar.vue'
import AuxManager from '~/components/AuxManager.vue'
import type { Processo } from '../shared/types/processo.types'

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const { processos, loading, stats, fetchProcessos, createProcesso, updateProcesso, deleteProcesso } = useProcessos()
const showImportModal = ref(false)

const activeView = useState('activeView', () => 'dashboard')

// Estado do formulário
const showProcessForm = ref(false)
const selectedProcesso = ref<Processo | null>(null)

// Estado dos filtros
const searchQuery = ref('')
const statusFilter = ref('')

// Processos filtrados
const filteredProcessos = computed(() => {
  return processos.value.filter(p => {
    const searchLower = searchQuery.value.toLowerCase()
    const matchesSearch = 
      (p.numero_processo?.toLowerCase().includes(searchLower) ?? false) ||
      (p.sei_numero?.toLowerCase().includes(searchLower) ?? false) ||
      (p.assunto?.toLowerCase().includes(searchLower) ?? false) ||
      (p.interessado?.toLowerCase().includes(searchLower) ?? false) ||
      (p.unidade?.toLowerCase().includes(searchLower) ?? false)

    const matchesStatus = !statusFilter.value || 
      p.status_1 === statusFilter.value || 
      p.status_2 === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

// Redirecionar para login se não autenticado
watchEffect(() => {
  if (!user.value) {
    navigateTo('/login')
  }
})

// Buscar processos ao montar
onMounted(() => {
  if (user.value) {
    fetchProcessos()
  }
})

const handleImportSuccess = () => {
  fetchProcessos()
}

// CRUD Handlers
const handleCreate = () => {
  selectedProcesso.value = null
  showProcessForm.value = true
}

const handleEdit = (processo: Processo) => {
  selectedProcesso.value = processo
  showProcessForm.value = true
}

const handleDelete = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir este processo?')) {
    await deleteProcesso(id)
  }
}

const handleSaveProcess = async (formData: Partial<Processo>) => {
  try {
    if (selectedProcesso.value) {
      await updateProcesso(selectedProcesso.value.id, formData)
    } else {
      await createProcesso(formData)
    }
    showProcessForm.value = false
  } catch (err: any) {
    console.error('Erro ao salvar processo:', err)
    alert('Erro ao salvar processo: ' + (err.message || 'Erro desconhecido'))
  }
}


</script>

<template>
  <div v-if="user" class="h-full">
    <!-- View: Dashboard -->
    <div v-if="activeView === 'dashboard'" class="space-y-8">
      <ImportModal 
        :show="showImportModal" 
        @close="showImportModal = false" 
        @success="handleImportSuccess" 
      />

      <ProcessForm
        :show="showProcessForm"
        :processo="selectedProcesso"
        @close="showProcessForm = false"
        @save="handleSaveProcess"
      />

      <div class="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">Processos Recentes</h2>
          <p class="text-gray-500 mt-1">Gerencie e acompanhe todos os processos SEI ativos.</p>
        </div>
        <div class="flex gap-3">
          <button
            @click="showImportModal = true"
            class="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 flex items-center transition shadow-sm"
          >
            <svg class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Importar Excel
          </button>
          <button
            @click="handleCreate"
            class="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 flex items-center transition shadow-md hover:shadow-lg transform active:scale-95"
          >
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Novo Processo
          </button>
        </div>
      </div>

      <!-- Dashboard Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</div>
          <div class="text-4xl font-black text-gray-900 mt-2">{{ stats.total }}</div>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-red-100 p-6 bg-gradient-to-br from-white to-red-50/30">
          <div class="text-[10px] font-black text-red-400 uppercase tracking-widest">Atrasados</div>
          <div class="text-4xl font-black text-red-600 mt-2">{{ stats.atrasados }}</div>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 bg-gradient-to-br from-white to-amber-50/30">
          <div class="text-[10px] font-black text-amber-400 uppercase tracking-widest">Alertas</div>
          <div class="text-4xl font-black text-amber-600 mt-2">{{ stats.alertas }}</div>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-green-100 p-6 bg-gradient-to-br from-white to-green-50/30">
          <div class="text-[10px] font-black text-green-400 uppercase tracking-widest">Concluídos</div>
          <div class="text-4xl font-black text-green-600 mt-2">{{ stats.concluidos }}</div>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 bg-gradient-to-br from-white to-blue-50/30">
          <div class="text-[10px] font-black text-blue-400 uppercase tracking-widest">Pendentes</div>
          <div class="text-4xl font-black text-blue-600 mt-2">{{ stats.pendentes }}</div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <FilterBar 
          @update:search="searchQuery = $event"
          @update:status="statusFilter = $event"
        />
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div v-if="loading" class="p-20 text-center">
          <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-500 font-medium">Carregando sua base de dados...</p>
        </div>
        <div v-else-if="filteredProcessos.length === 0" class="p-20 text-center">
          <div class="bg-gray-50 inline-flex p-6 rounded-full mb-4">
            <svg class="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="text-gray-900 font-bold text-lg">Nenhum processo aqui.</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-200 border-b-2 border-gray-300">
              <tr>
                <th class="px-2 py-2 text-left text-[9px] font-black text-gray-700 uppercase tracking-tight border-r border-gray-300">DATA DE<br>RECEB.</th>
                <th class="px-2 py-2 text-left text-[9px] font-black text-gray-700 uppercase tracking-tight border-r border-gray-300">SEI nº</th>
                <th class="px-2 py-2 text-left text-[9px] font-black text-gray-700 uppercase tracking-tight border-r border-gray-300">ORIGEM</th>
                <th class="px-2 py-2 text-left text-[9px] font-black text-gray-700 uppercase tracking-tight border-r border-gray-300">Nº PROCESSO</th>
                <th class="px-2 py-2 text-left text-[9px] font-black text-gray-700 uppercase tracking-tight border-r border-gray-300 max-w-[120px]">NOME DO SERVIDOR</th>
                <th class="px-2 py-2 text-left text-[9px] font-black text-gray-700 uppercase tracking-tight border-r border-gray-300 max-w-[120px]">ASSUNTO</th>
                <th class="px-2 py-2 text-left text-[9px] font-black text-gray-700 uppercase tracking-tight border-r border-gray-300 max-w-[120px]">COMPLEMENTO</th>
                
                <!-- Bloco Prazo 1 -->
                <th class="px-2 py-2 text-left text-[9px] font-black text-gray-700 uppercase tracking-tight border-r border-gray-300 bg-gray-300">PRAZO<br>INTERNO</th>
                <th class="px-2 py-2 text-center text-[9px] font-black text-gray-700 uppercase tracking-tight border-r border-gray-300 bg-gray-300">STATUS</th>
                <th class="px-2 py-2 text-center text-[9px] font-black text-gray-700 uppercase tracking-tight border-r border-gray-300 bg-gray-300">AÇÃO</th>

                <!-- Bloco Prazo 2 -->
                <th class="px-2 py-2 text-left text-[9px] font-black text-gray-700 uppercase tracking-tight border-r border-gray-300 bg-gray-400/20">PRAZO<br>FATAL</th>
                <th class="px-2 py-2 text-center text-[9px] font-black text-gray-700 uppercase tracking-tight border-r border-gray-300 bg-gray-400/20">STATUS</th>
                <th class="px-2 py-2 text-center text-[9px] font-black text-gray-700 uppercase tracking-tight border-r border-gray-300 bg-gray-400/20">AÇÃO</th>
                
                <th class="px-2 py-2 text-left text-[9px] font-black text-gray-700 uppercase tracking-tight border-r border-gray-300 max-w-[100px]">OBS.</th>
                <th class="px-2 py-2 text-right text-[9px] font-black text-gray-700 uppercase tracking-tight">AÇÕES</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="processo in filteredProcessos" :key="processo.id" class="hover:bg-blue-50/30 transition-colors border-b border-gray-200">
                <td class="px-2 py-2 whitespace-nowrap text-[10px] font-bold text-gray-600 border-r border-gray-100">
                  {{ processo.data_recebimento ? new Date(processo.data_recebimento).toLocaleDateString('pt-BR') : '-' }}
                </td>
                <td class="px-2 py-2 whitespace-nowrap text-[10px] font-medium text-gray-900 border-r border-gray-100">
                  {{ processo.sei_numero || '-' }}
                </td>
                <td class="px-2 py-2 whitespace-nowrap text-[10px] font-bold text-gray-700 border-r border-gray-100">
                  {{ processo.unidade || '-' }}
                </td>
                <td class="px-2 py-2 whitespace-nowrap text-[10px] text-blue-700 font-black border-r border-gray-100">
                  {{ processo.numero_processo || '-' }}
                </td>
                <td class="px-2 py-2 text-[10px] text-gray-700 font-medium border-r border-gray-100 max-w-[120px] truncate" :title="processo.interessado || ''">
                  {{ processo.interessado || '-' }}
                </td>
                <td class="px-2 py-2 text-[10px] text-gray-600 font-bold border-r border-gray-100 max-w-[120px] truncate" :title="processo.assunto || ''">
                   {{ processo.assunto || '-' }}
                </td>
                <td class="px-2 py-2 text-[9px] text-gray-500 border-r border-gray-100 max-w-[120px] truncate" :title="(processo as any).complemento_assunto || ''">
                   {{ (processo as any).complemento_assunto || '-' }}
                </td>

                <!-- Colunas Prazo 1 -->
                <td class="px-2 py-2 whitespace-nowrap text-[10px] font-bold text-gray-900 border-r border-gray-100 bg-gray-50/50">
                  {{ processo.prazo_1 ? new Date(processo.prazo_1).toLocaleDateString('pt-BR') : '-' }}
                </td>
                <td class="px-2 py-2 whitespace-nowrap border-r border-gray-100 bg-gray-50/50 text-center">
                  <span v-if="processo.status_1" :class="['px-2 py-0.5 rounded text-[9px] font-black shadow-sm flex items-center justify-center w-full min-w-[70px]', (useStatusCalculator()).getStatusColor(processo.status_1)]">
                    {{ processo.status_1 }}
                  </span>
                </td>
                <td class="px-2 py-2 whitespace-nowrap text-[9px] font-black text-gray-500 text-center border-r border-gray-100 bg-gray-50/50">
                  {{ processo.acao_1 || '-' }}
                </td>

                <!-- Colunas Prazo 2 -->
                <td class="px-2 py-2 whitespace-nowrap text-[10px] font-bold text-gray-900 border-r border-gray-100 bg-gray-100/30">
                  {{ processo.prazo_2 ? new Date(processo.prazo_2).toLocaleDateString('pt-BR') : '-' }}
                </td>
                <td class="px-2 py-2 whitespace-nowrap border-r border-gray-100 bg-100/30 text-center">
                  <span v-if="processo.status_2" :class="['px-2 py-0.5 rounded text-[9px] font-black shadow-sm flex items-center justify-center w-full min-w-[70px]', (useStatusCalculator()).getStatusColor(processo.status_2)]">
                    {{ processo.status_2 }}
                  </span>
                </td>
                <td class="px-2 py-2 whitespace-nowrap text-[9px] font-black text-gray-500 text-center border-r border-gray-100 bg-gray-100/30">
                  {{ processo.acao_2 || '-' }}
                </td>

                <td class="px-2 py-2 text-[10px] text-gray-500 font-medium border-r border-gray-100 max-w-[100px] truncate" :title="processo.observacoes || ''">
                  {{ processo.observacoes || '-' }}
                </td>

                <td class="px-2 py-2 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end space-x-1">
                    <button @click="handleEdit(processo)" class="p-1 text-gray-400 hover:text-blue-600 hover:bg-white rounded border border-transparent hover:border-gray-200 transition-all">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button @click="handleDelete(processo.id)" class="p-1 text-gray-400 hover:text-red-600 hover:bg-white rounded border border-transparent hover:border-gray-200 transition-all">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Views Auxiliares -->
    <div v-else-if="activeView === 'origens'" class="h-full">
        <AuxManager title="Origens" table="aux_origens" />
    </div>
    <div v-else-if="activeView === 'assuntos'" class="h-full">
        <AuxManager title="Assuntos" table="aux_assuntos" />
    </div>
    <div v-else-if="activeView === 'complementos'" class="h-full">
        <AuxManager title="Complementos" table="aux_complementos" />
    </div>
    <div v-else-if="activeView === 'status'" class="h-full">
        <AuxManager title="STATUS" table="aux_status" />
    </div>
  </div>
</template>
