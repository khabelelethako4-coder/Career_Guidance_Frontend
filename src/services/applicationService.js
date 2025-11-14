// src/services/applicationService.js
import { db, storage } from '../config/firebase';
import { 
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, writeBatch,
  arrayRemove, arrayUnion
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Import the updated course service functions
import { getCourseById, getCoursesByInstitution } from './institutionService';

const APPLICATIONS_COLLECTION = 'applications';
const INSTITUTIONS_COLLECTION = 'institutions';
const USERS_COLLECTION = 'users';

// Create application function
export const createApplication = async (applicationData) => {
  try {
    // Check if student already applied to this course
    const existingApplications = await getStudentApplicationsByCourse(
      applicationData.studentId, 
      applicationData.courseId
    );
    
    if (existingApplications.length > 0) {
      throw new Error('You have already applied to this course');
    }

    // Check if student has reached application limit for this institution (max 2)
    const institutionApplications = await getStudentApplicationsByInstitution(
      applicationData.studentId, 
      applicationData.institutionId
    );
    
    if (institutionApplications.length >= 2) {
      throw new Error('You can only apply to maximum 2 courses per institution');
    }

    const docRef = await addDoc(collection(db, APPLICATIONS_COLLECTION), {
      ...applicationData,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Application created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
};

// Check student qualifications for a course - UPDATED
export const checkStudentQualifications = async (studentId, courseId) => {
  try {
    console.log('Checking qualifications for course:', courseId);
    
    // Use the updated course service that works with your Firestore structure
    const course = await getCourseById(courseId);
    
    if (!course) {
      throw new Error('Course not found');
    }

    console.log('Found course:', course.name);

    const [studentDoc, existingApplications] = await Promise.all([
      getDoc(doc(db, USERS_COLLECTION, studentId)),
      getDocs(query(
        collection(db, APPLICATIONS_COLLECTION),
        where('studentId', '==', studentId),
        where('status', 'in', ['pending', 'admitted'])
      ))
    ]);

    if (!studentDoc.exists()) throw new Error('Student not found');

    const student = studentDoc.data();

    // Check academic qualifications
    const qualificationCheck = checkAcademicQualifications(student, course);
    
    // Check application limit for this institution (max 2)
    const institutionApplications = existingApplications.docs
      .filter(doc => doc.data().institutionId === course.institutionId)
      .map(doc => ({ id: doc.id, ...doc.data() }));

    const canApplyToInstitution = institutionApplications.length < 2;

    // Check course availability - simplified since we don't have admittedStudents in your structure
    const courseAvailable = course.status === 'active';

    // Check if already applied to this course
    const alreadyApplied = existingApplications.docs.some(
      doc => doc.data().courseId === courseId && doc.data().status !== 'rejected'
    );

    return {
      qualified: qualificationCheck.qualified && !alreadyApplied,
      canApplyToInstitution,
      courseAvailable,
      alreadyApplied,
      missingRequirements: qualificationCheck.missingRequirements,
      currentApplications: institutionApplications.length,
      institutionId: course.institutionId,
      course: course // Return course data for the UI
    };
  } catch (error) {
    console.error('Error checking qualifications:', error);
    throw error;
  }
};

// Apply for course with full validation - UPDATED
export const applyForCourse = async (studentId, courseId) => {
  try {
    // First check qualifications
    const qualificationCheck = await checkStudentQualifications(studentId, courseId);
    
    if (!qualificationCheck.qualified) {
      throw new Error('You do not meet the academic requirements for this course');
    }

    if (!qualificationCheck.canApplyToInstitution) {
      throw new Error('You have reached the maximum applications (2) for this institution');
    }

    if (!qualificationCheck.courseAvailable) {
      throw new Error('This course is no longer accepting applications');
    }

    if (qualificationCheck.alreadyApplied) {
      throw new Error('You have already applied to this course');
    }

    // Use the course data from qualification check
    const course = qualificationCheck.course;

    // Create application
    const applicationData = {
      studentId,
      courseId,
      courseName: course.name,
      courseCode: course.code,
      institutionId: course.institutionId,
      institutionName: course.institutionName,
      facultyName: course.facultyName,
      status: 'pending',
      appliedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const applicationRef = await addDoc(collection(db, APPLICATIONS_COLLECTION), applicationData);
    
    // Create notification for student
    await createNotification(studentId, {
      type: 'application_submitted',
      title: 'Application Submitted',
      message: `Your application for ${course.name} has been submitted successfully.`,
      applicationId: applicationRef.id,
      read: false,
      createdAt: serverTimestamp()
    });

    console.log('✅ Application created with ID:', applicationRef.id);
    return {
      id: applicationRef.id,
      ...applicationData
    };
  } catch (error) {
    console.error('Error applying for course:', error);
    throw error;
  }
};

// Get student's admissions for selection
export const getStudentAdmissions = async (studentId) => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('studentId', '==', studentId),
      where('status', '==', 'admitted'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const admissions = await Promise.all(
      querySnapshot.docs.map(async (docSnap) => {
        const admission = { id: docSnap.id, ...docSnap.data() };
        
        try {
          // If course details are not already in the admission, fetch them
          if (admission.courseId && !admission.courseName) {
            const course = await getCourseById(admission.courseId);
            if (course) {
              admission.courseName = course.name;
              admission.courseCode = course.code;
              admission.courseDuration = course.duration;
              admission.courseFees = course.fees;
              admission.facultyName = course.facultyName;
              admission.institutionName = course.institutionName;
            }
          }
          
          // Get institution location if not already available
          if (admission.institutionId && !admission.institutionLocation) {
            const institutionDoc = await getDoc(doc(db, INSTITUTIONS_COLLECTION, admission.institutionId));
            if (institutionDoc.exists()) {
              const institutionData = institutionDoc.data();
              admission.institutionLocation = institutionData.location;
            }
          }
        } catch (error) {
          console.error('Error enriching admission data:', error);
        }
        
        return admission;
      })
    );
    
    return admissions;
  } catch (error) {
    console.error('Error fetching student admissions:', error);
    throw error;
  }
};

// Student selects admission (automatically declines others) - UPDATED
export const selectAdmission = async (studentId, selectedApplicationId) => {
  const batch = writeBatch(db);

  try {
    // Get all admitted applications for this student
    const admittedApplicationsQuery = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('studentId', '==', studentId),
      where('status', '==', 'admitted')
    );
    
    const admittedApplicationsSnapshot = await getDocs(admittedApplicationsQuery);
    const selectedApplicationDoc = await getDoc(doc(db, APPLICATIONS_COLLECTION, selectedApplicationId));
    
    if (!selectedApplicationDoc.exists()) {
      throw new Error('Selected application not found');
    }

    const selectedApplication = selectedApplicationDoc.data();
    if (selectedApplication.studentId !== studentId) {
      throw new Error('Unauthorized action');
    }

    if (selectedApplication.status !== 'admitted') {
      throw new Error('You can only select admitted applications');
    }

    // Update selected application to 'accepted'
    batch.update(selectedApplicationDoc.ref, {
      status: 'accepted',
      studentSelected: true,
      selectedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Note: We're not updating course admittedStudents since that field doesn't exist in your structure
    // If you need this functionality, you'll need to add admittedStudents to your course objects

    // Decline all other admitted applications
    admittedApplicationsSnapshot.docs.forEach(doc => {
      if (doc.id !== selectedApplicationId) {
        batch.update(doc.ref, {
          status: 'rejected',
          rejectionReason: 'Student selected another institution',
          updatedAt: serverTimestamp()
        });
      }
    });

    await batch.commit();

    // Create notification
    await createNotification(studentId, {
      type: 'admission_selected',
      title: 'Admission Selected',
      message: `You have successfully selected your admission for ${selectedApplication.courseName}. Other offers have been automatically declined.`,
      applicationId: selectedApplicationId,
      read: false,
      createdAt: serverTimestamp()
    });

    console.log('✅ Admission selection completed');
    return { success: true };
  } catch (error) {
    console.error('Error selecting admission:', error);
    throw error;
  }
};

// Get student's course applications with enriched data - UPDATED
export const getStudentCourseApplications = async (studentId) => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const applications = await Promise.all(
      querySnapshot.docs.map(async (docSnap) => {
        const application = { id: docSnap.id, ...docSnap.data() };
        
        try {
          // If course details are already stored in the application, use them
          // Otherwise, fetch course details using the updated service
          if (application.courseId && !application.courseName) {
            const course = await getCourseById(application.courseId);
            if (course) {
              application.courseName = course.name;
              application.courseCode = course.code;
              application.courseDescription = course.description;
              application.courseDuration = course.duration;
              application.courseFees = course.fees;
              application.courseRequirements = course.requirements;
              application.facultyName = course.facultyName;
              application.institutionName = course.institutionName;
            }
          }
        } catch (error) {
          console.error('Error enriching application data:', error);
        }
        
        return application;
      })
    );
    
    return applications;
  } catch (error) {
    console.error('Error fetching student course applications:', error);
    throw new Error('Failed to fetch course applications');
  }
};

// Get application by ID with full details - UPDATED
export const getApplicationById = async (applicationId) => {
  try {
    const docRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Application not found');
    }
    
    const application = { id: docSnap.id, ...docSnap.data() };
    
    // Enrich with additional data
    try {
      // Get student details
      if (application.studentId) {
        const studentDoc = await getDoc(doc(db, USERS_COLLECTION, application.studentId));
        if (studentDoc.exists()) {
          const studentData = studentDoc.data();
          application.studentName = `${studentData.profile?.firstName || ''} ${studentData.profile?.lastName || ''}`.trim();
          application.studentEmail = studentData.email;
          application.studentPhone = studentData.profile?.phone;
        }
      }
      
      // Get course details using updated service if not already in application
      if (application.courseId && !application.courseName) {
        const course = await getCourseById(application.courseId);
        if (course) {
          application.courseName = course.name;
          application.courseCode = course.code;
          application.courseDescription = course.description;
          application.courseDuration = course.duration;
          application.courseFees = course.fees;
          application.courseRequirements = course.requirements;
          application.facultyName = course.facultyName;
          application.institutionName = course.institutionName;
        }
      }
    } catch (error) {
      console.error('Error enriching application details:', error);
    }
    
    return application;
  } catch (error) {
    console.error('Error fetching application by ID:', error);
    throw error;
  }
};

// Get student applications
export const getStudentApplications = async (studentId) => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    // Use the updated function that handles course enrichment properly
    return await getStudentCourseApplications(studentId);
  } catch (error) {
    console.error('Error fetching student applications:', error);
    throw error;
  }
};

