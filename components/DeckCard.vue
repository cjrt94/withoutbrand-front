<script setup>
import { ref } from 'vue'

const props = defineProps({
  deck: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete'])
const showConfirm = ref(false)

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function onDeleteClick(e) {
  e.preventDefault()
  e.stopPropagation()
  showConfirm.value = true
}

function cancelDelete(e) {
  e.preventDefault()
  e.stopPropagation()
  showConfirm.value = false
}

function confirmDelete(e) {
  e.preventDefault()
  e.stopPropagation()
  showConfirm.value = false
  emit('delete', props.deck.id)
}
</script>

<template>
  <NuxtLink
    :to="`/decks/${deck.id}`"
    class="group block bg-brand-card rounded-lg border border-brand-border overflow-hidden transition-all hover:border-brand-subtle hover:shadow-lg hover:shadow-white/5 relative"
  >
    <div class="relative w-full aspect-video overflow-hidden bg-brand-dark">
      <iframe
        :src="deck.url"
        class="absolute top-0 left-0 w-[1024px] h-[768px] origin-top-left pointer-events-none"
        :style="{ transform: 'scale(' + (1/3.2) + ')' }"
        sandbox=""
        loading="lazy"
        frameborder="0"
      />

      <!-- Delete button -->
      <button
        @click="onDeleteClick"
        class="absolute top-2 right-2 z-10 w-8 h-8 rounded-md bg-black/70 border border-brand-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:border-red-600"
        title="Eliminar deck"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>

    <div class="p-4">
      <h3 class="text-brand-text font-medium text-sm truncate group-hover:text-white">
        {{ deck.name }}
      </h3>
      <div class="flex items-center justify-between mt-2">
        <span class="text-brand-subtle text-xs">{{ deck.brand }}</span>
        <span class="text-brand-subtle text-xs">{{ formatDate(deck.createdAt) }}</span>
      </div>
    </div>

    <!-- Delete confirmation overlay -->
    <div
      v-if="showConfirm"
      class="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center gap-3 rounded-lg"
      @click.prevent.stop
    >
      <p class="text-white text-sm font-medium text-center px-4">Eliminar "{{ deck.name }}"?</p>
      <div class="flex gap-2">
        <button
          @click="cancelDelete"
          class="px-3 py-1.5 text-xs rounded-md border border-brand-border text-brand-subtle hover:text-white hover:border-brand-subtle transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="confirmDelete"
          class="px-3 py-1.5 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  </NuxtLink>
</template>
