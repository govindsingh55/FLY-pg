'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import * as Lucide from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ShareButtonProps {
  propertyName?: string
  className?: string
}

export default function ShareButton({ propertyName, className }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getCurrentUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href
    }
    return ''
  }

  const shareTitle = propertyName ? `Check out ${propertyName}` : 'Check out this property'
  const shareText = propertyName
    ? `I found this amazing property: ${propertyName}`
    : 'Check out this property'

  const handleNativeShare = async () => {
    const url = getCurrentUrl()
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: url,
        })
        setIsOpen(false)
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled or failed:', err)
      }
    }
  }

  const handleCopyLink = async () => {
    const url = getCurrentUrl()
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
      setIsOpen(false)
    } catch (_err) {
      toast.error('Failed to copy link. Please try again.')
    }
  }

  const handleWhatsAppShare = () => {
    const url = getCurrentUrl()
    const text = encodeURIComponent(`${shareText}\n${url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
    setIsOpen(false)
  }

  const handleTelegramShare = () => {
    const url = getCurrentUrl()
    const text = encodeURIComponent(shareText)
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, '_blank')
    setIsOpen(false)
  }

  const handleEmailShare = () => {
    const url = getCurrentUrl()
    const subject = encodeURIComponent(shareTitle)
    const body = encodeURIComponent(`${shareText}\n\n${url}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
    setIsOpen(false)
  }

  // Check if native share is available
  const hasNativeShare = typeof navigator !== 'undefined' && navigator.share

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={className} aria-label="Share property">
          <Lucide.Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {hasNativeShare && (
          <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer">
            <Lucide.Share2 className="mr-2 h-4 w-4" />
            Share...
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          <Lucide.Copy className="mr-2 h-4 w-4" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsAppShare} className="cursor-pointer">
          <Lucide.MessageCircle className="mr-2 h-4 w-4" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTelegramShare} className="cursor-pointer">
          <Lucide.Send className="mr-2 h-4 w-4" />
          Telegram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEmailShare} className="cursor-pointer">
          <Lucide.Mail className="mr-2 h-4 w-4" />
          Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
