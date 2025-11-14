// src/services/jobService.js
import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';

// Get all jobs
const getAllJobs = async () => {
  try {
    const jobsRef = collection(db, 'jobs');
    const jobsQuery = query(jobsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(jobsQuery);
    
    const jobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw new Error('Failed to fetch jobs');
  }
};

// Get jobs by company
const getJobsByCompany = async (companyId) => {
  try {
    const jobsRef = collection(db, 'jobs');
    const jobsQuery = query(
      jobsRef, 
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(jobsQuery);
    
    const jobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return jobs;
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    throw new Error('Failed to fetch company jobs');
  }
};

// Get job by ID
const getJob = async (jobId) => {
  try {
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    
    if (!jobDoc.exists()) {
      throw new Error('Job not found');
    }
    
    return {
      id: jobDoc.id,
      ...jobDoc.data()
    };
  } catch (error) {
    console.error('Error fetching job:', error);
    throw new Error('Failed to fetch job');
  }
};

// Create new job
const createJob = async (jobData) => {
  try {
    const jobsRef = collection(db, 'jobs');
    const newJob = {
      ...jobData,
      status: 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      applications: 0
    };
    
    const docRef = await addDoc(jobsRef, newJob);
    
    return {
      id: docRef.id,
      ...newJob
    };
  } catch (error) {
    console.error('Error creating job:', error);
    throw new Error('Failed to create job');
  }
};

// Update job
const updateJob = async (jobId, updateData) => {
  try {
    const jobRef = doc(db, 'jobs', jobId);
    
    const updateFields = {
      ...updateData,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(jobRef, updateFields);
    
    return {
      id: jobId,
      ...updateFields
    };
  } catch (error) {
    console.error('Error updating job:', error);
    throw new Error('Failed to update job');
  }
};

// Delete job
const deleteJob = async (jobId) => {
  try {
    const jobRef = doc(db, 'jobs', jobId);
    await deleteDoc(jobRef);
    
    return { success: true, message: 'Job deleted successfully' };
  } catch (error) {
    console.error('Error deleting job:', error);
    throw new Error('Failed to delete job');
  }
};

// Get active jobs (for students)
const getActiveJobs = async () => {
  try {
    const jobsRef = collection(db, 'jobs');
    const jobsQuery = query(
      jobsRef, 
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(jobsQuery);
    
    const jobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return jobs;
  } catch (error) {
    console.error('Error fetching active jobs:', error);
    throw new Error('Failed to fetch active jobs');
  }
};

// Search jobs
const searchJobs = async (searchTerm, filters = {}) => {
  try {
    let jobsRef = collection(db, 'jobs');
    let constraints = [where('status', '==', 'active')];
    
    // Add additional filters if provided
    if (filters.location) {
      constraints.push(where('location', '==', filters.location));
    }
    if (filters.jobType) {
      constraints.push(where('jobType', '==', filters.jobType));
    }
    if (filters.industry) {
      constraints.push(where('industry', '==', filters.industry));
    }
    
    const jobsQuery = query(jobsRef, ...constraints, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(jobsQuery);
    
    let jobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Apply search term filter
    if (searchTerm) {
      jobs = jobs.filter(job => 
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.requirements?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return jobs;
  } catch (error) {
    console.error('Error searching jobs:', error);
    throw new Error('Failed to search jobs');
  }
};

// Get job categories
const getJobCategories = async () => {
  try {
    const jobs = await getActiveJobs();
    const categories = [...new Set(jobs.map(job => job.industry).filter(Boolean))];
    return categories.sort();
  } catch (error) {
    console.error('Error fetching job categories:', error);
    return [];
  }
};

// Get job locations
const getJobLocations = async () => {
  try {
    const jobs = await getActiveJobs();
    const locations = [...new Set(jobs.map(job => job.location).filter(Boolean))];
    return locations.sort();
  } catch (error) {
    console.error('Error fetching job locations:', error);
    return [];
  }
};

// Get student's job applications
const getStudentJobApplications = async (studentId) => {
  try {
    const applicationsRef = collection(db, 'jobApplications');
    const applicationsQuery = query(
      applicationsRef, 
      where('studentId', '==', studentId),
      orderBy('appliedAt', 'desc')
    );
    const querySnapshot = await getDocs(applicationsQuery);
    
    const applications = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const application = {
          id: doc.id,
          ...doc.data()
        };
        
        // Get job details
        if (application.jobId) {
          try {
            const jobDoc = await getDoc(doc(db, 'jobs', application.jobId));
            if (jobDoc.exists()) {
              application.job = {
                id: jobDoc.id,
                ...jobDoc.data()
              };
              
              // Get company details
              if (application.job.companyId) {
                const companyDoc = await getDoc(doc(db, 'users', application.job.companyId));
                if (companyDoc.exists()) {
                  application.company = {
                    id: companyDoc.id,
                    ...companyDoc.data()
                  };
                }
              }
            }
          } catch (error) {
            console.error('Error fetching job details:', error);
          }
        }
        
        return application;
      })
    );
    
    return applications;
  } catch (error) {
    console.error('Error fetching student job applications:', error);
    throw new Error('Failed to fetch job applications');
  }
};

// Get matching jobs for student
const getMatchingJobs = async (studentId) => {
  try {
    // First get student profile
    const studentDoc = await getDoc(doc(db, 'users', studentId));
    
    if (!studentDoc.exists()) {
      return [];
    }
    
    const student = studentDoc.data();
    const studentSkills = student.profile?.skills || [];
    const studentInterests = student.profile?.interests || [];
    
    // Get all active jobs
    const activeJobs = await getActiveJobs();
    
    // Calculate match score for each job
    const jobsWithMatch = activeJobs.map(job => {
      const matchScore = calculateJobMatch(student, job);
      
      return {
        ...job,
        matchScore
      };
    });
    
    // Return top matching jobs (above 50% match)
    return jobsWithMatch
      .filter(job => job.matchScore > 50)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10); // Limit to top 10 matches
      
  } catch (error) {
    console.error('Error fetching matching jobs:', error);
    return []; // Return empty array instead of throwing error
  }
};

// Helper function to calculate job match score
const calculateJobMatch = (student, job) => {
  let score = 0;
  const studentSkills = student.profile?.skills || [];
  const studentEducation = student.profile?.education || [];
  const jobRequirements = job.requirements || {};
  
  // Skills match (50% weight)
  const requiredSkills = jobRequirements.skills || [];
  if (requiredSkills.length > 0) {
    const matchingSkills = studentSkills.filter(skill => 
      requiredSkills.some(reqSkill => 
        reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(reqSkill.toLowerCase())
      )
    );
    score += (matchingSkills.length / requiredSkills.length) * 50;
  }
  
  // Education match (30% weight)
  const requiredEducation = jobRequirements.education || [];
  if (requiredEducation.length > 0) {
    const hasRequiredEducation = studentEducation.some(edu =>
      requiredEducation.some(reqEdu => 
        edu.level?.toLowerCase().includes(reqEdu.toLowerCase()) ||
        reqEdu.toLowerCase().includes(edu.level?.toLowerCase())
      )
    );
    if (hasRequiredEducation) {
      score += 30;
    }
  }
  
  // Location preference (20% weight)
  const studentPreferredLocation = student.profile?.preferredLocation;
  if (studentPreferredLocation && job.location) {
    if (studentPreferredLocation.toLowerCase() === job.location.toLowerCase()) {
      score += 20;
    }
  }
  
  return Math.min(Math.round(score), 100);
};

// Apply for a job
const applyForJob = async (applicationData) => {
  try {
    const applicationsRef = collection(db, 'jobApplications');
    
    const newApplication = {
      ...applicationData,
      status: 'pending',
      appliedAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(applicationsRef, newApplication);
    
    // Update job applications count
    if (applicationData.jobId) {
      const jobRef = doc(db, 'jobs', applicationData.jobId);
      const jobDoc = await getDoc(jobRef);
      
      if (jobDoc.exists()) {
        const currentApplications = jobDoc.data().applications || 0;
        await updateDoc(jobRef, {
          applications: currentApplications + 1
        });
      }
    }
    
    return {
      id: docRef.id,
      ...newApplication
    };
  } catch (error) {
    console.error('Error applying for job:', error);
    throw new Error('Failed to apply for job');
  }
};

// Update job application status
const updateJobApplicationStatus = async (applicationId, status) => {
  try {
    const applicationRef = doc(db, 'jobApplications', applicationId);
    
    await updateDoc(applicationRef, {
      status,
      updatedAt: Timestamp.now()
    });
    
    return { success: true, message: 'Application status updated' };
  } catch (error) {
    console.error('Error updating application status:', error);
    throw new Error('Failed to update application status');
  }
};

// Get job application by ID
const getJobApplication = async (applicationId) => {
  try {
    const applicationDoc = await getDoc(doc(db, 'jobApplications', applicationId));
    
    if (!applicationDoc.exists()) {
      throw new Error('Application not found');
    }
    
    const application = {
      id: applicationDoc.id,
      ...applicationDoc.data()
    };
    
    // Get job details
    if (application.jobId) {
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', application.jobId));
        if (jobDoc.exists()) {
          application.job = {
            id: jobDoc.id,
            ...jobDoc.data()
          };
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
      }
    }
    
    return application;
  } catch (error) {
    console.error('Error fetching application:', error);
    throw new Error('Failed to fetch application');
  }
};

// Get job applications by company
const getJobApplicationsByCompany = async (companyId) => {
  try {
    const applicationsRef = collection(db, 'jobApplications');
    const applicationsQuery = query(
      applicationsRef, 
      orderBy('appliedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(applicationsQuery);
    
    // Filter applications for company's jobs
    const applications = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const application = {
          id: doc.id,
          ...doc.data()
        };
        
        // Get job details to check if it belongs to the company
        if (application.jobId) {
          try {
            const jobDoc = await getDoc(doc(db, 'jobs', application.jobId));
            if (jobDoc.exists()) {
              const jobData = jobDoc.data();
              if (jobData.companyId === companyId) {
                application.job = {
                  id: jobDoc.id,
                  ...jobData
                };
                
                // Get student details
                if (application.studentId) {
                  const studentDoc = await getDoc(doc(db, 'users', application.studentId));
                  if (studentDoc.exists()) {
                    application.student = {
                      id: studentDoc.id,
                      ...studentDoc.data()
                    };
                    application.studentName = `${application.student.profile?.firstName || ''} ${application.student.profile?.lastName || ''}`.trim() || 'Unknown Student';
                  }
                }
                
                return application;
              }
            }
          } catch (error) {
            console.error('Error fetching job details:', error);
          }
        }
        
        return null;
      })
    );
    
    // Filter out null values and return only company's applications
    return applications.filter(app => app !== null);
  } catch (error) {
    console.error('Error fetching company job applications:', error);
    throw new Error('Failed to fetch job applications');
  }
};

// Get applications for a specific job
const getJobApplicationsByJobId = async (jobId) => {
  try {
    const applicationsRef = collection(db, 'jobApplications');
    const applicationsQuery = query(
      applicationsRef, 
      where('jobId', '==', jobId),
      orderBy('appliedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(applicationsQuery);
    
    const applications = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const application = {
          id: doc.id,
          ...doc.data()
        };
        
        // Get student details
        if (application.studentId) {
          try {
            const studentDoc = await getDoc(doc(db, 'users', application.studentId));
            if (studentDoc.exists()) {
              application.student = {
                id: studentDoc.id,
                ...studentDoc.data()
              };
              application.studentName = `${application.student.profile?.firstName || ''} ${application.student.profile?.lastName || ''}`.trim() || 'Unknown Student';
            }
          } catch (error) {
            console.error('Error fetching student details:', error);
          }
        }
        
        return application;
      })
    );
    
    return applications;
  } catch (error) {
    console.error('Error fetching job applications:', error);
    throw new Error('Failed to fetch job applications');
  }
};

// Export all functions at once (no duplicate exports)
export {
  getAllJobs,
  getJobsByCompany,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getActiveJobs,
  searchJobs,
  getJobCategories,
  getJobLocations,
  getStudentJobApplications,
  getMatchingJobs,
  applyForJob,
  updateJobApplicationStatus,
  getJobApplication,
  getJobApplicationsByCompany,
  getJobApplicationsByJobId
};

// Default export for backward compatibility
export default {
  getAllJobs,
  getJobsByCompany,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getActiveJobs,
  searchJobs,
  getJobCategories,
  getJobLocations,
  getStudentJobApplications,
  getMatchingJobs,
  applyForJob,
  updateJobApplicationStatus,
  getJobApplication,
  getJobApplicationsByCompany,
  getJobApplicationsByJobId
};