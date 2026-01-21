/**
 * Shared types for Netlify Functions
 * These types ensure consistency between database schema and API responses
 */

import type { PlanningSession, PlanningPeriod, RoadmapItem, PMIntake, ProductDesignInputs, ContentDesignInputs } from '../../src/domain/types'

/**
 * Database representation of a scenario (matches schema.sql)
 */
export interface DatabaseScenario {
  id: string
  title: string
  quarter: string // e.g., "2026-Q1"
  year: number
  committed: boolean
  ux_designers: number
  content_designers: number
  weeks_per_period: number
  sprint_length_weeks: number
  created_at: string
  updated_at: string
}

/**
 * API request for creating a scenario
 */
export interface CreateScenarioRequest {
  name: string
  planning_period?: string
  planningPeriod?: PlanningPeriod
  weeks_per_period?: number
  sprint_length_weeks?: number
  ux_designers?: number
  content_designers?: number
}

/**
 * API request for updating a scenario
 */
export interface UpdateScenarioRequest {
  id: string
  name?: string
  planning_period?: string
  planningPeriod?: PlanningPeriod
  weeks_per_period?: number
  sprint_length_weeks?: number
  ux_designers?: number
  content_designers?: number
  status?: 'draft' | 'committed'
  isCommitted?: boolean
}

/**
 * API response for scenarios (always returns PlanningSession format)
 */
export type ScenarioResponse = PlanningSession

/**
 * API error response
 */
export interface ErrorResponse {
  error: string
  details?: string
}

/**
 * Helper to transform database format to PlanningSession format
 */
export function dbScenarioToPlanningSession(db: DatabaseScenario): PlanningSession {
  return {
    id: db.id,
    name: db.title,
    planning_period: db.quarter,
    planningPeriod: db.quarter as PlanningPeriod,
    weeks_per_period: db.weeks_per_period,
    sprint_length_weeks: db.sprint_length_weeks,
    ux_designers: db.ux_designers,
    content_designers: db.content_designers,
    status: db.committed ? 'committed' : 'draft',
    isCommitted: db.committed,
    created_at: db.created_at,
    updated_at: db.updated_at,
  }
}

/**
 * Helper to transform PlanningSession format to database format
 */
export function planningSessionToDbFormat(session: Partial<PlanningSession>): Partial<DatabaseScenario> {
  const db: Partial<DatabaseScenario> = {}
  
  if (session.name !== undefined) db.title = session.name
  if (session.planningPeriod !== undefined || session.planning_period !== undefined) {
    db.quarter = session.planningPeriod || session.planning_period || ''
    // Extract year from quarter
    const quarter = session.planningPeriod || session.planning_period
    if (quarter) {
      const yearMatch = quarter.match(/^(\d{4})-/)
      db.year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear()
    }
  }
  if (session.weeks_per_period !== undefined) db.weeks_per_period = session.weeks_per_period
  if (session.sprint_length_weeks !== undefined) db.sprint_length_weeks = session.sprint_length_weeks
  if (session.ux_designers !== undefined) db.ux_designers = session.ux_designers
  if (session.content_designers !== undefined) db.content_designers = session.content_designers
  if (session.status !== undefined) {
    db.committed = session.status === 'committed'
  } else if (session.isCommitted !== undefined) {
    db.committed = session.isCommitted
  }
  
  return db
}

/**
 * Database representation of a roadmap item (matches schema.sql)
 */
export interface DatabaseRoadmapItem {
  id: string
  scenario_id: string
  key: string // Maps to short_key in frontend
  name: string
  initiative: string | null
  priority: number | null
  status: string // 'draft' | 'ready_for_sizing' | 'sized' | 'locked'
  pm_intake: PMIntake | null // JSONB
  ux_factors: ProductDesignInputs | null // JSONB
  content_factors: ContentDesignInputs | null // JSONB
  ux_score: number | null
  content_score: number | null
  ux_size: string | null // 'XS' | 'S' | 'M' | 'L' | 'XL'
  content_size: string | null // 'XS' | 'S' | 'M' | 'L' | 'XL'
  ux_focus_weeks: number | null
  content_focus_weeks: number | null
  ux_work_weeks: number | null
  content_work_weeks: number | null
  created_at: string
  updated_at: string
}

/**
 * API request for creating a roadmap item
 */
export interface CreateRoadmapItemRequest {
  scenario_id: string // Maps to planning_session_id in frontend
  short_key: string // Maps to key in DB
  name: string
  initiative?: string
  priority?: number
  status?: 'draft' | 'ready_for_sizing' | 'sized' | 'locked'
  pm_intake?: PMIntake
  ux_factors?: ProductDesignInputs
  content_factors?: ContentDesignInputs
}

/**
 * API request for updating a roadmap item
 */
export interface UpdateRoadmapItemRequest {
  id: string
  short_key?: string
  name?: string
  initiative?: string
  priority?: number
  status?: 'draft' | 'ready_for_sizing' | 'sized' | 'locked'
  pm_intake?: PMIntake
  ux_factors?: ProductDesignInputs
  content_factors?: ContentDesignInputs
  ux_score?: number
  content_score?: number
  ux_size?: 'XS' | 'S' | 'M' | 'L' | 'XL'
  content_size?: 'XS' | 'S' | 'M' | 'L' | 'XL'
  ux_focus_weeks?: number
  content_focus_weeks?: number
  ux_work_weeks?: number
  content_work_weeks?: number
}

