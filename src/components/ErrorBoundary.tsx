import { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Heading, Text, Button, VStack, Code } from '@chakra-ui/react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
    // Reload the page to reset the entire app state
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box minH="100vh" bg="#0a0a0f" p={8}>
          <Box maxW="800px" mx="auto">
            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="lg" color="red.400" mb={2}>
                  Something went wrong
                </Heading>
                <Text color="gray.300" mb={4}>
                  An error occurred while loading this page. Please try refreshing or contact support if the problem persists.
                </Text>
              </Box>

              {this.state.error && (
                <Box bg="#141419" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)" borderRadius="lg" p={4}>
                  <Text fontSize="sm" fontWeight="bold" color="red.400" mb={2}>
                    Error:
                  </Text>
                  <Code display="block" whiteSpace="pre-wrap" color="gray.300" fontSize="xs" bg="transparent" p={0}>
                    {this.state.error.toString()}
                  </Code>
                </Box>
              )}

              {this.state.errorInfo && process.env.NODE_ENV === 'development' && (
                <Box bg="#141419" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)" borderRadius="lg" p={4}>
                  <Text fontSize="sm" fontWeight="bold" color="gray.400" mb={2}>
                    Stack Trace (dev only):
                  </Text>
                  <Code display="block" whiteSpace="pre-wrap" color="gray.400" fontSize="xs" bg="transparent" p={0}>
                    {this.state.errorInfo.componentStack}
                  </Code>
                </Box>
              )}

              <Button onClick={this.handleReset} colorScheme="cyan" size="lg">
                Reload Page
              </Button>

              <Button
                onClick={() => (window.location.href = '/')}
                variant="outline"
                borderColor="rgba(255, 255, 255, 0.1)"
                color="gray.300"
                _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }}
              >
                Go to Home
              </Button>
            </VStack>
          </Box>
        </Box>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
