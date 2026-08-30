import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import UniversityDetailPage from './UniversityDetailPage.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <UniversityDetailPage />
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
)
