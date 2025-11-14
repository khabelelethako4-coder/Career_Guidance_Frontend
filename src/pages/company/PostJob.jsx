// src/pages/company/PostJob.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createJob } from '../../services/jobService';
import { getCompanyByUserId } from '../../services/userService';
import { ArrowLeftIcon, BriefcaseIcon, SaveIcon } from '../../components/Icons';

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companyLoading, setCompanyLoading] = useState(true);

  const [jobData, setJobData] = useState({
    title: '',
    department: '',
    jobType: 'full-time',
    location: '',
    salary: '',
    description: '',
    requirements: {
      education: '',
      experience: '',
      skills: [],
    },
    qualifications: {
      minGPA: '',
      workExperience: ''
    },
    applicationDeadline: '',
    contactEmail: '',
    contactPhone: ''
  });

  useEffect(() => {
    const fetchCompany = async () => {
      if (user?.uid) {
        try {
          setCompanyLoading(true);
          console.log('Fetching company for user:', user.uid);
          const companyData = await getCompanyByUserId(user.uid);
          console.log('Company data received:', companyData);
          
          if (!companyData) {
            setError('Company profile not found. Please complete your company profile first.');
            return;
          }
          
          // Check if companyName exists in the company data
          const companyName = companyData.companyName || companyData.profile?.companyName;
          if (!companyName) {
            setError('Company name is missing. Please update your company profile with a company name.');
            return;
          }
          
          setCompany({
            ...companyData,
            companyName: companyName
          });
        } catch (error) {
          console.error('Error fetching company:', error);
          setError('Failed to load company information. Please try again.');
        } finally {
          setCompanyLoading(false);
        }
      }
    };
    fetchCompany();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequirementsChange = (e) => {
    const { name, value } = e.target;
    setJobData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [name]: value
      }
    }));
  };

  const handleQualificationsChange = (e) => {
    const { name, value } = e.target;
    setJobData(prev => ({
      ...prev,
      qualifications: {
        ...prev.qualifications,
        [name]: value
      }
    }));
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setJobData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        skills
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!jobData.title.trim()) {
        throw new Error('Job title is required');
      }
      if (!jobData.description.trim()) {
        throw new Error('Job description is required');
      }
      if (!jobData.location.trim()) {
        throw new Error('Location is required');
      }

      // Validate company data
      if (!company) {
        throw new Error('Company profile not found. Please complete your company profile first.');
      }
      
      const companyName = company.companyName || company.profile?.companyName;
      if (!companyName) {
        throw new Error('Company name is missing. Please update your company profile with a company name.');
      }
      
      if (!company.id) {
        throw new Error('Company ID is missing. Please complete your company profile.');
      }

      console.log('Company data for job creation:', {
        id: company.id,
        name: companyName,
        userId: user.uid
      });

      // Prepare job data with explicit field assignment to avoid undefined
      const jobToCreate = {
        title: jobData.title || '',
        department: jobData.department || '',
        jobType: jobData.jobType || 'full-time',
        location: jobData.location || '',
        salary: jobData.salary || '',
        description: jobData.description || '',
        requirements: {
          education: jobData.requirements.education || '',
          experience: jobData.requirements.experience || '',
          skills: jobData.requirements.skills || [],
        },
        qualifications: {
          minGPA: jobData.qualifications.minGPA || '',
          workExperience: jobData.qualifications.workExperience || ''
        },
        applicationDeadline: jobData.applicationDeadline || '',
        contactEmail: jobData.contactEmail || '',
        contactPhone: jobData.contactPhone || '',
        companyId: company.id || '',
        companyName: companyName || '',
        companyUserId: user.uid || '',
        status: 'active',
        applications: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Final validation before sending
      if (!jobToCreate.companyName) {
        throw new Error('Company name is required but missing. Please update your company profile.');
      }

      console.log('Final job data being sent:', jobToCreate);
      await createJob(jobToCreate);
      
      alert('Job posted successfully!');
      navigate('/company/dashboard');

    } catch (error) {
      console.error('Error posting job:', error);
      setError(error.message || 'Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (companyLoading) {
    return (
      <div className="dashboard-container company-dashboard">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading company information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="dashboard-container company-dashboard">
        <div className="container">
          <div className="empty-state">
            <BriefcaseIcon />
            <h3>Company Profile Required</h3>
            <p>You need to complete your company profile before posting jobs.</p>
            <div className="action-buttons">
              <button 
                onClick={() => navigate('/company/profile')}
                className="btn btn-primary"
              >
                Complete Company Profile
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="btn btn-outline"
              >
                Retry Loading
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayCompanyName = company.companyName || company.profile?.companyName;

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
            <h1 className="dashboard-title">Post New Job</h1>
            <p className="dashboard-subtitle">
              Create a new job listing to attract qualified candidates
            </p>
            <div className="company-info-badge">
              Posting as: <strong>{displayCompanyName}</strong>
              {company.id && <span> (ID: {company.id})</span>}
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
            <button onClick={() => setError('')} className="alert-close">
              ×
            </button>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3>
              <BriefcaseIcon />
              Job Information
            </h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={jobData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Software Engineer, Marketing Manager"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={jobData.department}
                    onChange={handleChange}
                    placeholder="e.g., Engineering, Marketing"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Job Type *</label>
                  <select
                    name="jobType"
                    value={jobData.jobType}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={jobData.location}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Maseru, Lesotho"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Salary</label>
                  <input
                    type="text"
                    name="salary"
                    value={jobData.salary}
                    onChange={handleChange}
                    placeholder="e.g., M10,000 - M15,000"
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label>Application Deadline</label>
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={jobData.applicationDeadline}
                    onChange={handleChange}
                    disabled={loading}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Job Description *</label>
                  <textarea
                    name="description"
                    value={jobData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                    disabled={loading}
                  />
                </div>

                {/* Requirements Section */}
                <div className="form-section full-width">
                  <h4>Requirements & Qualifications</h4>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Education Level</label>
                      <select
                        name="education"
                        value={jobData.requirements.education}
                        onChange={handleRequirementsChange}
                        disabled={loading}
                      >
                        <option value="">Any Education</option>
                        <option value="high-school">High School</option>
                        <option value="diploma">Diploma</option>
                        <option value="bachelors">Bachelor's Degree</option>
                        <option value="masters">Master's Degree</option>
                        <option value="phd">PhD</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Experience Level</label>
                      <select
                        name="experience"
                        value={jobData.requirements.experience}
                        onChange={handleRequirementsChange}
                        disabled={loading}
                      >
                        <option value="">Any Experience</option>
                        <option value="internship">Internship</option>
                        <option value="entry-level">Entry Level (0-2 years)</option>
                        <option value="mid-level">Mid Level (2-5 years)</option>
                        <option value="senior">Senior (5+ years)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Minimum GPA (if applicable)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="4.0"
                        name="minGPA"
                        value={jobData.qualifications.minGPA}
                        onChange={handleQualificationsChange}
                        placeholder="e.g., 3.0"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Required Skills</label>
                      <input
                        type="text"
                        name="skills"
                        onChange={handleSkillsChange}
                        placeholder="e.g., JavaScript, React, Project Management, Communication (comma separated)"
                        disabled={loading}
                      />
                      <small>Separate skills with commas</small>
                    </div>

                    <div className="form-group full-width">
                      <label>Work Experience Requirements</label>
                      <textarea
                        name="workExperience"
                        value={jobData.qualifications.workExperience}
                        onChange={handleQualificationsChange}
                        rows="3"
                        placeholder="Describe any specific work experience requirements..."
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="form-section full-width">
                  <h4>Contact Information</h4>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Contact Email</label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={jobData.contactEmail}
                        onChange={handleChange}
                        placeholder="hr@company.com"
                        disabled={loading}
                      />
                    </div>

                    <div className="form-group">
                      <label>Contact Phone</label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={jobData.contactPhone}
                        onChange={handleChange}
                        placeholder="+266 1234 5678"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/company/dashboard')}
                  className="btn btn-outline"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !displayCompanyName}
                  className="btn btn-primary"
                >
                  <SaveIcon />
                  {loading ? 'Posting Job...' : 'Post Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;