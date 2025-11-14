import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createInstitution, updateInstitution } from '../../services/institutionService';
import { BuildingIcon, ArrowLeftIcon, UploadIcon, CheckIcon } from "../../components/Icons";

const BulkImport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [importStatus, setImportStatus] = useState([]);
  const [progress, setProgress] = useState(0);

  // Lesotho institutions data
  const lesothoInstitutions = [
    {
      name: "National University of Lesotho",
      email: "admissions@nul.ls",
      phone: "+266 22340601",
      address: "Roma Campus, P.O. Roma 180",
      location: "Roma",
      website: "https://www.nul.ls",
      type: "university",
      establishedYear: 1945,
      description: "The premier institution of higher learning in Lesotho, offering diverse academic programs.",
      faculties: [
        {
          id: "nul_faculty_1",
          name: "Faculty of Science and Technology",
          dean: "Dr. M. Molapo",
          email: "science@nul.ls",
          phone: "+266 22340602",
          description: "Offering programs in natural sciences, engineering, and technology",
          courses: [
            {
              id: "nul_course_1",
              name: "Computer Science",
              code: "CS101",
              duration: "4 years",
              fees: 25000,
              facultyId: "nul_faculty_1",
              facultyName: "Faculty of Science and Technology",
              description: "Bachelor of Science in Computer Science covering programming, algorithms, and software development",
              requirements: "Mathematics and Physical Science at high school level",
              status: "active"
            },
            {
              id: "nul_course_2",
              name: "Civil Engineering",
              code: "CE201",
              duration: "5 years",
              fees: 30000,
              facultyId: "nul_faculty_1",
              facultyName: "Faculty of Science and Technology",
              description: "Bachelor of Engineering in Civil Engineering focusing on infrastructure development",
              requirements: "Mathematics, Physical Science and English",
              status: "active"
            }
          ]
        },
        {
          id: "nul_faculty_2",
          name: "Faculty of Health Sciences",
          dean: "Dr. L. Monyake",
          email: "healthsciences@nul.ls",
          phone: "+266 22340603",
          description: "Training healthcare professionals for Lesotho and beyond",
          courses: [
            {
              id: "nul_course_3",
              name: "Bachelor of Nursing",
              code: "BN401",
              duration: "4 years",
              fees: 28000,
              facultyId: "nul_faculty_2",
              facultyName: "Faculty of Health Sciences",
              description: "Comprehensive nursing program with clinical practice",
              requirements: "Biology, Chemistry and Mathematics",
              status: "active"
            },
            {
              id: "nul_course_4",
              name: "Public Health",
              code: "PH301",
              duration: "4 years",
              fees: 26000,
              facultyId: "nul_faculty_2",
              facultyName: "Faculty of Health Sciences",
              description: "Focus on community health and disease prevention",
              requirements: "Biology and English with Mathematics",
              status: "active"
            }
          ]
        }
      ]
    },
    {
      name: "Limkokwing University of Creative Technology",
      email: "info@limkokwing.ls",
      phone: "+266 22313737",
      address: "Maseru, Lesotho",
      location: "Maseru",
      website: "https://www.limkokwing.ls",
      type: "university",
      establishedYear: 2008,
      description: "Innovative university focusing on creative industries and technology",
      faculties: [
        {
          id: "limk_faculty_1",
          name: "Faculty of Design Innovation",
          dean: "Prof. S. Mphahlele",
          email: "design@limkokwing.ls",
          phone: "+266 22313738",
          description: "Creative programs in various design disciplines",
          courses: [
            {
              id: "limk_course_1",
              name: "Graphic Design",
              code: "GD101",
              duration: "3 years",
              fees: 32000,
              facultyId: "limk_faculty_1",
              facultyName: "Faculty of Design Innovation",
              description: "Bachelor of Design in Graphic and Digital Media",
              requirements: "Art/Design background with portfolio",
              status: "active"
            },
            {
              id: "limk_course_2",
              name: "Fashion Design",
              code: "FD201",
              duration: "3 years",
              fees: 35000,
              facultyId: "limk_faculty_1",
              facultyName: "Faculty of Design Innovation",
              description: "Comprehensive fashion design and merchandising program",
              requirements: "Creative arts background preferred",
              status: "active"
            }
          ]
        },
        {
          id: "limk_faculty_2",
          name: "Faculty of Information Technology",
          dean: "Dr. T. Mokhothu",
          email: "it@limkokwing.ls",
          phone: "+266 22313739",
          description: "Cutting-edge IT and multimedia programs",
          courses: [
            {
              id: "limk_course_3",
              name: "Software Engineering",
              code: "SE301",
              duration: "4 years",
              fees: 38000,
              facultyId: "limk_faculty_2",
              facultyName: "Faculty of Information Technology",
              description: "Bachelor of Software Engineering with multimedia focus",
              requirements: "Mathematics and Computer Studies",
              status: "active"
            },
            {
              id: "limk_course_4",
              name: "Multimedia Production",
              code: "MM401",
              duration: "3 years",
              fees: 34000,
              facultyId: "limk_faculty_2",
              facultyName: "Faculty of Information Technology",
              description: "Animation, video production and digital media creation",
              requirements: "Art/Computer studies background",
              status: "active"
            }
          ]
        }
      ]
    },
    {
      name: "Lesotho College of Education",
      email: "admissions@lce.ac.ls",
      phone: "+266 22320221",
      address: "Maseru, Lesotho",
      location: "Maseru",
      website: "https://www.lce.ac.ls",
      type: "college",
      establishedYear: 1975,
      description: "Primary institution for teacher education in Lesotho",
      faculties: [
        {
          id: "lce_faculty_1",
          name: "Faculty of Primary Education",
          dean: "Dr. M. Seutloali",
          email: "primary@lce.ac.ls",
          phone: "+266 22320222",
          description: "Training teachers for primary school education",
          courses: [
            {
              id: "lce_course_1",
              name: "Primary Education",
              code: "PED101",
              duration: "3 years",
              fees: 18000,
              facultyId: "lce_faculty_1",
              facultyName: "Faculty of Primary Education",
              description: "Diploma in Primary Education for grades 1-7",
              requirements: "LGCSE with English and Mathematics",
              status: "active"
            },
            {
              id: "lce_course_2",
              name: "Early Childhood Education",
              code: "ECE201",
              duration: "2 years",
              fees: 16000,
              facultyId: "lce_faculty_1",
              facultyName: "Faculty of Primary Education",
              description: "Certificate in Early Childhood Development",
              requirements: "Form E or equivalent",
              status: "active"
            }
          ]
        },
        {
          id: "lce_faculty_2",
          name: "Faculty of Secondary Education",
          dean: "Dr. K. Molapo",
          email: "secondary@lce.ac.ls",
          phone: "+266 22320223",
          description: "Training subject specialists for secondary education",
          courses: [
            {
              id: "lce_course_3",
              name: "Mathematics Education",
              code: "MED301",
              duration: "3 years",
              fees: 20000,
              facultyId: "lce_faculty_2",
              facultyName: "Faculty of Secondary Education",
              description: "Diploma in Education specializing in Mathematics",
              requirements: "Mathematics at LGCSE level",
              status: "active"
            },
            {
              id: "lce_course_4",
              name: "Science Education",
              code: "SED401",
              duration: "3 years",
              fees: 21000,
              facultyId: "lce_faculty_2",
              facultyName: "Faculty of Secondary Education",
              description: "Diploma in Education specializing in Sciences",
              requirements: "Science subjects at LGCSE level",
              status: "active"
            }
          ]
        }
      ]
    },
    {
      name: "Lerotholi Polytechnic",
      email: "registrar@lp.ac.ls",
      phone: "+266 22310241",
      address: "Maseru, Lesotho",
      location: "Maseru",
      website: "https://www.lp.ac.ls",
      type: "polytechnic",
      establishedYear: 1960,
      description: "Technical and vocational education institution",
      faculties: [
        {
          id: "lp_faculty_1",
          name: "Faculty of Engineering",
          dean: "Eng. M. Thabane",
          email: "engineering@lp.ac.ls",
          phone: "+266 22310242",
          description: "Technical engineering programs and trades",
          courses: [
            {
              id: "lp_course_1",
              name: "Electrical Engineering",
              code: "ELE101",
              duration: "3 years",
              fees: 22000,
              facultyId: "lp_faculty_1",
              facultyName: "Faculty of Engineering",
              description: "Diploma in Electrical Engineering Technology",
              requirements: "Mathematics and Physical Science",
              status: "active"
            },
            {
              id: "lp_course_2",
              name: "Mechanical Engineering",
              code: "MEC201",
              duration: "3 years",
              fees: 23000,
              facultyId: "lp_faculty_1",
              facultyName: "Faculty of Engineering",
              description: "Diploma in Mechanical Engineering Technology",
              requirements: "Mathematics, Physical Science and Technical Drawing",
              status: "active"
            }
          ]
        },
        {
          id: "lp_faculty_2",
          name: "Faculty of Business Studies",
          dean: "Dr. P. Mokoena",
          email: "business@lp.ac.ls",
          phone: "+266 22310243",
          description: "Business management and entrepreneurship programs",
          courses: [
            {
              id: "lp_course_3",
              name: "Business Management",
              code: "BM301",
              duration: "2 years",
              fees: 19000,
              facultyId: "lp_faculty_2",
              facultyName: "Faculty of Business Studies",
              description: "Diploma in Business Management and Entrepreneurship",
              requirements: "LGCSE with English and Mathematics",
              status: "active"
            },
            {
              id: "lp_course_4",
              name: "Accounting",
              code: "ACC401",
              duration: "3 years",
              fees: 21000,
              facultyId: "lp_faculty_2",
              facultyName: "Faculty of Business Studies",
              description: "Diploma in Accounting and Finance",
              requirements: "Mathematics and English at LGCSE",
              status: "active"
            }
          ]
        }
      ]
    },
    {
      name: "Botho University Lesotho",
      email: "lesotho@bothouniversity.com",
      phone: "+266 28323234",
      address: "Maseru, Lesotho",
      location: "Maseru",
      website: "https://www.bothouniversity.com/ls",
      type: "university",
      establishedYear: 2015,
      description: "Private university offering professional and technical education",
      faculties: [
        {
          id: "botho_faculty_1",
          name: "Faculty of Computing",
          dean: "Dr. K. Letsie",
          email: "computing@bothouniversity.com",
          phone: "+266 28323235",
          description: "IT and computing programs with industry focus",
          courses: [
            {
              id: "botho_course_1",
              name: "Information Technology",
              code: "IT101",
              duration: "3 years",
              fees: 35000,
              facultyId: "botho_faculty_1",
              facultyName: "Faculty of Computing",
              description: "Bachelor of Science in Information Technology",
              requirements: "Mathematics and English at LGCSE",
              status: "active"
            },
            {
              id: "botho_course_2",
              name: "Cyber Security",
              code: "CS201",
              duration: "4 years",
              fees: 40000,
              facultyId: "botho_faculty_1",
              facultyName: "Faculty of Computing",
              description: "Bachelor of Science in Cyber Security",
              requirements: "Mathematics and Computer Studies preferred",
              status: "active"
            }
          ]
        },
        {
          id: "botho_faculty_2",
          name: "Faculty of Business and Accounting",
          dean: "Prof. M. Sello",
          email: "business@bothouniversity.com",
          phone: "+266 28323236",
          description: "Professional business and accounting programs",
          courses: [
            {
              id: "botho_course_3",
              name: "Business Administration",
              code: "BBA301",
              duration: "4 years",
              fees: 38000,
              facultyId: "botho_faculty_2",
              facultyName: "Faculty of Business and Accounting",
              description: "Bachelor of Business Administration",
              requirements: "LGCSE with English and Mathematics",
              status: "active"
            },
            {
              id: "botho_course_4",
              name: "Professional Accounting",
              code: "ACC401",
              duration: "4 years",
              fees: 42000,
              facultyId: "botho_faculty_2",
              facultyName: "Faculty of Business and Accounting",
              description: "Bachelor of Accounting - ACCA accredited",
              requirements: "Mathematics and English at LGCSE level",
              status: "active"
            }
          ]
        }
      ]
    }
  ];

  const handleBulkImport = async () => {
    setLoading(true);
    setImportStatus([]);
    setProgress(0);

    const totalInstitutions = lesothoInstitutions.length;
    let completed = 0;

    console.log('🚀 Starting bulk import of', totalInstitutions, 'institutions');

    for (const institutionData of lesothoInstitutions) {
      try {
        console.log('📝 Processing:', institutionData.name);
        
        // Extract faculties and courses
        const { faculties, ...basicData } = institutionData;
        
        console.log('🎓 Faculties found:', faculties?.length || 0);
        console.log('📚 Courses found:', faculties ? faculties.reduce((sum, fac) => sum + (fac.courses?.length || 0), 0) : 0);

        // Combine all courses from all faculties with faculty info
        const allCourses = faculties ? faculties.flatMap(faculty => 
          (faculty.courses || []).map(course => ({
            ...course,
            facultyId: faculty.id,
            facultyName: faculty.name
          }))
        ) : [];

        console.log('📋 All courses prepared:', allCourses.length);

        // Create the complete institution data
        const completeInstitutionData = {
          ...basicData,
          faculties: faculties || [],
          courses: allCourses,
          status: 'active'
        };

        console.log('💾 Creating institution in database...');
        
        // Create institution with all data at once
        const institutionId = await createInstitution(completeInstitutionData);
        
        console.log('✅ Created institution with ID:', institutionId);

        completed++;
        const newProgress = Math.round((completed / totalInstitutions) * 100);
        setProgress(newProgress);
        
        setImportStatus(prev => [...prev, {
          institution: institutionData.name,
          status: 'success',
          message: `Created with ${faculties?.length || 0} faculties and ${allCourses.length} courses`
        }]);

        console.log(`📊 Progress: ${completed}/${totalInstitutions} (${newProgress}%)`);

      } catch (error) {
        console.error('❌ Error importing', institutionData.name, ':', error);
        
        completed++;
        setProgress(Math.round((completed / totalInstitutions) * 100));
        
        setImportStatus(prev => [...prev, {
          institution: institutionData.name,
          status: 'error',
          message: `Failed: ${error.message || 'Unknown error'}`
        }]);
      }
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('🎉 Bulk import completed!');
    setLoading(false);
  };

  const successfulImports = importStatus.filter(item => item.status === 'success').length;
  const failedImports = importStatus.filter(item => item.status === 'error').length;

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="header-content">
            <button 
              onClick={() => navigate('/admin')}
              className="btn btn-outline btn-sm"
              style={{ marginBottom: '1rem' }}
            >
              <ArrowLeftIcon />
              Back to Dashboard
            </button>
            <h1 className="dashboard-title">Bulk Import Institutions</h1>
            <p className="dashboard-subtitle">
              Import sample Lesotho institutions with faculties and courses
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Lesotho Institutions Data</h3>
          </div>
          <div className="card-body">
            <div className="import-info">
              <div className="info-section">
                <h4>What will be imported:</h4>
                <ul>
                  <li>{lesothoInstitutions.length} Lesotho educational institutions</li>
                  <li>{lesothoInstitutions.reduce((sum, inst) => sum + (inst.faculties?.length || 0), 0)} faculties</li>
                  <li>{lesothoInstitutions.reduce((sum, inst) => sum + inst.faculties.reduce((facSum, fac) => facSum + (fac.courses?.length || 0), 0), 0)} courses</li>
                  <li>Complete academic structure</li>
                </ul>
              </div>

              <div className="institutions-preview">
                <h4>Institutions to import:</h4>
                <div className="preview-list">
                  {lesothoInstitutions.map((inst, index) => (
                    <div key={index} className="preview-item">
                      <BuildingIcon />
                      <div className="preview-content">
                        <strong>{inst.name}</strong>
                        <span>{inst.type} • {inst.location}</span>
                        <small>{inst.faculties?.length || 0} faculties, {inst.faculties?.reduce((sum, fac) => sum + (fac.courses?.length || 0), 0) || 0} courses</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="import-actions">
              <button
                onClick={handleBulkImport}
                disabled={loading}
                className="btn btn-primary btn-lg"
              >
                <UploadIcon />
                {loading ? `Importing... (${progress}%)` : 'Start Bulk Import'}
              </button>

              {loading && (
                <div className="progress-section">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span>{progress}% Complete ({importStatus.length}/{lesothoInstitutions.length})</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {importStatus.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3>
                Import Results 
                {importStatus.length === lesothoInstitutions.length && (
                  <span className="results-summary">
                    ({successfulImports} successful, {failedImports} failed)
                  </span>
                )}
              </h3>
            </div>
            <div className="card-body">
              <div className="import-results">
                {importStatus.map((result, index) => (
                  <div key={index} className={`result-item ${result.status}`}>
                    <div className="result-icon">
                      {result.status === 'success' ? <CheckIcon /> : '⚠️'}
                    </div>
                    <div className="result-content">
                      <strong>{result.institution}</strong>
                      <span>{result.message}</span>
                    </div>
                  </div>
                ))}
              </div>

              {!loading && importStatus.length === lesothoInstitutions.length && (
                <div className="import-complete">
                  <div className="success-message">
                    {failedImports === 0 ? (
                      <>
                        <CheckIcon />
                        <h4>Import Complete!</h4>
                        <p>All {successfulImports} institutions have been imported successfully.</p>
                      </>
                    ) : (
                      <>
                        <div style={{color: '#f59e0b', fontSize: '3rem'}}>⚠️</div>
                        <h4>Import Completed with Errors</h4>
                        <p>{successfulImports} successful, {failedImports} failed.</p>
                      </>
                    )}
                  </div>
                  <div className="completion-actions">
                    <button
                      onClick={() => navigate('/admin/institutions')}
                      className="btn btn-primary"
                    >
                      View All Institutions
                    </button>
                    <button
                      onClick={() => navigate('/admin')}
                      className="btn btn-outline"
                    >
                      Back to Dashboard
                    </button>
                    {failedImports > 0 && (
                      <button
                        onClick={handleBulkImport}
                        className="btn btn-secondary"
                      >
                        Retry Failed Imports
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkImport;