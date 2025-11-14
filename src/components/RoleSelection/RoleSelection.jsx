import React from 'react';
import { Link } from 'react-router-dom';
import './RoleSelection.css';

const RoleSelection = ({ type = 'login' }) => {
  const roles = [
    {
      id: 'student',
      title: 'Student',
      description: 'Access courses, assignments, and learning materials',
      icon: '🎓',
      color: '#4f46e5',
      path: type === 'login' ? '/login/student' : '/register/student'
    },
    {
      id: 'institution',
      title: 'Institution',
      description: 'Manage courses, students, and academic programs',
      icon: '🏫',
      color: '#059669',
      path: type === 'login' ? '/login/institution' : '/register/institution'
    },
    {
      id: 'company',
      title: 'Company',
      description: 'Post jobs, connect with students and institutions',
      icon: '💼',
      color: '#dc2626',
      path: type === 'login' ? '/login/company' : '/register/company'
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'System administration and user management',
      icon: '⚙️',
      color: '#7c3aed',
      path: type === 'login' ? '/login/admin' : '/register/admin'
    }
  ];

  return (
    <div className="role-selection-container">
      <div className="role-selection-card">
        <div className="role-selection-header">
          <h1 className="role-selection-title">
            {type === 'login' ? 'Sign In to Your Account' : 'Create Your Account'}
          </h1>
          <p className="role-selection-subtitle">
            {type === 'login' 
              ? 'Choose your role to continue signing in' 
              : 'Select your role to start your journey'
            }
          </p>
        </div>

        <div className="roles-grid">
          {roles.map((role) => (
            <Link
              key={role.id}
              to={role.path}
              className="role-card"
              style={{ '--role-color': role.color }}
            >
              <div className="role-icon-container">
                <div className="role-icon" style={{ backgroundColor: `${role.color}15` }}>
                  <span className="role-icon-emoji" style={{ color: role.color }}>{role.icon}</span>
                </div>
              </div>
              <div className="role-content">
                <h3 className="role-title">{role.title}</h3>
                <p className="role-description">{role.description}</p>
              </div>
              <div className="role-arrow">→</div>
            </Link>
          ))}
        </div>

        <div className="role-selection-footer">
          <p className="role-selection-footer-text">
            {type === 'login' ? "Don't have an account? " : "Already have an account? "}
            <Link 
              to={type === 'login' ? '/role-selection/register' : '/role-selection/login'} 
              className="auth-switch-link"
            >
              {type === 'login' ? 'Register here' : 'Sign in here'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;