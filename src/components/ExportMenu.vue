<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { canShare, chatToText, download } from '@/lib/exportChat'
import type { Message } from '@/lib/useChat'

const props = defineProps<{ title: string; messages: Message[] }>()
const emit = defineEmits<{ notice: [text: string] }>()

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const copied = ref(false)
const text = () => chatToText(props.title, props.messages)

async function show() {
  open.value = true
  await nextTick()
  root.value?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
  document.addEventListener('pointerdown', outside)
}
function hide(refocus = false) {
  open.value = false
  document.removeEventListener('pointerdown', outside)
  if (refocus) root.value?.querySelector<HTMLElement>('.trigger')?.focus()
}
function outside(e: Event) {
  if (!root.value?.contains(e.target as Node)) hide()
}
function key(e: KeyboardEvent) {
  const items = [...(root.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
  const i = items.indexOf(document.activeElement as HTMLElement)
  if (e.key === 'Escape') return hide(true)
  if (e.key === 'Tab') return hide()
  if (e.key === 'ArrowDown') items[(i + 1) % items.length]?.focus()
  else if (e.key === 'ArrowUp') items[(i - 1 + items.length) % items.length]?.focus()
  else return
  e.preventDefault()
}

async function copy() {
  try {
    await navigator.clipboard.writeText(text())
    copied.value = true
    emit('notice', 'Chat copied to clipboard')
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    emit('notice', 'Could not copy. Try downloading instead.')
  }
  hide(true)
}
function save() {
  download(text())
  emit('notice', 'Chat downloaded')
  hide(true)
}
async function share() {
  hide(true)
  try {
    await navigator.share({ title: `Dyod chat: ${props.title}`, text: text() })
  } catch {
    /* the person closed the share sheet */
  }
}
onBeforeUnmount(() => document.removeEventListener('pointerdown', outside))
</script>

<template>
  <div ref="root" class="export" @keydown="key">
    <button
      class="trigger"
      type="button"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="open ? hide() : show()"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 15V4m0 0L8 8m4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span class="label">Share</span>
    </button>

    <div v-if="open" class="menu" role="menu" aria-label="Share this chat">
      <button role="menuitem" type="button" @click="copy">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" stroke-width="1.8" />
          <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        </svg>
        {{ copied ? 'Copied' : 'Copy chat' }}
      </button>
      <button role="menuitem" type="button" @click="save">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Download as text
      </button>
      <button v-if="canShare()" role="menuitem" type="button" @click="share">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="6" cy="12" r="2.5" stroke="currentColor" stroke-width="1.8" />
          <circle cx="18" cy="6" r="2.5" stroke="currentColor" stroke-width="1.8" />
          <circle cx="18" cy="18" r="2.5" stroke="currentColor" stroke-width="1.8" />
          <path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" stroke="currentColor" stroke-width="1.8" />
        </svg>
        Share…
      </button>
    </div>
  </div>
</template>

<style scoped>
.export {
  position: relative;
}
.trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.trigger:hover,
.trigger[aria-expanded='true'] {
  background: var(--hover);
}
.menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 15;
  display: flex;
  flex-direction: column;
  min-width: 210px;
  padding: 6px;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: var(--surface);
  box-shadow: var(--shadow), 0 16px 40px -16px rgba(0, 0, 0, 0.3);
  animation: drop 0.16s var(--ease) both;
}
.menu button {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 0 12px;
  border: 0;
  border-radius: 10px;
  background: none;
  color: var(--text);
  font-size: 0.9375rem;
  text-align: left;
  cursor: pointer;
}
.menu button:hover,
.menu button:focus-visible {
  background: var(--hover);
  outline: none;
}
button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
@keyframes drop {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
}
@media (max-width: 520px) {
  .label {
    display: none;
  }
  .trigger {
    width: 44px;
    padding: 0;
    justify-content: center;
    border-color: transparent;
    background: none;
  }
}
</style>
