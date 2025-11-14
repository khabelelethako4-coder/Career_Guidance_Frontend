import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInstitutions } from '../../services/institutionService';
import { getAllCompanies } from '../../services/userService';
import './admin.css'; 

// Icon Components
const BuildingIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M19 2H9c-1.1 0-2 .9-2 2v6H5c-1.1 0-2 .9-2 2v9c0 .6.4 1 1 1h16c.6 0 1-.4 1-1V4c0-1.1-.9-2-2-2zm-8 16h-2v-2h2v2zm4 0h-2v-2h2v2zm4-4H5v-2h14v2z"/></svg>;
const BusinessIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>;
const CheckIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
const ClockIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>;
const SettingsIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>;
const AddIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>;
const FacultyIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>;
const CourseIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>;
const UploadIcon = () => <svg className="icon" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>;

const AdminDashboard = () => {
  const [institutions, setInstitutions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('institutions');
  const [expandedInstitution, setExpandedInstitution] = useState(null);
  const [stats, setStats] = useState({
    totalInstitutions: 0,
    totalCompanies: 0,
    approvedCompanies: 0,
    pendingCompanies: 0,
    totalFaculties: 0,
    totalCourses: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [instData, compData] = await Promise.all([
          getInstitutions(),
          getAllCompanies()
        ]);
        
        setInstitutions(instData);
        setCompanies(compData);
        
        const approvedCompanies = compData.filter(c => c.status === 'approved').length;
        const pendingCompanies = compData.filter(c => c.status === 'pending').length;

        // Calculate faculties and courses stats
        const totalFaculties = instData.reduce((sum, inst) => sum + (inst.faculties?.length || 0), 0);
        const totalCourses = instData.reduce((sum, inst) => sum + (inst.courses?.length || 0), 0);

        setStats({
          totalInstitutions: instData.length,
          totalCompanies: compData.length,
          approvedCompanies,
          pendingCompanies,
          totalFaculties,
          totalCourses
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Quick actions data - UPDATED WITH BULK IMPORT
  const quickActions = [
    {
      title: 'Add Institution',
      description: 'Register new educational institution',
      path: '/admin/add-institution',
      icon: <AddIcon />,
      color: 'primary'
    },
    {
      title: 'Bulk Import',
      description: 'Import sample Lesotho institutions',
      path: '/admin/bulk-import',
      icon: <UploadIcon />,
      color: 'secondary'
    },
    {
      title: 'Manage Institutions',
      description: 'View and edit institution profiles',
      path: '/admin/institutions',
      icon: <BuildingIcon />,
      count: stats.totalInstitutions
    },
    {
      title: 'Manage Faculties',
      description: 'Add and manage faculties across institutions',
      path: '/admin/institutions',
      icon: <FacultyIcon />,
      count: stats.totalFaculties
    },
    {
      title: 'Manage Courses',
      description: 'Add and manage courses across faculties',
      path: '/admin/institutions',
      icon: <CourseIcon />,
      count: stats.totalCourses
    },
    {
      title: 'Manage Companies',
      description: 'Approve and manage company accounts',
      path: '/admin/companies',
      icon: <BusinessIcon />,
      count: stats.totalCompanies
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      path: '/admin/settings',
      icon: <SettingsIcon />
    }
  ];

  const toggleInstitutionExpansion = (institutionId) => {
    setExpandedInstitution(expandedInstitution === institutionId ? null : institutionId);
  };

  const getFacultyStats = (institution) => {
    const faculties = institution.faculties || [];
    const courses = institution.courses || [];
    
    return {
      facultyCount: faculties.length,
      courseCount: courses.length,
      coursesPerFaculty: faculties.length > 0 ? (courses.length / faculties.length).toFixed(1) : '0'
    };
  };

  return (
    <div className="admin-dashboard">
      <div className="container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">Admin Dashboard</h1>
            <p className="dashboard-subtitle">
              Manage institutions, faculties, courses, companies, and system settings
            </p>
          </div>
          <div className="header-actions">
            <Link to="/admin/settings" className="btn btn-outline">
              <SettingsIcon />
              System Settings
            </Link>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <BuildingIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalInstitutions}</div>
              <div className="stat-label">Total Institutions</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <FacultyIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalFaculties}</div>
              <div className="stat-label">Total Faculties</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <CourseIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalCourses}</div>
              <div className="stat-label">Total Courses</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <BusinessIcon />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalCompanies}</div>
              <div className="stat-label">Total Companies</div>
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
              {quickActions.map((action, index) => (
                <Link key={index} to={action.path} className="quick-action-card">
                  <div className="action-icon">{action.icon}</div>
                  <div className="action-content">
                    <h4 className="action-title">{action.title}</h4>
                    <p className="action-description">{action.description}</p>
                    {action.count !== undefined && (
                      <div className="action-count">{action.count}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="card">
          <div className="card-header">
            <div className="tabs-header">
              <button
                className={`tab-button ${activeTab === 'institutions' ? 'active' : ''}`}
                onClick={() => setActiveTab('institutions')}
              >
                <BuildingIcon />
                Institutions ({stats.totalInstitutions})
              </button>
              <button
                className={`tab-button ${activeTab === 'companies' ? 'active' : ''}`}
                onClick={() => setActiveTab('companies')}
              >
                <BusinessIcon />
                Companies ({stats.totalCompanies})
              </button>
            </div>
          </div>

          <div className="card-body">
            {loading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                {activeTab === 'institutions' && (
                  <div className="tab-content">
                    {institutions.length === 0 ? (
                      <div className="empty-state">
                        <BuildingIcon />
                        <p>No institutions registered yet</p>
                        <div className="empty-state-actions">
                          <Link to="/admin/add-institution" className="btn btn-primary">
                            Add First Institution
                          </Link>
                          <Link to="/admin/bulk-import" className="btn btn-secondary">
                            Bulk Import Sample Data
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="institutions-list">
                        {institutions.map((institution) => {
                          const stats = getFacultyStats(institution);
                          const isExpanded = expandedInstitution === institution.id;
                          
                          return (
                            <div key={institution.id} className="institution-card">
                              <div className="institution-header">
                                <div className="institution-info">
                                  <h4 className="institution-name">{institution.name}</h4>
                                  <div className="institution-meta">
                                    <span className="institution-email">{institution.email}</span>
                                    <span className="institution-location">{institution.location}</span>
                                    <span className={`status-badge status-${institution.status || 'active'}`}>
                                      {institution.status || 'active'}
                                    </span>
                                  </div>
                                  <div className="institution-stats">
                                    <div className="stat-item">
                                      <FacultyIcon />
                                      <span>{stats.facultyCount} Faculties</span>
                                    </div>
                                    <div className="stat-item">
                                      <CourseIcon />
                                      <span>{stats.courseCount} Courses</span>
                                    </div>
                                    <div className="stat-item">
                                      <span>Avg: {stats.coursesPerFaculty} courses/faculty</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="institution-actions">
                                  <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => toggleInstitutionExpansion(institution.id)}
                                  >
                                    {isExpanded ? 'Hide Details' : 'View Details'}
                                  </button>
                                  <Link
                                    to={`/admin/institution/${institution.id}`}
                                    className="btn btn-primary btn-sm"
                                  >
                                    Manage
                                  </Link>
                                  <Link
                                    to={`/admin/institution/${institution.id}/faculties`}
                                    className="btn btn-secondary btn-sm"
                                  >
                                    Manage Faculties
                                  </Link>
                                  <Link
                                    to={`/admin/institution/${institution.id}/courses`}
                                    className="btn btn-secondary btn-sm"
                                  >
                                    Manage Courses
                                  </Link>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="institution-details">
                                  {/* Faculties Section */}
                                  <div className="details-section">
                                    <h5>Faculties</h5>
                                    {institution.faculties?.length > 0 ? (
                                      <div className="faculties-list">
                                        {institution.faculties.map((faculty, index) => (
                                          <div key={index} className="faculty-item">
                                            <div className="faculty-info">
                                              <strong>{faculty.name}</strong>
                                              <span className="faculty-description">
                                                {faculty.description || 'No description'}
                                              </span>
                                            </div>
                                            <div className="faculty-courses">
                                              {faculty.courses?.length || 0} courses
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="empty-section">
                                        <p>No faculties added yet</p>
                                        <Link 
                                          to={`/admin/institution/${institution.id}/faculties`}
                                          className="btn btn-primary btn-sm"
                                        >
                                          Add First Faculty
                                        </Link>
                                      </div>
                                    )}
                                  </div>

                                  {/* Courses Section */}
                                  <div className="details-section">
                                    <h5>Courses</h5>
                                    {institution.courses?.length > 0 ? (
                                      <div className="courses-list">
                                        {institution.courses.slice(0, 5).map((course, index) => (
                                          <div key={index} className="course-item">
                                            <div className="course-info">
                                              <strong>{course.name}</strong>
                                              <span className="course-meta">
                                                {course.facultyName || 'No faculty assigned'} • 
                                                {course.duration || 'N/A'} • 
                                                {course.fees ? `$${course.fees}` : 'Free'}
                                              </span>
                                            </div>
                                            <span className={`status-badge status-${course.status || 'active'}`}>
                                              {course.status || 'active'}
                                            </span>
                                          </div>
                                        ))}
                                        {institution.courses.length > 5 && (
                                          <div className="more-items">
                                            +{institution.courses.length - 5} more courses
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="empty-section">
                                        <p>No courses added yet</p>
                                        <Link 
                                          to={`/admin/institution/${institution.id}/courses`}
                                          className="btn btn-primary btn-sm"
                                        >
                                          Add First Course
                                        </Link>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'companies' && (
                  <div className="tab-content">
                    {companies.length === 0 ? (
                      <div className="empty-state">
                        <BusinessIcon />
                        <p>No companies registered yet</p>
                      </div>
                    ) : (
                      <div className="table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Company Name</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Industry</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {companies.map((company) => (
                              <tr key={company.id}>
                                <td>
                                  <div className="entity-info">
                                    <strong>{company.name || 'N/A'}</strong>
                                  </div>
                                </td>
                                <td>{company.email || 'N/A'}</td>
                                <td>{company.phone || 'N/A'}</td>
                                <td>{company.industry || 'N/A'}</td>
                                <td>
                                  <span className={`status-badge status-${company.status}`}>
                                    {company.status}
                                  </span>
                                </td>
                                <td>
                                  <div className="action-buttons">
                                    <Link
                                      to={`/admin/company/${company.id}`}
                                      className="btn btn-primary btn-sm"
                                    >
                                      Manage
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* REMOVED style jsx section - move CSS to admin.css */}
    </div>
  );
};

export default AdminDashboard;