import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from 'C:/Users/lenovo/Desktop/ICT/project/Frontend/src/Future-View.png';

export default function Navbar({ currentUser, onOpenAuth, onLogout, setStep }) {
  const navigate = useNavigate();

  const handleNavClick = (targetStep) => {
    if (setStep) setStep(targetStep);
    navigate('/');
  };

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin' || currentUser?.name === 'System Admin';

  return (
    <nav style={navStyle}>
      {/* BRAND / LOGO */}
      <div style={logoContainerStyle} onClick={() => handleNavClick('intro')}>
        <img 
          src={logoImg} 
          alt="Future View Logo" 
          style={logoImgStyle}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <span style={logoTextStyle}>Future View</span>
      </div>

      {/* NAV LINKS */}
      <div style={navActionsStyle}>
        <button style={navLinkStyle} onClick={() => handleNavClick('intro')}>
          Home
        </button>

        <button style={navLinkStyle} onClick={() => handleNavClick('select-exam')}>
          Select Entrance Exam
        </button>

        {/* ADMIN DASHBOARD BUTTON (Visible only to Admin) */}
        {isAdmin && (
          <button style={adminBtnStyle} onClick={() => navigate('/admin')}>
            ⚙️ Admin Dashboard
          </button>
        )}

        {/* AUTH BUTTONS */}
        {currentUser ? (
          <>
            <span style={{ color: '#ffffff', fontWeight: '600', fontSize: '14px' }}>
              Hi, {currentUser.name || 'User'}
            </span>
            <button onClick={onLogout} style={logoutBtnStyle}>
              Logout
            </button>
          </>
        ) : (
          <button onClick={onOpenAuth} style={loginBtnStyle}>
            Login / Register
          </button>
        )}
      </div>
    </nav>
  );
}

// ================= STYLES =================
const navStyle = { height: '65px', backgroundColor: '#1b1e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', borderBottom: '1px solid #2d3248' };
const logoContainerStyle = { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' };
const logoImgStyle = { height: '36px', width: 'auto', objectFit: 'contain' };
const logoTextStyle = { fontSize: '20px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.3px' };
const navActionsStyle = { display: 'flex', alignItems: 'center', gap: '20px' };
const navLinkStyle = { background: 'none', border: 'none', color: '#cbd5e1', fontWeight: '500', fontSize: '14px', cursor: 'pointer' };
const adminBtnStyle = { backgroundColor: '#8b5cf6', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' };
const loginBtnStyle = { backgroundColor: '#6366f1', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' };
const logoutBtnStyle = { backgroundColor: '#334155', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' };