import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApplicationsByInstitution } from '../../services/applicationService';
import { db } from '../../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { FileIcon, ArrowLeftIcon, CheckIcon, CloseIcon, ClockIcon, SearchIcon } from '../../components/Icons';
import './institution.css';

const InstitutionApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchInstitutionAndApplications();
  }, [user]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const fetchInstitutionAndApplications = async () => {
    try {
      if (!user?.uid) {
        console.log('❌ No user found');
        setLoading(false);
        return;
      }

      console.log('🔍 Finding institution for user:', user.uid);

      // Find institution by adminId (user's UID)
      const institutionsQuery = query(
        collection(db, 'institutions'), 
        where('adminId', '==', user.uid)
      );
      
      const institutionsSnapshot = await getDocs(institutionsQuery);
      
      if (institutionsSnapshot.empty) {
        console.log('❌ No institution found for admin:', user.uid);
        setLoading(false);
        return;
      }

      // Get the first institution (should only be one per admin)
      const institutionDoc = institutionsSnapshot.docs[0];
      const institutionData = { 
        id: institutionDoc.id, 
        ...institutionDoc.data() 
      };

      console.log('🏫 Institution found:', institutionData.name);

      // Fetch applications for this institution
      const appData = await getApplicationsByInstitution(institutionData.id).catch(err => {
        console.error('❌ Error fetching applications:', err);
        return [];
      });

      setApplications(appData || []);
      setInstitution(institutionData);

    } catch (error) {
      console.error('❌ Error fetching institution applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
        reviewedAt: serverTimestamp(),
        reviewedBy: user.uid
      });

      // Update local state
      setApplications(prev => prev.map(app =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error('Error updating application status:', error);
    } finally {
      setUpdatingId(null);
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

  if (!institution) {
    return (
      <div className="dashboard-container">
        <div className="container">
          <div className="empty-state">
            <FileIcon />
            <h3>No Institution Found</h3>
            <p>You are not associated with any institution yet.</p>
            <Link to="/institution/profile" className="btn btn-primary">
              Complete Registration
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
            <Link to="/institution/dashboard" className="btn btn-outline btn-sm mb-4">
              <ArrowLeftIcon />
              Back to Dashboard
            </Link>
            <h1 className="dashboard-title">Student Applications</h1>
            <p className="dashboard-subtitle">
              Review and manage student applications for {institution.name}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="card-body">
            <div className="filters-grid">
              <div className="search-box">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search by student name, email, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Applications</option>
                  <option value="pending">Pending Review</option>
                  <option value="admitted">Admitted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="card">
          <div className="card-header">
            <h3>
              Applications ({filteredApplications.length})
              {statusFilter !== 'all' && (
                <span className="filter-indicator"> - {statusFilter}</span>
              )}
            </h3>
          </div>
          <div className="card-body">
            {filteredApplications.length === 0 ? (
              <div className="empty-state">
                <FileIcon />
                <p>
                  {applications.length === 0 
                    ? 'No applications received yet' 
                    : 'No applications match your filters'
                  }
                </p>
                {applications.length === 0 && (
                  <Link to="/institution/courses" className="btn btn-primary">
                    Manage Courses
                  </Link>
                )}
              </div>
            ) : (
              <div className="applications-list">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="application-card">
                    <div className="application-header">
                      <div className="application-student">
                        <h4>{application.studentName || application.studentEmail}</h4>
                        <p className="application-email">{application.studentEmail}</p>
                      </div>
                      <div className="application-status">
                        <span className={getStatusBadge(application.status)}>
                          {getStatusIcon(application.status)}
                          {application.status}
                        </span>
                      </div>
                    </div>

                    <div className="application-details">
                      <div className="detail-group">
                        <strong>Course:</strong>
                        <span>{application.courseName}</span>
                      </div>
                      <div className="detail-group">
                        <strong>Applied:</strong>
                        <span>
                          {application.createdAt
                            ? new Date(application.createdAt.toDate()).toLocaleDateString()
                            : 'N/A'
                          }
                        </span>
                      </div>
                      {application.reviewedAt && (
                        <div className="detail-group">
                          <strong>Reviewed:</strong>
                          <span>
                            {new Date(application.reviewedAt.toDate()).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="application-actions">
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'admitted')}
                            disabled={updatingId === application.id}
                            className="btn btn-success btn-sm"
                          >
                            {updatingId === application.id ? 'Processing...' : 'Admit'}
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            disabled={updatingId === application.id}
                            className="btn btn-danger btn-sm"
                          >
                            {updatingId === application.id ? 'Processing...' : 'Reject'}
                          </button>
                        </>
                      )}
                      {application.status === 'admitted' && (
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'pending')}
                          disabled={updatingId === application.id}
                          className="btn btn-outline btn-sm"
                        >
                          {updatingId === application.id ? 'Processing...' : 'Revert to Pending'}
                        </button>
                      )}
                      {application.status === 'rejected' && (
                        <button
                          onClick={() => updateApplicationStatus(application.id, 'pending')}
                          disabled={updatingId === application.id}
                          className="btn btn-outline btn-sm"
                        >
                          {updatingId === application.id ? 'Processing...' : 'Revert to Pending'}
                        </button>
                      )}
                      <Link
                        to={`/institution/application/${application.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="stats-grid mt-6">
          <div className="stat-card">
            <div className="stat-icon">
              <FileIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{applications.length}</div>
              <div className="stat-label">Total Applications</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <ClockIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {applications.filter(app => app.status === 'pending').length}
              </div>
              <div className="stat-label">Pending Review</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <CheckIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {applications.filter(app => app.status === 'admitted').length}
              </div>
              <div className="stat-label">Admitted</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <CloseIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {applications.filter(app => app.status === 'rejected').length}
              </div>
              <div className="stat-label">Rejected</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionApplications;