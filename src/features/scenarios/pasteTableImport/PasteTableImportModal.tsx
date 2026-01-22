import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  VStack,
  HStack,
  Badge,
  Box,
} from '@chakra-ui/react'
import { useState, useCallback, KeyboardEvent } from 'react'
import { parsePastedRoadmapItems, getImportSummary, type ParsedRow } from './parsePastedRoadmapItems'

interface PasteTableImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (items: Array<{ 
    name: string
    short_key: string
    initiative: string
    priority: number
    effortWeeks?: number // Legacy 4-column format
    uxEffortWeeks?: number // 5-column format
    contentEffortWeeks?: number // 5-column format
    startDate?: string
    endDate?: string
  }>) => Promise<void>
}

type ViewMode = 'paste' | 'preview'

export default function PasteTableImportModal({
  isOpen,
  onClose,
  onImport,
}: PasteTableImportModalProps) {
  const [rawText, setRawText] = useState('')
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('paste')
  const [isImporting, setIsImporting] = useState(false)

  const handlePreview = useCallback(() => {
    const parsed = parsePastedRoadmapItems(rawText)
    setParsedRows(parsed)
    setViewMode('preview')
  }, [rawText])

  const handleImport = useCallback(async () => {
    const validRows = parsedRows.filter((row) => row.isValid)
    if (validRows.length === 0) {
      return
    }

    setIsImporting(true)
    try {
      // Map to the format expected by createItem
      const itemsToImport = validRows.map((row) => {
        // Generate short_key from title (first 3-5 chars, uppercase, remove spaces)
        const shortKey = row.item.title
          .substring(0, 5)
          .toUpperCase()
          .replace(/\s+/g, '')
          .replace(/[^A-Z0-9]/g, '') || 'ITEM'

        // Store dates in initiative field (temporary workaround until proper date fields are added)
        // Format: "Start: {startDate}, End: {endDate}"
        let initiative = ''
        if (row.item.startDate || row.item.endDate) {
          const parts: string[] = []
          if (row.item.startDate) parts.push(`Start: ${row.item.startDate}`)
          if (row.item.endDate) parts.push(`End: ${row.item.endDate}`)
          initiative = parts.join(', ')
        }

        // Check if this is 5-column format (has separate UX/Content effort)
        const isFiveColumn = row.item.uxEffortWeeks !== undefined || row.item.contentEffortWeeks !== undefined

        if (isFiveColumn) {
          return {
            name: row.item.title,
            short_key: shortKey,
            initiative,
            priority: 1, // Default priority
            uxEffortWeeks: row.item.uxEffortWeeks,
            contentEffortWeeks: row.item.contentEffortWeeks,
            startDate: row.item.startDate,
            endDate: row.item.endDate,
          }
        } else {
          // Legacy 4-column format: single effort column
          return {
            name: row.item.title,
            short_key: shortKey,
            initiative,
            priority: 1, // Default priority
            effortWeeks: row.item.effortWeeks, // Will be split 50/50 into uxFocusWeeks and contentFocusWeeks
            startDate: row.item.startDate,
            endDate: row.item.endDate,
          }
        }
      })

      await onImport(itemsToImport)
      
      // Reset state
      setRawText('')
      setParsedRows([])
      setViewMode('paste')
      onClose()
    } catch (error) {
      console.error('Error importing items:', error)
      // Error handling is done by the parent component
    } finally {
      setIsImporting(false)
    }
  }, [parsedRows, onImport, onClose])

  const handleTextareaKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent Enter from submitting, but allow Shift+Enter for new lines
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
    }
  }, [])

  const summary = getImportSummary(parsedRows)

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={!isImporting}>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
      <ModalContent bg="#141419" border="1px solid" borderColor="rgba(255, 255, 255, 0.1)">
        <ModalHeader color="white">Paste roadmap items</ModalHeader>
        <ModalCloseButton color="gray.400" _hover={{ color: 'white' }} />

        <ModalBody>
          {viewMode === 'paste' ? (
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel color="gray.300">Paste from spreadsheet</FormLabel>
                <Textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder="Paste your data here..."
                  bg="#1a1a20"
                  borderColor="rgba(255, 255, 255, 0.1)"
                  color="white"
                  _focus={{
                    borderColor: '#00d9ff',
                    boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)',
                  }}
                  _placeholder={{ color: 'gray.500' }}
                  rows={10}
                  fontFamily="mono"
                  fontSize="sm"
                />
                <Text fontSize="xs" color="gray.400" mt={2}>
                  <strong>Preferred format:</strong> Title | Start date | End date | UX effort weeks | Content effort weeks
                  <br />
                  <strong>Also supported:</strong> Title | Start date | End date | Effort weeks (legacy)
                  <br />
                  You can paste directly from Google Sheets or Excel. The first row may be a header (will be auto-detected).
                </Text>
              </FormControl>
            </VStack>
          ) : (
            <VStack spacing={4} align="stretch">
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600">Title</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600">Start date</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600">End date</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600">UX effort</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600">Content effort</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600">Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {parsedRows.map((row, index) => {
                      // Determine if this is 5-column format (has UX/Content) or 4-column (legacy)
                      const isFiveColumn = row.item.uxEffortWeeks !== undefined || row.item.contentEffortWeeks !== undefined
                      
                      return (
                        <Tr
                          key={index}
                          bg={row.isValid ? 'transparent' : 'rgba(245, 158, 11, 0.1)'}
                          borderLeft={row.isValid ? 'none' : '3px solid'}
                          borderLeftColor={row.isValid ? 'transparent' : '#f59e0b'}
                        >
                          <Td color={row.isValid ? 'gray.300' : 'gray.400'}>
                            {row.item.title || '—'}
                          </Td>
                          <Td color={row.isValid ? 'gray.400' : 'gray.500'}>
                            {row.item.startDate || '—'}
                          </Td>
                          <Td color={row.isValid ? 'gray.400' : 'gray.500'}>
                            {row.item.endDate || '—'}
                          </Td>
                          <Td color={row.isValid ? 'gray.400' : 'gray.500'}>
                            {isFiveColumn 
                              ? (row.item.uxEffortWeeks !== undefined ? row.item.uxEffortWeeks.toFixed(1) : '—')
                              : (row.item.effortWeeks !== undefined ? row.item.effortWeeks.toFixed(1) : '—')
                            }
                          </Td>
                          <Td color={row.isValid ? 'gray.400' : 'gray.500'}>
                            {isFiveColumn 
                              ? (row.item.contentEffortWeeks !== undefined ? row.item.contentEffortWeeks.toFixed(1) : '—')
                              : (row.item.effortWeeks !== undefined ? (row.item.effortWeeks / 2).toFixed(1) : '—')
                            }
                          </Td>
                          <Td>
                            {row.isValid ? (
                              <Badge bg="rgba(16, 185, 129, 0.1)" color="#10b981" border="1px solid" borderColor="rgba(16, 185, 129, 0.3)">
                                OK
                              </Badge>
                            ) : (
                              <Badge bg="rgba(245, 158, 11, 0.1)" color="#f59e0b" border="1px solid" borderColor="rgba(245, 158, 11, 0.3)">
                                {row.errorMessage || 'Invalid'}
                              </Badge>
                            )}
                          </Td>
                        </Tr>
                      )
                    })}
                  </Tbody>
                </Table>
              </TableContainer>

              <Box>
                <Text fontSize="sm" color="gray.300">
                  {summary.validCount} {summary.validCount === 1 ? 'item' : 'items'} ready to import
                  {summary.invalidCount > 0 && (
                    <>, {summary.invalidCount} {summary.invalidCount === 1 ? 'row has' : 'rows have'} issues</>
                  )}
                </Text>
              </Box>
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button
              variant="outline"
              onClick={() => {
                if (viewMode === 'preview') {
                  setViewMode('paste')
                } else {
                  onClose()
                }
              }}
              isDisabled={isImporting}
              borderColor="rgba(255, 255, 255, 0.1)"
              color="gray.300"
              _hover={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                bg: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              {viewMode === 'preview' ? 'Back' : 'Cancel'}
            </Button>
            {viewMode === 'paste' ? (
              <Button
                colorScheme="cyan"
                onClick={handlePreview}
                isDisabled={!rawText.trim()}
              >
                Preview items
              </Button>
            ) : (
              <Button
                colorScheme="cyan"
                onClick={handleImport}
                isDisabled={summary.validCount === 0}
                isLoading={isImporting}
                loadingText="Importing..."
              >
                Add items to scenario
              </Button>
            )}
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
