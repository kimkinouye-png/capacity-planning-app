import {
  Box,
  Heading,
  Stack,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Link as ChakraLink,
  Select,
} from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { usePlanningSessions } from '../context/PlanningSessionsContext'
import { useRoadmapItems } from '../context/RoadmapItemsContext'
import { useItemInputs } from '../context/ItemInputsContext'
import type { PlanningSession, PlanningPeriod } from '../domain/types'

const QUARTER_OPTIONS: PlanningPeriod[] = ['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4']
import {
  demoItems,
  demoIntakes,
  demoProductDesignInputs,
  demoContentDesignInputs,
} from '../demo/demoSession'

interface ScenarioMetrics {
  uxFocusCapacity: number
  uxFocusDemand: number | null
  contentFocusCapacity: number
  contentFocusDemand: number | null
  uxWorkCapacity: number
  uxWorkDemand: number | null
  contentWorkCapacity: number
  contentWorkDemand: number | null
  status: 'Within capacity' | 'Over capacity' | null
}

// Calculate capacity and demand metrics for a scenario
function calculateScenarioMetrics(
  session: PlanningSession,
  items: ReturnType<typeof useRoadmapItems>['getItemsForSession']
): ScenarioMetrics {
  // Safely calculate capacities with defaults
  const uxDesigners = session.ux_designers ?? 0
  const contentDesigners = session.content_designers ?? 0
  const weeksPerPeriod = session.weeks_per_period ?? 0
  
  const uxFocusCapacity = uxDesigners * weeksPerPeriod
  const contentFocusCapacity = contentDesigners * weeksPerPeriod
  const uxWorkCapacity = weeksPerPeriod // Calendar weeks
  const contentWorkCapacity = weeksPerPeriod // Calendar weeks

  // Calculate demands from items - safely handle undefined/null
  let sessionItems: ReturnType<typeof items> = []
  try {
    sessionItems = items(session.id) || []
  } catch (error) {
    console.error('Error getting items for session:', error)
    sessionItems = []
  }
  
  if (!sessionItems || sessionItems.length === 0) {
    return {
      uxFocusCapacity,
      uxFocusDemand: null,
      contentFocusCapacity,
      contentFocusDemand: null,
      uxWorkCapacity,
      uxWorkDemand: null,
      contentWorkCapacity,
      contentWorkDemand: null,
      status: null,
    }
  }

  let uxFocusDemand = 0
  let contentFocusDemand = 0
  let uxWorkDemand = 0
  let contentWorkDemand = 0
  let hasValidData = false

  sessionItems.forEach((item) => {
    // Check if we have valid focus/work weeks data
    if (
      typeof item.uxFocusWeeks === 'number' &&
      typeof item.uxWorkWeeks === 'number' &&
      typeof item.contentFocusWeeks === 'number' &&
      typeof item.contentWorkWeeks === 'number'
    ) {
      uxFocusDemand += item.uxFocusWeeks
      contentFocusDemand += item.contentFocusWeeks
      uxWorkDemand = Math.max(uxWorkDemand, item.uxWorkWeeks) // Work weeks is calendar span, so take max
      contentWorkDemand = Math.max(contentWorkDemand, item.contentWorkWeeks)
      hasValidData = true
    }
  })

  // Determine status
  let status: 'Within capacity' | 'Over capacity' | null = null
  if (hasValidData) {
    const isOverCapacity =
      uxFocusDemand > uxFocusCapacity ||
      contentFocusDemand > contentFocusCapacity ||
      uxWorkDemand > uxWorkCapacity ||
      contentWorkDemand > contentWorkCapacity
    status = isOverCapacity ? 'Over capacity' : 'Within capacity'
  }

  return {
    uxFocusCapacity,
    uxFocusDemand: hasValidData ? uxFocusDemand : null,
    contentFocusCapacity,
    contentFocusDemand: hasValidData ? contentFocusDemand : null,
    uxWorkCapacity,
    uxWorkDemand: hasValidData ? uxWorkDemand : null,
    contentWorkCapacity,
    contentWorkDemand: hasValidData ? contentWorkDemand : null,
    status,
  }
}

