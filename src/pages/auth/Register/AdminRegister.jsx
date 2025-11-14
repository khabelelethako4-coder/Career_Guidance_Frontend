// src/pages/Auth/Register/AdminRegister.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; 
import AuthBase from '../../../components/Auth/AuthBase';


const AdminRegister = () => {
  const { register, error, setError } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
      adminCode: ''
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (['firstName', 'lastName', 'phone', 'adminCode'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { email, password, confirmPassword, profile } = formData;

    if (!email || !password || !confirmPassword) {
      setError('All fields are required!');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters long!');
      setLoading(false);
      return;
    }

    if (!profile.firstName || !profile.lastName) {
      setError('First name and last name are required!');
      setLoading(false);
      return;
    }

    if (!profile.adminCode) {
      setError('Admin access code is required!');
      setLoading(false);
      return;
    }

    if (profile.adminCode !== '1234') {
      setError('Invalid admin access code!');
      setLoading(false);
      return;
    }

    try {
      const result = await register(email, password, 'admin', profile);
      setSuccess(true);
      setRegisteredEmail(email);
      
      // Reset form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        profile: {
          firstName: '',
          lastName: '',
          phone: '',
          adminCode: ''
        },
      });
    } catch (err) {
      // Error is handled in the register function
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthBase
        role="admin"
        title="Registration Successful!"
        subtitle="Check your email to verify your account"
        type="register"
      >
        <div className="auth-success">
          <div className="success-icon">✅</div>
          <p>
            We've sent a verification email to <strong>{registeredEmail}</strong>.
          </p>
          <p className="success-message">
            Please check your inbox and click the link to activate your admin account.
          </p>

          <div className="success-actions">
            <button 
              onClick={() => navigate('/login/admin')} 
              className="btn btn-primary"
              style={{ backgroundColor: '#7c3aed' }}
            >
              Go to Admin Login
            </button>
          </div>
        </div>
      </AuthBase>
    );
  }

  return (
    <AuthBase
      role="admin"
      title="Admin Registration"
      subtitle="Create system administrator account"
      type="register"
      error={error}
      onClearError={() => setError('')}
      loading={loading}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input
              name="firstName"
              type="text"
              required
              className="form-input"
              placeholder="Enter your first name"
              value={formData.profile.firstName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input
              name="lastName"
              type="text"
              required
              className="form-input"
              placeholder="Enter your last name"
              value={formData.profile.lastName}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Admin Email *</label>
          <input
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
          <label className="form-label">Phone Number</label>
          <input
            name="phone"
            type="tel"
            className="form-input"
            placeholder="Enter your phone number"
            value={formData.profile.phone}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Admin Access Code *</label>
          <input
            name="adminCode"
            type="password"
            required
            className="form-input"
            placeholder="Enter admin access code"
            value={formData.profile.adminCode}
            onChange={handleChange}
            disabled={loading}
          />
          <small className="form-help">
            Contact system administrator to get the access code
          </small>
        </div>

        <div className="form-group">
          <label className="form-label">Password *</label>
          <input
            name="password"
            type="password"
            required
            className="form-input"
            placeholder="Create a password (min. 6 characters)"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password *</label>
          <input
            name="confirmPassword"
            type="password"
            required
            className="form-input"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
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
          {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
        </button>
      </form>
    </AuthBase>
  );
};

export default AdminRegister;