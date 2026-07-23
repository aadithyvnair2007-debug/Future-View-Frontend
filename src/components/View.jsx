import React, { useState, useEffect } from 'react';

// 1. Accept step and setStep as props here
export default function View({ currentUser, onOpenAuth, step = 'intro', setStep }) {
  const [pendingExplore, setPendingExplore] = useState(false);
  
  // 2. DELETE the line: const [step, setStep] = useState('intro');
  // (Do not re-declare step here!)

  const [welcomeInfo, setWelcomeInfo] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const defaultExams = [
    {
      name: 'JEE',
      letter: 'J',
      description: 'Explore premier engineering, technology, and architecture programs at IITs, NITs, and central institutions.'
    },
    {
      name: 'KEAM',
      letter: 'K',
      description: 'Explore professional degree engineering, architecture, and medical allied streams across colleges in Kerala.'
    },
    {
      name: 'NEET',
      letter: 'N',
      description: 'Explore national medical (MBBS), dental (BDS), AYUSH, and veterinary science pathways across India.'
    }
  ];

  // Auto-advance after login if triggered from "Explore Pathways"
  useEffect(() => {
    if (currentUser && pendingExplore) {
      setPendingExplore(false);
      setStep('select-exam');
    }
  }, [currentUser, pendingExplore, setStep]);

  // Fetch Welcome Info
  useEffect(() => {
    fetch('http://localhost:3010/api/welcome')
      .then(res => res.json())
      .then(data => setWelcomeInfo(data))
      .catch(err => console.error("Error fetching welcome info:", err));
  }, []);

  // Fetch Exams List
  useEffect(() => {
    fetch('http://localhost:3010/api/exams')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(e => ({
            name: e.name,
            letter: e.name.charAt(0).toUpperCase(),
            description: e.description || `Explore programs available through ${e.name}.`
          }));
          setExams(mapped);
        } else {
          setExams(defaultExams);
        }
      })
      .catch(() => setExams(defaultExams));
  }, []);

  // FAILSAFE EXPLORE HANDLER
  const handleExploreClick = (e) => {
    if (e) e.preventDefault();
    
    if (!currentUser && typeof onOpenAuth === 'function') {
      setPendingExplore(true);
      onOpenAuth();
    } else {
      setStep('select-exam');
    }
  };

  // FAILSAFE EXAM CLICK HANDLER
  const handleExamClick = (examName) => {
    setSelectedExam(examName);
    setLoading(true);
    setStep('courses');

    fetch(`http://localhost:3010/api/pathway/${examName.toLowerCase()}`)
      .then(res => res.json())
      .then(data => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching pathway:", err);
        setCourses([]);
        setLoading(false);
      });
  };

  return (
    <div style={containerStyle}>

      {/* ================= SCREEN 1: INTRO ================= */}
      {step === 'intro' && (
        <div style={cardStyle}>
          <h1 style={mainTitleStyle}>
            {welcomeInfo?.title || "Discover Your Future After +2"}
          </h1>

          <div style={quoteBoxStyle}>
            <p style={quoteTextStyle}>
              "{welcomeInfo?.description || "Choosing the right path after high school shouldn't be confusing. Our platform maps entrance exams to their ideal career tracks, helping you explore emerging fields across Engineering, Medicine, and Architecture with clear data."}"
            </p>
          </div>

          <div style={whyBoxStyle}>
            <h4 style={whyTitleStyle}>WHY USE FUTURE VIEW?</h4>
            <ul style={listStyle}>
              {welcomeInfo?.benefits ? (
                welcomeInfo.benefits.map((b, i) => <li key={i} style={listItemStyle}>• {b}</li>)
              ) : (
                <>
                  <li style={listItemStyle}>• Explore courses tied directly to your entrance exams.</li>
                  <li style={listItemStyle}>• Discover key job roles and course durations.</li>
                  <li style={listItemStyle}>• Make confident decisions for your future career.</li>
                </>
              )}
            </ul>
          </div>

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button 
              type="button"
              style={purpleBtnStyle}
              onClick={handleExploreClick}
            >
              Explore Pathways ➔
            </button>
          </div>
        </div>
      )}

      {/* ================= SCREEN 2: SELECT EXAM ================= */}
      {step === 'select-exam' && (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '1000px' }}>
          <button 
            type="button" 
            style={backLinkStyle} 
            onClick={() => setStep('intro')}
          >
            ← Back to Intro
          </button>

          <h2 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '8px', fontWeight: '800' }}>
            Select Your Entrance Exam
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '40px' }}>
            Choose an option below to filter matching professional degree programs
          </p>

          <div style={examGridStyle}>
            {exams.map((exam, idx) => (
              <div 
                key={idx} 
                style={examCardStyle}
                onClick={() => handleExamClick(exam.name)}
              >
                <div style={avatarStyle}>{exam.letter}</div>
                <h3 style={examTitleStyle}>{exam.name}</h3>
                <p style={examDescStyle}>{exam.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SCREEN 3: COURSES ================= */}
      {step === 'courses' && (
        <div style={{ width: '100%', maxWidth: '1000px' }}>
          <div style={topNavRowStyle}>
            <button 
              type="button" 
              style={backLinkStyle} 
              onClick={() => setStep('select-exam')}
            >
              ← Choose a Different Exam
            </button>

            <div style={pathwayBadgeStyle}>
              PATHWAY: {selectedExam}
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b', margin: '40px 0' }}>Fetching career pathways...</p>
          ) : courses.length > 0 ? (
            <div style={courseGridStyle}>
              {courses.map(course => (
                <div key={course._id || course.id} style={courseCardStyle}>
                  <h3 style={courseTitleStyle}>
                    {course.title || course.courseName || course.name || 'Untitled Course'}
                  </h3>

                  <div style={badgeRowStyle}>
                    <span style={categoryBadgeStyle}>
                      {course.category || 'Engineering'}
                    </span>
                    <span style={durationBadgeStyle}>
                      {course.duration}
                    </span>
                  </div>

                  <p style={courseDescStyle}>{course.description}</p>

                  <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
                    <div style={profileHeaderStyle}>POTENTIAL PROFILES</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {course.jobRoles && course.jobRoles.length > 0 ? (
                        course.jobRoles.map((role, i) => (
                          <span key={i} style={profileBadgeStyle}>{role}</span>
                        ))
                      ) : (
                        <span style={profileBadgeStyle}>General Specialist</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3>No courses currently found under {selectedExam}</h3>
              <p style={{ color: '#64748b' }}>Try selecting a different pathway or check back later.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

// ================= STYLES =================
const containerStyle = { minHeight: 'calc(100vh - 70px)', backgroundColor: '#edf2f7', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' };
const cardStyle = { backgroundColor: '#ffffff', borderRadius: '16px', padding: '45px 50px', maxWidth: '650px', width: '100%', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' };
const mainTitleStyle = { fontSize: '32px', fontWeight: '800', color: '#2e1065', textAlign: 'center', marginBottom: '25px' };
const quoteBoxStyle = { borderLeft: '4px solid #6366f1', paddingLeft: '16px', marginBottom: '25px' };
const quoteTextStyle = { fontSize: '15px', fontStyle: 'italic', color: '#475569', lineHeight: '1.6', margin: 0 };
const whyBoxStyle = { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '20px 25px', border: '1px solid #f1f5f9' };
const whyTitleStyle = { fontSize: '13px', fontWeight: '700', color: '#1e293b', letterSpacing: '0.5px', margin: '0 0 12px 0' };
const listStyle = { listStyle: 'none', padding: 0, margin: 0 };
const listItemStyle = { fontSize: '14px', color: '#475569', marginBottom: '8px', lineHeight: '1.5' };
const purpleBtnStyle = { backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '14px 32px', borderRadius: '25px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' };
const backLinkStyle = { background: 'none', border: 'none', color: '#6366f1', fontWeight: '600', fontSize: '14px', cursor: 'pointer', marginBottom: '20px', display: 'inline-block' };
const examGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' };
const examCardStyle = { backgroundColor: '#ffffff', borderRadius: '12px', padding: '35px 25px', textAlign: 'center', border: '2px solid #e2e8f0', cursor: 'pointer' };
const avatarStyle = { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#4338ca', fontWeight: '700', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' };
const examTitleStyle = { fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' };
const examDescStyle = { fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: 0 };
const topNavRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const pathwayBadgeStyle = { backgroundColor: '#4f46e5', color: '#ffffff', padding: '8px 18px', borderRadius: '20px', fontWeight: '700', fontSize: '12px', letterSpacing: '0.5px' };
const courseGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' };
const courseCardStyle = { backgroundColor: '#ffffff', borderRadius: '12px', padding: '25px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' };
const courseTitleStyle = { fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' };
const badgeRowStyle = { display: 'flex', gap: '8px', marginBottom: '15px' };
const categoryBadgeStyle = { backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '4px' };
const durationBadgeStyle = { backgroundColor: '#f1f5f9', color: '#475569', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '4px' };
const courseDescStyle = { fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' };
const profileHeaderStyle = { fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '8px' };
const profileBadgeStyle = { backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', fontSize: '12px', padding: '4px 10px', borderRadius: '4px' };