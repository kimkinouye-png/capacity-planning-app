import {
  FormControl,
  FormLabel,
  Checkbox,
  Textarea,
  Stack,
} from '@chakra-ui/react'
import type { ProductDesignInputs } from '../domain/types'

interface PDInputsFormProps {
  value: ProductDesignInputs
  onChange: (value: ProductDesignInputs) => void
}

export default function PDInputsForm({ value, onChange }: PDInputsFormProps) {
  const handleCheckboxChange = (field: keyof ProductDesignInputs, checked: boolean) => {
    onChange({ ...value, [field]: checked })
  }

  const handleTextChange = (field: keyof ProductDesignInputs, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue })
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
    </Stack>
  )
}
