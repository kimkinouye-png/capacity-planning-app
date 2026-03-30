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
import { useSettings } from '../context/SettingsContext'
import { mapSizeBandToFocusWeeks } from '../config/effortModel'
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

const PROJECT_TYPE_OPTION_LABELS: Record<string, string> = {
  'net-new': 'New Product',
  'new-feature': 'New Feature',
  enhancement: 'Enhancement',
  optimization: 'Optimization',
  'fix-polish': 'Fix & Polish',
}

export default function ItemDetailPage() {
  const { id, itemId } = useParams<{ id: string; itemId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { getItemsForSession, updateItem } = useRoadmapItems()
  const { getSessionById } = usePlanningSessions()
  const { settings } = useSettings()

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
  const [recalcedEffort, setRecalcedEffort] = useState<{
    uxSizeBand: string
    uxFocusWeeks: number
    uxWorkWeeks: number
    contentSizeBand: string
    contentFocusWeeks: number
    contentWorkWeeks: number
  } | null>(null)

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
    setRecalcedEffort(null)
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
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value
      setFormData((prev) => {
        const updated = { ...prev, [field]: value }

        if (field === 'projectType' && settings) {
          const demand = settings.project_type_demand[value]
          if (demand) {
            const uxBand = demand.ux
            const contentBand = demand.content
            const uxFocusWeeks = mapSizeBandToFocusWeeks(uxBand)
            const contentFocusWeeks = mapSizeBandToFocusWeeks(contentBand)
            const focusTimeRatio = settings.focus_time_ratio ?? 0.75
            setRecalcedEffort({
              uxSizeBand: uxBand,
              uxFocusWeeks,
              uxWorkWeeks: Number((uxFocusWeeks / focusTimeRatio).toFixed(1)),
              contentSizeBand: contentBand,
              contentFocusWeeks,
              contentWorkWeeks: Number((contentFocusWeeks / focusTimeRatio).toFixed(1)),
            })
          } else {
            setRecalcedEffort(null)
          }
        } else if (field === 'projectType') {
          setRecalcedEffort(null)
        }

        return updated
      })
    }

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
        ...(recalcedEffort
          ? {
              uxSizeBand: recalcedEffort.uxSizeBand as RoadmapItem['uxSizeBand'],
              uxFocusWeeks: recalcedEffort.uxFocusWeeks,
              uxWorkWeeks: recalcedEffort.uxWorkWeeks,
              contentSizeBand: recalcedEffort.contentSizeBand as RoadmapItem['contentSizeBand'],
              contentFocusWeeks: recalcedEffort.contentFocusWeeks,
              contentWorkWeeks: recalcedEffort.contentWorkWeeks,
            }
          : {}),
      })
      setRecalcedEffort(null)
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

  const displayUxFocusWeeks = recalcedEffort?.uxFocusWeeks ?? item.uxFocusWeeks
  const displayUxWorkWeeks = recalcedEffort?.uxWorkWeeks ?? item.uxWorkWeeks
  const displayUxSizeBand = recalcedEffort?.uxSizeBand ?? item.uxSizeBand
  const displayContentFocusWeeks = recalcedEffort?.contentFocusWeeks ?? item.contentFocusWeeks
  const displayContentWorkWeeks = recalcedEffort?.contentWorkWeeks ?? item.contentWorkWeeks
  const displayContentSizeBand = recalcedEffort?.contentSizeBand ?? item.contentSizeBand

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
                    {(['net-new', 'new-feature', 'enhancement', 'optimization', 'fix-polish'] as const).map((t) => (
                      <option key={t} value={t} style={{ background: '#2D3748' }}>
                        {PROJECT_TYPE_OPTION_LABELS[t]}
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
                  {displayUxFocusWeeks !== undefined && displayUxFocusWeeks !== null
                    ? displayUxFocusWeeks.toFixed(1)
                    : '—'}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  focus weeks
                </Text>
              </Flex>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {displayUxWorkWeeks !== undefined && displayUxWorkWeeks !== null
                  ? displayUxWorkWeeks.toFixed(1)
                  : '—'}{' '}
                work weeks · {displayUxSizeBand ?? '—'}
              </Text>
            </GridItem>
            <GridItem>
              <Text fontSize="xs" color="gray.400" mb={1}>
                Content
              </Text>
              <Flex align="baseline" gap={2}>
                <Text fontSize="2xl" fontWeight="bold" color="cyan.400">
                  {displayContentFocusWeeks !== undefined && displayContentFocusWeeks !== null
                    ? displayContentFocusWeeks.toFixed(1)
                    : '—'}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  focus weeks
                </Text>
              </Flex>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {displayContentWorkWeeks !== undefined && displayContentWorkWeeks !== null
                  ? displayContentWorkWeeks.toFixed(1)
                  : '—'}{' '}
                work weeks · {displayContentSizeBand ?? '—'}
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
