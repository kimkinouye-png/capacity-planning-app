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
 * Maximum number of retry attempts for database connections (READ operations)
 */
const MAX_RETRIES_READ = 3

/**
 * Maximum number of retry attempts for database connections (WRITE operations)
 * Writes need more retries because they take longer when compute is waking up
 */
const MAX_RETRIES_WRITE = 5

/**
 * Initial delay in milliseconds before first retry (READ operations)
 */
const INITIAL_RETRY_DELAY_READ = 1000

/**
 * Initial delay in milliseconds before first retry (WRITE operations)
 * Writes use longer delays to allow more time for compute wake-up
 */
const INITIAL_RETRY_DELAY_WRITE = 2000

/**
 * Maximum delay in milliseconds between retries (READ operations)
 */
const MAX_RETRY_DELAY_READ = 5000

/**
 * Maximum delay in milliseconds between retries (WRITE operations)
 */
const MAX_RETRY_DELAY_WRITE = 16000

/**
 * Connection timeout in seconds for READ operations (allows time for Neon compute to wake up)
 */
const CONNECTION_TIMEOUT_READ = 15

/**
 * Connection timeout in seconds for WRITE operations
 * Writes take longer when compute is waking up, so we need more time
 */
const CONNECTION_TIMEOUT_WRITE = 30

/**
 * Enhance connection string with timeout parameters
 * 
 * Adds connection timeout and SSL mode to the connection string to handle
 * Neon compute suspension wake-up delays.
 * 
 * @param connectionString - The original database connection string
 * @param timeoutSeconds - Connection timeout in seconds
 */
