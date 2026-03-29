/**
 * Per-visitor session ID for capacity planner.
 * Stored in localStorage; send with every API request (header x-session-id or body.sessionId).
 */

const STORAGE_KEY = 'designCapacity.visitorSessionId'

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return crypto.randomUUID()
  }
  try {
    let id = localStorage.getItem(STORAGE_KEY)
    if (!id || !id.trim()) {
      id = crypto.randomUUID()
      localStorage.setItem(STORAGE_KEY, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export function getSessionId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const id = localStorage.getItem(STORAGE_KEY)
    return id && id.trim() ? id : null
  } catch {
    return null
  }
}

/**
 * Clear the stored visitor session ID (and workspace backup data) and reload the app
 * so a fresh, empty workspace is created. Used by "Reset my workspace" in the UI.
 */
export function resetWorkspace(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('designCapacity.sessions')
    localStorage.removeItem('designCapacity.items')
    localStorage.removeItem('designCapacity.activity')
    window.location.reload()
  } catch {
    window.location.reload()
  }
}
