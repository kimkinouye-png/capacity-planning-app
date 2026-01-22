/**
 * Effort Model Configuration
 * 
 * Defines factor models for UX and Content design effort estimation.
 * Each factor has a score (1-5), weight, label, and description.
 */

export type SizeBand = 'XS' | 'S' | 'M' | 'L' | 'XL'
export type Role = 'ux' | 'content'

export interface Factor {
  score: number // 1-5 per item
  weight: number
  label: string
  description: string
}

export interface FactorScores {
  [factorName: string]: number // score from 1-5
}

export interface EffortResult {
  sizeBand: SizeBand
  focusWeeks: number
  workWeeks: number
  weightedScore: number
}

/**
 * UX Factor Models
 * 
 * Each factor represents a dimension of UX design complexity.
 * Weights determine how much each factor influences the final effort calculation.
 * Default base weight is 1.0; adjust up (>1.0) for factors that typically increase
 * effort more, or down (<1.0) for factors that have less impact.
 * 
 * Total weight sum = 3.1 (1.2 + 1.0 + 0.9)
 */
export const uxFactors: Record<string, Omit<Factor, 'score'>> = {
  /**
   * Product Risk (weight: 1.2)
   * 
   * Higher weight because high-risk designs require more careful consideration,
   * additional review cycles, and often more detailed documentation.
   * When product risk is high, UX work tends to be more thorough and time-consuming.
   */
  productRisk: {
    weight: 1.2,
    label: 'Product Risk',
    description: 'Level of business or product risk if design fails (1=low, 5=critical)',
  },
  
  /**
   * Problem Ambiguity (weight: 1.0)
   * 
   * Base weight factor. Ambiguity directly correlates with discovery and iteration needs,
   * so it serves as the reference point for other factors.
   * Clear problems require less discovery work; ambiguous problems require more.
   */
  problemAmbiguity: {
    weight: 1.0,
    label: 'Problem Ambiguity',
    description: 'How well-defined the problem is (1=clear, 5=highly ambiguous)',
  },
  
  /**
   * Discovery Depth (weight: 0.9)
   * 
   * Slightly lower weight because while discovery is important, it doesn't always
   * scale linearly with overall design effort. Some projects need extensive discovery
   * but simpler execution; others need less discovery but more complex implementation.
   * This weight balances discovery impact with execution complexity.
   */
  discoveryDepth: {
    weight: 0.9,
    label: 'Discovery Depth',
    description: 'Amount of user research and discovery needed (1=minimal, 5=extensive)',
  },
}

/**
 * Content Factor Models
 * 
 * Each factor represents a dimension of Content design complexity.
 * Weights determine how much each factor influences the final effort calculation.
 * Default base weight is 1.0; adjust up (>1.0) for factors that typically increase
 * effort more, or down (<1.0) for factors that have less impact.
 */
export const contentFactors: Record<string, Omit<Factor, 'score'>> = {
  /**
   * Content Surface Area (weight: 1.3)
   * 
   * Highest weight because the volume of content directly drives effort.
   * More content means more writing, editing, review, and maintenance work.
   * This is often the primary driver of Content design time.
   */
  contentSurfaceArea: {
    weight: 1.3,
    label: 'Content Surface Area',
    description: 'Volume and breadth of content needed (1=small, 5=very large)',
  },
  
  /**
   * Localization Scope (weight: 1.0)
   * 
   * Base weight factor. Localization multiplies content work linearly,
   * so it serves as the reference point for other factors.
   * Each additional language/region adds proportional effort.
   */
  localizationScope: {
    weight: 1.0,
    label: 'Localization Scope',
    description: 'Number of languages and regions (1=single language, 5=many languages/regions)',
  },
  
  /**
   * Regulatory & Brand Risk (weight: 1.2)
   * 
   * Higher weight because high-risk content requires more careful crafting,
   * additional review cycles (legal, brand, compliance), and often more
   * detailed documentation. Risk-sensitive content is slower to finalize.
   */
  regulatoryBrandRisk: {
    weight: 1.2,
    label: 'Regulatory & Brand Risk',
    description: 'Risk level for regulatory compliance and brand safety (1=low, 5=high)',
  },
  
  /**
   * Legal Compliance Dependency (weight: 1.1)
   * 
   * Slightly higher weight because legal review cycles add significant time
   * and iteration overhead. Projects with heavy legal dependencies require
   * more coordination, documentation, and revision cycles.
   */
  legalComplianceDependency: {
    weight: 1.1,
    label: 'Legal Compliance Dependency',
    description: 'Level of legal review and compliance requirements (1=minimal, 5=extensive)',
  },
}

