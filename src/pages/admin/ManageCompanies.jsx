import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllCompanies, updateCompany, deleteCompany } from '../../services/userService';
import { BusinessIcon, CheckIcon, CloseIcon, ClockIcon, ArrowLeftIcon, SearchIcon } from '../../components/Icons';

const ManageCompanies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to load companies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (companyId, newStatus) => {
    try {
      setError('');
      await updateCompany(companyId, { status: newStatus });
      setCompanies(companies.map(company => 
        company.id === companyId ? { ...company, status: newStatus } : company
      ));
      alert(`Company ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating company status:', error);
      setError('Failed to update company status. Please try again.');
    }
  };

  const handleDelete = async (companyId, companyName) => {
    if (window.confirm(`Are you sure you want to delete "${companyName}"? This action cannot be undone.`)) {
      try {
        setError('');
        await deleteCompany(companyId);
        setCompanies(companies.filter(company => company.id !== companyId));
        alert('Company deleted successfully');
      } catch (error) {
        console.error('Error deleting company:', error);
        setError('Failed to delete company. Please try again.');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckIcon />;
      case 'pending': return <ClockIcon />;
      case 'rejected': return <CloseIcon />;
      default: return <ClockIcon />;
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || company.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: companies.length,
    approved: companies.filter(c => c.status === 'approved').length,
    pending: companies.filter(c => c.status === 'pending').length,
    rejected: companies.filter(c => c.status === 'rejected').length
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
            <h1 className="dashboard-title">Manage Companies</h1>
            <p className="dashboard-subtitle">
              Approve, suspend, or delete company accounts
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

        {/* Company Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <BusinessIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Companies</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <CheckIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.approved}</div>
              <div className="stat-label">Approved</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <ClockIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <CloseIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.rejected}</div>
              <div className="stat-label">Rejected</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card">
          <div className="card-body">
            <div className="filters-row">
              <div className="search-box">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Status:</label>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <button 
                onClick={fetchCompanies}
                className="btn btn-outline btn-sm"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Companies Table */}
        <div className="card">
          <div className="card-header">
            <h3>Companies ({filteredCompanies.length})</h3>
          </div>
          <div className="card-body">
            {filteredCompanies.length === 0 ? (
              <div className="empty-state">
                <BusinessIcon />
                <p>No companies found</p>
                {searchTerm || filterStatus !== 'all' ? (
                  <button 
                    onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                    className="btn btn-primary"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <p>No companies have registered yet</p>
                )}
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>Contact Info</th>
                      <th>Industry</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Registration Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map((company) => (
                      <tr key={company.id}>
                        <td>
                          <div className="entity-info">
                            <strong>{company.name}</strong>
                            <span className="entity-subtitle">{company.website}</span>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <div>{company.email}</div>
                            <div className="contact-phone">{company.phone}</div>
                          </div>
                        </td>
                        <td>{company.industry}</td>
                        <td>
                          <span className="size-badge">
                            {company.employees || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <div className="status-with-actions">
                            <span className={`status-badge status-${company.status}`}>
                              {getStatusIcon(company.status)}
                              {company.status}
                            </span>
                            {company.status === 'pending' && (
                              <div className="quick-actions">
                                <button
                                  onClick={() => handleStatusChange(company.id, 'approved')}
                                  className="btn btn-success btn-xs"
                                  title="Approve"
                                >
                                  <CheckIcon />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(company.id, 'rejected')}
                                  className="btn btn-danger btn-xs"
                                  title="Reject"
                                >
                                  <CloseIcon />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          {company.createdAt ? new Date(company.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <select
                              value={company.status}
                              onChange={(e) => handleStatusChange(company.id, e.target.value)}
                              className="status-dropdown"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approve</option>
                              <option value="rejected">Reject</option>
                              <option value="suspended">Suspend</option>
                            </select>
                            <button
                              onClick={() => handleDelete(company.id, company.name)}
                              className="btn btn-danger btn-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCompanies;