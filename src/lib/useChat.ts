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

export interface Chat {
  id: string
  title: string
  updated: number
  messages: Message[]
}

const KEY = 'dyod.chats.v1'
const MAX_CHATS = 50
const MAX_MESSAGES = 200

const reduceMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** History lives only in this browser. Every access can fail (private mode, blocked storage). */
function load(): Chat[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    if (!Array.isArray(raw)) return []
    return raw
      .filter(
        (c): c is Chat =>
          c && typeof c.id === 'string' && typeof c.title === 'string' && Array.isArray(c.messages)
      )
      .map((c) => ({
        id: c.id,
        title: c.title.slice(0, 80),
        updated: Number(c.updated) || 0,
        messages: c.messages
          .slice(0, MAX_MESSAGES)
          .filter((m) => m && (m.role === 'user' || m.role === 'bot') && typeof m.text === 'string')
          .map((m) => ({
            id: Number(m.id) || 0,
            role: m.role,
            text: m.text,
            shown: m.text.length,
            done: true,
            follow: Array.isArray(m.follow) ? m.follow.filter((f) => ENTRY_BY_ID.has(f)) : []
          }))
      }))
      .filter((c) => c.messages.length)
      .slice(0, MAX_CHATS)
  } catch {
    return []
  }
}

function save(chats: Chat[]) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify(
        chats.map((c) => ({
          ...c,
          messages: c.messages.map((m) => ({ id: m.id, role: m.role, text: m.text, follow: m.follow }))
        }))
      )
    )
  } catch {
    /* storage full or blocked: the chat still works, it just will not be remembered */
  }
}

export function useChat() {
  const messages = reactive<Message[]>([])
  const status = ref<'idle' | 'thinking' | 'streaming'>('idle')
  /** Changes every time the bot has something to react to. */
  const cue = ref<{ mood: Mood; id: number } | null>(null)
  const chats = ref<Chat[]>(load().sort((a, b) => b.updated - a.updated))
  const activeId = ref<string | null>(null)
  let nextId = 1 + Math.max(0, ...chats.value.flatMap((c) => c.messages.map((m) => m.id)))
  let timer = 0

  const busy = computed(() => status.value !== 'idle')
  const started = computed(() => messages.length > 0)

  function react(mood: Mood) {
    cue.value = { mood, id: nextId++ }
  }

  /** Write the open conversation into the history (created on its first question). */
  function persist() {
    const done = messages.filter((m) => m.role === 'user' || m.done)
    if (!done.length) return
    let chat = chats.value.find((c) => c.id === activeId.value)
    if (!chat) {
      chat = {
        id: crypto.randomUUID?.() ?? String(Date.now()),
        title: done[0]!.text.slice(0, 80),
        updated: 0,
        messages: []
      }
      chats.value.unshift(chat)
      activeId.value = chat.id
      if (chats.value.length > MAX_CHATS) chats.value.length = MAX_CHATS
    }
    chat.messages = done.map((m) => ({ ...m }))
    chat.updated = Date.now()
    chats.value.sort((a, b) => b.updated - a.updated)
    save(chats.value)
  }

  function finish(m: Message) {
    m.shown = m.text.length
    m.done = true
    status.value = 'idle'
    persist()
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
    persist()

    const match = ask(text)
    // A short pause: the blob "thinks", and the answer does not feel like a page reload.
    const wait = reduceMotion() ? 150 : 650 + Math.min(500, text.length * 6)
    timer = window.setTimeout(() => {
      const entry = match.entry
      const reply = entry ?? match.fallback!
      messages.push({
        id: nextId++,
        role: 'bot',
        text: reply.answer,
        shown: 0,
        done: false,
        follow: (reply.follow ?? []).filter((id) => ENTRY_BY_ID.has(id))
      })
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

  function halt() {
    window.clearTimeout(timer)
    status.value = 'idle'
  }

  /** A blank conversation. It joins the history only once a question is asked. */
  function reset() {
    halt()
    messages.splice(0)
    activeId.value = null
    react('greet')
  }

  function open(id: string) {
    const chat = chats.value.find((c) => c.id === id)
    if (!chat || id === activeId.value) return
    halt()
    messages.splice(0, messages.length, ...chat.messages.map((m) => ({ ...m, shown: m.text.length, done: true })))
    activeId.value = id
    react('greet')
  }

  function remove(id: string) {
    chats.value = chats.value.filter((c) => c.id !== id)
    save(chats.value)
    if (id === activeId.value) reset()
  }

  function clearAll() {
    chats.value = []
    save(chats.value)
    reset()
  }

  return {
    messages, status, busy, started, cue, send, stop, reset,
    chats, activeId, open, remove, clearAll,
    starters: STARTERS
  }
}
