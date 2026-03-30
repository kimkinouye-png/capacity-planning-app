/**
 * bulk-import-roadmap-items — POST to import multiple roadmap items into a scenario.
 * Supports three import sources: CSV file, clipboard paste (TSV), and manual array.
 * NEON: getDatabaseConnectionForWrites() → NETLIFY_DATABASE_URL, @neondatabase/serverless.
 * DATA: Requires sessionId; validates scenario ownership before inserting.
 */
import { Handler } from '@netlify/functions'
import { getDatabaseConnectionForWrites } from './db-connection'
import { getSessionIdFromRequest } from './request-session'
import {
  type DatabaseRoadmapItem,
  type CreateRoadmapItemRequest,
  createRoadmapItemRequestToDbFormat,
  dbRoadmapItemToRoadmapItemResponse,
  errorResponse,
  isValidUUID
} from './types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-session-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Expected CSV/TSV column headers (case-insensitive)
const EXPECTED_HEADERS = ['key', 'name', 'priority', 'project_type', 'notes', 'initiative']
const VALID_PRIORITIES = ['P0', 'P1', 'P2', 'P3']
const VALID_PROJECT_TYPES = ['net-new', 'new-feature', 'enhancement', 'optimization', 'fix-polish']

interface ImportRow {
  key: string
  name: string
  priority?: 'P0' | 'P1' | 'P2' | 'P3'
  project_type?: string
  notes?: string
  initiative?: string
}

interface BulkImportRequest {
  scenario_id: string
  source: 'csv' | 'paste' | 'manual'
  // For csv and paste: raw text content
  raw?: string
  // For manual: pre-parsed array
  items?: ImportRow[]
}

/**
 * Parse TSV/CSV text into rows
 * Handles both tab-separated (paste from Excel/Sheets) and comma-separated (CSV file)
 */
