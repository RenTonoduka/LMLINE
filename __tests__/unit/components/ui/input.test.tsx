import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />)
    
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md')
  })

  it('handles text input', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Type here" />)
    
    const input = screen.getByPlaceholderText('Type here')
    await user.type(input, 'Hello World')
    
    expect(input).toHaveValue('Hello World')
  })

  it('handles onChange events', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()
    
    render(<Input onChange={handleChange} placeholder="Test input" />)
    
    const input = screen.getByPlaceholderText('Test input')
    await user.type(input, 'a')
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" placeholder="Email" />)
    
    let input = screen.getByPlaceholderText('Email')
    expect(input).toHaveAttribute('type', 'email')
    
    rerender(<Input type="password" placeholder="Password" />)
    input = screen.getByPlaceholderText('Password')
    expect(input).toHaveAttribute('type', 'password')
    
    rerender(<Input type="number" placeholder="Number" />)
    input = screen.getByPlaceholderText('Number')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('can be disabled', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()
    
    render(<Input disabled onChange={handleChange} placeholder="Disabled" />)
    
    const input = screen.getByPlaceholderText('Disabled')
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    
    await user.type(input, 'test')
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Input className="custom-input" placeholder="Custom" />)
    
    const input = screen.getByPlaceholderText('Custom')
    expect(input).toHaveClass('custom-input')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input ref={ref} placeholder="Ref test" />)
    
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('supports required attribute', () => {
    render(<Input required placeholder="Required input" />)
    
    const input = screen.getByPlaceholderText('Required input')
    expect(input).toBeRequired()
  })

  it('supports defaultValue', () => {
    render(<Input defaultValue="Default text" placeholder="Default" />)
    
    const input = screen.getByDisplayValue('Default text')
    expect(input).toBeInTheDocument()
  })

  it('supports controlled value', async () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('')
      return (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Controlled"
        />
      )
    }
    
    const user = userEvent.setup()
    render(<TestComponent />)
    
    const input = screen.getByPlaceholderText('Controlled')
    await user.type(input, 'controlled text')
    
    expect(input).toHaveValue('controlled text')
  })

  it('has correct focus styles', () => {
    render(<Input placeholder="Focus test" />)
    
    const input = screen.getByPlaceholderText('Focus test')
    expect(input).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2'
    )
  })

  it('supports all standard input attributes', () => {
    render(
      <Input
        name="test-input"
        id="test-id"
        aria-label="Test input"
        data-testid="test-input"
        maxLength={10}
        minLength={2}
        pattern="[A-Za-z]+"
        placeholder="Test attributes"
      />
    )
    
    const input = screen.getByTestId('test-input')
    expect(input).toHaveAttribute('name', 'test-input')
    expect(input).toHaveAttribute('id', 'test-id')
    expect(input).toHaveAttribute('aria-label', 'Test input')
    expect(input).toHaveAttribute('maxLength', '10')
    expect(input).toHaveAttribute('minLength', '2')
    expect(input).toHaveAttribute('pattern', '[A-Za-z]+')
  })
})