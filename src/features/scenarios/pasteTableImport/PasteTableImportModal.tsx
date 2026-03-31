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
  Select,
} from '@chakra-ui/react'
import { useState, useCallback, KeyboardEvent } from 'react'
import { parsePastedRoadmapItems, getImportSummary, type ParsedRow } from './parsePastedRoadmapItems'

const PROJECT_TYPE_OPTION_LABELS: Record<string, string> = {
  'net-new': 'New Product',
  'new-feature': 'New Feature',
  enhancement: 'Enhancement',
  optimization: 'Optimization',
  'fix-polish': 'Fix & Polish',
}

interface PasteTableImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (items: Array<{
    name: string
    short_key: string
    initiative: string
    priority: 'P0' | 'P1' | 'P2' | 'P3'
    status: 'draft' | 'in-review' | 'committed' | 'archived'
    projectType: string
    uxEffortWeeks?: number
    contentEffortWeeks?: number
    effortWeeks?: number
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
  const [rowMeta, setRowMeta] = useState<
    Record<
      number,
      {
        status: 'draft' | 'in-review' | 'committed' | 'archived'
        projectType: string
      }
    >
  >({})

  const getRowMeta = (index: number) =>
    rowMeta[index] ?? {
      status: 'draft',
      projectType: 'new-feature',
    }

  const setRowField = (index: number, field: 'status' | 'projectType', value: string) => {
    setRowMeta((prev) => ({
      ...prev,
      [index]: { ...getRowMeta(index), [field]: value },
    }))
  }

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
      const itemsToImport = validRows.map((row) => {
        const originalIndex = parsedRows.indexOf(row)
        const meta = getRowMeta(originalIndex)

        const shortKey =
          row.item.title
            .substring(0, 5)
            .toUpperCase()
            .replace(/\s+/g, '')
            .replace(/[^A-Z0-9]/g, '') || 'ITEM'

        let initiative = ''
        if (row.item.startDate || row.item.endDate) {
          const parts: string[] = []
          if (row.item.startDate) parts.push(`Start: ${row.item.startDate}`)
          if (row.item.endDate) parts.push(`End: ${row.item.endDate}`)
          initiative = parts.join(', ')
        }

        const isFiveColumn =
          row.item.uxEffortWeeks !== undefined || row.item.contentEffortWeeks !== undefined

        return {
          name: row.item.title,
          short_key: shortKey,
          initiative,
          priority: 'P1' as const,
          status: meta.status,
          projectType: meta.projectType,
          ...(isFiveColumn
            ? {
                uxEffortWeeks: row.item.uxEffortWeeks,
                contentEffortWeeks: row.item.contentEffortWeeks,
              }
            : {
                effortWeeks: row.item.effortWeeks,
              }),
          startDate: row.item.startDate,
          endDate: row.item.endDate,
        }
      })

      await onImport(itemsToImport)

      // Reset state
      setRawText('')
      setParsedRows([])
      setViewMode('paste')
      onClose()
      setRowMeta({})
    } catch (error) {
      console.error('Error importing items:', error)
      // Error handling is done by the parent component
    } finally {
      setIsImporting(false)
    }
  }, [parsedRows, onImport, onClose, rowMeta])

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
                  <strong>Preferred format:</strong> Name | Short Key | Initiative | Priority | Project Type
                  <br />
                  <strong>Minimum required:</strong> Name only. All other columns are optional.
                  <br />
                  You can paste directly from Google Sheets or Excel. The first row may be a header (will be auto-detected). Project type and status can be set per row in the preview step.
                </Text>
              </FormControl>
            </VStack>
          ) : (
            <VStack spacing={4} align="stretch">
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600">Name</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600">Short Key</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600">Initiative</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600">Priority</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600">Project Type</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600">Status</Th>
                      <Th bg="#1a1a20" color="gray.400" fontSize="12px" fontWeight="600">Valid</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {parsedRows.map((row, index) => (
                      <Tr
                        key={index}
                        bg={row.isValid ? 'transparent' : 'rgba(245, 158, 11, 0.1)'}
                        borderLeft={row.isValid ? 'none' : '3px solid'}
                        borderLeftColor={row.isValid ? 'transparent' : '#f59e0b'}
                      >
                        <Td color={row.isValid ? 'gray.300' : 'gray.400'}>{row.item.title || '—'}</Td>
                        <Td color="gray.400">
                          {row.item.title
                            .substring(0, 5)
                            .toUpperCase()
                            .replace(/\s+/g, '')
                            .replace(/[^A-Z0-9]/g, '') || 'ITEM'}
                        </Td>
                        <Td color="gray.400">—</Td>
                        <Td color="gray.400">P1</Td>
                        <Td>
                          <Select
                            size="xs"
                            bg="gray.700"
                            border="1px solid"
                            borderColor="gray.600"
                            borderRadius="md"
                            color="white"
                            value={getRowMeta(index).projectType}
                            onChange={(e) => setRowField(index, 'projectType', e.target.value)}
                            isDisabled={!row.isValid}
                          >
                            {(['net-new', 'new-feature', 'enhancement', 'optimization', 'fix-polish'] as const).map((t) => (
                              <option key={t} value={t} style={{ background: '#2D3748' }}>
                                {PROJECT_TYPE_OPTION_LABELS[t]}
                              </option>
                            ))}
                          </Select>
                        </Td>
                        <Td>
                          <Select
                            size="xs"
                            bg="gray.700"
                            border="1px solid"
                            borderColor="gray.600"
                            borderRadius="md"
                            color="white"
                            value={getRowMeta(index).status}
                            onChange={(e) => setRowField(index, 'status', e.target.value)}
                            isDisabled={!row.isValid}
                          >
                            {(['draft', 'in-review', 'committed', 'archived'] as const).map((s) => (
                              <option key={s} value={s} style={{ background: '#2D3748' }}>{s}</option>
                            ))}
                          </Select>
                        </Td>
                        <Td>
                          {row.isValid ? (
                            <Badge bg="rgba(16, 185, 129, 0.1)" color="#10b981" border="1px solid" borderColor="rgba(16, 185, 129, 0.3)">OK</Badge>
                          ) : (
                            <Badge bg="rgba(245, 158, 11, 0.1)" color="#f59e0b" border="1px solid" borderColor="rgba(245, 158, 11, 0.3)">
                              {row.errorMessage || 'Invalid'}
                            </Badge>
                          )}
                        </Td>
                      </Tr>
                    ))}
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
