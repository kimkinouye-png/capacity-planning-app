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
} from '@chakra-ui/react'
import { summarizeSession } from '../estimation/logic'
import {
  demoSession,
  demoItems,
  demoIntakes,
  demoProductDesignInputs,
  demoContentDesignInputs,
} from '../demo/demoSession'

function SessionSummaryPage() {
  // Prepare items with inputs for summarizeSession
  const itemsWithInputs = demoItems.map((item) => {
    const intake = demoIntakes.find((i) => i.roadmap_item_id === item.id)!
    const pd = demoProductDesignInputs.find((p) => p.roadmap_item_id === item.id)!
    const cd = demoContentDesignInputs.find((c) => c.roadmap_item_id === item.id)!
    return { item, intake, pd, cd }
  })

  const summary = summarizeSession(demoSession, itemsWithInputs)

  return (
    <Box p={8}>
      <Heading size="lg" mb={6}>
        {summary.session.name} - Summary
      </Heading>

      <Stack spacing={6} mb={8}>
        <Box>
          <Heading size="md" mb={4}>
            Totals
          </Heading>
          <Stack spacing={2}>
            <Text>
              <strong>Total UX Designer-Weeks:</strong> {summary.totals.totalUxWeeks.toFixed(1)}
            </Text>
            <Text>
              <strong>Total Content Designer-Weeks:</strong>{' '}
              {summary.totals.totalContentWeeks.toFixed(1)}
            </Text>
          </Stack>
        </Box>

        <Box>
          <Heading size="md" mb={4}>
            Capacity
          </Heading>
          <Stack spacing={2}>
            <Text>
              <strong>UX Capacity:</strong> {summary.totals.uxCapacityWeeks.toFixed(1)} weeks (
              {summary.session.ux_designers} designers × {summary.session.weeks_per_period} weeks)
            </Text>
            <Text>
              <strong>Content Capacity:</strong> {summary.totals.contentCapacityWeeks.toFixed(1)}{' '}
              weeks ({summary.session.content_designers} designers ×{' '}
              {summary.session.weeks_per_period} weeks)
            </Text>
          </Stack>
        </Box>

        <Box>
          <Heading size="md" mb={4}>
            Surplus/Deficit
          </Heading>
          <Stack spacing={2}>
            <Text>
              <strong>UX Surplus/Deficit:</strong>{' '}
              {summary.totals.uxSurplusDeficit >= 0 ? (
                <Badge colorScheme="green">+{summary.totals.uxSurplusDeficit.toFixed(1)} weeks</Badge>
              ) : (
                <Badge colorScheme="red">{summary.totals.uxSurplusDeficit.toFixed(1)} weeks</Badge>
              )}
            </Text>
            <Text>
              <strong>Content Surplus/Deficit:</strong>{' '}
              {summary.totals.contentSurplusDeficit >= 0 ? (
                <Badge colorScheme="green">
                  +{summary.totals.contentSurplusDeficit.toFixed(1)} weeks
                </Badge>
              ) : (
                <Badge colorScheme="red">
                  {summary.totals.contentSurplusDeficit.toFixed(1)} weeks
                </Badge>
              )}
            </Text>
            <Text>
              <strong>UX Headcount Needed:</strong> {summary.totals.uxHeadcountNeeded}
            </Text>
            <Text>
              <strong>Content Headcount Needed:</strong> {summary.totals.contentHeadcountNeeded}
            </Text>
          </Stack>
        </Box>
      </Stack>

      <Box>
        <Heading size="md" mb={4}>
          Roadmap Items
        </Heading>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Short Key</Th>
                <Th>Name</Th>
                <Th>Initiative</Th>
                <Th>UX Size</Th>
                <Th>UX Weeks</Th>
                <Th>Content Size</Th>
                <Th>Content Weeks</Th>
                <Th>Above Cut Line</Th>
              </Tr>
            </Thead>
            <Tbody>
              {summary.items.map((itemEstimate) => (
                <Tr key={itemEstimate.item.id}>
                  <Td>{itemEstimate.item.short_key}</Td>
                  <Td>{itemEstimate.item.name}</Td>
                  <Td>{itemEstimate.item.initiative}</Td>
                  <Td>
                    <Badge>{itemEstimate.uxSizing.tshirtSize}</Badge>
                  </Td>
                  <Td>{itemEstimate.uxSizing.designerWeeks.toFixed(1)}</Td>
                  <Td>
                    <Badge>{itemEstimate.contentSizing.tshirtSize}</Badge>
                  </Td>
                  <Td>{itemEstimate.contentSizing.designerWeeks.toFixed(1)}</Td>
                  <Td>
                    <Stack direction="row" spacing={2}>
                      {itemEstimate.aboveCutLineUX && (
                        <Badge colorScheme="red">UX</Badge>
                      )}
                      {itemEstimate.aboveCutLineContent && (
                        <Badge colorScheme="red">CD</Badge>
                      )}
                      {!itemEstimate.aboveCutLineUX && !itemEstimate.aboveCutLineContent && (
                        <Badge colorScheme="green">OK</Badge>
                      )}
                    </Stack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}

export default SessionSummaryPage
