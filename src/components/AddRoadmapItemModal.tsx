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
  Input,
  Select,
  Textarea,
  VStack,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { useState, type ChangeEvent } from 'react'
import type { RoadmapItem } from '../domain/types'

type CreateItemInput = Omit<
  RoadmapItem,
  | 'id'
  | 'planning_session_id'
  | 'uxSizeBand'
  | 'uxFocusWeeks'
  | 'uxWorkWeeks'
  | 'contentSizeBand'
  | 'contentFocusWeeks'
  | 'contentWorkWeeks'
> & { status?: RoadmapItem['status'] }

interface AddRoadmapItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateItemInput) => Promise<void>
  isSubmitting?: boolean
}

const EMPTY_FORM: CreateItemInput = {
  short_key: '',
  name: '',
  initiative: '',
  priority: 'P1',
  status: 'draft',
  projectType: 'new-feature',
  notes: '',
}

export default function AddRoadmapItemModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AddRoadmapItemModalProps) {
  const [formData, setFormData] = useState<CreateItemInput>(EMPTY_FORM)

  const handleClose = () => {
    setFormData(EMPTY_FORM)
    onClose()
  }

  const handleSubmit = async () => {
    await onSubmit(formData)
    setFormData(EMPTY_FORM)
  }

  const set = (field: keyof CreateItemInput) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent
        bg="gray.800"
        border="1px solid"
        borderColor="gray.700"
        borderRadius="lg"
      >
        <ModalHeader
          color="white"
          fontSize="md"
          fontWeight="semibold"
          borderBottom="1px solid"
          borderColor="gray.700"
        >
          Create roadmap item
        </ModalHeader>
        <ModalCloseButton color="gray.400" _hover={{ color: 'white' }} />

        <ModalBody py={6}>
          <VStack spacing={5} align="stretch">
            {/* Short key + Name */}
            <Grid templateColumns="120px 1fr" gap={4}>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" color="gray.400">
                    Short key
                  </FormLabel>
                  <Input
                    size="sm"
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                    borderRadius="md"
                    color="white"
                    _focus={{ borderColor: 'cyan.400', boxShadow: 'none' }}
                    placeholder="PROJ-001"
                    value={formData.short_key}
                    onChange={set('short_key')}
                  />
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl isRequired>
                  <FormLabel fontSize="xs" color="gray.400">
                    Name
                  </FormLabel>
                  <Input
                    size="sm"
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                    borderRadius="md"
                    color="white"
                    _focus={{ borderColor: 'cyan.400', boxShadow: 'none' }}
                    placeholder="Feature name"
                    value={formData.name}
                    onChange={set('name')}
                  />
                </FormControl>
              </GridItem>
            </Grid>

            {/* Initiative */}
            <FormControl>
              <FormLabel fontSize="xs" color="gray.400">
                Initiative
              </FormLabel>
              <Input
                size="sm"
                bg="gray.700"
                border="1px solid"
                borderColor="gray.600"
                borderRadius="md"
                color="white"
                _focus={{ borderColor: 'cyan.400', boxShadow: 'none' }}
                placeholder="e.g. Growth Q2"
                value={formData.initiative ?? ''}
                onChange={set('initiative')}
              />
            </FormControl>

            {/* Priority + Status + Project type */}
            <Grid templateColumns="1fr 1fr 1fr" gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.400">
                    Priority
                  </FormLabel>
                  <Select
                    size="sm"
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                    borderRadius="md"
                    color="white"
                    _focus={{ borderColor: 'cyan.400', boxShadow: 'none' }}
                    value={formData.priority}
                    onChange={set('priority')}
                  >
                    {(['P0', 'P1', 'P2', 'P3'] as const).map((p) => (
                      <option key={p} value={p} style={{ background: '#2D3748' }}>
                        {p}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.400">
                    Status
                  </FormLabel>
                  <Select
                    size="sm"
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                    borderRadius="md"
                    color="white"
                    _focus={{ borderColor: 'cyan.400', boxShadow: 'none' }}
                    value={formData.status}
                    onChange={set('status')}
                  >
                    {(['draft', 'in-review', 'committed', 'archived'] as const).map((s) => (
                      <option key={s} value={s} style={{ background: '#2D3748' }}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel fontSize="xs" color="gray.400">
                    Project type
                  </FormLabel>
                  <Select
                    size="sm"
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                    borderRadius="md"
                    color="white"
                    _focus={{ borderColor: 'cyan.400', boxShadow: 'none' }}
                    value={formData.projectType ?? ''}
                    onChange={set('projectType')}
                  >
                    <option key="net-new" value="net-new" style={{ background: '#2D3748' }}>
                      New Product
                    </option>
                    {(['new-feature', 'enhancement', 'optimization', 'fix-polish'] as const).map((t) => (
                      <option key={t} value={t} style={{ background: '#2D3748' }}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
            </Grid>

            {/* Notes */}
            <FormControl>
              <FormLabel fontSize="xs" color="gray.400">
                Notes
              </FormLabel>
              <Textarea
                size="sm"
                bg="gray.700"
                border="1px solid"
                borderColor="gray.600"
                borderRadius="md"
                color="white"
                _focus={{ borderColor: 'cyan.400', boxShadow: 'none' }}
                placeholder="Optional context or links"
                rows={3}
                value={formData.notes ?? ''}
                onChange={set('notes')}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="gray.700" gap={3}>
          <Button
            variant="outline"
            borderColor="gray.600"
            color="gray.300"
            _hover={{ borderColor: 'gray.400', color: 'white' }}
            onClick={handleClose}
            isDisabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            bg="cyan.400"
            color="gray.900"
            fontWeight="semibold"
            _hover={{ bg: 'cyan.300' }}
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Creating…"
            isDisabled={!formData.short_key || !formData.name}
          >
            Create item
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
