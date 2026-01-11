import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { PlanningSession } from '../domain/types'

interface PlanningSessionsContextType {
  sessions: PlanningSession[]
  createSession: (session: Omit<PlanningSession, 'id' | 'created_at' | 'updated_at'>) => PlanningSession
  updateSession: (id: string, updates: Partial<PlanningSession>) => void
  getSessionById: (id: string) => PlanningSession | undefined
}

const PlanningSessionsContext = createContext<PlanningSessionsContextType | undefined>(undefined)

const STORAGE_KEY = 'designCapacity.sessions'

function loadSessionsFromStorage(): PlanningSession[] {
  if (typeof window === 'undefined') {
    return []
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Error loading sessions from localStorage:', error)
    return []
  }
}

function saveSessionsToStorage(sessions: PlanningSession[]): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch (error) {
    console.error('Error saving sessions to localStorage:', error)
  }
}

export function PlanningSessionsProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<PlanningSession[]>(() => loadSessionsFromStorage())

  // Save to localStorage whenever sessions change
  useEffect(() => {
    saveSessionsToStorage(sessions)
  }, [sessions])

  const createSession = useCallback(
    (sessionData: Omit<PlanningSession, 'id' | 'created_at' | 'updated_at'>): PlanningSession => {
      const newSession: PlanningSession = {
        ...sessionData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setSessions((prev) => [...prev, newSession])
      return newSession
    },
    []
  )

  const updateSession = useCallback((id: string, updates: Partial<PlanningSession>) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === id
          ? { ...session, ...updates, updated_at: new Date().toISOString() }
          : session
      )
    )
  }, [])

  const getSessionById = useCallback(
    (id: string): PlanningSession | undefined => {
      return sessions.find((session) => session.id === id)
    },
    [sessions]
  )

  return (
    <PlanningSessionsContext.Provider value={{ sessions, createSession, updateSession, getSessionById }}>
      {children}
    </PlanningSessionsContext.Provider>
  )
}

export function usePlanningSessions() {
  const context = useContext(PlanningSessionsContext)
  if (context === undefined) {
    throw new Error('usePlanningSessions must be used within a PlanningSessionsProvider')
  }
  return context
}
