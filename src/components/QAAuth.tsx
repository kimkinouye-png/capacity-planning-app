import { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  Text,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
} from '@chakra-ui/react'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import { QRCodeSVG } from 'qrcode.react'
import { QA_CODE, isQAAuthenticated, setQAAuthenticated } from '../config/qaConfig'

interface QAAuthProps {
  children: React.ReactNode
}

/**
 * QA Authentication Component
 * 
 * Protects the app with a password/code entry screen.
 * Mobile-friendly design with password visibility toggle.
 */
export default function QAAuth({ children }: QAAuthProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [appUrl, setAppUrl] = useState('')
  const toast = useToast()

  // Get the current app URL for QR code
  useEffect(() => {
    setAppUrl(window.location.href)
  }, [])

  // Check authentication on mount
  useEffect(() => {
    setIsAuthenticated(isQAAuthenticated())
    setIsLoading(false)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!code.trim()) {
      setError('Please enter the QA code')
      return
    }

    if (code.trim() === QA_CODE) {
      setQAAuthenticated()
      setIsAuthenticated(true)
      toast({
        title: 'Access granted',
        description: 'Welcome to the Capacity Planning App',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } else {
      setError('Incorrect QA code. Please try again.')
      setCode('')
    }
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Box minH="100vh" bg="#0a0a0f" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.400">Loading...</Text>
      </Box>
    )
  }

  // If authenticated, show the app
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Show password entry screen
  return (
    <Box
      minH="100vh"
      bg="#0a0a0f"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
      py={8}
    >
      <Box
        w="100%"
        maxW="400px"
        bg="#141419"
        border="1px solid"
        borderColor="rgba(255, 255, 255, 0.1)"
        borderRadius="lg"
        p={8}
        boxShadow="0 25px 50px -12px rgba(0, 217, 255, 0.2)"
      >
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <VStack spacing={2} align="center">
            <Heading size="lg" color="white" textAlign="center">
              QA Access
            </Heading>
            <Text color="gray.400" fontSize="sm" textAlign="center">
              Enter the QA code to access the Capacity Planning App
            </Text>
          </VStack>

          {/* Error Message */}
          {error && (
            <Alert status="error" bg="rgba(239, 68, 68, 0.1)" border="1px solid" borderColor="rgba(239, 68, 68, 0.3)" borderRadius="md">
              <AlertIcon color="#ef4444" />
              <Text color="#ef4444" fontSize="sm">{error}</Text>
            </Alert>
          )}

          {/* Password Input Form */}
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text color="gray.300" fontSize="sm" mb={2} fontWeight="medium">
                  QA Code
                </Text>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value)
                      setError('')
                    }}
                    placeholder="Enter QA code"
                    bg="#1a1a20"
                    borderColor="rgba(255, 255, 255, 0.1)"
                    color="white"
                    _focus={{
                      borderColor: '#00d9ff',
                      boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)',
                    }}
                    _placeholder={{ color: 'gray.500' }}
                    autoFocus
                    autoComplete="off"
                    fontSize="lg"
                    letterSpacing={showPassword ? 'normal' : '0.2em'}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      color="gray.400"
                      _hover={{ color: '#00d9ff' }}
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
              </Box>

              <Button
                type="submit"
                colorScheme="cyan"
                size="lg"
                w="100%"
                isLoading={false}
                _hover={{
                  bg: '#00b8d4',
                }}
              >
                Access App
              </Button>
            </VStack>
          </form>

          {/* QR Code Section */}
          <Box
            mt={4}
            p={4}
            bg="#1a1a20"
            borderRadius="md"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
          >
            <VStack spacing={3}>
              <Text color="gray.300" fontSize="sm" fontWeight="medium" textAlign="center">
                Scan QR Code for Mobile Access
              </Text>
              {appUrl && (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  p={3}
                  bg="white"
                  borderRadius="md"
                >
                  <QRCodeSVG
                    value={appUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </Box>
              )}
              <Text color="gray.500" fontSize="xs" textAlign="center">
                Scan with your phone camera to open this page
              </Text>
            </VStack>
          </Box>

          {/* Help Text */}
          <Text color="gray.500" fontSize="xs" textAlign="center" mt={2}>
            This is a protected QA environment. Contact the development team for access.
          </Text>
        </VStack>
      </Box>
    </Box>
  )
}
