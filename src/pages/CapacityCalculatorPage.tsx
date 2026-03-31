import {
  Box,
  Heading,
  Text,
  Flex,
  Grid,
  GridItem,
  FormControl,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Button,
  IconButton,
} from '@chakra-ui/react'
import { useState } from 'react'
import { AddIcon, MinusIcon } from '@chakra-ui/icons'

const DEFAULTS = {
  planningPeriodWeeks: 13,
  daysPerWeek: 5,
  vacationDays: 0,
  companyHolidays: 0,
  workstreams: 1,
  focusTimeRatio: 0.75,
}

function StepInput({
  label,
  value,
  onChange,
  min = 0,
  hint,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  hint?: string
}) {
  return (
    <Box>
      <Text fontSize="sm" color="gray.300" mb={2}>
        {label}
      </Text>
      <Flex
        align="center"
        bg="gray.700"
        border="1px solid"
        borderColor="gray.600"
        borderRadius="md"
        overflow="hidden"
      >
        <IconButton
          aria-label="Decrease"
          icon={<MinusIcon boxSize={3} />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: 'white', bg: 'gray.600' }}
          borderRadius={0}
          onClick={() => onChange(Math.max(min, value - 1))}
        />
        <Text flex={1} textAlign="center" fontSize="md" fontWeight="semibold" color="white">
          {value}
        </Text>
        <IconButton
          aria-label="Increase"
          icon={<AddIcon boxSize={3} />}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: 'white', bg: 'gray.600' }}
          borderRadius={0}
          onClick={() => onChange(value + 1)}
        />
      </Flex>
      {hint && (
        <Text fontSize="xs" color="gray.500" mt={1}>
          {hint}
        </Text>
      )}
    </Box>
  )
}

function MetricCard({
  label,
  value,
  highlight,
  info,
}: {
  label: string
  value: string
  highlight?: boolean
  info?: string
}) {
  return (
    <Box
      bg={highlight ? 'blue.900' : 'gray.700'}
      border="1px solid"
      borderColor={highlight ? 'blue.700' : 'gray.600'}
      borderRadius="lg"
      p={4}
    >
      <Flex align="center" gap={2} mb={1}>
        <Text fontSize="sm" color={highlight ? 'cyan.400' : 'gray.400'}>
          {label}
        </Text>
        {info && (
          <Text fontSize="xs" color="gray.500" title={info}>
            ⓘ
          </Text>
        )}
      </Flex>
      <Text fontSize="3xl" fontWeight="bold" color={highlight ? 'cyan.400' : 'white'}>
        {value}
      </Text>
    </Box>
  )
}

function CapacityStatus({ focusWeeks }: { focusWeeks: number }) {
  let label: string
  let description: string
  let color: string

  if (focusWeeks >= 6) {
    label = 'Healthy'
    description = 'You have healthy capacity for design work'
    color = 'green.400'
  } else if (focusWeeks >= 3) {
    label = 'Limited'
    description = 'Capacity is limited — consider reducing scope'
    color = 'yellow.400'
  } else {
    label = 'At Risk'
    description = 'Very low capacity — review commitments'
    color = 'red.400'
  }

  return (
    <Box bg="gray.800" border="1px solid" borderColor="gray.700" borderRadius="lg" p={5} mt={4}>
      <Text fontWeight="semibold" fontSize="sm" color="gray.300" mb={3}>
        Capacity Status
      </Text>
      <Flex
        align="center"
        gap={3}
        bg="gray.700"
        border="1px solid"
        borderColor="gray.600"
        borderRadius="md"
        p={3}
      >
        <Box w={3} h={3} borderRadius="full" bg={color} flexShrink={0} />
        <Box>
          <Text fontSize="sm" fontWeight="semibold" color={color}>
            {label}
          </Text>
          <Text fontSize="xs" color="gray.400">
            {description}
          </Text>
        </Box>
      </Flex>
    </Box>
  )
}

