'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-background pb-16 md:pb-0">
      <div className="mx-auto max-w-8xl px-4 py-8">
        <div className="grid gap-6 grid-cols-3 md:grid-cols-4 justify-center items-center text-center">
          <div className="col-span-3 md:col-span-1">
            <div className="flex items-end gap-2 justify-center">
              <span className="text-2xl font-bold tracking-wide hover:text-primary">FLY</span>
              <span className="text-sm font-medium text-accent">colive</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Flexible, community-first living across major cities.
            </p>
            <div className="mt-4">
              <p className="text-sm font-semibold text-primary">Call us now</p>
              <a
                href="tel:7678688964"
                className="text-lg font-bold text-primary hover:text-primary/80 transition-colors"
              >
                7678688964
              </a>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold">Product</div>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>
                <Link href="#">Features</Link>
              </li>
              <li>
                <Link href="#">Pricing</Link>
              </li>
              <li>
                <Link href="#">Mobile App</Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold">Company</div>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>
                <Link href="/about-us">About</Link>
              </li>
              <li>
                <Link href="#">Careers</Link>
              </li>
              <li>
                <Link href="#">Contact</Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold">Legal</div>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>
                <Link href="#">Privacy</Link>
              </li>
              <li>
                <Link href="#">Terms</Link>
              </li>
              <li>
                <Link href="#">Cookies</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 border-t pt-4 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} FLY colive</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
