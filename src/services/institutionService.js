import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

const INSTITUTIONS_COLLECTION = 'institutions';

// =======================
// 📘 Institution Services
// =======================
export const createInstitution = async (institutionData) => {
  try {
    const institutionToCreate = {
      ...institutionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: institutionData.status || 'active',
      faculties: institutionData.faculties || [],
      courses: institutionData.courses || []
    };

    console.log('Creating institution with data:', institutionToCreate);
    const docRef = await addDoc(collection(db, INSTITUTIONS_COLLECTION), institutionToCreate);
    console.log('Institution created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating institution:', error);
    throw error;
  }
};

export const getInstitutions = async () => {
  try {
    const q = query(collection(db, INSTITUTIONS_COLLECTION), where('status', '==', 'active'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching institutions:', error);
    throw error;
  }
};

export const getInstitutionById = async (id) => {
  try {
    const docRef = doc(db, INSTITUTIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error('Error fetching institution:', error);
    throw error;
  }
};

export const updateInstitution = async (id, data) => {
  try {
    const docRef = doc(db, INSTITUTIONS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating institution:', error);
    throw error;
  }
};

export const deleteInstitution = async (id) => {
  try {
    const docRef = doc(db, INSTITUTIONS_COLLECTION, id);
    await updateDoc(docRef, {
      status: 'deleted',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error deleting institution:', error);
    throw error;
  }
};

// ==================
// 📚 Course Services
// ==================

/**
 * Get all courses for student applications
 * This fetches courses from both institution-level and faculty-level arrays
 */
export const getAllCoursesForApplying = async () => {
  try {
    const institutionsSnapshot = await getDocs(collection(db, INSTITUTIONS_COLLECTION));
    const allCourses = [];
    const courseIds = new Set(); // Track unique courses by ID

    institutionsSnapshot.forEach((institutionDoc) => {
      const institutionData = institutionDoc.data();
      const institutionId = institutionDoc.id;

      // 1. Get courses from faculties (primary source)
      if (institutionData.faculties && Array.isArray(institutionData.faculties)) {
        institutionData.faculties.forEach((faculty) => {
          if (faculty.courses && Array.isArray(faculty.courses)) {
            faculty.courses.forEach((course) => {
              // Avoid duplicates by course ID
              if (!courseIds.has(course.id)) {
                courseIds.add(course.id);
                allCourses.push({
                  ...course,
                  institutionId: institutionId,
                  institutionName: institutionData.name,
                  facultyName: faculty.name, // Use faculty name from faculty object
                  facultyId: faculty.id
                });
              }
            });
          }
        });
      }

      // 2. Fallback: Get courses from institution level (if no faculty courses)
      if (institutionData.courses && Array.isArray(institutionData.courses)) {
        institutionData.courses.forEach((course) => {
          if (!courseIds.has(course.id)) {
            courseIds.add(course.id);
            allCourses.push({
              ...course,
              institutionId: institutionId,
              institutionName: institutionData.name,
              // facultyName might be in course.facultyName if it exists at institution level
              facultyName: course.facultyName || 'General'
            });
          }
        });
      }
    });

    console.log('Total unique courses found for applying:', allCourses.length);
    return allCourses;
  } catch (error) {
    console.error('Error fetching courses for applying:', error);
    throw error;
  }
};

/**
 * Get courses by institution ID
 */
export const getCoursesByInstitution = async (institutionId) => {
  try {
    const institutionDoc = await getDoc(doc(db, INSTITUTIONS_COLLECTION, institutionId));
    if (!institutionDoc.exists()) {
      return [];
    }

    const institutionData = institutionDoc.data();
    const allCourses = [];
    const courseIds = new Set();

    // Get courses from faculties
    if (institutionData.faculties && Array.isArray(institutionData.faculties)) {
      institutionData.faculties.forEach((faculty) => {
        if (faculty.courses && Array.isArray(faculty.courses)) {
          faculty.courses.forEach((course) => {
            if (!courseIds.has(course.id)) {
              courseIds.add(course.id);
              allCourses.push({
                ...course,
                institutionId: institutionId,
                institutionName: institutionData.name,
                facultyName: faculty.name,
                facultyId: faculty.id
              });
            }
          });
        }
      });
    }

    // Get courses from institution level
    if (institutionData.courses && Array.isArray(institutionData.courses)) {
      institutionData.courses.forEach((course) => {
        if (!courseIds.has(course.id)) {
          courseIds.add(course.id);
          allCourses.push({
            ...course,
            institutionId: institutionId,
            institutionName: institutionData.name,
            facultyName: course.facultyName || 'General'
          });
        }
      });
    }

    return allCourses;
  } catch (error) {
    console.error('Error fetching courses by institution:', error);
    throw error;
  }
};

/**
 * Get courses by faculty within an institution
 */
export const getCoursesByFaculty = async (institutionId, facultyId) => {
  try {
    const institutionDoc = await getDoc(doc(db, INSTITUTIONS_COLLECTION, institutionId));
    if (!institutionDoc.exists()) {
      return [];
    }

    const institutionData = institutionDoc.data();
    const facultyCourses = [];

    // Find the specific faculty and get its courses
    if (institutionData.faculties && Array.isArray(institutionData.faculties)) {
      const faculty = institutionData.faculties.find(f => f.id === facultyId);
      if (faculty && faculty.courses && Array.isArray(faculty.courses)) {
        faculty.courses.forEach((course) => {
          facultyCourses.push({
            ...course,
            institutionId: institutionId,
            institutionName: institutionData.name,
            facultyName: faculty.name,
            facultyId: faculty.id
          });
        });
      }
    }

    return facultyCourses;
  } catch (error) {
    console.error('Error fetching courses by faculty:', error);
    throw error;
  }
};

/**
 * Get course by ID across all institutions
 */
export const getCourseById = async (courseId) => {
  try {
    const institutionsSnapshot = await getDocs(collection(db, INSTITUTIONS_COLLECTION));
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      const institutionId = institutionDoc.id;

      // Check faculties for the course
      if (institutionData.faculties && Array.isArray(institutionData.faculties)) {
        for (const faculty of institutionData.faculties) {
          if (faculty.courses && Array.isArray(faculty.courses)) {
            const course = faculty.courses.find(c => c.id === courseId);
            if (course) {
              return {
                ...course,
                institutionId: institutionId,
                institutionName: institutionData.name,
                facultyName: faculty.name,
                facultyId: faculty.id
              };
            }
          }
        }
      }

      // Check institution-level courses
      if (institutionData.courses && Array.isArray(institutionData.courses)) {
        const course = institutionData.courses.find(c => c.id === courseId);
        if (course) {
          return {
            ...course,
            institutionId: institutionId,
            institutionName: institutionData.name,
            facultyName: course.facultyName || 'General'
          };
        }
      }
    }

    return null; // Course not found
  } catch (error) {
    console.error('Error fetching course by ID:', error);
    throw error;
  }
};

// ====================
// 🎓 Faculty Services
// ====================

/**
 * Get all faculties from an institution
 */
export const getFacultiesByInstitution = async (institutionId) => {
  try {
    const institutionDoc = await getDoc(doc(db, INSTITUTIONS_COLLECTION, institutionId));
    if (!institutionDoc.exists()) {
      return [];
    }

    const institutionData = institutionDoc.data();
    return institutionData.faculties || [];
  } catch (error) {
    console.error('Error fetching faculties by institution:', error);
    throw error;
  }
};

/**
 * Get faculty by ID
 */
export const getFacultyById = async (institutionId, facultyId) => {
  try {
    const institutionDoc = await getDoc(doc(db, INSTITUTIONS_COLLECTION, institutionId));
    if (!institutionDoc.exists()) {
      return null;
    }

    const institutionData = institutionDoc.data();
    const faculties = institutionData.faculties || [];
    return faculties.find(faculty => faculty.id === facultyId) || null;
  } catch (error) {
    console.error('Error fetching faculty by ID:', error);
    throw error;
  }
};

// ============================
// 🔄 Enhanced Management Services
// ============================

/**
 * Add faculty to an institution
 */
export const addFacultyToInstitution = async (institutionId, facultyData) => {
  try {
    const institutionRef = doc(db, INSTITUTIONS_COLLECTION, institutionId);
    const institutionSnap = await getDoc(institutionRef);
    
    if (!institutionSnap.exists()) {
      throw new Error('Institution not found');
    }

    const institution = institutionSnap.data();
    const existingFaculties = institution.faculties || [];
    
    const newFaculty = {
      id: `faculty_${Date.now()}`,
      ...facultyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      courses: []
    };

    const updatedFaculties = [...existingFaculties, newFaculty];

    await updateDoc(institutionRef, {
      faculties: updatedFaculties,
      updatedAt: serverTimestamp()
    });

    return newFaculty.id;
  } catch (error) {
    console.error('Error adding faculty to institution:', error);
    throw error;
  }
};

/**
 * Update faculty in an institution
 */
export const updateFacultyInInstitution = async (institutionId, facultyId, facultyData) => {
  try {
    const institutionRef = doc(db, INSTITUTIONS_COLLECTION, institutionId);
    const institutionSnap = await getDoc(institutionRef);
    
    if (!institutionSnap.exists()) {
      throw new Error('Institution not found');
    }

    const institution = institutionSnap.data();
    const faculties = institution.faculties || [];
    
    const updatedFaculties = faculties.map(faculty => 
      faculty.id === facultyId 
        ? { 
            ...faculty, 
            ...facultyData, 
            updatedAt: new Date().toISOString(),
            id: facultyId // Ensure ID doesn't change
          }
        : faculty
    );

    await updateDoc(institutionRef, {
      faculties: updatedFaculties,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error updating faculty in institution:', error);
    throw error;
  }
};

/**
 * Add course to a faculty within an institution
 */
export const addCourseToFaculty = async (institutionId, facultyId, courseData) => {
  try {
    const institutionRef = doc(db, INSTITUTIONS_COLLECTION, institutionId);
    const institutionSnap = await getDoc(institutionRef);
    
    if (!institutionSnap.exists()) {
      throw new Error('Institution not found');
    }

    const institution = institutionSnap.data();
    const faculties = institution.faculties || [];
    
    const updatedFaculties = faculties.map(faculty => {
      if (faculty.id === facultyId) {
        const existingCourses = faculty.courses || [];
        const newCourse = {
          id: `course_${Date.now()}`,
          ...courseData,
          facultyId: facultyId,
          facultyName: faculty.name,
          createdAt: new Date().toISOString(),
          status: 'active'
        };

        return {
          ...faculty,
          courses: [...existingCourses, newCourse],
          updatedAt: new Date().toISOString()
        };
      }
      return faculty;
    });

    await updateDoc(institutionRef, {
      faculties: updatedFaculties,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error adding course to faculty:', error);
    throw error;
  }
};

/**
 * Update course in a faculty
 */
export const updateCourseInFaculty = async (institutionId, facultyId, courseId, courseData) => {
  try {
    const institutionRef = doc(db, INSTITUTIONS_COLLECTION, institutionId);
    const institutionSnap = await getDoc(institutionRef);
    
    if (!institutionSnap.exists()) {
      throw new Error('Institution not found');
    }

    const institution = institutionSnap.data();
    const faculties = institution.faculties || [];
    
    const updatedFaculties = faculties.map(faculty => {
      if (faculty.id === facultyId) {
        const courses = faculty.courses || [];
        const updatedCourses = courses.map(course => 
          course.id === courseId 
            ? { 
                ...course, 
                ...courseData, 
                updatedAt: new Date().toISOString(),
                id: courseId // Ensure ID doesn't change
              }
            : course
        );

        return {
          ...faculty,
          courses: updatedCourses,
          updatedAt: new Date().toISOString()
        };
      }
      return faculty;
    });

    await updateDoc(institutionRef, {
      faculties: updatedFaculties,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error updating course in faculty:', error);
    throw error;
  }
};

/**
 * Delete course from a faculty
 */
export const deleteCourseFromFaculty = async (institutionId, facultyId, courseId) => {
  try {
    const institutionRef = doc(db, INSTITUTIONS_COLLECTION, institutionId);
    const institutionSnap = await getDoc(institutionRef);
    
    if (!institutionSnap.exists()) {
      throw new Error('Institution not found');
    }

    const institution = institutionSnap.data();
    const faculties = institution.faculties || [];
    
    const updatedFaculties = faculties.map(faculty => {
      if (faculty.id === facultyId) {
        const courses = faculty.courses || [];
        const updatedCourses = courses.filter(course => course.id !== courseId);
        
        return {
          ...faculty,
          courses: updatedCourses,
          updatedAt: new Date().toISOString()
        };
      }
      return faculty;
    });

    await updateDoc(institutionRef, {
      faculties: updatedFaculties,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error deleting course from faculty:', error);
    throw error;
  }
};

// Debug function to check data structure
export const debugInstitutionStructure = async (institutionId) => {
  try {
    const institutionDoc = await getDoc(doc(db, INSTITUTIONS_COLLECTION, institutionId));
    if (!institutionDoc.exists()) {
      console.log('Institution not found');
      return null;
    }

    const data = institutionDoc.data();
    console.log('Institution Structure:', {
      name: data.name,
      totalFaculties: data.faculties?.length || 0,
      totalCourses: data.courses?.length || 0,
      faculties: data.faculties?.map(f => ({
        name: f.name,
        courses: f.courses?.length || 0
      })) || []
    });

    return data;
  } catch (error) {
    console.error('Error debugging institution structure:', error);
    throw error;
  }
};