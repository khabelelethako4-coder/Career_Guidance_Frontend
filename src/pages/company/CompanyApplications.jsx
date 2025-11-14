// src/pages/company/CompanyApplications.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getJobApplicationsByCompany, updateJobApplicationStatus } from '../../services/jobService';
import { getCompanyByUserId } from '../../services/userService';
import { getQualifiedApplicants } from '../../services/qualificationService';
import { 
  ArrowLeftIcon, 
  UserIcon, // CHANGED: UsersIcon to UserIcon
  FilterIcon, 
  SearchIcon, 
  CheckIcon,
  CloseIcon,
  EyeIcon,
  DownloadIcon
} from '../../components/Icons'; // REMOVED: SortIcon and UsersIcon

const CompanyApplications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [sortBy, setSortBy] = useState('matchScore');
  const [sortOrder, setSortOrder] = useState('desc');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        if (user && user.uid) {
          const companyData = await getCompanyByUserId(user.uid);
          setCompany(companyData);

          if (companyData) {
            // Get all applications and filter qualified ones
            const allApplications = await getJobApplicationsByCompany(companyData.id);
            
            // Enhance applications with qualification scores
            const enhancedApplications = await Promise.all(
              allApplications.map(async (app) => {
                try {
                  const qualifiedApps = await getQualifiedApplicants(app.jobId);
                  const qualifiedApp = qualifiedApps.find(qa => qa.id === app.id);
                  return {
                    ...app,
                    qualificationScore: qualifiedApp?.qualificationScore || 0,
                    matchDetails: qualifiedApp?.matchDetails || []
                  };
                } catch (error) {
                  return { ...app, qualificationScore: 0, matchDetails: [] };
                }
              })
            );

            setApplications(enhancedApplications);
            setFilteredApplications(enhancedApplications);
          }
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('Failed to load applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filter and sort applications
  useEffect(() => {
    let filtered = applications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.student?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Job filter
    if (jobFilter !== 'all') {
      filtered = filtered.filter(app => app.jobId === jobFilter);
    }

    // Sort applications
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'matchScore':
          aValue = a.qualificationScore || 0;
          bValue = b.qualificationScore || 0;
          break;
        case 'appliedDate':
          aValue = a.appliedAt?.toDate?.() || new Date(0);
          bValue = b.appliedAt?.toDate?.() || new Date(0);
          break;
        case 'name':
          aValue = a.studentName || '';
          bValue = b.studentName || '';
          break;
        default:
          aValue = a[sortBy] || 0;
          bValue = b[sortBy] || 0;
      }

      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter, jobFilter, sortBy, sortOrder]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this application as ${newStatus}?`)) {
      return;
    }

    setUpdatingStatus(applicationId);
    try {
      await updateJobApplicationStatus(applicationId, newStatus);
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update application status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted': return 'status-success';
      case 'interview': return 'status-warning';
      case 'rejected': return 'status-error';
      case 'pending': return 'status-info';
      default: return 'status-info';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  };

  const getUniqueJobs = () => {
    const jobs = applications.reduce((acc, app) => {
      if (app.job && !acc.find(j => j.id === app.job.id)) {
        acc.push(app.job);
      }
      return acc;
    }, []);
    return jobs;
  };

  if (loading) {
    return (
      <div className="dashboard-container company-dashboard">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
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
            <h1 className="dashboard-title">Job Applications</h1>
            <p className="dashboard-subtitle">
              Review and manage qualified applicants across all job posts
            </p>
          </div>
          <div className="header-actions">
            <span className="applicant-count">
              {filteredApplications.length} {filteredApplications.length === 1 ? 'Applicant' : 'Applicants'}
            </span>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={() => setError('')} className="alert-close">
              ×
            </button>
          </div>
        )}

        {/* Filters and Search */}
        <div className="card">
          <div className="card-header">
            <h3>
              <FilterIcon />
              Filters & Search
            </h3>
          </div>
          <div className="card-body">
            <div className="filters-grid">
              <div className="filter-group">
                <label>Search Applicants</label>
                <div className="search-input">
                  <SearchIcon />
                  <input
                    type="text"
                    placeholder="Search by name, job title, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview">Interview</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Job Post</label>
                <select
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                >
                  <option value="all">All Jobs</option>
                  {getUniqueJobs().map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Sort By</label>
                <div className="sort-controls">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="matchScore">Match Score</option>
                    <option value="appliedDate">Applied Date</option>
                    <option value="name">Applicant Name</option>
                  </select>
                  <button
                    className="sort-order-btn"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {/* REMOVED: SortIcon */}
                    {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="card">
          <div className="card-header">
            <h3>
              <UserIcon /> {/* CHANGED: UsersIcon to UserIcon */}
              Qualified Applicants
            </h3>
            <div className="card-actions">
              <button className="btn btn-outline btn-sm">
                <DownloadIcon />
                Export CSV
              </button>
            </div>
          </div>

          <div className="card-body">
            {filteredApplications.length === 0 ? (
              <div className="empty-state">
                <UserIcon /> {/* CHANGED: UsersIcon to UserIcon */}
                <p>No applications found matching your criteria.</p>
                {applications.length === 0 && (
                  <Link to="/company/post-job" className="btn btn-primary">
                    Post Your First Job
                  </Link>
                )}
              </div>
            ) : (
              <div className="applications-grid">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="application-card">
                    <div className="application-header">
                      <div className="applicant-info">
                        <h4>{application.studentName || 'Unknown Student'}</h4>
                        <p className="applicant-email">{application.student?.email}</p>
                        <div className="application-meta">
                          <span className="job-title">{application.job?.title}</span>
                          <span className="application-date">
                            Applied: {application.appliedAt ? 
                              new Date(application.appliedAt.toDate()).toLocaleDateString() : 'N/A'
                            }
                          </span>
                        </div>
                      </div>
                      <div className="application-scores">
                        <div className={`score-badge ${getScoreColor(application.qualificationScore)}`}>
                          {application.qualificationScore}% Match
                        </div>
                        <span className={`status-badge ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                    </div>

                    {/* Qualification Details */}
                    {application.matchDetails && application.matchDetails.length > 0 && (
                      <div className="qualification-details">
                        <h5>Qualification Matches:</h5>
                        <div className="match-tags">
                          {application.matchDetails.map((detail, index) => (
                            <span 
                              key={index} 
                              className={`match-tag ${detail.matched ? 'matched' : 'not-matched'}`}
                            >
                              {detail.category} {detail.matchPercentage ? `(${detail.matchPercentage}%)` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="application-actions">
                      <div className="action-buttons">
                        <Link
                          to={`/company/applicant/${application.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          <EyeIcon />
                          Review Details
                        </Link>
                        
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'shortlisted')}
                              disabled={updatingStatus === application.id}
                              className="btn btn-success btn-sm"
                            >
                              <CheckIcon />
                              {updatingStatus === application.id ? '...' : 'Shortlist'}
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(application.id, 'rejected')}
                              disabled={updatingStatus === application.id}
                              className="btn btn-outline btn-sm"
                            >
                              <CloseIcon />
                              {updatingStatus === application.id ? '...' : 'Reject'}
                            </button>
                          </>
                        )}

                        {application.status === 'shortlisted' && (
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'interview')}
                            disabled={updatingStatus === application.id}
                            className="btn btn-warning btn-sm"
                          >
                            <UserIcon /> {/* CHANGED: UsersIcon to UserIcon */}
                            {updatingStatus === application.id ? '...' : 'Schedule Interview'}
                          </button>
                        )}

                        {(application.status === 'rejected' || application.status === 'interview') && (
                          <button
                            onClick={() => handleStatusUpdate(application.id, 'pending')}
                            disabled={updatingStatus === application.id}
                            className="btn btn-outline btn-sm"
                          >
                            ↶ Reset
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="card">
          <div className="card-header">
            <h3>Application Statistics</h3>
          </div>
          <div className="card-body">
            <div className="stats-summary">
              <div className="stat-item">
                <div className="stat-value">{applications.length}</div>
                <div className="stat-label">Total Applications</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {applications.filter(app => app.qualificationScore >= 80).length}
                </div>
                <div className="stat-label">Highly Qualified (80%+)</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {applications.filter(app => app.status === 'shortlisted').length}
                </div>
                <div className="stat-label">Shortlisted</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {applications.filter(app => app.status === 'interview').length}
                </div>
                <div className="stat-label">Interview Stage</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyApplications;