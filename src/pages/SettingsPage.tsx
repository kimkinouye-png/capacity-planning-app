import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Checkbox,
  Select,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useSettings, DEFAULT_SETTINGS, type Settings } from '../context/SettingsContext'
import DbHealthIndicator from '../components/DbHealthIndicator'

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

  const sizeBandKeys = ['xs', 's', 'm', 'l', 'xl'] as const
  const sizeBandLabels: Record<(typeof sizeBandKeys)[number], string> = {
    xs: 'XS',
    s: 'S',
    m: 'M',
    l: 'L',
    xl: 'XL',
  }

  const projectSizeOptions: Array<'XS' | 'S' | 'M' | 'L' | 'XL'> = ['XS', 'S', 'M', 'L', 'XL']

  if (loading) {
    return (
      <Box minH="100vh" bg="#0a0a0f">
        <Box maxW="1200px" mx="auto" px={6} py={8}>
          <HStack spacing={4}>
            <Spinner color="#00d9ff" />
            <Text color="gray.300">Loading settings...</Text>
          </HStack>
        </Box>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="#0a0a0f">
      <Box maxW="1200px" mx="auto" px={6} py={8}>
        <HStack justify="space-between" align="center" mb={2}>
          <Heading size="lg" color="white">
            Settings
          </Heading>
          <DbHealthIndicator pollInterval={30000} compact />
        </HStack>
        <Text fontSize="sm" color="gray.400" mb={6}>
          Configure effort weights, planning periods, size-band thresholds, and project-type demand.
        </Text>

        {settingsError && (
          <Alert status="warning" bg="#141419" border="1px solid" borderColor="rgba(245, 158, 11, 0.3)" borderRadius="md" mb={6}>
            <AlertIcon color="#f59e0b" />
            <AlertTitle color="white" mr={2}>Settings Sync Error:</AlertTitle>
            <AlertDescription color="gray.300">
              {settingsError}
            </AlertDescription>
          </Alert>
        )}

        <VStack spacing={8} align="stretch">
          <Box
            bg="#141419"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            borderRadius="md"
            p={6}
          >
            <Heading size="md" color="white" mb={4}>
              Effort weights (1–10)
            </Heading>
            <Text fontSize="sm" color="gray.400" mb={4}>
              Relative importance scales for product risk, ambiguity, content surface, and localization.
            </Text>
            <VStack spacing={4} align="stretch">
              {(
                [
                  ['productRisk', 'Product risk'],
                  ['problemAmbiguity', 'Problem ambiguity'],
                  ['contentSurface', 'Content surface'],
                  ['localizationScope', 'Localization scope'],
                ] as const
              ).map(([key, label]) => (
                <FormControl key={key}>
                  <FormLabel color="gray.300">{label}</FormLabel>
                  <NumberInput
                    value={formData.effort_weights[key]}
                    onChange={(_, v) =>
                      setFormData({
                        ...formData,
                        effort_weights: { ...formData.effort_weights, [key]: Math.round(v || 1) },
                      })
                    }
                    min={1}
                    max={10}
                    step={1}
                  >
                    <NumberInputField
                      bg="#1a1a20"
                      borderColor="rgba(255, 255, 255, 0.1)"
                      color="white"
                      _focus={{
                        borderColor: '#00d9ff',
                        boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)',
                      }}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper
                        borderColor="rgba(255, 255, 255, 0.1)"
                        color="gray.400"
                        _active={{ bg: 'rgba(0, 217, 255, 0.2)' }}
                      />
                      <NumberDecrementStepper
                        borderColor="rgba(255, 255, 255, 0.1)"
                        color="gray.400"
                        _active={{ bg: 'rgba(0, 217, 255, 0.2)' }}
                      />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              ))}
            </VStack>

            <Divider borderColor="rgba(255, 255, 255, 0.1)" my={6} />

            <VStack align="stretch" spacing={4}>
              <Checkbox
                colorScheme="cyan"
                color="gray.300"
                isChecked={formData.effort_model_enabled}
                onChange={e => setFormData({ ...formData, effort_model_enabled: e.target.checked })}
              >
                Effort model enabled
              </Checkbox>
              <Checkbox
                colorScheme="cyan"
                color="gray.300"
                isChecked={formData.workstream_impact_enabled}
                onChange={e => setFormData({ ...formData, workstream_impact_enabled: e.target.checked })}
              >
                Workstream impact enabled
              </Checkbox>
            </VStack>

            <Divider borderColor="rgba(255, 255, 255, 0.1)" my={6} />

            <FormControl>
              <FormLabel color="gray.300">Workstream penalty (0–1)</FormLabel>
              <NumberInput
                value={formData.workstream_penalty}
                onChange={(_, v) => setFormData({ ...formData, workstream_penalty: v || 0 })}
                min={0}
                max={1}
                step={0.01}
                precision={2}
              >
                <NumberInputField
                  bg="#1a1a20"
                  borderColor="rgba(255, 255, 255, 0.1)"
                  color="white"
                  _focus={{
                    borderColor: '#00d9ff',
                    boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)',
                  }}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper
                    borderColor="rgba(255, 255, 255, 0.1)"
                    color="gray.400"
                    _active={{ bg: 'rgba(0, 217, 255, 0.2)' }}
                  />
                  <NumberDecrementStepper
                    borderColor="rgba(255, 255, 255, 0.1)"
                    color="gray.400"
                    _active={{ bg: 'rgba(0, 217, 255, 0.2)' }}
                  />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </Box>

          <Box
            bg="#141419"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            borderRadius="md"
            p={6}
          >
            <Heading size="md" color="white" mb={4}>
              Focus-time ratio
            </Heading>
            <Text fontSize="sm" color="gray.400" mb={4}>
              Ratio used to convert focus weeks to work weeks. Lower values account for more context switching.
            </Text>
            <FormControl>
              <FormLabel color="gray.300">Focus-time ratio (0.4–0.9)</FormLabel>
              <NumberInput
                value={formData.focus_time_ratio}
                onChange={(_, v) => setFormData({ ...formData, focus_time_ratio: v || 0.75 })}
                min={0.4}
                max={0.9}
                step={0.05}
                precision={2}
              >
                <NumberInputField
                  bg="#1a1a20"
                  borderColor="rgba(255, 255, 255, 0.1)"
                  color="white"
                  _focus={{
                    borderColor: '#00d9ff',
                    boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)',
                  }}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper
                    borderColor="rgba(255, 255, 255, 0.1)"
                    color="gray.400"
                    _active={{ bg: 'rgba(0, 217, 255, 0.2)' }}
                  />
                  <NumberDecrementStepper
                    borderColor="rgba(255, 255, 255, 0.1)"
                    color="gray.400"
                    _active={{ bg: 'rgba(0, 217, 255, 0.2)' }}
                  />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </Box>

          <Box
            bg="#141419"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            borderRadius="md"
            p={6}
          >
            <Heading size="md" color="white" mb={4}>
              Planning periods
            </Heading>
            <Text fontSize="sm" color="gray.400" mb={4}>
              Base weeks, holidays, and PTO per quarter. Focus weeks are stored from the server (read-only).
            </Text>
            <VStack spacing={6} align="stretch">
              {Object.entries(formData.planning_periods).map(([quarter, period]) => (
                <Box key={quarter} borderBottom="1px solid" borderColor="rgba(255,255,255,0.06)" pb={4}>
                  <Text fontWeight="600" color="gray.300" mb={3}>
                    {quarter}
                  </Text>
                  <HStack spacing={4} flexWrap="wrap">
                    <FormControl maxW="140px">
                      <FormLabel color="gray.400" fontSize="xs">Base weeks</FormLabel>
                      <NumberInput
                        value={period.baseWeeks}
                        onChange={(_, v) =>
                          setFormData({
                            ...formData,
                            planning_periods: {
                              ...formData.planning_periods,
                              [quarter]: { ...period, baseWeeks: v || 0 },
                            },
                          })
                        }
                        min={0}
                        max={52}
                        step={1}
                      >
                        <NumberInputField bg="#1a1a20" borderColor="rgba(255,255,255,0.1)" color="white" />
                      </NumberInput>
                    </FormControl>
                    <FormControl maxW="140px">
                      <FormLabel color="gray.400" fontSize="xs">Holidays</FormLabel>
                      <NumberInput
                        value={period.holidays}
                        onChange={(_, v) =>
                          setFormData({
                            ...formData,
                            planning_periods: {
                              ...formData.planning_periods,
                              [quarter]: { ...period, holidays: v || 0 },
                            },
                          })
                        }
                        min={0}
                        max={52}
                        step={1}
                      >
                        <NumberInputField bg="#1a1a20" borderColor="rgba(255,255,255,0.1)" color="white" />
                      </NumberInput>
                    </FormControl>
                    <FormControl maxW="140px">
                      <FormLabel color="gray.400" fontSize="xs">PTO</FormLabel>
                      <NumberInput
                        value={period.pto}
                        onChange={(_, v) =>
                          setFormData({
                            ...formData,
                            planning_periods: {
                              ...formData.planning_periods,
                              [quarter]: { ...period, pto: v || 0 },
                            },
                          })
                        }
                        min={0}
                        max={52}
                        step={1}
                      >
                        <NumberInputField bg="#1a1a20" borderColor="rgba(255,255,255,0.1)" color="white" />
                      </NumberInput>
                    </FormControl>
                    <FormControl maxW="160px">
                      <FormLabel color="gray.400" fontSize="xs">Focus weeks (read-only)</FormLabel>
                      <Text color="gray.300" pt={2}>
                        {period.focusWeeks}
                      </Text>
                    </FormControl>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Box>

          <Box
            bg="#141419"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            borderRadius="md"
            p={6}
          >
            <Heading size="md" color="white" mb={4}>
              Size band thresholds
            </Heading>
            <Text fontSize="sm" color="gray.400" mb={4}>
              Min–max score bands. XL may omit max.
            </Text>
            <VStack spacing={4} align="stretch">
              {sizeBandKeys.map(sk => (
                <HStack key={sk} spacing={4} align="flex-end" flexWrap="wrap">
                  <Text minW="40px" color="gray.300" fontWeight="600">
                    {sizeBandLabels[sk]}
                  </Text>
                  <FormControl maxW="120px">
                    <FormLabel color="gray.400" fontSize="xs">Min</FormLabel>
                    <NumberInput
                      value={formData.size_band_thresholds[sk].min}
                      onChange={(_, v) =>
                        setFormData({
                          ...formData,
                          size_band_thresholds: {
                            ...formData.size_band_thresholds,
                            [sk]: { ...formData.size_band_thresholds[sk], min: v || 0 },
                          },
                        })
                      }
                      step={0.01}
                    >
                      <NumberInputField bg="#1a1a20" borderColor="rgba(255,255,255,0.1)" color="white" />
                    </NumberInput>
                  </FormControl>
                  <FormControl maxW="120px">
                    <FormLabel color="gray.400" fontSize="xs">Max</FormLabel>
                    {sk === 'xl' ? (
                      <Text color="gray.500" fontSize="sm" pb={2}>
                        {formData.size_band_thresholds.xl.max ?? '—'}
                      </Text>
                    ) : (
                      <NumberInput
                        value={formData.size_band_thresholds[sk].max ?? 0}
                        onChange={(_, v) =>
                          setFormData({
                            ...formData,
                            size_band_thresholds: {
                              ...formData.size_band_thresholds,
                              [sk]: { ...formData.size_band_thresholds[sk], max: v },
                            },
                          })
                        }
                        step={0.01}
                      >
                        <NumberInputField bg="#1a1a20" borderColor="rgba(255,255,255,0.1)" color="white" />
                      </NumberInput>
                    )}
                  </FormControl>
                </HStack>
              ))}
            </VStack>
          </Box>

          <Box
            bg="#141419"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            borderRadius="md"
            p={6}
          >
            <Heading size="md" color="white" mb={4}>
              Project-type demand
            </Heading>
            <Text fontSize="sm" color="gray.400" mb={4}>
              Default UX and content size bands by project type.
            </Text>
            <VStack spacing={4} align="stretch">
              {Object.entries(formData.project_type_demand).map(([ptype, demand]) => (
                <HStack key={ptype} spacing={4} flexWrap="wrap" align="flex-end">
                  <Text minW="140px" color="gray.300">
                    {ptype}
                  </Text>
                  <FormControl maxW="120px">
                    <FormLabel color="gray.400" fontSize="xs">UX</FormLabel>
                    <Select
                      bg="#1a1a20"
                      borderColor="rgba(255,255,255,0.1)"
                      color="white"
                      value={demand.ux}
                      onChange={e => {
                        const ux = e.target.value as 'XS' | 'S' | 'M' | 'L' | 'XL'
                        setFormData({
                          ...formData,
                          project_type_demand: {
                            ...formData.project_type_demand,
                            [ptype]: { ...demand, ux },
                          },
                        })
                      }}
                    >
                      {projectSizeOptions.map(o => (
                        <option key={o} value={o} style={{ background: '#1a1a20', color: 'white' }}>{o}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl maxW="120px">
                    <FormLabel color="gray.400" fontSize="xs">Content</FormLabel>
                    <Select
                      bg="#1a1a20"
                      borderColor="rgba(255,255,255,0.1)"
                      color="white"
                      value={demand.content}
                      onChange={e => {
                        const content = e.target.value as 'XS' | 'S' | 'M' | 'L' | 'XL'
                        setFormData({
                          ...formData,
                          project_type_demand: {
                            ...formData.project_type_demand,
                            [ptype]: { ...demand, content },
                          },
                        })
                      }}
                    >
                      {projectSizeOptions.map(o => (
                        <option key={o} value={o} style={{ background: '#1a1a20', color: 'white' }}>{o}</option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>
              ))}
            </VStack>
          </Box>

          <HStack spacing={4} justify="flex-end">
            <Button
              variant="outline"
              onClick={handleReset}
              isDisabled={saving}
              borderColor="rgba(255, 255, 255, 0.1)"
              color="gray.300"
              _hover={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                bg: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              Reset to Defaults
            </Button>
            <Button
              colorScheme="cyan"
              onClick={handleSave}
              isLoading={saving}
              loadingText="Saving..."
            >
              Save Settings
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  )
}
