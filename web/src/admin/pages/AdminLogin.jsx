import React, { useState } from 'react';
import { C } from '../lib/theme';
import { Btn } from '../components/ui';
import { supabase } from '../lib/supabase';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else if (data.session) {
      onLogin();
    }

    setLoading(false);
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: C.bg,
      color: C.fg
    }}>
      <form onSubmit={handleSubmit} style={{
        background: C.sidebar,
        padding: '2rem',
        borderRadius: '8px',
        border: `1px solid ${C.border}`,
        width: '320px'
      }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Admin Login</h2>

        {errorMsg && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.5rem',
            background: C.redBg,
            color: C.red,
            border: `1px solid ${C.redBorder}`,
            borderRadius: '4px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: C.muted }}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: C.input,
              border: `1px solid ${C.borderMd}`,
              borderRadius: '4px',
              color: C.fg
            }}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: C.muted }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: C.input,
              border: `1px solid ${C.borderMd}`,
              borderRadius: '4px',
              color: C.fg
            }}
          />
        </div>
        <Btn variant="primary" style={{ width: '100%' }}>
          {loading ? 'Signing in...' : 'Login'}
        </Btn>
      </form>
    </div>
  );
}
