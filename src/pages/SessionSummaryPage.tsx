import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Divider,
  Progress,
  Flex,
} from '@chakra-ui/react'
import {
  DeleteIcon,
  EditIcon,
  StarIcon,
  AddIcon,
  SettingsIcon,
  RepeatIcon,
  InfoIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons'
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom'
import { useMemo, useRef, useEffect, useState, type ReactNode } from 'react'
import { usePlanningSessions } from '../context/PlanningSessionsContext'
import { useRoadmapItems } from '../context/RoadmapItemsContext'
import { getWeeksForPeriod } from '../config/quarterConfig'
import { calculateWorkWeeks } from '../config/effortModel'
import InlineEditableText from '../components/InlineEditableText'
import EditableNumberCell from '../components/EditableNumberCell'
import EditableTextCell from '../components/EditableTextCell'
import AddRoadmapItemModal from '../components/AddRoadmapItemModal'
import PasteTableImportModal from '../features/scenarios/pasteTableImport/PasteTableImportModal'
import type { PlanningSession, RoadmapItem } from '../domain/types'

function sessionStatusBadgeProps(status: PlanningSession['status']): { bg: string; color: string; label: string } {
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

/** Leading dot in status menu */
function sessionStatusDotColor(status: PlanningSession['status']): string {
  switch (status) {
    case 'in-review':
      return '#3b82f6'
    case 'committed':
      return '#a855f7'
    case 'archived':
      return 'gray.500'
    case 'draft':
    default:
      return 'gray.500'
  }
}

const ALL_SCENARIO_STATUSES = ['draft', 'in-review', 'committed', 'archived'] as const satisfies readonly PlanningSession['status'][]

type SessionCapacityCardMetrics = {
  capacity: number
  demand: number
  surplus: number
  utilization: number
}

function SessionCapacityCard({
  title,
  teamSizeControl,
  metrics,
}: {
  title: string
  teamSizeControl: ReactNode
  metrics: SessionCapacityCardMetrics
}) {
  const { capacity, demand, surplus, utilization } = metrics
  const isSurplus = surplus >= 0
  const overCapacity = demand > capacity
  const progressValue = Math.min(100, utilization)

  const capacityStr = typeof capacity === 'number' ? capacity.toFixed(1) : '0.0'
  const demandStr = typeof demand === 'number' ? demand.toFixed(1) : '0.0'
  const utilizedPctStr = typeof utilization === 'number' ? utilization.toFixed(0) : '0'
  const surplusAbsStr = typeof surplus === 'number' ? Math.abs(surplus).toFixed(1) : '0.0'

  const surplusDeficitColor = isSurplus ? 'cyan.400' : 'red.400'

  return (
    <Box
      bg="#1a1d2e"
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="md"
      p={6}
    >
      <Heading size="sm" mb={4} fontWeight="bold" color="white">
        {title}
      </Heading>
      <VStack spacing={3} align="stretch">
        <Flex justify="space-between" align="center" w="full" gap={3} wrap="wrap">
          <Text fontSize="sm" color="gray.500" display={{ base: 'none', md: 'block' }} flexShrink={0}>
            Team Size
          </Text>
          <HStack
            spacing={2}
            flex={{ base: 1, md: 'auto' }}
            justify={{ base: 'flex-start', md: 'flex-end' }}
            align="center"
          >
            <Box fontSize="xl" fontWeight="bold" color="white" textAlign={{ base: 'left', md: 'right' }}>
              {teamSizeControl}
            </Box>
            <Text color="gray.400" display={{ base: 'block', md: 'none' }}>
              designers
            </Text>
          </HStack>
        </Flex>
        <Flex justify="space-between" align="center" gap={3} wrap="wrap">
          <Text fontSize="sm" color="gray.500">
            Total Capacity
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="white">
            {capacityStr} focus weeks
          </Text>
        </Flex>
        <Flex justify="space-between" align="center" gap={3} wrap="wrap">
          <Text fontSize="sm" color="gray.500">
            Total Demand
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="white">
            {demandStr} focus weeks
          </Text>
        </Flex>
      </VStack>

      <Divider borderColor="whiteAlpha.200" my={4} />

      <VStack spacing={3} align="stretch">
        <HStack spacing={2} align="center">
          <Text fontSize="2xl" color={surplusDeficitColor} lineHeight={1} aria-hidden>
            {isSurplus ? '↑' : '↓'}
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color={surplusDeficitColor}>
            {isSurplus ? '+' : '-'}
            {surplusAbsStr} focus weeks
          </Text>
        </HStack>
        <Text fontSize="sm" color="gray.500">
          {isSurplus ? 'Surplus' : 'Deficit'} • {utilizedPctStr}% utilized
        </Text>
        <Progress
          value={progressValue}
          colorScheme={overCapacity ? 'red' : 'cyan'}
          size="sm"
          borderRadius="full"
          w="100%"
        />
      </VStack>
    </Box>
  )
}

function formatQuarterShort(period: string | undefined): string {
  if (!period) return '—'
  const m = period.match(/(\d{4})-Q([1-4])/)
  if (!m) return period
  const yy = m[1].slice(2)
  return `Q${m[2]}'${yy}`
}

const PROJECT_TYPE_LABELS: Record<NonNullable<RoadmapItem['projectType']>, string> = {
  'net-new': 'Net new',
  'new-feature': 'New feature',
  enhancement: 'Enhancement',
  optimization: 'Optimization',
  'fix-polish': 'Fix / polish',
}

const PROJECT_TYPE_ICONS: Record<NonNullable<RoadmapItem['projectType']>, typeof StarIcon> = {
  'net-new': StarIcon,
  'new-feature': AddIcon,
  enhancement: SettingsIcon,
  optimization: RepeatIcon,
  'fix-polish': InfoIcon,
}

function priorityPillProps(p: RoadmapItem['priority'] | undefined): { bg: string; color: string; borderColor: string } {
  switch (p) {
    case 'P0':
      return { bg: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.5)' }
    case 'P1':
      return { bg: 'rgba(249, 115, 22, 0.15)', color: '#fdba74', borderColor: 'rgba(249, 115, 22, 0.5)' }
    case 'P2':
      return { bg: 'rgba(234, 179, 8, 0.15)', color: '#fde047', borderColor: 'rgba(234, 179, 8, 0.45)' }
    case 'P3':
    default:
      return { bg: 'rgba(107, 114, 128, 0.25)', color: '#d1d5db', borderColor: 'rgba(156, 163, 175, 0.5)' }
  }
}

function coerceImportedPriority(raw: unknown): RoadmapItem['priority'] {
  if (raw === 'P0' || raw === 'P1' || raw === 'P2' || raw === 'P3') return raw
  if (typeof raw === 'string') {
    const t = raw.trim().toUpperCase()
    if (t === 'P0' || t === 'P1' || t === 'P2' || t === 'P3') return t as RoadmapItem['priority']
    const parsed = Number(raw)
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 3) {
      return (['P0', 'P1', 'P2', 'P3'] as const)[Math.trunc(parsed)]
    }
  }
  if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0 && raw <= 3) {
    return (['P0', 'P1', 'P2', 'P3'] as const)[Math.trunc(raw)]
  }
  return 'P2'
}

function SessionSummaryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { sessions, getSessionById, commitSession, uncommitSession, updateSession, isLoading: sessionsLoading, error: sessionsError, loadSessions } = usePlanningSessions()
  const { getItemsForSession, removeItem, createItem, updateItem, loadItemsForSession, error: roadmapError } = useRoadmapItems()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure()
  const { isOpen: isPasteModalOpen, onOpen: onPasteModalOpen, onClose: onPasteModalClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const itemToDeleteRef = useRef<{ id: string; name: string } | null>(null)

  const [isCreating, setIsCreating] = useState(false)

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

  // Handle row click (navigate to item detail)
  const handleRowClick = (itemId: string) => {
    navigate(`/sessions/${id}/items/${itemId}`)
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

  // Handle remove item
  const handleRemoveClick = (e: React.MouseEvent, itemId: string, itemName: string) => {
    e.stopPropagation()
    e.preventDefault()
    console.log('🗑️ [SessionSummaryPage] Delete button clicked:', { itemId, itemName })
    itemToDeleteRef.current = { id: itemId, name: itemName }
    onOpen()
    console.log('🗑️ [SessionSummaryPage] Delete dialog opened')
  }

  // Confirm remove
  const handleConfirmRemove = async () => {
    console.log('🗑️ [SessionSummaryPage] Confirm delete clicked:', { 
      itemToDelete: itemToDeleteRef.current, 
      sessionId: id 
    })
    if (itemToDeleteRef.current && id) {
      const itemToDelete = itemToDeleteRef.current
      const itemId = itemToDelete.id
      const itemName = itemToDelete.name
      
      // Optimistic UI update: close dialog immediately and show loading toast
      itemToDeleteRef.current = null
      onClose()
      
      // Show loading toast with helpful message
      const loadingToast = toast({
        title: 'Deleting item...',
        description: `Removing ${itemName}. This may take a moment if the database is waking up.`,
        status: 'info',
        duration: null, // Don't auto-close
        isClosable: false,
      })
      
      try {
        const startTime = performance.now()
        console.log('🗑️ [SessionSummaryPage] Calling removeItem...', {
          sessionId: id,
          itemId: itemId,
          timestamp: new Date().toISOString()
        })
        
        // Remove item from database (this may take time if DB is suspended)
        await removeItem(id, itemId)
        
        const endTime = performance.now()
        const duration = endTime - startTime
        console.log('✅ [SessionSummaryPage] Item deleted successfully', {
          duration: `${duration.toFixed(2)}ms`,
          durationSeconds: `${(duration / 1000).toFixed(2)}s`
        })
        
        // Close loading toast and show success
        toast.close(loadingToast)
        toast({
          title: 'Item deleted',
          description: `${itemName} has been removed.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } catch (error) {
        console.error('❌ [SessionSummaryPage] Error deleting item:', error)
        
        // Close loading toast and show error
        toast.close(loadingToast)
        toast({
          title: 'Failed to delete item',
          description: error instanceof Error ? error.message : 'An error occurred while deleting the item. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        
        // Reload items to restore state
        if (id) {
          loadItemsForSession(id).catch(err => {
            console.error('Failed to reload items after delete error:', err)
          })
        }
      }
    } else {
      console.warn('⚠️ [SessionSummaryPage] Cannot delete: missing itemToDelete or sessionId', {
        hasItemToDelete: !!itemToDeleteRef.current,
        hasSessionId: !!id
      })
    }
  }

  const handleCreateItem = async (data: Parameters<typeof createItem>[1]) => {
    if (!id) return
    setIsCreating(true)
    try {
      const newItem = await createItem(id, data)
      toast({
        title: 'Item created',
        description: `${newItem.name} has been added.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
      onCreateModalClose()
    } catch (error) {
      console.error('Error creating item:', error)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle paste import
  const handlePasteImport = async (
    items: Array<{ 
      name: string
      short_key: string
      initiative: string
      priority: number | RoadmapItem['priority']
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
        const priority = coerceImportedPriority(item.priority)

        const newItem = await createItem(id, {
          short_key: item.short_key,
          name: item.name,
          initiative: item.initiative,
          priority,
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

  // Show error state if sessions failed to load AND we have no session
  // Only show error page if we truly can't load data
  if (sessionsError && !session && !sessionsLoading) {
    // Determine error type for better messaging
    const isTimeout = sessionsError.toLowerCase().includes('timeout')
    const isConnectionError = sessionsError.toLowerCase().includes('cannot connect') || sessionsError.toLowerCase().includes('network')
    const isServerError = sessionsError.toLowerCase().includes('server error')
    
    return (
      <Box minH="100vh" bg="#0a0a0f" p={8}>
        <Box maxW="600px" mx="auto">
          <VStack spacing={4} align="stretch">
            <Box>
              <Text color="red.400" fontSize="lg" fontWeight="bold" mb={2}>
                Error Loading Session
              </Text>
              <Text color="gray.300" mb={4}>{sessionsError}</Text>
            </Box>
            
            {isTimeout && (
              <Box bg="#141419" border="1px solid" borderColor="rgba(245, 158, 11, 0.3)" borderRadius="md" p={4}>
                <Text color="gray.300" fontSize="sm">
                  The database connection timed out. This may happen when the database is waking up from inactivity. 
                  Please wait a moment and try again.
                </Text>
              </Box>
            )}
            
            {isConnectionError && (
              <Box bg="#141419" border="1px solid" borderColor="rgba(245, 158, 11, 0.3)" borderRadius="md" p={4}>
                <Text color="gray.300" fontSize="sm">
                  Cannot connect to the database. Please check your internet connection and try again.
                </Text>
              </Box>
            )}
            
            {isServerError && (
              <Box bg="#141419" border="1px solid" borderColor="rgba(245, 158, 11, 0.3)" borderRadius="md" p={4}>
                <Text color="gray.300" fontSize="sm">
                  The database server is experiencing issues. Please try again in a few moments.
                </Text>
              </Box>
            )}
            
            <HStack spacing={3}>
              <Button 
                onClick={() => {
                  // Reload the page to retry
                  window.location.reload()
                }} 
                colorScheme="cyan"
              >
                Retry
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline"
                borderColor="rgba(255, 255, 255, 0.1)"
                color="gray.300"
                _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }}
              >
                Go to Scenarios List
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    )
  }

  // Handle missing session (only show if not loading and no error)
  if (!session && !sessionsLoading && !sessionsError) {
    return (
      <Box minH="100vh" bg="#0a0a0f" p={8}>
        <Box maxW="600px" mx="auto">
          <VStack spacing={4} align="stretch">
            <Box>
              <Text color="red.400" fontSize="lg" fontWeight="bold" mb={2}>
                Session Not Found
              </Text>
              <Text color="gray.300" mb={2}>
                The session with ID "{id}" could not be found.
              </Text>
              <Text color="gray.500" fontSize="sm" mb={4}>
                It may have been deleted, or you may be accessing a session from a different database. 
                Please check the scenarios list to see available sessions.
              </Text>
            </Box>
            
            <Box bg="#141419" border="1px solid" borderColor="rgba(245, 158, 11, 0.3)" borderRadius="md" p={4}>
              <Text color="gray.300" fontSize="sm">
                💡 <strong>Tip:</strong> If you're switching between different database environments, 
                make sure you're accessing the correct site URL.
              </Text>
            </Box>
            
            <HStack spacing={3}>
              <Button 
                onClick={() => {
                  // Reload sessions and then check again
                  loadSessions().then(() => {
                    // If still not found after reload, navigate home
                    const updatedSession = getSessionById(id || '')
                    if (!updatedSession) {
                      navigate('/')
                    }
                  })
                }} 
                colorScheme="cyan"
              >
                Reload Sessions
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline"
                borderColor="rgba(255, 255, 255, 0.1)"
                color="gray.300"
                _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }}
              >
                Go to Scenarios List
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    )
  }

  // Format quarter for display
  const formatQuarter = (period: string | undefined) => {
    if (!period) return 'Unknown'
    return period.replace('-', ' ')
  }

  // At this point, session must be defined (we've handled all null cases above)
  if (!session) {
    // This should never happen due to early returns, but TypeScript needs this check
    return (
      <Box minH="100vh" bg="#0a0a0f" p={8}>
        <Text color="gray.300">Loading session...</Text>
      </Box>
    )
  }

  // Get planning period (handles both legacy and new field names)
  const planningPeriod = session.planning_period || session.planningPeriod
  const statusBadge = sessionStatusBadgeProps(session.status)

  /** Commit flow (kept for reuse; status menu calls this when choosing Committed) */
  const handleCommitScenario = async () => {
    if (!session?.id) return
    if (items.length === 0) {
      toast({
        title: 'Cannot commit empty scenario',
        description: 'Add at least one roadmap item before committing this scenario.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    await commitSession(session.id, items.length)
    toast({
      title: 'Scenario committed',
      description: `${session.name} is now the committed plan for ${formatQuarter(planningPeriod)}.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  const handleScenarioStatusChange = async (next: PlanningSession['status']) => {
    if (!session?.id || session.status === next) return
    try {
      if (next === 'committed') {
        await handleCommitScenario()
        return
      }
      if (session.status === 'committed' && next === 'draft') {
        await uncommitSession(session.id)
        toast({
          title: 'Scenario uncommitted',
          description: `${session.name} has been uncommitted.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        return
      }
      await updateSession(session.id, { status: next })
      toast({
        title: 'Status updated',
        description: `Scenario is now ${sessionStatusBadgeProps(next).label}.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch {
      toast({
        title: 'Update failed',
        description: 'Could not update scenario status.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Box bg="#0a0a0f" minH="100vh" pb={8}>
      <Box maxW="1400px" mx="auto" px={6} pt={6}>
        {/* Only show error banner if we have data loaded (not on error page) */}
        {/* Error banner should only appear when data loads but there was a warning */}
        {sessionsError && session && (
          <Alert status="warning" bg="#141419" border="1px solid" borderColor="rgba(245, 158, 11, 0.3)" borderRadius="md" mb={4}>
            <AlertIcon color="#f59e0b" />
            <AlertTitle color="white" mr={2}>Warning:</AlertTitle>
            <AlertDescription color="gray.300">{sessionsError}</AlertDescription>
            <Button
              size="sm"
              colorScheme="cyan"
              ml={4}
              onClick={() => {
                loadSessions()
              }}
            >
              Retry Sync
            </Button>
          </Alert>
        )}

        {/* Header Section */}
        <Breadcrumb
          mb={6}
          spacing={2}
          separator={
            <Text color="gray.600" fontSize="sm" px={1}>
              →
            </Text>
          }
        >
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/" color="gray.500" _hover={{ color: 'gray.400' }}>
              Get Started
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/scenarios" color="gray.500" _hover={{ color: 'gray.400' }}>
              Plans
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <Text color="white" fontWeight="medium">
              {session.name?.trim() ? session.name.trim() : 'Unnamed scenario'}
            </Text>
          </BreadcrumbItem>
        </Breadcrumb>

        <Flex justify="space-between" align="flex-start" mb={4} gap={4} flexWrap="wrap" w="full">
          <Box flex="1" minW={0}>
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
                fontSize="2xl"
                fontWeight="bold"
              />
            </Box>
            <Text fontSize="14px" color="gray.400">
              {formatQuarter(planningPeriod)} • {session.ux_designers} UX Designers • {session.content_designers} Content Designers
            </Text>
          </Box>
          <Box flexShrink={0} ml="auto" alignSelf="flex-start">
            <Menu placement="bottom-end" gutter={8}>
              <MenuButton
                as={Button}
                variant="unstyled"
                h="auto"
                borderRadius="full"
                px={3}
                py={1}
                fontSize="xs"
                fontWeight="semibold"
                bg={statusBadge.bg}
                color={statusBadge.color}
                _hover={{ opacity: 0.92 }}
                _active={{ opacity: 0.85 }}
              >
                <HStack spacing={2}>
                  <Box
                    w={2}
                    h={2}
                    borderRadius="full"
                    bg={sessionStatusDotColor(session.status)}
                    flexShrink={0}
                    aria-hidden
                  />
                  <Text as="span">{statusBadge.label}</Text>
                  <ChevronDownIcon w={3} h={3} opacity={0.85} aria-hidden />
                </HStack>
              </MenuButton>
              <MenuList bg="#141419" borderColor="whiteAlpha.200" py={1} zIndex={50} minW="200px">
                {ALL_SCENARIO_STATUSES.map((st) => {
                  const opt = sessionStatusBadgeProps(st)
                  return (
                    <MenuItem
                      key={st}
                      bg={session.status === st ? 'whiteAlpha.100' : 'transparent'}
                      color="gray.100"
                      _hover={{ bg: 'whiteAlpha.100' }}
                      onClick={() => {
                        void handleScenarioStatusChange(st)
                      }}
                    >
                      <HStack spacing={2}>
                        <Box
                          w={2}
                          h={2}
                          borderRadius="full"
                          bg={sessionStatusDotColor(st)}
                          flexShrink={0}
                          aria-hidden
                        />
                        <Text>{opt.label}</Text>
                      </HStack>
                    </MenuItem>
                  )
                })}
              </MenuList>
            </Menu>
          </Box>
        </Flex>

        {/* Capacity Overview Cards */}
        {capacityMetrics && (
          <SimpleGrid w="full" columns={{ base: 1, md: 2 }} gap={4} mb={8}>
            <SessionCapacityCard
              title="UX Design Capacity"
              metrics={capacityMetrics.ux}
              teamSizeControl={
                <EditableNumberCell
                  value={session.ux_designers}
                  onChange={() => {
                    // onChange is called immediately - optimistic update happens in context
                  }}
                  onUpdate={async (newValue) => {
                    if (session.id && newValue !== undefined) {
                      try {
                        await updateSession(session.id, { ux_designers: newValue })
                      } catch (error) {
                        console.error('Failed to update UX designers:', error)
                        toast({
                          title: 'Update failed',
                          description: 'Failed to update team size. Please try again.',
                          status: 'error',
                          duration: 3000,
                          isClosable: true,
                        })
                      }
                    }
                  }}
                  min={0}
                  max={100}
                  step={1}
                  precision={0}
                  color="white"
                />
              }
            />
            <SessionCapacityCard
              title="Content Design Capacity"
              metrics={capacityMetrics.content}
              teamSizeControl={
                <EditableNumberCell
                  value={session.content_designers}
                  onChange={() => {
                    // onChange is called immediately - optimistic update happens in context
                  }}
                  onUpdate={async (newValue) => {
                    if (session.id && newValue !== undefined) {
                      try {
                        await updateSession(session.id, { content_designers: newValue })
                      } catch (error) {
                        console.error('Failed to update content designers:', error)
                        toast({
                          title: 'Update failed',
                          description: 'Failed to update team size. Please try again.',
                          status: 'error',
                          duration: 3000,
                          isClosable: true,
                        })
                      }
                    }
                  }}
                  min={0}
                  max={100}
                  step={1}
                  precision={0}
                  color="white"
                />
              }
            />
          </SimpleGrid>
        )}

        {/* Roadmap Items Table */}
        <Box bg="#141419" borderRadius="md" p={6} border="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
          <Box mb={6}>
            <Heading size="md" fontWeight="bold" color="white">
              Roadmap Items
            </Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              Demand shown in focus weeks
            </Text>
          </Box>

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
            <VStack spacing={4} py={12} align="stretch">
              <Text color="gray.300" fontSize="16px">
                No roadmap items yet. Add items to see capacity calculations.
              </Text>
              <HStack spacing={3} justify="flex-start">
                <Button onClick={onCreateModalOpen} colorScheme="cyan">
                  + Add new item
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
              <Box width="100%" overflowX="auto" sx={{ WebkitOverflowScrolling: 'touch' }}>
                <Table variant="simple" minW="max-content">
                    <Thead>
                      <Tr>
                        <Th
                          color="gray.500"
                          fontSize="xs"
                          fontWeight="600"
                          textTransform="uppercase"
                          letterSpacing="wider"
                          borderBottom="1px solid"
                          borderColor="whiteAlpha.200"
                          py={3}
                          px={3}
                        >
                          Key
                        </Th>
                        <Th
                          color="gray.500"
                          fontSize="xs"
                          fontWeight="600"
                          textTransform="uppercase"
                          letterSpacing="wider"
                          borderBottom="1px solid"
                          borderColor="whiteAlpha.200"
                          py={3}
                          px={3}
                        >
                          Name
                        </Th>
                        <Th
                          color="gray.500"
                          fontSize="xs"
                          fontWeight="600"
                          textTransform="uppercase"
                          letterSpacing="wider"
                          borderBottom="1px solid"
                          borderColor="whiteAlpha.200"
                          py={3}
                          px={3}
                        >
                          Type
                        </Th>
                        <Th
                          color="gray.500"
                          fontSize="xs"
                          fontWeight="600"
                          textTransform="uppercase"
                          letterSpacing="wider"
                          borderBottom="1px solid"
                          borderColor="whiteAlpha.200"
                          py={3}
                          px={3}
                        >
                          Quarter
                        </Th>
                        <Th
                          color="gray.500"
                          fontSize="xs"
                          fontWeight="600"
                          textTransform="uppercase"
                          letterSpacing="wider"
                          borderBottom="1px solid"
                          borderColor="whiteAlpha.200"
                          py={3}
                          px={3}
                        >
                          Priority
                        </Th>
                        <Th
                          color="gray.500"
                          fontSize="xs"
                          fontWeight="600"
                          textTransform="uppercase"
                          letterSpacing="wider"
                          borderBottom="1px solid"
                          borderColor="whiteAlpha.200"
                          py={3}
                          px={3}
                        >
                          UX
                        </Th>
                        <Th
                          color="gray.500"
                          fontSize="xs"
                          fontWeight="600"
                          textTransform="uppercase"
                          letterSpacing="wider"
                          borderBottom="1px solid"
                          borderColor="whiteAlpha.200"
                          py={3}
                          px={3}
                        >
                          Content
                        </Th>
                        <Th
                          color="gray.500"
                          fontSize="xs"
                          fontWeight="600"
                          textTransform="uppercase"
                          letterSpacing="wider"
                          borderBottom="1px solid"
                          borderColor="whiteAlpha.200"
                          py={3}
                          px={3}
                        >
                          Actions
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {items.map((item) => {
                        const pt = item.projectType
                        const TypeIcon = pt ? PROJECT_TYPE_ICONS[pt] : null
                        const pri = priorityPillProps(item.priority)

                        return (
                          <Tr
                            key={item.id}
                            onClick={() => handleRowClick(item.id)}
                            cursor="pointer"
                          >
                            <Td
                              onClick={(e) => e.stopPropagation()}
                              py={3}
                              px={3}
                              borderBottom="1px solid"
                              borderColor="whiteAlpha.100"
                            >
                              <EditableTextCell
                                value={item.short_key}
                                onChange={() => {}}
                                onUpdate={(newValue) => handleUpdateShortKey(item.id, newValue)}
                                validate={validateShortKey}
                                placeholder="Key"
                                color="gray.300"
                              />
                            </Td>
                            <Td
                              onClick={(e) => e.stopPropagation()}
                              py={3}
                              px={3}
                              borderBottom="1px solid"
                              borderColor="whiteAlpha.100"
                            >
                              <EditableTextCell
                                value={item.name}
                                onChange={() => {}}
                                onUpdate={(newValue) => handleUpdateName(item.id, newValue)}
                                placeholder="Name"
                                color="gray.300"
                              />
                            </Td>
                            <Td
                              py={3}
                              px={3}
                              borderBottom="1px solid"
                              borderColor="whiteAlpha.100"
                            >
                              {pt && TypeIcon ? (
                                <HStack spacing={2}>
                                  <TypeIcon boxSize={3} color="gray.400" aria-hidden />
                                  <Text fontSize="sm" color="gray.300">
                                    {PROJECT_TYPE_LABELS[pt]}
                                  </Text>
                                </HStack>
                              ) : (
                                <Text color="gray.500">—</Text>
                              )}
                            </Td>
                            <Td
                              py={3}
                              px={3}
                              borderBottom="1px solid"
                              borderColor="whiteAlpha.100"
                              color="gray.300"
                              fontSize="sm"
                            >
                              {formatQuarterShort(planningPeriod)}
                            </Td>
                            <Td py={3} px={3} borderBottom="1px solid" borderColor="whiteAlpha.100">
                              <Badge
                                borderRadius="full"
                                px={2}
                                py={0.5}
                                fontSize="xs"
                                fontWeight="semibold"
                                bg={pri.bg}
                                color={pri.color}
                                border="1px solid"
                                borderColor={pri.borderColor}
                              >
                                {item.priority}
                              </Badge>
                            </Td>
                            <Td
                              py={3}
                              px={3}
                              borderBottom="1px solid"
                              borderColor="whiteAlpha.100"
                            >
                              {item.uxSizeBand ? (
                                <Text fontWeight={600} fontSize="sm" color="gray.300">
                                  {item.uxSizeBand}
                                </Text>
                              ) : (
                                <Text color="gray.500">—</Text>
                              )}
                            </Td>
                            <Td
                              py={3}
                              px={3}
                              borderBottom="1px solid"
                              borderColor="whiteAlpha.100"
                            >
                              {item.contentSizeBand ? (
                                <Text fontWeight={600} fontSize="sm" color="gray.300">
                                  {item.contentSizeBand}
                                </Text>
                              ) : (
                                <Text color="gray.500">—</Text>
                              )}
                            </Td>
                            <Td
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              py={3}
                              px={3}
                              borderBottom="1px solid"
                              borderColor="whiteAlpha.100"
                            >
                              <HStack spacing={1}>
                                <IconButton
                                  aria-label="Edit item"
                                  icon={<EditIcon />}
                                  variant="ghost"
                                  size="sm"
                                  color="#00d9ff"
                                  _hover={{ color: '#00b8d9', bg: 'rgba(0, 217, 255, 0.1)' }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    handleRowClick(item.id)
                                  }}
                                />
                                <IconButton
                                  aria-label="Remove item"
                                  icon={<DeleteIcon />}
                                  variant="ghost"
                                  size="sm"
                                  color="#ef4444"
                                  _hover={{ bg: 'rgba(239, 68, 68, 0.15)' }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    e.preventDefault()
                                    handleRemoveClick(e, item.id, item.name)
                                  }}
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        )
                      })}
                    </Tbody>
                </Table>
              </Box>

              <HStack mt={6} spacing={3} justify="flex-start">
                <Button colorScheme="cyan" onClick={onCreateModalOpen}>
                  + Add new item
                </Button>
                <Button
                  variant="outline"
                  borderColor="rgba(255, 255, 255, 0.1)"
                  color="gray.300"
                  onClick={onPasteModalOpen}
                  _hover={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'white',
                    bg: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  Paste from table
                </Button>
              </HStack>
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
      <AddRoadmapItemModal
        isOpen={isCreateModalOpen}
        onClose={onCreateModalClose}
        onSubmit={handleCreateItem}
        isSubmitting={isCreating}
      />

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
