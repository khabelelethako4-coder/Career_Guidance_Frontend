// src/components/Layout/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'student':
        return '/student/dashboard';
      case 'institution':
        return '/institution/dashboard';
      case 'company':
        return '/company/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    switch (user.role) {
      case 'student':
        return 'Student Dashboard';
      case 'institution':
        return 'Institution Dashboard';
      case 'company':
        return 'Company Dashboard';
      case 'admin':
        return 'Admin Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand-section">
          <Link to="/" className="navbar-brand">
            <div className="brand-logo">🎓</div>
            <span className="brand-text">EduConnect Lesotho</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-desktop">
          {user ? (
            <div className="navbar-items">
              <Link
                to={getDashboardLink()}
                className="navbar-link"
              >
                {getDashboardLabel()}
              </Link>
              <div className="navbar-user">
                <span className="user-email">{user.email}</span>
                <button
                  onClick={toggleTheme}
                  className="theme-toggle"
                  title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? (
                    <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-logout"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="navbar-items">
              <Link
                to="/role-selection/login"
                className="navbar-link"
              >
                Sign In
              </Link>
              <button
                onClick={toggleTheme}
                className="theme-toggle"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
              <Link
                to="/role-selection/register"
                className="btn-register"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="navbar-mobile-toggle">
          <button
            onClick={toggleTheme}
            className="theme-toggle mobile-theme-toggle"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="mobile-menu-button"
            aria-label="Toggle menu"
          >
            <svg
              className="menu-icon"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isOpen
                    ? 'M6 18L18 6M6 6l12 12'
                    : 'M4 6h16M4 12h16M4 18h16'
                }
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              {user ? (
                <>
                  <div className="mobile-user-info">
                    <span className="mobile-user-email">{user.email}</span>
                    <span className="mobile-user-role">{user.role}</span>
                  </div>
                  <Link
                    to={getDashboardLink()}
                    className="mobile-nav-link"
                    onClick={() => setIsOpen(false)}
                  >
                    {getDashboardLabel()}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="mobile-nav-button logout"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/role-selection/login"
                    className="mobile-nav-link"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/role-selection/register"
                    className="mobile-nav-button register"
                    onClick={() => setIsOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;