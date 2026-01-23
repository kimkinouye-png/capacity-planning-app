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
    const sql = await getDatabaseConnectionForWrites()
    
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
    const itemCheck = await sql<{ id: string }>`
      SELECT id FROM roadmap_items WHERE id = ${id}
    `

    if (itemCheck.length === 0) {
      return errorResponse(404, 'Roadmap item not found')
    }

    // Delete the roadmap item (parameterized query)
    await sql`
      DELETE FROM roadmap_items
      WHERE id = ${id}
    `

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
    console.error('Error deleting roadmap item:', error)
    return errorResponse(500, 'Failed to delete roadmap item', error instanceof Error ? error.message : 'Unknown error')
  }
}
