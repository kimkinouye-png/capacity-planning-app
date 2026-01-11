import type {
  PlanningSession,
  RoadmapItem,
  PMIntake,
  ProductDesignInputs,
  ContentDesignInputs,
} from '../domain/types'

const SIZE_TO_SPRINTS: Record<'XS' | 'S' | 'M' | 'L' | 'XL', number> = {
  XS: 1,
  S: 2,
  M: 3,
  L: 4,
  XL: 6,
}

export function sizeUx(
  inputs: ProductDesignInputs,
  intake: PMIntake
): { tshirtSize: 'XS' | 'S' | 'M' | 'L' | 'XL'; sprints: number; designerWeeks: number } {
  // Baseline: S (2 sprints)
  let size: 'XS' | 'S' | 'M' | 'L' | 'XL' = 'S'
  let incrementCount = 0

  // Increase size if:
  // 1. New product or surface, or major IA change
  if (intake.new_or_existing === 'new' || inputs.changes_to_information_architecture) {
    incrementCount++
  }

  // 2. Net-new patterns/components + multiple user states + significant edge cases
  if (
    inputs.net_new_patterns &&
    inputs.multiple_user_states_or_paths &&
    inputs.significant_edge_cases_or_error_handling
  ) {
    incrementCount++
  }

  // 3. Work spans 3+ platforms or heavily responsive layouts
  if (inputs.responsive_or_adaptive_layouts) {
    // Check if surfaces_in_scope indicates 3+ platforms
    try {
      const surfaces = JSON.parse(intake.surfaces_in_scope || '{}')
      const platforms: string[] = []
      if (surfaces.mobile && Array.isArray(surfaces.mobile)) {
        platforms.push(...surfaces.mobile.map((p: string) => `mobile-${p}`))
      }
      if (surfaces.web === true || surfaces.web === 'true') {
        platforms.push('web')
      }
      if (surfaces.other && Array.isArray(surfaces.other)) {
        platforms.push(...surfaces.other)
      }
      if (platforms.length >= 3) {
        incrementCount++
      } else if (inputs.responsive_or_adaptive_layouts) {
        incrementCount += 0.5 // Heavily responsive layouts
      }
    } catch {
      // If parsing fails, just check responsive layouts
      if (inputs.responsive_or_adaptive_layouts) {
        incrementCount += 0.5
      }
    }
  }

  // Map increment count to size
  // 0 increments: S (baseline)
  // 1 increment: M
  // 2 increments: L
  // 3+ increments: XL
  if (incrementCount >= 3) {
    size = 'XL'
  } else if (incrementCount >= 2) {
    size = 'L'
  } else if (incrementCount >= 1) {
    size = 'M'
  } else {
    // Check if we should decrease to XS for small, low-risk iteration on a single surface
    // Small iteration: existing product, no IA changes, no new patterns, single surface
    if (
      intake.new_or_existing === 'existing' &&
      !inputs.changes_to_information_architecture &&
      !inputs.net_new_patterns &&
      !inputs.responsive_or_adaptive_layouts
    ) {
      try {
        const surfaces = JSON.parse(intake.surfaces_in_scope || '{}')
        const platformCount =
          (surfaces.mobile && Array.isArray(surfaces.mobile) ? surfaces.mobile.length : 0) +
          (surfaces.web === true || surfaces.web === 'true' ? 1 : 0) +
          (surfaces.other && Array.isArray(surfaces.other) ? surfaces.other.length : 0)
        if (platformCount === 1) {
          size = 'XS'
        }
      } catch {
        // If parsing fails, keep baseline S
      }
    }
  }

  const sprints = SIZE_TO_SPRINTS[size]
  // Note: designerWeeks will be calculated in summarizeSession using session.sprint_length_weeks
  // For now, return 0 as placeholder
  return { tshirtSize: size, sprints, designerWeeks: 0 }
}

