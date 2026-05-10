import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileMenu from './MobileMenu'
import TimerFAB from '@/components/timer/TimerFAB'

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pt-16 md:pt-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile hamburger menu — hidden on desktop */}
      <MobileMenu />

      {/* Timer FAB */}
      <TimerFAB />
    </div>
  )
}
