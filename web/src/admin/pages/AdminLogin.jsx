import React, { useState } from 'react';
import { C } from '../lib/theme';
import { Btn } from '../components/ui';

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, any password works or we can set a simple one
    if (password === 'admin') {
      onLogin();
    } else {
      alert('Incorrect password. (Try "admin")');
    }
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
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: C.muted }}>Password</label>
          <input 
            type="password" 
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
        <Btn variant="primary" style={{ width: '100%' }}>Login</Btn>
      </form>
    </div>
  );
}
