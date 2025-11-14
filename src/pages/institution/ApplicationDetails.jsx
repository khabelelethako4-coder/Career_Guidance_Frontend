// src/pages/institution/ApplicationDetails.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApplicationById, updateApplicationStatus } from '../../services/applicationService';
import { db } from '../../config/firebase';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeftIcon, CheckIcon, CloseIcon, FileIcon, UserIcon, BuildingIcon, BookIcon } from '../../components/Icons';
import './institution.css';

const InstitutionApplicationDetails = () => {
  const { user } = useAuth();
  const { applicationId } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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

  const handleStatusUpdate = async (newStatus) => {
    if (!application) return;

    setUpdating(true);
    try {
      await updateApplicationStatus(applicationId, newStatus, user.uid);
      
      // Update local state
      setApplication(prev => ({
        ...prev,
        status: newStatus,
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid
      }));
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update application status');
    } finally {
      setUpdating(false);
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
      case 'pending': return <FileIcon />;
      default: return <FileIcon />;
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
            <Link to="/institution/applications" className="btn btn-primary">
              Back to Applications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <Link to="/institution/applications" className="btn btn-outline btn-sm mb-4">
              <ArrowLeftIcon />
              Back to Applications
            </Link>
            <h1 className="dashboard-title">Application Details</h1>
            <p className="dashboard-subtitle">
              Review application from {application.studentName || application.studentEmail}
            </p>
          </div>
          <div className="header-actions">
            <span className={getStatusBadge(application.status)}>
              {getStatusIcon(application.status)}
              {application.status}
            </span>
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
                    <span>{application.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Applied Date:</label>
                    <span>
                      {application.createdAt
                        ? new Date(application.createdAt.toDate()).toLocaleDateString()
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
                        {new Date(application.reviewedAt.toDate()).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div className="card">
              <div className="card-header">
                <h3>
                  <UserIcon />
                  Student Information
                </h3>
              </div>
              <div className="card-body">
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Full Name:</label>
                    <span>{application.studentName || 'Not provided'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{application.studentEmail}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone:</label>
                    <span>{application.studentPhone || 'Not provided'}</span>
                  </div>
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
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Course Name:</label>
                    <span>{application.courseName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Course Code:</label>
                    <span>{application.courseCode}</span>
                  </div>
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
                    <label>Requirements:</label>
                    <p>{application.courseRequirements}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Actions and Institution Info */}
          <div className="content-column">
            {/* Action Buttons */}
            <div className="card">
              <div className="card-header">
                <h3>Application Actions</h3>
              </div>
              <div className="card-body">
                <div className="action-buttons-vertical">
                  {application.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate('admitted')}
                        disabled={updating}
                        className="btn btn-success btn-lg"
                      >
                        <CheckIcon />
                        {updating ? 'Processing...' : 'Admit Student'}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate('rejected')}
                        disabled={updating}
                        className="btn btn-danger btn-lg"
                      >
                        <CloseIcon />
                        {updating ? 'Processing...' : 'Reject Application'}
                      </button>
                    </>
                  )}
                  {application.status === 'admitted' && (
                    <>
                      <div className="alert alert-success">
                        <CheckIcon />
                        <div className="alert-content">
                          <strong>Student Admitted</strong>
                          <p>This student has been admitted to the course.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStatusUpdate('pending')}
                        disabled={updating}
                        className="btn btn-outline"
                      >
                        {updating ? 'Processing...' : 'Revert to Pending'}
                      </button>
                    </>
                  )}
                  {application.status === 'rejected' && (
                    <>
                      <div className="alert alert-error">
                        <CloseIcon />
                        <div className="alert-content">
                          <strong>Application Rejected</strong>
                          <p>This application has been rejected.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStatusUpdate('pending')}
                        disabled={updating}
                        className="btn btn-outline"
                      >
                        {updating ? 'Processing...' : 'Revert to Pending'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Institution Information */}
            <div className="card">
              <div className="card-header">
                <h3>
                  <BuildingIcon />
                  Institution Information
                </h3>
              </div>
              <div className="card-body">
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Institution:</label>
                    <span>{application.institutionName}</span>
                  </div>
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
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="quick-actions-grid">
                  <Link to="/institution/applications" className="quick-action-card">
                    <div className="action-icon">
                      <FileIcon />
                    </div>
                    <div className="action-content">
                      <h4>All Applications</h4>
                      <p>View all student applications</p>
                    </div>
                  </Link>
                  <Link to="/institution/courses" className="quick-action-card">
                    <div className="action-icon">
                      <BookIcon />
                    </div>
                    <div className="action-content">
                      <h4>Manage Courses</h4>
                      <p>View and manage courses</p>
                    </div>
                  </Link>
                  <Link to="/institution/dashboard" className="quick-action-card">
                    <div className="action-icon">
                      <BuildingIcon />
                    </div>
                    <div className="action-content">
                      <h4>Dashboard</h4>
                      <p>Return to dashboard</p>
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

export default InstitutionApplicationDetails;