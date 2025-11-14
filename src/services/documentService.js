// src/services/documentService.js
import { db, storage } from '../config/firebase';
import { 
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

const DOCUMENTS_COLLECTION = 'documents';

// Get student documents
export const getStudentDocuments = async (studentId) => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('studentId', '==', studentId),
      orderBy('uploadedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching student documents:', error);
    throw error;
  }
};

// Get student documents by type
export const getStudentDocumentsByType = async (studentId, documentType) => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('studentId', '==', studentId),
      where('type', '==', documentType),
      orderBy('uploadedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching student documents by type:', error);
    throw error;
  }
};

// Upload document
export const uploadDocument = async (studentId, file, documentType) => {
  try {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only PDF, JPEG, and PNG files are allowed');
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size must be less than 10MB');
    }

    // Create storage reference
    const storageRef = ref(storage, `documents/${studentId}/${Date.now()}_${file.name}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Create document record
    const documentData = {
      studentId,
      name: file.name,
      type: documentType,
      url: downloadURL,
      size: file.size,
      mimeType: file.type,
      uploadedAt: serverTimestamp(),
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, DOCUMENTS_COLLECTION), documentData);
    
    console.log(`✅ Document uploaded with ID: ${docRef.id}`);
    return {
      id: docRef.id,
      ...documentData
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

// Upload multiple documents
export const uploadMultipleDocuments = async (studentId, files, documentType) => {
  try {
    const uploadPromises = files.map(file => uploadDocument(studentId, file, documentType));
    const results = await Promise.allSettled(uploadPromises);
    
    const successfulUploads = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
    
    const failedUploads = results
      .filter(result => result.status === 'rejected')
      .map(result => result.reason);
    
    return {
      successful: successfulUploads,
      failed: failedUploads
    };
  } catch (error) {
    console.error('Error uploading multiple documents:', error);
    throw error;
  }
};

// Delete document
export const deleteDocument = async (studentId, documentId) => {
  try {
    // Get document first to get the storage path
    const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Document not found');
    }

    const documentData = docSnap.data();
    
    // Verify ownership
    if (documentData.studentId !== studentId) {
      throw new Error('Unauthorized to delete this document');
    }

    // Delete from storage if URL exists
    if (documentData.url) {
      try {
        const storageRef = ref(storage, documentData.url);
        await deleteObject(storageRef);
      } catch (storageError) {
        console.error('Error deleting from storage:', storageError);
        // Continue with Firestore deletion even if storage deletion fails
      }
    }

    // Delete from Firestore
    await deleteDoc(docRef);
    
    console.log(`✅ Document ${documentId} deleted`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// Delete multiple documents
export const deleteMultipleDocuments = async (studentId, documentIds) => {
  try {
    const batch = writeBatch(db);
    
    // Verify ownership and add delete operations to batch
    for (const documentId of documentIds) {
      const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().studentId === studentId) {
        batch.delete(docRef);
      } else {
        throw new Error(`Unauthorized to delete document ${documentId}`);
      }
    }
    
    await batch.commit();
    
    console.log(`✅ ${documentIds.length} documents deleted`);
    return { success: true, deletedCount: documentIds.length };
  } catch (error) {
    console.error('Error deleting multiple documents:', error);
    throw error;
  }
};

// Update document status (for admin/institution use)
export const updateDocumentStatus = async (documentId, status, reviewedBy = null, notes = '') => {
  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
    const updateData = {
      status,
      reviewedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
    }
    
    if (notes) {
      updateData.reviewerNotes = notes;
    }
    
    await updateDoc(docRef, updateData);
    
    console.log(`✅ Document ${documentId} status updated to: ${status}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating document status:', error);
    throw error;
  }
};

// Get document by ID
export const getDocumentById = async (documentId) => {
  try {
    const docRef = doc(db, DOCUMENTS_COLLECTION, documentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Document not found');
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error('Error fetching document by ID:', error);
    throw error;
  }
};

// Get document statistics for student
export const getDocumentStats = async (studentId) => {
  try {
    const q = query(
      collection(db, DOCUMENTS_COLLECTION),
      where('studentId', '==', studentId)
    );
    
    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map(doc => doc.data());
    
    const stats = {
      total: documents.length,
      approved: documents.filter(doc => doc.status === 'approved').length,
      pending: documents.filter(doc => doc.status === 'pending').length,
      rejected: documents.filter(doc => doc.status === 'rejected').length,
      byType: {
        transcript: documents.filter(doc => doc.type === 'transcript').length,
        certificate: documents.filter(doc => doc.type === 'certificate').length,
        resume: documents.filter(doc => doc.type === 'resume').length,
        id_document: documents.filter(doc => doc.type === 'id_document').length,
        other: documents.filter(doc => doc.type === 'other').length
      }
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching document statistics:', error);
    throw error;
  }
};

// Check if student has required documents for course application
export const checkRequiredDocuments = async (studentId, courseRequirements = {}) => {
  try {
    const studentDocuments = await getStudentDocuments(studentId);
    const requiredDocuments = courseRequirements.documents || [];
    
    const missingDocuments = [];
    const hasDocuments = {};
    
    requiredDocuments.forEach(requiredDoc => {
      const hasDocument = studentDocuments.some(doc => 
        doc.type === requiredDoc.type && doc.status === 'approved'
      );
      
      hasDocuments[requiredDoc.type] = hasDocument;
      
      if (!hasDocument) {
        missingDocuments.push(requiredDoc.type);
      }
    });
    
    return {
      hasAllRequired: missingDocuments.length === 0,
      missingDocuments,
      hasDocuments,
      totalRequired: requiredDocuments.length,
      metRequirements: requiredDocuments.length - missingDocuments.length
    };
  } catch (error) {
    console.error('Error checking required documents:', error);
    throw error;
  }
};