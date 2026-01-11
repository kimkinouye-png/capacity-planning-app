import {
  FormControl,
  FormLabel,
  Checkbox,
  Textarea,
  Stack,
  Select,
  Text,
  Tooltip,
  HStack,
  IconButton,
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import type { ProductDesignInputs } from '../domain/types'
import { getFactorsForRole } from '../config/effortModel'

interface PDInputsFormProps {
  value: ProductDesignInputs
  onChange: (value: ProductDesignInputs) => void
}

export default function PDInputsForm({ value, onChange }: PDInputsFormProps) {
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
      <FormControl>
        <Checkbox
          isChecked={value.net_new_patterns || false}
          onChange={(e) => handleCheckboxChange('net_new_patterns', e.target.checked)}
        >
          Net New Patterns
        </Checkbox>
      </FormControl>

      <FormControl>
        <Checkbox
          isChecked={value.changes_to_information_architecture || false}
          onChange={(e) =>
            handleCheckboxChange('changes_to_information_architecture', e.target.checked)
          }
        >
          Changes to Information Architecture
        </Checkbox>
      </FormControl>

      <FormControl>
        <Checkbox
          isChecked={value.multiple_user_states_or_paths || false}
          onChange={(e) =>
            handleCheckboxChange('multiple_user_states_or_paths', e.target.checked)
          }
        >
          Multiple User States or Paths
        </Checkbox>
      </FormControl>

      <FormControl>
        <Checkbox
          isChecked={value.significant_edge_cases_or_error_handling || false}
          onChange={(e) =>
            handleCheckboxChange('significant_edge_cases_or_error_handling', e.target.checked)
          }
        >
          Significant Edge Cases or Error Handling
        </Checkbox>
      </FormControl>

      <FormControl>
        <Checkbox
          isChecked={value.responsive_or_adaptive_layouts || false}
          onChange={(e) =>
            handleCheckboxChange('responsive_or_adaptive_layouts', e.target.checked)
          }
        >
          Responsive or Adaptive Layouts
        </Checkbox>
      </FormControl>

      <FormControl>
        <FormLabel>Other</FormLabel>
        <Textarea
          value={value.other || ''}
          onChange={(e) => handleTextChange('other', e.target.value)}
          placeholder="Additional notes or considerations"
        />
      </FormControl>

      <Stack spacing={4} mt={6} pt={6} borderTop="1px" borderColor="gray.200">
        <Text fontWeight="bold" fontSize="md">
          UX Effort Factors (Score 1-5)
        </Text>
        {Object.entries(uxFactors).map(([factorName, factor]) => (
          <FormControl key={factorName}>
            <HStack>
              <FormLabel mb={0} flex={1}>
                {factor.label} <Text as="span" fontSize="xs" color="gray.500" fontWeight="normal">(Weight: {factor.weight.toFixed(1)})</Text>
              </FormLabel>
              <Tooltip label={factor.description} placement="top">
                <IconButton
                  aria-label="Factor description"
                  icon={<InfoIcon />}
                  size="xs"
                  variant="ghost"
                />
              </Tooltip>
            </HStack>
            <Select
              value={(value[factorName as keyof ProductDesignInputs] as number | undefined) || 3}
              onChange={(e) =>
                handleFactorScoreChange(factorName, parseInt(e.target.value, 10))
              }
            >
              <option value={1}>1 - Low</option>
              <option value={2}>2</option>
              <option value={3}>3 - Medium</option>
              <option value={4}>4</option>
              <option value={5}>5 - High</option>
            </Select>
          </FormControl>
        ))}
      </Stack>
    </Stack>
  )
}
