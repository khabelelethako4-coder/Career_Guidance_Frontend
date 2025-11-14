// src/pages/Auth/Login/CompanyLogin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; 
import AuthBase from '../../../components/Auth/AuthBase';

const CompanyLogin = () => {
  const { loginAsCompany, error, setError, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      if (user.role === 'company') {
        navigate('/company/dashboard');
      } else {
        setError(`Please use ${user.role} login page instead`);
      }
    }
  }, [user, navigate, setError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { email, password } = formData;

    if (!email || !password) {
      setError('Email and password are required!');
      setLoading(false);
      return;
    }

    try {
      await loginAsCompany(email, password);
      // Navigation will be handled by the useEffect above
    } catch (err) {
      // Error is handled in the AuthContext
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBase
      role="company"
      title="Company Sign In"
      subtitle="Access your company dashboard"
      type="login"
      error={error}
      onClearError={() => setError('')}
      loading={loading}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Company Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="form-input"
            placeholder="Enter your company email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password *</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="form-input"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-options">
          <div className="remember-me">
            <input
              type="checkbox"
              id="remember"
              className="remember-checkbox"
            />
            <label htmlFor="remember" className="remember-label">
              Remember me
            </label>
          </div>
          <button
            type="button"
            className="forgot-password"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`btn btn-primary ${loading ? 'loading' : ''}`}
          style={{ backgroundColor: '#dc2626' }}
        >
          {loading ? 'Signing In...' : 'Sign In as Company'}
        </button>

        <div className="auth-features">
          <div className="feature-item">
            <span className="feature-icon">💼</span>
            <span className="feature-text">Post job opportunities</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">👥</span>
            <span className="feature-text">Manage applicants</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span className="feature-text">Track recruitment analytics</span>
          </div>
        </div>
      </form>
    </AuthBase>
  );
};

export default CompanyLogin;