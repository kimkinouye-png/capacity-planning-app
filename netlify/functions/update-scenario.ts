import { Handler } from '@netlify/functions'
import { neon } from '@netlify/neon'
import { 
  type UpdateScenarioRequest, 
  type DatabaseScenario, 
  type ScenarioResponse,
  planningSessionToDbFormat,
  dbScenarioToPlanningSession 
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
    
    let body: UpdateScenarioRequest
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

    // Validate UUID format (basic check)
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

    // Get current scenario (parameterized query)
    const current = await sql<DatabaseScenario>`
      SELECT * FROM scenarios WHERE id = ${body.id}
    `
    
    if (current.length === 0) {
      return {
        statusCode: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Scenario not found' }),
      }
    }

    const currentScenario = current[0]
    
    // Map PlanningSession format to database format
    const updates = planningSessionToDbFormat(body)
    
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
      return {
        statusCode: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Scenario not found after update' }),
      }
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
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Failed to update scenario', details: error instanceof Error ? error.message : 'Unknown error' }),
    }
  }
}
