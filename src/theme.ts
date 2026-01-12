import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    black: {
      50: '#f7f7f7',
      100: '#e1e1e1',
      200: '#cfcfcf',
      300: '#b1b1b1',
      400: '#9e9e9e',
      500: '#000000',
      600: '#000000',
      700: '#000000',
      800: '#000000',
      900: '#000000',
    },
  },
  components: {
    Button: {
      variants: {
        solid: (props: { colorScheme: string }) => {
          if (props.colorScheme === 'black') {
            return {
              bg: 'black.500',
              color: 'white',
              _hover: {
                bg: 'black.600',
              },
              _active: {
                bg: 'black.700',
              },
            }
          }
          return {}
        },
      },
    },
  },
})

export default theme
