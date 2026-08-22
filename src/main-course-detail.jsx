import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CourseDetailPage from './CourseDetailPage.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <CourseDetailPage />
    </LanguageProvider>
  </StrictMode>,
)
