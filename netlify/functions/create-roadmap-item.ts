import { Handler } from '@netlify/functions'
import { neon } from '@netlify/neon'
import { 
  type CreateRoadmapItemRequest, 
  type DatabaseRoadmapItem, 
  type RoadmapItemResponse,
  createRoadmapItemRequestToDbFormat,
  dbRoadmapItemToRoadmapItemResponse 
} from './types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    // @netlify/neon automatically uses NETLIFY_DATABASE_URL from environment
    const sql = neon()
    
    let body: CreateRoadmapItemRequest
    try {
      body = JSON.parse(event.body || '{}')
    } catch (parseError) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      }
    }

    // Validate required fields
    if (!body.scenario_id || !body.short_key || !body.name) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing required fields: scenario_id, short_key, name' }),
      }
    }

    // Validate UUID format for scenario_id
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(body.scenario_id)) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid scenario_id format' }),
      }
    }

    // Map request format to database format
    const dbFormat = createRoadmapItemRequestToDbFormat(body)

    // Insert new roadmap item (parameterized query)
    const result = await sql<DatabaseRoadmapItem>`
      INSERT INTO roadmap_items (
        scenario_id,
        key,
        name,
        initiative,
        priority,
        status,
        pm_intake,
        ux_factors,
        content_factors
      )
      VALUES (
        ${dbFormat.scenario_id!},
        ${dbFormat.key!},
        ${dbFormat.name!},
        ${dbFormat.initiative ?? null},
        ${dbFormat.priority ?? null},
        ${dbFormat.status || 'draft'},
        ${dbFormat.pm_intake ? JSON.stringify(dbFormat.pm_intake) : null}::jsonb,
        ${dbFormat.ux_factors ? JSON.stringify(dbFormat.ux_factors) : null}::jsonb,
        ${dbFormat.content_factors ? JSON.stringify(dbFormat.content_factors) : null}::jsonb
      )
      RETURNING *
    `

    // Transform database format to RoadmapItem format
    const item: RoadmapItemResponse = dbRoadmapItemToRoadmapItemResponse(result[0])

    return {
      statusCode: 201,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    }
  } catch (error) {
    console.error('Error creating roadmap item:', error)
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Failed to create roadmap item', details: error instanceof Error ? error.message : 'Unknown error' }),
    }
  }
}
