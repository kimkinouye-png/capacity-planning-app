import { Handler } from '@netlify/functions'
import { neon } from '@netlify/neon'
import { errorResponse, isValidUUID } from './types'
import type { ActivityEvent } from '../../src/domain/types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
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
    // @netlify/neon automatically uses NETLIFY_DATABASE_URL from environment
    const sql = neon()

    // Get query parameters
    const params = new URLSearchParams(event.queryStringParameters || '')
    const scenarioId = params.get('scenarioId') || params.get('sessionId')

    // Validate scenarioId if provided
    if (scenarioId && !isValidUUID(scenarioId)) {
      return errorResponse(400, 'Invalid scenario ID format')
    }

    // Build query
    let query
    if (scenarioId) {
      query = sql`
        SELECT 
          id,
          timestamp,
          type,
          scenario_id as "scenarioId",
          scenario_name as "scenarioName",
          description
        FROM activity_log
        WHERE scenario_id = ${scenarioId}
        ORDER BY timestamp DESC
        LIMIT 100
      `
    } else {
      // Get all recent activity (last 100 entries)
      query = sql`
        SELECT 
          id,
          timestamp,
          type,
          scenario_id as "scenarioId",
          scenario_name as "scenarioName",
          description
        FROM activity_log
        ORDER BY timestamp DESC
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
