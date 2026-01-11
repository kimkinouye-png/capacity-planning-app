import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
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

  return (
    <Stack spacing={4}>
      <FormControl>
        <FormLabel>Objective</FormLabel>
        <Textarea
          value={value.objective || ''}
          onChange={(e) => handleChange('objective', e.target.value)}
          placeholder="Describe the objective of this roadmap item"
        />
      </FormControl>

      <FormControl>
        <FormLabel>KPIs</FormLabel>
        <Textarea
          value={value.kpis || ''}
          onChange={(e) => handleChange('kpis', e.target.value)}
          placeholder='Enter KPIs as JSON array, e.g., ["Metric 1", "Metric 2"]'
        />
      </FormControl>

      {/* Goals field hidden from UI but preserved in data structure for backwards compatibility */}
      {/* {value.goals !== undefined && (
        <FormControl>
          <FormLabel>Goals</FormLabel>
          <Textarea
            value={value.goals || ''}
            onChange={(e) => handleChange('goals', e.target.value)}
            placeholder="Describe the goals"
          />
        </FormControl>
      )} */}

      <FormControl>
        <FormLabel>Market</FormLabel>
        <Input
          value={value.market || ''}
          onChange={(e) => handleChange('market', e.target.value)}
          placeholder="e.g., US, UK, Canada"
        />
      </FormControl>

      <FormControl>
        <FormLabel>Audience</FormLabel>
        <Input
          value={value.audience || ''}
          onChange={(e) => handleChange('audience', e.target.value)}
          placeholder="e.g., Millennials and Gen Z shoppers"
        />
      </FormControl>

      <FormControl>
        <FormLabel>Timeline</FormLabel>
        <Input
          value={value.timeline || ''}
          onChange={(e) => handleChange('timeline', e.target.value)}
          placeholder="e.g., Q2 2026"
        />
      </FormControl>

      <FormControl>
        <FormLabel>Business Requirements</FormLabel>
        <Textarea
          value={value.requirements_business || ''}
          onChange={(e) => handleChange('requirements_business', e.target.value)}
          placeholder="Describe business requirements"
        />
      </FormControl>

      <FormControl>
        <FormLabel>Technical Requirements</FormLabel>
        <Textarea
          value={value.requirements_technical || ''}
          onChange={(e) => handleChange('requirements_technical', e.target.value)}
          placeholder="Describe technical requirements"
        />
      </FormControl>

      <FormControl>
        <FormLabel>Design Requirements</FormLabel>
        <Textarea
          value={value.requirements_design || ''}
          onChange={(e) => handleChange('requirements_design', e.target.value)}
          placeholder="Describe design requirements"
        />
      </FormControl>

      <FormControl>
        <FormLabel>Surfaces in Scope</FormLabel>
        <Stack spacing={2} mt={2}>
          <Checkbox
            isChecked={(value.surfaces_in_scope || []).includes('Checkout')}
            onChange={(e) => handleSurfacesChange('Checkout', e.target.checked)}
          >
            Checkout
          </Checkbox>
          <Checkbox
            isChecked={(value.surfaces_in_scope || []).includes('Account')}
            onChange={(e) => handleSurfacesChange('Account', e.target.checked)}
          >
            Account
          </Checkbox>
          <Checkbox
            isChecked={(value.surfaces_in_scope || []).includes('Emails')}
            onChange={(e) => handleSurfacesChange('Emails', e.target.checked)}
          >
            Emails
          </Checkbox>
          <Checkbox
            isChecked={(value.surfaces_in_scope || []).includes('Notifications')}
            onChange={(e) => handleSurfacesChange('Notifications', e.target.checked)}
          >
            Notifications
          </Checkbox>
          <Checkbox
            isChecked={(value.surfaces_in_scope || []).includes('Mobile App')}
            onChange={(e) => handleSurfacesChange('Mobile App', e.target.checked)}
          >
            Mobile App
          </Checkbox>
          <Checkbox
            isChecked={(value.surfaces_in_scope || []).includes('Web App')}
            onChange={(e) => handleSurfacesChange('Web App', e.target.checked)}
          >
            Web App
          </Checkbox>
          <Checkbox
            isChecked={(value.surfaces_in_scope || []).includes('Other')}
            onChange={(e) => handleSurfacesChange('Other', e.target.checked)}
          >
            Other
          </Checkbox>
        </Stack>
      </FormControl>

      <FormControl>
        <FormLabel>New or Existing</FormLabel>
        <Select
          value={value.new_or_existing || 'existing'}
          onChange={(e) => handleChange('new_or_existing', e.target.value as 'new' | 'existing')}
        >
          <option value="new">New</option>
          <option value="existing">Existing</option>
        </Select>
      </FormControl>
    </Stack>
  )
}
