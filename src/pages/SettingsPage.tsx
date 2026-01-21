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
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useSettings } from '../context/SettingsContext'
import DbHealthIndicator from '../components/DbHealthIndicator'

export default function SettingsPage() {
  const { settings, loading, error: settingsError, saveSettings, resetToDefaults } = useSettings()
  const toast = useToast()

  // Local form state
  const [formData, setFormData] = useState({
    // UX factor weights
    uxProductRisk: 1.2,
    uxProblemAmbiguity: 1.0,
    uxDiscoveryDepth: 0.9,
    // Content factor weights
    contentSurfaceArea: 1.3,
    contentLocalizationScope: 1.0,
    contentRegulatoryBrandRisk: 1.2,
    contentLegalComplianceDependency: 1.1,
    // PM Intake multiplier
    pmIntakeMultiplier: 1.0,
    // Focus-time ratio
    focusTimeRatio: 0.75,
    // Size band thresholds
    sizeBandXS: 1.6,
    sizeBandS: 2.6,
    sizeBandM: 3.6,
    sizeBandL: 4.6,
    sizeBandXL: 5.0,
  })

  const [saving, setSaving] = useState(false)

  // Initialize form data from settings
  useEffect(() => {
    if (settings) {
      setFormData({
        uxProductRisk: settings.effort_model.ux.productRisk ?? 1.2,
        uxProblemAmbiguity: settings.effort_model.ux.problemAmbiguity ?? 1.0,
        uxDiscoveryDepth: settings.effort_model.ux.discoveryDepth ?? 0.9,
        contentSurfaceArea: settings.effort_model.content.contentSurfaceArea ?? 1.3,
        contentLocalizationScope: settings.effort_model.content.localizationScope ?? 1.0,
        contentRegulatoryBrandRisk: settings.effort_model.content.regulatoryBrandRisk ?? 1.2,
        contentLegalComplianceDependency: settings.effort_model.content.legalComplianceDependency ?? 1.1,
        pmIntakeMultiplier: settings.effort_model.pmIntakeMultiplier ?? 1.0,
        focusTimeRatio: settings.time_model.focusTimeRatio ?? 0.75,
        sizeBandXS: settings.size_bands.xs ?? 1.6,
        sizeBandS: settings.size_bands.s ?? 2.6,
        sizeBandM: settings.size_bands.m ?? 3.6,
        sizeBandL: settings.size_bands.l ?? 4.6,
        sizeBandXL: settings.size_bands.xl ?? 5.0,
      })
    }
  }, [settings])

  const handleSave = async () => {
    if (!settings) return

    try {
      setSaving(true)

      await saveSettings({
        effort_model: {
          ux: {
            productRisk: formData.uxProductRisk,
            problemAmbiguity: formData.uxProblemAmbiguity,
            discoveryDepth: formData.uxDiscoveryDepth,
          },
          content: {
            contentSurfaceArea: formData.contentSurfaceArea,
            localizationScope: formData.contentLocalizationScope,
            regulatoryBrandRisk: formData.contentRegulatoryBrandRisk,
            legalComplianceDependency: formData.contentLegalComplianceDependency,
          },
          pmIntakeMultiplier: formData.pmIntakeMultiplier,
        },
        time_model: {
          focusTimeRatio: formData.focusTimeRatio,
        },
        size_bands: {
          xs: formData.sizeBandXS,
          s: formData.sizeBandS,
          m: formData.sizeBandM,
          l: formData.sizeBandL,
          xl: formData.sizeBandXL,
        },
      })

      // Wait a brief moment for error state to update, then check
      await new Promise(resolve => setTimeout(resolve, 100))

      // Only show success toast if no error was set (API succeeded)
      // If there's an error, the error banner will display it
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
          Configure global effort model weights, focus-time ratio, and size-band thresholds
        </Text>

        {/* Error message for SettingsContext */}
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
          {/* Effort Model Weights */}
          <Box
            bg="#141419"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            borderRadius="md"
            p={6}
          >
            <Heading size="md" color="white" mb={4}>
              Effort Model Weights
            </Heading>

            {/* UX Factors */}
            <VStack spacing={4} align="stretch" mb={6}>
              <Text fontSize="sm" fontWeight="600" color="gray.300">
                UX Design Factors
              </Text>
              <FormControl>
                <FormLabel color="gray.300">Product Risk</FormLabel>
                <NumberInput
                  value={formData.uxProductRisk}
                  onChange={(_, value) => setFormData({ ...formData, uxProductRisk: value || 0 })}
                  min={0.1}
                  max={5}
                  step={0.1}
                  precision={1}
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

              <FormControl>
                <FormLabel color="gray.300">Problem Ambiguity</FormLabel>
                <NumberInput
                  value={formData.uxProblemAmbiguity}
                  onChange={(_, value) => setFormData({ ...formData, uxProblemAmbiguity: value || 0 })}
                  min={0.1}
                  max={5}
                  step={0.1}
                  precision={1}
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

              <FormControl>
                <FormLabel color="gray.300">Discovery Depth</FormLabel>
                <NumberInput
                  value={formData.uxDiscoveryDepth}
                  onChange={(_, value) => setFormData({ ...formData, uxDiscoveryDepth: value || 0 })}
                  min={0.1}
                  max={5}
                  step={0.1}
                  precision={1}
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
            </VStack>

            <Divider borderColor="rgba(255, 255, 255, 0.1)" mb={6} />

            {/* Content Factors */}
            <VStack spacing={4} align="stretch" mb={6}>
              <Text fontSize="sm" fontWeight="600" color="gray.300">
                Content Design Factors
              </Text>
              <FormControl>
                <FormLabel color="gray.300">Content Surface Area</FormLabel>
                <NumberInput
                  value={formData.contentSurfaceArea}
                  onChange={(_, value) => setFormData({ ...formData, contentSurfaceArea: value || 0 })}
                  min={0.1}
                  max={5}
                  step={0.1}
                  precision={1}
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

              <FormControl>
                <FormLabel color="gray.300">Localization Scope</FormLabel>
                <NumberInput
                  value={formData.contentLocalizationScope}
                  onChange={(_, value) => setFormData({ ...formData, contentLocalizationScope: value || 0 })}
                  min={0.1}
                  max={5}
                  step={0.1}
                  precision={1}
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

              <FormControl>
                <FormLabel color="gray.300">Regulatory & Brand Risk</FormLabel>
                <NumberInput
                  value={formData.contentRegulatoryBrandRisk}
                  onChange={(_, value) => setFormData({ ...formData, contentRegulatoryBrandRisk: value || 0 })}
                  min={0.1}
                  max={5}
                  step={0.1}
                  precision={1}
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

              <FormControl>
                <FormLabel color="gray.300">Legal Compliance Dependency</FormLabel>
                <NumberInput
                  value={formData.contentLegalComplianceDependency}
                  onChange={(_, value) => setFormData({ ...formData, contentLegalComplianceDependency: value || 0 })}
                  min={0.1}
                  max={5}
                  step={0.1}
                  precision={1}
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
            </VStack>

            <Divider borderColor="rgba(255, 255, 255, 0.1)" mb={6} />

            {/* PM Intake Multiplier */}
            <FormControl>
              <FormLabel color="gray.300">PM Intake Multiplier</FormLabel>
              <NumberInput
                value={formData.pmIntakeMultiplier}
                onChange={(_, value) => setFormData({ ...formData, pmIntakeMultiplier: value || 0 })}
                min={0.1}
                max={5}
                step={0.1}
                precision={1}
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

          {/* Focus-Time Ratio */}
          <Box
            bg="#141419"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            borderRadius="md"
            p={6}
          >
            <Heading size="md" color="white" mb={4}>
              Focus-Time Ratio
            </Heading>
            <Text fontSize="sm" color="gray.400" mb={4}>
              Ratio used to convert focus weeks to work weeks. Lower values account for more context switching.
            </Text>
            <FormControl>
              <FormLabel color="gray.300">Focus-Time Ratio (0.4 - 0.9)</FormLabel>
              <NumberInput
                value={formData.focusTimeRatio}
                onChange={(_, value) => setFormData({ ...formData, focusTimeRatio: value || 0.75 })}
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

          {/* Size Band Thresholds */}
          <Box
            bg="#141419"
            border="1px solid"
            borderColor="rgba(255, 255, 255, 0.1)"
            borderRadius="md"
            p={6}
          >
            <Heading size="md" color="white" mb={4}>
              Size Band Thresholds
            </Heading>
            <Text fontSize="sm" color="gray.400" mb={4}>
              Score thresholds for mapping weighted scores to size bands (XS, S, M, L, XL).
            </Text>
            <VStack spacing={4} align="stretch">
              {[
                { key: 'sizeBandXS', label: 'XS', value: formData.sizeBandXS },
                { key: 'sizeBandS', label: 'S', value: formData.sizeBandS },
                { key: 'sizeBandM', label: 'M', value: formData.sizeBandM },
                { key: 'sizeBandL', label: 'L', value: formData.sizeBandL },
                { key: 'sizeBandXL', label: 'XL', value: formData.sizeBandXL },
              ].map(({ key, label, value }) => (
                <FormControl key={key}>
                  <FormLabel color="gray.300">{label}</FormLabel>
                  <NumberInput
                    value={value}
                    onChange={(_, numValue) => setFormData({ ...formData, [key]: numValue || 0 })}
                    min={0}
                    max={10}
                    step={0.1}
                    precision={1}
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
          </Box>

          {/* Actions */}
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
