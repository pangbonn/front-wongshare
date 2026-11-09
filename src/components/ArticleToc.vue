<template>
  <nav aria-label="สารบัญ">
    <ul class="space-y-1 text-sm">
      <li v-for="h in headings" :key="h.id">
        <a
          :href="`#${h.id}`"
          @click.prevent="$emit('navigate', h.id)"
          :class="[
            'block py-1 border-l-2 transition-colors leading-snug',
            h.level === 3 ? 'pl-6' : 'pl-3',
            h.id === activeId
              ? 'border-blue-500 text-blue-600 dark:text-blue-400 font-medium'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600'
          ]"
        >{{ h.text }}</a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import type { ArticleHeading } from './ArticleContent.vue'

defineProps<{ headings: ArticleHeading[]; activeId: string | null }>()
defineEmits<{ navigate: [id: string] }>()
</script>
