import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { PlanningSession } from '../domain/types'
import { useActivity } from './ActivityContext'

interface PlanningSessionsContextType {
  sessions: PlanningSession[]
  isLoading: boolean
  error: string | null
  createSession: (session: Omit<PlanningSession, 'id' | 'created_at' | 'updated_at' | 'status' | 'isCommitted'>) => Promise<PlanningSession>
  updateSession: (id: string, updates: Partial<PlanningSession>) => Promise<void>
  commitSession: (id: string, itemCount?: number) => Promise<void>
  uncommitSession: (id: string) => Promise<void>
  deleteSession: (id: string) => Promise<void>
  getSessionById: (id: string) => PlanningSession | undefined
  loadSessions: () => Promise<void>
}

const PlanningSessionsContext = createContext<PlanningSessionsContextType | undefined>(undefined)

const STORAGE_KEY = 'designCapacity.sessions'

const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions'

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
  const [sessions, setSessions] = useState<PlanningSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { logActivity } = useActivity()

  // Load sessions from API on mount, fallback to localStorage on error
  const loadSessions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/get-scenarios`)
      if (!response.ok) {
        // Check for specific error types
        if (response.status === 404) {
          throw new Error('NOT_FOUND')
        }
        if (response.status >= 500) {
          throw new Error('SERVER_ERROR')
        }
        // Check for timeout
        const errorText = response.statusText.toLowerCase()
        if (errorText.includes('timeout') || errorText.includes('timed out')) {
          throw new Error('TIMEOUT')
        }
        throw new Error(`Failed to fetch scenarios: ${response.statusText}`)
      }
      const data: PlanningSession[] = await response.json()
      setSessions(data)
      // Also save to localStorage as backup
      saveSessionsToStorage(data)
      // Clear any previous errors since we successfully loaded
      setError(null)
    } catch (err) {
      console.warn('⚠️ Scenarios API unavailable, using local data:', err)
      
      // Fallback to localStorage
      const localSessions = loadSessionsFromStorage()
      setSessions(localSessions)
      
      // Only set error if we have no data at all (both API and localStorage failed)
      // If localStorage has data, the fallback succeeded, so don't show error
      if (localSessions.length === 0) {
        const error = err instanceof Error ? err : new Error(String(err))
        const isDevMode = import.meta.env.DEV
        
        // Differentiate error types
        if (error.message === 'NOT_FOUND') {
          setError('Scenarios not found in database.')
        } else if (error.message === 'TIMEOUT') {
          setError('Database connection timed out. Please try again.')
        } else if (error.message === 'SERVER_ERROR') {
          setError('Database server error. Please try again later.')
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          setError('Cannot connect to database. Check your connection and try again.')
        } else {
          // Only show generic error in production
          if (!isDevMode) {
            setError('Failed to load scenarios from database.')
          } else {
            // In dev mode, just log it - this is expected if Netlify Dev isn't running
            console.info('ℹ️ Running in dev mode without Netlify Dev - using localStorage for scenarios')
          }
        }
      } else {
        // We have local data, so fallback succeeded - don't show error
        // In dev mode, this is expected
        const isDevMode = import.meta.env.DEV
        if (isDevMode) {
          console.info('ℹ️ Using localStorage fallback (API unavailable)')
        }
        // Clear error since we have data
        setError(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load on mount
  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  // Save to localStorage as backup whenever sessions change (for offline support)
  useEffect(() => {
    if (!isLoading && sessions.length > 0) {
      saveSessionsToStorage(sessions)
    }
  }, [sessions, isLoading])

  const createSession = useCallback(
    async (sessionData: Omit<PlanningSession, 'id' | 'created_at' | 'updated_at' | 'status' | 'isCommitted'>): Promise<PlanningSession> => {
      try {
        const response = await fetch(`${API_BASE_URL}/create-scenario`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sessionData),
        })

        if (!response.ok) {
          throw new Error(`Failed to create scenario: ${response.statusText}`)
        }

        const newSession: PlanningSession = await response.json()
        setSessions((prev) => [...prev, newSession])
        
        // Log activity
        const quarter = newSession.planningPeriod || newSession.planning_period || 'Unknown'
        await logActivity({
          type: 'scenario_created',
          scenarioId: newSession.id,
          scenarioName: newSession.name,
          description: `Created scenario '${newSession.name}' for ${quarter}.`,
        })
        
        return newSession
      } catch (err) {
        console.error('Error creating scenario via API, falling back to localStorage:', err)
        // Fallback: create in localStorage
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
        await logActivity({
          type: 'scenario_created',
          scenarioId: newSession.id,
          scenarioName: newSession.name,
          description: `Created scenario '${newSession.name}' for ${quarter}.`,
        })
        
        return newSession
      }
    },
    [logActivity]
  )

  const updateSession = useCallback(async (id: string, updates: Partial<PlanningSession>): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/update-scenario`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update scenario: ${response.statusText}`)
      }

      const updatedSession: PlanningSession = await response.json()
      
      // Log activity if name is being changed - use functional setState to get current session
      // instead of relying on stale closure value
      setSessions((prev) => {
        const oldSession = prev.find((s) => s.id === id)
        // Log activity if name changed, using fresh state value
        if (oldSession && updates.name !== undefined && updatedSession.name !== oldSession.name) {
          // Note: logActivity is async but we don't await in setState callback
          logActivity({
            type: 'scenario_renamed',
            scenarioId: oldSession.id,
            scenarioName: oldSession.name,
            description: `Renamed scenario from '${oldSession.name}' to '${updatedSession.name}'.`,
          }).catch((err) => console.error('Failed to log activity:', err))
        }
        return prev.map((session) => (session.id === id ? updatedSession : session))
      })
    } catch (err) {
      console.error('Error updating scenario via API, falling back to localStorage:', err)
      // Fallback: update in localStorage
      // Use functional setState to avoid stale closure
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === id) {
            // Log activity if name is being changed, using fresh state value
            if (updates.name !== undefined && updates.name !== session.name) {
              // Note: logActivity is async but we don't await in setState callback
              logActivity({
                type: 'scenario_renamed',
                scenarioId: session.id,
                scenarioName: session.name,
                description: `Renamed scenario from '${session.name}' to '${updates.name}'.`,
              }).catch((err) => console.error('Failed to log activity:', err))
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
    }
  }, [logActivity])

  const commitSession = useCallback(async (id: string, itemCount?: number): Promise<void> => {
    const sessionToCommit = sessions.find((s) => s.id === id)
    if (!sessionToCommit) return

    // Prevent committing scenarios with no roadmap items
    if (itemCount !== undefined && itemCount === 0) {
      console.warn('Cannot commit scenario with no roadmap items')
      return
    }

    const quarter = sessionToCommit.planningPeriod || sessionToCommit.planning_period

    // Update state optimistically before API calls to ensure UI consistency
    // This prevents showing multiple committed sessions if API calls fail
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === id) {
          return { ...session, status: 'committed' as const, isCommitted: true, updated_at: new Date().toISOString() }
        } else if ((session.planningPeriod || session.planning_period) === quarter && session.status === 'committed') {
          return { ...session, status: 'draft' as const, isCommitted: false, updated_at: new Date().toISOString() }
        }
        return session
      })
    )

    try {
      // First, uncommit other sessions in the same quarter
      const otherCommittedSessions = sessions.filter(
        (s) => (s.planningPeriod || s.planning_period) === quarter && s.status === 'committed' && s.id !== id
      )

      // Uncommit other sessions with proper error handling
      const uncommitErrors: Array<{ sessionId: string; error: Error }> = []
      for (const otherSession of otherCommittedSessions) {
        try {
          const response = await fetch(`${API_BASE_URL}/update-scenario`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: otherSession.id, status: 'draft' }),
          })
          if (!response.ok) {
            throw new Error(`Failed to uncommit session: ${response.statusText}`)
          }
        } catch (err) {
          console.error('Error uncommitting other session:', err)
          uncommitErrors.push({ sessionId: otherSession.id, error: err instanceof Error ? err : new Error(String(err)) })
        }
      }

      // If any uncommit operations failed, set error state
      if (uncommitErrors.length > 0) {
        setError(`Failed to uncommit ${uncommitErrors.length} session(s). Local state updated, but database may be inconsistent.`)
      }

      // Commit this session
      const response = await fetch(`${API_BASE_URL}/update-scenario`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'committed' }),
      })

      if (!response.ok) {
        throw new Error(`Failed to commit scenario: ${response.statusText}`)
      }

      const updatedSession: PlanningSession = await response.json()

      // Log activity
      await logActivity({
        type: 'scenario_committed',
        scenarioId: sessionToCommit.id,
        scenarioName: sessionToCommit.name,
        description: `Committed scenario '${sessionToCommit.name}' as the quarterly plan.`,
      })

      // Update state with server response (may differ from optimistic update)
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id === id) {
            return updatedSession
          } else if ((session.planningPeriod || session.planning_period) === quarter && session.status === 'committed') {
            return { ...session, status: 'draft' as const, isCommitted: false, updated_at: new Date().toISOString() }
          }
          return session
        })
      )
    } catch (err) {
      console.error('Error committing scenario via API, falling back to localStorage:', err)
      // Fallback: commit in localStorage
      await logActivity({
        type: 'scenario_committed',
        scenarioId: sessionToCommit.id,
        scenarioName: sessionToCommit.name,
        description: `Committed scenario '${sessionToCommit.name}' as the quarterly plan.`,
      })

      setSessions((prev) =>
        prev.map((session) => {
          const sessionQuarter = session.planningPeriod || session.planning_period
          
          if (session.id === id) {
            return {
              ...session,
              status: 'committed',
              isCommitted: true,
              updated_at: new Date().toISOString(),
            }
          } else if (sessionQuarter === quarter && session.status === 'committed') {
            return {
              ...session,
              status: 'draft',
              isCommitted: false,
              updated_at: new Date().toISOString(),
            }
          }
          return session
        })
      )
    }
  }, [sessions, logActivity])

  const uncommitSession = useCallback(async (id: string): Promise<void> => {
    const sessionToUncommit = sessions.find((s) => s.id === id)
    if (!sessionToUncommit) return

    // Optimistic update: update UI immediately for instant feedback
    const originalSession = { ...sessionToUncommit }
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === id) {
          return {
            ...session,
            status: 'draft' as const,
            isCommitted: false,
            updated_at: new Date().toISOString(),
          }
        }
        return session
      })
    )

    // Now sync with API (this may be slow, but UI is already updated)
    try {
      const response = await fetch(`${API_BASE_URL}/update-scenario`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'draft' }),
      })

      if (!response.ok) {
        throw new Error(`Failed to uncommit scenario: ${response.statusText}`)
      }

      const updatedSession: PlanningSession = await response.json()

      // Log activity (non-blocking)
      logActivity({
        type: 'scenario_committed',
        scenarioId: sessionToUncommit.id,
        scenarioName: sessionToUncommit.name,
        description: `Uncommitted scenario '${sessionToUncommit.name}'.`,
      }).catch((err) => {
        console.warn('Failed to log activity (non-critical):', err)
      })

      // Update with server response (may have additional fields)
      setSessions((prev) =>
        prev.map((session) => (session.id === id ? updatedSession : session))
      )
      
      console.log('✅ [uncommitSession] Scenario uncommitted successfully')
    } catch (err) {
      console.error('❌ [uncommitSession] Error uncommitting scenario via API, restoring state:', err)
      
      // Restore original state if API call failed
      setSessions((prev) =>
        prev.map((session) => (session.id === id ? originalSession : session))
      )
      
      // Re-throw error so caller can show error message
      throw err
    }
  }, [sessions, logActivity])

  const getSessionById = useCallback(
    (id: string): PlanningSession | undefined => {
      return sessions.find((session) => session.id === id)
    },
    [sessions]
  )

  const deleteSession = useCallback(async (id: string): Promise<void> => {
    const sessionToDelete = sessions.find((s) => s.id === id)
    if (!sessionToDelete) return

    try {
      const response = await fetch(`${API_BASE_URL}/delete-scenario?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete scenario: ${response.statusText}`)
      }

      // Log activity
      await logActivity({
        type: 'scenario_deleted',
        scenarioId: sessionToDelete.id,
        scenarioName: sessionToDelete.name,
        description: `Deleted scenario '${sessionToDelete.name}' (no roadmap items).`,
      })

      // Remove from state
      setSessions((prev) => prev.filter((session) => session.id !== id))
    } catch (err) {
      console.error('Error deleting scenario via API, falling back to localStorage:', err)
      // Fallback: delete in localStorage
      await logActivity({
        type: 'scenario_deleted',
        scenarioId: sessionToDelete.id,
        scenarioName: sessionToDelete.name,
        description: `Deleted scenario '${sessionToDelete.name}' (no roadmap items).`,
      })

      setSessions((prev) => prev.filter((session) => session.id !== id))
    }
  }, [sessions, logActivity])

  return (
    <PlanningSessionsContext.Provider value={{ sessions, isLoading, error, createSession, updateSession, commitSession, uncommitSession, deleteSession, getSessionById, loadSessions }}>
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
