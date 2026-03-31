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
  useColorModeValue,
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

        // Use parsed short key if available, otherwise generate from title
        const shortKey =
          row.item.shortKey ||
          row.item.title
            .substring(0, 5)
            .toUpperCase()
            .replace(/\s+/g, '')
            .replace(/[^A-Z0-9]/g, '') ||
          'ITEM'

        // Use parsed priority if available, otherwise default P1
        const priority = (row.item.priority as 'P0' | 'P1' | 'P2' | 'P3') ?? 'P1'

        // Use parsed project type if available, otherwise use row meta dropdown
        const projectType = row.item.projectType ?? meta.projectType

        return {
          name: row.item.title,
          short_key: shortKey,
          initiative: row.item.initiative ?? '',
          priority,
          status: meta.status,
          projectType,
          startDate: row.item.startDate,
          endDate: row.item.endDate,
          uxEffortWeeks: row.item.uxEffortWeeks,
          contentEffortWeeks: row.item.contentEffortWeeks,
          effortWeeks: row.item.effortWeeks,
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

  const bgModal = useColorModeValue('white', '#141419')
  const borderColor = useColorModeValue('gray.200', 'rgba(255, 255, 255, 0.1)')
  const textPrimary = useColorModeValue('gray.900', 'white')
  const textSecondary = useColorModeValue('gray.600', 'gray.300')
  const textMuted = useColorModeValue('gray.500', 'gray.500')
  const textareaFocusBorder = useColorModeValue('cyan.400', '#00d9ff')
  const textareaFocusShadow = useColorModeValue(
    '0 0 0 1px rgba(0, 212, 255, 0.4)',
    '0 0 0 1px rgba(0, 217, 255, 0.5)'
  )
  const inputBg = useColorModeValue('white', '#1a1a20')
  const tableHeaderBg = useColorModeValue('gray.50', '#1a1a20')
  const tableHeaderColor = useColorModeValue('gray.500', 'gray.400')
  const invalidRowBg = useColorModeValue('orange.50', 'rgba(245, 158, 11, 0.1)')
  const invalidRowBorder = useColorModeValue('orange.300', '#f59e0b')
  const cancelBorder = useColorModeValue('gray.200', 'rgba(255, 255, 255, 0.1)')
  const cancelColor = useColorModeValue('gray.600', 'gray.300')
  const cancelHoverBorder = useColorModeValue('gray.300', 'rgba(255, 255, 255, 0.3)')
  const cancelHoverBg = useColorModeValue('gray.50', 'rgba(255, 255, 255, 0.05)')
  const optionBg = useColorModeValue('#f7fafc', '#2D3748')
  const selectBg = useColorModeValue('white', 'gray.700')
  const selectBorder = useColorModeValue('gray.200', 'gray.600')
  const okBadgeBg = useColorModeValue('green.50', 'rgba(16, 185, 129, 0.1)')
  const okBadgeColor = useColorModeValue('green.700', '#10b981')
  const okBadgeBorder = useColorModeValue('green.200', 'rgba(16, 185, 129, 0.3)')
  const warnBadgeBg = useColorModeValue('orange.50', 'rgba(245, 158, 11, 0.1)')
  const warnBadgeColor = useColorModeValue('orange.700', '#f59e0b')
  const warnBadgeBorder = useColorModeValue('orange.200', 'rgba(245, 158, 11, 0.3)')

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={!isImporting}>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
      <ModalContent bg={bgModal} border="1px solid" borderColor={borderColor}>
        <ModalHeader color={textPrimary}>Paste roadmap items</ModalHeader>
        <ModalCloseButton color={textMuted} _hover={{ color: textPrimary }} />

        <ModalBody>
          {viewMode === 'paste' ? (
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel color={textSecondary}>Paste from spreadsheet</FormLabel>
                <Textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  placeholder="Paste your data here..."
                  bg={inputBg}
                  borderColor={borderColor}
                  color={textPrimary}
                  _focus={{
                    borderColor: textareaFocusBorder,
                    boxShadow: textareaFocusShadow,
                  }}
                  _placeholder={{ color: textMuted }}
                  rows={10}
                  fontFamily="mono"
                  fontSize="sm"
                />
                <Text fontSize="xs" color={textMuted} mt={2}>
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
                      <Th bg={tableHeaderBg} color={tableHeaderColor} fontSize="12px" fontWeight="600">Name</Th>
                      <Th bg={tableHeaderBg} color={tableHeaderColor} fontSize="12px" fontWeight="600">Short Key</Th>
                      <Th bg={tableHeaderBg} color={tableHeaderColor} fontSize="12px" fontWeight="600">Initiative</Th>
                      <Th bg={tableHeaderBg} color={tableHeaderColor} fontSize="12px" fontWeight="600">Priority</Th>
                      <Th bg={tableHeaderBg} color={tableHeaderColor} fontSize="12px" fontWeight="600">Project Type</Th>
                      <Th bg={tableHeaderBg} color={tableHeaderColor} fontSize="12px" fontWeight="600">Status</Th>
                      <Th bg={tableHeaderBg} color={tableHeaderColor} fontSize="12px" fontWeight="600">Valid</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {parsedRows.map((row, index) => (
                      <Tr
                        key={index}
                        bg={row.isValid ? 'transparent' : invalidRowBg}
                        borderLeft={row.isValid ? 'none' : '3px solid'}
                        borderLeftColor={row.isValid ? 'transparent' : invalidRowBorder}
                      >
                        <Td color={row.isValid ? textSecondary : textMuted}>{row.item.title || '—'}</Td>
                        <Td color={textMuted}>
                          {row.item.title
                            .substring(0, 5)
                            .toUpperCase()
                            .replace(/\s+/g, '')
                            .replace(/[^A-Z0-9]/g, '') || 'ITEM'}
                        </Td>
                        <Td color={textMuted}>—</Td>
                        <Td color={textMuted}>P1</Td>
                        <Td>
                          <Select
                            size="xs"
                            bg={selectBg}
                            border="1px solid"
                            borderColor={selectBorder}
                            borderRadius="md"
                            color={textPrimary}
                            value={getRowMeta(index).projectType}
                            onChange={(e) => setRowField(index, 'projectType', e.target.value)}
                            isDisabled={!row.isValid}
                          >
                            {(['net-new', 'new-feature', 'enhancement', 'optimization', 'fix-polish'] as const).map((t) => (
                              <option key={t} value={t} style={{ background: optionBg }}>
                                {PROJECT_TYPE_OPTION_LABELS[t]}
                              </option>
                            ))}
                          </Select>
                        </Td>
                        <Td>
                          <Select
                            size="xs"
                            bg={selectBg}
                            border="1px solid"
                            borderColor={selectBorder}
                            borderRadius="md"
                            color={textPrimary}
                            value={getRowMeta(index).status}
                            onChange={(e) => setRowField(index, 'status', e.target.value)}
                            isDisabled={!row.isValid}
                          >
                            {(['draft', 'in-review', 'committed', 'archived'] as const).map((s) => (
                              <option key={s} value={s} style={{ background: optionBg }}>{s}</option>
                            ))}
                          </Select>
                        </Td>
                        <Td>
                          {row.isValid ? (
                            <Badge bg={okBadgeBg} color={okBadgeColor} border="1px solid" borderColor={okBadgeBorder}>OK</Badge>
                          ) : (
                            <Badge bg={warnBadgeBg} color={warnBadgeColor} border="1px solid" borderColor={warnBadgeBorder}>
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
                <Text fontSize="sm" color={textSecondary}>
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
              borderColor={cancelBorder}
              color={cancelColor}
              _hover={{
                borderColor: cancelHoverBorder,
                color: textPrimary,
                bg: cancelHoverBg,
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
