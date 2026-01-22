/**
 * Parsing utilities for pasted roadmap items from spreadsheet data
 * 
 * Supports two formats:
 * - 4-column (legacy): Title | Start date | End date | Effort weeks
 * - 5-column (preferred): Title | Start date | End date | UX effort weeks | Content effort weeks
 * 
 * Pasted effort values are mapped to uxFocusWeeks and contentFocusWeeks fields,
 * which are used by scenario summary and committed plan calculations.
 * 
 * Note: While values are saved correctly, the UI display in Roadmap Items grid
 * and item detail pages may not yet reflect pasted values (shows defaults instead).
 * 
 * Start/end dates are currently stored in the initiative field as a temporary workaround.
 * Complexity calculators do not yet read from pasted effort values.
 */

export interface PastedRoadmapItem {
  title: string
  startDate?: string
  endDate?: string
  effortWeeks?: number // Legacy: single effort column (4-column format)
  effortWeeksRaw?: string // Track original string to detect invalid parsing
  uxEffortWeeks?: number // 5-column format: UX effort
  uxEffortWeeksRaw?: string // Track original string for validation
  contentEffortWeeks?: number // 5-column format: Content effort
  contentEffortWeeksRaw?: string // Track original string for validation
}

export interface ParsedRow {
  item: PastedRoadmapItem
  isValid: boolean
  errorMessage?: string
}

/**
 * Detects if a row is a header row and determines column format (4 or 5 columns)
 * Returns: { isHeader: boolean, isFiveColumn: boolean }
 */
function detectHeaderAndFormat(row: string[]): { isHeader: boolean; isFiveColumn: boolean } {
  if (row.length === 0) return { isHeader: false, isFiveColumn: false }
  
  const firstCell = row[0].trim().toLowerCase()
  if (!firstCell.includes('title')) return { isHeader: false, isFiveColumn: false }
  
  // Check if all cells are non-numeric (typical of headers)
  const allNonNumeric = row.every((cell) => {
    const trimmed = cell.trim()
    if (trimmed === '') return true
    const num = Number(trimmed)
    return isNaN(num) || !isFinite(num)
  })
  
  if (!allNonNumeric) return { isHeader: false, isFiveColumn: false }
  
  // Check if this is a 5-column format by looking for UX/Content labels in columns 4 and 5
  const isFiveColumn = row.length >= 5 && 
    (row[3]?.trim().toLowerCase().includes('ux') || 
     row[3]?.trim().toLowerCase().includes('effort')) &&
    (row[4]?.trim().toLowerCase().includes('content') || 
     row[4]?.trim().toLowerCase().includes('effort'))
  
  return { isHeader: true, isFiveColumn }
}


/**
 * Parses a numeric effort value from a string
 */
function parseEffortValue(str: string): { value: number | undefined; raw: string | undefined } {
  const trimmed = str.trim()
  if (!trimmed) return { value: undefined, raw: undefined }
  
  const raw = trimmed
  const parsed = Number(trimmed)
  if (isFinite(parsed) && !isNaN(parsed)) {
    return { value: parsed, raw }
  }
  return { value: undefined, raw }
}

/**
 * Parses a single row into a PastedRoadmapItem
 * Supports both 4-column and 5-column formats:
 * - 4-column: Title | Start date | End date | Effort weeks
 * - 5-column: Title | Start date | End date | UX effort weeks | Content effort weeks
 */
function parseRow(row: string[], isFiveColumn: boolean): PastedRoadmapItem {
  const title = row[0]?.trim() || ''
  const startDate = row[1]?.trim() || undefined
  const endDate = row[2]?.trim() || undefined

  if (isFiveColumn) {
    // 5-column format: separate UX and Content effort
    const uxEffortStr = row[3]?.trim() || ''
    const contentEffortStr = row[4]?.trim() || ''
    
    const uxEffort = parseEffortValue(uxEffortStr)
    const contentEffort = parseEffortValue(contentEffortStr)

    return {
      title,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      uxEffortWeeks: uxEffort.value,
      uxEffortWeeksRaw: uxEffort.raw,
      contentEffortWeeks: contentEffort.value,
      contentEffortWeeksRaw: contentEffort.raw,
    }
  } else {
    // 4-column format: single effort column (legacy)
    const effortWeeksStr = row[3]?.trim() || ''
    const effortWeeks = parseEffortValue(effortWeeksStr)

    return {
      title,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      effortWeeks: effortWeeks.value,
      effortWeeksRaw: effortWeeks.raw,
    }
  }
}

