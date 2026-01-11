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
} from '@chakra-ui/react'
import type { ProductDesignInputs } from '../domain/types'
import { getFactorsForRole } from '../config/effortModel'
import FactorScoreInput from './FactorScoreInput'

interface PDInputsFormProps {
  value: ProductDesignInputs
  onChange: (value: ProductDesignInputs) => void
  sizeBand?: 'XS' | 'S' | 'M' | 'L' | 'XL' // Optional size band for visual indicator
}

export default function PDInputsForm({ value, onChange, sizeBand }: PDInputsFormProps) {
  const uxFactors = getFactorsForRole('ux')

  const handleCheckboxChange = (field: keyof ProductDesignInputs, checked: boolean) => {
    onChange({ ...value, [field]: checked })
  }

  const handleTextChange = (field: keyof ProductDesignInputs, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue })
  }

  const handleFactorScoreChange = (factorName: string, score: number) => {
    onChange({ ...value, [factorName]: score })
  }

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

      <Stack spacing={4} mt={6} pt={6} borderTop="1px" borderColor="gray.200">
        <Box textAlign="left">
          <HStack spacing={3} mb={4} justify="flex-start" align="start">
            <Heading size="sm" as="h3" textAlign="left">
              UX Complexity Factors
            </Heading>
            {sizeBand && (
              <Badge colorScheme="blue" fontSize="md" px={2} py={1}>
                Size: {sizeBand}
              </Badge>
            )}
          </HStack>
          <Text fontSize="sm" color="gray.600" mb={4} textAlign="left">
            Score each factor from 1 (Low) to 5 (High) to estimate UX design complexity.
          </Text>
        </Box>
        {Object.entries(uxFactors).map(([factorName, factor]) => (
          <FactorScoreInput
            key={factorName}
            factorName={factorName}
            factor={factor}
            value={(value[factorName as keyof ProductDesignInputs] as number | undefined) || 3}
            onChange={(score) => handleFactorScoreChange(factorName, score)}
          />
        ))}
      </Stack>
    </Stack>
  )
}
