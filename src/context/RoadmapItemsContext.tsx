import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { RoadmapItem, PMIntake, ProductDesignInputs, ContentDesignInputs } from '../domain/types'
import { useActivity } from './ActivityContext'
import { usePlanningSessions } from './PlanningSessionsContext'

interface ItemInputs {
  intake: PMIntake
  pd: ProductDesignInputs
  cd: ContentDesignInputs
}

interface RoadmapItemsContextType {
  getItemsForSession: (sessionId: string) => RoadmapItem[]
  isLoading: boolean
  error: string | null
  createItem: (
    sessionId: string,
    input: Omit<RoadmapItem, 'id' | 'planning_session_id' | 'status' | 'uxSizeBand' | 'uxFocusWeeks' | 'uxWorkWeeks' | 'contentSizeBand' | 'contentFocusWeeks' | 'contentWorkWeeks'>
  ) => Promise<RoadmapItem>
  updateItem: (id: string, patch: Partial<RoadmapItem>) => Promise<void>
  removeItem: (sessionId: string, itemId: string) => Promise<void>
  getInputsForItem: (itemId: string) => ItemInputs | undefined
  setInputsForItem: (itemId: string, inputs: ItemInputs) => void
  loadItemsForSession: (sessionId: string) => Promise<void>
}

const RoadmapItemsContext = createContext<RoadmapItemsContextType | undefined>(undefined)

const ITEMS_STORAGE_KEY = 'designCapacity.items'
const INPUTS_STORAGE_KEY = 'designCapacity.inputs'

const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions'

function loadItemsFromStorage(): Record<string, RoadmapItem[]> {
  if (typeof window === 'undefined') {
    return {}
  }
  try {
    const stored = localStorage.getItem(ITEMS_STORAGE_KEY)
    if (!stored) {
      return {}
    }
    const parsed = JSON.parse(stored)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (error) {
    console.error('Error loading items from localStorage:', error)
    return {}
  }
}

function saveItemsToStorage(items: Record<string, RoadmapItem[]>): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Error saving items to localStorage:', error)
  }
}

function loadInputsFromStorage(): Record<string, ItemInputs> {
  if (typeof window === 'undefined') {
    return {}
  }
  try {
    const stored = localStorage.getItem(INPUTS_STORAGE_KEY)
    if (!stored) {
      return {}
    }
    const parsed = JSON.parse(stored)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (error) {
    console.error('Error loading inputs from localStorage:', error)
    return {}
  }
}

function saveInputsToStorage(inputs: Record<string, ItemInputs>): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    localStorage.setItem(INPUTS_STORAGE_KEY, JSON.stringify(inputs))
  } catch (error) {
    console.error('Error saving inputs to localStorage:', error)
  }
}

