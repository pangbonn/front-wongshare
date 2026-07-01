<template>
  <component 
    :is="iconComponent" 
    :class="iconClass"
    :size="size"
    :stroke-width="strokeWidth"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Laptop,
  Palette,
  Briefcase,
  Sparkles,
  BookOpen,
  Heart,
  Plane,
  Utensils,
  Trophy,
  Film,
  Code,
  FileCode,
  Smartphone,
  Database,
  Flame,
  Globe,
  Layout,
  Lightbulb,
  Star,
  Eye,
  Calendar,
  User,
  Search,
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Share2,
  Bookmark,
  BookmarkCheck,
  MoreHorizontal,
  Edit,
  Trash2,
  Save,
  Check,
  Plus,
  Minus,
  Circle
} from 'lucide-vue-next'

const props = defineProps<{
  name: string
  size?: number | string
  class?: string
  strokeWidth?: number
}>()

// Icon name mapping
const iconMap: Record<string, any> = {
  // Categories
  'technology': Laptop,
  'design': Palette,
  'business': Briefcase,
  'lifestyle': Sparkles,
  'education': BookOpen,
  'health': Heart,
  'travel': Plane,
  'food': Utensils,
  'sports': Trophy,
  'entertainment': Film,
  
  // Tags
  'vuejs': Code,
  'javascript': FileCode,
  'typescript': FileCode,
  'css': FileCode,
  'html': FileCode,
  'pwa': Smartphone,
  'supabase': Database,
  'firebase': Flame,
  'web-development': Globe,
  'mobile-development': Smartphone,
  'ui-ux': Layout,
  'tutorial': BookOpen,
  'tips-tricks': Lightbulb,
  'best-practices': Star,
  
  // Common
  'heart': Heart,
  'eye': Eye,
  'calendar': Calendar,
  'user': User,
  'search': Search,
  'menu': Menu,
  'close': X,
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  'chevron-down': ChevronDown,
  'chevron-up': ChevronUp,
  'share': Share2,
  'bookmark': Bookmark,
  'bookmark-check': BookmarkCheck,
  'more': MoreHorizontal,
  'edit': Edit,
  'delete': Trash2,
  'save': Save,
  'cancel': X,
  'check': Check,
  'plus': Plus,
  'minus': Minus,
}

const iconComponent = computed(() => {
  const iconName = props.name.toLowerCase()
  return iconMap[iconName] || Circle
})

const iconClass = computed(() => {
  return [
    'inline-block',
    props.class || ''
  ].filter(Boolean).join(' ')
})

const size = computed(() => props.size || 16)
const strokeWidth = computed(() => props.strokeWidth || 2)
</script>

