// src/pages/student/ApplicationDetails.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getApplicationById } from '../../services/applicationService';
import { ArrowLeftIcon, FileIcon, UserIcon, BuildingIcon, BookIcon, CheckIcon, CloseIcon, ClockIcon } from '../../components/Icons';
import './StudentDashboard.css';
const StudentApplicationDetails = () => {
  const { applicationId } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
    try {
      const appData = await getApplicationById(applicationId);
      setApplication(appData);
    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const baseClass = "status-badge";
    switch (status) {
      case 'admitted': return `${baseClass} status-admitted`;
      case 'rejected': return `${baseClass} status-rejected`;
      case 'pending': return `${baseClass} status-pending`;
      default: return `${baseClass} status-pending`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'admitted': return <CheckIcon />;
      case 'rejected': return <CloseIcon />;
      case 'pending': return <ClockIcon />;
      default: return <ClockIcon />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'admitted': 
        return {
          title: 'Congratulations!',
          message: 'Your application has been accepted. The institution will contact you with further instructions.',
          type: 'success'
        };
      case 'rejected':
        return {
          title: 'Application Not Successful',
          message: 'Unfortunately, your application was not successful this time. You can explore other courses or institutions.',
          type: 'error'
        };
      case 'pending':
        return {
          title: 'Under Review',
          message: 'Your application is currently being reviewed by the institution. Please check back later for updates.',
          type: 'info'
        };
      default:
        return {
          title: 'Application Submitted',
          message: 'Your application has been received and is being processed.',
          type: 'info'
        };
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="dashboard-container">
        <div className="container">
          <div className="empty-state">
            <FileIcon />
            <p>Application not found</p>
            <Link to="/student/dashboard" className="btn btn-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusMessage(application.status);

  return (
    <div className="dashboard-container">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <Link to="/student/dashboard" className="btn btn-outline btn-sm mb-4">
              <ArrowLeftIcon />
              Back to Dashboard
            </Link>
            <h1 className="dashboard-title">Application Details</h1>
            <p className="dashboard-subtitle">
              View your application for {application.courseName}
            </p>
          </div>
          <div className="header-actions">
            <span className={getStatusBadge(application.status)}>
              {getStatusIcon(application.status)}
              {application.status}
            </span>
          </div>
        </div>

        {/* Status Alert */}
        <div className={`alert alert-${statusInfo.type} mb-6`}>
          {getStatusIcon(application.status)}
          <div className="alert-content">
            <strong>{statusInfo.title}</strong>
            <p>{statusInfo.message}</p>
          </div>
        </div>

        <div className="main-content-grid">
          {/* Left Column - Application Details */}
          <div className="content-column">
            <div className="card">
              <div className="card-header">
                <h3>Application Information</h3>
              </div>
              <div className="card-body">
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Application ID:</label>
                    <span className="application-id">{application.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Applied Date:</label>
                    <span>
                      {application.createdAt
                        ? new Date(application.createdAt.toDate()).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={getStatusBadge(application.status)}>
                      {application.status}
                    </span>
                  </div>
                  {application.reviewedAt && (
                    <div className="detail-item">
                      <label>Reviewed Date:</label>
                      <span>
                        {new Date(application.reviewedAt.toDate()).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Course Information */}
            <div className="card">
              <div className="card-header">
                <h3>
                  <BookIcon />
                  Course Information
                </h3>
              </div>
              <div className="card-body">
                <div className="course-header">
                  <h4>{application.courseName}</h4>
                  <code>{application.courseCode}</code>
                </div>
                
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Faculty:</label>
                    <span>{application.facultyName || 'Not assigned'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Duration:</label>
                    <span>{application.courseDuration || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Fees:</label>
                    <span>{application.courseFees ? `M${application.courseFees}` : 'Free'}</span>
                  </div>
                </div>
                
                {application.courseDescription && (
                  <div className="detail-section">
                    <label>Course Description:</label>
                    <p>{application.courseDescription}</p>
                  </div>
                )}

                {application.courseRequirements && (
                  <div className="detail-section">
                    <label>Admission Requirements:</label>
                    <p>{application.courseRequirements}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Institution Info and Actions */}
          <div className="content-column">
            {/* Institution Information */}
            <div className="card">
              <div className="card-header">
                <h3>
                  <BuildingIcon />
                  Institution Information
                </h3>
              </div>
              <div className="card-body">
                <div className="institution-header">
                  <h4>{application.institutionName}</h4>
                </div>
                
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Location:</label>
                    <span>{application.institutionLocation || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{application.institutionEmail}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{application.institutionPhone || 'Not provided'}</span>
                  </div>
                </div>

                <div className="contact-actions">
                  <p><strong>Need to contact the institution?</strong></p>
                  <div className="action-buttons">
                    {application.institutionEmail && (
                      <a 
                        href={`mailto:${application.institutionEmail}`}
                        className="btn btn-outline btn-sm"
                      >
                        Send Email
                      </a>
                    )}
                    {application.institutionPhone && (
                      <a 
                        href={`tel:${application.institutionPhone}`}
                        className="btn btn-outline btn-sm"
                      >
                        Call Institution
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="card">
              <div className="card-header">
                <h3>Next Steps</h3>
              </div>
              <div className="card-body">
                {application.status === 'admitted' && (
                  <div className="next-steps">
                    <div className="step-item">
                      <div className="step-number">1</div>
                      <div className="step-content">
                        <strong>Wait for Contact</strong>
                        <p>The institution will contact you with admission details and next steps.</p>
                      </div>
                    </div>
                    <div className="step-item">
                      <div className="step-number">2</div>
                      <div className="step-content">
                        <strong>Prepare Documents</strong>
                        <p>Have your academic documents and identification ready.</p>
                      </div>
                    </div>
                    <div className="step-item">
                      <div className="step-number">3</div>
                      <div className="step-content">
                        <strong>Registration</strong>
                        <p>Complete the registration process as instructed by the institution.</p>
                      </div>
                    </div>
                  </div>
                )}

                {application.status === 'pending' && (
                  <div className="next-steps">
                    <div className="step-item">
                      <div className="step-number">1</div>
                      <div className="step-content">
                        <strong>Application Review</strong>
                        <p>Your application is being reviewed by the institution's admission committee.</p>
                      </div>
                    </div>
                    <div className="step-item">
                      <div className="step-number">2</div>
                      <div className="step-content">
                        <strong>Check Status</strong>
                        <p>Regularly check this page for updates on your application status.</p>
                      </div>
                    </div>
                    <div className="step-item">
                      <div className="step-number">3</div>
                      <div className="step-content">
                        <strong>Explore Alternatives</strong>
                        <p>Consider applying to other courses while waiting for a decision.</p>
                      </div>
                    </div>
                  </div>
                )}

                {application.status === 'rejected' && (
                  <div className="next-steps">
                    <div className="step-item">
                      <div className="step-number">1</div>
                      <div className="step-content">
                        <strong>Explore Other Options</strong>
                        <p>Browse other courses that match your interests and qualifications.</p>
                      </div>
                    </div>
                    <div className="step-item">
                      <div className="step-number">2</div>
                      <div className="step-content">
                        <strong>Improve Qualifications</strong>
                        <p>Consider additional training or courses to strengthen future applications.</p>
                      </div>
                    </div>
                    <div className="step-item">
                      <div className="step-number">3</div>
                      <div className="step-content">
                        <strong>Reapply Next Intake</strong>
                        <p>You can apply again during the next admission cycle.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="quick-actions-grid">
                  <Link to="/student/dashboard" className="quick-action-card">
                    <div className="action-icon">
                      <UserIcon />
                    </div>
                    <div className="action-content">
                      <h4>My Applications</h4>
                      <p>View all your applications</p>
                    </div>
                  </Link>
                  <Link to="/student/courses" className="quick-action-card">
                    <div className="action-icon">
                      <BookIcon />
                    </div>
                    <div className="action-content">
                      <h4>Browse Courses</h4>
                      <p>Explore more courses</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentApplicationDetails;