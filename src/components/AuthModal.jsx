import React, { useState } from 'react';

const API_BASE = 'https://future-view.onrender.com';

export default function AuthModal({ isOpen = true, onClose, onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignup ? `${API_BASE}/api/auth/signup` : `${API_BASE}/api/auth/login`;

    const payload = isSignup 
      ? { name, email, password, age: Number(age) } 
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Check if response is valid JSON before parsing
      const contentType = res.headers.get('content-type');
      let data = null;

      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        throw new Error(`Server returned status ${res.status} (${res.statusText}). The backend may be starting up or offline.`);
      }

      if (res.ok) {
        localStorage.setItem('token', data.token);
        onLoginSuccess(data.user);
        onClose();
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Server connection error');
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button type="button" style={closeBtnStyle} onClick={onClose}>×</button>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#0f172a' }}>
          {isSignup ? 'CREATE ACCOUNT' : 'WELCOME BACK'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {isSignup && (
            <>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                style={inputStyle}
              />
              <input 
                type="number" 
                placeholder="Age" 
                value={age} 
                onChange={(e) => setAge(e.target.value)} 
                required 
                style={inputStyle}
              />
            </>
          )}
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={inputStyle}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={inputStyle}
          />

          <button type="submit" style={submitBtnStyle}>
            {isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px', color: '#64748b' }}>
          {isSignup ? 'Already have an account?' : 'New to Future View?'}{' '}
          <span 
            style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: '600' }} 
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? 'Log In' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
}

// Styles
const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle = { backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '400px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const closeBtnStyle = { position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' };
const inputStyle = { padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', color: '#0f172a' };
const submitBtnStyle = { backgroundColor: '#4f46e5', color: '#ffffff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer' };