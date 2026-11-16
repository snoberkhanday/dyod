import { computed, reactive, ref } from 'vue'
import { ENTRY_BY_ID, STARTERS } from './knowledge'
import { ask } from './search'

export type Mood = 'happy' | 'confused' | 'greet'

export interface Message {
  id: number
  role: 'user' | 'bot'
  text: string
  /** characters currently visible (bot messages are revealed word by word) */
  shown: number
  done: boolean
  follow: string[]
}

const reduceMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

export function useChat() {
  const messages = reactive<Message[]>([])
  const status = ref<'idle' | 'thinking' | 'streaming'>('idle')
  /** Changes every time the bot has something to react to. */
  const cue = ref<{ mood: Mood; id: number } | null>(null)
  let nextId = 1
  let timer = 0

  const busy = computed(() => status.value !== 'idle')
  const started = computed(() => messages.length > 0)

  function react(mood: Mood) {
    cue.value = { mood, id: nextId++ }
  }

  function finish(m: Message) {
    m.shown = m.text.length
    m.done = true
    status.value = 'idle'
  }

  function reveal(m: Message) {
    // word ends: reveal whole words so the text never flickers mid-word
    const ends: number[] = []
    const re = /\S+\s*/g
    let hit: RegExpExecArray | null
    while ((hit = re.exec(m.text))) ends.push(hit.index + hit[0].length)
    if (reduceMotion() || ends.length < 2) return finish(m)

    status.value = 'streaming'
    // long answers speed up, so nothing takes longer than about 1.8 s
    const perTick = Math.max(1, Math.ceil(ends.length / 55))
    let i = 0
    const tick = () => {
      i = Math.min(ends.length, i + perTick)
      m.shown = ends[i - 1]!
      if (i >= ends.length) return finish(m)
      timer = window.setTimeout(tick, 32)
    }
    tick()
  }

  function send(raw: string) {
    const text = raw.replace(/\s+/g, ' ').trim()
    if (!text || busy.value) return
    messages.push({ id: nextId++, role: 'user', text, shown: text.length, done: true, follow: [] })
    status.value = 'thinking'

    const match = ask(text)
    // A short pause: the blob "thinks", and the answer does not feel like a page reload.
    const wait = reduceMotion() ? 150 : 650 + Math.min(500, text.length * 6)
    timer = window.setTimeout(() => {
      const entry = match.entry
      const reply = entry ?? match.fallback!
      const bot: Message = {
        id: nextId++,
        role: 'bot',
        text: reply.answer,
        shown: 0,
        done: false,
        follow: (reply.follow ?? []).filter((id) => ENTRY_BY_ID.has(id))
      }
      messages.push(bot)
      const m = messages[messages.length - 1]!
      const kind = entry?.kind
      react(!entry || kind === 'gap' ? 'confused' : kind === 'chat' ? 'greet' : 'happy')
      reveal(m)
    }, wait)
  }

  function stop() {
    window.clearTimeout(timer)
    const last = messages[messages.length - 1]
    // Stopping before the answer arrives cancels it; stopping mid-answer shows the rest at once.
    if (status.value === 'thinking') status.value = 'idle'
    else if (last && last.role === 'bot') finish(last)
  }

  function reset() {
    window.clearTimeout(timer)
    messages.splice(0)
    status.value = 'idle'
    react('greet')
  }

  return { messages, status, busy, started, cue, send, stop, reset, starters: STARTERS }
}
