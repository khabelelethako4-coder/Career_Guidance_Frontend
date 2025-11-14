import React, { useState, useEffect } from 'react';
import { getAllCoursesForApplying } from '../../services/institutionService';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '../../components/Icons';
import './StudentDashboard.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [institutions, setInstitutions] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesData = await getAllCoursesForApplying();
        setCourses(coursesData);
        setFilteredCourses(coursesData);

        // Extract unique institutions
        const uniqueInstitutions = [...new Set(coursesData.map(c => c.institutionName))];
        setInstitutions(uniqueInstitutions);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.facultyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedInstitution) {
      filtered = filtered.filter(course => course.institutionName === selectedInstitution);
    }

    setFilteredCourses(filtered);
  }, [searchTerm, selectedInstitution, courses]);

  return (
    <div className="dashboard-container courses-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <Link to="/student/dashboard" className="btn btn-outline btn-sm back-btn">
              <ArrowLeftIcon />
              Back to Dashboard
            </Link>
            <h1 className="dashboard-title">Browse Courses</h1>
            <p className="dashboard-subtitle">
              Find and apply for courses that match your interests
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-card card">
          <div className="card-body">
            <div className="filters-grid">
              <div className="filter-group">
                <label className="filter-label">Search Courses</label>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by course or faculty name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">Filter by Institution</label>
                <select
                  className="filter-select"
                  value={selectedInstitution}
                  onChange={(e) => setSelectedInstitution(e.target.value)}
                >
                  <option value="">All Institutions</option>
                  {institutions.map(inst => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="courses-grid">
          {loading ? (
            <div className="courses-loading">
              <div className="spinner"></div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="courses-empty-state">
              <p className="empty-title">No courses found matching your criteria</p>
              <p className="empty-subtitle">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredCourses.map(course => (
              <div key={course.id} className="course-card">
                <div className="card-body">
                  <h3 className="course-title">
                    {course.name}
                  </h3>
                  <p className="institution-name">
                    {course.institutionName}
                  </p>
                  <p className="faculty-name">
                    {course.facultyName}
                  </p>
                  <p className="course-description">
                    {course.description}
                  </p>
                  <div className="course-meta">
                    <span className="course-duration">
                      Duration: {course.duration} months
                    </span>
                    <span className="seats-badge">
                      {course.totalSeats - (course.admittedStudents?.length || 0)} slots available
                    </span>
                  </div>

                  {/* Apply Now Button */}
                  <Link
                    to={`/student/apply/${course.id}`}
                    className="btn btn-primary apply-btn"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;