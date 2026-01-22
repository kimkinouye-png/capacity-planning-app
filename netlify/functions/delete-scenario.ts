import { Handler } from '@netlify/functions'
import { neon } from '@netlify/neon'
import { errorResponse, isValidUUID } from './types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
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
    // @netlify/neon automatically uses NETLIFY_DATABASE_URL from environment
    const sql = neon()
    
    // Get id from query string (preferred) or path
    const id = event.queryStringParameters?.id

    if (!id) {
      return errorResponse(400, 'Missing required parameter: id')
    }

    // Validate UUID format
    if (!isValidUUID(id)) {
      return errorResponse(400, 'Invalid id format')
    }

    // Check if scenario exists and has no roadmap items (parameterized query)
    const scenarioCheck = await sql<{ id: string; item_count: number }>`
      SELECT s.id, COUNT(ri.id)::int as item_count
      FROM scenarios s
      LEFT JOIN roadmap_items ri ON ri.scenario_id = s.id
      WHERE s.id = ${id}
      GROUP BY s.id
    `

    if (scenarioCheck.length === 0) {
      return errorResponse(404, 'Scenario not found')
    }

    if (scenarioCheck[0].item_count > 0) {
      return errorResponse(400, 'Cannot delete scenario with roadmap items')
    }

    // Delete the scenario (parameterized query)
    await sql`
      DELETE FROM scenarios
      WHERE id = ${id}
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
