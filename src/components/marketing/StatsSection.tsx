import { Card, CardContent } from '@/components/ui/card'

interface Stat {
  id: string
  value: string
  label: string
  sublabel?: string
}

interface StatsSectionProps {
  stats: Stat[]
  variant?: 'default' | 'floating' | 'minimal'
  className?: string
}

export default function StatsSection({
  stats,
  variant = 'default',
  className = '',
}: StatsSectionProps) {
  const variantStyles = {
    default: 'py-8 bg-background/95 backdrop-blur-sm',
    floating: 'py-8 bg-background/95 backdrop-blur-sm -mt-16 relative z-10',
    minimal: 'py-12',
  }

  const cardStyles = {
    default: 'border-0 shadow-lg',
    floating: 'border-0 shadow-lg',
    minimal: 'border-0 shadow-none bg-transparent',
  }

  return (
    <section className={`${variantStyles[variant]} ${className}`}>
      <div className="mx-auto max-w-8xl px-6">
        <Card className={cardStyles[variant]}>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat) => (
                <div key={stat.id} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                  {stat.sublabel && (
                    <div className="text-xs text-muted-foreground/70 mt-1">{stat.sublabel}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
