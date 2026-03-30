/**
 * create-roadmap-item — POST new roadmap item (scenario must belong to visitor session).
 * NEON: getDatabaseConnectionForWrites() → NETLIFY_DATABASE_URL, @neondatabase/serverless.
 * DATA: Requires sessionId; verifies scenario.session_id before inserting.
 * Updated to match validated data model v2 (March 2026).
 */
import { Handler } from '@netlify/functions'
import { getDatabaseConnectionForWrites } from './db-connection'
import { getSessionIdFromRequest } from './request-session'
import {
  type CreateRoadmapItemRequest,
  type DatabaseRoadmapItem,
  type RoadmapItemResponse,
  createRoadmapItemRequestToDbFormat,
  dbRoadmapItemToRoadmapItemResponse,
  errorResponse,
  isValidUUID
} from './types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-session-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const VALID_PRIORITIES = ['P0', 'P1', 'P2', 'P3']
const VALID_STATUSES = ['draft', 'in-review', 'committed', 'archived']
const VALID_PROJECT_TYPES = ['net-new', 'new-feature', 'enhancement', 'optimization', 'fix-polish']

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

    let body: CreateRoadmapItemRequest & { sessionId?: string }
    try {
      body = JSON.parse(event.body || '{}')
    } catch {
      return errorResponse(400, 'Invalid JSON in request body')
    }

    if (!body.scenario_id || !body.short_key || !body.name) {
      return errorResponse(400, 'Missing required fields: scenario_id, short_key, name')
    }

    if (!isValidUUID(body.scenario_id)) {
      return errorResponse(400, 'Invalid scenario_id format')
    }

    // Validate optional enum fields
    if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority)) {
      return errorResponse(400, `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`)
    }

    if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
      return errorResponse(400, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`)
    }

    if (body.project_type !== undefined && !VALID_PROJECT_TYPES.includes(body.project_type)) {
      return errorResponse(400, `Invalid project_type. Must be one of: ${VALID_PROJECT_TYPES.join(', ')}`)
    }

    // Verify scenario belongs to this session and get its quarter
    const scenarioCheck = (await sql`
      SELECT id, quarter FROM scenarios WHERE id = ${body.scenario_id} AND session_id = ${sessionId}
    `) as { id: string; quarter: string }[]
    if (scenarioCheck.length === 0) {
      return errorResponse(404, 'Scenario not found')
    }

    // Lock quarter to scenario quarter
    const scenarioQuarter = scenarioCheck[0].quarter

    const dbFormat = createRoadmapItemRequestToDbFormat({
      ...body,
      quarter: scenarioQuarter,
    })

    if (!dbFormat.scenario_id || !dbFormat.key || !dbFormat.name) {
      return errorResponse(400, 'Missing required fields after transformation')
    }

    const result = (await sql`
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
        ux_product_risk,
        ux_problem_ambiguity,
        content_surface_area,
        content_localization_scope,
        pm_intake,
        ux_factors,
        content_factors
      )
      VALUES (
        ${dbFormat.scenario_id},
        ${dbFormat.key},
        ${dbFormat.name},
        ${dbFormat.initiative ?? null},
        ${dbFormat.priority ?? 'P2'},
        ${dbFormat.quarter ?? null},
        ${dbFormat.status || 'draft'},
        ${dbFormat.project_type ?? null},
        ${dbFormat.notes ?? null},
        ${dbFormat.ux_product_risk ?? null},
        ${dbFormat.ux_problem_ambiguity ?? null},
        ${dbFormat.content_surface_area ?? null},
        ${dbFormat.content_localization_scope ?? null},
        ${dbFormat.pm_intake ? JSON.stringify(dbFormat.pm_intake) : null}::jsonb,
        ${dbFormat.ux_factors ? JSON.stringify(dbFormat.ux_factors) : null}::jsonb,
        ${dbFormat.content_factors ? JSON.stringify(dbFormat.content_factors) : null}::jsonb
      )
      RETURNING *
    `) as DatabaseRoadmapItem[]

    // Update scenario roadmap_items_count
    await sql`
      UPDATE scenarios
      SET roadmap_items_count = (
        SELECT COUNT(*) FROM roadmap_items WHERE scenario_id = ${body.scenario_id}
      )
      WHERE id = ${body.scenario_id}
    `

    const item: RoadmapItemResponse = dbRoadmapItemToRoadmapItemResponse(result[0])

    return {
      statusCode: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    }
  } catch (error) {
    console.error('Error creating roadmap item:', error)
    return errorResponse(500, 'Failed to create roadmap item', error instanceof Error ? error.message : 'Unknown error')
  }
}
