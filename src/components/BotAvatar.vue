<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { STATE_BY_ID, type StateId } from '@/bot/states'
import type { Mood } from '@/lib/useChat'
import BloubBot from './BloubBot.vue'

/**
 * The Dyod blob. It reacts to what is happening in the chat:
 *  - follows your cursor when resting
 *  - opens its eyes wide while you type
 *  - shows three pulsing dots while it thinks
 *  - winks when it has an answer, looks alarmed when it has none
 *  - bursts when you click it, and falls asleep when left alone
 */
const props = defineProps<{
  size: number
  typing: boolean
  thinking: boolean
  cue: { mood: Mood; id: number } | null
  dark: boolean
  paper: string
  interactive?: boolean
}>()

const CUE_STATE: Record<Mood | 'poke', StateId> = {
  happy: 'wink',
  greet: 'wink',
  confused: 'alert',
  poke: 'burst'
}

const SLEEP_AFTER = 60_000
const state = ref<StateId>('idle')
// One resting block, never playing: the chat drives the state, not a timeline.
const cycle = [{ state: 'idle' as StateId, duration: 3600 }]

let transient: StateId | null = null
let revert = 0
let sleepTimer = 0
let sleeping = false

function base(): StateId {
  if (props.thinking) return 'thinking'
  if (transient) return transient
  if (props.typing) return 'wide'
  return sleeping ? 'sleep' : 'idle'
}

function sync() {
  state.value = base()
}

function play(id: StateId) {
  transient = id
  window.clearTimeout(revert)
  sync()
  // hold the pose for as long as the animation takes, then settle back
  revert = window.setTimeout(() => {
    transient = null
    sync()
  }, (STATE_BY_ID.get(id)?.duration ?? 1.6) * 1000)
}

function awake() {
  sleeping = false
  window.clearTimeout(sleepTimer)
  sleepTimer = window.setTimeout(() => {
    sleeping = true
    sync()
  }, SLEEP_AFTER)
  if (state.value === 'sleep') sync()
}

watch(() => [props.thinking, props.typing], () => {
  awake()
  sync()
})
watch(
  () => props.cue,
  (c) => {
    if (!c) return
    awake()
    play(CUE_STATE[c.mood])
  }
)

function poke() {
  if (!props.interactive) return
  awake()
  play(CUE_STATE.poke)
}

onMounted(() => {
  awake()
  for (const e of ['pointerdown', 'keydown']) window.addEventListener(e, awake, { passive: true })
  // greet on arrival
  window.setTimeout(() => play('wink'), 500)
})
onBeforeUnmount(() => {
  window.clearTimeout(revert)
  window.clearTimeout(sleepTimer)
  for (const e of ['pointerdown', 'keydown']) window.removeEventListener(e, awake)
})

const color = computed(() => (props.dark ? 'creme' : 'encre'))
</script>

<template>
  <component
    :is="interactive ? 'button' : 'span'"
    class="avatar"
    :class="{ 'avatar--button': interactive }"
    :type="interactive ? 'button' : undefined"
    :aria-label="interactive ? 'Poke Dyod' : undefined"
    :style="{ width: `${size}px`, height: `${size}px` }"
    @click="poke"
  >
    <BloubBot
      v-model:state="state"
      :size="Math.round(size * 1.58)"
      :color="color"
      :paper="paper"
      :cycle="cycle"
      :follow="interactive"
      label="Dyod, the assistant"
      aria-hidden="true"
    />
  </component>
</template>

<style scoped>
.avatar {
  display: inline-block;
  flex: none;
  padding: 0;
  border: 0;
  background: none;
  border-radius: 50%;
  line-height: 0;
  position: relative;
}
/* The bot's body fills 100 of the 158 units of its canvas; the rest is room for rings and particles. */
.avatar :deep(svg) {
  position: absolute;
  width: 158%;
  height: 158%;
  left: -29%;
  top: -29%;
  overflow: visible;
  pointer-events: none;
}
.avatar--button {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.avatar--button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 6px;
}
</style>
