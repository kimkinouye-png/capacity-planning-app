import {
  Box,
  Flex,
  HStack,
  Heading,
  Text,
  Button,
  Tooltip,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
} from '@chakra-ui/react'
import { Link, useLocation } from 'react-router-dom'
import { InfoIcon, HamburgerIcon } from '@chakra-ui/icons'

export default function AppHeader() {
  const location = useLocation()
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure()

  const navItems = [
    { path: '/scenarios', label: 'Plans' },
    { path: '/calculator', label: 'Calculator' },
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

            <HStack spacing={3} align="center">
              {/* Desktop nav links */}
              <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
                {navItems.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path === '/scenarios' && location.pathname.startsWith('/sessions'))
                  return isActive ? (
                    <Button
                      key={item.path}
                      as={Link}
                      to={item.path}
                      size="sm"
                      bg="cyan.400"
                      color="gray.900"
                      fontWeight="semibold"
                      _hover={{ bg: 'cyan.300' }}
                    >
                      {item.label}
                    </Button>
                  ) : (
                    <Box
                      key={item.path}
                      as={Link}
                      to={item.path}
                      px={3}
                      py={1}
                      fontSize="sm"
                      color="gray.300"
                      borderRadius="md"
                      _hover={{ color: 'white', bg: 'gray.700' }}
                    >
                      {item.label}
                    </Box>
                  )
                })}
              </HStack>

              {/* Mobile hamburger */}
              <IconButton
                aria-label="Open menu"
                icon={<HamburgerIcon />}
                variant="ghost"
                color="gray.300"
                _hover={{ color: 'white', bg: 'gray.700' }}
                display={{ base: 'flex', md: 'none' }}
                onClick={onDrawerOpen}
              />
            </HStack>
          </Flex>
        </Box>
      </Box>

      {/* Mobile nav drawer */}
      <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose}>
        <DrawerOverlay bg="blackAlpha.700" />
        <DrawerContent bg="gray.800" maxW="260px">
          <DrawerCloseButton color="gray.400" _hover={{ color: 'white' }} />
          <DrawerBody pt={12} px={4}>
            <Flex direction="column" gap={2}>
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path === '/scenarios' && location.pathname.startsWith('/sessions'))
                return (
                  <Box
                    key={item.path}
                    as={Link}
                    to={item.path}
                    px={4}
                    py={3}
                    borderRadius="md"
                    fontSize="sm"
                    fontWeight={isActive ? 'semibold' : 'normal'}
                    color={isActive ? 'cyan.400' : 'gray.300'}
                    bg={isActive ? 'gray.700' : 'transparent'}
                    _hover={{ color: 'white', bg: 'gray.700' }}
                    onClick={onDrawerClose}
                  >
                    {item.label}
                  </Box>
                )
              })}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
