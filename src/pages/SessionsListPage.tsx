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
  Text,
  Select,
  VStack,
  Icon,
  Card,
  CardBody,
  HStack,
  Divider,
  SimpleGrid,
  Tooltip,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import { CalendarIcon, DeleteIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useState, useMemo, useRef } from 'react'
import { usePlanningSessions } from '../context/PlanningSessionsContext'
import { useRoadmapItems } from '../context/RoadmapItemsContext'
import { useToast } from '@chakra-ui/react'
import type { PlanningSession, PlanningPeriod } from '../domain/types'
import { getWeeksForPeriod } from '../config/quarterConfig'
import { SPRINT_LENGTH_WEEKS } from '../config/sprints'
import InlineEditableText from '../components/InlineEditableText'

const QUARTER_OPTIONS: PlanningPeriod[] = ['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4']

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
  const { sessions, createSession, commitSession, deleteSession, updateSession } = usePlanningSessions()
  const { getItemsForSession } = useRoadmapItems()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; name: string } | null>(null)
  const cancelDeleteRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()
  const toast = useToast()
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null)

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

  // Calculate metrics for each scenario - safely handle undefined/null
  const scenarioMetrics = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return []
    }
    
    // Sort scenarios: committed first, then by quarter (parsed), then by title
    const sortedSessions = [...sessions]
      .filter((session) => session != null) // Filter out null/undefined sessions
      .sort((a, b) => {
        // First: sort by status (committed first)
        const statusOrderA = a.status === 'committed' ? 0 : 1
        const statusOrderB = b.status === 'committed' ? 0 : 1
        const statusDiff = statusOrderA - statusOrderB
        if (statusDiff !== 0) return statusDiff

        // Second: sort by quarter (parse "2026-Q1" into { year: 2026, quarter: 1 })
        const parseQuarter = (quarterStr: string | undefined): { year: number; quarter: number } => {
          if (!quarterStr) return { year: 0, quarter: 0 }
          const match = quarterStr.match(/(\d{4})-Q(\d)/)
          if (match) {
            return { year: parseInt(match[1], 10), quarter: parseInt(match[2], 10) }
          }
          return { year: 0, quarter: 0 }
        }

        const quarterA = parseQuarter(a.planningPeriod || a.planning_period)
        const quarterB = parseQuarter(b.planningPeriod || b.planning_period)
        
        // Sort by year first
        const yearDiff = quarterA.year - quarterB.year
        if (yearDiff !== 0) return yearDiff
        
        // Then by quarter
        const quarterDiff = quarterA.quarter - quarterB.quarter
        if (quarterDiff !== 0) return quarterDiff

        // Third: sort by title alphabetically (case-insensitive)
        const nameA = (a.name || '').toLowerCase()
        const nameB = (b.name || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })
    
    return sortedSessions.map((session) => {
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
      <Box maxW="1200px" mx="auto" px={6} py={20}>
        <VStack spacing={8} align="center" textAlign="center">
          {/* Calendar Icon with light blue circular background */}
          <Box
            w={24}
            h={24}
            borderRadius="full"
            bg="#EFF6FF"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={CalendarIcon} w={12} h={12} color="#3B82F6" />
          </Box>

          {/* Welcome Heading */}
          <Heading size="xl" fontWeight="bold" color="gray.900">
            Welcome to Capacity Planning!
          </Heading>

          {/* Description */}
          <Text fontSize="lg" color="gray.600" maxW="600px" lineHeight="tall">
            Create your first planning scenario to get started. You can estimate effort and manage team capacity across quarterly cycles.
          </Text>

          {/* Primary CTA Button */}
          <Button
            colorScheme="black"
            size="lg"
            onClick={onOpen}
            borderRadius="md"
            px={8}
            py={6}
            fontSize="md"
            fontWeight="medium"
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

  // Show populated state with cards when scenarios exist
  return (
    <Box maxW="1200px" mx="auto" px={6} py={8}>
      <Stack direction="row" justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg" mb={1}>Planning Scenarios</Heading>
          <Text fontSize="sm" color="gray.600">
            {sessions.length} {sessions.length === 1 ? 'scenario' : 'scenarios'}
          </Text>
        </Box>
        <Button
          colorScheme="black"
          size="md"
          onClick={onOpen}
        >
          + Create New Scenario
        </Button>
      </Stack>

      <VStack spacing={4} align="stretch">
        {scenarioMetrics.map(({ session, metrics }) => {
          const items = getItemsForSession(session.id)
          const itemCount = items?.length || 0
          const planningPeriod = session?.planningPeriod || session?.planning_period || '—'
          
          // Calculate demand (treat null as 0) and surplus/deficit
          const uxDemand = metrics.uxFocusDemand ?? 0
          const contentDemand = metrics.contentFocusDemand ?? 0
          const uxSurplus = metrics.uxFocusCapacity - uxDemand
          const contentSurplus = metrics.contentFocusCapacity - contentDemand
          
          // Helper to format numbers
          const formatValue = (value: number): string => {
            return value.toFixed(1)
          }
          
          return (
            <Card 
              key={session?.id || 'unknown'}
              ref={(el) => {
                if (session?.id) {
                  cardRefs.current[session.id] = el
                }
              }}
              variant="outline" 
              _hover={{ boxShadow: 'md' }}
              transition="all 0.2s"
              bg={
                highlightedCardId === session?.id 
                  ? 'blue.50' 
                  : session?.status === 'committed' 
                    ? 'green.50' 
                    : 'white'
              }
              borderColor={
                highlightedCardId === session?.id 
                  ? 'blue.300' 
                  : session?.status === 'committed' 
                    ? 'green.200' 
                    : 'gray.200'
              }
              borderWidth={highlightedCardId === session?.id ? '2px' : '1px'}
            >
              <CardBody p={6}>
                <Stack spacing={4}>
                  {/* Title and Status */}
                  <HStack justify="space-between" align="center">
                    <HStack spacing={3} align="center" flex={1}>
                      <InlineEditableText
                        value={session?.name || 'Unnamed Scenario'}
                        onChange={(newName) => {
                          if (session?.id && newName.trim()) {
                            updateSession(session.id, { name: newName.trim() })
                            toast({
                              title: 'Scenario renamed',
                              description: `Scenario name updated to "${newName.trim()}".`,
                              status: 'success',
                              duration: 2000,
                              isClosable: true,
                            })
                          }
                        }}
                        ariaLabel="Scenario name"
                        fontSize="md"
                        fontWeight="bold"
                      />
                      {metrics.status && (
                        <HStack spacing={1.5} align="center">
                          <Box
                            w={2}
                            h={2}
                            borderRadius="full"
                            bg={metrics.status === 'Within capacity' ? 'green.500' : 'orange.500'}
                          />
                          <Text fontSize="sm" color="gray.600" fontWeight="medium">
                            {metrics.status === 'Within capacity' ? 'Within' : 'Over'}
                          </Text>
                        </HStack>
                      )}
                    </HStack>
                    <HStack spacing={2} align="center">
                      {/* Delete button - only show if no roadmap items */}
                      {itemCount === 0 && (
                        <Tooltip
                          label="Delete scenario"
                          placement="top"
                          hasArrow
                        >
                          <IconButton
                            aria-label="Delete scenario"
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (session?.id && session?.name) {
                                setSessionToDelete({ id: session.id, name: session.name })
                                onDeleteOpen()
                              }
                            }}
                            _hover={{ bg: 'red.50', color: 'red.600' }}
                          />
                        </Tooltip>
                      )}
                      {itemCount === 0 && session?.status === 'draft' ? (
                        <Tooltip
                          label="Add at least one roadmap item before committing this scenario."
                          placement="top"
                          hasArrow
                        >
                          <HStack
                            spacing={2}
                            align="center"
                            cursor="not-allowed"
                            opacity={0.5}
                          >
                            <Box
                              w={4}
                              h={4}
                              borderRadius="full"
                              border="2px solid"
                              borderColor="gray.300"
                              bg="transparent"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            />
                            <Text fontSize="sm" color="gray.500" fontWeight="medium">
                              Commit as plan
                            </Text>
                          </HStack>
                        </Tooltip>
                      ) : (
                        <HStack
                          spacing={2}
                          align="center"
                          cursor="pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (session?.id && itemCount > 0) {
                              commitSession(session.id, itemCount)
                              
                              // Show toast notification
                              toast({
                                title: session.status === 'committed' ? 'Scenario uncommitted' : 'Scenario committed',
                                description: `${session.name} has been ${session.status === 'committed' ? 'uncommitted' : 'set as the committed plan'}.`,
                                status: 'success',
                                duration: 3000,
                                isClosable: true,
                              })
                              
                              // Highlight the card briefly
                              setHighlightedCardId(session.id)
                              setTimeout(() => setHighlightedCardId(null), 2000)
                              
                              // Scroll card into view if needed
                              const cardElement = cardRefs.current[session.id]
                              if (cardElement) {
                                cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                              }
                            }
                          }}
                          _hover={{ opacity: 0.8 }}
                        >
                          <Box
                            w={4}
                            h={4}
                            borderRadius="full"
                            border="2px solid"
                            borderColor={session?.status === 'committed' ? 'blue.500' : 'gray.300'}
                            bg={session?.status === 'committed' ? 'blue.500' : 'transparent'}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            {session?.status === 'committed' && (
                              <Box
                                w={2}
                                h={2}
                                borderRadius="full"
                                bg="white"
                              />
                            )}
                          </Box>
                          <Text fontSize="sm" color="gray.700" fontWeight="medium">
                            {session?.status === 'committed' ? 'Committed plan' : 'Commit as plan'}
                          </Text>
                        </HStack>
                      )}
                    </HStack>
                  </HStack>

                  {/* Details Line */}
                  <Box
                    cursor="pointer"
                    onClick={() => session?.id && navigate(`/sessions/${session.id}`)}
                  >
                    <HStack spacing={4} color="gray.600" fontSize="sm">
                      <HStack spacing={1}>
                        <Icon as={CalendarIcon} w={4} h={4} />
                        <Text>{planningPeriod}</Text>
                      </HStack>
                      <HStack spacing={1}>
                        <Text>👤</Text>
                        <Text>
                          {session?.ux_designers || 0} UX, {session?.content_designers || 0} Content
                        </Text>
                      </HStack>
                      <Text>{itemCount} roadmap {itemCount === 1 ? 'item' : 'items'}</Text>
                    </HStack>
                  </Box>

                  <Divider />

                  {/* Two-Column Capacity Display */}
                  <Box
                    cursor="pointer"
                    onClick={() => session?.id && navigate(`/sessions/${session.id}`)}
                  >
                    <SimpleGrid columns={2} spacing={6}>
                    {/* Left Column - UX Design */}
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                        UX Design
                      </Text>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.600">
                          <Text as="span" fontWeight="bold" color="gray.900">
                            {formatValue(uxDemand)}
                          </Text>
                          {' / '}
                          {formatValue(metrics.uxFocusCapacity)} focus weeks
                        </Text>
                        <Text 
                          fontSize="sm" 
                          fontWeight="medium"
                          color={uxSurplus >= 0 ? "green.600" : "red.600"}
                        >
                          {uxSurplus >= 0 
                            ? `+${formatValue(uxSurplus)} surplus` 
                            : `${formatValue(uxSurplus)} deficit`
                          }
                        </Text>
                      </VStack>
                    </Box>

                    {/* Right Column - Content Design */}
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                        Content Design
                      </Text>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" color="gray.600">
                          <Text as="span" fontWeight="bold" color="gray.900">
                            {formatValue(contentDemand)}
                          </Text>
                          {' / '}
                          {formatValue(metrics.contentFocusCapacity)} focus weeks
                        </Text>
                        <Text 
                          fontSize="sm" 
                          fontWeight="medium"
                          color={contentSurplus >= 0 ? "green.600" : "red.600"}
                        >
                          {contentSurplus >= 0 
                            ? `+${formatValue(contentSurplus)} surplus` 
                            : `${formatValue(contentSurplus)} deficit`
                          }
                        </Text>
                      </VStack>
                    </Box>
                  </SimpleGrid>
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          )
        })}
      </VStack>

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete this scenario?
            </AlertDialogHeader>
            <AlertDialogBody>
              This scenario has no roadmap items and will be permanently removed.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  if (sessionToDelete) {
                    deleteSession(sessionToDelete.id)
                    toast({
                      title: 'Scenario deleted',
                      description: `${sessionToDelete.name} has been deleted.`,
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    })
                    setSessionToDelete(null)
                    onDeleteClose()
                  }
                }}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

export default SessionsListPage
