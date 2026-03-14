import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CatsyCoffeeAdmin from './admin/Admin.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CatsyCoffeeAdmin />
  </StrictMode>,
)
