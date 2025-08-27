'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface VirtualListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  overscan?: number
  onScroll?: (scrollTop: number) => void
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  onScroll,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan,
  )

  // Get visible items
  const visibleItems = items.slice(startIndex, endIndex + 1)

  // Calculate total height and offset
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop
      setScrollTop(newScrollTop)
      onScroll?.(newScrollTop)
    },
    [onScroll],
  )

  // Scroll to specific item
  const scrollToItem = useCallback(
    (index: number) => {
      if (containerRef.current) {
        const scrollTop = index * itemHeight
        containerRef.current.scrollTop = scrollTop
      }
    },
    [itemHeight],
  )

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [])

  // Get item index at scroll position
  const getItemIndexAtPosition = useCallback(
    (scrollTop: number) => {
      return Math.floor(scrollTop / itemHeight)
    },
    [itemHeight],
  )

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index
            return (
              <div key={actualIndex} style={{ height: itemHeight }}>
                {renderItem(item, actualIndex)}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Hook for virtual list state
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5,
) {
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan,
  )

  const visibleItems = items.slice(startIndex, endIndex + 1)
  const totalHeight = items.length * itemHeight
  const offsetY = startIndex * itemHeight

  return {
    scrollTop,
    setScrollTop,
    startIndex,
    endIndex,
    visibleItems,
    totalHeight,
    offsetY,
  }
}

// Example usage component
interface ExampleItem {
  id: string
  title: string
  description: string
}

export function ExampleVirtualList({ items }: { items: ExampleItem[] }) {
  return (
    <VirtualList
      items={items}
      itemHeight={80}
      containerHeight={400}
      renderItem={(item, index) => (
        <div className="p-4 border-b border-gray-200 hover:bg-gray-50">
          <h3 className="font-medium">{item.title}</h3>
          <p className="text-sm text-gray-600">{item.description}</p>
          <span className="text-xs text-gray-400">Item {index + 1}</span>
        </div>
      )}
      className="border border-gray-200 rounded-lg"
    />
  )
}
