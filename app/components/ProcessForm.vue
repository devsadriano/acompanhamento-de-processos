<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { Processo, AcaoType } from '../shared/types/processo.types'
import { ACOES } from '../shared/constants/status'

const props = defineProps<{
  show: boolean
  processo?: Processo | null
}>()

const emit = defineEmits(['close', 'save'])

const { fetchItems } = useAuxiliares()
const origens = ref<{nome: string}[]>([])
const assuntos = ref<{nome: string}[]>([])
const complementos = ref<{nome: string}[]>([])
const status_list = ref<{nome: string}[]>([])

const loadOptions = async () => {
    try {
        const [o, a, c, s] = await Promise.all([
            fetchItems('aux_origens'),
            fetchItems('aux_assuntos'),
            fetchItems('aux_complementos'),
            fetchItems('aux_status')
        ])
        origens.value = o
        assuntos.value = a
        complementos.value = c
        status_list.value = s
    } catch (err) {
        console.error('Erro ao carregar opções:', err)
    }
}

onMounted(() => {
    loadOptions()
})

const form = reactive<Partial<Processo>>({
  data_recebimento: '',
  sei_numero: '',
  unidade: '',
  numero_processo: '',
  interessado: '',
  assunto: '',
  complemento_assunto: '',
  prazo_1: '',
  acao_1: null as AcaoType | null,
  prazo_2: '',
  acao_2: null as AcaoType | null,
  observacoes: ''
})

const submitting = ref(false)
const error = ref<string | null>(null)

watch(() => props.processo, (newVal) => {
  if (newVal) {
    Object.assign(form, newVal)
    if (newVal.data_recebimento) form.data_recebimento = newVal.data_recebimento.split('T')[0]
    if (newVal.prazo_1) form.prazo_1 = newVal.prazo_1.split('T')[0]
    if (newVal.prazo_2) form.prazo_2 = newVal.prazo_2.split('T')[0]
  } else {
    form.data_recebimento = ''
    form.sei_numero = ''
    form.unidade = ''
    form.numero_processo = ''
    form.interessado = ''
    form.assunto = ''
    form.complemento_assunto = ''
    form.prazo_1 = ''
    form.acao_1 = null
    form.prazo_2 = ''
    form.acao_2 = null
    form.observacoes = ''
  }
}, { immediate: true })

const { calculateStatus, getStatusColor } = useStatusCalculator()

const calculatedStatus1 = computed(() => {
  if (!form.prazo_1) return null
  return calculateStatus(form.prazo_1, form.acao_1 || null)
})

const calculatedStatus2 = computed(() => {
  if (!form.prazo_2) return null
  return calculateStatus(form.prazo_2, form.acao_2 || null)
})

