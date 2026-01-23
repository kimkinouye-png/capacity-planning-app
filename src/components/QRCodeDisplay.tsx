import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  HStack,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons'

/**
 * QR Code Display Component
 * 
 * Displays a QR code for the current app URL, making it easy for
 * mobile users to scan and access the app.
 */
export default function QRCodeDisplay() {
  const [appUrl, setAppUrl] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  useEffect(() => {
    // Get the current app URL
    const url = window.location.origin + window.location.pathname
    setAppUrl(url)
  }, [])

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl).then(() => {
      toast({
        title: 'URL copied!',
        description: 'The app URL has been copied to your clipboard.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    }).catch(() => {
      toast({
        title: 'Copy failed',
        description: 'Could not copy URL to clipboard.',
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
    })
  }

  const handleOpenUrl = () => {
    window.open(appUrl, '_blank')
  }

  return (
    <>
      {/* Button to open QR code modal */}
      <Tooltip label="Show QR code for mobile access" placement="bottom">
        <IconButton
          aria-label="Show QR code"
          icon={<QRCodeSVG value={appUrl} size={20} />}
          onClick={onOpen}
          variant="ghost"
          color="gray.300"
          _hover={{ color: '#00d9ff', bg: 'rgba(255, 255, 255, 0.05)' }}
        />
      </Tooltip>

      {/* QR Code Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(4px)" />
        <ModalContent bg="#141419" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)" boxShadow="0 25px 50px -12px rgba(0, 217, 255, 0.2)">
          <ModalHeader color="white" borderBottom="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
            Scan QR Code for Mobile Access
          </ModalHeader>
          <ModalCloseButton color="gray.400" _hover={{ color: 'white' }} />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Instructions */}
              <Box>
                <Text color="gray.300" fontSize="sm" mb={4} textAlign="center">
                  Scan this QR code with your mobile device to quickly access the app.
                  The code includes the QA access screen URL.
                </Text>
              </Box>

              {/* QR Code */}
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                p={6}
                bg="white"
                borderRadius="lg"
                border="2px solid"
                borderColor="rgba(255, 255, 255, 0.2)"
              >
                {appUrl && (
                  <QRCodeSVG
                    value={appUrl}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                )}
              </Box>

              {/* URL Display */}
              <Box
                p={4}
                bg="#1a1a20"
                borderRadius="md"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.1)"
              >
                <Text color="gray.400" fontSize="xs" mb={2} fontWeight="medium">
                  App URL:
                </Text>
                <Text
                  color="gray.300"
                  fontSize="sm"
                  fontFamily="mono"
                  wordBreak="break-all"
                >
                  {appUrl}
                </Text>
              </Box>

              {/* Action Buttons */}
              <HStack spacing={3}>
                <Button
                  leftIcon={<CopyIcon />}
                  onClick={handleCopyUrl}
                  variant="outline"
                  borderColor="rgba(255, 255, 255, 0.1)"
                  color="gray.300"
                  _hover={{ bg: 'rgba(255, 255, 255, 0.05)' }}
                  flex={1}
                >
                  Copy URL
                </Button>
                <Button
                  leftIcon={<ExternalLinkIcon />}
                  onClick={handleOpenUrl}
                  colorScheme="cyan"
                  flex={1}
                >
                  Open URL
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
            <Button onClick={onClose} variant="ghost" color="gray.300">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
