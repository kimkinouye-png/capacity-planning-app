import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from '@chakra-ui/react'
import { useState } from 'react'

export default function CapacityCalculatorPage() {
  const daysPerWeek = 5
  const workstreamPenalty = 0.10

  const [planningPeriodWeeks, setPlanningPeriodWeeks] = useState(13)
  const [vacationDays, setVacationDays] = useState(5)
  const [companyHolidays, setCompanyHolidays] = useState(10)
  const [focusTimeRatio, setFocusTimeRatio] = useState(0.75)
  const [workstreams, setWorkstreams] = useState(2)

  const availableDays = planningPeriodWeeks * daysPerWeek - vacationDays - companyHolidays
  const availableWeeks = availableDays / daysPerWeek
  const workWeeks = availableWeeks
  const additionalWorkstreams = Math.max(0, workstreams - 1)
  const workstreamImpact = additionalWorkstreams * workstreamPenalty
  const adjustedFocusTimeRatio = Math.max(0.2, focusTimeRatio - workstreamImpact)
  const focusWeeks = workWeeks * adjustedFocusTimeRatio
  const dailyFocusHours = availableDays > 0 ? (focusWeeks * 5 * 8) / availableDays : 0

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1200px" mx="auto">
      <Heading size="lg" mb={6} color="gray.800" _dark={{ color: 'gray.100' }}>
        Capacity Calculator
      </Heading>
      <Text
        fontSize="md"
        color="gray.600"
        _dark={{ color: 'gray.400' }}
        mb={6}
      >
        Estimate individual designer capacity for a planning period
      </Text>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} alignItems="start">
        <VStack align="stretch" spacing={5}>
          <FormControl>
            <FormLabel color="gray.700" _dark={{ color: 'gray.300' }}>
              Planning period (weeks)
            </FormLabel>
            <NumberInput
              value={planningPeriodWeeks}
              onChange={(_, v) => setPlanningPeriodWeeks(Number.isFinite(v) ? v : 13)}
              min={1}
            >
              <NumberInputField bg="white" _dark={{ bg: 'gray.800' }} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel color="gray.700" _dark={{ color: 'gray.300' }}>
              Vacation days
            </FormLabel>
            <NumberInput
              value={vacationDays}
              onChange={(_, v) => setVacationDays(Number.isFinite(v) ? v : 5)}
              min={0}
            >
              <NumberInputField bg="white" _dark={{ bg: 'gray.800' }} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel color="gray.700" _dark={{ color: 'gray.300' }}>
              Company holidays
            </FormLabel>
            <NumberInput
              value={companyHolidays}
              onChange={(_, v) => setCompanyHolidays(Number.isFinite(v) ? v : 10)}
              min={0}
            >
              <NumberInputField bg="white" _dark={{ bg: 'gray.800' }} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel color="gray.700" _dark={{ color: 'gray.300' }}>
              Focus time ({Math.round(focusTimeRatio * 100)}%)
            </FormLabel>
            <Slider
              aria-label="Focus time percentage"
              value={focusTimeRatio * 100}
              min={20}
              max={100}
              step={1}
              onChange={(v) => setFocusTimeRatio(v / 100)}
            >
              <SliderTrack bg="gray.200" _dark={{ bg: 'gray.600' }}>
                <SliderFilledTrack bg="blue.500" />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </FormControl>

          <FormControl>
            <FormLabel color="gray.700" _dark={{ color: 'gray.300' }}>
              Workstreams
            </FormLabel>
            <NumberInput
              value={workstreams}
              onChange={(_, v) => setWorkstreams(Number.isFinite(v) ? Math.max(1, v) : 2)}
              min={1}
            >
              <NumberInputField bg="white" _dark={{ bg: 'gray.800' }} />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
        </VStack>

        <Box
          bg="gray.50"
          _dark={{ bg: 'gray.700' }}
          p={4}
          borderRadius="md"
          alignSelf="stretch"
        >
          <VStack align="stretch" spacing={5}>
            <Box>
              <Text color="gray.500" fontSize="sm">
                Available Days
              </Text>
              <Heading size="md" color="gray.800" _dark={{ color: 'gray.100' }}>
                {availableDays}
              </Heading>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">
                Work Weeks
              </Text>
              <Heading size="md" color="gray.800" _dark={{ color: 'gray.100' }}>
                {availableWeeks.toFixed(1)}
              </Heading>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">
                Adjusted Focus Ratio
              </Text>
              <Heading size="md" color="gray.800" _dark={{ color: 'gray.100' }}>
                {(adjustedFocusTimeRatio * 100).toFixed(1)}%
              </Heading>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">
                Focus Weeks
              </Text>
              <Heading size="md" color="gray.800" _dark={{ color: 'gray.100' }}>
                {focusWeeks.toFixed(2)}
              </Heading>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">
                Daily Focus Hours
              </Text>
              <Heading size="md" color="gray.800" _dark={{ color: 'gray.100' }}>
                {dailyFocusHours.toFixed(1)}
              </Heading>
            </Box>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  )
}
