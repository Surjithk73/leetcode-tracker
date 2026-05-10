// Web Worker — sends a tick every second regardless of tab visibility
let interval: ReturnType<typeof setInterval> | null = null

self.onmessage = (e: MessageEvent<{ type: 'start' | 'stop' }>) => {
  if (e.data.type === 'start') {
    if (interval) clearInterval(interval)
    interval = setInterval(() => self.postMessage({ type: 'tick' }), 1000)
  } else if (e.data.type === 'stop') {
    if (interval) clearInterval(interval)
    interval = null
  }
}
