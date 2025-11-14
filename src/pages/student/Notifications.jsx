// src/pages/student/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStudentNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/notificationService';
import { ArrowLeftIcon, BellIcon, BriefcaseIcon, CheckIcon, AlertIcon } from '../../components/Icons';
import './StudentDashboard.css';

const StudentNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const notifs = await getStudentNotifications(user.uid);
      setNotifications(notifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user.uid);
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job_match':
        return <BriefcaseIcon />;
      case 'admission':
      case 'application_accepted':
        return <CheckIcon />;
      case 'application_update':
      default:
        return <AlertIcon />;
    }
  };

  const getNotificationAction = (notification) => {
    if (notification.applicationId) {
      return `/student/application/${notification.applicationId}`;
    }
    if (notification.jobId) {
      return `/student/job/${notification.jobId}`;
    }
    return '#';
  };

  if (loading) {
    return (
      <div className="dashboard-container notifications-page">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="dashboard-container notifications-page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <Link to="/student/dashboard" className="btn btn-outline btn-sm back-btn">
              <ArrowLeftIcon />
              Back to Dashboard
            </Link>
            <h1 className="dashboard-title">Notifications</h1>
            <p className="dashboard-subtitle">
              Stay updated with your applications and opportunities
            </p>
          </div>
          <div className="header-actions">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="btn btn-outline btn-sm mark-all-btn"
              >
                Mark All as Read
              </button>
            )}
          </div>
        </div>

        <div className="notifications-card card">
          <div className="card-header">
            <h3 className="notifications-header">
              <BellIcon className="header-icon" />
              Notifications ({notifications.length})
              {unreadCount > 0 && (
                <span className="badge badge-primary unread-badge">
                  {unreadCount} unread
                </span>
              )}
            </h3>
          </div>
          <div className="card-body">
            {notifications.length === 0 ? (
              <div className="notifications-empty-state">
                <BellIcon className="empty-icon" />
                <p className="empty-title">No notifications yet</p>
                <p className="empty-subtitle">
                  You'll receive notifications here about your applications and matching opportunities.
                </p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-header">
                        <strong className="notification-title">{notification.title}</strong>
                        <span className="notification-time">
                          {new Date(notification.createdAt?.toDate() || new Date()).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-actions">
                        {notification.applicationId || notification.jobId ? (
                          <Link
                            to={getNotificationAction(notification)}
                            className="btn btn-primary btn-sm view-details-btn"
                          >
                            View Details
                          </Link>
                        ) : null}
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="btn btn-outline btn-sm mark-read-btn"
                          >
                            Mark as Read
                          </button>
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

export default StudentNotifications;