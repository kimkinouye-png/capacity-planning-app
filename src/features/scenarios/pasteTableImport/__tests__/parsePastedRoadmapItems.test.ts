import { describe, it, expect } from 'vitest'
import { parsePastedRoadmapItems, getImportSummary, type ParsedRow } from '../parsePastedRoadmapItems'

describe('parsePastedRoadmapItems', () => {
  describe('data with no header row', () => {
    it('should parse simple tab-separated data', () => {
      const input = 'Feature A\t2024-01-01\t2024-03-31\t6.0'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].item.title).toBe('Feature A')
      expect(result[0].item.startDate).toBe('2024-01-01')
      expect(result[0].item.endDate).toBe('2024-03-31')
      expect(result[0].item.effortWeeks).toBe(6.0)
      expect(result[0].isValid).toBe(true)
    })

    it('should parse multiple rows', () => {
      const input = `Feature A\t2024-01-01\t2024-03-31\t6.0
Feature B\t2024-02-01\t2024-04-30\t8.0
Feature C\t2024-03-01\t2024-05-31\t4.0`

      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(3)
      expect(result[0].item.title).toBe('Feature A')
      expect(result[1].item.title).toBe('Feature B')
      expect(result[2].item.title).toBe('Feature C')
      expect(result.every((r) => r.isValid)).toBe(true)
    })

    it('should handle missing optional fields', () => {
      const input = 'Feature A\t\t\t6.0'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].item.title).toBe('Feature A')
      expect(result[0].item.startDate).toBeUndefined()
      expect(result[0].item.endDate).toBeUndefined()
      expect(result[0].item.effortWeeks).toBe(6.0)
      expect(result[0].isValid).toBe(true)
    })
  })

  describe('data with header row', () => {
    it('should skip header row when first cell contains "title"', () => {
      const input = `Title\tStart date\tEnd date\tEffort weeks
Feature A\t2024-01-01\t2024-03-31\t6.0`

      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].item.title).toBe('Feature A')
      expect(result[0].isValid).toBe(true)
    })

    it('should skip header row with case-insensitive "title"', () => {
      const input = `TITLE\tStart\tEnd\tWeeks
Feature A\t2024-01-01\t2024-03-31\t6.0`

      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].item.title).toBe('Feature A')
    })

    it('should not skip row if first cell does not contain "title"', () => {
      const input = `Name\tStart\tEnd\tWeeks
Feature A\t2024-01-01\t2024-03-31\t6.0`

      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(2)
      expect(result[0].item.title).toBe('Name')
      expect(result[1].item.title).toBe('Feature A')
    })
  })

  describe('rows with missing titles', () => {
    it('should mark rows with empty title as invalid', () => {
      const input = '\t2024-01-01\t2024-03-31\t6.0'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].isValid).toBe(false)
      expect(result[0].errorMessage).toBe('Missing title')
    })

    it('should mark rows with whitespace-only title as invalid', () => {
      const input = '   \t2024-01-01\t2024-03-31\t6.0'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].isValid).toBe(false)
      expect(result[0].errorMessage).toBe('Missing title')
    })
  })

  describe('rows with non-numeric effort', () => {
    it('should mark rows with non-numeric effort as invalid', () => {
      const input = 'Feature A\t2024-01-01\t2024-03-31\tabc'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].item.title).toBe('Feature A')
      expect(result[0].item.effortWeeks).toBeUndefined()
      expect(result[0].isValid).toBe(false)
      expect(result[0].errorMessage).toBe('Effort is not a number')
    })

    it('should handle empty effort weeks', () => {
      const input = 'Feature A\t2024-01-01\t2024-03-31\t'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].item.title).toBe('Feature A')
      expect(result[0].item.effortWeeks).toBeUndefined()
      expect(result[0].isValid).toBe(true) // Empty effort is valid (optional)
    })

    it('should handle NaN effort weeks', () => {
      const input = 'Feature A\t2024-01-01\t2024-03-31\tNaN'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].isValid).toBe(false)
      expect(result[0].errorMessage).toBe('Effort is not a number')
    })

    it('should handle Infinity effort weeks', () => {
      const input = 'Feature A\t2024-01-01\t2024-03-31\tInfinity'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].isValid).toBe(false)
      expect(result[0].errorMessage).toBe('Effort is not a number')
    })
  })

  describe('mixed valid/invalid rows', () => {
    it('should correctly identify valid and invalid rows', () => {
      const input = `Feature A\t2024-01-01\t2024-03-31\t6.0
\t2024-02-01\t2024-04-30\t8.0
Feature C\t2024-03-01\t2024-05-31\tabc
Feature D\t2024-04-01\t2024-06-30\t4.0`

      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(4)
      expect(result[0].isValid).toBe(true)
      expect(result[1].isValid).toBe(false)
      expect(result[1].errorMessage).toBe('Missing title')
      expect(result[2].isValid).toBe(false)
      expect(result[2].errorMessage).toBe('Effort is not a number')
      expect(result[3].isValid).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle empty input', () => {
      const result = parsePastedRoadmapItems('')
      expect(result).toHaveLength(0)
    })

    it('should handle whitespace-only input', () => {
      const result = parsePastedRoadmapItems('   \n  \t  ')
      expect(result).toHaveLength(0)
    })

    it('should trim whitespace from fields', () => {
      const input = '  Feature A  \t  2024-01-01  \t  2024-03-31  \t  6.0  '
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].item.title).toBe('Feature A')
      expect(result[0].item.startDate).toBe('2024-01-01')
      expect(result[0].item.endDate).toBe('2024-03-31')
      expect(result[0].item.effortWeeks).toBe(6.0)
    })

    it('should handle decimal effort weeks', () => {
      const input = 'Feature A\t2024-01-01\t2024-03-31\t6.5'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].item.effortWeeks).toBe(6.5)
      expect(result[0].isValid).toBe(true)
    })

    it('should handle zero effort weeks', () => {
      const input = 'Feature A\t2024-01-01\t2024-03-31\t0'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].item.effortWeeks).toBe(0)
      expect(result[0].isValid).toBe(true)
    })
  })

  describe('5-column format (UX and Content effort)', () => {
    it('should parse 5-column data with header', () => {
      const input = `Title\tStart date\tEnd date\tUX effort weeks\tContent effort weeks
Feature A\t2024-01-01\t2024-03-31\t4.0\t2.0`
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].item.title).toBe('Feature A')
      expect(result[0].item.startDate).toBe('2024-01-01')
      expect(result[0].item.endDate).toBe('2024-03-31')
      expect(result[0].item.uxEffortWeeks).toBe(4.0)
      expect(result[0].item.contentEffortWeeks).toBe(2.0)
      expect(result[0].item.effortWeeks).toBeUndefined()
      expect(result[0].isValid).toBe(true)
    })

    it('should parse 5-column data without header (auto-detect)', () => {
      const input = 'Feature A\t2024-01-01\t2024-03-31\t4.0\t2.0'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].item.uxEffortWeeks).toBe(4.0)
      expect(result[0].item.contentEffortWeeks).toBe(2.0)
      expect(result[0].isValid).toBe(true)
    })

    it('should handle case-insensitive header detection', () => {
      const input = `TITLE\tSTART\tEND\tUX EFFORT\tCONTENT EFFORT
Feature A\t2024-01-01\t2024-03-31\t5.0\t3.0`
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].item.uxEffortWeeks).toBe(5.0)
      expect(result[0].item.contentEffortWeeks).toBe(3.0)
      expect(result[0].isValid).toBe(true)
    })

    it('should allow empty UX or Content effort', () => {
      const input = 'Feature A\t2024-01-01\t2024-03-31\t4.0\t'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].item.uxEffortWeeks).toBe(4.0)
      expect(result[0].item.contentEffortWeeks).toBeUndefined()
      expect(result[0].isValid).toBe(true)
    })

    it('should allow only Content effort', () => {
      const input = 'Feature A\t2024-01-01\t2024-03-31\t\t3.0'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].item.uxEffortWeeks).toBeUndefined()
      expect(result[0].item.contentEffortWeeks).toBe(3.0)
      expect(result[0].isValid).toBe(true)
    })

    it('should mark invalid UX effort as error', () => {
      const input = 'Feature A\t2024-01-01\t2024-03-31\tabc\t2.0'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].isValid).toBe(false)
      expect(result[0].errorMessage).toContain('UX effort is not a number')
    })

    it('should mark invalid Content effort as error', () => {
      const input = 'Feature A\t2024-01-01\t2024-03-31\t4.0\txyz'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].isValid).toBe(false)
      expect(result[0].errorMessage).toContain('Content effort is not a number')
    })

    it('should mark both invalid efforts as error', () => {
      const input = 'Feature A\t2024-01-01\t2024-03-31\tabc\txyz'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].isValid).toBe(false)
      expect(result[0].errorMessage).toContain('UX effort is not a number')
      expect(result[0].errorMessage).toContain('Content effort is not a number')
    })

    it('should handle decimal values in 5-column format', () => {
      const input = 'Feature A\t2024-01-01\t2024-03-31\t4.5\t2.5'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].item.uxEffortWeeks).toBe(4.5)
      expect(result[0].item.contentEffortWeeks).toBe(2.5)
      expect(result[0].isValid).toBe(true)
    })

    it('should handle zero values in 5-column format', () => {
      const input = 'Feature A\t2024-01-01\t2024-03-31\t0\t0'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].item.uxEffortWeeks).toBe(0)
      expect(result[0].item.contentEffortWeeks).toBe(0)
      expect(result[0].isValid).toBe(true)
    })
  })

  describe('backward compatibility with 4-column format', () => {
    it('should still parse 4-column format correctly', () => {
      const input = 'Feature A\t2024-01-01\t2024-03-31\t6.0'
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].item.effortWeeks).toBe(6.0)
      expect(result[0].item.uxEffortWeeks).toBeUndefined()
      expect(result[0].item.contentEffortWeeks).toBeUndefined()
      expect(result[0].isValid).toBe(true)
    })

    it('should handle 4-column format with header', () => {
      const input = `Title\tStart date\tEnd date\tEffort weeks
Feature A\t2024-01-01\t2024-03-31\t6.0`
      const result = parsePastedRoadmapItems(input)

      expect(result).toHaveLength(1)
      expect(result[0].item.effortWeeks).toBe(6.0)
      expect(result[0].item.uxEffortWeeks).toBeUndefined()
      expect(result[0].isValid).toBe(true)
    })
  })
})

