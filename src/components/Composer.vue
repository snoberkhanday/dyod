<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps<{ busy: boolean; autofocus?: boolean }>()
const emit = defineEmits<{ send: [text: string]; stop: []; typing: [on: boolean] }>()
const text = defineModel<string>({ default: '' })
const el = ref<HTMLTextAreaElement | null>(null)

function fit() {
  const t = el.value
  if (!t) return
  t.style.height = 'auto'
  t.style.height = `${Math.min(t.scrollHeight, 160)}px`
}

watch(text, () => {
  nextTick(fit)
  emit('typing', text.value.length > 0)
})

function submit() {
  if (props.busy) return emit('stop')
  const v = text.value.trim()
  if (!v) return
  emit('send', v)
  text.value = ''
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault()
    submit()
  }
}

function focus() {
  el.value?.focus({ preventScroll: true })
}
defineExpose({ focus })

onMounted(() => {
  fit()
  if (props.autofocus && matchMedia('(hover: hover)').matches) focus()
})
</script>

<template>
  <form class="composer" @submit.prevent="submit">
    <label class="sr-only" for="q">Ask a question about DYOD</label>
    <textarea
      id="q"
      ref="el"
      v-model="text"
      rows="1"
      maxlength="400"
      placeholder="Ask about DYOD…"
      autocomplete="off"
      enterkeyhint="send"
      @keydown="onKey"
      @blur="emit('typing', false)"
    />
    <button
      class="send"
      :class="{ 'send--stop': busy }"
      type="submit"
      :disabled="!busy && !text.trim()"
      :aria-label="busy ? 'Stop' : 'Send'"
    >
      <svg v-if="!busy" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 19V5m0 0-6 6m6-6 6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <svg v-else width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor" />
      </svg>
    </button>
  </form>
</template>

<style scoped>
.composer {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 8px 8px 20px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 28px;
  box-shadow: var(--shadow);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.composer:focus-within {
  border-color: var(--accent);
  box-shadow: var(--shadow), 0 0 0 3px var(--accent-soft);
}
textarea {
  flex: 1;
  min-width: 0;
  max-height: 160px;
  padding: 10px 0;
  resize: none;
  border: 0;
  outline: 0;
  background: none;
  color: var(--text);
  font: inherit;
  font-size: 1rem;
  line-height: 1.5;
}
textarea::placeholder {
  color: var(--muted);
}
.send {
  display: grid;
  place-items: center;
  flex: none;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: var(--text);
  color: var(--bg);
  cursor: pointer;
  transition: transform 0.15s, opacity 0.2s, background 0.2s;
}
.send:hover:not(:disabled) {
  transform: scale(1.06);
}
.send:active:not(:disabled) {
  transform: scale(0.94);
}
.send:disabled {
  opacity: 0.22;
  cursor: default;
}
.send:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
</style>
