import { Handler } from '@netlify/functions'
import { neon } from '@netlify/neon'
import type { PlanningPeriod } from '../../src/domain/types'
import { 
  type CreateScenarioRequest, 
  type DatabaseScenario, 
  type ScenarioResponse,
  planningSessionToDbFormat,
  dbScenarioToPlanningSession,
  errorResponse,
  isValidPlanningPeriod
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
      return errorResponse(400, 'Invalid JSON in request body')
    }

    // Validate required fields
    if (!body.name || (!body.planningPeriod && !body.planning_period)) {
      return errorResponse(400, 'Missing required fields: name and planningPeriod (or planning_period)')
    }

    // Validate planning period format
    const planningPeriodStr = body.planningPeriod || body.planning_period
    if (!planningPeriodStr || typeof planningPeriodStr !== 'string' || !isValidPlanningPeriod(planningPeriodStr)) {
      return errorResponse(400, 'Invalid planning period format. Expected format: YYYY-QN (e.g., "2026-Q1")')
    }

    // Validate numeric ranges
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

    // Map PlanningSession format to database format
    const dbFormat = planningSessionToDbFormat({
      name: body.name,
      planningPeriod: planningPeriodStr as PlanningPeriod,
      weeks_per_period: body.weeks_per_period ?? 13,
      sprint_length_weeks: body.sprint_length_weeks ?? 2,
      ux_designers: body.ux_designers ?? 0,
      content_designers: body.content_designers ?? 0,
      status: 'draft',
    })

    // Validate required database fields
    if (!dbFormat.title || !dbFormat.quarter || dbFormat.year === undefined) {
      return errorResponse(400, 'Invalid planning period format')
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
    return errorResponse(500, 'Failed to create scenario', error instanceof Error ? error.message : 'Unknown error')
  }
}
