<script setup>
defineProps({
  backTo: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <header class="flex items-center justify-between px-6 py-4 border-b border-brand-border">
    <div class="flex items-center gap-4">
      <NuxtLink v-if="backTo" :to="backTo" class="text-brand-subtle hover:text-white transition-colors text-sm">
        &larr; Volver
      </NuxtLink>
      <NuxtLink to="/" class="flex items-center gap-3">
        <img src="/logo.svg" alt="Without Brand" class="h-8 w-8 rounded" />
        <span class="text-brand-text font-semibold text-lg tracking-tight">Without Brand</span>
      </NuxtLink>
      <div v-if="title" class="flex items-center gap-3 ml-2 pl-4 border-l border-brand-border">
        <span class="text-brand-text font-medium text-sm">{{ title }}</span>
        <span v-if="subtitle" class="text-brand-subtle text-xs">{{ subtitle }}</span>
      </div>
    </div>
    <slot />
  </header>
</template>
