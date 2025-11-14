import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApplicationsByInstitution } from '../../services/applicationService';
import { db } from '../../config/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  CloseIcon, 
  FileIcon, 
  BuildingIcon, 
  BookIcon, 
  SettingsIcon, 
  ClockIcon, 
  GraduationIcon 
} from '../../components/Icons';
import './institution.css';

// Institution-specific theme colors
const institutionTheme = {
  primary: '#2563eb',      // Blue
  primaryLight: '#dbeafe', // Light blue
  secondary: '#7c3aed',    // Purple
  accent: '#059669'        // Green
};

const institutionStyles = `
.institution-dashboard {
  min-height: 100vh;
  background: var(--background-color);
}

/* Override primary colors for institution theme */
.institution-dashboard .stat-icon {
  background: ${institutionTheme.primary};
}

.institution-dashboard .action-icon {
  background: ${institutionTheme.primaryLight};
}

.institution-dashboard .action-icon .icon {
  fill: ${institutionTheme.primary};
}

.institution-dashboard .action-count {
  background: ${institutionTheme.primary};
}

.institution-dashboard .btn-primary {
  background: ${institutionTheme.primary};
  border-color: ${institutionTheme.primary};
}

.institution-dashboard .btn-primary:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.institution-dashboard .status-badge.status-admitted {
  background: #f0fdf4;
  color: ${institutionTheme.accent};
  border: 1px solid #86efac;
}

.institution-dashboard .quick-action-card:hover,
.institution-dashboard .stat-card:hover,
.institution-dashboard .application-item:hover {
  border-color: ${institutionTheme.primary};
}

/* Rest of your existing CSS remains the same */
.institution-dashboard .dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-2xl);
  gap: var(--spacing-lg);
}

.institution-dashboard .header-content {
  flex: 1;
}

.institution-dashboard .dashboard-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  line-height: 1.2;
}

.institution-dashboard .dashboard-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin-bottom: 0;
  line-height: 1.5;
}

.institution-dashboard .header-actions {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  flex-shrink: 0;
}

/* Stats Grid */
.institution-dashboard .stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.institution-dashboard .stat-card {
  background: var(--surface-color);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.institution-dashboard .stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: ${institutionTheme.primary};
}

.institution-dashboard .stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.institution-dashboard .stat-icon .icon {
  width: 24px;
  height: 24px;
  fill: white;
}

.institution-dashboard .stat-content {
  flex: 1;
}

.institution-dashboard .stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  line-height: 1;
}

.institution-dashboard .stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

/* Main Content Grid - Side by Side Layout */
.institution-dashboard .main-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-2xl);
  align-items: start;
}

.institution-dashboard .content-column {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* Quick Actions */
.institution-dashboard .quick-actions-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.institution-dashboard .quick-action-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  transition: all var(--transition-fast);
  text-decoration: none;
  color: inherit;
  position: relative;
}

.institution-dashboard .quick-action-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: ${institutionTheme.primary};
  text-decoration: none;
  color: inherit;
}

.institution-dashboard .action-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.institution-dashboard .action-icon .icon {
  width: 24px;
  height: 24px;
}

.institution-dashboard .action-content {
  flex: 1;
  min-width: 0;
}

.institution-dashboard .action-title {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  line-height: 1.3;
}

.institution-dashboard .action-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: 0;
  line-height: 1.4;
}

.institution-dashboard .action-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 var(--spacing-sm);
  color: white;
  border-radius: 12px;
  font-size: var(--font-size-xs);
  font-weight: 600;
  margin-top: var(--spacing-xs);
}

.institution-dashboard .action-arrow {
  opacity: 0;
  transform: translateX(-4px);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.institution-dashboard .action-arrow .icon {
  width: 20px;
  height: 20px;
  fill: var(--text-secondary);
}

.institution-dashboard .quick-action-card:hover .action-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Cards */
.institution-dashboard .card {
  background: var(--surface-color);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  height: fit-content;
}

.institution-dashboard .card-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface-color);
}

.institution-dashboard .card-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.institution-dashboard .card-body {
  padding: var(--spacing-lg);
}

/* Academic Sections */
.institution-dashboard .academic-sections {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.institution-dashboard .academic-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.institution-dashboard .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  border-bottom: none;
}

.institution-dashboard .section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
}

.institution-dashboard .section-title .icon {
  width: 18px;
  height: 18px;
  fill: var(--text-secondary);
}

/* Items List */
.institution-dashboard .items-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.institution-dashboard .item-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-md);
  background: var(--background-color);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
  transition: border-color var(--transition-fast);
}

.institution-dashboard .item-row:hover {
  border-color: ${institutionTheme.primary};
}

.institution-dashboard .item-info {
  flex: 1;
  min-width: 0;
}

.institution-dashboard .item-info strong {
  display: block;
  font-size: var(--font-size-base);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  line-height: 1.3;
}

.institution-dashboard .item-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.4;
}

.institution-dashboard .more-items {
  text-align: center;
  padding: var(--spacing-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  background: var(--background-color);
  border-radius: var(--border-radius-md);
  border: 1px dashed var(--border-color);
}

/* Applications List */
.institution-dashboard .applications-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.institution-dashboard .application-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--background-color);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
  gap: var(--spacing-md);
}

.institution-dashboard .application-item:hover {
  border-color: ${institutionTheme.primary};
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.institution-dashboard .application-info {
  flex: 1;
  min-width: 0;
}

.institution-dashboard .application-main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.institution-dashboard .application-main strong {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  font-weight: 600;
  line-height: 1.3;
}

.institution-dashboard .application-course {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.4;
}

.institution-dashboard .application-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.institution-dashboard .application-date {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Status Badges */
.institution-dashboard .status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: var(--font-size-xs);
  font-weight: 500;
  text-transform: capitalize;
  line-height: 1;
}

.institution-dashboard .status-pending {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fcd34d;
}

.institution-dashboard .status-admitted {
  background: #f0fdf4;
  color: ${institutionTheme.accent};
  border: 1px solid #86efac;
}

.institution-dashboard .status-rejected {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

/* Empty States */
.institution-dashboard .empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  color: var(--text-secondary);
}

.institution-dashboard .empty-state .icon {
  width: 48px;
  height: 48px;
  fill: var(--text-muted);
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.institution-dashboard .empty-state p {
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-base);
}

.institution-dashboard .empty-state-small {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--text-secondary);
  background: var(--background-color);
  border-radius: var(--border-radius-md);
  border: 1px dashed var(--border-color);
}

.institution-dashboard .empty-state-small p {
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
}

/* Loading States */
.institution-dashboard .loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-2xl);
}

.institution-dashboard .spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top: 3px solid ${institutionTheme.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Icons */
.institution-dashboard .icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
  flex-shrink: 0;
}

/* Responsive Design for Dashboard */
@media (max-width: 1200px) {
  .institution-dashboard .main-content-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
  
  .institution-dashboard .content-column {
    gap: var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .institution-dashboard .dashboard-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
  }
  
  .institution-dashboard .header-actions {
    justify-content: flex-start;
  }
  
  .institution-dashboard .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
  }
  
  .institution-dashboard .stat-card {
    padding: var(--spacing-md);
    gap: var(--spacing-sm);
  }
  
  .institution-dashboard .stat-icon {
    width: 40px;
    height: 40px;
  }
  
  .institution-dashboard .stat-icon .icon {
    width: 20px;
    height: 20px;
  }
  
  .institution-dashboard .stat-value {
    font-size: var(--font-size-xl);
  }
  
  .institution-dashboard .main-content-grid {
    gap: var(--spacing-lg);
  }
  
  .institution-dashboard .application-item {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }
  
  .institution-dashboard .application-meta {
    justify-content: space-between;
  }
}

@media (max-width: 640px) {
  .institution-dashboard .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .institution-dashboard .quick-action-card {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
  }
  
  .institution-dashboard .action-content {
    text-align: center;
  }
  
  .institution-dashboard .item-row {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }
  
  .institution-dashboard .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }
  
  .institution-dashboard .card-header h3 {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .institution-dashboard .dashboard-title {
    font-size: var(--font-size-xl);
  }
  
  .institution-dashboard .dashboard-subtitle {
    font-size: var(--font-size-sm);
  }
  
  .institution-dashboard .stat-card {
    padding: var(--spacing-md) var(--spacing-sm);
  }
  
  .institution-dashboard .card-body {
    padding: var(--spacing-md);
  }
  
  .institution-dashboard .application-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}
`;

