/**
 * get-roadmap-items — GET roadmap items for a scenario (must belong to visitor session).
 * NEON: getDatabaseConnection() → NETLIFY_DATABASE_URL, @neondatabase/serverless.
 * DATA: Requires sessionId; returns items only if scenario.session_id matches.
 * Updated to match validated data model v2 (March 2026).
 */
import { Handler } from '@netlify/functions'
import { getDatabaseConnection } from './db-connection'
import { getSessionIdFromRequest } from './request-session'
import {
  dbRoadmapItemToRoadmapItemResponse,
  type DatabaseRoadmapItem,
  type RoadmapItemResponse,
  errorResponse,
  isValidUUID
} from './types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-session-id',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return errorResponse(405, 'Method not allowed')
  }

  try {
    const sessionId = getSessionIdFromRequest(event)
    if (!sessionId) {
      return errorResponse(400, 'Missing session ID. Send x-session-id header.')
    }

    const sql = await getDatabaseConnection()

    const scenarioId = event.queryStringParameters?.scenarioId

    if (!scenarioId) {
      return errorResponse(400, 'Missing required parameter: scenarioId')
    }

    if (!isValidUUID(scenarioId)) {
      return errorResponse(400, 'Invalid scenarioId format')
    }

    // Ensure scenario belongs to this session
    const scenarioCheck = await sql<{ id: string }>`
      SELECT id FROM scenarios WHERE id = ${scenarioId} AND session_id = ${sessionId}
    `
    if (scenarioCheck.length === 0) {
      return errorResponse(404, 'Scenario not found')
    }

    const dbItems = await sql<DatabaseRoadmapItem>`
      SELECT
        id,
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
        content_factors,
        ux_score,
        content_score,
        ux_size,
        content_size,
        ux_focus_weeks,
        content_focus_weeks,
        ux_work_weeks,
        content_work_weeks,
        start_date,
        end_date,
        created_at,
        updated_at
      FROM roadmap_items
      WHERE scenario_id = ${scenarioId}
      ORDER BY created_at ASC
    `

    const items: RoadmapItemResponse[] = dbItems.map(dbRoadmapItemToRoadmapItemResponse)

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    }
  } catch (error) {
    console.error('Error fetching roadmap items:', error)
    return errorResponse(500, 'Failed to fetch roadmap items', error instanceof Error ? error.message : 'Unknown error')
  }
}
