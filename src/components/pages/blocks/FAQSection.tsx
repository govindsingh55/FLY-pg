import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RichText } from '@/components/RichText'

interface FAQ {
  question: string
  answer: unknown
}

interface FAQSectionProps {
  title: string
  subtitle?: string
  faqs: FAQ[]
  layout?: 'accordion' | 'grid' | 'list'
  // Enhanced styling options
  backgroundColor?: 'transparent' | 'background' | 'muted' | 'primary' | 'secondary'
  textAlignment?: 'left' | 'center' | 'right'
  padding?: 'small' | 'default' | 'large' | 'xl'
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full'
  showBorder?: boolean
}

export function FAQSection({
  title,
  subtitle,
  faqs,
  layout = 'accordion',
  backgroundColor = 'transparent',
  textAlignment = 'center',
  padding = 'default',
  maxWidth = 'default',
  showBorder = false,
}: FAQSectionProps) {
  const backgroundStyles = {
    transparent: 'bg-transparent',
    background: 'bg-background',
    muted: 'bg-muted',
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
  }

  const textAlignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  const paddingStyles = {
    small: 'py-8',
    default: 'py-16',
    large: 'py-20',
    xl: 'py-24',
  }

  const maxWidthStyles = {
    narrow: 'max-w-2xl',
    default: 'max-w-4xl',
    wide: 'max-w-6xl',
    full: 'max-w-none',
  }

  const borderStyles = showBorder ? 'border border-border rounded-lg' : ''
  if (layout === 'accordion') {
    return (
      <section className={`${paddingStyles[padding]} px-4 ${backgroundStyles[backgroundColor]}`}>
        <div className={`${maxWidthStyles[maxWidth]} mx-auto`}>
          {showBorder ? (
            <div className={borderStyles}>
              <div className="p-8">
                <div className={`${textAlignStyles[textAlignment]} mb-12`}>
                  <h2 className="text-3xl font-bold mb-4">{title}</h2>
                  {subtitle && (
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
                  )}
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent>
                        <RichText data={faq.answer as any} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ) : (
            <>
              <div className={`${textAlignStyles[textAlignment]} mb-12`}>
                <h2 className="text-3xl font-bold mb-4">{title}</h2>
                {subtitle && (
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
                )}
              </div>

              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      <RichText data={faq.answer as any} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </>
          )}
        </div>
      </section>
    )
  }

  if (layout === 'grid') {
    return (
      <section className={`${paddingStyles[padding]} px-4 ${backgroundStyles[backgroundColor]}`}>
        <div className={`${maxWidthStyles[maxWidth]} mx-auto`}>
          {showBorder ? (
            <div className={borderStyles}>
              <div className="p-8">
                <div className={`${textAlignStyles[textAlignment]} mb-12`}>
                  <h2 className="text-3xl font-bold mb-4">{title}</h2>
                  {subtitle && (
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
                  )}
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {faqs.map((faq, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <RichText data={faq.answer as any} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={`${textAlignStyles[textAlignment]} mb-12`}>
                <h2 className="text-3xl font-bold mb-4">{title}</h2>
                {subtitle && (
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
                )}
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {faqs.map((faq, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RichText data={faq.answer as any} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    )
  }

  // List layout
  return (
    <section className={`${paddingStyles[padding]} px-4 ${backgroundStyles[backgroundColor]}`}>
      <div className={`${maxWidthStyles[maxWidth]} mx-auto`}>
        {showBorder ? (
          <div className={borderStyles}>
            <div className="p-8">
              <div className={`${textAlignStyles[textAlignment]} mb-12`}>
                <h2 className="text-3xl font-bold mb-4">{title}</h2>
                {subtitle && (
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
                )}
              </div>

              <div className="space-y-8">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b pb-6">
                    <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                    <RichText data={faq.answer as any} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={`${textAlignStyles[textAlignment]} mb-12`}>
              <h2 className="text-3xl font-bold mb-4">{title}</h2>
              {subtitle && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
              )}
            </div>

            <div className="space-y-8">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b pb-6">
                  <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                  <RichText data={faq.answer as any} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
