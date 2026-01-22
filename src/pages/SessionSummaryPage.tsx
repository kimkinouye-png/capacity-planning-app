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

function SessionSummaryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { getSessionById } = usePlanningSessions()
  const { getItemsForSession, removeItem, createItem } = useRoadmapItems()
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

  // Get session
  const session = useMemo(() => {
    return id ? getSessionById(id) : undefined
  }, [id, getSessionById])

  // Get items - this will automatically update when items change in context
  const items = useMemo(() => {
    return id ? getItemsForSession(id) : []
  }, [id, getItemsForSession])

  // Refresh calculations when returning to page
  // This ensures totals are recalculated with fresh data after effort changes
  // The capacityMetrics useMemo will automatically recalculate when items change,
  // but this effect ensures we refresh when navigating back to the page
  useEffect(() => {
    if (!id) return

    // When the page is visited or sessionId changes, ensure we have fresh data
    // The items array reference will change when items are updated via updateItem,
    // which will trigger the capacityMetrics useMemo to recalculate
    // This effect serves as a safety mechanism to ensure updates propagate
  }, [id])

  // Calculate capacity and demand
  const capacityMetrics = useMemo(() => {
    if (!session) return null

    const weeksInQuarter = getWeeksForPeriod(session.planning_period)
    
    // Calculate capacity (team size × weeks in quarter)
    const uxCapacity = session.ux_designers * weeksInQuarter
    const contentCapacity = session.content_designers * weeksInQuarter

    // Calculate demand (sum of focus weeks from all items)
    const uxDemand = items.reduce((sum, item) => {
      return sum + (item.uxFocusWeeks || 0)
    }, 0)

    const contentDemand = items.reduce((sum, item) => {
      return sum + (item.contentFocusWeeks || 0)
    }, 0)

    // Calculate surplus/deficit
    const uxSurplus = uxCapacity - uxDemand
    const contentSurplus = contentCapacity - contentDemand

    // Calculate utilization %
    const uxUtilization = uxCapacity > 0 ? (uxDemand / uxCapacity) * 100 : 0
    const contentUtilization = contentCapacity > 0 ? (contentDemand / contentCapacity) * 100 : 0

    return {
      ux: {
        teamSize: session.ux_designers,
        capacity: uxCapacity,
        demand: uxDemand,
        surplus: uxSurplus,
        utilization: uxUtilization,
      },
      content: {
        teamSize: session.content_designers,
        capacity: contentCapacity,
        demand: contentDemand,
        surplus: contentSurplus,
        utilization: contentUtilization,
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
  const handleConfirmRemove = () => {
    if (itemToDeleteRef.current && id) {
      removeItem(id, itemToDeleteRef.current.id)
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
  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    const newItem = createItem(id, formData)
    
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
  }

  // Handle missing session
  if (!id) {
    return (
      <Box p={8}>
        <Text>Invalid session ID</Text>
      </Box>
    )
  }

  if (!session) {
    return (
      <Box p={8}>
        <Text>Session not found</Text>
      </Box>
    )
  }

  // Format quarter for display
  const formatQuarter = (period: string | undefined) => {
    if (!period) return 'Unknown'
    return period.replace('-', ' ')
  }

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
          />
          <HStack spacing={2} fontSize="14px">
            <Link to="/" style={{ color: '#3B82F6' }}>
              Home
            </Link>
            <Text color="gray.400"> &gt; </Text>
            <Text color="gray.300">
              {session.name} - Summary
            </Text>
          </HStack>
        </HStack>

        <Heading size="xl" mb={2} fontWeight="bold" color="white">
          {session.name}
        </Heading>
        <Text fontSize="14px" color="gray.400" mb={8}>
          {formatQuarter(session.planning_period)} • {session.ux_designers} UX Designers • {session.content_designers} Content Designers
        </Text>

        {/* Capacity Overview Cards */}
        {capacityMetrics && (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={8}>
            {/* UX Design Capacity Card */}
            <Box
              bg="#141419"
              borderRadius="md"
              p={6}
              border="1px solid"
              borderColor={capacityMetrics.ux.surplus >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
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
                    {capacityMetrics.ux.capacity.toFixed(1)} focus weeks
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="12px" color="gray.400" fontWeight="medium" mb={1}>
                    Total Demand
                  </Text>
                  <Text fontSize="24px" fontWeight="bold" color="white">
                    {capacityMetrics.ux.demand.toFixed(1)} focus weeks
                  </Text>
                </Box>
                <Box
                  mt={4}
                  pt={4}
                  borderTop="1px solid"
                  borderColor={capacityMetrics.ux.surplus >= 0 ? 'green.300' : 'red.300'}
                >
                  <HStack spacing={2} mb={1}>
                    <Text fontSize="20px" color={capacityMetrics.ux.surplus >= 0 ? '#10B981' : '#EF4444'}>
                      {capacityMetrics.ux.surplus >= 0 ? '↑' : '↓'}
                    </Text>
                    <Text
                      fontSize="24px"
                      fontWeight="bold"
                      color={capacityMetrics.ux.surplus >= 0 ? '#10B981' : '#EF4444'}
                    >
                      {capacityMetrics.ux.surplus >= 0 ? '+' : ''}
                      {capacityMetrics.ux.surplus.toFixed(1)} focus weeks
                    </Text>
                  </HStack>
                  <Text fontSize="12px" color="gray.400">
                    {capacityMetrics.ux.surplus >= 0 ? 'Surplus' : 'Deficit'} • {capacityMetrics.ux.utilization.toFixed(0)}% utilized
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
              borderColor={capacityMetrics.content.surplus >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
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
                    {capacityMetrics.content.capacity.toFixed(1)} focus weeks
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="12px" color="gray.400" fontWeight="medium" mb={1}>
                    Total Demand
                  </Text>
                  <Text fontSize="24px" fontWeight="bold" color="white">
                    {capacityMetrics.content.demand.toFixed(1)} focus weeks
                  </Text>
                </Box>
                <Box
                  mt={4}
                  pt={4}
                  borderTop="1px solid"
                  borderColor={capacityMetrics.content.surplus >= 0 ? 'green.300' : 'red.300'}
                >
                  <HStack spacing={2} mb={1}>
                    <Text fontSize="20px" color={capacityMetrics.content.surplus >= 0 ? '#10B981' : '#EF4444'}>
                      {capacityMetrics.content.surplus >= 0 ? '↑' : '↓'}
                    </Text>
                    <Text
                      fontSize="24px"
                      fontWeight="bold"
                      color={capacityMetrics.content.surplus >= 0 ? '#10B981' : '#EF4444'}
                    >
                      {capacityMetrics.content.surplus >= 0 ? '+' : ''}
                      {capacityMetrics.content.surplus.toFixed(1)} focus weeks
                    </Text>
                  </HStack>
                  <Text fontSize="12px" color="gray.400">
                    {capacityMetrics.content.surplus >= 0 ? 'Surplus' : 'Deficit'} • {capacityMetrics.content.utilization.toFixed(0)}% utilized
                  </Text>
                </Box>
              </VStack>
            </Box>
          </SimpleGrid>
        )}

        {/* Roadmap Items Table */}
        <Box bg="#141419" borderRadius="md" p={6} border="1px solid" borderColor="rgba(255, 255, 255, 0.1)" boxShadow="sm">
          <Heading size="md" mb={6} fontWeight="bold" color="white">
            Roadmap Items
          </Heading>

          {items.length === 0 ? (
            // Empty State
            <VStack spacing={4} py={12}>
              <Text color="gray.400" fontSize="16px">
                No roadmap items yet. Add items to see capacity calculations.
              </Text>
              <Button
                as={Link}
                to={`/sessions/${id}/items`}
                bg="black"
                color="white"
                _hover={{ bg: 'gray.800' }}
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
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider" borderLeft="2px solid" borderColor="rgba(59, 130, 246, 0.3)">
                        UX Size
                      </Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">UX Focus Weeks</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">UX Sprints</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider" borderLeft="2px solid" borderColor="rgba(16, 185, 129, 0.3)">
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
                        >
                          <Td fontWeight="medium" color="gray.300">{item.short_key}</Td>
                          <Td color="gray.300">{item.name}</Td>
                          <Td>
                            <Badge
                              bg="#FEF3C7"
                              color="#92400E"
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
                              bg="gray.200"
                              color="gray.700"
                              borderRadius="full"
                              px={2}
                              py={1}
                            >
                              {formatStatus(item.status)}
                            </Badge>
                          </Td>
                          <Td borderLeft="2px solid" borderColor="rgba(59, 130, 246, 0.3)">
                            {item.uxSizeBand ? (
                              <Text
                                fontWeight={600}
                                fontSize="14px"
                                color="white"
                              >
                                {item.uxSizeBand}
                              </Text>
                            ) : (
                              <Text color="gray.400">—</Text>
                            )}
                          </Td>
                          <Td color="gray.300">
                            {item.uxFocusWeeks ? item.uxFocusWeeks.toFixed(1) : '—'}
                          </Td>
                          <Td color="gray.300">
                            {item.uxFocusWeeks
                              ? formatSprintEstimate(uxSprintEstimate)
                              : '—'}
                          </Td>
                          <Td borderLeft="2px solid" borderColor="rgba(16, 185, 129, 0.3)">
                            {item.contentSizeBand ? (
                              <Text
                                fontWeight={600}
                                fontSize="14px"
                                color="white"
                              >
                                {item.contentSizeBand}
                              </Text>
                            ) : (
                              <Text color="gray.400">—</Text>
                            )}
                          </Td>
                          <Td color="gray.300">
                            {item.contentFocusWeeks
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
                                bg="green.500"
                                color="white"
                                _hover={{ bg: 'green.600' }}
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
                                bg="red.500"
                                color="white"
                                _hover={{ bg: 'red.600' }}
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
                  color="#3B82F6"
                  fontSize="14px"
                  onClick={onCreateModalOpen}
                  _hover={{ textDecoration: 'underline' }}
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
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Item
            </AlertDialogHeader>
            <AlertDialogBody>
              Delete <strong>{itemToDeleteRef.current?.name || 'this item'}</strong>? This cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleConfirmRemove} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Create Item Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={onCreateModalClose}>
        <ModalOverlay />
        <ModalContent bg="#141419" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)" boxShadow="0 25px 50px -12px rgba(0, 217, 255, 0.2)">
          <form onSubmit={handleCreateItem}>
            <ModalHeader color="white">Create New Roadmap Item</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Short Key</FormLabel>
                  <Input
                    value={formData.short_key}
                    onChange={(e) => setFormData({ ...formData, short_key: e.target.value })}
                    placeholder="e.g., PROJ-1"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., New Payment Method"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Initiative</FormLabel>
                  <Input
                    value={formData.initiative}
                    onChange={(e) => setFormData({ ...formData, initiative: e.target.value })}
                    placeholder="e.g., Revenue"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Priority</FormLabel>
                  <NumberInput
                    value={formData.priority}
                    onChange={(_, valueAsNumber) =>
                      setFormData({ ...formData, priority: valueAsNumber || 1 })
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
              </Stack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCreateModalClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit">
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
