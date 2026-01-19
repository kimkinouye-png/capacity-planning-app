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
  HStack,
  VStack,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  SimpleGrid,
} from '@chakra-ui/react'
import { ChevronLeftIcon, DeleteIcon, CheckIcon } from '@chakra-ui/icons'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useMemo, useRef, useEffect, useState } from 'react'
import { usePlanningSessions } from '../context/PlanningSessionsContext'
import { useRoadmapItems } from '../context/RoadmapItemsContext'
import { getWeeksForPeriod } from '../config/quarterConfig'
import { estimateSprints, formatSprintEstimate } from '../config/sprints'
import InlineEditableText from '../components/InlineEditableText'

function SessionSummaryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { sessions, getSessionById, commitSession, uncommitSession, updateSession, isLoading: sessionsLoading, error: sessionsError, loadSessions } = usePlanningSessions()
  const { getItemsForSession, removeItem, createItem, loadItemsForSession } = useRoadmapItems()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const itemToDeleteRef = useRef<{ id: string; name: string } | null>(null)

  // Form state for creating new item
  const [formData, setFormData] = useState({
    short_key: '',
    name: '',
    initiative: '',
    priority: 1,
  })

  // Ensure sessions are loaded when navigating to this page
  // This handles the case where you navigate directly to a session URL
  useEffect(() => {
    if (id && !sessionsLoading && sessions.length === 0) {
      // No sessions loaded, fetch them
      loadSessions()
    }
  }, [id, sessionsLoading, sessions.length, loadSessions])

  // Reload sessions if we don't find the session (in case it was just created)
  // Use a ref to prevent infinite loops
  const hasTriedReload = useRef(false)
  useEffect(() => {
    if (id && !sessionsLoading && sessions.length > 0 && !hasTriedReload.current) {
      const foundSession = getSessionById(id)
      if (!foundSession) {
        // Session not found in loaded sessions, try reloading once
        console.log('Session not found in loaded sessions, reloading...')
        hasTriedReload.current = true
        loadSessions().finally(() => {
          // Reset after reload completes (with a delay to allow state update)
          setTimeout(() => {
            hasTriedReload.current = false
          }, 3000)
        })
      }
    }
  }, [id, sessionsLoading, sessions.length, getSessionById, loadSessions])

  // Get session
  const session = useMemo(() => {
    return id ? getSessionById(id) : undefined
  }, [id, getSessionById])

  // Get items - this will automatically update when items change in context
  const items = useMemo(() => {
    return id ? getItemsForSession(id) : []
  }, [id, getItemsForSession])

  // Load items for this session when the page loads
  useEffect(() => {
    if (id) {
      loadItemsForSession(id)
    }
  }, [id, loadItemsForSession])

  // Calculate capacity and demand
  const capacityMetrics = useMemo(() => {
    if (!session) return null

    // Handle both planning_period (legacy) and planningPeriod fields
    const period = session.planning_period || session.planningPeriod
    if (!period) {
      console.error('Session missing planning period:', session)
      return null
    }

    const weeksInQuarter = getWeeksForPeriod(period)
    
    // Calculate capacity (team size × weeks in quarter)
    // Ensure these are numbers, default to 0 if undefined
    const uxDesigners = typeof session.ux_designers === 'number' ? session.ux_designers : 0
    const contentDesigners = typeof session.content_designers === 'number' ? session.content_designers : 0
    const uxCapacity = uxDesigners * weeksInQuarter
    const contentCapacity = contentDesigners * weeksInQuarter

    // Calculate demand (sum of focus weeks from all items)
    // Ensure we always return a number, handle undefined/null values
    const uxDemand = items.reduce((sum, item) => {
      const weeks = typeof item.uxFocusWeeks === 'number' ? item.uxFocusWeeks : 0
      return sum + weeks
    }, 0)

    const contentDemand = items.reduce((sum, item) => {
      const weeks = typeof item.contentFocusWeeks === 'number' ? item.contentFocusWeeks : 0
      return sum + weeks
    }, 0)

    // Calculate surplus/deficit - ensure these are numbers
    const uxSurplus = uxCapacity - uxDemand
    const contentSurplus = contentCapacity - contentDemand

    // Calculate utilization % - ensure these are numbers
    const uxUtilization = uxCapacity > 0 ? (uxDemand / uxCapacity) * 100 : 0
    const contentUtilization = contentCapacity > 0 ? (contentDemand / contentCapacity) * 100 : 0

    return {
      ux: {
        teamSize: uxDesigners,
        capacity: Number(uxCapacity) || 0,
        demand: Number(uxDemand) || 0,
        surplus: Number(uxSurplus) || 0,
        utilization: Number(uxUtilization) || 0,
      },
      content: {
        teamSize: contentDesigners,
        capacity: Number(contentCapacity) || 0,
        demand: Number(contentDemand) || 0,
        surplus: Number(contentSurplus) || 0,
        utilization: Number(contentUtilization) || 0,
      },
    }
  }, [session, items])

  // Format priority for display
  const formatPriority = (priority: number | string | undefined) => {
    if (priority === undefined || priority === null) return '—'
    if (typeof priority === 'number') {
      return `P${priority}`
    }
    return priority.toUpperCase()
  }

  // Format status for display
  const formatStatus = (status: string | undefined) => {
    if (!status) return '—'
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Handle row click (navigate to item detail)
  const handleRowClick = (itemId: string) => {
    navigate(`/sessions/${id}/items/${itemId}`)
  }

  // Handle remove item
  const handleRemoveClick = (e: React.MouseEvent, itemId: string, itemName: string) => {
    e.stopPropagation()
    itemToDeleteRef.current = { id: itemId, name: itemName }
    onOpen()
  }

  // Confirm remove
  const handleConfirmRemove = async () => {
    if (itemToDeleteRef.current && id) {
      await removeItem(id, itemToDeleteRef.current.id)
      toast({
        title: 'Item deleted',
        description: `${itemToDeleteRef.current.name} has been removed.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      itemToDeleteRef.current = null
      onClose()
    }
  }

  // Handle create item
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    try {
      const newItem = await createItem(id, formData)
      
      toast({
        title: 'Item created',
        description: `${newItem.name} has been added.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      })

      // Reset form and close modal
      setFormData({
        short_key: '',
        name: '',
        initiative: '',
        priority: 1,
      })
      onCreateModalClose()
    } catch (error) {
      console.error('Error creating item:', error)
      // Error is handled by context fallback
    }
  }

  // Handle missing session ID
  if (!id) {
    return (
      <Box minH="100vh" bg="#0a0a0f" p={8}>
        <Text color="gray.300">Invalid session ID</Text>
        <Button mt={4} onClick={() => navigate('/')} colorScheme="cyan">
          Go Home
        </Button>
      </Box>
    )
  }

  // Show loading state while sessions are loading
  if (sessionsLoading) {
    return (
      <Box minH="100vh" bg="#0a0a0f" p={8}>
        <Text color="gray.300">Loading session...</Text>
      </Box>
    )
  }

  // Show error state if sessions failed to load
  if (sessionsError) {
    return (
      <Box minH="100vh" bg="#0a0a0f" p={8}>
        <Text color="red.400" mb={4}>Error loading session: {sessionsError}</Text>
        <Button onClick={() => loadSessions()} colorScheme="cyan" mr={4}>
          Retry
        </Button>
        <Button onClick={() => navigate('/')} variant="outline">
          Go Home
        </Button>
      </Box>
    )
  }

  // Handle missing session
  if (!session) {
    return (
      <Box minH="100vh" bg="#0a0a0f" p={8}>
        <Text color="gray.300" mb={4}>Session not found</Text>
        <Text color="gray.500" fontSize="sm" mb={4}>
          The session with ID "{id}" could not be loaded. It may have been deleted or you may not have access to it.
        </Text>
        <Button onClick={() => loadSessions()} colorScheme="cyan" mr={4}>
          Reload Sessions
        </Button>
        <Button onClick={() => navigate('/')} variant="outline">
          Go Home
        </Button>
      </Box>
    )
  }

  // Format quarter for display
  const formatQuarter = (period: string | undefined) => {
    if (!period) return 'Unknown'
    return period.replace('-', ' ')
  }

  // Get planning period (handles both legacy and new field names)
  const planningPeriod = session?.planning_period || session?.planningPeriod

  return (
    <Box bg="#0a0a0f" minH="100vh" pb={8}>
      <Box maxW="1400px" mx="auto" px={6} pt={6}>
        {/* Header Section */}
        <HStack spacing={4} mb={6} align="center">
          <IconButton
            aria-label="Back to home"
            icon={<ChevronLeftIcon />}
            variant="ghost"
            onClick={() => navigate('/')}
            color="gray.300"
            _hover={{ color: '#00d9ff', bg: 'rgba(255, 255, 255, 0.05)' }}
          />
          <HStack spacing={2} fontSize="14px">
            <Link to="/" style={{ color: '#00d9ff' }}>
              Home
            </Link>
            <Text color="gray.400"> &gt; </Text>
            <Link to={`/sessions/${id}`} style={{ color: '#00d9ff' }}>
              {session.name}
            </Link>
            <Text color="gray.400"> &gt; </Text>
            <Text color="gray.300" fontWeight="medium">
              Scenario Summary
            </Text>
          </HStack>
        </HStack>

        <HStack justify="space-between" align="start" mb={4}>
          <Box>
            <Box mb={2}>
              <InlineEditableText
                value={session.name}
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
                fontSize="xl"
                fontWeight="bold"
              />
            </Box>
            <Text fontSize="14px" color="gray.400">
              {formatQuarter(planningPeriod)} • {session.ux_designers} UX Designers • {session.content_designers} Content Designers
            </Text>
          </Box>
          <HStack spacing={3}>
            {session.status === 'committed' ? (
              <Button
                variant="outline"
                size="md"
                onClick={async () => {
                  if (session.id) {
                    await uncommitSession(session.id)
                    toast({
                      title: 'Scenario uncommitted',
                      description: `${session.name} has been uncommitted.`,
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    })
                  }
                }}
                borderColor="rgba(255, 255, 255, 0.1)"
                color="gray.300"
                _hover={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  bg: 'rgba(255, 255, 255, 0.05)',
                }}
              >
                Uncommit
              </Button>
            ) : (
              <Button
                colorScheme="cyan"
                size="md"
                isDisabled={items.length === 0}
                onClick={async () => {
                  if (session.id && items.length > 0) {
                    await commitSession(session.id, items.length)
                    toast({
                      title: 'Scenario committed',
                      description: `${session.name} is now the committed plan for ${formatQuarter(planningPeriod)}.`,
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    })
                  } else if (items.length === 0) {
                    toast({
                      title: 'Cannot commit empty scenario',
                      description: 'Add at least one roadmap item before committing this scenario.',
                      status: 'warning',
                      duration: 3000,
                      isClosable: true,
                    })
                  }
                }}
              >
                Commit this scenario
              </Button>
            )}
          </HStack>
        </HStack>

        {/* Capacity Overview Cards */}
        {capacityMetrics && (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={8}>
            {/* UX Design Capacity Card */}
            <Box
              bg="#141419"
              borderRadius="md"
              p={6}
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
            >
              <Heading size="sm" mb={4} fontWeight="bold" color="white">
                UX Design Capacity
              </Heading>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="12px" color="gray.400" fontWeight="medium" mb={1}>
                    Team Size
                  </Text>
                  <Text fontSize="24px" fontWeight="bold" color="white">
                    {capacityMetrics.ux.teamSize}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="12px" color="gray.400" fontWeight="medium" mb={1}>
                    Total Capacity
                  </Text>
                  <Text fontSize="24px" fontWeight="bold" color="white">
                    {typeof capacityMetrics.ux.capacity === 'number' ? capacityMetrics.ux.capacity.toFixed(1) : '0.0'} focus weeks
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="12px" color="gray.400" fontWeight="medium" mb={1}>
                    Total Demand
                  </Text>
                  <Text fontSize="24px" fontWeight="bold" color="white">
                    {typeof capacityMetrics.ux.demand === 'number' ? capacityMetrics.ux.demand.toFixed(1) : '0.0'} focus weeks
                  </Text>
                </Box>
                <Box
                  mt={4}
                  pt={4}
                  borderTop="1px solid"
                  borderColor="rgba(255, 255, 255, 0.1)"
                >
                  <HStack spacing={2} mb={1}>
                    <Text fontSize="20px" color={capacityMetrics.ux.surplus >= 0 ? '#10b981' : '#ef4444'}>
                      {capacityMetrics.ux.surplus >= 0 ? '↑' : '↓'}
                    </Text>
                    <Text
                      fontSize="24px"
                      fontWeight="bold"
                      color={capacityMetrics.ux.surplus >= 0 ? '#10b981' : '#ef4444'}
                    >
                      {capacityMetrics.ux.surplus >= 0 ? '+' : ''}
                      {typeof capacityMetrics.ux.surplus === 'number' ? capacityMetrics.ux.surplus.toFixed(1) : '0.0'} focus weeks
                    </Text>
                  </HStack>
                  <Text fontSize="12px" color="gray.400">
                    {capacityMetrics.ux.surplus >= 0 ? 'Surplus' : 'Deficit'} • {typeof capacityMetrics.ux.utilization === 'number' ? capacityMetrics.ux.utilization.toFixed(0) : '0'}% utilized
                  </Text>
                </Box>
              </VStack>
            </Box>

            {/* Content Design Capacity Card */}
            <Box
              bg="#141419"
              borderRadius="md"
              p={6}
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
            >
              <Heading size="sm" mb={4} fontWeight="bold" color="white">
                Content Design Capacity
              </Heading>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="12px" color="gray.400" fontWeight="medium" mb={1}>
                    Team Size
                  </Text>
                  <Text fontSize="24px" fontWeight="bold" color="white">
                    {capacityMetrics.content.teamSize}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="12px" color="gray.400" fontWeight="medium" mb={1}>
                    Total Capacity
                  </Text>
                  <Text fontSize="24px" fontWeight="bold" color="white">
                    {typeof capacityMetrics.content.capacity === 'number' ? capacityMetrics.content.capacity.toFixed(1) : '0.0'} focus weeks
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="12px" color="gray.400" fontWeight="medium" mb={1}>
                    Total Demand
                  </Text>
                  <Text fontSize="24px" fontWeight="bold" color="white">
                    {typeof capacityMetrics.content.demand === 'number' ? capacityMetrics.content.demand.toFixed(1) : '0.0'} focus weeks
                  </Text>
                </Box>
                <Box
                  mt={4}
                  pt={4}
                  borderTop="1px solid"
                  borderColor="rgba(255, 255, 255, 0.1)"
                >
                  <HStack spacing={2} mb={1}>
                    <Text fontSize="20px" color={capacityMetrics.content.surplus >= 0 ? '#10b981' : '#ef4444'}>
                      {capacityMetrics.content.surplus >= 0 ? '↑' : '↓'}
                    </Text>
                    <Text
                      fontSize="24px"
                      fontWeight="bold"
                      color={capacityMetrics.content.surplus >= 0 ? '#10b981' : '#ef4444'}
                    >
                      {capacityMetrics.content.surplus >= 0 ? '+' : ''}
                      {typeof capacityMetrics.content.surplus === 'number' ? capacityMetrics.content.surplus.toFixed(1) : '0.0'} focus weeks
                    </Text>
                  </HStack>
                  <Text fontSize="12px" color="gray.400">
                    {capacityMetrics.content.surplus >= 0 ? 'Surplus' : 'Deficit'} • {typeof capacityMetrics.content.utilization === 'number' ? capacityMetrics.content.utilization.toFixed(0) : '0'}% utilized
                  </Text>
                </Box>
              </VStack>
            </Box>
          </SimpleGrid>
        )}

        {/* Roadmap Items Table */}
        <Box bg="#141419" borderRadius="md" p={6} border="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
          <Heading size="md" mb={6} fontWeight="bold" color="white">
            Roadmap Items
          </Heading>

          {items.length === 0 ? (
            // Empty State
            <VStack spacing={4} py={12}>
              <Text color="gray.300" fontSize="16px">
                No roadmap items yet. Add items to see capacity calculations.
              </Text>
              <Button
                onClick={onCreateModalOpen}
                colorScheme="cyan"
              >
                + Add Your First Item
              </Button>
            </VStack>
          ) : (
            <>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Key</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Name</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Priority</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Status</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider" borderLeft="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
                        UX Size
                      </Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">UX Focus Weeks</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">UX Sprints</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider" borderLeft="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
                        Content Size
                      </Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Content Focus Weeks</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Content Sprints</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {items.map((item) => {
                      const uxSprintEstimate = item.uxFocusWeeks
                        ? estimateSprints(item.uxFocusWeeks)
                        : 0
                      const contentSprintEstimate = item.contentFocusWeeks
                        ? estimateSprints(item.contentFocusWeeks)
                        : 0

                      return (
                        <Tr
                          key={item.id}
                          _hover={{ bg: 'rgba(255, 255, 255, 0.05)', cursor: 'pointer' }}
                          onClick={() => handleRowClick(item.id)}
                          borderBottom="1px solid"
                          borderColor="rgba(255, 255, 255, 0.05)"
                        >
                          <Td fontWeight="medium" color="gray.300">{item.short_key}</Td>
                          <Td color="gray.300">{item.name}</Td>
                          <Td>
                            <Badge
                              bg="rgba(245, 158, 11, 0.1)"
                              color="#f59e0b"
                              border="1px solid"
                              borderColor="rgba(245, 158, 11, 0.5)"
                              borderRadius="4px"
                              px={2}
                              py={1}
                              fontWeight={500}
                            >
                              {formatPriority(item.priority)}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge
                              bg="rgba(255, 255, 255, 0.1)"
                              color="gray.300"
                              borderRadius="full"
                              px={2}
                              py={1}
                            >
                              {formatStatus(item.status)}
                            </Badge>
                          </Td>
                          <Td borderLeft="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
                            {item.uxSizeBand ? (
                              <Text
                                fontWeight={600}
                                fontSize="14px"
                                color="gray.300"
                              >
                                {item.uxSizeBand}
                              </Text>
                            ) : (
                              <Text color="gray.500">—</Text>
                            )}
                          </Td>
                          <Td color="gray.300">
                            {typeof item.uxFocusWeeks === 'number' ? item.uxFocusWeeks.toFixed(1) : '—'}
                          </Td>
                          <Td color="gray.300">
                            {item.uxFocusWeeks
                              ? formatSprintEstimate(uxSprintEstimate)
                              : '—'}
                          </Td>
                          <Td borderLeft="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
                            {item.contentSizeBand ? (
                              <Text
                                fontWeight={600}
                                fontSize="14px"
                                color="gray.300"
                              >
                                {item.contentSizeBand}
                              </Text>
                            ) : (
                              <Text color="gray.500">—</Text>
                            )}
                          </Td>
                          <Td color="gray.300">
                            {typeof item.contentFocusWeeks === 'number'
                              ? item.contentFocusWeeks.toFixed(1)
                              : '—'}
                          </Td>
                          <Td color="gray.300">
                            {item.contentFocusWeeks
                              ? formatSprintEstimate(contentSprintEstimate)
                              : '—'}
                          </Td>
                          <Td onClick={(e) => e.stopPropagation()}>
                            <HStack spacing={2}>
                              <IconButton
                                aria-label="Save item"
                                icon={<CheckIcon />}
                                size="sm"
                                bg="#10b981"
                                color="white"
                                _hover={{ bg: '#059669', boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)' }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toast({
                                    title: 'Item saved',
                                    status: 'success',
                                    duration: 2000,
                                    isClosable: true,
                                  })
                                }}
                              />
                              <IconButton
                                aria-label="Remove item"
                                icon={<DeleteIcon />}
                                size="sm"
                                bg="#ef4444"
                                color="white"
                                _hover={{ bg: '#dc2626', boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)' }}
                                onClick={(e) => handleRemoveClick(e, item.id, item.name)}
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      )
                    })}
                  </Tbody>
                </Table>
              </TableContainer>

              {/* Add another feature button */}
              <Box mt={6} textAlign="center">
                <Button
                  variant="link"
                  color="#00d9ff"
                  fontSize="14px"
                  onClick={onCreateModalOpen}
                  _hover={{ color: '#00b8d9', textDecoration: 'underline' }}
                >
                  + Add another feature
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Remove Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(4px)">
          <AlertDialogContent bg="#141419" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)" boxShadow="0 25px 50px -12px rgba(0, 217, 255, 0.2)">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white" borderBottom="1px solid" borderColor="rgba(255, 255, 255, 0.1)" px={6} py={4}>
              Delete Item
            </AlertDialogHeader>
            <AlertDialogBody color="gray.300" px={6} py={4}>
              Delete <strong>{itemToDeleteRef.current?.name || 'this item'}</strong>? This cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter borderTop="1px solid" borderColor="rgba(255, 255, 255, 0.1)" px={6} py={4}>
              <Button ref={cancelRef} onClick={onClose} variant="outline">
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
                onClick={handleConfirmRemove}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Create Item Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose}>
        <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(4px)" />
        <ModalContent bg="#141419" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)" boxShadow="0 25px 50px -12px rgba(0, 217, 255, 0.2)">
          <form onSubmit={handleCreateItem}>
            <ModalHeader color="white" borderBottom="1px solid" borderColor="rgba(255, 255, 255, 0.1)">Create New Roadmap Item</ModalHeader>
            <ModalCloseButton color="gray.400" _hover={{ color: 'white' }} />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color="gray.300">Short Key</FormLabel>
                  <Input
                    bg="#1a1a20"
                    borderColor="rgba(255, 255, 255, 0.1)"
                    color="white"
                    _focus={{ borderColor: '#00d9ff', boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)' }}
                    placeholder="e.g., PROJ-1"
                    _placeholder={{ color: 'gray.500' }}
                    value={formData.short_key}
                    onChange={(e) => setFormData({ ...formData, short_key: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.300">Name</FormLabel>
                  <Input
                    bg="#1a1a20"
                    borderColor="rgba(255, 255, 255, 0.1)"
                    color="white"
                    _focus={{ borderColor: '#00d9ff', boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)' }}
                    placeholder="e.g., New Payment Method"
                    _placeholder={{ color: 'gray.500' }}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.300">Initiative</FormLabel>
                  <Input
                    bg="#1a1a20"
                    borderColor="rgba(255, 255, 255, 0.1)"
                    color="white"
                    _focus={{ borderColor: '#00d9ff', boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)' }}
                    placeholder="e.g., Revenue"
                    _placeholder={{ color: 'gray.500' }}
                    value={formData.initiative}
                    onChange={(e) => setFormData({ ...formData, initiative: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.300">Priority</FormLabel>
                  <NumberInput
                    value={formData.priority}
                    onChange={(_, valueAsNumber) =>
                      setFormData({ ...formData, priority: valueAsNumber || 1 })
                    }
                    min={1}
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
              <Button variant="ghost" mr={3} onClick={onCreateModalClose}>
                Cancel
              </Button>
              <Button colorScheme="cyan" type="submit">
                Create Item
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default SessionSummaryPage
