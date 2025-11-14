import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActiveJobs, searchJobs, getJobCategories, getJobLocations } from '../../services/jobService';
import { getAllApprovedCompanies } from '../../services/userService';
import { SearchIcon, FilterIcon, MapPinIcon, BriefcaseIcon, ClockIcon, DollarIcon, ArrowLeftIcon } from '../../components/Icons';
import './StudentDashboard.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    industry: ''
  });
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsData, companiesData, categoriesData, locationsData] = await Promise.all([
        getActiveJobs(),
        getAllApprovedCompanies(),
        getJobCategories(),
        getJobLocations()
      ]);
      
      console.log('Jobs data:', jobsData);
      console.log('Companies data:', companiesData);
      console.log('Categories data:', categoriesData);
      console.log('Locations data:', locationsData);
      
      setJobs(jobsData);
      setCompanies(companiesData);
      setCategories(categoriesData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const results = await searchJobs(searchTerm, filters);
      console.log('Search results:', results);
      setJobs(results);
    } catch (error) {
      console.error('Error searching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      location: '',
      jobType: '',
      industry: ''
    });
    fetchData();
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.profile?.companyName || company.companyName || 'Unknown Company' : 'Unknown Company';
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    if (typeof salary === 'number') {
      return `M${salary.toLocaleString()}/year`;
    }
    return salary;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="dashboard-container jobs-page">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container jobs-page">
      <div className="container">
        {/* Header with Back Button */}
        <div className="dashboard-header">
          <div className="header-content">
            <Link to="/student/dashboard" className="btn btn-outline btn-sm back-btn">
              <ArrowLeftIcon />
              Back to Dashboard
            </Link>
            <h1 className="dashboard-title">Find Jobs</h1>
            <p className="dashboard-subtitle">
              Discover opportunities that match your skills and interests
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-filters-card card">
          <div className="card-body">
            <div className="search-section">
              <div className="search-box large">
                <SearchIcon className="search-icon" />
                <input
                  type="text"
                  placeholder="Search for jobs, companies, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="search-input"
                />
                <button onClick={handleSearch} className="btn btn-primary search-btn">
                  Search
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-outline filter-toggle-btn"
              >
                <FilterIcon className="filter-icon" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="filters-section">
                <div className="filters-grid">
                  <div className="filter-group">
                    <label className="filter-label">Location</label>
                    <select
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Locations</option>
                      {locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">Job Type</label>
                    <select
                      value={filters.jobType}
                      onChange={(e) => handleFilterChange('jobType', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Types</option>
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">Industry</label>
                    <select
                      value={filters.industry}
                      onChange={(e) => handleFilterChange('industry', e.target.value)}
                      className="filter-select"
                    >
                      <option value="">All Industries</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="filter-actions">
                  <button onClick={clearFilters} className="btn btn-outline btn-sm clear-filters-btn">
                    Clear All
                  </button>
                  <button onClick={handleSearch} className="btn btn-primary btn-sm apply-filters-btn">
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Jobs List */}
        <div className="jobs-list-card card">
          <div className="card-header">
            <h3 className="jobs-list-title">
              Available Jobs ({jobs.length})
            </h3>
          </div>
          <div className="card-body">
            {jobs.length === 0 ? (
              <div className="jobs-empty-state">
                <BriefcaseIcon className="empty-icon" />
                <p className="empty-title">No jobs found</p>
                <p className="empty-subtitle">Try adjusting your search criteria or check back later for new opportunities.</p>
                <button onClick={clearFilters} className="btn btn-primary clear-filters-btn">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="jobs-list">
                {jobs.map((job) => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <div className="job-info">
                        <h4 className="job-title">{job.title}</h4>
                        <p className="company-name">{getCompanyName(job.companyId)}</p>
                        <div className="job-meta">
                          <span className="job-meta-item">
                            <MapPinIcon className="meta-icon" />
                            {job.location || 'Location not specified'}
                          </span>
                          <span className="job-meta-item">
                            <BriefcaseIcon className="meta-icon" />
                            {job.jobType || 'Type not specified'}
                          </span>
                          {job.salary && (
                            <span className="job-meta-item">
                              <DollarIcon className="meta-icon" />
                              {formatSalary(job.salary)}
                            </span>
                          )}
                          {job.createdAt && (
                            <span className="job-meta-item">
                              <ClockIcon className="meta-icon" />
                              {formatDate(job.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="job-actions">
                        <Link to={`/student/job/${job.id}`} className="btn btn-primary view-details-btn">
                          View Details
                        </Link>
                      </div>
                    </div>
                    
                    {job.description && (
                      <div className="job-description">
                        <p>{job.description.substring(0, 200)}...</p>
                      </div>
                    )}

                    <div className="job-footer">
                      <div className="job-tags">
                        {job.industry && (
                          <span className="job-tag">{job.industry}</span>
                        )}
                        {job.experienceLevel && (
                          <span className="job-tag">{job.experienceLevel}</span>
                        )}
                        {job.employmentType && (
                          <span className="job-tag">{job.employmentType}</span>
                        )}
                      </div>
                      <div className="job-stats">
                        {job.applications > 0 && (
                          <span className="applications-count">
                            {job.applications} application{job.applications !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;