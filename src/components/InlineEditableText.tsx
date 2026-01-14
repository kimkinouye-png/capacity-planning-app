import { useState, useRef, useEffect } from 'react'
import { HStack, Text, Input, IconButton } from '@chakra-ui/react'
import { EditIcon } from '@chakra-ui/icons'

interface InlineEditableTextProps {
  value: string
  onChange: (value: string) => void
  ariaLabel?: string
  isDisabled?: boolean
  fontSize?: string
  fontWeight?: string | number
}

export default function InlineEditableText({
  value,
  onChange,
  ariaLabel,
  isDisabled = false,
  fontSize = 'md',
  fontWeight = 'bold',
}: InlineEditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update editValue when value prop changes (e.g., when external updates happen)
  useEffect(() => {
    setEditValue(value)
  }, [value])

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    if (editValue.trim() && editValue.trim() !== value) {
      onChange(editValue.trim())
    } else {
      setEditValue(value) // Reset to original if empty or unchanged
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value) // Reset to original value
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

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel || 'Edit text'}
        fontSize={fontSize}
        fontWeight={fontWeight}
        variant="flushed"
        px={2}
        py={1}
        borderColor="blue.300"
        _focus={{
          borderColor: 'blue.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
        }}
      />
    )
  }

  return (
    <HStack
      spacing={2}
      align="center"
      role="group"
      cursor={isDisabled ? 'default' : 'pointer'}
      onClick={(e) => {
        e.stopPropagation()
        if (!isDisabled) {
          setIsEditing(true)
        }
      }}
      aria-label={ariaLabel ? `${ariaLabel} - Click to edit` : 'Click to edit'}
    >
      <Text fontSize={fontSize} fontWeight={fontWeight}>
        {value || 'Untitled'}
      </Text>
      {!isDisabled && (
        <IconButton
          aria-label="Edit"
          icon={<EditIcon />}
          size="xs"
          variant="ghost"
          opacity={0}
          _groupHover={{ opacity: 0.6 }}
          onClick={(e) => {
            e.stopPropagation()
            setIsEditing(true)
          }}
        />
      )}
    </HStack>
  )
}
