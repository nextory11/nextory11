import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { clearLegacyOfflineState } from './lib/clearLegacyOfflineState.js'
import OfficialPreview from './official-site/OfficialPreview.jsx'
import { isOfficialSitePath } from './official-site/routing.js'

void clearLegacyOfflineState()

const isDevelopmentResultPreview = import.meta.env.DEV && (
  window.location.search.includes('devPreview=result')
  || /^\/result-review(?:\/|$)/.test(window.location.pathname)
)

const RootExperience = isOfficialSitePath() && !window.location.hash && !isDevelopmentResultPreview
  ? OfficialPreview
  : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootExperience />
  </StrictMode>,
)
