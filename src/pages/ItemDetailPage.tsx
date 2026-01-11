import { Box, Heading } from '@chakra-ui/react'
import { useParams } from 'react-router-dom'

function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>()
  
  return (
    <Box p={8}>
      <Heading size="lg">Item detail for {itemId}</Heading>
    </Box>
  )
}

export default ItemDetailPage
