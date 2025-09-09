import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface CTAAction {
  label: string
  icon?: LucideIcon
  variant?: 'default' | 'secondary' | 'outline'
  onClick?: () => void
  href?: string
}

interface ContactCTASectionProps {
  title: string
  description?: string
  actions: CTAAction[]
  variant?: 'primary' | 'secondary' | 'gradient'
  className?: string
}

export default function ContactCTASection({
  title,
  description,
  actions,
  variant = 'primary',
  className = '',
}: ContactCTASectionProps) {
  const variantStyles = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    gradient: 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground',
  }

  const buttonVariants = {
    primary: {
      default: 'bg-white text-primary hover:bg-white/90',
      secondary: 'bg-white/20 text-white hover:bg-white/30',
      outline: 'border-white text-white hover:bg-white hover:text-primary',
    },
    secondary: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-primary/20 text-primary hover:bg-primary/30',
      outline: 'border-primary text-primary hover:bg-primary hover:text-primary-foreground',
    },
    gradient: {
      default: 'bg-white text-primary hover:bg-white/90',
      secondary: 'bg-white/20 text-white hover:bg-white/30',
      outline: 'border-white text-white hover:bg-white hover:text-primary',
    },
  }

  return (
    <section className={`py-16 ${variantStyles[variant]} ${className}`}>
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        {description && <p className="text-lg mb-8 opacity-90">{description}</p>}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {actions.map((action, index) => {
            const buttonVariant = action.variant || 'default'
            const buttonStyle = buttonVariants[variant][buttonVariant]

            if (action.href) {
              return (
                <Button
                  key={index}
                  size="lg"
                  variant={buttonVariant === 'outline' ? 'outline' : 'default'}
                  className={buttonStyle}
                  asChild
                >
                  <a
                    href={action.href}
                    target={action.href.startsWith('http') ? '_blank' : '_self'}
                    rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {action.icon && <action.icon className="mr-2 h-5 w-5" />}
                    {action.label}
                  </a>
                </Button>
              )
            }

            return (
              <Button
                key={index}
                size="lg"
                variant={buttonVariant === 'outline' ? 'outline' : 'default'}
                className={buttonStyle}
                onClick={action.onClick}
              >
                {action.icon && <action.icon className="mr-2 h-5 w-5" />}
                {action.label}
              </Button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
