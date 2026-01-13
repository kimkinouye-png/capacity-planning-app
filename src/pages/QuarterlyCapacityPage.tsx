import {
  Box,
  Heading,
  Stack,
  Text,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  HStack,
  VStack,
  IconButton,
  Divider,
} from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlanningSessions } from '../context/PlanningSessionsContext'
import { useRoadmapItems } from '../context/RoadmapItemsContext'
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
  const { sessions } = usePlanningSessions()
  const { getItemsForSession } = useRoadmapItems()

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

  // Group scenarios by quarter
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

    return grouped
  }, [scenarioMetrics])

  // Format quarter for display
  const formatQuarter = (quarter: PlanningPeriod) => {
    return quarter.replace('-', ' ')
  }

  return (
    <Box bg="#F9FAFB" minH="100vh" pb={8}>
      <Box maxW="1400px" mx="auto" px={6} pt={6}>
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
                          bg="white"
                          border="1px solid"
                          borderColor="gray.200"
                          boxShadow="sm"
                          cursor="pointer"
                          _hover={{
                            boxShadow: 'md',
                            borderColor: 'blue.300',
                          }}
                          onClick={() => navigate(`/sessions/${metrics.session.id}`)}
                        >
                          <CardBody p={5}>
                            {/* Scenario Header */}
                            <HStack justify="space-between" align="start" mb={3}>
                              <Heading size="sm" fontWeight="bold" flex={1}>
                                {metrics.session.name}
                              </Heading>
                              <Badge
                                bg={isWithinCapacity ? '#D1FAE5' : '#FEE2E2'}
                                color={isWithinCapacity ? '#065F46' : '#991B1B'}
                                borderRadius="full"
                                px={3}
                                py={1}
                                fontSize="11px"
                                fontWeight="600"
                              >
                                {isWithinCapacity ? 'Within capacity' : 'Over capacity'}
                              </Badge>
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
