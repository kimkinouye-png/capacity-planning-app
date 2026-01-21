import { HStack, Text, Badge, IconButton, Tooltip } from '@chakra-ui/react'
import { RepeatIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'
import { useDbHealth } from '../utils/useDbHealth'

interface DbHealthIndicatorProps {
  /**
   * Polling interval in milliseconds. Set to 0 to disable auto-polling.
   * @default 30000 (30 seconds)
   */
  pollInterval?: number
  /**
   * Show last checked timestamp
   * @default false
   */
  showTimestamp?: boolean
  /**
   * Compact mode (smaller text, minimal spacing)
   * @default false
   */
  compact?: boolean
}

/**
 * Component that displays database health status with optional auto-refresh
 */
export default function DbHealthIndicator({
  pollInterval = 30000,
  showTimestamp = false,
  compact = false,
}: DbHealthIndicatorProps) {
  const { status, message, lastChecked, checkHealth } = useDbHealth(pollInterval)

  const getStatusColor = () => {
    switch (status) {
      case 'ok':
        return '#10b981' // green
      case 'error':
        return '#ef4444' // red
      case 'checking':
        return '#f59e0b' // amber
      default:
        return '#6b7280' // gray
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'ok':
        return <CheckCircleIcon color={getStatusColor()} />
      case 'error':
      case 'checking':
        return <WarningIcon color={getStatusColor()} />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'ok':
        return 'Database OK'
      case 'error':
        return 'Database Error'
      case 'checking':
        return 'Checking...'
      default:
        return 'Unknown'
    }
  }

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return ''
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString()
    } catch {
      return timestamp
    }
  }

  return (
    <HStack spacing={2} align="center">
      {getStatusIcon()}
      <Badge
        bg={`${getStatusColor()}20`}
        color={getStatusColor()}
        border="1px solid"
        borderColor={`${getStatusColor()}40`}
        px={2}
        py={1}
        borderRadius="md"
        fontSize={compact ? 'xs' : 'sm'}
        fontWeight="medium"
      >
        {getStatusText()}
      </Badge>
      {showTimestamp && lastChecked && (
        <Text fontSize="xs" color="gray.400">
          {formatTimestamp(lastChecked)}
        </Text>
      )}
      <Tooltip label="Refresh database health check" hasArrow>
        <IconButton
          aria-label="Refresh database health"
          icon={<RepeatIcon />}
          size="xs"
          variant="ghost"
          color="gray.400"
          _hover={{ color: 'white', bg: 'rgba(255, 255, 255, 0.1)' }}
          onClick={checkHealth}
          isLoading={status === 'checking'}
        />
      </Tooltip>
      {!compact && (
        <Tooltip label={message} hasArrow>
          <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="200px">
            {message}
          </Text>
        </Tooltip>
      )}
    </HStack>
  )
}
