import { describe, it, expect } from 'vitest'
import {
  safeToFixed,
  safeFormatMetric,
  safeFormatItemValue,
  safeFormatUtilization,
} from '../safeFormat'

describe('safeToFixed', () => {
  it('formats valid numbers correctly', () => {
    expect(safeToFixed(1.234, 1)).toBe('1.2')
    expect(safeToFixed(1.234, 2)).toBe('1.23')
    expect(safeToFixed(0, 1)).toBe('0.0')
    expect(safeToFixed(100, 0)).toBe('100')
  })

  it('returns fallback for undefined', () => {
    expect(safeToFixed(undefined, 1)).toBe('0.0')
    expect(safeToFixed(undefined, 1, '—')).toBe('—')
  })

  it('returns fallback for null', () => {
    expect(safeToFixed(null, 1)).toBe('0.0')
    expect(safeToFixed(null, 1, '—')).toBe('—')
  })

  it('returns fallback for non-numeric strings', () => {
    expect(safeToFixed('not a number', 1)).toBe('0.0')
    expect(safeToFixed('123abc', 1)).toBe('0.0')
  })

  it('returns fallback for objects', () => {
    expect(safeToFixed({}, 1)).toBe('0.0')
    expect(safeToFixed([], 1)).toBe('0.0')
  })

  it('returns fallback for NaN', () => {
    expect(safeToFixed(NaN, 1)).toBe('0.0')
    expect(safeToFixed(Number('invalid'), 1)).toBe('0.0')
  })

  it('handles Infinity gracefully', () => {
    expect(safeToFixed(Infinity, 1)).toBe('Infinity') // Number.toFixed() returns 'Infinity'
    expect(safeToFixed(-Infinity, 1)).toBe('-Infinity')
  })
})

describe('safeFormatMetric', () => {
  it('formats valid numbers with default 1 decimal', () => {
    expect(safeFormatMetric(10.567)).toBe('10.6')
    expect(safeFormatMetric(5)).toBe('5.0')
  })

  it('returns "0.0" for non-numeric values', () => {
    expect(safeFormatMetric(undefined)).toBe('0.0')
    expect(safeFormatMetric(null)).toBe('0.0')
    expect(safeFormatMetric('invalid')).toBe('0.0')
  })

  it('accepts custom decimal places', () => {
    expect(safeFormatMetric(10.567, 2)).toBe('10.57')
    expect(safeFormatMetric(10.567, 0)).toBe('11')
  })
})

describe('safeFormatItemValue', () => {
  it('formats valid numbers with default 1 decimal', () => {
    expect(safeFormatItemValue(1.234)).toBe('1.2')
    expect(safeFormatItemValue(2.0)).toBe('2.0')
  })

  it('returns "—" for non-numeric values', () => {
    expect(safeFormatItemValue(undefined)).toBe('—')
    expect(safeFormatItemValue(null)).toBe('—')
    expect(safeFormatItemValue('invalid')).toBe('—')
  })

  it('accepts custom decimal places', () => {
    expect(safeFormatItemValue(1.234, 2)).toBe('1.23')
  })
})

describe('safeFormatUtilization', () => {
  it('formats valid percentages to whole numbers', () => {
    expect(safeFormatUtilization(75.5)).toBe('76')
    expect(safeFormatUtilization(100)).toBe('100')
    expect(safeFormatUtilization(0)).toBe('0')
    expect(safeFormatUtilization(50.4)).toBe('50')
  })

  it('returns "0" for non-numeric values', () => {
    expect(safeFormatUtilization(undefined)).toBe('0')
    expect(safeFormatUtilization(null)).toBe('0')
    expect(safeFormatUtilization('invalid')).toBe('0')
  })
})

describe('Edge Cases', () => {
  it('handles very large numbers', () => {
    expect(safeFormatMetric(Number.MAX_SAFE_INTEGER, 0)).toBe(
      String(Number.MAX_SAFE_INTEGER)
    )
  })

  it('handles very small numbers', () => {
    expect(safeFormatMetric(0.0001, 4)).toBe('0.0001')
  })

  it('handles negative numbers', () => {
    expect(safeFormatMetric(-5.5)).toBe('-5.5')
    expect(safeFormatUtilization(-10)).toBe('-10')
  })

  it('does not throw for any input type', () => {
    const testCases: unknown[] = [
      undefined,
      null,
      'string',
      '',
      123,
      1.23,
      {},
      [],
      true,
      false,
      Symbol('test'),
      () => {},
      new Date(),
      NaN,
      Infinity,
      -Infinity,
    ]

    testCases.forEach((value) => {
      expect(() => safeToFixed(value, 1)).not.toThrow()
      expect(() => safeFormatMetric(value)).not.toThrow()
      expect(() => safeFormatItemValue(value)).not.toThrow()
      expect(() => safeFormatUtilization(value)).not.toThrow()
    })
  })
})
