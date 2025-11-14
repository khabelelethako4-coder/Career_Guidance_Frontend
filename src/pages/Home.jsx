import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="home-hero-section">
        <div className="home-hero-background">
          <div className="home-hero-overlay"></div>
        </div>
        <div className="home-hero-content">
          <div className="home-hero-text">
            <div className="home-hero-badge">
              <span>Made for Lesotho</span>
            </div>
            <h1 className="home-hero-title">
              <span className="home-title-primary">Connecting Talent</span>
              <span className="home-title-gradient">with Opportunity</span>
            </h1>
            <p className="home-hero-description">
              Lesotho's premier platform bridging students, educational institutions, and employers. 
              Discover your path, apply with confidence, and build meaningful careers that contribute 
              to our nation's growth.
            </p>
            <div className="home-hero-actions">
              {user ? (
                <Link 
                  to={user.role === 'student' ? '/student/dashboard' : 
                      user.role === 'institution' ? '/institution/dashboard' : 
                      user.role === 'company' ? '/company/dashboard' : '/admin/dashboard'} 
                  className="home-btn-hero-primary"
                >
                  Continue to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/role-selection/register" className="home-btn-hero-primary">
                    Start Your Journey
                  </Link>
                  <Link to="/role-selection/login" className="home-btn-hero-secondary">
                    I Have an Account
                  </Link>
                </>
              )}
            </div>
            <div className="home-hero-stats">
              <div className="home-stat-item">
                <div className="home-stat-number">5,000+</div>
                <div className="home-stat-label">Students Empowered</div>
              </div>
              <div className="home-stat-item">
                <div className="home-stat-number">50+</div>
                <div className="home-stat-label">Institutions Partnered</div>
              </div>
              <div className="home-stat-item">
                <div className="home-stat-number">200+</div>
                <div className="home-stat-label">Careers Launched</div>
              </div>
            </div>
          </div>
          <div className="home-hero-visual">
            <div className="home-floating-cards">
              <div className="home-card home-student-card">
                <div className="home-card-icon">🎓</div>
                <h4>Students</h4>
                <p>Find your perfect course</p>
              </div>
              <div className="home-card home-institution-card">
                <div className="home-card-icon">🏫</div>
                <h4>Institutions</h4>
                <p>Connect with talent</p>
              </div>
              <div className="home-card home-company-card">
                <div className="home-card-icon">💼</div>
                <h4>Employers</h4>
                <p>Discover future leaders</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="home-roles-section">
        <div className="home-container">
          <div className="home-section-header">
            <span className="home-section-badge">Choose Your Path</span>
            <h2 className="home-section-title">Designed for Every Role</h2>
            <p className="home-section-description">
              Whether you're pursuing education, shaping minds, or building teams, 
              we have the perfect tools for your journey.
            </p>
          </div>

          <div className="home-roles-grid">
            <div className="home-role-card home-student-role">
              <div className="home-role-icon">🎓</div>
              <h3>Students & Graduates</h3>
              <p>Discover courses, apply to institutions, and launch your career with confidence</p>
              <ul className="home-role-features">
                <li>✓ Course discovery & applications</li>
                <li>✓ Career guidance & resources</li>
                <li>✓ Job opportunities</li>
                <li>✓ Document management</li>
              </ul>
              <div className="home-role-actions">
                <Link to="/register/student" className="home-btn-role-primary">
                  Join as Student
                </Link>
                <Link to="/login/student" className="home-btn-role-secondary">
                  Student Login
                </Link>
              </div>
            </div>

            <div className="home-role-card home-institution-role">
              <div className="home-role-icon">🏫</div>
              <h3>Educational Institutions</h3>
              <p>Manage programs, review applications, and connect with qualified students</p>
              <ul className="home-role-features">
                <li>✓ Course & faculty management</li>
                <li>✓ Application processing</li>
                <li>✓ Student communication</li>
                <li>✓ Analytics & reporting</li>
              </ul>
              <div className="home-role-actions">
                <Link to="/register/institution" className="home-btn-role-primary">
                  Register Institution
                </Link>
                <Link to="/login/institution" className="home-btn-role-secondary">
                  Institution Login
                </Link>
              </div>
            </div>

            <div className="home-role-card home-company-role">
              <div className="home-role-icon">💼</div>
              <h3>Companies & Employers</h3>
              <p>Find talented graduates, post opportunities, and build your dream team</p>
              <ul className="home-role-features">
                <li>✓ Job posting & management</li>
                <li>✓ Candidate screening</li>
                <li>✓ Application tracking</li>
                <li>✓ Talent pipeline</li>
              </ul>
              <div className="home-role-actions">
                <Link to="/register/company" className="home-btn-role-primary">
                  Join as Employer
                </Link>
                <Link to="/login/company" className="home-btn-role-secondary">
                  Company Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="home-features-section">
        <div className="home-container">
          <div className="home-section-header">
            <span className="home-section-badge">Why Choose Us</span>
            <h2 className="home-section-title">Everything You Need to Succeed</h2>
            <p className="home-section-description">
              Comprehensive tools and resources designed specifically for Lesotho's education and employment ecosystem.
            </p>
          </div>

          <div className="home-features-grid">
            <div className="home-feature-card">
              <div className="home-feature-icon">🔍</div>
              <h3>Smart Discovery</h3>
              <p>AI-powered course and career recommendations based on your skills, interests, and market demand</p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">⚡</div>
              <h3>Quick Applications</h3>
              <p>Apply to multiple institutions and jobs with a single profile. Save time and increase your chances</p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">📊</div>
              <h3>Real-time Tracking</h3>
              <p>Monitor your application status, receive updates, and get insights on your progress</p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">🤝</div>
              <h3>Direct Connections</h3>
              <p>Communicate directly with institutions and employers. Build relationships that matter</p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">📱</div>
              <h3>Mobile Friendly</h3>
              <p>Access all features on any device. Apply on the go and never miss an opportunity</p>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">🛡️</div>
              <h3>Secure & Private</h3>
              <p>Your data is protected with enterprise-grade security. Privacy is our priority</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="home-stories-section">
        <div className="home-container">
          <div className="home-section-header">
            <span className="home-section-badge">Success Stories</span>
            <h2 className="home-section-title">Transforming Careers in Lesotho</h2>
          </div>

          <div className="home-stories-grid">
            <div className="home-story-card">
              <div className="home-story-content">
                <div className="home-story-quote">"</div>
                <p className="home-story-text">
                  Thanks to EduConnect, I found the perfect IT program at Limkokwing University. 
                  The application process was seamless, and I received my acceptance within days!
                </p>
                <div className="home-story-author">
                  <div className="home-author-avatar">TL</div>
                  <div className="home-author-info">
                    <h4>Teboho Lethunya</h4>
                    <p>Software Engineering Student</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="home-story-card">
              <div className="home-story-content">
                <div className="home-story-quote">"</div>
                <p className="home-story-text">
                  As a small business, finding qualified graduates was challenging. 
                  EduConnect connected us with talented students who are now key members of our team.
                </p>
                <div className="home-story-author">
                  <div className="home-author-avatar">MM</div>
                  <div className="home-author-info">
                    <h4>Matseliso Mokoena</h4>
                    <p>HR Manager, Basotho Tech Solutions</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="home-story-card">
              <div className="home-story-content">
                <div className="home-story-quote">"</div>
                <p className="home-story-text">
                  Managing student applications used to take weeks. Now with EduConnect, 
                  we process applications efficiently and focus on student engagement.
                </p>
                <div className="home-story-author">
                  <div className="home-author-avatar">DN</div>
                  <div className="home-author-info">
                    <h4>Dr. Nthatisi Nkuebe</h4>
                    <p>Admissions Director, NUL</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="home-partners-section">
        <div className="home-container">
          <div className="home-section-header">
            <h2 className="home-section-title">Trusted by Leading Institutions</h2>
            <p className="home-section-description">
              Partnering with Lesotho's top educational institutions and employers
            </p>
          </div>
          <div className="home-partners-grid">
            <div className="home-partner-logo">NUL</div>
            <div className="home-partner-logo">LCE</div>
            <div className="home-partner-logo">LIMKOKWING</div>
            <div className="home-partner-logo">LESOTHO BANK</div>
            <div className="home-partner-logo">VODACOM</div>
            <div className="home-partner-logo">STANDARD BANK</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="home-cta-section">
        <div className="home-container">
          <div className="home-cta-content">
            <h2 className="home-cta-title">Ready to Transform Your Future?</h2>
            <p className="home-cta-description">
              Join thousands of students, institutions, and employers who are already building 
              brighter futures through EduConnect Lesotho.
            </p>
            <div className="home-cta-actions">
              {!user && (
                <>
                  <Link to="/role-selection/register" className="home-btn-cta-primary">
                    Create Free Account
                  </Link>
                  <Link to="/role-selection/login" className="home-btn-cta-secondary">
                    Sign In to Existing Account
                  </Link>
                </>
              )}
            </div>
            <div className="home-cta-guarantee">
              <span className="home-guarantee-badge">✓</span>
              <span>Always free for students • No hidden fees • Secure platform</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-container">
          <div className="home-footer-content">
            <div className="home-footer-brand">
              <div className="home-brand-logo">🎓</div>
              <div className="home-brand-info">
                <h3>EduConnect Lesotho</h3>
                <p>Bridging education and employment for a brighter Lesotho</p>
              </div>
            </div>
            <div className="home-footer-links">
              <div className="home-link-group">
                <h4>Platform</h4>
                <Link to="/role-selection/register">Get Started</Link>
                <Link to="/role-selection/login">Sign In</Link>
                <Link to="/about">About Us</Link>
              </div>
              <div className="home-link-group">
                <h4>Support</h4>
                <Link to="/help">Help Center</Link>
                <Link to="/contact">Contact Us</Link>
                <Link to="/privacy">Privacy Policy</Link>
              </div>
              <div className="home-link-group">
                <h4>Connect</h4>
                <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
                <a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a href="#" target="_blank" rel="noopener noreferrer">Twitter</a>
              </div>
            </div>
          </div>
          <div className="home-footer-bottom">
            <p>&copy; 2024 EduConnect Lesotho. All rights reserved. Proudly made for Lesotho.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;