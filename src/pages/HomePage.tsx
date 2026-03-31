import {
  Box,
  Heading,
  Stack,
  Button,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Divider,
  Icon,
  Flex,
  Progress,
  Badge,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  Tab,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  createIcon,
  useColorModeValue,
} from '@chakra-ui/react'
import { AttachmentIcon, CalendarIcon, RepeatIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'
import type { ElementType, ReactNode } from 'react'
import { usePlanningSessions } from '../context/PlanningSessionsContext'

/** Material-style people icon — not in @chakra-ui/icons */
const UsersStepIcon = createIcon({
  displayName: 'UsersStepIcon',
  viewBox: '0 0 24 24',
  d: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
})

/** Calculator keypad */
const CalculatorStepIcon = createIcon({
  displayName: 'CalculatorStepIcon',
  viewBox: '0 0 24 24',
  d: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-8 4h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm0 4h2v2h-2v-2z',
})

function HomePage() {
  const navigate = useNavigate()
  const { sessions, error: sessionsError } = usePlanningSessions()
  const BG = useColorModeValue('gray.50', 'gray.900')
  const CARD_BG = useColorModeValue('white', '#1a1d2e')
  const BORDER = useColorModeValue('gray.200', 'rgba(255, 255, 255, 0.08)')
  const CYAN = useColorModeValue('cyan.500', '#00d9ff')
  const textPrimary = useColorModeValue('gray.900', 'white')
  const textSecondary = useColorModeValue('gray.600', 'gray.400')
  const iconBg = useColorModeValue('cyan.50', 'teal.900')
  const stepNumberBg = useColorModeValue('cyan.500', '#00d9ff')
  const stepNumberColor = useColorModeValue('white', '#0a0a0f')
  const stepIconBg = useColorModeValue('cyan.50', 'rgba(0, 217, 255, 0.12)')
  const ctaGradient = useColorModeValue(
    'linear(to-r, cyan.50, blue.50)',
    'linear(to-r, rgba(0,217,255,0.15), rgba(99,102,241,0.15))'
  )

  function StepPreviewCard({ children }: { children: ReactNode }) {
    return (
      <Card
        bg={CARD_BG}
        border="1px solid"
        borderColor={BORDER}
        borderRadius="lg"
        overflow="hidden"
      >
        <CardBody p={{ base: 4, md: 6 }}>{children}</CardBody>
      </Card>
    )
  }

  function StepRow({
    step,
    icon,
    title,
    body,
    preview,
    reverseOnDesktop,
  }: {
    step: number
    icon: ElementType
    title: string
    body: string
    preview: ReactNode
    reverseOnDesktop?: boolean
  }) {
    const textColumn = (
      <VStack align="stretch" spacing={4} textAlign="left" w="full">
        <HStack spacing={3} justify="flex-start" w="full">
          <Flex
            w={10}
            h={10}
            borderRadius="full"
            bg={stepNumberBg}
            color={stepNumberColor}
            align="center"
            justify="center"
            fontWeight="bold"
            fontSize="sm"
            flexShrink={0}
          >
            {step}
          </Flex>
          <Flex
            w={12}
            h={12}
            borderRadius="full"
            bg={stepIconBg}
            align="center"
            justify="center"
          >
            <Icon as={icon} w={6} h={6} color={CYAN} />
          </Flex>
        </HStack>
        <Heading size="lg" color={textPrimary}>
          {title}
        </Heading>
        <Text color={textSecondary} lineHeight="tall" maxW="lg">
          {body}
        </Text>
      </VStack>
    )

    const previewColumn = <StepPreviewCard>{preview}</StepPreviewCard>

    return (
      <Flex
        direction={{ base: 'column', md: reverseOnDesktop ? 'row-reverse' : 'row' }}
        gap={{ base: 8, md: 12 }}
        align={{ base: 'stretch', md: 'center' }}
        py={{ base: 10, md: 14 }}
      >
        <Box flex={1} minW={0}>
          {textColumn}
        </Box>
        <Box flex={1} minW={0}>
          {previewColumn}
        </Box>
      </Flex>
    )
  }

  return (
    <Box bg={BG} minH="100vh">
      {sessionsError && sessions.length > 0 && (
        <Alert
          status="warning"
          bg={CARD_BG}
          border="1px solid"
          borderColor="rgba(245, 158, 11, 0.3)"
          borderRadius="md"
          mx={6}
          mt={4}
        >
          <AlertIcon color="#f59e0b" />
          <AlertTitle color={textPrimary} mr={2}>
            Warning:
          </AlertTitle>
          <AlertDescription color={textSecondary}>{sessionsError}</AlertDescription>
        </Alert>
      )}

      <Box maxW="1100px" mx="auto" px={6} py={{ base: 12, md: 16 }}>
        {/* Hero */}
        <VStack spacing={6} textAlign="center" pb={{ base: 12, md: 16 }}>
          <Flex
            w={{ base: 20, md: 24 }}
            h={{ base: 20, md: 24 }}
            borderRadius="full"
            bg={iconBg}
            align="center"
            justify="center"
            boxShadow={`0 0 24px rgba(0, 217, 255, 0.25)`}
          >
            <Icon as={CalendarIcon} w={{ base: 10, md: 12 }} h={{ base: 10, md: 12 }} color={CYAN} />
          </Flex>
          <Heading as="h1" size="2xl" color={textPrimary} fontWeight="bold" maxW="3xl">
            Welcome to Capacity Planner
          </Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} color={textSecondary} maxW="2xl" lineHeight="tall">
            A planning tool that gives design leaders a measurable way to size and visualize how much work is in a
            product roadmap.
          </Text>
        </VStack>

        {/* CTA Card */}
        <Card
          bg={CARD_BG}
          bgGradient={ctaGradient}
          border="1px solid"
          borderColor={BORDER}
          borderRadius="xl"
          maxW="xl"
          mx="auto"
          mb={{ base: 16, md: 20 }}
        >
          <CardBody p={{ base: 8, md: 10 }} textAlign="center">
            <Heading size="md" color={textPrimary} mb={6}>
              Ready to get started?
            </Heading>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4} justify="center">
              <Button
                bg={CYAN}
                color={stepNumberColor}
                _hover={{ bg: '#33e1ff' }}
                size="lg"
                flex={1}
                onClick={() => navigate('/scenarios')}
              >
                Create a New Plan
              </Button>
              <Button
                variant="outline"
                borderColor={CYAN}
                borderWidth="1px"
                color={textSecondary}
                _hover={{ bg: 'whiteAlpha.100', borderColor: 'cyan.300' }}
                size="lg"
                flex={1}
                onClick={() => navigate('/scenarios')}
              >
                Review Current Plans
              </Button>
            </Stack>
          </CardBody>
        </Card>

        <Divider borderColor={BORDER} mb={{ base: 4, md: 8 }} />

        {/* Step 1 */}
        <StepRow
          step={1}
          icon={UsersStepIcon}
          title="Add your team size"
          body="Create a new scenario by setting your planning period and defining how many UX designers and content designers are on your team."
          preview={
            <VStack align="stretch" spacing={4} pointerEvents="none">
              <VStack align="stretch" spacing={3}>
                <Box>
                  <Text fontSize="xs" color={textSecondary} mb={1}>
                    Plan Name
                  </Text>
                  <Input value="Q2 2026 Planning" isReadOnly size="sm" bg="whiteAlpha.50" borderColor={BORDER} />
                </Box>
                <Box>
                  <Text fontSize="xs" color={textSecondary} mb={1}>
                    Quarter
                  </Text>
                  <Input value="Q2'26" isReadOnly size="sm" bg="whiteAlpha.50" borderColor={BORDER} />
                </Box>
                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text fontSize="xs" color={textSecondary} mb={1}>
                      UX Designers
                    </Text>
                    <Input value="5" isReadOnly size="sm" bg="whiteAlpha.50" borderColor={BORDER} />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="xs" color={textSecondary} mb={1}>
                      Content Designers
                    </Text>
                    <Input value="3" isReadOnly size="sm" bg="whiteAlpha.50" borderColor={BORDER} />
                  </Box>
                </HStack>
              </VStack>
              <Divider borderColor={BORDER} />
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color={textSecondary}>
                    UX Design Capacity
                  </Text>
                  <Text fontSize="sm" color={textPrimary} fontWeight="medium">
                    80.0 weeks
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color={textSecondary}>
                    Content Design Capacity
                  </Text>
                  <Text fontSize="sm" color={textPrimary} fontWeight="medium">
                    40.0 weeks
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          }
        />

        <Divider borderColor={BORDER} />

        {/* Step 2 */}
        <StepRow
          step={2}
          icon={AttachmentIcon}
          title="Paste your roadmap"
          body="Copy your roadmap directly from Google Sheets, Excel, or any spreadsheet and paste it into the tool to get started."
          reverseOnDesktop
          preview={
            <VStack align="stretch" spacing={4} pointerEvents="none">
              <Box overflowX="auto">
                <Table size="sm" variant="unstyled">
                  <Thead>
                    <Tr borderBottom="1px solid" borderColor={BORDER}>
                      <Th color={textSecondary} fontSize="xs" textTransform="uppercase" py={2}>
                        KEY
                      </Th>
                      <Th color={textSecondary} fontSize="xs" textTransform="uppercase" py={2}>
                        NAME
                      </Th>
                      <Th color={textSecondary} fontSize="xs" textTransform="uppercase" py={2}>
                        INITIATIVE
                      </Th>
                      <Th color={textSecondary} fontSize="xs" textTransform="uppercase" py={2}>
                        PRIORITY
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {[
                      ['PROJ-101', 'Payment Flow', 'Revenue', 'P1'],
                      ['PROJ-102', 'User Onboarding', 'Growth', 'P2'],
                      ['PROJ-103', 'Dashboard Redesign', 'Engagement', 'P1'],
                      ['PROJ-104', 'Mobile App', 'Platform', 'P3'],
                    ].map((row) => (
                      <Tr key={row[0]} borderBottom="1px solid" borderColor="whiteAlpha.50">
                        <Td color={textSecondary} py={2} fontSize="sm">
                          {row[0]}
                        </Td>
                        <Td color={textSecondary} py={2} fontSize="sm">
                          {row[1]}
                        </Td>
                        <Td color={textSecondary} py={2} fontSize="sm">
                          {row[2]}
                        </Td>
                        <Td color={textSecondary} py={2} fontSize="sm">
                          {row[3]}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              <HStack spacing={3} justify="flex-end">
                <Button size="sm" bg={CYAN} color="#0a0a0f" isDisabled>
                  Import Roadmap
                </Button>
                <Button size="sm" variant="outline" borderColor="whiteAlpha.300" color={textSecondary} isDisabled>
                  Cancel
                </Button>
              </HStack>
            </VStack>
          }
        />

        <Divider borderColor={BORDER} />

        {/* Step 3 */}
        <StepRow
          step={3}
          icon={CalculatorStepIcon}
          title="Estimate effort"
          body="Size your initiatives using factor-based complexity scoring for accurate estimates."
          preview={
            <VStack align="stretch" spacing={4} pointerEvents="none" opacity={0.95}>
              <Text fontSize="sm" color={textSecondary}>
                Payment Flow Redesign / PROJ-101 • Revenue Initiative
              </Text>
              <Tabs variant="unstyled" defaultIndex={0}>
                <TabList gap={2} flexWrap="wrap">
                  <Tab
                    px={4}
                    py={2}
                    borderRadius="md"
                    bg={CYAN}
                    color="#0a0a0f"
                    fontWeight="semibold"
                    fontSize="sm"
                  >
                    Product Design
                  </Tab>
                  <Tab px={4} py={2} borderRadius="md" bg="whiteAlpha.100" color={textSecondary} fontSize="sm">
                    PM Intake
                  </Tab>
                  <Tab px={4} py={2} borderRadius="md" bg="whiteAlpha.100" color={textSecondary} fontSize="sm">
                    Content Design
                  </Tab>
                </TabList>
              </Tabs>
              <VStack align="stretch" spacing={4} pt={2}>
                <Box>
                  <Text fontSize="sm" color={textSecondary} mb={2}>
                    Product Risk Weight: ×0.4
                  </Text>
                  <HStack spacing={2}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Flex
                        key={n}
                        w={9}
                        h={9}
                        borderRadius="md"
                        align="center"
                        justify="center"
                        fontSize="sm"
                        fontWeight="medium"
                        bg={n === 3 ? CYAN : 'whiteAlpha.100'}
                        color={n === 3 ? stepNumberColor : textSecondary}
                        border="1px solid"
                        borderColor={n === 3 ? CYAN : BORDER}
                      >
                        {n}
                      </Flex>
                    ))}
                  </HStack>
                </Box>
                <Box>
                  <Text fontSize="sm" color={textSecondary} mb={2}>
                    Problem Ambiguity Weight: ×0.5
                  </Text>
                  <HStack spacing={2}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Flex
                        key={n}
                        w={9}
                        h={9}
                        borderRadius="md"
                        align="center"
                        justify="center"
                        fontSize="sm"
                        fontWeight="medium"
                        bg={n === 4 ? CYAN : 'whiteAlpha.100'}
                        color={n === 4 ? stepNumberColor : textSecondary}
                        border="1px solid"
                        borderColor={n === 4 ? CYAN : BORDER}
                      >
                        {n}
                      </Flex>
                    ))}
                  </HStack>
                </Box>
              </VStack>
              <Divider borderColor={BORDER} />
              <HStack justify="space-between">
                <Text fontSize="sm" color={textSecondary}>
                  UX Effort Estimate
                </Text>
                <Text fontSize="sm" color={textPrimary} fontWeight="semibold">
                  3.5 weeks
                </Text>
              </HStack>
            </VStack>
          }
        />

        <Divider borderColor={BORDER} />

        {/* Step 4 */}
        <StepRow
          step={4}
          icon={RepeatIcon}
          title="Compare scenarios"
          body="Create and compare different planning scenarios to find the optimal approach."
          reverseOnDesktop
          preview={
            <VStack align="stretch" spacing={4} pointerEvents="none">
              <Card bg={CARD_BG} border="1px solid" borderColor={BORDER} borderRadius="md">
                <CardBody p={4}>
                  <HStack justify="space-between" align="flex-start" mb={3} flexWrap="wrap" gap={2}>
                    <Box>
                      <Text color={textPrimary} fontWeight="semibold">
                        Q2 2026 - Committed
                      </Text>
                      <Text fontSize="sm" color={textSecondary}>
                        15 roadmap items
                      </Text>
                    </Box>
                    <Badge bg="purple.600" color={textPrimary} px={2} py={1} borderRadius="md">
                      Committed
                    </Badge>
                  </HStack>
                  <VStack align="stretch" spacing={3}>
                    <Box>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="xs" color={textSecondary}>
                          UX Design
                        </Text>
                        <Text fontSize="xs" color={textSecondary}>
                          72.0 / 80.0 weeks
                        </Text>
                      </HStack>
                      <Progress
                        value={(72 / 80) * 100}
                        size="sm"
                        borderRadius="full"
                        bg="whiteAlpha.100"
                        sx={{
                          '& > div': {
                            background: CYAN,
                          },
                        }}
                      />
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="xs" color={textSecondary}>
                          Content Design
                        </Text>
                        <Text fontSize="xs" color={textSecondary}>
                          35.0 / 40.0 weeks
                        </Text>
                      </HStack>
                      <Progress
                        value={(35 / 40) * 100}
                        size="sm"
                        borderRadius="full"
                        bg="whiteAlpha.100"
                        colorScheme="green"
                      />
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={CARD_BG} border="1px solid" borderColor={BORDER} borderRadius="md">
                <CardBody p={4}>
                  <HStack justify="space-between" align="flex-start" mb={3} flexWrap="wrap" gap={2}>
                    <Box>
                      <Text color={textPrimary} fontWeight="semibold">
                        Q2 2026 - Optimistic
                      </Text>
                      <Text fontSize="sm" color={textSecondary}>
                        18 roadmap items
                      </Text>
                    </Box>
                    <Badge bg="gray.600" color={textPrimary} px={2} py={1} borderRadius="md">
                      Draft
                    </Badge>
                  </HStack>
                  <VStack align="stretch" spacing={3}>
                    <Box>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="xs" color={textSecondary}>
                          UX Design
                        </Text>
                        <Text fontSize="xs" color="red.300">
                          95.0 / 80.0 weeks
                        </Text>
                      </HStack>
                      <Progress
                        value={100}
                        size="sm"
                        borderRadius="full"
                        bg="whiteAlpha.100"
                        sx={{
                          '& > div': {
                            background: '#ef4444',
                          },
                        }}
                      />
                    </Box>
                    <Box>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="xs" color={textSecondary}>
                          Content Design
                        </Text>
                        <Text fontSize="xs" color="orange.300">
                          42.0 / 40.0 weeks
                        </Text>
                      </HStack>
                      <Progress
                        value={100}
                        size="sm"
                        borderRadius="full"
                        bg="whiteAlpha.100"
                        sx={{
                          '& > div': {
                            background: '#f59e0b',
                          },
                        }}
                      />
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          }
        />
      </Box>
    </Box>
  )
}

export default HomePage
