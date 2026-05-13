<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '#imports'
import { useFirebase } from '~/composables/useFirebase'

const route = useRoute()
const deck = ref(null)
const loading = ref(true)
const error = ref(null)

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
    />

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

    <iframe
      v-else-if="deck"
      :src="deck.url"
      class="flex-1 w-full border-none"
      sandbox="allow-scripts"
    />
  </div>
</template>
