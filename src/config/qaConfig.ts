/**
 * QA Access Configuration
 * 
 * Set the QA code/password here. This can be overridden via environment variable
 * for different environments (dev, staging, production).
 */

// Disable QA auth for testing (set VITE_DISABLE_QA_AUTH=true)
// Currently disabled for both sites - set to true to always disable
export const QA_AUTH_DISABLED = true // Always disabled - both sites are fully accessible

// Default QA code (can be overridden via VITE_QA_CODE env var)
export const QA_CODE = import.meta.env.VITE_QA_CODE || 'QA2026'

// Session storage key
export const QA_AUTH_KEY = 'qa_authenticated'

// Session expiration (in milliseconds) - 24 hours by default
export const QA_SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Check if user is authenticated
 */
export function isQAAuthenticated(): boolean {
  // If QA auth is disabled, always return true
  if (QA_AUTH_DISABLED) return true
  
  if (typeof window === 'undefined') return false
  
  const authData = localStorage.getItem(QA_AUTH_KEY)
  if (!authData) return false
  
  try {
    const { timestamp } = JSON.parse(authData)
    const now = Date.now()
    
    // Check if session has expired
    if (now - timestamp > QA_SESSION_DURATION) {
      localStorage.removeItem(QA_AUTH_KEY)
      return false
    }
    
    return true
  } catch {
    return false
  }
}

/**
 * Set authentication status
 */
export function setQAAuthenticated(): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(QA_AUTH_KEY, JSON.stringify({
    timestamp: Date.now()
  }))
}

/**
 * Clear authentication
 */
export function clearQAAuthentication(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(QA_AUTH_KEY)
}
