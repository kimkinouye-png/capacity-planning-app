import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { RoadmapItem, PMIntake, ProductDesignInputs, ContentDesignInputs } from '../domain/types'

interface ItemInputs {
  intake: PMIntake
  pd: ProductDesignInputs
  cd: ContentDesignInputs
}

interface RoadmapItemsContextType {
  getItemsForSession: (sessionId: string) => RoadmapItem[]
  createItem: (
    sessionId: string,
    input: Omit<RoadmapItem, 'id' | 'planning_session_id' | 'status'>
  ) => RoadmapItem
  updateItem: (id: string, patch: Partial<RoadmapItem>) => void
  getInputsForItem: (itemId: string) => ItemInputs | undefined
  setInputsForItem: (itemId: string, inputs: ItemInputs) => void
}

const RoadmapItemsContext = createContext<RoadmapItemsContextType | undefined>(undefined)

const ITEMS_STORAGE_KEY = 'designCapacity.items'
const INPUTS_STORAGE_KEY = 'designCapacity.inputs'

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
  // Store items as a map: planning_session_id -> RoadmapItem[]
  const [itemsBySession, setItemsBySession] = useState<Record<string, RoadmapItem[]>>(() =>
    loadItemsFromStorage()
  )
  // Store inputs as a map: itemId -> { intake, pd, cd }
  const [inputsByItemId, setInputsByItemId] = useState<Record<string, ItemInputs>>(() =>
    loadInputsFromStorage()
  )

  // Save to localStorage whenever items or inputs change
  useEffect(() => {
    saveItemsToStorage(itemsBySession)
  }, [itemsBySession])

  useEffect(() => {
    saveInputsToStorage(inputsByItemId)
  }, [inputsByItemId])

  const getItemsForSession = useCallback(
    (sessionId: string): RoadmapItem[] => {
      return itemsBySession[sessionId] || []
    },
    [itemsBySession]
  )

  const createItem = useCallback(
    (
      sessionId: string,
      input: Omit<RoadmapItem, 'id' | 'planning_session_id' | 'status'>
    ): RoadmapItem => {
      const newItem: RoadmapItem = {
        ...input,
        id: crypto.randomUUID(),
        planning_session_id: sessionId,
        status: 'draft',
      }
      setItemsBySession((prev) => ({
        ...prev,
        [sessionId]: [...(prev[sessionId] || []), newItem],
      }))
      return newItem
    },
    []
  )

  const updateItem = useCallback((itemId: string, updates: Partial<RoadmapItem>) => {
    setItemsBySession((prev) => {
      const updated: Record<string, RoadmapItem[]> = {}
      for (const [sessionId, items] of Object.entries(prev)) {
        updated[sessionId] = items.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      }
      return updated
    })
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
      value={{ getItemsForSession, createItem, updateItem, getInputsForItem, setInputsForItem }}
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
