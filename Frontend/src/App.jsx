import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import BrowsePapers from './pages/BrowsePapers';
import FacultyDashboard from './pages/FacultyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ToastProvider from './components/ToastProvider';
import Footer from './components/Footer';
import { Award } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [, setToken] = useState('');
  const [view, setView] = useState('default'); // 'default', 'faculty', 'admin', 'browse'

  // Load active session from storage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        if (parsed.role === 'Admin') {
          setView('admin');
        } else if (parsed.role === 'Faculty') {
          setView('faculty');
        } else {
          setView('browse');
        }
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLoginSuccess = (loggedInUser, userToken) => {
    setUser(loggedInUser);
    setToken(userToken);
    if (loggedInUser.role === 'Admin') {
      setView('admin');
    } else if (loggedInUser.role === 'Faculty') {
      setView('faculty');
    } else {
      setView('browse');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken('');
    setView('default');
  };

  // If no logged in user, show Login Screen
  if (!user) {
    return (
      <ToastProvider>
        <Login onLoginSuccess={handleLoginSuccess} />
      </ToastProvider>
    );
  }

  const pageContent = (
    <>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* User Session Bar */}
        <div className="app-navbar" style={{ backgroundColor: '#1e293b', color: '#f8fafc', padding: '0.45rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span>Logged in as: <strong>{user.fullName || user.email}</strong></span>
            <span style={{ backgroundColor: user.role === 'Admin' ? 'rgba(239, 68, 68, 0.25)' : user.role === 'Faculty' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.25)', color: user.role === 'Admin' ? '#fca5a5' : user.role === 'Faculty' ? '#6ee7b7' : '#60a5fa', padding: '0.15rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>
              {user.role}
            </span>
            {user.role === 'Student' && (
              <span style={{ backgroundColor: '#fffbeb', color: '#b45309', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Award size={12} /> {user.reputationPoints || 0} Rep Points
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {user.role === 'Admin' && (
              <button
                type="button"
                onClick={() => setView(view === 'admin' ? 'browse' : 'admin')}
                style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', padding: '0.25rem 0.4rem' }}
              >
                {view === 'admin' ? '← Student View' : '⚙️ Admin Console'}
              </button>
            )}

            {user.role === 'Faculty' && (
              <button
                type="button"
                onClick={() => setView(view === 'faculty' ? 'browse' : 'faculty')}
                style={{ background: 'none', border: 'none', color: '#6ee7b7', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', padding: '0.25rem 0.4rem' }}
              >
                {view === 'faculty' ? '← Student View' : '👨‍🏫 Faculty Moderation'}
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              style={{ background: 'none', border: '1px solid #475569', color: '#cbd5e1', padding: '0.2rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
            >
              Log Out
            </button>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {view === 'admin' && user.role === 'Admin' ? (
            <AdminDashboard onSwitchToStudentPortal={() => setView('browse')} />
          ) : view === 'faculty' && user.role === 'Faculty' ? (
            <FacultyDashboard onSwitchToStudentPortal={() => setView('browse')} />
          ) : (
            <BrowsePapers onSwitchToAdmin={user.role === 'Admin' ? () => setView('admin') : user.role === 'Faculty' ? () => setView('faculty') : null} />
          )}
        </div>

        <Footer />
      </div>
    </>
  );

  return <ToastProvider>{pageContent}</ToastProvider>;
}

export default App;
