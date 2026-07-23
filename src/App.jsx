import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import View from './components/View';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';

export default function App() {
  const navigate = useNavigate();

  // 1. Initialize currentUser from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [showAuthModal, setShowAuthModal] = useState(false);

  // 2. Lift step state to App level so Navbar and View stay synchronized
  const [step, setStep] = useState('intro');

  // 3. Keep localStorage synced whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setStep('intro');
    navigate('/'); // Smooth client-side navigation instead of hard reload
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.isAdmin === true;

  return (
    <div>
      {/* NAVBAR WITH STEP CONTROL */}
      <Navbar 
        currentUser={currentUser} 
        onOpenAuth={() => setShowAuthModal(true)} 
        onLogout={handleLogout} 
        step={step}
        setStep={setStep}
      />

      <Routes>
        {/* MAIN USER VIEW */}
        <Route 
          path="/" 
          element={
            <View 
              currentUser={currentUser} 
              onOpenAuth={() => setShowAuthModal(true)} 
              step={step}
              setStep={setStep}
            />
          } 
        />

        {/* PROTECTED ADMIN ROUTE */}
        <Route 
          path="/admin" 
          element={
            isAdmin ? (
              <AdminDashboard currentUser={currentUser} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      </Routes>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
          }} 
        />
      )}
    </div>
  );
}