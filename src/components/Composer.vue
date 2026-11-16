<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useSpeech } from '@/lib/useSpeech'

const props = defineProps<{ busy: boolean; autofocus?: boolean }>()
const emit = defineEmits<{ send: [text: string]; stop: []; typing: [on: boolean] }>()
const text = defineModel<string>({ default: '' })
const el = ref<HTMLTextAreaElement | null>(null)

const speech = useSpeech((t) => (text.value = t))
function mic() {
  if (speech.listening.value) speech.stop()
  else speech.start(text.value)
  focus()
}
watch(speech.listening, (on) => emit('typing', on || text.value.length > 0))

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
  speech.stop()
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
  <div class="wrap">
    <p v-if="speech.error.value" class="voice-error" role="alert">{{ speech.error.value }}</p>
  <form class="composer" :class="{ 'composer--live': speech.listening.value }" @submit.prevent="submit">
    <label class="sr-only" for="q">Ask a question about DYOD</label>
    <textarea
      id="q"
      ref="el"
      v-model="text"
      rows="1"
      maxlength="400"
      :placeholder="speech.listening.value ? 'Listening…' : 'Ask about DYOD…'"
      autocomplete="off"
      enterkeyhint="send"
      @keydown="onKey"
      @blur="emit('typing', false)"
    />
    <button
      v-if="speech.supported"
      class="mic"
      :class="{ 'mic--on': speech.listening.value }"
      type="button"
      :aria-label="speech.listening.value ? 'Stop listening' : 'Speak your question'"
      :aria-pressed="speech.listening.value"
      @click="mic"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" stroke-width="1.9" />
        <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" />
      </svg>
    </button>
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
  </div>
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
.voice-error {
  margin: 0 0 8px;
  padding: 0 20px;
  color: var(--danger);
  font-size: 0.875rem;
  text-align: left;
}
.mic {
  display: grid;
  place-items: center;
  flex: none;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.mic:hover {
  background: var(--hover);
  color: var(--text);
}
.mic:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.mic--on {
  background: var(--accent);
  color: var(--bg);
  animation: listen 1.4s ease-in-out infinite;
}
.mic--on:hover {
  background: var(--accent);
  color: var(--bg);
}
@keyframes listen {
  50% {
    box-shadow: 0 0 0 8px var(--accent-soft);
  }
}
@media (prefers-reduced-motion: reduce) {
  .mic--on {
    animation: none;
  }
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
