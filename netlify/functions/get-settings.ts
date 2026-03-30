/**
 * get-settings — GET global settings (single row).
 * NEON: getDatabaseConnection() → NETLIFY_DATABASE_URL, @neondatabase/serverless.
 * DATA: Single row by fixed id (00000000-0000-0000-0000-000000000000). No user/session;
 * all visitors share the same settings.
 * Updated to match validated data model v2 (March 2026).
 */
import { Handler } from '@netlify/functions'
import { getDatabaseConnection } from './db-connection'
import { errorResponse } from './types'

interface SettingsResponse {
  id: string
  effort_weights: {
    productRisk: number
    problemAmbiguity: number
    contentSurface: number
    localizationScope: number
  }
  effort_model_enabled: boolean
  workstream_impact_enabled: boolean
  workstream_penalty: number
  focus_time_ratio: number
  planning_periods: Record<string, {
    baseWeeks: number
    holidays: number
    pto: number
    focusWeeks: number
  }>
  size_band_thresholds: {
    xs: { min: number; max?: number }
    s: { min: number; max?: number }
    m: { min: number; max?: number }
    l: { min: number; max?: number }
    xl: { min: number; max?: number }
  }
  project_type_demand: Record<string, {
    ux: string
    content: string
  }>
  created_at: string
  updated_at: string
}

const DEFAULT_SETTINGS = {
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
    'Q2_26': { baseWeeks: 13, holidays: 10, pto: 5, focusWeeks: 7.5 },
    'Q3_26': { baseWeeks: 13, holidays: 10, pto: 5, focusWeeks: 7.5 },
    'Q4_26': { baseWeeks: 13, holidays: 10, pto: 5, focusWeeks: 7.5 },
    'Q1_27': { baseWeeks: 13, holidays: 10, pto: 5, focusWeeks: 7.5 },
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
    'enhancement': { ux: 'M', content: 'S' },
    'optimization': { ux: 'S', content: 'XS' },
    'fix-polish': { ux: 'XS', content: 'XS' },
  },
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

function parseJsonb<T>(value: unknown): T {
  if (value == null) return value as T
  if (typeof value === 'string') return JSON.parse(value) as T
  return value as T
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return errorResponse(405, 'Method not allowed')
  }

  try {
    const sql = await getDatabaseConnection()

    const result = (await sql`
      SELECT 
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
      FROM settings
      WHERE id = '00000000-0000-0000-0000-000000000000'
      LIMIT 1
    `) as Record<string, unknown>[]

    let dbRow: Record<string, unknown>

    if (result.length === 0) {
      const inserted = (await sql`
        INSERT INTO settings (
          id,
          effort_weights,
          effort_model_enabled,
          workstream_impact_enabled,
          workstream_penalty,
          focus_time_ratio,
          planning_periods,
          size_band_thresholds,
          project_type_demand
        ) VALUES (
          '00000000-0000-0000-0000-000000000000',
          ${JSON.stringify(DEFAULT_SETTINGS.effort_weights)}::jsonb,
          ${DEFAULT_SETTINGS.effort_model_enabled},
          ${DEFAULT_SETTINGS.workstream_impact_enabled},
          ${DEFAULT_SETTINGS.workstream_penalty},
          ${DEFAULT_SETTINGS.focus_time_ratio},
          ${JSON.stringify(DEFAULT_SETTINGS.planning_periods)}::jsonb,
          ${JSON.stringify(DEFAULT_SETTINGS.size_band_thresholds)}::jsonb,
          ${JSON.stringify(DEFAULT_SETTINGS.project_type_demand)}::jsonb
        )
        RETURNING *
      `) as Record<string, unknown>[]
      dbRow = inserted[0]
    } else {
      dbRow = result[0]
    }

    const settings: SettingsResponse = {
      id: String(dbRow.id),
      effort_weights: parseJsonb(dbRow.effort_weights),
      effort_model_enabled: Boolean(dbRow.effort_model_enabled),
      workstream_impact_enabled: Boolean(dbRow.workstream_impact_enabled),
      workstream_penalty: Number(dbRow.workstream_penalty),
      focus_time_ratio: Number(dbRow.focus_time_ratio),
      planning_periods: parseJsonb(dbRow.planning_periods),
      size_band_thresholds: parseJsonb(dbRow.size_band_thresholds),
      project_type_demand: parseJsonb(dbRow.project_type_demand),
      created_at: String(dbRow.created_at),
      updated_at: String(dbRow.updated_at),
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
    return errorResponse(500, 'Failed to fetch settings', error instanceof Error ? error.message : 'Unknown error')
  }
}
