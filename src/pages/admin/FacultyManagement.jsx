import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // ADDED Link import
import { getInstitutionById, updateInstitution } from '../../services/institutionService';
import { FacultyIcon, ArrowLeftIcon, AddIcon, EditIcon, DeleteIcon } from "../../components/Icons";

const FacultyManagement = () => {
  const { institutionId } = useParams();
  const navigate = useNavigate();
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dean: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchInstitution();
  }, [institutionId]);

  const fetchInstitution = async () => {
    try {
      const data = await getInstitutionById(institutionId);
      setInstitution(data);
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
    
    const facultyData = {
      id: editingFaculty ? editingFaculty.id : Date.now().toString(),
      name: formData.name,
      description: formData.description,
      dean: formData.dean,
      email: formData.email,
      phone: formData.phone,
      createdAt: new Date().toISOString(),
      courses: editingFaculty ? editingFaculty.courses : []
    };

    try {
      const updatedFaculties = editingFaculty
        ? institution.faculties.map(f => f.id === editingFaculty.id ? facultyData : f)
        : [...(institution.faculties || []), facultyData];

      await updateInstitution(institutionId, {
        faculties: updatedFaculties
      });

      setInstitution({
        ...institution,
        faculties: updatedFaculties
      });

      resetForm();
      alert(editingFaculty ? 'Faculty updated successfully' : 'Faculty added successfully');
    } catch (error) {
      console.error('Error saving faculty:', error);
      alert('Failed to save faculty');
    }
  };

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty);
    setFormData({
      name: faculty.name,
      description: faculty.description || '',
      dean: faculty.dean || '',
      email: faculty.email || '',
      phone: faculty.phone || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (facultyId, facultyName) => {
    if (window.confirm(`Are you sure you want to delete "${facultyName}"? This will also remove all associated courses.`)) {
      try {
        const updatedFaculties = institution.faculties.filter(f => f.id !== facultyId);
        
        // Also remove courses associated with this faculty
        const updatedCourses = institution.courses?.filter(course => 
          course.facultyId !== facultyId
        ) || [];

        await updateInstitution(institutionId, {
          faculties: updatedFaculties,
          courses: updatedCourses
        });

        setInstitution({
          ...institution,
          faculties: updatedFaculties,
          courses: updatedCourses
        });

        alert('Faculty deleted successfully');
      } catch (error) {
        console.error('Error deleting faculty:', error);
        alert('Failed to delete faculty');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      dean: '',
      email: '',
      phone: ''
    });
    setEditingFaculty(null);
    setShowForm(false);
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
            <FacultyIcon />
            <p>Institution not found</p>
            <button onClick={() => navigate('/admin')} className="btn btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="dashboard-title">Manage Faculties - {institution.name}</h1>
            <p className="dashboard-subtitle">
              Add and manage faculties for {institution.name}
            </p>
          </div>
          <div className="header-actions">
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <AddIcon />
              Add Faculty
            </button>
          </div>
        </div>

        {/* Faculty Form */}
        {showForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-header">
              <h3>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} className="form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Faculty Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Faculty of Engineering"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dean">Dean Name</label>
                    <input
                      type="text"
                      id="dean"
                      name="dean"
                      value={formData.dean}
                      onChange={handleChange}
                      placeholder="Name of faculty dean"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Contact Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="faculty@institution.edu"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Contact Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone number"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Brief description of the faculty"
                      rows="3"
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
                    {editingFaculty ? 'Update Faculty' : 'Add Faculty'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Faculties List */}
        <div className="card">
          <div className="card-header">
            <h3>Faculties ({institution.faculties?.length || 0})</h3>
          </div>
          <div className="card-body">
            {!institution.faculties || institution.faculties.length === 0 ? (
              <div className="empty-state">
                <FacultyIcon />
                <p>No faculties added yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn btn-primary"
                >
                  Add First Faculty
                </button>
              </div>
            ) : (
              <div className="entities-list">
                {institution.faculties.map((faculty) => (
                  <div key={faculty.id} className="entity-card">
                    <div className="entity-info">
                      <h4 className="entity-name">{faculty.name}</h4>
                      {faculty.description && (
                        <p className="entity-description">{faculty.description}</p>
                      )}
                      <div className="entity-meta">
                        {faculty.dean && (
                          <span className="meta-item">
                            <strong>Dean:</strong> {faculty.dean}
                          </span>
                        )}
                        {faculty.email && (
                          <span className="meta-item">
                            <strong>Email:</strong> {faculty.email}
                          </span>
                        )}
                        {faculty.phone && (
                          <span className="meta-item">
                            <strong>Phone:</strong> {faculty.phone}
                          </span>
                        )}
                        <span className="meta-item">
                          <strong>Courses:</strong> {faculty.courses?.length || 0}
                        </span>
                      </div>
                    </div>
                    <div className="entity-actions">
                      <button
                        onClick={() => handleEdit(faculty)}
                        className="btn btn-primary btn-sm"
                      >
                        <EditIcon />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(faculty.id, faculty.name)}
                        className="btn btn-danger btn-sm"
                      >
                        <DeleteIcon />
                        Delete
                      </button>
                      <Link
                        to={`/admin/institution/${institutionId}/faculty/${faculty.id}/courses`}
                        className="btn btn-secondary btn-sm"
                      >
                        Manage Courses
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REMOVED the style jsx section and move CSS to admin.css */}
    </div>
  );
};

export default FacultyManagement;