/**
 * Safe numeric formatting utilities
 * 
 * These utilities prevent TypeError when formatting non-numeric values.
 * Used throughout the app for consistent, safe numeric display.
 */

/**
 * Safely formats a number to a fixed decimal places string.
 * Returns fallback for non-numeric values.
 * 
 * @param value - Value to format
 * @param decimals - Number of decimal places (default: 1)
 * @param fallback - Fallback string for non-numeric values (default: '0.0')
 * @returns Formatted string or fallback
 * 
 * @example
 * safeToFixed(1.234, 1) // '1.2'
 * safeToFixed(undefined, 1) // '0.0'
 * safeToFixed(null, 1, '—') // '—'
 */
export function safeToFixed(
  value: unknown,
  decimals: number = 1,
  fallback: string = '0.0'
): string {
  if (typeof value === 'number' && !isNaN(value)) {
    return value.toFixed(decimals)
  }
  return fallback
}

/**
 * Safely formats a number to a fixed decimal places string for metrics.
 * Uses '0.0' as fallback (consistent with capacity metrics pattern).
 * 
 * @param value - Value to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string or '0.0'
 */
export function safeFormatMetric(value: unknown, decimals: number = 1): string {
  return safeToFixed(value, decimals, '0.0')
}

/**
 * Safely formats a number to a fixed decimal places string for item properties.
 * Uses '—' as fallback (consistent with table display pattern).
 * 
 * @param value - Value to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string or '—'
 */
export function safeFormatItemValue(value: unknown, decimals: number = 1): string {
  return safeToFixed(value, decimals, '—')
}

/**
 * Safely formats a utilization percentage.
 * Rounds to whole number, uses '0' as fallback.
 * 
 * @param value - Percentage value (0-100)
 * @returns Formatted string or '0'
 */
export function safeFormatUtilization(value: unknown): string {
  return safeToFixed(value, 0, '0')
}
