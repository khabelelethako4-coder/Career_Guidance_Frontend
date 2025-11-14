import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInstitutionById, updateInstitution } from '../../services/institutionService';
import { CourseIcon, ArrowLeftIcon, AddIcon, EditIcon, DeleteIcon } from "../../components/Icons";

const CourseManagement = () => {
  const { institutionId, facultyId } = useParams();
  const navigate = useNavigate();
  const [institution, setInstitution] = useState(null);
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    duration: '',
    fees: '',
    requirements: '',
    facultyId: facultyId,
    status: 'active'
  });

  useEffect(() => {
    fetchInstitution();
  }, [institutionId, facultyId]);

  const fetchInstitution = async () => {
    try {
      const data = await getInstitutionById(institutionId);
      setInstitution(data);
      
      // Find the specific faculty if facultyId is provided
      if (facultyId && data.faculties) {
        const facultyData = data.faculties.find(f => f.id === facultyId);
        setFaculty(facultyData);
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
    
    const courseData = {
      id: editingCourse ? editingCourse.id : Date.now().toString(),
      name: formData.name,
      code: formData.code,
      description: formData.description,
      duration: formData.duration,
      fees: formData.fees ? parseFloat(formData.fees) : 0,
      requirements: formData.requirements,
      facultyId: formData.facultyId,
      facultyName: faculty ? faculty.name : 'General',
      status: formData.status,
      createdAt: new Date().toISOString()
    };

    try {
      const currentCourses = institution.courses || [];
      const updatedCourses = editingCourse
        ? currentCourses.map(c => c.id === editingCourse.id ? courseData : c)
        : [...currentCourses, courseData];

      await updateInstitution(institutionId, {
        courses: updatedCourses
      });

      setInstitution({
        ...institution,
        courses: updatedCourses
      });

      resetForm();
      alert(editingCourse ? 'Course updated successfully' : 'Course added successfully');
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code || '',
      description: course.description || '',
      duration: course.duration || '',
      fees: course.fees?.toString() || '',
      requirements: course.requirements || '',
      facultyId: course.facultyId || facultyId,
      status: course.status || 'active'
    });
    setShowForm(true);
  };

  const handleDelete = async (courseId, courseName) => {
    if (window.confirm(`Are you sure you want to delete "${courseName}"?`)) {
      try {
        const updatedCourses = institution.courses.filter(c => c.id !== courseId);
        
        await updateInstitution(institutionId, {
          courses: updatedCourses
        });

        setInstitution({
          ...institution,
          courses: updatedCourses
        });

        alert('Course deleted successfully');
      } catch (error) {
        console.error('Error deleting course:', error);
        alert('Failed to delete course');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      duration: '',
      fees: '',
      requirements: '',
      facultyId: facultyId,
      status: 'active'
    });
    setEditingCourse(null);
    setShowForm(false);
  };

  const getCoursesToDisplay = () => {
    if (facultyId) {
      return institution.courses?.filter(course => course.facultyId === facultyId) || [];
    }
    return institution.courses || [];
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

  if (!institution) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="empty-state">
            <CourseIcon />
            <p>Institution not found</p>
            <button onClick={() => navigate('/admin')} className="btn btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const courses = getCoursesToDisplay();
  const faculties = institution.faculties || [];

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-content">
            <button 
              onClick={() => navigate('/admin')}
              className="btn btn-outline btn-sm"
              style={{ marginBottom: '1rem' }}
            >
              <ArrowLeftIcon />
              Back to Dashboard
            </button>
            <h1 className="dashboard-title">
              Manage Courses - {institution.name}
              {faculty && ` - ${faculty.name}`}
            </h1>
            <p className="dashboard-subtitle">
              {faculty 
                ? `Manage courses for ${faculty.name} faculty`
                : 'Manage all courses for this institution'
              }
            </p>
          </div>
          <div className="header-actions">
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <AddIcon />
              Add Course
            </button>
          </div>
        </div>

        {/* Course Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-header">
              <h3>{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} className="form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Course Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Computer Science"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="code">Course Code</label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="e.g., CS101"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="duration">Duration</label>
                    <input
                      type="text"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="e.g., 4 years"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="fees">Fees ($)</label>
                    <input
                      type="number"
                      id="fees"
                      name="fees"
                      value={formData.fees}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {!facultyId && (
                    <div className="form-group">
                      <label htmlFor="facultyId">Faculty</label>
                      <select
                        id="facultyId"
                        name="facultyId"
                        value={formData.facultyId}
                        onChange={handleChange}
                      >
                        <option value="">Select Faculty</option>
                        {faculties.map(faculty => (
                          <option key={faculty.id} value={faculty.id}>
                            {faculty.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

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

                  <div className="form-group full-width">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Course description and overview"
                      rows="3"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="requirements">Requirements</label>
                    <textarea
                      id="requirements"
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleChange}
                      placeholder="Admission requirements and prerequisites"
                      rows="2"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingCourse ? 'Update Course' : 'Add Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Courses List */}
        <div className="card">
          <div className="card-header">
            <h3>Courses ({courses.length})</h3>
          </div>
          <div className="card-body">
            {courses.length === 0 ? (
              <div className="empty-state">
                <CourseIcon />
                <p>No courses added yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn btn-primary"
                >
                  Add First Course
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Code</th>
                      {!facultyId && <th>Faculty</th>}
                      <th>Duration</th>
                      <th>Fees</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course.id}>
                        <td>
                          <div className="entity-info">
                            <strong>{course.name}</strong>
                            {course.description && (
                              <span className="entity-subtitle">
                                {course.description.substring(0, 60)}...
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{course.code || 'N/A'}</td>
                        {!facultyId && (
                          <td>
                            {course.facultyName || 'No faculty'}
                          </td>
                        )}
                        <td>{course.duration || 'N/A'}</td>
                        <td>
                          {course.fees ? `$${course.fees}` : 'Free'}
                        </td>
                        <td>
                          <span className={`status-badge status-${course.status}`}>
                            {course.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEdit(course)}
                              className="btn btn-primary btn-sm"
                            >
                              <EditIcon />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(course.id, course.name)}
                              className="btn btn-danger btn-sm"
                            >
                              <DeleteIcon />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;