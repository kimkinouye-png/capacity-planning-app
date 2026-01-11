import {
  FormControl,
  FormLabel,
  Select,
  Checkbox,
  Stack,
  Text,
  Heading,
  Badge,
  Box,
  HStack,
} from '@chakra-ui/react'
import type { ContentDesignInputs } from '../domain/types'
import { getFactorsForRole } from '../config/effortModel'
import FactorScoreInput from './FactorScoreInput'

interface CDInputsFormProps {
  value: ContentDesignInputs
  onChange: (value: ContentDesignInputs) => void
  sizeBand?: 'XS' | 'S' | 'M' | 'L' | 'XL' // Optional size band for visual indicator
}

export default function CDInputsForm({ value, onChange, sizeBand }: CDInputsFormProps) {
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
      <FormControl textAlign="left">
        <FormLabel textAlign="left">Is Content Required</FormLabel>
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

      <FormControl textAlign="left">
        <Checkbox
          isChecked={value.financial_or_regulated_language || false}
          onChange={(e) =>
            handleCheckboxChange('financial_or_regulated_language', e.target.checked)
          }
        >
          Financial or Regulated Language
        </Checkbox>
      </FormControl>

      <FormControl textAlign="left">
        <Checkbox
          isChecked={value.user_commitments_or_confirmations || false}
          onChange={(e) =>
            handleCheckboxChange('user_commitments_or_confirmations', e.target.checked)
          }
        >
          User Commitments or Confirmations
        </Checkbox>
      </FormControl>

      <FormControl textAlign="left">
        <Checkbox
          isChecked={value.claims_guarantees_or_promises || false}
          onChange={(e) =>
            handleCheckboxChange('claims_guarantees_or_promises', e.target.checked)
          }
        >
          Claims, Guarantees, or Promises
        </Checkbox>
      </FormControl>

      <FormControl textAlign="left">
        <Checkbox
          isChecked={value.trust_sensitive_moments || false}
          onChange={(e) => handleCheckboxChange('trust_sensitive_moments', e.target.checked)}
        >
          Trust Sensitive Moments
        </Checkbox>
      </FormControl>

      <FormControl textAlign="left">
        <Checkbox
          isChecked={value.ai_driven_or_personalized_decisions || false}
          onChange={(e) =>
            handleCheckboxChange('ai_driven_or_personalized_decisions', e.target.checked)
          }
        >
          AI Driven or Personalized Decisions
        </Checkbox>
      </FormControl>

      <FormControl textAlign="left">
        <Checkbox
          isChecked={value.ranking_recommendations_or_explanations || false}
          onChange={(e) =>
            handleCheckboxChange('ranking_recommendations_or_explanations', e.target.checked)
          }
        >
          Ranking, Recommendations, or Explanations
        </Checkbox>
      </FormControl>

      <FormControl textAlign="left">
        <FormLabel textAlign="left">Legal Policy or Compliance Review</FormLabel>
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

      <FormControl textAlign="left">
        <Checkbox
          isChecked={value.introducing_new_terminology || false}
          onChange={(e) =>
            handleCheckboxChange('introducing_new_terminology', e.target.checked)
          }
        >
          Introducing New Terminology
        </Checkbox>
      </FormControl>

      <FormControl textAlign="left">
        <FormLabel textAlign="left">Guidance Needed</FormLabel>
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
        <Box textAlign="left">
          <HStack spacing={3} mb={4} justify="flex-start" align="start">
            <Heading size="sm" as="h3" textAlign="left">
              Content Effort Factors
            </Heading>
            {sizeBand && (
              <Badge colorScheme="green" fontSize="md" px={2} py={1}>
                Size: {sizeBand}
              </Badge>
            )}
          </HStack>
          <Text fontSize="sm" color="gray.600" mb={4} textAlign="left">
            Score each factor from 1 (Low) to 5 (High) to estimate Content design effort.
          </Text>
        </Box>
        {Object.entries(contentFactors).map(([factorName, factor]) => (
          <FactorScoreInput
            key={factorName}
            factorName={factorName}
            factor={factor}
            value={(value[factorName as keyof ContentDesignInputs] as number | undefined) || 3}
            onChange={(score) => handleFactorScoreChange(factorName, score)}
          />
        ))}
      </Stack>
    </Stack>
  )
}
