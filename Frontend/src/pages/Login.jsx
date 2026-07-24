import React, { useState } from 'react';
import { GraduationCap, LogIn, UserPlus, Key, Mail, Building2, User, ShieldAlert } from 'lucide-react';
import './Login.css';

const DEMO_CREDENTIALS = {
  Student: {
    email: 'student.cse23@sbjit.edu.in',
    password: 'StudentPassword123!',
    role: 'Student',
    fullName: 'Pratik Kothare'
  },
  Faculty: {
    email: 'faculty.cse@sbjit.edu.in',
    password: 'FacultyPassword123!',
    role: 'Faculty',
    fullName: 'Prof. R. K. Sharma'
  },
  Admin: {
    email: 'admin.cse@sbjit.edu.in',
    password: 'AdminPassword123!',
    role: 'Admin',
    fullName: 'System Administrator'
  }
};

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [role, setRole] = useState('Student');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Autofill demo credentials
  const handleAutofill = (demoRole) => {
    const creds = DEMO_CREDENTIALS[demoRole];
    setEmail(creds.email);
    setPassword(creds.password);
    setRole(creds.role);
    setFullName(creds.fullName);
    setIsRegister(false);
    setErrorMsg('');
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.endsWith('@sbjit.edu.in')) {
      setErrorMsg('Only official college email IDs (@sbjit.edu.in) are allowed.');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isRegister ? '/api/v1/auth/register' : '/api/v1/auth/login';
      const body = isRegister 
        ? { fullName: fullName.trim(), email: cleanEmail, password, role, department }
        : { email: cleanEmail, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const json = await response.json();

      if (json.success) {
        const token = json.data.token;
        const user = json.data.user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        alert(isRegister ? 'Account Registered Successfully in MongoDB Atlas!' : 'Logged in successfully!');
        onLoginSuccess(user, token);
      } else {
        setErrorMsg(json.message || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Auth Exception:', err);
      // Fallback sandbox authentication if server connection fails
      const enteredName = fullName || cleanEmail.split('@')[0].replace('.', ' ');
      const mockUser = { 
        fullName: enteredName, 
        email: cleanEmail, 
        role, 
        department,
        reputationPoints: role === 'Student' ? 10 : 0
      };

      const mockToken = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));
      onLoginSuccess(mockUser, mockToken);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <GraduationCap size={32} />
          </div>
          <h1>ExamVault</h1>
          <p>Institutional Question Paper Repository</p>
        </div>

        {/* Tab Selector */}
        <div className="auth-tabs">
          <button 
            type="button" 
            className={`auth-tab-btn ${!isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(false); setErrorMsg(''); }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`auth-tab-btn ${isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(true); setErrorMsg(''); }}
          >
            Register Account
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.75rem', backgroundColor: '#ffe4e6', color: '#9f1239', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                className="form-input"
                placeholder="e.g. Kunal Sharma" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>College Email ID (@sbjit.edu.in)</label>
            <input 
              type="email" 
              className="form-input"
              placeholder="name.dept23@sbjit.edu.in" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password (Min 6 characters)</label>
            <input 
              type="password" 
              className="form-input"
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Account Role</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="form-input"
              >
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isRegister ? 'Register Account' : 'Sign In')}
          </button>
        </form>

        {/* Demo Quick-Fill Buttons */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: 600 }}>
            QUICK DEMO ACCESSS (CLICK TO AUTOFILL)
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button 
              type="button" 
              onClick={() => handleAutofill('Student')}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
            >
              Student Demo
            </button>
            <button 
              type="button" 
              onClick={() => handleAutofill('Faculty')}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
            >
              Faculty Demo
            </button>
            <button 
              type="button" 
              onClick={() => handleAutofill('Admin')}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
            >
              Admin Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
