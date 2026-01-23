import { Handler } from '@netlify/functions'
import { getDatabaseConnection } from './db-connection'
import { errorResponse, isValidUUID } from './types'
import type { ActivityEventType } from '../../src/domain/types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const VALID_ACTIVITY_TYPES: ActivityEventType[] = [
  'scenario_created',
  'scenario_committed',
  'scenario_deleted',
  'scenario_renamed',
  'roadmap_item_updated',
  'effort_updated',
]

interface CreateActivityLogEntryRequest {
  type: ActivityEventType
  scenarioId?: string
  scenarioName?: string
  description: string
  timestamp?: string // Optional, defaults to NOW()
}

interface ActivityLogEntryResponse {
  id: string
  timestamp: string
  type: ActivityEventType
  scenarioId?: string
  scenarioName?: string
  description: string
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
    return errorResponse(405, 'Method not allowed')
  }

  try {
    // Get database connection with timeout and retry logic
    const sql = await getDatabaseConnection()

    let body: CreateActivityLogEntryRequest
    try {
      body = JSON.parse(event.body || '{}')
    } catch (parseError) {
      return errorResponse(400, 'Invalid JSON in request body')
    }

    // Validate required fields
    if (!body.type) {
      return errorResponse(400, 'Missing required field: type')
    }

    if (!VALID_ACTIVITY_TYPES.includes(body.type)) {
      return errorResponse(400, `Invalid activity type. Must be one of: ${VALID_ACTIVITY_TYPES.join(', ')}`)
    }

    if (!body.description || typeof body.description !== 'string') {
      return errorResponse(400, 'Missing or invalid required field: description')
    }

    // Validate scenarioId if provided
    if (body.scenarioId && !isValidUUID(body.scenarioId)) {
      return errorResponse(400, 'Invalid scenario ID format')
    }

    // Validate timestamp if provided
    let timestamp = body.timestamp
    if (timestamp) {
      // Validate ISO string format
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) {
        return errorResponse(400, 'Invalid timestamp format. Must be a valid ISO 8601 string')
      }
      timestamp = date.toISOString()
    }

    // Insert into database
    const result = await sql`
      INSERT INTO activity_log (
        type,
        scenario_id,
        scenario_name,
        description,
        timestamp
      )
      VALUES (
        ${body.type},
        ${body.scenarioId || null},
        ${body.scenarioName || null},
        ${body.description},
        ${timestamp ? sql`${timestamp}::timestamptz` : sql`NOW()`}
      )
      RETURNING
        id,
        timestamp,
        type,
        scenario_id as "scenarioId",
        scenario_name as "scenarioName",
        description
    `

    if (result.length === 0) {
      return errorResponse(500, 'Failed to create activity log entry')
    }

    const entry = result[0] as any
    const response: ActivityLogEntryResponse = {
      id: entry.id,
      timestamp: entry.timestamp,
      type: entry.type,
      scenarioId: entry.scenarioId || undefined,
      scenarioName: entry.scenarioName || undefined,
      description: entry.description,
    }

    return {
      statusCode: 201,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    }
  } catch (error) {
    console.error('Error creating activity log entry:', error)
    return errorResponse(
      500,
      'Failed to create activity log entry',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}
