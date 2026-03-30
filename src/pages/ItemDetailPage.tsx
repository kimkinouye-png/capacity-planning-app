import { useState, useMemo, useEffect, type ChangeEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  Text,
  Flex,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  Badge,
  Spinner,
  useToast,
} from '@chakra-ui/react'
import { useRoadmapItems } from '../context/RoadmapItemsContext'
import { usePlanningSessions } from '../context/PlanningSessionsContext'
import type { RoadmapItem } from '../domain/types'

type EditableFields = Pick<
  RoadmapItem,
  'name' | 'initiative' | 'priority' | 'status' | 'projectType' | 'notes'
>

const STATUS_COLORS: Record<string, string> = {
  draft: 'gray',
  'in-review': 'blue',
  committed: 'purple',
  archived: 'gray',
}

export default function ItemDetailPage() {
  const { id, itemId } = useParams<{ id: string; itemId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { getItemsForSession, updateItem } = useRoadmapItems()
  const { getSessionById } = usePlanningSessions()

  const session = useMemo(() => (id ? getSessionById(id) : undefined), [id, getSessionById])

  const item = useMemo(
    () => (id && itemId ? getItemsForSession(id).find((i) => i.id === itemId) : undefined),
    [id, itemId, getItemsForSession]
  )

  const [formData, setFormData] = useState<EditableFields>({
    name: '',
    initiative: '',
    priority: 'P1',
    status: 'draft',
    projectType: 'new-feature',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!item) return
    setFormData({
      name: item.name,
      initiative: item.initiative,
      priority: item.priority,
      status: item.status,
      projectType: item.projectType ?? 'new-feature',
      notes: item.notes ?? '',
    })
  }, [item])

  if (!itemId) {
    return (
      <Box minH="100vh" bg="gray.900" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.400">Invalid item ID.</Text>
      </Box>
    )
  }

  if (!item) {
    return (
      <Box minH="100vh" bg="gray.900" display="flex" alignItems="center" justifyContent="center">
        <Spinner color="cyan.400" />
      </Box>
    )
  }

  const set = (field: keyof EditableFields) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateItem(item.id, {
        name: formData.name,
        initiative: formData.initiative,
        priority: formData.priority,
        status: formData.status,
        projectType: formData.projectType as RoadmapItem['projectType'],
        notes: formData.notes,
      })
      toast({
        title: 'Item saved',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error saving item:', error)
      toast({
        title: 'Save failed',
        description: 'Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <Box maxW="860px" mx="auto" px={6} py={8}>
        {/* Breadcrumb */}
        <Breadcrumb mb={6} fontSize="sm" color="gray.400" separator="/">
          <BreadcrumbItem>
            <BreadcrumbLink
              color="cyan.400"
              _hover={{ color: 'cyan.300' }}
              onClick={() => navigate('/')}
            >
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink
              color="cyan.400"
              _hover={{ color: 'cyan.300' }}
              onClick={() => navigate(`/sessions/${id}`)}
            >
              {session?.name ?? 'Plan'}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color="white">{item.short_key}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Header */}
        <Flex align="center" gap={3} mb={2} flexWrap="wrap">
          <Heading size="lg" fontWeight="bold">
            {item.short_key}: {formData.name}
          </Heading>
          <Badge colorScheme={STATUS_COLORS[formData.status ?? 'draft']}>{formData.status ?? 'draft'}</Badge>
        </Flex>
        <Text fontSize="sm" color="gray.400" mb={8}>
          {item.planning_session_id}
        </Text>

        {/* Edit form */}
        <Box bg="gray.800" border="1px solid" borderColor="gray.700" borderRadius="lg" p={6} mb={6}>
          <Heading size="sm" fontWeight="semibold" mb={6} color="gray.200">
            Item details
          </Heading>

          <Flex direction="column" gap={5}>
            {/* Name */}
            <FormControl>
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
                value={formData.name}
                onChange={set('name')}
              />
            </FormControl>

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
                    value={formData.status ?? 'draft'}
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
                    {(['net-new', 'new-feature', 'enhancement', 'optimization', 'fix-polish'] as const).map(
                      (t) => (
                        <option key={t} value={t} style={{ background: '#2D3748' }}>
                          {t}
                        </option>
                      )
                    )}
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
                rows={4}
                value={formData.notes ?? ''}
                onChange={set('notes')}
              />
            </FormControl>
          </Flex>
        </Box>

        {/* Effort summary (read-only) */}
        <Box bg="gray.800" border="1px solid" borderColor="gray.700" borderRadius="lg" p={6} mb={8}>
          <Heading size="sm" fontWeight="semibold" mb={4} color="gray.200">
            Effort estimate
          </Heading>
          <Grid templateColumns="1fr 1fr" gap={6}>
            <GridItem>
              <Text fontSize="xs" color="gray.400" mb={1}>
                UX
              </Text>
              <Flex align="baseline" gap={2}>
                <Text fontSize="2xl" fontWeight="bold" color="cyan.400">
                  {item.uxFocusWeeks?.toFixed(1) ?? '—'}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  focus weeks
                </Text>
              </Flex>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {item.uxWorkWeeks?.toFixed(1) ?? '—'} work weeks · {item.uxSizeBand ?? '—'}
              </Text>
            </GridItem>
            <GridItem>
              <Text fontSize="xs" color="gray.400" mb={1}>
                Content
              </Text>
              <Flex align="baseline" gap={2}>
                <Text fontSize="2xl" fontWeight="bold" color="cyan.400">
                  {item.contentFocusWeeks?.toFixed(1) ?? '—'}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  focus weeks
                </Text>
              </Flex>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {item.contentWorkWeeks?.toFixed(1) ?? '—'} work weeks · {item.contentSizeBand ?? '—'}
              </Text>
            </GridItem>
          </Grid>
        </Box>

        {/* Actions */}
        <Flex justify="space-between" align="center">
          <Button
            variant="ghost"
            color="gray.400"
            _hover={{ color: 'white' }}
            onClick={() => navigate(`/sessions/${id}`)}
          >
            ← Back to plan
          </Button>
          <Button
            bg="cyan.400"
            color="gray.900"
            fontWeight="semibold"
            _hover={{ bg: 'cyan.300' }}
            onClick={handleSave}
            isLoading={saving}
            loadingText="Saving…"
          >
            Save changes
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}