/**
 * Factor weights for UX factors
 * Exported as a separate constant for easy reference and potential future configuration
 */
export const FACTOR_WEIGHTS_UX: Record<string, number> = {
  productRisk: 1.2,
  problemAmbiguity: 1.0,
  discoveryDepth: 0.9,
}

/**
 * Factor weights for Content factors
 * Exported as a separate constant for easy reference and potential future configuration
 */
export const FACTOR_WEIGHTS_CONTENT: Record<string, number> = {
  contentSurfaceArea: 1.3,
  localizationScope: 1.0,
  regulatoryBrandRisk: 1.2,
  legalComplianceDependency: 1.1,
}

/**
 * Calculate weighted score from factor scores
 * @param factorsWithScores Map of factor names to their scores (1-5)
 * @param factorDefinitions Factor definitions with weights (can be overridden by settings)
 * @param settingsWeights Optional weights from settings to override factor definitions
 * @returns Weighted score
 */
export function calculateWeightedScore(
  factorsWithScores: FactorScores,
  factorDefinitions: Record<string, Omit<Factor, 'score'>>,
  settingsWeights?: Record<string, number>
): number {
  let totalWeightedScore = 0
  let totalWeight = 0

  for (const [factorName, score] of Object.entries(factorsWithScores)) {
    // Use settings weight if provided, otherwise use factor definition weight
    const weight = settingsWeights?.[factorName] ?? factorDefinitions[factorName]?.weight ?? 1.0
    
    if (score >= 1 && score <= 5) {
      totalWeightedScore += score * weight
      totalWeight += weight
    }
  }

  // Calculate weighted average
  const weightedAverage = totalWeight > 0 ? totalWeightedScore / totalWeight : 0

  // Debug logging
  console.log('Factors used:', Object.keys(factorsWithScores))
  console.log('Weights sum:', totalWeight)
  console.log('Weighted average:', weightedAverage)

  // Return average weighted score, or 0 if no valid factors
  return weightedAverage
}

/**
 * Map weighted score to size band
 * @param weightedAverage Weighted average score (typically 1-5 range)
 * @param sizeBands Optional size band thresholds from settings. Falls back to defaults if not provided.
 * @returns Size band
 */
export function mapScoreToSizeBand(
  weightedAverage: number,
  sizeBands?: { xs: number; s: number; m: number; l: number; xl: number }
): SizeBand {
  // Use settings if provided, otherwise use defaults
  const thresholds = sizeBands || {
    xs: 1.6,
    s: 2.6,
    m: 3.6,
    l: 4.6,
    xl: 5.0,
  }

  if (weightedAverage < thresholds.xs) return 'XS'
  if (weightedAverage < thresholds.s) return 'S'
  if (weightedAverage < thresholds.m) return 'M'
  if (weightedAverage < thresholds.l) return 'L'
  return 'XL'  // Catches >= thresholds.l, including exactly thresholds.xl
}

/**
 * Calculate work weeks from focus weeks
 * Work weeks = focus weeks ÷ focusTimeRatio (accounting for context switching and dependencies)
 * @param focusWeeks Focus weeks (dedicated designer time)
 * @param focusTimeRatio Optional focus-time ratio from settings. Defaults to 0.75 if not provided.
 * @returns Work weeks rounded to 1 decimal place
 */
