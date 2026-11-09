<template>
  <div ref="root" class="article-body" @click="handleClick" v-html="html" />

  <!-- Image lightbox -->
  <Teleport to="body">
    <div
      v-if="zoomedImage"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 cursor-zoom-out"
      @click="zoomedImage = null"
    >
      <img :src="zoomedImage.src" :alt="zoomedImage.alt" class="max-h-full max-w-full rounded-lg shadow-2xl" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * Renders article HTML and enhances it after mount:
 *  - <pre><code class="language-xxx">        → highlighted code block + language label + copy button
 *    <pre data-title="file.ts">               → shows a filename instead of the language
 *  - <pre><code class="language-mermaid">     → rendered as a Mermaid diagram (mermaid is lazy-loaded)
 *  - <div data-callout="note|tip|warning|danger" data-title="...">  → callout box
 *  - <blockquote><p>[!TIP] ...</p></blockquote> → same callout (GitHub alert syntax)
 *  - <img>                                    → lazy loading + click to zoom
 *  - <h2>/<h3>                                → get an id + "#" anchor link; emitted as `headings` for the TOC
 */
import { ref, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import css from 'highlight.js/lib/languages/css'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import sql from 'highlight.js/lib/languages/sql'
import { useTheme } from '@/composables/useTheme'
import { scrollToAnchor } from '@/utils/scroll'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('python', python)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('sql', sql)
hljs.registerAliases(['js'], { languageName: 'javascript' })
hljs.registerAliases(['ts'], { languageName: 'typescript' })
hljs.registerAliases(['sh', 'shell'], { languageName: 'bash' })
hljs.registerAliases(['html', 'vue'], { languageName: 'xml' })

export interface ArticleHeading {
  id: string
  text: string
  level: 2 | 3
}

const props = defineProps<{ html: string }>()
const emit = defineEmits<{ headings: [ArticleHeading[]] }>()
const router = useRouter()

const root = ref<HTMLElement | null>(null)
const zoomedImage = ref<{ src: string; alt: string } | null>(null)
const { isDark } = useTheme()

type CalloutType = 'note' | 'tip' | 'warning' | 'danger'

const CALLOUTS: Record<CalloutType, { title: string; icon: string }> = {
  note: {
    title: 'หมายเหตุ',
    icon: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  },
  tip: {
    title: 'คำแนะนำ',
    icon: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  },
  warning: {
    title: 'คำเตือน',
    icon: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  },
  danger: {
    title: 'อันตราย',
    icon: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  },
}

const GITHUB_ALERTS: Record<string, CalloutType> = {
  NOTE: 'note',
  INFO: 'note',
  TIP: 'tip',
  IMPORTANT: 'tip',
  WARNING: 'warning',
  CAUTION: 'danger',
  DANGER: 'danger',
}

const COPY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>'
const CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'

const svgIcon = (paths: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`

const getLanguage = (code: Element): string => {
  const match = Array.from(code.classList).find((c) => c.startsWith('language-') || c.startsWith('lang-'))
  return match ? match.replace(/^lang(uage)?-/, '').toLowerCase() : ''
}

const enhanceCodeBlocks = (container: HTMLElement) => {
  container.querySelectorAll<HTMLElement>('pre > code').forEach((code) => {
    const pre = code.parentElement as HTMLElement
    if (pre.parentElement?.classList.contains('code-block')) return

    const lang = getLanguage(code)

    if (lang === 'mermaid') {
      const diagram = document.createElement('div')
      diagram.className = 'mermaid-diagram'
      diagram.dataset.source = code.textContent || ''
      if (pre.dataset.title) diagram.dataset.title = pre.dataset.title
      pre.replaceWith(diagram)
      return
    }

    if (lang && hljs.getLanguage(lang)) {
      code.innerHTML = hljs.highlight(code.textContent || '', { language: lang }).value
    } else {
      code.innerHTML = hljs.highlightAuto(code.textContent || '').value
    }
    code.classList.add('hljs')

    const wrapper = document.createElement('div')
    wrapper.className = 'code-block'

    const header = document.createElement('div')
    header.className = 'code-block-header'
    const label = document.createElement('span')
    label.className = 'code-block-label'
    label.textContent = pre.dataset.title || lang || 'code'
    const copyBtn = document.createElement('button')
    copyBtn.type = 'button'
    copyBtn.className = 'code-block-copy'
    copyBtn.dataset.copy = ''
    copyBtn.setAttribute('aria-label', 'คัดลอกโค้ด')
    copyBtn.innerHTML = `${COPY_ICON}<span>คัดลอก</span>`
    header.append(label, copyBtn)

    pre.replaceWith(wrapper)
    wrapper.append(header, pre)
  })
}

const buildCallout = (el: HTMLElement, type: CalloutType, title?: string) => {
  const meta = CALLOUTS[type]
  el.classList.add('callout', `callout-${type}`)
  const heading = document.createElement('div')
  heading.className = 'callout-title'
  heading.innerHTML = svgIcon(meta.icon)
  const text = document.createElement('span')
  text.textContent = title || meta.title
  heading.append(text)
  el.prepend(heading)
}

const enhanceCallouts = (container: HTMLElement) => {
  container.querySelectorAll<HTMLElement>('[data-callout]').forEach((el) => {
    if (el.classList.contains('callout')) return
    const type = (el.dataset.callout || 'note') as CalloutType
    buildCallout(el, CALLOUTS[type] ? type : 'note', el.dataset.title)
  })

  // GitHub-style: <blockquote><p>[!WARNING] ข้อความ</p></blockquote>
  container.querySelectorAll<HTMLElement>('blockquote').forEach((bq) => {
    if (bq.classList.contains('callout')) return
    const first = bq.querySelector('p') || bq
    const match = first.innerHTML.match(/^\s*\[!(\w+)\]\s*(<br\s*\/?>)?/)
    const type = match?.[1] ? GITHUB_ALERTS[match[1].toUpperCase()] : undefined
    if (!match || !type) return
    first.innerHTML = first.innerHTML.slice(match[0].length)
    if (!first.innerHTML.trim() && first !== bq) first.remove()
    buildCallout(bq, type)
  })
}

const enhanceImages = (container: HTMLElement) => {
  container.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
    img.loading = 'lazy'
    img.decoding = 'async'
    if (!img.closest('a')) img.classList.add('zoomable')
  })
}

// Keeps Thai/other letters so ids stay readable: "1. สร้างตาราง" → "1-สร้างตาราง"
const slugify = (text: string) =>
  text.trim().toLowerCase().replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'section'

const enhanceHeadings = (container: HTMLElement): ArticleHeading[] => {
  const used = new Set<string>()
  return Array.from(container.querySelectorAll<HTMLElement>('h2, h3')).map((h) => {
    const text = (h.textContent || '').trim()
    let id = h.id || slugify(text)
    for (let n = 2; used.has(id); n++) id = `${slugify(text)}-${n}`
    used.add(id)
    h.id = id

    if (!h.querySelector('.heading-anchor')) {
      const anchor = document.createElement('a')
      anchor.className = 'heading-anchor'
      anchor.href = `#${id}`
      anchor.setAttribute('aria-label', `ลิงก์ไปหัวข้อ ${text}`)
      anchor.textContent = '#'
      h.append(anchor)
    }
    return { id, text, level: h.tagName === 'H2' ? 2 : 3 }
  })
}

