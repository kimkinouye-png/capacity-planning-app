import { useState, useRef, useEffect } from 'react'
import { Box, Input } from '@chakra-ui/react'

interface EditableNumberCellProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
  onUpdate?: (value: number | undefined) => Promise<void> | void
  placeholder?: string
  min?: number
  max?: number
  step?: number
  precision?: number // Number of decimal places to display
  isDisabled?: boolean
  color?: string
}

/**
 * Parses a string to a number, returning null if invalid
 * Returns: number if valid number, null if invalid (including empty/whitespace)
 */
function parseNumberOrNull(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed) {
    return null // Empty/whitespace is invalid for blur - should revert
  }
  const n = Number(trimmed)
  return Number.isFinite(n) && !isNaN(n) ? n : null
}

/**
 * Inline editable number cell for table columns
 * Displays formatted number when not editing, switches to number input on click
 */
export default function EditableNumberCell({
  value,
  onChange,
  onUpdate,
  placeholder = '—',
  min,
  max,
  step = 0.1,
  precision = 1,
  isDisabled = false,
  color = 'gray.300',
}: EditableNumberCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update editValue when value prop changes (e.g., when external updates happen)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value !== undefined ? value.toString() : '')
    }
  }, [value, isEditing])

  // Focus and select input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  /**
   * Commits a valid number if it's different from the current value
   * Returns true if committed, false if unchanged or invalid
   */
  const commitIfValid = async (newValue: number): Promise<boolean> => {
    if (isUpdating) return false // Prevent double commits

    // If value hasn't changed, just exit edit mode without calling callbacks
    if (newValue === value) {
      setIsEditing(false)
      return false
    }

    setIsUpdating(true)
    try {
      // Validate and apply constraints
      let finalValue = newValue
      if (min !== undefined && finalValue < min) {
        finalValue = min
      }
      if (max !== undefined && finalValue > max) {
        finalValue = max
      }
      if (!isFinite(finalValue) || isNaN(finalValue)) {
        // Invalid value, revert to original without calling callbacks
        setEditValue(value !== undefined ? value.toString() : '')
        setIsEditing(false)
        setIsUpdating(false)
        return false
      }

      // Call onChange immediately for local state update
      onChange(finalValue)

      // Call onUpdate if provided (for async operations like API calls)
      if (onUpdate) {
        await onUpdate(finalValue)
      }

      setIsEditing(false)
      return true
    } catch (error) {
      console.error('Error updating value:', error)
      // Revert to original value on error
      setEditValue(value !== undefined ? value.toString() : '')
      setIsEditing(false)
      return false
    } finally {
      setIsUpdating(false)
    }
  }

  /**
   * Handles blur or Enter - commits valid input, reverts invalid input
   */
  const handleSave = () => {
    // Parse the input value - returns null for any invalid input (including empty/whitespace)
    const parsed = parseNumberOrNull(editValue)
    
    if (parsed === null) {
      // Invalid input (non-numeric string like "abc", empty/whitespace, or negative if min >= 0)
      // Revert to original value without calling any callbacks
      setEditValue(value !== undefined ? value.toString() : '')
      setIsEditing(false)
      return // CRITICAL: return early to prevent any callback execution
    }

    // Valid number parsed, commit it (commitIfValid only accepts numbers)
    commitIfValid(parsed)
  }

  const handleCancel = () => {
    setEditValue(value !== undefined ? value.toString() : '')
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent row click
    if (!isDisabled && !isEditing) {
      setIsEditing(true)
      setEditValue(value !== undefined ? value.toString() : '')
    }
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="number"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        size="sm"
        bg="#1a1a20"
        borderColor="rgba(0, 217, 255, 0.5)"
        color="white"
        _focus={{
          borderColor: '#00d9ff',
          boxShadow: '0 0 0 1px rgba(0, 217, 255, 0.5)',
        }}
        isDisabled={isUpdating}
        w="80px"
        px={2}
        py={1}
      />
    )
  }

  return (
    <Box
      onClick={handleClick}
      cursor={isDisabled ? 'default' : 'pointer'}
      color={color}
      title={isDisabled ? undefined : 'Click to edit'}
      px={1}
      py={0.5}
      borderRadius="sm"
      _hover={!isDisabled ? { color: '#00d9ff', bg: 'rgba(255, 255, 255, 0.05)' } : {}}
    >
      {value !== undefined ? value.toFixed(precision) : placeholder}
    </Box>
  )
}
