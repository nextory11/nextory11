import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { clearLegacyOfflineState } from './lib/clearLegacyOfflineState.js'

void clearLegacyOfflineState()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
