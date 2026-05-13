<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useFirebase } from '~/composables/useFirebase'

const emit = defineEmits(['uploaded', 'close'])

const name = ref('')
const brand = ref('')
const file = ref(null)
const uploading = ref(false)
const dragOver = ref(false)
const uploadError = ref('')
const fileError = ref('')

const { uploadDeck } = useFirebase()

const hasData = computed(() => name.value || brand.value || file.value)

function isValidHtml(f) {
  return f.name.endsWith('.html') && (f.type === 'text/html' || f.type === '')
}

function onFileChange(e) {
  const selected = e.target.files[0]
  if (!selected) return
  if (isValidHtml(selected)) {
    file.value = selected
    fileError.value = ''
  } else {
    fileError.value = 'Solo se aceptan archivos .html'
  }
}

function onDrop(e) {
  dragOver.value = false
  const dropped = e.dataTransfer.files[0]
  if (!dropped) return
  if (isValidHtml(dropped)) {
    file.value = dropped
    fileError.value = ''
  } else {
    fileError.value = 'Solo se aceptan archivos .html'
  }
}

function handleClose() {
  if (hasData.value) {
    if (!confirm('Tienes datos sin guardar. ¿Cerrar de todos modos?')) return
  }
  emit('close')
}

function onKeydown(e) {
  if (e.key === 'Escape') handleClose()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

async function submit() {
  if (!name.value || !file.value) return
  uploading.value = true
  uploadError.value = ''
  try {
    const deck = await uploadDeck(file.value, name.value, brand.value)
    emit('uploaded', deck)
    name.value = ''
    brand.value = ''
    file.value = null
  } catch (err) {
    uploadError.value = 'Error al subir el deck. Intenta de nuevo.'
    console.error('Upload failed:', err)
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" @click.self="handleClose">
    <div class="bg-brand-card border border-brand-border rounded-xl p-6 w-full max-w-md mx-4">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-brand-text font-semibold text-lg">Nuevo Deck</h2>
        <button @click="handleClose" class="text-brand-subtle hover:text-white transition-colors text-xl leading-none">&times;</button>
      </div>

      <form @submit.prevent="submit" class="flex flex-col gap-4">
        <div>
          <label class="block text-brand-subtle text-xs mb-1.5 uppercase tracking-wider">Nombre</label>
          <input
            v-model="name"
            type="text"
            placeholder="Q1 Report, Brand Audit..."
            class="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text placeholder:text-[#777777] focus:outline-none focus:border-brand-subtle transition-colors"
            required
          />
        </div>

        <div>
          <label class="block text-brand-subtle text-xs mb-1.5 uppercase tracking-wider">
            Marca <span class="normal-case opacity-50">(opcional)</span>
          </label>
          <input
            v-model="brand"
            type="text"
            placeholder="Acme, Nike..."
            class="w-full bg-brand-dark border border-brand-border rounded-lg px-3 py-2.5 text-sm text-brand-text placeholder:text-[#777777] focus:outline-none focus:border-brand-subtle transition-colors"
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
            <p class="text-[#777777] text-xs mt-2">Exporta tu deck desde Figma, Canva o Google Slides como HTML</p>
          </div>
          <p v-if="fileError" class="text-red-400 text-xs mt-1.5">{{ fileError }}</p>
        </div>

        <p v-if="uploadError" class="text-red-400 text-xs">{{ uploadError }}</p>

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
