<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFirebase } from '~/composables/useFirebase'

const route = useRoute()
const router = useRouter()
const deck = ref(null)
const loading = ref(true)

const { getDeck } = useFirebase()

onMounted(async () => {
  try {
    deck.value = await getDeck(route.params.id)
    if (!deck.value) router.replace('/')
  } catch (err) {
    console.error('Failed to load deck:', err)
    router.replace('/')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-brand-black flex flex-col">
    <header class="flex items-center gap-4 px-6 py-4 border-b border-brand-border">
      <NuxtLink
        to="/"
        class="text-brand-subtle hover:text-white transition-colors text-sm flex items-center gap-1"
      >
        &larr; Volver
      </NuxtLink>
      <div v-if="deck" class="flex items-center gap-3">
        <h1 class="text-brand-text font-medium text-sm">{{ deck.name }}</h1>
        <span v-if="deck.brand" class="text-brand-subtle text-xs">{{ deck.brand }}</span>
      </div>
    </header>

    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <span class="text-brand-subtle text-sm">Cargando...</span>
    </div>

    <iframe
      v-else-if="deck"
      :src="deck.url"
      class="flex-1 w-full border-none"
      sandbox="allow-same-origin allow-scripts"
    />
  </div>
</template>
