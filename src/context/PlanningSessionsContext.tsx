import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { PlanningSession } from '../domain/types'
import { useActivity } from './ActivityContext'

interface PlanningSessionsContextType {
  sessions: PlanningSession[]
  createSession: (session: Omit<PlanningSession, 'id' | 'created_at' | 'updated_at' | 'status' | 'isCommitted'>) => PlanningSession
  updateSession: (id: string, updates: Partial<PlanningSession>) => void
  commitSession: (id: string, itemCount?: number) => void
  uncommitSession: (id: string) => void
  deleteSession: (id: string) => void
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
    if (!Array.isArray(parsed)) {
      return []
    }
    // Migrate existing sessions that don't have status/isCommitted
    return parsed.map((session: PlanningSession) => {
      if (!session.status) {
        return {
          ...session,
          status: 'draft',
          isCommitted: false,
        }
      }
      // Ensure isCommitted is in sync with status
      if (session.isCommitted === undefined) {
        return {
          ...session,
          isCommitted: session.status === 'committed',
        }
      }
      return session
    })
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
  const { logActivity } = useActivity()

  // Save to localStorage whenever sessions change
  useEffect(() => {
    saveSessionsToStorage(sessions)
  }, [sessions])

  const createSession = useCallback(
    (sessionData: Omit<PlanningSession, 'id' | 'created_at' | 'updated_at' | 'status' | 'isCommitted'>): PlanningSession => {
      const newSession: PlanningSession = {
        ...sessionData,
        status: 'draft',
        isCommitted: false,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setSessions((prev) => [...prev, newSession])
      
      // Log activity
      const quarter = newSession.planningPeriod || newSession.planning_period || 'Unknown'
      logActivity({
        type: 'scenario_created',
        scenarioId: newSession.id,
        scenarioName: newSession.name,
        description: `Created scenario '${newSession.name}' for ${quarter}.`,
      })
      
      return newSession
    },
    [logActivity]
  )

  const updateSession = useCallback((id: string, updates: Partial<PlanningSession>) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === id) {
          // Log activity if name is being changed
          if (updates.name !== undefined && updates.name !== session.name) {
            logActivity({
              type: 'scenario_renamed',
              scenarioId: session.id,
              scenarioName: session.name,
              description: `Renamed scenario from '${session.name}' to '${updates.name}'.`,
            })
          }

          const updated = { ...session, ...updates, updated_at: new Date().toISOString() }
          // Keep status and isCommitted in sync
          if (updates.status !== undefined) {
            updated.isCommitted = updates.status === 'committed'
          } else if (updates.isCommitted !== undefined) {
            updated.status = updates.isCommitted ? 'committed' : 'draft'
          }
          return updated
        }
        return session
      })
    )
  }, [logActivity])

  const commitSession = useCallback((id: string, itemCount?: number) => {
    setSessions((prev) => {
      const sessionToCommit = prev.find((s) => s.id === id)
      if (!sessionToCommit) return prev

      // Prevent committing scenarios with no roadmap items
      if (itemCount !== undefined && itemCount === 0) {
        console.warn('Cannot commit scenario with no roadmap items')
        return prev
      }

      const quarter = sessionToCommit.planningPeriod || sessionToCommit.planning_period

      // Log activity before updating
      logActivity({
        type: 'scenario_committed',
        scenarioId: sessionToCommit.id,
        scenarioName: sessionToCommit.name,
        description: `Committed scenario '${sessionToCommit.name}' as the quarterly plan.`,
      })

      return prev.map((session) => {
        const sessionQuarter = session.planningPeriod || session.planning_period
        
        if (session.id === id) {
          // Commit this session
          return {
            ...session,
            status: 'committed',
            isCommitted: true,
            updated_at: new Date().toISOString(),
          }
        } else if (sessionQuarter === quarter && session.status === 'committed') {
          // Uncommit other sessions in the same quarter
          return {
            ...session,
            status: 'draft',
            isCommitted: false,
            updated_at: new Date().toISOString(),
          }
        }
        return session
      })
    })
  }, [logActivity])

  const uncommitSession = useCallback((id: string) => {
    setSessions((prev) => {
      const sessionToUncommit = prev.find((s) => s.id === id)
      if (!sessionToUncommit) return prev

      // Log activity before updating
      logActivity({
        type: 'scenario_committed', // Reusing the same type for now
        scenarioId: sessionToUncommit.id,
        scenarioName: sessionToUncommit.name,
        description: `Uncommitted scenario '${sessionToUncommit.name}'.`,
      })

      return prev.map((session) => {
        if (session.id === id) {
          // Uncommit this session
          return {
            ...session,
            status: 'draft',
            isCommitted: false,
            updated_at: new Date().toISOString(),
          }
        }
        return session
      })
    })
  }, [logActivity])

  const getSessionById = useCallback(
    (id: string): PlanningSession | undefined => {
      return sessions.find((session) => session.id === id)
    },
    [sessions]
  )

  const deleteSession = useCallback((id: string) => {
    const sessionToDelete = sessions.find((s) => s.id === id)
    if (!sessionToDelete) return

    // Log activity before deleting
    logActivity({
      type: 'scenario_deleted',
      scenarioId: sessionToDelete.id,
      scenarioName: sessionToDelete.name,
      description: `Deleted scenario '${sessionToDelete.name}' (no roadmap items).`,
    })

    // Remove the session from state
    setSessions((prev) => prev.filter((session) => session.id !== id))
  }, [sessions, logActivity])

  return (
    <PlanningSessionsContext.Provider value={{ sessions, createSession, updateSession, commitSession, uncommitSession, deleteSession, getSessionById }}>
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
