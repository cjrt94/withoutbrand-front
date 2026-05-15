<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '#imports'
import { useFirebase } from '~/composables/useFirebase'

const route = useRoute()
const deck = ref(null)
const loading = ref(true)
const error = ref(null)
const commentMode = ref(false)

const { getDeck } = useFirebase()

useHead({
  title: computed(() => deck.value ? deck.value.name : 'Cargando...')
})

onMounted(async () => {
  try {
    deck.value = await getDeck(route.params.id)
    if (!deck.value) {
      error.value = 'Este deck no existe o fue eliminado'
    }
  } catch (err) {
    error.value = 'No se pudo cargar el deck'
    console.error('Failed to load deck:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-brand-black flex flex-col">
    <AppHeader
      back-to="/"
      :title="deck?.name || ''"
      :subtitle="deck?.brand || ''"
    >
      <template #default v-if="deck">
        <button
          @click="commentMode = !commentMode"
          class="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors"
          :class="commentMode
            ? 'bg-blue-500 text-white'
            : 'border border-brand-border text-brand-subtle hover:text-white hover:border-brand-subtle'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          {{ commentMode ? 'Comentando' : 'Comentar' }}
        </button>
      </template>
    </AppHeader>

    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <span class="text-brand-subtle text-sm animate-pulse">Cargando...</span>
    </div>

    <div v-else-if="error" class="flex-1 flex flex-col items-center justify-center">
      <p class="text-red-400 text-sm mb-4">{{ error }}</p>
      <NuxtLink
        to="/"
        class="text-white text-sm underline underline-offset-4 hover:text-gray-300 transition-colors"
      >
        Volver al inicio
      </NuxtLink>
    </div>

    <div v-else-if="deck" class="flex-1 relative">
      <iframe
        :src="deck.url"
        class="absolute inset-0 w-full h-full border-none"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      />
      <DeckComments :deck-id="deck.id" :active="commentMode" />
    </div>
  </div>
</template>
