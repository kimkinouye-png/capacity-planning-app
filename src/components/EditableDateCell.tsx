import { useState, useRef, useEffect } from 'react'
import { Box, Input } from '@chakra-ui/react'

interface EditableDateCellProps {
  value?: string | null
  onChange?: (value: string | null) => void
  onUpdate?: (value: string | null) => Promise<void> | void
  placeholder?: string
  isDisabled?: boolean
  color?: string
}

/**
 * Formats a date string to YYYY-MM-DD for display
 */
function formatDateForDisplay(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

/**
 * Formats a date string to YYYY-MM-DD for input (HTML5 date input format)
 */
function formatDateForInput(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

/**
 * Parses a date string and validates it
 * Returns the date string if valid, null if invalid or empty
 */
function parseDateOrNull(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) {
    return null // Empty means clear the date
  }
  const d = new Date(trimmed)
  if (Number.isNaN(d.getTime())) {
    return null // Invalid date
  }
  // Return in YYYY-MM-DD format
  return d.toISOString().slice(0, 10)
}

/**
 * Inline editable date cell for table columns
 * Displays date when not editing, switches to date input on click
 */
export default function EditableDateCell({
  value,
  onChange,
  onUpdate,
  placeholder = '—',
  isDisabled = false,
  color = 'gray.300',
}: EditableDateCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update editValue when value prop changes (e.g., when external updates happen)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(formatDateForInput(value))
    }
  }, [value, isEditing])

  // Focus and select input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.showPicker?.() // Show date picker on mobile
    }
  }, [isEditing])

  /**
   * Commits a valid date if it's different from the current value
   * Returns true if committed, false if unchanged or invalid
   */
  const commitIfValid = async (newValue: string | null): Promise<boolean> => {
    if (isUpdating) return false // Prevent double commits

    // Normalize both values for comparison (handle null/undefined)
    const currentValue = value || null
    const normalizedNewValue = newValue || null

    // If value hasn't changed, just exit edit mode without calling callbacks
    if (normalizedNewValue === currentValue) {
      setIsEditing(false)
      return false
    }

    setIsUpdating(true)
    try {
      // Call onChange immediately for local state update
      if (onChange) {
        onChange(normalizedNewValue)
      }

      // Call onUpdate if provided (for async operations like API calls)
      if (onUpdate) {
        await onUpdate(normalizedNewValue)
      }

      setIsEditing(false)
      return true
    } catch (error) {
      console.error('Error updating value:', error)
      // Revert to original value on error
      setEditValue(formatDateForInput(value))
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
    // Parse the input value
    const parsed = parseDateOrNull(editValue)
    
    // parsed can be null (empty/cleared) or a valid date string
    // Both are valid - null means clear the date
    commitIfValid(parsed)
  }

  const handleCancel = () => {
    setEditValue(formatDateForInput(value))
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
      setEditValue(formatDateForInput(value))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="date"
        value={editValue}
        onChange={handleInputChange}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
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
        w="140px"
        px={2}
        py={1}
      />
    )
  }

  const displayText = formatDateForDisplay(value) || placeholder

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
      {displayText}
    </Box>
  )
}
