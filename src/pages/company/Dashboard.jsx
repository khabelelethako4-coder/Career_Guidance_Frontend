// src/pages/company/CompanyDashboard.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getJobsByCompany, getJobApplicationsByCompany } from '../../services/jobService';
import { getCompanyByUserId } from '../../services/userService';
import { BriefcaseIcon, UserIcon, ClockIcon, CheckIcon } from '../../components/Icons'; // CORRECTED: Only UserIcon, no UsersIcon
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('jobs');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        if (user && user.uid) {
          // Get company info
          const companyData = await getCompanyByUserId(user.uid);
          setCompany(companyData);

          if (companyData) {
            // Get company jobs and applications
            const [jobsData, jobAppData] = await Promise.all([
              getJobsByCompany(companyData.id),
              getJobApplicationsByCompany(companyData.id)
            ]);
            setJobs(jobsData);
            setJobApplications(jobAppData);
          } else {
            setError('Company profile not found. Please complete your company profile.');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const activeJobs = jobs.filter(job => job.status === 'active').length;
  const totalApplicants = jobApplications.length;
  const pendingApplications = jobApplications.filter(app => app.status === 'pending').length;

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
            <h1 className="dashboard-title">Company Dashboard</h1>
            <p className="dashboard-subtitle">
              Post jobs and manage qualified applicants
            </p>
          </div>
          <div className="header-actions">
            <Link to="/company/profile" className="btn btn-outline">
              Update Profile
            </Link>
            <Link to="/company/post-job" className="btn btn-primary">
              Post New Job
            </Link>
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

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <BriefcaseIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{activeJobs}</div>
              <div className="stat-label">Active Jobs</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <UserIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalApplicants}</div>
              <div className="stat-label">Total Applicants</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <ClockIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{pendingApplications}</div>
              <div className="stat-label">Pending Reviews</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <CheckIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value" style={{ fontSize: '1.25rem' }}>
                {company?.status || 'Pending'}
              </div>
              <div className="stat-label">Company Status</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="quick-actions-grid">
              <Link to="/company/post-job" className="quick-action-card">
                <div className="action-icon">
                  <BriefcaseIcon />
                </div>
                <div className="action-content">
                  <h4>Post New Job</h4>
                  <p>Create a new job listing with qualifications</p>
                </div>
              </Link>

              <Link to="/company/profile" className="quick-action-card">
                <div className="action-icon">
                  <UserIcon />
                </div>
                <div className="action-content">
                  <h4>Update Profile</h4>
                  <p>Manage company information</p>
                </div>
              </Link>

              <Link to="/company/applications" className="quick-action-card">
                <div className="action-icon">
                  <UserIcon />
                </div>
                <div className="action-content">
                  <h4>View Applicants</h4>
                  <p>Review qualified candidates</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="card-header">
            <div className="tabs-header">
              <button
                className={`tab-button ${activeTab === 'jobs' ? 'active' : ''}`}
                onClick={() => setActiveTab('jobs')}
              >
                <BriefcaseIcon />
                Job Posts ({jobs.length})
              </button>
              <button
                className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
                onClick={() => setActiveTab('applications')}
              >
                <UserIcon />
                Qualified Applicants ({jobApplications.length})
              </button>
            </div>
          </div>

          <div className="card-body">
            {activeTab === 'jobs' && (
              <div className="tab-content">
                {jobs.length === 0 ? (
                  <div className="empty-state">
                    <BriefcaseIcon />
                    <p>You haven't posted any jobs yet.</p>
                    <Link to="/company/post-job" className="btn btn-primary">
                      Post Your First Job
                    </Link>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Job Title</th>
                          <th>Location</th>
                          <th>Type</th>
                          <th>Posted Date</th>
                          <th>Status</th>
                          <th>Applicants</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((job) => {
                          const jobApplicants = jobApplications.filter(app => app.jobId === job.id).length;
                          return (
                            <tr key={job.id}>
                              <td>
                                <div className="entity-info">
                                  <strong>{job.title}</strong>
                                  <span className="entity-subtitle">{job.department}</span>
                                </div>
                              </td>
                              <td>{job.location}</td>
                              <td>
                                <span className="job-type-badge">{job.jobType}</span>
                              </td>
                              <td>
                                {job.createdAt
                                  ? new Date(job.createdAt.toDate()).toLocaleDateString()
                                  : 'N/A'}
                              </td>
                              <td>
                                <span className={`status-badge status-${job.status}`}>
                                  {job.status}
                                </span>
                              </td>
                              <td>
                                <span className="applicant-count">{jobApplicants}</span>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <Link
                                    to={`/company/job/${job.id}`}
                                    className="btn btn-primary btn-sm"
                                  >
                                    Manage
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'applications' && (
              <div className="tab-content">
                {jobApplications.length === 0 ? (
                  <div className="empty-state">
                    <UserIcon />
                    <p>No qualified applicants yet.</p>
                    <Link to="/company/post-job" className="btn btn-primary">
                      Post a Job
                    </Link>
                  </div>
                ) : (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Applicant Name</th>
                          <th>Job Title</th>
                          <th>Match Score</th>
                          <th>Applied Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobApplications.map((app) => (
                          <tr key={app.id}>
                            <td>
                              <div className="entity-info">
                                <strong>{app.studentName || 'Unknown Student'}</strong>
                                <span className="entity-subtitle">{app.student?.email}</span>
                              </div>
                            </td>
                            <td>{app.job?.title || 'N/A'}</td>
                            <td>
                              {app.matchScore ? (
                                <span className="applicant-count">
                                  {app.matchScore}% Match
                                </span>
                              ) : (
                                'N/A'
                              )}
                            </td>
                            <td>
                              {app.appliedAt
                                ? new Date(app.appliedAt.toDate()).toLocaleDateString()
                                : 'N/A'}
                            </td>
                            <td>
                              <span className={`status-badge status-${app.status}`}>
                                {app.status}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <Link
                                  to={`/company/applicant/${app.id}`}
                                  className="btn btn-primary btn-sm"
                                >
                                  Review
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;