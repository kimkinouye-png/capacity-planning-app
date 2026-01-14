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
  Button,
  VStack,
} from '@chakra-ui/react'
import type { ContentDesignInputs } from '../domain/types'
import { calculateEffort, type FactorScores } from '../config/effortModel'
import { estimateSprints, formatSprintEstimate } from '../config/sprints'

interface CDInputsFormProps {
  value: ContentDesignInputs
  onChange: (value: ContentDesignInputs) => void
  sizeBand?: 'XS' | 'S' | 'M' | 'L' | 'XL' // Optional size band for visual indicator
}

export default function CDInputsForm({ value, onChange }: CDInputsFormProps) {
  // Define the 4 Content factors to display
  const factorsToShow = [
    {
      key: 'contentSurfaceArea' as const,
      label: 'Content Surface Area',
      weight: 1.3,
      helper: 'How much content is needed? More screens/messages = higher surface area',
    },
    {
      key: 'localizationScope' as const,
      label: 'Localization Scope',
      weight: 1.0,
      helper: 'Complexity of localization beyond just translation (cultural adaptation, regional variants)',
    },
    {
      key: 'regulatoryBrandRisk' as const,
      label: 'Regulatory & Brand Risk',
      weight: 1.2,
      helper: 'How sensitive is the content? High risk = more review cycles',
    },
    {
      key: 'legalComplianceDependency' as const,
      label: 'Legal Compliance Dependency',
      weight: 1.1,
      helper: 'How much legal review is required? More compliance = higher effort',
    },
  ]

  const handleSelectChange = (
    field: keyof ContentDesignInputs,
    fieldValue: string
  ) => {
    onChange({ ...value, [field]: fieldValue })
  }

  const handleCheckboxChange = (field: keyof ContentDesignInputs, checked: boolean) => {
    onChange({ ...value, [field]: checked })
  }

  const handleFactorScoreChange = (factorKey: string, score: number) => {
    onChange({ ...value, [factorKey]: score })
  }

  // Calculate Content effort estimate in real-time
  const calculateContentEffort = () => {
    const scores: FactorScores = {
      contentSurfaceArea: value.contentSurfaceArea ?? 3,
      localizationScope: value.localizationScope ?? 3,
      regulatoryBrandRisk: value.regulatoryBrandRisk ?? 3,
      legalComplianceDependency: value.legalComplianceDependency ?? 3,
    }
    return calculateEffort('content', scores)
  }

  const contentEffort = calculateContentEffort()
  const sprintEstimate = estimateSprints(contentEffort.focusWeeks)

  return (
    <Stack spacing={4}>
      <FormControl textAlign="left">
        <FormLabel textAlign="left" color="gray.300">Is Content Required</FormLabel>
        <Select
          bg="#1a1a20"
          borderColor="rgba(255, 255, 255, 0.1)"
          color="white"
          _focus={{ borderColor: '#00d9ff', boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)' }}
          value={value.is_content_required || 'yes'}
          onChange={(e) =>
            handleSelectChange('is_content_required', e.target.value as 'yes' | 'no' | 'unsure')
          }
        >
          <option value="yes" style={{ background: '#1a1a20', color: 'white' }}>Yes</option>
          <option value="no" style={{ background: '#1a1a20', color: 'white' }}>No</option>
          <option value="unsure" style={{ background: '#1a1a20', color: 'white' }}>Unsure</option>
        </Select>
      </FormControl>

      <FormControl textAlign="left">
        <Checkbox
          colorScheme="cyan"
          color="gray.300"
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
          colorScheme="cyan"
          color="gray.300"
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
          colorScheme="cyan"
          color="gray.300"
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
          colorScheme="cyan"
          color="gray.300"
          isChecked={value.trust_sensitive_moments || false}
          onChange={(e) => handleCheckboxChange('trust_sensitive_moments', e.target.checked)}
        >
          Trust Sensitive Moments
        </Checkbox>
      </FormControl>

      <FormControl textAlign="left">
        <Checkbox
          colorScheme="cyan"
          color="gray.300"
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
          colorScheme="cyan"
          color="gray.300"
          isChecked={value.ranking_recommendations_or_explanations || false}
          onChange={(e) =>
            handleCheckboxChange('ranking_recommendations_or_explanations', e.target.checked)
          }
        >
          Ranking, Recommendations, or Explanations
        </Checkbox>
      </FormControl>

      <FormControl textAlign="left">
        <FormLabel textAlign="left" color="gray.300">Legal Policy or Compliance Review</FormLabel>
        <Select
          bg="#1a1a20"
          borderColor="rgba(255, 255, 255, 0.1)"
          color="white"
          _focus={{ borderColor: '#00d9ff', boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)' }}
          value={value.legal_policy_or_compliance_review || 'no'}
          onChange={(e) =>
            handleSelectChange(
              'legal_policy_or_compliance_review',
              e.target.value as 'yes' | 'no' | 'unsure'
            )
          }
        >
          <option value="yes" style={{ background: '#1a1a20', color: 'white' }}>Yes</option>
          <option value="no" style={{ background: '#1a1a20', color: 'white' }}>No</option>
          <option value="unsure" style={{ background: '#1a1a20', color: 'white' }}>Unsure</option>
        </Select>
      </FormControl>

      <FormControl textAlign="left">
        <Checkbox
          colorScheme="cyan"
          color="gray.300"
          isChecked={value.introducing_new_terminology || false}
          onChange={(e) =>
            handleCheckboxChange('introducing_new_terminology', e.target.checked)
          }
        >
          Introducing New Terminology
        </Checkbox>
      </FormControl>

      <FormControl textAlign="left">
        <FormLabel textAlign="left" color="gray.300">Guidance Needed</FormLabel>
        <Select
          bg="#1a1a20"
          borderColor="rgba(255, 255, 255, 0.1)"
          color="white"
          _focus={{ borderColor: '#00d9ff', boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)' }}
          value={value.guidance_needed || 'minimal'}
          onChange={(e) =>
            handleSelectChange('guidance_needed', e.target.value as 'high' | 'some' | 'minimal')
          }
        >
          <option value="high" style={{ background: '#1a1a20', color: 'white' }}>High</option>
          <option value="some" style={{ background: '#1a1a20', color: 'white' }}>Some</option>
          <option value="minimal" style={{ background: '#1a1a20', color: 'white' }}>Minimal</option>
        </Select>
      </FormControl>

      <Stack spacing={6} mt={6} pt={6} borderTop="1px" borderColor="rgba(255, 255, 255, 0.1)">
        <Heading size="md" as="h3" textAlign="left" fontSize="18px" fontWeight="bold" color="white">
          Content Effort Factors
        </Heading>

        <Stack spacing={6}>
          {factorsToShow.map((factor) => {
            const currentScore = (value[factor.key] as number | undefined) || 3
            
            return (
              <FormControl key={factor.key} textAlign="left">
                <FormLabel mb={2} fontSize="16px" fontWeight="medium" color="white">
                  {factor.label} (×{factor.weight})
                </FormLabel>
                <Text fontSize="14px" color="gray.300" mb={3} fontWeight="normal">
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
                      bg={currentScore === score ? 'linear-gradient(to right, #00b8d9, #1e40af)' : '#1a1a20'}
                      color={currentScore === score ? 'white' : 'gray.300'}
                      border={currentScore === score ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'}
                      textShadow={currentScore === score ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none'}
                      _hover={{
                        bg: currentScore === score ? 'linear-gradient(to right, #00a3c4, #1e3a8a)' : 'rgba(255, 255, 255, 0.05)',
                      }}
                      _active={{
                        bg: currentScore === score ? 'linear-gradient(to right, #0099b3, #1e3a8a)' : 'rgba(255, 255, 255, 0.1)',
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

        {/* Content Effort Estimate Section */}
        <Box mt={8} p={6} bg="#1a1a20" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)" borderRadius="md">
          <VStack spacing={4} align="flex-start">
            <Box>
              <Heading size="sm" as="h4" fontSize="16px" fontWeight="bold" mb={1} color="white">
                Content Effort Estimate
              </Heading>
              <Text fontSize="14px" color="gray.300">
                Real-time calculation based on complexity factors
              </Text>
            </Box>
            
            <HStack spacing={8} align="flex-start">
              <VStack spacing={1} align="flex-start">
                <Text fontSize="12px" color="gray.400" fontWeight="medium">
                  Size
                </Text>
                <Badge
                  fontSize="16px"
                  w="40px"
                  h="40px"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg="rgba(245, 158, 11, 0.1)"
                  color="#f59e0b"
                  border="1px solid"
                  borderColor="rgba(245, 158, 11, 0.5)"
                >
                  {contentEffort.sizeBand}
                </Badge>
              </VStack>
              
              <VStack spacing={1} align="flex-start">
                <Text fontSize="12px" color="gray.400" fontWeight="medium">
                  Focus Weeks
                </Text>
                <Text fontSize="18px" fontWeight="bold" color="white">
                  {contentEffort.focusWeeks.toFixed(1)}
                </Text>
              </VStack>
              
              <VStack spacing={1} align="flex-start">
                <Text fontSize="12px" color="gray.400" fontWeight="medium">
                  Work Weeks
                </Text>
                <Text fontSize="18px" fontWeight="bold" color="white">
                  {contentEffort.workWeeks.toFixed(1)}
                </Text>
              </VStack>
              
              <VStack spacing={1} align="flex-start">
                <Text fontSize="12px" color="gray.400" fontWeight="medium">
                  Sprint Estimate
                </Text>
                <Text fontSize="16px" color="gray.300">
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
