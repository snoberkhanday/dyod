import { onBeforeUnmount, ref } from 'vue'

/** The browser's speech recognition is not in TypeScript's DOM types yet. */
interface Recognition extends EventTarget {
  lang: string
  interimResults: boolean
  continuous: boolean
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}
type Ctor = new () => Recognition

const Impl: Ctor | undefined =
  typeof window === 'undefined'
    ? undefined
    : ((window as unknown as { SpeechRecognition?: Ctor; webkitSpeechRecognition?: Ctor }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: Ctor }).webkitSpeechRecognition)

const MESSAGES: Record<string, string> = {
  'not-allowed': 'Microphone is blocked. Allow it in your browser settings.',
  'service-not-allowed': 'Microphone is blocked. Allow it in your browser settings.',
  'no-speech': 'I did not hear anything. Try again.',
  'audio-capture': 'No microphone was found.',
  network: 'Voice input needs an internet connection.'
}

/**
 * Speak instead of type. Words appear in the box as you talk; you press send.
 * Hidden when the browser cannot do it (`supported` is false).
 */
export function useSpeech(onText: (text: string) => void) {
  const supported = !!Impl
  const listening = ref(false)
  const error = ref('')
  let rec: Recognition | null = null
  let clearTimer = 0

  function fail(msg: string) {
    error.value = msg
    window.clearTimeout(clearTimer)
    clearTimer = window.setTimeout(() => (error.value = ''), 4500)
  }

  function start(base: string) {
    if (!Impl || listening.value) return
    error.value = ''
    rec = new Impl()
    rec.lang = 'en-IN'
    rec.interimResults = true
    rec.continuous = false
    rec.maxAlternatives = 1
    const prefix = base.trim() ? base.trim() + ' ' : ''
    rec.onresult = (e) => {
      let said = ''
      for (let i = 0; i < e.results.length; i++) said += e.results[i]![0]!.transcript
      onText(prefix + said.trim())
    }
    rec.onerror = (e) => {
      if (e.error !== 'aborted') fail(MESSAGES[e.error] ?? 'Voice input stopped. Try again.')
    }
    rec.onend = () => {
      listening.value = false
      rec = null
    }
    try {
      rec.start()
      listening.value = true
    } catch {
      fail('Voice input could not start. Try again.')
    }
  }

  function stop() {
    rec?.stop()
  }

  onBeforeUnmount(() => {
    window.clearTimeout(clearTimer)
    rec?.abort()
  })

  return { supported, listening, error, start, stop }
}
