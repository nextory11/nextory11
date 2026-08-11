import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { clearLegacyOfflineState } from './lib/clearLegacyOfflineState.js'
import OfficialPreview from './official-site/OfficialPreview.jsx'
import { isOfficialSitePath } from './official-site/routing.js'

void clearLegacyOfflineState()

const RootExperience = isOfficialSitePath() && !window.location.hash ? OfficialPreview : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootExperience />
  </StrictMode>,
)
