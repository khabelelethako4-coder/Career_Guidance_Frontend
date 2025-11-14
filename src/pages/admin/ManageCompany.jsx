import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCompany, updateCompany } from '../../services/userService';
import { BusinessIcon, ArrowLeftIcon } from '../../components/Icons';

const ManageCompany = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [company, setCompany] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompany();
  }, [companyId]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      setError('');
      const companyData = await getCompany(companyId);
      setCompany(companyData);
    } catch (error) {
      console.error('Error fetching company:', error);
      setError('Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    try {
      setError('');
      await updateCompany(companyId, { status: newStatus });
      setCompany({ ...company, status: newStatus });
      alert(`Company ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating company status:', error);
      setError('Failed to update company status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="empty-state">
            <BusinessIcon />
            <p>Company not found</p>
            <button onClick={() => navigate('/admin/companies')} className="btn btn-primary">
              Back to Companies
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-content">
            <button 
              onClick={() => navigate('/admin/companies')}
              className="btn btn-outline btn-sm"
              style={{ marginBottom: '1rem' }}
            >
              <ArrowLeftIcon />
              Back to Companies
            </button>
            <h1 className="dashboard-title">{company.name}</h1>
            <p className="dashboard-subtitle">
              Manage company account and settings
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
            <button onClick={() => setError('')} className="alert-close">
              ×
            </button>
          </div>
        )}

        <div className="card-grid">
          {/* Company Information */}
          <div className="card">
            <div className="card-header">
              <h3>Company Information</h3>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Company Name:</label>
                  <span>{company.name}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{company.email}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{company.phone || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Industry:</label>
                  <span>{company.industry || 'Not specified'}</span>
                </div>
                <div className="info-item">
                  <label>Website:</label>
                  <span>{company.website || 'Not provided'}</span>
                </div>
                <div className="info-item">
                  <label>Employees:</label>
                  <span>{company.employees || 'Not specified'}</span>
                </div>
                <div className="info-item full-width">
                  <label>Description:</label>
                  <span>{company.description || 'No description provided'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Management */}
          <div className="card">
            <div className="card-header">
              <h3>Account Management</h3>
            </div>
            <div className="card-body">
              <div className="status-section">
                <div className="current-status">
                  <label>Current Status:</label>
                  <span className={`status-badge status-${company.status}`}>
                    {company.status}
                  </span>
                </div>
                
                <div className="status-actions">
                  <h4>Change Status:</h4>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleStatusChange('approved')}
                      className="btn btn-success"
                      disabled={saving || company.status === 'approved'}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange('pending')}
                      className="btn btn-warning"
                      disabled={saving || company.status === 'pending'}
                    >
                      Set Pending
                    </button>
                    <button
                      onClick={() => handleStatusChange('rejected')}
                      className="btn btn-danger"
                      disabled={saving || company.status === 'rejected'}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusChange('suspended')}
                      className="btn btn-secondary"
                      disabled={saving || company.status === 'suspended'}
                    >
                      Suspend
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Details */}
          <div className="card">
            <div className="card-header">
              <h3>Registration Details</h3>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Registered:</label>
                  <span>
                    {company.createdAt ? new Date(company.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Last Updated:</label>
                  <span>
                    {company.updatedAt ? new Date(company.updatedAt.toDate()).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="info-item">
                  <label>Account ID:</label>
                  <span className="monospace">{company.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCompany;