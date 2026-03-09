<script setup lang="ts">
const user = useSupabaseUser()

// Redirecionar para home quando o usuário estiver autenticado
watch(user, () => {
  if (user.value) {
    navigateTo('/')
  }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="max-w-md w-full mx-4">
      <div class="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
        <!-- Loading Animation -->
        <div class="flex justify-center">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>

        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Confirmando login...</h2>
          <p class="text-gray-600">Aguarde enquanto verificamos seu acesso.</p>
        </div>

        <div class="text-sm text-gray-500">
          <p>Se você não for redirecionado automaticamente,</p>
          <a href="/" class="text-blue-600 hover:underline">clique aqui</a>
        </div>
      </div>
    </div>
  </div>
</template>
