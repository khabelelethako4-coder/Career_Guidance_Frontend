// src/components/student/QualifiedCourseApplication.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { checkStudentQualifications, applyForCourse } from '../../services/applicationService';
import { AlertIcon, CheckIcon, CloseIcon } from '../Icons';
import './StudentComponents.css'; // Import the CSS

const QualifiedCourseApplication = ({ courseId, onApplicationSubmit }) => {
  const { user } = useAuth();
  const [qualificationCheck, setQualificationCheck] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [canApply, setCanApply] = useState(false);

  useEffect(() => {
    checkQualifications();
  }, [courseId, user]);

  const checkQualifications = async () => {
    if (!user?.uid || !courseId) return;
    
    try {
      setChecking(true);
      const result = await checkStudentQualifications(user.uid, courseId);
      setQualificationCheck(result);
      setCanApply(result.qualified && result.canApplyToInstitution);
    } catch (error) {
      console.error('Error checking qualifications:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleApply = async () => {
    if (!canApply) return;

    setLoading(true);
    try {
      const result = await applyForCourse(user.uid, courseId);
      if (onApplicationSubmit) {
        onApplicationSubmit(result);
      }
      // Refresh qualification check
      await checkQualifications();
    } catch (error) {
      console.error('Error applying for course:', error);
      alert(error.message || 'Error submitting application');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="qualified-course-application loading-state">
        <div className="spinner-small"></div>
        <p>Checking your qualifications...</p>
      </div>
    );
  }

  if (!qualificationCheck) {
    return (
      <div className="qualified-course-application alert alert-error">
        <AlertIcon />
        <p>Unable to check qualifications. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="qualified-course-application qualification-check">
      <div className="qualification-header">
        <h4>Application Eligibility</h4>
      </div>

      <div className="qualification-results">
        {/* Academic Qualifications */}
        <div className={`qualification-item ${qualificationCheck.qualified ? 'qualified' : 'not-qualified'}`}>
          <div className="qualification-icon">
            {qualificationCheck.qualified ? <CheckIcon /> : <CloseIcon />}
          </div>
          <div className="qualification-content">
            <strong>Academic Requirements</strong>
            <p>
              {qualificationCheck.qualified 
                ? 'You meet the academic requirements for this course'
                : 'You do not meet the academic requirements for this course'
              }
            </p>
            {qualificationCheck.missingRequirements && qualificationCheck.missingRequirements.length > 0 && (
              <div className="missing-requirements">
                <p>Missing requirements:</p>
                <ul>
                  {qualificationCheck.missingRequirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Institution Application Limit */}
        <div className={`qualification-item ${qualificationCheck.canApplyToInstitution ? 'qualified' : 'not-qualified'}`}>
          <div className="qualification-icon">
            {qualificationCheck.canApplyToInstitution ? <CheckIcon /> : <CloseIcon />}
          </div>
          <div className="qualification-content">
            <strong>Institution Application Limit</strong>
            <p>
              {qualificationCheck.canApplyToInstitution
                ? `You can apply to this institution (${qualificationCheck.currentApplications}/2 applications)`
                : `You've reached the maximum applications (2/2) for this institution`
              }
            </p>
          </div>
        </div>

        {/* Course Availability */}
        <div className={`qualification-item ${qualificationCheck.courseAvailable ? 'qualified' : 'not-qualified'}`}>
          <div className="qualification-icon">
            {qualificationCheck.courseAvailable ? <CheckIcon /> : <CloseIcon />}
          </div>
          <div className="qualification-content">
            <strong>Course Availability</strong>
            <p>
              {qualificationCheck.courseAvailable
                ? 'This course is currently accepting applications'
                : 'This course is no longer accepting applications'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="application-actions">
        <button
          onClick={handleApply}
          disabled={!canApply || loading}
          className={`btn btn-primary ${!canApply ? 'btn-disabled' : ''}`}
        >
          {loading ? 'Applying...' : 'Apply for Course'}
        </button>

        {!canApply && (
          <p className="application-help">
            You cannot apply to this course at the moment. Please check the eligibility criteria above.
          </p>
        )}
      </div>
    </div>
  );
};

export default QualifiedCourseApplication;