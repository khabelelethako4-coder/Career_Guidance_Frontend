// src/pages/Auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthBase from '../../components/Auth/AuthBase';

const ForgotPassword = () => {
  const { resetPassword, error, setError } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      // Error is handled in the AuthContext
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthBase
        role="company"
        title="Check Your Email"
        subtitle="Password reset instructions sent"
        type="login"
      >
        <div className="auth-success">
          <div className="success-icon">📧</div>
          <p>
            We've sent password reset instructions to <strong>{email}</strong>.
          </p>
          <p className="success-message">
            Please check your inbox and follow the link to reset your password.
          </p>

          <div className="success-actions">
            <button 
              onClick={() => navigate('/login/company')} 
              className="btn btn-primary"
              style={{ backgroundColor: '#dc2626' }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </AuthBase>
    );
  }

  return (
    <AuthBase
      role="company"
      title="Reset Password"
      subtitle="Enter your email to reset your password"
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`btn btn-primary ${loading ? 'loading' : ''}`}
          style={{ backgroundColor: '#dc2626' }}
        >
          {loading ? 'Sending...' : 'Send Reset Instructions'}
        </button>

        <div className="auth-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/login/company')}
            style={{ marginTop: '12px' }}
          >
            ← Back to Login
          </button>
        </div>
      </form>
    </AuthBase>
  );
};

export default ForgotPassword;