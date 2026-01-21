import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { RoadmapItem, PMIntake, ProductDesignInputs, ContentDesignInputs } from '../domain/types'
import { useActivity } from './ActivityContext'
import { usePlanningSessions } from './PlanningSessionsContext'
import { mapSizeBandToFocusWeeks, mapSizeBandToContentFocusWeeks, calculateWorkWeeks } from '../config/effortModel'

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

/**
 * Normalize a roadmap item to ensure it has valid focus and work weeks
 * If focus weeks are missing or invalid, calculate them from size bands
 * If work weeks are missing or invalid, calculate them from focus weeks
 */
function normalizeRoadmapItem(item: RoadmapItem): RoadmapItem {
  const focusTimeRatio = 0.75 // Default ratio, matches transformation function
  
  // Normalize UX focus weeks
  let uxFocusWeeks = item.uxFocusWeeks
  if (typeof uxFocusWeeks !== 'number' || isNaN(uxFocusWeeks) || uxFocusWeeks < 0) {
    // Calculate from size band
    uxFocusWeeks = mapSizeBandToFocusWeeks(item.uxSizeBand || 'M')
  }
  
  // Normalize UX work weeks
  let uxWorkWeeks = item.uxWorkWeeks
  if (typeof uxWorkWeeks !== 'number' || isNaN(uxWorkWeeks) || uxWorkWeeks < 0) {
    // Calculate from focus weeks
    uxWorkWeeks = calculateWorkWeeks(uxFocusWeeks, focusTimeRatio)
  }
  
  // Normalize Content focus weeks
  let contentFocusWeeks = item.contentFocusWeeks
  if (typeof contentFocusWeeks !== 'number' || isNaN(contentFocusWeeks) || contentFocusWeeks < 0) {
    // Calculate from size band
    contentFocusWeeks = mapSizeBandToContentFocusWeeks(item.contentSizeBand || 'M')
  }
  
  // Normalize Content work weeks
  let contentWorkWeeks = item.contentWorkWeeks
  if (typeof contentWorkWeeks !== 'number' || isNaN(contentWorkWeeks) || contentWorkWeeks < 0) {
    // Calculate from focus weeks
    contentWorkWeeks = calculateWorkWeeks(contentFocusWeeks, focusTimeRatio)
  }
  
  return {
    ...item,
    uxFocusWeeks,
    uxWorkWeeks,
    contentFocusWeeks,
    contentWorkWeeks,
  }
}

/**
 * Normalize an array of roadmap items
 */
function normalizeRoadmapItems(items: RoadmapItem[]): RoadmapItem[] {
  return items.map(normalizeRoadmapItem)
}

