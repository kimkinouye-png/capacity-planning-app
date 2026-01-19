import { Handler } from '@netlify/functions'
import { neon } from '@netlify/neon'
import { 
  type UpdateRoadmapItemRequest, 
  type DatabaseRoadmapItem, 
  type RoadmapItemResponse,
  roadmapItemToDbFormat,
  dbRoadmapItemToRoadmapItemResponse 
} from './types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'PUT, OPTIONS',
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
    
    let body: UpdateRoadmapItemRequest
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

    if (!body.id) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing required field: id' }),
      }
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(body.id)) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid id format' }),
      }
    }

    // Get current roadmap item (parameterized query)
    const current = await sql<DatabaseRoadmapItem>`
      SELECT * FROM roadmap_items WHERE id = ${body.id}
    `
    
    if (current.length === 0) {
      return {
        statusCode: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Roadmap item not found' }),
      }
    }

    const currentItem = current[0]
    
    // Map request format to database format
    const updates = roadmapItemToDbFormat(body)
    
    // Check if there are any updates
    const hasUpdates = Object.keys(updates).length > 0
    if (!hasUpdates) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'No fields to update' }),
      }
    }

    // Handle JSONB fields from request body - use current values if not provided
    const pmIntake = body.pm_intake !== undefined 
      ? body.pm_intake
      : currentItem.pm_intake
    const uxFactors = body.ux_factors !== undefined
      ? body.ux_factors
      : currentItem.ux_factors
    const contentFactors = body.content_factors !== undefined
      ? body.content_factors
      : currentItem.content_factors

    // Merge updates with current values
    const finalUpdates: Partial<DatabaseRoadmapItem> = {
      ...currentItem,
      ...updates,
    }

    // Update roadmap item (parameterized query - JSONB fields use JSON.stringify then cast to jsonb)
    // Neon parameterizes the JSON string, then PostgreSQL casts it to jsonb
    const result = await sql<DatabaseRoadmapItem>`
      UPDATE roadmap_items
      SET 
        key = ${finalUpdates.key ?? currentItem.key},
        name = ${finalUpdates.name ?? currentItem.name},
        initiative = ${finalUpdates.initiative ?? currentItem.initiative},
        priority = ${finalUpdates.priority ?? currentItem.priority},
        status = ${finalUpdates.status ?? currentItem.status},
        pm_intake = ${pmIntake ? JSON.stringify(pmIntake) : null}::jsonb,
        ux_factors = ${uxFactors ? JSON.stringify(uxFactors) : null}::jsonb,
        content_factors = ${contentFactors ? JSON.stringify(contentFactors) : null}::jsonb,
        ux_score = ${finalUpdates.ux_score ?? currentItem.ux_score},
        content_score = ${finalUpdates.content_score ?? currentItem.content_score},
        ux_size = ${finalUpdates.ux_size ?? currentItem.ux_size},
        content_size = ${finalUpdates.content_size ?? currentItem.content_size},
        ux_focus_weeks = ${finalUpdates.ux_focus_weeks ?? currentItem.ux_focus_weeks},
        content_focus_weeks = ${finalUpdates.content_focus_weeks ?? currentItem.content_focus_weeks},
        ux_work_weeks = ${finalUpdates.ux_work_weeks ?? currentItem.ux_work_weeks},
        content_work_weeks = ${finalUpdates.content_work_weeks ?? currentItem.content_work_weeks},
        updated_at = NOW()
      WHERE id = ${body.id}
      RETURNING *
    `

    if (result.length === 0) {
      return {
        statusCode: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Roadmap item not found after update' }),
      }
    }

    // Transform database format to RoadmapItem format
    const item: RoadmapItemResponse = dbRoadmapItemToRoadmapItemResponse(result[0])

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    }
  } catch (error) {
    console.error('Error updating roadmap item:', error)
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Failed to update roadmap item', details: error instanceof Error ? error.message : 'Unknown error' }),
    }
  }
}
