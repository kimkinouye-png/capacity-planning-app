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
    ux?: Record<string, number>
    content?: Record<string, number>
    pmIntakeMultiplier?: number
  }
  time_model?: {
    focusTimeRatio?: number
  }
  size_bands?: {
    xs?: number
    s?: number
    m?: number
    l?: number
    xl?: number
  }
}

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    }
  }

  if (event.httpMethod !== 'PUT') {
    return errorResponse(405, 'Method not allowed')
  }

  try {
    // Get database connection with write-specific timeout and retry logic
    // Writes need 30s timeout and 5 retries to handle Neon compute wake-up
    const sql = await getDatabaseConnectionForWrites()
    
    let body: UpdateSettingsRequest
    try {
      body = JSON.parse(event.body || '{}')
    } catch (parseError) {
      return errorResponse(400, 'Invalid JSON in request body')
    }

    // Validate input
    if (body.time_model?.focusTimeRatio !== undefined) {
      const ratio = body.time_model.focusTimeRatio
      if (typeof ratio !== 'number' || ratio < 0.4 || ratio > 0.9) {
        return errorResponse(400, 'Focus-time ratio must be between 0.4 and 0.9')
      }
    }

    // Validate effort_model structure if provided
    if (body.effort_model) {
      if (body.effort_model.ux && typeof body.effort_model.ux !== 'object') {
        return errorResponse(400, 'Invalid effort_model.ux: must be an object')
      }
      if (body.effort_model.content && typeof body.effort_model.content !== 'object') {
        return errorResponse(400, 'Invalid effort_model.content: must be an object')
      }
      if (body.effort_model.pmIntakeMultiplier !== undefined && 
          (typeof body.effort_model.pmIntakeMultiplier !== 'number' || 
           body.effort_model.pmIntakeMultiplier < 0 || 
           body.effort_model.pmIntakeMultiplier > 10)) {
        return errorResponse(400, 'Invalid effort_model.pmIntakeMultiplier: must be a number between 0 and 10')
      }
    }

    // Validate size_bands structure if provided
    if (body.size_bands) {
      const validKeys = ['xs', 's', 'm', 'l', 'xl']
      for (const key of Object.keys(body.size_bands)) {
        if (!validKeys.includes(key)) {
          return errorResponse(400, `Invalid size_bands key: ${key}. Must be one of ${validKeys.join(', ')}`)
        }
        const value = (body.size_bands as any)[key]
        if (typeof value !== 'number' || value < 0) {
          return errorResponse(400, `Invalid size_bands.${key}: must be a non-negative number`)
        }
      }
    }

    // Get current settings
    const current = await sql`
      SELECT * FROM settings 
      WHERE id = '00000000-0000-0000-0000-000000000000'
      LIMIT 1
    `

    if (current.length === 0) {
      return errorResponse(404, 'Settings not found')
    }

    const currentSettings = current[0] as any

    // Merge updates with current settings
    const updatedEffortModel = body.effort_model
      ? { ...currentSettings.effort_model, ...body.effort_model }
      : currentSettings.effort_model

    const updatedTimeModel = body.time_model
      ? { ...currentSettings.time_model, ...body.time_model }
      : currentSettings.time_model

    const updatedSizeBands = body.size_bands
      ? { ...currentSettings.size_bands, ...body.size_bands }
      : currentSettings.size_bands

    // Update settings
    const result = await sql`
      UPDATE settings
      SET 
        effort_model = ${JSON.stringify(updatedEffortModel)}::jsonb,
        time_model = ${JSON.stringify(updatedTimeModel)}::jsonb,
        size_bands = ${JSON.stringify(updatedSizeBands)}::jsonb,
        updated_at = NOW()
      WHERE id = '00000000-0000-0000-0000-000000000000'
      RETURNING *
    `

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result[0]),
    }
  } catch (error) {
    console.error('Error updating settings:', error)
    return errorResponse(500, 'Failed to update settings', error instanceof Error ? error.message : 'Unknown error')
  }
}
