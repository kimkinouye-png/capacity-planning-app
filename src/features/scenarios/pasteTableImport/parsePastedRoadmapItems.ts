/**
 * Parsing utilities for pasted roadmap items from spreadsheet data
 *
 * Supported formats (auto-detected by header or column count):
 *
 * V2 format (preferred):
 *   Name | Short Key | Initiative | Priority | Project Type
 *
 * Legacy format (still supported):
 *   Title | Start date | End date | UX effort weeks | Content effort weeks
 *   Title | Start date | End date | Effort weeks
 */

export interface PastedRoadmapItem {
  title: string
  shortKey?: string
  initiative?: string
  priority?: string
  projectType?: string
  // Legacy effort fields
  startDate?: string
  endDate?: string
  effortWeeks?: number
  effortWeeksRaw?: string
  uxEffortWeeks?: number
  uxEffortWeeksRaw?: string
  contentEffortWeeks?: number
  contentEffortWeeksRaw?: string
}

export interface ParsedRow {
  item: PastedRoadmapItem
  isValid: boolean
  errorMessage?: string
}

type FormatType = 'v2' | 'legacy5' | 'legacy4' | 'unknown'

const VALID_PRIORITIES = ['P0', 'P1', 'P2', 'P3']

const PROJECT_TYPE_MAP: Record<string, string> = {
  'new product': 'net-new',
  'net new': 'net-new',
  'net-new': 'net-new',
  'new feature': 'new-feature',
  'new-feature': 'new-feature',
  enhancement: 'enhancement',
  optimization: 'optimization',
  'fix & polish': 'fix-polish',
  'fix/polish': 'fix-polish',
  'fix-polish': 'fix-polish',
}

function normalizeProjectType(raw: string): string {
  const lower = raw.trim().toLowerCase()
  return PROJECT_TYPE_MAP[lower] ?? 'new-feature'
}

function normalizePriority(raw: string): string {
  const upper = raw.trim().toUpperCase()
  if (VALID_PRIORITIES.includes(upper)) return upper
  // Try to extract P0-P3 from strings like "P1 - High"
  const match = upper.match(/P[0-3]/)
  if (match) return match[0]
  return 'P1' // default
}

function detectFormat(headerRow: string[]): FormatType {
  const cells = headerRow.map((c) => c.trim().toLowerCase())

  // V2 detection: first col is name/title, second col looks like key/short key
  const hasNameCol = cells[0].includes('name') || cells[0].includes('title')
  const hasKeyCol = cells[1]?.includes('key') || cells[1]?.includes('short')
  const hasPriorityCol = cells.some((c) => c.includes('priority'))

  if (hasNameCol && (hasKeyCol || hasPriorityCol)) {
    return 'v2'
  }

  // Legacy 5-column detection
  const hasUxCol = cells[3]?.includes('ux') || cells[3]?.includes('effort')
  const hasContentCol = cells[4]?.includes('content') || cells[4]?.includes('effort')
  if (hasNameCol && hasUxCol && hasContentCol) {
    return 'legacy5'
  }

  // Legacy 4-column
  if (hasNameCol) {
    return 'legacy4'
  }

  return 'unknown'
}

function detectFormatFromData(row: string[]): FormatType {
  // If 5+ columns and col 3 is not a number, likely V2
  if (row.length >= 4) {
    const col3 = row[3]?.trim()
    const col3IsNum = col3 !== '' && isFinite(Number(col3))
    if (!col3IsNum) return 'v2'
  }
  // If 5 columns and col 3/4 look numeric, legacy5
  if (row.length >= 5) {
    return 'legacy5'
  }
  return 'legacy4'
}

function parseV2Row(row: string[]): PastedRoadmapItem {
  const title = row[0]?.trim() || ''
  const shortKey = row[1]?.trim() || undefined
  const initiative = row[2]?.trim() || undefined
  const priorityRaw = row[3]?.trim() || ''
  const projectTypeRaw = row[4]?.trim() || ''

  return {
    title,
    shortKey: shortKey || undefined,
    initiative: initiative || undefined,
    priority: priorityRaw ? normalizePriority(priorityRaw) : 'P1',
    projectType: projectTypeRaw ? normalizeProjectType(projectTypeRaw) : 'new-feature',
  }
}

