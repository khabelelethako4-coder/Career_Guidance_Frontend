import { db } from '../config/firebase';
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  updateDoc,
  doc
} from 'firebase/firestore';

const USERS_COLLECTION = 'users';
const COMPANIES_COLLECTION = 'companies';
const APPLICATIONS_COLLECTION = 'applications';

// Admin Services for Reports and Analytics
export const getRegistrationStats = async () => {
  try {
    const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users = usersSnapshot.docs.map(doc => doc.data());
    
    const stats = {
      totalUsers: users.length,
      students: users.filter(u => u.role === 'student').length,
      institutions: users.filter(u => u.role === 'institution').length,
      companies: users.filter(u => u.role === 'company').length
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching registration stats:', error);
    throw error;
  }
};

export const getApplicationStats = async () => {
  try {
    const applicationsSnapshot = await getDocs(collection(db, APPLICATIONS_COLLECTION));
    const applications = applicationsSnapshot.docs.map(doc => doc.data());
    
    const stats = {
      totalApplications: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      admitted: applications.filter(a => a.status === 'admitted').length,
      rejected: applications.filter(a => a.status === 'rejected').length
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching application stats:', error);
    throw error;
  }
};

export const getPendingCompanyRegistrations = async () => {
  try {
    const q = query(
      collection(db, COMPANIES_COLLECTION),
      where('status', '==', 'pending')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching pending company registrations:', error);
    throw error;
  }
};

export const approveCompanyRegistration = async (companyId) => {
  try {
    const docRef = doc(db, COMPANIES_COLLECTION, companyId);
    await updateDoc(docRef, {
      status: 'approved',
      approvedAt: new Date()
    });
  } catch (error) {
    console.error('Error approving company:', error);
    throw error;
  }
};

export const rejectCompanyRegistration = async (companyId, reason) => {
  try {
    const docRef = doc(db, COMPANIES_COLLECTION, companyId);
    await updateDoc(docRef, {
      status: 'rejected',
      rejectionReason: reason,
      rejectedAt: new Date()
    });
  } catch (error) {
    console.error('Error rejecting company:', error);
    throw error;
  }
};

export const suspendCompanyAccount = async (companyId, reason) => {
  try {
    const docRef = doc(db, COMPANIES_COLLECTION, companyId);
    await updateDoc(docRef, {
      status: 'suspended',
      suspensionReason: reason,
      suspendedAt: new Date()
    });
  } catch (error) {
    console.error('Error suspending company:', error);
    throw error;
  }
};

export const getApplicationsByStudent = async (studentId) => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('studentId', '==', studentId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching student applications:', error);
    throw error;
  }
};

export const handleMultipleAdmissions = async (studentId, selectedInstitutionId) => {
  try {
    // Get all applications for the student
    const applications = await getApplicationsByStudent(studentId);
    
    // Reject applications from other institutions
    for (const app of applications) {
      if (app.institutionId !== selectedInstitutionId && app.status === 'admitted') {
        await updateDoc(doc(db, APPLICATIONS_COLLECTION, app.id), {
          status: 'rejected',
          reason: 'Student selected another institution'
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error handling multiple admissions:', error);
    throw error;
  }
};
