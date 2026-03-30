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
  useDisclosure,
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
import AddRoadmapItemModal from '../components/AddRoadmapItemModal'

function SessionItemsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getItemsForSession, createItem } = useRoadmapItems()
  const { getSessionById } = usePlanningSessions()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const items = id ? getItemsForSession(id) : []
  const session = useMemo(() => (id ? getSessionById(id) : undefined), [id, getSessionById])

  const [isCreating, setIsCreating] = useState(false)

  const handleCreateItem = async (data: Parameters<typeof createItem>[1]) => {
    if (!id) return
    setIsCreating(true)
    try {
      await createItem(id, data)
      onClose()
    } catch (error) {
      console.error('Error creating item:', error)
    } finally {
      setIsCreating(false)
    }
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
    <Box minH="100vh" bg="#0a0a0f">
      <Box maxW="1200px" mx="auto" px={6} py={8}>
        {/* Breadcrumb Navigation */}
        <HStack spacing={1} mb={6} align="center" fontSize="sm">
          <ChakraLink as={Link} to="/" color="#00d9ff" _hover={{ textDecoration: 'underline' }}>
            Home
          </ChakraLink>
          <Text color="gray.400"> &gt; </Text>
          <Text color="gray.300">{sessionName}</Text>
          <Text color="gray.400"> &gt; </Text>
          <Text color="white" fontWeight="medium">Roadmap Items</Text>
        </HStack>

        {/* Header */}
        <Stack direction="row" justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="lg" mb={1} color="white">
              Roadmap Items
            </Heading>
            <Text fontSize="sm" color="gray.400">
              {items.length} {items.length === 1 ? 'item' : 'items'} in {sessionName}
            </Text>
          </Box>
          <Button colorScheme="black" onClick={onOpen}>
            + New Roadmap Item
          </Button>
        </Stack>

        {/* Empty State */}
        {items.length === 0 ? (
          <Card bg="#141419" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)" boxShadow="sm" borderRadius="md">
            <CardBody p={12}>
              <VStack spacing={4} align="center" textAlign="center">
                <Text fontSize="md" color="gray.300">
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
          <Card bg="#141419" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)" boxShadow="sm" borderRadius="md" overflow="hidden">
            <TableContainer>
              <Table variant="simple">
                <Thead bg="#1a1a20">
                  <Tr>
                    <Th color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Short Key</Th>
                    <Th color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Name</Th>
                    <Th color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Initiative</Th>
                    <Th color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Priority</Th>
                    <Th color="gray.400" fontSize="12px" fontWeight="600" textTransform="uppercase" letterSpacing="wider">Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {items.map((item) => (
                    <Tr
                      key={item.id}
                      cursor="pointer"
                      _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }}
                      onClick={() => navigate(`/sessions/${id}/items/${item.id}`)}
                    >
                      <Td fontWeight="medium" color="gray.300">{item.short_key}</Td>
                      <Td color="gray.300">{item.name}</Td>
                      <Td color="gray.300">{item.initiative}</Td>
                      <Td color="gray.300">{item.priority}</Td>
                      <Td>
                        <Badge
                          colorScheme={item.status === 'draft' ? 'gray' : item.status === 'committed' ? 'green' : 'blue'}
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

      <AddRoadmapItemModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleCreateItem}
        isSubmitting={isCreating}
      />
    </Box>
  )
}

export default SessionItemsPage
