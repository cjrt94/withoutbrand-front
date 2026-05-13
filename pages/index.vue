<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFirebase } from '~/composables/useFirebase'

const decks = ref([])
const loading = ref(true)
const error = ref(null)
const showUpload = ref(false)
const search = ref('')

const { getDecks } = useFirebase()

const filteredDecks = computed(() => {
  if (!search.value) return decks.value
  const q = search.value.toLowerCase()
  return decks.value.filter(d =>
    d.name.toLowerCase().includes(q) || (d.brand && d.brand.toLowerCase().includes(q))
  )
})

async function loadDecks() {
  loading.value = true
  error.value = null
  try {
    decks.value = await getDecks()
  } catch (err) {
    error.value = 'No se pudieron cargar los decks'
    console.error('Failed to load decks:', err)
  } finally {
    loading.value = false
  }
}

onMounted(loadDecks)

function onUploaded(deck) {
  decks.value.unshift(deck)
  showUpload.value = false
}
</script>

<template>
  <div class="min-h-screen bg-brand-black">
    <AppHeader />

    <main class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-brand-text text-2xl font-semibold">Decks</h1>
        <button
          @click="showUpload = true"
          class="flex items-center gap-2 bg-white text-black font-medium rounded-lg px-4 py-2 text-sm hover:bg-gray-200 transition-colors"
        >
          <span class="text-lg leading-none">+</span>
          Nuevo Deck
        </button>
      </div>

      <div v-if="decks.length > 0" class="mb-6">
        <input
          v-model="search"
          type="text"
          placeholder="Buscar por nombre o marca..."
          class="w-full max-w-sm bg-brand-dark border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-text placeholder:text-[#777777] focus:outline-none focus:border-brand-subtle transition-colors"
        />
      </div>

      <div v-if="loading" class="flex items-center justify-center py-20">
        <span class="text-brand-subtle text-sm animate-pulse">Cargando decks...</span>
      </div>

      <div v-else-if="error" class="flex flex-col items-center justify-center py-20">
        <p class="text-red-400 text-sm mb-4">{{ error }}</p>
        <button
          @click="loadDecks"
          class="text-white text-sm underline underline-offset-4 hover:text-gray-300 transition-colors"
        >
          Reintentar
        </button>
      </div>

      <div v-else-if="decks.length === 0" class="flex flex-col items-center justify-center py-20">
        <p class="text-brand-subtle text-sm mb-4">No hay decks todavía</p>
        <button
          @click="showUpload = true"
          class="text-white text-sm underline underline-offset-4 hover:text-gray-300 transition-colors"
        >
          Sube tu primer deck
        </button>
      </div>

      <div v-else-if="filteredDecks.length === 0" class="flex items-center justify-center py-20">
        <p class="text-brand-subtle text-sm">No se encontraron decks para "{{ search }}"</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <DeckCard v-for="deck in filteredDecks" :key="deck.id" :deck="deck" />
      </div>
    </main>

    <DeckUpload v-if="showUpload" @uploaded="onUploaded" @close="showUpload = false" />
  </div>
</template>
