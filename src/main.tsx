import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { setYupLocalePtBr } from './lib/validation'
import './index.css'
import App from './App.tsx'

setYupLocalePtBr()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
