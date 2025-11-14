import React, { useState } from 'react';
import axios from 'axios';

const TranscriptUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [transcript, setTranscript] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is PDF
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('transcript', file);
      
      const response = await axios.post('/api/students/transcript', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setTranscript(response.data);
      alert('Transcript uploaded successfully!');
    } catch (error) {
      alert('Error uploading transcript: ' + error.response.data.error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Academic Transcript</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Transcript (PDF)
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        {uploading && (
          <div className="text-sm text-gray-500">Uploading transcript...</div>
        )}

        {transcript && (
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Current Transcript</h3>
            <div className="text-sm text-gray-600">
              <p>Uploaded: {new Date(transcript.uploadedAt).toLocaleDateString()}</p>
              <p>GPA: {transcript.gpa || 'Not specified'}</p>
              <a 
                href={transcript.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-500"
              >
                View Transcript
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptUpload;