// src/App.jsx - COMPLETE CORRECTED VERSION
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';

// Role Selection Pages
import RoleSelection from './components/RoleSelection/RoleSelection';

// CORRECTED: Role-Specific Login Pages
import StudentLogin from './pages/auth/Login/StudentLogin';
import InstitutionLogin from './pages/auth/Login/InstitutionLogin';
import CompanyLogin from './pages/auth/Login/CompanyLogin';
import AdminLogin from './pages/auth/Login/AdminLogin';

// CORRECTED: Role-Specific Registration Pages
import StudentRegister from './pages/auth/Register/StudentRegister';
import InstitutionRegister from './pages/auth/Register/InstitutionRegister';
import CompanyRegister from './pages/auth/Register/CompanyRegister';
import AdminRegister from './pages/auth/Register/AdminRegister';

// Dashboard Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentCourses from './pages/student/Courses';
import StudentJobs from './pages/student/Jobs';
import StudentProfile from './pages/student/Profile';
import StudentDocuments from './pages/student/Documents';
import StudentNotifications from './pages/student/Notifications';
import StudentApplicationDetails from './pages/student/ApplicationDetails';
import InstitutionDashboard from './pages/institution/Dashboard';
import CompanyDashboard from './pages/company/Dashboard';
import CompanyProfile from './pages/company/CompanyProfile';
import PostJob from './pages/company/PostJob';
import ApplicantReview from './pages/company/ApplicantReview';
import CompanyApplications from './pages/company/CompanyApplications';
import CompanyJobDetails from './pages/company/CompanyJobDetails';
import AdminDashboard from './pages/admin/Dashboard';
import QualifiedCourseApplication from './components/student/QualifiedCourseApplication';

// Import admin components
import AddInstitution from './pages/admin/AddInstitution';
import ManageInstitutions from './pages/admin/ManageInstitutions';
import ManageCompanies from './pages/admin/ManageCompanies';
import EditInstitution from './pages/admin/EditInstitution';
import ManageCompany from './pages/admin/ManageCompany';
import SystemSettings from './pages/admin/SystemSettings';
import BulkImport from './pages/admin/BulkImport';

// Import faculty and course management components
import FacultyManagement from './pages/admin/FacultyManagement';
import CourseManagement from './pages/admin/CourseManagement';

// Import institution components
import InstitutionFaculties from './pages/institution/Faculties';
import InstitutionCourses from './pages/institution/Courses';
import InstitutionApplications from './pages/institution/Applications';
import InstitutionProfile from './pages/institution/Profile';
import InstitutionApplicationDetails from './pages/institution/ApplicationDetails';

// Route protection components
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/role-selection/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user's actual role
    const { getDashboardPath } = useAuth();
    return <Navigate to={getDashboardPath()} />;
  }

  return children;
};

const StudentRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['student']}>{children}</ProtectedRoute>
);

const InstitutionRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['institution']}>{children}</ProtectedRoute>
);

const CompanyRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['company']}>{children}</ProtectedRoute>
);

const AdminRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>
);

// Wrapper component to pass courseId param to QualifiedCourseApplication
const ApplyCoursePage = () => {
  const { courseId } = useParams();
  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Apply for Course</h1>
          <p className="dashboard-subtitle">Complete your course application</p>
        </div>
        <QualifiedCourseApplication 
          courseId={courseId} 
          onApplicationSubmit={(result) => {
            // Redirect to applications page or show success message
            window.location.href = '/student/dashboard';
          }}
        />
      </div>
    </div>
  );
};

// Wrapper component for institution application details
const InstitutionApplicationReview = () => {
  const { applicationId } = useParams();
  return (
    <div className="dashboard-container">
      <div className="container">
        <InstitutionApplicationDetails applicationId={applicationId} />
      </div>
    </div>
  );
};

// Wrapper component for student application details
const StudentApplicationView = () => {
  const { applicationId } = useParams();
  return (
    <div className="dashboard-container">
      <div className="container">
        <StudentApplicationDetails applicationId={applicationId} />
      </div>
    </div>
  );
};

// Company Job Details Wrapper
const CompanyJobDetailsPage = () => {
  const { jobId } = useParams();
  return (
    <CompanyJobDetails jobId={jobId} />
  );
};

// Company Applications Wrapper
const CompanyApplicationsPage = () => {
  return (
    <CompanyApplications />
  );
};

// Job Application Details Page
const StudentJobApplicationDetails = () => {
  const { applicationId } = useParams();
  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Job Application Details</h1>
          <p className="dashboard-subtitle">View your job application status</p>
        </div>
        <div className="card">
          <div className="card-body">
            <p>Job application details for ID: {applicationId}</p>
            <p className="text-muted">This feature is coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Job Details Page
const JobDetailsPage = () => {
  const { jobId } = useParams();
  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Job Details</h1>
          <p className="dashboard-subtitle">View job information and apply</p>
        </div>
        <div className="card">
          <div className="card-body">
            <p>Job details for ID: {jobId}</p>
            <p className="text-muted">This feature is coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              
              {/* Role Selection Routes */}
              <Route path="/role-selection/login" element={<RoleSelection type="login" />} />
              <Route path="/role-selection/register" element={<RoleSelection type="register" />} />
              
              {/* Role-Specific Login Routes */}
              <Route path="/login/student" element={<StudentLogin />} />
              <Route path="/login/institution" element={<InstitutionLogin />} />
              <Route path="/login/company" element={<CompanyLogin />} />
              <Route path="/login/admin" element={<AdminLogin />} />
              
              {/* Role-Specific Registration Routes */}
              <Route path="/register/student" element={<StudentRegister />} />
              <Route path="/register/institution" element={<InstitutionRegister />} />
              <Route path="/register/company" element={<CompanyRegister />} />
              <Route path="/register/admin" element={<AdminRegister />} />

              {/* Legacy Auth Routes (Redirect to new system) */}
              <Route path="/login" element={<Navigate to="/role-selection/login" />} />
              <Route path="/register" element={<Navigate to="/role-selection/register" />} />

              {/* Student Routes */}
              <Route path="/student/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
              <Route path="/student/courses" element={<StudentRoute><StudentCourses /></StudentRoute>} />
              <Route path="/student/jobs" element={<StudentRoute><StudentJobs /></StudentRoute>} />
              <Route path="/student/profile" element={<StudentRoute><StudentProfile /></StudentRoute>} />
              <Route path="/student/documents" element={<StudentRoute><StudentDocuments /></StudentRoute>} />
              <Route path="/student/notifications" element={<StudentRoute><StudentNotifications /></StudentRoute>} />

              {/* Student Application Routes */}
              <Route path="/student/apply/:courseId" element={<StudentRoute><ApplyCoursePage /></StudentRoute>} />
              <Route path="/student/application/:applicationId" element={<StudentRoute><StudentApplicationView /></StudentRoute>} />
              <Route path="/student/job-application/:applicationId" element={<StudentRoute><StudentJobApplicationDetails /></StudentRoute>} />
              <Route path="/student/job/:jobId" element={<StudentRoute><JobDetailsPage /></StudentRoute>} />

              {/* Institution Routes */}
              <Route path="/institution/dashboard" element={<InstitutionRoute><InstitutionDashboard /></InstitutionRoute>} />
              <Route path="/institution/faculties" element={<InstitutionRoute><InstitutionFaculties /></InstitutionRoute>} />
              <Route path="/institution/courses" element={<InstitutionRoute><InstitutionCourses /></InstitutionRoute>} />
              <Route path="/institution/applications" element={<InstitutionRoute><InstitutionApplications /></InstitutionRoute>} />
              <Route path="/institution/profile" element={<InstitutionRoute><InstitutionProfile /></InstitutionRoute>} />
              <Route path="/institution/application/:applicationId" element={<InstitutionRoute><InstitutionApplicationReview /></InstitutionRoute>} />

              {/* Company Routes */}
              <Route path="/company/dashboard" element={<CompanyRoute><CompanyDashboard /></CompanyRoute>} />
              <Route path="/company/post-job" element={<CompanyRoute><PostJob /></CompanyRoute>} />
              <Route path="/company/job/:jobId" element={<CompanyRoute><CompanyJobDetailsPage /></CompanyRoute>} />
              <Route path="/company/applicant/:applicationId" element={<CompanyRoute><ApplicantReview /></CompanyRoute>} />
              <Route path="/company/applications" element={<CompanyRoute><CompanyApplicationsPage /></CompanyRoute>} />
              <Route path="/company/profile" element={<CompanyRoute><CompanyProfile /></CompanyRoute>} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/add-institution" element={<AdminRoute><AddInstitution /></AdminRoute>} />
              <Route path="/admin/institutions" element={<AdminRoute><ManageInstitutions /></AdminRoute>} />
              <Route path="/admin/institution/:institutionId" element={<AdminRoute><EditInstitution /></AdminRoute>} />
              <Route path="/admin/bulk-import" element={<AdminRoute><BulkImport /></AdminRoute>} />
              <Route path="/admin/institution/:institutionId/faculties" element={<AdminRoute><FacultyManagement /></AdminRoute>} />
              <Route path="/admin/institution/:institutionId/courses" element={<AdminRoute><CourseManagement /></AdminRoute>} />
              <Route path="/admin/companies" element={<AdminRoute><ManageCompanies /></AdminRoute>} />
              <Route path="/admin/company/:companyId" element={<AdminRoute><ManageCompany /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><SystemSettings /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><div className="dashboard-container"><div className="container"><p>User management page - Coming Soon</p></div></div></AdminRoute>} />
              <Route path="/admin/reports" element={<AdminRoute><div className="dashboard-container"><div className="container"><p>Reports and analytics page - Coming Soon</p></div></div></AdminRoute>} />

              {/* Auto-redirect to appropriate dashboard based on user role */}
              <Route path="/dashboard" element={<DashboardRedirect />} />

              {/* Redirects */}
              <Route path="/student" element={<Navigate to="/student/dashboard" />} />
              <Route path="/institution" element={<Navigate to="/institution/dashboard" />} />
              <Route path="/company" element={<Navigate to="/company/dashboard" />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Component to redirect users to their appropriate dashboard
const DashboardRedirect = () => {
  const { user, getDashboardPath } = useAuth();
  
  if (!user) {
    return <Navigate to="/role-selection/login" />;
  }
  
  return <Navigate to={getDashboardPath()} />;
};

export default App;