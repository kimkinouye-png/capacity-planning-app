import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export interface EffortModelSettings {
  ux: Record<string, number>
  content: Record<string, number>
  pmIntakeMultiplier: number
}

export interface TimeModelSettings {
  focusTimeRatio: number
}

export interface SizeBandSettings {
  xs: number
  s: number
  m: number
  l: number
  xl: number
}

export interface Settings {
  id: string
  effort_model: EffortModelSettings
  time_model: TimeModelSettings
  size_bands: SizeBandSettings
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

const DEFAULT_SETTINGS: Settings = {
  id: '00000000-0000-0000-0000-000000000000',
  effort_model: {
    ux: {
      productRisk: 1.2,
      problemAmbiguity: 1.0,
      discoveryDepth: 0.9,
    },
    content: {
      contentSurfaceArea: 1.3,
      localizationScope: 1.0,
      regulatoryBrandRisk: 1.2,
      legalComplianceDependency: 1.1,
    },
    pmIntakeMultiplier: 1.0,
  },
  time_model: {
    focusTimeRatio: 0.75,
  },
  size_bands: {
    xs: 1.6,
    s: 2.6,
    m: 3.6,
    l: 4.6,
    xl: 5.0,
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
          setSettings(data)
          // Also store in localStorage as fallback
          localStorage.setItem('designCapacity.settings', JSON.stringify(data))
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
          setSettings(parsed)
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
          return
        } else {
          throw new Error(`API returned ${response.status}`)
        }
      } catch (apiError) {
        console.warn('Failed to save settings to API, falling back to localStorage:', apiError)
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
