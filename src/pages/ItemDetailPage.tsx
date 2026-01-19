import {
  Box,
  Heading,
  Stack,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  HStack,
  IconButton,
  Link as ChakraLink,
  Badge,
} from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect, useMemo, useRef } from 'react'
import type { PMIntake, ProductDesignInputs, ContentDesignInputs } from '../domain/types'
import PMIntakeForm from '../components/PMIntakeForm'
import PDInputsForm from '../components/PDInputsForm'
import CDInputsForm from '../components/CDInputsForm'
import { useRoadmapItems } from '../context/RoadmapItemsContext'
import { useItemInputs } from '../context/ItemInputsContext'
import { usePlanningSessions } from '../context/PlanningSessionsContext'
import { useActivity } from '../context/ActivityContext'
import { calculateEffort, type FactorScores } from '../config/effortModel'
import {
  demoItems,
  demoIntakes,
  demoProductDesignInputs,
  demoContentDesignInputs,
} from '../demo/demoSession'

function ItemDetailPage() {
  const { id: sessionId, itemId } = useParams<{ id: string; itemId: string }>()
  const navigate = useNavigate()
  const { getItemsForSession, updateItem } = useRoadmapItems()
  const { getInputsForItem, setInputsForItem } = useItemInputs()
  const { getSessionById } = usePlanningSessions()
  const { logActivity } = useActivity()

  // Load the RoadmapItem - reload when items change (e.g., after updateItem)
  const items = useMemo(() => {
    if (sessionId === 'demo') {
      return demoItems
    }
    if (sessionId) {
      return getItemsForSession(sessionId)
    }
    return []
  }, [sessionId, getItemsForSession])

  const item = useMemo(() => {
    if (!itemId) return undefined
    return items.find((i) => i.id === itemId)
  }, [itemId, items])

  // Initialize with sensible defaults
  const getDefaultPMIntake = (): PMIntake => ({
    roadmap_item_id: itemId || '',
    objective: '',
    kpis: '',
    goals: '', // Preserved for backwards compatibility but not shown in UI
    market: '',
    audience: '',
    timeline: '',
    requirements_business: '',
    requirements_technical: '',
    requirements_design: '',
    surfaces_in_scope: [], // Changed to empty array
    new_or_existing: 'existing',
  })

  const getDefaultPDInputs = (): ProductDesignInputs => ({
    roadmap_item_id: itemId || '',
    net_new_patterns: false,
    changes_to_information_architecture: false,
    multiple_user_states_or_paths: false,
    significant_edge_cases_or_error_handling: false,
    responsive_or_adaptive_layouts: false,
    other: '',
    // Initialize factor scores with default value of 3 (medium)
    productRisk: 3,
    problemAmbiguity: 3,
    platformComplexity: 3,
    discoveryDepth: 3,
  })

  const getDefaultCDInputs = (): ContentDesignInputs => ({
    roadmap_item_id: itemId || '',
    is_content_required: 'yes',
    financial_or_regulated_language: false,
    user_commitments_or_confirmations: false,
    claims_guarantees_or_promises: false,
    trust_sensitive_moments: false,
    ai_driven_or_personalized_decisions: false,
    ranking_recommendations_or_explanations: false,
    legal_policy_or_compliance_review: 'no',
    introducing_new_terminology: false,
    guidance_needed: 'minimal',
    // Initialize factor scores with default value of 3 (medium)
    contentSurfaceArea: 3,
    localizationScope: 3,
    regulatoryBrandRisk: 3,
    legalComplianceDependency: 3,
  })

  // Local state for form inputs
  const [pmIntake, setPMIntake] = useState<PMIntake>(getDefaultPMIntake())
  const [pdInputs, setPDInputs] = useState<ProductDesignInputs>(getDefaultPDInputs())
  const [cdInputs, setCDInputs] = useState<ContentDesignInputs>(getDefaultCDInputs())

  // Track the last saved values as JSON string to prevent infinite loop between
  // the load and save effects. When we load data, we set this ref to match what
  // we loaded. When we save, we only save if the current data differs from this ref.
  // This breaks the cycle: load -> setState -> save -> context update -> load (but data unchanged -> no save)
  const lastSavedInputsJsonRef = useRef<string>('')

  // Track the last loaded itemId to avoid reloading when getInputsForItem reference changes
  // but we're still on the same item
  const lastLoadedItemIdRef = useRef<string | null>(null)

  // Load data from context or demo when itemId/sessionId changes.
  // This effect runs when navigating to a new item.
  // IMPORTANT: We update lastSavedInputsJsonRef to match what we load, so the save effect
  // knows these values are already saved and won't trigger unnecessarily.
  useEffect(() => {
    if (!itemId) return

    // Only reload if itemId actually changed (not just getInputsForItem reference)
    if (lastLoadedItemIdRef.current === itemId) {
      return
    }
    lastLoadedItemIdRef.current = itemId

    if (sessionId === 'demo') {
      // Demo mode: load from demo data, no saving needed
      const demoIntake = demoIntakes.find((i) => i.roadmap_item_id === itemId)
      const demoPD = demoProductDesignInputs.find((p) => p.roadmap_item_id === itemId)
      const demoCD = demoContentDesignInputs.find((c) => c.roadmap_item_id === itemId)

      if (demoIntake) {
        // Demo data should already be in new flat format, but handle legacy formats just in case
        const intake = { ...demoIntake }
        if (typeof intake.surfaces_in_scope === 'string') {
          // Legacy JSON string format: try to parse JSON and convert to flat array
          try {
            const surfaces = JSON.parse(intake.surfaces_in_scope || '{}')
            const surfaceArray: string[] = []
            if (surfaces.mobile && Array.isArray(surfaces.mobile)) {
              // Convert hierarchical mobile options to flat format
              if (surfaces.mobile.includes('iOS')) surfaceArray.push('Mobile iOS')
              if (surfaces.mobile.includes('Android')) surfaceArray.push('Mobile Android')
              if (surfaces.mobile.includes('Mobile Web')) surfaceArray.push('Mobile Web')
            }
            if (surfaces.web === true || surfaces.web === 'true') {
              surfaceArray.push('Web')
            }
            if (surfaces.other && Array.isArray(surfaces.other)) {
              surfaceArray.push(...surfaces.other)
            }
            intake.surfaces_in_scope = surfaceArray
          } catch {
            intake.surfaces_in_scope = []
          }
        } else if (Array.isArray(intake.surfaces_in_scope)) {
          // Migrate from old hierarchical array format to new flat format
          const migrated: string[] = []
          intake.surfaces_in_scope.forEach((surface: string) => {
            if (surface === 'iOS') {
              migrated.push('Mobile iOS')
            } else if (surface === 'Android') {
              migrated.push('Mobile Android')
            } else if (surface === 'Mobile Web' || surface === 'Web') {
              migrated.push(surface) // Keep as-is
            } else {
              migrated.push(surface) // Keep other values as-is
            }
          })
          intake.surfaces_in_scope = migrated
        }
        setPMIntake(intake)
      } else {
        setPMIntake(getDefaultPMIntake())
      }

      if (demoPD) {
        // Ensure factor scores are present, defaulting to 3 if missing
        setPDInputs({
          ...demoPD,
          productRisk: demoPD.productRisk ?? 3,
          problemAmbiguity: demoPD.problemAmbiguity ?? 3,
          platformComplexity: demoPD.platformComplexity ?? 3,
          discoveryDepth: demoPD.discoveryDepth ?? 3,
        })
      } else {
        setPDInputs(getDefaultPDInputs())
      }

      if (demoCD) {
        // Ensure factor scores are present, defaulting to 3 if missing
        setCDInputs({
          ...demoCD,
          contentSurfaceArea: demoCD.contentSurfaceArea ?? 3,
          localizationScope: demoCD.localizationScope ?? 3,
          regulatoryBrandRisk: demoCD.regulatoryBrandRisk ?? 3,
          legalComplianceDependency: demoCD.legalComplianceDependency ?? 3,
        })
      } else {
        setCDInputs(getDefaultCDInputs())
      }
      // Reset ref for demo (demo data doesn't get saved)
      lastSavedInputsJsonRef.current = ''
    } else {
      // Real session: load from context
      const inputs = getInputsForItem(itemId)
      if (inputs) {
        // Data exists in context: load it and mark as saved
        // Migrate old formats to new flat array format if needed
        const intake = { ...inputs.intake }
        if (typeof intake.surfaces_in_scope === 'string') {
          // Legacy JSON string format: try to parse JSON and convert to flat array
          try {
            const surfaces = JSON.parse(intake.surfaces_in_scope || '{}')
            const surfaceArray: string[] = []
            if (surfaces.mobile && Array.isArray(surfaces.mobile)) {
              // Convert hierarchical mobile options to flat format
              if (surfaces.mobile.includes('iOS')) surfaceArray.push('Mobile iOS')
              if (surfaces.mobile.includes('Android')) surfaceArray.push('Mobile Android')
              if (surfaces.mobile.includes('Mobile Web')) surfaceArray.push('Mobile Web')
            }
            if (surfaces.web === true || surfaces.web === 'true') {
              surfaceArray.push('Web')
            }
            if (surfaces.other && Array.isArray(surfaces.other)) {
              surfaceArray.push(...surfaces.other)
            }
            intake.surfaces_in_scope = surfaceArray
          } catch {
            // If parsing fails, default to empty array
            intake.surfaces_in_scope = []
          }
        } else if (Array.isArray(intake.surfaces_in_scope)) {
          // Migrate from old hierarchical array format to new flat format
          const migrated: string[] = []
          intake.surfaces_in_scope.forEach((surface: string) => {
            if (surface === 'iOS') {
              migrated.push('Mobile iOS')
            } else if (surface === 'Android') {
              migrated.push('Mobile Android')
            } else if (surface === 'Mobile Web' || surface === 'Web') {
              migrated.push(surface) // Keep as-is
            } else {
              migrated.push(surface) // Keep other values as-is
            }
          })
          intake.surfaces_in_scope = migrated
        }
        setPMIntake(intake)
        // Ensure factor scores are present, defaulting to 3 if missing
        setPDInputs({
          ...inputs.pd,
          productRisk: inputs.pd.productRisk ?? 3,
          problemAmbiguity: inputs.pd.problemAmbiguity ?? 3,
          platformComplexity: inputs.pd.platformComplexity ?? 3,
          discoveryDepth: inputs.pd.discoveryDepth ?? 3,
        })
        setCDInputs({
          ...inputs.cd,
          contentSurfaceArea: inputs.cd.contentSurfaceArea ?? 3,
          localizationScope: inputs.cd.localizationScope ?? 3,
          regulatoryBrandRisk: inputs.cd.regulatoryBrandRisk ?? 3,
          legalComplianceDependency: inputs.cd.legalComplianceDependency ?? 3,
        })
        lastSavedInputsJsonRef.current = JSON.stringify(inputs)
      } else {
        // No data in context: use defaults and mark as unsaved (empty string means not saved yet)
        setPMIntake(getDefaultPMIntake())
        setPDInputs(getDefaultPDInputs())
        setCDInputs(getDefaultCDInputs())
        lastSavedInputsJsonRef.current = ''
      }
    }
  }, [sessionId, itemId, getInputsForItem])

  // Save inputs to context when user edits form fields (except for demo mode).
  // We compare current data with lastSavedInputsJsonRef to avoid saving unchanged data.
  // This prevents infinite loops when getInputsForItem reference changes but data is the same.
  useEffect(() => {
    if (!itemId || sessionId === 'demo') return

    const currentInputs = {
      intake: pmIntake,
      pd: pdInputs,
      cd: cdInputs,
    }
    const currentInputsJson = JSON.stringify(currentInputs)

    // Only save if data has actually changed (user made edits)
    // This comparison prevents the save effect from triggering when:
    // - The load effect runs and sets state (ref already matches)
    // - getInputsForItem reference changes but data is unchanged
    if (currentInputsJson !== lastSavedInputsJsonRef.current) {
      setInputsForItem(itemId, currentInputs)
      // Update ref after saving so we don't save again until data changes
      lastSavedInputsJsonRef.current = currentInputsJson
    }
  }, [itemId, sessionId, pmIntake, pdInputs, cdInputs, setInputsForItem])

  // Calculate UX effort when UX factor scores change
  // Factor scores are stored per-item in pdInputs and default to 3 if not set
  // Only uses the 3 visible factors: productRisk, problemAmbiguity, discoveryDepth
  useEffect(() => {
    if (!itemId || sessionId === 'demo') return

    const updateUXEffort = async () => {
      // Use factor scores from pdInputs, defaulting to 3 if not set
      const uxScores: FactorScores = {
        productRisk: pdInputs.productRisk ?? 3,
        problemAmbiguity: pdInputs.problemAmbiguity ?? 3,
        discoveryDepth: pdInputs.discoveryDepth ?? 3,
      }

      const uxEffort = calculateEffort('ux', uxScores)
      const session = sessionId ? getSessionById(sessionId) : undefined
      const sessionName = session?.name || 'Unknown scenario'
      const itemName = item?.name || 'Unknown item'
      
      await updateItem(itemId, {
        uxSizeBand: uxEffort.sizeBand,
        uxFocusWeeks: uxEffort.focusWeeks,
        uxWorkWeeks: uxEffort.workWeeks,
      })
      
      // Log effort update
      logActivity({
        type: 'effort_updated',
        scenarioId: sessionId,
        scenarioName: sessionName,
        description: `Updated UX effort for '${itemName}' in scenario '${sessionName}' (${uxEffort.sizeBand}, ${uxEffort.focusWeeks} focus weeks).`,
      })
    }

    updateUXEffort().catch((error) => {
      console.error('Error updating UX effort:', error)
    })
  }, [itemId, sessionId, pdInputs.productRisk, pdInputs.problemAmbiguity, pdInputs.discoveryDepth, updateItem, logActivity, getSessionById, item?.name])

  // Calculate Content effort when Content factor scores change
  // Factor scores are stored per-item in cdInputs and default to 3 if not set
  useEffect(() => {
    if (!itemId || sessionId === 'demo') return

    const updateContentEffort = async () => {
      // Use factor scores from cdInputs, defaulting to 3 if not set
      const contentScores: FactorScores = {
        contentSurfaceArea: cdInputs.contentSurfaceArea ?? 3,
        localizationScope: cdInputs.localizationScope ?? 3,
        regulatoryBrandRisk: cdInputs.regulatoryBrandRisk ?? 3,
        legalComplianceDependency: cdInputs.legalComplianceDependency ?? 3,
      }

      const contentEffort = calculateEffort('content', contentScores)
      const session = sessionId ? getSessionById(sessionId) : undefined
      const sessionName = session?.name || 'Unknown scenario'
      const itemName = item?.name || 'Unknown item'
      
      await updateItem(itemId, {
        contentSizeBand: contentEffort.sizeBand,
        contentFocusWeeks: contentEffort.focusWeeks,
        contentWorkWeeks: contentEffort.workWeeks,
      })
    
      // Log effort update
      logActivity({
        type: 'effort_updated',
        scenarioId: sessionId,
        scenarioName: sessionName,
        description: `Updated Content effort for '${itemName}' in scenario '${sessionName}' (${contentEffort.sizeBand}, ${contentEffort.focusWeeks} focus weeks).`,
      })
    }

    updateContentEffort().catch((error) => {
      console.error('Error updating Content effort:', error)
    })
  }, [itemId, sessionId, cdInputs.contentSurfaceArea, cdInputs.localizationScope, cdInputs.regulatoryBrandRisk, cdInputs.legalComplianceDependency, updateItem, logActivity, getSessionById, item?.name])


  // Handle missing itemId
  if (!itemId) {
    return (
      <Box p={8} bg="#0a0a0f" minH="100vh">
        <Alert status="error" bg="#141419" border="1px solid" borderColor="rgba(239, 68, 68, 0.3)">
          <AlertIcon color="#ef4444" />
          <AlertTitle color="white">Invalid item ID</AlertTitle>
          <AlertDescription color="gray.300">No item ID provided in the URL.</AlertDescription>
        </Alert>
      </Box>
    )
  }

  // Handle item not found
  if (!item) {
    return (
      <Box p={8} bg="#0a0a0f" minH="100vh">
        <Alert status="warning" bg="#141419" border="1px solid" borderColor="rgba(245, 158, 11, 0.3)">
          <AlertIcon color="#f59e0b" />
          <AlertTitle color="white">Item not found</AlertTitle>
          <AlertDescription color="gray.300">
            The roadmap item with ID "{itemId}" could not be found in session "{sessionId}".
          </AlertDescription>
        </Alert>
      </Box>
    )
  }

  // Get session data for breadcrumb
  const session = useMemo(() => {
    if (sessionId === 'demo') {
      return { name: 'Demo Session' }
    }
    return sessionId ? getSessionById(sessionId) : undefined
  }, [sessionId, getSessionById])

  const sessionName = session?.name || 'Unknown Session'
  
  // Format status for display
  const formatStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      draft: 'Draft',
      ready_for_sizing: 'Ready for Sizing',
      sized: 'In Progress',
      locked: 'Locked',
    }
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')
  }

  // Get status badge color scheme
  const getStatusColorScheme = (status: string): string => {
    const colorMap: Record<string, string> = {
      draft: 'gray',
      ready_for_sizing: 'yellow',
      sized: 'green',
      locked: 'blue',
    }
    return colorMap[status] || 'gray'
  }

  return (
    <Box minH="100vh" bg="#0a0a0f">
      <Box maxW="1400px" mx="auto" px={6} py={8}>
        {/* Breadcrumb Navigation */}
        <HStack spacing={2} mb={6} align="center" fontSize="14px">
          <IconButton
            aria-label="Back to scenario summary"
            icon={<ChevronLeftIcon />}
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/sessions/${sessionId}`)}
            color="gray.300"
            _hover={{ color: '#00d9ff', bg: 'rgba(255, 255, 255, 0.05)' }}
          />
          <ChakraLink as={Link} to="/" color="#00d9ff" _hover={{ textDecoration: 'underline' }}>
            Home
          </ChakraLink>
          <Text color="gray.400"> &gt; </Text>
          <ChakraLink 
            as={Link} 
            to={`/sessions/${sessionId}`} 
            color="#00d9ff" 
            _hover={{ textDecoration: 'underline' }}
          >
            {sessionName}
          </ChakraLink>
          <Text color="gray.400"> &gt; </Text>
          <Text color="gray.300" fontWeight="medium">
            {item.short_key}: {item.name}
          </Text>
        </HStack>

        {/* Page Heading */}
        <Heading size="xl" mb={2} color="white">
          {item.short_key}: {item.name}
        </Heading>

        {/* Metadata */}
        <HStack spacing={2} mb={8} fontSize="sm" color="gray.400">
          <Text>{item.initiative}</Text>
          <Text>•</Text>
          <Text>P{item.priority}</Text>
          <Text>•</Text>
          <Badge
            bg={getStatusColorScheme(item.status) === 'gray' ? 'rgba(255, 255, 255, 0.1)' : 
                getStatusColorScheme(item.status) === 'yellow' ? 'rgba(245, 158, 11, 0.1)' :
                getStatusColorScheme(item.status) === 'green' ? 'rgba(16, 185, 129, 0.1)' :
                'rgba(59, 130, 246, 0.1)'}
            color={getStatusColorScheme(item.status) === 'gray' ? 'gray.300' : 
                   getStatusColorScheme(item.status) === 'yellow' ? '#f59e0b' :
                   getStatusColorScheme(item.status) === 'green' ? '#10b981' :
                   '#00d9ff'}
            border="1px solid"
            borderColor={getStatusColorScheme(item.status) === 'gray' ? 'rgba(255, 255, 255, 0.2)' : 
                        getStatusColorScheme(item.status) === 'yellow' ? 'rgba(245, 158, 11, 0.5)' :
                        getStatusColorScheme(item.status) === 'green' ? 'rgba(16, 185, 129, 0.5)' :
                        'rgba(0, 217, 255, 0.5)'}
            px={2}
            py={1}
            borderRadius="full"
            fontSize="xs"
          >
            {formatStatus(item.status)}
          </Badge>
        </HStack>

        <Box bg="#141419" borderRadius="md" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)" p={6}>
          <Stack spacing={8}>
            {/* Forms in Tabs */}
            <Tabs>
              <TabList
                borderBottom="none"
                gap={2}
                bg="#1a1a20"
                borderRadius="lg"
                p={1}
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.1)"
              >
                <Tab
                  borderRadius="md"
                  border="none"
                  _selected={{
                    bg: 'linear-gradient(to right, #00b8d9, #1e40af)',
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}
                  _hover={{
                    bg: 'rgba(255, 255, 255, 0.05)',
                  }}
                  color="gray.300"
                  px={4}
                  py={2}
                  transition="all 0.3s ease"
                >
                  PM Intake
                </Tab>
                <Tab
                  borderRadius="md"
                  border="none"
                  _selected={{
                    bg: 'linear-gradient(to right, #00b8d9, #1e40af)',
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}
                  _hover={{
                    bg: 'rgba(255, 255, 255, 0.05)',
                  }}
                  color="gray.300"
                  px={4}
                  py={2}
                  transition="all 0.3s ease"
                >
                  Product Design
                </Tab>
                <Tab
                  borderRadius="md"
                  border="none"
                  _selected={{
                    bg: 'linear-gradient(to right, #00b8d9, #1e40af)',
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}
                  _hover={{
                    bg: 'rgba(255, 255, 255, 0.05)',
                  }}
                  color="gray.300"
                  px={4}
                  py={2}
                  transition="all 0.3s ease"
                >
                  Content Design
                </Tab>
              </TabList>

              <TabPanels>
                {/* PM Intake Tab */}
                <TabPanel px={0} pt={6}>
                  <Text fontSize="sm" color="gray.300" mb={6}>
                    Filled by the product manager to describe business context, goals, market, and
                    requirements.
                  </Text>
                  <PMIntakeForm value={pmIntake} onChange={setPMIntake} />
                  
                  {/* Footer */}
                  <Box mt={8} pt={6} borderTop="1px" borderColor="rgba(255, 255, 255, 0.1)">
                    <Stack spacing={4} align="center">
                      <Text fontSize="sm" color="gray.400" textAlign="center">
                        Changes are saved automatically
                      </Text>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/sessions/${sessionId}`)}
                      >
                        View scenario summary
                      </Button>
                    </Stack>
                  </Box>
                </TabPanel>

                {/* Product Design Inputs Tab */}
                <TabPanel px={0} pt={6}>
                  <Text fontSize="sm" color="gray.300" mb={6}>
                    Filled by the product designer to describe UX complexity factors, patterns, and
                    design considerations.
                  </Text>
                  <PDInputsForm value={pdInputs} onChange={setPDInputs} sizeBand={item.uxSizeBand} />
                  
                  {/* Footer */}
                  <Box mt={8} pt={6} borderTop="1px" borderColor="rgba(255, 255, 255, 0.1)">
                    <Stack spacing={4} align="center">
                      <Text fontSize="sm" color="gray.400" textAlign="center">
                        Changes are saved automatically
                      </Text>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/sessions/${sessionId}`)}
                      >
                        View scenario summary
                      </Button>
                    </Stack>
                  </Box>
                </TabPanel>

                {/* Content Design Inputs Tab */}
                <TabPanel px={0} pt={6}>
                  <Text fontSize="sm" color="gray.300" mb={6}>
                    Filled by the content designer to describe content complexity factors and
                    localization needs.
                  </Text>
                  <CDInputsForm value={cdInputs} onChange={setCDInputs} sizeBand={item.contentSizeBand} />
                  
                  {/* Footer */}
                  <Box mt={8} pt={6} borderTop="1px" borderColor="rgba(255, 255, 255, 0.1)">
                    <Stack spacing={4} align="center">
                      <Text fontSize="sm" color="gray.400" textAlign="center">
                        Changes are saved automatically
                      </Text>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/sessions/${sessionId}`)}
                      >
                        View scenario summary
                      </Button>
                    </Stack>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Stack>
        </Box>
      </Box>
    </Box>
  )
}

export default ItemDetailPage
