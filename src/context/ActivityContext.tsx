import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { ActivityEvent } from '../domain/types'

interface ActivityContextType {
  activity: ActivityEvent[]
  logActivity: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined)

const MAX_ACTIVITY_EVENTS = 10

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activity, setActivity] = useState<ActivityEvent[]>([])

  const logActivity = useCallback((event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    }
    
    setActivity((prev) => {
      // Prepend new event and keep only the last MAX_ACTIVITY_EVENTS
      const updated = [newEvent, ...prev]
      return updated.slice(0, MAX_ACTIVITY_EVENTS)
    })
  }, [])

  return (
    <ActivityContext.Provider value={{ activity, logActivity }}>
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
