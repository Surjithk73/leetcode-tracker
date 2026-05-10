import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, X } from 'lucide-react'

export interface ToastData {
  id: string
  message: string
  type: 'success' | 'error'
}

interface Props {
  toasts: ToastData[]
  onRemove: (id: string) => void
}

export default function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm font-medium transition-all duration-300',
        toast.type === 'success'
          ? 'bg-card border-chart-2/40 text-chart-2'
          : 'bg-card border-chart-5/40 text-chart-5',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
    >
      {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
      <span className="text-foreground">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="ml-1 text-muted-foreground hover:text-foreground">
        <X size={14} />
      </button>
    </div>
  )
}
