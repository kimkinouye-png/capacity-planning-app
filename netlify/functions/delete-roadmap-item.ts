/**
 * delete-roadmap-item — DELETE roadmap item by id.
 * NEON: getDatabaseConnectionForWrites() → NETLIFY_DATABASE_URL, @neondatabase/serverless.
 * DATA: Identified by query param id only. No session_id check; any client can delete any item.
 * For per-visitor isolation, require sessionId and verify item’s scenario.session_id matches.
 */
import { Handler } from '@netlify/functions'
import { getDatabaseConnectionForWrites } from './db-connection'
import { getSessionIdFromRequest } from './request-session'
import { errorResponse, isValidUUID } from './types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-session-id',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
}

interface DeleteRoadmapItemResponse {
  success: boolean
  id: string
}

export const handler: Handler = async (event, context) => {
  const functionStartTime = Date.now()
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    }
  }

  if (event.httpMethod !== 'DELETE') {
    return errorResponse(405, 'Method not allowed')
  }

  try {
    const sessionId = getSessionIdFromRequest(event)
    if (!sessionId) {
      return errorResponse(400, 'Missing session ID. Send x-session-id header or sessionId in body.')
    }

    const connectionStartTime = Date.now()
    console.log('🔌 [delete-roadmap-item] Starting database connection...', {
      timestamp: new Date().toISOString()
    })
    
    const sql = await getDatabaseConnectionForWrites()
    
    const connectionEndTime = Date.now()
    const connectionDuration = connectionEndTime - connectionStartTime
    console.log('✅ [delete-roadmap-item] Database connection established', {
      connectionDuration: `${connectionDuration}ms`,
      connectionDurationSeconds: `${(connectionDuration / 1000).toFixed(2)}s`
    })
    
    // Get id from query string
    const id = event.queryStringParameters?.id

    if (!id) {
      return errorResponse(400, 'Missing required parameter: id')
    }

    // Validate UUID format
    if (!isValidUUID(id)) {
      return errorResponse(400, 'Invalid id format')
    }

    const checkStartTime = Date.now()
    const itemCheck = (await sql`
      SELECT ri.id FROM roadmap_items ri
      JOIN scenarios s ON s.id = ri.scenario_id AND s.session_id = ${sessionId}
      WHERE ri.id = ${id}
    `) as { id: string }[]
    const checkEndTime = Date.now()
    const checkDuration = checkEndTime - checkStartTime
    console.log('🔍 [delete-roadmap-item] Item existence check completed', {
      found: itemCheck.length > 0,
      checkDuration: `${checkDuration}ms`
    })

    if (itemCheck.length === 0) {
      return errorResponse(404, 'Roadmap item not found')
    }

    const deleteStartTime = Date.now()
    await sql`
      DELETE FROM roadmap_items
      WHERE id = ${id}
        AND scenario_id IN (SELECT id FROM scenarios WHERE session_id = ${sessionId})
    `
    const deleteEndTime = Date.now()
    const deleteDuration = deleteEndTime - deleteStartTime
    console.log('🗑️ [delete-roadmap-item] Delete query completed', {
      deleteDuration: `${deleteDuration}ms`
    })

    const functionEndTime = Date.now()
    const totalDuration = functionEndTime - functionStartTime
    console.log('✅ [delete-roadmap-item] Function completed successfully', {
      totalDuration: `${totalDuration}ms`,
      totalDurationSeconds: `${(totalDuration / 1000).toFixed(2)}s`,
      breakdown: {
        connection: `${connectionDuration}ms`,
        check: `${checkDuration}ms`,
        delete: `${deleteDuration}ms`
      }
    })

    const response: DeleteRoadmapItemResponse = { success: true, id }
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    }
  } catch (error) {
    const functionEndTime = Date.now()
    const totalDuration = functionEndTime - functionStartTime
    console.error('❌ [delete-roadmap-item] Error deleting roadmap item', {
      error: error instanceof Error ? error.message : String(error),
      totalDuration: `${totalDuration}ms`,
      totalDurationSeconds: `${(totalDuration / 1000).toFixed(2)}s`
    })
    return errorResponse(500, 'Failed to delete roadmap item', error instanceof Error ? error.message : 'Unknown error')
  }
}