let mermaidModule: typeof import('mermaid')['default'] | null = null
let renderCount = 0

const renderDiagrams = async (container: HTMLElement) => {
  const diagrams = container.querySelectorAll<HTMLElement>('.mermaid-diagram')
  if (!diagrams.length) return

  if (!mermaidModule) mermaidModule = (await import('mermaid')).default
  mermaidModule.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: isDark.value ? 'dark' : 'default',
    fontFamily: 'Sarabun, sans-serif',
  })

  for (const el of diagrams) {
    const source = el.dataset.source || ''
    try {
      const { svg } = await mermaidModule.render(`mermaid-${++renderCount}`, source)
      el.innerHTML = svg
      if (el.dataset.title) {
        const caption = document.createElement('div')
        caption.className = 'mermaid-caption'
        caption.textContent = el.dataset.title
        el.append(caption)
      }
      el.classList.remove('mermaid-error')
    } catch (err) {
      console.error('Mermaid render failed:', err)
      el.classList.add('mermaid-error')
      el.textContent = 'ไม่สามารถแสดง diagram ได้'
    }
  }
}

const enhance = async () => {
  await nextTick()
  const container = root.value
  if (!container) return
  enhanceCodeBlocks(container)
  enhanceCallouts(container)
  enhanceImages(container)
  emit('headings', enhanceHeadings(container))
  await renderDiagrams(container)
}

const handleClick = async (event: MouseEvent) => {
  const target = event.target as HTMLElement

  const anchor = target.closest<HTMLAnchorElement>('a.heading-anchor')
  if (anchor) {
    event.preventDefault()
    const id = anchor.closest('h2, h3')?.id
    if (!id) return
    if (router.currentRoute.value.hash.slice(1) === id) scrollToAnchor(id)
    else router.replace({ hash: `#${id}` })
    return
  }

  const copyBtn = target.closest<HTMLButtonElement>('[data-copy]')
  if (copyBtn) {
    const code = copyBtn.closest('.code-block')?.querySelector('code')
    if (!code) return
    try {
      await navigator.clipboard.writeText(code.textContent || '')
      copyBtn.innerHTML = `${CHECK_ICON}<span>คัดลอกแล้ว</span>`
      copyBtn.classList.add('copied')
      setTimeout(() => {
        copyBtn.innerHTML = `${COPY_ICON}<span>คัดลอก</span>`
        copyBtn.classList.remove('copied')
      }, 2000)
    } catch {
      copyBtn.querySelector('span')!.textContent = 'คัดลอกไม่สำเร็จ'
    }
    return
  }

  if (target instanceof HTMLImageElement && target.classList.contains('zoomable')) {
    zoomedImage.value = { src: target.currentSrc || target.src, alt: target.alt }
  }
}

watch(() => props.html, enhance)
watch(isDark, () => { if (root.value) renderDiagrams(root.value) })
onMounted(enhance)
</script>
