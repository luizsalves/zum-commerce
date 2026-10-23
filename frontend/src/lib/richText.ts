/** Converte entre o texto do formulário e o HTML da descrição na Shopify. */

export function htmlToText(html: string | null): string {
  if (!html) return ''
  const withBreaks = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
  const div = document.createElement('div')
  div.innerHTML = withBreaks
  return (div.textContent ?? '').trim()
}

export function textToHtml(text: string): string {
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return text
    .trim()
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((p) => `<p>${escape(p).replace(/\n/g, '<br>')}</p>`)
    .join('')
}
