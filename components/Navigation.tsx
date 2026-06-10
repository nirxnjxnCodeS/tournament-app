'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

function HomeIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden><path d="M3 8.5L10 2l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V8.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M7.5 18V13h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
}
function TableIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden><rect x="2" y="4" width="16" height="2.5" rx="1" fill="currentColor" opacity=".4"/><rect x="2" y="8.75" width="16" height="2.5" rx="1" fill="currentColor" opacity=".7"/><rect x="2" y="13.5" width="16" height="2.5" rx="1" fill="currentColor"/></svg>
}
function FixturesIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden><rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M6 2v4M14 2v4M2 9h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
}
function BracketIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden><rect x="2" y="4" width="5" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="2" y="13" width="5" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="13" y="8.5" width="5" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/><path d="M7 5.5h3v4h3M7 14.5h3v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function AwardsIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden><path d="M10 13c-3.314 0-6-2.686-6-6V3h12v4c0 3.314-2.686 6-6 6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M4 5H2a1 1 0 00-1 1v1a3 3 0 003 3M16 5h2a1 1 0 011 1v1a3 3 0 01-3 3M10 13v4M7 17h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
}
function RulesIcon() {
  return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="10" cy="14" r="0.9" fill="currentColor"/></svg>
}
function AdminIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M2 14c0-3.314 2.686-4 6-4s6 .686 6 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}
function SunIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
}
function MoonIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M13.5 10A6 6 0 016 2.5a6 6 0 100 11 6 6 0 007.5-3.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
}

function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="size-7 rounded-lg" />
  const isDark = resolvedTheme === 'dark'
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="size-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-raised transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

function LogoLockup({ size }: { size: 'base' | 'lg' }) {
  return (
    <span className={size === 'lg' ? 'text-lg' : 'text-base'}>
      🏆{' '}
      <span className="font-bold text-accent">PES</span>
      <span className="font-normal text-text-muted"> Tournament</span>
    </span>
  )
}

const NAV_ITEMS: NavItem[] = [
  { href: '/',         label: 'Home',     icon: <HomeIcon />     },
  { href: '/table',    label: 'Table',    icon: <TableIcon />    },
  { href: '/fixtures', label: 'Fixtures', icon: <FixturesIcon /> },
  { href: '/bracket',  label: 'Bracket',  icon: <BracketIcon />  },
  { href: '/awards',   label: 'Awards',   icon: <AwardsIcon />   },
  { href: '/rules',    label: 'Rules',    icon: <RulesIcon />    },
]

interface NavigationProps { isAdmin: boolean }

export function Navigation({ isAdmin }: NavigationProps) {
  const pathname = usePathname()

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/share') ||
    pathname.startsWith('/result')
  ) return null

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-52 flex-col bg-surface border-r border-border z-30">
        <div className="px-5 py-5 border-b border-border shrink-0">
          <LogoLockup size="lg" />
        </div>

        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-l-2',
                  active ? 'text-accent bg-accent/8 border-accent' : 'text-text-muted hover:text-text hover:bg-surface-raised border-transparent',
                ].join(' ')}
              >
                {icon}{label}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-3 border-t border-border shrink-0 flex items-center justify-between">
          <ThemeToggle />
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text hover:bg-surface-raised transition-colors"
            >
              <AdminIcon />Admin
            </Link>
          )}
        </div>
      </aside>

      {/* Desktop spacer */}
      <div className="hidden md:block w-52 shrink-0" />

      {/* Mobile top header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-surface border-b border-border h-12 flex items-center justify-between px-4">
        <LogoLockup size="base" />
        <ThemeToggle />
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border flex">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors',
                active ? 'text-accent' : 'text-text-muted',
              ].join(' ')}
            >
              {icon}{label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
