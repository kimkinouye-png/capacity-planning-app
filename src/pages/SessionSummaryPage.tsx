import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Stack,
  Text,
  Badge,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Card,
  CardBody,
  Tooltip,
  IconButton,
  HStack,
  Divider,
} from '@chakra-ui/react'
import { useParams, Link } from 'react-router-dom'
import { useMemo } from 'react'
import { InfoIcon } from '@chakra-ui/icons'
import { summarizeSession } from '../estimation/logic'
import { usePlanningSessions } from '../context/PlanningSessionsContext'
import { useRoadmapItems } from '../context/RoadmapItemsContext'
import { useItemInputs } from '../context/ItemInputsContext'
import type { PMIntake, ProductDesignInputs, ContentDesignInputs } from '../domain/types'
import {
  demoSession,
  demoItems,
  demoIntakes,
  demoProductDesignInputs,
  demoContentDesignInputs,
} from '../demo/demoSession'

// Default empty inputs for items without PM/PD/CD data
const getDefaultPMIntake = (itemId: string): PMIntake => ({
  roadmap_item_id: itemId,
  objective: '',
  kpis: '',
  goals: '',
  market: '',
  audience: '',
  timeline: '',
  requirements_business: '',
  requirements_technical: '',
  requirements_design: '',
    surfaces_in_scope: [],
  new_or_existing: 'existing',
})

const getDefaultPDInputs = (itemId: string): ProductDesignInputs => ({
  roadmap_item_id: itemId,
  net_new_patterns: false,
  changes_to_information_architecture: false,
  multiple_user_states_or_paths: false,
  significant_edge_cases_or_error_handling: false,
  responsive_or_adaptive_layouts: false,
  other: '',
  // Default factor scores set to 3 (medium) for all new items
  productRisk: 3,
  problemAmbiguity: 3,
  platformComplexity: 3,
  discoveryDepth: 3,
})

const getDefaultCDInputs = (itemId: string): ContentDesignInputs => ({
  roadmap_item_id: itemId,
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
  // Default factor scores set to 3 (medium) for all new items
  contentSurfaceArea: 3,
  localizationScope: 3,
  regulatoryBrandRisk: 3,
  legalComplianceDependency: 3,
})

