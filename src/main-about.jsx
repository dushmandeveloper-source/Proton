import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AboutPage from './AboutPage.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <AboutPage />
    </LanguageProvider>
  </StrictMode>,
)
