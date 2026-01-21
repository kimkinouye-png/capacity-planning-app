import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import EditableTextCell from '../EditableTextCell'
import theme from '../../theme'

// Helper to render with Chakra provider
const renderWithProvider = (component: React.ReactElement) => {
  return render(<ChakraProvider theme={theme}>{component}</ChakraProvider>)
}

describe('EditableTextCell', () => {
  it('displays value when not editing', () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableTextCell
        value="Test Item"
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    expect(screen.getByText('Test Item')).toBeInTheDocument()
  })

  it('displays placeholder when value is undefined', () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableTextCell
        value={undefined}
        onChange={onChange}
        onUpdate={onUpdate}
        placeholder="—"
      />
    )

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('switches to input mode on click', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableTextCell
        value="Test Item"
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    const display = screen.getByText('Test Item')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('Test Item') as HTMLInputElement
      expect(input).toBeInTheDocument()
      expect(input.type).toBe('text')
    })
  })

  it('commits changes on blur', async () => {
    let currentValue = 'Test Item'
    const onChange = vi.fn((newValue: string) => {
      currentValue = newValue
    })
    const onUpdate = vi.fn().mockResolvedValue(undefined)

    const { rerender } = renderWithProvider(
      <EditableTextCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    const display = screen.getByText('Test Item')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('Test Item') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Change value and blur
      fireEvent.change(input, { target: { value: 'Updated Item' } })
      fireEvent.blur(input)
    })

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('Updated Item')
      expect(onUpdate).toHaveBeenCalledWith('Updated Item')
    })

    // Re-render with updated value
    rerender(
      <EditableTextCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Updated Item')).toBeInTheDocument()
    })
  })

  it('commits changes on Enter', async () => {
    let currentValue = 'Test Item'
    const onChange = vi.fn((newValue: string) => {
      currentValue = newValue
    })
    const onUpdate = vi.fn().mockResolvedValue(undefined)

    const { rerender } = renderWithProvider(
      <EditableTextCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    const display = screen.getByText('Test Item')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('Test Item') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Change value and press Enter
      fireEvent.change(input, { target: { value: 'New Item' } })
      fireEvent.keyDown(input, { key: 'Enter' })
    })

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('New Item')
      expect(onUpdate).toHaveBeenCalledWith('New Item')
    })

    // Re-render with updated value
    rerender(
      <EditableTextCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('New Item')).toBeInTheDocument()
    })
  })

  it('cancels changes on Escape', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableTextCell
        value="Original Item"
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    const display = screen.getByText('Original Item')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('Original Item') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Change value but cancel with Escape
      fireEvent.change(input, { target: { value: 'Changed Item' } })
      fireEvent.keyDown(input, { key: 'Escape' })
    })

    await waitFor(() => {
      // Should revert to original value
      expect(screen.getByText('Original Item')).toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  it('does not call callbacks when value is unchanged on blur', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableTextCell
        value="Test Item"
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    const display = screen.getByText('Test Item')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('Test Item') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Don't change the value, just blur
      fireEvent.blur(input)
    })

    await waitFor(() => {
      // Should exit edit mode but not call callbacks
      expect(screen.getByText('Test Item')).toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  it('does not call callbacks when value is unchanged on Enter', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableTextCell
        value="Test Item"
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    const display = screen.getByText('Test Item')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('Test Item') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Don't change the value, just press Enter
      fireEvent.keyDown(input, { key: 'Enter' })
    })

    await waitFor(() => {
      // Should exit edit mode but not call callbacks
      expect(screen.getByText('Test Item')).toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  it('reverts when value exceeds maxLength on blur', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableTextCell
        value="Test"
        onChange={onChange}
        onUpdate={onUpdate}
        maxLength={5}
      />
    )

    const display = screen.getByText('Test')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('Test') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Enter value exceeding maxLength
      fireEvent.change(input, { target: { value: 'Too Long Value' } })
      fireEvent.blur(input)
    })

    await waitFor(() => {
      // Should revert to original value without calling callbacks
      expect(screen.getByText('Test')).toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  it('reverts when validation fails on blur', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()
    const validate = vi.fn((value: string) => value.length > 0 && !value.includes(' '))

    renderWithProvider(
      <EditableTextCell
        value="ValidKey"
        onChange={onChange}
        onUpdate={onUpdate}
        validate={validate}
      />
    )

    const display = screen.getByText('ValidKey')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('ValidKey') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Enter invalid value (contains space)
      fireEvent.change(input, { target: { value: 'Invalid Key' } })
      fireEvent.blur(input)
    })

    await waitFor(() => {
      // Should revert to original value without calling callbacks
      expect(screen.getByText('ValidKey')).toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
      expect(onUpdate).not.toHaveBeenCalled()
      expect(validate).toHaveBeenCalledWith('Invalid Key')
    })
  })

  it('trims whitespace before committing', async () => {
    let currentValue = 'Test Item'
    const onChange = vi.fn((newValue: string) => {
      currentValue = newValue
    })
    const onUpdate = vi.fn().mockResolvedValue(undefined)

    const { rerender } = renderWithProvider(
      <EditableTextCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    const display = screen.getByText('Test Item')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('Test Item') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Enter value with leading/trailing whitespace
      fireEvent.change(input, { target: { value: '  Trimmed Item  ' } })
      fireEvent.blur(input)
    })

    await waitFor(() => {
      // Should commit trimmed value
      expect(onChange).toHaveBeenCalledWith('Trimmed Item')
      expect(onUpdate).toHaveBeenCalledWith('Trimmed Item')
    })

    // Re-render with updated value
    rerender(
      <EditableTextCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Trimmed Item')).toBeInTheDocument()
    })
  })
})
