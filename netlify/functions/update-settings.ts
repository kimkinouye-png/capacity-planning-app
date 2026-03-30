/**
 * update-settings — PUT update global settings.
 * NEON: getDatabaseConnectionForWrites() → NETLIFY_DATABASE_URL, @neondatabase/serverless.
 * DATA: Updates the single settings row by fixed id. No session_id; all visitors share one
 * settings row.
 * Updated to match validated data model v2 (March 2026).
 */
import { Handler } from '@netlify/functions'
import { getDatabaseConnectionForWrites } from './db-connection'
import { errorResponse } from './types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'PUT, OPTIONS',
}

interface UpdateSettingsRequest {
  effort_weights?: {
    productRisk?: number // 1-10
    problemAmbiguity?: number // 1-10
    contentSurface?: number // 1-10
    localizationScope?: number // 1-10
  }
  effort_model_enabled?: boolean
  workstream_impact_enabled?: boolean
  workstream_penalty?: number // 0-1
  focus_time_ratio?: number // 0.4-0.9
  planning_periods?: Record<string, {
    baseWeeks: number
    holidays: number
    pto: number
    focusWeeks: number
  }>
  size_band_thresholds?: {
    xs?: { min: number; max?: number }
    s?: { min: number; max?: number }
    m?: { min: number; max?: number }
    l?: { min: number; max?: number }
    xl?: { min: number }
  }
  project_type_demand?: Record<string, {
    ux: string
    content: string
  }>
}

const VALID_PROJECT_TYPES = ['net-new', 'new-feature', 'enhancement', 'optimization', 'fix-polish']

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'PUT') {
    return errorResponse(405, 'Method not allowed')
  }

  try {
    const sql = await getDatabaseConnectionForWrites()

    let body: UpdateSettingsRequest
    try {
      body = JSON.parse(event.body || '{}')
    } catch {
      return errorResponse(400, 'Invalid JSON in request body')
    }

    if (body.focus_time_ratio !== undefined) {
      const ratio = body.focus_time_ratio
      if (typeof ratio !== 'number' || ratio < 0.4 || ratio > 0.9) {
        return errorResponse(400, 'focus_time_ratio must be between 0.4 and 0.9')
      }
    }

    if (body.effort_weights) {
      const weights = body.effort_weights
      for (const [key, val] of Object.entries(weights)) {
        if (val !== undefined && (typeof val !== 'number' || val < 1 || val > 10)) {
          return errorResponse(400, `effort_weights.${key} must be a number between 1 and 10`)
        }
      }
    }

    if (body.project_type_demand) {
      for (const key of Object.keys(body.project_type_demand)) {
        if (!VALID_PROJECT_TYPES.includes(key)) {
          return errorResponse(400, `Invalid project_type_demand key: ${key}. Must be one of: ${VALID_PROJECT_TYPES.join(', ')}`)
        }
      }
    }

    if (body.planning_periods) {
      for (const [key, period] of Object.entries(body.planning_periods)) {
        if (typeof period.baseWeeks !== 'number' || period.baseWeeks < 1) {
          return errorResponse(400, `planning_periods.${key}.baseWeeks must be a positive number`)
        }
        if (typeof period.holidays !== 'number' || period.holidays < 0) {
          return errorResponse(400, `planning_periods.${key}.holidays must be a non-negative number`)
        }
        if (typeof period.pto !== 'number' || period.pto < 0) {
          return errorResponse(400, `planning_periods.${key}.pto must be a non-negative number`)
        }
        if (typeof period.focusWeeks !== 'number' || period.focusWeeks < 0) {
          return errorResponse(400, `planning_periods.${key}.focusWeeks must be a non-negative number`)
        }
      }
    }

    const result = (await sql`
      UPDATE settings
      SET
        effort_weights = COALESCE(
          ${body.effort_weights ? JSON.stringify(body.effort_weights) : null}::jsonb,
          effort_weights
        ),
        effort_model_enabled = COALESCE(
          ${body.effort_model_enabled ?? null},
          effort_model_enabled
        ),
        workstream_impact_enabled = COALESCE(
          ${body.workstream_impact_enabled ?? null},
          workstream_impact_enabled
        ),
        workstream_penalty = COALESCE(
          ${body.workstream_penalty ?? null},
          workstream_penalty
        ),
        focus_time_ratio = COALESCE(
          ${body.focus_time_ratio ?? null},
          focus_time_ratio
        ),
        planning_periods = COALESCE(
          ${body.planning_periods ? JSON.stringify(body.planning_periods) : null}::jsonb,
          planning_periods
        ),
        size_band_thresholds = COALESCE(
          ${body.size_band_thresholds ? JSON.stringify(body.size_band_thresholds) : null}::jsonb,
          size_band_thresholds
        ),
        project_type_demand = COALESCE(
          ${body.project_type_demand ? JSON.stringify(body.project_type_demand) : null}::jsonb,
          project_type_demand
        ),
        updated_at = NOW()
      WHERE id = '00000000-0000-0000-0000-000000000000'
      RETURNING 
        id,
        effort_weights,
        effort_model_enabled,
        workstream_impact_enabled,
        workstream_penalty,
        focus_time_ratio,
        planning_periods,
        size_band_thresholds,
        project_type_demand,
        created_at,
        updated_at
    `) as Record<string, unknown>[]

    if (result.length === 0) {
      return errorResponse(404, 'Settings not found')
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(result[0]),
    }
  } catch (error) {
    console.error('Error updating settings:', error)
    return errorResponse(500, 'Failed to update settings', error instanceof Error ? error.message : 'Unknown error')
  }
}
