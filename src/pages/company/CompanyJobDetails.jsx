// src/pages/company/CompanyJobDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getJob, updateJob, deleteJob } from '../../services/jobService';
import { getJobApplicationsByJobId, updateJobApplicationStatus } from '../../services/jobService';
import { getCompanyByUserId } from '../../services/userService';
import { getQualifiedApplicants } from '../../services/qualificationService';
import { 
  ArrowLeftIcon, 
  BriefcaseIcon, 
  UsersIcon, // ✅ Now available
  EditIcon, 
  TrashIcon, 
  CheckIcon, 
  CloseIcon,
  EyeIcon,
  CalendarIcon, // ✅ Now available
  LocationIcon, // ✅ Now available
  DollarIcon,
  ClockIcon,
  DownloadIcon
} from '../../components/Icons';

const CompanyJobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [qualifiedApplicants, setQualifiedApplicants] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('');
        if (user && user.uid) {
          const companyData = await getCompanyByUserId(user.uid);
          setCompany(companyData);

          if (companyData) {
            const [jobData, applicationsData] = await Promise.all([
              getJob(jobId),
              getJobApplicationsByJobId(jobId)
            ]);

            setJob(jobData);
            setApplications(applicationsData);

            // Get qualified applicants with match scores
            try {
              const qualified = await getQualifiedApplicants(jobId);
              setQualifiedApplicants(qualified);
            } catch (error) {
              console.error('Error fetching qualified applicants:', error);
              setQualifiedApplicants(applicationsData);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError('Failed to load job details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, jobId]);

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
      
      setQualifiedApplicants(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update application status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleJobStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this job post?`)) {
      return;
    }

    try {
      await updateJob(jobId, { status: newStatus });
      setJob(prev => ({ ...prev, status: newStatus }));
      alert(`Job ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating job status:', error);
      setError('Failed to update job status');
    }
  };

  const handleDeleteJob = async () => {
    if (!window.confirm('Are you sure you want to delete this job post? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteJob(jobId);
      alert('Job post deleted successfully!');
      navigate('/company/dashboard');
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job post');
      setDeleting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'draft': return 'status-pending';
      case 'closed': return 'status-error';
      default: return 'status-info';
    }
  };

  const getApplicationStatusColor = (status) => {
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

  if (!job) {
    return (
      <div className="dashboard-container company-dashboard">
        <div className="container">
          <div className="empty-state">
            <BriefcaseIcon />
            <p>Job post not found</p>
            <button 
              onClick={() => navigate('/company/dashboard')}
              className="btn btn-primary"
            >
              Back to Dashboard
            </button>
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
            <h1 className="dashboard-title">{job.title}</h1>
            <p className="dashboard-subtitle">
              Manage job post and review applicants
            </p>
          </div>
          <div className="header-actions">
            <span className={`status-badge ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
            <div className="action-buttons">
              <button className="btn btn-outline btn-sm">
                <EditIcon />
                Edit Job
              </button>
              <button 
                onClick={handleDeleteJob}
                disabled={deleting}
                className="btn btn-outline btn-sm"
              >
                <TrashIcon />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
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

        {/* Job Status Actions */}
        <div className="card">
          <div className="card-body">
            <div className="job-actions">
              <div className="job-meta">
                <div className="meta-item">
                  <LocationIcon />
                  <span>{job.location}</span>
                </div>
                <div className="meta-item">
                  <BriefcaseIcon />
                  <span>{job.jobType}</span>
                </div>
                {job.salary && (
                  <div className="meta-item">
                    <DollarIcon />
                    <span>{job.salary}</span>
                  </div>
                )}
                <div className="meta-item">
                  <UsersIcon />
                  <span>{applications.length} Applicants</span>
                </div>
                {job.applicationDeadline && (
                  <div className="meta-item">
                    <CalendarIcon />
                    <span>Closes {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <div className="status-actions">
                {job.status === 'active' && (
                  <button
                    onClick={() => handleJobStatusUpdate('inactive')}
                    className="btn btn-warning"
                  >
                    <ClockIcon />
                    Pause Job
                  </button>
                )}
                {job.status === 'inactive' && (
                  <button
                    onClick={() => handleJobStatusUpdate('active')}
                    className="btn btn-success"
                  >
                    <CheckIcon />
                    Activate Job
                  </button>
                )}
                <button
                  onClick={() => handleJobStatusUpdate('closed')}
                  className="btn btn-outline"
                >
                  <CloseIcon />
                  Close Job
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="card-header">
            <div className="tabs-header">
              <button
                className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <BriefcaseIcon />
                Job Overview
              </button>
              <button
                className={`tab-button ${activeTab === 'applicants' ? 'active' : ''}`}
                onClick={() => setActiveTab('applicants')}
              >
                <UsersIcon />
                Applicants ({applications.length})
              </button>
              <button
                className={`tab-button ${activeTab === 'qualified' ? 'active' : ''}`}
                onClick={() => setActiveTab('qualified')}
              >
                <CheckIcon />
                Qualified ({qualifiedApplicants.filter(app => app.qualificationScore >= 60).length})
              </button>
            </div>
          </div>

          <div className="card-body">
            {activeTab === 'overview' && (
              <div className="tab-content">
                <div className="job-details-grid">
                  <div className="detail-section">
                    <h3>Job Description</h3>
                    <p>{job.description}</p>
                  </div>

                  <div className="detail-section">
                    <h3>Requirements & Qualifications</h3>
                    <div className="requirements-grid">
                      {job.requirements?.education && (
                        <div className="requirement-item">
                          <strong>Education:</strong>
                          <span>{job.requirements.education}</span>
                        </div>
                      )}
                      {job.requirements?.experience && (
                        <div className="requirement-item">
                          <strong>Experience:</strong>
                          <span>{job.requirements.experience}</span>
                        </div>
                      )}
                      {job.qualifications?.minGPA && (
                        <div className="requirement-item">
                          <strong>Minimum GPA:</strong>
                          <span>{job.qualifications.minGPA}</span>
                        </div>
                      )}
                      {job.requirements?.skills && job.requirements.skills.length > 0 && (
                        <div className="requirement-item full-width">
                          <strong>Required Skills:</strong>
                          <div className="skills-list">
                            {job.requirements.skills.map((skill, index) => (
                              <span key={index} className="skill-tag">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {job.qualifications?.workExperience && (
                        <div className="requirement-item full-width">
                          <strong>Work Experience Requirements:</strong>
                          <p>{job.qualifications.workExperience}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Contact Information</h3>
                    <div className="contact-info">
                      {job.contactEmail && (
                        <div className="contact-item">
                          <strong>Email:</strong>
                          <span>{job.contactEmail}</span>
                        </div>
                      )}
                      {job.contactPhone && (
                        <div className="contact-item">
                          <strong>Phone:</strong>
                          <span>{job.contactPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>Job Statistics</h3>
                    <div className="stats-mini">
                      <div className="stat-mini">
                        <div className="stat-value">{applications.length}</div>
                        <div className="stat-label">Total Applicants</div>
                      </div>
                      <div className="stat-mini">
                        <div className="stat-value">
                          {qualifiedApplicants.filter(app => app.qualificationScore >= 80).length}
                        </div>
                        <div className="stat-label">Highly Qualified</div>
                      </div>
                      <div className="stat-mini">
                        <div className="stat-value">
                          {applications.filter(app => app.status === 'shortlisted').length}
                        </div>
                        <div className="stat-label">Shortlisted</div>
                      </div>
                      <div className="stat-mini">
                        <div className="stat-value">
                          {applications.filter(app => app.status === 'interview').length}
                        </div>
                        <div className="stat-label">In Interview</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'applicants' && (
              <div className="tab-content">
                {applications.length === 0 ? (
                  <div className="empty-state">
                    <UsersIcon />
                    <p>No applications received yet.</p>
                    <p className="text-muted">Share this job post to attract candidates.</p>
                  </div>
                ) : (
                  <div className="applications-list">
                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Applicant Name</th>
                            <th>Match Score</th>
                            <th>Applied Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applications.map((application) => {
                            const qualifiedApp = qualifiedApplicants.find(qa => qa.id === application.id);
                            const matchScore = qualifiedApp?.qualificationScore || 0;
                            
                            return (
                              <tr key={application.id}>
                                <td>
                                  <div className="entity-info">
                                    <strong>{application.studentName || 'Unknown Student'}</strong>
                                    <span className="entity-subtitle">{application.student?.email}</span>
                                  </div>
                                </td>
                                <td>
                                  {matchScore > 0 ? (
                                    <span className={`score-badge ${getScoreColor(matchScore)}`}>
                                      {matchScore}% Match
                                    </span>
                                  ) : (
                                    'N/A'
                                  )}
                                </td>
                                <td>
                                  {application.appliedAt
                                    ? new Date(application.appliedAt.toDate()).toLocaleDateString()
                                    : 'N/A'
                                  }
                                </td>
                                <td>
                                  <span className={`status-badge ${getApplicationStatusColor(application.status)}`}>
                                    {application.status}
                                  </span>
                                </td>
                                <td>
                                  <div className="action-buttons">
                                    <Link
                                      to={`/company/applicant/${application.id}`}
                                      className="btn btn-primary btn-sm"
                                    >
                                      <EyeIcon />
                                      Review
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
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'qualified' && (
              <div className="tab-content">
                {qualifiedApplicants.filter(app => app.qualificationScore >= 60).length === 0 ? (
                  <div className="empty-state">
                    <CheckIcon />
                    <p>No highly qualified applicants yet.</p>
                    <p className="text-muted">Applicants need at least 60% match score to appear here.</p>
                  </div>
                ) : (
                  <div className="qualified-applicants">
                    <div className="applications-grid">
                      {qualifiedApplicants
                        .filter(app => app.qualificationScore >= 60)
                        .sort((a, b) => b.qualificationScore - a.qualificationScore)
                        .map((application) => (
                        <div key={application.id} className="application-card">
                          <div className="application-header">
                            <div className="applicant-info">
                              <h4>{application.studentName || 'Unknown Student'}</h4>
                              <p className="applicant-email">{application.student?.email}</p>
                              <div className="application-meta">
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
                              <span className={`status-badge ${getApplicationStatusColor(application.status)}`}>
                                {application.status}
                              </span>
                            </div>
                          </div>

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
                                    onClick={() => handleStatusUpdate(application.id, 'interview')}
                                    disabled={updatingStatus === application.id}
                                    className="btn btn-warning btn-sm"
                                  >
                                    <UsersIcon />
                                    Interview
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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

export default CompanyJobDetails;