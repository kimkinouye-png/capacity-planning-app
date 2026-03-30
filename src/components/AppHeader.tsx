import {
  Box,
  Flex,
  HStack,
  Heading,
  Text,
  Button,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react'
import { Link, useLocation } from 'react-router-dom'
import { InfoIcon } from '@chakra-ui/icons'
import QRCodeDisplay from './QRCodeDisplay'
import { resetWorkspace } from '../utils/session'

export default function AppHeader() {
  const location = useLocation()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const navItems = [
    { path: '/scenarios', label: 'Scenarios' },
    // Hidden: Committed Plan
    // { path: '/committed-plan', label: 'Committed Plan' },
    { path: '/guide', label: 'Guide' },
    { path: '/settings', label: 'Settings' },
  ]

  return (
    <>
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={40}
      bg="#141419"
      borderBottom="1px solid"
      borderColor="rgba(255, 255, 255, 0.1)"
      boxShadow="xl"
    >
      <Box maxW="1400px" mx="auto" px={6} py={4}>
        <Flex direction="row" justify="space-between" align="center">
          {/* Left side: Title and subtitle */}
          <Box>
            <Flex align="center" gap={2}>
              <Heading
                as={Link}
                to="/"
                size="lg"
                fontWeight="bold"
                color="white"
                _hover={{ color: '#00d9ff' }}
                transition="color 0.3s ease"
              >
                Capacity Planner
              </Heading>
              <Tooltip
                label="The planner is anonymous, tied to this browser only, and not shared."
                hasArrow
                placement="bottom"
                fontSize="xs"
                maxW="240px"
              >
                <Box as="span" display="inline-flex" color="gray.500" _hover={{ color: 'gray.400' }} cursor="help">
                  <InfoIcon boxSize={3.5} />
                </Box>
              </Tooltip>
            </Flex>
            <Text fontSize="xs" color="gray.400" mt={0.5}>
              Plan smarter, deliver better
            </Text>
          </Box>

          {/* Right side: Navigation */}
          <HStack spacing={2} align="center">
            <Tooltip
              label="Clear your workspace and start fresh. Your data is anonymous and stored only in this browser."
              hasArrow
              placement="bottom"
              fontSize="xs"
              maxW="260px"
            >
              <Button
                size="sm"
                variant="outline"
                colorScheme="gray"
                color="gray.400"
                borderColor="rgba(255,255,255,0.2)"
                _hover={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}
                onClick={onOpen}
              >
                Reset my workspace
              </Button>
            </Tooltip>
            <QRCodeDisplay />
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              if (isActive) {
                return (
                  <Button
                    key={item.path}
                    as={Link}
                    to={item.path}
                    size="sm"
                    variant="solid"
                    colorScheme="cyan"
                  >
                    {item.label}
                  </Button>
                )
              }
              return (
                <Box
                  key={item.path}
                  as={Link}
                  to={item.path}
                  px={3}
                  py={1.5}
                  fontSize="sm"
                  color="gray.300"
                  _hover={{ color: 'white', bg: 'rgba(255, 255, 255, 0.05)' }}
                  borderRadius="md"
                  transition="all 0.3s ease"
                >
                  {item.label}
                </Box>
              )
            })}
          </HStack>
        </Flex>
      </Box>
    </Box>

    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent bg="gray.800" border="1px solid" borderColor="gray.700" borderRadius="lg">
        <ModalHeader color="white" fontSize="md" fontWeight="semibold">
          Reset workspace
        </ModalHeader>
        <ModalBody>
          <Text fontSize="sm" color="gray.300">
            This will permanently delete all plans and roadmap items. This cannot be undone.
          </Text>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button
            variant="outline"
            borderColor="gray.600"
            color="gray.300"
            _hover={{ borderColor: 'gray.400', color: 'white' }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            bg="red.500"
            color="white"
            _hover={{ bg: 'red.400' }}
            onClick={() => {
              resetWorkspace()
              onClose()
            }}
          >
            Reset everything
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </>
  )
}
