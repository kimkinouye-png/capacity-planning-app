import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { ActivityEvent } from '../domain/types'

interface ActivityContextType {
  activity: ActivityEvent[]
  isLoading: boolean
  error: string | null
  logActivity: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => Promise<void>
  loadActivity: (scenarioId?: string) => Promise<void>
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined)

const MAX_ACTIVITY_EVENTS = 100 // Increased for database integration
const STORAGE_KEY = 'designCapacity.activity'

const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions'

function loadActivityFromStorage(scenarioId?: string): ActivityEvent[] {
  if (typeof window === 'undefined') {
    return []
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }
    const allActivity: ActivityEvent[] = JSON.parse(stored)
    if (scenarioId) {
      return allActivity.filter((e) => e.scenarioId === scenarioId)
    }
    return allActivity
  } catch (error) {
    console.error('Error loading activity from localStorage:', error)
    return []
  }
}

function saveActivityToStorage(activity: ActivityEvent[]): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    // Keep only the most recent entries in localStorage
    const toStore = activity.slice(0, MAX_ACTIVITY_EVENTS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
  } catch (error) {
    console.error('Error saving activity to localStorage:', error)
  }
}

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activity, setActivity] = useState<ActivityEvent[]>(() => loadActivityFromStorage())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadActivity = useCallback(async (scenarioId?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Try to load from API first
      try {
        const url = scenarioId
          ? `${API_BASE_URL}/get-activity-log?scenarioId=${encodeURIComponent(scenarioId)}`
          : `${API_BASE_URL}/get-activity-log`
        const response = await fetch(url)

        if (response.ok) {
          const data = await response.json()
          const activities: ActivityEvent[] = data.activities || []
          setActivity(activities)
          // Also store in localStorage as fallback
          saveActivityToStorage(activities)
          return
        }
      } catch (apiError) {
        console.warn('Failed to load activity from API, falling back to localStorage:', apiError)
      }

      // Fallback to localStorage
      const stored = loadActivityFromStorage(scenarioId)
      setActivity(stored)
    } catch (err) {
      console.error('Error loading activity:', err)
      setError(err instanceof Error ? err.message : 'Failed to load activity')
      // Fallback to localStorage on error
      const stored = loadActivityFromStorage(scenarioId)
      setActivity(stored)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logActivity = useCallback(async (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const tempId = `temp-${crypto.randomUUID()}`
    const timestamp = new Date().toISOString()
    const newEvent: ActivityEvent = {
      ...event,
      id: tempId,
      timestamp,
    }

    // Optimistically update UI and save to localStorage - use functional setState to avoid stale closures
    setActivity((prev) => {
      // Check for duplicates (same description and timestamp within 1 second)
      const isDuplicate = prev.some(
        (e) =>
          e.description === newEvent.description &&
          Math.abs(new Date(e.timestamp).getTime() - new Date(timestamp).getTime()) < 1000
      )
      if (isDuplicate) {
        // Skip duplicate
        return prev
      }
      // Prepend new event and keep only the last MAX_ACTIVITY_EVENTS
      const updated = [newEvent, ...prev].slice(0, MAX_ACTIVITY_EVENTS)
      // Save to localStorage immediately
      saveActivityToStorage(updated)
      return updated
    })

    // Try to save to API
    try {
      const response = await fetch(`${API_BASE_URL}/create-activity-log-entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: newEvent.type,
          scenarioId: newEvent.scenarioId,
          scenarioName: newEvent.scenarioName,
          description: newEvent.description,
          timestamp: newEvent.timestamp,
        }),
      })

      if (response.ok) {
        const savedEvent: ActivityEvent = await response.json()
        // Update with server-provided ID and timestamp, replacing temp entry
        setActivity((prev) => {
          // Filter out temp entry
          const filtered = prev.filter((e) => e.id !== tempId)
          // Check if savedEvent already exists (by description and timestamp)
          const exists = filtered.some(
            (e) =>
              e.description === savedEvent.description &&
              Math.abs(new Date(e.timestamp).getTime() - new Date(savedEvent.timestamp).getTime()) < 1000
          )
          if (exists) {
            // Already exists, just remove temp entry
            const trimmed = filtered.slice(0, MAX_ACTIVITY_EVENTS)
            saveActivityToStorage(trimmed)
            return trimmed
          }
          // Prepend saved event (with real ID from server) and keep sorted by timestamp
          const updated = [savedEvent, ...filtered]
          const sorted = updated.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          const trimmed = sorted.slice(0, MAX_ACTIVITY_EVENTS)
          saveActivityToStorage(trimmed)
          return trimmed
        })
        setError(null)
      } else {
        // API failed but localStorage save succeeded - set warning error
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        setError(`Activity saved locally but not synced: ${errorData.error || 'Database sync failed'}`)
      }
    } catch (apiError) {
      console.warn('Failed to save activity to API, using localStorage only:', apiError)
      // API failed but localStorage save succeeded - set warning error
      const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error'
      setError(`Activity saved locally but not synced: ${errorMessage}`)
    }
  }, [])

  // Load initial activity on mount (all activity, no filter)
  useEffect(() => {
    loadActivity()
  }, [loadActivity])

  return (
    <ActivityContext.Provider value={{ activity, isLoading, error, logActivity, loadActivity }}>
      {children}
    </ActivityContext.Provider>
  )
}

export function useActivity() {
  const context = useContext(ActivityContext)
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider')
  }
  return context
}
