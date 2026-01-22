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
    console.log('🟡 [loadItemsForSession] Loading items for session:', sessionId)
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/get-roadmap-items?scenarioId=${sessionId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch roadmap items: ${response.statusText}`)
      }
      const data: RoadmapItem[] = await response.json()
      console.log('🟡 [loadItemsForSession] Received items from API:', {
        sessionId,
        itemCount: data.length,
        sampleItem: data[0] ? {
          id: data[0].id,
          name: data[0].name,
          uxFocusWeeks: data[0].uxFocusWeeks,
          contentFocusWeeks: data[0].contentFocusWeeks,
          startDate: data[0].startDate,
          endDate: data[0].endDate
        } : null
      })
      // Normalize items to ensure they have valid focus/work weeks
      const normalizedData = normalizeRoadmapItems(data)
      console.log('🟡 [loadItemsForSession] Normalized items:', {
        sessionId,
        itemCount: normalizedData.length,
        sampleItem: normalizedData[0] ? {
          id: normalizedData[0].id,
          uxFocusWeeks: normalizedData[0].uxFocusWeeks,
          contentFocusWeeks: normalizedData[0].contentFocusWeeks
        } : null
      })
      // Use functional setState and save with fresh data to avoid stale closure
      setItemsBySession((prev) => {
        const prevItems = prev[sessionId] || []
        console.log('🟡 [loadItemsForSession] Replacing items in state:', {
          sessionId,
          prevCount: prevItems.length,
          newCount: normalizedData.length,
          prevSample: prevItems[0] ? {
            id: prevItems[0].id,
            uxFocusWeeks: prevItems[0].uxFocusWeeks
          } : null,
          newSample: normalizedData[0] ? {
            id: normalizedData[0].id,
            uxFocusWeeks: normalizedData[0].uxFocusWeeks
          } : null
        })
        const updated = { ...prev, [sessionId]: normalizedData }
        // Save immediately with fresh data to avoid race condition
        saveItemsToStorage(updated)
        return updated
      })
    } catch (err) {
      console.warn('⚠️ Roadmap items API unavailable, using local data:', err)
      // In dev mode without Netlify Dev, this is expected - don't show as error
      // In production, this indicates a real issue
      const isDevMode = import.meta.env.DEV
      if (!isDevMode) {
        // Only show error in production
        setError('Failed to load roadmap items from database. Using local data.')
      } else {
        // In dev mode, just log it - this is expected if Netlify Dev isn't running
        console.info('ℹ️ Running in dev mode without Netlify Dev - using localStorage for roadmap items')
      }
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
    // Debug: Log what we're sending
    const requestPayload = { id: itemId, ...updates }
    console.log('🔵 [updateItem] Sending API request:', {
      endpoint: `${API_BASE_URL}/update-roadmap-item`,
      method: 'PUT',
      payload: requestPayload,
      updatesKeys: Object.keys(updates),
    })

    try {
      const response = await fetch(`${API_BASE_URL}/update-roadmap-item`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      })

      console.log('🔵 [updateItem] API response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('🔴 [updateItem] API error response:', errorText)
        throw new Error(`Failed to update roadmap item: ${response.statusText}`)
      }

      const updatedItem: RoadmapItem = await response.json()
      
      // Debug logging
      console.log('🟢 [updateItem] API response received:', { 
        itemId: updatedItem.id, 
        name: updatedItem.name,
        uxFocusWeeks: updatedItem.uxFocusWeeks, 
        contentFocusWeeks: updatedItem.contentFocusWeeks,
        startDate: updatedItem.startDate,
        endDate: updatedItem.endDate,
        uxFocusWeeksType: typeof updatedItem.uxFocusWeeks,
        rawResponse: updatedItem
      })
      
      // Ensure numeric fields are numbers (Postgres NUMERIC can return as strings)
      const normalizedResponse: RoadmapItem = {
        ...updatedItem,
        uxFocusWeeks: typeof updatedItem.uxFocusWeeks === 'string' ? Number(updatedItem.uxFocusWeeks) : updatedItem.uxFocusWeeks,
        uxWorkWeeks: typeof updatedItem.uxWorkWeeks === 'string' ? Number(updatedItem.uxWorkWeeks) : updatedItem.uxWorkWeeks,
        contentFocusWeeks: typeof updatedItem.contentFocusWeeks === 'string' ? Number(updatedItem.contentFocusWeeks) : updatedItem.contentFocusWeeks,
        contentWorkWeeks: typeof updatedItem.contentWorkWeeks === 'string' ? Number(updatedItem.contentWorkWeeks) : updatedItem.contentWorkWeeks,
        priority: typeof updatedItem.priority === 'string' ? Number(updatedItem.priority) : updatedItem.priority,
      }
      
      console.log('🟡 [updateItem] Normalized response:', { 
        itemId: normalizedResponse.id, 
        uxFocusWeeks: normalizedResponse.uxFocusWeeks, 
        contentFocusWeeks: normalizedResponse.contentFocusWeeks,
        startDate: normalizedResponse.startDate,
        endDate: normalizedResponse.endDate
      })
      
      // Update state using functional update - use API response as source of truth
      setItemsBySession((prev) => {
        console.log('🟣 [updateItem] Updating state, current itemsBySession keys:', Object.keys(prev))
        
        // Find the current item from state to preserve any fields not in API response
        let currentItem: RoadmapItem | undefined
        let foundSessionId: string | undefined
        for (const [sid, items] of Object.entries(prev)) {
          const item = items.find((i) => i.id === itemId)
          if (item) {
            currentItem = item
            foundSessionId = sid
            break
          }
        }

        if (!currentItem) {
          console.error('🔴 [updateItem] Cannot update item: item not found in state', itemId)
          console.error('🔴 [updateItem] Available items:', Object.entries(prev).map(([sid, items]) => ({
            sessionId: sid,
            itemIds: items.map(i => i.id)
          })))
          return prev // No change if item not found
        }

        console.log('🟣 [updateItem] Found current item:', {
          itemId: currentItem.id,
          sessionId: foundSessionId,
          currentUxFocusWeeks: currentItem.uxFocusWeeks,
          currentContentFocusWeeks: currentItem.contentFocusWeeks,
          currentStartDate: currentItem.startDate,
          currentEndDate: currentItem.endDate
        })

        // Use API response as source of truth, but preserve any fields that might not be in response
        // (This shouldn't happen with our current API, but defensive programming)
        const finalItem = { ...currentItem, ...normalizedResponse }
        
        // Normalize to ensure all calculated fields are correct
        const normalizedItem = normalizeRoadmapItem(finalItem)
        
        console.log('🟣 [updateItem] Final normalized item:', {
          itemId: normalizedItem.id,
          uxFocusWeeks: normalizedItem.uxFocusWeeks,
          contentFocusWeeks: normalizedItem.contentFocusWeeks,
          startDate: normalizedItem.startDate,
          endDate: normalizedItem.endDate
        })
        
        // Log activity (async, but we don't await in setState callback)
        // Don't pass timestamp - let the API set it
        const sessionId = normalizedItem.planning_session_id
        const session = getSessionById(sessionId)
        const sessionName = session?.name || 'Unknown scenario'
        logActivity({
          type: 'roadmap_item_updated',
          scenarioId: sessionId,
          scenarioName: sessionName,
          description: `Updated roadmap item '${normalizedItem.name}' in scenario '${sessionName}'.`,
        }).catch((err) => {
          // Silently fail - activity logging is non-critical
          console.warn('Failed to log activity (non-critical):', err)
        })

        // Update state with normalized item - this triggers React re-render
        const updated: Record<string, RoadmapItem[]> = {}
        for (const [sid, items] of Object.entries(prev)) {
          updated[sid] = items.map((item) => {
            if (item.id === itemId) {
              console.log('🟣 [updateItem] Replacing item in state:', {
                old: { uxFocusWeeks: item.uxFocusWeeks, contentFocusWeeks: item.contentFocusWeeks },
                new: { uxFocusWeeks: normalizedItem.uxFocusWeeks, contentFocusWeeks: normalizedItem.contentFocusWeeks }
              })
              return normalizedItem
            }
            return item
          })
        }
        
        console.log('🟣 [updateItem] State update complete, new state keys:', Object.keys(updated))
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
        
        // Log activity if item was updated (non-critical, fail silently)
        if (updatedItem && sessionId) {
          const session = getSessionById(sessionId)
          const sessionName = session?.name || 'Unknown scenario'
          // Note: logActivity is async but we don't await in setState callback
          // Don't pass timestamp - let the API set it
          logActivity({
            type: 'roadmap_item_updated',
            scenarioId: sessionId,
            scenarioName: sessionName,
            description: `Updated roadmap item '${updatedItem.name}' in scenario '${sessionName}'.`,
          }).catch((err) => {
            // Silently fail - activity logging is non-critical
            console.warn('Failed to log activity (non-critical):', err)
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
