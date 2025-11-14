// src/context/AuthContext.jsx - COMPLETE UPDATED VERSION
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true);

  // Backend base URL
  const BACKEND_URL = 'https://career-guidance-application-backend.onrender.com';

  // Enhanced backend connection test
  const testBackendConnection = async () => {
    try {
      console.log('🔍 Testing backend connection...');
      const response = await axios.get(`${BACKEND_URL}/api/health`, { 
        timeout: 8000,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('✅ Backend connection successful:', response.data);
      setBackendAvailable(true);
      return true;
    } catch (error) {
      console.error('❌ Backend connection failed:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: `${BACKEND_URL}/api/health`
      });
      
      setBackendAvailable(false);
      return false;
    }
  };

  // Get institutions for registration dropdown
  const getInstitutionsForRegistration = async () => {
    try {
      console.log('📋 Fetching institutions for registration...');
      
      const q = query(
        collection(db, 'institutions'),
        where('status', '==', 'active')
      );
      const querySnapshot = await getDocs(q);
      const institutions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('✅ Institutions from Firestore:', institutions.length);
      return institutions;
    } catch (error) {
      console.error('❌ Error fetching institutions:', error);
      throw new Error('Failed to load institutions');
    }
  };

  // Enhanced helper function to get auth headers with error handling
  const getAuthHeaders = async () => {
    try {
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        return {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
      }
      throw new Error('No authenticated user');
    } catch (error) {
      console.error('❌ Error getting auth token:', error);
      throw new Error('Authentication failed. Please log in again.');
    }
  };

  // Helper to make authenticated API calls with CORS handling
  const authApiCall = async (method, url, data = null) => {
    const headers = await getAuthHeaders();
    const config = {
      method,
      url: `${BACKEND_URL}${url}`,
      headers,
      timeout: 15000,
      withCredentials: true,
      ...(data && { data })
    };
    
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`❌ API ${method} ${url} failed:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Handle CORS errors specifically
      if (error.message.includes('Network Error') || error.message.includes('CORS')) {
        throw new Error('Cannot connect to server. Please check your connection.');
      }
      
      throw error;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // Test backend connection on startup
      await testBackendConnection();
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser ? firebaseUser.email : 'null');
      
      // Skip auth state processing during registration
      if (isRegistering) {
        console.log('⏸️ Skipping auth state change during registration');
        return;
      }
      
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          console.log('🔑 ID Token obtained for:', firebaseUser.email);
          
          // Check if backend is available
          if (!backendAvailable) {
            console.warn('⚠️ Backend unavailable, using Firebase-only mode');
            // Create basic user from Firebase data
            const basicUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              role: 'user', // Default role
              profile: {
                firstName: 'User',
                lastName: ''
              },
              isFirebaseOnly: true
            };
            setUser(basicUser);
            setError('Backend service temporarily unavailable. Some features may be limited.');
            setLoading(false);
            return;
          }
          
          // Try to login with backend
          console.log('🔄 Attempting backend login...');
          const response = await axios.post(
            `${BACKEND_URL}/api/auth/login`, 
            { idToken }, 
            {
              timeout: 10000,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log('✅ Backend login successful:', response.data.user.role);
          setUser(response.data.user);
          setError('');
        } catch (error) {
          console.error('❌ Auth state error:', {
            message: error.response?.data?.error || error.message,
            status: error.response?.status,
            data: error.response?.data
          });
          
          // Handle specific error cases
          if (error.response?.status === 404) {
            // User profile doesn't exist in backend yet
            console.log('📝 User profile not found, needs registration completion');
            setError('Account created but profile not found. Please complete registration or contact support.');
            setUser(null);
            
            // Auto-sign out user if they don't have a backend profile
            console.log('👋 Auto-signing out user without backend profile...');
            await signOut(auth);
          } else if (error.response?.data?.needsVerification) {
            setError('Please verify your email before logging in.');
            setUser(null);
          } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
            console.warn('🌐 Backend connection failed, using Firebase-only mode');
            const basicUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              role: 'user',
              profile: {
                firstName: 'User',
                lastName: ''
              },
              isFirebaseOnly: true
            };
            setUser(basicUser);
            setError('Backend service temporarily unavailable. Some features may be limited.');
          } else {
            setError('Authentication failed. Please try logging in again.');
            setUser(null);
          }
        }
      } else {
        setUser(null);
        setError('');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isRegistering, backendAvailable]);

  // Enhanced login function with better error handling
  const login = async (email, password, expectedRole = null) => {
    try {
      setError('');
      setAuthLoading(true);
      console.log('🔐 Attempting login for:', email, expectedRole ? `(Expected role: ${expectedRole})` : '');
      
      // 1. Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Firebase login successful:', userCredential.user.email);
      
      // 2. Get the ID token
      const idToken = await userCredential.user.getIdToken(true);
      console.log('🔑 ID Token obtained');
      
      // 3. Check backend health first
      if (!backendAvailable) {
        console.warn('⚠️ Backend unavailable, proceeding with Firebase-only authentication');
        const basicUser = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          emailVerified: userCredential.user.emailVerified,
          role: expectedRole || 'user',
          profile: {
            firstName: 'User',
            lastName: ''
          },
          isFirebaseOnly: true
        };
        setUser(basicUser);
        return { user: basicUser, isFirebaseOnly: true };
      }
      
      // 4. Login with backend
      console.log('🔄 Sending login request to backend...');
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/login`, 
        { idToken }, 
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Backend login response received');
      const userData = response.data.user;
      console.log('✅ Backend login successful, user role:', userData.role);
      
      // Validate role if expectedRole is provided
      if (expectedRole && userData.role !== expectedRole) {
        await signOut(auth);
        throw new Error(`Please use the ${userData.role} login page to access your account.`);
      }
      
      // Check email verification
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
      }
      
      setUser(userData);
      return { user: userData, isFirebaseOnly: false };
    } catch (error) {
      console.error('❌ Login error details:', {
        code: error.code,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle Firebase errors
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          // Use backend or custom error message
          if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  // Role-specific login methods
  const loginAsStudent = async (email, password) => {
    return await login(email, password, 'student');
  };

  const loginAsInstitution = async (email, password) => {
    return await login(email, password, 'institution');
  };

  const loginAsCompany = async (email, password) => {
    return await login(email, password, 'company');
  };

  const loginAsAdmin = async (email, password) => {
    return await login(email, password, 'admin');
  };

  const register = async (email, password, role, profile) => {
    try {
      setError('');
      setAuthLoading(true);
      setIsRegistering(true);
      
      console.log('🚀 Starting registration...', {
        email,
        role,
        profile: {
          ...profile,
          password: '[HIDDEN]',
          adminCode: role === 'admin' ? '***' : 'N/A',
          institutionId: role === 'institution' ? profile.institutionId : 'N/A'
        }
      });

      // 1. Sign out any current user
      if (auth.currentUser) {
        console.log('👋 Signing out current user...');
        await signOut(auth);
      }

      // 2. Create Firebase Auth user
      console.log('🔥 Creating Firebase Auth user...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Firebase Auth user created:', user.uid);

      // 3. Send verification email
      console.log('📧 Sending verification email...');
      await sendEmailVerification(user);
      console.log('✅ Verification email sent');

      // 4. Handle institution-specific setup
      if (role === 'institution' && profile.institutionId) {
        console.log('🏫 Setting up institution admin for:', profile.institutionId);
        
        // Verify the institution exists and get its name
        const institutionDoc = await getDoc(doc(db, 'institutions', profile.institutionId));
        if (!institutionDoc.exists()) {
          throw new Error('Selected institution not found');
        }
        
        const institutionData = institutionDoc.data();
        
        // Add admin to institution
        await updateDoc(doc(db, 'institutions', profile.institutionId), {
          adminId: user.uid,
          adminEmail: email,
          updatedAt: serverTimestamp()
        });
        
        console.log('✅ Institution admin setup completed');
        
        // Add institution name to profile
        profile.institutionName = institutionData.name;
      }

      // 5. Prepare profile data for backend
      const profileData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone || '',
        ...(role === 'admin' && { adminCode: profile.adminCode }),
        ...(role === 'institution' && { 
          institutionId: profile.institutionId,
          institutionName: profile.institutionName
        }),
        ...(role === 'student' && {
          studentId: profile.studentId || '',
          major: profile.major || ''
        }),
        ...(role === 'company' && {
          companyName: profile.companyName || '',
          position: profile.position || ''
        })
      };

      console.log('📝 Creating user profile in backend...', profileData);

      // 6. Check backend connection before creating profile
      if (!backendAvailable) {
        throw new Error('Backend service unavailable. Please try again later.');
      }

      // 7. Create user profile in backend
      console.log('🔄 Sending profile creation request to backend...');
      const response = await axios.post(
        `${BACKEND_URL}/api/auth/create-profile`, 
        {
          uid: user.uid,
          email: user.email,
          role,
          profile: profileData
        }, 
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        }
      );

      console.log('✅ Backend profile created:', response.data);

      // 8. Sign out user to await verification
      console.log('👋 Signing out user...');
      await signOut(auth);
      
      return {
        ...response.data,
        uid: user.uid,
        email: user.email,
        emailSent: true,
        message: 'Registration successful! Please verify your email before logging in.'
      };
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email already exists. Please use a different email or login.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters long.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        default:
          // Use backend error message if available
          errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
      setIsRegistering(false);
    }
  };

  const resendVerification = async (email) => {
    try {
      setError('');
      setAuthLoading(true);
      
      console.log('📧 Resending verification email to:', email);
      
      const response = await axios.post(`${BACKEND_URL}/api/auth/resend-verification`, { 
        email 
      });
      
      console.log('✅ Resend verification response:', response.data);
      
      if (response.data.verificationLink) {
        console.log('🔗 New Verification Link (Development):', response.data.verificationLink);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Resend verification error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to resend verification email.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      setError('');
      setAuthLoading(true);
      
      console.log('🔐 Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
      
      console.log('✅ Password reset email sent');
      return { message: 'Password reset email sent successfully!' };
    } catch (error) {
      console.error('❌ Password reset error:', error);
      
      let errorMessage = 'Failed to send password reset email.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError('');
      console.log('👋 Logging out user...');
      await signOut(auth);
      setUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setError(error.message);
      throw error;
    }
  };

  const clearError = () => {
    setError('');
  };

  // Helper to get dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'student': return '/student/dashboard';
      case 'institution': return '/institution/dashboard';
      case 'company': return '/company/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  const value = {
    // State
    user,
    loading,
    error,
    authLoading,
    backendAvailable,
    
    // Actions
    login, // Generic login
    loginAsStudent,
    loginAsInstitution,
    loginAsCompany,
    loginAsAdmin,
    register,
    logout,
    resendVerification,
    resetPassword,
    clearError,
    setError,
    
    // Helpers
    getAuthHeaders,
    authApiCall,
    getInstitutionsForRegistration,
    getDashboardPath,
    testBackendConnection,
    setBackendAvailable
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
