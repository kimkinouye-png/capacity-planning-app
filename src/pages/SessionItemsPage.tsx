import { Box, Heading } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'

function SessionItemsPage() {
  const { id } = useParams<{ id: string }>()
  
  return (
    <Box p={8}>
      <Heading size="lg">Roadmap items for {id}</Heading>
    </Box>
  )
}

export default SessionItemsPage
