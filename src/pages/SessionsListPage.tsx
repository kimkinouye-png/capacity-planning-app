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
  Tooltip,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Badge,
  Flex,
} from '@chakra-ui/react'
import { CalendarIcon, CopyIcon, DeleteIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useState, useMemo, useRef } from 'react'
import { usePlanningSessions } from '../context/PlanningSessionsContext'
import { useRoadmapItems } from '../context/RoadmapItemsContext'
import { useToast } from '@chakra-ui/react'
import type { PlanningSession, PlanningPeriod } from '../domain/types'
import { getWeeksForPeriod } from '../config/quarterConfig'
import { SPRINT_LENGTH_WEEKS } from '../config/sprints'
import InlineEditableText from '../components/InlineEditableText'
import { getOrCreateSessionId } from '../utils/session'

const QUARTER_OPTIONS: PlanningPeriod[] = ['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4']

const CARD_BG = '#1a1d2e'
const BORDER = 'rgba(255, 255, 255, 0.08)'
const CYAN = '#00d9ff'

const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:8888/.netlify/functions'
  : '/.netlify/functions'

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

function calculateScenarioMetrics(
  session: PlanningSession,
  items: ReturnType<typeof useRoadmapItems>['getItemsForSession']
): ScenarioMetrics {
  const uxDesigners = session.ux_designers ?? 0
  const contentDesigners = session.content_designers ?? 0
  const weeksPerPeriod = session.weeks_per_period ?? 0

  const uxFocusCapacity = uxDesigners * weeksPerPeriod
  const contentFocusCapacity = contentDesigners * weeksPerPeriod
  const uxWorkCapacity = weeksPerPeriod
  const contentWorkCapacity = weeksPerPeriod

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
    if (
      typeof item.uxFocusWeeks === 'number' &&
      typeof item.uxWorkWeeks === 'number' &&
      typeof item.contentFocusWeeks === 'number' &&
      typeof item.contentWorkWeeks === 'number'
    ) {
      uxFocusDemand += item.uxFocusWeeks
      contentFocusDemand += item.contentFocusWeeks
      uxWorkDemand = Math.max(uxWorkDemand, item.uxWorkWeeks)
      contentWorkDemand = Math.max(contentWorkDemand, item.contentWorkWeeks)
      hasValidData = true
    }
  })

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

function formatQuarterShort(period: string | undefined): string {
  if (!period) return '—'
  const m = period.match(/(\d{4})-Q([1-4])/)
  if (!m) return period
  const yy = m[1].slice(2)
  return `Q${m[2]}'${yy}`
}

function statusBadgeProps(status: PlanningSession['status']): { bg: string; color: string; label: string } {
  switch (status) {
    case 'committed':
      return { bg: 'purple.600', color: 'white', label: 'Committed' }
    case 'in-review':
      return { bg: 'blue.600', color: 'white', label: 'In Review' }
    case 'archived':
      return { bg: 'gray.600', color: 'gray.100', label: 'Archived' }
    case 'draft':
    default:
      return { bg: 'gray.600', color: 'gray.100', label: 'Draft' }
  }
}

