import { useState, useRef, useEffect } from 'react'
import { Box, Input } from '@chakra-ui/react'

interface EditableTextCellProps {
  value?: string
  onChange?: (value: string) => void
  onUpdate?: (value: string) => Promise<void> | void
  placeholder?: string
  maxLength?: number
  validate?: (value: string) => boolean
  isDisabled?: boolean
  color?: string
}

/**
 * Inline editable text cell for table columns
 * Displays text when not editing, switches to text input on click
 */
export default function EditableTextCell({
  value = '',
  onChange,
  onUpdate,
  placeholder = '—',
  maxLength,
  validate,
  isDisabled = false,
  color = 'gray.300',
}: EditableTextCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState<string>('')
  const [isUpdating, setIsUpdating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update editValue when value prop changes (e.g., when external updates happen)
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value || '')
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
   * Commits a valid string if it's different from the current value
   * Returns true if committed, false if unchanged or invalid
   */
  const commitIfValid = async (newValue: string): Promise<boolean> => {
    if (isUpdating) return false // Prevent double commits

    // If value hasn't changed, just exit edit mode without calling callbacks
    if (newValue === value) {
      setIsEditing(false)
      return false
    }

    // Validate maxLength
    if (maxLength !== undefined && newValue.length > maxLength) {
      // Invalid: exceeds maxLength, revert without calling callbacks
      setEditValue(value || '')
      setIsEditing(false)
      return false
    }

    // Validate using custom validator if provided
    if (validate && !validate(newValue)) {
      // Invalid: validation failed, revert without calling callbacks
      setEditValue(value || '')
      setIsEditing(false)
      return false
    }

    setIsUpdating(true)
    try {
      // Call onChange immediately for local state update
      if (onChange) {
        onChange(newValue)
      }

      // Call onUpdate if provided (for async operations like API calls)
      if (onUpdate) {
        await onUpdate(newValue)
      }

      setIsEditing(false)
      return true
    } catch (error) {
      console.error('Error updating value:', error)
      // Revert to original value on error
      setEditValue(value || '')
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
    const trimmed = editValue.trim()
    
    // Commit the trimmed value (commitIfValid handles validation)
    commitIfValid(trimmed)
  }

  const handleCancel = () => {
    setEditValue(value || '')
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
      setEditValue(value || '')
    }
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        maxLength={maxLength}
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
        w="100%"
        px={2}
        py={1}
      />
    )
  }

  const displayText = value || placeholder

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
