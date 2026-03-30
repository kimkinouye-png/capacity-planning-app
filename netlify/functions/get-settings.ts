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
  effort_model: {
    effortWeights: {
      productRisk: number
      problemAmbiguity: number
      contentSurface: number
      localizationScope: number
    }
    effortModelEnabled: boolean
    projectTypeDemand: Record<string, {
      uxBaseWeeks: number
      contentBaseWeeks: number
    }>
  }
  time_model: {
    focusTimeRatio: number
    planningPeriods: Record<string, {
      baseWeeks: number
      holidays: number
      pto: number
    }>
  }
  size_bands: {
    xs: { min: number; max: number }
    s:  { min: number; max: number }
    m:  { min: number; max: number }
    l:  { min: number; max: number }
    xl: { min: number }
  }
  created_at: string
  updated_at: string
}

const DEFAULT_SETTINGS = {
  effort_model: {
    effortWeights: {
      productRisk: 4,
      problemAmbiguity: 5,
      contentSurface: 5,
      localizationScope: 5,
    },
    effortModelEnabled: true,
    projectTypeDemand: {
      'net-new':      { uxBaseWeeks: 12.0, contentBaseWeeks: 12.0 },
      'new-feature':  { uxBaseWeeks: 8.0,  contentBaseWeeks: 8.0  },
      'enhancement':  { uxBaseWeeks: 4.0,  contentBaseWeeks: 2.0  },
      'optimization': { uxBaseWeeks: 2.0,  contentBaseWeeks: 1.0  },
      'fix-polish':   { uxBaseWeeks: 1.0,  contentBaseWeeks: 1.0  },
    },
  },
  time_model: {
    focusTimeRatio: 0.75,
    planningPeriods: {
      'Q2_26': { baseWeeks: 13, holidays: 10, pto: 5 },
      'Q3_26': { baseWeeks: 13, holidays: 10, pto: 5 },
      'Q4_26': { baseWeeks: 13, holidays: 10, pto: 5 },
      'Q1_27': { baseWeeks: 13, holidays: 10, pto: 5 },
    },
  },
  size_bands: {
    xs: { min: 0,  max: 2  },
    s:  { min: 2,  max: 4  },
    m:  { min: 4,  max: 8  },
    l:  { min: 8,  max: 12 },
    xl: { min: 12 },
  },
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
      SELECT * FROM settings
      WHERE id = '00000000-0000-0000-0000-000000000000'
      LIMIT 1
    `) as Record<string, any>[]

    let dbRow: any

    if (result.length === 0) {
      // Create default settings if missing
      const inserted = (await sql`
        INSERT INTO settings (id, effort_model, time_model, size_bands)
        VALUES (
          '00000000-0000-0000-0000-000000000000',
          ${JSON.stringify(DEFAULT_SETTINGS.effort_model)}::jsonb,
          ${JSON.stringify(DEFAULT_SETTINGS.time_model)}::jsonb,
          ${JSON.stringify(DEFAULT_SETTINGS.size_bands)}::jsonb
        )
        RETURNING *
      `) as Record<string, any>[]
      dbRow = inserted[0]
    } else {
      dbRow = result[0]
    }

    const settings: SettingsResponse = {
      id: dbRow.id,
      effort_model: typeof dbRow.effort_model === 'string'
        ? JSON.parse(dbRow.effort_model)
        : dbRow.effort_model,
      time_model: typeof dbRow.time_model === 'string'
        ? JSON.parse(dbRow.time_model)
        : dbRow.time_model,
      size_bands: typeof dbRow.size_bands === 'string'
        ? JSON.parse(dbRow.size_bands)
        : dbRow.size_bands,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
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