/**
 * API response for roadmap items (always returns RoadmapItem format)
 */
export type RoadmapItemResponse = RoadmapItem

/**
 * Map size band to focus weeks (used when focus weeks are missing from DB)
 * This matches the calculation in src/config/effortModel.ts
 */
function mapSizeBandToFocusWeeks(sizeBand: string | null): number {
  switch (sizeBand) {
    case 'XS': return 0.5
    case 'S': return 1.5
    case 'M': return 3.0
    case 'L': return 5.0
    case 'XL': return 8.0
    default: return 3.0
  }
}

/**
 * Helper to transform database format to RoadmapItem format
 * If focus weeks are null in the database but size bands exist, calculate them from size bands
 */
export function dbRoadmapItemToRoadmapItemResponse(db: DatabaseRoadmapItem): RoadmapItemResponse {
  const uxSizeBand = (db.ux_size as RoadmapItem['uxSizeBand']) || 'M'
  const contentSizeBand = (db.content_size as RoadmapItem['contentSizeBand']) || 'M'
  
  // Calculate focus weeks from size band if they're null in the database
  const uxFocusWeeks = db.ux_focus_weeks !== null && db.ux_focus_weeks !== undefined
    ? db.ux_focus_weeks
    : mapSizeBandToFocusWeeks(uxSizeBand)
  
  const contentFocusWeeks = db.content_focus_weeks !== null && db.content_focus_weeks !== undefined
    ? db.content_focus_weeks
    : mapSizeBandToFocusWeeks(contentSizeBand)
  
  // Calculate work weeks if they're missing (work weeks = focus weeks / 0.75)
  const focusTimeRatio = 0.75
  const uxWorkWeeks = db.ux_work_weeks !== null && db.ux_work_weeks !== undefined
    ? db.ux_work_weeks
    : Number((uxFocusWeeks / focusTimeRatio).toFixed(1))
  
  const contentWorkWeeks = db.content_work_weeks !== null && db.content_work_weeks !== undefined
    ? db.content_work_weeks
    : Number((contentFocusWeeks / focusTimeRatio).toFixed(1))
  
  return {
    id: db.id,
    planning_session_id: db.scenario_id,
    short_key: db.key,
    name: db.name,
    initiative: db.initiative || '',
    priority: db.priority || 0,
    status: (db.status as RoadmapItem['status']) || 'draft',
    uxSizeBand,
    uxFocusWeeks,
    uxWorkWeeks,
    contentSizeBand,
    contentFocusWeeks,
    contentWorkWeeks,
  }
}

/**
 * Helper to transform RoadmapItem format to database format
 */
export function roadmapItemToDbFormat(item: Partial<RoadmapItem>): Partial<DatabaseRoadmapItem> {
  const db: Partial<DatabaseRoadmapItem> = {}
  
  if (item.planning_session_id !== undefined) db.scenario_id = item.planning_session_id
  if (item.short_key !== undefined) db.key = item.short_key
  if (item.name !== undefined) db.name = item.name
  if (item.initiative !== undefined) db.initiative = item.initiative || null
  if (item.priority !== undefined) db.priority = item.priority ?? null
  if (item.status !== undefined) db.status = item.status
  if (item.uxSizeBand !== undefined) db.ux_size = item.uxSizeBand
  if (item.contentSizeBand !== undefined) db.content_size = item.contentSizeBand
  if (item.uxFocusWeeks !== undefined) db.ux_focus_weeks = item.uxFocusWeeks
  if (item.contentFocusWeeks !== undefined) db.content_focus_weeks = item.contentFocusWeeks
  if (item.uxWorkWeeks !== undefined) db.ux_work_weeks = item.uxWorkWeeks
  if (item.contentWorkWeeks !== undefined) db.content_work_weeks = item.contentWorkWeeks
  
  return db
}

/**
 * Helper to transform CreateRoadmapItemRequest to database format
 */
export function createRoadmapItemRequestToDbFormat(req: CreateRoadmapItemRequest): Partial<DatabaseRoadmapItem> {
  const db: Partial<DatabaseRoadmapItem> = {
    scenario_id: req.scenario_id,
    key: req.short_key,
    name: req.name,
    initiative: req.initiative || null,
    priority: req.priority ?? null,
    status: req.status || 'draft',
    pm_intake: req.pm_intake || null,
    ux_factors: req.ux_factors || null,
    content_factors: req.content_factors || null,
  }
  
  return db
}

/**
 * Standardized error response helper
 * Ensures consistent error response shape across all functions
 */
export function errorResponse(
  statusCode: number,
  message: string,
  details?: string
): {
  statusCode: number
  headers: Record<string, string>
  body: string
} {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      error: message,
      ...(details && { details }),
    }),
  }
}

/**
 * UUID validation helper
 * Validates that a string is a valid UUID format
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Planning period format validation helper
 * Validates that a string matches the expected format: YYYY-QN (e.g., "2026-Q1")
 */
export function isValidPlanningPeriod(period: string): boolean {
  const quarterPattern = /^(\d{4})-Q([1-4])$/
  return quarterPattern.test(period)
}
