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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { ChevronLeftIcon, DeleteIcon, CheckIcon } from '@chakra-ui/icons'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useMemo, useRef, useEffect, useState } from 'react'
import { usePlanningSessions } from '../context/PlanningSessionsContext'
import { useRoadmapItems } from '../context/RoadmapItemsContext'
import { useSettings } from '../context/SettingsContext'
import { getWeeksForPeriod } from '../config/quarterConfig'
import { estimateSprints, formatSprintEstimate } from '../config/sprints'
import { calculateWorkWeeks } from '../config/effortModel'
import InlineEditableText from '../components/InlineEditableText'
import EditableNumberCell from '../components/EditableNumberCell'
import EditableTextCell from '../components/EditableTextCell'
import EditableDateCell from '../components/EditableDateCell'
import PasteTableImportModal from '../features/scenarios/pasteTableImport/PasteTableImportModal'

function SessionSummaryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { sessions, getSessionById, commitSession, uncommitSession, updateSession, isLoading: sessionsLoading, error: sessionsError, loadSessions } = usePlanningSessions()
  const { getItemsForSession, removeItem, createItem, updateItem, loadItemsForSession, error: roadmapError } = useRoadmapItems()
  const { settings } = useSettings()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure()
  const { isOpen: isPasteModalOpen, onOpen: onPasteModalOpen, onClose: onPasteModalClose } = useDisclosure()
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

  // Load items for this session when the page loads or when navigating back
  // NOTE: We only load if items are empty to avoid overwriting optimistic updates
  useEffect(() => {
    if (id) {
      const currentItems = getItemsForSession(id)
      // Only reload if we don't have items for this session
      // This prevents overwriting optimistic updates when navigating
      if (currentItems.length === 0) {
        console.log('🟡 [SessionSummaryPage] Loading items for session (empty):', id)
        loadItemsForSession(id)
      } else {
        console.log('🟡 [SessionSummaryPage] Skipping reload, items already loaded:', {
          sessionId: id,
          itemCount: currentItems.length
        })
      }
    }
  }, [id, loadItemsForSession, getItemsForSession]) // Removed location.key to prevent reload on navigation

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

  // Handle updating UX focus weeks from inline edit
  const handleUpdateUXFocusWeeks = async (itemId: string, newValue: number | undefined) => {
    if (!id) return

    console.log('🔵 [handleUpdateUXFocusWeeks] Called with:', { itemId, newValue, sessionId: id })

    const focusTimeRatio = settings?.time_model.focusTimeRatio ?? 0.75
    const updates: {
      uxFocusWeeks?: number
      uxWorkWeeks?: number
    } = {}

    if (newValue !== undefined) {
      updates.uxFocusWeeks = newValue
      updates.uxWorkWeeks = calculateWorkWeeks(newValue, focusTimeRatio)
    } else {
      // If undefined, let normalization handle defaults
      // But we still need to update work weeks based on current focus weeks
      const item = items.find((i) => i.id === itemId)
      if (item && typeof item.uxFocusWeeks === 'number') {
        updates.uxWorkWeeks = calculateWorkWeeks(item.uxFocusWeeks, focusTimeRatio)
      }
    }

    try {
      console.log('🔵 [handleUpdateUXFocusWeeks] Calling updateItem with:', { itemId, updates })
      await updateItem(itemId, updates)
      console.log('🟢 [handleUpdateUXFocusWeeks] Update successful, checking state...')
      
      // Verify the update in state
      const updatedItems = getItemsForSession(id)
      const updatedItem = updatedItems.find(i => i.id === itemId)
      console.log('🟢 [handleUpdateUXFocusWeeks] State after update:', {
        itemId,
        uxFocusWeeks: updatedItem?.uxFocusWeeks,
        expected: newValue
      })
    } catch (error) {
      console.error('🔴 [handleUpdateUXFocusWeeks] Error:', error)
      toast({
        title: 'Update failed',
        description: 'Failed to update UX focus weeks. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Handle updating Content focus weeks from inline edit
  const handleUpdateContentFocusWeeks = async (itemId: string, newValue: number | undefined) => {
    if (!id) return

    console.log('🔵 [handleUpdateContentFocusWeeks] Called with:', { itemId, newValue, sessionId: id })

    const focusTimeRatio = settings?.time_model.focusTimeRatio ?? 0.75
    const updates: {
      contentFocusWeeks?: number
      contentWorkWeeks?: number
    } = {}

    if (newValue !== undefined) {
      updates.contentFocusWeeks = newValue
      updates.contentWorkWeeks = calculateWorkWeeks(newValue, focusTimeRatio)
    } else {
      // If undefined, let normalization handle defaults
      // But we still need to update work weeks based on current focus weeks
      const item = items.find((i) => i.id === itemId)
      if (item && typeof item.contentFocusWeeks === 'number') {
        updates.contentWorkWeeks = calculateWorkWeeks(item.contentFocusWeeks, focusTimeRatio)
      }
    }

    try {
      console.log('🔵 [handleUpdateContentFocusWeeks] Calling updateItem with:', { itemId, updates })
      await updateItem(itemId, updates)
      console.log('🟢 [handleUpdateContentFocusWeeks] Update successful, checking state...')
      
      // Verify the update in state
      const updatedItems = getItemsForSession(id)
      const updatedItem = updatedItems.find(i => i.id === itemId)
      console.log('🟢 [handleUpdateContentFocusWeeks] State after update:', {
        itemId,
        contentFocusWeeks: updatedItem?.contentFocusWeeks,
        expected: newValue
      })
    } catch (error) {
      console.error('🔴 [handleUpdateContentFocusWeeks] Error:', error)
      toast({
        title: 'Update failed',
        description: 'Failed to update Content focus weeks. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Handle updating item name from inline edit
  const handleUpdateName = async (itemId: string, newValue: string) => {
    if (!id) return

    try {
      await updateItem(itemId, { name: newValue })
    } catch (error) {
      console.error('Error updating item name:', error)
      toast({
        title: 'Update failed',
        description: 'Failed to update item name. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Handle updating item short_key from inline edit
  const handleUpdateShortKey = async (itemId: string, newValue: string) => {
    if (!id) return

    try {
      await updateItem(itemId, { short_key: newValue })
    } catch (error) {
      console.error('Error updating item key:', error)
      toast({
        title: 'Update failed',
        description: 'Failed to update item key. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Validate short_key: non-empty and no spaces
  const validateShortKey = (value: string): boolean => {
    return value.length > 0 && !value.includes(' ')
  }

  // Handle updating item startDate from inline edit
  const handleUpdateStartDate = async (itemId: string, newValue: string | null) => {
    if (!id) return

    console.log('🔵 [handleUpdateStartDate] Called with:', { itemId, newValue, sessionId: id })

    try {
      console.log('🔵 [handleUpdateStartDate] Calling updateItem with:', { itemId, startDate: newValue })
      await updateItem(itemId, { startDate: newValue })
      console.log('🟢 [handleUpdateStartDate] Update successful, checking state...')
      
      // Verify the update in state
      const updatedItems = getItemsForSession(id)
      const updatedItem = updatedItems.find(i => i.id === itemId)
      console.log('🟢 [handleUpdateStartDate] State after update:', {
        itemId,
        startDate: updatedItem?.startDate,
        expected: newValue
      })
    } catch (error) {
      console.error('🔴 [handleUpdateStartDate] Error:', error)
      toast({
        title: 'Update failed',
        description: 'Failed to update start date. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Handle updating item endDate from inline edit
  const handleUpdateEndDate = async (itemId: string, newValue: string | null) => {
    if (!id) return

    console.log('🔵 [handleUpdateEndDate] Called with:', { itemId, newValue, sessionId: id })

    try {
      console.log('🔵 [handleUpdateEndDate] Calling updateItem with:', { itemId, endDate: newValue })
      await updateItem(itemId, { endDate: newValue })
      console.log('🟢 [handleUpdateEndDate] Update successful, checking state...')
      
      // Verify the update in state
      const updatedItems = getItemsForSession(id)
      const updatedItem = updatedItems.find(i => i.id === itemId)
      console.log('🟢 [handleUpdateEndDate] State after update:', {
        itemId,
        endDate: updatedItem?.endDate,
        expected: newValue
      })
    } catch (error) {
      console.error('🔴 [handleUpdateEndDate] Error:', error)
      toast({
        title: 'Update failed',
        description: 'Failed to update end date. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
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

  // Handle paste import
  const handlePasteImport = async (
    items: Array<{ 
      name: string
      short_key: string
      initiative: string
      priority: number
      effortWeeks?: number // Legacy 4-column format
      uxEffortWeeks?: number // 5-column format
      contentEffortWeeks?: number // 5-column format
      startDate?: string
      endDate?: string
    }>
  ) => {
    if (!id) return

    try {
      const focusTimeRatio = 0.75 // Default ratio
      
      // Import items sequentially
      for (const item of items) {
        const newItem = await createItem(id, {
          short_key: item.short_key,
          name: item.name,
          initiative: item.initiative,
          priority: item.priority,
        })

        // Map start/end dates from paste into the item
        const dateUpdates: {
          startDate?: string | null
          endDate?: string | null
        } = {}
        
        if (item.startDate !== undefined) {
          dateUpdates.startDate = item.startDate || null
        }
        if (item.endDate !== undefined) {
          dateUpdates.endDate = item.endDate || null
        }
        
        // Update dates if provided
        if (Object.keys(dateUpdates).length > 0) {
          await updateItem(newItem.id, dateUpdates)
        }

        // Check if this is 5-column format (has separate UX/Content effort)
        const hasSeparateEffort = item.uxEffortWeeks !== undefined || item.contentEffortWeeks !== undefined

        if (hasSeparateEffort) {
          // 5-column format: use separate UX and Content effort values
          // These values are mapped to uxFocusWeeks and contentFocusWeeks fields,
          // which are displayed in the Roadmap Items grid and used by scenario
          // summary and committed plan calculations.
          // Only update fields that were explicitly provided (undefined means use default)
          const updates: {
            uxFocusWeeks?: number
            uxWorkWeeks?: number
            contentFocusWeeks?: number
            contentWorkWeeks?: number
          } = {}
          
          if (item.uxEffortWeeks !== undefined) {
            updates.uxFocusWeeks = item.uxEffortWeeks
            updates.uxWorkWeeks = calculateWorkWeeks(item.uxEffortWeeks, focusTimeRatio)
          }
          
          if (item.contentEffortWeeks !== undefined) {
            updates.contentFocusWeeks = item.contentEffortWeeks
            updates.contentWorkWeeks = calculateWorkWeeks(item.contentEffortWeeks, focusTimeRatio)
          }
          
          // Only update if we have values to set
          if (Object.keys(updates).length > 0) {
            await updateItem(newItem.id, updates)
          }
        } else if (item.effortWeeks !== undefined && item.effortWeeks > 0) {
          // Legacy 4-column format: split effort weeks evenly between UX and Content
          // Note: This preserves backward compatibility with existing paste behavior
          const focusWeeks = item.effortWeeks / 2
          const workWeeks = calculateWorkWeeks(focusWeeks, focusTimeRatio)

          await updateItem(newItem.id, {
            uxFocusWeeks: focusWeeks,
            uxWorkWeeks: workWeeks,
            contentFocusWeeks: focusWeeks,
            contentWorkWeeks: workWeeks,
          })
        }
      }

      toast({
        title: 'Items imported',
        description: `${items.length} ${items.length === 1 ? 'item' : 'items'} have been added.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error importing items:', error)
      toast({
        title: 'Import failed',
        description: 'Some items may not have been imported. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
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
        {/* Error message for PlanningSessionsContext */}
        {sessionsError && (
          <Alert status="warning" bg="#141419" border="1px solid" borderColor="rgba(245, 158, 11, 0.3)" borderRadius="md" mb={4}>
            <AlertIcon color="#f59e0b" />
            <AlertTitle color="white" mr={2}>Session Error:</AlertTitle>
            <AlertDescription color="gray.300">{sessionsError}</AlertDescription>
          </Alert>
        )}

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

          {/* Error message for RoadmapItemsContext */}
          {roadmapError && (
            <Alert status="warning" bg="#141419" border="1px solid" borderColor="rgba(245, 158, 11, 0.3)" borderRadius="md" mb={4}>
              <AlertIcon color="#f59e0b" />
              <AlertTitle color="white" mr={2}>Sync Error:</AlertTitle>
              <AlertDescription color="gray.300">
                {roadmapError} Changes were saved locally. You may need to retry syncing to the database.
              </AlertDescription>
            </Alert>
          )}

          {items.length === 0 ? (
            // Empty State
            <VStack spacing={4} py={12}>
              <Text color="gray.300" fontSize="16px">
                No roadmap items yet. Add items to see capacity calculations.
              </Text>
              <HStack spacing={3}>
                <Button
                  onClick={onCreateModalOpen}
                  colorScheme="cyan"
                >
                  + Add Your First Item
                </Button>
                <Button
                  onClick={onPasteModalOpen}
                  variant="outline"
                  borderColor="rgba(255, 255, 255, 0.1)"
                  color="gray.300"
                  _hover={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    bg: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  Paste from table
                </Button>
              </HStack>
            </VStack>
          ) : (
            <>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Key</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Name</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Start</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">End</Th>
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
                          <Td onClick={(e) => e.stopPropagation()}>
                            <EditableTextCell
                              value={item.short_key}
                              onChange={() => {
                                // Local state update happens immediately via context
                              }}
                              onUpdate={(newValue) => handleUpdateShortKey(item.id, newValue)}
                              validate={validateShortKey}
                              placeholder="Key"
                              color="gray.300"
                            />
                          </Td>
                          <Td onClick={(e) => e.stopPropagation()}>
                            <EditableTextCell
                              value={item.name}
                              onChange={() => {
                                // Local state update happens immediately via context
                              }}
                              onUpdate={(newValue) => handleUpdateName(item.id, newValue)}
                              placeholder="Name"
                              color="gray.300"
                            />
                          </Td>
                          <Td onClick={(e) => e.stopPropagation()}>
                            <EditableDateCell
                              value={item.startDate}
                              onChange={() => {
                                // Local state update happens immediately via context
                              }}
                              onUpdate={(newValue) => handleUpdateStartDate(item.id, newValue)}
                              placeholder="—"
                              color="gray.300"
                            />
                          </Td>
                          <Td onClick={(e) => e.stopPropagation()}>
                            <EditableDateCell
                              value={item.endDate}
                              onChange={() => {
                                // Local state update happens immediately via context
                              }}
                              onUpdate={(newValue) => handleUpdateEndDate(item.id, newValue)}
                              placeholder="—"
                              color="gray.300"
                            />
                          </Td>
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
                          <Td onClick={(e) => e.stopPropagation()}>
                            <EditableNumberCell
                              value={item.uxFocusWeeks}
                              onChange={() => {
                                // Local state update happens immediately via context
                              }}
                              onUpdate={(newValue) => handleUpdateUXFocusWeeks(item.id, newValue)}
                              min={0}
                              step={0.1}
                              precision={1}
                              color="gray.300"
                            />
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
                          <Td onClick={(e) => e.stopPropagation()}>
                            <EditableNumberCell
                              value={item.contentFocusWeeks}
                              onChange={() => {
                                // Local state update happens immediately via context
                              }}
                              onUpdate={(newValue) => handleUpdateContentFocusWeeks(item.id, newValue)}
                              min={0}
                              step={0.1}
                              precision={1}
                              color="gray.300"
                            />
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
                <HStack spacing={3}>
                  <Button
                    variant="link"
                    color="#00d9ff"
                    fontSize="14px"
                    onClick={onCreateModalOpen}
                    _hover={{ color: '#00b8d9', textDecoration: 'underline' }}
                  >
                    + Add another feature
                  </Button>
                  <Text color="gray.500" fontSize="14px">•</Text>
                  <Button
                    variant="link"
                    color="#00d9ff"
                    fontSize="14px"
                    onClick={onPasteModalOpen}
                    _hover={{ color: '#00b8d9', textDecoration: 'underline' }}
                  >
                    Paste from table
                  </Button>
                </HStack>
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

      {/* Paste Table Import Modal */}
      <PasteTableImportModal
        isOpen={isPasteModalOpen}
        onClose={onPasteModalClose}
        onImport={handlePasteImport}
      />
    </Box>
  )
}

export default SessionSummaryPage
