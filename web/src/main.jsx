import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Admin from './admin/Admin.jsx'
import AdminLogin from './admin/pages/AdminLogin.jsx'
import Customer from './customer/Customer.jsx'

function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Side */}
        <Route path="/" element={<Customer />} />

        {/* Admin Side */}
        <Route 
          path="/admin" 
          element={
            isAdminAuthenticated ? (
              <Admin />
            ) : (
              <AdminLogin onLogin={() => setIsAdminAuthenticated(true)} />
            )
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