function SessionsListPage() {
  const { sessions, createSession, deleteSession, updateSession, error: sessionsError, loadSessions } =
    usePlanningSessions()
  const { getItemsForSession } = useRoadmapItems()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; name: string } | null>(null)
  const cancelDeleteRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()
  const toast = useToast()
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    planningPeriod: '2026-Q4' as PlanningPeriod,
    ux_designers: 3,
    content_designers: 2,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const weeksPerPeriod = getWeeksForPeriod(formData.planningPeriod)

    try {
      const newSession = await createSession({
        name: formData.name,
        planningPeriod: formData.planningPeriod,
        weeks_per_period: weeksPerPeriod,
        sprint_length_weeks: SPRINT_LENGTH_WEEKS,
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
    } catch (error) {
      console.error('Error creating scenario:', error)
    }
  }

  const handleDuplicate = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    setDuplicatingId(sessionId)
    try {
      const res = await fetch(`${API_BASE_URL}/duplicate-scenario`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': getOrCreateSessionId(),
        },
        body: JSON.stringify({ id: sessionId }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error || res.statusText)
      }
      const newSession: PlanningSession = await res.json()
      await loadSessions()
      toast({
        title: 'Scenario duplicated',
        description: `Opened copy of "${newSession.name}".`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate(`/sessions/${newSession.id}`)
    } catch (err) {
      toast({
        title: 'Could not duplicate',
        description: err instanceof Error ? err.message : 'Duplicate failed',
        status: 'error',
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setDuplicatingId(null)
    }
  }

  const scenarioMetrics = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return []
    }

    const sortedSessions = [...sessions]
      .filter((session) => session != null)
      .sort((a, b) => {
        const statusOrderA = a.status === 'committed' ? 0 : 1
        const statusOrderB = b.status === 'committed' ? 0 : 1
        const statusDiff = statusOrderA - statusOrderB
        if (statusDiff !== 0) return statusDiff

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

        const yearDiff = quarterA.year - quarterB.year
        if (yearDiff !== 0) return yearDiff

        const quarterDiff = quarterA.quarter - quarterB.quarter
        if (quarterDiff !== 0) return quarterDiff

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

  const draftSection = useMemo(
    () => scenarioMetrics.filter(({ session }) => session.status === 'draft' || session.status === 'in-review'),
    [scenarioMetrics]
  )
  const committedSection = useMemo(
    () => scenarioMetrics.filter(({ session }) => session.status === 'committed'),
    [scenarioMetrics]
  )
  const archivedSection = useMemo(
    () => scenarioMetrics.filter(({ session }) => session.status === 'archived'),
    [scenarioMetrics]
  )

  const renderScenarioCard = ({
    session,
    metrics,
  }: {
    session: PlanningSession
    metrics: ScenarioMetrics
  }) => {
    const items = getItemsForSession(session.id)
    const itemCount = Array.isArray(items) ? items.length : 0
    const quarterLabel = formatQuarterShort(session.planningPeriod || session.planning_period)

    const uxDemand = metrics.uxFocusDemand ?? 0
    const contentDemand = metrics.contentFocusDemand ?? 0
    const uxCap = metrics.uxFocusCapacity
    const contentCap = metrics.contentFocusCapacity

    const uxOver = uxCap > 0 && uxDemand > uxCap
    const contentOver = contentCap > 0 && contentDemand > contentCap

    const uxPct = uxCap > 0 ? Math.min(100, (uxDemand / uxCap) * 100) : 0
    const contentPct = contentCap > 0 ? Math.min(100, (contentDemand / contentCap) * 100) : 0

    const formatVal = (n: number) => n.toFixed(1)
    const { bg: badgeBg, color: badgeColor, label: badgeLabel } = statusBadgeProps(session.status)

    const withinDot = metrics.status === 'Within capacity'
    const overDot = metrics.status === 'Over capacity'

    return (
      <Card
        key={session.id}
        bg={CARD_BG}
        border="1px solid"
        borderColor={BORDER}
        borderRadius="md"
        overflow="hidden"
        transition="all 0.2s ease"
        _hover={{
          borderColor: 'rgba(0, 217, 255, 0.35)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
        }}
      >
        <CardBody p={5}>
          <VStack align="stretch" spacing={4}>
            {/* TOP ROW */}
            <Flex justify="space-between" align="flex-start" gap={3} wrap="wrap">
              <Box flex="1" minW={0}>
                <HStack align="center" spacing={3} flexWrap="wrap">
                  <InlineEditableText
                    value={session.name || 'Unnamed Scenario'}
                    onChange={(newName) => {
                      if (session.id && newName.trim()) {
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
                    fontSize="lg"
                    fontWeight="bold"
                  />
                  {(withinDot || overDot) && (
                    <HStack spacing={1.5}>
                      <Box
                        w={2}
                        h={2}
                        borderRadius="full"
                        bg={withinDot ? '#22c55e' : '#ef4444'}
                        flexShrink={0}
                      />
                      <Text fontSize="sm" color={withinDot ? 'green.400' : 'red.400'} fontWeight="medium">
                        {withinDot ? 'Within' : 'Over'}
                      </Text>
                    </HStack>
                  )}
                </HStack>
              </Box>
              <Badge borderRadius="full" px={3} py={1} fontSize="xs" fontWeight="semibold" bg={badgeBg} color={badgeColor}>
                {badgeLabel}
              </Badge>
            </Flex>

            {/* METADATA */}
            <HStack spacing={4} color="gray.500" fontSize="sm" flexWrap="wrap">
              <HStack spacing={1.5}>
                <Icon as={CalendarIcon} w={4} h={4} />
                <Text>{quarterLabel}</Text>
              </HStack>
              <HStack spacing={1.5}>
                <Icon viewBox="0 0 24 24" w={4} h={4}>
                  <path
                    fill="currentColor"
                    d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
                  />
                </Icon>
                <Text>
                  {session.ux_designers ?? 0} UX, {session.content_designers ?? 0} Content
                </Text>
              </HStack>
              <Text>
                {itemCount} roadmap {itemCount === 1 ? 'item' : 'items'}
              </Text>
            </HStack>

            {/* CAPACITY ROWS */}
            <VStack align="stretch" spacing={4}>
              <Box>
                <Flex justify="space-between" align="center" mb={1.5} gap={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.300">
                    UX Design
                  </Text>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={uxOver ? 'red.400' : CYAN}
                    whiteSpace="nowrap"
                  >
                    {formatVal(uxDemand)} / {formatVal(uxCap)} weeks
                  </Text>
                </Flex>
                <Progress
                  value={uxPct}
                  size="sm"
                  borderRadius="full"
                  bg="whiteAlpha.100"
                  sx={{
                    '& > div': {
                      background: uxOver ? '#ef4444' : CYAN,
                    },
                  }}
                />
              </Box>
              <Box>
                <Flex justify="space-between" align="center" mb={1.5} gap={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.300">
                    Content Design
                  </Text>
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={contentOver ? 'red.400' : CYAN}
                    whiteSpace="nowrap"
                  >
                    {formatVal(contentDemand)} / {formatVal(contentCap)} weeks
                  </Text>
                </Flex>
                <Progress
                  value={contentPct}
                  size="sm"
                  borderRadius="full"
                  bg="whiteAlpha.100"
                  sx={{
                    '& > div': {
                      background: contentOver ? '#ef4444' : CYAN,
                    },
                  }}
                />
              </Box>
            </VStack>

            {/* BOTTOM ROW */}
            <Flex
              align="center"
              justify="space-between"
              gap={3}
              pt={1}
              borderTop="1px solid"
              borderColor="whiteAlpha.100"
            >
              <Button
                variant="ghost"
                color={CYAN}
                flex={1}
                justifyContent="center"
                onClick={() => navigate(`/sessions/${session.id}`)}
              >
                View Details
              </Button>
              <HStack spacing={1}>
                <Tooltip label="Duplicate scenario" hasArrow>
                  <IconButton
                    aria-label="Duplicate scenario"
                    icon={<CopyIcon />}
                    size="sm"
                    variant="ghost"
                    color="gray.400"
                    isLoading={duplicatingId === session.id}
                    onClick={(e) => handleDuplicate(e, session.id)}
                    _hover={{ color: CYAN, bg: 'whiteAlpha.50' }}
                  />
                </Tooltip>
                <Tooltip label="Delete scenario" hasArrow>
                  <IconButton
                    aria-label="Delete scenario"
                    icon={<DeleteIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (session.id && session.name) {
                        setSessionToDelete({ id: session.id, name: session.name })
                        onDeleteOpen()
                      }
                    }}
                    _hover={{ bg: 'rgba(239, 68, 68, 0.15)' }}
                  />
                </Tooltip>
              </HStack>
            </Flex>
          </VStack>
        </CardBody>
      </Card>
    )
  }

  const pageHeader = (
    <Flex direction="row" justify="space-between" align="flex-start" gap={4} mb={8}>
      <Box flex="1" minW={0} pr={2}>
        <Heading size="xl" color="white" fontWeight="bold" letterSpacing="tight">
          Plan → Compare → Commit
        </Heading>
        <Text mt={2} color="gray.400" fontSize="md" maxW="xl">
          Create different staffing and roadmap scenarios and explore trade-offs before committing to a plan
        </Text>
      </Box>
      <Button
        bg={CYAN}
        color="#0a0a0f"
        _hover={{ bg: '#33e1ff' }}
        size="md"
        flexShrink={0}
        w="auto"
        onClick={onOpen}
      >
        + New Plan
      </Button>
    </Flex>
  )

  const createModal = (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(4px)" />
      <ModalContent bg="#141419" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)" boxShadow="0 25px 50px -12px rgba(0, 217, 255, 0.2)">
        <form onSubmit={handleSubmit}>
          <ModalHeader color="white" borderBottom="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
            Create New Scenario
          </ModalHeader>
          <ModalCloseButton color="gray.400" _hover={{ color: 'white' }} />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel color="gray.300">Name</FormLabel>
                <Input
                  bg="#1a1a20"
                  borderColor="rgba(255, 255, 255, 0.1)"
                  color="white"
                  _focus={{ borderColor: '#00d9ff', boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)' }}
                  _placeholder={{ color: 'gray.500' }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Payments Q2 2026"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="gray.300">Planning Period</FormLabel>
                <Select
                  bg="#1a1a20"
                  borderColor="rgba(255, 255, 255, 0.1)"
                  color="white"
                  _focus={{ borderColor: '#00d9ff', boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)' }}
                  value={formData.planningPeriod}
                  onChange={(e) => setFormData({ ...formData, planningPeriod: e.target.value as PlanningPeriod })}
                >
                  {QUARTER_OPTIONS.map((period) => (
                    <option key={period} value={period} style={{ background: '#1a1a20', color: 'white' }}>
                      {period}
                    </option>
                  ))}
                </Select>
                <Text fontSize="sm" color="gray.400" mt={1}>
                  {getWeeksForPeriod(formData.planningPeriod)} weeks per period
                </Text>
                <Text fontSize="sm" color="gray.400" mt={1}>
                  Assumes {SPRINT_LENGTH_WEEKS}-week sprints (about{' '}
                  {Math.floor(getWeeksForPeriod(formData.planningPeriod) / SPRINT_LENGTH_WEEKS)} sprints per quarter).
                </Text>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="gray.300">UX Designers</FormLabel>
                <NumberInput
                  value={formData.ux_designers}
                  onChange={(_, valueAsNumber) => setFormData({ ...formData, ux_designers: valueAsNumber || 0 })}
                  min={0}
                >
                  <NumberInputField
                    bg="#1a1a20"
                    borderColor="rgba(255, 255, 255, 0.1)"
                    color="white"
                    _focus={{ borderColor: '#00d9ff', boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)' }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper color="gray.400" borderColor="rgba(255, 255, 255, 0.1)" />
                    <NumberDecrementStepper color="gray.400" borderColor="rgba(255, 255, 255, 0.1)" />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="gray.300">Content Designers</FormLabel>
                <NumberInput
                  value={formData.content_designers}
                  onChange={(_, valueAsNumber) =>
                    setFormData({ ...formData, content_designers: valueAsNumber || 0 })
                  }
                  min={0}
                >
                  <NumberInputField
                    bg="#1a1a20"
                    borderColor="rgba(255, 255, 255, 0.1)"
                    color="white"
                    _focus={{ borderColor: '#00d9ff', boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)' }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper color="gray.400" borderColor="rgba(255, 255, 255, 0.1)" />
                    <NumberDecrementStepper color="gray.400" borderColor="rgba(255, 255, 255, 0.1)" />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="cyan" type="submit">
              Create Scenario
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )

  const deleteDialog = (
    <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelDeleteRef} onClose={onDeleteClose}>
      <AlertDialogOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(4px)">
        <AlertDialogContent bg="#141419" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)" boxShadow="0 25px 50px -12px rgba(0, 217, 255, 0.2)">
          <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white" borderBottom="1px solid" borderColor="rgba(255, 255, 255, 0.1)" px={6} py={4}>
            Delete this scenario?
          </AlertDialogHeader>
          <AlertDialogBody color="gray.300" px={6} py={4}>
            This scenario has no roadmap items and will be permanently removed.
          </AlertDialogBody>
          <AlertDialogFooter borderTop="1px solid" borderColor="rgba(255, 255, 255, 0.1)" px={6} py={4}>
            <Button ref={cancelDeleteRef} onClick={onDeleteClose} variant="outline">
              Cancel
            </Button>
            <Button
              bg="rgba(239, 68, 68, 0.1)"
              border="1px solid"
              borderColor="rgba(239, 68, 68, 0.5)"
              color="#ef4444"
              _hover={{
                bg: 'rgba(239, 68, 68, 0.2)',
                borderColor: '#ef4444',
              }}
              onClick={async () => {
                if (sessionToDelete) {
                  await deleteSession(sessionToDelete.id)
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
  )

  if (sessions.length === 0) {
    return (
      <Box maxW="1200px" mx="auto" px={6} py={8} bg="#0a0a0f" minH="100%">
        {sessionsError && (
          <Alert status="warning" bg="#141419" border="1px solid" borderColor="rgba(245, 158, 11, 0.3)" borderRadius="md" mb={4}>
            <AlertIcon color="#f59e0b" />
            <AlertTitle color="white" mr={2}>
              Warning:
            </AlertTitle>
            <AlertDescription color="gray.300">{sessionsError}</AlertDescription>
            <Button size="sm" colorScheme="cyan" ml={4} onClick={() => loadSessions()}>
              Retry Sync
            </Button>
          </Alert>
        )}
        {pageHeader}
        {createModal}
        {deleteDialog}
      </Box>
    )
  }

  return (
    <Box maxW="1200px" mx="auto" px={6} py={8} bg="#0a0a0f" minH="100%">
      {sessionsError && sessions.length > 0 && (
        <Alert status="warning" bg="#141419" border="1px solid" borderColor="rgba(245, 158, 11, 0.3)" borderRadius="md" mb={4}>
          <AlertIcon color="#f59e0b" />
          <AlertTitle color="white" mr={2}>
            Warning:
          </AlertTitle>
          <AlertDescription color="gray.300">{sessionsError}</AlertDescription>
          <Button size="sm" colorScheme="cyan" ml={4} onClick={() => loadSessions()}>
            Retry Sync
          </Button>
        </Alert>
      )}

      {pageHeader}

      <VStack align="stretch" spacing={8}>
        {draftSection.length > 0 && (
          <Box>
            <Heading size="md" color="white" fontWeight="bold">
              Draft Plans
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1} mb={4}>
              Work-in-progress scenarios still being refined
            </Text>
            <VStack align="stretch" spacing={4}>
              {draftSection.map(({ session, metrics }) => renderScenarioCard({ session, metrics }))}
            </VStack>
          </Box>
        )}

        {committedSection.length > 0 && (
          <Box>
            <Heading size="md" color="white" fontWeight="bold">
              Committed Plans
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1} mb={4}>
              Finalized scenarios ready for execution
            </Text>
            <VStack align="stretch" spacing={4}>
              {committedSection.map(({ session, metrics }) => renderScenarioCard({ session, metrics }))}
            </VStack>
          </Box>
        )}

        {archivedSection.length > 0 && (
          <Box>
            <Heading size="md" color="white" fontWeight="bold">
              Archived
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1} mb={4}>
              Scenarios no longer active
            </Text>
            <VStack align="stretch" spacing={4}>
              {archivedSection.map(({ session, metrics }) => renderScenarioCard({ session, metrics }))}
            </VStack>
          </Box>
        )}
      </VStack>

      {createModal}
      {deleteDialog}
    </Box>
  )
}

export default SessionsListPage
