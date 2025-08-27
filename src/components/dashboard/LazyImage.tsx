'use client'

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  fallback?: string
  width?: number
  height?: number
  priority?: boolean
  onLoad?: () => void
  onError?: () => void
}

export function LazyImage({
  src,
  alt,
  className,
  placeholder = '/placeholder-image.png',
  fallback = '/fallback-image.png',
  width,
  height,
  priority = false,
  onLoad,
  onError,
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (priority) {
      setImageSrc(src)
      return
    }

    if (!imgRef.current) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observerRef.current?.unobserve(entry.target)
          }
        })
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      },
    )

    observerRef.current.observe(imgRef.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [priority, src])

  useEffect(() => {
    if (isInView && imageSrc === placeholder) {
      setImageSrc(src)
    }
  }, [isInView, src, imageSrc, placeholder])

  const handleLoad = () => {
    setImageStatus('loaded')
    onLoad?.()
  }

  const handleError = () => {
    setImageStatus('error')
    if (imageSrc !== fallback) {
      setImageSrc(fallback)
    }
    onError?.()
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        imageStatus === 'loading' && 'animate-pulse bg-gray-200',
        className,
      )}
      style={{
        width: width ? `${width}px` : 'auto',
        height: height ? `${height}px` : 'auto',
      }}
    >
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          imageStatus === 'loaded' ? 'opacity-100' : 'opacity-0',
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />

      {imageStatus === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}

      {imageStatus === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-400 text-sm">Image unavailable</div>
        </div>
      )}
    </div>
  )
}
