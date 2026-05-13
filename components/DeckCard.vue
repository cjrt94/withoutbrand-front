<script setup>
const props = defineProps({
  deck: {
    type: Object,
    required: true
  }
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <NuxtLink
    :to="`/decks/${deck.id}`"
    class="group block bg-brand-card rounded-lg border border-brand-border overflow-hidden transition-all hover:border-brand-subtle hover:shadow-lg hover:shadow-white/5"
  >
    <div class="relative w-full aspect-video overflow-hidden bg-brand-dark">
      <iframe
        :src="deck.url"
        class="absolute top-0 left-0 w-[1024px] h-[768px] origin-top-left pointer-events-none"
        :style="{ transform: 'scale(' + (1/3.2) + ')' }"
        sandbox="allow-same-origin"
        loading="lazy"
        frameborder="0"
      />
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
  </NuxtLink>
</template>