export function sizeContent(
  inputs: ContentDesignInputs
): { tshirtSize: 'None' | 'XS' | 'S' | 'M' | 'L' | 'XL'; sprints: number; designerWeeks: number } {
  // If is_content_required = "no" → tshirt_size = "None", sprints = 0
  if (inputs.is_content_required === 'no') {
    return { tshirtSize: 'None', sprints: 0, designerWeeks: 0 }
  }

  // Otherwise baseline XS
  let size: 'XS' | 'S' | 'M' | 'L' | 'XL' = 'XS'
  let incrementCount = 0

  // Increase size for:
  // 1. Financial/regulated language or legal/compliance review
  if (
    inputs.financial_or_regulated_language ||
    inputs.legal_policy_or_compliance_review !== 'no'
  ) {
    incrementCount++
  }

  // 2. Trust-sensitive flows, commitments, AI/personalization, rankings
  if (
    inputs.trust_sensitive_moments ||
    inputs.user_commitments_or_confirmations ||
    inputs.claims_guarantees_or_promises ||
    inputs.ai_driven_or_personalized_decisions ||
    inputs.ranking_recommendations_or_explanations
  ) {
    incrementCount++
  }

  // 3. New terminology and high guidance needs
  if (inputs.introducing_new_terminology && inputs.guidance_needed === 'high') {
    incrementCount++
  }

  // Map increment count to size (starting from XS)
  // 0 increments: XS (baseline)
  // 1 increment: S
  // 2 increments: M
  // 3 increments: L
  // 4+ increments: XL
  if (incrementCount >= 4) {
    size = 'XL'
  } else if (incrementCount >= 3) {
    size = 'L'
  } else if (incrementCount >= 2) {
    size = 'M'
  } else if (incrementCount >= 1) {
    size = 'S'
  }
  // else size = 'XS' (baseline)

  const sprints = size === 'XS' ? SIZE_TO_SPRINTS.XS : SIZE_TO_SPRINTS[size]
  // Note: designerWeeks will be calculated in summarizeSession using session.sprint_length_weeks
  // For now, return 0 as placeholder
  return { tshirtSize: size, sprints, designerWeeks: 0 }
}

export interface ItemEstimate {
  item: RoadmapItem
  uxSizing: { tshirtSize: 'XS' | 'S' | 'M' | 'L' | 'XL'; sprints: number; designerWeeks: number }
  contentSizing: {
    tshirtSize: 'None' | 'XS' | 'S' | 'M' | 'L' | 'XL'
    sprints: number
    designerWeeks: number
  }
  aboveCutLineUX: boolean
  aboveCutLineContent: boolean
}

export interface SessionSummary {
  session: PlanningSession
  items: ItemEstimate[]
  totals: {
    totalUxWeeks: number
    totalContentWeeks: number
    uxCapacityWeeks: number
    contentCapacityWeeks: number
    uxSurplusDeficit: number
    contentSurplusDeficit: number
    uxHeadcountNeeded: number
    contentHeadcountNeeded: number
  }
}

export function summarizeSession(
  session: PlanningSession,
  itemsWithInputs: Array<{
    item: RoadmapItem
    intake: PMIntake
    pd: ProductDesignInputs
    cd: ContentDesignInputs
  }>
): SessionSummary {
  // Sort items by initiative then priority
  const sortedItems = [...itemsWithInputs].sort((a, b) => {
    if (a.item.initiative !== b.item.initiative) {
      return a.item.initiative.localeCompare(b.item.initiative)
    }
    return a.item.priority - b.item.priority
  })

  // Compute UX and Content designer-weeks per item
  const items: ItemEstimate[] = sortedItems.map(({ item, intake, pd, cd }) => {
    const uxSizing = sizeUx(pd, intake)
    const contentSizing = sizeContent(cd)

    // Convert sprints to designer-weeks
    uxSizing.designerWeeks = uxSizing.sprints * session.sprint_length_weeks
    contentSizing.designerWeeks = contentSizing.sprints * session.sprint_length_weeks

    return {
      item,
      uxSizing,
      contentSizing,
      aboveCutLineUX: false, // Will be set below
      aboveCutLineContent: false, // Will be set below
    }
  })

  // Totals per role
  const totalUxWeeks = items.reduce((sum, item) => sum + item.uxSizing.designerWeeks, 0)
  const totalContentWeeks = items.reduce(
    (sum, item) => sum + item.contentSizing.designerWeeks,
    0
  )

  // Capacity per role
  const uxCapacityWeeks = session.ux_designers * session.weeks_per_period
  const contentCapacityWeeks = session.content_designers * session.weeks_per_period

  // Surplus/deficit
  const uxSurplusDeficit = totalUxWeeks - uxCapacityWeeks
  const contentSurplusDeficit = totalContentWeeks - contentCapacityWeeks

  // Estimated headcount needed
  const uxHeadcountNeeded = Math.ceil(totalUxWeeks / session.weeks_per_period)
  const contentHeadcountNeeded = Math.ceil(totalContentWeeks / session.weeks_per_period)

  // Cut line: Accumulate designer-weeks until capacity is exceeded
  let accumulatedUxWeeks = 0
  let accumulatedContentWeeks = 0

  items.forEach((item) => {
    // Check if item is above cut line for UX
    accumulatedUxWeeks += item.uxSizing.designerWeeks
    item.aboveCutLineUX = accumulatedUxWeeks > uxCapacityWeeks

    // Check if item is above cut line for Content
    accumulatedContentWeeks += item.contentSizing.designerWeeks
    item.aboveCutLineContent = accumulatedContentWeeks > contentCapacityWeeks
  })

  return {
    session,
    items,
    totals: {
      totalUxWeeks,
      totalContentWeeks,
      uxCapacityWeeks,
      contentCapacityWeeks,
      uxSurplusDeficit,
      contentSurplusDeficit,
      uxHeadcountNeeded,
      contentHeadcountNeeded,
    },
  }
}
