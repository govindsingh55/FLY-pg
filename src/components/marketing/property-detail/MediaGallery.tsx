'use client'

import * as React from 'react'
import { useEffect, useState, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { Media as MediaType } from '@/payload/payload-types'
import Image from 'next/image'

type MediaItem = {
  image: MediaType
  id: string
  isCover: boolean
  roomName?: string
  roomType?: string
  isRoomImage?: boolean
}

type MediaGalleryProps = {
  images: { image: MediaType; id: string; isCover: boolean }[]
  rooms?: Array<{
    id: string
    name: string
    roomType?: string
    images: Array<{ image: MediaType; id: string; isCover: boolean }>
  }>
  addressRich?: DefaultTypedEditorState
  localityLine?: string // e.g., "Sector 21, City"
}

export default function MediaGallery({
  images,
  rooms,
  addressRich,
  localityLine,
}: MediaGalleryProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)

  // Combine property images with room images
  const propertyImages: MediaItem[] = Array.isArray(images) ? images : []
  const roomImages: MediaItem[] = Array.isArray(rooms)
    ? rooms.flatMap((room) =>
        room.images.map((img) => ({
          ...img,
          roomName: room.name,
          roomType: room.roomType,
          isRoomImage: true,
        })),
      )
    : []

  const allImages: MediaItem[] = [...propertyImages, ...roomImages]
  const hasMedia = allImages.length > 0

  const cover = allImages.find((i) => i.isCover) || allImages[0]
  const rest = allImages.filter((i) => i !== cover).slice(0, 4)
  const allMedia: MediaItem[] = [cover, ...rest]
  const openModal = (idx: number) => {
    setSelectedIdx(idx)
    setModalOpen(true)
  }
  const closeModal = () => setModalOpen(false)

  const prevMedia = useCallback(
    () => setSelectedIdx((i) => (i === 0 ? allMedia.length - 1 : i - 1)),
    [allMedia.length],
  )
  const nextMedia = useCallback(
    () => setSelectedIdx((i) => (i === allMedia.length - 1 ? 0 : i + 1)),
    [allMedia.length],
  )

  // Keyboard navigation when modal is open
  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
      if (e.key === 'ArrowLeft') prevMedia()
      if (e.key === 'ArrowRight') nextMedia()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen, prevMedia, nextMedia])

  // If there are no media files, render a default placeholder from public/.
  // This is placed after hook calls so hooks are always invoked in the same order.
  if (!hasMedia) {
    return (
      <section className="w-full pt-4 pb-2">
        <div className="w-full aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-lg border bg-muted relative">
          {/* Use Picsum for placeholder images */}
          <Image
            src="https://picsum.photos/seed/property-placeholder/800/450"
            className="w-full h-full object-cover"
            alt="Property placeholder"
            fill={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            priority={true}
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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
    <section className="w-full pt-4 pb-2">
      <div
        className="w-full aspect-[3/4] md:aspect-[16/9] overflow-hidden rounded-lg border bg-muted cursor-pointer relative group"
        onClick={() => openModal(0)}
      >
        {cover && (
          <>
            {cover.image?.mimeType?.includes('video') ? (
              <Media
                resource={cover.image}
                className="absolute inset-0 w-full h-full object-cover"
                fill={true}
                priority={true}
                size="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                controls={false}
                autoPlay={true}
              />
            ) : (
              <Media
                resource={cover.image}
                className="absolute inset-0 w-full h-full object-cover"
                fill={true}
                priority={true}
                size="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
            )}
            {/* Hover overlay for main image */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </>
        )}
      </div>
      {rest.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {rest.map((img, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-lg border bg-muted w-24 aspect-[3/2] md:w-32 md:aspect-[3/2] flex-shrink-0 cursor-pointer relative group hover:scale-105 transition-transform"
              onClick={() => openModal(idx + 1)}
            >
              {img && (
                <>
                  {img.image?.mimeType?.includes('video') ? (
                    <div className="w-full h-full object-cover relative">
                      <Media
                        resource={img.image}
                        className="w-full h-full object-cover"
                        size="(max-width: 768px) 96px, 128px"
                        loading="lazy"
                        autoPlay={false}
                        controls={false}
                      />
                      <div className="absolute inset-0 flex items-start justify-end p-2 bg-black/20 rounded-lg">
                        <Play className="size-6 text-white" />
                      </div>
                    </div>
                  ) : (
                    <Media
                      resource={img.image}
                      className="w-full h-full object-cover"
                      size="(max-width: 768px) 96px, 128px"
                      loading="lazy"
                    />
                  )}
                  {/* Room label for main carousel thumbnails */}
                  {img.isRoomImage && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 text-center truncate">
                      Room
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {(addressRich || localityLine) && (
        <div className="mt-3 text-sm text-muted-foreground">
          {addressRich ? (
            <div>
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

              {/* Media area with overlay arrows and video controls */}
              <div className="relative flex items-center justify-center w-full p-2">
                {allMedia.length > 1 && (
                  <button
                    onClick={() => prevMedia()}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full size-10 flex items-center justify-center hover:bg-black/70"
                    aria-label="Previous media"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                )}
                {allMedia[selectedIdx] && (
                  <div className="relative">
                    {allMedia[selectedIdx].image?.mimeType?.includes('video') ? (
                      <Media
                        resource={allMedia[selectedIdx].image}
                        className="max-h-[75vh] w-auto rounded-xl border bg-muted max-w-[85vw]"
                        size="(max-width: 768px) 85vw, (max-width: 1200px) 70vw, 60vw"
                        priority={selectedIdx === 0}
                        videoClassName="autoplay"
                        controls={true}
                        autoPlay={false}
                      />
                    ) : (
                      <Media
                        resource={allMedia[selectedIdx].image}
                        className="max-h-[75vh] w-auto rounded-xl border bg-muted max-w-[85vw]"
                        size="(max-width: 768px) 85vw, (max-width: 1200px) 70vw, 60vw"
                        priority={selectedIdx === 0}
                      />
                    )}
                    {/* Room label overlay */}
                    {allMedia[selectedIdx].isRoomImage && (
                      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Room
                      </div>
                    )}
                  </div>
                )}
                {allMedia.length > 1 && (
                  <button
                    onClick={nextMedia}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full size-10 flex items-center justify-center hover:bg-black/70"
                    aria-label="Next media"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                )}
              </div>

              {/* Thumbnails strip */}
              {allMedia.length > 1 && (
                <div className="bg-background/80 border-t border-white/10 px-4 py-3">
                  <div className="flex gap-2 overflow-x-auto">
                    {allMedia.map((media, idx) => (
                      <button
                        key={idx}
                        className={`relative rounded-md overflow-hidden border ${idx === selectedIdx ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelectedIdx(idx)}
                        aria-label={`Media ${idx + 1}`}
                      >
                        {media && (
                          <div className="relative">
                            {media.image?.mimeType?.includes('video') ? (
                              <Media
                                resource={media.image}
                                className="w-20 h-14 object-cover"
                                size="80px"
                                loading="lazy"
                                videoClassName="no-autoplay"
                              />
                            ) : (
                              <Media
                                resource={media.image}
                                className="w-20 h-14 object-cover"
                                size="80px"
                                loading="lazy"
                              />
                            )}
                            {/* Room label for thumbnails */}
                            {media.isRoomImage && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 text-center truncate">
                                Room
                              </div>
                            )}
                          </div>
                        )}
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
