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
   * Platform Complexity (weight: 1.1)
   * 
   * Slightly higher weight because supporting multiple platforms or complex
   * technical requirements increases design iteration, testing, and adaptation work.
   * Multi-platform work often requires platform-specific considerations and validation.
   */
  platformComplexity: {
    weight: 1.1,
    label: 'Platform Complexity',
    description: 'Number of platforms and technical complexity (1=single platform, 5=multiple complex platforms)',
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
  platformComplexity: 1.1,
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
 * @param factorDefinitions Factor definitions with weights
 * @returns Weighted score
 */
export function calculateWeightedScore(
  factorsWithScores: FactorScores,
  factorDefinitions: Record<string, Omit<Factor, 'score'>>
): number {
  let totalWeightedScore = 0
  let totalWeight = 0

  for (const [factorName, score] of Object.entries(factorsWithScores)) {
    const factor = factorDefinitions[factorName]
    if (factor && score >= 1 && score <= 5) {
      totalWeightedScore += score * factor.weight
      totalWeight += factor.weight
    }
  }

  // Return average weighted score, or 0 if no valid factors
  return totalWeight > 0 ? totalWeightedScore / totalWeight : 0
}

/**
 * Map weighted score to size band
 * @param score Weighted score (typically 1-5 range)
 * @returns Size band
 */
export function mapScoreToSizeBand(score: number): SizeBand {
  if (score <= 1.5) return 'XS'
  if (score <= 2.5) return 'S'
  if (score <= 3.5) return 'M'
  if (score <= 4.5) return 'L'
  return 'XL'
}

/**
 * Map size band to time estimates for a given role
 * @param sizeBand Size band
 * @param role 'ux' or 'content'
 * @returns Object with focusWeeks and workWeeks
 */
export function mapSizeBandToTime(
  sizeBand: SizeBand,
  role: Role
): { focusWeeks: number; workWeeks: number } {
  // UX time estimates (in weeks)
  const uxTimeRanges: Record<SizeBand, { focusWeeks: number; workWeeks: number }> = {
    XS: { focusWeeks: 0.5, workWeeks: 1 },
    S: { focusWeeks: 1, workWeeks: 2 },
    M: { focusWeeks: 2, workWeeks: 4 },
    L: { focusWeeks: 3, workWeeks: 6 },
    XL: { focusWeeks: 4, workWeeks: 8 },
  }

  // Content time estimates (in weeks)
  const contentTimeRanges: Record<SizeBand, { focusWeeks: number; workWeeks: number }> = {
    XS: { focusWeeks: 0.5, workWeeks: 1 },
    S: { focusWeeks: 1, workWeeks: 1.5 },
    M: { focusWeeks: 1.5, workWeeks: 3 },
    L: { focusWeeks: 2, workWeeks: 4 },
    XL: { focusWeeks: 3, workWeeks: 6 },
  }

  return role === 'ux' ? uxTimeRanges[sizeBand] : contentTimeRanges[sizeBand]
}

/**
 * Calculate effort for a given role and factor scores
 * @param role 'ux' or 'content'
 * @param scores Map of factor names to scores (1-5)
 * @returns Effort result with sizeBand, focusWeeks, workWeeks, and weightedScore
 */
export function calculateEffort(role: Role, scores: FactorScores): EffortResult {
  const factorDefinitions =
    role === 'ux' ? uxFactors : contentFactors

  const weightedScore = calculateWeightedScore(scores, factorDefinitions)
  const sizeBand = mapScoreToSizeBand(weightedScore)
  const { focusWeeks, workWeeks } = mapSizeBandToTime(sizeBand, role)

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
