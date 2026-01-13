import {
  FormControl,
  FormLabel,
  Checkbox,
  Textarea,
  Stack,
  Text,
  Heading,
  Badge,
  Box,
  HStack,
  Button,
  VStack,
} from '@chakra-ui/react'
import type { ProductDesignInputs } from '../domain/types'
import { calculateEffort, type FactorScores } from '../config/effortModel'
import { estimateSprints, formatSprintEstimate } from '../config/sprints'

interface PDInputsFormProps {
  value: ProductDesignInputs
  onChange: (value: ProductDesignInputs) => void
  sizeBand?: 'XS' | 'S' | 'M' | 'L' | 'XL' // Optional size band for visual indicator
}

export default function PDInputsForm({ value, onChange }: PDInputsFormProps) {
  // Define the 3 factors to display (excluding Platform Complexity)
  const factorsToShow = [
    {
      key: 'productRisk' as const,
      label: 'Product Risk',
      weight: 1.2,
      helper: 'How risky is this for the product? High risk = major changes to core flows',
    },
    {
      key: 'problemAmbiguity' as const,
      label: 'Problem Ambiguity',
      weight: 1.0,
      helper: 'How well-defined is the problem? High ambiguity = need discovery',
    },
    {
      key: 'discoveryDepth' as const,
      label: 'Discovery Depth',
      weight: 0.9,
      helper: 'How much user research and discovery is needed? More discovery = higher score',
    },
  ]

  const handleCheckboxChange = (field: keyof ProductDesignInputs, checked: boolean) => {
    onChange({ ...value, [field]: checked })
  }

  const handleTextChange = (field: keyof ProductDesignInputs, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue })
  }

  const handleFactorScoreChange = (factorKey: string, score: number) => {
    onChange({ ...value, [factorKey]: score })
  }

  // Calculate UX effort estimate in real-time
  // Only uses the 3 visible factors: productRisk, problemAmbiguity, discoveryDepth
  const calculateUXEffort = () => {
    const scores: FactorScores = {
      productRisk: value.productRisk ?? 3,
      problemAmbiguity: value.problemAmbiguity ?? 3,
      discoveryDepth: value.discoveryDepth ?? 3,
    }
    return calculateEffort('ux', scores)
  }

  const uxEffort = calculateUXEffort()
  const sprintEstimate = estimateSprints(uxEffort.focusWeeks)

  return (
    <Stack spacing={4}>
      <FormControl textAlign="left">
        <Checkbox
          isChecked={value.net_new_patterns || false}
          onChange={(e) => handleCheckboxChange('net_new_patterns', e.target.checked)}
        >
          Net New Patterns
        </Checkbox>
      </FormControl>

      <FormControl textAlign="left">
        <Checkbox
          isChecked={value.changes_to_information_architecture || false}
          onChange={(e) =>
            handleCheckboxChange('changes_to_information_architecture', e.target.checked)
          }
        >
          Changes to Information Architecture
        </Checkbox>
      </FormControl>

      <FormControl textAlign="left">
        <Checkbox
          isChecked={value.multiple_user_states_or_paths || false}
          onChange={(e) =>
            handleCheckboxChange('multiple_user_states_or_paths', e.target.checked)
          }
        >
          Multiple User States or Paths
        </Checkbox>
      </FormControl>

      <FormControl textAlign="left">
        <Checkbox
          isChecked={value.significant_edge_cases_or_error_handling || false}
          onChange={(e) =>
            handleCheckboxChange('significant_edge_cases_or_error_handling', e.target.checked)
          }
        >
          Significant Edge Cases or Error Handling
        </Checkbox>
      </FormControl>

      <FormControl textAlign="left">
        <Checkbox
          isChecked={value.responsive_or_adaptive_layouts || false}
          onChange={(e) =>
            handleCheckboxChange('responsive_or_adaptive_layouts', e.target.checked)
          }
        >
          Responsive or Adaptive Layouts
        </Checkbox>
      </FormControl>

      <FormControl textAlign="left">
        <FormLabel textAlign="left">Other</FormLabel>
        <Textarea
          value={value.other || ''}
          onChange={(e) => handleTextChange('other', e.target.value)}
          placeholder="Additional notes or considerations"
        />
      </FormControl>

      <Stack spacing={6} mt={6} pt={6} borderTop="1px" borderColor="gray.200">
        <Heading size="md" as="h3" textAlign="left" fontSize="18px" fontWeight="bold">
          UX Complexity Factors
        </Heading>

        <Stack spacing={6}>
          {factorsToShow.map((factor) => {
          const currentScore = (value[factor.key] as number | undefined) || 3
          
          return (
            <FormControl key={factor.key} textAlign="left">
              <FormLabel mb={2} fontSize="16px" fontWeight="medium" color="gray.900">
                {factor.label} (×{factor.weight})
              </FormLabel>
              <Text fontSize="14px" color="#6B7280" mb={3} fontWeight="normal">
                {factor.helper}
              </Text>
              
              {/* Button row for 1-5 scores */}
              <HStack spacing={2}>
                {[1, 2, 3, 4, 5].map((score) => (
                  <Button
                    key={score}
                    onClick={() => handleFactorScoreChange(factor.key, score)}
                    w="80px"
                    h="40px"
                    fontSize="16px"
                    borderRadius="6px"
                    cursor="pointer"
                    bg={currentScore === score ? '#3B82F6' : 'white'}
                    color={currentScore === score ? 'white' : '#6B7280'}
                    border={currentScore === score ? 'none' : '1px solid #D1D5DB'}
                    _hover={{
                      bg: currentScore === score ? '#3B82F6' : '#F9FAFB',
                    }}
                    _active={{
                      bg: currentScore === score ? '#2563EB' : '#F3F4F6',
                    }}
                  >
                    {score}
                  </Button>
                ))}
              </HStack>
            </FormControl>
          )
        })}
        </Stack>

        {/* UX Effort Estimate Section */}
        <Box mt={8} p={6} bg="#EFF6FF" borderRadius="md">
          <VStack spacing={4} align="flex-start">
            <Box>
              <Heading size="sm" as="h4" fontSize="16px" fontWeight="bold" mb={1}>
                UX Effort Estimate
              </Heading>
              <Text fontSize="14px" color="gray.600">
                Real-time calculation based on complexity factors
              </Text>
            </Box>
            
            <HStack spacing={8} align="flex-start">
              <VStack spacing={1} align="flex-start">
                <Text fontSize="12px" color="gray.600" fontWeight="medium">
                  Size
                </Text>
                <Badge
                  colorScheme="yellow"
                  fontSize="16px"
                  w="40px"
                  h="40px"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="yellow.400"
                  color="gray.900"
                >
                  {uxEffort.sizeBand}
                </Badge>
              </VStack>
              
              <VStack spacing={1} align="flex-start">
                <Text fontSize="12px" color="gray.600" fontWeight="medium">
                  Focus Weeks
                </Text>
                <Text fontSize="18px" fontWeight="bold" color="gray.900">
                  {uxEffort.focusWeeks.toFixed(1)}
                </Text>
              </VStack>
              
              <VStack spacing={1} align="flex-start">
                <Text fontSize="12px" color="gray.600" fontWeight="medium">
                  Work Weeks
                </Text>
                <Text fontSize="18px" fontWeight="bold" color="gray.900">
                  {uxEffort.workWeeks.toFixed(1)}
                </Text>
              </VStack>
              
              <VStack spacing={1} align="flex-start">
                <Text fontSize="12px" color="gray.600" fontWeight="medium">
                  Sprint Estimate
                </Text>
                <Text fontSize="16px" color="gray.900">
                  {formatSprintEstimate(sprintEstimate)}
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Box>
      </Stack>
    </Stack>
  )
}
