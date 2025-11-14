// src/pages/Auth/Login/AdminLogin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; 
import AuthBase from '../../../components/Auth/AuthBase';

const AdminLogin = () => {
  const { login, error, setError, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        setError(`Please use ${user.role} login instead`);
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

    try {
      await login(formData.email, formData.password, 'admin');
    } catch (err) {
      // Error is handled in the AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBase
      role="admin"
      title="Admin Sign In"
      subtitle="Access system administration panel"
      type="login"
      error={error}
      onClearError={() => setError('')}
      loading={loading}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Admin Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="form-input"
            placeholder="Enter your admin email"
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

        <button
          type="submit"
          disabled={loading}
          className={`btn btn-primary ${loading ? 'loading' : ''}`}
          style={{ backgroundColor: '#7c3aed' }}
        >
          {loading ? 'Signing In...' : 'Sign In as Admin'}
        </button>
      </form>
    </AuthBase>
  );
};

export default AdminLogin;