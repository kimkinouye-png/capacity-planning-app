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
  Text,
  HStack,
  VStack,
  Card,
  CardBody,
  Badge,
  Link as ChakraLink,
} from '@chakra-ui/react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { useRoadmapItems } from '../context/RoadmapItemsContext'
import { usePlanningSessions } from '../context/PlanningSessionsContext'

function SessionItemsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getItemsForSession, createItem } = useRoadmapItems()
  const { getSessionById } = usePlanningSessions()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const items = id ? getItemsForSession(id) : []
  const session = useMemo(() => (id ? getSessionById(id) : undefined), [id, getSessionById])

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

  const sessionName = session?.name || 'Unknown Session'

  return (
    <Box minH="100vh" bg="#F9FAFB">
      <Box maxW="1200px" mx="auto" px={6} py={8}>
        {/* Breadcrumb Navigation */}
        <HStack spacing={1} mb={6} align="center" fontSize="sm">
          <ChakraLink as={Link} to="/" color="gray.600" _hover={{ textDecoration: 'underline' }}>
            Home
          </ChakraLink>
          <Text color="gray.400"> &gt; </Text>
          <Text color="gray.600">{sessionName}</Text>
          <Text color="gray.400"> &gt; </Text>
          <Text color="gray.900" fontWeight="medium">Roadmap Items</Text>
        </HStack>

        {/* Header */}
        <Stack direction="row" justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="lg" mb={1}>
              Roadmap Items
            </Heading>
            <Text fontSize="sm" color="gray.600">
              {items.length} {items.length === 1 ? 'item' : 'items'} in {sessionName}
            </Text>
          </Box>
          <Button colorScheme="black" onClick={onOpen}>
            + New Roadmap Item
          </Button>
        </Stack>

        {/* Empty State */}
        {items.length === 0 ? (
          <Card bg="white" boxShadow="sm" borderRadius="md">
            <CardBody p={12}>
              <VStack spacing={4} align="center" textAlign="center">
                <Text fontSize="md" color="gray.600">
                  No items yet. Create your first roadmap item.
                </Text>
                <Button colorScheme="black" onClick={onOpen}>
                  + Create First Item
                </Button>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          /* Populated State - Table */
          <Card bg="white" boxShadow="sm" borderRadius="md" overflow="hidden">
            <TableContainer>
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Short Key</Th>
                    <Th>Name</Th>
                    <Th>Initiative</Th>
                    <Th>Priority</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {items.map((item) => (
                    <Tr
                      key={item.id}
                      cursor="pointer"
                      _hover={{ bg: 'gray.50' }}
                      onClick={() => navigate(`/sessions/${id}/items/${item.id}`)}
                    >
                      <Td fontWeight="medium">{item.short_key}</Td>
                      <Td>{item.name}</Td>
                      <Td>{item.initiative}</Td>
                      <Td>{item.priority}</Td>
                      <Td>
                        <Badge
                          colorScheme={item.status === 'draft' ? 'gray' : item.status === 'sized' ? 'green' : 'blue'}
                          px={2}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                        >
                          {item.status}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </Box>

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
              <Button colorScheme="black" type="submit">
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
