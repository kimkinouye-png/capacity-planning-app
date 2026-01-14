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
import {
  CalendarIcon,
  ViewIcon,
  CheckCircleIcon,
  WarningTwoIcon,
} from '@chakra-ui/icons'

export default function GuidePage() {
  return (
    <Box minH="100vh" bg="#0a0a0f">
      <Box maxW="1280px" mx="auto" px={6} py={8}>
        {/* Header */}
        <Box mb={8}>
          <HStack spacing={3} mb={2}>
            <Box
              w={8}
              h={8}
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="#00d9ff"
            >
              <ViewIcon w={6} h={6} />
            </Box>
            <Heading size="xl" fontWeight="bold" color="white">
              Capacity Planning Guide
            </Heading>
          </HStack>
          <Text fontSize="md" color="gray.400">
            Learn how to estimate design effort, manage team capacity, and plan smarter across quarterly cycles
          </Text>
        </Box>

        {/* Quick Start */}
        <Box mb={8}>
          <Box
            bg="linear-gradient(to right, rgba(0, 217, 255, 0.1), rgba(59, 130, 246, 0.1))"
            border="1px solid"
            borderColor="rgba(0, 217, 255, 0.5)"
            borderRadius="md"
            p={6}
          >
            <HStack spacing={4} align="flex-start">
              <Box
                bg="rgba(0, 217, 255, 0.2)"
                p={3}
                borderRadius="md"
                flexShrink={0}
              >
                <ViewIcon w={6} h={6} color="#00d9ff" />
              </Box>
              <VStack spacing={3} align="stretch" flex={1}>
                <Heading size="md" color="white">
                  Quick Start
                </Heading>
                <VStack spacing={2} align="stretch">
                  <HStack spacing={2}>
                    <Text color="#00d9ff" fontWeight="600" fontSize="sm">
                      1.
                    </Text>
                    <Text fontSize="sm" color="gray.300">
                      Create a new scenario with your team size and planning period
                    </Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Text color="#00d9ff" fontWeight="600" fontSize="sm">
                      2.
                    </Text>
                    <Text fontSize="sm" color="gray.300">
                      Add roadmap items and score them using complexity factors
                    </Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Text color="#00d9ff" fontWeight="600" fontSize="sm">
                      3.
                    </Text>
                    <Text fontSize="sm" color="gray.300">
                      Review real-time effort estimates and capacity status
                    </Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Text color="#00d9ff" fontWeight="600" fontSize="sm">
                      4.
                    </Text>
                    <Text fontSize="sm" color="gray.300">
                      Commit scenarios to see quarterly capacity overview
                    </Text>
                  </HStack>
                </VStack>
              </VStack>
            </HStack>
          </Box>
        </Box>

        {/* Key Concepts */}
        <Box mb={8}>
          <HStack spacing={2} mb={4}>
            <CalendarIcon w={6} h={6} color="#00d9ff" />
            <Heading size="lg" color="white">
              Key Concepts
            </Heading>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {/* Focus Weeks */}
            <Box
              bg="#141419"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              borderRadius="md"
              p={6}
              _hover={{
                borderColor: 'rgba(0, 217, 255, 0.5)',
                boxShadow: '0 10px 15px -3px rgba(0, 217, 255, 0.2)',
              }}
              transition="all 0.3s ease"
            >
              <Heading size="sm" mb={3} color="white">
                Focus Weeks
              </Heading>
              <Text fontSize="sm" color="gray.300" mb={3}>
                Represents dedicated, uninterrupted time a designer would spend on a task. This is the "pure" effort estimate.
              </Text>
              <Box
                bg="#1a1a20"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.05)"
                borderRadius="md"
                p={3}
                mt={3}
                fontSize="sm"
              >
                <Text color="gray.400">
                  <Text as="strong" color="#00d9ff">Example:</Text> A feature requiring 2 focus weeks means 2 weeks of full-time, focused design work.
                </Text>
              </Box>
            </Box>

            {/* Work Weeks */}
            <Box
              bg="#141419"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              borderRadius="md"
              p={6}
              _hover={{
                borderColor: 'rgba(0, 217, 255, 0.5)',
                boxShadow: '0 10px 15px -3px rgba(0, 217, 255, 0.2)',
              }}
              transition="all 0.3s ease"
            >
              <Heading size="sm" mb={3} color="white">
                Work Weeks
              </Heading>
              <Text fontSize="sm" color="gray.300" mb={3}>
                Accounts for real-world context switching by dividing focus weeks by 0.75. This gives a more realistic timeline.
              </Text>
              <Box
                bg="#1a1a20"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.05)"
                borderRadius="md"
                p={3}
                mt={3}
                fontSize="sm"
              >
                <Text color="gray.400" mb={1}>
                  <Text as="strong" color="#00d9ff">Formula:</Text> Work Weeks = Focus Weeks ÷ 0.75
                </Text>
                <Text color="gray.400">
                  <Text as="strong" color="#00d9ff">Example:</Text> 2 focus weeks = 2.67 work weeks
                </Text>
              </Box>
            </Box>

            {/* Complexity Factors */}
            <Box
              bg="#141419"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              borderRadius="md"
              p={6}
              _hover={{
                borderColor: 'rgba(0, 217, 255, 0.5)',
                boxShadow: '0 10px 15px -3px rgba(0, 217, 255, 0.2)',
              }}
              transition="all 0.3s ease"
            >
              <Heading size="sm" mb={3} color="white">
                Complexity Factors
              </Heading>
              <Text fontSize="sm" color="gray.300" mb={3}>
                Score each factor from 1-5 to calculate effort. Different factors apply to Product Design vs Content Design.
              </Text>
              <Box
                bg="#1a1a20"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.05)"
                borderRadius="md"
                p={3}
                mt={3}
                fontSize="sm"
              >
                <Text color="gray.400" mb={2}>
                  <Text as="strong" color="#00d9ff">Product Design:</Text>
                </Text>
                <VStack spacing={1} align="stretch" mb={3}>
                  <Text color="gray.400" fontSize="xs">• Product Risk</Text>
                  <Text color="gray.400" fontSize="xs">• Problem Ambiguity</Text>
                  <Text color="gray.400" fontSize="xs">• Discovery Depth</Text>
                </VStack>
                <Text color="gray.400" mb={2}>
                  <Text as="strong" color="#00d9ff">Content Design:</Text>
                </Text>
                <VStack spacing={1} align="stretch">
                  <Text color="gray.400" fontSize="xs">• Content Surface Area</Text>
                  <Text color="gray.400" fontSize="xs">• Localization Scope</Text>
                  <Text color="gray.400" fontSize="xs">• Regulatory & Brand Risk</Text>
                  <Text color="gray.400" fontSize="xs">• Legal Compliance Dependency</Text>
                </VStack>
              </Box>
            </Box>

            {/* Capacity Status */}
            <Box
              bg="#141419"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.1)"
              borderRadius="md"
              p={6}
              _hover={{
                borderColor: 'rgba(0, 217, 255, 0.5)',
                boxShadow: '0 10px 15px -3px rgba(0, 217, 255, 0.2)',
              }}
              transition="all 0.3s ease"
            >
              <Heading size="sm" mb={3} color="white">
                Capacity Status
              </Heading>
              <Text fontSize="sm" color="gray.300" mb={3}>
                Visual indicators show if your team is under, near, or over capacity for the planning period.
              </Text>
              <VStack spacing={2} align="stretch" mt={3}>
                <HStack spacing={2}>
                  <Box w={3} h={3} borderRadius="full" bg="#10b981" />
                  <Text fontSize="sm" color="gray.400">
                    <Text as="strong" color="#10b981">Surplus:</Text> &lt;80% capacity
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Box w={3} h={3} borderRadius="full" bg="#f59e0b" />
                  <Text fontSize="sm" color="gray.400">
                    <Text as="strong" color="#f59e0b">Near:</Text> 80-100% capacity
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <Box w={3} h={3} borderRadius="full" bg="#ef4444" />
                  <Text fontSize="sm" color="gray.400">
                    <Text as="strong" color="#ef4444">Over:</Text> &gt;100% capacity
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Scoring Guide */}
        <Box mb={8}>
          <HStack spacing={2} mb={4}>
            <ViewIcon w={6} h={6} color="#00d9ff" />
            <Heading size="lg" color="white">
              How to Score Complexity Factors
            </Heading>
          </HStack>
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
                  <Th color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Score</Th>
                  <Th color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Level</Th>
                  <Th color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Description</Th>
                  <Th color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Example</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr borderBottom="1px solid" borderColor="rgba(255, 255, 255, 0.05)" _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }}>
                  <Td fontWeight="600" color="#00d9ff">1</Td>
                  <Td color="gray.300">Minimal</Td>
                  <Td color="gray.400">Very simple, straightforward work</Td>
                  <Td color="gray.400">Copy change, minor UI tweak</Td>
                </Tr>
                <Tr borderBottom="1px solid" borderColor="rgba(255, 255, 255, 0.05)" _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }}>
                  <Td fontWeight="600" color="#00d9ff">2</Td>
                  <Td color="gray.300">Low</Td>
                  <Td color="gray.400">Limited complexity, few unknowns</Td>
                  <Td color="gray.400">Single screen update, minor feature</Td>
                </Tr>
                <Tr borderBottom="1px solid" borderColor="rgba(255, 255, 255, 0.05)" _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }}>
                  <Td fontWeight="600" color="#00d9ff">3</Td>
                  <Td color="gray.300">Medium</Td>
                  <Td color="gray.400">Moderate complexity, some dependencies</Td>
                  <Td color="gray.400">Multi-screen flow, moderate research</Td>
                </Tr>
                <Tr borderBottom="1px solid" borderColor="rgba(255, 255, 255, 0.05)" _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }}>
                  <Td fontWeight="600" color="#00d9ff">4</Td>
                  <Td color="gray.300">High</Td>
                  <Td color="gray.400">Significant complexity, many stakeholders</Td>
                  <Td color="gray.400">New feature area, extensive research</Td>
                </Tr>
                <Tr _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }}>
                  <Td fontWeight="600" color="#00d9ff">5</Td>
                  <Td color="gray.300">Critical</Td>
                  <Td color="gray.400">Extreme complexity, high uncertainty</Td>
                  <Td color="gray.400">Platform redesign, major new product</Td>
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </Box>

        {/* Typical Workflow */}
        <Box mb={8}>
          <HStack spacing={2} mb={4}>
            <CalendarIcon w={6} h={6} color="#00d9ff" />
            <Heading size="lg" color="white">
              Typical Workflow
            </Heading>
          </HStack>
          <VStack spacing={4} align="stretch">
            {[
              {
                step: 1,
                title: 'Create Planning Scenario',
                description: 'Set up a new scenario with your planning period (e.g., "Q2 2024") and team composition.',
                items: [
                  'Define number of UX and Content Designers',
                  'Set total available weeks (typically 12-13 for a quarter)',
                  'Account for holidays, PTO, and existing commitments',
                ],
              },
              {
                step: 2,
                title: 'Add Roadmap Items',
                description: 'Create entries for each initiative, feature, or project you\'re planning.',
                items: [
                  'Include project name, initiative, and priority',
                  'Tag whether Product Design and/or Content Design is needed',
                  'Add optional notes and context',
                ],
              },
              {
                step: 3,
                title: 'Score Complexity Factors',
                description: 'For each roadmap item, score the relevant complexity factors from 1-5.',
                items: [
                  'Consider research needs, design complexity, dependencies',
                  'Review auto-calculated focus weeks and work weeks',
                  'Adjust scores until estimates feel accurate',
                ],
              },
              {
                step: 4,
                title: 'Review Capacity Status',
                description: 'Check real-time capacity calculations to see if your plan is feasible.',
                items: [
                  'Monitor total focus weeks vs. available capacity',
                  'Identify over-capacity situations early',
                  'Adjust priorities or team size as needed',
                ],
              },
              {
                step: 5,
                title: 'Commit & Track',
                description: 'Mark scenarios as "Committed" to include them in your quarterly capacity view.',
                items: [
                  'See all committed work across quarters',
                  'Track capacity trends over time',
                  'Export data for reporting and stakeholder updates',
                ],
              },
            ].map((workflow) => (
              <Box
                key={workflow.step}
                bg="#141419"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.1)"
                borderRadius="md"
                p={6}
                _hover={{
                  borderColor: 'rgba(0, 217, 255, 0.5)',
                  boxShadow: '0 10px 15px -3px rgba(0, 217, 255, 0.2)',
                }}
                transition="all 0.3s ease"
              >
                <HStack spacing={4} align="flex-start">
                  <Badge
                    bg="rgba(0, 217, 255, 0.2)"
                    color="#00d9ff"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                    fontWeight="bold"
                  >
                    {workflow.step}
                  </Badge>
                  <VStack spacing={2} align="stretch" flex={1}>
                    <Heading size="sm" color="white">
                      {workflow.title}
                    </Heading>
                    <Text fontSize="sm" color="gray.400" mb={2}>
                      {workflow.description}
                    </Text>
                    <VStack spacing={1} align="stretch">
                      {workflow.items.map((item, idx) => (
                        <HStack key={idx} spacing={2} align="center">
                          <CheckCircleIcon w={4} h={4} color="#10b981" flexShrink={0} />
                          <Text fontSize="sm" color="gray.400">
                            {item}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Best Practices */}
        <Box mb={8}>
          <HStack spacing={2} mb={4}>
            <CheckCircleIcon w={6} h={6} color="#00d9ff" />
            <Heading size="lg" color="white">
              Best Practices
            </Heading>
          </HStack>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {[
              {
                title: 'Collaborate on Scoring',
                description: 'Review complexity scores with your design team to align on estimates and catch blind spots.',
              },
              {
                title: 'Account for Unknowns',
                description: 'When in doubt, score higher. It\'s better to have buffer than be over-committed.',
              },
              {
                title: 'Leave Capacity Buffer',
                description: 'Aim for 70-80% capacity utilization. This leaves room for urgent requests and iteration.',
              },
              {
                title: 'Review Regularly',
                description: 'Update scenarios as priorities change. Re-score items when you learn new information.',
              },
              {
                title: 'Use Scenarios for "What-If"',
                description: 'Create multiple scenarios to compare different priority mixes or team configurations.',
              },
              {
                title: 'Track Actual vs. Estimated',
                description: 'After completing work, compare actuals to estimates to improve future accuracy.',
              },
            ].map((practice) => (
              <Box
                key={practice.title}
                bg="#141419"
                border="1px solid"
                borderColor="rgba(16, 185, 129, 0.5)"
                borderRadius="md"
                p={6}
                _hover={{
                  borderColor: 'rgba(16, 185, 129, 0.7)',
                  boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)',
                }}
                transition="all 0.3s ease"
              >
                <HStack spacing={3} align="flex-start">
                  <CheckCircleIcon w={5} h={5} color="#10b981" flexShrink={0} mt={0.5} />
                  <VStack spacing={1} align="stretch" flex={1}>
                    <Heading size="sm" color="white">
                      {practice.title}
                    </Heading>
                    <Text fontSize="sm" color="gray.400">
                      {practice.description}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Common Pitfalls */}
        <Box mb={8}>
          <HStack spacing={2} mb={4}>
            <ViewIcon w={6} h={6} color="#00d9ff" />
            <Heading size="lg" color="white">
              Common Pitfalls to Avoid
            </Heading>
          </HStack>
          <VStack spacing={3} align="stretch">
            {[
              {
                title: 'Underestimating Dependencies',
                description: 'Cross-team dependencies often add more time than expected. Score "Cross-team Dependencies" honestly.',
              },
              {
                title: 'Ignoring Context Switching',
                description: 'Remember that work weeks account for real-world interruptions. Don\'t plan based on focus weeks alone.',
              },
              {
                title: 'Planning at 100% Capacity',
                description: 'Always leave buffer. Unexpected urgent work, team changes, and scope creep are inevitable.',
              },
              {
                title: 'Forgetting Research Time',
                description: 'User research, testing, and iteration take significant time. Factor this into "User Research Needs".',
              },
              {
                title: 'Not Updating as You Learn',
                description: 'Estimates improve with information. Re-score items when project scope becomes clearer.',
              },
            ].map((pitfall) => (
              <Box
                key={pitfall.title}
                bg="#141419"
                border="1px solid"
                borderColor="rgba(245, 158, 11, 0.5)"
                borderRadius="md"
                p={6}
                _hover={{
                  borderColor: 'rgba(245, 158, 11, 0.7)',
                  boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.2)',
                }}
                transition="all 0.3s ease"
              >
                <HStack spacing={3} align="flex-start">
                  <WarningTwoIcon w={5} h={5} color="#f59e0b" flexShrink={0} mt={0.5} />
                  <VStack spacing={1} align="stretch" flex={1}>
                    <Heading size="sm" color="white">
                      {pitfall.title}
                    </Heading>
                    <Text fontSize="sm" color="gray.400">
                      {pitfall.description}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* FAQs */}
        <Box mb={8}>
          <Heading size="lg" mb={4} color="white">
            Frequently Asked Questions
          </Heading>
          <VStack spacing={4} align="stretch">
            {[
              {
                question: 'Why use both focus weeks and work weeks?',
                answer:
                  'Focus weeks represent the ideal, uninterrupted time needed. Work weeks account for meetings, context switching, and other realities. Use work weeks for timeline planning and focus weeks for capacity calculations.',
              },
              {
                question: 'Can I adjust the 0.75 multiplier?',
                answer:
                  'Currently it\'s fixed at 0.75 (meaning 75% efficiency due to context switching). This is based on industry research, but you can mentally adjust if your team\'s context is different.',
              },
              {
                question: 'What\'s the difference between scenarios and committed plans?',
                answer:
                  'Scenarios are planning workspaces where you can explore different options. When you mark a scenario as "Committed", it appears in your Committed Plan view and counts toward your overall quarterly capacity.',
              },
              {
                question: 'How accurate are these estimates?',
                answer:
                  'Estimation is an art, not a science. These are directional estimates to help with planning. Track actuals vs. estimates over time to calibrate your team\'s scoring and improve accuracy.',
              },
              {
                question: 'Does the tool auto-save?',
                answer:
                  'Yes! All changes are automatically saved to your browser\'s local storage. Your data persists across sessions, but note that it\'s stored locally and won\'t sync across devices.',
              },
            ].map((faq) => (
              <Box
                key={faq.question}
                bg="#141419"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.1)"
                borderRadius="md"
                p={6}
                _hover={{
                  borderColor: 'rgba(0, 217, 255, 0.5)',
                  boxShadow: '0 10px 15px -3px rgba(0, 217, 255, 0.2)',
                }}
                transition="all 0.3s ease"
              >
                <Heading size="sm" mb={2} color="white">
                  {faq.question}
                </Heading>
                <Text fontSize="sm" color="gray.400">
                  {faq.answer}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>
      </Box>
    </Box>
  )
}
