import {
  Box,
  Heading,
  Stack,
  Button,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Divider,
  Icon,
  Tooltip,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useToast,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { CalendarIcon, DeleteIcon, ViewIcon, CheckCircleIcon, SettingsIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import { useMemo, useRef, useState } from 'react'
import { usePlanningSessions } from '../context/PlanningSessionsContext'
import { useRoadmapItems } from '../context/RoadmapItemsContext'
import { useActivity } from '../context/ActivityContext'
import CreateScenarioModal from '../components/CreateScenarioModal'
import { formatRelativeTime } from '../utils/formatTime'
import InlineEditableText from '../components/InlineEditableText'

function HomePage() {
  const navigate = useNavigate()
  const { sessions, commitSession, uncommitSession, deleteSession, updateSession, error: sessionsError } = usePlanningSessions()
  const { getItemsForSession } = useRoadmapItems()
  const { activity, isLoading: activityLoading } = useActivity()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const [sessionToDelete, setSessionToDelete] = useState<{ id: string; name: string } | null>(null)
  const cancelDeleteRef = useRef<HTMLButtonElement>(null)
  const toast = useToast()
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null)

  // Get most recently updated scenario
  const mostRecentScenario = useMemo(() => {
    if (sessions.length === 0) return null
    return [...sessions].sort((a, b) => {
      const timeA = new Date(a.updated_at).getTime()
      const timeB = new Date(b.updated_at).getTime()
      return timeB - timeA
    })[0]
  }, [sessions])

  // Get 3-5 most recently updated scenarios, sorted by: committed first, then quarter (parsed), then title
  const recentScenarios = useMemo(() => {
    if (sessions.length === 0) return []
    return [...sessions]
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
      .slice(0, 5)
  }, [sessions])

  // Get 5 most recent activity events
  const recentActivity = useMemo(() => {
    return activity.slice(0, 5)
  }, [activity])

  return (
    <Box maxW="1400px" mx="auto" px={6} py={8}>
      {/* Error message for PlanningSessionsContext */}
      {/* Only show error banner if we have sessions loaded (fallback succeeded) */}
      {sessionsError && sessions.length > 0 && (
        <Alert status="warning" bg="#141419" border="1px solid" borderColor="rgba(245, 158, 11, 0.3)" borderRadius="md" mb={4}>
          <AlertIcon color="#f59e0b" />
          <AlertTitle color="white" mr={2}>Warning:</AlertTitle>
          <AlertDescription color="gray.300">{sessionsError}</AlertDescription>
        </Alert>
      )}

      <Stack spacing={8}>
        {/* Welcome Back Section */}
        <Box>
          {sessions.length > 0 ? (
            <VStack spacing={4} align="stretch">
              <Heading size="lg" color="white">Welcome back</Heading>
              <HStack spacing={4}>
                {mostRecentScenario && (
                  <Button
                    colorScheme="cyan"
                    size="md"
                    onClick={() => navigate(`/sessions/${mostRecentScenario.id}`)}
                  >
                    Open last scenario
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="md"
                  onClick={onOpen}
                >
                  Create new scenario
                </Button>
              </HStack>
            </VStack>
          ) : (
            <VStack spacing={12} align="stretch">
              {/* Hero Section */}
              <VStack spacing={4} align="center" textAlign="center" py={8}>
                <Box
                  w={24}
                  h={24}
                  borderRadius="full"
                  bg="linear-gradient(135deg, rgba(0, 217, 255, 0.2), rgba(37, 99, 235, 0.2))"
                  border="1px solid"
                  borderColor="rgba(0, 217, 255, 0.3)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 0 20px rgba(0, 217, 255, 0.3)"
                >
                  <Icon as={CalendarIcon} w={12} h={12} color="#00d9ff" />
                </Box>
                <Heading size="xl" fontWeight="bold" color="white">
                  Welcome to Planning Assistant
                </Heading>
                <Text fontSize="lg" color="gray.300" maxW="700px" lineHeight="tall">
                  Your intelligent companion for capacity planning and roadmap management. Make data-driven decisions with confidence using factor-based sizing and real-time capacity analysis.
                </Text>
              </VStack>

              {/* Three Feature Cards */}
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Card 
                  variant="outline" 
                  bg="#141419" 
                  borderColor="rgba(255, 255, 255, 0.1)"
                  _hover={{
                    borderColor: 'rgba(0, 217, 255, 0.5)',
                    boxShadow: '0 10px 15px -3px rgba(0, 217, 255, 0.2), 0 4px 6px -2px rgba(0, 217, 255, 0.2)',
                    transform: 'translateY(-2px)',
                  }}
                  transition="all 0.3s ease"
                >
                  <CardBody p={6}>
                    <VStack spacing={3} align="start">
                      <Icon as={SettingsIcon} w={8} h={8} color="#00d9ff" />
                      <Heading size="sm" fontWeight="bold" color="white">
                        Plan Your Roadmaps
                      </Heading>
                      <Text fontSize="sm" color="gray.300" lineHeight="tall">
                        Create and manage multiple scenarios to explore different planning options. Adjust team capacity and evaluate trade-offs before committing to a plan.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                <Card 
                  variant="outline" 
                  bg="#141419" 
                  borderColor="rgba(255, 255, 255, 0.1)"
                  _hover={{
                    borderColor: 'rgba(0, 217, 255, 0.5)',
                    boxShadow: '0 10px 15px -3px rgba(0, 217, 255, 0.2), 0 4px 6px -2px rgba(0, 217, 255, 0.2)',
                    transform: 'translateY(-2px)',
                  }}
                  transition="all 0.3s ease"
                >
                  <CardBody p={6}>
                    <VStack spacing={3} align="start">
                      <Icon as={ViewIcon} w={8} h={8} color="#00d9ff" />
                      <Heading size="sm" fontWeight="bold" color="white">
                        Review Capacity vs Demand
                      </Heading>
                      <Text fontSize="sm" color="gray.300" lineHeight="tall">
                        Understand your team's capacity constraints with visual indicators. Track surplus or deficit across UX and Content Design resources in real-time.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                <Card 
                  variant="outline" 
                  bg="#141419" 
                  borderColor="rgba(255, 255, 255, 0.1)"
                  _hover={{
                    borderColor: 'rgba(0, 217, 255, 0.5)',
                    boxShadow: '0 10px 15px -3px rgba(0, 217, 255, 0.2), 0 4px 6px -2px rgba(0, 217, 255, 0.2)',
                    transform: 'translateY(-2px)',
                  }}
                  transition="all 0.3s ease"
                >
                  <CardBody p={6}>
                    <VStack spacing={3} align="start">
                      <Icon as={CheckCircleIcon} w={8} h={8} color="#00d9ff" />
                      <Heading size="sm" fontWeight="bold" color="white">
                        Review Your Committed Plan
                      </Heading>
                      <Text fontSize="sm" color="gray.300" lineHeight="tall">
                        Commit to scenarios and view your complete quarterly plan. Get a comprehensive view of all committed work across your organization.
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>

              {/* Key Features Section */}
              <Box>
                <Heading size="md" mb={6} textAlign="center" color="white">
                  Key Features
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Card variant="outline" bg="#1a1a20" borderColor="rgba(255, 255, 255, 0.05)">
                    <CardBody p={6}>
                      <VStack spacing={2} align="start">
                        <Heading size="sm" fontWeight="bold" color="white">
                          Factor-Based Sizing
                        </Heading>
                        <Text fontSize="sm" color="gray.300">
                          Estimate effort using complexity factors across Product Management, UX Design, and Content Design
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card variant="outline" bg="#1a1a20" borderColor="rgba(255, 255, 255, 0.05)">
                    <CardBody p={6}>
                      <VStack spacing={2} align="start">
                        <Heading size="sm" fontWeight="bold" color="white">
                          Real-Time Calculations
                        </Heading>
                        <Text fontSize="sm" color="gray.300">
                          See capacity and demand update instantly as you adjust complexity factors and team size
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card variant="outline" bg="#1a1a20" borderColor="rgba(255, 255, 255, 0.05)">
                    <CardBody p={6}>
                      <VStack spacing={2} align="start">
                        <Heading size="sm" fontWeight="bold" color="white">
                          Auto-Save Functionality
                        </Heading>
                        <Text fontSize="sm" color="gray.300">
                          Never lose your work with automatic saving of all changes and scenario updates
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card variant="outline" bg="#1a1a20" borderColor="rgba(255, 255, 255, 0.05)">
                    <CardBody p={6}>
                      <VStack spacing={2} align="start">
                        <Heading size="sm" fontWeight="bold" color="white">
                          Scenario Management
                        </Heading>
                        <Text fontSize="sm" color="gray.300">
                          Create, edit, and compare multiple scenarios to find the best plan for your team
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </Box>

              {/* CTA Section */}
              <VStack spacing={4} align="center" textAlign="center" py={8} bg="#141419" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)" borderRadius="md" px={6}>
                <Heading size="md" fontWeight="bold" color="white">
                  Ready to get started?
                </Heading>
                <Text fontSize="md" color="gray.300" maxW="600px">
                  Begin by creating your first scenario or exploring existing planning scenarios.
                </Text>
                <Button
                  colorScheme="cyan"
                  size="lg"
                  onClick={onOpen}
                  borderRadius="md"
                  px={8}
                  py={6}
                  fontSize="md"
                  fontWeight="medium"
                >
                  Create Your First Scenario
                </Button>
              </VStack>
            </VStack>
          )}
        </Box>

        {/* Recent Scenarios Section */}
        {sessions.length > 0 && (
          <Box>
            <Heading size="md" mb={4} color="white">Recent scenarios</Heading>
            <VStack spacing={4} align="stretch">
              {recentScenarios.map((session) => {
                const items = getItemsForSession(session.id)
                const itemCount = items?.length || 0
                const planningPeriod = session?.planningPeriod || session?.planning_period || '—'
                
                return (
                  <Card
                    key={session.id}
                    ref={(el) => {
                      cardRefs.current[session.id] = el
                    }}
                    variant="outline"
                    bg={
                      highlightedCardId === session.id 
                        ? 'rgba(0, 217, 255, 0.1)' 
                        : session.status === 'committed' 
                          ? 'rgba(16, 185, 129, 0.1)' 
                          : '#141419'
                    }
                    borderColor={
                      highlightedCardId === session.id 
                        ? 'rgba(0, 217, 255, 0.5)' 
                        : session.status === 'committed' 
                          ? 'rgba(16, 185, 129, 0.3)' 
                          : 'rgba(255, 255, 255, 0.1)'
                    }
                    borderWidth={highlightedCardId === session.id ? '2px' : '1px'}
                    _hover={{
                      borderColor: 'rgba(0, 217, 255, 0.5)',
                      boxShadow: '0 10px 15px -3px rgba(0, 217, 255, 0.2), 0 4px 6px -2px rgba(0, 217, 255, 0.2)',
                      transform: 'translateY(-2px)',
                    }}
                    transition="all 0.3s ease"
                    cursor="pointer"
                    onClick={() => navigate(`/sessions/${session.id}`)}
                  >
                    <CardBody p={6}>
                      <Stack spacing={4}>
                        {/* Title and Status */}
                        <HStack justify="space-between" align="center">
                          <HStack spacing={3} align="center" flex={1}>
                            <InlineEditableText
                              value={session.name || 'Unnamed Scenario'}
                              onChange={async (newName) => {
                                if (session.id && newName.trim()) {
                                  await updateSession(session.id, { name: newName.trim() })
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
                            {/* Capacity indicator - calculate if within capacity */}
                            {(() => {
                              const items = getItemsForSession(session.id)
                              const weeks = session.weeks_per_period || 0
                              const uxCapacity = (session.ux_designers || 0) * weeks
                              const contentCapacity = (session.content_designers || 0) * weeks
                              const uxDemand = items.reduce((sum, item) => sum + (item.uxFocusWeeks || 0), 0)
                              const contentDemand = items.reduce((sum, item) => sum + (item.contentFocusWeeks || 0), 0)
                              const isWithinCapacity = uxDemand <= uxCapacity && contentDemand <= contentCapacity
                              
                              return (
                                <HStack spacing={1.5} align="center">
                                  <Box
                                    w={2}
                                    h={2}
                                    borderRadius="full"
                                    bg={isWithinCapacity ? '#10b981' : '#f59e0b'}
                                    boxShadow={isWithinCapacity ? '0 0 8px rgba(16, 185, 129, 0.5)' : '0 0 8px rgba(245, 158, 11, 0.5)'}
                                  />
                                  <Text fontSize="sm" color={isWithinCapacity ? '#10b981' : '#f59e0b'} fontWeight="medium">
                                    {isWithinCapacity ? 'Within' : 'Over'}
                                  </Text>
                                </HStack>
                              )
                            })()}
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
                                    if (session.id && session.name) {
                                      setSessionToDelete({ id: session.id, name: session.name })
                                      onDeleteOpen()
                                    }
                                  }}
                                  _hover={{ bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                                />
                              </Tooltip>
                            )}
                            {itemCount === 0 && session.status === 'draft' ? (
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
                                  <Text fontSize="sm" color="gray.400" fontWeight="medium">
                                    Commit as plan
                                  </Text>
                                </HStack>
                              </Tooltip>
                            ) : (
                              <HStack
                                spacing={2}
                                align="center"
                                cursor="pointer"
                                onClick={async (e) => {
                                  e.stopPropagation()
                                  if (session.id && itemCount > 0) {
                                    if (session.status === 'committed') {
                                      // Uncommit if already committed
                                      await uncommitSession(session.id)
                                      toast({
                                        title: 'Scenario uncommitted',
                                        description: `${session.name} has been uncommitted.`,
                                        status: 'success',
                                        duration: 3000,
                                        isClosable: true,
                                      })
                                    } else {
                                      // Commit if not committed
                                      await commitSession(session.id, itemCount)
                                      toast({
                                        title: 'Scenario committed',
                                        description: `${session.name} has been set as the committed plan.`,
                                        status: 'success',
                                        duration: 3000,
                                        isClosable: true,
                                      })
                                    }
                                    
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
                                  borderColor={session.status === 'committed' ? '#00d9ff' : 'rgba(255, 255, 255, 0.2)'}
                                  bg={session.status === 'committed' ? '#00d9ff' : 'transparent'}
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  boxShadow={session.status === 'committed' ? '0 0 8px rgba(0, 217, 255, 0.5)' : 'none'}
                                >
                                  {session.status === 'committed' && (
                                    <Box
                                      w={2}
                                      h={2}
                                      borderRadius="full"
                                      bg="#0a0a0f"
                                    />
                                  )}
                                </Box>
                                <Text fontSize="sm" color="gray.300" fontWeight="medium">
                                  {session.status === 'committed' ? 'Committed plan' : 'Commit as plan'}
                                </Text>
                              </HStack>
                            )}
                          </HStack>
                        </HStack>

                        {/* Details Line */}
                        <HStack spacing={4} color="gray.400" fontSize="sm">
                          <HStack spacing={1}>
                            <Icon as={CalendarIcon} w={4} h={4} />
                            <Text>{planningPeriod}</Text>
                          </HStack>
                          <HStack spacing={1}>
                            <Text>👤</Text>
                            <Text>
                              {session.ux_designers || 0} UX, {session.content_designers || 0} Content
                            </Text>
                          </HStack>
                          <Text>{itemCount} roadmap {itemCount === 1 ? 'item' : 'items'}</Text>
                        </HStack>
                      </Stack>
                    </CardBody>
                  </Card>
                )
              })}
            </VStack>
          </Box>
        )}

        {/* Activity Section - Only show for returning users */}
        {sessions.length > 0 && (
          <Box>
            <Heading size="md" mb={4} color="white">Recent activity</Heading>
            {activityLoading ? (
              <Card variant="outline" bg="#141419" borderColor="rgba(255, 255, 255, 0.1)">
                <CardBody p={6}>
                  <Text fontSize="sm" color="gray.400" textAlign="center">
                    Loading activity...
                  </Text>
                </CardBody>
              </Card>
            ) : recentActivity.length > 0 ? (
              <Card variant="outline" bg="#141419" borderColor="rgba(255, 255, 255, 0.1)">
                <CardBody p={6}>
                  <VStack spacing={3} align="stretch">
                    {recentActivity.map((event, index) => (
                      <Box key={event.id}>
                        <HStack justify="space-between" align="start" spacing={4}>
                          <Text fontSize="sm" color="gray.300" flex={1}>
                            {event.description}
                          </Text>
                          <Text fontSize="xs" color="gray.400" whiteSpace="nowrap">
                            {formatRelativeTime(event.timestamp)}
                          </Text>
                        </HStack>
                        {index < recentActivity.length - 1 && (
                          <Divider mt={3} borderColor="rgba(255, 255, 255, 0.1)" />
                        )}
                      </Box>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            ) : (
              <Card variant="outline" bg="#141419" borderColor="rgba(255, 255, 255, 0.1)">
                <CardBody p={6}>
                  <Text fontSize="sm" color="gray.400" textAlign="center">
                    Activity will show your recent changes across scenarios.
                  </Text>
                </CardBody>
              </Card>
            )}
          </Box>
        )}
      </Stack>

      {/* Create Scenario Modal */}
      <CreateScenarioModal isOpen={isOpen} onClose={onClose} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={onDeleteClose}
      >
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
    </Box>
  )
}

export default HomePage