// Get applications by institution
export const getApplicationsByInstitution = async (institutionId) => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('institutionId', '==', institutionId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    // Enrich applications with student data
    const applications = await Promise.all(
      querySnapshot.docs.map(async (docSnap) => {
        const application = { id: docSnap.id, ...docSnap.data() };
        
        try {
          // Get student details
          if (application.studentId) {
            const studentDoc = await getDoc(doc(db, 'users', application.studentId));
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              application.studentName = `${studentData.profile?.firstName || ''} ${studentData.profile?.lastName || ''}`.trim();
              application.studentEmail = studentData.email;
            }
          }
          
          // Course details should already be in the application from when it was created
        } catch (error) {
          console.error('Error enriching application data:', error);
        }
        
        return application;
      })
    );
    
    return applications;
  } catch (error) {
    console.error('Error fetching institution applications:', error);
    throw error;
  }
};

// Get applications by course
export const getApplicationsByCourse = async (courseId) => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('courseId', '==', courseId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    // Enrich applications with student data
    const applications = await Promise.all(
      querySnapshot.docs.map(async (docSnap) => {
        const application = { id: docSnap.id, ...docSnap.data() };
        
        try {
          // Get student details
          if (application.studentId) {
            const studentDoc = await getDoc(doc(db, 'users', application.studentId));
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              application.studentName = `${studentData.profile?.firstName || ''} ${studentData.profile?.lastName || ''}`.trim();
              application.studentEmail = studentData.email;
            }
          }
        } catch (error) {
          console.error('Error enriching application data:', error);
        }
        
        return application;
      })
    );
    
    return applications;
  } catch (error) {
    console.error('Error fetching course applications:', error);
    throw error;
  }
};