const handleSubmit = async () => {
  submitting.value = true
  error.value = null
  try {
    emit('save', { ...form })
  } catch (err: any) {
    error.value = err.message
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-xl">

          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-700 to-blue-500 px-6 py-4 rounded-t-xl flex justify-between items-center">
            <div>
              <h3 class="text-base font-bold text-white tracking-wide">
                {{ props.processo ? '✏️ Editar Processo' : '➕ Novo Processo' }}
              </h3>
              <p class="text-blue-200 text-xs mt-0.5">Preencha os campos abaixo e salve</p>
            </div>
            <button @click="$emit('close')" class="text-white/70 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="p-5 space-y-3">

            <!-- Erro -->
            <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <svg class="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ error }}
            </div>

            <!-- 1. DATA DE RECEBIMENTO -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Data de Recebimento</label>
              <input v-model="form.data_recebimento" type="date" class="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm px-3 py-2" />
            </div>

            <!-- 2. SEI nº -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">SEI nº</label>
              <input v-model="form.sei_numero" type="text" placeholder="00000.000000/0000-00" class="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm px-3 py-2" />
            </div>

            <!-- 3. ORIGEM -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Origem (Unidade)</label>
              <select v-model="form.unidade" class="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm px-3 py-2">
                <option value="">Selecione a origem...</option>
                <option v-for="o in origens" :key="o.nome" :value="o.nome">{{ o.nome }}</option>
              </select>
            </div>

            <!-- 4. Nº PROCESSO -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Nº Processo <span class="text-red-500">*</span></label>
              <input v-model="form.numero_processo" type="text" placeholder="Ex: 001/2026" class="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm px-3 py-2" required />
            </div>

            <!-- 5. NOME DO SERVIDOR -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Nome do Servidor</label>
              <input v-model="form.interessado" type="text" placeholder="Nome completo do servidor" class="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm px-3 py-2" />
            </div>

            <!-- 6. ASSUNTO -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Assunto</label>
              <select v-model="form.assunto" class="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm px-3 py-2">
                <option value="">Selecione o assunto...</option>
                <option v-for="a in assuntos" :key="a.nome" :value="a.nome">{{ a.nome }}</option>
              </select>
            </div>

            <!-- Complemento do Assunto -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Complemento do Assunto</label>
              <select v-model="form.complemento_assunto" class="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm px-3 py-2">
                <option value="">Selecione o complemento...</option>
                <option v-for="c in complementos" :key="c.nome" :value="c.nome">{{ c.nome }}</option>
              </select>
            </div>

            <!-- Prazos lado a lado -->
            <div class="grid grid-cols-2 gap-4 pt-1">

              <!-- PRAZO INTERNO -->
              <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                <div class="flex justify-between items-center">
                  <p class="text-xs font-black text-blue-800 uppercase tracking-widest">⏱ Prazo Interno</p>
                  <span v-if="calculatedStatus1" :class="['px-2 py-0.5 rounded-full text-[10px] font-black', getStatusColor(calculatedStatus1)]">
                    {{ calculatedStatus1 }}
                  </span>
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Prazo Interno</label>
                  <input v-model="form.prazo_1" type="date" class="block w-full rounded-lg border border-blue-200 bg-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm px-3 py-2" />
                </div>

                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ação</label>
                  <select v-model="form.acao_1" class="block w-full rounded-lg border border-blue-200 bg-white shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm px-3 py-2">
                    <option :value="null">— Sem ação —</option>
                    <optgroup label="Padrão">
                      <option v-for="a in ACOES" :key="a" :value="a">{{ a }}</option>
                    </optgroup>
                    <optgroup v-if="status_list.length" label="Personalizado">
                      <option v-for="s in status_list" :key="s.nome" :value="s.nome">{{ s.nome }}</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              <!-- PRAZO FATAL -->
              <div class="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                <div class="flex justify-between items-center">
                  <p class="text-xs font-black text-red-800 uppercase tracking-widest">🚨 Prazo Fatal</p>
                  <span v-if="calculatedStatus2" :class="['px-2 py-0.5 rounded-full text-[10px] font-black', getStatusColor(calculatedStatus2)]">
                    {{ calculatedStatus2 }}
                  </span>
                </div>
                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Prazo Fatal</label>
                  <input v-model="form.prazo_2" type="date" class="block w-full rounded-lg border border-red-200 bg-white shadow-sm focus:border-red-400 focus:ring-1 focus:ring-red-400 text-sm px-3 py-2" />
                </div>

                <div>
                  <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ação</label>
                  <select v-model="form.acao_2" class="block w-full rounded-lg border border-red-200 bg-white shadow-sm focus:border-red-400 focus:ring-1 focus:ring-red-400 text-sm px-3 py-2">
                    <option :value="null">— Sem ação —</option>
                    <optgroup label="Padrão">
                      <option v-for="a in ACOES" :key="a" :value="a">{{ a }}</option>
                    </optgroup>
                    <optgroup v-if="status_list.length" label="Personalizado">
                      <option v-for="s in status_list" :key="s.nome" :value="s.nome">{{ s.nome }}</option>
                    </optgroup>
                  </select>
                </div>
              </div>

            </div>

            <!-- Observações -->
            <div>
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">💬 Observações</label>
              <textarea v-model="form.observacoes" rows="2" placeholder="Informações adicionais sobre o processo..." class="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm px-3 py-2 resize-none"></textarea>
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button type="button" @click="$emit('close')" class="px-5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Cancelar
              </button>
              <button type="submit" :disabled="submitting" class="px-6 py-2 bg-blue-600 rounded-lg text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-50">
                {{ submitting ? 'Salvando...' : '💾 Salvar Processo' }}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>
