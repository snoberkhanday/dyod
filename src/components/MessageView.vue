<script setup lang="ts">
import { computed, ref } from 'vue'
import { ENTRY_BY_ID } from '@/lib/knowledge'
import { render, renderPartial, toPlain } from '@/lib/markdown'
import type { Message } from '@/lib/useChat'

const props = defineProps<{ message: Message; latest: boolean; busy: boolean }>()
const emit = defineEmits<{ ask: [text: string] }>()

const html = computed(() => {
  const m = props.message
  return m.done ? render(m.text) : renderPartial(m.text.slice(0, m.shown))
})

const chips = computed(() =>
  props.message.follow.map((id) => ENTRY_BY_ID.get(id)).filter((e) => !!e)
)

const copied = ref(false)
async function copy() {
  try {
    await navigator.clipboard.writeText(toPlain(props.message.text))
    copied.value = true
    setTimeout(() => (copied.value = false), 1600)
  } catch {
    /* clipboard can be blocked; nothing to do */
  }
}
</script>

<template>
  <article v-if="message.role === 'user'" class="msg msg--user" aria-label="You said">
    <p>{{ message.text }}</p>
  </article>

  <article v-else class="msg msg--bot" aria-label="Dyod said">
    <div class="prose" v-html="html" />
    <template v-if="message.done">
      <div class="tools">
        <button class="ghost" type="button" @click="copy">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="9" y="9" width="11" height="11" rx="2.5" stroke="currentColor" stroke-width="1.8" />
            <path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          {{ copied ? 'Copied' : 'Copy' }}
        </button>
      </div>
      <div v-if="latest && chips.length && !busy" class="chips" role="group" aria-label="Suggested questions">
        <button v-for="c in chips" :key="c!.id" class="chip" type="button" @click="emit('ask', c!.chip)">
          {{ c!.chip }}
        </button>
      </div>
    </template>
  </article>
</template>

<style scoped>
.msg {
  animation: rise 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.msg--user {
  align-self: flex-end;
  max-width: min(85%, 520px);
  padding: 10px 16px;
  border-radius: 20px 20px 6px 20px;
  background: var(--bubble);
}
.msg--user p {
  margin: 0;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
.msg--bot {
  align-self: stretch;
}
.tools {
  display: flex;
  margin: 6px 0 0 -8px;
}
.ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 10px;
  border: 0;
  border-radius: 10px;
  background: none;
  color: var(--muted);
  font: inherit;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.ghost:hover {
  background: var(--hover);
  color: var(--text);
}
.ghost:focus-visible {
  outline: 2px solid var(--accent);
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  animation: rise 0.35s 0.1s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .msg,
  .chips {
    animation: none;
  }
}
</style>
