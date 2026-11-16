<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import type { Chat, Mood } from '@/lib/useChat'
import BotAvatar from './BotAvatar.vue'

const props = defineProps<{
  chats: Chat[]
  activeId: string | null
  started: boolean
  typing: boolean
  thinking: boolean
  cue: { mood: Mood; id: number } | null
  dark: boolean
  paper: string
}>()
const emit = defineEmits<{ new: []; open: [id: string]; remove: [id: string]; clear: []; close: []; theme: [] }>()

/** Today / Yesterday / Earlier, newest first. */
const groups = computed(() => {
  const day = new Date()
  day.setHours(0, 0, 0, 0)
  const today = day.getTime()
  const yesterday = today - 864e5
  const out: { label: string; items: Chat[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Earlier', items: [] }
  ]
  for (const c of props.chats) out[c.updated >= today ? 0 : c.updated >= yesterday ? 1 : 2]!.items.push(c)
  return out.filter((g) => g.items.length)
})

// "Clear all" asks twice, so one stray tap cannot wipe the history.
const confirming = ref(false)
let reset = 0
function clear() {
  if (!confirming.value) {
    confirming.value = true
    reset = window.setTimeout(() => (confirming.value = false), 3000)
    return
  }
  window.clearTimeout(reset)
  confirming.value = false
  emit('clear')
}
onBeforeUnmount(() => window.clearTimeout(reset))
</script>

<template>
  <div class="side-inner">
    <div class="side-top">
      <div class="brand">
        <BotAvatar
          v-if="started"
          class="brand-mark"
          :size="34"
          :typing="typing"
          :thinking="thinking"
          :cue="cue"
          :dark="dark"
          :paper="paper"
        />
        <span class="brand-name">Dyod</span>
      </div>
      <button class="close" type="button" aria-label="Close menu" @click="emit('close')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <button class="new" type="button" @click="emit('new')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
      New chat
    </button>

    <nav class="history" aria-label="Chat history">
      <p v-if="!chats.length" class="empty">Your chats will show up here. They stay on this device.</p>

      <section v-for="g in groups" :key="g.label" :aria-label="g.label">
        <h2>{{ g.label }}</h2>
        <ul>
          <li v-for="c in g.items" :key="c.id" class="row" :class="{ 'row--active': c.id === activeId }">
            <button class="open" type="button" :aria-current="c.id === activeId ? 'true' : undefined" @click="emit('open', c.id)">
              <span>{{ c.title }}</span>
            </button>
            <button class="del" type="button" :aria-label="`Delete chat: ${c.title}`" @click="emit('remove', c.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 7h14M10 7V5h4v2m-8 0 1 12h8l1-12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </li>
        </ul>
      </section>
    </nav>

    <div class="foot">
      <button class="theme" type="button" :aria-label="dark ? 'Switch to light mode' : 'Switch to dark mode'" @click="emit('theme')">
        <svg v-if="dark" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.9" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" />
        </svg>
        {{ dark ? 'Light mode' : 'Dark mode' }}
      </button>
      <button v-if="chats.length" class="clear" type="button" @click="clear">
        {{ confirming ? 'Tap again to delete all' : 'Clear history' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.side-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px 12px max(12px, env(safe-area-inset-bottom));
  gap: 12px;
}
.side-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 4px 0 8px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-mark {
  animation: pop 0.5s var(--ease) both;
}
.brand-name {
  font-size: 1.125rem;
  font-weight: 650;
  letter-spacing: -0.02em;
}
.close {
  display: none;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 12px;
  background: none;
  color: var(--text);
  cursor: pointer;
}
.new {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--surface);
  color: var(--text);
  font-size: 0.9375rem;
  font-weight: 550;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.new:hover {
  background: var(--hover);
}
.history {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  margin: 0 -4px;
  padding: 0 4px;
}
h2 {
  margin: 16px 0 4px;
  padding: 0 10px;
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 560;
  letter-spacing: 0.02em;
}
ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
.empty {
  margin: 20px 10px;
  color: var(--muted);
  font-size: 0.875rem;
  line-height: 1.5;
}
.row {
  position: relative;
  display: flex;
  align-items: center;
  border-radius: 12px;
}
.row:hover,
.row:focus-within {
  background: var(--hover);
}
.row--active {
  background: var(--bubble);
}
.open {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  padding: 0 10px;
  border: 0;
  background: none;
  color: var(--text);
  font-size: 0.9375rem;
  text-align: left;
  cursor: pointer;
  border-radius: 12px;
}
.open span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.del {
  display: grid;
  place-items: center;
  flex: none;
  width: 40px;
  height: 40px;
  margin-right: 2px;
  border: 0;
  border-radius: 10px;
  background: none;
  color: var(--muted);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, color 0.15s;
}
.row:hover .del,
.row:focus-within .del,
.row--active .del {
  opacity: 1;
}
@media (hover: none) {
  .del {
    opacity: 1;
  }
}
.del:hover {
  color: var(--danger);
}
.foot {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 8px;
  border-top: 1px solid var(--line);
}
.theme,
.clear {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 10px;
  border: 0;
  border-radius: 12px;
  background: none;
  color: var(--muted);
  font-size: 0.9375rem;
  text-align: left;
  cursor: pointer;
}
.theme:hover,
.clear:hover {
  background: var(--hover);
  color: var(--text);
}
.clear {
  font-size: 0.875rem;
  padding-left: 38px;
}
button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.6);
  }
}
@media (max-width: 899px) {
  .close {
    display: grid;
  }
}
</style>
