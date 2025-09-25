import React, { Fragment } from 'react'

import type { Props } from './types'

import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'

export const Media: React.FC<Props> = (props) => {
  const { className, htmlElement = 'div', resource } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  const Tag = htmlElement || Fragment

  // For videos, we want to apply the className directly to the video element
  // For images, we keep the wrapper structure for Next.js Image optimization
  if (isVideo) {
    return <VideoMedia {...props} />
  }

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className,
          }
        : {})}
    >
      <ImageMedia {...props} />
    </Tag>
  )
}
