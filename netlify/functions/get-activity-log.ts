/**
 * get-activity-log — GET activity log for visitor session (optionally by scenarioId).
 * NEON: getDatabaseConnection() → NETLIFY_DATABASE_URL, @neondatabase/serverless.
 * DATA: Requires sessionId; returns only entries for scenarios in that session.
 */
import { Handler } from '@netlify/functions'
import { getDatabaseConnection } from './db-connection'
import { getSessionIdFromRequest } from './request-session'
import { errorResponse, isValidUUID } from './types'
import type { ActivityEvent } from '../../src/domain/types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-session-id',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface ActivityLogResponse {
  activities: ActivityEvent[]
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
      return errorResponse(400, 'Missing session ID. Send x-session-id header.')
    }

    const sql = await getDatabaseConnection()

    const params = new URLSearchParams(event.queryStringParameters || '')
    const scenarioId = params.get('scenarioId') || params.get('sessionId')

    if (scenarioId && !isValidUUID(scenarioId)) {
      return errorResponse(400, 'Invalid scenario ID format')
    }

    let query
    if (scenarioId) {
      query = sql`
        SELECT 
          a.id,
          a.timestamp,
          a.type,
          a.scenario_id as "scenarioId",
          a.scenario_name as "scenarioName",
          a.description
        FROM activity_log a
        JOIN scenarios s ON s.id = a.scenario_id AND s.session_id = ${sessionId}
        WHERE a.scenario_id = ${scenarioId}
        ORDER BY a.timestamp DESC
        LIMIT 100
      `
    } else {
      query = sql`
        SELECT 
          a.id,
          a.timestamp,
          a.type,
          a.scenario_id as "scenarioId",
          a.scenario_name as "scenarioName",
          a.description
        FROM activity_log a
        JOIN scenarios s ON s.id = a.scenario_id AND s.session_id = ${sessionId}
        ORDER BY a.timestamp DESC
        LIMIT 100
      `
    }

    const results = await query

    // Transform database results to ActivityEvent format
    const activities: ActivityEvent[] = results.map((row: any) => ({
      id: row.id,
      timestamp: row.timestamp,
      type: row.type,
      scenarioId: row.scenarioId || undefined,
      scenarioName: row.scenarioName || undefined,
      description: row.description,
    }))

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ activities }),
    }
  } catch (error) {
    console.error('Error fetching activity log:', error)
    return errorResponse(
      500,
      'Failed to fetch activity log',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}
