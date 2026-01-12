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
  VStack,
  Icon,
} from '@chakra-ui/react'
import { CalendarIcon } from '@chakra-ui/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { usePlanningSessions } from '../context/PlanningSessionsContext'
import { useRoadmapItems } from '../context/RoadmapItemsContext'
import { useItemInputs } from '../context/ItemInputsContext'
import type { PlanningSession, PlanningPeriod } from '../domain/types'
import { getWeeksForPeriod } from '../config/quarterConfig'
import { SPRINT_LENGTH_WEEKS } from '../config/sprints'

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
    ux_designers: 3,
    content_designers: 2,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Calculate weeks_per_period from the selected planning period
    const weeksPerPeriod = getWeeksForPeriod(formData.planningPeriod)
    
    const newSession = createSession({
      name: formData.name,
      planningPeriod: formData.planningPeriod,
      weeks_per_period: weeksPerPeriod,
      sprint_length_weeks: SPRINT_LENGTH_WEEKS, // Fixed constant
      ux_designers: formData.ux_designers,
      content_designers: formData.content_designers,
    })
    onClose()
    setFormData({
      name: '',
      planningPeriod: '2026-Q4',
      ux_designers: 3,
      content_designers: 2,
    })
    navigate(`/sessions/${newSession.id}`)
  }

  const handleCreateDemoSession = () => {
    // Create a new session with default capacity
    const currentYear = new Date().getFullYear()
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3)
    const defaultPeriod: PlanningPeriod = `${currentYear}-Q${currentQuarter}` as PlanningPeriod
    const weeksPerPeriod = getWeeksForPeriod(defaultPeriod)
    
    const newSession = createSession({
      name: 'Demo Session',
      planningPeriod: defaultPeriod,
      weeks_per_period: weeksPerPeriod,
      sprint_length_weeks: SPRINT_LENGTH_WEEKS, // Fixed constant
      ux_designers: 3,
      content_designers: 1,
    })

    // Seed 2-3 roadmap items from demo data (using first 2 items)
    const itemsToSeed = demoItems.slice(0, 2)
    itemsToSeed.forEach((demoItem) => {
      // Create the item (without the demo item ID, let it generate a new one)
      const newItem = createItem(newSession.id, {
        short_key: demoItem.short_key,
        name: demoItem.name,
        initiative: demoItem.initiative,
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

  // Show empty state when no scenarios exist
  if (sessions.length === 0) {
    return (
      <Box maxW="1200px" mx="auto" px={6} py={16}>
        <VStack spacing={6} align="center" textAlign="center">
          {/* Calendar Icon with light blue circular background */}
          <Box
            w={20}
            h={20}
            borderRadius="full"
            bg="blue.50"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={CalendarIcon} w={10} h={10} color="blue.500" />
          </Box>

          {/* Welcome Heading */}
          <Heading size="lg" fontWeight="bold">
            Welcome to Capacity Planning!
          </Heading>

          {/* Description */}
          <Text fontSize="md" color="gray.600" maxW="500px">
            Create your first planning scenario to get started. You can estimate effort and manage team capacity across quarterly cycles.
          </Text>

          {/* Primary CTA Button */}
          <Button
            colorScheme="black"
            size="lg"
            onClick={onOpen}
            borderRadius="md"
          >
            + Create New Scenario
          </Button>
        </VStack>

        {/* Modal for creating new scenario */}
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
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      {getWeeksForPeriod(formData.planningPeriod)} weeks per period
                    </Text>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Assumes {SPRINT_LENGTH_WEEKS}-week sprints (about {Math.floor(getWeeksForPeriod(formData.planningPeriod) / SPRINT_LENGTH_WEEKS)} sprints per quarter).
                    </Text>
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

  // Show populated state with table when scenarios exist
  return (
    <Box maxW="1200px" mx="auto" px={6} py={8}>
      <Stack direction="row" justify="space-between" align="center" mb={6}>
        <Heading size="lg">Planning Scenarios</Heading>
        <Stack direction="row" spacing={3}>
          <Button
            as={Link}
            to="/quarterly-capacity"
            variant="outline"
            colorScheme="blue"
          >
            Quarterly Capacity
          </Button>
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
            {scenarioMetrics.map(({ session, metrics }) => (
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
              ))}
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
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {getWeeksForPeriod(formData.planningPeriod)} weeks per period
                  </Text>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Assumes {SPRINT_LENGTH_WEEKS}-week sprints (about {Math.floor(getWeeksForPeriod(formData.planningPeriod) / SPRINT_LENGTH_WEEKS)} sprints per quarter).
                  </Text>
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
