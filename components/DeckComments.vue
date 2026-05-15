<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useFirebase } from '~/composables/useFirebase'

const props = defineProps({
  deckId: { type: String, required: true },
  active: { type: Boolean, default: false }
})

const { getComments, addComment, resolveComment, deleteComment } = useFirebase()

const comments = ref([])
const newComment = ref(null) // { x, y } position for new comment being placed
const commentText = ref('')
const activeComment = ref(null) // id of comment being viewed
const inputRef = ref(null)

onMounted(async () => {
  comments.value = await getComments(props.deckId)
})

function onOverlayClick(e) {
  if (!props.active) return

  // Close active comment if clicking elsewhere
  if (activeComment.value) {
    activeComment.value = null
    return
  }

  // Close new comment form if open
  if (newComment.value) {
    newComment.value = null
    commentText.value = ''
    return
  }

  const rect = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100

  newComment.value = { x, y }
  commentText.value = ''
  nextTick(() => inputRef.value?.focus())
}

async function submitComment() {
  if (!commentText.value.trim() || !newComment.value) return

  const comment = await addComment(props.deckId, {
    x: newComment.value.x,
    y: newComment.value.y,
    text: commentText.value.trim(),
    author: 'Usuario'
  })

  comments.value.push(comment)
  newComment.value = null
  commentText.value = ''
}

function onPinClick(e, comment) {
  e.stopPropagation()
  activeComment.value = activeComment.value === comment.id ? null : comment.id
  newComment.value = null
}

async function onResolve(comment) {
  await resolveComment(props.deckId, comment.id)
  comment.resolved = true
  activeComment.value = null
}

async function onDelete(comment) {
  await deleteComment(props.deckId, comment.id)
  comments.value = comments.value.filter(c => c.id !== comment.id)
  activeComment.value = null
}

function cancelNew(e) {
  e.stopPropagation()
  newComment.value = null
  commentText.value = ''
}

function onFormClick(e) {
  e.stopPropagation()
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const visibleComments = computed(() => comments.value.filter(c => !c.resolved))
</script>

<template>
  <!-- Overlay layer -->
  <div
    class="absolute inset-0 z-10"
    :class="active ? 'cursor-crosshair' : 'pointer-events-none'"
    @click="onOverlayClick"
  >
    <!-- Existing comment pins -->
    <div
      v-for="(comment, i) in visibleComments"
      :key="comment.id"
      class="absolute z-20"
      :style="{ left: comment.x + '%', top: comment.y + '%' }"
    >
      <!-- Pin -->
      <button
        @click.stop="(e) => onPinClick(e, comment)"
        class="w-7 h-7 -ml-3.5 -mt-3.5 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-transform hover:scale-110 pointer-events-auto"
        :class="activeComment === comment.id
          ? 'bg-blue-500 text-white ring-2 ring-blue-300 scale-110'
          : 'bg-yellow-400 text-black hover:bg-yellow-300'"
      >
        {{ i + 1 }}
      </button>

      <!-- Comment bubble -->
      <div
        v-if="activeComment === comment.id"
        class="absolute top-8 left-0 w-64 bg-brand-dark border border-brand-border rounded-lg shadow-xl pointer-events-auto"
        @click.stop
      >
        <div class="p-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-brand-text">{{ comment.author }}</span>
            <span class="text-[10px] text-brand-subtle">{{ formatDate(comment.createdAt) }}</span>
          </div>
          <p class="text-sm text-brand-text leading-relaxed">{{ comment.text }}</p>
        </div>
        <div class="flex border-t border-brand-border">
          <button
            @click="onResolve(comment)"
            class="flex-1 px-3 py-2 text-xs text-green-400 hover:bg-green-400/10 transition-colors"
          >
            Resolver
          </button>
          <button
            @click="onDelete(comment)"
            class="flex-1 px-3 py-2 text-xs text-red-400 hover:bg-red-400/10 transition-colors border-l border-brand-border"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- New comment form -->
    <div
      v-if="newComment"
      class="absolute z-30"
      :style="{ left: newComment.x + '%', top: newComment.y + '%' }"
    >
      <!-- Pin indicator -->
      <div class="w-7 h-7 -ml-3.5 -mt-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-lg ring-2 ring-blue-300 animate-pulse">
        +
      </div>

      <!-- Input form -->
      <div
        class="absolute top-8 left-0 w-64 bg-brand-dark border border-brand-border rounded-lg shadow-xl pointer-events-auto"
        @click="onFormClick"
      >
        <div class="p-3">
          <textarea
            ref="inputRef"
            v-model="commentText"
            placeholder="Escribe un comentario..."
            rows="3"
            class="w-full bg-brand-card border border-brand-border rounded-md px-2.5 py-2 text-sm text-brand-text placeholder:text-[#555] resize-none focus:outline-none focus:border-brand-subtle"
            @keydown.enter.meta="submitComment"
            @keydown.enter.ctrl="submitComment"
            @keydown.esc="cancelNew"
          />
        </div>
        <div class="flex border-t border-brand-border">
          <button
            @click="cancelNew"
            class="flex-1 px-3 py-2 text-xs text-brand-subtle hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="submitComment"
            :disabled="!commentText.trim()"
            class="flex-1 px-3 py-2 text-xs text-blue-400 hover:bg-blue-400/10 transition-colors border-l border-brand-border disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Comentar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
