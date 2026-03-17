'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, Clock, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home',     icon: Home     },
  { href: '/log',       label: 'Log',      icon: Plus     },
  { href: '/history',   label: 'History',  icon: Clock    },
  { href: '/settings',  label: 'Settings', icon: Settings },
] as const

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 pb-16">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background">
        <div className="flex">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.5} />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
