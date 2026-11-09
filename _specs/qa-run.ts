import { normalizeArticleHtml } from '../src/utils/normalizeArticleHtml'

const fixture = `<!-- comment -->
<template>
  <div class="space-y-12">
    <h2>ทำความรู้จักภาษา Python</h2>
    <pre><code class="language-python">{{ currentCodeSnippet }}</code></pre>
    <button @click="activeCodeTab = 'asyncio'" class="btn">Asyncio Code</button>
  </div>
</template>
<script setup>
const codeSnippets = {
  asyncio: \`import asyncio\`,
  threading: \`import threading\`
}
</script>`

const html = normalizeArticleHtml(fixture)
const checks: Record<string, boolean> = {
  hasPythonHeading: html.includes('ทำความรู้จักภาษา Python'),
  noTemplateTag: !/<template/i.test(html),
  noScriptTag: !/<script/i.test(html),
  noMustache: !html.includes('{{'),
  noAtClick: !html.includes('@click'),
  hasAsyncioCode: html.includes('import asyncio'),
  hasThreadingCode: html.includes('import threading'),
  plainHtmlPassthrough: normalizeArticleHtml('<p>hello</p>') === '<p>hello</p>',
  empty: normalizeArticleHtml('') === '',
}

const failed = Object.entries(checks).filter(([, ok]) => !ok)
if (failed.length) {
  console.error('FAIL', failed.map(([k]) => k))
  console.error(html)
  process.exit(1)
}
console.log('PASS', Object.keys(checks).join(', '))
