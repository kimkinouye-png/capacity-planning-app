import {
  Box,
  Flex,
  HStack,
  Heading,
  Text,
  Button,
  Tooltip,
  useDisclosure,
  useColorMode,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
} from '@chakra-ui/react'
import { Link, useLocation } from 'react-router-dom'
import { InfoIcon, HamburgerIcon, SunIcon, MoonIcon } from '@chakra-ui/icons'

export default function AppHeader() {
  const location = useLocation()
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure()
  const { colorMode, toggleColorMode } = useColorMode()

  const navItems = [
    { path: '/scenarios', label: 'Plans' },
    { path: '/calculator', label: 'Calculator' },
    { path: '/guide', label: 'Guide' },
    { path: '/settings', label: 'Settings' },
  ]

  const bgHeader = useColorModeValue('white', '#141419')
  const borderHeader = useColorModeValue('gray.200', 'rgba(255, 255, 255, 0.1)')
  const brandColor = useColorModeValue('gray.900', 'white')
  const brandHover = useColorModeValue('cyan.500', '#00d9ff')
  const subtitleColor = useColorModeValue('gray.500', 'gray.400')
  const infoIconColor = useColorModeValue('gray.400', 'gray.500')
  const navInactive = useColorModeValue('gray.600', 'gray.300')
  const navHoverColor = useColorModeValue('gray.900', 'white')
  const navHoverBg = useColorModeValue('gray.100', 'gray.700')
  const activeNavBg = useColorModeValue('cyan.500', 'cyan.400')
  const activeNavColor = useColorModeValue('white', 'gray.900')
  const toggleColor = useColorModeValue('gray.500', 'gray.400')
  const toggleHoverColor = useColorModeValue('gray.900', 'white')
  const toggleHoverBg = useColorModeValue('gray.100', 'gray.700')
  const drawerBg = useColorModeValue('white', 'gray.800')
  const drawerCloseColor = useColorModeValue('gray.500', 'gray.400')
  const drawerCloseHover = useColorModeValue('gray.900', 'white')
  const drawerInactive = useColorModeValue('gray.600', 'gray.300')
  const drawerActiveBg = useColorModeValue('gray.100', 'gray.700')
  const drawerActiveColor = useColorModeValue('cyan.500', 'cyan.400')

  return (
    <>
      <Box
        as="header"
        position="sticky"
        top={0}
        zIndex={40}
        bg={bgHeader}
        borderBottom="1px solid"
        borderColor={borderHeader}
        boxShadow="sm"
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
                  color={brandColor}
                  _hover={{ color: brandHover }}
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
                  <Box as="span" display="inline-flex" color={infoIconColor} _hover={{ color: subtitleColor }} cursor="help">
                    <InfoIcon boxSize={3.5} />
                  </Box>
                </Tooltip>
              </Flex>
              <Text fontSize="xs" color={subtitleColor} mt={0.5}>
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
                      bg={activeNavBg}
                      color={activeNavColor}
                      fontWeight="semibold"
                      _hover={{ opacity: 0.9 }}
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
                      color={navInactive}
                      borderRadius="md"
                      _hover={{ color: navHoverColor, bg: navHoverBg }}
                    >
                      {item.label}
                    </Box>
                  )
                })}
              </HStack>

              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                variant="ghost"
                size="sm"
                color={toggleColor}
                _hover={{ color: toggleHoverColor, bg: toggleHoverBg }}
                onClick={toggleColorMode}
                display={{ base: 'none', md: 'flex' }}
              />

              {/* Mobile hamburger */}
              <IconButton
                aria-label="Open menu"
                icon={<HamburgerIcon />}
                variant="ghost"
                color={navInactive}
                _hover={{ color: navHoverColor, bg: navHoverBg }}
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
        <DrawerContent bg={drawerBg} maxW="260px">
          <DrawerCloseButton color={drawerCloseColor} _hover={{ color: drawerCloseHover }} />
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
                    color={isActive ? drawerActiveColor : drawerInactive}
                    bg={isActive ? drawerActiveBg : 'transparent'}
                    _hover={{ color: navHoverColor, bg: navHoverBg }}
                    onClick={onDrawerClose}
                  >
                    {item.label}
                  </Box>
                )
              })}
              <Box
                px={4}
                py={3}
                borderRadius="md"
                fontSize="sm"
                color={drawerInactive}
                cursor="pointer"
                _hover={{ color: navHoverColor, bg: navHoverBg }}
                onClick={() => {
                  toggleColorMode()
                  onDrawerClose()
                }}
              >
                {colorMode === 'light' ? '🌙 Dark mode' : '☀️ Light mode'}
              </Box>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
