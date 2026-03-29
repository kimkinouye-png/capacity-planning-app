/**
 * src/services/api.ts
 * API client — validated data model v2 (March 2026)
 * All requests include x-session-id header for session isolation.
 */
import type { PlanningSession, RoadmapItem } from '../domain/types'

const API_BASE = '/.netlify/functions'

// Get session ID from localStorage (set by request-session flow)
function getSessionId(): string {
  const stored = localStorage.getItem('sessionId')
  if (!stored) {
    throw new Error('No session ID found. Ensure session is initialized before making API calls.')
  }
  return stored
}

// Standard headers for all requests
function getHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-session-id': getSessionId(),
  }
}

// Handle API responses consistently
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(error.error || `API Error: ${response.status}`)
  }
  return response.json()
}

// Hydrate date strings on scenario responses
function hydrateScenarioDates(s: PlanningSession): PlanningSession {
  return {
    ...s,
    created_at: s.created_at,
    updated_at: s.updated_at,
  }
}

export const api = {

  // ==================== SCENARIOS ====================

  async getScenarios(): Promise<PlanningSession[]> {
    const response = await fetch(`${API_BASE}/get-scenarios`, {
      headers: getHeaders(),
    })
    const data = await handleResponse<PlanningSession[]>(response)
    return data.map(hydrateScenarioDates)
  },

  async createScenario(data: {
    name: string
    planningPeriod: string
    weeks_per_period?: number
    sprint_length_weeks?: number
    ux_designers?: number
    content_designers?: number
    description?: string
  }): Promise<PlanningSession> {
    const response = await fetch(`${API_BASE}/create-scenario`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: data.name,
        planningPeriod: data.planningPeriod,
        weeks_per_period: data.weeks_per_period ?? 13,
        sprint_length_weeks: data.sprint_length_weeks ?? 2,
        ux_designers: data.ux_designers ?? 0,
        content_designers: data.content_designers ?? 0,
        description: data.description,
      }),
    })
    const scenario = await handleResponse<PlanningSession>(response)
    return hydrateScenarioDates(scenario)
  },

  async updateScenario(data: Partial<PlanningSession> & { id: string }): Promise<PlanningSession> {
    const response = await fetch(`${API_BASE}/update-scenario`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    const scenario = await handleResponse<PlanningSession>(response)
    return hydrateScenarioDates(scenario)
  },

  async deleteScenario(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/delete-scenario`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ id }),
    })
    return handleResponse<{ success: boolean }>(response)
  },

  async duplicateScenario(id: string, name?: string): Promise<PlanningSession> {
    const response = await fetch(`${API_BASE}/duplicate-scenario`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ id, name }),
    })
    const scenario = await handleResponse<PlanningSession>(response)
    return hydrateScenarioDates(scenario)
  },

  // ==================== ROADMAP ITEMS ====================

  async getRoadmapItems(scenarioId: string): Promise<RoadmapItem[]> {
    const response = await fetch(
      `${API_BASE}/get-roadmap-items?scenarioId=${scenarioId}`,
      { headers: getHeaders() }
    )
    return handleResponse<RoadmapItem[]>(response)
  },

  async createRoadmapItem(data: {
    scenario_id: string
    short_key: string
    name: string
    initiative?: string
    priority?: 'P0' | 'P1' | 'P2' | 'P3'
    status?: RoadmapItem['status']
    projectType?: RoadmapItem['projectType']
    notes?: string
  }): Promise<RoadmapItem> {
    const response = await fetch(`${API_BASE}/create-roadmap-item`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        scenario_id: data.scenario_id,
        short_key: data.short_key,
        name: data.name,
        initiative: data.initiative,
        priority: data.priority ?? 'P2',
        status: data.status ?? 'draft',
        project_type: data.projectType,
        notes: data.notes,
      }),
    })
    return handleResponse<RoadmapItem>(response)
  },

  async updateRoadmapItem(data: Partial<RoadmapItem> & { id: string }): Promise<RoadmapItem> {
    const response = await fetch(`${API_BASE}/update-roadmap-item`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        id: data.id,
        short_key: data.short_key,
        name: data.name,
        initiative: data.initiative,
        priority: data.priority,
        status: data.status,
        project_type: data.projectType,
        notes: data.notes,
        uxFocusWeeks: data.uxFocusWeeks,
        contentFocusWeeks: data.contentFocusWeeks,
        uxWorkWeeks: data.uxWorkWeeks,
        contentWorkWeeks: data.contentWorkWeeks,
        ux_size: data.uxSizeBand,
        content_size: data.contentSizeBand,
        startDate: data.startDate,
        endDate: data.endDate,
      }),
    })
    return handleResponse<RoadmapItem>(response)
  },

  async deleteRoadmapItem(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE}/delete-roadmap-item`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ id }),
    })
    return handleResponse<{ success: boolean }>(response)
  },

  async bulkImportRoadmapItems(data: {
    scenarioId: string
    source: 'csv' | 'paste' | 'manual'
    raw?: string
    items?: Array<{
      key: string
      name: string
      priority?: 'P0' | 'P1' | 'P2' | 'P3'
      projectType?: string
      notes?: string
      initiative?: string
    }>
  }): Promise<{ imported: number; items: RoadmapItem[] }> {
    const response = await fetch(`${API_BASE}/bulk-import-roadmap-items`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        scenario_id: data.scenarioId,
        source: data.source,
        raw: data.raw,
        items: data.items,
      }),
    })
    return handleResponse<{ imported: number; items: RoadmapItem[] }>(response)
  },

  // ==================== SETTINGS ====================

  async getSettings() {
    const response = await fetch(`${API_BASE}/get-settings`, {
      headers: { 'Content-Type': 'application/json' },
    })
    return handleResponse<Record<string, unknown>>(response)
  },

  async updateSettings(data: Record<string, unknown>) {
    const response = await fetch(`${API_BASE}/update-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return handleResponse<Record<string, unknown>>(response)
  },
}
