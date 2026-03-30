import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Text,
  HStack,
  Flex,
  Badge,
  Button,
  Link,
  Input,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  useToast,
  Spinner,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useSettings, DEFAULT_SETTINGS, type Settings } from '../context/SettingsContext'

export default function SettingsPage() {
  const { settings, loading, error: settingsError, saveSettings, resetToDefaults } = useSettings()
  const toast = useToast()

  const [formData, setFormData] = useState({
    effort_weights: { ...DEFAULT_SETTINGS.effort_weights },
    effort_model_enabled: DEFAULT_SETTINGS.effort_model_enabled,
    workstream_impact_enabled: DEFAULT_SETTINGS.workstream_impact_enabled,
    workstream_penalty: DEFAULT_SETTINGS.workstream_penalty,
    focus_time_ratio: DEFAULT_SETTINGS.focus_time_ratio,
    planning_periods: { ...DEFAULT_SETTINGS.planning_periods },
    size_band_thresholds: JSON.parse(JSON.stringify(DEFAULT_SETTINGS.size_band_thresholds)) as Settings['size_band_thresholds'],
    project_type_demand: JSON.parse(JSON.stringify(DEFAULT_SETTINGS.project_type_demand)) as Settings['project_type_demand'],
  })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setFormData({
        effort_weights: { ...settings.effort_weights },
        effort_model_enabled: settings.effort_model_enabled,
        workstream_impact_enabled: settings.workstream_impact_enabled,
        workstream_penalty: settings.workstream_penalty,
        focus_time_ratio: settings.focus_time_ratio,
        planning_periods: { ...settings.planning_periods },
        size_band_thresholds: JSON.parse(JSON.stringify(settings.size_band_thresholds)) as Settings['size_band_thresholds'],
        project_type_demand: JSON.parse(JSON.stringify(settings.project_type_demand)) as Settings['project_type_demand'],
      })
    }
  }, [settings])

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)

      await saveSettings({
        effort_weights: formData.effort_weights,
        effort_model_enabled: formData.effort_model_enabled,
        workstream_impact_enabled: formData.workstream_impact_enabled,
        workstream_penalty: formData.workstream_penalty,
        focus_time_ratio: formData.focus_time_ratio,
        planning_periods: formData.planning_periods,
        size_band_thresholds: formData.size_band_thresholds,
        project_type_demand: formData.project_type_demand,
      })

      await new Promise(resolve => setTimeout(resolve, 100))

      if (!settingsError) {
        toast({
          title: 'Settings saved',
          description: 'Your settings have been saved successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (err) {
      toast({
        title: 'Failed to save settings',
        description: err instanceof Error ? err.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    try {
      setSaving(true)
      await resetToDefaults()
      toast({
        title: 'Settings reset',
        description: 'Settings have been reset to defaults.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      toast({
        title: 'Failed to reset settings',
        description: err instanceof Error ? err.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box minH="100vh" bg="gray.900" color="white">
        <Box maxW="860px" mx="auto" px={6} py={8}>
          <HStack spacing={4}>
            <Spinner color="cyan.400" />
            <Text color="gray.300">Loading settings...</Text>
          </HStack>
        </Box>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="gray.900" color="white" aria-busy={saving}>
      <Box maxW="860px" mx="auto" px={6} py={8} pb={28}>

        {/* Breadcrumb */}
        <Breadcrumb
          mb={6}
          fontSize="sm"
          color="gray.400"
          separator="/"
        >
          <BreadcrumbItem>
            <BreadcrumbLink href="/" color="gray.400" _hover={{ color: 'cyan.400' }}>
              Get Started
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color="white">Settings</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Page title */}
        <Flex align="center" gap={3} mb={2}>
          <Heading size="xl" fontWeight="bold">Settings</Heading>
          <Badge
            colorScheme="cyan"
            variant="subtle"
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="md"
          >
            Admin
          </Badge>
        </Flex>
        <Text color="gray.400" fontSize="sm" mb={8}>
          Configure effort weights, planning periods, size-band thresholds, and project-type demand.
        </Text>

        {/* Table of Contents */}
        <Box
          bg="gray.800"
          border="1px solid"
          borderColor="gray.700"
          borderRadius="lg"
          p={5}
          mb={10}
        >
          <Text fontWeight="semibold" fontSize="sm" color="gray.300" mb={3}>
            On this page
          </Text>
          <Flex direction="column" gap={2}>
            {[
              { label: 'Planning Periods', id: 'planning-periods' },
              { label: 'Focus Time Ratio', id: 'focus-time-ratio' },
              { label: 'Size Band Thresholds', id: 'size-band-thresholds' },
              { label: 'Project-Type Demand', id: 'project-type-demand' },
              { label: 'Effort Model Weights', id: 'effort-model-weights' },
              { label: 'Workstream Impact', id: 'workstream-impact' },
            ].map(({ label, id }) => (
              <Link
                key={id}
                href={`#${id}`}
                fontSize="sm"
                color="cyan.400"
                _hover={{ color: 'cyan.300', textDecoration: 'underline' }}
              >
                {label}
              </Link>
            ))}
          </Flex>
        </Box>

        {/* PLANNING PERIODS */}
        <Box id="planning-periods" mb={12}>
          <Heading size="md" fontWeight="semibold" mb={1}>Planning periods</Heading>
          <Text fontSize="sm" color="gray.400" mb={6}>
            Base weeks, holidays, and PTO per quarter. Focus weeks are calculated read-only.
          </Text>

          <Flex direction="column" gap={6}>
            {Object.entries(formData.planning_periods)
              .sort(([a], [b]) => {
                // Sort by year first, then quarter: Q2_26 → [2, 26], Q1_27 → [1, 27]
                const parse = (k: string) => {
                  const [q, y] = k.replace('Q', '').split('_').map(Number)
                  return y * 10 + q
                }
                return parse(a) - parse(b)
              })
              .map(([quarter, period]) => (
                <Box
                  key={quarter}
                  pb={6}
                  borderBottom="1px solid"
                  borderColor="gray.700"
                  _last={{ borderBottom: 'none', pb: 0 }}
                >
                  <Text fontWeight="semibold" fontSize="sm" color="gray.200" mb={4}>
                    {quarter.replace('_', ' ').replace('Q', 'Q')}
                  </Text>
                  <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                    {/* Base weeks */}
                    <GridItem>
                      <FormLabel fontSize="xs" color="gray.400" mb={1}>Base weeks</FormLabel>
                      <Input
                        size="sm"
                        bg="gray.700"
                        border="1px solid"
                        borderColor="gray.600"
                        borderRadius="md"
                        color="white"
                        _focus={{ borderColor: 'cyan.400', boxShadow: 'none' }}
                        type="number"
                        value={period.baseWeeks}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            planning_periods: {
                              ...prev.planning_periods,
                              [quarter]: {
                                ...prev.planning_periods[quarter],
                                baseWeeks: Number(e.target.value),
                              },
                            },
                          }))
                        }
                      />
                    </GridItem>

                    {/* Holidays */}
                    <GridItem>
                      <FormLabel fontSize="xs" color="gray.400" mb={1}>Holidays</FormLabel>
                      <Input
                        size="sm"
                        bg="gray.700"
                        border="1px solid"
                        borderColor="gray.600"
                        borderRadius="md"
                        color="white"
                        _focus={{ borderColor: 'cyan.400', boxShadow: 'none' }}
                        type="number"
                        value={period.holidays}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            planning_periods: {
                              ...prev.planning_periods,
                              [quarter]: {
                                ...prev.planning_periods[quarter],
                                holidays: Number(e.target.value),
                              },
                            },
                          }))
                        }
                      />
                    </GridItem>

                    {/* PTO */}
                    <GridItem>
                      <FormLabel fontSize="xs" color="gray.400" mb={1}>PTO</FormLabel>
                      <Input
                        size="sm"
                        bg="gray.700"
                        border="1px solid"
                        borderColor="gray.600"
                        borderRadius="md"
                        color="white"
                        _focus={{ borderColor: 'cyan.400', boxShadow: 'none' }}
                        type="number"
                        value={period.pto}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            planning_periods: {
                              ...prev.planning_periods,
                              [quarter]: {
                                ...prev.planning_periods[quarter],
                                pto: Number(e.target.value),
                              },
                            },
                          }))
                        }
                      />
                    </GridItem>

                    {/* Focus weeks (read-only) */}
                    <GridItem>
                      <FormLabel fontSize="xs" color="gray.400" mb={1}>Focus weeks (read-only)</FormLabel>
                      <Box
                        h="32px"
                        display="flex"
                        alignItems="center"
                        px={3}
                        bg="gray.800"
                        borderRadius="md"
                        border="1px solid"
                        borderColor="gray.600"
                        fontSize="sm"
                        color="gray.300"
                      >
                        {period.focusWeeks}
                      </Box>
                    </GridItem>
                  </Grid>
                </Box>
              ))}
          </Flex>
        </Box>

        {/* FOCUS TIME RATIO */}
        <Box id="focus-time-ratio" mb={12}>
          <Heading size="md" fontWeight="semibold" mb={1}>Focus time ratio</Heading>
          <Text fontSize="sm" color="gray.400" mb={6}>
            Ratio used to convert available weeks to focused work weeks. Lower values account for more context switching. Range: 0.4–0.9.
          </Text>

          <Box maxW="420px">
            <Flex justify="space-between" mb={2}>
              <FormLabel fontSize="xs" color="gray.400" m={0}>Focus-time ratio</FormLabel>
              <Text fontSize="sm" fontWeight="semibold" color="cyan.400">
                {formData.focus_time_ratio.toFixed(2)}
              </Text>
            </Flex>
            <Slider
              min={0.4}
              max={0.9}
              step={0.05}
              value={formData.focus_time_ratio}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, focus_time_ratio: val }))
              }
              focusThumbOnChange={false}
            >
              <SliderTrack bg="gray.600">
                <SliderFilledTrack bg="cyan.400" />
              </SliderTrack>
              <SliderThumb boxSize={4} bg="cyan.400" />
            </Slider>
            <Flex justify="space-between" mt={1}>
              <Text fontSize="xs" color="gray.500">0.4 — more switching</Text>
              <Text fontSize="xs" color="gray.500">0.9 — deep focus</Text>
            </Flex>
          </Box>
        </Box>

        {/* SIZE BAND THRESHOLDS */}
        <Box id="size-band-thresholds" mb={12}>
          <Heading size="md" fontWeight="semibold" mb={1}>Size band thresholds</Heading>
          <Text fontSize="sm" color="gray.400" mb={6}>
            Min–max score bands. XL has no upper bound.
          </Text>

          <Grid templateColumns="80px 1fr 1fr" gap={3} alignItems="center" maxW="420px">
            {/* Header row */}
            <GridItem />
            <GridItem>
              <Text fontSize="xs" color="gray.400" fontWeight="semibold">Min</Text>
            </GridItem>
            <GridItem>
              <Text fontSize="xs" color="gray.400" fontWeight="semibold">Max</Text>
            </GridItem>

            {/* One row per band */}
            {(['xs', 's', 'm', 'l', 'xl'] as const).flatMap((band) => [
              <GridItem key={`${band}-label`}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.200" textTransform="uppercase">
                  {band}
                </Text>
              </GridItem>,

              <GridItem key={`${band}-min`}>
                <Input
                  size="sm"
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  borderRadius="md"
                  color="white"
                  _focus={{ borderColor: 'cyan.400', boxShadow: 'none' }}
                  type="number"
                  value={formData.size_band_thresholds[band].min}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      size_band_thresholds: {
                        ...prev.size_band_thresholds,
                        [band]: {
                          ...prev.size_band_thresholds[band],
                          min: Number(e.target.value),
                        },
                      },
                    }))
                  }
                />
              </GridItem>,

              <GridItem key={`${band}-max`}>
                {band === 'xl' ? (
                  <Box
                    h="32px"
                    display="flex"
                    alignItems="center"
                    px={3}
                    fontSize="sm"
                    color="gray.500"
                  >
                    —
                  </Box>
                ) : (
                  <Input
                    size="sm"
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                    borderRadius="md"
                    color="white"
                    _focus={{ borderColor: 'cyan.400', boxShadow: 'none' }}
                    type="number"
                    value={formData.size_band_thresholds[band].max ?? ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        size_band_thresholds: {
                          ...prev.size_band_thresholds,
                          [band]: {
                            ...prev.size_band_thresholds[band],
                            max: Number(e.target.value),
                          },
                        },
                      }))
                    }
                  />
                )}
              </GridItem>,
            ])}
          </Grid>
        </Box>

        {/* PROJECT-TYPE DEMAND */}
        <Box id="project-type-demand" mb={12}>
          <Heading size="md" fontWeight="semibold" mb={1}>Project-type demand</Heading>
          <Text fontSize="sm" color="gray.400" mb={6}>
            Default UX and content size bands by project type.
          </Text>

          <Grid templateColumns="160px 1fr 1fr" gap={3} alignItems="center" maxW="480px">
            {/* Header row */}
            <GridItem />
            <GridItem>
              <Text fontSize="xs" color="gray.400" fontWeight="semibold">UX</Text>
            </GridItem>
            <GridItem>
              <Text fontSize="xs" color="gray.400" fontWeight="semibold">Content</Text>
            </GridItem>

            {/* One row per project type */}
            {(['net-new', 'new-feature', 'enhancement', 'optimization', 'fix-polish'] as const).flatMap((projectType) => [
              <GridItem key={`${projectType}-label`}>
                <Text fontSize="sm" color="gray.200">{projectType}</Text>
              </GridItem>,
              <GridItem key={`${projectType}-ux`}>
                <Select
                  size="sm"
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  borderRadius="md"
                  color="white"
                  _focus={{ borderColor: 'cyan.400', boxShadow: 'none' }}
                  value={formData.project_type_demand[projectType].ux}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      project_type_demand: {
                        ...prev.project_type_demand,
                        [projectType]: {
                          ...prev.project_type_demand[projectType],
                          ux: e.target.value as 'XS' | 'S' | 'M' | 'L' | 'XL',
                        },
                      },
                    }))
                  }
                >
                  {(['XS', 'S', 'M', 'L', 'XL'] as const).map((size) => (
                    <option key={size} value={size} style={{ background: '#2D3748' }}>
                      {size}
                    </option>
                  ))}
                </Select>
              </GridItem>,
              <GridItem key={`${projectType}-content`}>
                <Select
                  size="sm"
                  bg="gray.700"
                  border="1px solid"
                  borderColor="gray.600"
                  borderRadius="md"
                  color="white"
                  _focus={{ borderColor: 'cyan.400', boxShadow: 'none' }}
                  value={formData.project_type_demand[projectType].content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      project_type_demand: {
                        ...prev.project_type_demand,
                        [projectType]: {
                          ...prev.project_type_demand[projectType],
                          content: e.target.value as 'XS' | 'S' | 'M' | 'L' | 'XL',
                        },
                      },
                    }))
                  }
                >
                  {(['XS', 'S', 'M', 'L', 'XL'] as const).map((size) => (
                    <option key={size} value={size} style={{ background: '#2D3748' }}>
                      {size}
                    </option>
                  ))}
                </Select>
              </GridItem>,
            ])}
          </Grid>
        </Box>

        {/* EFFORT MODEL WEIGHTS */}
        <Box id="effort-model-weights" mb={12}>
          <Flex align="center" justify="space-between" mb={1}>
            <Heading size="md" fontWeight="semibold">Effort model weights</Heading>
            <Switch
              isChecked={formData.effort_model_enabled}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, effort_model_enabled: e.target.checked }))
              }
              colorScheme="cyan"
              size="md"
            />
          </Flex>
          <Text fontSize="sm" color="gray.400" mb={6}>
            Relative importance of each complexity factor. Weights are 1–10; displayed as a multiplier (weight ÷ 10).
          </Text>

          <Flex direction="column" gap={8} maxW="480px"
            opacity={formData.effort_model_enabled ? 1 : 0.4}
            pointerEvents={formData.effort_model_enabled ? 'auto' : 'none'}
          >
            {(
              [
                { key: 'productRisk',       label: 'Product risk',       description: 'Multiplier on base effort' },
                { key: 'problemAmbiguity',  label: 'Problem ambiguity',  description: 'Additive weeks (UX)' },
                { key: 'contentSurface',    label: 'Content surface',    description: 'Multiplier (Content)' },
                { key: 'localizationScope', label: 'Localization scope', description: 'Multiplier (Content)' },
              ] as { key: keyof typeof formData.effort_weights; label: string; description: string }[]
            ).map(({ key, label, description }) => (
              <Box key={key}>
                <Flex justify="space-between" mb={1}>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.200">{label}</Text>
                    <Text fontSize="xs" color="gray.500">{description}</Text>
                  </Box>
                  <Flex align="center" gap={3}>
                    <Text fontSize="xs" color="gray.500">
                      ×{(formData.effort_weights[key] / 10).toFixed(1)}
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold" color="cyan.400" minW="24px" textAlign="right">
                      {formData.effort_weights[key]}
                    </Text>
                  </Flex>
                </Flex>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={formData.effort_weights[key]}
                  onChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      effort_weights: { ...prev.effort_weights, [key]: val },
                    }))
                  }
                  focusThumbOnChange={false}
                >
                  <SliderTrack bg="gray.600">
                    <SliderFilledTrack bg="cyan.400" />
                  </SliderTrack>
                  <SliderThumb boxSize={4} bg="cyan.400" />
                </Slider>
                <Flex justify="space-between" mt={1}>
                  <Text fontSize="xs" color="gray.500">1</Text>
                  <Text fontSize="xs" color="gray.500">10</Text>
                </Flex>
              </Box>
            ))}
          </Flex>
        </Box>

        {/* ---- Chunk 7 goes here ---- */}

      {/* end maxW="860px" */}
      </Box>

      {/* STICKY FOOTER */}
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        bg="gray.900"
        borderTop="1px solid"
        borderColor="gray.700"
        px={6}
        py={4}
        zIndex={100}
      >
        <Flex maxW="860px" mx="auto" justify="flex-end" gap={3}>
          <Button
            variant="outline"
            borderColor="gray.600"
            color="gray.300"
            _hover={{ borderColor: 'gray.400', color: 'white' }}
            onClick={() => void handleReset()}
            isDisabled={saving}
          >
            Reset to defaults
          </Button>
          <Button
            bg="cyan.400"
            color="gray.900"
            fontWeight="semibold"
            _hover={{ bg: 'cyan.300' }}
            onClick={() => void handleSave()}
            isLoading={saving}
            loadingText="Saving…"
          >
            Save settings
          </Button>
        </Flex>
      </Box>

    {/* end outer Box bg="gray.900" */}
    </Box>
  )
}