describe('getImportSummary', () => {
  it('should count valid and invalid rows correctly', () => {
    const parsed: ParsedRow[] = [
      { item: { title: 'Feature A' }, isValid: true },
      { item: { title: 'Feature B' }, isValid: true },
      { item: { title: '' }, isValid: false, errorMessage: 'Missing title' },
      { item: { title: 'Feature C' }, isValid: false, errorMessage: 'Effort is not a number' },
    ]

    const summary = getImportSummary(parsed)

    expect(summary.validCount).toBe(2)
    expect(summary.invalidCount).toBe(2)
  })

  it('should handle all valid rows', () => {
    const parsed: ParsedRow[] = [
      { item: { title: 'Feature A' }, isValid: true },
      { item: { title: 'Feature B' }, isValid: true },
    ]

    const summary = getImportSummary(parsed)

    expect(summary.validCount).toBe(2)
    expect(summary.invalidCount).toBe(0)
  })

  it('should handle all invalid rows', () => {
    const parsed: ParsedRow[] = [
      { item: { title: '' }, isValid: false, errorMessage: 'Missing title' },
      { item: { title: 'Feature B' }, isValid: false, errorMessage: 'Effort is not a number' },
    ]

    const summary = getImportSummary(parsed)

    expect(summary.validCount).toBe(0)
    expect(summary.invalidCount).toBe(2)
  })

  it('should handle empty array', () => {
    const summary = getImportSummary([])

    expect(summary.validCount).toBe(0)
    expect(summary.invalidCount).toBe(0)
  })
})
