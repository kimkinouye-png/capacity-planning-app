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
  effort_model?: {
    effortWeights?: {
      productRisk?: number        // 1-10
      problemAmbiguity?: number   // 1-10
      contentSurface?: number     // 1-10
      localizationScope?: number  // 1-10
    }
    effortModelEnabled?: boolean
    projectTypeDemand?: Record<string, {
      uxBaseWeeks: number
      contentBaseWeeks: number
    }>
  }
  time_model?: {
    focusTimeRatio?: number       // 0-1
    planningPeriods?: Record<string, {
      baseWeeks: number
      holidays: number
      pto: number
    }>
  }
  size_bands?: {
    xs?: { min: number; max: number }
    s?:  { min: number; max: number }
    m?:  { min: number; max: number }
    l?:  { min: number; max: number }
    xl?: { min: number }
  }
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

    // Validate focusTimeRatio
    if (body.time_model?.focusTimeRatio !== undefined) {
      const ratio = body.time_model.focusTimeRatio
      if (typeof ratio !== 'number' || ratio < 0.4 || ratio > 0.9) {
        return errorResponse(400, 'focusTimeRatio must be between 0.4 and 0.9')
      }
    }

    // Validate effortWeights (1-10 scale)
    if (body.effort_model?.effortWeights) {
      const weights = body.effort_model.effortWeights
      for (const [key, val] of Object.entries(weights)) {
        if (val !== undefined && (typeof val !== 'number' || val < 1 || val > 10)) {
          return errorResponse(400, `effortWeights.${key} must be a number between 1 and 10`)
        }
      }
    }

    // Validate projectTypeDemand keys
    if (body.effort_model?.projectTypeDemand) {
      for (const key of Object.keys(body.effort_model.projectTypeDemand)) {
        if (!VALID_PROJECT_TYPES.includes(key)) {
          return errorResponse(400, `Invalid projectTypeDemand key: ${key}. Must be one of: ${VALID_PROJECT_TYPES.join(', ')}`)
        }
      }
    }

    // Validate planningPeriods entries
    if (body.time_model?.planningPeriods) {
      for (const [key, period] of Object.entries(body.time_model.planningPeriods)) {
        if (typeof period.baseWeeks !== 'number' || period.baseWeeks < 1) {
          return errorResponse(400, `planningPeriods.${key}.baseWeeks must be a positive number`)
        }
        if (typeof period.holidays !== 'number' || period.holidays < 0) {
          return errorResponse(400, `planningPeriods.${key}.holidays must be a non-negative number`)
        }
        if (typeof period.pto !== 'number' || period.pto < 0) {
          return errorResponse(400, `planningPeriods.${key}.pto must be a non-negative number`)
        }
      }
    }

    // Get current settings
    const current = (await sql`
      SELECT * FROM settings
      WHERE id = '00000000-0000-0000-0000-000000000000'
      LIMIT 1
    `) as Record<string, any>[]

    if (current.length === 0) {
      return errorResponse(404, 'Settings not found')
    }

    const currentSettings = current[0] as any

    // Deep merge — preserve existing nested keys, only overwrite what's provided
    const updatedEffortModel = body.effort_model ? {
      ...currentSettings.effort_model,
      ...body.effort_model,
      effortWeights: body.effort_model.effortWeights ? {
        ...currentSettings.effort_model?.effortWeights,
        ...body.effort_model.effortWeights,
      } : currentSettings.effort_model?.effortWeights,
      projectTypeDemand: body.effort_model.projectTypeDemand ? {
        ...currentSettings.effort_model?.projectTypeDemand,
        ...body.effort_model.projectTypeDemand,
      } : currentSettings.effort_model?.projectTypeDemand,
    } : currentSettings.effort_model

    const updatedTimeModel = body.time_model ? {
      ...currentSettings.time_model,
      ...body.time_model,
      planningPeriods: body.time_model.planningPeriods ? {
        ...currentSettings.time_model?.planningPeriods,
        ...body.time_model.planningPeriods,
      } : currentSettings.time_model?.planningPeriods,
    } : currentSettings.time_model

    const updatedSizeBands = body.size_bands ? {
      ...currentSettings.size_bands,
      ...body.size_bands,
    } : currentSettings.size_bands

    const result = (await sql`
      UPDATE settings
      SET
        effort_model = ${JSON.stringify(updatedEffortModel)}::jsonb,
        time_model = ${JSON.stringify(updatedTimeModel)}::jsonb,
        size_bands = ${JSON.stringify(updatedSizeBands)}::jsonb,
        updated_at = NOW()
      WHERE id = '00000000-0000-0000-0000-000000000000'
      RETURNING *
    `) as Record<string, any>[]

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
