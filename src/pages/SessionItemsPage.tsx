import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
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
  Stack,
} from '@chakra-ui/react'
import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { useRoadmapItems } from '../context/RoadmapItemsContext'

function SessionItemsPage() {
  const { id } = useParams<{ id: string }>()
  const { getItemsForSession, createItem } = useRoadmapItems()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const items = id ? getItemsForSession(id) : []

  const [formData, setFormData] = useState({
    short_key: '',
    name: '',
    initiative: '',
    priority: 1,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    createItem(id, formData)

    onClose()
    setFormData({
      short_key: '',
      name: '',
      initiative: '',
      priority: 1,
    })
  }

  if (!id) {
    return (
      <Box p={8}>
        <Heading size="lg">Invalid session ID</Heading>
      </Box>
    )
  }

  return (
    <Box p={8}>
      <Stack direction="row" justify="space-between" align="center" mb={6}>
        <Heading size="lg">Roadmap Items</Heading>
        <Button colorScheme="blue" onClick={onOpen}>
          New roadmap item
        </Button>
      </Stack>

      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Short Key</Th>
              <Th>Name</Th>
              <Th>Initiative</Th>
              <Th>Priority</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {items.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" color="gray.500">
                  No roadmap items yet. Create one to get started.
                </Td>
              </Tr>
            ) : (
              items.map((item) => (
                <Tr key={item.id}>
                  <Td>{item.short_key}</Td>
                  <Td>{item.name}</Td>
                  <Td>{item.initiative}</Td>
                  <Td>{item.priority}</Td>
                  <Td>{item.status}</Td>
                  <Td>
                    <Button
                      as={Link}
                      to={`/sessions/${id}/items/${item.id}`}
                      colorScheme="blue"
                      size="sm"
                    >
                      Details
                    </Button>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>Create New Roadmap Item</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Short Key</FormLabel>
                  <Input
                    value={formData.short_key}
                    onChange={(e) => setFormData({ ...formData, short_key: e.target.value })}
                    placeholder="e.g., F1"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., New Payment Method"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Initiative</FormLabel>
                  <Input
                    value={formData.initiative}
                    onChange={(e) => setFormData({ ...formData, initiative: e.target.value })}
                    placeholder="e.g., Revenue"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Priority</FormLabel>
                  <NumberInput
                    value={formData.priority}
                    onChange={(_, valueAsNumber) =>
                      setFormData({ ...formData, priority: valueAsNumber || 1 })
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
              </Stack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit">
                Create Item
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default SessionItemsPage
