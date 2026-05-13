<script setup>
import { ref } from 'vue'
import { useFirebase } from '~/composables/useFirebase'

const emit = defineEmits(['uploaded', 'close'])

const name = ref('')
const brand = ref('')
const file = ref(null)
const uploading = ref(false)
const dragOver = ref(false)

const { uploadDeck } = useFirebase()

function onFileChange(e) {
  const selected = e.target.files[0]
  if (selected && selected.name.endsWith('.html')) {
    file.value = selected
  }
}

function onDrop(e) {
  dragOver.value = false
  const dropped = e.dataTransfer.files[0]
  if (dropped && dropped.name.endsWith('.html')) {
    file.value = dropped
  }
}

async function submit() {
  if (!name.value || !file.value) return
  uploading.value = true
  try {
    const deck = await uploadDeck(file.value, name.value, brand.value)
    emit('uploaded', deck)
    name.value = ''
    brand.value = ''
    file.value = null
  } catch (err) {
    console.error('Upload failed:', err)
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" @click.self="emit('close')">
    <div class="bg-brand-card border border-brand-border rounded-xl p-6 w-full max-w-md mx-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-brand-text font-semibold text-lg">Nuevo Deck</h2>
        <button @click="emit('close')" class="text-brand-subtle hover:text-white transition-colors text-xl leading-none">&times;</button>
      </div>

      <form @submit.prevent="submit" class="flex flex-col gap-4">
        <div>
          <label class="block text-brand-subtle text-xs mb-1.5 uppercase tracking-wider">Nombre</label>
          <input
            v-model="name"
            type="text"
            placeholder="Q1 Report, Brand Audit..."
            class="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-subtle/50 focus:outline-none focus:border-brand-subtle transition-colors"
            required
          />
        </div>

        <div>
          <label class="block text-brand-subtle text-xs mb-1.5 uppercase tracking-wider">Marca</label>
          <input
            v-model="brand"
            type="text"
            placeholder="Acme, Nike..."
            class="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text placeholder:text-brand-subtle/50 focus:outline-none focus:border-brand-subtle transition-colors"
          />
        </div>

        <div>
          <label class="block text-brand-subtle text-xs mb-1.5 uppercase tracking-wider">Archivo HTML</label>
          <div
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="onDrop"
            :class="[
              'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
              dragOver ? 'border-brand-subtle bg-brand-muted' : 'border-brand-border hover:border-brand-subtle'
            ]"
            @click="$refs.fileInput.click()"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".html"
              class="hidden"
              @change="onFileChange"
            />
            <p v-if="file" class="text-brand-text text-sm">{{ file.name }}</p>
            <p v-else class="text-brand-subtle text-sm">
              Arrastra un archivo .html o haz click para seleccionar
            </p>
          </div>
        </div>

        <button
          type="submit"
          :disabled="!name || !file || uploading"
          class="mt-2 bg-white text-black font-medium rounded-lg px-4 py-2.5 text-sm hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {{ uploading ? 'Subiendo...' : 'Subir Deck' }}
        </button>
      </form>
    </div>
  </div>
</template>
