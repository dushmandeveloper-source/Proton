import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ServicePage from './ServicePage.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <ServicePage serviceKey="healthcare" />
    </LanguageProvider>
  </StrictMode>,
)
