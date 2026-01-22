import { Handler } from '@netlify/functions'
import { neon } from '@netlify/neon'
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
    // @netlify/neon automatically uses NETLIFY_DATABASE_URL from environment
    const sql = neon()
    
    let body: UpdateRoadmapItemRequest
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

    // Validate numeric fields if provided
    if (body.ux_score !== undefined && (typeof body.ux_score !== 'number' || isNaN(body.ux_score))) {
      return errorResponse(400, 'Invalid ux_score: must be a number')
    }

    if (body.content_score !== undefined && (typeof body.content_score !== 'number' || isNaN(body.content_score))) {
      return errorResponse(400, 'Invalid content_score: must be a number')
    }

    // Validate numeric fields - check both camelCase (from frontend) and snake_case (backward compatibility)
    const uxFocusWeeks = body.uxFocusWeeks !== undefined ? body.uxFocusWeeks : body.ux_focus_weeks
    const contentFocusWeeks = body.contentFocusWeeks !== undefined ? body.contentFocusWeeks : body.content_focus_weeks
    const uxWorkWeeks = body.uxWorkWeeks !== undefined ? body.uxWorkWeeks : body.ux_work_weeks
    const contentWorkWeeks = body.contentWorkWeeks !== undefined ? body.contentWorkWeeks : body.content_work_weeks

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

    // Validate date fields if provided
    if (body.startDate !== undefined && body.startDate !== null) {
      const startDate = new Date(body.startDate)
      if (isNaN(startDate.getTime())) {
        return errorResponse(400, 'Invalid startDate: must be a valid date string')
      }
    }

    if (body.endDate !== undefined && body.endDate !== null) {
      const endDate = new Date(body.endDate)
      if (isNaN(endDate.getTime())) {
        return errorResponse(400, 'Invalid endDate: must be a valid date string')
      }
    }

    // Validate size bands are valid enum values
    const validSizes = ['XS', 'S', 'M', 'L', 'XL'] as const
    if (body.ux_size !== undefined && !validSizes.includes(body.ux_size)) {
      return errorResponse(400, `Invalid ux_size: must be one of ${validSizes.join(', ')}`)
    }

    if (body.content_size !== undefined && !validSizes.includes(body.content_size)) {
      return errorResponse(400, `Invalid content_size: must be one of ${validSizes.join(', ')}`)
    }

    // Get current roadmap item (parameterized query)
    const current = await sql<DatabaseRoadmapItem>`
      SELECT * FROM roadmap_items WHERE id = ${body.id}
    `
    
    if (current.length === 0) {
      return errorResponse(404, 'Roadmap item not found')
    }

    const currentItem = current[0]
    
    // Normalize request body: convert snake_case to camelCase if present
    const normalizedBody: Partial<RoadmapItem> = {
      ...body,
      // Prefer camelCase, fall back to snake_case for backward compatibility
      uxFocusWeeks: body.uxFocusWeeks ?? body.ux_focus_weeks,
      contentFocusWeeks: body.contentFocusWeeks ?? body.content_focus_weeks,
      uxWorkWeeks: body.uxWorkWeeks ?? body.ux_work_weeks,
      contentWorkWeeks: body.contentWorkWeeks ?? body.content_work_weeks,
    }
    
    // Map request format to database format
    const updates = roadmapItemToDbFormat(normalizedBody)
    
    // Check if there are any updates
    const hasUpdates = Object.keys(updates).length > 0
    if (!hasUpdates) {
      return errorResponse(400, 'No fields to update')
    }

    // Handle JSONB fields from request body - use current values if not provided
    const pmIntake = body.pm_intake !== undefined 
      ? body.pm_intake
      : currentItem.pm_intake
    const uxFactors = body.ux_factors !== undefined
      ? body.ux_factors
      : currentItem.ux_factors
    const contentFactors = body.content_factors !== undefined
      ? body.content_factors
      : currentItem.content_factors

    // Merge updates with current values
    const finalUpdates: Partial<DatabaseRoadmapItem> = {
      ...currentItem,
      ...updates,
    }

    // Debug: Log what we're updating
    console.log('🔵 [update-roadmap-item] Updating database:', {
      itemId: body.id,
      updates: Object.keys(updates),
      finalUpdates: {
        ux_focus_weeks: finalUpdates.ux_focus_weeks,
        content_focus_weeks: finalUpdates.content_focus_weeks,
        start_date: finalUpdates.start_date,
        end_date: finalUpdates.end_date,
      },
      currentItem: {
        ux_focus_weeks: currentItem.ux_focus_weeks,
        content_focus_weeks: currentItem.content_focus_weeks,
        start_date: currentItem.start_date,
        end_date: currentItem.end_date,
      }
    })

    // Update roadmap item (parameterized query - JSONB fields use JSON.stringify then cast to jsonb)
    // Neon parameterizes the JSON string, then PostgreSQL casts it to jsonb
    const result = await sql<DatabaseRoadmapItem>`
      UPDATE roadmap_items
      SET 
        key = ${finalUpdates.key ?? currentItem.key},
        name = ${finalUpdates.name ?? currentItem.name},
        initiative = ${finalUpdates.initiative ?? currentItem.initiative},
        priority = ${finalUpdates.priority ?? currentItem.priority},
        status = ${finalUpdates.status ?? currentItem.status},
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

    console.log('🟢 [update-roadmap-item] Database update result:', {
      itemId: result[0]?.id,
      ux_focus_weeks: result[0]?.ux_focus_weeks,
      content_focus_weeks: result[0]?.content_focus_weeks,
      start_date: result[0]?.start_date,
      end_date: result[0]?.end_date,
    })

    if (result.length === 0) {
      return errorResponse(404, 'Roadmap item not found after update')
    }

    // Transform database format to RoadmapItem format
    const item: RoadmapItemResponse = dbRoadmapItemToRoadmapItemResponse(result[0])

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    }
  } catch (error) {
    console.error('Error updating roadmap item:', error)
    return errorResponse(500, 'Failed to update roadmap item', error instanceof Error ? error.message : 'Unknown error')
  }
}