// Get student applications by institution
export const getStudentApplicationsByInstitution = async (studentId, institutionId) => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('studentId', '==', studentId),
      where('institutionId', '==', institutionId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching student applications by institution:', error);
    throw error;
  }
};

// Get student applications by course
export const getStudentApplicationsByCourse = async (studentId, courseId) => {
  try {
    const q = query(
      collection(db, APPLICATIONS_COLLECTION),
      where('studentId', '==', studentId),
      where('courseId', '==', courseId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching student applications by course:', error);
    throw error;
  }
};

// Delete application
export const deleteApplication = async (applicationId) => {
  try {
    const docRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    await deleteDoc(docRef);
    console.log(`✅ Application ${applicationId} deleted`);
  } catch (error) {
    console.error('Error deleting application:', error);
    throw error;
  }
};

// Get application statistics
export const getApplicationStats = async (institutionId = null) => {
  try {
    let applicationsQuery;
    
    if (institutionId) {
      applicationsQuery = query(
        collection(db, APPLICATIONS_COLLECTION),
        where('institutionId', '==', institutionId)
      );
    } else {
      applicationsQuery = query(collection(db, APPLICATIONS_COLLECTION));
    }
    
    const querySnapshot = await getDocs(applicationsQuery);
    const applications = querySnapshot.docs.map(doc => doc.data());
    
    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      admitted: applications.filter(app => app.status === 'admitted').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching application statistics:', error);
    throw error;
  }
};

// Update application status
export const updateApplicationStatus = async (applicationId, status, reviewedBy = null, notes = '') => {
  try {
    const docRef = doc(db, APPLICATIONS_COLLECTION, applicationId);
    const updateData = {
      status,
      updatedAt: serverTimestamp(),
      reviewedAt: serverTimestamp()
    };
    
    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
    }
    
    if (notes) {
      updateData.reviewerNotes = notes;
    }
    
    await updateDoc(docRef, updateData);

    // Get application to create notification
    const application = await getApplicationById(applicationId);
    
    // Create notification for student
    let notificationMessage = '';
    switch (status) {
      case 'admitted':
        notificationMessage = `Congratulations! You have been admitted to ${application.courseName} at ${application.institutionName}.`;
        break;
      case 'rejected':
        notificationMessage = `Your application for ${application.courseName} at ${application.institutionName} was not successful.`;
        break;
      default:
        notificationMessage = `Your application for ${application.courseName} has been updated to ${status}.`;
    }

    await createNotification(application.studentId, {
      type: 'application_update',
      title: 'Application Status Update',
      message: notificationMessage,
      applicationId: applicationId,
      read: false,
      createdAt: serverTimestamp()
    });

    console.log(`✅ Application ${applicationId} status updated to: ${status}`);
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};

// Helper function to check academic qualifications
const checkAcademicQualifications = (student, course) => {
  // Simplified qualification check - adjust based on your actual requirements
  if (!course.requirements) {
    return { qualified: true, missingRequirements: [] };
  }

  // Your existing qualification logic here
  const missingRequirements = [];
  
  // Example: Check if student has required subjects/grades
  // This is a simplified version - adjust based on your actual requirements structure
  
  return {
    qualified: missingRequirements.length === 0,
    missingRequirements
  };
};

// Helper function to create notifications
const createNotification = async (userId, notificationData) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      userId
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};