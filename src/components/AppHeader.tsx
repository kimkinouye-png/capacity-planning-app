import { Box, Flex, HStack, Heading, Text, Button } from '@chakra-ui/react'
import { Link, useLocation } from 'react-router-dom'
import QRCodeDisplay from './QRCodeDisplay'

export default function AppHeader() {
  const location = useLocation()

  const navItems = [
    { path: '/scenarios', label: 'Scenarios' },
    // Hidden: Committed Plan
    // { path: '/committed-plan', label: 'Committed Plan' },
    { path: '/guide', label: 'Guide' },
    { path: '/settings', label: 'Settings' },
  ]

  return (
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
            <Text fontSize="xs" color="gray.400" mt={0.5}>
              Plan smarter, deliver better
            </Text>
          </Box>

          {/* Right side: Navigation */}
          <HStack spacing={2} align="center">
            {/* QR Code Button */}
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
  )
}
