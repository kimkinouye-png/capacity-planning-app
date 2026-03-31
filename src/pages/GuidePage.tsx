import {
  Box,
  Heading,
  Text,
  Flex,
  Grid,
  GridItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'

const FAQ_ITEMS = [
  {
    q: 'How do I create a new plan?',
    a: 'Click "New Plan" on the Scenarios page. Enter a name, select a planning period (quarter), and set your UX and Content Designer team sizes. Click "Create Scenario" to get started.',
  },
  {
    q: 'What are the three tabs in the New Plan modal?',
    a: 'The New Plan modal has fields for Name, Planning Period, UX Designers, and Content Designers. Once created, your plan opens to the scenario summary where you can add roadmap items.',
  },
  {
    q: 'How do I add roadmap items?',
    a: "From your plan's summary page, click \"Add new item\" to create items manually, or use \"Paste from table\" to import multiple items at once from a spreadsheet. Each item needs a short key, name, priority, status, and project type.",
  },
  {
    q: 'What are complexity factors?',
    a: 'Complexity factors are scored 1–5 and used to estimate effort for each roadmap item. Factors include Product Risk, Problem Ambiguity, User Complexity Requirements, and Legal Compliance Dependency. Higher scores = more effort.',
  },
  {
    q: 'How is capacity calculated?',
    a: 'Capacity = (Base weeks − Holidays − PTO) × Focus Time Ratio × Team Size. Focus Time Ratio accounts for meetings and context switching. You can adjust these values in Settings.',
  },
  {
    q: 'How is demand calculated?',
    a: "Demand is the sum of focus weeks across all roadmap items in a plan. Each item's effort is estimated based on its project type and complexity factors, then mapped to a size band (XS–XL) and focus weeks.",
  },
  {
    q: "What's the difference between Draft and Committed plans?",
    a: 'Draft plans are works in progress — you can explore different scenarios freely. Committed plans represent your team\'s official quarterly commitments and appear in the capacity overview. Use the status dropdown on a plan to change its state.',
  },
  {
    q: 'Does the tool auto-save?',
    a: 'Yes. Changes are saved automatically to the database as you work. Your data persists across sessions and devices.',
  },
  {
    q: 'Where can I adjust calculation settings?',
    a: 'Go to Settings to adjust effort weights, focus time ratio, planning period details, size band thresholds, and project type demand defaults.',
  },
]

export default function GuidePage() {
  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Box maxW="900px" mx="auto" px={6} py={8}>
        {/* Header */}
        <Flex align="center" gap={3} mb={3}>
          <Box
            bg="cyan.900"
            border="1px solid"
            borderColor="cyan.700"
            borderRadius="lg"
            p={2}
            fontSize="xl"
          >
            📖
          </Box>
          <Heading size="xl" fontWeight="bold">
            Capacity Planning Guide
          </Heading>
        </Flex>
        <Text fontSize="sm" color="gray.400" mb={10}>
          Learn how to effectively use the Capacity Planner to manage and plan roadmaps across quarterly cycles.
        </Text>

        {/* Quick Start */}
        <Box bg="gray.800" border="1px solid" borderColor="cyan.700" borderRadius="lg" p={6} mb={10}>
          <Flex align="center" gap={2} mb={4}>
            <Text color="cyan.400" fontSize="lg">
              ▶
            </Text>
            <Text fontWeight="semibold" color="white">
              Quick Start
            </Text>
          </Flex>
          <Flex direction="column" gap={3}>
            {[
              "Create a new plan by clicking 'New Plan' and entering team size",
              'Add roadmap items manually, paste from a spreadsheet, or upload a file',
              'Estimate effort using complexity factors for UX and Content Design',
              'Review capacity to see if your plan is feasible',
            ].map((step, i) => (
              <Flex key={i} align="flex-start" gap={3}>
                <Box
                  minW={6}
                  h={6}
                  borderRadius="full"
                  bg="cyan.400"
                  color="gray.900"
                  fontSize="xs"
                  fontWeight="bold"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                  mt="1px"
                >
                  {i + 1}
                </Box>
                <Text fontSize="sm" color="gray.300">
                  {step}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Box>

        {/* Key Concepts */}
        <Flex align="center" gap={2} mb={5}>
          <Text color="cyan.400">ℹ</Text>
          <Heading size="md" fontWeight="semibold">
            Key Concepts
          </Heading>
        </Flex>

        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} mb={10}>
          {/* Focus Weeks */}
          <GridItem>
            <Box bg="gray.800" border="1px solid" borderColor="gray.700" borderRadius="lg" p={5} h="full">
              <Text fontWeight="semibold" color="white" mb={3}>
                Focus Weeks
              </Text>
              <Text fontSize="sm" color="gray.400" mb={3}>
                A feature requiring 3 focus weeks means 3 weeks of heads down + 0 disruptions. Example: Work Weeks =
                Focus Weeks × 1.7x
              </Text>
              <Box bg="gray.700" borderRadius="md" p={3}>
                <Text fontSize="sm" color="cyan.400">
                  <strong>Example:</strong> Work Weeks = 3 focus weeks ÷ 0.7 ≈ 4–5 work weeks
                </Text>
              </Box>
            </Box>
          </GridItem>

          {/* Work Weeks */}
          <GridItem>
            <Box bg="gray.800" border="1px solid" borderColor="gray.700" borderRadius="lg" p={5} h="full">
              <Text fontWeight="semibold" color="white" mb={3}>
                Work Weeks
              </Text>
              <Text fontSize="sm" color="gray.400" mb={3}>
                Accounts for non-project time: meetings by dividing focus time by 0.7x. The group a designer needs
                are included in work weeks calculations.
              </Text>
              <Box bg="gray.700" borderRadius="md" p={3}>
                <Text fontSize="sm" color="cyan.400">
                  <strong>Formula:</strong> Work Weeks = Focus Weeks ÷ 0.7
                </Text>
              </Box>
            </Box>
          </GridItem>

          {/* Complexity Factors */}
          <GridItem>
            <Box bg="gray.800" border="1px solid" borderColor="gray.700" borderRadius="lg" p={5} h="full">
              <Text fontWeight="semibold" color="white" mb={3}>
                Complexity Factors
              </Text>
              <Text fontSize="sm" color="gray.400" mb={3}>
                Score each factor from 1–5, calculated into effort, which are specific to Product Design, UX
                Designers, and Content Design:
              </Text>
              <Flex direction="column" gap={1}>
                {[
                  'Product Risk',
                  'Problem Ambiguity',
                  'User Complexity Requirements',
                  'Legal Compliance Dependency',
                ].map((factor) => (
                  <Flex key={factor} align="center" gap={2}>
                    <Box w={1.5} h={1.5} borderRadius="full" bg="cyan.400" flexShrink={0} />
                    <Text fontSize="sm" color="gray.300">
                      {factor}
                    </Text>
                  </Flex>
                ))}
              </Flex>
            </Box>
          </GridItem>

          {/* Capacity Status */}
          <GridItem>
            <Box bg="gray.800" border="1px solid" borderColor="gray.700" borderRadius="lg" p={5} h="full">
              <Text fontWeight="semibold" color="white" mb={3}>
                Capacity Status
              </Text>
              <Text fontSize="sm" color="gray.400" mb={3}>
                Visual indicators show if your team is under, near, or over capacity for the planning period:
              </Text>
              <Flex direction="column" gap={2}>
                {[
                  { color: 'green.400', label: 'Green:', description: '<90% capacity' },
                  { color: 'yellow.400', label: 'Amber:', description: '90–100% capacity' },
                  { color: 'red.400', label: 'Red:', description: '>100% capacity' },
                ].map(({ color, label, description }) => (
                  <Flex key={label} align="center" gap={2}>
                    <Box w={2.5} h={2.5} borderRadius="full" bg={color} flexShrink={0} />
                    <Text fontSize="sm" color="gray.300">
                      <strong>{label}</strong> {description}
                    </Text>
                  </Flex>
                ))}
              </Flex>
            </Box>
          </GridItem>
        </Grid>

        {/* FAQs */}
        <Heading size="md" fontWeight="semibold" mb={5}>
          Frequently Asked Questions
        </Heading>

        <Accordion allowToggle>
          {FAQ_ITEMS.map(({ q, a }) => (
            <AccordionItem key={q} border="none" mb={2}>
              <AccordionButton
                bg="gray.800"
                border="1px solid"
                borderColor="gray.700"
                borderRadius="lg"
                px={5}
                py={4}
                _hover={{ bg: 'gray.700', borderColor: 'gray.600' }}
                _expanded={{ borderBottomRadius: 0, borderColor: 'gray.600' }}
              >
                <Box flex={1} textAlign="left" fontSize="sm" fontWeight="medium" color="white">
                  {q}
                </Box>
                <AccordionIcon color="gray.400" />
              </AccordionButton>
              <AccordionPanel
                bg="gray.800"
                border="1px solid"
                borderColor="gray.700"
                borderTopWidth={0}
                borderBottomRadius="lg"
                px={5}
                py={4}
                fontSize="sm"
                color="gray.400"
              >
                {a}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Box>
    </Box>
  )
}
