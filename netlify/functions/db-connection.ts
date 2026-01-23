/**
 * Database Connection Utility
 * 
 * Handles Neon database connections with:
 * - Connection timeout configuration (for suspended compute wake-up)
 * - Retry logic with exponential backoff
 * - Connection string parameter enhancement
 */

import { neon, NeonQueryFunction } from '@neondatabase/serverless'

/**
 * Maximum number of retry attempts for database connections
 */
const MAX_RETRIES = 3

/**
 * Initial delay in milliseconds before first retry
 */
const INITIAL_RETRY_DELAY = 1000

/**
 * Maximum delay in milliseconds between retries
 */
const MAX_RETRY_DELAY = 5000

/**
 * Connection timeout in seconds (allows time for Neon compute to wake up)
 */
const CONNECTION_TIMEOUT = 15

/**
 * Enhance connection string with timeout parameters
 * 
 * Adds connection timeout and SSL mode to the connection string to handle
 * Neon compute suspension wake-up delays.
 */
function enhanceConnectionString(connectionString: string): string {
  // Check if connection string already has query parameters
  const hasQueryParams = connectionString.includes('?')
  const separator = hasQueryParams ? '&' : '?'
  
  // Build parameter string
  const params = new URLSearchParams()
  
  // Add SSL mode if not already present
  if (!connectionString.includes('sslmode=')) {
    params.set('sslmode', 'require')
  }
  
  // Add or update connection timeout
  params.set('connect_timeout', CONNECTION_TIMEOUT.toString())
  
  // Append parameters to connection string
  const paramString = params.toString()
  if (paramString) {
    return `${connectionString}${separator}${paramString}`
  }
  
  return connectionString
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Calculate exponential backoff delay
 */
function calculateRetryDelay(attempt: number): number {
  const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt)
  return Math.min(delay, MAX_RETRY_DELAY)
}

/**
 * Check if error is a connection/timeout error that should be retried
 */
function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  
  const errorMessage = error.message.toLowerCase()
  const retryablePatterns = [
    'timeout',
    'connection',
    'econnrefused',
    'econnreset',
    'etimedout',
    'network',
    'suspended',
    'waking',
    'compute',
    'econnaborted',
    'enotfound',
  ]
  
  return retryablePatterns.some(pattern => errorMessage.includes(pattern))
}

/**
 * Get database connection with retry logic and timeout configuration
 * 
 * Uses @neondatabase/serverless with enhanced connection string that includes
 * timeout parameters to allow Neon compute to wake up from suspension.
 */
export async function getDatabaseConnection(): Promise<NeonQueryFunction<any>> {
  const connectionString = process.env.NETLIFY_DATABASE_URL
  
  if (!connectionString) {
    throw new Error('NETLIFY_DATABASE_URL environment variable is not set')
  }

  // Enhance connection string with timeout parameters
  const enhancedConnectionString = enhanceConnectionString(connectionString)
  
  let lastError: Error | null = null
  
  // Retry loop
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Use @neondatabase/serverless with enhanced connection string
      // The enhanced connection string includes connect_timeout parameter
      const sql = neon(enhancedConnectionString)
      
      // Test the connection with a simple query
      // The connect_timeout in the connection string will handle the timeout
      await sql`SELECT 1`
      
      return sql
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Check if error is retryable
      if (!isRetryableError(error) || attempt === MAX_RETRIES - 1) {
        // Not retryable or last attempt, throw immediately
        throw lastError
      }
      
      // Calculate delay for next retry
      const delay = calculateRetryDelay(attempt)
      console.log(`Database connection attempt ${attempt + 1}/${MAX_RETRIES} failed: ${lastError.message}. Retrying in ${delay}ms...`)
      
      // Wait before retrying
      await sleep(delay)
    }
  }
  
  // Should never reach here, but TypeScript requires it
  throw lastError || new Error('Failed to establish database connection after all retries')
}

/**
 * Execute a database query with automatic retry on connection errors
 */
export async function executeQuery<T = any>(
  queryFn: (sql: NeonQueryFunction<any>) => Promise<T>
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const sql = await getDatabaseConnection()
      return await queryFn(sql)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Check if error is retryable
      if (!isRetryableError(error) || attempt === MAX_RETRIES - 1) {
        throw lastError
      }
      
      const delay = calculateRetryDelay(attempt)
      console.log(`Query attempt ${attempt + 1}/${MAX_RETRIES} failed: ${lastError.message}. Retrying in ${delay}ms...`)
      await sleep(delay)
    }
  }
  
  throw lastError || new Error('Query failed after all retries')
}