function SessionSummaryPage() {
  const { id } = useParams<{ id: string }>()
  const { getSessionById } = usePlanningSessions()
  const { getItemsForSession } = useRoadmapItems()
  const { getInputsForItem } = useItemInputs()

  // Get session (fallback to demo if id is 'demo')
  const session = useMemo(() => {
    if (id === 'demo') {
      return demoSession
    }
    return id ? getSessionById(id) : undefined
  }, [id, getSessionById])

  // Get items (fallback to demo if id is 'demo')
  const items = useMemo(() => {
    if (id === 'demo') {
      return demoItems
    }
    return id ? getItemsForSession(id) : []
  }, [id, getItemsForSession])

  // Prepare items with inputs (use defaults if inputs are missing)
  const itemsWithInputs = useMemo(() => {
    if (id === 'demo') {
      // Use demo data
      return demoItems.map((item) => {
        const intake = demoIntakes.find((i) => i.roadmap_item_id === item.id)!
        const pd = demoProductDesignInputs.find((p) => p.roadmap_item_id === item.id)!
        const cd = demoContentDesignInputs.find((c) => c.roadmap_item_id === item.id)!
        return { item, intake, pd, cd }
      })
    }

    // Use real data from context, with defaults for missing inputs
    return items.map((item) => {
      const inputs = getInputsForItem(item.id)
      return {
        item,
        intake: inputs?.intake || getDefaultPMIntake(item.id),
        pd: inputs?.pd || getDefaultPDInputs(item.id),
        cd: inputs?.cd || getDefaultCDInputs(item.id),
      }
    })
  }, [id, items, getInputsForItem])

  // Calculate summary (recomputes when session or itemsWithInputs changes)
  const summary = useMemo(() => {
    if (!session || itemsWithInputs.length === 0) {
      return null
    }
    try {
      const result = summarizeSession(session, itemsWithInputs)
      // Ensure all items have the new fields with defaults if missing
      if (result && result.items) {
        return {
          ...result,
          items: result.items.map((itemEstimate) => {
            // Safely get tshirt sizes with fallbacks
            const uxTshirtSize = itemEstimate.uxSizing?.tshirtSize || 'M'
            const contentTshirtSize = itemEstimate.contentSizing?.tshirtSize || 'M'
            
            return {
              ...itemEstimate,
              item: {
                ...itemEstimate.item,
                uxSizeBand: itemEstimate.item.uxSizeBand || uxTshirtSize,
                uxFocusWeeks: typeof itemEstimate.item.uxFocusWeeks === 'number' ? itemEstimate.item.uxFocusWeeks : 0,
                uxWorkWeeks: typeof itemEstimate.item.uxWorkWeeks === 'number' ? itemEstimate.item.uxWorkWeeks : 0,
                contentSizeBand: itemEstimate.item.contentSizeBand || (contentTshirtSize === 'None' ? 'M' : contentTshirtSize),
                contentFocusWeeks: typeof itemEstimate.item.contentFocusWeeks === 'number' ? itemEstimate.item.contentFocusWeeks : 0,
                contentWorkWeeks: typeof itemEstimate.item.contentWorkWeeks === 'number' ? itemEstimate.item.contentWorkWeeks : 0,
              },
            }
          }),
        }
      }
      return result
    } catch (error) {
      console.error('Error calculating summary:', error)
      return null
    }
  }, [session, itemsWithInputs])

  // Find the cut line index for visual separation
  const cutLineIndex = useMemo(() => {
    if (!summary || !summary.items) return -1
    for (let i = 0; i < summary.items.length; i++) {
      if (summary.items[i].aboveCutLineUX || summary.items[i].aboveCutLineContent) {
        return i
      }
    }
    return -1
  }, [summary])

  // Handle missing session
  if (!id) {
    return (
      <Box p={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Invalid session ID</AlertTitle>
          <AlertDescription>No session ID provided in the URL.</AlertDescription>
        </Alert>
      </Box>
    )
  }

  if (!session) {
    return (
      <Box p={8}>
        <Alert status="warning">
          <AlertIcon />
          <AlertTitle>Session not found</AlertTitle>
          <AlertDescription>
            The planning session with ID "{id}" could not be found.
          </AlertDescription>
        </Alert>
      </Box>
    )
  }

  if (itemsWithInputs.length === 0) {
    return (
      <Box p={8}>
        <Stack direction="row" justify="space-between" align="center" mb={6}>
          <Heading size="lg">{session.name} - Summary</Heading>
          <Button as={Link} to={`/sessions/${id}/items`} colorScheme="blue">
            Add Roadmap Items
          </Button>
        </Stack>
        <Alert status="info">
          <AlertIcon />
          <AlertTitle>No roadmap items</AlertTitle>
          <AlertDescription>
            This session has no roadmap items yet. Click "Add Roadmap Items" above to create items
            and fill in their inputs to see the summary.
          </AlertDescription>
        </Alert>
      </Box>
    )
  }

  if (!summary) {
    return (
      <Box p={8}>
        <Heading size="lg" mb={6}>
          {session.name} - Summary
        </Heading>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error calculating summary</AlertTitle>
          <AlertDescription>
            There was an error calculating the session summary. Please check the console for
            details.
          </AlertDescription>
        </Alert>
      </Box>
    )
  }

  return (
    <Box p={8}>
      <Alert status="info" mb={6} borderRadius="md">
        <InfoIcon boxSize={5} mr={3} />
        <AlertTitle>Design Capacity Summary</AlertTitle>
      </Alert>

      <Stack direction="row" justify="space-between" align="center" mb={8}>
        <Heading size="lg">{session.name} - Planning Dashboard</Heading>
        <Stack direction="row" spacing={3}>
          <Button as={Link} to={`/sessions/${id}/items`} colorScheme="blue" variant="outline">
            View items
          </Button>
          <Button colorScheme="blue" onClick={() => window.location.reload()}>
            Recalculate
          </Button>
        </Stack>
      </Stack>

      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={8}>
        {/* UX Total Weeks Card */}
        <Card>
          <CardBody>
            <Stack spacing={2}>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  UX Total Weeks
                </Text>
                <Tooltip
                  label="Total designer-weeks needed for all UX work. Designer-weeks = sprints × sprint length in weeks."
                  placement="top"
                >
                  <IconButton
                    aria-label="Info about designer-weeks"
                    icon={<InfoIcon />}
                    size="xs"
                    variant="ghost"
                  />
                </Tooltip>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold">
                {summary.totals.totalUxWeeks.toFixed(1)}
              </Text>
              <Text fontSize="sm" color="gray.500">
                of {summary.totals.uxCapacityWeeks.toFixed(1)} capacity
              </Text>
              <Badge
                colorScheme={summary.totals.uxSurplusDeficit >= 0 ? 'green' : 'red'}
                alignSelf="flex-start"
              >
                {summary.totals.uxSurplusDeficit >= 0 ? '+' : ''}
                {summary.totals.uxSurplusDeficit.toFixed(1)} weeks
              </Badge>
            </Stack>
          </CardBody>
        </Card>

        {/* Content Total Weeks Card */}
        <Card>
          <CardBody>
            <Stack spacing={2}>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Content Total Weeks
                </Text>
                <Tooltip
                  label="Total designer-weeks needed for all Content work. Designer-weeks = sprints × sprint length in weeks."
                  placement="top"
                >
                  <IconButton
                    aria-label="Info about designer-weeks"
                    icon={<InfoIcon />}
                    size="xs"
                    variant="ghost"
                  />
                </Tooltip>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold">
                {summary.totals.totalContentWeeks.toFixed(1)}
              </Text>
              <Text fontSize="sm" color="gray.500">
                of {summary.totals.contentCapacityWeeks.toFixed(1)} capacity
              </Text>
              <Badge
                colorScheme={summary.totals.contentSurplusDeficit >= 0 ? 'green' : 'red'}
                alignSelf="flex-start"
              >
                {summary.totals.contentSurplusDeficit >= 0 ? '+' : ''}
                {summary.totals.contentSurplusDeficit.toFixed(1)} weeks
              </Badge>
            </Stack>
          </CardBody>
        </Card>

        {/* UX Headcount Card */}
        <Card>
          <CardBody>
            <Stack spacing={2}>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  UX Headcount Needed
                </Text>
                <Tooltip
                  label="Estimated number of UX designers needed to complete all work within the planning period."
                  placement="top"
                >
                  <IconButton
                    aria-label="Info about headcount"
                    icon={<InfoIcon />}
                    size="xs"
                    variant="ghost"
                  />
                </Tooltip>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold">
                {summary.totals.uxHeadcountNeeded}
              </Text>
              <Text fontSize="sm" color="gray.500">
                currently {session.ux_designers} designers
              </Text>
            </Stack>
          </CardBody>
        </Card>

        {/* Content Headcount Card */}
        <Card>
          <CardBody>
            <Stack spacing={2}>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  Content Headcount Needed
                </Text>
                <Tooltip
                  label="Estimated number of Content designers needed to complete all work within the planning period."
                  placement="top"
                >
                  <IconButton
                    aria-label="Info about headcount"
                    icon={<InfoIcon />}
                    size="xs"
                    variant="ghost"
                  />
                </Tooltip>
              </HStack>
              <Text fontSize="2xl" fontWeight="bold">
                {summary.totals.contentHeadcountNeeded}
              </Text>
              <Text fontSize="sm" color="gray.500">
                currently {session.content_designers} designers
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Roadmap Items Table */}
      <Box>
        <HStack spacing={2} mb={4}>
          <Heading size="md">Roadmap Items</Heading>
          <Tooltip
            label="Items above the cut line exceed available capacity. The cut line marks where items fit within the available designer-weeks, sorted by initiative and priority."
            placement="top"
          >
            <IconButton
              aria-label="Info about cut line"
              icon={<InfoIcon />}
              size="sm"
              variant="ghost"
            />
          </Tooltip>
        </HStack>

        <TableContainer>
          <Table variant="simple">
            <Thead>
              {/* Grouping row for role sections */}
              <Tr>
                <Th colSpan={3} bg="gray.50" borderRight="1px" borderColor="gray.300">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.700" textTransform="uppercase">
                    Item Information
                  </Text>
                </Th>
                <Th colSpan={3} bg="blue.50" borderRight="1px" borderColor="gray.300">
                  <Text fontSize="xs" fontWeight="semibold" color="blue.700" textTransform="uppercase">
                    UX Design
                  </Text>
                </Th>
                <Th colSpan={3} bg="green.50" borderRight="1px" borderColor="gray.300">
                  <Text fontSize="xs" fontWeight="semibold" color="green.700" textTransform="uppercase">
                    Content Design
                  </Text>
                </Th>
                <Th bg="gray.50">
                  <Text fontSize="xs" fontWeight="semibold" color="gray.700" textTransform="uppercase">
                    Status
                  </Text>
                </Th>
              </Tr>
              {/* Column headers */}
              <Tr>
                <Th bg="gray.50" borderRight="1px" borderColor="gray.300">Key</Th>
                <Th bg="gray.50" borderRight="1px" borderColor="gray.300">Name</Th>
                <Th bg="gray.50" borderRight="1px" borderColor="gray.300">Initiative</Th>
                <Th bg="blue.50" borderRight="1px" borderColor="gray.300">
                  <HStack spacing={1}>
                    <Text>UX Size</Text>
                    <Tooltip
                      label="T-shirt size (XS, S, M, L, XL) representing the complexity of UX work."
                      placement="top"
                    >
                      <IconButton
                        aria-label="Info about UX size"
                        icon={<InfoIcon />}
                        size="xs"
                        variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                </Th>
                <Th bg="blue.50" borderRight="1px" borderColor="gray.300">
                  <HStack spacing={1}>
                    <Text>UX Focus Weeks</Text>
                    <Tooltip
                      label="Dedicated designer time (focus weeks) needed for UX work."
                      placement="top"
                    >
                      <IconButton
                        aria-label="Info about UX focus weeks"
                        icon={<InfoIcon />}
                        size="xs"
                        variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                </Th>
                <Th bg="blue.50" borderRight="1px" borderColor="gray.300">
                  <HStack spacing={1}>
                    <Text>UX Work Weeks</Text>
                    <Tooltip
                      label="Calendar span (work weeks) needed to complete UX focus weeks, accounting for context switching."
                      placement="top"
                    >
                      <IconButton
                        aria-label="Info about UX work weeks"
                        icon={<InfoIcon />}
                        size="xs"
                        variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                </Th>
                <Th bg="green.50" borderRight="1px" borderColor="gray.300">
                  <HStack spacing={1}>
                    <Text>Content Size</Text>
                    <Tooltip
                      label="T-shirt size (XS, S, M, L, XL) representing the complexity of Content work."
                      placement="top"
                    >
                      <IconButton
                        aria-label="Info about Content size"
                        icon={<InfoIcon />}
                        size="xs"
                        variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                </Th>
                <Th bg="green.50" borderRight="1px" borderColor="gray.300">
                  <HStack spacing={1}>
                    <Text>Content Focus Weeks</Text>
                    <Tooltip
                      label="Dedicated designer time (focus weeks) needed for Content work."
                      placement="top"
                    >
                      <IconButton
                        aria-label="Info about Content focus weeks"
                        icon={<InfoIcon />}
                        size="xs"
                        variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                </Th>
                <Th bg="green.50" borderRight="1px" borderColor="gray.300">
                  <HStack spacing={1}>
                    <Text>Content Work Weeks</Text>
                    <Tooltip
                      label="Calendar span (work weeks) needed to complete Content focus weeks, accounting for context switching."
                      placement="top"
                    >
                      <IconButton
                        aria-label="Info about Content work weeks"
                        icon={<InfoIcon />}
                        size="xs"
                        variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                </Th>
                <Th bg="gray.50">Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {summary.items?.map((itemEstimate, index) => {
                const isAboveCutLine =
                  itemEstimate.aboveCutLineUX || itemEstimate.aboveCutLineContent
                const showDivider = index === cutLineIndex && cutLineIndex > 0

                return (
                  <>
                    {showDivider && (
                      <Tr>
                        <Td colSpan={10} p={0}>
                          <Divider borderColor="red.300" borderWidth="2px" />
                        </Td>
                      </Tr>
                    )}
                    <Tr
                      key={itemEstimate.item.id}
                      bg={isAboveCutLine ? 'red.50' : 'transparent'}
                      _hover={{ bg: isAboveCutLine ? 'red.100' : 'gray.50' }}
                    >
                      {/* Item Information columns */}
                      <Td fontWeight="medium" borderRight="1px" borderColor="gray.200">
                        {itemEstimate.item.short_key}
                      </Td>
                      <Td borderRight="1px" borderColor="gray.200">
                        {itemEstimate.item.name}
                      </Td>
                      <Td borderRight="1px" borderColor="gray.300">
                        {itemEstimate.item.initiative}
                      </Td>
                      
                      {/* UX Design columns */}
                      <Td bg={isAboveCutLine ? undefined : 'blue.50'} borderRight="1px" borderColor="gray.200">
                        {itemEstimate.item.uxSizeBand ? (
                          <Badge colorScheme="blue">
                            {itemEstimate.item.uxSizeBand}
                          </Badge>
                        ) : itemEstimate.uxSizing?.tshirtSize ? (
                          <Badge colorScheme="blue">
                            {itemEstimate.uxSizing.tshirtSize}
                          </Badge>
                        ) : (
                          <Text color="gray.400" fontSize="sm">Not sized</Text>
                        )}
                      </Td>
                      <Td bg={isAboveCutLine ? undefined : 'blue.50'} borderRight="1px" borderColor="gray.200">
                        {typeof itemEstimate.item.uxFocusWeeks === 'number' && itemEstimate.item.uxFocusWeeks > 0
                          ? itemEstimate.item.uxFocusWeeks.toFixed(1)
                          : '—'}
                      </Td>
                      <Td bg={isAboveCutLine ? undefined : 'blue.50'} borderRight="1px" borderColor="gray.300">
                        {typeof itemEstimate.item.uxWorkWeeks === 'number' && itemEstimate.item.uxWorkWeeks > 0
                          ? itemEstimate.item.uxWorkWeeks.toFixed(1)
                          : '—'}
                      </Td>
                      
                      {/* Content Design columns */}
                      <Td bg={isAboveCutLine ? undefined : 'green.50'} borderRight="1px" borderColor="gray.200">
                        {itemEstimate.item.contentSizeBand ? (
                          <Badge colorScheme="green">
                            {itemEstimate.item.contentSizeBand}
                          </Badge>
                        ) : itemEstimate.contentSizing?.tshirtSize && itemEstimate.contentSizing.tshirtSize !== 'None' ? (
                          <Badge colorScheme="green">
                            {itemEstimate.contentSizing.tshirtSize}
                          </Badge>
                        ) : (
                          <Text color="gray.400" fontSize="sm">Not sized</Text>
                        )}
                      </Td>
                      <Td bg={isAboveCutLine ? undefined : 'green.50'} borderRight="1px" borderColor="gray.200">
                        {typeof itemEstimate.item.contentFocusWeeks === 'number' && itemEstimate.item.contentFocusWeeks > 0
                          ? itemEstimate.item.contentFocusWeeks.toFixed(1)
                          : '—'}
                      </Td>
                      <Td bg={isAboveCutLine ? undefined : 'green.50'} borderRight="1px" borderColor="gray.300">
                        {typeof itemEstimate.item.contentWorkWeeks === 'number' && itemEstimate.item.contentWorkWeeks > 0
                          ? itemEstimate.item.contentWorkWeeks.toFixed(1)
                          : '—'}
                      </Td>
                      
                      {/* Status column */}
                      <Td>
                        <Stack direction="row" spacing={2}>
                          {itemEstimate.aboveCutLineUX && (
                            <Badge colorScheme="red">UX Above</Badge>
                          )}
                          {itemEstimate.aboveCutLineContent && (
                            <Badge colorScheme="red">CD Above</Badge>
                          )}
                          {!itemEstimate.aboveCutLineUX && !itemEstimate.aboveCutLineContent && (
                            <Badge colorScheme="green">Within</Badge>
                          )}
                        </Stack>
                      </Td>
                    </Tr>
                  </>
                )
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}

export default SessionSummaryPage
