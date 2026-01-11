/**
 * Quarter Configuration
 * 
 * Maps planning quarters to their corresponding number of weeks.
 * Standard quarters are 13 weeks, but this can be adjusted per quarter if needed.
 */

import type { PlanningPeriod } from '../domain/types'

/**
 * Get the number of weeks for a given planning period (quarter)
 * @param period Planning period (e.g., '2026-Q1')
 * @returns Number of weeks in that quarter
 */
export function getWeeksForPeriod(period: PlanningPeriod | string | undefined): number {
  if (!period) {
    return 13 // Default to 13 weeks if period is not provided
  }
  
  // Standard quarters are 13 weeks
  // This can be customized per quarter if needed
  return 13
}
