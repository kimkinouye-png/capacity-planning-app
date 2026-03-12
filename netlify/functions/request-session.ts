/**
 * request-session — Read visitor session ID from Netlify function request.
 * Prefer header x-session-id; fallback to body.sessionId for POST/PUT.
 * Returns null if missing (caller can return 400 or use default).
 */
import type { HandlerEvent } from '@netlify/functions'

const SESSION_HEADER = 'x-session-id'

export function getSessionIdFromRequest(event: HandlerEvent): string | null {
  const header = event.headers[SESSION_HEADER] ?? event.headers['X-Session-Id']
  if (header && typeof header === 'string' && header.trim()) {
    return header.trim()
  }
  const queryId = event.queryStringParameters?.sessionId ?? event.queryStringParameters?.['session_id']
  if (queryId && typeof queryId === 'string' && queryId.trim()) {
    return queryId.trim()
  }
  try {
    const body = event.body ? JSON.parse(event.body) : {}
    const id = body.sessionId ?? body.session_id
    if (id && typeof id === 'string' && id.trim()) {
      return id.trim()
    }
  } catch {
    // ignore parse error
  }
  return null
}
