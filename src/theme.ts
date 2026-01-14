import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    dark: {
      bg: '#0a0a0f',
      card: '#141419',
      panel: '#1a1a20',
    },
    cyan: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#00d9ff',
      600: '#00b8d9',
      700: '#0099b3',
      800: '#007a8c',
      900: '#005b66',
    },
  },
  components: {
    Button: {
      variants: {
        solid: (props: { colorScheme: string }) => {
          if (props.colorScheme === 'cyan') {
            return {
              bg: 'linear-gradient(to right, #00b8d9, #1e40af)',
              color: 'white',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              boxShadow: '0 10px 15px -3px rgba(0, 184, 217, 0.4), 0 4px 6px -2px rgba(0, 184, 217, 0.4)',
              _hover: {
                bg: 'linear-gradient(to right, #00a3c4, #1e3a8a)',
                boxShadow: '0 10px 15px -3px rgba(0, 184, 217, 0.5), 0 4px 6px -2px rgba(0, 184, 217, 0.5)',
                transform: 'translateY(-1px)',
              },
              _active: {
                transform: 'translateY(0)',
              },
              transition: 'all 0.3s ease',
            }
          }
          if (props.colorScheme === 'black') {
            return {
              bg: '#000000',
              color: 'white',
              _hover: {
                bg: '#1F2937',
              },
            }
          }
          return {}
        },
        outline: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          color: '#D1D5DB',
          bg: '#1a1a20',
          _hover: {
            borderColor: 'rgba(0, 217, 255, 0.5)',
            color: 'white',
            bg: '#20202a',
          },
          transition: 'all 0.3s ease',
        },
        ghost: {
          color: '#D1D5DB',
          _hover: {
            color: 'white',
            bg: 'rgba(255, 255, 255, 0.05)',
          },
          transition: 'all 0.3s ease',
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: '#0a0a0f',
        color: 'white',
      },
    },
  },
})

export default theme
