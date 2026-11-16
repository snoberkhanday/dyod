import { computed, ref, watch } from 'vue'

type Choice = 'light' | 'dark'
const KEY = 'dyod.theme'

function read(): Choice | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

/**
 * Light or dark. Until the visitor presses the toggle, Dyod follows the device;
 * after that, their choice wins and is remembered in this browser.
 */
export function useTheme() {
  const system = matchMedia('(prefers-color-scheme: dark)')
  const systemDark = ref(system.matches)
  system.addEventListener('change', () => (systemDark.value = system.matches))

  const choice = ref<Choice | null>(read())
  const dark = computed(() => (choice.value ? choice.value === 'dark' : systemDark.value))

  watch(
    dark,
    (isDark) => {
      document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
      // one colour for the browser bar, matching --bg
      document.querySelectorAll('meta[name="theme-color"]').forEach((m, i) => {
        if (i) m.remove()
        else {
          m.removeAttribute('media')
          m.setAttribute('content', isDark ? '#0d0e12' : '#f9f9f9')
        }
      })
    },
    { immediate: true }
  )

  function toggle() {
    choice.value = dark.value ? 'light' : 'dark'
    try {
      localStorage.setItem(KEY, choice.value)
    } catch {
      /* the choice still applies for this visit */
    }
  }

  return { dark, toggle }
}
