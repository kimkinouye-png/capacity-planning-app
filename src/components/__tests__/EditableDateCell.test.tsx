import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import EditableDateCell from '../EditableDateCell'
import theme from '../../theme'

// Helper to render with Chakra provider
const renderWithProvider = (component: React.ReactElement) => {
  return render(<ChakraProvider theme={theme}>{component}</ChakraProvider>)
}

describe('EditableDateCell', () => {
  it('displays formatted date when not editing', () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableDateCell
        value="2024-01-15"
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    expect(screen.getByText('2024-01-15')).toBeInTheDocument()
  })

  it('displays placeholder when value is null or undefined', () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    const { rerender } = renderWithProvider(
      <EditableDateCell
        value={null}
        onChange={onChange}
        onUpdate={onUpdate}
        placeholder="—"
      />
    )

    expect(screen.getByText('—')).toBeInTheDocument()

    rerender(
      <EditableDateCell
        value={undefined}
        onChange={onChange}
        onUpdate={onUpdate}
        placeholder="—"
      />
    )

    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('switches to date input mode on click', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableDateCell
        value="2024-01-15"
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    const display = screen.getByText('2024-01-15')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('2024-01-15') as HTMLInputElement
      expect(input).toBeInTheDocument()
      expect(input.type).toBe('date')
    })
  })

  it('commits changes on blur', async () => {
    let currentValue: string | null = '2024-01-15'
    const onChange = vi.fn((newValue: string | null) => {
      currentValue = newValue
    })
    const onUpdate = vi.fn().mockResolvedValue(undefined)

    const { rerender } = renderWithProvider(
      <EditableDateCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    const display = screen.getByText('2024-01-15')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('2024-01-15') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Change date and blur
      fireEvent.change(input, { target: { value: '2024-03-31' } })
      fireEvent.blur(input)
    })

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('2024-03-31')
      expect(onUpdate).toHaveBeenCalledWith('2024-03-31')
    })

    // Re-render with updated value
    rerender(
      <EditableDateCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('2024-03-31')).toBeInTheDocument()
    })
  })

  it('commits changes on Enter', async () => {
    let currentValue: string | null = '2024-01-15'
    const onChange = vi.fn((newValue: string | null) => {
      currentValue = newValue
    })
    const onUpdate = vi.fn().mockResolvedValue(undefined)

    const { rerender } = renderWithProvider(
      <EditableDateCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    const display = screen.getByText('2024-01-15')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('2024-01-15') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Change date and press Enter
      fireEvent.change(input, { target: { value: '2024-06-30' } })
      fireEvent.keyDown(input, { key: 'Enter' })
    })

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('2024-06-30')
      expect(onUpdate).toHaveBeenCalledWith('2024-06-30')
    })

    // Re-render with updated value
    rerender(
      <EditableDateCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('2024-06-30')).toBeInTheDocument()
    })
  })

  it('cancels changes on Escape', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableDateCell
        value="2024-01-15"
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    const display = screen.getByText('2024-01-15')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('2024-01-15') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Change date but cancel with Escape
      fireEvent.change(input, { target: { value: '2024-12-31' } })
      fireEvent.keyDown(input, { key: 'Escape' })
    })

    await waitFor(() => {
      // Should revert to original value
      expect(screen.getByText('2024-01-15')).toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  it('does not call callbacks when value is unchanged on blur', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableDateCell
        value="2024-01-15"
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    const display = screen.getByText('2024-01-15')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('2024-01-15') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Don't change the value, just blur
      fireEvent.blur(input)
    })

    await waitFor(() => {
      // Should exit edit mode but not call callbacks
      expect(screen.getByText('2024-01-15')).toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  it('allows clearing date by entering empty value', async () => {
    let currentValue: string | null = '2024-01-15'
    const onChange = vi.fn((newValue: string | null) => {
      currentValue = newValue
    })
    const onUpdate = vi.fn().mockResolvedValue(undefined)

    const { rerender } = renderWithProvider(
      <EditableDateCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    const display = screen.getByText('2024-01-15')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('2024-01-15') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Clear the date
      fireEvent.change(input, { target: { value: '' } })
      fireEvent.blur(input)
    })

    await waitFor(() => {
      // Should commit null (cleared date)
      expect(onChange).toHaveBeenCalledWith(null)
      expect(onUpdate).toHaveBeenCalledWith(null)
    })

    // Re-render with cleared value
    rerender(
      <EditableDateCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('—')).toBeInTheDocument()
    })
  })

  it('handles ISO timestamp strings correctly', () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableDateCell
        value="2024-01-15T10:30:00Z"
        onChange={onChange}
        onUpdate={onUpdate}
      />
    )

    // Should display just the date part (YYYY-MM-DD)
    expect(screen.getByText('2024-01-15')).toBeInTheDocument()
  })

  it('handles invalid date strings gracefully', () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableDateCell
        value="invalid-date"
        onChange={onChange}
        onUpdate={onUpdate}
        placeholder="—"
      />
    )

    // Should show placeholder for invalid dates
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
