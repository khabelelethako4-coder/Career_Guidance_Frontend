import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getInstitutionById, updateInstitution } from '../../services/institutionService';
import { BuildingIcon, ArrowLeftIcon, FacultyIcon, CourseIcon } from "../../components/Icons";

const EditInstitution = () => {
  const { institutionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'faculties', 'courses'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    location: '',
    website: '',
    description: '',
    establishedYear: '',
    type: 'university',
    status: 'active'
  });
  const [institution, setInstitution] = useState(null);

  useEffect(() => {
    fetchInstitution();
  }, [institutionId]);

  const fetchInstitution = async () => {
    try {
      const institutionData = await getInstitutionById(institutionId);
      if (institutionData) {
        setInstitution(institutionData);
        setFormData(institutionData);
      } else {
        alert('Institution not found');
        navigate('/admin/institutions');
      }
    } catch (error) {
      console.error('Error fetching institution:', error);
      alert('Failed to load institution data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await updateInstitution(institutionId, formData);
      alert('Institution updated successfully');
      // Refresh institution data
      fetchInstitution();
    } catch (error) {
      console.error('Error updating institution:', error);
      alert('Failed to update institution');
    } finally {
      setSaving(false);
    }
  };

  const getFacultyStats = () => {
    const faculties = institution?.faculties || [];
    const courses = institution?.courses || [];
    
    return {
      facultyCount: faculties.length,
      courseCount: courses.length,
      coursesPerFaculty: faculties.length > 0 ? (courses.length / faculties.length).toFixed(1) : '0'
    };
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

  const stats = getFacultyStats();

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-content">
            <button 
              onClick={() => navigate('/admin/institutions')}
              className="btn btn-outline btn-sm"
              style={{ marginBottom: '1rem' }}
            >
              <ArrowLeftIcon />
              Back to Institutions
            </button>
            <h1 className="dashboard-title">{institution?.name}</h1>
            <p className="dashboard-subtitle">
              Manage institution information, faculties, and courses
            </p>
          </div>
          <div className="header-actions">
            <div className="institution-stats" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="stat-item">
                <FacultyIcon />
                <span>{stats.facultyCount} Faculties</span>
              </div>
              <div className="stat-item">
                <CourseIcon />
                <span>{stats.courseCount} Courses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body">
            <div className="quick-actions-grid" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link 
                to={`/admin/institution/${institutionId}/faculties`}
                className="btn btn-primary"
              >
                <FacultyIcon />
                Manage Faculties
              </Link>
              <Link 
                to={`/admin/institution/${institutionId}/courses`}
                className="btn btn-primary"
              >
                <CourseIcon />
                Manage Courses
              </Link>
              <Link 
                to={`/admin/institutions`}
                className="btn btn-outline"
              >
                Back to All Institutions
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="card-header">
            <div className="tabs-header">
              <button
                className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                <BuildingIcon />
                Institution Details
              </button>
              <button
                className={`tab-button ${activeTab === 'faculties' ? 'active' : ''}`}
                onClick={() => setActiveTab('faculties')}
              >
                <FacultyIcon />
                Faculties ({stats.facultyCount})
              </button>
              <button
                className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
                onClick={() => setActiveTab('courses')}
              >
                <CourseIcon />
                Courses ({stats.courseCount})
              </button>
            </div>
          </div>

          <div className="card-body">
            {activeTab === 'details' && (
              <form onSubmit={handleSubmit} className="form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Institution Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="type">Institution Type</label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                    >
                      <option value="university">University</option>
                      <option value="college">College</option>
                      <option value="institute">Institute</option>
                      <option value="polytechnic">Polytechnic</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="establishedYear">Established Year</label>
                    <input
                      type="number"
                      id="establishedYear"
                      name="establishedYear"
                      value={formData.establishedYear}
                      onChange={handleChange}
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="website">Website</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="address">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="location">Location/City</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/institutions')}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Update Institution'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'faculties' && (
              <div className="tab-content">
                <div className="section-header">
                  <h3>Faculties</h3>
                  <Link 
                    to={`/admin/institution/${institutionId}/faculties`}
                    className="btn btn-primary"
                  >
                    <FacultyIcon />
                    Manage All Faculties
                  </Link>
                </div>
                
                {institution?.faculties?.length > 0 ? (
                  <div className="entities-list">
                    {institution.faculties.slice(0, 5).map((faculty, index) => (
                      <div key={faculty.id || index} className="entity-card">
                        <div className="entity-info">
                          <h4>{faculty.name}</h4>
                          {faculty.description && (
                            <p className="entity-description">{faculty.description}</p>
                          )}
                          <div className="entity-meta">
                            {faculty.dean && <span>Dean: {faculty.dean}</span>}
                            {faculty.email && <span>Email: {faculty.email}</span>}
                            <span>Courses: {faculty.courses?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {institution.faculties.length > 5 && (
                      <div className="more-items">
                        <Link 
                          to={`/admin/institution/${institutionId}/faculties`}
                          className="btn btn-outline"
                        >
                          View all {institution.faculties.length} faculties
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FacultyIcon />
                    <p>No faculties added yet</p>
                    <Link 
                      to={`/admin/institution/${institutionId}/faculties`}
                      className="btn btn-primary"
                    >
                      Add First Faculty
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="tab-content">
                <div className="section-header">
                  <h3>Courses</h3>
                  <Link 
                    to={`/admin/institution/${institutionId}/courses`}
                    className="btn btn-primary"
                  >
                    <CourseIcon />
                    Manage All Courses
                  </Link>
                </div>
                
                {institution?.courses?.length > 0 ? (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Course Name</th>
                          <th>Code</th>
                          <th>Faculty</th>
                          <th>Duration</th>
                          <th>Fees</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {institution.courses.slice(0, 5).map((course, index) => (
                          <tr key={course.id || index}>
                            <td>
                              <strong>{course.name}</strong>
                              {course.description && (
                                <div className="entity-subtitle">
                                  {course.description.substring(0, 60)}...
                                </div>
                              )}
                            </td>
                            <td>{course.code || 'N/A'}</td>
                            <td>{course.facultyName || 'No faculty'}</td>
                            <td>{course.duration || 'N/A'}</td>
                            <td>{course.fees ? `$${course.fees}` : 'Free'}</td>
                            <td>
                              <span className={`status-badge status-${course.status || 'active'}`}>
                                {course.status || 'active'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {institution.courses.length > 5 && (
                      <div className="more-items" style={{ textAlign: 'center', padding: '1rem' }}>
                        <Link 
                          to={`/admin/institution/${institutionId}/courses`}
                          className="btn btn-outline"
                        >
                          View all {institution.courses.length} courses
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state">
                    <CourseIcon />
                    <p>No courses added yet</p>
                    <Link 
                      to={`/admin/institution/${institutionId}/courses`}
                      className="btn btn-primary"
                    >
                      Add First Course
                    </Link>
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

export default EditInstitution;