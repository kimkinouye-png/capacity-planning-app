import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import EditableNumberCell from '../EditableNumberCell'
import theme from '../../theme'

// Helper to render with Chakra provider
const renderWithProvider = (component: React.ReactElement) => {
  return render(<ChakraProvider theme={theme}>{component}</ChakraProvider>)
}

describe('EditableNumberCell', () => {
  it('displays formatted value when not editing', () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableNumberCell
        value={99.5}
        onChange={onChange}
        onUpdate={onUpdate}
        precision={1}
      />
    )

    expect(screen.getByText('99.5')).toBeInTheDocument()
  })

  it('displays placeholder when value is undefined', () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableNumberCell
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
      <EditableNumberCell
        value={99.5}
        onChange={onChange}
        onUpdate={onUpdate}
        precision={1}
      />
    )

    const display = screen.getByText('99.5')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('99.5') as HTMLInputElement
      expect(input).toBeInTheDocument()
      expect(input.type).toBe('number')
    })
  })

  it('commits changes on Enter', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn().mockResolvedValue(undefined)

    renderWithProvider(
      <EditableNumberCell
        value={99.5}
        onChange={onChange}
        onUpdate={onUpdate}
        precision={1}
      />
    )

    const display = screen.getByText('99.5')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('99.5') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Change value
      fireEvent.change(input, { target: { value: '10.0' } })
      fireEvent.keyDown(input, { key: 'Enter' })
    })

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(10.0)
      expect(onUpdate).toHaveBeenCalledWith(10.0)
    })
  })

  it('commits changes on blur', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn().mockResolvedValue(undefined)

    renderWithProvider(
      <EditableNumberCell
        value={99.5}
        onChange={onChange}
        onUpdate={onUpdate}
        precision={1}
      />
    )

    const display = screen.getByText('99.5')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('99.5') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Change value and blur
      fireEvent.change(input, { target: { value: '25.5' } })
      fireEvent.blur(input)
    })

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(25.5)
      expect(onUpdate).toHaveBeenCalledWith(25.5)
    })
  })

  it('cancels changes on Escape', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableNumberCell
        value={99.5}
        onChange={onChange}
        onUpdate={onUpdate}
        precision={1}
      />
    )

    const display = screen.getByText('99.5')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('99.5') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Change value but cancel with Escape
      fireEvent.change(input, { target: { value: '50.0' } })
      fireEvent.keyDown(input, { key: 'Escape' })
    })

    await waitFor(() => {
      // Should revert to original value
      expect(screen.getByText('99.5')).toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  it('reverts empty input on blur', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableNumberCell
        value={99.5}
        onChange={onChange}
        onUpdate={onUpdate}
        precision={1}
      />
    )

    const display = screen.getByText('99.5')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('99.5') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Clear value and blur
      fireEvent.change(input, { target: { value: '' } })
      fireEvent.blur(input)
    })

    await waitFor(() => {
      // Should revert to original value without calling callbacks
      expect(screen.getByText('99.5')).toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  it('reverts invalid input on blur', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableNumberCell
        value={99.5}
        onChange={onChange}
        onUpdate={onUpdate}
        precision={1}
      />
    )

    const display = screen.getByText('99.5')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('99.5') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Enter invalid value
      fireEvent.change(input, { target: { value: 'abc' } })
      fireEvent.blur(input)
    })

    await waitFor(() => {
      // Should revert to original value
      expect(screen.getByText('99.5')).toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  it('reverts whitespace-only input on blur', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableNumberCell
        value={99.5}
        onChange={onChange}
        onUpdate={onUpdate}
        precision={1}
      />
    )

    const display = screen.getByText('99.5')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('99.5') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Enter whitespace-only value
      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.blur(input)
    })

    await waitFor(() => {
      // Should revert to original value without calling callbacks
      expect(screen.getByText('99.5')).toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  it('does not call callbacks when value is unchanged but editing occurred', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableNumberCell
        value={99.5}
        onChange={onChange}
        onUpdate={onUpdate}
        precision={1}
      />
    )

    const display = screen.getByText('99.5')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('99.5') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Don't change the value, just blur
      fireEvent.blur(input)
    })

    await waitFor(() => {
      // Should exit edit mode but not call callbacks
      expect(screen.getByText('99.5')).toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  it('does not call callbacks when value is unchanged on Enter', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn()

    renderWithProvider(
      <EditableNumberCell
        value={99.5}
        onChange={onChange}
        onUpdate={onUpdate}
        precision={1}
      />
    )

    const display = screen.getByText('99.5')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('99.5') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Don't change the value, just press Enter
      fireEvent.keyDown(input, { key: 'Enter' })
    })

    await waitFor(() => {
      // Should exit edit mode but not call callbacks
      expect(screen.getByText('99.5')).toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
      expect(onUpdate).not.toHaveBeenCalled()
    })
  })

  it('handles negative values when allowed', async () => {
    let currentValue: number | undefined = 10
    const onChange = vi.fn((newValue: number | undefined) => {
      currentValue = newValue
    })
    const onUpdate = vi.fn().mockResolvedValue(undefined)

    const { rerender } = renderWithProvider(
      <EditableNumberCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
        precision={1}
      />
    )

    const display = screen.getByText('10.0')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('10') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Enter negative value
      fireEvent.change(input, { target: { value: '-5' } })
      fireEvent.blur(input)
    })

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(-5)
      expect(onUpdate).toHaveBeenCalledWith(-5)
    })

    // Re-render with updated value to simulate controlled component
    rerender(
      <EditableNumberCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
        precision={1}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('-5.0')).toBeInTheDocument()
    })
  })

  it('reverts negative values when min constraint prevents them', async () => {
    let currentValue: number | undefined = 10
    const onChange = vi.fn((newValue: number | undefined) => {
      currentValue = newValue
    })
    const onUpdate = vi.fn().mockResolvedValue(undefined)

    const { rerender } = renderWithProvider(
      <EditableNumberCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
        min={0}
        precision={1}
      />
    )

    const display = screen.getByText('10.0')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('10') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Enter negative value (should be clamped to min)
      fireEvent.change(input, { target: { value: '-5' } })
      fireEvent.blur(input)
    })

    await waitFor(() => {
      // Should clamp to min (0) and call callbacks with clamped value
      expect(onChange).toHaveBeenCalledWith(0)
      expect(onUpdate).toHaveBeenCalledWith(0)
    })

    // Re-render with updated value to simulate controlled component
    rerender(
      <EditableNumberCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
        min={0}
        precision={1}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('0.0')).toBeInTheDocument()
    })
  })

  it('respects min and max constraints', async () => {
    const onChange = vi.fn()
    const onUpdate = vi.fn().mockResolvedValue(undefined)

    renderWithProvider(
      <EditableNumberCell
        value={50}
        onChange={onChange}
        onUpdate={onUpdate}
        min={0}
        max={100}
        precision={1}
      />
    )

    const display = screen.getByText('50.0')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('50') as HTMLInputElement
      expect(input).toBeInTheDocument()
      expect(input.min).toBe('0')
      expect(input.max).toBe('100')
    })
  })

  it('clamps values to min when below minimum', async () => {
    let currentValue: number | undefined = 50
    const onChange = vi.fn((newValue: number | undefined) => {
      currentValue = newValue
    })
    const onUpdate = vi.fn().mockResolvedValue(undefined)

    const { rerender } = renderWithProvider(
      <EditableNumberCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
        min={0}
        max={100}
        precision={1}
      />
    )

    const display = screen.getByText('50.0')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('50') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Enter value below min
      fireEvent.change(input, { target: { value: '-10' } })
      fireEvent.blur(input)
    })

    await waitFor(() => {
      // Should clamp to min (0)
      expect(onChange).toHaveBeenCalledWith(0)
      expect(onUpdate).toHaveBeenCalledWith(0)
    })

    // Re-render with updated value to simulate controlled component
    rerender(
      <EditableNumberCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
        min={0}
        max={100}
        precision={1}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('0.0')).toBeInTheDocument()
    })
  })

  it('clamps values to max when above maximum', async () => {
    let currentValue: number | undefined = 50
    const onChange = vi.fn((newValue: number | undefined) => {
      currentValue = newValue
    })
    const onUpdate = vi.fn().mockResolvedValue(undefined)

    const { rerender } = renderWithProvider(
      <EditableNumberCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
        min={0}
        max={100}
        precision={1}
      />
    )

    const display = screen.getByText('50.0')
    fireEvent.click(display)

    await waitFor(() => {
      const input = screen.getByDisplayValue('50') as HTMLInputElement
      expect(input).toBeInTheDocument()
      
      // Enter value above max
      fireEvent.change(input, { target: { value: '150' } })
      fireEvent.blur(input)
    })

    await waitFor(() => {
      // Should clamp to max (100)
      expect(onChange).toHaveBeenCalledWith(100)
      expect(onUpdate).toHaveBeenCalledWith(100)
    })

    // Re-render with updated value to simulate controlled component
    rerender(
      <EditableNumberCell
        value={currentValue}
        onChange={onChange}
        onUpdate={onUpdate}
        min={0}
        max={100}
        precision={1}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('100.0')).toBeInTheDocument()
    })
  })
})