export default function CapacityCalculatorPage() {
  const [planningPeriodWeeks, setPlanningPeriodWeeks] = useState(DEFAULTS.planningPeriodWeeks)
  const [daysPerWeek, setDaysPerWeek] = useState(DEFAULTS.daysPerWeek)
  const [vacationDays, setVacationDays] = useState(DEFAULTS.vacationDays)
  const [companyHolidays, setCompanyHolidays] = useState(DEFAULTS.companyHolidays)
  const [workstreams, setWorkstreams] = useState(DEFAULTS.workstreams)
  const [focusTimeRatio, setFocusTimeRatio] = useState(DEFAULTS.focusTimeRatio)

  const workstreamPenalty = 0.1
  const availableDays = planningPeriodWeeks * daysPerWeek - vacationDays - companyHolidays
  const availableWeeks = availableDays / daysPerWeek
  const additionalWorkstreams = Math.max(0, workstreams - 1)
  const workstreamImpact = additionalWorkstreams * workstreamPenalty
  const adjustedFocusTimeRatio = Math.max(0.2, focusTimeRatio - workstreamImpact)
  const focusWeeks = availableWeeks * adjustedFocusTimeRatio
  const dailyFocusHours = availableDays > 0 ? (focusWeeks * daysPerWeek * 8) / availableDays : 0

  const handleReset = () => {
    setPlanningPeriodWeeks(DEFAULTS.planningPeriodWeeks)
    setDaysPerWeek(DEFAULTS.daysPerWeek)
    setVacationDays(DEFAULTS.vacationDays)
    setCompanyHolidays(DEFAULTS.companyHolidays)
    setWorkstreams(DEFAULTS.workstreams)
    setFocusTimeRatio(DEFAULTS.focusTimeRatio)
  }

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Box maxW="1100px" mx="auto" px={6} py={8}>
        {/* Header */}
        <Heading size="xl" fontWeight="bold" mb={2}>
          Designer Capacity Calculator
        </Heading>
        <Text fontSize="sm" color="gray.400" mb={10}>
          Estimate your realistic design time for any planning period.
        </Text>

        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8} alignItems="start">
          {/* LEFT — Summary + Status */}
          <GridItem>
            <Box bg="gray.800" border="1px solid" borderColor="gray.700" borderRadius="lg" p={5}>
              <Text fontWeight="semibold" fontSize="sm" color="gray.300" mb={4}>
                Your Capacity Summary
              </Text>
              <Text fontSize="xs" color="gray.500" mb={4}>
                Calculated based on your inputs
              </Text>
              <Flex direction="column" gap={3}>
                <MetricCard label="Base Weeks" value={availableWeeks.toFixed(1)} highlight />
                <MetricCard
                  label="Focus Weeks"
                  value={focusWeeks.toFixed(1)}
                  highlight
                  info="Available weeks × adjusted focus ratio"
                />
                <MetricCard label="Available Days" value={String(availableDays)} />
                <MetricCard label="Daily Focus Hours" value={dailyFocusHours.toFixed(1)} />
              </Flex>
            </Box>

            <CapacityStatus focusWeeks={focusWeeks} />
          </GridItem>

          {/* RIGHT — Inputs */}
          <GridItem>
            <Box bg="gray.800" border="1px solid" borderColor="gray.700" borderRadius="lg" p={5}>
              <Text fontWeight="semibold" fontSize="sm" color="gray.300" mb={1}>
                Your Capacity
              </Text>
              <Text fontSize="xs" color="gray.500" mb={6}>
                Adjust your planning period and availability
              </Text>

              <Flex direction="column" gap={5}>
                <StepInput
                  label="Planning Period (weeks)"
                  value={planningPeriodWeeks}
                  onChange={setPlanningPeriodWeeks}
                  min={1}
                />
                <StepInput
                  label="Days per Week"
                  value={daysPerWeek}
                  onChange={setDaysPerWeek}
                  min={1}
                />
                <StepInput label="Vacation / PTO Days" value={vacationDays} onChange={setVacationDays} />
                <StepInput
                  label="Company Holidays"
                  value={companyHolidays}
                  onChange={setCompanyHolidays}
                />
                <StepInput
                  label="Concurrent Workstreams"
                  value={workstreams}
                  onChange={setWorkstreams}
                  min={1}
                  hint="Number of projects you're working on simultaneously. More workstreams reduce focus time."
                />

                {/* Focus Time Ratio slider */}
                <FormControl>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.300">
                      Focus-Time Ratio
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold" color="cyan.400">
                      {Math.round(focusTimeRatio * 100)}%
                    </Text>
                  </Flex>
                  <Slider
                    min={20}
                    max={100}
                    step={1}
                    value={focusTimeRatio * 100}
                    onChange={(v) => setFocusTimeRatio(v / 100)}
                    focusThumbOnChange={false}
                  >
                    <SliderTrack bg="gray.600">
                      <SliderFilledTrack bg="cyan.400" />
                    </SliderTrack>
                    <SliderThumb boxSize={4} bg="cyan.400" />
                  </Slider>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Accounts for meetings, context switching, and interruptions. Lower = more overhead.
                  </Text>
                </FormControl>

                {/* Reset */}
                <Button
                  variant="ghost"
                  color="gray.400"
                  _hover={{ color: 'white', bg: 'gray.700' }}
                  leftIcon={<Text>↺</Text>}
                  onClick={handleReset}
                  size="sm"
                  alignSelf="center"
                  mt={2}
                >
                  Reset to Defaults
                </Button>
              </Flex>
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  )
}
