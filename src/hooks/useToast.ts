import { useState, useCallback } from 'react'
import type { ToastData } from '@/components/ui/Toast'

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const toast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = crypto.randomUUID()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, toast, remove }
}
