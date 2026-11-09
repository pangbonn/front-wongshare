/** Sticky header (h-14) + breathing room, used when scrolling to an anchor. */
export const HEADER_OFFSET = 80

export function scrollToAnchor(id: string, behavior: ScrollBehavior = 'smooth'): boolean {
  const el = document.getElementById(id)
  if (!el) return false
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET, behavior })
  return true
}

/**
 * Deep links land before images/diagrams above the target finish loading, which
 * pushes the target down. Re-align on layout changes for a short while, and stop
 * as soon as the user scrolls on their own.
 */
export function pinToAnchor(id: string, durationMs = 4000): () => void {
  if (!scrollToAnchor(id, 'auto')) return () => {}

  const realign = () => scrollToAnchor(id, 'auto')
  const observer = new ResizeObserver(realign)
  observer.observe(document.body)

  const userEvents = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const
  const stop = () => {
    observer.disconnect()
    clearTimeout(timer)
    userEvents.forEach((e) => window.removeEventListener(e, stop))
  }
  const timer = setTimeout(stop, durationMs)
  userEvents.forEach((e) => window.addEventListener(e, stop, { passive: true }))
  return stop
}
