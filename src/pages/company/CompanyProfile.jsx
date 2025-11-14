// src/pages/company/CompanyProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCompanyByUserId, updateCompanyProfile } from '../../services/userService';
import { ArrowLeftIcon, BuildingIcon, SaveIcon } from '../../components/Icons';

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [companyId, setCompanyId] = useState('');

  const [profileData, setProfileData] = useState({
    companyName: '',
    email: '',
    phone: '',
    industry: '',
    size: '',
    website: '',
    location: '',
    description: '',
    foundedYear: '',
    contactPerson: '',
    contactPosition: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        setLoading(true);
        setError('');
        try {
          console.log('Fetching company profile for user:', user.uid);
          const companyData = await getCompanyByUserId(user.uid);
          console.log('Company data received:', companyData);
          
          if (companyData) {
            setCompanyId(companyData.id);
            setProfileData({
              companyName: companyData.companyName || companyData.profile?.companyName || '',
              email: companyData.email || user.email || '',
              phone: companyData.phone || companyData.profile?.phone || '',
              industry: companyData.industry || companyData.profile?.industry || '',
              size: companyData.size || companyData.profile?.size || '',
              website: companyData.website || companyData.profile?.website || '',
              location: companyData.location || companyData.profile?.location || '',
              description: companyData.description || companyData.profile?.description || '',
              foundedYear: companyData.foundedYear || companyData.profile?.foundedYear || '',
              contactPerson: companyData.contactPerson || companyData.profile?.contactPerson || '',
              contactPosition: companyData.contactPosition || companyData.profile?.contactPosition || ''
            });
          } else {
            setError('No company profile found. Please complete your profile setup.');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          setError('Failed to load company profile: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    // Validate required fields
    if (!profileData.companyName.trim()) {
      setError('Company name is required');
      setSaving(false);
      return;
    }

    if (!profileData.email.trim()) {
      setError('Email address is required');
      setSaving(false);
      return;
    }

    if (!profileData.industry.trim()) {
      setError('Industry is required');
      setSaving(false);
      return;
    }

    try {
      console.log('Submitting profile update:', profileData);
      const result = await updateCompanyProfile(user.uid, profileData);
      console.log('Update result:', result);
      setSuccess('Profile updated successfully!');
      
      // Refresh the data
      const updatedCompany = await getCompanyByUserId(user.uid);
      if (updatedCompany) {
        setProfileData({
          companyName: updatedCompany.companyName || '',
          email: updatedCompany.email || '',
          phone: updatedCompany.phone || '',
          industry: updatedCompany.industry || '',
          size: updatedCompany.size || '',
          website: updatedCompany.website || '',
          location: updatedCompany.location || '',
          description: updatedCompany.description || '',
          foundedYear: updatedCompany.foundedYear || '',
          contactPerson: updatedCompany.contactPerson || '',
          contactPosition: updatedCompany.contactPosition || ''
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container company-dashboard">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading company profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container company-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-content">
            <button 
              onClick={() => navigate('/company/dashboard')}
              className="btn btn-outline btn-sm back-btn"
            >
              <ArrowLeftIcon />
              Back to Dashboard
            </button>
            <h1 className="dashboard-title">Company Profile</h1>
            <p className="dashboard-subtitle">
              Manage your company information and settings
            </p>
            {companyId && (
              <div className="company-id-badge">
                Company ID: <code>{companyId}</code>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
            <button onClick={() => setError('')} className="alert-close">
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <strong>Success:</strong> {success}
            <button onClick={() => setSuccess('')} className="alert-close">
              ×
            </button>
          </div>
        )}

        <div className="main-content-grid">
          {/* Profile Form */}
          <div className="content-column">
            <div className="card">
              <div className="card-header">
                <h3>
                  <BuildingIcon />
                  Company Information
                </h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Company Name *</label>
                      <input
                        type="text"
                        name="companyName"
                        value={profileData.companyName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your company name"
                        disabled={saving}
                      />
                    </div>

                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleChange}
                        required
                        placeholder="company@example.com"
                        disabled={saving}
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleChange}
                        placeholder="+266 1234 5678"
                        disabled={saving}
                      />
                    </div>

                    <div className="form-group">
                      <label>Industry *</label>
                      <select
                        name="industry"
                        value={profileData.industry}
                        onChange={handleChange}
                        required
                        disabled={saving}
                      >
                        <option value="">Select Industry</option>
                        <option value="technology">Technology</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="education">Education</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="retail">Retail</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Company Size</label>
                      <select
                        name="size"
                        value={profileData.size}
                        onChange={handleChange}
                        disabled={saving}
                      >
                        <option value="">Select Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501+">501+ employees</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Website</label>
                      <input
                        type="url"
                        name="website"
                        value={profileData.website}
                        onChange={handleChange}
                        placeholder="https://example.com"
                        disabled={saving}
                      />
                    </div>

                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        name="location"
                        value={profileData.location}
                        onChange={handleChange}
                        placeholder="Maseru, Lesotho"
                        disabled={saving}
                      />
                    </div>

                    <div className="form-group">
                      <label>Founded Year</label>
                      <input
                        type="number"
                        name="foundedYear"
                        value={profileData.foundedYear}
                        onChange={handleChange}
                        min="1900"
                        max={new Date().getFullYear()}
                        placeholder="2020"
                        disabled={saving}
                      />
                    </div>

                    <div className="form-group">
                      <label>Contact Person</label>
                      <input
                        type="text"
                        name="contactPerson"
                        value={profileData.contactPerson}
                        onChange={handleChange}
                        placeholder="Full name"
                        disabled={saving}
                      />
                    </div>

                    <div className="form-group">
                      <label>Contact Position</label>
                      <input
                        type="text"
                        name="contactPosition"
                        value={profileData.contactPosition}
                        onChange={handleChange}
                        placeholder="e.g., HR Manager"
                        disabled={saving}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Company Description</label>
                      <textarea
                        name="description"
                        value={profileData.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Describe your company, mission, and values..."
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => navigate('/company/dashboard')}
                      className="btn btn-outline"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn btn-primary"
                    >
                      <SaveIcon />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Profile Preview */}
          <div className="content-column">
            <div className="card">
              <div className="card-header">
                <h3>Profile Preview</h3>
              </div>
              <div className="card-body">
                <div className="profile-preview">
                  <div className="company-header">
                    <h4>{profileData.companyName || 'Company Name'}</h4>
                    <p className="company-industry">{profileData.industry || 'Industry'}</p>
                  </div>
                  
                  <div className="company-details">
                    <div className="detail-item">
                      <strong>Email:</strong>
                      <span>{profileData.email || 'Not specified'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Phone:</strong>
                      <span>{profileData.phone || 'Not specified'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Location:</strong>
                      <span>{profileData.location || 'Not specified'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Size:</strong>
                      <span>{profileData.size || 'Not specified'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Contact:</strong>
                      <span>{profileData.contactPerson || 'Not specified'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Position:</strong>
                      <span>{profileData.contactPosition || 'Not specified'}</span>
                    </div>
                    {profileData.website && (
                      <div className="detail-item">
                        <strong>Website:</strong>
                        <span>
                          <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                            {profileData.website}
                          </a>
                        </span>
                      </div>
                    )}
                  </div>

                  {profileData.description && (
                    <div className="company-description">
                      <strong>About:</strong>
                      <p>{profileData.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;