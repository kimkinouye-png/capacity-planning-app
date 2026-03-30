/**
 * update-roadmap-item — PUT update roadmap item by id.
 * NEON: getDatabaseConnectionForWrites() → NETLIFY_DATABASE_URL, @neondatabase/serverless.
 * DATA: Requires sessionId; verifies item's scenario belongs to session before updating.
 * Updated to match validated data model v2 (March 2026).
 */
import { Handler } from '@netlify/functions'
import { getDatabaseConnectionForWrites } from './db-connection'
import { getSessionIdFromRequest } from './request-session'
import type { RoadmapItem } from '../../src/domain/types'
import {
  type UpdateRoadmapItemRequest,
  type DatabaseRoadmapItem,
  type RoadmapItemResponse,
  roadmapItemToDbFormat,
  dbRoadmapItemToRoadmapItemResponse,
  errorResponse,
  isValidUUID
} from './types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-session-id',
  'Access-Control-Allow-Methods': 'PUT, OPTIONS',
}

const VALID_PRIORITIES = ['P0', 'P1', 'P2', 'P3']
const VALID_STATUSES = ['draft', 'in-review', 'committed', 'archived']
const VALID_PROJECT_TYPES = ['net-new', 'new-feature', 'enhancement', 'optimization', 'fix-polish']
const VALID_SIZES = ['XS', 'S', 'M', 'L', 'XL']

