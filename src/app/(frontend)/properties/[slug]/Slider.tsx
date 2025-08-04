'use client'

import { useState } from 'react'
import { Media } from '@/components/Media'

type SliderProps = {
  images: any[]
  alt: string
}

export default function Slider({ images, alt }: SliderProps) {
  const [current, setCurrent] = useState(0)
  const total = images.length
  if (total === 0) return null
  const goPrev = () => setCurrent((i) => (i === 0 ? total - 1 : i - 1))
  const goNext = () => setCurrent((i) => (i === total - 1 ? 0 : i + 1))
  return (
    <div className="mb-6">
      <strong>Images:</strong>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button type="button" onClick={goPrev} aria-label="Previous" style={{ fontSize: '2rem' }}>
          &lt;
        </button>
        <div style={{ minWidth: '300px', maxWidth: '100%' }}>
          <Media resource={images[current].image} alt={alt} />
        </div>
        <button type="button" onClick={goNext} aria-label="Next" style={{ fontSize: '2rem' }}>
          &gt;
        </button>
      </div>
      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        {current + 1} / {total}
      </div>
    </div>
  )
}