function parseDelimitedText(raw: string, source: 'csv' | 'paste'): ImportRow[] {
  const delimiter = source === 'paste' ? '\t' : ','
  const lines = raw.trim().split('\n').map(l => l.trim()).filter(Boolean)

  if (lines.length < 2) {
    throw new Error('Import data must have a header row and at least one data row')
  }

  // Parse headers
  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/['"]/g, ''))

  // Validate at minimum key and name are present
  if (!headers.includes('key') || !headers.includes('name')) {
    throw new Error('Import data must include "key" and "name" columns')
  }

  // Parse data rows
  const rows: ImportRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''))
    const row: Record<string, string> = {}

    headers.forEach((header, index) => {
      if (EXPECTED_HEADERS.includes(header)) {
        row[header] = values[index] || ''
      }
    })

    // Skip empty rows
    if (!row.key && !row.name) continue

    rows.push({
      key: row.key || '',
      name: row.name || '',
      priority: VALID_PRIORITIES.includes(row.priority?.toUpperCase())
        ? (row.priority.toUpperCase() as 'P0' | 'P1' | 'P2' | 'P3')
        : 'P2',
      project_type: VALID_PROJECT_TYPES.includes(row.project_type?.toLowerCase())
        ? row.project_type.toLowerCase()
        : undefined,
      notes: row.notes || undefined,
      initiative: row.initiative || undefined,
    })
  }

  return rows
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const sessionId = getSessionIdFromRequest(event)
    if (!sessionId) {
      return errorResponse(400, 'Missing session ID. Send x-session-id header or sessionId in body.')
    }

    const sql = await getDatabaseConnectionForWrites()

    let body: BulkImportRequest
    try {
      body = JSON.parse(event.body || '{}')
    } catch {
      return errorResponse(400, 'Invalid JSON in request body')
    }

    // Validate required fields
    if (!body.scenario_id) {
      return errorResponse(400, 'Missing required field: scenario_id')
    }

    if (!isValidUUID(body.scenario_id)) {
      return errorResponse(400, 'Invalid scenario_id format')
    }

    if (!body.source || !['csv', 'paste', 'manual'].includes(body.source)) {
      return errorResponse(400, 'Invalid source. Must be: csv, paste, or manual')
    }

    // Verify scenario belongs to this session
    const scenarioCheck = (await sql`
      SELECT id, quarter FROM scenarios
      WHERE id = ${body.scenario_id}
      AND session_id = ${sessionId}
    `) as Record<string, any>[]

    if (scenarioCheck.length === 0) {
      return errorResponse(404, 'Scenario not found')
    }

    const scenarioQuarter = scenarioCheck[0].quarter

    // Parse rows based on source
    let rows: ImportRow[]
    try {
      if (body.source === 'manual') {
        if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
          return errorResponse(400, 'Manual import requires items array')
        }
        rows = body.items
      } else {
        if (!body.raw || typeof body.raw !== 'string') {
          return errorResponse(400, `${body.source} import requires raw text content`)
        }
        rows = parseDelimitedText(body.raw, body.source)
      }
    } catch (parseError) {
      return errorResponse(400,
        'Failed to parse import data',
        parseError instanceof Error ? parseError.message : 'Unknown parse error'
      )
    }

    if (rows.length === 0) {
      return errorResponse(400, 'No valid rows found in import data')
    }

    if (rows.length > 500) {
      return errorResponse(400, 'Import limit is 500 items per request')
    }

    // Validate each row has required fields
    const invalidRows = rows.filter(r => !r.key || !r.name)
    if (invalidRows.length > 0) {
      return errorResponse(400, `${invalidRows.length} row(s) are missing required key or name fields`)
    }

    // Insert all rows
    const inserted: DatabaseRoadmapItem[] = []

    for (const row of rows) {
      const req: CreateRoadmapItemRequest = {
        scenario_id: body.scenario_id,
        short_key: row.key,
        name: row.name,
        priority: row.priority || 'P2',
        quarter: scenarioQuarter,     // locked to scenario quarter
        status: 'draft',
        project_type: row.project_type as CreateRoadmapItemRequest['project_type'],
        notes: row.notes,
        initiative: row.initiative,
      }

      const dbFormat = createRoadmapItemRequestToDbFormat(req)

      const result = (await sql`
        INSERT INTO roadmap_items (
          scenario_id,
          key,
          name,
          initiative,
          priority,
          quarter,
          status,
          project_type,
          notes,
          pm_intake,
          ux_factors,
          content_factors
        )
        VALUES (
          ${dbFormat.scenario_id!},
          ${dbFormat.key!},
          ${dbFormat.name!},
          ${dbFormat.initiative || null},
          ${dbFormat.priority || 'P2'},
          ${dbFormat.quarter || null},
          ${dbFormat.status || 'draft'},
          ${dbFormat.project_type || null},
          ${dbFormat.notes || null},
          ${dbFormat.pm_intake ? JSON.stringify(dbFormat.pm_intake) : null},
          ${dbFormat.ux_factors ? JSON.stringify(dbFormat.ux_factors) : null},
          ${dbFormat.content_factors ? JSON.stringify(dbFormat.content_factors) : null}
        )
        RETURNING *
      `) as DatabaseRoadmapItem[]
      inserted.push(result[0])
    }

    // Update scenario roadmap_items_count and demand
    await sql`
      UPDATE scenarios
      SET
        roadmap_items_count = (
          SELECT COUNT(*) FROM roadmap_items WHERE scenario_id = ${body.scenario_id}
        ),
        demand_ux_design = (
          SELECT COALESCE(SUM(ux_focus_weeks), 0) FROM roadmap_items WHERE scenario_id = ${body.scenario_id}
        ),
        demand_content_design = (
          SELECT COALESCE(SUM(content_focus_weeks), 0) FROM roadmap_items WHERE scenario_id = ${body.scenario_id}
        )
      WHERE id = ${body.scenario_id}
    `

    const responseItems = inserted.map(dbRoadmapItemToRoadmapItemResponse)

    return {
      statusCode: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imported: responseItems.length,
        items: responseItems,
      }),
    }
  } catch (error) {
    console.error('Error bulk importing roadmap items:', error)
    return errorResponse(500, 'Failed to import roadmap items', error instanceof Error ? error.message : 'Unknown error')
  }
}
