import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Stack,
  Checkbox,
} from '@chakra-ui/react'
import type { PMIntake } from '../domain/types'

interface PMIntakeFormProps {
  value: PMIntake
  onChange: (value: PMIntake) => void
}

export default function PMIntakeForm({ value, onChange }: PMIntakeFormProps) {
  const handleChange = (field: keyof PMIntake, fieldValue: string) => {
    onChange({ ...value, [field]: fieldValue })
  }

  const handleSurfacesChange = (surface: string, isChecked: boolean) => {
    const currentSurfaces = value.surfaces_in_scope || []
    const updatedSurfaces = isChecked
      ? [...currentSurfaces, surface]
      : currentSurfaces.filter((s) => s !== surface)
    onChange({ ...value, surfaces_in_scope: updatedSurfaces })
  }

  const handleNewOrExistingChange = (option: 'new' | 'existing') => {
    onChange({ ...value, new_or_existing: option })
  }


  // Shared textarea styles
  const textareaStyles = {
    bg: '#F3F4F6',
    borderRadius: '6px',
    border: 'none',
    p: '12px',
    _focus: {
      outline: 'none',
      boxShadow: '0 0 0 2px #3B82F6',
    },
  }

  // Shared label styles
  const labelStyles = {
    textAlign: 'left' as const,
    fontWeight: 500,
    color: '#374151',
    mb: '6px',
  }

  return (
    <Stack spacing={6}>
      <FormControl>
        <FormLabel {...labelStyles}>Objective</FormLabel>
        <Textarea
          {...textareaStyles}
          value={value.objective || ''}
          onChange={(e) => handleChange('objective', e.target.value)}
          placeholder="Describe the objective of this roadmap item"
        />
      </FormControl>

      <FormControl>
        <FormLabel {...labelStyles}>KPIs</FormLabel>
        <Textarea
          {...textareaStyles}
          value={value.kpis || ''}
          onChange={(e) => handleChange('kpis', e.target.value)}
          placeholder='Enter KPIs as JSON array, e.g., ["Metric 1", "Metric 2"]'
        />
      </FormControl>

      <FormControl>
        <FormLabel {...labelStyles}>Market</FormLabel>
        <Textarea
          {...textareaStyles}
          value={value.market || ''}
          onChange={(e) => handleChange('market', e.target.value)}
          placeholder="e.g., US, UK, Canada"
        />
      </FormControl>

      <FormControl>
        <FormLabel {...labelStyles}>Audience</FormLabel>
        <Textarea
          {...textareaStyles}
          value={value.audience || ''}
          onChange={(e) => handleChange('audience', e.target.value)}
          placeholder="e.g., Millennials and Gen Z shoppers"
        />
      </FormControl>

      <FormControl>
        <FormLabel {...labelStyles}>Desired Launch Date</FormLabel>
        <Input
          type="date"
          value={value.timeline || ''}
          onChange={(e) => handleChange('timeline', e.target.value)}
          bg="#F3F4F6"
          borderRadius="6px"
          border="none"
          p="12px"
          h="auto"
          _focus={{
            outline: 'none',
            boxShadow: '0 0 0 2px #3B82F6',
          }}
        />
      </FormControl>

      <FormControl>
        <FormLabel {...labelStyles}>Business Requirements</FormLabel>
        <Textarea
          {...textareaStyles}
          value={value.requirements_business || ''}
          onChange={(e) => handleChange('requirements_business', e.target.value)}
          placeholder="Describe business requirements"
        />
      </FormControl>

      <FormControl>
        <FormLabel {...labelStyles}>Technical Requirements</FormLabel>
        <Textarea
          {...textareaStyles}
          value={value.requirements_technical || ''}
          onChange={(e) => handleChange('requirements_technical', e.target.value)}
          placeholder="Describe technical requirements"
        />
      </FormControl>

      <FormControl>
        <FormLabel {...labelStyles}>Design Requirements</FormLabel>
        <Textarea
          {...textareaStyles}
          value={value.requirements_design || ''}
          onChange={(e) => handleChange('requirements_design', e.target.value)}
          placeholder="Describe design requirements"
        />
      </FormControl>

      <FormControl>
        <FormLabel {...labelStyles}>Surfaces in Scope</FormLabel>
        <Stack spacing={3} mt={2} align="flex-start">
          <Checkbox
            size="md"
            colorScheme="blue"
            isChecked={(value.surfaces_in_scope || []).includes('Mobile iOS')}
            onChange={(e) => handleSurfacesChange('Mobile iOS', e.target.checked)}
          >
            Mobile iOS
          </Checkbox>
          <Checkbox
            size="md"
            colorScheme="blue"
            isChecked={(value.surfaces_in_scope || []).includes('Mobile Android')}
            onChange={(e) => handleSurfacesChange('Mobile Android', e.target.checked)}
          >
            Mobile Android
          </Checkbox>
          <Checkbox
            size="md"
            colorScheme="blue"
            isChecked={(value.surfaces_in_scope || []).includes('Mobile Web')}
            onChange={(e) => handleSurfacesChange('Mobile Web', e.target.checked)}
          >
            Mobile Web
          </Checkbox>
          <Checkbox
            size="md"
            colorScheme="blue"
            isChecked={(value.surfaces_in_scope || []).includes('Web')}
            onChange={(e) => handleSurfacesChange('Web', e.target.checked)}
          >
            Web
          </Checkbox>
        </Stack>
      </FormControl>

      <FormControl>
        <FormLabel {...labelStyles}>New or Existing</FormLabel>
        <Stack spacing={3} mt={2} align="flex-start">
          <Checkbox
            size="md"
            colorScheme="blue"
            isChecked={value.new_or_existing === 'new'}
            onChange={() => handleNewOrExistingChange('new')}
          >
            New
          </Checkbox>
          <Checkbox
            size="md"
            colorScheme="blue"
            isChecked={value.new_or_existing === 'existing'}
            onChange={() => handleNewOrExistingChange('existing')}
          >
            Existing
          </Checkbox>
        </Stack>
      </FormControl>
    </Stack>
  )
}
