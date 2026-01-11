export interface PlanningSession {
  id: string
  name: string
  planning_period: string
  weeks_per_period: number
  sprint_length_weeks: number
  ux_designers: number
  content_designers: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface RoadmapItem {
  id: string
  planning_session_id: string
  short_key: string
  name: string
  initiative: string
  team_name: string
  priority: number
  status: 'draft' | 'ready_for_sizing' | 'sized' | 'locked'
}

export interface PMIntake {
  roadmap_item_id: string
  objective: string
  kpis: string
  goals: string
  market: string
  audience: string
  timeline: string
  requirements_business: string
  requirements_technical: string
  requirements_design: string
  surfaces_in_scope: string
  new_or_existing: 'new' | 'existing'
}

export interface ProductDesignInputs {
  roadmap_item_id: string
  net_new_patterns: boolean
  changes_to_information_architecture: boolean
  multiple_user_states_or_paths: boolean
  significant_edge_cases_or_error_handling: boolean
  responsive_or_adaptive_layouts: boolean
  other: string
}

export interface ContentDesignInputs {
  roadmap_item_id: string
  is_content_required: 'yes' | 'no' | 'unsure'
  financial_or_regulated_language: boolean
  user_commitments_or_confirmations: boolean
  claims_guarantees_or_promises: boolean
  trust_sensitive_moments: boolean
  ai_driven_or_personalized_decisions: boolean
  ranking_recommendations_or_explanations: boolean
  legal_policy_or_compliance_review: 'yes' | 'no' | 'unsure'
  introducing_new_terminology: boolean
  guidance_needed: 'high' | 'some' | 'minimal'
}

export interface Estimate {
  roadmap_item_id: string
  role: 'UX' | 'Content'
  tshirt_size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'None'
  sprints: number
  designer_weeks: number
  notes: string
  above_cut_line_ux: boolean
  above_cut_line_content: boolean
  created_at: string
  created_by: string
}
