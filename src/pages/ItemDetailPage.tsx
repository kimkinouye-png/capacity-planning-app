import {
  Box,
  Heading,
  Stack,
  Divider,
  Text,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import type { PMIntake, ProductDesignInputs, ContentDesignInputs } from '../domain/types'
import PMIntakeForm from '../components/PMIntakeForm'
import PDInputsForm from '../components/PDInputsForm'
import CDInputsForm from '../components/CDInputsForm'
import { sizeUx, sizeContent } from '../estimation/logic'
import { useRoadmapItems } from '../context/RoadmapItemsContext'
import { useItemInputs } from '../context/ItemInputsContext'
import {
  demoItems,
  demoIntakes,
  demoProductDesignInputs,
  demoContentDesignInputs,
} from '../demo/demoSession'

function ItemDetailPage() {
  const { id: sessionId, itemId } = useParams<{ id: string; itemId: string }>()
  const { getItemsForSession } = useRoadmapItems()
  const { getInputsForItem, setInputsForItem } = useItemInputs()

  // Load the RoadmapItem
  const item = useMemo(() => {
    if (sessionId === 'demo' && itemId) {
      return demoItems.find((i) => i.id === itemId)
    }
    if (sessionId && itemId) {
      const items = getItemsForSession(sessionId)
      return items.find((i) => i.id === itemId)
    }
    return undefined
  }, [sessionId, itemId, getItemsForSession])

  // Initialize with sensible defaults
  const getDefaultPMIntake = (): PMIntake => ({
    roadmap_item_id: itemId || '',
    objective: '',
    kpis: '',
    goals: '',
    market: '',
    audience: '',
    timeline: '',
    requirements_business: '',
    requirements_technical: '',
    requirements_design: '',
    surfaces_in_scope: '{}',
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
  })

  // Local state for form inputs
  const [pmIntake, setPMIntake] = useState<PMIntake>(getDefaultPMIntake())
  const [pdInputs, setPDInputs] = useState<ProductDesignInputs>(getDefaultPDInputs())
  const [cdInputs, setCDInputs] = useState<ContentDesignInputs>(getDefaultCDInputs())

  // Load data from context or demo when itemId changes
  useEffect(() => {
    if (!itemId) return

    if (sessionId === 'demo') {
      // Load demo data
      const demoIntake = demoIntakes.find((i) => i.roadmap_item_id === itemId)
      const demoPD = demoProductDesignInputs.find((p) => p.roadmap_item_id === itemId)
      const demoCD = demoContentDesignInputs.find((c) => c.roadmap_item_id === itemId)

      if (demoIntake) {
        setPMIntake({ ...demoIntake })
      } else {
        setPMIntake(getDefaultPMIntake())
      }

      if (demoPD) {
        setPDInputs({ ...demoPD })
      } else {
        setPDInputs(getDefaultPDInputs())
      }

      if (demoCD) {
        setCDInputs({ ...demoCD })
      } else {
        setCDInputs(getDefaultCDInputs())
      }
    } else {
      // Load from context
      const inputs = getInputsForItem(itemId)
      if (inputs) {
        setPMIntake({ ...inputs.intake })
        setPDInputs({ ...inputs.pd })
        setCDInputs({ ...inputs.cd })
      } else {
        // Use defaults if no inputs found
        setPMIntake(getDefaultPMIntake())
        setPDInputs(getDefaultPDInputs())
        setCDInputs(getDefaultCDInputs())
      }
    }
  }, [sessionId, itemId, getInputsForItem])

  // Save inputs to context when they change (except for demo)
  useEffect(() => {
    if (!itemId || sessionId === 'demo') return

    setInputsForItem(itemId, {
      intake: pmIntake,
      pd: pdInputs,
      cd: cdInputs,
    })
  }, [itemId, sessionId, pmIntake, pdInputs, cdInputs, setInputsForItem])

  // Calculate sizing estimates (updates automatically when form fields change)
  const uxEstimate = useMemo(() => {
    try {
      if (pmIntake && pdInputs && pmIntake.surfaces_in_scope !== undefined) {
        return sizeUx(pdInputs, pmIntake)
      }
    } catch (error) {
      console.error('Error calculating UX sizing:', error)
    }
    return null
  }, [pmIntake, pdInputs])

  const contentEstimate = useMemo(() => {
    try {
      if (cdInputs) {
        return sizeContent(cdInputs)
      }
    } catch (error) {
      console.error('Error calculating Content sizing:', error)
    }
    return null
  }, [cdInputs])

  // Handle missing itemId
  if (!itemId) {
    return (
      <Box p={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Invalid item ID</AlertTitle>
          <AlertDescription>No item ID provided in the URL.</AlertDescription>
        </Alert>
      </Box>
    )
  }

  // Handle item not found
  if (!item) {
    return (
      <Box p={8}>
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>Item not found</AlertTitle>
          <AlertDescription>
            The roadmap item with ID "{itemId}" could not be found in session "{sessionId}".
          </AlertDescription>
        </Alert>
      </Box>
    )
  }

  return (
    <Box p={8}>
      {/* Item key/name at the top */}
      <Heading size="lg" mb={6}>
        {item.short_key} - {item.name}
      </Heading>

      <Stack spacing={8}>
        {/* Forms in Tabs */}
        <Tabs>
          <TabList>
            <Tab>PM Intake</Tab>
            <Tab>Product Design</Tab>
            <Tab>Content Design</Tab>
          </TabList>

          <TabPanels>
            {/* PM Intake Tab */}
            <TabPanel>
              <Text fontSize="sm" color="gray.600" mb={4}>
                Filled by the product manager to describe business context, goals, market, and
                requirements.
              </Text>
              <PMIntakeForm value={pmIntake} onChange={setPMIntake} />
            </TabPanel>

            {/* Product Design Inputs Tab */}
            <TabPanel>
              <Text fontSize="sm" color="gray.600" mb={4}>
                Filled by the product designer to describe UX complexity factors, patterns, and
                design considerations.
              </Text>
              <PDInputsForm value={pdInputs} onChange={setPDInputs} />
            </TabPanel>

            {/* Content Design Inputs Tab */}
            <TabPanel>
              <Text fontSize="sm" color="gray.600" mb={4}>
                Filled by the content designer to describe content requirements, compliance needs,
                and guidance complexity.
              </Text>
              <CDInputsForm value={cdInputs} onChange={setCDInputs} />
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Divider />

        {/* Size Estimates Section - Always visible below tabs */}
        <Box>
          <Heading size="md" mb={4}>
            Size Estimates
          </Heading>
          <Stack spacing={4}>
            {/* UX Estimate Card */}
            <Card>
              <CardBody>
                <Text fontWeight="bold" mb={3} fontSize="lg">
                  UX Design
                </Text>
                <Stack direction="row" spacing={4} flexWrap="wrap">
                  <Text>
                    <strong>T-shirt Size:</strong>{' '}
                    <Badge colorScheme="blue">
                      {uxEstimate ? uxEstimate.tshirtSize : '—'}
                    </Badge>
                  </Text>
                  <Text>
                    <strong>Sprints:</strong> {uxEstimate ? uxEstimate.sprints : '—'}
                  </Text>
                  <Text>
                    <strong>Designer Weeks:</strong>{' '}
                    {uxEstimate ? uxEstimate.designerWeeks.toFixed(1) : '—'}
                  </Text>
                </Stack>
              </CardBody>
            </Card>

            {/* Content Estimate Card */}
            <Card>
              <CardBody>
                <Text fontWeight="bold" mb={3} fontSize="lg">
                  Content Design
                </Text>
                <Stack direction="row" spacing={4} flexWrap="wrap">
                  <Text>
                    <strong>T-shirt Size:</strong>{' '}
                    <Badge colorScheme="green">
                      {contentEstimate
                        ? contentEstimate.tshirtSize === 'None'
                          ? 'None'
                          : contentEstimate.tshirtSize
                        : '—'}
                    </Badge>
                  </Text>
                  <Text>
                    <strong>Sprints:</strong>{' '}
                    {contentEstimate ? contentEstimate.sprints : '—'}
                  </Text>
                  <Text>
                    <strong>Designer Weeks:</strong>{' '}
                    {contentEstimate ? contentEstimate.designerWeeks.toFixed(1) : '—'}
                  </Text>
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}

export default ItemDetailPage
