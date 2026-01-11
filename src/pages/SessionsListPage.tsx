import {
  Box,
  Heading,
  Stack,
  List,
  ListItem,
  Link as ChakraLink,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { usePlanningSessions } from '../context/PlanningSessionsContext'
import { useRoadmapItems } from '../context/RoadmapItemsContext'
import { useItemInputs } from '../context/ItemInputsContext'
import {
  demoItems,
  demoIntakes,
  demoProductDesignInputs,
  demoContentDesignInputs,
} from '../demo/demoSession'

function SessionsListPage() {
  const { sessions, createSession } = usePlanningSessions()
  const { createItem } = useRoadmapItems()
  const { setInputsForItem } = useItemInputs()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    planning_period: '',
    weeks_per_period: 13,
    sprint_length_weeks: 2,
    ux_designers: 3,
    content_designers: 2,
    created_by: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newSession = createSession({
      ...formData,
      created_by: formData.created_by || undefined,
    })
    onClose()
    setFormData({
      name: '',
      planning_period: '',
      weeks_per_period: 13,
      sprint_length_weeks: 2,
      ux_designers: 3,
      content_designers: 2,
      created_by: '',
    })
    navigate(`/sessions/${newSession.id}`)
  }

  const handleCreateDemoSession = () => {
    // Create a new session with default capacity
    const newSession = createSession({
      name: 'Demo Session',
      planning_period: new Date().getFullYear() + '-Q' + Math.ceil((new Date().getMonth() + 1) / 3),
      weeks_per_period: 12,
      sprint_length_weeks: 2,
      ux_designers: 3,
      content_designers: 1,
      created_by: 'demo-helper',
    })

    // Seed 2-3 roadmap items from demo data (using first 2 items)
    const itemsToSeed = demoItems.slice(0, 2)
    itemsToSeed.forEach((demoItem) => {
      // Create the item (without the demo item ID, let it generate a new one)
      const newItem = createItem(newSession.id, {
        short_key: demoItem.short_key,
        name: demoItem.name,
        initiative: demoItem.initiative,
        team_name: demoItem.team_name,
        priority: demoItem.priority,
      })

      // Find the corresponding inputs from demo data
      const intake = demoIntakes.find((i) => i.roadmap_item_id === demoItem.id)
      const pd = demoProductDesignInputs.find((p) => p.roadmap_item_id === demoItem.id)
      const cd = demoContentDesignInputs.find((c) => c.roadmap_item_id === demoItem.id)

      // Set the inputs for the new item (update roadmap_item_id to match new item ID)
      if (intake && pd && cd) {
        setInputsForItem(newItem.id, {
          intake: { ...intake, roadmap_item_id: newItem.id },
          pd: { ...pd, roadmap_item_id: newItem.id },
          cd: { ...cd, roadmap_item_id: newItem.id },
        })
      }
    })

    // Navigate to the new session's summary page
    navigate(`/sessions/${newSession.id}`)
  }

  return (
    <Box p={8}>
      <Stack direction="row" justify="space-between" align="center" mb={6}>
        <Heading size="lg">Planning Sessions</Heading>
        <Stack direction="row" spacing={3}>
          <Button variant="outline" colorScheme="blue" onClick={handleCreateDemoSession}>
            Create demo session
          </Button>
          <Button colorScheme="blue" onClick={onOpen}>
            New planning session
          </Button>
        </Stack>
      </Stack>

      <List spacing={2}>
        {sessions.length === 0 ? (
          <ListItem>
            <Box p={4} textAlign="center" color="gray.500">
              No planning sessions yet. Create one to get started.
            </Box>
          </ListItem>
        ) : (
          sessions.map((session) => (
            <ListItem key={session.id}>
              <ChakraLink as={Link} to={`/sessions/${session.id}`} color="blue.500">
                {session.name} ({session.planning_period})
              </ChakraLink>
            </ListItem>
          ))
        )}
      </List>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>Create New Planning Session</ModalHeader>
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
                  <Input
                    value={formData.planning_period}
                    onChange={(e) =>
                      setFormData({ ...formData, planning_period: e.target.value })
                    }
                    placeholder="e.g., 2026-Q2"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Weeks per Period</FormLabel>
                  <NumberInput
                    value={formData.weeks_per_period}
                    onChange={(_, valueAsNumber) =>
                      setFormData({ ...formData, weeks_per_period: valueAsNumber || 13 })
                    }
                    min={1}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Sprint Length (weeks)</FormLabel>
                  <NumberInput
                    value={formData.sprint_length_weeks}
                    onChange={(_, valueAsNumber) =>
                      setFormData({ ...formData, sprint_length_weeks: valueAsNumber || 2 })
                    }
                    min={1}
                    step={0.5}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
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

                <FormControl>
                  <FormLabel>Created By (optional)</FormLabel>
                  <Input
                    value={formData.created_by}
                    onChange={(e) => setFormData({ ...formData, created_by: e.target.value })}
                    placeholder="Your name"
                  />
                </FormControl>
              </Stack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit">
                Create Session
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default SessionsListPage
