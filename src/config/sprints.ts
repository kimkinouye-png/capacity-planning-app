/**
 * Sprint Configuration and Utilities
 * 
 * Defines sprint-related constants and helper functions for estimating
 * sprint counts from focus weeks.
 */

/**
 * Standard sprint length in weeks.
 * This is fixed at 2 weeks and not user-configurable.
 */
export const SPRINT_LENGTH_WEEKS = 2

/**
 * Estimates the number of sprints needed for a given number of focus weeks.
 * 
 * This is a rough estimate assuming 2-week sprints. The result is not rounded
 * or formatted here; rounding and formatting should be handled at the UI layer
 * based on the specific display requirements.
 * 
 * @param focusWeeks - The number of focus weeks (dedicated designer time)
 * @returns The estimated number of sprints (may be fractional)
 * 
 * @example
 * estimateSprints(4) // Returns 2.0 (4 weeks / 2 weeks per sprint)
 * estimateSprints(3) // Returns 1.5 (3 weeks / 2 weeks per sprint)
 */
export function estimateSprints(focusWeeks: number): number {
  return focusWeeks / SPRINT_LENGTH_WEEKS
}
