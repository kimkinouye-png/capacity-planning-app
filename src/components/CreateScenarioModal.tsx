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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const weeksPerPeriod = getWeeksForPeriod(formData.planningPeriod)
    
    const newSession = createSession({
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
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Create New Scenario</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Payments Q2 2026"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Planning Period</FormLabel>
                <Select
                  value={formData.planningPeriod}
                  onChange={(e) =>
                    setFormData({ ...formData, planningPeriod: e.target.value as PlanningPeriod })
                  }
                >
                  {QUARTER_OPTIONS.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </Select>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  {getWeeksForPeriod(formData.planningPeriod)} weeks per period
                </Text>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Assumes {SPRINT_LENGTH_WEEKS}-week sprints (about {Math.floor(getWeeksForPeriod(formData.planningPeriod) / SPRINT_LENGTH_WEEKS)} sprints per quarter).
                </Text>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>UX Designers</FormLabel>
                <NumberInput
                  value={formData.ux_designers}
                  onChange={(_, valueAsNumber) =>
                    setFormData({ ...formData, ux_designers: valueAsNumber || 0 })
                  }
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Content Designers</FormLabel>
                <NumberInput
                  value={formData.content_designers}
                  onChange={(_, valueAsNumber) =>
                    setFormData({ ...formData, content_designers: valueAsNumber || 0 })
                  }
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" type="submit">
              Create Scenario
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
