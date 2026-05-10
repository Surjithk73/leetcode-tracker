import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, CalendarDays,
  FileText, MessageSquare, Settings, ChevronLeft, Zap, Building2,
  Database, Code, Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen sticky top-0 shrink-0 transition-all duration-300 border-r border-sidebar-border bg-sidebar',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-5 border-b border-sidebar-border', collapsed && 'justify-center px-0')}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-chart-1 shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-sidebar-foreground tracking-tight">LC Tracker</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-2 py-2.5 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center gap-2 px-4 py-4 border-t border-sidebar-border text-muted-foreground hover:text-sidebar-foreground transition-colors text-sm"
      >
        <ChevronLeft
          size={16}
          className={cn('transition-transform duration-300', collapsed && 'rotate-180')}
        />
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  )
}
