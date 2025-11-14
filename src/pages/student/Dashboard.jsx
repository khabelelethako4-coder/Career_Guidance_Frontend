// src/pages/student/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStudentJobApplications, getMatchingJobs } from '../../services/jobService';
import { getStudentCourseApplications } from '../../services/applicationService';
import { getStudentDocuments } from '../../services/documentService';
import { getStudentNotifications } from '../../services/notificationService';
import AdmissionSelection from '../../components/student/AdmissionSelection';
import { 
  BriefcaseIcon, BookIcon, ClockIcon, CheckIcon, UserIcon, 
  FileIcon, BellIcon, AlertIcon, DocumentIcon 
} from '../../components/Icons';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [jobApplications, setJobApplications] = useState([]);
  const [courseApplications, setCourseApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobsApplied: 0,
    pendingJobs: 0,
    acceptedJobs: 0,
    totalCoursesApplied: 0,
    pendingCourses: 0,
    admittedCourses: 0,
    documentsUploaded: 0,
    unreadNotifications: 0
  });

  useEffect(() => {
    if (user?.uid) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use Promise.allSettled to handle individual service failures gracefully
      const results = await Promise.allSettled([
        getStudentJobApplications(user.uid).catch(() => []),
        getStudentCourseApplications(user.uid).catch(() => []),
        getStudentDocuments(user.uid).catch(() => []),
        getStudentNotifications(user.uid).catch(() => []),
        getMatchingJobs(user.uid).catch(() => [])
      ]);
      
      // Extract results from settled promises
      const [
        jobAppsResult,
        courseAppsResult,
        docsResult,
        notifsResult,
        matchingJobsResult
      ] = results;

      const jobApps = jobAppsResult.status === 'fulfilled' ? jobAppsResult.value : [];
      const courseApps = courseAppsResult.status === 'fulfilled' ? courseAppsResult.value : [];
      const docs = docsResult.status === 'fulfilled' ? docsResult.value : [];
      const notifs = notifsResult.status === 'fulfilled' ? notifsResult.value : [];
      const matchingJobsData = matchingJobsResult.status === 'fulfilled' ? matchingJobsResult.value : [];
      
      setJobApplications(jobApps.slice(0, 5));
      setCourseApplications(courseApps.slice(0, 5));
      setDocuments(docs);
      setNotifications(notifs.slice(0, 5));
      setMatchingJobs(matchingJobsData.slice(0, 3));
      
      // Calculate stats with fallbacks for failed services
      const jobStats = {
        totalJobsApplied: jobApps.length,
        pendingJobs: jobApps.filter(app => app.status === 'pending').length,
        acceptedJobs: jobApps.filter(app => app.status === 'accepted').length
      };
      
      const courseStats = {
        totalCoursesApplied: courseApps.length,
        pendingCourses: courseApps.filter(app => app.status === 'pending').length,
        admittedCourses: courseApps.filter(app => app.status === 'admitted').length
      };

      const documentStats = {
        documentsUploaded: docs.length,
        unreadNotifications: notifs.filter(n => !n.read).length
      };
      
      setStats({
        ...jobStats,
        ...courseStats,
        ...documentStats
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Set empty states on complete failure
      setJobApplications([]);
      setCourseApplications([]);
      setDocuments([]);
      setNotifications([]);
      setMatchingJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'pending', label: 'Pending' },
      accepted: { class: 'accepted', label: 'Accepted' },
      rejected: { class: 'rejected', label: 'Rejected' },
      admitted: { class: 'admitted', label: 'Admitted' },
      under_review: { class: 'pending', label: 'Under Review' }
    };
    
    const config = statusConfig[status] || { class: 'pending', label: status };
    return <span className={`status-badge status-${config.class}`}>{config.label}</span>;
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

  return (
    <div className="dashboard-container">
      <div className="container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">
              Welcome back, {user?.profile?.firstName || 'Student'}!
            </h1>
            <p className="dashboard-subtitle">
              Track your applications and discover new opportunities
            </p>
          </div>
          <div className="header-actions">
            <Link to="/student/notifications" className="btn btn-outline btn-sm relative">
              <BellIcon />
              Notifications
              {stats.unreadNotifications > 0 && (
                <span className="badge badge-danger badge-sm absolute -top-2 -right-2">
                  {stats.unreadNotifications}
                </span>
              )}
            </Link>
            <Link to="/student/profile" className="btn btn-outline btn-sm">
              <UserIcon />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Admission Selection - Show if multiple admissions */}
        <AdmissionSelection />

        {/* Statistics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <BriefcaseIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalJobsApplied}</div>
              <div className="stat-label">Jobs Applied</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <BookIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalCoursesApplied}</div>
              <div className="stat-label">Courses Applied</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <ClockIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.pendingJobs + stats.pendingCourses}</div>
              <div className="stat-label">Pending Reviews</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <CheckIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.acceptedJobs + stats.admittedCourses}</div>
              <div className="stat-label">Accepted</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <DocumentIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.documentsUploaded}</div>
              <div className="stat-label">Documents</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <BellIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.unreadNotifications}</div>
              <div className="stat-label">Notifications</div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Recent Job Applications */}
          <div className="dashboard-column">
            <div className="card">
              <div className="card-header">
                <h3>Recent Job Applications</h3>
                <Link to="/student/jobs" className="btn-link">
                  View All
                </Link>
              </div>
              <div className="card-body">
                {jobApplications.length === 0 ? (
                  <div className="empty-state-small">
                    <BriefcaseIcon />
                    <p>No job applications yet</p>
                    <Link to="/student/jobs" className="btn btn-primary btn-sm">
                      Browse Jobs
                    </Link>
                  </div>
                ) : (
                  <div className="applications-list">
                    {jobApplications.map((application) => (
                      <div key={application.id} className="application-item">
                        <div className="application-info">
                          <div className="application-main">
                            <strong>{application.job?.title || 'Job'}</strong>
                            <span className="application-company">
                              {application.company?.name || application.job?.companyName || 'Company'}
                            </span>
                          </div>
                          <div className="application-meta">
                            <span className="application-date">
                              {application.appliedAt ? 
                                new Date(application.appliedAt.toDate()).toLocaleDateString() : 
                                'N/A'
                              }
                            </span>
                            {getStatusBadge(application.status)}
                          </div>
                        </div>
                        <Link
                          to={`/student/job-application/${application.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Matching Job Opportunities */}
            <div className="card">
              <div className="card-header">
                <h3>Matching Jobs</h3>
                <Link to="/student/jobs?filter=matching" className="btn-link">
                  View All
                </Link>
              </div>
              <div className="card-body">
                {matchingJobs.length === 0 ? (
                  <div className="empty-state-small">
                    <BriefcaseIcon />
                    <p>No matching jobs found</p>
                  </div>
                ) : (
                  <div className="matching-jobs-list">
                    {matchingJobs.map((job) => (
                      <div key={job.id} className="matching-job-item">
                        <div className="job-info">
                          <strong>{job.title}</strong>
                          <span className="company-name">{job.companyName}</span>
                          <span className="match-score">
                            {job.matchScore}% match
                          </span>
                        </div>
                        <Link
                          to={`/student/job/${job.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          Apply
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Course Applications */}
          <div className="dashboard-column">
            <div className="card">
              <div className="card-header">
                <h3>Recent Course Applications</h3>
                <Link to="/student/courses" className="btn-link">
                  View All
                </Link>
              </div>
              <div className="card-body">
                {courseApplications.length === 0 ? (
                  <div className="empty-state-small">
                    <BookIcon />
                    <p>No course applications yet</p>
                    <Link to="/student/courses" className="btn btn-primary btn-sm">
                      Browse Courses
                    </Link>
                  </div>
                ) : (
                  <div className="applications-list">
                    {courseApplications.map((application) => (
                      <div key={application.id} className="application-item">
                        <div className="application-info">
                          <div className="application-main">
                            <strong>{application.courseName || 'Course'}</strong>
                            <span className="application-institution">
                              {application.institutionName || 'Institution'}
                            </span>
                          </div>
                          <div className="application-meta">
                            <span className="application-date">
                              {application.createdAt ? 
                                new Date(application.createdAt.toDate()).toLocaleDateString() : 
                                'N/A'
                              }
                            </span>
                            {getStatusBadge(application.status)}
                          </div>
                        </div>
                        <Link
                          to={`/student/application/${application.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="card">
              <div className="card-header">
                <h3>Recent Notifications</h3>
                <Link to="/student/notifications" className="btn-link">
                  View All
                </Link>
              </div>
              <div className="card-body">
                {notifications.length === 0 ? (
                  <div className="empty-state-small">
                    <BellIcon />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="notifications-list">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
                        <div className="notification-icon">
                          {notification.type === 'job_match' && <BriefcaseIcon />}
                          {notification.type === 'admission' && <CheckIcon />}
                          {notification.type === 'application_update' && <AlertIcon />}
                        </div>
                        <div className="notification-content">
                          <p>{notification.message}</p>
                          <span className="notification-time">
                            {new Date(notification.createdAt.toDate()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              <Link to="/student/jobs" className="quick-action-card">
                <div className="action-icon">
                  <BriefcaseIcon />
                </div>
                <div className="action-content">
                  <h4>Browse Jobs</h4>
                  <p>Find job opportunities that match your skills</p>
                </div>
              </Link>

              <Link to="/student/courses" className="quick-action-card">
                <div className="action-icon">
                  <BookIcon />
                </div>
                <div className="action-content">
                  <h4>Browse Courses</h4>
                  <p>Discover courses to enhance your education</p>
                </div>
              </Link>

              <Link to="/student/documents" className="quick-action-card">
                <div className="action-icon">
                  <DocumentIcon />
                </div>
                <div className="action-content">
                  <h4>Manage Documents</h4>
                  <p>Upload transcripts and certificates</p>
                </div>
              </Link>

              <Link to="/student/profile" className="quick-action-card">
                <div className="action-icon">
                  <UserIcon />
                </div>
                <div className="action-content">
                  <h4>Update Profile</h4>
                  <p>Keep your profile and resume up to date</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;