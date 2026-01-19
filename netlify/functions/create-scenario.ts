import { Handler } from '@netlify/functions'
import { neon } from '@netlify/neon'
import { 
  type CreateScenarioRequest, 
  type DatabaseScenario, 
  type ScenarioResponse,
  planningSessionToDbFormat,
  dbScenarioToPlanningSession 
} from './types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
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
    // @netlify/neon automatically uses NETLIFY_DATABASE_URL from environment
    const sql = neon()
    
    let body: CreateScenarioRequest
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

    // Validate required fields
    if (!body.name || (!body.planningPeriod && !body.planning_period)) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing required fields: name and planningPeriod (or planning_period)' }),
      }
    }

    // Map PlanningSession format to database format
    const dbFormat = planningSessionToDbFormat({
      name: body.name,
      planningPeriod: body.planningPeriod || (body.planning_period as any),
      weeks_per_period: body.weeks_per_period ?? 13,
      sprint_length_weeks: body.sprint_length_weeks ?? 2,
      ux_designers: body.ux_designers ?? 0,
      content_designers: body.content_designers ?? 0,
      status: 'draft',
    })

    // Validate required database fields
    if (!dbFormat.title || !dbFormat.quarter || dbFormat.year === undefined) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid planning period format' }),
      }
    }

    // Insert new scenario (parameterized query - Neon handles SQL injection prevention)
    const result = await sql<DatabaseScenario>`
      INSERT INTO scenarios (
        title,
        quarter,
        year,
        ux_designers,
        content_designers,
        weeks_per_period,
        sprint_length_weeks,
        committed
      )
      VALUES (
        ${dbFormat.title},
        ${dbFormat.quarter},
        ${dbFormat.year},
        ${dbFormat.ux_designers ?? 0},
        ${dbFormat.content_designers ?? 0},
        ${dbFormat.weeks_per_period ?? 13},
        ${dbFormat.sprint_length_weeks ?? 2},
        ${dbFormat.committed ?? false}
      )
      RETURNING *
    `

    // Transform database format to PlanningSession format
    const scenario: ScenarioResponse = dbScenarioToPlanningSession(result[0])

    return {
      statusCode: 201,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scenario),
    }
  } catch (error) {
    console.error('Error creating scenario:', error)
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Failed to create scenario', details: error instanceof Error ? error.message : 'Unknown error' }),
    }
  }
}
