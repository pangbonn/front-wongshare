/**
 * Blog `contentHtml` is sometimes a full Vue SFC (template + script setup)
 * instead of HTML. `v-html` uses innerHTML, and a HTML5 <template> element
 * does not paint its children — so the article body looks empty.
 *
 * This unwraps the SFC into static HTML that v-html can actually show.
 * Vue interactivity (@click, interpolations, script setup) cannot run via
 * v-html; code snippets from the script are inlined as stacked <pre> blocks.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function extractTaggedBlock(raw: string, tag: string): string | null {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*)<\\/${tag}>`, 'i')
  const match = raw.match(re)
  return match?.[1] ?? null
}

function extractCodeSnippets(script: string): Record<string, string> {
  const start = script.search(/codeSnippets\s*=\s*\{/)
  if (start < 0) return {}

  const brace = script.indexOf('{', start)
  if (brace < 0) return {}

  let i = brace + 1
  let depth = 1
  let inTick = false
  while (i < script.length && depth > 0) {
    const ch = script[i]
    const prev = script[i - 1]
    if (inTick) {
      if (ch === '`' && prev !== '\\') inTick = false
    } else if (ch === '`') {
      inTick = true
    } else if (ch === '{') {
      depth++
    } else if (ch === '}') {
      depth--
    }
    i++
  }

  const body = script.slice(brace + 1, i - 1)
  const snippets: Record<string, string> = {}
  const pair = /(\w+)\s*:\s*`([\s\S]*?)`/g
  let m: RegExpExecArray | null
  while ((m = pair.exec(body)) !== null) {
    const key = m[1]
    const value = m[2]
    if (key && value != null) snippets[key] = value
  }
  return snippets
}

function snippetsToHtml(snippets: Record<string, string>): string {
  const labels: Record<string, string> = {
    asyncio: 'Asyncio',
    threading: 'Threading',
    blocking: 'Blocking Case',
  }
  return Object.entries(snippets)
    .map(([key, code]) => {
      const title = labels[key] || key
      return (
        `<div class="mb-4">` +
        `<p class="font-bold mb-2">${escapeHtml(title)}</p>` +
        `<pre class="text-xs md:text-sm font-mono overflow-x-auto p-4 bg-base-100 rounded-lg border border-base-300">` +
        `<code class="language-python">${escapeHtml(code)}</code>` +
        `</pre></div>`
      )
    })
    .join('\n')
}

function stripVueDirectives(html: string): string {
  return html
    .replace(/\s@(?:[A-Za-z_:][\w:.-]*)(?:\.[A-Za-z_-]+)*(?:=(?:"[^"]*"|'[^']*'|[^\s>]*))?/g, '')
    .replace(/\s:(?:[A-Za-z_:][\w:.-]*)(?:=(?:"[^"]*"|'[^']*'|[^\s>]*))?/g, '')
    .replace(/\sv-(?:[A-Za-z_-]+)(?::[A-Za-z_:][\w:.-]*)?(?:\.[A-Za-z_-]+)*(?:=(?:"[^"]*"|'[^']*'|[^\s>]*))?/g, '')
}

export function normalizeArticleHtml(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return ''

  const looksLikeSfc = /<template[\s>]/i.test(raw) && /<\/template>/i.test(raw)
  let html = raw
  let script: string | null = null

  if (looksLikeSfc) {
    const templateInner = extractTaggedBlock(raw, 'template')
    script = extractTaggedBlock(raw, 'script')
    if (templateInner != null) html = templateInner
  }

  html = html.replace(/<script\b[\s\S]*?<\/script>/gi, '')
  html = html.replace(/<style\b[\s\S]*?<\/style>/gi, '')

  const snippets = script ? extractCodeSnippets(script) : {}
  if (Object.keys(snippets).length > 0) {
    html = html.replace(
      /<pre\b[^>]*>\s*<code\b[^>]*>\s*\{\{\s*currentCodeSnippet\s*\}\}\s*<\/code>\s*<\/pre>/,
      snippetsToHtml(snippets),
    )
  }

  html = html.replace(/<button\b[^>]*\s@(?:[\w.-]+)\b[^>]*>[\s\S]*?<\/button>/gi, '')
  html = stripVueDirectives(html)
  html = html.replace(/\{\{[\s\S]*?\}\}/g, '')
  html = html.replace(/<!--[\s\S]*?-->/g, '')

  return html.trim()
}
