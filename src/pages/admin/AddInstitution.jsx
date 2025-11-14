import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createInstitution } from '../../services/institutionService';
import { BusinessIcon, ArrowLeftIcon, FacultyIcon, CourseIcon } from "../../components/Icons";

const AddInstitution = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdInstitutionId, setCreatedInstitutionId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    location: '',
    website: '',
    description: '',
    establishedYear: '',
    type: 'university'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const institutionId = await createInstitution(formData);
      setCreatedInstitutionId(institutionId);
      setSuccess(true);
    } catch (error) {
      console.error('Error creating institution:', error);
      alert('Failed to create institution. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
              <h1 className="dashboard-title">Institution Created Successfully!</h1>
              <p className="dashboard-subtitle">
                {formData.name} has been registered in the system
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Next Steps</h3>
            </div>
            <div className="card-body">
              <div className="success-actions">
                <div className="success-message">
                  <div className="success-icon">✓</div>
                  <h4>What would you like to do next?</h4>
                  <p>Start building your institution's academic structure by adding faculties and courses.</p>
                </div>
                
                <div className="action-buttons-grid">
                  <Link 
                    to={`/admin/institution/${createdInstitutionId}/faculties`}
                    className="action-card primary"
                  >
                    <div className="action-icon">
                      <FacultyIcon />
                    </div>
                    <div className="action-content">
                      <h4>Add Faculties</h4>
                      <p>Create faculties and departments for your institution</p>
                    </div>
                  </Link>

                  <Link 
                    to={`/admin/institution/${createdInstitutionId}/courses`}
                    className="action-card primary"
                  >
                    <div className="action-icon">
                      <CourseIcon />
                    </div>
                    <div className="action-content">
                      <h4>Add Courses</h4>
                      <p>Create courses and programs for students</p>
                    </div>
                  </Link>

                  <Link 
                    to={`/admin/institution/${createdInstitutionId}`}
                    className="action-card"
                  >
                    <div className="action-icon">
                      <BusinessIcon />
                    </div>
                    <div className="action-content">
                      <h4>Edit Institution Details</h4>
                      <p>Update institution information and settings</p>
                    </div>
                  </Link>

                  <Link 
                    to="/admin/institutions"
                    className="action-card"
                  >
                    <div className="action-icon">
                      <ArrowLeftIcon />
                    </div>
                    <div className="action-content">
                      <h4>View All Institutions</h4>
                      <p>Return to institutions management</p>
                    </div>
                  </Link>
                </div>

                <div className="form-actions" style={{ marginTop: '2rem' }}>
                  <button
                    onClick={() => navigate('/admin')}
                    className="btn btn-outline"
                  >
                    Back to Dashboard
                  </button>
                  <Link
                    to={`/admin/institution/${createdInstitutionId}/faculties`}
                    className="btn btn-primary"
                  >
                    Start Adding Faculties
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .success-actions {
            text-align: center;
          }
          .success-message {
            margin-bottom: 2rem;
          }
          .success-icon {
            font-size: 3rem;
            color: #10b981;
            margin-bottom: 1rem;
          }
          .action-buttons-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
          }
          .action-card {
            display: block;
            padding: 1.5rem;
            border: 2px solid #e5e7eb;
            border-radius: 0.5rem;
            text-decoration: none;
            color: inherit;
            transition: all 0.2s;
          }
          .action-card:hover {
            border-color: #3b82f6;
            transform: translateY(-2px);
          }
          .action-card.primary {
            border-color: #3b82f6;
            background-color: #f0f9ff;
          }
          .action-icon {
            margin-bottom: 1rem;
          }
          .action-icon svg {
            width: 2rem;
            height: 2rem;
          }
          .action-content h4 {
            margin: 0 0 0.5rem 0;
            color: #1f2937;
          }
          .action-content p {
            margin: 0;
            color: #6b7280;
            font-size: 0.875rem;
          }
        `}</style>
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
            <h1 className="dashboard-title">Add New Institution</h1>
            <p className="dashboard-subtitle">
              Register a new educational institution
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Institution Details</h3>
          </div>
          <div className="card-body">
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
                    placeholder="Enter institution name"
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
                    placeholder="Enter email address"
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
                    placeholder="Enter phone number"
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
                  <label htmlFor="establishedYear">Established Year</label>
                  <input
                    type="number"
                    id="establishedYear"
                    name="establishedYear"
                    value={formData.establishedYear}
                    onChange={handleChange}
                    placeholder="e.g., 1990"
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
                    placeholder="https://example.com"
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
                    placeholder="Enter full address"
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
                    placeholder="Enter city or location"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description about the institution"
                    rows="4"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Institution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInstitution;