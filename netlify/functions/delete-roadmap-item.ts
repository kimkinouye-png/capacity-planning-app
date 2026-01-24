import { Handler } from '@netlify/functions'
import { getDatabaseConnectionForWrites } from './db-connection'
import { errorResponse, isValidUUID } from './types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
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
    // Get database connection with write-specific timeout and retry logic
    // Writes need 30s timeout and 5 retries to handle Neon compute wake-up
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

    // Check if roadmap item exists (parameterized query)
    const checkStartTime = Date.now()
    const itemCheck = await sql<{ id: string }>`
      SELECT id FROM roadmap_items WHERE id = ${id}
    `
    const checkEndTime = Date.now()
    const checkDuration = checkEndTime - checkStartTime
    console.log('🔍 [delete-roadmap-item] Item existence check completed', {
      found: itemCheck.length > 0,
      checkDuration: `${checkDuration}ms`
    })

    if (itemCheck.length === 0) {
      return errorResponse(404, 'Roadmap item not found')
    }

    // Delete the roadmap item (parameterized query)
    const deleteStartTime = Date.now()
    await sql`
      DELETE FROM roadmap_items
      WHERE id = ${id}
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
