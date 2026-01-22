import { Handler } from '@netlify/functions'
import { neon } from '@netlify/neon'
import { dbScenarioToPlanningSession, type DatabaseScenario, type ScenarioResponse, errorResponse } from './types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
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
    // @netlify/neon automatically uses NETLIFY_DATABASE_URL from environment
    const sql = neon()

    // Get all scenarios from database (parameterized query - Neon handles SQL injection prevention)
    const dbScenarios = await sql<DatabaseScenario>`
      SELECT 
        id,
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