// Stats Icon Component
const StatsIcon = ({ className = "icon" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11V3H8v6H2v12h20V11h-6zm-6-6h4v14h-4V5zm-6 6h4v8H4v-8zm16 8h-4v-6h4v6z"/>
  </svg>
);

const InstitutionDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pending: 0,
    admitted: 0,
    rejected: 0,
    totalFaculties: 0,
    totalCourses: 0
  });

  useEffect(() => {
    // Inject styles on component mount
    const styleSheet = document.createElement('style');
    styleSheet.textContent = institutionStyles;
    document.head.appendChild(styleSheet);

    return () => {
      // Clean up styles on component unmount
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
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
        console.log('📊 Institution faculties:', institutionData.faculties?.length || 0);
        console.log('📚 Institution courses:', institutionData.courses?.length || 0);

        // Fetch applications for this institution
        const appData = await getApplicationsByInstitution(institutionData.id).catch(err => {
          console.error('❌ Error fetching applications:', err);
          return [];
        });

        // Set state with fetched data
        setApplications(appData || []);
        setInstitution(institutionData);

        // Calculate statistics
        const pendingApplications = (appData || []).filter(app => app.status === 'pending').length;
        const admittedApplications = (appData || []).filter(app => app.status === 'admitted').length;
        const rejectedApplications = (appData || []).filter(app => app.status === 'rejected').length;

        const totalFaculties = institutionData?.faculties?.length || 0;
        const totalCourses = institutionData?.courses?.length || 0;

        setStats({
          totalApplications: (appData || []).length,
          pending: pendingApplications,
          admitted: admittedApplications,
          rejected: rejectedApplications,
          totalFaculties: totalFaculties,
          totalCourses: totalCourses
        });

        console.log('📊 Final stats:', {
          applications: (appData || []).length,
          faculties: totalFaculties,
          courses: totalCourses,
          pending: pendingApplications,
          admitted: admittedApplications,
          rejected: rejectedApplications
        });

      } catch (error) {
        console.error('❌ Error fetching institution dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'institution') {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Extract faculties and courses from institution data
  const faculties = institution?.faculties || [];
  const courses = institution?.courses || [];

  // Quick actions data
  const quickActions = [
    {
      title: 'Manage Faculties',
      description: 'Add and manage faculties',
      path: '/institution/faculties',
      icon: <BuildingIcon />,
      count: stats.totalFaculties
    },
    {
      title: 'Manage Courses',
      description: 'Add and manage courses',
      path: '/institution/courses',
      icon: <BookIcon />,
      count: stats.totalCourses
    },
    {
      title: 'View Applications',
      description: 'Review student applications',
      path: '/institution/applications',
      icon: <FileIcon />,
      count: stats.totalApplications
    },
    {
      title: 'Institution Profile',
      description: 'Update institution information',
      path: '/institution/profile',
      icon: <SettingsIcon />,
      count: null
    }
  ];

  if (loading) {
    return (
      <div className="institution-dashboard">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'institution') {
    return (
      <div className="institution-dashboard">
        <div className="container">
          <div className="empty-state">
            <BuildingIcon />
            <h3>Access Denied</h3>
            <p>You don't have permission to access the institution dashboard.</p>
            <Link to="/" className="btn btn-primary">
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="institution-dashboard">
        <div className="container">
          <div className="empty-state">
            <BuildingIcon />
            <h3>No Institution Found</h3>
            <p>You are not associated with any institution yet.</p>
            <p>Please contact support or complete your institution registration.</p>
            <Link to="/institution/profile" className="btn btn-primary">
              Complete Registration
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="institution-dashboard">
      <div className="container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">
              Welcome, {institution.name}
            </h1>
            <p className="dashboard-subtitle">
              Manage your institution's academic programs and student applications
            </p>
          </div>
          <div className="header-actions">
            <Link to="/institution/profile" className="btn btn-outline">
              <SettingsIcon />
              Update Profile
            </Link>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <StatsIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalApplications}</div>
              <div className="stat-label">Total Applications</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <ClockIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending Review</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <CheckIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.admitted}</div>
              <div className="stat-label">Admitted Students</div>
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

        {/* Main Content Grid - Side by Side Layout */}
        <div className="main-content-grid">
          {/* Left Column - Quick Actions & Academic Structure */}
          <div className="content-column">
            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="quick-actions-grid">
                  {quickActions.map((action, index) => (
                    <Link key={index} to={action.path} className="quick-action-card">
                      <div className="action-icon">{action.icon}</div>
                      <div className="action-content">
                        <h4 className="action-title">{action.title}</h4>
                        <p className="action-description">{action.description}</p>
                        {action.count !== null && action.count !== undefined && (
                          <div className="action-count">{action.count}</div>
                        )}
                      </div>
                      <div className="action-arrow">
                        →
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Academic Structure */}
            <div className="card">
              <div className="card-header">
                <h3>Academic Structure</h3>
              </div>
              <div className="card-body">
                <div className="academic-sections">
                  {/* Faculties Section */}
                  <div className="academic-section">
                    <div className="section-header">
                      <div className="section-title">
                        <BuildingIcon />
                        <span>Faculties ({stats.totalFaculties})</span>
                      </div>
                      <Link to="/institution/faculties" className="btn btn-outline btn-sm">
                        Manage
                      </Link>
                    </div>
                    {faculties.length > 0 ? (
                      <div className="items-list">
                        {faculties.slice(0, 4).map((faculty, index) => (
                          <div key={faculty.id || index} className="item-row">
                            <div className="item-info">
                              <strong>{faculty.name}</strong>
                              <span className="item-description">
                                {faculty.description || 'No description available'}
                              </span>
                            </div>
                          </div>
                        ))}
                        {faculties.length > 4 && (
                          <div className="more-items">
                            +{faculties.length - 4} more faculties
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="empty-state-small">
                        <p>No faculties added yet</p>
                        <Link to="/institution/faculties" className="btn btn-primary btn-sm">
                          Add First Faculty
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Courses Section */}
                  <div className="academic-section">
                    <div className="section-header">
                      <div className="section-title">
                        <BookIcon />
                        <span>Courses ({stats.totalCourses})</span>
                      </div>
                      <Link to="/institution/courses" className="btn btn-outline btn-sm">
                        Manage
                      </Link>
                    </div>
                    {courses.length > 0 ? (
                      <div className="items-list">
                        {courses.slice(0, 4).map((course, index) => (
                          <div key={course.id || index} className="item-row">
                            <div className="item-info">
                              <strong>{course.name}</strong>
                              <span className="item-description">
                                {course.facultyName || course.facultyId || 'No faculty assigned'}
                              </span>
                            </div>
                          </div>
                        ))}
                        {courses.length > 4 && (
                          <div className="more-items">
                            +{courses.length - 4} more courses
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="empty-state-small">
                        <p>No courses added yet</p>
                        <Link to="/institution/courses" className="btn btn-primary btn-sm">
                          Add First Course
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Applications */}
          <div className="content-column">
            <div className="card">
              <div className="card-header">
                <h3>Recent Applications</h3>
                <Link to="/institution/applications" className="btn btn-outline btn-sm">
                  View All
                </Link>
              </div>
              <div className="card-body">
                {applications.length === 0 ? (
                  <div className="empty-state">
                    <FileIcon />
                    <p>No applications yet</p>
                    <Link to="/institution/courses" className="btn btn-primary btn-sm">
                      Manage Courses
                    </Link>
                  </div>
                ) : (
                  <div className="applications-list">
                    {applications.slice(0, 8).map((app) => (
                      <div key={app.id} className="application-item">
                        <div className="application-info">
                          <div className="application-main">
                            <strong>{app.studentName || app.studentEmail || 'N/A'}</strong>
                            <span className="application-course">{app.courseName || 'N/A'}</span>
                          </div>
                          <div className="application-meta">
                            <span className="application-date">
                              {app.createdAt
                                ? new Date(app.createdAt.toDate()).toLocaleDateString()
                                : 'N/A'}
                            </span>
                            <span className={`status-badge status-${app.status}`}>
                              {app.status}
                            </span>
                          </div>
                        </div>
                        <Link
                          to={`/institution/application/${app.id}`}
                          className="btn btn-primary btn-sm"
                        >
                          Review
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDashboard;