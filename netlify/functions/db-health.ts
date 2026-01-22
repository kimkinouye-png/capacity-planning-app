import { Handler } from '@netlify/functions'
import { neon } from '@netlify/neon'
import { errorResponse } from './types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

interface HealthResponse {
  status: 'ok' | 'error'
  message: string
  timestamp: string
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

  if (event.httpMethod !== 'GET') {
    return errorResponse(405, 'Method not allowed')
  }

  try {
    // @netlify/neon automatically uses NETLIFY_DATABASE_URL from environment
    const sql = neon()

    // Perform a trivial query to verify database connection
    const result = await sql`SELECT 1 as health_check`

    if (result && result.length > 0 && result[0].health_check === 1) {
      const response: HealthResponse = {
        status: 'ok',
        message: 'Database connection successful',
        timestamp: new Date().toISOString(),
      }

      return {
        statusCode: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
      }
    } else {
      // Unexpected response format
      return errorResponse(500, 'Database health check returned unexpected result')
    }
  } catch (error) {
    console.error('Database health check failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    const response: HealthResponse = {
      status: 'error',
      message: `Database connection failed: ${errorMessage}`,
      timestamp: new Date().toISOString(),
    }

    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response),
    }
  }
}
