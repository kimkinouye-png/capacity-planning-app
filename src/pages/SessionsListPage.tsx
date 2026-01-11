import { Box, Heading, Stack, List, ListItem, Link as ChakraLink } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

function SessionsListPage() {
  return (
    <Box p={8}>
      <Heading size="lg" mb={4}>Planning Sessions</Heading>
      <Stack spacing={2}>
        <List spacing={2}>
          <ListItem>
            <ChakraLink as={Link} to="/sessions/demo" color="blue.500">
              Demo Session
            </ChakraLink>
          </ListItem>
        </List>
      </Stack>
    </Box>
  )
}

export default SessionsListPage