export function calculateWorkWeeks(focusWeeks: number, focusTimeRatio?: number): number {
  const ratio = focusTimeRatio ?? 0.75
  return Number((focusWeeks / ratio).toFixed(1))
}

/**
 * Map size band to focus weeks for UX design
 * @param sizeBand Size band
 * @returns Focus weeks
 */
export function mapSizeBandToFocusWeeks(sizeBand: SizeBand): number {
  switch (sizeBand) {
    case 'XS': return 0.5
    case 'S': return 1.5
    case 'M': return 3.0
    case 'L': return 5.0
    case 'XL': return 8.0
    default: return 3.0
  }
}

/**
 * Map size band to focus weeks for Content design
 * @param sizeBand Size band
 * @returns Focus weeks
 * 
 * Note: Content focus weeks now match UX focus weeks for consistency
 */
export function mapSizeBandToContentFocusWeeks(sizeBand: SizeBand): number {
  switch (sizeBand) {
    case 'XS': return 0.5
    case 'S': return 1.5
    case 'M': return 3.0
    case 'L': return 5.0
    case 'XL': return 8.0
    default: return 3.0
  }
}

/**
 * Map size band to time estimates for a given role
 * Work weeks are calculated as: focus weeks ÷ focusTimeRatio (accounting for context switching and dependencies)
 * @param sizeBand Size band
 * @param role 'ux' or 'content'
 * @param focusTimeRatio Optional focus-time ratio from settings. Defaults to 0.75 if not provided.
 * @returns Object with focusWeeks and workWeeks
 */
export function mapSizeBandToTime(
  sizeBand: SizeBand,
  role: Role,
  focusTimeRatio?: number
): { focusWeeks: number; workWeeks: number } {
  // Get focus weeks based on role
  const focusWeeks = role === 'ux' 
    ? mapSizeBandToFocusWeeks(sizeBand)
    : mapSizeBandToContentFocusWeeks(sizeBand)

  // Debug logging for Content
  if (role === 'content') {
    console.log('Content size band:', sizeBand)
    console.log('Content focus weeks from mapping:', focusWeeks)
    console.log('Expected for XL: 8.0, Actual:', focusWeeks)
  }

  // Calculate work weeks from focus weeks using settings ratio
  const workWeeks = calculateWorkWeeks(focusWeeks, focusTimeRatio)

  return {
    focusWeeks,
    workWeeks,
  }
}

/**
 * Calculate effort for a given role and factor scores
 * @param role 'ux' or 'content'
 * @param scores Map of factor names to scores (1-5)
 * @param settings Optional settings object with weights, size bands, and focus-time ratio
 * @returns Effort result with sizeBand, focusWeeks, workWeeks, and weightedScore
 */
export function calculateEffort(
  role: Role,
  scores: FactorScores,
  settings?: {
    weights?: Record<string, number>
    sizeBands?: { xs: number; s: number; m: number; l: number; xl: number }
    focusTimeRatio?: number
  }
): EffortResult {
  const factorDefinitions =
    role === 'ux' ? uxFactors : contentFactors

  // Use settings weights if provided
  const settingsWeights = settings?.weights

  const weightedScore = calculateWeightedScore(scores, factorDefinitions, settingsWeights)
  const sizeBand = mapScoreToSizeBand(weightedScore, settings?.sizeBands)
  const { focusWeeks, workWeeks } = mapSizeBandToTime(sizeBand, role, settings?.focusTimeRatio)

  // Debug logging
  console.log('Size band:', sizeBand)

  return {
    sizeBand,
    focusWeeks,
    workWeeks,
    weightedScore,
  }
}

/**
 * Get all factor definitions for a role
 * @param role 'ux' or 'content'
 * @returns Record of factor definitions
 */
export function getFactorsForRole(role: Role): Record<string, Omit<Factor, 'score'>> {
  return role === 'ux' ? uxFactors : contentFactors
}
