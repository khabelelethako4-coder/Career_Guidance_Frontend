import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { BuildingIcon, AddIcon, EditIcon, DeleteIcon, ArrowLeftIcon } from '../../components/Icons';
import './institution.css';

const InstitutionFaculties = () => {
  const { user } = useAuth();
  const [faculties, setFaculties] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dean: '',
    email: '',
    phone: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInstitutionAndFaculties();
  }, [user]);

  const fetchInstitutionAndFaculties = async () => {
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
        console.log('❌ No institution found');
        setLoading(false);
        return;
      }

      const institutionDoc = institutionsSnapshot.docs[0];
      const institutionData = { 
        id: institutionDoc.id, 
        ...institutionDoc.data() 
      };
      setInstitution(institutionData);
      setFaculties(institutionData.faculties || []);

    } catch (error) {
      console.error('Error fetching institution faculties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      if (!institution) throw new Error('No institution found');

      const facultyData = {
        id: `faculty_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        dean: formData.dean,
        email: formData.email,
        phone: formData.phone,
        courses: [],
        createdAt: new Date().toISOString()
      };

      const institutionRef = doc(db, 'institutions', institution.id);
      const institutionSnap = await getDoc(institutionRef);
      
      if (!institutionSnap.exists()) {
        throw new Error('Institution not found');
      }

      const institutionData = institutionSnap.data();
      const existingFaculties = institutionData.faculties || [];

      let updatedFaculties;
      if (editingId) {
        // Update existing faculty
        updatedFaculties = existingFaculties.map(faculty =>
          faculty.id === editingId 
            ? { ...faculty, ...formData }
            : faculty
        );
      } else {
        // Add new faculty
        updatedFaculties = [...existingFaculties, facultyData];
      }

      await updateDoc(institutionRef, {
        faculties: updatedFaculties,
        updatedAt: serverTimestamp()
      });

      setFormData({ name: '', description: '', dean: '', email: '', phone: '' });
      setShowForm(false);
      setEditingId(null);
      fetchInstitutionAndFaculties();
    } catch (error) {
      console.error('Error saving faculty:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (faculty) => {
    setFormData({
      name: faculty.name,
      description: faculty.description || '',
      dean: faculty.dean || '',
      email: faculty.email || '',
      phone: faculty.phone || ''
    });
    setEditingId(faculty.id);
    setShowForm(true);
  };

  const handleDelete = async (facultyId) => {
    if (!window.confirm('Are you sure you want to delete this faculty?')) return;

    try {
      if (!institution) throw new Error('No institution found');

      const institutionRef = doc(db, 'institutions', institution.id);
      const institutionSnap = await getDoc(institutionRef);
      
      if (!institutionSnap.exists()) {
        throw new Error('Institution not found');
      }

      const institutionData = institutionSnap.data();
      const updatedFaculties = institutionData.faculties?.filter(faculty => faculty.id !== facultyId) || [];

      await updateDoc(institutionRef, {
        faculties: updatedFaculties,
        updatedAt: serverTimestamp()
      });

      fetchInstitutionAndFaculties();
    } catch (error) {
      console.error('Error deleting faculty:', error);
    }
  };

  const cancelEdit = () => {
    setFormData({ name: '', description: '', dean: '', email: '', phone: '' });
    setShowForm(false);
    setEditingId(null);
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
            <h1 className="dashboard-title">Manage Faculties</h1>
            <p className="dashboard-subtitle">
              Create and manage faculties for {institution.name}
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

        {/* Add/Edit Form */}
        {showForm && (
          <div className="card mb-6">
            <div className="card-header">
              <h3>{editingId ? 'Edit Faculty' : 'Add New Faculty'}</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Faculty Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Faculty of Science and Technology"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Dean Name</label>
                    <input
                      type="text"
                      value={formData.dean}
                      onChange={(e) => setFormData({...formData, dean: e.target.value})}
                      placeholder="e.g., Dr. John Smith"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="faculty@institution.edu"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+266 1234 5678"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Brief description of the faculty..."
                      rows="3"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : (editingId ? 'Update Faculty' : 'Create Faculty')}
                  </button>
                  <button type="button" onClick={cancelEdit} className="btn btn-outline">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Faculties List */}
        <div className="card">
          <div className="card-header">
            <h3>Faculties ({faculties.length})</h3>
          </div>
          <div className="card-body">
            {faculties.length === 0 ? (
              <div className="empty-state">
                <BuildingIcon />
                <p>No faculties added yet</p>
                <button 
                  onClick={() => setShowForm(true)}
                  className="btn btn-primary"
                >
                  Add First Faculty
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Faculty Name</th>
                      <th>Dean</th>
                      <th>Contact</th>
                      <th>Description</th>
                      <th>Courses</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faculties.map((faculty) => (
                      <tr key={faculty.id}>
                        <td>
                          <div className="entity-info">
                            <strong>{faculty.name}</strong>
                          </div>
                        </td>
                        <td>{faculty.dean || 'Not specified'}</td>
                        <td>
                          <div className="contact-info">
                            {faculty.email && <div>{faculty.email}</div>}
                            {faculty.phone && <div>{faculty.phone}</div>}
                          </div>
                        </td>
                        <td>
                          <div className="description-truncate">
                            {faculty.description || 'No description'}
                          </div>
                        </td>
                        <td>
                          <div className="courses-count">
                            {faculty.courses?.length || 0} courses
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEdit(faculty)}
                              className="btn btn-outline btn-sm"
                            >
                              <EditIcon />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(faculty.id)}
                              className="btn btn-danger btn-sm"
                            >
                              <DeleteIcon />
                              Delete
                            </button>
                            <Link
                              to={`/institution/faculty/${faculty.id}/courses`}
                              className="btn btn-primary btn-sm"
                            >
                              Manage Courses
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
        </div>
      </div>
    </div>
  );
};

// Add the missing import
import { collection, query, where, getDocs } from 'firebase/firestore';

export default InstitutionFaculties;