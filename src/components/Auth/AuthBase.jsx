// src/components/Auth/AuthBase.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './AuthBase.css';

const AuthBase = ({ 
  role, 
  title, 
  subtitle, 
  children, 
  type = 'login',
  error,
  onClearError,
  loading = false 
}) => {
  const roleConfig = {
    student: { color: '#4f46e5', icon: '🎓', name: 'Student' },
    institution: { color: '#059669', icon: '🏫', name: 'Institution' },
    company: { color: '#dc2626', icon: '💼', name: 'Company' },
    admin: { color: '#7c3aed', icon: '⚙️', name: 'Admin' }
  };

  const config = roleConfig[role] || roleConfig.student;

  return (
    <div className="auth-base-container" style={{ '--role-color': config.color }}>
      <div className="auth-base-card">
        <div className="auth-base-header">
          <div className="auth-base-logo" style={{ backgroundColor: `${config.color}15` }}>
            <span style={{ color: config.color }}>{config.icon}</span>
          </div>
          <h1 className="auth-base-title">{title}</h1>
          <p className="auth-base-subtitle">{subtitle}</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <div className="alert-icon">!</div>
            <div className="alert-content">
              <strong>Error: </strong>
              {error}
            </div>
            <button className="alert-close" onClick={onClearError}>
              ×
            </button>
          </div>
        )}

        <div className="auth-base-content">
          {children}
        </div>

        <div className="auth-base-footer">
          <p>
            {type === 'login' ? "Don't have an account? " : "Already have an account? "}
            <Link 
              to={type === 'login' ? `/register/${role}` : `/login/${role}`}
              className="auth-base-link"
            >
              {type === 'login' ? 'Register here' : 'Sign in here'}
            </Link>
          </p>
          <Link to="/role-selection/login" className="auth-base-back">
            ← Back to role selection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthBase;