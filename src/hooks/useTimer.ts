import { useEffect, useRef, useState, useCallback } from 'react'

export type TimerState = 'idle' | 'running' | 'paused' | 'done'

export function useTimer(durationSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds)
  const [state, setState] = useState<TimerState>('idle')
  const workerRef = useRef<Worker | null>(null)
  const secondsRef = useRef(durationSeconds)

  // Keep ref in sync
  useEffect(() => { secondsRef.current = secondsLeft }, [secondsLeft])

  // Reset when duration changes
  useEffect(() => {
    setSecondsLeft(durationSeconds)
    secondsRef.current = durationSeconds
    setState('idle')
  }, [durationSeconds])

  const stopWorker = useCallback(() => {
    workerRef.current?.postMessage({ type: 'stop' })
    workerRef.current?.terminate()
    workerRef.current = null
  }, [])

  const start = useCallback(() => {
    if (state === 'done') {
      setSecondsLeft(durationSeconds)
      secondsRef.current = durationSeconds
    }
    setState('running')
    const worker = new Worker(
      new URL('../workers/timer.worker.ts', import.meta.url),
      { type: 'module' }
    )
    workerRef.current = worker
    worker.onmessage = () => {
      const next = secondsRef.current - 1
      if (next <= 0) {
        setSecondsLeft(0)
        secondsRef.current = 0
        setState('done')
        stopWorker()
      } else {
        setSecondsLeft(next)
      }
    }
    worker.postMessage({ type: 'start' })
  }, [state, durationSeconds, stopWorker])

  const pause = useCallback(() => {
    stopWorker()
    setState('paused')
  }, [stopWorker])

  const resume = useCallback(() => {
    setState('running')
    const worker = new Worker(
      new URL('../workers/timer.worker.ts', import.meta.url),
      { type: 'module' }
    )
    workerRef.current = worker
    worker.onmessage = () => {
      const next = secondsRef.current - 1
      if (next <= 0) {
        setSecondsLeft(0)
        secondsRef.current = 0
        setState('done')
        stopWorker()
      } else {
        setSecondsLeft(next)
      }
    }
    worker.postMessage({ type: 'start' })
  }, [stopWorker])

  const reset = useCallback(() => {
    stopWorker()
    setSecondsLeft(durationSeconds)
    secondsRef.current = durationSeconds
    setState('idle')
  }, [durationSeconds, stopWorker])

  // Cleanup on unmount
  useEffect(() => () => stopWorker(), [stopWorker])

  const progress = 1 - secondsLeft / durationSeconds // 0 → 1

  return { secondsLeft, state, progress, start, pause, resume, reset }
}
