import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  semanticTokens: {
    colors: {
      // Page background
      'bg.page': {
        default: 'gray.50',
        _dark: 'gray.900',
      },
      // Card/surface background
      'bg.card': {
        default: 'white',
        _dark: 'gray.800',
      },
      // Elevated surface (inputs, secondary cards)
      'bg.elevated': {
        default: 'gray.50',
        _dark: 'gray.700',
      },
      // Border
      'border.default': {
        default: 'gray.200',
        _dark: 'gray.700',
      },
      // Border subtle
      'border.subtle': {
        default: 'gray.100',
        _dark: 'gray.600',
      },
      // Primary text
      'text.primary': {
        default: 'gray.900',
        _dark: 'white',
      },
      // Secondary text
      'text.secondary': {
        default: 'gray.600',
        _dark: 'gray.400',
      },
      // Muted text
      'text.muted': {
        default: 'gray.500',
        _dark: 'gray.500',
      },
      // Brand accent
      'brand.accent': {
        default: 'cyan.500',
        _dark: 'cyan.400',
      },
      // Brand accent hover
      'brand.accentHover': {
        default: 'cyan.600',
        _dark: 'cyan.300',
      },
    },
  },
  styles: {
    global: (props: { colorMode: string }) => ({
      body: {
        bg: props.colorMode === 'light' ? 'gray.50' : 'gray.900',
        color: props.colorMode === 'light' ? 'gray.900' : 'white',
      },
    }),
  },
  components: {
    Button: {
      variants: {
        brand: (props: { colorMode: string }) => ({
          bg: props.colorMode === 'light' ? 'cyan.500' : 'cyan.400',
          color: props.colorMode === 'light' ? 'white' : 'gray.900',
          fontWeight: 'semibold',
          _hover: {
            bg: props.colorMode === 'light' ? 'cyan.600' : 'cyan.300',
          },
        }),
      },
    },
  },
})

export default theme
