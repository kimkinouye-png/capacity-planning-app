import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  HStack,
  VStack,
  Badge,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlanningSessions } from '../context/PlanningSessionsContext'
import { useRoadmapItems } from '../context/RoadmapItemsContext'
import { getWeeksForPeriod } from '../config/quarterConfig'
import type { PlanningPeriod } from '../domain/types'
import { CalendarIcon, ViewIcon } from '@chakra-ui/icons'

// const QUARTERS: PlanningPeriod[] = ['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4']

// interface QuarterData {
//   quarter: PlanningPeriod
//   uxCapacity: number
//   uxDemand: number
//   contentCapacity: number
//   contentDemand: number
//   items: Array<{
//     item: any
//     sessionName: string
//     quarter: PlanningPeriod
//   }>
// }

export default function CommittedPlanPage() {
  const navigate = useNavigate()
  const { sessions } = usePlanningSessions()
  const { getItemsForSession } = useRoadmapItems()

  // Get only committed scenarios
  const committedSessions = useMemo(() => {
    return sessions.filter((s) => s.status === 'committed' || s.isCommitted)
  }, [sessions])

  // Calculate aggregate metrics across all committed scenarios
  const aggregateMetrics = useMemo(() => {
    let totalUxCapacity = 0
    let totalUxDemand = 0
    let totalContentCapacity = 0
    let totalContentDemand = 0
    let totalUxDesigners = 0
    let totalContentDesigners = 0

    committedSessions.forEach((session) => {
      const items = getItemsForSession(session.id)
      const weeks = getWeeksForPeriod(session.planningPeriod || session.planning_period)
      const uxDesigners = session.ux_designers || 0
      const contentDesigners = session.content_designers || 0

      totalUxDesigners += uxDesigners
      totalContentDesigners += contentDesigners

      const uxCapacity = uxDesigners * weeks
      const contentCapacity = contentDesigners * weeks

      const uxDemand = items.reduce((sum, item) => sum + (item.uxFocusWeeks || 0), 0)
      const contentDemand = items.reduce((sum, item) => sum + (item.contentFocusWeeks || 0), 0)

      totalUxCapacity += uxCapacity
      totalUxDemand += uxDemand
      totalContentCapacity += contentCapacity
      totalContentDemand += contentDemand
    })

    const uxUtilization = totalUxCapacity > 0 ? (totalUxDemand / totalUxCapacity) * 100 : 0
    const contentUtilization = totalContentCapacity > 0 ? (totalContentDemand / totalContentCapacity) * 100 : 0

    return {
      uxCapacity: totalUxCapacity,
      uxDemand: totalUxDemand,
      uxUtilization,
      uxDesigners: totalUxDesigners,
      contentCapacity: totalContentCapacity,
      contentDemand: totalContentDemand,
      contentUtilization,
      contentDesigners: totalContentDesigners,
    }
  }, [committedSessions, getItemsForSession])

  // Group data by quarter (for future chart implementation)
  // const quarterlyData = useMemo((): QuarterData[] => {
  //   const quarterMap = new Map<PlanningPeriod, QuarterData>()
  //
  //   // Initialize all quarters
  //   QUARTERS.forEach((quarter) => {
  //     quarterMap.set(quarter, {
  //       quarter,
  //       uxCapacity: 0,
  //       uxDemand: 0,
  //       contentCapacity: 0,
  //       contentDemand: 0,
  //       items: [],
  //     })
  //   })
  //
  //   // Aggregate data from committed sessions
  //   committedSessions.forEach((session) => {
  //     const period = (session.planningPeriod || session.planning_period) as PlanningPeriod
  //     if (!period || !QUARTERS.includes(period)) return
  //
  //     const items = getItemsForSession(session.id)
  //     const weeks = getWeeksForPeriod(period)
  //     const uxDesigners = session.ux_designers || 0
  //     const contentDesigners = session.content_designers || 0
  //
  //     const quarterData = quarterMap.get(period)!
  //     quarterData.uxCapacity += uxDesigners * weeks
  //     quarterData.contentCapacity += contentDesigners * weeks
  //
  //     items.forEach((item) => {
  //       quarterData.uxDemand += item.uxFocusWeeks || 0
  //       quarterData.contentDemand += item.contentFocusWeeks || 0
  //       quarterData.items.push({
  //         item,
  //         sessionName: session.name,
  //         quarter: period,
  //       })
  //     })
  //   })
  //
  //   return Array.from(quarterMap.values())
  // }, [committedSessions, getItemsForSession])

  // Get all items from committed scenarios for the table
  const allItems = useMemo(() => {
    const items: Array<{
      item: any
      sessionName: string
      quarter: PlanningPeriod | string
    }> = []

    committedSessions.forEach((session) => {
      const sessionItems = getItemsForSession(session.id)
      const period = (session.planningPeriod || session.planning_period) as PlanningPeriod
      sessionItems.forEach((item) => {
        items.push({
          item,
          sessionName: session.name,
          quarter: period || 'Unknown',
        })
      })
    })

    // Sort by quarter, then by priority
    return items.sort((a, b) => {
      const quarterA = a.quarter.toString()
      const quarterB = b.quarter.toString()
      if (quarterA !== quarterB) {
        return quarterA.localeCompare(quarterB)
      }
      return (a.item.priority || 999) - (b.item.priority || 999)
    })
  }, [committedSessions, getItemsForSession])

  // Format priority badge
  const getPriorityBadge = (priority: number | undefined) => {
    if (priority === undefined || priority === null) return null
    const p = priority.toString()
    const colorScheme =
      p === '0' || p === 'P0'
        ? { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.5)' }
        : p === '1' || p === 'P1'
        ? { bg: 'rgba(249, 115, 22, 0.1)', color: '#f97316', borderColor: 'rgba(249, 115, 22, 0.5)' }
        : p === '2' || p === 'P2'
        ? { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.5)' }
        : { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.5)' }

    return (
      <Badge
        bg={colorScheme.bg}
        color={colorScheme.color}
        border="1px solid"
        borderColor={colorScheme.borderColor}
        px={2.5}
        py={0.5}
        borderRadius="full"
        fontSize="xs"
        fontWeight="500"
      >
        P{priority}
      </Badge>
    )
  }

  // Get capacity status badge
  const getCapacityBadge = (utilization: number) => {
    if (utilization < 80) {
      return (
        <Badge
          bg="rgba(16, 185, 129, 0.1)"
          color="#10b981"
          border="1px solid"
          borderColor="rgba(16, 185, 129, 0.5)"
          px={2.5}
          py={0.5}
          borderRadius="full"
          fontSize="xs"
          fontWeight="500"
        >
          Surplus
        </Badge>
      )
    } else if (utilization <= 100) {
      return (
        <Badge
          bg="rgba(245, 158, 11, 0.1)"
          color="#f59e0b"
          border="1px solid"
          borderColor="rgba(245, 158, 11, 0.5)"
          px={2.5}
          py={0.5}
          borderRadius="full"
          fontSize="xs"
          fontWeight="500"
        >
          Near Capacity
        </Badge>
      )
    } else {
      return (
        <Badge
          bg="rgba(239, 68, 68, 0.1)"
          color="#ef4444"
          border="1px solid"
          borderColor="rgba(239, 68, 68, 0.5)"
          px={2.5}
          py={0.5}
          borderRadius="full"
          fontSize="xs"
          fontWeight="500"
        >
          Over Capacity
        </Badge>
      )
    }
  }

  // Format quarter badge
  const getQuarterBadge = (quarter: PlanningPeriod | string) => {
    return (
      <Badge
        bg="rgba(0, 217, 255, 0.1)"
        color="#00d9ff"
        border="1px solid"
        borderColor="rgba(0, 217, 255, 0.5)"
        px={2.5}
        py={0.5}
        borderRadius="full"
        fontSize="xs"
        fontWeight="500"
      >
        {quarter}
      </Badge>
    )
  }

  if (committedSessions.length === 0) {
    return (
      <Box minH="100vh" bg="#0a0a0f">
        <Box maxW="1280px" mx="auto" px={6} py={8}>
          <Box mb={8}>
            <Heading size="lg" color="white" mb={2}>
              Committed Plan
            </Heading>
            <Text fontSize="sm" color="gray.400">
              View your committed scenarios and quarterly capacity overview
            </Text>
          </Box>
          <Box
            bg="#141419"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            borderRadius="md"
            p={8}
            textAlign="center"
          >
            <Text color="gray.300" fontSize="lg" mb={2}>
              No committed scenarios yet
            </Text>
            <Text color="gray.400" fontSize="sm">
              Commit a scenario from the Scenarios page to see it here.
            </Text>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="#0a0a0f">
      <Box maxW="1280px" mx="auto" px={6} py={8}>
        {/* Page Header */}
        <Box mb={6}>
          <Heading size="lg" color="white" mb={2}>
            Committed Plan
          </Heading>
          <Text fontSize="sm" color="gray.400">
            View your committed scenarios and quarterly capacity overview
          </Text>
        </Box>

        {/* Aggregate Overview */}
        <Box mb={8}>
          <HStack spacing={2} mb={4}>
            <ViewIcon w={5} h={5} color="#00d9ff" />
            <Heading size="md" color="white">
              2026 Capacity Overview
            </Heading>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            {/* UX Design Capacity */}
            <Box
              bg="#141419"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              borderRadius="md"
              p={6}
            >
              <Text fontSize="sm" color="gray.400" fontWeight="500" mb={1}>
                UX Design Capacity
              </Text>
              <HStack spacing={1} align="baseline" mb={2}>
                <Text fontSize="3xl" fontWeight="bold" color="white">
                  {aggregateMetrics.uxCapacity.toFixed(0)}
                </Text>
                <Text fontSize="sm" color="gray.400" fontWeight="normal">
                  weeks
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.500">
                {aggregateMetrics.uxDesigners} designers
              </Text>
            </Box>

            {/* UX Design Demand */}
            <Box
              bg="#141419"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              borderRadius="md"
              p={6}
            >
              <Text fontSize="sm" color="gray.400" fontWeight="500" mb={1}>
                UX Design Demand
              </Text>
              <HStack spacing={1} align="baseline" mb={2}>
                <Text fontSize="3xl" fontWeight="bold" color="white">
                  {aggregateMetrics.uxDemand.toFixed(0)}
                </Text>
                <Text fontSize="sm" color="gray.400" fontWeight="normal">
                  weeks
                </Text>
              </HStack>
              <HStack spacing={2} justify="space-between" mt={2}>
                {getCapacityBadge(aggregateMetrics.uxUtilization)}
                <Text fontSize="xs" color="gray.500">
                  {aggregateMetrics.uxUtilization.toFixed(0)}%
                </Text>
              </HStack>
            </Box>

            {/* Content Design Capacity */}
            <Box
              bg="#141419"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              borderRadius="md"
              p={6}
            >
              <Text fontSize="sm" color="gray.400" fontWeight="500" mb={1}>
                Content Design Capacity
              </Text>
              <HStack spacing={1} align="baseline" mb={2}>
                <Text fontSize="3xl" fontWeight="bold" color="white">
                  {aggregateMetrics.contentCapacity.toFixed(0)}
                </Text>
                <Text fontSize="sm" color="gray.400" fontWeight="normal">
                  weeks
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.500">
                {aggregateMetrics.contentDesigners} designers
              </Text>
            </Box>

            {/* Content Design Demand */}
            <Box
              bg="#141419"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              borderRadius="md"
              p={6}
            >
              <Text fontSize="sm" color="gray.400" fontWeight="500" mb={1}>
                Content Design Demand
              </Text>
              <HStack spacing={1} align="baseline" mb={2}>
                <Text fontSize="3xl" fontWeight="bold" color="white">
                  {aggregateMetrics.contentDemand.toFixed(0)}
                </Text>
                <Text fontSize="sm" color="gray.400" fontWeight="normal">
                  weeks
                </Text>
              </HStack>
              <HStack spacing={2} justify="space-between" mt={2}>
                {getCapacityBadge(aggregateMetrics.contentUtilization)}
                <Text fontSize="xs" color="gray.500">
                  {aggregateMetrics.contentUtilization.toFixed(0)}%
                </Text>
              </HStack>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Quarterly Gantt Chart */}
        <Box mb={8}>
          <HStack spacing={2} mb={4}>
            <CalendarIcon w={5} h={5} color="#00d9ff" />
            <Heading size="md" color="white">
              Quarterly Breakdown
            </Heading>
          </HStack>
          <Box
            bg="#141419"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            borderRadius="md"
            p={6}
          >
            <Box h="400px" display="flex" alignItems="center" justifyContent="center">
              <VStack spacing={4}>
                <Text color="gray.400" fontSize="sm">
                  Chart visualization coming soon
                </Text>
                <Text color="gray.500" fontSize="xs">
                  Install chart.js and react-chartjs-2 to enable the quarterly breakdown chart
                </Text>
              </VStack>
            </Box>
            {/* Chart Legend */}
            <HStack spacing={6} justify="center" mt={4}>
              <HStack spacing={2}>
                <Box w={3} h={3} borderRadius="full" bg="#10b981" />
                <Text fontSize="xs" color="gray.400">
                  Under 80% (Surplus)
                </Text>
              </HStack>
              <HStack spacing={2}>
                <Box w={3} h={3} borderRadius="full" bg="#f59e0b" />
                <Text fontSize="xs" color="gray.400">
                  80-100% (Near Capacity)
                </Text>
              </HStack>
              <HStack spacing={2}>
                <Box w={3} h={3} borderRadius="full" bg="#ef4444" />
                <Text fontSize="xs" color="gray.400">
                  Over 100% (Over Capacity)
                </Text>
              </HStack>
            </HStack>
          </Box>
        </Box>

        {/* All Roadmap Items Table */}
        <Box mb={8}>
          <Heading size="md" color="white" mb={4}>
            All Roadmap Items
          </Heading>
          {allItems.length === 0 ? (
            <Box
              bg="#141419"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              borderRadius="md"
              p={8}
              textAlign="center"
            >
              <Text color="gray.400" fontSize="sm">
                No roadmap items in committed scenarios
              </Text>
            </Box>
          ) : (
            <>
              <TableContainer
                bg="#141419"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.1)"
                borderRadius="md"
                overflow="hidden"
              >
                <Table>
                  <Thead bg="#1a1a20" borderBottom="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
                    <Tr>
                      <Th color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                        Quarter
                      </Th>
                      <Th color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                        Item Name
                      </Th>
                      <Th color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                        Scenario
                      </Th>
                      <Th color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                        Initiative
                      </Th>
                      <Th color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">
                        Priority
                      </Th>
                      <Th color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider" textAlign="right">
                        UX Effort
                      </Th>
                      <Th color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider" textAlign="right">
                        Content Effort
                      </Th>
                      <Th color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider" textAlign="right">
                        Total Effort
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {allItems.map(({ item, sessionName, quarter }) => {
                      const uxEffort = item.uxFocusWeeks || 0
                      const contentEffort = item.contentFocusWeeks || 0
                      const totalEffort = uxEffort + contentEffort

                      return (
                        <Tr
                          key={item.id}
                          borderBottom="1px solid"
                          borderColor="rgba(255, 255, 255, 0.05)"
                          _hover={{ bg: 'rgba(255, 255, 255, 0.05)', cursor: 'pointer' }}
                          onClick={() => {
                            const session = committedSessions.find((s) => s.id === item.planning_session_id)
                            if (session) {
                              navigate(`/sessions/${session.id}/items/${item.id}`)
                            }
                          }}
                        >
                          <Td>{getQuarterBadge(quarter)}</Td>
                          <Td fontWeight="500" color="white">
                            {item.name}
                          </Td>
                          <Td color="gray.400">{sessionName}</Td>
                          <Td color="gray.400">{item.initiative || '—'}</Td>
                          <Td>{getPriorityBadge(item.priority)}</Td>
                          <Td textAlign="right" color="gray.400">
                            {uxEffort > 0 ? `${uxEffort.toFixed(1)}w` : '—'}
                          </Td>
                          <Td textAlign="right" color="gray.400">
                            {contentEffort > 0 ? `${contentEffort.toFixed(1)}w` : '—'}
                          </Td>
                          <Td textAlign="right" fontWeight="600" color="white">
                            {totalEffort > 0 ? `${totalEffort.toFixed(1)}w` : '—'}
                          </Td>
                        </Tr>
                      )
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
              <Text fontSize="sm" color="gray.400" textAlign="center" mt={3}>
                Showing {allItems.length} of {allItems.length} total items
              </Text>
            </>
          )}
        </Box>
      </Box>
    </Box>
  )
}
