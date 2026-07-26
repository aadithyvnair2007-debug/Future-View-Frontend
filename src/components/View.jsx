import React, { useState, useEffect } from 'react';

export default function View({ currentUser, onOpenAuth, step = 'intro', setStep }) {
  const [pendingExplore, setPendingExplore] = useState(false);
  const [welcomeInfo, setWelcomeInfo] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userBookmarks, setUserBookmarks] = useState([]);

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
            _id: e._id || e.id || e.name,
            name: e.name,
            letter: e.name.charAt(0).toUpperCase(),
            description: e.description || `Explore programs available through ${e.name}.`,
            category: e.category || 'General'
          }));
          setExams(mapped);
        } else {
          setExams(defaultExams);
        }
      })
      .catch(() => setExams(defaultExams));
  }, []);

  // Fetch User Bookmarks when logged in
  useEffect(() => {
    const userId = currentUser?._id || currentUser?.id;
    if (userId) {
      fetch(`http://localhost:3010/api/users/${userId}/bookmarks`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setUserBookmarks(data);
        })
        .catch((err) => console.error("Error fetching bookmarks:", err));
    } else {
      setUserBookmarks([]);
    }
  }, [currentUser]);

  // TOGGLE BOOKMARK HANDLER (For Exam Cards and Course Cards)
  const handleToggleBookmark = (e, item, type) => {
    e.stopPropagation(); // Stop click event from opening course list or triggering card clicks
    
    const userId = currentUser?._id || currentUser?.id;
    if (!userId) {
      if (typeof onOpenAuth === 'function') onOpenAuth();
      return;
    }

    const itemId = String(item._id || item.id || item.name || item.title);
    const title = item.name || item.examName || item.title || item.courseName;

    const payload = {
      itemId,
      title,
      type, // 'Entrance Exam' or 'Course'
      category: item.category || 'General'
    };

    fetch(`http://localhost:3010/api/users/${userId}/bookmarks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.bookmarks) setUserBookmarks(data.bookmarks);
      })
      .catch((err) => console.error('Error toggling bookmark:', err));
  };

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
        <div style={{ width: '100%', maxWidth: '1000px' }}>
          {/* Properly structured Header Row */}
          <div style={topNavRowStyle}>
            <button 
              type="button" 
              style={backLinkStyle} 
              onClick={() => setStep('intro')}
            >
              ← Back to Intro
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', color: '#1e293b', marginBottom: '8px', fontWeight: '800' }}>
              Select Your Entrance Exam
            </h2>
            <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '32px' }}>
              Choose an option below to filter matching professional degree programs
            </p>
          </div>

          <div style={examGridStyle}>
            {exams.map((exam, idx) => {
              const examId = String(exam._id || exam.name);
              const isBookmarked = userBookmarks.some((b) => String(b.itemId) === examId);

              return (
                <div 
                  key={idx} 
                  style={{ ...examCardStyle, position: 'relative' }}
                  onClick={() => handleExamClick(exam.name)}
                >
                  {/* STAR BOOKMARK BUTTON */}
                  <button
                    type="button"
                    style={{
                      ...starButtonStyle,
                      borderColor: isBookmarked ? '#f59e0b' : '#e2e8f0',
                      backgroundColor: isBookmarked ? '#fffbeb' : '#ffffff'
                    }}
                    onClick={(e) => handleToggleBookmark(e, exam, 'Entrance Exam')}
                    title={isBookmarked ? "Remove Bookmark" : "Save Pathway"}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.08)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)';
                    }}
                  >
                    {isBookmarked ? '⭐' : '☆'}
                  </button>

                  <div style={avatarStyle}>{exam.letter}</div>
                  <h3 style={examTitleStyle}>{exam.name}</h3>
                  <p style={examDescStyle}>{exam.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= SCREEN 3: COURSES ================= */}
      {step === 'courses' && (
        <div style={{ width: '100%', maxWidth: '1000px' }}>
          {/* Properly Aligned Header Row */}
          <div style={topNavRowStyle}>
            <button 
              type="button" 
              style={backLinkStyle} 
              onClick={() => setStep('select-exam')}
            >
              ← Choose a Different Exam
            </button>

            <div style={pathwayBadgeStyle}>
              SELECTED EXAM: {selectedExam}
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: '#64748b', margin: '40px 0' }}>Processing...</p>
          ) : courses.length > 0 ? (
            <div style={courseGridStyle}>
              {courses.map(course => {
                const courseId = String(course._id || course.id || course.title || course.courseName);
                const isBookmarked = userBookmarks.some((b) => String(b.itemId) === courseId);

                const profiles = Array.isArray(course.jobRoles) && course.jobRoles.length > 0 
                  ? course.jobRoles 
                  : Array.isArray(course.potentialProfiles) && course.potentialProfiles.length > 0 
                  ? course.potentialProfiles 
                  : typeof course.potentialProfiles === 'string' 
                  ? course.potentialProfiles.split(',').map(s => s.trim())
                  : [];

                return (
                  <div key={courseId} style={{ ...courseCardStyle, position: 'relative' }}>
                    {/* STAR BOOKMARK BUTTON */}
                    <button
                      type="button"
                      style={{
                        ...starButtonStyle,
                        borderColor: isBookmarked ? '#f59e0b' : '#e2e8f0',
                        backgroundColor: isBookmarked ? '#fffbeb' : '#ffffff'
                      }}
                      onClick={(e) => handleToggleBookmark(e, course, 'Course')}
                      title={isBookmarked ? "Remove Bookmark" : "Save Course"}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.08)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)';
                      }}
                    >
                      {isBookmarked ? '⭐' : '☆'}
                    </button>

                    <h3 style={{ ...courseTitleStyle, paddingRight: '45px' }}>
                      {course.title || course.courseName || course.name || 'Untitled Course'}
                    </h3>

                    <div style={badgeRowStyle}>
                      <span style={categoryBadgeStyle}>
                        {course.category || course.courseCategory || course.stream || course.type || 'General'}
                      </span>
                      <span style={durationBadgeStyle}>
                        {course.duration || 'N/A'}
                      </span>
                    </div>

                    <p style={courseDescStyle}>{course.description}</p>

                    <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
                      <div style={profileHeaderStyle}>POTENTIAL PROFILES</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {profiles.length > 0 ? (
                          profiles.map((role, i) => (
                            <span key={i} style={profileBadgeStyle}>{role}</span>
                          ))
                        ) : (
                          <span style={profileBadgeStyle}>General Specialist</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
const containerStyle = { minHeight: 'calc(100vh - 70px)', backgroundColor: '#edf2f7', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' };
const cardStyle = { backgroundColor: '#ffffff', borderRadius: '16px', padding: '45px 50px', maxWidth: '650px', width: '100%', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', margin: 'auto' };
const mainTitleStyle = { fontSize: '32px', fontWeight: '800', color: '#2e1065', textAlign: 'center', marginBottom: '25px' };
const quoteBoxStyle = { borderLeft: '4px solid #6366f1', paddingLeft: '16px', marginBottom: '25px' };
const quoteTextStyle = { fontSize: '15px', fontStyle: 'italic', color: '#475569', lineHeight: '1.6', margin: 0 };
const whyBoxStyle = { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '20px 25px', border: '1px solid #f1f5f9' };
const whyTitleStyle = { fontSize: '13px', fontWeight: '700', color: '#1e293b', letterSpacing: '0.5px', margin: '0 0 12px 0' };
const listStyle = { listStyle: 'none', padding: 0, margin: 0 };
const listItemStyle = { fontSize: '14px', color: '#475569', marginBottom: '8px', lineHeight: '1.5' };
const purpleBtnStyle = { backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '14px 32px', borderRadius: '25px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' };

// TOP BAR & BACK BUTTON STYLES (Cleaned up alignment)
const topNavRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '24px', minHeight: '36px' };
const backLinkStyle = { background: 'none', border: 'none', color: '#6366f1', fontWeight: '600', fontSize: '14px', cursor: 'pointer', padding: '4px 0', margin: 0, display: 'inline-flex', alignItems: 'center' };
const pathwayBadgeStyle = { backgroundColor: '#4f46e5', color: '#ffffff', padding: '6px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '12px', letterSpacing: '0.5px', display: 'inline-flex', alignItems: 'center' };

const examGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' };
const examCardStyle = { backgroundColor: '#ffffff', borderRadius: '12px', padding: '35px 25px', textAlign: 'center', border: '2px solid #e2e8f0', cursor: 'pointer' };
const avatarStyle = { width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: '#4338ca', fontWeight: '700', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' };
const examTitleStyle = { fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' };
const examDescStyle = { fontSize: '13px', color: '#64748b', lineHeight: '1.5', margin: 0 };

const courseGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' };
const courseCardStyle = { backgroundColor: '#ffffff', borderRadius: '12px', padding: '25px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' };
const courseTitleStyle = { fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0' };
const badgeRowStyle = { display: 'flex', gap: '8px', marginBottom: '15px' };
const categoryBadgeStyle = { backgroundColor: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '4px' };
const durationBadgeStyle = { backgroundColor: '#f1f5f9', color: '#475569', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '4px' };
const courseDescStyle = { fontSize: '13px', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' };
const profileHeaderStyle = { fontSize: '11px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '8px' };
const profileBadgeStyle = { backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', fontSize: '12px', padding: '4px 10px', borderRadius: '4px' };

const starButtonStyle = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  border: '1px solid #e2e8f0',
  backgroundColor: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  cursor: 'pointer',
  padding: 0,
  lineHeight: '1',
  zIndex: 10,
  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
};