export const handler: Handler = async (event) => {
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

    const sql = await getDatabaseConnectionForWrites()

    let body: UpdateRoadmapItemRequest
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

    // Validate enum fields
    if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority)) {
      return errorResponse(400, `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}`)
    }

    if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
      return errorResponse(400, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`)
    }

    if (body.project_type !== undefined && !VALID_PROJECT_TYPES.includes(body.project_type)) {
      return errorResponse(400, `Invalid project_type. Must be one of: ${VALID_PROJECT_TYPES.join(', ')}`)
    }

    if (body.ux_size !== undefined && !VALID_SIZES.includes(body.ux_size)) {
      return errorResponse(400, `Invalid ux_size. Must be one of: ${VALID_SIZES.join(', ')}`)
    }

    if (body.content_size !== undefined && !VALID_SIZES.includes(body.content_size)) {
      return errorResponse(400, `Invalid content_size. Must be one of: ${VALID_SIZES.join(', ')}`)
    }

    // Validate numeric fields
    if (body.ux_score !== undefined && (typeof body.ux_score !== 'number' || isNaN(body.ux_score))) {
      return errorResponse(400, 'Invalid ux_score: must be a number')
    }

    if (body.content_score !== undefined && (typeof body.content_score !== 'number' || isNaN(body.content_score))) {
      return errorResponse(400, 'Invalid content_score: must be a number')
    }

    // Resolve camelCase vs snake_case (prefer camelCase)
    const uxFocusWeeks = body.uxFocusWeeks ?? body.ux_focus_weeks
    const contentFocusWeeks = body.contentFocusWeeks ?? body.content_focus_weeks
    const uxWorkWeeks = body.uxWorkWeeks ?? body.ux_work_weeks
    const contentWorkWeeks = body.contentWorkWeeks ?? body.content_work_weeks

    if (uxFocusWeeks !== undefined && (typeof uxFocusWeeks !== 'number' || uxFocusWeeks < 0)) {
      return errorResponse(400, 'Invalid uxFocusWeeks: must be a non-negative number')
    }
    if (contentFocusWeeks !== undefined && (typeof contentFocusWeeks !== 'number' || contentFocusWeeks < 0)) {
      return errorResponse(400, 'Invalid contentFocusWeeks: must be a non-negative number')
    }
    if (uxWorkWeeks !== undefined && (typeof uxWorkWeeks !== 'number' || uxWorkWeeks < 0)) {
      return errorResponse(400, 'Invalid uxWorkWeeks: must be a non-negative number')
    }
    if (contentWorkWeeks !== undefined && (typeof contentWorkWeeks !== 'number' || contentWorkWeeks < 0)) {
      return errorResponse(400, 'Invalid contentWorkWeeks: must be a non-negative number')
    }

    // Validate dates
    if (body.startDate !== undefined && body.startDate !== null) {
      if (isNaN(new Date(body.startDate).getTime())) {
        return errorResponse(400, 'Invalid startDate: must be a valid date string')
      }
    }
    if (body.endDate !== undefined && body.endDate !== null) {
      if (isNaN(new Date(body.endDate).getTime())) {
        return errorResponse(400, 'Invalid endDate: must be a valid date string')
      }
    }

    const complexityFields = [
      body.ux_product_risk,
      body.ux_problem_ambiguity,
      body.content_surface_area,
      body.content_localization_scope,
    ]
    for (const val of complexityFields) {
      if (val !== undefined && (typeof val !== 'number' || val < 1 || val > 5)) {
        return errorResponse(400, 'Complexity factors must be numbers between 1 and 5')
      }
    }

    // Fetch current item — verify session ownership via scenario join
    const current = await sql<DatabaseRoadmapItem>`
      SELECT ri.* FROM roadmap_items ri
      JOIN scenarios s ON s.id = ri.scenario_id AND s.session_id = ${sessionId}
      WHERE ri.id = ${body.id}
    `

    if (current.length === 0) {
      return errorResponse(404, 'Roadmap item not found')
    }

    const currentItem = current[0]

    // Normalize to camelCase for roadmapItemToDbFormat
    const normalizedBody: Partial<RoadmapItem> = {
      ...body,
      uxFocusWeeks: uxFocusWeeks,
      contentFocusWeeks: contentFocusWeeks,
      uxWorkWeeks: uxWorkWeeks,
      contentWorkWeeks: contentWorkWeeks,
    }

    const updates = roadmapItemToDbFormat(normalizedBody)

    if (body.ux_product_risk !== undefined) updates.ux_product_risk = body.ux_product_risk
    if (body.ux_problem_ambiguity !== undefined) updates.ux_problem_ambiguity = body.ux_problem_ambiguity
    if (body.content_surface_area !== undefined) updates.content_surface_area = body.content_surface_area
    if (body.content_localization_scope !== undefined) {
      updates.content_localization_scope = body.content_localization_scope
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse(400, 'No fields to update')
    }

    // Resolve JSONB fields — use body value if provided, else keep current
    const pmIntake = body.pm_intake !== undefined ? body.pm_intake : currentItem.pm_intake
    const uxFactors = body.ux_factors !== undefined ? body.ux_factors : currentItem.ux_factors
    const contentFactors = body.content_factors !== undefined ? body.content_factors : currentItem.content_factors

    const finalUpdates: Partial<DatabaseRoadmapItem> = {
      ...currentItem,
      ...updates,
    }

    console.log('🔵 [update-roadmap-item] Updating:', {
      itemId: body.id,
      fields: Object.keys(updates),
    })

    const result = await sql<DatabaseRoadmapItem>`
      UPDATE roadmap_items
      SET
        key = ${finalUpdates.key ?? currentItem.key},
        name = ${finalUpdates.name ?? currentItem.name},
        initiative = ${finalUpdates.initiative ?? currentItem.initiative},
        priority = ${finalUpdates.priority ?? currentItem.priority},
        status = ${finalUpdates.status ?? currentItem.status},
        project_type = ${finalUpdates.project_type ?? currentItem.project_type},
        notes = ${finalUpdates.notes ?? currentItem.notes},
        ux_product_risk = ${finalUpdates.ux_product_risk ?? currentItem.ux_product_risk},
        ux_problem_ambiguity = ${finalUpdates.ux_problem_ambiguity ?? currentItem.ux_problem_ambiguity},
        content_surface_area = ${finalUpdates.content_surface_area ?? currentItem.content_surface_area},
        content_localization_scope = ${finalUpdates.content_localization_scope ?? currentItem.content_localization_scope},
        pm_intake = ${pmIntake ? JSON.stringify(pmIntake) : null}::jsonb,
        ux_factors = ${uxFactors ? JSON.stringify(uxFactors) : null}::jsonb,
        content_factors = ${contentFactors ? JSON.stringify(contentFactors) : null}::jsonb,
        ux_score = ${finalUpdates.ux_score ?? currentItem.ux_score},
        content_score = ${finalUpdates.content_score ?? currentItem.content_score},
        ux_size = ${finalUpdates.ux_size ?? currentItem.ux_size},
        content_size = ${finalUpdates.content_size ?? currentItem.content_size},
        ux_focus_weeks = ${finalUpdates.ux_focus_weeks ?? currentItem.ux_focus_weeks},
        content_focus_weeks = ${finalUpdates.content_focus_weeks ?? currentItem.content_focus_weeks},
        ux_work_weeks = ${finalUpdates.ux_work_weeks ?? currentItem.ux_work_weeks},
        content_work_weeks = ${finalUpdates.content_work_weeks ?? currentItem.content_work_weeks},
        start_date = ${finalUpdates.start_date ?? currentItem.start_date},
        end_date = ${finalUpdates.end_date ?? currentItem.end_date},
        updated_at = NOW()
      WHERE id = ${body.id}
      RETURNING *
    `

    if (result.length === 0) {
      return errorResponse(404, 'Roadmap item not found after update')
    }

    // Update scenario demand after item change
    await sql`
      UPDATE scenarios
      SET
        demand_ux_design = (
          SELECT COALESCE(SUM(ux_focus_weeks), 0) FROM roadmap_items WHERE scenario_id = ${currentItem.scenario_id}
        ),
        demand_content_design = (
          SELECT COALESCE(SUM(content_focus_weeks), 0) FROM roadmap_items WHERE scenario_id = ${currentItem.scenario_id}
        )
      WHERE id = ${currentItem.scenario_id}
    `

    console.log('🟢 [update-roadmap-item] Updated successfully:', { itemId: result[0]?.id })

    const item: RoadmapItemResponse = dbRoadmapItemToRoadmapItemResponse(result[0])

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    }
  } catch (error) {
    console.error('Error updating roadmap item:', error)
    return errorResponse(500, 'Failed to update roadmap item', error instanceof Error ? error.message : 'Unknown error')
  }
}