function enhanceConnectionString(connectionString: string, timeoutSeconds: number): string {
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
  params.set('connect_timeout', timeoutSeconds.toString())
  
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
 * Calculate exponential backoff delay for READ operations
 */
function calculateRetryDelayRead(attempt: number): number {
  const delay = INITIAL_RETRY_DELAY_READ * Math.pow(2, attempt)
  return Math.min(delay, MAX_RETRY_DELAY_READ)
}

/**
 * Calculate exponential backoff delay for WRITE operations
 * Uses longer delays: 2s → 4s → 8s → 16s → 16s (capped)
 */
function calculateRetryDelayWrite(attempt: number): number {
  const delay = INITIAL_RETRY_DELAY_WRITE * Math.pow(2, attempt)
  return Math.min(delay, MAX_RETRY_DELAY_WRITE)
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
 * Get database connection with retry logic and timeout configuration for READ operations
 * 
 * Uses @neondatabase/serverless with enhanced connection string that includes
 * timeout parameters to allow Neon compute to wake up from suspension.
 * 
 * Configuration:
 * - Timeout: 15 seconds
 * - Retries: 3 attempts
 * - Delays: 1s → 2s → 4s (exponential backoff, max 5s)
 */
export async function getDatabaseConnection(): Promise<NeonQueryFunction<any>> {
  return getDatabaseConnectionInternal(
    CONNECTION_TIMEOUT_READ,
    MAX_RETRIES_READ,
    calculateRetryDelayRead,
    'READ'
  )
}

/**
 * Get database connection with retry logic and timeout configuration for WRITE operations
 * 
 * Write operations (INSERT, UPDATE) take longer when Neon compute is waking up,
 * so they need:
 * - Longer timeout: 30 seconds
 * - More retries: 5 attempts
 * - Longer delays: 2s → 4s → 8s → 16s → 16s (exponential backoff, max 16s)
 * - Wakeup query: Pings database before write to ensure compute is ready
 * 
 * This function should be used for:
 * - create-scenario.ts
 * - create-roadmap-item.ts
 * - update-scenario.ts
 * - update-roadmap-item.ts
 * - update-settings.ts
 * - delete-scenario.ts
 * - delete-roadmap-item.ts
 */
export async function getDatabaseConnectionForWrites(): Promise<NeonQueryFunction<any>> {
  return getDatabaseConnectionInternal(
    CONNECTION_TIMEOUT_WRITE,
    MAX_RETRIES_WRITE,
    calculateRetryDelayWrite,
    'WRITE'
  )
}

/**
 * Internal function to get database connection with configurable timeout and retry settings
 */
async function getDatabaseConnectionInternal(
  timeoutSeconds: number,
  maxRetries: number,
  calculateDelay: (attempt: number) => number,
  operationType: 'READ' | 'WRITE'
): Promise<NeonQueryFunction<any>> {
  const connectionString = process.env.NETLIFY_DATABASE_URL
  
  if (!connectionString) {
    throw new Error('NETLIFY_DATABASE_URL environment variable is not set')
  }

  // Enhance connection string with timeout parameters
  const enhancedConnectionString = enhanceConnectionString(connectionString, timeoutSeconds)
  
  let lastError: Error | null = null
  
  // Retry loop
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const attemptStartTime = Date.now()
    try {
      // Use @neondatabase/serverless with enhanced connection string
      // The enhanced connection string includes connect_timeout parameter
      const sql = neon(enhancedConnectionString)
      
      // For WRITE operations, send a wakeup query first to ensure compute is ready
      // This helps ensure the subsequent write operation will succeed
      // Note: If database is suspended, this will take time, but it's necessary
      if (operationType === 'WRITE') {
        try {
          const wakeupStartTime = Date.now()
          // Wakeup query: Simple SELECT to wake up the compute if suspended
          // This is a quick operation if DB is active, but may take time if suspended
          await sql`SELECT 1`
          const wakeupEndTime = Date.now()
          const wakeupDuration = wakeupEndTime - wakeupStartTime
          console.log(`🟢 [${operationType}] Database wakeup successful`, {
            attempt: attempt + 1,
            wakeupDuration: `${wakeupDuration}ms`,
            wakeupDurationSeconds: `${(wakeupDuration / 1000).toFixed(2)}s`
          })
        } catch (wakeupError) {
          // If wakeup fails, we'll retry the whole connection
          throw wakeupError
        }
      } else {
        // For READ operations, just test the connection
        await sql`SELECT 1`
      }
      
      const attemptEndTime = Date.now()
      const attemptDuration = attemptEndTime - attemptStartTime
      console.log(`✅ [${operationType}] Database connection established`, {
        attempt: attempt + 1,
        totalAttempts: maxRetries,
        attemptDuration: `${attemptDuration}ms`,
        attemptDurationSeconds: `${(attemptDuration / 1000).toFixed(2)}s`
      })
      return sql
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      const attemptEndTime = Date.now()
      const attemptDuration = attemptEndTime - attemptStartTime
      
      // Check if error is retryable
      if (!isRetryableError(error) || attempt === maxRetries - 1) {
        // Not retryable or last attempt, throw immediately
        console.error(`❌ [${operationType}] Database connection failed after ${attempt + 1} attempts`, {
          error: lastError.message,
          totalAttempts: attempt + 1,
          totalDuration: `${attemptDuration}ms`,
          totalDurationSeconds: `${(attemptDuration / 1000).toFixed(2)}s`
        })
        throw lastError
      }
      
      // Calculate delay for next retry
      const delay = calculateDelay(attempt)
      console.log(`⏳ [${operationType}] Database connection attempt ${attempt + 1}/${maxRetries} failed`, {
        error: lastError.message,
        attemptDuration: `${attemptDuration}ms`,
        retryDelay: `${delay}ms`,
        nextAttempt: attempt + 2
      })
      
      // Wait before retrying
      await sleep(delay)
    }
  }
  
  // Should never reach here, but TypeScript requires it
  throw lastError || new Error(`Failed to establish database connection after ${maxRetries} retries`)
}

/**
 * Execute a database query with automatic retry on connection errors (READ operations)
 */
export async function executeQuery<T = any>(
  queryFn: (sql: NeonQueryFunction<any>) => Promise<T>
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < MAX_RETRIES_READ; attempt++) {
    try {
      const sql = await getDatabaseConnection()
      return await queryFn(sql)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Check if error is retryable
      if (!isRetryableError(error) || attempt === MAX_RETRIES_READ - 1) {
        throw lastError
      }
      
      const delay = calculateRetryDelayRead(attempt)
      console.log(`Query attempt ${attempt + 1}/${MAX_RETRIES_READ} failed: ${lastError.message}. Retrying in ${delay}ms...`)
      await sleep(delay)
    }
  }
  
  throw lastError || new Error('Query failed after all retries')
}

/**
 * Execute a database query with automatic retry on connection errors (WRITE operations)
 * Uses write-specific timeout and retry configuration
 */
export async function executeWriteQuery<T = any>(
  queryFn: (sql: NeonQueryFunction<any>) => Promise<T>
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < MAX_RETRIES_WRITE; attempt++) {
    try {
      const sql = await getDatabaseConnectionForWrites()
      return await queryFn(sql)
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Check if error is retryable
      if (!isRetryableError(error) || attempt === MAX_RETRIES_WRITE - 1) {
        throw lastError
      }
      
      const delay = calculateRetryDelayWrite(attempt)
      console.log(`Write query attempt ${attempt + 1}/${MAX_RETRIES_WRITE} failed: ${lastError.message}. Retrying in ${delay}ms...`)
      await sleep(delay)
    }
  }
  
  throw lastError || new Error('Write query failed after all retries')
}
