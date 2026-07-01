import { ref } from 'vue'

const isDark = ref(false)

const applyTheme = (dark: boolean) => {
  const html = document.documentElement
  if (dark) {
    html.classList.add('dark')
    html.setAttribute('data-theme', 'dark')
  } else {
    html.classList.remove('dark')
    html.setAttribute('data-theme', 'light')
  }
  localStorage.setItem('wongshare-theme', dark ? 'dark' : 'light')
}

export function useTheme() {
  const initTheme = () => {
    const saved = localStorage.getItem('wongshare-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = saved !== null ? saved === 'dark' : prefersDark
    applyTheme(isDark.value)
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme(isDark.value)
  }

  return { isDark, initTheme, toggleTheme }
}
