import React, { useState, useEffect, useMemo } from 'react';
import futureViewLogo from '../Future-View.png';

const API_BASE = 'https://future-view.onrender.com';

export default function View({ currentUser, onOpenAuth, step = 'intro', setStep }) {
  // Initialize local step state safely
  const [currentStep, setCurrentStep] = useState(step || 'intro');
  const [pendingExplore, setPendingExplore] = useState(false);
  const [welcomeInfo, setWelcomeInfo] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userBookmarks, setUserBookmarks] = useState([]);

  // Search, Filter, Sort, Modal & Theme States
  const [examSearch, setExamSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('az');
  const [selectedCourseModal, setSelectedCourseModal] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // Fixed: Allow step synchronization for all steps including 'intro'
  useEffect(() => {
    if (step && step !== currentStep) {
      setCurrentStep(step);
    }
  }, [step]);

  const handleStepChange = (newStep) => {
    setCurrentStep(newStep);
    if (typeof setStep === 'function') {
      setStep(newStep);
    }
  };

  // Theme Palette Definitions
  const theme = {
    bg: isDarkMode ? '#0f172a' : '#edf2f7',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    textMain: isDarkMode ? '#f8fafc' : '#0f172a',
    textMuted: isDarkMode ? '#94a3b8' : '#64748b',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    inputBg: isDarkMode ? '#090d16' : '#ffffff',
    inputBorder: isDarkMode ? '#475569' : '#cbd5e1',
    whyBg: isDarkMode ? '#090d16' : '#f8fafc',
    badgeBg: isDarkMode ? '#312e81' : '#eff6ff',
    badgeText: isDarkMode ? '#818cf8' : '#2563eb',
    durationBg: isDarkMode ? '#334155' : '#f1f5f9',
    durationText: isDarkMode ? '#cbd5e1' : '#475569'
  };

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
      handleStepChange('select-exam');
    }
  }, [currentUser, pendingExplore]);

  // Fetch Welcome Info
  useEffect(() => {
    fetch(`${API_BASE}/api/welcome`)
      .then(res => res.json())
      .then(data => setWelcomeInfo(data))
      .catch(err => console.error("Error fetching welcome info:", err));
  }, []);

  // Fetch Exams List
  useEffect(() => {
    fetch(`${API_BASE}/api/exams`)
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

  // Fetch User Bookmarks when logged in (Skip if admin)
  useEffect(() => {
    const userId = currentUser?._id || currentUser?.id;
    if (userId && !isAdmin) {
      fetch(`${API_BASE}/api/users/${userId}/bookmarks`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setUserBookmarks(data);
        })
        .catch((err) => console.error("Error fetching bookmarks:", err));
    } else {
      setUserBookmarks([]);
    }
  }, [currentUser, isAdmin]);

  // TOGGLE BOOKMARK HANDLER
  const handleToggleBookmark = (e, item, type) => {
    e.stopPropagation();
    
    const userId = currentUser?._id || currentUser?.id;
    if (!userId) {
      if (typeof onOpenAuth === 'function') onOpenAuth();
      return;
    }

    const itemId = String(item._id || item.id || item.name || item.title);
    const title = item.name || item.examName || item.title || item.courseName;

    const payload = { itemId, title, type, category: item.category || 'General' };

    fetch(`${API_BASE}/api/users/${userId}/bookmarks`, {
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

  // EXPLORE HANDLER
  const handleExploreClick = (e) => {
    if (e) e.preventDefault();
    
    if (!currentUser && typeof onOpenAuth === 'function') {
      setPendingExplore(true);
      onOpenAuth();
    } else {
      handleStepChange('select-exam');
    }
  };

  // EXAM CLICK HANDLER
  const handleExamClick = (examName) => {
    setSelectedExam(examName);
    setLoading(true);
    handleStepChange('courses');
    setCourseSearch('');
    setSelectedCategory('All');
    setSortBy('az');

    fetch(`${API_BASE}/api/pathway/${examName.toLowerCase()}`)
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

  const handleExportPDF = () => {
    window.print();
  };

  const filteredExams = useMemo(() => {
    return exams.filter(exam => 
      exam.name.toLowerCase().includes(examSearch.toLowerCase()) ||
      exam.description.toLowerCase().includes(examSearch.toLowerCase())
    );
  }, [exams, examSearch]);

  const courseCategories = useMemo(() => {
    return ['All', ...new Set(courses.map(c => c.category || c.courseCategory || c.stream || c.type || 'General'))];
  }, [courses]);

  const sortedAndFilteredCourses = useMemo(() => {
    const filtered = courses.filter(course => {
      const title = course.title || course.courseName || course.name || '';
      const desc = course.description || '';
      const category = course.category || course.courseCategory || course.stream || course.type || 'General';

      const matchesSearch = title.toLowerCase().includes(courseSearch.toLowerCase()) ||
                            desc.toLowerCase().includes(courseSearch.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      const titleA = (a.title || a.courseName || a.name || '').toLowerCase();
      const titleB = (b.title || b.courseName || b.name || '').toLowerCase();
      const durA = parseInt(a.duration) || 0;
      const durB = parseInt(b.duration) || 0;

      if (sortBy === 'az') return titleA.localeCompare(titleB);
      if (sortBy === 'za') return titleB.localeCompare(titleA);
      if (sortBy === 'duration-asc') return durA - durB;
      if (sortBy === 'duration-desc') return durB - durA;
      return 0;
    });
  }, [courses, courseSearch, selectedCategory, sortBy]);

  return (
    <div style={{ ...containerStyle, backgroundColor: theme.bg }}>

      {/* PRINT STYLES */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page { margin: 15mm; }
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          button, input, select, header, nav, .navbar, .no-print { display: none !important; }
          html, body { height: auto !important; overflow: visible !important; background-color: #ffffff !important; }
          div[style*="containerStyle"] { display: block !important; position: static !important; background-color: #ffffff !important; color: #0f172a !important; min-height: auto !important; height: auto !important; padding: 0 !important; margin: 0 !important; }
          .print-header { display: flex !important; align-items: center; justify-content: space-between; border-bottom: 2px solid #0f172a !important; padding-bottom: 12px !important; margin-bottom: 25px !important; background-color: #ffffff !important; }
          .course-card-print { break-inside: avoid !important; page-break-inside: avoid !important; background: #ffffff !important; border: 1px solid #cbd5e1 !important; padding: 20px !important; margin-bottom: 20px !important; display: block !important; }
        }
      `}} />

      {/* GLOBAL UTILITY BAR */}
      <div style={globalUtilityBarStyle}>
        <button
          type="button"
          style={{ ...themeToggleBtnStyle, backgroundColor: theme.cardBg, color: theme.textMain, borderColor: theme.border }}
          onClick={() => setIsDarkMode(!isDarkMode)}
          title="Toggle Dark/Light Mode"
        >
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {/* ================= SCREEN 1: INTRO ================= */}
      {currentStep === 'intro' && (
        <div style={{ ...cardStyle, backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}>
          <h1 style={{ ...mainTitleStyle, color: isDarkMode ? '#a5b4fc' : '#2e1065' }}>
            {welcomeInfo?.title || "Discover Your Future After +2"}
          </h1>

          <div style={quoteBoxStyle}>
            <p style={{ ...quoteTextStyle, color: theme.textMuted }}>
              "{welcomeInfo?.description || "Choosing the right path after high school shouldn't be confusing. Our platform maps entrance exams to their ideal career tracks, helping you explore emerging fields across Engineering, Medicine, and Architecture with clear data."}"
            </p>
          </div>

          <div style={{ ...whyBoxStyle, backgroundColor: theme.whyBg, border: `1px solid ${theme.border}` }}>
            <h4 style={{ ...whyTitleStyle, color: theme.textMain }}>WHY USE FUTURE VIEW?</h4>
            <ul style={listStyle}>
              {welcomeInfo?.benefits ? (
                welcomeInfo.benefits.map((b, i) => <li key={i} style={{ ...listItemStyle, color: theme.textMuted }}>• {b}</li>)
              ) : (
                <>
                  <li style={{ ...listItemStyle, color: theme.textMuted }}>• Explore courses tied directly to your entrance exams.</li>
                  <li style={{ ...listItemStyle, color: theme.textMuted }}>• Discover key job roles and course durations.</li>
                  <li style={{ ...listItemStyle, color: theme.textMuted }}>• Make confident decisions for your future career.</li>
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
      {currentStep === 'select-exam' && (
        <div style={{ width: '100%', maxWidth: '1000px' }}>
          <div style={topNavRowStyle}>
            <button 
              type="button" 
              style={backLinkStyle} 
              onClick={() => handleStepChange('intro')}
            >
              ← Back to Intro
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', color: theme.textMain, marginBottom: '8px', fontWeight: '800' }}>
              Select Your Entrance Exam
            </h2>
            <p style={{ color: theme.textMuted, fontSize: '15px', marginBottom: '24px' }}>
              Choose an option below to filter matching professional degree programs
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <input 
              type="text"
              placeholder="Search entrance exams (e.g., JEE, KEAM)..."
              value={examSearch}
              onChange={(e) => setExamSearch(e.target.value)}
              style={{ ...searchInputStyle, backgroundColor: theme.inputBg, color: theme.textMain, borderColor: theme.inputBorder }}
            />
          </div>

          {filteredExams.length > 0 ? (
            <div style={examGridStyle}>
              {filteredExams.map((exam, idx) => {
                const examId = String(exam._id || exam.name);
                const isBookmarked = userBookmarks.some((b) => String(b.itemId) === examId);

                return (
                  <div 
                    key={idx} 
                    style={{ ...examCardStyle, backgroundColor: theme.cardBg, border: `2px solid ${theme.border}`, position: 'relative' }}
                    onClick={() => handleExamClick(exam.name)}
                  >
                    {!isAdmin && (
                      <button
                        type="button"
                        style={{
                          ...starButtonStyle,
                          borderColor: isBookmarked ? '#f59e0b' : theme.border,
                          backgroundColor: isBookmarked ? (isDarkMode ? '#451a03' : '#fffbeb') : theme.cardBg
                        }}
                        onClick={(e) => handleToggleBookmark(e, exam, 'Entrance Exam')}
                        title={isBookmarked ? "Remove Bookmark" : "Save Pathway"}
                      >
                        {isBookmarked ? '⭐' : '☆'}
                      </button>
                    )}

                    <div style={avatarStyle}>{exam.letter}</div>
                    <h3 style={{ ...examTitleStyle, color: theme.textMain }}>{exam.name}</h3>
                    <p style={{ ...examDescStyle, color: theme.textMuted }}>{exam.description}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: theme.cardBg, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
              <h3 style={{ color: theme.textMain, marginBottom: '8px' }}>No entrance exams found matching "{examSearch}"</h3>
              <button type="button" style={secondaryActionBtnStyle} onClick={() => setExamSearch('')}>
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= SCREEN 3: COURSES ================= */}
      {currentStep === 'courses' && (
        <div style={{ width: '100%', maxWidth: '1000px' }}>
          <div className="print-header" style={{ display: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={futureViewLogo} alt="Logo" style={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: '8px' }} />
              <div>
                <div style={{ fontSize: '16px', fontWeight: '900', fontFamily: 'serif', color: '#0f172a' }}>FUTURE VIEW</div>
                <div style={{ fontSize: '9px', fontWeight: '700', color: '#475569' }}>DISCOVERY FOR YOUR FUTURE</div>
              </div>
            </div>
          </div>

          <div style={topNavRowStyle}>
            <button 
              type="button" 
              style={backLinkStyle} 
              onClick={() => handleStepChange('select-exam')}
            >
              ← Choose a Different Exam
            </button>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button type="button" style={exportBtnStyle} onClick={handleExportPDF}>
                📥 Export Pathway PDF
              </button>
              <div style={pathwayBadgeStyle}>
                SELECTED EXAM: {selectedExam}
              </div>
            </div>
          </div>

          <div style={filterBarContainerStyle}>
            <input 
              type="text"
              placeholder="Search courses..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              style={{ ...searchInputStyle, backgroundColor: theme.inputBg, color: theme.textMain, borderColor: theme.inputBorder, maxWidth: '350px', flex: 1 }}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ ...selectDropdownStyle, backgroundColor: theme.inputBg, color: theme.textMain, borderColor: theme.inputBorder }}
            >
              {courseCategories.map((cat, idx) => (
                <option key={idx} value={cat}>Category: {cat}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ ...selectDropdownStyle, backgroundColor: theme.inputBg, color: theme.textMain, borderColor: theme.inputBorder }}
            >
              <option value="az">Sort: A to Z</option>
              <option value="za">Sort: Z to A</option>
              <option value="duration-asc">Duration: Low to High</option>
              <option value="duration-desc">Duration: High to Low</option>
            </select>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: theme.textMuted, margin: '40px 0' }}>Processing...</p>
          ) : sortedAndFilteredCourses.length > 0 ? (
            <div style={courseGridStyle}>
              {sortedAndFilteredCourses.map(course => {
                const courseId = String(course._id || course.id || course.title || course.courseName);
                const isBookmarked = userBookmarks.some((b) => String(b.itemId) === courseId);

                const profiles = Array.isArray(course.jobRoles) && course.jobRoles.length > 0 
                  ? course.jobRoles 
                  : Array.isArray(course.potentialProfiles) && course.potentialProfiles.length > 0 
                  ? course.potentialProfiles 
                  : [];

                return (
                  <div 
                    key={courseId} 
                    className="course-card-print"
                    style={{ ...courseCardStyle, backgroundColor: theme.cardBg, border: `1px solid ${theme.border}`, position: 'relative', cursor: 'pointer' }}
                    onClick={() => setSelectedCourseModal(course)}
                  >
                    {!isAdmin && (
                      <button
                        type="button"
                        style={{
                          ...starButtonStyle,
                          borderColor: isBookmarked ? '#f59e0b' : theme.border,
                          backgroundColor: isBookmarked ? (isDarkMode ? '#451a03' : '#fffbeb') : theme.cardBg
                        }}
                        onClick={(e) => handleToggleBookmark(e, course, 'Course')}
                      >
                        {isBookmarked ? '⭐' : '☆'}
                      </button>
                    )}

                    <h3 style={{ ...courseTitleStyle, color: theme.textMain, paddingRight: isAdmin ? '0' : '45px' }}>
                      {course.title || course.courseName || course.name || 'Untitled Course'}
                    </h3>

                    <div style={badgeRowStyle}>
                      <span style={{ ...categoryBadgeStyle, backgroundColor: theme.badgeBg, color: theme.badgeText }}>
                        {course.category || course.courseCategory || course.stream || course.type || 'General'}
                      </span>
                      <span style={{ ...durationBadgeStyle, backgroundColor: theme.durationBg, color: theme.durationText }}>
                        {course.duration || 'N/A'}
                      </span>
                    </div>

                    <p style={{ ...courseDescStyle, color: theme.textMuted }}>{course.description}</p>

                    <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
                      <div style={{ ...profileHeaderStyle, color: theme.textMuted }}>POTENTIAL PROFILES</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {profiles.length > 0 ? (
                          profiles.map((role, i) => (
                            <span key={i} style={{ ...profileBadgeStyle, backgroundColor: theme.inputBg, color: theme.textMuted, borderColor: theme.border }}>{role}</span>
                          ))
                        ) : (
                          <span style={{ ...profileBadgeStyle, backgroundColor: theme.inputBg, color: theme.textMuted, borderColor: theme.border }}>General Specialist</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: theme.cardBg, borderRadius: '12px', border: `1px solid ${theme.border}` }}>
              <h3 style={{ color: theme.textMain, marginBottom: '8px' }}>No courses found</h3>
              <button type="button" style={secondaryActionBtnStyle} onClick={() => { setCourseSearch(''); setSelectedCategory('All'); }}>
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {selectedCourseModal && (
        <div style={modalOverlayStyle} onClick={() => setSelectedCourseModal(null)}>
          <div style={{ ...modalContentStyle, backgroundColor: theme.cardBg }} onClick={(e) => e.stopPropagation()}>
            <button type="button" style={{ ...modalCloseBtnStyle, color: theme.textMuted }} onClick={() => setSelectedCourseModal(null)}>×</button>

            <h2 style={{ fontSize: '22px', fontWeight: '800', color: theme.textMain, marginBottom: '12px', paddingRight: '30px' }}>
              {selectedCourseModal.title || selectedCourseModal.courseName || selectedCourseModal.name}
            </h2>

            <div style={badgeRowStyle}>
              <span style={{ ...categoryBadgeStyle, backgroundColor: theme.badgeBg, color: theme.badgeText }}>
                {selectedCourseModal.category || selectedCourseModal.courseCategory || selectedCourseModal.stream || selectedCourseModal.type || 'General'}
              </span>
              <span style={{ ...durationBadgeStyle, backgroundColor: theme.durationBg, color: theme.durationText }}>
                Duration: {selectedCourseModal.duration || 'N/A'}
              </span>
            </div>

            <p style={{ fontSize: '14px', color: theme.textMain, lineHeight: '1.6' }}>
              {selectedCourseModal.description || 'No detailed description available.'}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

// STYLES
const containerStyle = { minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', fontFamily: 'Inter, system-ui, sans-serif' };
const globalUtilityBarStyle = { width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' };
const themeToggleBtnStyle = { padding: '8px 16px', borderRadius: '20px', border: '1px solid', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' };
const cardStyle = { borderRadius: '16px', padding: '45px 50px', maxWidth: '650px', width: '100%', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', margin: 'auto' };
const mainTitleStyle = { fontSize: '32px', fontWeight: '800', textAlign: 'center', marginBottom: '25px' };
const quoteBoxStyle = { borderLeft: '4px solid #6366f1', paddingLeft: '16px', marginBottom: '25px' };
const quoteTextStyle = { fontSize: '15px', fontStyle: 'italic', lineHeight: '1.6', margin: 0 };
const whyBoxStyle = { borderRadius: '12px', padding: '20px 25px' };
const whyTitleStyle = { fontSize: '13px', fontWeight: '700', margin: '0 0 12px 0' };
const listStyle = { listStyle: 'none', padding: 0, margin: 0 };
const listItemStyle = { fontSize: '14px', marginBottom: '8px', lineHeight: '1.5' };
const purpleBtnStyle = { backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '14px 32px', borderRadius: '25px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' };
const secondaryActionBtnStyle = { backgroundColor: '#6366f1', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' };
const topNavRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '24px', minHeight: '36px', flexWrap: 'wrap', gap: '12px' };
const backLinkStyle = { background: 'none', border: 'none', color: '#6366f1', fontWeight: '600', fontSize: '14px', cursor: 'pointer', padding: '4px 0' };
const searchInputStyle = { padding: '12px 18px', borderRadius: '10px', border: '1px solid', fontSize: '14px', outline: 'none', width: '100%', maxWidth: '400px' };
const examGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', width: '100%' };
const examCardStyle = { borderRadius: '16px', padding: '28px', cursor: 'pointer', display: 'flex', flexDirection: 'column' };
const starButtonStyle = { position: 'absolute', top: '16px', right: '16px', background: 'none', border: '1px solid', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px' };
const avatarStyle = { width: '48px', height: '48px', borderRadius: '12px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px', marginBottom: '16px' };
const examTitleStyle = { fontSize: '18px', fontWeight: '700', marginBottom: '8px' };
const examDescStyle = { fontSize: '14px', lineHeight: '1.5', margin: 0 };
const exportBtnStyle = { backgroundColor: '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' };
const pathwayBadgeStyle = { backgroundColor: '#e0e7ff', color: '#3730a3', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '800' };
const filterBarContainerStyle = { display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap', alignItems: 'center' };
const selectDropdownStyle = { padding: '12px 16px', borderRadius: '10px', border: '1px solid', fontSize: '14px', outline: 'none', cursor: 'pointer' };
const courseGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', width: '100%' };
const courseCardStyle = { borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' };
const courseTitleStyle = { fontSize: '18px', fontWeight: '700', marginBottom: '10px' };
const badgeRowStyle = { display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' };
const categoryBadgeStyle = { padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' };
const durationBadgeStyle = { padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' };
const courseDescStyle = { fontSize: '14px', lineHeight: '1.5', marginBottom: '15px' };
const profileHeaderStyle = { fontSize: '11px', fontWeight: '700', marginBottom: '6px' };
const profileBadgeStyle = { padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', border: '1px solid' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' };
const modalContentStyle = { borderRadius: '16px', padding: '30px', maxWidth: '550px', width: '100%', position: 'relative' };
const modalCloseBtnStyle = { position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '24px', fontWeight: '700', cursor: 'pointer' };