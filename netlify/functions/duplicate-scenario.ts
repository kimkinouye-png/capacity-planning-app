/**
 * duplicate-scenario — POST to duplicate an existing scenario and all its roadmap items.
 * NEON: getDatabaseConnectionForWrites() → NETLIFY_DATABASE_URL, @neondatabase/serverless.
 * DATA: Requires sessionId (x-session-id or body.sessionId); copies scenario with new UUID.
 */
import { Handler } from '@netlify/functions'
import { getDatabaseConnectionForWrites } from './db-connection'
import { getSessionIdFromRequest } from './request-session'
import {
  type DatabaseScenario,
  type ScenarioResponse,
  dbScenarioToPlanningSession,
  errorResponse,
  isValidUUID
} from './types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-session-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const sessionId = getSessionIdFromRequest(event)
    if (!sessionId) {
      return errorResponse(400, 'Missing session ID. Send x-session-id header or sessionId in body.')
    }

    const sql = await getDatabaseConnectionForWrites()

    let body: { id: string; name?: string }
    try {
      body = JSON.parse(event.body || '{}')
    } catch {
      return errorResponse(400, 'Invalid JSON in request body')
    }

    if (!body.id) {
      return errorResponse(400, 'Missing required field: id')
    }

    if (!isValidUUID(body.id)) {
      return errorResponse(400, 'Invalid scenario ID format')
    }

    // Fetch the original scenario (scoped to session)
    const original = await sql<DatabaseScenario>`
      SELECT * FROM scenarios
      WHERE id = ${body.id}
      AND session_id = ${sessionId}
    `

    if (original.length === 0) {
      return errorResponse(404, 'Scenario not found')
    }

    const source = original[0]
    const newName = body.name || `${source.name} (Copy)`

    // Insert duplicated scenario — always starts as draft, resets capacity/demand
    const duplicated = await sql<DatabaseScenario>`
      INSERT INTO scenarios (
        session_id,
        name,
        description,
        quarter,
        year,
        status,
        ux_designers,
        content_designers,
        weeks_per_period,
        sprint_length_weeks,
        capacity_ux_design,
        capacity_content_design,
        demand_ux_design,
        demand_content_design,
        roadmap_items_count,
        capacity_is_manual
      )
      VALUES (
        ${sessionId},
        ${newName},
        ${source.description || null},
        ${source.quarter},
        ${source.year},
        'draft',
        ${source.ux_designers},
        ${source.content_designers},
        ${source.weeks_per_period},
        ${source.sprint_length_weeks},
        ${source.capacity_ux_design},
        ${source.capacity_content_design},
        0,
        0,
        0,
        false
      )
      RETURNING *
    `

    const newScenarioId = duplicated[0].id

    // Duplicate all roadmap items linked to original scenario
    await sql`
      INSERT INTO roadmap_items (
        scenario_id,
        key,
        name,
        initiative,
        priority,
        quarter,
        status,
        project_type,
        notes,
        pm_intake,
        ux_factors,
        content_factors,
        ux_score,
        content_score,
        ux_size,
        content_size,
        ux_focus_weeks,
        content_focus_weeks,
        ux_work_weeks,
        content_work_weeks
      )
      SELECT
        ${newScenarioId},
        key,
        name,
        initiative,
        priority,
        quarter,
        'draft',
        project_type,
        notes,
        pm_intake,
        ux_factors,
        content_factors,
        ux_score,
        content_score,
        ux_size,
        content_size,
        ux_focus_weeks,
        content_focus_weeks,
        ux_work_weeks,
        content_work_weeks
      FROM roadmap_items
      WHERE scenario_id = ${body.id}
    `

    // Update roadmap_items_count and demand on the new scenario
    await sql`
      UPDATE scenarios
      SET
        roadmap_items_count = (
          SELECT COUNT(*) FROM roadmap_items WHERE scenario_id = ${newScenarioId}
        ),
        demand_ux_design = (
          SELECT COALESCE(SUM(ux_focus_weeks), 0) FROM roadmap_items WHERE scenario_id = ${newScenarioId}
        ),
        demand_content_design = (
          SELECT COALESCE(SUM(content_focus_weeks), 0) FROM roadmap_items WHERE scenario_id = ${newScenarioId}
        )
      WHERE id = ${newScenarioId}
    `

    // Fetch final state to return
    const final = await sql<DatabaseScenario>`
      SELECT * FROM scenarios WHERE id = ${newScenarioId}
    `

    const scenario: ScenarioResponse = dbScenarioToPlanningSession(final[0])

    return {
      statusCode: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(scenario),
    }
  } catch (error) {
    console.error('Error duplicating scenario:', error)
    return errorResponse(500, 'Failed to duplicate scenario', error instanceof Error ? error.message : 'Unknown error')
  }
}
