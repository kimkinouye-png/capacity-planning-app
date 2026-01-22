
import { Box, useToast, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button, useDisclosure } from '@chakra-ui/react'
import { Routes, Route } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import SessionsListPage from './pages/SessionsListPage'
import SessionSummaryPage from './pages/SessionSummaryPage'
import SessionItemsPage from './pages/SessionItemsPage'
import ItemDetailPage from './pages/ItemDetailPage'
import QuarterlyCapacityPage from './pages/QuarterlyCapacityPage'
import AppHeader from './components/AppHeader'

function App() {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)

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
    <Box minH="100vh" bg="#0a0a0f">
      {/* Global Header */}
      <AppHeader />
      
      {/* Main Content */}
      <Box as="main">
        <Routes>
          <Route path="/" element={<SessionsListPage />} />
          <Route path="/scenarios" element={<SessionsListPage />} />
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
        <AlertDialogOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(4px)">
          <AlertDialogContent bg="#141419" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)" boxShadow="0 25px 50px -12px rgba(0, 217, 255, 0.2)">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="white" borderBottom="1px solid" borderColor="rgba(255, 255, 255, 0.1)" px={6} py={4}>
              Clear all data?
            </AlertDialogHeader>
            <AlertDialogBody color="gray.300" px={6} py={4}>
              This will permanently delete all planning scenarios, roadmap items, and inputs. This cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter borderTop="1px solid" borderColor="rgba(255, 255, 255, 0.1)" px={6} py={4}>
              <Button ref={cancelRef} onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button
                bg="rgba(239, 68, 68, 0.1)"
                border="1px solid"
                borderColor="rgba(239, 68, 68, 0.5)"
                color="#ef4444"
                _hover={{
                  bg: 'rgba(239, 68, 68, 0.2)',
                  borderColor: '#ef4444',
                }}
                onClick={handleClearData}
                ml={3}
              >
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
