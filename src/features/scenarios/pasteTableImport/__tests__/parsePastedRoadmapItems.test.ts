import { describe, it, expect } from 'vitest'
import { parsePastedRoadmapItems, getImportSummary } from '../parsePastedRoadmapItems'

describe('parsePastedRoadmapItems — V2 format', () => {
  it('parses a V2 header row correctly and skips it', () => {
    const input = 'Name\tShort Key\tInitiative\tPriority\tProject Type\nFeature A\tFEAT-1\tGrowth\tP1\tNew Feature'
    const result = parsePastedRoadmapItems(input)
    expect(result).toHaveLength(1)
    expect(result[0].item.title).toBe('Feature A')
    expect(result[0].item.shortKey).toBe('FEAT-1')
    expect(result[0].item.initiative).toBe('Growth')
    expect(result[0].item.priority).toBe('P1')
    expect(result[0].item.projectType).toBe('new-feature')
    expect(result[0].isValid).toBe(true)
  })

  it('normalizes priority values', () => {
    const input = 'Name\tShort Key\tInitiative\tPriority\tProject Type\nFeature B\tFEAT-2\t\tP0\tNew Product'
    const result = parsePastedRoadmapItems(input)
    expect(result[0].item.priority).toBe('P0')
  })

  it('defaults priority to P1 when empty', () => {
    const input = 'Name\tShort Key\tInitiative\tPriority\tProject Type\nFeature C\tFEAT-3\t\t\tEnhancement'
    const result = parsePastedRoadmapItems(input)
    expect(result[0].item.priority).toBe('P1')
  })

  it('normalizes project type variants', () => {
    const cases = [
      ['New Product', 'net-new'],
      ['Net New', 'net-new'],
      ['New Feature', 'new-feature'],
      ['Enhancement', 'enhancement'],
      ['Optimization', 'optimization'],
      ['Fix & Polish', 'fix-polish'],
      ['Fix/Polish', 'fix-polish'],
    ]
    cases.forEach(([input, expected]) => {
      const raw = `Name\tKey\tInit\tP1\t${input}`
      const result = parsePastedRoadmapItems(raw)
      expect(result[0].item.projectType).toBe(expected)
    })
  })

  it('defaults project type to new-feature for unknown values', () => {
    const input = 'Feature D\tFEAT-4\t\tP2\tUnknown Type'
    const result = parsePastedRoadmapItems(input)
    expect(result[0].item.projectType).toBe('new-feature')
  })

  it('marks row invalid when name is missing', () => {
    const input = '\tFEAT-5\t\tP1\tEnhancement'
    const result = parsePastedRoadmapItems(input)
    expect(result[0].isValid).toBe(false)
    expect(result[0].errorMessage).toContain('Missing name')
  })

  it('parses multiple V2 rows', () => {
    const input = [
      'Name\tShort Key\tInitiative\tPriority\tProject Type',
      'Feature 1\tF-1\tGrowth\tP0\tNew Product',
      'Feature 2\tF-2\tPlatform\tP2\tOptimization',
      'Feature 3\tF-3\t\tP1\tNew Feature',
    ].join('\n')
    const result = parsePastedRoadmapItems(input)
    expect(result).toHaveLength(3)
    expect(result.every(r => r.isValid)).toBe(true)
    expect(result[0].item.projectType).toBe('net-new')
    expect(result[1].item.projectType).toBe('optimization')
    expect(result[2].item.priority).toBe('P1')
  })

  it('handles V2 data without header row', () => {
    const input = 'Feature A\tFEAT-1\tGrowth\tP1\tNew Feature'
    const result = parsePastedRoadmapItems(input)
    expect(result).toHaveLength(1)
    expect(result[0].item.title).toBe('Feature A')
    expect(result[0].isValid).toBe(true)
  })
})

describe('parsePastedRoadmapItems — Legacy format', () => {
  it('parses legacy 5-column format with header', () => {
    const input = 'Title\tStart date\tEnd date\tUX effort weeks\tContent effort weeks\nFeature A\t2026-01-01\t2026-02-01\t3\t2'
    const result = parsePastedRoadmapItems(input)
    expect(result).toHaveLength(1)
    expect(result[0].item.title).toBe('Feature A')
    expect(result[0].item.uxEffortWeeks).toBe(3)
    expect(result[0].item.contentEffortWeeks).toBe(2)
    expect(result[0].isValid).toBe(true)
  })

  it('parses legacy 4-column format with header', () => {
    const input = 'Title\tStart date\tEnd date\tEffort weeks\nFeature B\t2026-01-01\t2026-02-01\t4'
    const result = parsePastedRoadmapItems(input)
    expect(result).toHaveLength(1)
    expect(result[0].item.effortWeeks).toBe(4)
    expect(result[0].isValid).toBe(true)
  })

  it('marks legacy row invalid when effort is not a number', () => {
    const input = 'Title\tStart date\tEnd date\tUX effort weeks\tContent effort weeks\nFeature C\t2026-01-01\t2026-02-01\tabc\t2'
    const result = parsePastedRoadmapItems(input)
    expect(result[0].isValid).toBe(false)
    expect(result[0].errorMessage).toContain('UX effort is not a number')
  })
})

describe('getImportSummary', () => {
  it('returns correct counts', () => {
    const parsed = [
      { item: { title: 'A' }, isValid: true },
      { item: { title: 'B' }, isValid: false, errorMessage: 'Missing name' },
      { item: { title: 'C' }, isValid: true },
    ]
    const summary = getImportSummary(parsed as any)
    expect(summary.validCount).toBe(2)
    expect(summary.invalidCount).toBe(1)
  })
})

describe('parsePastedRoadmapItems — edge cases', () => {
  it('returns empty array for empty input', () => {
    expect(parsePastedRoadmapItems('')).toEqual([])
    expect(parsePastedRoadmapItems('   ')).toEqual([])
  })

  it('skips blank rows', () => {
    const input = 'Feature A\tFEAT-1\t\tP1\tEnhancement\n\n\nFeature B\tFEAT-2\t\tP2\tOptimization'
    const result = parsePastedRoadmapItems(input)
    expect(result).toHaveLength(2)
  })
})
