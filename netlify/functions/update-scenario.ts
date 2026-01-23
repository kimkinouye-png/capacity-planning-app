import { Handler } from '@netlify/functions'
import { getDatabaseConnectionForWrites } from './db-connection'
import { 
  type UpdateScenarioRequest, 
  type DatabaseScenario, 
  type ScenarioResponse,
  planningSessionToDbFormat,
  dbScenarioToPlanningSession,
  errorResponse,
  isValidUUID
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
    return errorResponse(405, 'Method not allowed')
  }

  try {
    // Get database connection with write-specific timeout and retry logic
    // Writes need 30s timeout and 5 retries to handle Neon compute wake-up
    const sql = await getDatabaseConnectionForWrites()
    
    let body: UpdateScenarioRequest
    try {
      body = JSON.parse(event.body || '{}')
    } catch (parseError) {
      return errorResponse(400, 'Invalid JSON in request body')
    }

    if (!body.id) {
      return errorResponse(400, 'Missing required field: id')
    }

    // Validate UUID format
    if (!isValidUUID(body.id)) {
      return errorResponse(400, 'Invalid id format')
    }

    // Validate numeric ranges if provided
    if (body.weeks_per_period !== undefined) {
      if (typeof body.weeks_per_period !== 'number' || body.weeks_per_period < 1 || body.weeks_per_period > 52) {
        return errorResponse(400, 'Invalid weeks_per_period: must be between 1 and 52')
      }
    }

    if (body.sprint_length_weeks !== undefined) {
      if (typeof body.sprint_length_weeks !== 'number' || body.sprint_length_weeks < 1 || body.sprint_length_weeks > 4) {
        return errorResponse(400, 'Invalid sprint_length_weeks: must be between 1 and 4')
      }
    }

    if (body.ux_designers !== undefined) {
      if (typeof body.ux_designers !== 'number' || body.ux_designers < 0 || body.ux_designers > 100) {
        return errorResponse(400, 'Invalid ux_designers: must be between 0 and 100')
      }
    }

    if (body.content_designers !== undefined) {
      if (typeof body.content_designers !== 'number' || body.content_designers < 0 || body.content_designers > 100) {
        return errorResponse(400, 'Invalid content_designers: must be between 0 and 100')
      }
    }

    // Get current scenario (parameterized query)
    const current = await sql<DatabaseScenario>`
      SELECT * FROM scenarios WHERE id = ${body.id}
    `
    
    if (current.length === 0) {
      return errorResponse(404, 'Scenario not found')
    }

    const currentScenario = current[0]
    
    // Map PlanningSession format to database format
    const updates = planningSessionToDbFormat(body)
    
    // Check if there are any updates
    const hasUpdates = Object.keys(updates).length > 0
    if (!hasUpdates) {
      return errorResponse(400, 'No fields to update')
    }

    // Merge updates with current values (only update provided fields)
    const finalUpdates: Partial<DatabaseScenario> = {
      ...currentScenario,
      ...updates,
    }

    // Update scenario (parameterized query - Neon handles SQL injection prevention)
    const result = await sql<DatabaseScenario>`
      UPDATE scenarios
      SET 
        title = ${finalUpdates.title ?? currentScenario.title},
        quarter = ${finalUpdates.quarter ?? currentScenario.quarter},
        year = ${finalUpdates.year ?? currentScenario.year},
        weeks_per_period = ${finalUpdates.weeks_per_period ?? currentScenario.weeks_per_period},
        sprint_length_weeks = ${finalUpdates.sprint_length_weeks ?? currentScenario.sprint_length_weeks},
        ux_designers = ${finalUpdates.ux_designers ?? currentScenario.ux_designers},
        content_designers = ${finalUpdates.content_designers ?? currentScenario.content_designers},
        committed = ${finalUpdates.committed ?? currentScenario.committed},
        updated_at = NOW()
      WHERE id = ${body.id}
      RETURNING *
    `

    if (result.length === 0) {
      return errorResponse(404, 'Scenario not found after update')
    }

    // Transform database format to PlanningSession format
    const scenario: ScenarioResponse = dbScenarioToPlanningSession(result[0])

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scenario),
    }
  } catch (error) {
    console.error('Error updating scenario:', error)
    return errorResponse(500, 'Failed to update scenario', error instanceof Error ? error.message : 'Unknown error')
  }
}
