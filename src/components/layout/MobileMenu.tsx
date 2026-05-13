import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X, LayoutDashboard, BookOpen, CalendarDays, FileText, MessageSquare, Building2, Settings, Zap, Database, Code, Layers, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

const NAV_ITEMS = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/log',         icon: BookOpen,         label: 'Question Log' },
  { to: '/planner',     icon: CalendarDays,     label: 'Planner' },
  { to: '/companies',   icon: Building2,        label: 'Companies' },
  { to: '/data',        icon: Database,         label: 'Data' },
  { to: '/snippets',    icon: Code,             label: 'Snippets' },
  { to: '/flashcards',  icon: Layers,           label: 'Flashcards' },
  { to: '/cheatsheets', icon: FileText,         label: 'Cheat Sheets' },
  { to: '/chat',        icon: MessageSquare,    label: 'AI Chat' },
  { to: '/settings',    icon: Settings,         label: 'Settings' },
]

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { user, signOut } = useAuth()
  const email = user?.email ?? ''
  const initial = email.charAt(0).toUpperCase()

  // Close on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div className="md:hidden">
      {/* Hamburger button — fixed top-right */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed top-4 right-4 z-[60] w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground shadow-lg transition-colors hover:bg-muted/40"
        aria-label="Toggle menu"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Dropdown panel — slides down from top */}
      <div className={cn(
        'fixed top-0 left-0 right-0 z-[58] bg-sidebar border-b border-sidebar-border shadow-2xl transition-all duration-300 ease-in-out',
        open ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      )}>
        {/* App header inside menu */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-chart-1 flex items-center justify-center shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-sidebar-foreground">LC Tracker</span>
        </div>

        {/* Nav items */}
        <nav className="px-3 py-3 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <Icon size={18} className="shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        {/* User info + logout */}
        <div className="px-5 py-4 border-t border-sidebar-border flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-bold text-sidebar-primary-foreground shrink-0">
            {initial}
          </div>
          <p className="text-sm font-medium text-sidebar-foreground truncate flex-1">{email}</p>
          <button
            onClick={signOut}
            className="text-muted-foreground hover:text-sidebar-foreground transition-colors"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
