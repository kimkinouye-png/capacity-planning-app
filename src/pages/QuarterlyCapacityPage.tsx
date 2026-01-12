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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Card,
  CardBody,
  HStack,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import { usePlanningSessions } from '../context/PlanningSessionsContext'
import { useRoadmapItems } from '../context/RoadmapItemsContext'
import { getWeeksForPeriod } from '../config/quarterConfig'
import type { PlanningPeriod } from '../domain/types'

const QUARTERS: PlanningPeriod[] = ['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4']

interface QuarterlyMetrics {
  quarter: PlanningPeriod
  uxCapacity: number
  uxDemand: number
  uxSurplusDeficit: number
  contentCapacity: number
  contentDemand: number
  contentSurplusDeficit: number
}

function QuarterlyCapacityPage() {
  const { sessions } = usePlanningSessions()
  const { getItemsForSession } = useRoadmapItems()

  // Calculate quarterly aggregates
  const quarterlyMetrics = useMemo((): QuarterlyMetrics[] => {
    return QUARTERS.map((quarter) => {
      // Find all scenarios for this quarter
      const scenariosForQuarter = sessions.filter(
        (session) => session.planningPeriod === quarter
      )

      // Calculate capacity (sum of all scenarios' designer counts × weeks)
      let uxCapacity = 0
      let contentCapacity = 0

      scenariosForQuarter.forEach((scenario) => {
        const weeks = getWeeksForPeriod(scenario.planningPeriod || quarter)
        uxCapacity += (scenario.ux_designers || 0) * weeks
        contentCapacity += (scenario.content_designers || 0) * weeks
      })

      // Calculate demand (sum of all items' focus weeks across scenarios in this quarter)
      let uxDemand = 0
      let contentDemand = 0

      scenariosForQuarter.forEach((scenario) => {
        const items = getItemsForSession(scenario.id)
        items.forEach((item) => {
          if (typeof item.uxFocusWeeks === 'number' && item.uxFocusWeeks > 0) {
            uxDemand += item.uxFocusWeeks
          }
          if (
            typeof item.contentFocusWeeks === 'number' &&
            item.contentFocusWeeks > 0
          ) {
            contentDemand += item.contentFocusWeeks
          }
        })
      })

      return {
        quarter,
        uxCapacity,
        uxDemand,
        uxSurplusDeficit: uxCapacity - uxDemand,
        contentCapacity,
        contentDemand,
        contentSurplusDeficit: contentCapacity - contentDemand,
      }
    })
  }, [sessions, getItemsForSession])

  // Calculate totals across all quarters
  const totals = useMemo(() => {
    return quarterlyMetrics.reduce(
      (acc, metrics) => ({
        uxCapacity: acc.uxCapacity + metrics.uxCapacity,
        uxDemand: acc.uxDemand + metrics.uxDemand,
        contentCapacity: acc.contentCapacity + metrics.contentCapacity,
        contentDemand: acc.contentDemand + metrics.contentDemand,
      }),
      {
        uxCapacity: 0,
        uxDemand: 0,
        contentCapacity: 0,
        contentDemand: 0,
      }
    )
  }, [quarterlyMetrics])

  const totalUxSurplusDeficit = totals.uxCapacity - totals.uxDemand
  const totalContentSurplusDeficit = totals.contentCapacity - totals.contentDemand

  return (
    <Box p={8}>
      <Stack spacing={6}>
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            Quarterly Capacity Overview
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Aggregate capacity and demand across all planning scenarios for each quarter
          </Text>
        </Box>

        {/* Summary Cards */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Total UX Capacity
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {totals.uxCapacity.toFixed(1)}
              </Text>
              <Text fontSize="sm" color="gray.600" mt={1}>
                Focus weeks
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Total UX Demand
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {totals.uxDemand.toFixed(1)}
              </Text>
              <Text fontSize="sm" color="gray.600" mt={1}>
                Focus weeks
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Total Content Capacity
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {totals.contentCapacity.toFixed(1)}
              </Text>
              <Text fontSize="sm" color="gray.600" mt={1}>
                Focus weeks
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Total Content Demand
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {totals.contentDemand.toFixed(1)}
              </Text>
              <Text fontSize="sm" color="gray.600" mt={1}>
                Focus weeks
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Quarterly Summary Table */}
        <Box>
          <Heading size="md" mb={4}>
            Quarterly Breakdown
          </Heading>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Quarter</Th>
                  <Th>
                    <Text>UX Capacity</Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="normal">
                      (Focus weeks)
                    </Text>
                  </Th>
                  <Th>
                    <Text>UX Demand</Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="normal">
                      (Focus weeks)
                    </Text>
                  </Th>
                  <Th>UX Surplus/Deficit</Th>
                  <Th>
                    <Text>Content Capacity</Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="normal">
                      (Focus weeks)
                    </Text>
                  </Th>
                  <Th>
                    <Text>Content Demand</Text>
                    <Text fontSize="xs" color="gray.500" fontWeight="normal">
                      (Focus weeks)
                    </Text>
                  </Th>
                  <Th>Content Surplus/Deficit</Th>
                </Tr>
              </Thead>
              <Tbody>
                {quarterlyMetrics.map((metrics) => (
                  <Tr key={metrics.quarter}>
                    <Td fontWeight="medium">{metrics.quarter}</Td>
                    <Td>{metrics.uxCapacity.toFixed(1)}</Td>
                    <Td>
                      {metrics.uxDemand > 0 ? (
                        metrics.uxDemand.toFixed(1)
                      ) : (
                        <Text color="gray.400">—</Text>
                      )}
                    </Td>
                    <Td>
                      {metrics.uxDemand > 0 ? (
                        <HStack spacing={2}>
                          <Badge
                            colorScheme={
                              metrics.uxSurplusDeficit >= 0 ? 'green' : 'red'
                            }
                          >
                            {metrics.uxSurplusDeficit >= 0 ? '+' : ''}
                            {metrics.uxSurplusDeficit.toFixed(1)}
                          </Badge>
                          <Text fontSize="xs" color="gray.500">
                            {metrics.uxSurplusDeficit >= 0
                              ? 'surplus'
                              : 'deficit'}
                          </Text>
                        </HStack>
                      ) : (
                        <Text color="gray.400">—</Text>
                      )}
                    </Td>
                    <Td>{metrics.contentCapacity.toFixed(1)}</Td>
                    <Td>
                      {metrics.contentDemand > 0 ? (
                        metrics.contentDemand.toFixed(1)
                      ) : (
                        <Text color="gray.400">—</Text>
                      )}
                    </Td>
                    <Td>
                      {metrics.contentDemand > 0 ? (
                        <HStack spacing={2}>
                          <Badge
                            colorScheme={
                              metrics.contentSurplusDeficit >= 0
                                ? 'green'
                                : 'red'
                            }
                          >
                            {metrics.contentSurplusDeficit >= 0 ? '+' : ''}
                            {metrics.contentSurplusDeficit.toFixed(1)}
                          </Badge>
                          <Text fontSize="xs" color="gray.500">
                            {metrics.contentSurplusDeficit >= 0
                              ? 'surplus'
                              : 'deficit'}
                          </Text>
                        </HStack>
                      ) : (
                        <Text color="gray.400">—</Text>
                      )}
                    </Td>
                  </Tr>
                ))}
                {/* Totals row */}
                <Tr fontWeight="bold" bg="gray.50">
                  <Td>Total</Td>
                  <Td>{totals.uxCapacity.toFixed(1)}</Td>
                  <Td>{totals.uxDemand.toFixed(1)}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Badge
                        colorScheme={
                          totalUxSurplusDeficit >= 0 ? 'green' : 'red'
                        }
                      >
                        {totalUxSurplusDeficit >= 0 ? '+' : ''}
                        {totalUxSurplusDeficit.toFixed(1)}
                      </Badge>
                      <Text fontSize="xs" color="gray.500">
                        {totalUxSurplusDeficit >= 0 ? 'surplus' : 'deficit'}
                      </Text>
                    </HStack>
                  </Td>
                  <Td>{totals.contentCapacity.toFixed(1)}</Td>
                  <Td>{totals.contentDemand.toFixed(1)}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <Badge
                        colorScheme={
                          totalContentSurplusDeficit >= 0 ? 'green' : 'red'
                        }
                      >
                        {totalContentSurplusDeficit >= 0 ? '+' : ''}
                        {totalContentSurplusDeficit.toFixed(1)}
                      </Badge>
                      <Text fontSize="xs" color="gray.500">
                        {totalContentSurplusDeficit >= 0
                          ? 'surplus'
                          : 'deficit'}
                      </Text>
                    </HStack>
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        {/* Empty state */}
        {sessions.length === 0 && (
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>No scenarios found</AlertTitle>
              <AlertDescription>
                Create planning scenarios to see quarterly capacity aggregates.
              </AlertDescription>
            </Box>
          </Alert>
        )}
      </Stack>
    </Box>
  )
}

export default QuarterlyCapacityPage
