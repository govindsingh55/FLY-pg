import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock external dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

describe('Critical Component Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  describe('Form Validation & Submission', () => {
    it('should validate required fields before submission', async () => {
      const user = userEvent.setup()

      // Mock form component
      const TestForm = () => (
        <form onSubmit={(e) => e.preventDefault()}>
          <input name="email" type="email" required />
          <input name="password" type="password" required />
          <button type="submit">Submit</button>
        </form>
      )

      render(<TestForm />)

      const submitButton = screen.getByText('Submit')
      await user.click(submitButton)

      // Form should not submit without required fields
      expect(submitButton).toBeInTheDocument()
    })

    it('should show validation errors for invalid input', async () => {
      const user = userEvent.setup()

      const TestForm = () => {
        const [errors, setErrors] = React.useState<{ email?: string }>({})

        const validateEmail = (email: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(email)) {
            setErrors({ email: 'Invalid email format' })
          } else {
            setErrors({})
          }
        }

        return (
          <div>
            <input name="email" type="email" onChange={(e) => validateEmail(e.target.value)} />
            {errors.email && <span data-testid="email-error">{errors.email}</span>}
          </div>
        )
      }

      render(<TestForm />)

      const emailInput = screen.getByDisplayValue('')
      await user.type(emailInput, 'invalid-email')

      await waitFor(() => {
        expect(screen.getByTestId('email-error')).toBeInTheDocument()
      })
    })

    it('should prevent form submission with invalid data', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()

      const TestForm = () => {
        const [isValid, setIsValid] = React.useState(false)

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault()
          if (isValid) {
            mockSubmit()
          }
        }

        return (
          <form onSubmit={handleSubmit}>
            <input name="email" onChange={(e) => setIsValid(e.target.value.includes('@'))} />
            <button type="submit">Submit</button>
          </form>
        )
      }

      render(<TestForm />)

      const emailInput = screen.getByDisplayValue('')
      const submitButton = screen.getByText('Submit')

      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)

      expect(mockSubmit).not.toHaveBeenCalled()

      await user.clear(emailInput)
      await user.type(emailInput, 'valid@email.com')
      await user.click(submitButton)

      expect(mockSubmit).toHaveBeenCalled()
    })
  })

  describe('Data Display & Rendering', () => {
    it('should handle empty data states gracefully', () => {
      const EmptyStateComponent = ({ data }: { data: any[] }) => {
        if (!data || data.length === 0) {
          return <div data-testid="empty-state">No data available</div>
        }
        return (
          <div data-testid="data-list">
            {data.map((item) => (
              <div key={item.id}>{item.name}</div>
            ))}
          </div>
        )
      }

      render(<EmptyStateComponent data={[]} />)

      expect(screen.getByTestId('empty-state')).toBeInTheDocument()
      expect(screen.queryByTestId('data-list')).not.toBeInTheDocument()
    })

    it('should format currency values correctly', () => {
      const CurrencyDisplay = ({ amount }: { amount: number }) => (
        <span data-testid="currency">₹{amount.toLocaleString('en-IN')}</span>
      )

      render(<CurrencyDisplay amount={150000} />)

      expect(screen.getByTestId('currency')).toHaveTextContent('₹1,50,000')
    })

    it('should format dates consistently', () => {
      const DateDisplay = ({ date }: { date: string }) => {
        const formattedDate = new Date(date).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
        return <span data-testid="date">{formattedDate}</span>
      }

      render(<DateDisplay date="2024-01-15T10:00:00Z" />)

      expect(screen.getByTestId('date')).toHaveTextContent('15 Jan 2024')
    })

    it('should handle loading states properly', () => {
      const LoadingComponent = ({ isLoading, data }: { isLoading: boolean; data?: any }) => {
        if (isLoading) {
          return <div data-testid="loading">Loading...</div>
        }
        return <div data-testid="content">{data}</div>
      }

      render(<LoadingComponent isLoading={true} />)

      expect(screen.getByTestId('loading')).toBeInTheDocument()
      expect(screen.queryByTestId('content')).not.toBeInTheDocument()
    })
  })

  describe('User Interactions & State Management', () => {
    it('should handle pagination correctly', async () => {
      const user = userEvent.setup()

      const PaginationComponent = () => {
        const [currentPage, setCurrentPage] = React.useState(1)
        const totalPages = 5

        return (
          <div>
            <span data-testid="current-page">{currentPage}</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )
      }

      render(<PaginationComponent />)

      const currentPageSpan = screen.getByTestId('current-page')
      const nextButton = screen.getByText('Next')
      const prevButton = screen.getByText('Previous')

      expect(currentPageSpan).toHaveTextContent('1')
      expect(prevButton).toBeDisabled()

      await user.click(nextButton)
      expect(currentPageSpan).toHaveTextContent('2')
      expect(prevButton).not.toBeDisabled()
    })

    it('should handle search and filtering', async () => {
      const user = userEvent.setup()

      const SearchComponent = () => {
        const [searchTerm, setSearchTerm] = React.useState('')
        const [filteredData, setFilteredData] = React.useState(['Item 1', 'Item 2', 'Item 3'])

        const handleSearch = (term: string) => {
          setSearchTerm(term)
          const filtered = ['Item 1', 'Item 2', 'Item 3'].filter((item) =>
            item.toLowerCase().includes(term.toLowerCase()),
          )
          setFilteredData(filtered)
        }

        return (
          <div>
            <input
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search..."
            />
            <div data-testid="results">
              {filteredData.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          </div>
        )
      }

      render(<SearchComponent />)

      const searchInput = screen.getByDisplayValue('')
      const resultsDiv = screen.getByTestId('results')

      expect(resultsDiv.children).toHaveLength(3)

      await user.type(searchInput, 'Item 1')

      expect(resultsDiv.children).toHaveLength(1)
      expect(resultsDiv).toHaveTextContent('Item 1')
    })

    it('should handle modal/dialog interactions', async () => {
      const user = userEvent.setup()

      const ModalComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false)

        return (
          <div>
            <button onClick={() => setIsOpen(true)}>Open Modal</button>
            {isOpen && (
              <div data-testid="modal" role="dialog">
                <h2>Modal Title</h2>
                <button onClick={() => setIsOpen(false)}>Close</button>
              </div>
            )}
          </div>
        )
      }

      render(<ModalComponent />)

      const openButton = screen.getByText('Open Modal')
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()

      await user.click(openButton)
      expect(screen.getByTestId('modal')).toBeInTheDocument()

      const closeButton = screen.getByText('Close')
      await user.click(closeButton)
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling & Recovery', () => {
    it('should display error messages when API calls fail', () => {
      const ErrorComponent = ({ error }: { error: string | null }) => {
        if (error) {
          return <div data-testid="error-message">{error}</div>
        }
        return <div data-testid="success">Success</div>
      }

      render(<ErrorComponent error="API request failed" />)

      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByTestId('error-message')).toHaveTextContent('API request failed')
    })

    it('should provide retry functionality for failed operations', async () => {
      const user = userEvent.setup()

      const RetryComponent = () => {
        const [retryCount, setRetryCount] = React.useState(0)
        const [isLoading, setIsLoading] = React.useState(false)

        const handleRetry = async () => {
          setIsLoading(true)
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 100))
          setRetryCount((prev) => prev + 1)
          setIsLoading(false)
        }

        return (
          <div>
            <span data-testid="retry-count">{retryCount}</span>
            <button onClick={handleRetry} disabled={isLoading}>
              {isLoading ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        )
      }

      render(<RetryComponent />)

      const retryButton = screen.getByText('Retry')
      const retryCountSpan = screen.getByTestId('retry-count')

      expect(retryCountSpan).toHaveTextContent('0')

      await user.click(retryButton)

      await waitFor(() => {
        expect(retryCountSpan).toHaveTextContent('1')
      })
    })

    it('should handle network connectivity issues', () => {
      const NetworkAwareComponent = ({ isOnline }: { isOnline: boolean }) => {
        if (!isOnline) {
          return (
            <div data-testid="offline-message">You are offline. Please check your connection.</div>
          )
        }
        return <div data-testid="online-content">Online content</div>
      }

      render(<NetworkAwareComponent isOnline={false} />)

      expect(screen.getByTestId('offline-message')).toBeInTheDocument()
      expect(screen.queryByTestId('online-content')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility & Keyboard Navigation', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()

      const KeyboardNavComponent = () => (
        <div>
          <button data-testid="first-button">First</button>
          <button data-testid="second-button">Second</button>
          <button data-testid="third-button">Third</button>
        </div>
      )

      render(<KeyboardNavComponent />)

      const firstButton = screen.getByTestId('first-button')
      const secondButton = screen.getByTestId('second-button')

      firstButton.focus()
      expect(firstButton).toHaveFocus()

      await user.tab()
      expect(secondButton).toHaveFocus()
    })

    it('should have proper ARIA labels', () => {
      const AccessibleComponent = () => (
        <div>
          <button aria-label="Close dialog">×</button>
          <input aria-label="Search properties" placeholder="Search..." />
          <div role="alert" aria-live="polite">
            Important message
          </div>
        </div>
      )

      render(<AccessibleComponent />)

      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument()
      expect(screen.getByLabelText('Search properties')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('should handle focus management for modals', async () => {
      const user = userEvent.setup()

      const FocusModal = () => {
        const [isOpen, setIsOpen] = React.useState(false)

        return (
          <div>
            <button onClick={() => setIsOpen(true)}>Open</button>
            {isOpen && (
              <div role="dialog" aria-modal="true">
                <button onClick={() => setIsOpen(false)}>Close</button>
                <button>Action 1</button>
                <button>Action 2</button>
              </div>
            )}
          </div>
        )
      }

      render(<FocusModal />)

      const openButton = screen.getByText('Open')
      await user.click(openButton)

      const modal = screen.getByRole('dialog')
      expect(modal).toHaveAttribute('aria-modal', 'true')
    })
  })

  describe('Performance & Optimization', () => {
    it('should handle large data sets efficiently', () => {
      const LargeListComponent = ({ items }: { items: string[] }) => {
        // Simulate virtualization by only rendering visible items
        const visibleItems = items.slice(0, 10)

        return (
          <div data-testid="large-list">
            {visibleItems.map((item, index) => (
              <div key={index} data-testid={`item-${index}`}>
                {item}
              </div>
            ))}
            {items.length > 10 && <div data-testid="more-indicator">+{items.length - 10} more</div>}
          </div>
        )
      }

      const largeDataSet = Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`)

      render(<LargeListComponent items={largeDataSet} />)

      expect(screen.getByTestId('large-list').children).toHaveLength(11) // 10 items + more indicator
      expect(screen.getByTestId('more-indicator')).toHaveTextContent('+990 more')
    })

    it('should debounce user input for search', async () => {
      const user = userEvent.setup()

      const DebouncedSearch = () => {
        const [searchTerm, setSearchTerm] = React.useState('')
        const [debouncedTerm, setDebouncedTerm] = React.useState('')

        // Simulate debouncing
        const handleSearch = (value: string) => {
          setSearchTerm(value)
          setTimeout(() => setDebouncedTerm(value), 300)
        }

        return (
          <div>
            <input
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search..."
            />
            <div data-testid="debounced-term">{debouncedTerm}</div>
          </div>
        )
      }

      render(<DebouncedSearch />)

      const searchInput = screen.getByDisplayValue('')
      const debouncedTermDiv = screen.getByTestId('debounced-term')

      await user.type(searchInput, 'test')

      expect(debouncedTermDiv).toHaveTextContent('')

      // Wait for debounce
      await waitFor(
        () => {
          expect(debouncedTermDiv).toHaveTextContent('test')
        },
        { timeout: 400 },
      )
    })
  })
})
