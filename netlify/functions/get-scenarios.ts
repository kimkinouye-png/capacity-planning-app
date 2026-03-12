/**
 * get-scenarios — GET scenarios for the current visitor session.
 * NEON: getDatabaseConnection() → NETLIFY_DATABASE_URL, @neondatabase/serverless.
 * DATA: Filtered by session_id from x-session-id header or body.sessionId.
 */
import { Handler } from '@netlify/functions'
import { getDatabaseConnection } from './db-connection'
import { getSessionIdFromRequest } from './request-session'
import { dbScenarioToPlanningSession, type DatabaseScenario, type ScenarioResponse, errorResponse } from './types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-session-id',
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
    const sessionId = getSessionIdFromRequest(event)
    if (!sessionId) {
      return errorResponse(400, 'Missing session ID. Send x-session-id header or sessionId in body.')
    }

    const sql = await getDatabaseConnection()

    const dbScenarios = await sql<DatabaseScenario>`
      SELECT 
        id,
        session_id,
        title,
        quarter,
        year,
        committed,
        ux_designers,
        content_designers,
        weeks_per_period,
        sprint_length_weeks,
        created_at,
        updated_at
      FROM scenarios
      WHERE session_id = ${sessionId}
      ORDER BY updated_at DESC
    `

    // Transform database format to PlanningSession format
    const scenarios: ScenarioResponse[] = dbScenarios.map(dbScenarioToPlanningSession)

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scenarios),
    }
  } catch (error) {
    console.error('Error fetching scenarios:', error)
    return errorResponse(500, 'Failed to fetch scenarios', error instanceof Error ? error.message : 'Unknown error')
  }
}
