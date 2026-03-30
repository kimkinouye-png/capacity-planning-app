/**
 * SettingsContext — Loads/saves global settings via Netlify Functions (get-settings, update-settings).
 * No sessionId or visitor id sent; single shared settings row for all visitors. Initial load: loadSettings()
 * in provider. For per-visitor isolation: either keep global settings or add sessionId to API and
 * backend settings table and filter by it.
 */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export interface Settings {
  id: string
  // New fields
  effort_weights: {
    productRisk: number // 1-10 integer
    problemAmbiguity: number // 1-10 integer
    contentSurface: number // 1-10 integer
    localizationScope: number // 1-10 integer
  }
  effort_model_enabled: boolean
  workstream_impact_enabled: boolean
  workstream_penalty: number // 0-1 decimal e.g. 0.10
  focus_time_ratio: number // 0-1 decimal e.g. 0.75
  planning_periods: {
    [quarter: string]: {
      baseWeeks: number
      holidays: number
      pto: number
      focusWeeks: number // calculated, read-only
    }
  }
  size_band_thresholds: {
    xs: { min: number; max?: number }
    s: { min: number; max?: number }
    m: { min: number; max?: number }
    l: { min: number; max?: number }
    xl: { min: number; max?: number }
  }
  project_type_demand: {
    [projectType: string]: {
      ux: 'XS' | 'S' | 'M' | 'L' | 'XL'
      content: 'XS' | 'S' | 'M' | 'L' | 'XL'
    }
  }
  // Hidden legacy fields — keep in interface but do not
  // use in UI. These are preserved in DB for backlog.
  effort_model?: Record<string, unknown>
  time_model?: Record<string, unknown>
  size_bands?: Record<string, unknown>
  created_at: string
  updated_at: string
}

interface SettingsContextType {
  settings: Settings | null
  loading: boolean
  error: string | null
  loadSettings: () => Promise<void>
  saveSettings: (updates: Partial<Settings>) => Promise<void>
  resetToDefaults: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions'

export const DEFAULT_SETTINGS: Settings = {
  id: '00000000-0000-0000-0000-000000000000',
  effort_weights: {
    productRisk: 4,
    problemAmbiguity: 5,
    contentSurface: 5,
    localizationScope: 5,
  },
  effort_model_enabled: true,
  workstream_impact_enabled: true,
  workstream_penalty: 0.10,
  focus_time_ratio: 0.75,
  planning_periods: {
    Q2_26: { baseWeeks: 13, holidays: 10, pto: 5, focusWeeks: 7.5 },
    Q3_26: { baseWeeks: 13, holidays: 10, pto: 5, focusWeeks: 7.5 },
    Q4_26: { baseWeeks: 13, holidays: 10, pto: 5, focusWeeks: 7.5 },
    Q1_27: { baseWeeks: 13, holidays: 10, pto: 5, focusWeeks: 7.5 },
  },
  size_band_thresholds: {
    xs: { min: 0, max: 2 },
    s: { min: 2, max: 4 },
    m: { min: 4, max: 8 },
    l: { min: 8, max: 12 },
    xl: { min: 12 },
  },
  project_type_demand: {
    'net-new': { ux: 'XL', content: 'XL' },
    'new-feature': { ux: 'L', content: 'L' },
    enhancement: { ux: 'M', content: 'S' },
    optimization: { ux: 'S', content: 'XS' },
    'fix-polish': { ux: 'XS', content: 'XS' },
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to load from API first
      try {
        const response = await fetch(`${API_BASE_URL}/get-settings`)
        if (response.ok) {
          const data = await response.json()
          const coerced = {
            ...data,
            focus_time_ratio: Number(data.focus_time_ratio ?? DEFAULT_SETTINGS.focus_time_ratio),
            workstream_penalty: Number(data.workstream_penalty ?? DEFAULT_SETTINGS.workstream_penalty),
          }
          setSettings(coerced)
          localStorage.setItem('designCapacity.settings', JSON.stringify(coerced))
          return
        }
      } catch (apiError) {
        console.warn('Failed to load settings from API, falling back to localStorage:', apiError)
      }

      // Fallback to localStorage
      const stored = localStorage.getItem('designCapacity.settings')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          const coerced = {
            ...parsed,
            focus_time_ratio: Number(parsed.focus_time_ratio ?? DEFAULT_SETTINGS.focus_time_ratio),
            workstream_penalty: Number(parsed.workstream_penalty ?? DEFAULT_SETTINGS.workstream_penalty),
          }
          setSettings(coerced)
        } catch (parseError) {
          console.error('Failed to parse stored settings:', parseError)
          setSettings(DEFAULT_SETTINGS)
        }
      } else {
        setSettings(DEFAULT_SETTINGS)
      }
    } catch (err) {
      console.error('Error loading settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to load settings')
      setSettings(DEFAULT_SETTINGS)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveSettings = useCallback(async (updates: Partial<Settings>) => {
    if (!settings) return

    try {
      setError(null)

      const updatedSettings = {
        ...settings,
        ...updates,
        updated_at: new Date().toISOString(),
      }

      // Try to save to API first
      try {
        const response = await fetch(`${API_BASE_URL}/update-settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        })

        if (response.ok) {
          const data = await response.json()
          setSettings(data)
          // Also store in localStorage as fallback
          localStorage.setItem('designCapacity.settings', JSON.stringify(data))
          // Clear error on successful save
          setError(null)
          return
        } else {
          // Try to extract error message from response body
          let errorMessage = `API returned ${response.status}`
          try {
            const errorData = await response.json()
            if (errorData.error) {
              errorMessage = errorData.error
            }
          } catch (parseError) {
            // If response isn't JSON, use status text or default message
            errorMessage = response.statusText || errorMessage
          }
          throw new Error(errorMessage)
        }
      } catch (apiError) {
        console.warn('Failed to save settings to API, falling back to localStorage:', apiError)
        // Set error state so users know API save failed
        const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error'
        setError(`Settings saved locally but not synced to database: ${errorMessage}. Check your connection.`)
      }

      // Fallback to localStorage
      setSettings(updatedSettings)
      localStorage.setItem('designCapacity.settings', JSON.stringify(updatedSettings))
    } catch (err) {
      console.error('Error saving settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to save settings')
      throw err
    }
  }, [settings])

  const resetToDefaults = useCallback(async () => {
    await saveSettings(DEFAULT_SETTINGS)
  }, [saveSettings])

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        loadSettings,
        saveSettings,
        resetToDefaults,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
