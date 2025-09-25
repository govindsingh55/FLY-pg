interface ImageLoaderProps {
  src: string
  width: number
  quality?: number
}

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  // If it's already a full URL, return as is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src
  }

  // If it's a local media file, use our custom endpoint
  if (src.startsWith('/media/')) {
    const filename = src.split('/').pop()
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    return `${baseUrl}/api/custom/media?filename=${filename}&width=${width}&quality=${quality || 75}`
  }

  // For other local files, return as is
  return src
}
