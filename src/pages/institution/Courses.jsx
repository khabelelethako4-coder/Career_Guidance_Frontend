import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { BookIcon, AddIcon, EditIcon, DeleteIcon, ArrowLeftIcon, BuildingIcon } from '../../components/Icons';
import './institution.css';

const InstitutionCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    duration: '',
    fees: '',
    totalSeats: 50,
    requirements: '',
    facultyId: ''
  });
  const [editingCourse, setEditingCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInstitutionAndData();
  }, [user]);

  const fetchInstitutionAndData = async () => {
    try {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      console.log('🔍 Finding institution for user:', user.uid);

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
      
      console.log('🏫 Institution found:', institutionData.name);
      setInstitution(institutionData);

      // Fetch faculties and courses for this institution
      await Promise.all([
        fetchFaculties(institutionData),
        fetchCourses(institutionData)
      ]);

    } catch (error) {
      console.error('❌ Error fetching institution data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async (institutionData) => {
    try {
      console.log('📚 Fetching faculties...');
      const facultiesList = institutionData.faculties || [];
      console.log(`✅ Found ${facultiesList.length} faculties`);
      setFaculties(facultiesList);
    } catch (error) {
      console.error('❌ Error fetching faculties:', error);
    }
  };

  const fetchCourses = async (institutionData) => {
    try {
      console.log('📖 Fetching courses...');
      
      // Get courses from faculties and institution level
      const allCourses = [];
      
      // Get courses from faculties
      if (institutionData.faculties) {
        institutionData.faculties.forEach(faculty => {
          if (faculty.courses && Array.isArray(faculty.courses)) {
            faculty.courses.forEach(course => {
              allCourses.push({
                ...course,
                facultyId: faculty.id,
                facultyName: faculty.name,
                source: 'faculty'
              });
            });
          }
        });
      }
      
      // Get courses from institution level
      if (institutionData.courses && Array.isArray(institutionData.courses)) {
        institutionData.courses.forEach(course => {
          allCourses.push({
            ...course,
            facultyId: course.facultyId || '',
            facultyName: course.facultyName || 'General',
            source: 'institution'
          });
        });
      }
      
      console.log(`✅ Found ${allCourses.length} total courses`);
      setCourses(allCourses);
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.facultyId) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      if (!institution) throw new Error('No institution found');

      const courseData = {
        id: editingCourse ? editingCourse.id : `course_${Date.now()}`,
        name: formData.name,
        code: formData.code,
        description: formData.description,
        duration: formData.duration,
        fees: formData.fees ? parseInt(formData.fees) : 0,
        totalSeats: parseInt(formData.totalSeats) || 50,
        requirements: formData.requirements,
        facultyId: formData.facultyId,
        status: 'active',
        createdAt: editingCourse ? editingCourse.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('💾 Saving course:', courseData);

      // Update the institution document
      const institutionRef = doc(db, 'institutions', institution.id);
      const institutionSnap = await getDoc(institutionRef);
      
      if (!institutionSnap.exists()) {
        throw new Error('Institution not found');
      }

      const institutionData = institutionSnap.data();
      let updatedFaculties = institutionData.faculties || [];

      if (editingCourse) {
        // Update existing course
        updatedFaculties = updatedFaculties.map(faculty => {
          if (faculty.id === formData.facultyId) {
            const existingCourses = faculty.courses || [];
            
            if (editingCourse.facultyId === formData.facultyId) {
              // Same faculty - update the course
              const updatedCourses = existingCourses.map(course =>
                course.id === editingCourse.id ? courseData : course
              );
              return { ...faculty, courses: updatedCourses };
            } else {
              // Different faculty - remove from old, add to new
              const filteredCourses = existingCourses.filter(course => course.id !== editingCourse.id);
              return { ...faculty, courses: filteredCourses };
            }
          } else if (faculty.id === editingCourse.facultyId) {
            // Remove from old faculty
            const filteredCourses = faculty.courses?.filter(course => course.id !== editingCourse.id) || [];
            return { ...faculty, courses: filteredCourses };
          }
          return faculty;
        });

        // Add to new faculty if faculty changed
        if (editingCourse.facultyId !== formData.facultyId) {
          updatedFaculties = updatedFaculties.map(faculty => {
            if (faculty.id === formData.facultyId) {
              const existingCourses = faculty.courses || [];
              return { ...faculty, courses: [...existingCourses, courseData] };
            }
            return faculty;
          });
        }
      } else {
        // Create new course
        updatedFaculties = updatedFaculties.map(faculty => {
          if (faculty.id === formData.facultyId) {
            const existingCourses = faculty.courses || [];
            return {
              ...faculty,
              courses: [...existingCourses, courseData]
            };
          }
          return faculty;
        });
      }

      await updateDoc(institutionRef, {
        faculties: updatedFaculties,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Course saved successfully');
      
      // Reset form and refresh data
      resetForm();
      await fetchInstitutionAndData();
      
    } catch (error) {
      console.error('❌ Error saving course:', error);
      alert('Error saving course. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (course) => {
    console.log('✏️ Editing course:', course);
    setFormData({
      name: course.name,
      code: course.code,
      description: course.description || '',
      duration: course.duration || '',
      fees: course.fees || '',
      totalSeats: course.totalSeats || 50,
      requirements: course.requirements || '',
      facultyId: course.facultyId || ''
    });
    setEditingCourse(course);
    setShowForm(true);
  };

  const handleDelete = async (courseId, facultyId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;

    try {
      if (!institution) throw new Error('No institution found');

      console.log('🗑️ Deleting course:', courseId);

      const institutionRef = doc(db, 'institutions', institution.id);
      const institutionSnap = await getDoc(institutionRef);
      
      if (!institutionSnap.exists()) {
        throw new Error('Institution not found');
      }

      const institutionData = institutionSnap.data();
      const updatedFaculties = institutionData.faculties?.map(faculty => {
        if (faculty.id === facultyId) {
          const updatedCourses = faculty.courses?.filter(course => course.id !== courseId) || [];
          return {
            ...faculty,
            courses: updatedCourses
          };
        }
        return faculty;
      }) || [];

      await updateDoc(institutionRef, {
        faculties: updatedFaculties,
        updatedAt: serverTimestamp()
      });

      console.log('✅ Course deleted successfully');
      await fetchInstitutionAndData();
      
    } catch (error) {
      console.error('❌ Error deleting course:', error);
      alert('Error deleting course. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      code: '', 
      description: '', 
      duration: '', 
      fees: '', 
      totalSeats: 50, 
      requirements: '', 
      facultyId: '' 
    });
    setEditingCourse(null);
    setShowForm(false);
  };

  const cancelEdit = () => {
    resetForm();
  };

  const getFacultyName = (facultyId) => {
    const faculty = faculties.find(f => f.id === facultyId);
    return faculty ? faculty.name : 'Unknown Faculty';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading courses...</p>
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
            <h1 className="dashboard-title">Manage Courses</h1>
            <p className="dashboard-subtitle">
              Create and manage courses for {institution.name}
            </p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
              disabled={faculties.length === 0}
            >
              <AddIcon />
              Add Course
            </button>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="card mb-6">
            <div className="card-header">
              <h3>{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Course Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Computer Science"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Course Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      placeholder="e.g., CS101"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Faculty *</label>
                    <select
                      value={formData.facultyId}
                      onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                      required
                    >
                      <option value="">Select Faculty</option>
                      {faculties.map(faculty => (
                        <option key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      placeholder="e.g., 4 years"
                    />
                  </div>
                  <div className="form-group">
                    <label>Fees (M)</label>
                    <input
                      type="number"
                      value={formData.fees}
                      onChange={(e) => setFormData({...formData, fees: e.target.value})}
                      placeholder="e.g., 25000"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Seats</label>
                    <input
                      type="number"
                      value={formData.totalSeats}
                      onChange={(e) => setFormData({...formData, totalSeats: parseInt(e.target.value) || 50})}
                      min="1"
                      max="500"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Course description and overview..."
                      rows="3"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Requirements</label>
                    <textarea
                      value={formData.requirements}
                      onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                      placeholder="Admission requirements and prerequisites..."
                      rows="3"
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                  </button>
                  <button type="button" onClick={cancelEdit} className="btn btn-outline">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Warning if no faculties */}
        {faculties.length === 0 && (
          <div className="alert alert-warning mb-6">
            <BuildingIcon />
            <div className="alert-content">
              <strong>No faculties found</strong>
              <p>You need to create at least one faculty before adding courses.</p>
            </div>
            <Link to="/institution/faculties" className="btn btn-primary">
              Create Faculty
            </Link>
          </div>
        )}

        {/* Courses List */}
        <div className="card">
          <div className="card-header">
            <h3>
              Courses ({courses.length})
              {faculties.length > 0 && (
                <span className="text-sm text-muted ml-2">
                  Across {faculties.length} faculties
                </span>
              )}
            </h3>
          </div>
          <div className="card-body">
            {courses.length === 0 ? (
              <div className="empty-state">
                <BookIcon />
                <p>No courses added yet</p>
                {faculties.length > 0 ? (
                  <button 
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary"
                  >
                    Add First Course
                  </button>
                ) : (
                  <Link to="/institution/faculties" className="btn btn-primary">
                    Create Faculty First
                  </Link>
                )}
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Code</th>
                      <th>Faculty</th>
                      <th>Duration</th>
                      <th>Fees</th>
                      <th>Seats</th>
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
                              <span className="entity-description">
                                {course.description}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <code className="course-code">{course.code}</code>
                        </td>
                        <td>
                          <span className="faculty-badge">
                            {getFacultyName(course.facultyId)}
                          </span>
                        </td>
                        <td>{course.duration || 'N/A'}</td>
                        <td>{course.fees ? `M${course.fees.toLocaleString()}` : 'Free'}</td>
                        <td>
                          <div className="seats-info">
                            <span className="seats-count">
                              {course.admittedStudents?.length || 0} / {course.totalSeats}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge status-${course.status || 'active'}`}>
                            {course.status || 'active'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEdit(course)}
                              className="btn btn-outline btn-sm"
                              title="Edit course"
                            >
                              <EditIcon />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(course.id, course.facultyId)}
                              className="btn btn-danger btn-sm"
                              title="Delete course"
                            >
                              <DeleteIcon />
                              Delete
                            </button>
                            <Link
                              to={`/institution/course/${course.id}/applications`}
                              className="btn btn-primary btn-sm"
                              title="View applications"
                            >
                              Applications
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

export default InstitutionCourses;