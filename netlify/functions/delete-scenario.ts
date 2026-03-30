/**
 * delete-scenario — DELETE scenario by id (must belong to visitor session).
 * NEON: getDatabaseConnectionForWrites() → NETLIFY_DATABASE_URL, @neondatabase/serverless.
 * DATA: Requires sessionId; deletes only if id and session_id match.
 */
import { Handler } from '@netlify/functions'
import { getDatabaseConnectionForWrites } from './db-connection'
import { getSessionIdFromRequest } from './request-session'
import { errorResponse, isValidUUID } from './types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-session-id',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
}

interface DeleteScenarioResponse {
  success: boolean
  id: string
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

  if (event.httpMethod !== 'DELETE') {
    return errorResponse(405, 'Method not allowed')
  }

  try {
    const sessionId = getSessionIdFromRequest(event)
    if (!sessionId) {
      return errorResponse(400, 'Missing session ID. Send x-session-id header or sessionId in body.')
    }

    const sql = await getDatabaseConnectionForWrites()
    
    const id = event.queryStringParameters?.id

    if (!id) {
      return errorResponse(400, 'Missing required parameter: id')
    }

    // Validate UUID format
    if (!isValidUUID(id)) {
      return errorResponse(400, 'Invalid id format')
    }

    const scenarioCheck = (await sql`
      SELECT s.id, COUNT(ri.id)::int as item_count
      FROM scenarios s
      LEFT JOIN roadmap_items ri ON ri.scenario_id = s.id
      WHERE s.id = ${id} AND s.session_id = ${sessionId}
      GROUP BY s.id
    `) as { id: string; item_count: number }[]

    if (scenarioCheck.length === 0) {
      return errorResponse(404, 'Scenario not found')
    }

    if (scenarioCheck[0].item_count > 0) {
      return errorResponse(400, 'Cannot delete scenario with roadmap items')
    }

    await sql`
      DELETE FROM scenarios
      WHERE id = ${id} AND session_id = ${sessionId}
    `

    const response: DeleteScenarioResponse = { success: true, id }
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    }
  } catch (error) {
    console.error('Error deleting scenario:', error)
    return errorResponse(500, 'Failed to delete scenario', error instanceof Error ? error.message : 'Unknown error')
  }
}
