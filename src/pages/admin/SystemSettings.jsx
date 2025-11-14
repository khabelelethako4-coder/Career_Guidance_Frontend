import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsIcon, ArrowLeftIcon, SaveIcon } from "../../components/Icons";

const SystemSettings = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);  
  const [settings, setSettings] = useState({
    siteName: 'CareerConnect',
    siteDescription: 'Student Career Platform',
    adminEmail: 'admin@careerconnect.com',
    maxInstitutions: 100,
    maxCompanies: 500,
    studentRegistration: true,
    companyRegistration: true,
    institutionRegistration: true,
    requireEmailVerification: true,
    maintenanceMode: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully');
    }, 1000);
  };

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-content">
            <button 
              onClick={() => navigate('/admin')}
              className="btn btn-outline btn-sm"
              style={{ marginBottom: '1rem' }}
            >
              <ArrowLeftIcon />
              Back to Dashboard
            </button>
            <h1 className="dashboard-title">System Settings</h1>
            <p className="dashboard-subtitle">
              Configure platform settings and preferences
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>General Settings</h3>
          </div>
          <div className="card-body">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="siteName">Site Name</label>
                <input
                  type="text"
                  id="siteName"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="adminEmail">Admin Email</label>
                <input
                  type="email"
                  id="adminEmail"
                  name="adminEmail"
                  value={settings.adminEmail}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxInstitutions">Max Institutions</label>
                <input
                  type="number"
                  id="maxInstitutions"
                  name="maxInstitutions"
                  value={settings.maxInstitutions}
                  onChange={handleChange}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxCompanies">Max Companies</label>
                <input
                  type="number"
                  id="maxCompanies"
                  name="maxCompanies"
                  value={settings.maxCompanies}
                  onChange={handleChange}
                  min="1"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="siteDescription">Site Description</label>
                <textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Registration Settings</h3>
          </div>
          <div className="card-body">
            <div className="settings-grid">
              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="studentRegistration"
                    checked={settings.studentRegistration}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                  Allow Student Registration
                </label>
              </div>

              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="companyRegistration"
                    checked={settings.companyRegistration}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                  Allow Company Registration
                </label>
              </div>

              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="institutionRegistration"
                    checked={settings.institutionRegistration}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                  Allow Institution Registration
                </label>
              </div>

              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="requireEmailVerification"
                    checked={settings.requireEmailVerification}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                  Require Email Verification
                </label>
              </div>

              <div className="setting-item">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                  Maintenance Mode
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: '2rem' }}>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={saving}
          >
            <SaveIcon />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;