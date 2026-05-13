import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

document.documentElement.classList.add('dark')

localStorage.setItem('gemini_model', 'gemini-3.1-flash-lite-preview')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
