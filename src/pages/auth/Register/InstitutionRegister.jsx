import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; 
import AuthBase from '../../../components/Auth/AuthBase';

const InstitutionRegister = () => {
  const { register, error, setError, getInstitutionsForRegistration } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [institutions, setInstitutions] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
      institutionId: '',
      position: ''
    },
  });

  useEffect(() => {
    const fetchInstitutions = async () => {
      setLoadingInstitutions(true);
      try {
        const instData = await getInstitutionsForRegistration();
        console.log('📋 Institutions loaded for registration:', instData);
        setInstitutions(instData);
      } catch (err) {
        console.error('❌ Error loading institutions:', err);
        setError('Failed to load institutions list. Please try again later.');
      } finally {
        setLoadingInstitutions(false);
      }
    };

    fetchInstitutions();
  }, [getInstitutionsForRegistration, setError]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (['firstName', 'lastName', 'phone', 'institutionId', 'position'].includes(name)) {
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

    if (!profile.institutionId) {
      setError('Please select an institution!');
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 Starting registration for institution:', profile.institutionId);
      
      // Find the selected institution to get its name
      const selectedInstitution = institutions.find(inst => inst.id === profile.institutionId);
      const institutionName = selectedInstitution ? selectedInstitution.name : 'Unknown Institution';
      
      // Add institution name to profile for the dashboard
      const enhancedProfile = {
        ...profile,
        institutionName: institutionName
      };

      const result = await register(email, password, 'institution', enhancedProfile);
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
          institutionId: '',
          position: ''
        },
      });
    } catch (err) {
      console.error('❌ Registration error:', err);
      // Error is handled in the register function
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthBase
        role="institution"
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
            Please check your inbox and click the link to activate your institution account.
          </p>

          <div className="success-actions">
            <button 
              onClick={() => navigate('/login/institution')} 
              className="btn btn-primary"
              style={{ backgroundColor: '#059669' }}
            >
              Go to Institution Login
            </button>
          </div>
        </div>
      </AuthBase>
    );
  }

  return (
    <AuthBase
      role="institution"
      title="Institution Registration"
      subtitle="Create your institution administrator account"
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
          <label className="form-label">Institution Email *</label>
          <input
            name="email"
            type="email"
            required
            className="form-input"
            placeholder="Enter your institution email"
            value={formData.email}
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
            placeholder="e.g., Administrator, Manager"
            value={formData.profile.position}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Select Institution *</label>
          <select
            name="institutionId"
            value={formData.profile.institutionId}
            onChange={handleChange}
            className="form-select"
            required
            disabled={loadingInstitutions || loading}
          >
            <option value="">-- Choose Institution --</option>
            {loadingInstitutions ? (
              <option value="" disabled>Loading institutions...</option>
            ) : institutions.length > 0 ? (
              institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} - {inst.location || 'Unknown Location'}
                </option>
              ))
            ) : (
              <option value="" disabled>No institutions available for registration</option>
            )}
          </select>
          {loadingInstitutions && (
            <small className="form-help">Loading institutions...</small>
          )}
          {!loadingInstitutions && institutions.length === 0 && (
            <small className="form-help text-warning">
              No institutions found. Please contact support.
            </small>
          )}
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
          disabled={loading || loadingInstitutions || !formData.profile.institutionId}
          className={`btn btn-primary ${loading ? 'loading' : ''}`}
          style={{ backgroundColor: '#059669' }}
        >
          {loading ? 'Creating Institution Account...' : 'Create Institution Account'}
        </button>

        {!loadingInstitutions && institutions.length > 0 && (
          <div className="form-help">
            <small>
              Found {institutions.length} institution(s) available for registration
            </small>
          </div>
        )}
      </form>
    </AuthBase>
  );
};

export default InstitutionRegister;