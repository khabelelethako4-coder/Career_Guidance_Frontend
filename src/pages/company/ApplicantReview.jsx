// src/pages/company/ApplicantReview.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobApplication, updateJobApplicationStatus } from '../../services/jobService';
import { getStudentProfile } from '../../services/userService';
import { ArrowLeftIcon, UserIcon, BriefcaseIcon, CheckIcon, CloseIcon, DownloadIcon } from '../../components/Icons';

const ApplicantReview = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appData = await getJobApplication(applicationId);
        setApplication(appData);

        if (appData.studentId) {
          const studentData = await getStudentProfile(appData.studentId);
          setStudent(studentData);
        }
      } catch (error) {
        console.error('Error fetching application:', error);
        setError('Failed to load application details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [applicationId]);

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to ${newStatus} this application?`)) {
      return;
    }

    setUpdating(true);
    try {
      await updateJobApplicationStatus(applicationId, newStatus);
      setApplication(prev => ({
        ...prev,
        status: newStatus
      }));
      alert(`Application ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  const calculateMatchScore = (student, job) => {
    // Simplified match score calculation based on qualifications
    let score = 0;
    
    // Education match (40%)
    if (job.requirements?.education && student.profile?.education) {
      const hasRequiredEducation = student.profile.education.some(edu => 
        edu.level?.toLowerCase().includes(job.requirements.education.toLowerCase())
      );
      if (hasRequiredEducation) score += 40;
    }

    // Skills match (30%)
    if (job.requirements?.skills && student.profile?.skills) {
      const matchingSkills = student.profile.skills.filter(skill =>
        job.requirements.skills.some(reqSkill =>
          reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(reqSkill.toLowerCase())
        )
      );
      score += (matchingSkills.length / job.requirements.skills.length) * 30;
    }

    // Experience match (30%)
    if (job.requirements?.experience && student.profile?.workExperience) {
      const hasRequiredExperience = student.profile.workExperience.some(exp =>
        exp.years >= parseInt(job.requirements.experience) || 0
      );
      if (hasRequiredExperience) score += 30;
    }

    return Math.min(Math.round(score), 100);
  };

  if (loading) {
    return (
      <div className="dashboard-container company-dashboard">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="dashboard-container company-dashboard">
        <div className="container">
          <div className="empty-state">
            <UserIcon />
            <p>Application not found</p>
            <button 
              onClick={() => navigate('/company/dashboard')}
              className="btn btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const matchScore = student ? calculateMatchScore(student, application.job) : 0;

  return (
    <div className="dashboard-container company-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-content">
            <button 
              onClick={() => navigate('/company/dashboard')}
              className="btn btn-outline btn-sm back-btn"
            >
              <ArrowLeftIcon />
              Back to Dashboard
            </button>
            <h1 className="dashboard-title">Applicant Review</h1>
            <p className="dashboard-subtitle">
              Review candidate qualifications and make a decision
            </p>
          </div>
          <div className="header-actions">
            <span className={`status-badge status-${application.status}`}>
              {application.status}
            </span>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="main-content-grid">
          {/* Applicant Information */}
          <div className="content-column">
            <div className="card">
              <div className="card-header">
                <h3>
                  <UserIcon />
                  Applicant Information
                </h3>
              </div>
              <div className="card-body">
                {student ? (
                  <div className="applicant-profile">
                    <div className="applicant-header">
                      <h4>{student.profile?.firstName} {student.profile?.lastName}</h4>
                      <div className="match-score">
                        <span className="score-badge">{matchScore}% Match</span>
                      </div>
                    </div>

                    <div className="applicant-details">
                      <div className="detail-section">
                        <h5>Contact Information</h5>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <strong>Email:</strong>
                            <span>{student.email}</span>
                          </div>
                          <div className="detail-item">
                            <strong>Phone:</strong>
                            <span>{student.profile?.phone || 'Not provided'}</span>
                          </div>
                          <div className="detail-item">
                            <strong>Location:</strong>
                            <span>{student.profile?.address || 'Not provided'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="detail-section">
                        <h5>Education</h5>
                        {student.profile?.education?.map((edu, index) => (
                          <div key={index} className="education-item">
                            <strong>{edu.institution}</strong>
                            <p>{edu.degree} in {edu.field}</p>
                            <small>{edu.startYear} - {edu.endYear || 'Present'} | GPA: {edu.gpa}</small>
                          </div>
                        )) || <p>No education information provided</p>}
                      </div>

                      <div className="detail-section">
                        <h5>Work Experience</h5>
                        {student.profile?.workExperience?.map((exp, index) => (
                          <div key={index} className="experience-item">
                            <strong>{exp.position} at {exp.company}</strong>
                            <p>{exp.description}</p>
                            <small>{exp.startDate} - {exp.endDate || 'Present'} | {exp.years} years</small>
                          </div>
                        )) || <p>No work experience provided</p>}
                      </div>

                      <div className="detail-section">
                        <h5>Skills</h5>
                        <div className="skills-list">
                          {student.profile?.skills?.map((skill, index) => (
                            <span key={index} className="skill-tag">{skill}</span>
                          )) || <p>No skills listed</p>}
                        </div>
                      </div>

                      <div className="detail-section">
                        <h5>Certificates</h5>
                        {student.profile?.certificates?.map((cert, index) => (
                          <div key={index} className="certificate-item">
                            <strong>{cert.name}</strong>
                            <p>{cert.issuer} | {cert.issueDate}</p>
                          </div>
                        )) || <p>No certificates provided</p>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>Student information not available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Job Information & Actions */}
          <div className="content-column">
            <div className="card">
              <div className="card-header">
                <h3>
                  <BriefcaseIcon />
                  Job Information
                </h3>
              </div>
              <div className="card-body">
                <div className="job-preview">
                  <h4>{application.job?.title}</h4>
                  <div className="job-meta">
                    <span>{application.job?.location}</span>
                    <span>{application.job?.jobType}</span>
                    <span>{application.job?.department}</span>
                  </div>

                  <div className="job-requirements">
                    <h5>Requirements</h5>
                    <ul>
                      {application.job?.requirements?.education && (
                        <li><strong>Education:</strong> {application.job.requirements.education}</li>
                      )}
                      {application.job?.requirements?.experience && (
                        <li><strong>Experience:</strong> {application.job.requirements.experience}</li>
                      )}
                      {application.job?.requirements?.skills?.map((skill, index) => (
                        <li key={index}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Application Decision</h3>
              </div>
              <div className="card-body">
                <div className="decision-actions">
                  <p><strong>Current Status:</strong> <span className={`status-badge status-${application.status}`}>{application.status}</span></p>
                  
                  <div className="action-buttons">
                    <button
                      onClick={() => handleStatusUpdate('shortlisted')}
                      disabled={updating || application.status === 'shortlisted'}
                      className="btn btn-primary"
                    >
                      <CheckIcon />
                      Shortlist
                    </button>
                    
                    <button
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={updating || application.status === 'rejected'}
                      className="btn btn-outline"
                    >
                      <CloseIcon />
                      Reject
                    </button>

                    <button
                      onClick={() => handleStatusUpdate('interview')}
                      disabled={updating || application.status === 'interview'}
                      className="btn btn-primary"
                    >
                      <UserIcon />
                      Schedule Interview
                    </button>
                  </div>

                  <div className="application-meta">
                    <p><strong>Applied:</strong> {application.appliedAt ? new Date(application.appliedAt.toDate()).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Match Score:</strong> {matchScore}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Documents</h3>
              </div>
              <div className="card-body">
                <div className="document-actions">
                  <button className="btn btn-outline btn-sm">
                    <DownloadIcon />
                    Download Resume
                  </button>
                  <button className="btn btn-outline btn-sm">
                    <DownloadIcon />
                    View Transcript
                  </button>
                  <button className="btn btn-outline btn-sm">
                    <DownloadIcon />
                    Certificates
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantReview;