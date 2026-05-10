import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, CalendarDays,
  FileText, MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/',            icon: LayoutDashboard, label: 'Home' },
  { to: '/log',         icon: BookOpen,         label: 'Log' },
  { to: '/planner',     icon: CalendarDays,     label: 'Plan' },
  { to: '/cheatsheets', icon: FileText,         label: 'Sheets' },
  { to: '/chat',        icon: MessageSquare,    label: 'AI' },
]

export default function TopNav() {
  return (
    <header className="md:hidden sticky top-0 z-50 w-full border-b border-border bg-sidebar">
      <nav className="flex items-center justify-around h-14">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors min-w-[44px]',
                isActive
                  ? 'text-sidebar-primary'
                  : 'text-muted-foreground'
              )
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
