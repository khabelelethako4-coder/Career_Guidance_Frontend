// src/services/qualificationService.js
import { getJobApplicationsByJobId } from './jobService';
import { getStudentProfile } from './userService';

// Filter and rank applicants based on job requirements
export const getQualifiedApplicants = async (jobId) => {
  try {
    const applications = await getJobApplicationsByJobId(jobId);
    const qualifiedApplications = [];

    for (const application of applications) {
      if (application.studentId) {
        const student = await getStudentProfile(application.studentId);
        const qualificationScore = await calculateQualificationScore(student, application.job);
        
        if (qualificationScore >= 60) { // Minimum 60% match to be considered qualified
          qualifiedApplications.push({
            ...application,
            student,
            qualificationScore,
            matchDetails: getMatchDetails(student, application.job)
          });
        }
      }
    }

    // Sort by qualification score (highest first)
    return qualifiedApplications.sort((a, b) => b.qualificationScore - a.qualificationScore);
  } catch (error) {
    console.error('Error filtering qualified applicants:', error);
    throw new Error('Failed to filter qualified applicants');
  }
};

// Calculate qualification score based on job requirements
const calculateQualificationScore = async (student, job) => {
  let totalScore = 0;
  let maxScore = 0;

  const requirements = job.requirements || {};
  const qualifications = job.qualifications || {};
  const studentProfile = student.profile || {};

  // Academic Performance (25%)
  if (qualifications.minGPA) {
    maxScore += 25;
    const studentGPA = getHighestGPA(studentProfile.education);
    if (studentGPA >= parseFloat(qualifications.minGPA)) {
      totalScore += 25;
    } else if (studentGPA > 0) {
      // Partial score based on how close they are to required GPA
      totalScore += (studentGPA / parseFloat(qualifications.minGPA)) * 25;
    }
  }

  // Education Level (20%)
  if (requirements.education) {
    maxScore += 20;
    if (hasRequiredEducation(studentProfile.education, requirements.education)) {
      totalScore += 20;
    }
  }

  // Skills Match (25%)
  if (requirements.skills && requirements.skills.length > 0) {
    maxScore += 25;
    const skillsMatch = calculateSkillsMatch(studentProfile.skills, requirements.skills);
    totalScore += skillsMatch * 25;
  }

  // Work Experience (20%)
  if (requirements.experience) {
    maxScore += 20;
    const experienceMatch = calculateExperienceMatch(studentProfile.workExperience, requirements.experience);
    totalScore += experienceMatch * 20;
  }

  // Certificates (10%)
  if (qualifications.requiredCertificates && qualifications.requiredCertificates.length > 0) {
    maxScore += 10;
    const certificatesMatch = calculateCertificatesMatch(studentProfile.certificates, qualifications.requiredCertificates);
    totalScore += certificatesMatch * 10;
  }

  return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
};

// Helper functions
const getHighestGPA = (education) => {
  if (!education || education.length === 0) return 0;
  return Math.max(...education.map(edu => parseFloat(edu.gpa) || 0));
};

const hasRequiredEducation = (studentEducation, requiredEducation) => {
  if (!studentEducation) return false;
  
  const educationLevels = {
    'high-school': 1,
    'diploma': 2,
    'bachelors': 3,
    'masters': 4,
    'phd': 5
  };

  const requiredLevel = educationLevels[requiredEducation.toLowerCase()];
  return studentEducation.some(edu => {
    const studentLevel = educationLevels[edu.level?.toLowerCase()] || 0;
    return studentLevel >= requiredLevel;
  });
};

const calculateSkillsMatch = (studentSkills, requiredSkills) => {
  if (!studentSkills || studentSkills.length === 0) return 0;
  
  const matchingSkills = studentSkills.filter(studentSkill =>
    requiredSkills.some(requiredSkill =>
      studentSkill.toLowerCase().includes(requiredSkill.toLowerCase()) ||
      requiredSkill.toLowerCase().includes(studentSkill.toLowerCase())
    )
  );
  
  return matchingSkills.length / requiredSkills.length;
};

const calculateExperienceMatch = (workExperience, requiredExperience) => {
  if (!workExperience || workExperience.length === 0) return 0;
  
  const totalYears = workExperience.reduce((total, exp) => total + (exp.years || 0), 0);
  
  const experienceMap = {
    'internship': 0.5,
    'entry-level': 1,
    'mid-level': 3,
    'senior': 5
  };
  
  const requiredYears = experienceMap[requiredExperience] || 0;
  return Math.min(totalYears / requiredYears, 1);
};

const calculateCertificatesMatch = (studentCertificates, requiredCertificates) => {
  if (!studentCertificates || studentCertificates.length === 0) return 0;
  
  const matchingCerts = studentCertificates.filter(cert =>
    requiredCertificates.some(requiredCert =>
      cert.name?.toLowerCase().includes(requiredCert.toLowerCase()) ||
      requiredCert.toLowerCase().includes(cert.name?.toLowerCase())
    )
  );
  
  return matchingCerts.length / requiredCertificates.length;
};

const getMatchDetails = (student, job) => {
  const details = [];
  const studentProfile = student.profile || {};
  const requirements = job.requirements || {};

  // Education match
  if (requirements.education) {
    const hasEducation = hasRequiredEducation(studentProfile.education, requirements.education);
    details.push({
      category: 'Education',
      matched: hasEducation,
      requirement: requirements.education
    });
  }

  // Skills match
  if (requirements.skills) {
    const skillsMatch = calculateSkillsMatch(studentProfile.skills, requirements.skills);
    details.push({
      category: 'Skills',
      matched: skillsMatch > 0.5,
      matchPercentage: Math.round(skillsMatch * 100),
      requirement: `${requirements.skills.length} required skills`
    });
  }

  return details;
};

export default {
  getQualifiedApplicants,
  calculateQualificationScore
};