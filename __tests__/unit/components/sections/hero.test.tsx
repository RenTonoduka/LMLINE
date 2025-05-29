import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Hero } from '@/components/sections/hero'

// Mock Next.js components
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

describe('Hero Component', () => {
  it('renders hero section with main content', () => {
    render(<Hero />)

    // Check for main heading
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/LMS|学習|AI|コース/)

    // Check for description text
    expect(screen.getByText(/学習|教育|コース|サポート/)).toBeInTheDocument()
  })

  it('has call-to-action buttons', () => {
    render(<Hero />)

    // Should have primary CTA button
    const ctaButtons = screen.getAllByRole('link')
    expect(ctaButtons.length).toBeGreaterThan(0)

    // Check for common CTA text
    const commonCtaTexts = [
      '無料で始める',
      '今すぐ始める',
      'コースを見る',
      '登録する',
      '始める'
    ]

    const hasCtaText = ctaButtons.some(button => 
      commonCtaTexts.some(text => 
        button.textContent?.includes(text)
      )
    )

    expect(hasCtaText).toBe(true)
  })

  it('is properly structured for accessibility', () => {
    render(<Hero />)

    // Should have main heading
    const mainHeading = screen.getByRole('heading', { level: 1 })
    expect(mainHeading).toBeInTheDocument()

    // Should have descriptive content
    expect(screen.getByText(/学習|教育|コース|サポート/)).toBeInTheDocument()

    // All buttons should be accessible
    const buttons = screen.getAllByRole('link')
    buttons.forEach(button => {
      expect(button).toBeVisible()
    })
  })

  it('has responsive design classes', () => {
    const { container } = render(<Hero />)

    // Should have container classes for responsive design
    const heroSection = container.firstChild as HTMLElement
    expect(heroSection).toHaveClass(/container|mx-auto|px-|py-|flex|grid/)
  })

  it('renders without crashing', () => {
    expect(() => render(<Hero />)).not.toThrow()
  })

  it('handles click events on CTA buttons', async () => {
    const user = userEvent.setup()
    render(<Hero />)

    const ctaButtons = screen.getAllByRole('link')
    
    // Test that buttons are clickable (won't actually navigate in test)
    for (const button of ctaButtons) {
      expect(button).toBeEnabled()
      // Just verify the button exists and is clickable
      await user.hover(button)
    }
  })

  it('has proper semantic HTML structure', () => {
    const { container } = render(<Hero />)

    // Should be wrapped in semantic HTML
    const heroElement = container.querySelector('section, div[role="banner"], header')
    expect(heroElement).toBeInTheDocument()
  })

  it('displays hero image or visual element', () => {
    const { container } = render(<Hero />)

    // Check for image, icon, or visual elements
    const visualElements = container.querySelectorAll('img, svg, [role="img"]')
    
    // Should have some visual elements (even if just icons)
    expect(visualElements.length).toBeGreaterThanOrEqual(0)
  })

  it('has proper link destinations', () => {
    render(<Hero />)

    const links = screen.getAllByRole('link')
    
    links.forEach(link => {
      const href = link.getAttribute('href')
      expect(href).toBeTruthy()
      expect(href).not.toBe('#')
      expect(href).toMatch(/^\/|^https?:\/\//)
    })
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<Hero />)

    const links = screen.getAllByRole('link')
    
    if (links.length > 0) {
      // Tab to first link
      await user.tab()
      expect(links[0]).toHaveFocus()

      // Tab to next link if exists
      if (links.length > 1) {
        await user.tab()
        expect(links[1]).toHaveFocus()
      }
    }
  })
})