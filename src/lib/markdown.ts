/**
 * Minimal, safe renderer for the answer format: paragraphs, "- " lists,
 * | tables |, **bold**, *italic* and https links. Everything is escaped first.
 */

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function inline(s: string): string {
  return esc(s)
    .replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
}

const cells = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((c) => c.trim())

export function render(src: string): string {
  const lines = src.split('\n')
  const out: string[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]!
    if (!line.trim()) {
      i++
    } else if (line.trim().startsWith('|')) {
      const rows: string[] = []
      while (i < lines.length && lines[i]!.trim().startsWith('|')) rows.push(lines[i++]!)
      const [head, , ...body] = rows
      const th = cells(head!)
      let html = '<div class="table-wrap"><table><thead><tr>'
      html += th.map((c) => `<th scope="col">${inline(c)}</th>`).join('')
      html += '</tr></thead><tbody>'
      for (const r of body) html += '<tr>' + cells(r).map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>'
      out.push(html + '</tbody></table></div>')
    } else if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i]!.startsWith('- ')) items.push(lines[i++]!.slice(2))
      out.push('<ul>' + items.map((t) => `<li>${inline(t)}</li>`).join('') + '</ul>')
    } else {
      const para: string[] = []
      while (
        i < lines.length &&
        lines[i]!.trim() &&
        !lines[i]!.startsWith('- ') &&
        !lines[i]!.trim().startsWith('|')
      )
        para.push(lines[i++]!)
      out.push(`<p>${inline(para.join(' '))}</p>`)
    }
  }
  return out.join('')
}

/** Hide half-typed syntax while an answer is still being revealed. */
export function renderPartial(src: string): string {
  let s = src
  const lastLink = s.lastIndexOf('[')
  if (lastLink > -1 && s.indexOf(')', lastLink) === -1) s = s.slice(0, lastLink)
  if ((s.match(/\*\*/g)?.length ?? 0) % 2) s = s.slice(0, s.lastIndexOf('**'))
  const lines = s.split('\n')
  const last = lines[lines.length - 1]!.trim()
  if (last.startsWith('|') && !last.endsWith('|')) lines.pop()
  s = lines.join('\n')
  if (/(^|[^*])\*[^*]*$/.test(s)) s = s.replace(/\*[^*]*$/, '')
  return render(s)
}

/** Plain text, for the copy button. */
export function toPlain(src: string): string {
  return src
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1$2')
    .split('\n')
    .filter((l) => !/^\|[-| ]+\|$/.test(l.trim()))
    .map((l) => (l.trim().startsWith('|') ? cells(l).join('  |  ') : l))
    .join('\n')
}
