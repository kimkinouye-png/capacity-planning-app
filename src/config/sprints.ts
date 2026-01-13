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

/**
 * Formats sprint estimate as a range for display.
 * 
 * Rules:
 * - If sprints < 1: display "0-1 sprints"
 * - If sprints is whole number: display "[N] sprints" (e.g., "2 sprints")
 * - If sprints has decimal: display as range "[floor]-[ceil] sprints" (e.g., "1-2 sprints")
 * 
 * @param sprintEstimate - The estimated number of sprints (may be fractional)
 * @returns Formatted string (e.g., "0-1 sprints", "1 sprint", "1-2 sprints", "2 sprints")
 * 
 * @example
 * formatSprintEstimate(0.5) // Returns "0-1 sprints"
 * formatSprintEstimate(1.0) // Returns "1 sprint"
 * formatSprintEstimate(1.5) // Returns "1-2 sprints"
 * formatSprintEstimate(2.0) // Returns "2 sprints"
 * formatSprintEstimate(2.7) // Returns "2-3 sprints"
 */
export function formatSprintEstimate(sprintEstimate: number): string {
  if (sprintEstimate < 1) {
    return '0-1 sprints'
  }
  
  const floor = Math.floor(sprintEstimate)
  const ceil = Math.ceil(sprintEstimate)
  
  // If it's a whole number
  if (sprintEstimate % 1 === 0) {
    return `${sprintEstimate} ${sprintEstimate === 1 ? 'sprint' : 'sprints'}`
  }
  
  // If it has a decimal, show as range
  return `${floor}-${ceil} sprints`
}