function SessionsListPage() {
  const { sessions, createSession } = usePlanningSessions()
  const { createItem, getItemsForSession } = useRoadmapItems()
  const { setInputsForItem } = useItemInputs()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    planningPeriod: '2026-Q4' as PlanningPeriod, // Default to Q4 2026
    weeks_per_period: 13,
    sprint_length_weeks: 2,
    ux_designers: 3,
    content_designers: 2,
    created_by: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newSession = createSession({
      name: formData.name,
      planningPeriod: formData.planningPeriod,
      weeks_per_period: formData.weeks_per_period,
      sprint_length_weeks: formData.sprint_length_weeks,
      ux_designers: formData.ux_designers,
      content_designers: formData.content_designers,
      created_by: formData.created_by || undefined,
    })
    onClose()
    setFormData({
      name: '',
      planningPeriod: '2026-Q4',
      weeks_per_period: 13,
      sprint_length_weeks: 2,
      ux_designers: 3,
      content_designers: 2,
      created_by: '',
    })
    navigate(`/sessions/${newSession.id}`)
  }

  const handleCreateDemoSession = () => {
    // Create a new session with default capacity
    const currentYear = new Date().getFullYear()
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3)
    const defaultPeriod: PlanningPeriod = `${currentYear}-Q${currentQuarter}` as PlanningPeriod
    
    const newSession = createSession({
      name: 'Demo Session',
      planningPeriod: defaultPeriod,
      weeks_per_period: 12,
      sprint_length_weeks: 2,
      ux_designers: 3,
      content_designers: 1,
      created_by: 'demo-helper',
    })

    // Seed 2-3 roadmap items from demo data (using first 2 items)
    const itemsToSeed = demoItems.slice(0, 2)
    itemsToSeed.forEach((demoItem) => {
      // Create the item (without the demo item ID, let it generate a new one)
      const newItem = createItem(newSession.id, {
        short_key: demoItem.short_key,
        name: demoItem.name,
        initiative: demoItem.initiative,
        team_name: demoItem.team_name,
        priority: demoItem.priority,
      })

      // Find the corresponding inputs from demo data
      const intake = demoIntakes.find((i) => i.roadmap_item_id === demoItem.id)
      const pd = demoProductDesignInputs.find((p) => p.roadmap_item_id === demoItem.id)
      const cd = demoContentDesignInputs.find((c) => c.roadmap_item_id === demoItem.id)

      // Set the inputs for the new item (update roadmap_item_id to match new item ID)
      if (intake && pd && cd) {
        setInputsForItem(newItem.id, {
          intake: { ...intake, roadmap_item_id: newItem.id },
          pd: { ...pd, roadmap_item_id: newItem.id },
          cd: { ...cd, roadmap_item_id: newItem.id },
        })
      }
    })

    // Navigate to the new session's summary page
    navigate(`/sessions/${newSession.id}`)
  }

  // Calculate metrics for each scenario - safely handle undefined/null
  const scenarioMetrics = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return []
    }
    return sessions
      .filter((session) => session != null) // Filter out null/undefined sessions
      .map((session) => {
        try {
          return {
            session,
            metrics: calculateScenarioMetrics(session, getItemsForSession),
          }
        } catch (error) {
          console.error('Error calculating metrics for session:', session?.id, error)
          // Return safe defaults if calculation fails
          return {
            session,
            metrics: {
              uxFocusCapacity: 0,
              uxFocusDemand: null,
              contentFocusCapacity: 0,
              contentFocusDemand: null,
              uxWorkCapacity: 0,
              uxWorkDemand: null,
              contentWorkCapacity: 0,
              contentWorkDemand: null,
              status: null,
            },
          }
        }
      })
  }, [sessions, getItemsForSession])

  return (
    <Box p={8}>
      <Stack direction="row" justify="space-between" align="center" mb={6}>
        <Heading size="lg">Planning Scenarios</Heading>
        <Stack direction="row" spacing={3}>
          <Button variant="outline" colorScheme="gray" onClick={handleCreateDemoSession}>
            Create demo session
          </Button>
          <Button colorScheme="blue" onClick={onOpen}>
            New scenario
          </Button>
        </Stack>
      </Stack>

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Scenario Name</Th>
              <Th>Planning Period</Th>
              <Th>UX: Focus Capacity vs Demand</Th>
              <Th>Content: Focus Capacity vs Demand</Th>
              <Th>UX: Work Capacity vs Demand</Th>
              <Th>Content: Work Capacity vs Demand</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sessions.length === 0 ? (
              <Tr>
                <Td colSpan={7} textAlign="center" color="gray.500" py={8}>
                  No planning scenarios yet. Create one to get started.
                </Td>
              </Tr>
            ) : (
              scenarioMetrics.map(({ session, metrics }) => (
                <Tr key={session?.id || 'unknown'}>
                  <Td>
                    {session?.id ? (
                      <ChakraLink as={Link} to={`/sessions/${session.id}`} color="blue.500">
                        {session.name || 'Unnamed Scenario'}
                      </ChakraLink>
                    ) : (
                      <Text>{session?.name || 'Unnamed Scenario'}</Text>
                    )}
                  </Td>
                  <Td>
                    {session?.planningPeriod || session?.planning_period || '—'}
                  </Td>
                  <Td>
                    {metrics && typeof metrics.uxFocusCapacity === 'number' && metrics.uxFocusDemand !== null && typeof metrics.uxFocusDemand === 'number'
                      ? `${metrics.uxFocusCapacity.toFixed(1)} / ${metrics.uxFocusDemand.toFixed(1)}`
                      : metrics && typeof metrics.uxFocusCapacity === 'number'
                      ? `${metrics.uxFocusCapacity.toFixed(1)} / —`
                      : '—'}
                  </Td>
                  <Td>
                    {metrics && typeof metrics.contentFocusCapacity === 'number' && metrics.contentFocusDemand !== null && typeof metrics.contentFocusDemand === 'number'
                      ? `${metrics.contentFocusCapacity.toFixed(1)} / ${metrics.contentFocusDemand.toFixed(1)}`
                      : metrics && typeof metrics.contentFocusCapacity === 'number'
                      ? `${metrics.contentFocusCapacity.toFixed(1)} / —`
                      : '—'}
                  </Td>
                  <Td>
                    {metrics && typeof metrics.uxWorkCapacity === 'number' && metrics.uxWorkDemand !== null && typeof metrics.uxWorkDemand === 'number'
                      ? `${metrics.uxWorkCapacity.toFixed(1)} / ${metrics.uxWorkDemand.toFixed(1)}`
                      : metrics && typeof metrics.uxWorkCapacity === 'number'
                      ? `${metrics.uxWorkCapacity.toFixed(1)} / —`
                      : '—'}
                  </Td>
                  <Td>
                    {metrics && typeof metrics.contentWorkCapacity === 'number' && metrics.contentWorkDemand !== null && typeof metrics.contentWorkDemand === 'number'
                      ? `${metrics.contentWorkCapacity.toFixed(1)} / ${metrics.contentWorkDemand.toFixed(1)}`
                      : metrics && typeof metrics.contentWorkCapacity === 'number'
                      ? `${metrics.contentWorkCapacity.toFixed(1)} / —`
                      : '—'}
                  </Td>
                  <Td>
                    {metrics && metrics.status ? (
                      <Text
                        color={metrics.status === 'Within capacity' ? 'green.600' : 'red.600'}
                        fontWeight="medium"
                      >
                        {metrics.status}
                      </Text>
                    ) : (
                      '—'
                    )}
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>Create New Scenario</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Payments Q2 2026"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Planning Period</FormLabel>
                  <Select
                    value={formData.planningPeriod}
                    onChange={(e) =>
                      setFormData({ ...formData, planningPeriod: e.target.value as PlanningPeriod })
                    }
                  >
                    {QUARTER_OPTIONS.map((period) => (
                      <option key={period} value={period}>
                        {period}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Weeks per Period</FormLabel>
                  <NumberInput
                    value={formData.weeks_per_period}
                    onChange={(_, valueAsNumber) =>
                      setFormData({ ...formData, weeks_per_period: valueAsNumber || 13 })
                    }
                    min={1}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Sprint Length (weeks)</FormLabel>
                  <NumberInput
                    value={formData.sprint_length_weeks}
                    onChange={(_, valueAsNumber) =>
                      setFormData({ ...formData, sprint_length_weeks: valueAsNumber || 2 })
                    }
                    min={1}
                    step={0.5}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>UX Designers</FormLabel>
                  <NumberInput
                    value={formData.ux_designers}
                    onChange={(_, valueAsNumber) =>
                      setFormData({ ...formData, ux_designers: valueAsNumber || 0 })
                    }
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Content Designers</FormLabel>
                  <NumberInput
                    value={formData.content_designers}
                    onChange={(_, valueAsNumber) =>
                      setFormData({ ...formData, content_designers: valueAsNumber || 0 })
                    }
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Created By (optional)</FormLabel>
                  <Input
                    value={formData.created_by}
                    onChange={(e) => setFormData({ ...formData, created_by: e.target.value })}
                    placeholder="Your name"
                  />
                </FormControl>
              </Stack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit">
                Create Scenario
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default SessionsListPage
