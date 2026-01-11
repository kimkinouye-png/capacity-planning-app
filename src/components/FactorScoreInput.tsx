import {
  FormControl,
  FormLabel,
  Text,
  HStack,
  RadioGroup,
  Radio,
} from '@chakra-ui/react'

interface FactorDefinition {
  label: string
  description: string
  weight: number
}

interface FactorScoreInputProps {
  factorName: string
  factor: FactorDefinition
  value: number | undefined
  onChange: (score: number) => void
}

/**
 * Reusable component for displaying a factor score input.
 * Shows the factor label, weight, a 1-5 score selector (radio group or dropdown),
 * and helper text explaining what the factor measures.
 */
export default function FactorScoreInput({
  factorName,
  factor,
  value,
  onChange,
}: FactorScoreInputProps) {
  const currentValue = value || 3

  return (
    <FormControl textAlign="left">
      <FormLabel mb={2} textAlign="left">
        <HStack spacing={2} justify="flex-start" align="start">
          <Text textAlign="left">{factor.label}</Text>
          <Text as="span" fontSize="xs" color="gray.500" fontWeight="normal" textAlign="left">
            (×{factor.weight.toFixed(1)})
          </Text>
        </HStack>
      </FormLabel>
      
      {/* Radio button group for 1-5 score */}
      <RadioGroup
        value={currentValue.toString()}
        onChange={(value) => onChange(parseInt(value, 10))}
        mb={2}
      >
        <HStack spacing={4} wrap="wrap" justify="flex-start" align="start">
          {[1, 2, 3, 4, 5].map((score) => (
            <Radio key={score} value={score.toString()} size="md">
              <Text fontSize="sm" ml={1} textAlign="left">
                {score === 1 ? '1 - Low' : score === 3 ? '3 - Medium' : score === 5 ? '5 - High' : score}
              </Text>
            </Radio>
          ))}
        </HStack>
      </RadioGroup>
      
      {/* Helper text explaining what the factor measures */}
      <Text fontSize="xs" color="gray.600" mt={1} textAlign="left">
        {factor.description}
      </Text>
    </FormControl>
  )
}
