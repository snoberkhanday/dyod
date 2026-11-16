import { toPlain } from './markdown'
import type { Message } from './useChat'

/** A readable text copy of a conversation. */
export function chatToText(title: string, messages: Message[]): string {
  const when = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const body = messages
    .filter((m) => m.done)
    .map((m) => `${m.role === 'user' ? 'You' : 'Dyod'}:\n${m.role === 'user' ? m.text : toPlain(m.text)}`)
    .join('\n\n')
  return `Dyod chat: ${title}\n${when}\n\n${body}\n\nDyod answers about the Design Your Own Degree programme at IUST.\n`
}

export function download(text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `dyod-chat-${new Date().toISOString().slice(0, 10)}.txt`
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const canShare = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function'
