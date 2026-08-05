import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://future-view.onrender.com';

// Inline SVG Eye Icons
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

export default function ProfilePage({ currentUser, onUpdateUser }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Toggle state for password visibility
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser) {
      // Robust fallbacks for various user data formats
      const resolvedName = 
        currentUser.name || 
        currentUser.username || 
        currentUser.fullName || 
        currentUser.user?.name || 
        '';

      const resolvedEmail = 
        currentUser.email || 
        currentUser.user?.email || 
        '';

      const resolvedAge = 
        currentUser.age || 
        currentUser.user?.age || 
        '';

      setFormData((prev) => ({
        ...prev,
        name: resolvedName,
        email: resolvedEmail,
        age: resolvedAge,
      }));
    } else {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError('Please enter your current password to make password changes.');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          name: formData.name,
          age: formData.age,
          email: formData.email,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        }),
      });

      // Safely read response text first to prevent JSON parse errors on empty responses
      const responseText = await response.text();
      let data = {};
      
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseErr) {
        throw new Error(`Server returned an invalid response format (Status: ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Failed to update profile (Status: ${response.status})`);
      }

      setSuccess('Profile updated successfully!');
      
      if (onUpdateUser) {
        onUpdateUser(data.user || data);
      }

      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div style={pageContainerStyle}>
      <div style={cardStyle}>
        
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#ffffff' }}>Account Settings</h2>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>
            Update your personal details and security options
          </p>
        </div>

        {error && <div style={errorBannerStyle}>{error}</div>}
        {success && <div style={successBannerStyle}>{success}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          
          {/* PERSONAL INFORMATION SECTION */}
          <h3 style={sectionHeadingStyle}>Personal Information</h3>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              style={inputStyle}
              required
            />
          </div>

          <div style={gridTwoStyle}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                style={inputStyle}
                required
              />
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 18"
                min="10"
                max="120"
                style={inputStyle}
              />
            </div>
          </div>

          <hr style={dividerStyle} />

          {/* CHANGE PASSWORD SECTION */}
          <h3 style={sectionHeadingStyle}>Change Password</h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '-8px', marginBottom: '12px' }}>
            Leave blank if you do not wish to change your password.
          </p>

          {/* Current Password */}
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Current Password</label>
            <div style={inputContainerStyle}>
              <input
                type={showCurrentPass ? 'text' : 'password'}
                name="currentPassword"
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={handleChange}
                style={passwordInputStyle}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                style={eyeButtonStyle}
                title={showCurrentPass ? "Hide password" : "Show password"}
              >
                {showCurrentPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* New & Confirm Passwords */}
          <div style={gridTwoStyle}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>New Password</label>
              <div style={inputContainerStyle}>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  style={passwordInputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  style={eyeButtonStyle}
                  title={showNewPass ? "Hide password" : "Show password"}
                >
                  {showNewPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Confirm New Password</label>
              <div style={inputContainerStyle}>
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Re-enter new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={passwordInputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  style={eyeButtonStyle}
                  title={showConfirmPass ? "Hide password" : "Show password"}
                >
                  {showConfirmPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={buttonRowStyle}>
            <button 
              type="button" 
              onClick={() => navigate('/')} 
              style={cancelBtnStyle}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              style={saveBtnStyle}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// ================= STYLES =================
const pageContainerStyle = {
  minHeight: 'calc(100vh - 70px)',
  backgroundColor: '#0f172a',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '40px 20px',
  boxSizing: 'border-box'
};

const cardStyle = {
  backgroundColor: '#1e293b',
  borderRadius: '12px',
  padding: '32px',
  width: '100%',
  maxWidth: '650px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
  color: '#f8fafc'
};

const headerStyle = {
  borderBottom: '1px solid #334155',
  paddingBottom: '16px',
  marginBottom: '24px'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const sectionHeadingStyle = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#818cf8',
  margin: '8px 0 4px 0'
};

const fieldGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const gridTwoStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px'
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#cbd5e1'
};

const inputStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '10px 14px',
  color: '#ffffff',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};

const inputContainerStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '100%'
};

const passwordInputStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: '8px',
  padding: '10px 42px 10px 14px',
  color: '#ffffff',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};

const eyeButtonStyle = {
  position: 'absolute',
  right: '12px',
  background: 'none',
  border: 'none',
  color: '#94a3b8',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2px',
  borderRadius: '4px',
  transition: 'color 0.2s ease'
};

const dividerStyle = {
  border: 'none',
  borderTop: '1px solid #334155',
  margin: '16px 0'
};

const buttonRowStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '16px'
};

const saveBtnStyle = {
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  border: 'none',
  padding: '10px 24px',
  borderRadius: '8px',
  fontWeight: '600',
  fontSize: '14px',
  cursor: 'pointer'
};

const cancelBtnStyle = {
  backgroundColor: 'transparent',
  color: '#94a3b8',
  border: '1px solid #334155',
  padding: '10px 20px',
  borderRadius: '8px',
  fontWeight: '600',
  fontSize: '14px',
  cursor: 'pointer'
};

const errorBannerStyle = {
  backgroundColor: '#451a1a',
  border: '1px solid #7f1d1d',
  color: '#fca5a5',
  padding: '12px',
  borderRadius: '8px',
  fontSize: '14px',
  marginBottom: '16px'
};

const successBannerStyle = {
  backgroundColor: '#14532d',
  border: '1px solid #166534',
  color: '#86efac',
  padding: '12px',
  borderRadius: '8px',
  fontSize: '14px',
  marginBottom: '16px'
};