function parseLegacyRow(row: string[], isFiveColumn: boolean): PastedRoadmapItem {
  const title = row[0]?.trim() || ''
  const startDate = row[1]?.trim() || undefined
  const endDate = row[2]?.trim() || undefined

  if (isFiveColumn) {
    const uxRaw = row[3]?.trim() || ''
    const contentRaw = row[4]?.trim() || ''
    const uxVal = Number(uxRaw)
    const contentVal = Number(contentRaw)
    return {
      title,
      startDate,
      endDate,
      uxEffortWeeks: isFinite(uxVal) && uxRaw !== '' ? uxVal : undefined,
      uxEffortWeeksRaw: uxRaw || undefined,
      contentEffortWeeks: isFinite(contentVal) && contentRaw !== '' ? contentVal : undefined,
      contentEffortWeeksRaw: contentRaw || undefined,
    }
  } else {
    const effortRaw = row[3]?.trim() || ''
    const effortVal = Number(effortRaw)
    return {
      title,
      startDate,
      endDate,
      effortWeeks: isFinite(effortVal) && effortRaw !== '' ? effortVal : undefined,
      effortWeeksRaw: effortRaw || undefined,
    }
  }
}

function validateV2Item(item: PastedRoadmapItem): { isValid: boolean; errorMessage?: string } {
  if (!item.title || item.title.trim() === '') {
    return { isValid: false, errorMessage: 'Missing name' }
  }
  return { isValid: true }
}

function validateLegacyItem(item: PastedRoadmapItem): { isValid: boolean; errorMessage?: string } {
  const errors: string[] = []

  if (!item.title || item.title.trim() === '') {
    errors.push('Missing title')
  }

  if (item.uxEffortWeeksRaw !== undefined || item.contentEffortWeeksRaw !== undefined) {
    if (item.uxEffortWeeksRaw !== undefined && item.uxEffortWeeks === undefined) {
      errors.push('UX effort is not a number')
    }
    if (item.contentEffortWeeksRaw !== undefined && item.contentEffortWeeks === undefined) {
      errors.push('Content effort is not a number')
    }
  } else if (item.effortWeeksRaw !== undefined && item.effortWeeks === undefined) {
    errors.push('Effort is not a number')
  }

  if (errors.length > 0) {
    return { isValid: false, errorMessage: errors.join(', ') }
  }
  return { isValid: true }
}

export function parsePastedRoadmapItems(raw: string): ParsedRow[] {
  if (!raw || raw.trim() === '') return []

  const lines = raw.split('\n').filter((line) => line.trim() !== '')
  if (lines.length === 0) return []

  const rows = lines.map((line) => line.split('\t').map((cell) => cell.trim()))

  let startIndex = 0
  let format: FormatType = 'unknown'

  // Try to detect format from first row
  const firstRow = rows[0]
  const allNonNumeric = firstRow.every((cell) => {
    const trimmed = cell.trim()
    if (trimmed === '') return true
    return isNaN(Number(trimmed)) || !isFinite(Number(trimmed))
  })

  if (allNonNumeric && firstRow.length >= 2) {
    format = detectFormat(firstRow)
    if (format !== 'unknown') {
      startIndex = 1
    } else {
      format = detectFormatFromData(firstRow)
      startIndex = 0
    }
  } else {
    format = detectFormatFromData(firstRow)
    startIndex = 0
  }

  if (format === 'unknown') format = 'v2'

  // Header was recognized but there is no following row — treat first line as data
  if (startIndex >= rows.length) {
    format = detectFormatFromData(firstRow)
    if (format === 'unknown') format = 'v2'
    startIndex = 0
  }

  const parsed: ParsedRow[] = []

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i]
    if (row.every((c) => c === '')) continue // skip blank rows

    let item: PastedRoadmapItem
    let validation: { isValid: boolean; errorMessage?: string }

    if (format === 'v2') {
      item = parseV2Row(row)
      validation = validateV2Item(item)
    } else {
      item = parseLegacyRow(row, format === 'legacy5')
      validation = validateLegacyItem(item)
    }

    parsed.push({ item, isValid: validation.isValid, errorMessage: validation.errorMessage })
  }

  return parsed
}

export function getImportSummary(parsed: ParsedRow[]): { validCount: number; invalidCount: number } {
  const validCount = parsed.filter((row) => row.isValid).length
  const invalidCount = parsed.filter((row) => !row.isValid).length
  return { validCount, invalidCount }
}
