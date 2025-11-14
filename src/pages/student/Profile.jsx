import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeftIcon, SaveIcon, UserIcon } from '../../components/Icons';
import './StudentDashboard.css';

const StudentProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    nationality: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (user?.uid) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setProfile(userData);
          setFormData({
            firstName: userData.profile?.firstName || '',
            lastName: userData.profile?.lastName || '',
            phone: userData.profile?.phone || '',
            address: userData.profile?.address || '',
            dateOfBirth: userData.profile?.dateOfBirth || '',
            gender: userData.profile?.gender || '',
            nationality: userData.profile?.nationality || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        profile: {
          ...formData
        },
        updatedAt: serverTimestamp()
      });

      // Update local profile state
      setProfile(prev => ({
        ...prev,
        profile: formData
      }));

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
      <div className="dashboard-container profile-page">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container profile-page"> {/* ADD profile-page CLASS HERE */}
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <Link to="/student/dashboard" className="btn btn-outline btn-sm back-btn">
              <ArrowLeftIcon />
              Back to Dashboard
            </Link>
            <h1 className="dashboard-title">Student Profile</h1>
            <p className="dashboard-subtitle">
              Manage your personal information
            </p>
          </div>
        </div>

        <div className="main-content-grid">
          {/* Left Column - Profile Form */}
          <div className="content-column">
            <div className="card">
              <div className="card-header">
                <h3>Personal Information</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
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
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Nationality</label>
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        placeholder="e.g., Lesotho"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Your complete address..."
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

          {/* Right Column - Profile Overview */}
          <div className="content-column">
            <div className="card">
              <div className="card-header">
                <h3>Profile Overview</h3>
              </div>
              <div className="card-body">
                <div className="profile-overview">
                  <div className="profile-header">
                    <div className="profile-avatar">
                      <UserIcon />
                    </div>
                    <div className="profile-info">
                      <h3>{formData.firstName} {formData.lastName}</h3>
                      <p className="profile-email">{user?.email}</p>
                      <span className="role-badge">Student</span>
                    </div>
                  </div>
                  
                  <div className="profile-details">
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{formData.phone || 'Not set'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Date of Birth:</label>
                      <span>{formData.dateOfBirth || 'Not set'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Gender:</label>
                      <span>{formData.gender || 'Not set'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Nationality:</label>
                      <span>{formData.nationality || 'Not set'}</span>
                    </div>
                    <div className="detail-item full-width">
                      <label>Address:</label>
                      <span>{formData.address || 'Not set'}</span>
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
                  <Link to="/student/courses" className="quick-action-card">
                    <div className="action-icon">
                      <UserIcon />
                    </div>
                    <div className="action-content">
                      <h4>Browse Courses</h4>
                      <p>Explore available courses</p>
                    </div>
                  </Link>
                  <Link to="/student/dashboard" className="quick-action-card">
                    <div className="action-icon">
                      <UserIcon />
                    </div>
                    <div className="action-content">
                      <h4>Dashboard</h4>
                      <p>View your applications</p>
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

export default StudentProfile;