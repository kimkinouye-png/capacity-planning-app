import { Handler } from '@netlify/functions'
import { neon } from '@netlify/neon'
import { dbRoadmapItemToRoadmapItemResponse, type DatabaseRoadmapItem, type RoadmapItemResponse } from './types'

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
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    // @netlify/neon automatically uses NETLIFY_DATABASE_URL from environment
    const sql = neon()

    // Get scenarioId from query string
    const scenarioId = event.queryStringParameters?.scenarioId

    if (!scenarioId) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing required parameter: scenarioId' }),
      }
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(scenarioId)) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid scenarioId format' }),
      }
    }

    // Get all roadmap items for the scenario (parameterized query)
    const dbItems = await sql<DatabaseRoadmapItem>`
      SELECT 
        id,
        scenario_id,
        key,
        name,
        initiative,
        priority,
        status,
        pm_intake,
        ux_factors,
        content_factors,
        ux_score,
        content_score,
        ux_size,
        content_size,
        ux_focus_weeks,
        content_focus_weeks,
        ux_work_weeks,
        content_work_weeks,
        created_at,
        updated_at
      FROM roadmap_items
      WHERE scenario_id = ${scenarioId}
      ORDER BY created_at ASC
    `

    // Transform database format to RoadmapItem format
    const items: RoadmapItemResponse[] = dbItems.map(dbRoadmapItemToRoadmapItemResponse)

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(items),
    }
  } catch (error) {
    console.error('Error fetching roadmap items:', error)
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Failed to fetch roadmap items', details: error instanceof Error ? error.message : 'Unknown error' }),
    }
  }
}
