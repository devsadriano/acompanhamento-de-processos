<script setup lang="ts">
import { ref, watch } from 'vue'
import { STATUS_COLORS } from '../shared/constants/status'

const emit = defineEmits(['update:search', 'update:status'])

const searchQuery = ref('')
const selectedStatus = ref('')
const statusOptions = Object.keys(STATUS_COLORS)

watch(searchQuery, (newVal) => {
  emit('update:search', newVal)
})

watch(selectedStatus, (newVal) => {
  emit('update:status', newVal)
})
</script>

<template>
  <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
    <!-- Search -->
    <div class="flex-1 relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por processo, interessado ou assunto..."
        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm"
      />
    </div>

    <!-- Status Filter -->
    <div class="w-full md:w-64">
      <select
        v-model="selectedStatus"
        class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
      >
        <option value="">Todos os Status</option>
        <option v-for="status in statusOptions" :key="status" :value="status">
          {{ status }}
        </option>
      </select>
    </div>
  </div>
</template>
