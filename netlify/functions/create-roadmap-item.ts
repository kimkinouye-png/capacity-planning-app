/**
 * create-roadmap-item — POST new roadmap item (scenario must belong to visitor session).
 * NEON: getDatabaseConnectionForWrites() → NETLIFY_DATABASE_URL, @neondatabase/serverless.
 * DATA: Requires sessionId; verifies scenario.session_id before inserting.
 */
import { Handler } from '@netlify/functions'
import { getDatabaseConnectionForWrites } from './db-connection'
import { getSessionIdFromRequest } from './request-session'
import { 
  type CreateRoadmapItemRequest, 
  type DatabaseRoadmapItem, 
  type RoadmapItemResponse,
  createRoadmapItemRequestToDbFormat,
  dbRoadmapItemToRoadmapItemResponse,
  errorResponse,
  isValidUUID
} from './types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-session-id',
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
    const sessionId = getSessionIdFromRequest(event)
    if (!sessionId) {
      return errorResponse(400, 'Missing session ID. Send x-session-id header or sessionId in body.')
    }

    const sql = await getDatabaseConnectionForWrites()
    
    let body: CreateRoadmapItemRequest & { sessionId?: string }
    try {
      body = JSON.parse(event.body || '{}')
    } catch (parseError) {
      return errorResponse(400, 'Invalid JSON in request body')
    }

    if (!body.scenario_id || !body.short_key || !body.name) {
      return errorResponse(400, 'Missing required fields: scenario_id, short_key, name')
    }

    if (!isValidUUID(body.scenario_id)) {
      return errorResponse(400, 'Invalid scenario_id format')
    }

    const dbFormat = createRoadmapItemRequestToDbFormat(body)

    if (!dbFormat.scenario_id || !dbFormat.key || !dbFormat.name) {
      return errorResponse(400, 'Missing required fields after transformation')
    }

    const scenarioCheck = await sql<{ id: string }>`
      SELECT id FROM scenarios WHERE id = ${dbFormat.scenario_id} AND session_id = ${sessionId}
    `
    if (scenarioCheck.length === 0) {
      return errorResponse(404, 'Scenario not found')
    }

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
        ${dbFormat.scenario_id},
        ${dbFormat.key},
        ${dbFormat.name},
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
    return errorResponse(500, 'Failed to create roadmap item', error instanceof Error ? error.message : 'Unknown error')
  }
}
