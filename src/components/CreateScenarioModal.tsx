import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stack,
  Button,
  Text,
  Select,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlanningSessions } from '../context/PlanningSessionsContext'
import type { PlanningPeriod } from '../domain/types'
import { getWeeksForPeriod } from '../config/quarterConfig'
import { SPRINT_LENGTH_WEEKS } from '../config/sprints'

const QUARTER_OPTIONS: PlanningPeriod[] = ['2026-Q1', '2026-Q2', '2026-Q3', '2026-Q4']

interface CreateScenarioModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateScenarioModal({ isOpen, onClose }: CreateScenarioModalProps) {
  const navigate = useNavigate()
  const { createSession } = usePlanningSessions()
  const [formData, setFormData] = useState({
    name: '',
    planningPeriod: '2026-Q4' as PlanningPeriod,
    ux_designers: 3,
    content_designers: 2,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const weeksPerPeriod = getWeeksForPeriod(formData.planningPeriod)
    
    try {
      const newSession = await createSession({
        name: formData.name,
        planningPeriod: formData.planningPeriod,
        weeks_per_period: weeksPerPeriod,
        sprint_length_weeks: SPRINT_LENGTH_WEEKS,
        ux_designers: formData.ux_designers,
        content_designers: formData.content_designers,
      })
      
      onClose()
      setFormData({
        name: '',
        planningPeriod: '2026-Q4',
        ux_designers: 3,
        content_designers: 2,
      })
      navigate(`/sessions/${newSession.id}`)
    } catch (error) {
      console.error('Error creating scenario:', error)
      // Error is handled by context fallback, but we can show a toast if needed
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(4px)" />
      <ModalContent
        bg="#141419"
        border="1px solid"
        borderColor="rgba(255, 255, 255, 0.1)"
        boxShadow="0 25px 50px -12px rgba(0, 217, 255, 0.2)"
      >
        <form onSubmit={handleSubmit}>
          <ModalHeader
            fontSize="lg"
            fontWeight="bold"
            color="white"
            borderBottom="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            px={6}
            py={4}
          >
            Create New Scenario
          </ModalHeader>
          <ModalCloseButton color="gray.400" _hover={{ color: 'white' }} />
          <ModalBody px={6} py={4}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel color="gray.300">Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Payments Q2 2026"
                  bg="#1a1a20"
                  borderColor="rgba(255, 255, 255, 0.1)"
                  color="white"
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{
                    borderColor: '#00d9ff',
                    boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)',
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="gray.300">Planning Period</FormLabel>
                <Select
                  value={formData.planningPeriod}
                  onChange={(e) =>
                    setFormData({ ...formData, planningPeriod: e.target.value as PlanningPeriod })
                  }
                  bg="#1a1a20"
                  borderColor="rgba(255, 255, 255, 0.1)"
                  color="white"
                  _focus={{
                    borderColor: '#00d9ff',
                    boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)',
                  }}
                  sx={{
                    '& option': {
                      bg: '#1a1a20',
                      color: 'white',
                    },
                  }}
                >
                  {QUARTER_OPTIONS.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </Select>
                <Text fontSize="sm" color="gray.400" mt={1}>
                  {getWeeksForPeriod(formData.planningPeriod)} weeks per period
                </Text>
                <Text fontSize="sm" color="gray.400" mt={1}>
                  Assumes {SPRINT_LENGTH_WEEKS}-week sprints (about {Math.floor(getWeeksForPeriod(formData.planningPeriod) / SPRINT_LENGTH_WEEKS)} sprints per quarter).
                </Text>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="gray.300">UX Designers</FormLabel>
                <NumberInput
                  value={formData.ux_designers}
                  onChange={(_, valueAsNumber) =>
                    setFormData({ ...formData, ux_designers: valueAsNumber || 0 })
                  }
                  min={0}
                >
                  <NumberInputField
                    bg="#1a1a20"
                    borderColor="rgba(255, 255, 255, 0.1)"
                    color="white"
                    _focus={{
                      borderColor: '#00d9ff',
                      boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)',
                    }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper
                      borderColor="rgba(255, 255, 255, 0.1)"
                      color="gray.400"
                      _active={{ bg: 'rgba(0, 217, 255, 0.2)' }}
                    />
                    <NumberDecrementStepper
                      borderColor="rgba(255, 255, 255, 0.1)"
                      color="gray.400"
                      _active={{ bg: 'rgba(0, 217, 255, 0.2)' }}
                    />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="gray.300">Content Designers</FormLabel>
                <NumberInput
                  value={formData.content_designers}
                  onChange={(_, valueAsNumber) =>
                    setFormData({ ...formData, content_designers: valueAsNumber || 0 })
                  }
                  min={0}
                >
                  <NumberInputField
                    bg="#1a1a20"
                    borderColor="rgba(255, 255, 255, 0.1)"
                    color="white"
                    _focus={{
                      borderColor: '#00d9ff',
                      boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)',
                    }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper
                      borderColor="rgba(255, 255, 255, 0.1)"
                      color="gray.400"
                      _active={{ bg: 'rgba(0, 217, 255, 0.2)' }}
                    />
                    <NumberDecrementStepper
                      borderColor="rgba(255, 255, 255, 0.1)"
                      color="gray.400"
                      _active={{ bg: 'rgba(0, 217, 255, 0.2)' }}
                    />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter
            borderTop="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            px={6}
            py={4}
          >
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="cyan" type="submit">
              Create Scenario
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
