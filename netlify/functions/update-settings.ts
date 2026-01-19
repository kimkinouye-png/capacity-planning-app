import { Handler } from '@netlify/functions'
import { neon } from '@netlify/neon'

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
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    // @netlify/neon automatically uses NETLIFY_DATABASE_URL from environment
    const sql = neon()
    
    const body: UpdateSettingsRequest = JSON.parse(event.body || '{}')

    // Validate input
    if (body.time_model?.focusTimeRatio !== undefined) {
      const ratio = body.time_model.focusTimeRatio
      if (ratio < 0.4 || ratio > 0.9) {
        return {
          statusCode: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: 'Focus-time ratio must be between 0.4 and 0.9' }),
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
      return {
        statusCode: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Settings not found' }),
      }
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
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Failed to update settings', details: error instanceof Error ? error.message : 'Unknown error' }),
    }
  }
}
