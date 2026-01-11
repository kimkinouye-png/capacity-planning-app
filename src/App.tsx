import { Box, Stack, Link as ChakraLink } from '@chakra-ui/react'
import { Routes, Route, Link } from 'react-router-dom'
import SessionsListPage from './pages/SessionsListPage'
import SessionSummaryPage from './pages/SessionSummaryPage'
import SessionItemsPage from './pages/SessionItemsPage'
import ItemDetailPage from './pages/ItemDetailPage'

function App() {
  return (
    <Box>
      <Box as="nav" bg="gray.100" p={4} borderBottom="1px" borderColor="gray.200">
        <Stack direction="row" spacing={4}>
          <ChakraLink as={Link} to="/" color="blue.500">
            Home
          </ChakraLink>
        </Stack>
      </Box>
      <Routes>
        <Route path="/" element={<SessionsListPage />} />
        <Route path="/sessions/:id" element={<SessionSummaryPage />} />
        <Route path="/sessions/:id/items" element={<SessionItemsPage />} />
        <Route path="/sessions/:id/items/:itemId" element={<ItemDetailPage />} />
      </Routes>
    </Box>
  )
}

export default App
