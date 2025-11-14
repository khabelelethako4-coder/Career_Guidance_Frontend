// src/components/student/AdmissionSelection.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentAdmissions, selectAdmission } from '../../services/applicationService';
import { AlertIcon, CheckIcon, InfoIcon } from '../Icons';
import './StudentComponents.css'; // Import the new CSS file

const AdmissionSelection = () => {
  const { user } = useAuth();
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    fetchAdmissions();
  }, [user]);

  const fetchAdmissions = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const admissionsData = await getStudentAdmissions(user.uid);
      setAdmissions(admissionsData);
    } catch (error) {
      console.error('Error fetching admissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAdmission = async (admissionId) => {
    if (!window.confirm('Are you sure you want to accept this admission offer? This will automatically decline other offers.')) {
      return;
    }

    setSelecting(true);
    try {
      await selectAdmission(user.uid, admissionId);
      await fetchAdmissions(); // Refresh the list
      alert('Admission selected successfully! Other offers have been automatically declined.');
    } catch (error) {
      console.error('Error selecting admission:', error);
      alert(error.message || 'Error selecting admission');
    } finally {
      setSelecting(false);
    }
  };

  const admittedAdmissions = admissions.filter(admission => 
    admission.status === 'admitted' && !admission.studentSelected
  );

  if (loading) {
    return (
      <div className="admission-selection loading-state">
        <div className="spinner-small"></div>
        <p>Loading admission offers...</p>
      </div>
    );
  }

  if (admittedAdmissions.length === 0) {
    return null; // Don't show if no multiple admissions
  }

  if (admittedAdmissions.length === 1) {
    return (
      <div className="admission-selection alert alert-info">
        <InfoIcon />
        <div className="alert-content">
          <strong>Admission Offer Received</strong>
          <p>You have been admitted to {admittedAdmissions[0].courseName} at {admittedAdmissions[0].institutionName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admission-selection card alert-warning">
      <div className="card-header">
        <h3>
          <AlertIcon />
          Multiple Admission Offers
        </h3>
      </div>
      <div className="card-body">
        <div className="alert alert-warning mb-4">
          <p>
            <strong>You have been admitted to multiple institutions!</strong><br />
            Please select one institution to accept. This will automatically decline other offers.
          </p>
        </div>

        <div className="admissions-grid">
          {admittedAdmissions.map((admission) => (
            <div key={admission.id} className="admission-card">
              <div className="admission-header">
                <h4>{admission.courseName}</h4>
                <span className="badge badge-success">Admitted</span>
              </div>
              
              <div className="admission-details">
                <p><strong>Institution:</strong> {admission.institutionName}</p>
                <p><strong>Faculty:</strong> {admission.facultyName}</p>
                <p><strong>Duration:</strong> {admission.courseDuration}</p>
                {admission.courseFees && (
                  <p><strong>Fees:</strong> M{admission.courseFees}</p>
                )}
              </div>

              <div className="admission-actions">
                <button
                  onClick={() => handleSelectAdmission(admission.id)}
                  disabled={selecting}
                  className="btn btn-primary btn-sm"
                >
                  {selecting ? 'Processing...' : 'Accept Offer'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="admission-note">
          <p className="text-sm text-muted">
            <InfoIcon />
            Once you select an institution, you will be automatically removed from other institutions' admission lists.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdmissionSelection;