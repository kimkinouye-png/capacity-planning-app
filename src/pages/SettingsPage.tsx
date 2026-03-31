import {
  Box,
  FormLabel,
  Grid,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useSettings, DEFAULT_SETTINGS, type Settings } from '../context/SettingsContext'
import { resetWorkspace } from '../utils/session'

export default function SettingsPage() {
  const { settings, loading, error: settingsError, saveSettings, resetToDefaults } = useSettings()
  const toast = useToast()
  const { isOpen: isResetOpen, onOpen: onResetOpen, onClose: onResetClose } = useDisclosure()

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

  const bgPage = useColorModeValue('gray.50', 'gray.900')
  const bgCard = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textPrimary = useColorModeValue('gray.900', 'white')
  const textSecondary = useColorModeValue('gray.600', 'gray.400')
  const textMuted = useColorModeValue('gray.500', 'gray.500')
  const inputBg = useColorModeValue('white', 'gray.700')
  const inputBorder = useColorModeValue('gray.200', 'gray.600')
  const sliderTrackBg = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    if (settings) {
      setFormData({
        effort_weights: { ...settings.effort_weights },
        effort_model_enabled: settings.effort_model_enabled,
        workstream_impact_enabled: settings.workstream_impact_enabled,
        workstream_penalty: Number(settings.workstream_penalty),
        focus_time_ratio: Number(settings.focus_time_ratio),
        planning_periods: { ...settings.planning_periods },
        size_band_thresholds: JSON.parse(JSON.stringify(settings.size_band_thresholds)),
        project_type_demand: JSON.parse(JSON.stringify(settings.project_type_demand)),
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
      <Box minH="100vh" bg={bgPage} color={textPrimary}>
        <Box maxW="860px" mx="auto" px={6} py={8}>
          <HStack spacing={4}>
            <Spinner color="cyan.400" />
            <Text color={textSecondary}>Loading settings...</Text>
          </HStack>
        </Box>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg={bgPage} color={textPrimary} aria-busy={saving}>
      <Box maxW="860px" mx="auto" px={6} py={8} pb={28}>

        {/* Page title */}
        <Flex align="center" gap={3} mb={2}>
          <Heading size="xl" fontWeight="bold">Settings</Heading>
          <Badge colorScheme="cyan" variant="subtle" fontSize="xs" px={2} py={1} borderRadius="md">
            Admin
          </Badge>
        </Flex>
        <Text color={textSecondary} fontSize="sm" mb={8}>
          Configure global effort model weights, focus-time ratio, and size-band thresholds
        </Text>

        {/* Table of Contents */}
        <Box bg={bgCard} border="1px solid" borderColor={borderColor} borderRadius="lg" p={5} mb={10}>
          <Text fontWeight="semibold" fontSize="sm" color={textSecondary} mb={3}>Table of Contents</Text>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={2}>
            {[
              { label: 'Planning Periods', id: 'planning-periods' },
              { label: 'Size Band Thresholds', id: 'size-band-thresholds' },
              { label: 'Project-Type Demand', id: 'project-type-demand' },
              { label: 'Effort Model Weights', id: 'effort-model-weights' },
              { label: 'Focus Time Ratio', id: 'focus-time-ratio' },
              { label: 'Reset Workspace', id: 'danger-zone' },
            ].map(({ label, id }) => (
              <Flex key={id} align="center" gap={2}>
                <Text color="cyan.500" fontSize="sm">→</Text>
                <Link
                  href={`#${id}`}
                  fontSize="sm"
                  color="cyan.500"
                  _hover={{ color: 'cyan.600', textDecoration: 'underline' }}
                >
                  {label}
                </Link>
              </Flex>
            ))}
          </Grid>
        </Box>

        {/* PLANNING PERIODS */}
        <Box id="planning-periods" mb={12}>
          <Box bg={bgCard} border="1px solid" borderColor={borderColor} borderRadius="lg" p={6}>
            <Heading size="sm" fontWeight="semibold" mb={1} color={textPrimary}>Planning Periods</Heading>
            <Text fontSize="sm" color={textSecondary} mb={6}>
              Configure work weeks, holidays, and planned time off for each quarter (Q2'26 – Q1'27). Focus weeks are automatically calculated based on the Focus Time Ratio setting.
            </Text>

            {/* Table header */}
            <Grid templateColumns="100px 1fr 1fr 1fr 1fr" gap={3} mb={2} px={1}>
              {['Quarter', 'Base Weeks', 'Holidays (days)', 'PTO (days)', 'Focus Weeks'].map((h) => (
                <Text key={h} fontSize="xs" fontWeight="semibold" color={textMuted}>{h}</Text>
              ))}
            </Grid>

            <Flex direction="column" gap={3}>
              {Object.entries(formData.planning_periods)
                .sort(([a], [b]) => {
                  const parse = (k: string) => {
                    const [q, y] = k.replace('Q', '').split('_').map(Number)
                    return y * 10 + q
                  }
                  return parse(a) - parse(b)
                })
                .map(([quarter, period]) => (
                  <Grid key={quarter} templateColumns="100px 1fr 1fr 1fr 1fr" gap={3} alignItems="center">
                    <Text fontSize="sm" fontWeight="medium" color={textPrimary}>
                      {quarter.replace('_', "'")}
                    </Text>
                    {(['baseWeeks', 'holidays', 'pto'] as const).map((field) => (
                      <Input
                        key={field}
                        size="sm"
                        bg={inputBg}
                        border="1px solid"
                        borderColor={inputBorder}
                        borderRadius="md"
                        color={textPrimary}
                        _focus={{ borderColor: 'cyan.400', boxShadow: 'none' }}
                        type="number"
                        value={period[field]}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            planning_periods: {
                              ...prev.planning_periods,
                              [quarter]: {
                                ...prev.planning_periods[quarter],
                                [field]: Number(e.target.value),
                              },
                            },
                          }))
                        }
                      />
                    ))}
                    <Box
                      h="32px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      px={3}
                      bg="cyan.50"
                      borderRadius="md"
                      border="1px solid"
                      borderColor="cyan.200"
                      fontSize="sm"
                      fontWeight="semibold"
                      color="cyan.600"
                      _dark={{ bg: 'cyan.900', borderColor: 'cyan.700', color: 'cyan.300' }}
                    >
                      {(
                        Math.max(0,
                          period.baseWeeks - (period.holidays / 5) - (period.pto / 5)
                        ) * formData.focus_time_ratio
                      ).toFixed(1)}
                    </Box>
                  </Grid>
                ))}
            </Flex>
          </Box>
        </Box>

        {/* FOCUS TIME RATIO */}
        <Box id="focus-time-ratio" mb={12}>
          <Box bg={bgCard} border="1px solid" borderColor={borderColor} borderRadius="lg" p={6}>
            <Heading size="sm" fontWeight="semibold" mb={1} color={textPrimary}>Focus Time Ratio</Heading>
            <Text fontSize="sm" color={textSecondary} mb={6}>
              Percentage of available time that can be dedicated to focused project work, accounting for meetings, emails, and administrative tasks
            </Text>
            <Flex justify="space-between" mb={2}>
              <FormLabel fontSize="xs" color={textMuted} m={0}>Focus-Time Ratio</FormLabel>
              <Text fontSize="sm" fontWeight="semibold" color="cyan.500">
                {Math.round(formData.focus_time_ratio * 100)}%
              </Text>
            </Flex>
            <Slider
              min={0.4} max={0.9} step={0.05}
              value={formData.focus_time_ratio}
              onChange={(val) => setFormData((prev) => ({ ...prev, focus_time_ratio: val }))}
              focusThumbOnChange={false}
            >
              <SliderTrack bg={sliderTrackBg}>
                <SliderFilledTrack bg="cyan.400" />
              </SliderTrack>
              <SliderThumb boxSize={4} bg="cyan.400" />
            </Slider>
            <Text fontSize="xs" color={textMuted} mt={2}>
              Accounts for meetings, context switching, and interruptions. Lower = more overhead.
            </Text>
          </Box>
        </Box>

        {/* SIZE BAND THRESHOLDS */}
        <Box id="size-band-thresholds" mb={12}>
          <Box bg={bgCard} border="1px solid" borderColor={borderColor} borderRadius="lg" p={6}>
            <Heading size="sm" fontWeight="semibold" mb={1} color={textPrimary}>Size Band Thresholds</Heading>
            <Text fontSize="sm" color={textSecondary} mb={6}>
              Define work week ranges for each size band (XS, S, M, L, XL)
            </Text>

            <Grid templateColumns="80px 1fr 1fr 1fr" gap={3} alignItems="center" mb={2} px={1}>
              {['Size Band', 'Min Weeks', 'Max Weeks', 'Range'].map((h) => (
                <Text key={h} fontSize="xs" fontWeight="semibold" color={textMuted}>{h}</Text>
              ))}
            </Grid>

            {(['xs', 's', 'm', 'l', 'xl'] as const).map((band) => {
              const min = formData.size_band_thresholds[band].min
              const max = formData.size_band_thresholds[band].max
              const rangeText = max !== undefined ? `${min}–${max} weeks` : `${min}+ weeks`
              return (
                <Grid key={band} templateColumns="80px 1fr 1fr 1fr" gap={3} alignItems="center" mb={3}>
                  <Text fontSize="sm" fontWeight="semibold" color={textPrimary} textTransform="uppercase">
                    {band}
                  </Text>
                  <Input
                    size="sm" bg={inputBg} border="1px solid" borderColor={inputBorder}
                    borderRadius="md" color={textPrimary}
                    _focus={{ borderColor: 'cyan.400', boxShadow: 'none' }}
                    type="number"
                    value={min}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        size_band_thresholds: {
                          ...prev.size_band_thresholds,
                          [band]: { ...prev.size_band_thresholds[band], min: Number(e.target.value) },
                        },
                      }))
                    }
                  />
                  {band === 'xl' ? (
                    <Text fontSize="sm" color={textMuted} px={3}>—</Text>
                  ) : (
                    <Input
                      size="sm" bg={inputBg} border="1px solid" borderColor={inputBorder}
                      borderRadius="md" color={textPrimary}
                      _focus={{ borderColor: 'cyan.400', boxShadow: 'none' }}
                      type="number"
                      value={max ?? ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          size_band_thresholds: {
                            ...prev.size_band_thresholds,
                            [band]: { ...prev.size_band_thresholds[band], max: Number(e.target.value) },
                          },
                        }))
                      }
                    />
                  )}
                  <Text fontSize="sm" color={textMuted}>{rangeText}</Text>
                </Grid>
              )
            })}
          </Box>
        </Box>

        {/* PROJECT TYPE DEMAND */}
        <Box id="project-type-demand" mb={12}>
          <Box bg={bgCard} border="1px solid" borderColor={borderColor} borderRadius="lg" p={6}>
            <Heading size="sm" fontWeight="semibold" mb={1} color={textPrimary}>Project Type Demand</Heading>
            <Text fontSize="sm" color={textSecondary} mb={6}>
              Define the demand for each project type in terms of UX and content design effort
            </Text>

            <Grid templateColumns="1fr 160px 160px" gap={3} alignItems="center" mb={2} px={1}>
              <Text fontSize="xs" fontWeight="semibold" color={textMuted}>Project Type</Text>
              <Text fontSize="xs" fontWeight="semibold" color={textMuted}>UX Design Effort</Text>
              <Text fontSize="xs" fontWeight="semibold" color={textMuted}>Content Design Effort</Text>
            </Grid>

            {(['net-new', 'new-feature', 'enhancement', 'optimization', 'fix-polish'] as const).map((projectType) => {
              const labels: Record<string, string> = {
                'net-new': 'New Product',
                'new-feature': 'New Feature',
                enhancement: 'Enhancement',
                optimization: 'Optimization',
                'fix-polish': 'Fix & Polish',
              }
              return (
                <Grid key={projectType} templateColumns="1fr 160px 160px" gap={3} alignItems="center" mb={3}>
                  <Text fontSize="sm" color={textPrimary}>{labels[projectType]}</Text>
                  {(['ux', 'content'] as const).map((discipline) => (
                    <Select
                      key={discipline}
                      size="sm" bg={inputBg} border="1px solid" borderColor={inputBorder}
                      borderRadius="md" color={textPrimary}
                      _focus={{ borderColor: 'cyan.400', boxShadow: 'none' }}
                      value={formData.project_type_demand[projectType][discipline]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          project_type_demand: {
                            ...prev.project_type_demand,
                            [projectType]: {
                              ...prev.project_type_demand[projectType],
                              [discipline]: e.target.value as 'XS' | 'S' | 'M' | 'L' | 'XL',
                            },
                          },
                        }))
                      }
                    >
                      {(['XS', 'S', 'M', 'L', 'XL'] as const).map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </Select>
                  ))}
                </Grid>
              )
            })}
          </Box>
        </Box>

        {/* EFFORT MODEL WEIGHTS */}
        <Box id="effort-model-weights" mb={12}>
          <Box bg={bgCard} border="1px solid" borderColor={borderColor} borderRadius="lg" p={6}>
            <Flex align="center" justify="space-between" mb={1}>
              <Heading size="sm" fontWeight="semibold" color={textPrimary}>Effort Model Weights</Heading>
              <Flex align="center" gap={2}>
                <Text fontSize="xs" color={textMuted}>
                  {formData.effort_model_enabled ? 'Enabled' : 'Disabled'}
                </Text>
                <Switch
                  isChecked={formData.effort_model_enabled}
                  onChange={(e) => setFormData((prev) => ({ ...prev, effort_model_enabled: e.target.checked }))}
                  colorScheme="cyan" size="md"
                />
              </Flex>
            </Flex>
            <Text fontSize="sm" color={textSecondary} mb={6}>
              Adjust the weights for different complexity factors. Higher values increase the impact on effort calculations.
            </Text>

            <Box
              opacity={formData.effort_model_enabled ? 1 : 0.4}
              pointerEvents={formData.effort_model_enabled ? 'auto' : 'none'}
            >
              {/* UX Design */}
              <Text fontSize="sm" fontWeight="semibold" color={textPrimary} mb={4}>UX Design</Text>
              <Flex direction="column" gap={6} mb={8}>
                {([
                  { key: 'productRisk', label: 'Product Risk', description: 'How much impact does this roadmap have on the business?' },
                  { key: 'problemAmbiguity', label: 'Problem Ambiguity', description: 'If a problem statement is not "clear" enough, how will this impact the design?' },
                ] as { key: keyof typeof formData.effort_weights; label: string; description: string }[]).map(({ key, label, description }) => (
                  <Box key={key}>
                    <Flex justify="space-between" mb={1}>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" color={textPrimary}>{label}</Text>
                        <Text fontSize="xs" color={textMuted}>{description}</Text>
                      </Box>
                      <Text fontSize="sm" fontWeight="semibold" color="cyan.500" minW="60px" textAlign="right">
                        {formData.effort_weights[key]} <Text as="span" fontSize="xs" color={textMuted}>(×{(formData.effort_weights[key] / 10).toFixed(1)})</Text>
                      </Text>
                    </Flex>
                    <Slider min={1} max={10} step={1} value={formData.effort_weights[key]}
                      onChange={(val) => setFormData((prev) => ({ ...prev, effort_weights: { ...prev.effort_weights, [key]: val } }))}
                      focusThumbOnChange={false}
                    >
                      <SliderTrack bg={sliderTrackBg}>
                        <SliderFilledTrack bg="cyan.400" />
                      </SliderTrack>
                      <SliderThumb boxSize={4} bg="cyan.400" />
                    </Slider>
                  </Box>
                ))}
              </Flex>

              {/* Content Design */}
              <Text fontSize="sm" fontWeight="semibold" color={textPrimary} mb={4}>Content Design</Text>
              <Flex direction="column" gap={6}>
                {([
                  { key: 'contentSurface', label: 'Content Surface Area', description: 'How large of a surface are teams writing content for?' },
                  { key: 'localizationScope', label: 'Localization', description: 'Number of languages needed' },
                ] as { key: keyof typeof formData.effort_weights; label: string; description: string }[]).map(({ key, label, description }) => (
                  <Box key={key}>
                    <Flex justify="space-between" mb={1}>
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" color={textPrimary}>{label}</Text>
                        <Text fontSize="xs" color={textMuted}>{description}</Text>
                      </Box>
                      <Text fontSize="sm" fontWeight="semibold" color="cyan.500" minW="60px" textAlign="right">
                        {formData.effort_weights[key]} <Text as="span" fontSize="xs" color={textMuted}>(×{(formData.effort_weights[key] / 10).toFixed(1)})</Text>
                      </Text>
                    </Flex>
                    <Slider min={1} max={10} step={1} value={formData.effort_weights[key]}
                      onChange={(val) => setFormData((prev) => ({ ...prev, effort_weights: { ...prev.effort_weights, [key]: val } }))}
                      focusThumbOnChange={false}
                    >
                      <SliderTrack bg={sliderTrackBg}>
                        <SliderFilledTrack bg="cyan.400" />
                      </SliderTrack>
                      <SliderThumb boxSize={4} bg="cyan.400" />
                    </Slider>
                  </Box>
                ))}
              </Flex>
            </Box>
          </Box>
        </Box>

        {/* DANGER ZONE */}
        <Box id="danger-zone" mb={24}>
          <Heading size="sm" fontWeight="semibold" color="red.500" mb={1}>Reset workspace</Heading>
          <Text fontSize="sm" color={textSecondary} mb={6}>Permanently delete all plans and roadmap items. This cannot be undone.</Text>
          <Box
            bg={bgCard} border="1px solid" borderColor="red.300"
            borderRadius="lg" p={5}
            _dark={{ borderColor: 'red.800' }}
          >
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" fontWeight="medium" color={textPrimary}>Reset workspace</Text>
                <Text fontSize="xs" color={textMuted} mt={1}>
                  Permanently delete all plans and roadmap items. This cannot be undone.
                </Text>
              </Box>
              <Button size="sm" bg="red.500" color="white" _hover={{ bg: 'red.400' }} onClick={onResetOpen}>
                Reset workspace
              </Button>
            </Flex>
          </Box>
        </Box>

      </Box>

      {/* STICKY FOOTER */}
      <Box
        position="fixed" bottom={0} left={0} right={0}
        bg={bgCard} borderTop="1px solid" borderColor={borderColor}
        px={6} py={4} zIndex={100}
      >
        <Flex maxW="860px" mx="auto" justify="flex-end" gap={3}>
          <Button
            variant="outline" borderColor={inputBorder} color={textSecondary}
            _hover={{ borderColor: 'gray.400', color: textPrimary }}
            onClick={() => void handleReset()}
            isDisabled={saving}
            leftIcon={<Text>↺</Text>}
          >
            Reset to defaults
          </Button>
          <Button
            bg="cyan.500" color="white" fontWeight="semibold"
            _hover={{ bg: 'cyan.600' }}
            onClick={() => void handleSave()}
            isLoading={saving}
            loadingText="Saving…"
          >
            Save Settings
          </Button>
        </Flex>
      </Box>

      {/* Reset workspace modal */}
      <Modal isOpen={isResetOpen} onClose={onResetClose} isCentered>
        <ModalOverlay bg="blackAlpha.700" />
        <ModalContent bg={bgCard} border="1px solid" borderColor={borderColor} borderRadius="lg">
          <ModalHeader color={textPrimary} fontSize="md" fontWeight="semibold">Reset workspace</ModalHeader>
          <ModalBody>
            <Text fontSize="sm" color={textSecondary}>
              This will permanently delete all plans and roadmap items. This cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="outline" borderColor={inputBorder} color={textSecondary} onClick={onResetClose}>
              Cancel
            </Button>
            <Button bg="red.500" color="white" _hover={{ bg: 'red.400' }}
              onClick={() => {
                resetWorkspace()
                onResetClose()
              }}
            >
              Reset everything
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  )
}
