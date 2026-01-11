import {
  FormControl,
  FormLabel,
  Select,
  Checkbox,
  Stack,
  Text,
  Tooltip,
  HStack,
  IconButton,
} from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import type { ContentDesignInputs } from '../domain/types'
import { getFactorsForRole } from '../config/effortModel'

interface CDInputsFormProps {
  value: ContentDesignInputs
  onChange: (value: ContentDesignInputs) => void
}

export default function CDInputsForm({ value, onChange }: CDInputsFormProps) {
  const contentFactors = getFactorsForRole('content')

  const handleSelectChange = (
    field: keyof ContentDesignInputs,
    fieldValue: string
  ) => {
    onChange({ ...value, [field]: fieldValue })
  }

  const handleCheckboxChange = (field: keyof ContentDesignInputs, checked: boolean) => {
    onChange({ ...value, [field]: checked })
  }

  const handleFactorScoreChange = (factorName: string, score: number) => {
    onChange({ ...value, [factorName]: score })
  }

  return (
    <Stack spacing={4}>
      <FormControl>
        <FormLabel>Is Content Required</FormLabel>
        <Select
          value={value.is_content_required || 'yes'}
          onChange={(e) =>
            handleSelectChange('is_content_required', e.target.value as 'yes' | 'no' | 'unsure')
          }
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="unsure">Unsure</option>
        </Select>
      </FormControl>

      <FormControl>
        <Checkbox
          isChecked={value.financial_or_regulated_language || false}
          onChange={(e) =>
            handleCheckboxChange('financial_or_regulated_language', e.target.checked)
          }
        >
          Financial or Regulated Language
        </Checkbox>
      </FormControl>

      <FormControl>
        <Checkbox
          isChecked={value.user_commitments_or_confirmations || false}
          onChange={(e) =>
            handleCheckboxChange('user_commitments_or_confirmations', e.target.checked)
          }
        >
          User Commitments or Confirmations
        </Checkbox>
      </FormControl>

      <FormControl>
        <Checkbox
          isChecked={value.claims_guarantees_or_promises || false}
          onChange={(e) =>
            handleCheckboxChange('claims_guarantees_or_promises', e.target.checked)
          }
        >
          Claims, Guarantees, or Promises
        </Checkbox>
      </FormControl>

      <FormControl>
        <Checkbox
          isChecked={value.trust_sensitive_moments || false}
          onChange={(e) => handleCheckboxChange('trust_sensitive_moments', e.target.checked)}
        >
          Trust Sensitive Moments
        </Checkbox>
      </FormControl>

      <FormControl>
        <Checkbox
          isChecked={value.ai_driven_or_personalized_decisions || false}
          onChange={(e) =>
            handleCheckboxChange('ai_driven_or_personalized_decisions', e.target.checked)
          }
        >
          AI Driven or Personalized Decisions
        </Checkbox>
      </FormControl>

      <FormControl>
        <Checkbox
          isChecked={value.ranking_recommendations_or_explanations || false}
          onChange={(e) =>
            handleCheckboxChange('ranking_recommendations_or_explanations', e.target.checked)
          }
        >
          Ranking, Recommendations, or Explanations
        </Checkbox>
      </FormControl>

      <FormControl>
        <FormLabel>Legal Policy or Compliance Review</FormLabel>
        <Select
          value={value.legal_policy_or_compliance_review || 'no'}
          onChange={(e) =>
            handleSelectChange(
              'legal_policy_or_compliance_review',
              e.target.value as 'yes' | 'no' | 'unsure'
            )
          }
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="unsure">Unsure</option>
        </Select>
      </FormControl>

      <FormControl>
        <Checkbox
          isChecked={value.introducing_new_terminology || false}
          onChange={(e) =>
            handleCheckboxChange('introducing_new_terminology', e.target.checked)
          }
        >
          Introducing New Terminology
        </Checkbox>
      </FormControl>

      <FormControl>
        <FormLabel>Guidance Needed</FormLabel>
        <Select
          value={value.guidance_needed || 'minimal'}
          onChange={(e) =>
            handleSelectChange('guidance_needed', e.target.value as 'high' | 'some' | 'minimal')
          }
        >
          <option value="high">High</option>
          <option value="some">Some</option>
          <option value="minimal">Minimal</option>
        </Select>
      </FormControl>

      <Stack spacing={4} mt={6} pt={6} borderTop="1px" borderColor="gray.200">
        <Text fontWeight="bold" fontSize="md">
          Content Effort Factors (Score 1-5)
        </Text>
        {Object.entries(contentFactors).map(([factorName, factor]) => (
          <FormControl key={factorName}>
            <HStack>
              <FormLabel mb={0} flex={1}>
                {factor.label}
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
              value={(value[factorName as keyof ContentDesignInputs] as number | undefined) || 3}
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
