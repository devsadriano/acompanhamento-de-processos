<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()

definePageMeta({
  layout: false
})

// Se o usuário já estiver logado, manda para a home
watchEffect(() => {
  if (user.value) {
    navigateTo('/')
  }
})

const email = ref('')
const password = ref('')
const isSignUp = ref(false)
const loading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const handleAuth = async () => {
  loading.value = true
  message.value = ''

  try {
    if (isSignUp.value) {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      message.value = '✅ Conta criada com sucesso! Você já pode fazer login.'
      messageType.value = 'success'
      isSignUp.value = false // Volta para tela de login após criar conta
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
      navigateTo('/')
    }
  } catch (err) {
    message.value = err instanceof Error ? err.message : 'Erro na autenticação'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="max-w-md w-full mx-4">
      <div class="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-white/20 backdrop-blur-sm">
        <!-- Logo/Header -->
        <div class="text-center">
          <h1 class="text-4xl font-black text-gray-900 mb-2 tracking-tighter">Acompanhamento de Processos</h1>
          <p class="text-gray-500 font-medium">Gestão de Processos SEI</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleAuth" class="space-y-4">
          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="seu@email.com"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              :disabled="loading"
            />
          </div>

          <div>
            <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Senha</label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
              :disabled="loading"
            />
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md hover:shadow-lg disabled:opacity-50 transition-all transform active:scale-[0.98]"
          >
            {{ loading ? 'Processando...' : (isSignUp ? 'Criar Minha Conta' : 'Entrar no Sistema') }}
          </button>
        </form>

        <!-- Toggle -->
        <div class="text-center">
            <button 
                @click="isSignUp = !isSignUp"
                class="text-xs font-bold text-blue-600 hover:text-blue-800 transition"
            >
                {{ isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se' }}
            </button>
        </div>

        <!-- Message -->
        <div
          v-if="message"
          :class="[
            'p-4 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-300',
            messageType === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          ]"
        >
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>
