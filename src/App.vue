<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BotAvatar from '@/components/BotAvatar.vue'
import Composer from '@/components/Composer.vue'
import ExportMenu from '@/components/ExportMenu.vue'
import MessageView from '@/components/MessageView.vue'
import Sidebar from '@/components/Sidebar.vue'
import { ENTRY_BY_ID } from '@/lib/knowledge'
import { toPlain } from '@/lib/markdown'
import { useChat } from '@/lib/useChat'
import { useTheme } from '@/lib/useTheme'

const { messages, status, busy, started, cue, send, stop, reset, starters, chats, activeId, open, remove, clearAll, vote } = useChat()
const { dark, toggle: toggleTheme } = useTheme()

const draft = ref('')
const typing = ref(false)
const composer = ref<InstanceType<typeof Composer> | null>(null)
const scroller = ref<HTMLElement | null>(null)
const scrolled = ref(false)
const announce = ref('')

/* ---- layout queries. The blob's paper colour must equal --bg. ---- */
const small = matchMedia('(max-width: 520px)')
const wideQuery = matchMedia('(min-width: 900px)')
const compact = ref(small.matches)
const wide = ref(wideQuery.matches)
const menu = ref(false)
const onWide = () => ((wide.value = wideQuery.matches), (menu.value = false))
const onSize = () => (compact.value = small.matches)
const paper = computed(() => (dark.value ? '#0d0e12' : '#f9f9f9'))

const title = computed(() => messages.find((m) => m.role === 'user')?.text.slice(0, 60) ?? 'Untitled')

function onVote(id: number, v: 'up' | 'down') {
  vote(id, v)
  const now = messages.find((m) => m.id === id)?.vote
  announce.value = now ? 'Thanks for the feedback' : 'Feedback removed'
}

const chips = computed(() => starters.map((id) => ENTRY_BY_ID.get(id)!))

/* ---- sending ---- */
async function ask(text: string) {
  send(text)
  draft.value = ''
  typing.value = false
  await nextTick()
  toBottom(true)
  composer.value?.focus()
}

/* ---- scrolling: follow the answer unless the reader scrolled up ---- */
function nearBottom() {
  const s = scroller.value
  return !s || s.scrollHeight - s.scrollTop - s.clientHeight < 96
}
function toBottom(force = false) {
  const s = scroller.value
  if (!s || (!force && !nearBottom())) return
  s.scrollTop = s.scrollHeight
}
function onScroll() {
  scrolled.value = (scroller.value?.scrollTop ?? 0) > 4
}

watch(
  () => [messages.length, messages[messages.length - 1]?.shown, status.value],
  () => nextTick(() => toBottom(status.value === 'thinking')),
  { flush: 'post' }
)

watch(
  () => messages[messages.length - 1]?.done,
  (done) => {
    const last = messages[messages.length - 1]
    if (done && last?.role === 'bot') announce.value = toPlain(last.text)
  }
)

function newChat() {
  reset()
  announce.value = ''
  menu.value = false
  nextTick(() => composer.value?.focus())
}

function openChat(id: string) {
  open(id)
  announce.value = ''
  menu.value = false
  nextTick(() => toBottom(true))
}

/* "/" jumps to the input, like most chat apps */
function onKey(e: KeyboardEvent) {
  const t = e.target as HTMLElement
  if (e.key === 'Escape' && menu.value) menu.value = false
  if (e.key === '/' && !/INPUT|TEXTAREA/.test(t.tagName)) {
    e.preventDefault()
    composer.value?.focus()
  }
}

onMounted(() => {
  small.addEventListener('change', onSize)
  wideQuery.addEventListener('change', onWide)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  small.removeEventListener('change', onSize)
  wideQuery.removeEventListener('change', onWide)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div class="shell">
    <a class="skip" href="#q">Skip to question box</a>

    <div v-if="menu && !wide" class="scrim" @click="menu = false" />
    <aside id="sidebar" class="side" :class="{ 'side--open': menu }" :inert="!wide && !menu">
      <Sidebar
        :chats="chats"
        :active-id="activeId"
        :started="started"
        :typing="typing"
        :thinking="status === 'thinking'"
        :cue="cue"
        :dark="dark"
        :paper="paper"
        @new="newChat"
        @open="openChat"
        @remove="remove"
        @clear="clearAll"
        @close="menu = false"
        @theme="toggleTheme"
      />
    </aside>

    <div class="app" :class="{ 'app--started': started }">
      <header class="top" :class="{ 'top--scrolled': scrolled }">
        <button class="icon mobile-only" type="button" aria-label="Open menu" aria-controls="sidebar" :aria-expanded="menu" @click="menu = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
        <span class="brand-name mobile-only">Dyod</span>
        <div class="actions">
          <ExportMenu v-if="started" :title="title" :messages="messages" @notice="announce = $event" />
          <button class="icon mobile-only" type="button" aria-label="New chat" @click="newChat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <main ref="scroller" class="scroll" @scroll.passive="onScroll">
        <section v-if="!started" class="hero" aria-labelledby="title">
          <BotAvatar
            class="hero-blob"
            interactive
            :size="compact ? 104 : 128"
            :typing="typing"
            :thinking="status === 'thinking'"
            :cue="cue"
            :dark="dark"
            :paper="paper"
          />
          <h1 id="title">Ask anything about <span class="nowrap">Design Your Own Degree</span></h1>
          <p class="lede">Quick, simple answers about the 4-year BS programme at IUST.</p>

          <div class="hero-composer">
            <Composer ref="composer" v-model="draft" :busy="busy" autofocus @send="ask" @stop="stop" @typing="typing = $event" />
          </div>

          <div class="starters" role="group" aria-label="Try asking">
            <button v-for="c in chips" :key="c.id" class="chip" type="button" @click="ask(c.chip)">
              {{ c.chip }}
            </button>
          </div>
        </section>

        <div v-else class="thread">
          <MessageView
            v-for="(m, i) in messages"
            :key="m.id"
            :message="m"
            :latest="i === messages.length - 1"
            :busy="busy"
            @ask="ask"
            @vote="onVote"
          />
          <p v-if="status === 'thinking'" class="thinking" role="status">Thinking…</p>
        </div>
      </main>

      <div class="dock">
        <div v-if="started" class="dock-inner">
          <Composer ref="composer" v-model="draft" :busy="busy" autofocus @send="ask" @stop="stop" @typing="typing = $event" />
        </div>
      </div>

      <footer class="credit-bar">
        <p>Built by <strong>Sheikh Hareem</strong>. 2026. All rights reserved.</p>
      </footer>
    </div>

    <div class="sr-only" role="status" aria-live="polite">{{ announce }}</div>
  </div>
</template>
