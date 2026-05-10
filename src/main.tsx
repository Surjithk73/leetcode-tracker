import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Force dark mode always
document.documentElement.classList.add('dark')

// Pre-seed Gemini API key from env if not already set
const envKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
if (envKey && !localStorage.getItem('gemini_api_key')) {
  localStorage.setItem('gemini_api_key', envKey)
}
// Always set the model to the desired default on load
localStorage.setItem('gemini_model', 'gemini-3.1-flash-lite-preview')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
