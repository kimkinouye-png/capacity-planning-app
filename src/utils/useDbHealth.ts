import { useState, useEffect, useCallback } from 'react'

interface DbHealthStatus {
  status: 'ok' | 'error' | 'checking' | 'unknown'
  message: string
  lastChecked: string | null
}

const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions'

const DEFAULT_POLL_INTERVAL = 30000 // 30 seconds

/**
 * React hook to check database health status
 * 
 * @param pollInterval - How often to check health (in ms). Set to 0 to disable polling.
 * @returns Object with status, message, lastChecked timestamp, and manual check function
 */
export function useDbHealth(pollInterval: number = DEFAULT_POLL_INTERVAL) {
  const [health, setHealth] = useState<DbHealthStatus>({
    status: 'unknown',
    message: 'Not checked yet',
    lastChecked: null,
  })

  const checkHealth = useCallback(async () => {
    try {
      setHealth((prev) => ({ ...prev, status: 'checking' }))

      const response = await fetch(`${API_BASE_URL}/db-health`)
      const data = await response.json()

      if (response.ok && data.status === 'ok') {
        setHealth({
          status: 'ok',
          message: data.message || 'Database connection successful',
          lastChecked: data.timestamp || new Date().toISOString(),
        })
      } else {
        setHealth({
          status: 'error',
          message: data.message || 'Database connection failed',
          lastChecked: data.timestamp || new Date().toISOString(),
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setHealth({
        status: 'error',
        message: `Failed to check database health: ${errorMessage}`,
        lastChecked: new Date().toISOString(),
      })
    }
  }, [])

  // Initial check on mount
  useEffect(() => {
    checkHealth()
  }, [checkHealth])

  // Set up polling if interval is provided
  useEffect(() => {
    if (pollInterval <= 0) {
      return
    }

    const intervalId = setInterval(() => {
      checkHealth()
    }, pollInterval)

    return () => clearInterval(intervalId)
  }, [pollInterval, checkHealth])

  return {
    ...health,
    checkHealth,
  }
}