/**
 * Validates a parsed roadmap item
 */
function validateItem(item: PastedRoadmapItem): { isValid: boolean; errorMessage?: string } {
  const errors: string[] = []
  
  // Check for missing title
  if (!item.title || item.title.trim() === '') {
    errors.push('Missing title')
  }

  // Check for 5-column format (UX/Content effort)
  if (item.uxEffortWeeksRaw !== undefined || item.contentEffortWeeksRaw !== undefined) {
    // If UX effort raw was provided but value is undefined, parsing failed
    if (item.uxEffortWeeksRaw !== undefined && item.uxEffortWeeks === undefined) {
      errors.push('UX effort is not a number')
    }
    
    // If Content effort raw was provided but value is undefined, parsing failed
    if (item.contentEffortWeeksRaw !== undefined && item.contentEffortWeeks === undefined) {
      errors.push('Content effort is not a number')
    }
    
    // If values are provided, they must be finite
    if (item.uxEffortWeeks !== undefined && (!isFinite(item.uxEffortWeeks) || isNaN(item.uxEffortWeeks))) {
      errors.push('UX effort is not a number')
    }
    
    if (item.contentEffortWeeks !== undefined && (!isFinite(item.contentEffortWeeks) || isNaN(item.contentEffortWeeks))) {
      errors.push('Content effort is not a number')
    }
  } else {
    // Legacy 4-column format validation
    // If effortWeeksRaw was provided but effortWeeks is undefined, parsing failed
    if (item.effortWeeksRaw !== undefined && item.effortWeeks === undefined) {
      errors.push('Effort is not a number')
    }

    // If effortWeeks is provided, it must be finite
    if (item.effortWeeks !== undefined && (!isFinite(item.effortWeeks) || isNaN(item.effortWeeks))) {
      errors.push('Effort is not a number')
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errorMessage: errors.join(', ') }
  }

  return { isValid: true }
}

/**
 * Parses pasted text into roadmap items
 * @param raw - Raw text from textarea (tab-separated, newline-delimited rows)
 * @returns Array of parsed rows with validation status
 */
export function parsePastedRoadmapItems(raw: string): ParsedRow[] {
  if (!raw || raw.trim() === '') {
    return []
  }

  const lines = raw.split('\n').filter((line) => line.trim() !== '')
  if (lines.length === 0) {
    return []
  }

  // Split each line by tabs
  const rows = lines.map((line) => line.split('\t').map((cell) => cell.trim()))

  // Check if first row is a header and detect format
  let startIndex = 0
  let isFiveColumn = false
  
  if (rows.length > 0) {
    const headerInfo = detectHeaderAndFormat(rows[0])
    if (headerInfo.isHeader) {
      startIndex = 1
      isFiveColumn = headerInfo.isFiveColumn
    } else {
      // If no header, try to detect format from first data row
      // If row has 5+ columns, treat it as 5-column format (UX/Content effort)
      // Validation will catch invalid values later
      if (rows[0].length >= 5) {
        isFiveColumn = true
      }
    }
  }

  // Parse remaining rows using detected format
  const parsed: ParsedRow[] = []
  for (let i = startIndex; i < rows.length; i++) {
    const item = parseRow(rows[i], isFiveColumn)
    const validation = validateItem(item)
    parsed.push({
      item,
      isValid: validation.isValid,
      errorMessage: validation.errorMessage,
    })
  }

  return parsed
}

/**
 * Gets summary statistics for parsed items
 */
export function getImportSummary(parsed: ParsedRow[]): { validCount: number; invalidCount: number } {
  const validCount = parsed.filter((row) => row.isValid).length
  const invalidCount = parsed.filter((row) => !row.isValid).length
  return { validCount, invalidCount }
}
