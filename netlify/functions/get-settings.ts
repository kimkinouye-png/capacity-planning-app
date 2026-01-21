import { Handler } from '@netlify/functions'
import { neon } from '@netlify/neon'
import { errorResponse } from './types'

interface SettingsResponse {
  id: string
  effort_model: {
    ux: Record<string, number>
    content: Record<string, number>
    pmIntakeMultiplier: number
  }
  time_model: {
    focusTimeRatio: number
  }
  size_bands: {
    xs: number
    s: number
    m: number
    l: number
    xl: number
  }
  created_at: string
  updated_at: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  if (event.httpMethod !== 'GET') {
    return errorResponse(405, 'Method not allowed')
  }

  try {
    // @netlify/neon automatically uses NETLIFY_DATABASE_URL from environment
    const sql = neon()

    // Get or create default settings
    const result = await sql`
      SELECT * FROM settings 
      WHERE id = '00000000-0000-0000-0000-000000000000'
      LIMIT 1
    `

    let dbRow: any

    if (result.length === 0) {
      // Create default settings if they don't exist
      const defaultSettings = await sql`
        INSERT INTO settings (id, effort_model, time_model, size_bands)
        VALUES (
          '00000000-0000-0000-0000-000000000000',
          '{
            "ux": {
              "productRisk": 1.2,
              "problemAmbiguity": 1.0,
              "discoveryDepth": 0.9
            },
            "content": {
              "contentSurfaceArea": 1.3,
              "localizationScope": 1.0,
              "regulatoryBrandRisk": 1.2,
              "legalComplianceDependency": 1.1
            },
            "pmIntakeMultiplier": 1.0
          }'::jsonb,
          '{"focusTimeRatio": 0.75}'::jsonb,
          '{
            "xs": 1.6,
            "s": 2.6,
            "m": 3.6,
            "l": 4.6,
            "xl": 5.0
          }'::jsonb
        )
        RETURNING *
      `
      dbRow = defaultSettings[0]
    } else {
      dbRow = result[0]
    }

    // Ensure JSONB fields are properly parsed (Neon should handle this, but be explicit)
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
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    }
  } catch (error) {
    console.error('Error fetching settings:', error)
    return errorResponse(500, 'Failed to fetch settings', error instanceof Error ? error.message : 'Unknown error')
  }
}
