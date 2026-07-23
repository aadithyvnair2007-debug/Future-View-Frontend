import React, { useState } from 'react';

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
    
    // Send age ONLY on signup
    const payload = isSignup 
      ? { name, email, password, age: Number(age) } 
      : { email, password };

    try {
      const res = await fetch(`http://localhost:3010${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        onLoginSuccess(data.user);
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server connection error');
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalCardStyle}>
        <button onClick={onClose} style={closeBtnStyle}>✕</button>
        
        <h2 style={{ textAlign: 'center', textTransform: 'uppercase', marginBottom: '20px', fontSize: '20px', color: '#1e293b' }}>
          {isSignup ? 'Create Account' : 'Welcome Back'}
        </h2>

        <form onSubmit={handleSubmit} style={formStyle}>
          
          {/* ================= ONLY SHOWN IN SIGN UP ================= */}
          {isSignup && (
            <>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                style={inputStyle}
              />

              <input 
                type="number" 
                placeholder="Age" 
                value={age} 
                onChange={e => setAge(e.target.value)} 
                min="1"
                max="120"
                required 
                style={inputStyle}
              />
            </>
          )}

          {/* ================= SHOWN IN BOTH LOG IN & SIGN UP ================= */}
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            style={inputStyle}
          />

          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            style={inputStyle}
          />

          <button type="submit" style={submitBtnStyle}>
            {isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '14px', textAlign: 'center', color: '#64748b' }}>
          {isSignup ? 'Already have an account?' : 'New to Future View?'}{' '}
          <span 
            onClick={() => {
              setIsSignup(!isSignup);
              setName('');
              setAge('');
            }} 
            style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isSignup ? 'Log In' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
}

// ================= STYLES =================
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999
};

const modalCardStyle = {
  backgroundColor: '#ffffff',
  padding: '35px 30px',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '400px',
  position: 'relative',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
};

const closeBtnStyle = {
  position: 'absolute',
  top: '18px',
  right: '18px',
  border: 'none',
  background: 'none',
  fontSize: '18px',
  cursor: 'pointer',
  color: '#64748b'
};

const formStyle = { display: 'flex', flexDirection: 'column', gap: '14px' };
const inputStyle = { padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' };
const submitBtnStyle = { backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', marginTop: '6px' };