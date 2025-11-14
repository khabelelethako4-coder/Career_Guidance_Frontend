import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const CourseApplication = ({ courseId }) => {
  const { user, getAuthHeaders } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInstitutions();
    fetchApplications();
  }, [user]);

  useEffect(() => {
    if (selectedInstitution) {
      fetchCourses(selectedInstitution);
    } else {
      setCourses([]);
    }
  }, [selectedInstitution]);

  // Pre-select course if courseId prop is passed
  useEffect(() => {
    if (courseId) {
      setSelectedCourse(courseId);
    }
  }, [courseId]);

  const fetchInstitutions = async () => {
    try {
      const response = await axios.get('https://career-guidance-application-backend.onrender.com/api/institutions');
      setInstitutions(response.data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    }
  };

  const fetchCourses = async (institutionId) => {
    try {
      const response = await axios.get(`https://career-guidance-application-backend.onrender.com/api/institutions/${institutionId}/courses`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      if (!user) return;
      const headers = await getAuthHeaders();
      const response = await axios.get('https://career-guidance-application-backend.onrender.com/api/students/applications', { headers });
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApply = async () => {
    if (!selectedCourse || !selectedInstitution) {
      alert('Please select both institution and course');
      return;
    }

    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      await axios.post('https://career-guidance-application-backend.onrender.com/api/students/applications', {
        courseId: selectedCourse,
        institutionId: selectedInstitution
      }, { headers });

      alert('Application submitted successfully!');
      setSelectedCourse('');
      setSelectedInstitution('');
      fetchApplications();
    } catch (error) {
      alert('Error submitting application: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const canApplyToInstitution = (institutionId) => {
    const institutionApps = applications.filter(app => app.institutionId === institutionId);
    return institutionApps.length < 2;
  };

  return (
    <div className="space-y-4 mt-4">
      {!courseId && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Institution</label>
          <select
            value={selectedInstitution}
            onChange={(e) => setSelectedInstitution(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Choose an institution</option>
            {institutions.map(inst => (
              <option 
                key={inst.id} 
                value={inst.id}
                disabled={!canApplyToInstitution(inst.id)}
              >
                {inst.name} {!canApplyToInstitution(inst.id) && '(Max applications reached)'}
              </option>
            ))}
          </select>
        </div>
      )}

      {(!courseId && selectedInstitution) || courseId ? (
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Choose a course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name} - {course.facultyName}
              </option>
            ))}
            {courseId && !courses.find(c => c.id === courseId) && (
              <option value={courseId} selected>Selected Course</option>
            )}
          </select>
        </div>
      ) : null}

      <button
        onClick={handleApply}
        disabled={!selectedCourse || (!selectedInstitution && !courseId) || loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Submitting...' : 'Apply for Course'}
      </button>
    </div>
  );
};

export default CourseApplication;
