// src/pages/Auth/Register/CompanyRegister.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; 
import AuthBase from '../../../components/Auth/AuthBase';

const CompanyRegister = () => {
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
      companyName: '',
      position: ''
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (['firstName', 'lastName', 'phone', 'companyName', 'position'].includes(name)) {
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

    if (!profile.companyName) {
      setError('Company name is required!');
      setLoading(false);
      return;
    }

    try {
      const result = await register(email, password, 'company', profile);
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
          companyName: '',
          position: ''
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
        role="company"
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
            Please check your inbox and click the link to activate your company account.
          </p>

          <div className="success-actions">
            <button 
              onClick={() => navigate('/login/company')} 
              className="btn btn-primary"
              style={{ backgroundColor: '#dc2626' }}
            >
              Go to Company Login
            </button>
          </div>
        </div>
      </AuthBase>
    );
  }

  return (
    <AuthBase
      role="company"
      title="Company Registration"
      subtitle="Create your company account"
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
          <label className="form-label">Company Email *</label>
          <input
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
          <label className="form-label">Company Name *</label>
          <input
            name="companyName"
            type="text"
            required
            className="form-input"
            placeholder="Enter your company name"
            value={formData.profile.companyName}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Your Position</label>
          <input
            name="position"
            type="text"
            className="form-input"
            placeholder="e.g., HR Manager, Recruiter"
            value={formData.profile.position}
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
          style={{ backgroundColor: '#dc2626' }}
        >
          {loading ? 'Creating Company Account...' : 'Create Company Account'}
        </button>
      </form>
    </AuthBase>
  );
};

export default CompanyRegister;