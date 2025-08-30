'use client'

import * as React from 'react'
import { useEffect, useState, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { Media as MediaType } from '@/payload/payload-types'
// Using Picsum for placeholder images
import Image from 'next/image'

type ImageGalleryProps = {
  images: { image: MediaType; id: string; isCover: boolean }[]
  addressRich?: DefaultTypedEditorState
  localityLine?: string // e.g., "Sector 21, City"
}

export default function ImageGallery({ images, addressRich, localityLine }: ImageGalleryProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const hasImages = Array.isArray(images) && images.length > 0

  const cover = images.find((i: any) => (i as any).isCover) || images[0]
  const rest = images.filter((i) => i !== cover).slice(0, 4)
  const allImages = [cover, ...rest]
  const openModal = (idx: number) => {
    setSelectedIdx(idx)
    setModalOpen(true)
  }
  const closeModal = () => setModalOpen(false)
  const prevImg = useCallback(
    () => setSelectedIdx((i) => (i === 0 ? allImages.length - 1 : i - 1)),
    [allImages.length],
  )
  const nextImg = useCallback(
    () => setSelectedIdx((i) => (i === allImages.length - 1 ? 0 : i + 1)),
    [allImages.length],
  )

  // Keyboard navigation when modal is open
  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
      if (e.key === 'ArrowLeft') prevImg()
      if (e.key === 'ArrowRight') nextImg()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen, prevImg, nextImg])

  // If there are no images, render a default placeholder from public/.
  // This is placed after hook calls so hooks are always invoked in the same order.
  if (!hasImages) {
    return (
      <section className="mx-auto max-w-6xl px-4 pl-0 pt-4 pb-2">
        <div className="w-full overflow-hidden rounded-xl border bg-muted">
          {/* Use Picsum for placeholder images */}
          <Image
            src="https://picsum.photos/seed/property-placeholder/800/450"
            className="w-full aspect-[4/5] md:aspect-[16/9] object-cover"
            alt="Property placeholder"
            width={800}
            height={450}
          />
        </div>
        {(addressRich || localityLine) && (
          <div className="mt-2 text-sm text-muted-foreground">
            {addressRich ? (
              <div className="mt-2">
                <RichText data={addressRich} enableGutter={false} enableProse={false} />
              </div>
            ) : null}
            {localityLine ? <div className="mt-1">{localityLine}</div> : null}
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl pt-4 pb-2">
      <div
        className="w-full overflow-hidden rounded-sm md:rounded-md border bg-muted cursor-pointer"
        onClick={() => openModal(0)}
      >
        {cover && <Media resource={cover.image} className="w-full aspect-[16/9] object-cover" />}
      </div>
      {rest.length > 0 && (
        <div className="mt-3 flex gap-3 overflow-x-auto">
          {rest.map((img, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-xl border bg-muted w-32 flex-shrink-0 cursor-pointer aspect-[16/9]"
              onClick={() => openModal(idx + 1)}
            >
              {img && <Media resource={img.image} className="w-full h-full object-cover" />}
            </div>
          ))}
        </div>
      )}
      {(addressRich || localityLine) && (
        <div className="mt-2 text-sm text-muted-foreground">
          {addressRich ? (
            <div className="mt-2">
              <RichText data={addressRich} enableGutter={false} enableProse={false} />
            </div>
          ) : null}
          {localityLine ? <div className="mt-1">{localityLine}</div> : null}
        </div>
      )}

      {/* Modal for large image view */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 md:p-8 select-none"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-card rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
              {/* Close button inside card top-right */}
              <button
                className="absolute top-4 right-4 z-20 bg-white/95 text-black rounded-full shadow-lg size-8 flex items-center justify-center hover:bg-white"
                onClick={closeModal}
                aria-label="Close"
              >
                <X className="size-5" />
              </button>

              {/* Image area with overlay arrows */}
              <div className="relative flex items-center justify-center w-full p-2">
                {allImages.length > 1 && (
                  <button
                    onClick={() => prevImg()}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full size-10 flex items-center justify-center hover:bg-black/70"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                )}
                {allImages[selectedIdx] && (
                  <Media
                    resource={allImages[selectedIdx].image}
                    className="max-h-[75vh] w-auto rounded-xl border bg-muted max-w-[85vw]"
                  />
                )}
                {allImages.length > 1 && (
                  <button
                    onClick={nextImg}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full size-10 flex items-center justify-center hover:bg-black/70"
                    aria-label="Next image"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                )}
              </div>

              {/* Thumbnails strip */}
              {allImages.length > 1 && (
                <div className="bg-background/80 border-t border-white/10 px-4 py-3">
                  <div className="flex gap-2 overflow-x-auto">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        className={`relative rounded-md overflow-hidden border ${idx === selectedIdx ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelectedIdx(idx)}
                        aria-label={`Image ${idx + 1}`}
                      >
                        {img && <Media resource={img.image} className="w-20 h-14 object-cover" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
