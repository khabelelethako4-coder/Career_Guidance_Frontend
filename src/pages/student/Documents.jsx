// src/pages/student/Documents.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStudentDocuments, uploadDocument, deleteDocument } from '../../services/documentService';
import { ArrowLeftIcon, DocumentIcon, UploadIcon, TrashIcon, DownloadIcon } from '../../components/Icons';
import './StudentDashboard.css';

const StudentDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const docs = await getStudentDocuments(user.uid);
      setDocuments(docs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event, documentType) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      alert('Please upload PDF or image files only');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      await uploadDocument(user.uid, file, documentType);
      await fetchDocuments(); // Refresh the list
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document: ' + error.message);
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await deleteDocument(user.uid, documentId);
      await fetchDocuments(); // Refresh the list
      alert('Document deleted successfully!');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document: ' + error.message);
    }
  };

  const getDocumentTypeLabel = (type) => {
    const labels = {
      transcript: 'Academic Transcript',
      certificate: 'Additional Certificate',
      resume: 'Resume/CV',
      id_document: 'ID Document',
      other: 'Other Document'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="dashboard-container documents-page">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container documents-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <Link to="/student/dashboard" className="btn btn-outline btn-sm back-btn">
              <ArrowLeftIcon />
              Back to Dashboard
            </Link>
            <h1 className="dashboard-title">My Documents</h1>
            <p className="dashboard-subtitle">
              Manage your academic transcripts and certificates
            </p>
          </div>
        </div>

        <div className="main-content-grid">
          {/* Left Column - Upload Documents */}
          <div className="content-column">
            <div className="upload-documents-card card">
              <div className="card-header">
                <h3 className="upload-title">Upload Documents</h3>
              </div>
              <div className="card-body">
                <div className="upload-section">
                  {/* Academic Transcript */}
                  <div className="upload-card">
                    <div className="upload-icon">
                      <DocumentIcon />
                    </div>
                    <div className="upload-content">
                      <h4 className="upload-card-title">Academic Transcript</h4>
                      <p className="upload-description">Upload your official academic transcript (PDF, max 10MB)</p>
                      <label className="btn btn-primary btn-sm upload-btn">
                        <UploadIcon className="upload-btn-icon" />
                        {uploading ? 'Uploading...' : 'Upload Transcript'}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, 'transcript')}
                          disabled={uploading}
                          className="file-input"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Additional Certificates */}
                  <div className="upload-card">
                    <div className="upload-icon">
                      <DocumentIcon />
                    </div>
                    <div className="upload-content">
                      <h4 className="upload-card-title">Additional Certificates</h4>
                      <p className="upload-description">Upload any additional certificates or qualifications (PDF/Image, max 10MB)</p>
                      <label className="btn btn-outline btn-sm upload-btn">
                        <UploadIcon className="upload-btn-icon" />
                        {uploading ? 'Uploading...' : 'Upload Certificate'}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, 'certificate')}
                          disabled={uploading}
                          className="file-input"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Resume/CV */}
                  <div className="upload-card">
                    <div className="upload-icon">
                      <DocumentIcon />
                    </div>
                    <div className="upload-content">
                      <h4 className="upload-card-title">Resume/CV</h4>
                      <p className="upload-description">Upload your resume or CV for job applications (PDF, max 10MB)</p>
                      <label className="btn btn-outline btn-sm upload-btn">
                        <UploadIcon className="upload-btn-icon" />
                        {uploading ? 'Uploading...' : 'Upload Resume'}
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileUpload(e, 'resume')}
                          disabled={uploading}
                          className="file-input"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Document List */}
          <div className="content-column">
            <div className="documents-list-card card">
              <div className="card-header">
                <h3 className="documents-title">
                  My Documents ({documents.length})
                </h3>
              </div>
              <div className="card-body">
                {documents.length === 0 ? (
                  <div className="documents-empty-state">
                    <DocumentIcon className="empty-icon" />
                    <p className="empty-title">No documents uploaded yet</p>
                    <p className="empty-subtitle">Upload your academic transcripts and certificates above</p>
                  </div>
                ) : (
                  <div className="documents-list">
                    {documents.map((document) => (
                      <div key={document.id} className="document-item">
                        <div className="document-icon">
                          <DocumentIcon />
                        </div>
                        <div className="document-info">
                          <div className="document-main">
                            <strong className="document-name">{document.name}</strong>
                            <span className="document-type">
                              {getDocumentTypeLabel(document.type)}
                            </span>
                          </div>
                          <div className="document-meta">
                            <span className="document-date">
                              Uploaded: {new Date(document.uploadedAt?.toDate() || new Date()).toLocaleDateString()}
                            </span>
                            <span className="document-size">
                              {(document.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                        <div className="document-actions">
                          <a
                            href={document.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm view-document-btn"
                          >
                            <DownloadIcon className="action-icon" />
                            View
                          </a>
                          <button
                            onClick={() => handleDeleteDocument(document.id)}
                            className="btn btn-outline btn-sm delete-document-btn"
                          >
                            <TrashIcon className="action-icon" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Document Guidelines */}
            <div className="guidelines-card card">
              <div className="card-header">
                <h3 className="guidelines-title">Document Guidelines</h3>
              </div>
              <div className="card-body">
                <div className="guidelines-list">
                  <div className="guideline-item">
                    <strong>Accepted Formats:</strong> PDF, JPG, PNG
                  </div>
                  <div className="guideline-item">
                    <strong>Maximum File Size:</strong> 10MB per document
                  </div>
                  <div className="guideline-item">
                    <strong>Transcript Requirements:</strong> Must be official and legible
                  </div>
                  <div className="guideline-item">
                    <strong>Certificate Requirements:</strong> Clear images or scanned copies
                  </div>
                  <div className="guideline-item">
                    <strong>Privacy:</strong> Your documents are securely stored and only shared with institutions you apply to
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDocuments;