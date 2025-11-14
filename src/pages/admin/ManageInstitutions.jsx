import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getInstitutions, deleteInstitution, updateInstitution } from '../../services/institutionService';
import { BuildingIcon, EditIcon, DeleteIcon, ArrowLeftIcon, SearchIcon, FacultyIcon, CourseIcon } from "../../components/Icons";

const ManageInstitutions = () => {
  const navigate = useNavigate();
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const data = await getInstitutions();
      setInstitutions(data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (institutionId, institutionName) => {
    if (window.confirm(`Are you sure you want to delete "${institutionName}"? This action cannot be undone.`)) {
      try {
        await deleteInstitution(institutionId);
        setInstitutions(institutions.filter(inst => inst.id !== institutionId));
        alert('Institution deleted successfully');
      } catch (error) {
        console.error('Error deleting institution:', error);
        alert('Failed to delete institution');
      }
    }
  };

  const handleStatusChange = async (institutionId, newStatus) => {
    try {
      await updateInstitution(institutionId, { status: newStatus });
      setInstitutions(institutions.map(inst => 
        inst.id === institutionId ? { ...inst, status: newStatus } : inst
      ));
      alert('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const filteredInstitutions = institutions.filter(institution => {
    const matchesSearch = institution.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         institution.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         institution.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || institution.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-content">
            <button 
              onClick={() => navigate('/admin')}
              className="btn btn-outline btn-sm"
              style={{ marginBottom: '1rem' }}
            >
              <ArrowLeftIcon />
              Back to Dashboard
            </button>
            <h1 className="dashboard-title">Manage Institutions</h1>
            <p className="dashboard-subtitle">
              View, edit, and manage all educational institutions
            </p>
          </div>
          <div className="header-actions">
            <Link to="/admin/add-institution" className="btn btn-primary">
              <BuildingIcon />
              Add Institution
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card">
          <div className="card-body">
            <div className="filters-row">
              <div className="search-box">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search institutions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label>Status:</label>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Institutions Table */}
        <div className="card">
          <div className="card-header">
            <h3>Institutions ({filteredInstitutions.length})</h3>
          </div>
          <div className="card-body">
            {filteredInstitutions.length === 0 ? (
              <div className="empty-state">
                <BuildingIcon />
                <p>No institutions found</p>
                {searchTerm || filterStatus !== 'all' ? (
                  <button 
                    onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                    className="btn btn-primary"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <Link to="/admin/add-institution" className="btn btn-primary">
                    Add First Institution
                  </Link>
                )}
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Institution Name</th>
                      <th>Contact Info</th>
                      <th>Location</th>
                      <th>Faculties</th>
                      <th>Courses</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInstitutions.map((institution) => (
                      <tr key={institution.id}>
                        <td>
                          <div className="entity-info">
                            <strong>{institution.name}</strong>
                            <span className="entity-subtitle">{institution.type}</span>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <div>{institution.email}</div>
                            <div className="contact-phone">{institution.phone}</div>
                          </div>
                        </td>
                        <td>{institution.location}</td>
                        <td>
                          <span className="count-badge">
                            {institution.faculties?.length || 0}
                          </span>
                        </td>
                        <td>
                          <span className="count-badge">
                            {institution.courses?.length || 0}
                          </span>
                        </td>
                        <td>
                          <select
                            value={institution.status || 'active'}
                            onChange={(e) => handleStatusChange(institution.id, e.target.value)}
                            className={`status-select status-${institution.status}`}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                          </select>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Link
                              to={`/admin/institution/${institution.id}`}
                              className="btn btn-primary btn-sm"
                            >
                              <EditIcon />
                              Edit
                            </Link>
                            <Link
                              to={`/admin/institution/${institution.id}/faculties`}
                              className="btn btn-secondary btn-sm"
                              title="Manage Faculties"
                            >
                              <FacultyIcon />
                            </Link>
                            <Link
                              to={`/admin/institution/${institution.id}/courses`}
                              className="btn btn-secondary btn-sm"
                              title="Manage Courses"
                            >
                              <CourseIcon />
                            </Link>
                            <button
                              onClick={() => handleDelete(institution.id, institution.name)}
                              className="btn btn-danger btn-sm"
                            >
                              <DeleteIcon />
                              Delete
                            </button>
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

export default ManageInstitutions;