export function RoadmapItemsProvider({ children }: { children: ReactNode }) {
  const { logActivity } = useActivity()
  const { getSessionById } = usePlanningSessions()
  
  // Store items as a map: planning_session_id -> RoadmapItem[]
  // Initialize from localStorage for immediate availability
  // Normalize items on initial load to ensure they have valid focus/work weeks
  const [itemsBySession, setItemsBySession] = useState<Record<string, RoadmapItem[]>>(() => {
    const loaded = loadItemsFromStorage()
    const normalized: Record<string, RoadmapItem[]> = {}
    for (const [sessionId, items] of Object.entries(loaded)) {
      normalized[sessionId] = normalizeRoadmapItems(items)
    }
    return normalized
  })
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
      // Normalize items to ensure they have valid focus/work weeks
      const normalizedData = normalizeRoadmapItems(data)
      // Use functional setState and save with fresh data to avoid stale closure
      setItemsBySession((prev) => {
        const updated = { ...prev, [sessionId]: normalizedData }
        // Save immediately with fresh data to avoid race condition
        saveItemsToStorage(updated)
        return updated
      })
    } catch (err) {
      console.error('Error loading roadmap items from API, falling back to localStorage:', err)
      setError('Failed to load roadmap items from database. Using local data.')
      // Fallback to localStorage
      const localItems = loadItemsFromStorage()
      const sessionItems = localItems[sessionId] || []
      // Normalize items to ensure they have valid focus/work weeks
      const normalizedItems = normalizeRoadmapItems(sessionItems)
      // Use functional setState and save with fresh data
      setItemsBySession((prev) => {
        const updated = { ...prev, [sessionId]: normalizedItems }
        saveItemsToStorage(updated)
        return updated
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

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
        // Normalize the new item to ensure it has valid focus/work weeks
        const normalizedItem = normalizeRoadmapItem(newItem)
        setItemsBySession((prev) => ({
          ...prev,
          [sessionId]: [...(prev[sessionId] || []), normalizedItem],
        }))
        return normalizedItem
      } catch (err) {
        console.error('Error creating roadmap item via API, falling back to localStorage:', err)
        // Fallback: create in localStorage
        // Default to 'M' size band with corresponding focus weeks (3.0) and work weeks (4.0)
        const defaultFocusWeeks = 3.0 // 'M' size band
        const defaultWorkWeeks = Number((defaultFocusWeeks / 0.75).toFixed(1)) // 4.0
        const newItem: RoadmapItem = {
          ...input,
          id: crypto.randomUUID(),
          planning_session_id: sessionId,
          status: 'draft',
          uxSizeBand: 'M',
          uxFocusWeeks: defaultFocusWeeks,
          uxWorkWeeks: defaultWorkWeeks,
          contentSizeBand: 'M',
          contentFocusWeeks: defaultFocusWeeks,
          contentWorkWeeks: defaultWorkWeeks,
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
      
      // Update state using functional update to read current item and preserve all fields
      setItemsBySession((prev) => {
        // Find the current item from state to preserve all existing fields
        let currentItem: RoadmapItem | undefined
        for (const items of Object.values(prev)) {
          const item = items.find((i) => i.id === itemId)
          if (item) {
            currentItem = item
            break
          }
        }

        if (!currentItem) {
          console.error('Cannot update item: item not found in state', itemId)
          return prev // No change if item not found
        }

        // Merge: currentItem (preserves all existing fields) + API response + updates (latest values)
        // This ensures fields not in the API response (like startDate/endDate) are preserved
        // Order matters: currentItem (base) -> updatedItem (API) -> updates (our changes, highest priority)
        const mergedItem = { ...currentItem, ...updatedItem, ...updates }
        // Normalize the merged item to ensure it has valid focus/work weeks
        // Normalization preserves valid numbers, so our pasted values will be kept
        // However, normalization recalculates work weeks from focus weeks, which is correct
        const normalizedItem = normalizeRoadmapItem(mergedItem)
        
        // Log activity (async, but we don't await in setState callback)
        const sessionId = normalizedItem.planning_session_id
        const session = getSessionById(sessionId)
        const sessionName = session?.name || 'Unknown scenario'
        logActivity({
          type: 'roadmap_item_updated',
          scenarioId: sessionId,
          scenarioName: sessionName,
          description: `Updated roadmap item '${normalizedItem.name}' in scenario '${sessionName}'.`,
        }).catch((err) => console.error('Failed to log activity:', err))

        // Update state with normalized item
        const updated: Record<string, RoadmapItem[]> = {}
        for (const [sid, items] of Object.entries(prev)) {
          updated[sid] = items.map((item) => (item.id === itemId ? normalizedItem : item))
        }
        return updated
      })
    } catch (err) {
      console.error('Error updating roadmap item via API, falling back to localStorage:', err)
      setError('Failed to update roadmap item in database. Changes saved locally.')
      // Fallback: update in localStorage
      // Normalize the updated item to ensure it has valid focus/work weeks
      setItemsBySession((prev) => {
        const updated: Record<string, RoadmapItem[]> = {}
        let updatedItem: RoadmapItem | undefined
        let sessionId: string | undefined
        
        for (const [sid, items] of Object.entries(prev)) {
          updated[sid] = items.map((item) => {
            if (item.id === itemId) {
              // Normalize the updated item to ensure consistency with online updates
              updatedItem = normalizeRoadmapItem({ ...item, ...updates })
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
          // Note: logActivity is async but we don't await in setState callback
          logActivity({
            type: 'roadmap_item_updated',
            scenarioId: sessionId,
            scenarioName: sessionName,
            description: `Updated roadmap item '${updatedItem.name}' in scenario '${sessionName}'.`,
          }).catch((err) => console.error('Failed to log activity:', err))
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
