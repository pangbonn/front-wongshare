/**
 * Per-page <title> and meta tags for an SPA.
 * Note: link-preview bots (Facebook, LINE) don't run JS, so og:* set here only
 * helps crawlers that render JS (e.g. Google) — real share previews need prerendering.
 */

const DEFAULT_TITLE = 'WongShare'
const DEFAULT_DESCRIPTION = 'WongShare — แชร์ข้อมูลได้ทุกที่ ทุกเวลา'

interface PageMeta {
  title?: string
  description?: string
  image?: string | null
  type?: 'website' | 'article'
}

function setMeta(attr: 'name' | 'property', key: string, content: string | null | undefined) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!content) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.append(el)
  }
  el.content = content
}

export function setPageMeta({ title, description, image, type = 'website' }: PageMeta) {
  const fullTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE
  const desc = description?.trim().slice(0, 160) || DEFAULT_DESCRIPTION
  const imageUrl = image ? new URL(image, window.location.origin).href : null

  document.title = fullTitle
  setMeta('name', 'description', desc)
  setMeta('property', 'og:title', title || DEFAULT_TITLE)
  setMeta('property', 'og:description', desc)
  setMeta('property', 'og:type', type)
  setMeta('property', 'og:url', window.location.href)
  setMeta('property', 'og:image', imageUrl)
  setMeta('name', 'twitter:card', imageUrl ? 'summary_large_image' : 'summary')
}

export function resetPageMeta() {
  setPageMeta({})
}
