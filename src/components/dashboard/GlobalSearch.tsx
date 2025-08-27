'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import {
  Search,
  X,
  Calendar,
  CreditCard,
  Home,
  FileText,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  type: 'booking' | 'payment' | 'property' | 'notification'
  title: string
  description: string
  status?: string
  date?: string
  amount?: number
  url: string
  relevance: number
}

interface GlobalSearchProps {
  className?: string
  placeholder?: string
}

export function GlobalSearch({
  className,
  placeholder = 'Search bookings, payments, properties...',
}: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showResults || results.length === 0) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
          break
        case 'Enter':
          event.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < results.length) {
            handleResultClick(results[selectedIndex])
          }
          break
        case 'Escape':
          setShowResults(false)
          setSelectedIndex(-1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showResults, results, selectedIndex])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(
        `/api/custom/customers/search?q=${encodeURIComponent(searchQuery)}`,
      )

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setResults(data.results || [])
      setShowResults(true)
      setSelectedIndex(-1)
    } catch (err) {
      toast.error('Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch(query)
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url)
    setShowResults(false)
    setQuery('')
    setSelectedIndex(-1)
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-4 w-4 text-blue-600" />
      case 'payment':
        return <CreditCard className="h-4 w-4 text-green-600" />
      case 'property':
        return <Home className="h-4 w-4 text-purple-600" />
      case 'notification':
        return <FileText className="h-4 w-4 text-orange-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null

    const statusConfig = {
      pending: { variant: 'secondary' as const, text: 'Pending' },
      completed: { variant: 'default' as const, text: 'Completed' },
      failed: { variant: 'destructive' as const, text: 'Failed' },
      active: { variant: 'default' as const, text: 'Active' },
      cancelled: { variant: 'outline' as const, text: 'Cancelled' },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null

    return (
      <Badge variant={config.variant} className="text-xs">
        {config.text}
      </Badge>
    )
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return null
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className={className} ref={searchRef}>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setShowResults(true)
            }}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery('')
                setResults([])
                setShowResults(false)
                inputRef.current?.focus()
              }}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner />
                  <span className="ml-2 text-sm text-gray-600">Searching...</span>
                </div>
              ) : results.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No results found</p>
                  <p className="text-sm">Try different keywords</p>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {results.map((result, index) => (
                    <div
                      key={`${result.type}-${result.id}`}
                      className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                        index === selectedIndex ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">{getResultIcon(result.type)}</div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {result.title}
                                </h4>
                                {getStatusBadge(result.status)}
                              </div>

                              <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                                {result.description}
                              </p>

                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                {result.date && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(result.date)}
                                  </span>
                                )}
                                {result.amount && (
                                  <span className="font-medium">
                                    {formatCurrency(result.amount)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
