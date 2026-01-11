import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { PMIntake, ProductDesignInputs, ContentDesignInputs } from '../domain/types'

export interface ItemInputs {
  intake: PMIntake
  pd: ProductDesignInputs
  cd: ContentDesignInputs
}

interface ItemInputsContextType {
  getInputsForItem: (itemId: string) => ItemInputs | undefined
  setInputsForItem: (itemId: string, inputs: ItemInputs) => void
}

const ItemInputsContext = createContext<ItemInputsContextType | undefined>(undefined)

const STORAGE_KEY = 'designCapacity.itemInputs'

function loadInputsFromStorage(): Record<string, ItemInputs> {
  if (typeof window === 'undefined') {
    return {}
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs))
  } catch (error) {
    console.error('Error saving inputs to localStorage:', error)
  }
}

export function ItemInputsProvider({ children }: { children: ReactNode }) {
  const [inputsByItemId, setInputsByItemId] = useState<Record<string, ItemInputs>>(() =>
    loadInputsFromStorage()
  )

  // Save to localStorage whenever inputs change
  useEffect(() => {
    saveInputsToStorage(inputsByItemId)
  }, [inputsByItemId])

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
    <ItemInputsContext.Provider value={{ getInputsForItem, setInputsForItem }}>
      {children}
    </ItemInputsContext.Provider>
  )
}

export function useItemInputs() {
  const context = useContext(ItemInputsContext)
  if (context === undefined) {
    throw new Error('useItemInputs must be used within an ItemInputsProvider')
  }
  return context
}
