import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import Admin from './admin/Admin.jsx'
import AdminLogin from './admin/pages/AdminLogin.jsx'
import Customer from './customer/Customer.jsx'
import { supabase } from './admin/lib/supabase'

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#08060d', color: '#fff' }}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Side */}
        <Route path="/" element={<Customer />} />

        {/* Admin Side */}
        <Route
          path="/admin"
          element={
            session ? (
              <Admin />
            ) : (
              <AdminLogin onLogin={() => { }} />
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
