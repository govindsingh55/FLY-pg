import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import IconByName from '@/components/marketing/IconByName'

interface Feature {
  id: string
  title: string
  subtitle?: string
  description?: string
  icon?: string
  accent?: 'primary' | 'secondary' | 'success' | 'warning'
}

interface FeaturesSectionProps {
  title: string
  subtitle?: string
  features: Feature[]
  columns?: 2 | 3 | 4
  className?: string
}

export default function FeaturesSection({
  title,
  subtitle,
  features,
  columns = 3,
  className = '',
}: FeaturesSectionProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }

  const accentColors = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
  }

  return (
    <section className={`py-16 bg-muted/30 ${className}`}>
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          {subtitle && <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
        </div>

        <div className={`grid gap-8 ${gridCols[columns]}`}>
          {features.map((feature, index) => (
            <Card
              key={feature.id}
              className="border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader className="text-center">
                <div
                  className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    feature.accent ? accentColors[feature.accent] : 'bg-primary/10 text-primary'
                  }`}
                >
                  {feature.icon ? (
                    <IconByName name={feature.icon} className="h-8 w-8" />
                  ) : (
                    <div className="w-8 h-8 bg-current rounded-full opacity-20" />
                  )}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                {feature.subtitle && (
                  <CardDescription className="font-medium text-primary">
                    {feature.subtitle}
                  </CardDescription>
                )}
              </CardHeader>
              {feature.description && (
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
