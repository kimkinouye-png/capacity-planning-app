import { Box, Stack, Link as ChakraLink, Heading, Text } from '@chakra-ui/react'
import { Routes, Route, Link } from 'react-router-dom'
import SessionsListPage from './pages/SessionsListPage'
import SessionSummaryPage from './pages/SessionSummaryPage'
import SessionItemsPage from './pages/SessionItemsPage'
import ItemDetailPage from './pages/ItemDetailPage'
import QuarterlyCapacityPage from './pages/QuarterlyCapacityPage'

function App() {
  return (
    <Box minH="100vh" bg="white">
      {/* Header */}
      <Box as="header" borderBottom="1px" borderColor="gray.200" bg="white">
        <Box maxW="1200px" mx="auto" px={6} py={6}>
          <Stack spacing={2} mb={4}>
            <Heading size="lg" fontWeight="bold">
              Capacity Planning
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Manage team capacity across quarterly planning cycles
            </Text>
          </Stack>
          <Stack direction="row" spacing={4}>
            <ChakraLink as={Link} to="/" color="blue.500" _hover={{ textDecoration: 'underline' }}>
              Home
            </ChakraLink>
            <ChakraLink as={Link} to="/quarterly-capacity" color="blue.500" _hover={{ textDecoration: 'underline' }}>
              Quarterly Capacity
            </ChakraLink>
          </Stack>
        </Box>
      </Box>
      
      {/* Main Content */}
      <Box as="main">
        <Routes>
          <Route path="/" element={<SessionsListPage />} />
          <Route path="/quarterly-capacity" element={<QuarterlyCapacityPage />} />
          <Route path="/sessions/:id" element={<SessionSummaryPage />} />
          <Route path="/sessions/:id/items" element={<SessionItemsPage />} />
          <Route path="/sessions/:id/items/:itemId" element={<ItemDetailPage />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App
