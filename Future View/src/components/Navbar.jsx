import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from "../Future-View.png";

const API_BASE = 'https://future-view.onrender.com';

export default function Navbar({ currentUser, onOpenAuth, onLogout, step, setStep }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Flexible check for admin user (handles 'admin', 'System Admin', 'superadmin', etc.)
  const isAdmin = Boolean(
    currentUser?.role?.toLowerCase().includes('admin') || 
    currentUser?.isAdmin === true || 
    currentUser?.is_admin === true ||
    currentUser?.name?.toLowerCase().includes('admin')
  );

  const handleHomeClick = () => {
    if (typeof setStep === 'function') setStep('intro');
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleExamsClick = () => {
    if (typeof setStep === 'function') setStep('select-exam');
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  return (
    <nav style={navContainerStyle}>
      <div style={navInnerStyle}>
        
        {/* ================= FAR LEFT: LOGO ================= */}
        <div style={brandStyle} onClick={handleHomeClick}>
          <img
            src={logo}
            alt="Future View"
            style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
          />
          <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '1.125rem', marginLeft: '10px', letterSpacing: '0.05em' }}>
            FUTURE VIEW
          </span>
        </div>

        {/* ================= FAR RIGHT: LINKS & ACTIONS ================= */}
        <div style={rightGroupStyle}>
          {currentUser ? (
            /* --- LOGGED IN STATE --- */
            <>
              {/* Common Links for All Users */}
              <button 
                type="button" 
                style={isActive('/') && step === 'intro' ? activeBtnStyle : linkBtnStyle} 
                onClick={handleHomeClick}
              >
                Home
              </button>

              <button 
                type="button" 
                style={isActive('/') && step === 'select-exam' ? activeBtnStyle : linkBtnStyle} 
                onClick={handleExamsClick}
              >
                Select Entrance Exam
              </button>

              {/* Student-Only Links (Hidden for Admin) */}
              {!isAdmin && (
                <>
                  <button 
                    type="button" 
                    style={isActive('/stream-matcher') ? activeBtnStyle : badgeBtnStyle('#059669')} 
                    onClick={() => navigate('/stream-matcher')}
                  >
                    🎓 Stream Matcher
                  </button>

                  <button 
                    type="button" 
                    style={isActive('/compare') ? activeBtnStyle : badgeBtnStyle('#2563eb')} 
                    onClick={() => navigate('/compare')}
                  >
                    ⚖️ Compare Courses
                  </button>

                  <button 
                    type="button" 
                    style={isActive('/saved') ? activeBtnStyle : badgeBtnStyle('#d97706')} 
                    onClick={() => navigate('/saved')}
                  >
                    ⭐ Saved
                  </button>
                </>
              )}

              {/* Admin Dashboard Button (Always shown for Admin users) */}
              {isAdmin && (
                <button 
                  type="button" 
                  style={isActive('/admin') ? activeBtnStyle : badgeBtnStyle('#4f46e5')} 
                  onClick={() => navigate('/admin')}
                >
                  Admin Dashboard
                </button>
              )}

              {/* User Greeting & Logout */}
              <div style={userSectionStyle}>
                <span 
                  style={{
                    ...userLabelStyle,
                    cursor: 'pointer',
                    textDecoration: isActive('/profile') ? 'underline' : 'none'
                  }}
                  onClick={() => navigate('/profile')}
                  title="Click to view & edit profile"
                >
                  Hi, {currentUser.name || currentUser.username || currentUser.email}
                </span>

                <button type="button" style={logoutBtnStyle} onClick={onLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            /* --- LOGGED OUT STATE --- */
            <button type="button" style={loginBtnStyle} onClick={onOpenAuth}>
              Login / Register
            </button>
          )}
        </div>

      </div>
    </nav>
  );
}

// ================= STYLES =================
const navContainerStyle = {
  backgroundColor: '#0f172a',
  height: '70px',
  width: '100%',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
  display: 'flex',
  alignItems: 'center',
  padding: '0 32px',
  boxSizing: 'border-box'
};

const navInnerStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center'
};

const brandStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  cursor: 'pointer',
  userSelect: 'none',
  flexShrink: 0
};

const rightGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginLeft: 'auto'
};

const userSectionStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: '12px',
  borderLeft: '1px solid #334155',
  paddingLeft: '14px',
  marginLeft: '6px'
};

const linkBtnStyle = { 
  background: 'none', 
  border: 'none', 
  color: '#cbd5e1', 
  fontWeight: '600', 
  fontSize: '14px', 
  cursor: 'pointer', 
  padding: '8px 12px',
  display: 'inline-flex',
  alignItems: 'center',
  whiteSpace: 'nowrap'
};

const activeBtnStyle = { 
  background: 'rgba(255,255,255,0.1)', 
  border: '1px solid rgba(255,255,255,0.2)', 
  color: '#ffffff', 
  borderRadius: '6px', 
  fontWeight: '700', 
  fontSize: '14px', 
  cursor: 'pointer', 
  padding: '8px 14px',
  display: 'inline-flex',
  alignItems: 'center',
  whiteSpace: 'nowrap'
};

const badgeBtnStyle = (bgColor) => ({ 
  backgroundColor: bgColor, 
  color: '#ffffff', 
  border: 'none', 
  padding: '8px 14px', 
  borderRadius: '6px', 
  fontWeight: '600', 
  fontSize: '13px', 
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  whiteSpace: 'nowrap'
});

const userLabelStyle = { 
  color: '#e2e8f0', 
  fontWeight: '600', 
  fontSize: '14px',
  whiteSpace: 'nowrap'
};

const logoutBtnStyle = { 
  backgroundColor: '#334155', 
  color: '#ffffff', 
  border: 'none', 
  padding: '8px 14px', 
  borderRadius: '6px', 
  fontWeight: '600', 
  fontSize: '13px', 
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  whiteSpace: 'nowrap'
};

const loginBtnStyle = { 
  backgroundColor: '#4f46e5', 
  color: '#ffffff', 
  border: 'none', 
  padding: '8px 18px', 
  borderRadius: '6px', 
  fontWeight: '700', 
  fontSize: '14px', 
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  whiteSpace: 'nowrap'
};