export function RoadmapItemsProvider({ children }: { children: ReactNode }) {
  const { logActivity } = useActivity()
  const { getSessionById } = usePlanningSessions()
  
  // Store items as a map: planning_session_id -> RoadmapItem[]
  const [itemsBySession, setItemsBySession] = useState<Record<string, RoadmapItem[]>>({})
  // Store inputs as a map: itemId -> { intake, pd, cd }
  const [inputsByItemId, setInputsByItemId] = useState<Record<string, ItemInputs>>(() =>
    loadInputsFromStorage()
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Save to localStorage as backup whenever items change (for offline support)
  useEffect(() => {
    if (!isLoading && Object.keys(itemsBySession).length > 0) {
      saveItemsToStorage(itemsBySession)
    }
  }, [itemsBySession, isLoading])

  useEffect(() => {
    saveInputsToStorage(inputsByItemId)
  }, [inputsByItemId])

  // Load items for a session from API, fallback to localStorage on error
  const loadItemsForSession = useCallback(async (sessionId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/get-roadmap-items?scenarioId=${sessionId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch roadmap items: ${response.statusText}`)
      }
      const data: RoadmapItem[] = await response.json()
      setItemsBySession((prev) => ({
        ...prev,
        [sessionId]: data,
      }))
      // Also save to localStorage as backup
      const updated = { ...itemsBySession, [sessionId]: data }
      saveItemsToStorage(updated)
    } catch (err) {
      console.error('Error loading roadmap items from API, falling back to localStorage:', err)
      setError('Failed to load roadmap items from database. Using local data.')
      // Fallback to localStorage
      const localItems = loadItemsFromStorage()
      setItemsBySession((prev) => ({
        ...prev,
        [sessionId]: localItems[sessionId] || [],
      }))
    } finally {
      setIsLoading(false)
    }
  }, [itemsBySession])

  const getItemsForSession = useCallback(
    (sessionId: string): RoadmapItem[] => {
      return itemsBySession[sessionId] || []
    },
    [itemsBySession]
  )

  const createItem = useCallback(
    async (
      sessionId: string,
      input: Omit<RoadmapItem, 'id' | 'planning_session_id' | 'status' | 'uxSizeBand' | 'uxFocusWeeks' | 'uxWorkWeeks' | 'contentSizeBand' | 'contentFocusWeeks' | 'contentWorkWeeks'>
    ): Promise<RoadmapItem> => {
      try {
        const response = await fetch(`${API_BASE_URL}/create-roadmap-item`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scenario_id: sessionId,
            short_key: input.short_key,
            name: input.name,
            initiative: input.initiative,
            priority: input.priority,
            status: 'draft',
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to create roadmap item: ${response.statusText}`)
        }

        const newItem: RoadmapItem = await response.json()
        setItemsBySession((prev) => ({
          ...prev,
          [sessionId]: [...(prev[sessionId] || []), newItem],
        }))
        return newItem
      } catch (err) {
        console.error('Error creating roadmap item via API, falling back to localStorage:', err)
        // Fallback: create in localStorage
        const newItem: RoadmapItem = {
          ...input,
          id: crypto.randomUUID(),
          planning_session_id: sessionId,
          status: 'draft',
          uxSizeBand: 'M',
          uxFocusWeeks: 0,
          uxWorkWeeks: 0,
          contentSizeBand: 'M',
          contentFocusWeeks: 0,
          contentWorkWeeks: 0,
        }
        setItemsBySession((prev) => ({
          ...prev,
          [sessionId]: [...(prev[sessionId] || []), newItem],
        }))
        return newItem
      }
    },
    []
  )

  const updateItem = useCallback(async (itemId: string, updates: Partial<RoadmapItem>): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/update-roadmap-item`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: itemId, ...updates }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update roadmap item: ${response.statusText}`)
      }

      const updatedItem: RoadmapItem = await response.json()
      
      // Log activity
      const sessionId = updatedItem.planning_session_id
      const session = getSessionById(sessionId)
      const sessionName = session?.name || 'Unknown scenario'
      logActivity({
        type: 'roadmap_item_updated',
        scenarioId: sessionId,
        scenarioName: sessionName,
        description: `Updated roadmap item '${updatedItem.name}' in scenario '${sessionName}'.`,
      })

      // Update state
      setItemsBySession((prev) => {
        const updated: Record<string, RoadmapItem[]> = {}
        for (const [sid, items] of Object.entries(prev)) {
          updated[sid] = items.map((item) => (item.id === itemId ? updatedItem : item))
        }
        return updated
      })
    } catch (err) {
      console.error('Error updating roadmap item via API, falling back to localStorage:', err)
      // Fallback: update in localStorage
      setItemsBySession((prev) => {
        const updated: Record<string, RoadmapItem[]> = {}
        let updatedItem: RoadmapItem | undefined
        let sessionId: string | undefined
        
        for (const [sid, items] of Object.entries(prev)) {
          updated[sid] = items.map((item) => {
            if (item.id === itemId) {
              updatedItem = { ...item, ...updates }
              sessionId = sid
              return updatedItem
            }
            return item
          })
        }
        
        // Log activity if item was updated
        if (updatedItem && sessionId) {
          const session = getSessionById(sessionId)
          const sessionName = session?.name || 'Unknown scenario'
          logActivity({
            type: 'roadmap_item_updated',
            scenarioId: sessionId,
            scenarioName: sessionName,
            description: `Updated roadmap item '${updatedItem.name}' in scenario '${sessionName}'.`,
          })
        }
        
        return updated
      })
    }
  }, [logActivity, getSessionById])

  const removeItem = useCallback(async (sessionId: string, itemId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/delete-roadmap-item?id=${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete roadmap item: ${response.statusText}`)
      }

      // Remove from state
      setItemsBySession((prev) => {
        const sessionItems = prev[sessionId] || []
        const updatedItems = sessionItems.filter((item) => item.id !== itemId)
        return {
          ...prev,
          [sessionId]: updatedItems,
        }
      })
      // Also remove inputs for this item
      setInputsByItemId((prev) => {
        const updated = { ...prev }
        delete updated[itemId]
        return updated
      })
    } catch (err) {
      console.error('Error deleting roadmap item via API, falling back to localStorage:', err)
      // Fallback: delete in localStorage
      setItemsBySession((prev) => {
        const sessionItems = prev[sessionId] || []
        const updatedItems = sessionItems.filter((item) => item.id !== itemId)
        return {
          ...prev,
          [sessionId]: updatedItems,
        }
      })
      // Also remove inputs for this item
      setInputsByItemId((prev) => {
        const updated = { ...prev }
        delete updated[itemId]
        return updated
      })
    }
  }, [])

  const getInputsForItem = useCallback(
    (itemId: string): ItemInputs | undefined => {
      return inputsByItemId[itemId]
    },
    [inputsByItemId]
  )

  const setInputsForItem = useCallback((itemId: string, inputs: ItemInputs) => {
    setInputsByItemId((prev) => ({
      ...prev,
      [itemId]: inputs,
    }))
  }, [])

  return (
    <RoadmapItemsContext.Provider
      value={{ getItemsForSession, isLoading, error, createItem, updateItem, removeItem, getInputsForItem, setInputsForItem, loadItemsForSession }}
    >
      {children}
    </RoadmapItemsContext.Provider>
  )
}

export function useRoadmapItems() {
  const context = useContext(RoadmapItemsContext)
  if (context === undefined) {
    throw new Error('useRoadmapItems must be used within a RoadmapItemsProvider')
  }
  return context
}
