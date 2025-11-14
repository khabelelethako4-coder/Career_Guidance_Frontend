// src/pages/Auth/Login/StudentLogin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; 
import AuthBase from '../../../components/Auth/AuthBase';


const StudentLogin = () => {
  const { login, error, setError, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        navigate('/dashboard/student');
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
      await login(formData.email, formData.password, 'student');
      // Navigation will be handled by the useEffect above
    } catch (err) {
      // Error is handled in the AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBase
      role="student"
      title="Student Sign In"
      subtitle="Access your student dashboard"
      type="login"
      error={error}
      onClearError={() => setError('')}
      loading={loading}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Student Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="form-input"
            placeholder="Enter your student email"
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
          style={{ backgroundColor: '#4f46e5' }}
        >
          {loading ? 'Signing In...' : 'Sign In as Student'}
        </button>
      </form>
    </AuthBase>
  );
};

export default StudentLogin;