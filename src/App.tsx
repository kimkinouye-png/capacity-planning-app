import { Box, Stack, Link as ChakraLink, Heading, Text, useToast, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button, useDisclosure, HStack, Flex } from '@chakra-ui/react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import HomePage from './pages/HomePage'
import SessionsListPage from './pages/SessionsListPage'
import SessionSummaryPage from './pages/SessionSummaryPage'
import SessionItemsPage from './pages/SessionItemsPage'
import ItemDetailPage from './pages/ItemDetailPage'
import QuarterlyCapacityPage from './pages/QuarterlyCapacityPage'
import CommittedPlanPage from './pages/CommittedPlanPage'

function App() {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()

  // Debug feature: Clear all localStorage data
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect Shift+Cmd+K (Mac) or Shift+Ctrl+K (Windows/Linux)
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const isModifierPressed = isMac 
        ? e.shiftKey && e.metaKey && e.key === 'k'
        : e.shiftKey && e.ctrlKey && e.key === 'k'

      if (isModifierPressed) {
        e.preventDefault()
        onOpen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onOpen])

  const handleClearData = () => {
    // Clear all localStorage keys used by the app
    const storageKeys = [
      'designCapacity.sessions',
      'designCapacity.items',
      'designCapacity.inputs',
      'designCapacity.itemInputs',
    ]

    storageKeys.forEach((key) => {
      localStorage.removeItem(key)
    })

    onClose()
    
    toast({
      title: 'All data cleared',
      description: 'localStorage has been cleared and the page will reload.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })

    // Reload page after a short delay to show the toast
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }

  return (
    <Box minH="100vh" bg="white">
      {/* Global Header */}
      <Box as="header" borderBottom="1px" borderColor="gray.200" bg="white">
        <Box maxW="1200px" mx="auto" px={6} py={6}>
          <Flex direction="row" justify="space-between" align="flex-start">
            {/* Left side: Title and subtitle */}
            <Stack spacing={2} flex="1">
              <ChakraLink 
                as={Link} 
                to="/"
                _hover={{ textDecoration: 'none' }}
              >
                <Heading size="lg" fontWeight="bold" color="gray.900" _hover={{ color: '#3B82F6' }}>
                  Capacity Planning
                </Heading>
              </ChakraLink>
              <Text fontSize="sm" color="gray.600">
                Manage team capacity across quarterly planning cycles
              </Text>
            </Stack>
            
            {/* Right side: Navigation links */}
            <HStack spacing={4} align="center" fontSize="sm">
              <ChakraLink
                as={Link}
                to="/"
                color={location.pathname === '/' ? '#3B82F6' : '#6B7280'}
                fontWeight={location.pathname === '/' ? '600' : 'normal'}
                textDecoration={location.pathname === '/' ? 'underline' : 'none'}
                _hover={{ color: '#3B82F6', textDecoration: 'underline' }}
              >
                Home
              </ChakraLink>
              <ChakraLink
                as={Link}
                to="/scenarios"
                color={location.pathname === '/scenarios' ? '#3B82F6' : '#6B7280'}
                fontWeight={location.pathname === '/scenarios' ? '600' : 'normal'}
                textDecoration={location.pathname === '/scenarios' ? 'underline' : 'none'}
                _hover={{ color: '#3B82F6', textDecoration: 'underline' }}
              >
                Scenarios
              </ChakraLink>
              <ChakraLink
                as={Link}
                to="/committed-plan"
                color={location.pathname === '/committed-plan' ? '#3B82F6' : '#6B7280'}
                fontWeight={location.pathname === '/committed-plan' ? '600' : 'normal'}
                textDecoration={location.pathname === '/committed-plan' ? 'underline' : 'none'}
                _hover={{ color: '#3B82F6', textDecoration: 'underline' }}
              >
                Committed Plan
              </ChakraLink>
              <ChakraLink
                as={Link}
                to="/guide"
                color={location.pathname === '/guide' ? '#3B82F6' : '#6B7280'}
                fontWeight={location.pathname === '/guide' ? '600' : 'normal'}
                textDecoration={location.pathname === '/guide' ? 'underline' : 'none'}
                _hover={{ color: '#3B82F6', textDecoration: 'underline' }}
              >
                Guide
              </ChakraLink>
            </HStack>
          </Flex>
        </Box>
      </Box>
      
      {/* Main Content */}
      <Box as="main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/scenarios" element={<SessionsListPage />} />
          <Route path="/committed-plan" element={<CommittedPlanPage />} />
          <Route path="/guide" element={<Box p={8}><Heading size="lg" mb={4}>Guide</Heading><Text color="gray.600">Guide content goes here.</Text></Box>} />
          <Route path="/quarterly-capacity" element={<QuarterlyCapacityPage />} />
          <Route path="/sessions/:id" element={<SessionSummaryPage />} />
          <Route path="/sessions/:id/items" element={<SessionItemsPage />} />
          <Route path="/sessions/:id/items/:itemId" element={<ItemDetailPage />} />
        </Routes>
      </Box>

      {/* Debug: Clear Data Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Clear all data?
            </AlertDialogHeader>
            <AlertDialogBody>
              This will permanently delete all planning scenarios, roadmap items, and inputs. This cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleClearData} ml={3}>
                Clear All Data
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

export default App
