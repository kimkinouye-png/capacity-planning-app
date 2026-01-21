import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  HStack,
  VStack,
  IconButton,
  Divider,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlanningSessions } from '../context/PlanningSessionsContext'
import { useRoadmapItems } from '../context/RoadmapItemsContext'
import { useToast } from '@chakra-ui/react'
import { getWeeksForPeriod } from '../config/quarterConfig'
import type { PlanningPeriod, PlanningSession } from '../domain/types'

const QUARTERS: PlanningPeriod[] = ['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4']

interface ScenarioMetrics {
  session: PlanningSession
  uxCapacity: number
  uxDemand: number
  uxBalance: number
  contentCapacity: number
  contentDemand: number
  contentBalance: number
  itemCount: number
}

function QuarterlyCapacityPage() {
  const navigate = useNavigate()
  const { sessions, commitSession, error: sessionsError } = usePlanningSessions()
  const { getItemsForSession } = useRoadmapItems()
  const toast = useToast()
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null)

  // Calculate metrics for each scenario
  const scenarioMetrics = useMemo((): ScenarioMetrics[] => {
    return sessions.map((session) => {
      const items = getItemsForSession(session.id)
      const weeks = getWeeksForPeriod(session.planningPeriod || session.planning_period)
      
      // Calculate capacity
      const uxCapacity = (session.ux_designers || 0) * weeks
      const contentCapacity = (session.content_designers || 0) * weeks

      // Calculate demand
      const uxDemand = items.reduce((sum, item) => {
        return sum + (item.uxFocusWeeks || 0)
      }, 0)

      const contentDemand = items.reduce((sum, item) => {
        return sum + (item.contentFocusWeeks || 0)
      }, 0)

      // Calculate balance
      const uxBalance = uxCapacity - uxDemand
      const contentBalance = contentCapacity - contentDemand

      return {
        session,
        uxCapacity,
        uxDemand,
        uxBalance,
        contentCapacity,
        contentDemand,
        contentBalance,
        itemCount: items.length,
      }
    })
  }, [sessions, getItemsForSession])

  // Calculate 2026 totals across all scenarios
  const totals = useMemo(() => {
    return scenarioMetrics.reduce(
      (acc, metrics) => ({
        uxCapacity: acc.uxCapacity + metrics.uxCapacity,
        uxDemand: acc.uxDemand + metrics.uxDemand,
        uxBalance: acc.uxBalance + metrics.uxBalance,
        contentCapacity: acc.contentCapacity + metrics.contentCapacity,
        contentDemand: acc.contentDemand + metrics.contentDemand,
        contentBalance: acc.contentBalance + metrics.contentBalance,
      }),
      {
        uxCapacity: 0,
        uxDemand: 0,
        uxBalance: 0,
        contentCapacity: 0,
        contentDemand: 0,
        contentBalance: 0,
      }
    )
  }, [scenarioMetrics])

  // Group scenarios by quarter and sort within each quarter
  const scenariosByQuarter = useMemo(() => {
    const grouped: Record<PlanningPeriod, ScenarioMetrics[]> = {
      '2026-Q1': [],
      '2026-Q2': [],
      '2026-Q3': [],
      '2026-Q4': [],
    }

    scenarioMetrics.forEach((metrics) => {
      const quarter = metrics.session.planningPeriod || metrics.session.planning_period as PlanningPeriod
      if (quarter && grouped[quarter]) {
        grouped[quarter].push(metrics)
      }
    })

    // Sort scenarios within each quarter: committed first, then by title
    Object.keys(grouped).forEach((quarter) => {
      grouped[quarter as PlanningPeriod].sort((a, b) => {
        // First: sort by status (committed first)
        const statusOrderA = a.session.status === 'committed' ? 0 : 1
        const statusOrderB = b.session.status === 'committed' ? 0 : 1
        const statusDiff = statusOrderA - statusOrderB
        if (statusDiff !== 0) return statusDiff

        // Second: sort by title alphabetically (case-insensitive)
        const nameA = (a.session.name || '').toLowerCase()
        const nameB = (b.session.name || '').toLowerCase()
        return nameA.localeCompare(nameB)
      })
    })

    return grouped
  }, [scenarioMetrics])

  // Format quarter for display
  const formatQuarter = (quarter: PlanningPeriod) => {
    return quarter.replace('-', ' ')
  }

  return (
    <Box bg="#F9FAFB" minH="100vh" pb={8}>
      <Box maxW="1400px" mx="auto" px={6} pt={6}>
        {/* Error message for PlanningSessionsContext */}
        {sessionsError && (
          <Alert status="warning" bg="#141419" border="1px solid" borderColor="rgba(245, 158, 11, 0.3)" borderRadius="md" mb={4}>
            <AlertIcon color="#f59e0b" />
            <AlertTitle color="white" mr={2}>Session Error:</AlertTitle>
            <AlertDescription color="gray.300">{sessionsError}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <HStack spacing={4} mb={6} align="center">
          <IconButton
            aria-label="Back to home"
            icon={<ChevronLeftIcon />}
            variant="ghost"
            onClick={() => navigate('/')}
          />
          <Box>
            <Heading size="xl" mb={1} fontWeight="bold">
              Quarterly Capacity
            </Heading>
            <Text fontSize="14px" color="gray.600">
              Year-at-a-glance capacity overview across all scenarios
            </Text>
          </Box>
        </HStack>

        {/* 2026 Totals Section */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={12}>
          {/* UX Design Totals Card */}
          <Card bg="white" border="1px solid" borderColor="gray.200" boxShadow="sm">
            <CardBody p={6}>
              <Heading size="sm" mb={4} fontWeight="bold">
                UX Design
              </Heading>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="12px" color="gray.600" fontWeight="medium" mb={1}>
                    Total Capacity
                  </Text>
                  <Text fontSize="20px" fontWeight="bold" color="gray.900">
                    {totals.uxCapacity.toFixed(1)} focus weeks
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="12px" color="gray.600" fontWeight="medium" mb={1}>
                    Total Demand
                  </Text>
                  <Text fontSize="20px" fontWeight="bold" color="gray.900">
                    {totals.uxDemand.toFixed(1)} focus weeks
                  </Text>
                </Box>
                <Box
                  pt={4}
                  borderTop="1px solid"
                  borderColor={totals.uxBalance >= 0 ? 'green.300' : 'red.300'}
                >
                  <HStack spacing={2}>
                    <Text fontSize="18px" color={totals.uxBalance >= 0 ? '#10B981' : '#EF4444'}>
                      {totals.uxBalance >= 0 ? '↑' : '↓'}
                    </Text>
                    <Text
                      fontSize="20px"
                      fontWeight="bold"
                      color={totals.uxBalance >= 0 ? '#10B981' : '#EF4444'}
                    >
                      {totals.uxBalance >= 0 ? '+' : ''}
                      {totals.uxBalance.toFixed(1)}
                    </Text>
                  </HStack>
                  <Text fontSize="12px" color="gray.600" mt={1}>
                    Balance
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* Content Design Totals Card */}
          <Card bg="white" border="1px solid" borderColor="gray.200" boxShadow="sm">
            <CardBody p={6}>
              <Heading size="sm" mb={4} fontWeight="bold">
                Content Design
              </Heading>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="12px" color="gray.600" fontWeight="medium" mb={1}>
                    Total Capacity
                  </Text>
                  <Text fontSize="20px" fontWeight="bold" color="gray.900">
                    {totals.contentCapacity.toFixed(1)} focus weeks
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="12px" color="gray.600" fontWeight="medium" mb={1}>
                    Total Demand
                  </Text>
                  <Text fontSize="20px" fontWeight="bold" color="gray.900">
                    {totals.contentDemand.toFixed(1)} focus weeks
                  </Text>
                </Box>
                <Box
                  pt={4}
                  borderTop="1px solid"
                  borderColor={totals.contentBalance >= 0 ? 'green.300' : 'red.300'}
                >
                  <HStack spacing={2}>
                    <Text fontSize="18px" color={totals.contentBalance >= 0 ? '#10B981' : '#EF4444'}>
                      {totals.contentBalance >= 0 ? '↑' : '↓'}
                    </Text>
                    <Text
                      fontSize="20px"
                      fontWeight="bold"
                      color={totals.contentBalance >= 0 ? '#10B981' : '#EF4444'}
                    >
                      {totals.contentBalance >= 0 ? '+' : ''}
                      {totals.contentBalance.toFixed(1)}
                    </Text>
                  </HStack>
                  <Text fontSize="12px" color="gray.600" mt={1}>
                    Balance
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Quarterly Breakdown Section */}
        <Box>
          <Heading size="lg" mb={6} fontWeight="bold">
            Quarterly Breakdown
          </Heading>

          {QUARTERS.map((quarter, index) => {
            const scenarios = scenariosByQuarter[quarter]

            return (
              <Box key={quarter} mb={8}>
                {/* Quarter Heading */}
                <Heading size="md" mb={4} fontWeight="bold" fontSize="20px">
                  {formatQuarter(quarter)}
                </Heading>

                {scenarios.length === 0 ? (
                  // Empty Quarter
                  <Text color="gray.500" fontSize="14px" fontStyle="italic">
                    No scenarios planned for this quarter
                  </Text>
                ) : (
                  // Scenario Cards
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {scenarios.map((metrics) => {
                      const isWithinCapacity = metrics.uxBalance >= 0 && metrics.contentBalance >= 0

                      return (
                        <Card
                          key={metrics.session.id}
                          ref={(el) => {
                            cardRefs.current[metrics.session.id] = el
                          }}
                          bg={
                            highlightedCardId === metrics.session.id 
                              ? 'blue.50' 
                              : metrics.session.status === 'committed' 
                                ? 'green.50' 
                                : 'white'
                          }
                          border={highlightedCardId === metrics.session.id ? '2px solid' : '1px solid'}
                          borderColor={
                            highlightedCardId === metrics.session.id 
                              ? 'blue.300' 
                              : metrics.session.status === 'committed' 
                                ? 'green.200' 
                                : 'gray.200'
                          }
                          boxShadow="sm"
                          cursor="pointer"
                          _hover={{
                            boxShadow: 'md',
                            borderColor: metrics.session.status === 'committed' ? 'green.300' : 'blue.300',
                          }}
                          onClick={() => navigate(`/sessions/${metrics.session.id}`)}
                        >
                          <CardBody p={5}>
                            {/* Scenario Header */}
                            <HStack justify="space-between" align="center" mb={3}>
                              <HStack spacing={3} align="center" flex={1}>
                                <Heading size="sm" fontWeight="bold">
                                  {metrics.session.name}
                                </Heading>
                                <HStack spacing={1.5} align="center">
                                  <Box
                                    w={2}
                                    h={2}
                                    borderRadius="full"
                                    bg={isWithinCapacity ? 'green.500' : 'orange.500'}
                                  />
                                  <Text fontSize="sm" color="gray.600" fontWeight="medium">
                                    {isWithinCapacity ? 'Within' : 'Over'}
                                  </Text>
                                </HStack>
                              </HStack>
                              <HStack spacing={2} align="center">
                                {metrics.itemCount === 0 && metrics.session.status === 'draft' ? (
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
                                    onClick={async (e) => {
                                      e.stopPropagation()
                                      if (metrics.session.id && metrics.itemCount > 0) {
                                        await commitSession(metrics.session.id, metrics.itemCount)
                                        
                                        // Show toast notification
                                        toast({
                                          title: metrics.session.status === 'committed' ? 'Scenario uncommitted' : 'Scenario committed',
                                          description: `${metrics.session.name} has been ${metrics.session.status === 'committed' ? 'uncommitted' : 'set as the committed plan'}.`,
                                          status: 'success',
                                          duration: 3000,
                                          isClosable: true,
                                        })
                                        
                                        // Highlight the card briefly
                                        setHighlightedCardId(metrics.session.id)
                                        setTimeout(() => setHighlightedCardId(null), 2000)
                                        
                                        // Scroll card into view if needed
                                        const cardElement = cardRefs.current[metrics.session.id]
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
                                      borderColor={metrics.session.status === 'committed' ? 'blue.500' : 'gray.300'}
                                      bg={metrics.session.status === 'committed' ? 'blue.500' : 'transparent'}
                                      display="flex"
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      {metrics.session.status === 'committed' && (
                                        <Box
                                          w={2}
                                          h={2}
                                          borderRadius="full"
                                          bg="white"
                                        />
                                      )}
                                    </Box>
                                    <Text fontSize="sm" color="gray.700" fontWeight="medium">
                                      {metrics.session.status === 'committed' ? 'Committed plan' : 'Commit as plan'}
                                    </Text>
                                  </HStack>
                                )}
                              </HStack>
                            </HStack>

                            {/* Meta Line */}
                            <Text fontSize="12px" color="gray.600" mb={4}>
                              {metrics.session.ux_designers} UX Designers • {metrics.session.content_designers} Content Designers • {metrics.itemCount} roadmap items
                            </Text>

                            <Divider mb={4} />

                            {/* Two-Column Layout */}
                            <SimpleGrid columns={2} spacing={4}>
                              {/* Left Column - UX Design */}
                              <Box>
                                <Text fontSize="11px" color="gray.600" fontWeight="medium" mb={2}>
                                  UX Design
                                </Text>
                                <VStack spacing={2} align="stretch">
                                  <Box>
                                    <Text fontSize="10px" color="gray.500" mb={0.5}>
                                      Capacity
                                    </Text>
                                    <Text fontSize="14px" fontWeight="600" color="gray.900">
                                      {metrics.uxCapacity.toFixed(1)} weeks
                                    </Text>
                                  </Box>
                                  <Box>
                                    <Text fontSize="10px" color="gray.500" mb={0.5}>
                                      Demand
                                    </Text>
                                    <Text fontSize="14px" fontWeight="600" color="gray.900">
                                      {metrics.uxDemand.toFixed(1)} weeks
                                    </Text>
                                  </Box>
                                  <Box>
                                    <Text fontSize="10px" color="gray.500" mb={0.5}>
                                      Balance
                                    </Text>
                                    <HStack spacing={1}>
                                      <Text fontSize="12px" color={metrics.uxBalance >= 0 ? '#10B981' : '#EF4444'}>
                                        {metrics.uxBalance >= 0 ? '↑' : '↓'}
                                      </Text>
                                      <Text
                                        fontSize="14px"
                                        fontWeight="600"
                                        color={metrics.uxBalance >= 0 ? '#10B981' : '#EF4444'}
                                      >
                                        {metrics.uxBalance >= 0 ? '+' : ''}
                                        {metrics.uxBalance.toFixed(1)}
                                      </Text>
                                    </HStack>
                                  </Box>
                                </VStack>
                              </Box>

                              {/* Right Column - Content Design */}
                              <Box>
                                <Text fontSize="11px" color="gray.600" fontWeight="medium" mb={2}>
                                  Content Design
                                </Text>
                                <VStack spacing={2} align="stretch">
                                  <Box>
                                    <Text fontSize="10px" color="gray.500" mb={0.5}>
                                      Capacity
                                    </Text>
                                    <Text fontSize="14px" fontWeight="600" color="gray.900">
                                      {metrics.contentCapacity.toFixed(1)} weeks
                                    </Text>
                                  </Box>
                                  <Box>
                                    <Text fontSize="10px" color="gray.500" mb={0.5}>
                                      Demand
                                    </Text>
                                    <Text fontSize="14px" fontWeight="600" color="gray.900">
                                      {metrics.contentDemand.toFixed(1)} weeks
                                    </Text>
                                  </Box>
                                  <Box>
                                    <Text fontSize="10px" color="gray.500" mb={0.5}>
                                      Balance
                                    </Text>
                                    <HStack spacing={1}>
                                      <Text fontSize="12px" color={metrics.contentBalance >= 0 ? '#10B981' : '#EF4444'}>
                                        {metrics.contentBalance >= 0 ? '↑' : '↓'}
                                      </Text>
                                      <Text
                                        fontSize="14px"
                                        fontWeight="600"
                                        color={metrics.contentBalance >= 0 ? '#10B981' : '#EF4444'}
                                      >
                                        {metrics.contentBalance >= 0 ? '+' : ''}
                                        {metrics.contentBalance.toFixed(1)}
                                      </Text>
                                    </HStack>
                                  </Box>
                                </VStack>
                              </Box>
                            </SimpleGrid>
                          </CardBody>
                        </Card>
                      )
                    })}
                  </SimpleGrid>
                )}

                {/* Divider between quarters (except last) */}
                {index < QUARTERS.length - 1 && (
                  <Divider mt={8} borderColor="gray.300" />
                )}
              </Box>
            )
          })}
        </Box>

        {/* Future Enhancement Placeholder */}
        {/* Future: Add scenario comparison multi-select feature here */}
      </Box>
    </Box>
  )
}

export default QuarterlyCapacityPage
