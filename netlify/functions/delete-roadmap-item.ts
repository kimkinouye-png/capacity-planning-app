import { Handler } from '@netlify/functions'
import { neon } from '@netlify/neon'

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
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    // @netlify/neon automatically uses NETLIFY_DATABASE_URL from environment
    const sql = neon()
    
    // Get id from query string
    const id = event.queryStringParameters?.id

    if (!id) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Missing required parameter: id' }),
      }
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return {
        statusCode: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Invalid id format' }),
      }
    }

    // Check if roadmap item exists (parameterized query)
    const itemCheck = await sql<{ id: string }>`
      SELECT id FROM roadmap_items WHERE id = ${id}
    `

    if (itemCheck.length === 0) {
      return {
        statusCode: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Roadmap item not found' }),
      }
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
    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: 'Failed to delete roadmap item', details: error instanceof Error ? error.message : 'Unknown error' }),
    }
  }
}
