import type { Settings } from '../context/SettingsContext'
import { uxFactors, contentFactors } from '../config/effortModel'

/** Map 1–10 DB effort weights to factor multipliers for calculateEffort (UX). */
export function effortWeightsForUx(settings: Settings | null | undefined): Record<string, number> | undefined {
  if (!settings || settings.effort_model_enabled === false) return undefined
  const ew = settings.effort_weights
  const scale = (w: number, base: number) => base * (w / 5)
  return {
    productRisk: scale(ew.productRisk, uxFactors.productRisk.weight),
    problemAmbiguity: scale(ew.problemAmbiguity, uxFactors.problemAmbiguity.weight),
    discoveryDepth: uxFactors.discoveryDepth.weight,
  }
}

/** Map 1–10 DB effort weights to factor multipliers for calculateEffort (content). */
export function effortWeightsForContent(settings: Settings | null | undefined): Record<string, number> | undefined {
  if (!settings || settings.effort_model_enabled === false) return undefined
  const ew = settings.effort_weights
  const scale = (w: number, base: number) => base * (w / 5)
  return {
    contentSurfaceArea: scale(ew.contentSurface, contentFactors.contentSurfaceArea.weight),
    localizationScope: scale(ew.localizationScope, contentFactors.localizationScope.weight),
    regulatoryBrandRisk: contentFactors.regulatoryBrandRisk.weight,
    legalComplianceDependency: contentFactors.legalComplianceDependency.weight,
  }
}

/** Convert size_band_thresholds to numeric upper bounds for mapScoreToSizeBand. */
export function sizeBandThresholdsNumeric(
  settings: Settings | null | undefined
): { xs: number; s: number; m: number; l: number; xl: number } | undefined {
  if (!settings) return undefined
  const t = settings.size_band_thresholds
  return {
    xs: t.xs.max ?? t.xs.min,
    s: t.s.max ?? t.s.min,
    m: t.m.max ?? t.m.min,
    l: t.l.max ?? t.l.min,
    xl: t.xl.min,
  }
}
