/**
 * update-scenario — PUT update scenario by id (must belong to visitor session).
 * NEON: getDatabaseConnectionForWrites() → NETLIFY_DATABASE_URL, @neondatabase/serverless.
 * DATA: Requires sessionId; updates only if id and session_id match.
 * NOTE: Editing a committed scenario reverts it to draft (per data model v2).
 */
import { Handler } from '@netlify/functions'
import { getDatabaseConnectionForWrites } from './db-connection'
import { getSessionIdFromRequest } from './request-session'
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
  'Access-Control-Allow-Headers': 'Content-Type, x-session-id',
  'Access-Control-Allow-Methods': 'PUT, OPTIONS',
}

const VALID_STATUSES = ['draft', 'in-review', 'committed', 'archived']

export const handler: Handler = async (event) => {
  const functionStartTime = Date.now()

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'PUT') {
    return errorResponse(405, 'Method not allowed')
  }

  try {
    const sessionId = getSessionIdFromRequest(event)
    if (!sessionId) {
      return errorResponse(400, 'Missing session ID. Send x-session-id header or sessionId in body.')
    }

    const connectionStartTime = Date.now()
    console.log('🔌 [update-scenario] Starting database connection...', {
      timestamp: new Date().toISOString()
    })

    const sql = await getDatabaseConnectionForWrites()

    const connectionDuration = Date.now() - connectionStartTime
    console.log('✅ [update-scenario] Database connection established', {
      connectionDuration: `${connectionDuration}ms`,
    })

    let body: UpdateScenarioRequest
    try {
      body = JSON.parse(event.body || '{}')
    } catch {
      return errorResponse(400, 'Invalid JSON in request body')
    }

    if (!body.id) {
      return errorResponse(400, 'Missing required field: id')
    }

    if (!isValidUUID(body.id)) {
      return errorResponse(400, 'Invalid id format')
    }

    // Validate status if provided
    if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
      return errorResponse(400, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`)
    }

    // Validate capacity override — reason required when setting manual override
    if (body.capacity_is_manual === true) {
      if (!body.capacity_override_reason || body.capacity_override_reason.trim() === '') {
        return errorResponse(400, 'capacity_override_reason is required when capacity_is_manual is true')
      }
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

    const selectStartTime = Date.now()
    const current = await sql<DatabaseScenario>`
      SELECT * FROM scenarios WHERE id = ${body.id} AND session_id = ${sessionId}
    `
    console.log('🔍 [update-scenario] Select query completed', {
      found: current.length > 0,
      selectDuration: `${Date.now() - selectStartTime}ms`,
    })

    if (current.length === 0) {
      return errorResponse(404, 'Scenario not found')
    }

    const currentScenario = current[0]

    // Business rule: editing a committed scenario reverts it to draft
    // unless the update is explicitly setting a new status
    let resolvedStatus = body.status ?? currentScenario.status
    if (currentScenario.status === 'committed' && body.status === undefined) {
      resolvedStatus = 'draft'
      console.log('⚠️ [update-scenario] Committed scenario edited — reverting to draft')
    }

    const updates = planningSessionToDbFormat(body)

    if (Object.keys(updates).length === 0 && body.status === undefined) {
      return errorResponse(400, 'No fields to update')
    }

    const updateStartTime = Date.now()
    const result = await sql<DatabaseScenario>`
      UPDATE scenarios
      SET
        name = ${updates.name ?? currentScenario.name},
        description = ${updates.description ?? currentScenario.description},
        quarter = ${updates.quarter ?? currentScenario.quarter},
        year = ${updates.year ?? currentScenario.year},
        weeks_per_period = ${updates.weeks_per_period ?? currentScenario.weeks_per_period},
        sprint_length_weeks = ${updates.sprint_length_weeks ?? currentScenario.sprint_length_weeks},
        ux_designers = ${updates.ux_designers ?? currentScenario.ux_designers},
        content_designers = ${updates.content_designers ?? currentScenario.content_designers},
        status = ${resolvedStatus},
        capacity_override_ux = ${updates.capacity_override_ux ?? currentScenario.capacity_override_ux},
        capacity_override_content = ${updates.capacity_override_content ?? currentScenario.capacity_override_content},
        capacity_override_reason = ${updates.capacity_override_reason ?? currentScenario.capacity_override_reason},
        capacity_is_manual = ${updates.capacity_is_manual ?? currentScenario.capacity_is_manual},
        updated_at = NOW()
      WHERE id = ${body.id} AND session_id = ${sessionId}
      RETURNING *
    `

    console.log('✏️ [update-scenario] Update query completed', {
      updateDuration: `${Date.now() - updateStartTime}ms`,
    })

    if (result.length === 0) {
      return errorResponse(404, 'Scenario not found after update')
    }

    const scenario: ScenarioResponse = dbScenarioToPlanningSession(result[0])

    const totalDuration = Date.now() - functionStartTime
    console.log('✅ [update-scenario] Function completed successfully', {
      totalDuration: `${totalDuration}ms`,
    })

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(scenario),
    }
  } catch (error) {
    console.error('❌ [update-scenario] Error updating scenario', {
      error: error instanceof Error ? error.message : String(error),
      totalDuration: `${Date.now() - functionStartTime}ms`,
    })
    return errorResponse(500, 'Failed to update scenario', error instanceof Error ? error.message : 'Unknown error')
  }
}
