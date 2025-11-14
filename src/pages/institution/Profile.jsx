import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
import { ArrowLeftIcon, SaveIcon, BuildingIcon } from '../../components/Icons';
import './institution.css';

const InstitutionProfile = () => {
  const { user } = useAuth();
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    location: '',
    website: '',
    type: 'university',
    establishedYear: '',
    description: ''
  });

  useEffect(() => {
    fetchInstitutionProfile();
  }, [user]);

  const fetchInstitutionProfile = async () => {
    try {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      // Find institution by adminId
      const institutionsQuery = query(
        collection(db, 'institutions'), 
        where('adminId', '==', user.uid)
      );
      
      const institutionsSnapshot = await getDocs(institutionsQuery);
      
      if (institutionsSnapshot.empty) {
        console.log('❌ No institution found for user');
        setLoading(false);
        return;
      }

      const institutionDoc = institutionsSnapshot.docs[0];
      const institutionData = { 
        id: institutionDoc.id, 
        ...institutionDoc.data() 
      };
      
      setInstitution(institutionData);
      setFormData({
        name: institutionData.name || '',
        email: institutionData.email || '',
        phone: institutionData.phone || '',
        address: institutionData.address || '',
        location: institutionData.location || '',
        website: institutionData.website || '',
        type: institutionData.type || 'university',
        establishedYear: institutionData.establishedYear || '',
        description: institutionData.description || ''
      });

    } catch (error) {
      console.error('Error fetching institution profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!institution) return;

    setSaving(true);

    try {
      await updateDoc(doc(db, 'institutions', institution.id), {
        ...formData,
        updatedAt: serverTimestamp()
      });

      // Refresh the institution data
      fetchInstitutionProfile();
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
            <BuildingIcon />
            <h3>No Institution Found</h3>
            <p>You are not associated with any institution yet.</p>
            <p>Please contact support or complete your institution registration.</p>
            <Link to="/auth/register/institution" className="btn btn-primary">
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
            <h1 className="dashboard-title">Institution Profile</h1>
            <p className="dashboard-subtitle">
              Manage your institution's profile information
            </p>
          </div>
        </div>

        <div className="main-content-grid">
          {/* Left Column - Profile Form */}
          <div className="content-column">
            <div className="card">
              <div className="card-header">
                <h3>Basic Information</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Institution Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Institution Type</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                      >
                        <option value="university">University</option>
                        <option value="college">College</option>
                        <option value="polytechnic">Polytechnic</option>
                        <option value="institute">Institute</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Established Year</label>
                      <input
                        type="number"
                        name="establishedYear"
                        value={formData.establishedYear}
                        onChange={handleChange}
                        min="1800"
                        max={new Date().getFullYear()}
                      />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>Website</label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        placeholder="Brief description of your institution..."
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      <SaveIcon />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column - Statistics */}
          <div className="content-column">
            <div className="card">
              <div className="card-header">
                <h3>Institution Overview</h3>
              </div>
              <div className="card-body">
                <div className="institution-overview">
                  <div className="overview-item">
                    <BuildingIcon />
                    <div className="overview-content">
                      <strong>{institution.name}</strong>
                      <span>{formData.type} • {formData.location || 'No location'}</span>
                    </div>
                  </div>
                  
                  <div className="overview-details">
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{formData.email || 'Not set'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{formData.phone || 'Not set'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Established:</label>
                      <span>{formData.establishedYear || 'Not set'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Website:</label>
                      <span>
                        {formData.website ? (
                          <a href={formData.website} target="_blank" rel="noopener noreferrer">
                            Visit Website
                          </a>
                        ) : (
                          'Not set'
                        )}
                      </span>
                    </div>
                  </div>

                  {formData.description && (
                    <div className="description-section">
                      <label>About:</label>
                      <p>{formData.description}</p>
                    </div>
                  )}

                  {/* Institution Statistics */}
                  <div className="institution-stats">
                    <div className="stat-item">
                      <strong>{institution.faculties?.length || 0}</strong>
                      <span>Faculties</span>
                    </div>
                    <div className="stat-item">
                      <strong>
                        {(institution.faculties?.reduce((total, faculty) => 
                          total + (faculty.courses?.length || 0), 0) || 0) + 
                         (institution.courses?.length || 0)
                        }
                      </strong>
                      <span>Courses</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="quick-actions-grid">
                  <Link to="/institution/faculties" className="quick-action-card">
                    <div className="action-icon">
                      <BuildingIcon />
                    </div>
                    <div className="action-content">
                      <h4>Manage Faculties</h4>
                      <p>Add and organize academic faculties</p>
                    </div>
                  </Link>
                  <Link to="/institution/courses" className="quick-action-card">
                    <div className="action-icon">
                      <BuildingIcon />
                    </div>
                    <div className="action-content">
                      <h4>Manage Courses</h4>
                      <p>Create and manage course offerings</p>
                    </div>
                  </Link>
                  <Link to="/institution/applications" className="quick-action-card">
                    <div className="action-icon">
                      <BuildingIcon />
                    </div>
                    <div className="action-content">
                      <h4>View Applications</h4>
                      <p>Review student applications</p>
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

export default InstitutionProfile;