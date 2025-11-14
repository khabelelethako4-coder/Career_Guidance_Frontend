import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  query, 
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

// Get all companies
export const getAllCompanies = async () => {
  try {
    const companiesRef = collection(db, 'users');
    const companyQuery = query(
      companiesRef, 
      where('role', '==', 'company'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(companyQuery);
    
    const companies = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return companies;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw new Error('Failed to fetch companies');
  }
};

// Get company by ID
export const getCompany = async (companyId) => {
  try {
    const companyDoc = await getDoc(doc(db, 'users', companyId));
    
    if (!companyDoc.exists()) {
      throw new Error('Company not found');
    }
    
    return {
      id: companyDoc.id,
      ...companyDoc.data()
    };
  } catch (error) {
    console.error('Error fetching company:', error);
    throw new Error('Failed to fetch company');
  }
};

// Update company
export const updateCompany = async (companyId, updateData) => {
  try {
    const companyRef = doc(db, 'users', companyId);
    
    // Verify company exists
    const companyDoc = await getDoc(companyRef);
    if (!companyDoc.exists()) {
      throw new Error('Company not found');
    }
    
    // Prepare update data
    const updateFields = {
      ...updateData,
      updatedAt: new Date()
    };
    
    await updateDoc(companyRef, updateFields);
    
    return {
      id: companyId,
      ...updateFields
    };
  } catch (error) {
    console.error('Error updating company:', error);
    throw new Error('Failed to update company');
  }
};

// Update company profile in users collection
export const updateCompanyProfile = async (userId, updateData) => {
  try {
    console.log('Updating company profile for user:', userId);
    console.log('Update data:', updateData);
    
    // Find the company document in users collection
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef, 
      where('uid', '==', userId),
      where('role', '==', 'company')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error('No company profile found for user:', userId);
      throw new Error('Company profile not found. Please contact support.');
    }

    // Get the company document reference
    const companyDoc = querySnapshot.docs[0];
    const companyRef = doc(db, 'users', companyDoc.id);
    
    // Prepare the update data
    const updateFields = {
      ...updateData,
      updatedAt: serverTimestamp()
    };
    
    console.log('Updating document:', companyDoc.id, 'with data:', updateFields);
    
    // Update the document
    await updateDoc(companyRef, updateFields);

    console.log('Company profile updated successfully for user:', userId);
    return { 
      success: true, 
      id: companyDoc.id,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    console.error('Error updating company profile:', error);
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check your authentication.');
    } else if (error.code === 'not-found') {
      throw new Error('Company profile not found in database.');
    } else {
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }
};

// Delete company
export const deleteCompany = async (companyId) => {
  try {
    const companyRef = doc(db, 'users', companyId);
    
    // Verify company exists
    const companyDoc = await getDoc(companyRef);
    if (!companyDoc.exists()) {
      throw new Error('Company not found');
    }
    
    await deleteDoc(companyRef);
    
    return { success: true, message: 'Company deleted successfully' };
  } catch (error) {
    console.error('Error deleting company:', error);
    throw new Error('Failed to delete company');
  }
};

// Get companies by status
export const getCompaniesByStatus = async (status) => {
  try {
    const companiesRef = collection(db, 'users');
    const companyQuery = query(
      companiesRef, 
      where('role', '==', 'company'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(companyQuery);
    
    const companies = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return companies;
  } catch (error) {
    console.error('Error fetching companies by status:', error);
    throw new Error('Failed to fetch companies');
  }
};

// Get company statistics
export const getCompanyStats = async () => {
  try {
    const companies = await getAllCompanies();
    
    const stats = {
      total: companies.length,
      approved: companies.filter(c => c.status === 'approved').length,
      pending: companies.filter(c => c.status === 'pending').length,
      rejected: companies.filter(c => c.status === 'rejected').length,
      suspended: companies.filter(c => c.status === 'suspended').length
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching company stats:', error);
    throw new Error('Failed to fetch company statistics');
  }
};

// Search companies
export const searchCompanies = async (searchTerm) => {
  try {
    const companies = await getAllCompanies();
    
    const filteredCompanies = companies.filter(company => 
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filteredCompanies;
  } catch (error) {
    console.error('Error searching companies:', error);
    throw new Error('Failed to search companies');
  }
};

// Bulk update company status
export const bulkUpdateCompanyStatus = async (companyIds, newStatus) => {
  try {
    const updatePromises = companyIds.map(companyId => 
      updateCompany(companyId, { status: newStatus })
    );
    
    const results = await Promise.allSettled(updatePromises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    return {
      successful,
      failed,
      total: companyIds.length
    };
  } catch (error) {
    console.error('Error in bulk update:', error);
    throw new Error('Failed to bulk update companies');
  }
};

// Get all approved companies (for student job listings)
export const getAllApprovedCompanies = async () => {
  try {
    const companiesRef = collection(db, 'users');
    const companyQuery = query(
      companiesRef, 
      where('role', '==', 'company'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(companyQuery);
    
    const companies = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return companies;
  } catch (error) {
    console.error('Error fetching approved companies:', error);
    throw new Error('Failed to fetch approved companies');
  }
};

// Get company by user ID
export const getCompanyByUserId = async (userId) => {
  try {
    const usersRef = collection(db, 'users');
    const companyQuery = query(
      usersRef, 
      where('uid', '==', userId),
      where('role', '==', 'company')
    );
    const querySnapshot = await getDocs(companyQuery);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const companyDoc = querySnapshot.docs[0];
    return {
      id: companyDoc.id,
      ...companyDoc.data()
    };
  } catch (error) {
    console.error('Error fetching company by user ID:', error);
    throw new Error('Failed to fetch company data');
  }
};

// Get company by ID
export const getCompanyById = async (companyId) => {
  try {
    const companyDoc = await getDoc(doc(db, 'users', companyId));
    
    if (!companyDoc.exists()) {
      throw new Error('Company not found');
    }
    
    return {
      id: companyDoc.id,
      ...companyDoc.data()
    };
  } catch (error) {
    console.error('Error fetching company:', error);
    throw new Error('Failed to fetch company');
  }
};

// Get company by user ID from companies collection (legacy - kept for compatibility)
export const getCompanyByUserIdFromCompanies = async (userId) => {
  try {
    const companiesRef = collection(db, 'companies');
    const q = query(companiesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const companyDoc = querySnapshot.docs[0];
    return {
      id: companyDoc.id,
      ...companyDoc.data()
    };
  } catch (error) {
    console.error('Error fetching company:', error);
    throw error;
  }
};

// Get student profile for applicant review
export const getStudentProfile = async (studentId) => {
  try {
    const studentDoc = await getDoc(doc(db, 'users', studentId));
    if (!studentDoc.exists()) {
      throw new Error('Student not found');
    }
    
    return {
      id: studentDoc.id,
      ...studentDoc.data()
    };
  } catch (error) {
    console.error('Error fetching student profile:', error);
    throw error;
  }
};

// Create company profile (for initial setup)
export const createCompanyProfile = async (userId, profileData) => {
  try {
    const newCompanyRef = doc(collection(db, 'users'));
    await setDoc(newCompanyRef, {
      uid: userId,
      role: 'company',
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'approved',
      isVerified: true
    });
    
    return { 
      success: true, 
      id: newCompanyRef.id,
      message: 'Company profile created successfully'
    };
  } catch (error) {
    console.error('Error creating company profile:', error);
    throw new Error('Failed to create company profile');
  }
};

export default {
  getAllCompanies,
  getCompany,
  updateCompany,
  deleteCompany,
  getCompaniesByStatus,
  getCompanyStats,
  searchCompanies,
  bulkUpdateCompanyStatus,
  getAllApprovedCompanies,
  getCompanyByUserId,
  getCompanyById,
  getCompanyByUserIdFromCompanies,
  updateCompanyProfile,
  getStudentProfile,
  createCompanyProfile
};